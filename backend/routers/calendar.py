from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict
from middleware.auth import get_current_user
from routers.usage import require_access, record_usage
import os
import httpx
from datetime import datetime, timedelta
from db import supabase
import secrets

router = APIRouter()

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/integrations/callback/google")

OUTLOOK_CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID")
OUTLOOK_CLIENT_SECRET = os.getenv("OUTLOOK_CLIENT_SECRET")
OUTLOOK_REDIRECT_URI = os.getenv("OUTLOOK_REDIRECT_URI", "http://localhost:3000/integrations/callback/outlook")

class CalendarConnection(BaseModel):
    provider: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: datetime

class Event(BaseModel):
    id: str
    summary: str
    start: datetime
    end: datetime
    location: Optional[str] = None
    description: Optional[str] = None

class IntegrationStatus(BaseModel):
    provider: str
    connected: bool
    connected_at: Optional[datetime] = None
    last_synced_at: Optional[datetime] = None

@router.get("/auth-url/{provider}")
async def get_auth_url(provider: str, user: Dict = Depends(get_current_user)):
    """
    Generate OAuth authorization URL for calendar provider.
    User will be redirected to this URL to grant permissions.
    """
    user_id = user["user_id"]
    # Store state parameter to prevent CSRF attacks
    state = secrets.token_urlsafe(32)

    # Store state in user's session (in production, use Redis or similar)
    # For now, we'll include user_id in state parameter
    state_with_user = f"{user_id}:{state}"

    if provider == "google":
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=500, detail="Google OAuth not configured. Add GOOGLE_CLIENT_ID to environment variables.")

        scope = "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events"
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth"
            f"?client_id={GOOGLE_CLIENT_ID}"
            f"&redirect_uri={GOOGLE_REDIRECT_URI}"
            f"&response_type=code"
            f"&scope={scope}"
            f"&access_type=offline"
            f"&prompt=consent"
            f"&state={state_with_user}"
        )
        return {"url": auth_url, "state": state_with_user}

    elif provider == "outlook":
        if not OUTLOOK_CLIENT_ID:
            raise HTTPException(status_code=500, detail="Outlook OAuth not configured. Add OUTLOOK_CLIENT_ID to environment variables.")

        scope = "offline_access Calendars.Read Calendars.ReadWrite"
        auth_url = (
            f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
            f"?client_id={OUTLOOK_CLIENT_ID}"
            f"&redirect_uri={OUTLOOK_REDIRECT_URI}"
            f"&response_type=code"
            f"&scope={scope}"
            f"&state={state_with_user}"
        )
        return {"url": auth_url, "state": state_with_user}

    else:
        raise HTTPException(status_code=400, detail="Invalid provider. Supported providers: google, outlook")

@router.post("/callback/{provider}")
async def oauth_callback(provider: str, code: str, state: str):
    """
    Handle OAuth callback and exchange authorization code for access token.
    Stores tokens in user_integrations table.
    """
    # Extract user_id from state parameter
    try:
        user_id, _ = state.split(":", 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    if provider == "google":
        if not GOOGLE_CLIENT_SECRET:
            raise HTTPException(status_code=500, detail="Google OAuth not configured. Add GOOGLE_CLIENT_SECRET to environment variables.")

        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code"
                }
            )

        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to exchange code for token: {token_response.text}")

        token_data = token_response.json()
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in", 3600)
        expires_at = datetime.now() + timedelta(seconds=expires_in)
        scope = token_data.get("scope", "")

    elif provider == "outlook":
        if not OUTLOOK_CLIENT_SECRET:
            raise HTTPException(status_code=500, detail="Outlook OAuth not configured. Add OUTLOOK_CLIENT_SECRET to environment variables.")

        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                data={
                    "code": code,
                    "client_id": OUTLOOK_CLIENT_ID,
                    "client_secret": OUTLOOK_CLIENT_SECRET,
                    "redirect_uri": OUTLOOK_REDIRECT_URI,
                    "grant_type": "authorization_code"
                }
            )

        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to exchange code for token: {token_response.text}")

        token_data = token_response.json()
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in", 3600)
        expires_at = datetime.now() + timedelta(seconds=expires_in)
        scope = token_data.get("scope", "")

    else:
        raise HTTPException(status_code=400, detail="Invalid provider")

    # Store tokens in Supabase user_integrations table
    try:
        # Check if integration already exists
        existing = supabase.table("user_integrations").select("*").eq("user_id", user_id).eq("provider", provider).execute()

        if existing.data:
            # Update existing integration
            supabase.table("user_integrations").update({
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_expires_at": expires_at.isoformat(),
                "scope": scope,
                "is_active": True,
                "connected_at": datetime.now().isoformat()
            }).eq("user_id", user_id).eq("provider", provider).execute()
        else:
            # Insert new integration
            supabase.table("user_integrations").insert({
                "user_id": user_id,
                "provider": provider,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_expires_at": expires_at.isoformat(),
                "scope": scope,
                "is_active": True
            }).execute()

        return {
            "success": True,
            "message": f"{provider.title()} Calendar connected successfully!",
            "provider": provider,
            "expires_at": expires_at.isoformat()
        }

    except Exception as e:
        print(f"Error storing integration: {e}")
        raise HTTPException(status_code=500, detail="Failed to store calendar integration")

