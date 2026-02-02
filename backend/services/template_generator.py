"""
Template Generation Service
Uses AI to generate personalized store visit templates based on user context.
"""

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
import os


class VisitSection(BaseModel):
    """A section of the store visit template"""
    title: str = Field(description="Section title (e.g., 'Before the Visit')")
    checklist: List[str] = Field(description="Action items for this section")
    tips: Optional[str] = Field(description="Pro tip for this section", default=None)


class StoreVisitTemplate(BaseModel):
    """Complete store visit template structure"""
    template_name: str = Field(description="Name of the template")
    introduction: str = Field(description="Brief introduction to using the template")
    before_visit: VisitSection = Field(description="Pre-visit preparation checklist")
    during_visit: VisitSection = Field(description="On-site observation checklist")
    after_visit: VisitSection = Field(description="Post-visit follow-up checklist")
    success_metrics: List[str] = Field(description="Key metrics to track")
    pro_tip: str = Field(description="Overall pro tip for using this template")


class TemplateGenerator:
    """AI-powered template generation service"""

    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.parser = PydanticOutputParser(pydantic_object=StoreVisitTemplate)

    async def generate_template(
        self,
        industry: str = "beauty",
        role: str = "Account Executive",
        focus_areas: Optional[List[str]] = None,
        experience_level: str = "intermediate"
    ) -> StoreVisitTemplate:
        """
        Generate a personalized store visit template using AI.

        Args:
            industry: Industry vertical (default: beauty)
            role: User's role (default: Account Executive)
            focus_areas: Specific areas to focus on (e.g., ["inventory", "merchandising"])
            experience_level: User's experience level (beginner, intermediate, advanced)

        Returns:
            StoreVisitTemplate: AI-generated template
        """

        # Default focus areas if none provided
        if not focus_areas:
            focus_areas = ["inventory management", "merchandising", "staff training", "competitive analysis"]

        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert {industry} industry consultant specializing in field operations.
            Generate a comprehensive store visit template for a {role} with {experience_level} experience.

            The template should be:
            - Actionable and specific to the {industry} industry
            - Include concrete checklist items, not generic advice
            - Focus on: {focus_areas}
            - Appropriate for {experience_level} level experience
            - Professional and results-oriented

            {format_instructions}
            """),
            ("user", "Generate a detailed store visit template that will help me capture winning insights during retail visits.")
        ])

        # Format prompt with variables
        formatted_prompt = prompt.format_messages(
            industry=industry,
            role=role,
            experience_level=experience_level,
            focus_areas=", ".join(focus_areas),
            format_instructions=self.parser.get_format_instructions()
        )

        # Generate template
        response = await self.llm.ainvoke(formatted_prompt)
        template = self.parser.parse(response.content)

        return template

    def format_template_as_html(self, template: StoreVisitTemplate) -> str:
        """
        Format the AI-generated template as beautiful HTML for email.

        Args:
            template: The generated template

        Returns:
            str: HTML-formatted email content
        """

        def format_checklist(items: List[str]) -> str:
            return "\n".join([f"<li>{item}</li>" for item in items])

        html = f"""
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
                .intro {{
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    border-left: 4px solid #e5b9c4;
                }}
                .section {{
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    margin: 20px 0;
                    border: 1px solid #e0e0e0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }}
                .section h3 {{
                    color: #e5b9c4;
                    margin-top: 0;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }}
                .section ul {{
                    margin: 15px 0;
                    padding-left: 20px;
                }}
                .section li {{
                    margin: 10px 0;
                    color: #444;
                }}
                .pro-tip {{
                    background: linear-gradient(135deg, rgba(229, 185, 196, 0.1) 0%, rgba(192, 132, 252, 0.1) 100%);
                    padding: 15px 20px;
                    border-radius: 8px;
                    margin-top: 15px;
                    border-left: 3px solid #e5b9c4;
                }}
                .pro-tip strong {{
                    color: #e5b9c4;
                }}
                .metrics {{
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 12px;
                    margin: 20px 0;
                }}
                .metrics h3 {{
                    color: #333;
                    margin-top: 0;
                }}
                .metrics ul {{
                    list-style: none;
                    padding: 0;
                }}
                .metrics li {{
                    padding: 8px 0;
                    border-bottom: 1px solid #e0e0e0;
                }}
                .metrics li:last-child {{
                    border-bottom: none;
                }}
                .metrics li:before {{
                    content: "📊 ";
                    margin-right: 8px;
                }}
                .cta {{
                    text-align: center;
                    margin: 30px 0;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #e5b9c4 0%, #c084fc 100%);
                    color: white;
                    padding: 15px 40px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    box-shadow: 0 4px 12px rgba(229, 185, 196, 0.3);
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>✨ {template.template_name}</h1>
            </div>

            <div class="intro">
                <p><strong>Welcome to your personalized template!</strong></p>
                <p>{template.introduction}</p>
            </div>

            <div class="section">
                <h3>📋 {template.before_visit.title}</h3>
                <ul>
                    {format_checklist(template.before_visit.checklist)}
                </ul>
                {f'<div class="pro-tip"><strong>💡 Pro Tip:</strong> {template.before_visit.tips}</div>' if template.before_visit.tips else ''}
            </div>

            <div class="section">
                <h3>🏪 {template.during_visit.title}</h3>
                <ul>
                    {format_checklist(template.during_visit.checklist)}
                </ul>
                {f'<div class="pro-tip"><strong>💡 Pro Tip:</strong> {template.during_visit.tips}</div>' if template.during_visit.tips else ''}
            </div>

            <div class="section">
                <h3>✅ {template.after_visit.title}</h3>
                <ul>
                    {format_checklist(template.after_visit.checklist)}
                </ul>
                {f'<div class="pro-tip"><strong>💡 Pro Tip:</strong> {template.after_visit.tips}</div>' if template.after_visit.tips else ''}
            </div>

            <div class="metrics">
                <h3>📊 Key Success Metrics</h3>
                <ul>
                    {format_checklist(template.success_metrics)}
                </ul>
            </div>

            <div class="pro-tip" style="margin: 30px 0;">
                <strong>💡 Master Pro Tip:</strong> {template.pro_tip}
            </div>

            <div class="cta">
                <p><strong>Ready to automate your entire workflow?</strong></p>
                <p>BeautyOps AI turns your voice notes into structured reports like this in 60 seconds.</p>
                <a href="https://beautyop.io/signup" class="cta-button">Start Your 14-Day Free Trial →</a>
            </div>

            <div class="footer">
                <p><strong>BeautyOps AI</strong> - AI Workflow Engine for Beauty Account Executives</p>
                <p>Questions? Reply to this email or visit <a href="https://beautyop.io">beautyop.io</a></p>
            </div>
        </body>
        </html>
        """

        return html

    def format_template_as_text(self, template: StoreVisitTemplate) -> str:
        """
        Format the AI-generated template as plain text for email.

        Args:
            template: The generated template

        Returns:
            str: Plain text-formatted email content
        """

        def format_checklist(items: List[str]) -> str:
            return "\n".join([f"  • {item}" for item in items])

        text = f"""
{template.template_name}
{'=' * len(template.template_name)}

{template.introduction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{template.before_visit.title}
{format_checklist(template.before_visit.checklist)}

{f"💡 Pro Tip: {template.before_visit.tips}" if template.before_visit.tips else ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{template.during_visit.title}
{format_checklist(template.during_visit.checklist)}

{f"💡 Pro Tip: {template.during_visit.tips}" if template.during_visit.tips else ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{template.after_visit.title}
{format_checklist(template.after_visit.checklist)}

{f"💡 Pro Tip: {template.after_visit.tips}" if template.after_visit.tips else ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY SUCCESS METRICS
{format_checklist(template.success_metrics)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 MASTER PRO TIP
{template.pro_tip}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to automate your entire workflow?

BeautyOps AI turns your voice notes into structured reports like this in 60 seconds.

Start Your 14-Day Free Trial: https://beautyop.io/signup

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BeautyOps AI - AI Workflow Engine for Beauty Account Executives
Questions? Visit https://beautyop.io
        """

        return text.strip()


# Singleton instance
_template_generator = None

def get_template_generator() -> TemplateGenerator:
    """Get or create the template generator singleton"""
    global _template_generator
    if _template_generator is None:
        _template_generator = TemplateGenerator()
    return _template_generator
