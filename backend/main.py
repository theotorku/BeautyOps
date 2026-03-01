from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    app_name: str = "BeautyOps AI"
    admin_email: str = os.getenv("ADMIN_EMAIL", "admin@beautyops.ai")

settings = Settings()

from routers import visits, pos, extra_features, usage, calendar, vision, billing, leads

# Disable API docs in production (Railway sets these env vars automatically)
is_production = bool(os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("RAILWAY_PROJECT_ID"))

app = FastAPI(
    title=settings.app_name,
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)

# CORS Configuration - restrict to known origins and specific methods/headers
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = list(set([
    "http://localhost:3000",
    "https://beautyop.io",
    "https://www.beautyop.io",
    frontend_url
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(visits.router, prefix="/api/visits", tags=["Visits"])
app.include_router(pos.router, prefix="/api/pos", tags=["POS"])
app.include_router(extra_features.router, prefix="/api/features", tags=["ExtraFeatures"])
app.include_router(usage.router, prefix="/api/usage", tags=["Usage"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(vision.router, prefix="/api/vision", tags=["Vision"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billing"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])

@app.get("/")
async def root():
    return {"message": "Welcome to BeautyOps AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
