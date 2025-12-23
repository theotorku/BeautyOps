from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import os
import httpx
from datetime import datetime, timedelta
from db import supabase

router = APIRouter()

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

@router.get("/auth-url/{provider}")
async def get_auth_url(provider: str):
    if provider == "google":
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
        scope = "https://www.googleapis.com/auth/calendar.readonly"
        return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scope}&access_type=offline&prompt=consent"}
    elif provider == "outlook":
        client_id = os.getenv("OUTLOOK_CLIENT_ID")
        redirect_uri = os.getenv("OUTLOOK_REDIRECT_URI")
        scope = "offline_access Calendars.Read"
        return {"url": f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scope}"}
    else:
        raise HTTPException(status_code=400, detail="Invalid provider")

@router.post("/callback/{provider}")
async def oauth_callback(provider: str, code: str):
    # This would normally exchange the code for a token
    # For now, we'll implement the structure
    return {"message": f"OAuth callback received for {provider}. Token exchange logic to be implemented with client secrets."}

@router.get("/events", response_model=List[Event])
async def get_events(user_id: str):
    # 1. Fetch tokens from Supabase user_integrations table
    # 2. Call Google/Outlook API
    # 3. Return formatted events
    return []

@router.get("/proactive-briefing")
async def get_briefing(user_id: str):
    # 1. Get upcoming visits from calendar
    # 2. Query AI briefing service
    # 3. Return summary
    return {"summary": "Briefing service under construction"}
