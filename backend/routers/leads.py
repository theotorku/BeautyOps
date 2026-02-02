from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from datetime import datetime
from db import supabase  # Use shared Supabase client from db.py
from services.template_generator import get_template_generator

router = APIRouter()

# SendGrid configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "hello@beautyops.ai")
SENDGRID_FROM_NAME = os.getenv("SENDGRID_FROM_NAME", "BeautyOps AI")

class LeadCaptureRequest(BaseModel):
    email: EmailStr
    industry: Optional[str] = "beauty"
    role: Optional[str] = "Account Executive"
    focus_areas: Optional[List[str]] = None
    experience_level: Optional[str] = "intermediate"

@router.post("/capture")
async def capture_lead(request: LeadCaptureRequest):
    """
    Capture email lead from landing page template form.
    Stores in database and sends template via SendGrid.
    """
    try:
        # Check if lead already exists
        existing_lead = supabase.table("leads").select("*").eq("email", request.email).execute()

        if existing_lead.data:
            # Lead already exists, resend template
            lead_id = existing_lead.data[0]["id"]
            already_sent = existing_lead.data[0]["template_sent"]

            if already_sent:
                return {
                    "success": True,
                    "message": "You've already received the template! Check your email inbox (and spam folder).",
                    "already_subscribed": True
                }
        else:
            # Create new lead
            new_lead = supabase.table("leads").insert({
                "email": request.email,
                "source": "landing_page_template",
                "template_sent": False
            }).execute()

            if not new_lead.data:
                raise HTTPException(status_code=500, detail="Failed to save lead")

            lead_id = new_lead.data[0]["id"]

        # Send email with AI-generated template
        try:
            await send_template_email(
                to_email=request.email,
                industry=request.industry,
                role=request.role,
                focus_areas=request.focus_areas,
                experience_level=request.experience_level
            )

            # Update lead as template sent
            supabase.table("leads").update({
                "template_sent": True,
                "template_sent_at": datetime.now().isoformat()
            }).eq("email", request.email).execute()

            return {
                "success": True,
                "message": "Your personalized template is on its way! Check your email in the next few minutes.",
                "already_subscribed": False
            }

        except Exception as email_error:
            # Log error but don't fail the request
            print(f"SendGrid error: {email_error}")

            # Still return success since lead was captured
            return {
                "success": True,
                "message": "Thanks! We'll send the template to your email shortly.",
                "already_subscribed": False,
                "note": "Email queued for delivery"
            }

    except Exception as e:
        print(f"Lead capture error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process your request. Please try again.")


async def send_template_email(
    to_email: str,
    industry: str = "beauty",
    role: str = "Account Executive",
    focus_areas: Optional[List[str]] = None,
    experience_level: str = "intermediate"
):
    """
    Generate and send a personalized store visit template via SendGrid using AI.

    Args:
        to_email: Recipient email address
        industry: Industry vertical (default: beauty)
        role: User's role (default: Account Executive)
        focus_areas: Specific areas to focus on
        experience_level: Experience level (beginner, intermediate, advanced)
    """
    if not SENDGRID_API_KEY:
        print("Warning: SENDGRID_API_KEY not set. Email not sent.")
        return

    # Generate AI-powered template
    try:
        generator = get_template_generator()
        template = await generator.generate_template(
            industry=industry,
            role=role,
            focus_areas=focus_areas,
            experience_level=experience_level
        )

        # Format as HTML and text
        html_content = generator.format_template_as_html(template)
        text_content = generator.format_template_as_text(template)

        # Email subject with personalization
        subject = f"Your Personalized {industry.title()} Store Visit Template - BeautyOps AI"

    except Exception as e:
        print(f"AI template generation failed: {e}. Falling back to static template.")
        # Fallback to static template if AI fails
        subject = "Your Free Store Visit Template - BeautyOps AI"
        html_content = get_fallback_html_template()
        text_content = get_fallback_text_template()

    # Create SendGrid message
    message = Mail(
        from_email=Email(SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME),
        to_emails=To(to_email),
        subject=subject,
        plain_text_content=Content("text/plain", text_content),
        html_content=Content("text/html", html_content)
    )

    # Send email
    sg = SendGridAPIClient(SENDGRID_API_KEY)
    response = sg.send(message)

    if response.status_code not in [200, 201, 202]:
        raise Exception(f"SendGrid returned status {response.status_code}")

    return True