async def refresh_access_token(integration: dict) -> Optional[str]:
    """
    Refresh expired access token using refresh token.
    Returns new access token or None if refresh fails.
    """
    provider = integration["provider"]
    refresh_token = integration.get("refresh_token")

    if not refresh_token:
        print(f"No refresh token available for {provider}")
        return None

    try:
        if provider == "google":
            if not GOOGLE_CLIENT_SECRET:
                return None

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": GOOGLE_CLIENT_ID,
                        "client_secret": GOOGLE_CLIENT_SECRET,
                        "refresh_token": refresh_token,
                        "grant_type": "refresh_token"
                    }
                )

            if response.status_code == 200:
                token_data = response.json()
                new_access_token = token_data["access_token"]
                expires_in = token_data.get("expires_in", 3600)
                new_expires_at = datetime.now() + timedelta(seconds=expires_in)

                # Update token in database
                supabase.table("user_integrations").update({
                    "access_token": new_access_token,
                    "token_expires_at": new_expires_at.isoformat()
                }).eq("id", integration["id"]).execute()

                return new_access_token

        elif provider == "outlook":
            if not OUTLOOK_CLIENT_SECRET:
                return None

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                    data={
                        "client_id": OUTLOOK_CLIENT_ID,
                        "client_secret": OUTLOOK_CLIENT_SECRET,
                        "refresh_token": refresh_token,
                        "grant_type": "refresh_token"
                    }
                )

            if response.status_code == 200:
                token_data = response.json()
                new_access_token = token_data["access_token"]
                expires_in = token_data.get("expires_in", 3600)
                new_expires_at = datetime.now() + timedelta(seconds=expires_in)

                # Update token in database
                supabase.table("user_integrations").update({
                    "access_token": new_access_token,
                    "token_expires_at": new_expires_at.isoformat()
                }).eq("id", integration["id"]).execute()

                return new_access_token

    except Exception as e:
        print(f"Error refreshing token for {provider}: {e}")
        return None

    return None


async def get_valid_access_token(integration: dict) -> Optional[str]:
    """
    Get valid access token, refreshing if necessary.
    Returns access token or None if unable to get/refresh.
    """
    access_token = integration["access_token"]
    expires_at = datetime.fromisoformat(integration["token_expires_at"])

    # Check if token is expired or will expire in next 5 minutes
    if datetime.now() >= expires_at - timedelta(minutes=5):
        print(f"Token expired for {integration['provider']}, attempting refresh...")
        new_token = await refresh_access_token(integration)
        if new_token:
            return new_token
        else:
            # Mark integration as inactive if refresh fails
            supabase.table("user_integrations").update({
                "is_active": False,
                "metadata": {"error": "Token refresh failed"}
            }).eq("id", integration["id"]).execute()
            return None

    return access_token


