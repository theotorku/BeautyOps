from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    app_name: str = "BeautyOps AI"
    admin_email: str = "admin@beautyops.ai"
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

settings = Settings()

from routers import visits, pos, extra_features, usage, calendar, vision

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(visits.router, prefix="/api/visits", tags=["Visits"])
app.include_router(pos.router, prefix="/api/pos", tags=["POS"])
app.include_router(extra_features.router, prefix="/api/features", tags=["ExtraFeatures"])
app.include_router(usage.router, prefix="/api/usage", tags=["Usage"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(vision.router, prefix="/api/vision", tags=["Vision"])

@app.get("/")
async def root():
    return {"message": "Welcome to BeautyOps AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Future routers will be included here
# app.include_router(visits.router, prefix="/api/visits", tags=["Visits"])
# app.include_router(pos.router, prefix="/api/pos", tags=["POS"])