def get_fallback_html_template() -> str:
    """Static fallback template if AI generation fails"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #e5b9c4 0%, #c084fc 100%);
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                margin-bottom: 30px;
            }}
            .header h1 {{
                color: white;
                margin: 0;
                font-size: 28px;
            }}
            .content {{
                background: #f8f9fa;
                padding: 30px;
                border-radius: 12px;
                margin-bottom: 20px;
            }}
            .template-section {{
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #e5b9c4;
            }}
            .template-section h3 {{
                color: #e5b9c4;
                margin-top: 0;
            }}
            .cta-button {{
                display: inline-block;
                background: linear-gradient(135deg, #e5b9c4 0%, #c084fc 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                color: #666;
                font-size: 14px;
                margin-top: 30px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✨ Your Store Visit Template is Here!</h1>
        </div>

        <div class="content">
            <p>Hi there!</p>

            <p>Thanks for your interest in BeautyOps AI! Here's the <strong>Store Visit Template</strong> that top Beauty Account Executives use to capture winning insights.</p>

            <div class="template-section">
                <h3>📋 The AE's Store Visit Template</h3>
                <p><strong>Before the Visit:</strong></p>
                <ul>
                    <li>Review last visit notes and action items</li>
                    <li>Check recent POS data for this account</li>
                    <li>Prepare talking points for top/slow sellers</li>
                </ul>

                <p><strong>During the Visit:</strong></p>
                <ul>
                    <li><strong>Inventory Check:</strong> Note OOS items, low stock, shade gaps</li>
                    <li><strong>Display Quality:</strong> Testers, cleanliness, merchandising</li>
                    <li><strong>Staff Engagement:</strong> Who needs training? Product knowledge gaps?</li>
                    <li><strong>Competitive Activity:</strong> Promotions, new launches, shelf placement</li>
                    <li><strong>Opportunities:</strong> Upsell potential, event ideas, demo requests</li>
                </ul>

                <p><strong>After the Visit:</strong></p>
                <ul>
                    <li>Log action items with deadlines</li>
                    <li>Send follow-up email to store manager</li>
                    <li>Update CRM with visit summary</li>
                    <li>Schedule next visit and training sessions</li>
                </ul>
            </div>

            <p><strong>Pro Tip:</strong> Use voice notes during your visit to capture everything quickly, then organize later. That's exactly what BeautyOps AI automates for you! 🎙️</p>

            <a href="https://beautyop.io/signup" class="cta-button">Start Your 14-Day Free Trial →</a>

            <p>With BeautyOps AI, you can:</p>
            <ul>
                <li>Turn voice notes into structured reports in 60 seconds</li>
                <li>Analyze POS data with AI-powered insights</li>
                <li>Generate training materials automatically</li>
                <li>Save 4+ hours every week on admin work</li>
            </ul>

            <p>Ready to transform your workflow?</p>

            <p>Best,<br>
            <strong>The BeautyOps AI Team</strong></p>
        </div>

        <div class="footer">
            <p>BeautyOps AI - AI Workflow Engine for Beauty Account Executives</p>
            <p>Questions? Reply to this email or visit <a href="https://beautyop.io">beautyop.io</a></p>
        </div>
    </body>
    </html>
    """


def get_fallback_text_template() -> str:
    """Static fallback plain text template if AI generation fails"""
    return f"""
    Your Store Visit Template is Here!

    Hi there!

    Thanks for your interest in BeautyOps AI! Here's the Store Visit Template that top Beauty Account Executives use to capture winning insights.

    THE AE'S STORE VISIT TEMPLATE

    Before the Visit:
    - Review last visit notes and action items
    - Check recent POS data for this account
    - Prepare talking points for top/slow sellers

    During the Visit:
    - Inventory Check: Note OOS items, low stock, shade gaps
    - Display Quality: Testers, cleanliness, merchandising
    - Staff Engagement: Who needs training? Product knowledge gaps?
    - Competitive Activity: Promotions, new launches, shelf placement
    - Opportunities: Upsell potential, event ideas, demo requests

    After the Visit:
    - Log action items with deadlines
    - Send follow-up email to store manager
    - Update CRM with visit summary
    - Schedule next visit and training sessions

    Pro Tip: Use voice notes during your visit to capture everything quickly, then organize later. That's exactly what BeautyOps AI automates for you!

    Start Your 14-Day Free Trial: https://beautyop.io/signup

    With BeautyOps AI, you can:
    - Turn voice notes into structured reports in 60 seconds
    - Analyze POS data with AI-powered insights
    - Generate training materials automatically
    - Save 4+ hours every week on admin work

    Best,
    The BeautyOps AI Team

    ---
    BeautyOps AI - AI Workflow Engine for Beauty Account Executives
    Questions? Visit https://beautyop.io
    """


@router.get("/leads")
async def get_leads():
    """
    Get all captured leads (admin only - add auth later).
    """
    try:
        leads = supabase.table("leads").select("*").order("created_at", desc=True).execute()
        return {
            "success": True,
            "leads": leads.data,
            "total": len(leads.data) if leads.data else 0
        }
    except Exception as e:
        print(f"Error fetching leads: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch leads")