@router.get("/status", response_model=List[IntegrationStatus])
async def get_integration_status(user: Dict = Depends(get_current_user)):
    """
    Get connection status for all calendar providers.
    """
    user_id = user["user_id"]
    try:
        integrations = supabase.table("user_integrations").select("*").eq("user_id", user_id).eq("is_active", True).execute()

        # Create status for both providers
        statuses = []
        providers = ["google", "outlook"]

        for provider in providers:
            integration = next((i for i in integrations.data if i["provider"] == provider), None)
            if integration:
                statuses.append(IntegrationStatus(
                    provider=provider,
                    connected=True,
                    connected_at=integration.get("connected_at"),
                    last_synced_at=integration.get("last_synced_at")
                ))
            else:
                statuses.append(IntegrationStatus(
                    provider=provider,
                    connected=False
                ))

        return statuses

    except Exception as e:
        print(f"Error fetching integration status: {e}")
        # Return default disconnected status
        return [
            IntegrationStatus(provider="google", connected=False),
            IntegrationStatus(provider="outlook", connected=False)
        ]

@router.delete("/disconnect/{provider}")
async def disconnect_calendar(provider: str, user: Dict = Depends(get_current_user)):
    """
    Disconnect a calendar integration.
    """
    user_id = user["user_id"]
    try:
        supabase.table("user_integrations").update({
            "is_active": False
        }).eq("user_id", user_id).eq("provider", provider).execute()

        return {
            "success": True,
            "message": f"{provider.title()} Calendar disconnected successfully"
        }

    except Exception as e:
        print(f"Error disconnecting calendar: {e}")
        raise HTTPException(status_code=500, detail="Failed to disconnect calendar")

@router.get("/events", response_model=List[Event])
async def get_events(user: Dict = Depends(get_current_user), start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Fetch calendar events from connected providers.
    """
    return await _fetch_calendar_events(user["user_id"], start_date, end_date)


async def _fetch_calendar_events(user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Internal helper to fetch calendar events from connected providers.
    """
    try:
        # Get active integrations
        integrations = supabase.table("user_integrations").select("*").eq("user_id", user_id).eq("is_active", True).execute()

        if not integrations.data:
            return []

        all_events = []

        # Set default date range (next 7 days)
        if not start_date:
            start_date = datetime.now().isoformat()
        if not end_date:
            end_date = (datetime.now() + timedelta(days=7)).isoformat()

        for integration in integrations.data:
            provider = integration["provider"]

            # Get valid access token (refreshes if needed)
            access_token = await get_valid_access_token(integration)
            if not access_token:
                print(f"Unable to get valid token for {provider}, skipping...")
                continue

            if provider == "google":
                # Fetch Google Calendar events
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                        headers={"Authorization": f"Bearer {access_token}"},
                        params={
                            "timeMin": start_date,
                            "timeMax": end_date,
                            "singleEvents": True,
                            "orderBy": "startTime"
                        }
                    )

                if response.status_code == 200:
                    data = response.json()
                    for item in data.get("items", []):
                        all_events.append(Event(
                            id=item["id"],
                            summary=item.get("summary", "No Title"),
                            start=datetime.fromisoformat(item["start"].get("dateTime", item["start"].get("date"))),
                            end=datetime.fromisoformat(item["end"].get("dateTime", item["end"].get("date"))),
                            location=item.get("location"),
                            description=item.get("description")
                        ))

            elif provider == "outlook":
                # Fetch Outlook Calendar events
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        "https://graph.microsoft.com/v1.0/me/calendar/events",
                        headers={"Authorization": f"Bearer {access_token}"},
                        params={
                            "startDateTime": start_date,
                            "endDateTime": end_date,
                            "$orderby": "start/dateTime"
                        }
                    )

                if response.status_code == 200:
                    data = response.json()
                    for item in data.get("value", []):
                        all_events.append(Event(
                            id=item["id"],
                            summary=item.get("subject", "No Title"),
                            start=datetime.fromisoformat(item["start"]["dateTime"]),
                            end=datetime.fromisoformat(item["end"]["dateTime"]),
                            location=item.get("location", {}).get("displayName"),
                            description=item.get("bodyPreview")
                        ))

        # Update last_synced_at
        supabase.table("user_integrations").update({
            "last_synced_at": datetime.now().isoformat()
        }).eq("user_id", user_id).eq("is_active", True).execute()

        return all_events

    except Exception as e:
        print(f"Error fetching events: {e}")
        return []

@router.get("/proactive-briefing")
async def get_briefing(
    user: Dict = Depends(get_current_user),
    _access: Dict = Depends(require_access("proactive_briefing"))
):
    """
    Get AI-powered briefing for upcoming calendar events.
    Analyzes upcoming store visits and provides tactical summaries with context from past visits.
    """
    user_id = user["user_id"]
    try:
        # Get upcoming events (next 24 hours)
        start_date = datetime.now().isoformat()
        end_date = (datetime.now() + timedelta(hours=24)).isoformat()

        events = await _fetch_calendar_events(user_id, start_date, end_date)

        if not events:
            return {
                "summary": "No upcoming visits in the next 24 hours.",
                "next_event": None,
                "briefings": [],
                "recommendations": []
            }

        # Get historical visit data for context
        visit_history = supabase.table("visits").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()

        briefings = []

        for event in events:
            event_name = event.summary.lower()

            # Find related past visits
            related_visits = []
            if visit_history.data:
                for visit in visit_history.data:
                    visit_location = visit.get("location", "").lower()
                    if visit_location and (visit_location in event_name or event_name in visit_location):
                        related_visits.append(visit)

            # Generate AI briefing using OpenAI
            try:
                from langchain_openai import ChatOpenAI
                from langchain_core.prompts import ChatPromptTemplate

                llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, api_key=os.getenv("OPENAI_API_KEY"))

                # Build context from past visits
                past_visit_context = ""
                if related_visits:
                    past_visit_context = "\\n\\nPast visits to this location:\\n"
                    for visit in related_visits[:3]:  # Last 3 visits
                        past_visit_context += f"- {visit.get('created_at', 'Unknown date')}: {visit.get('summary', 'No summary')}\\n"

                prompt = ChatPromptTemplate.from_messages([
                    ("system", """You are an expert Beauty Account Executive coach. Generate a concise tactical briefing (2-3 sentences) for an upcoming store visit.

                    Focus on:
                    - Key actions to take during the visit
                    - Important items to check (inventory, displays, staff training)
                    - Follow-up opportunities from past visits

                    Be specific, actionable, and professional."""),
                    ("user", f"""Upcoming Visit: {event.summary}
Location: {event.location or 'Not specified'}
Time: {event.start}
{past_visit_context}

Generate a tactical briefing:""")
                ])

                response = await llm.ainvoke(prompt.format_messages())
                ai_briefing = response.content.strip()

            except Exception as ai_error:
                print(f"AI briefing generation failed: {ai_error}")
                # Fallback briefing
                if related_visits:
                    ai_briefing = f"Follow up on items from your last visit on {related_visits[0].get('created_at', 'recently')}. Review POS data and check stock levels for top-selling SKUs."
                else:
                    ai_briefing = "First visit to this location. Focus on building rapport, assessing merchandising quality, and identifying improvement opportunities."

            briefings.append({
                "event": {
                    "summary": event.summary,
                    "start": event.start.isoformat(),
                    "location": event.location,
                    "description": event.description
                },
                "briefing": ai_briefing,
                "past_visits_count": len(related_visits),
                "last_visit_date": related_visits[0].get("created_at") if related_visits else None
            })

        # Record usage
        record_usage(user_id, "proactive_briefing")

        # Generate overall recommendations
        recommendations = [
            "Review POS data for accounts you're visiting today",
            "Check recent competitive activity in your territory",
            "Prepare talking points for slow-moving inventory"
        ]

        if any(b["past_visits_count"] > 0 for b in briefings):
            recommendations.insert(0, "Review action items from previous visits")

        return {
            "summary": f"You have {len(events)} upcoming visits in the next 24 hours.",
            "next_event": {
                "summary": events[0].summary,
                "start": events[0].start.isoformat(),
                "location": events[0].location,
                "time_until": str(events[0].start - datetime.now())
            } if events else None,
            "briefings": briefings,
            "recommendations": recommendations
        }

    except Exception as e:
        print(f"Error generating briefing: {e}")
        import traceback
        traceback.print_exc()
        return {
            "summary": "Unable to generate briefing at this time.",
            "error": str(e),
            "briefings": [],
            "recommendations": []
        }
