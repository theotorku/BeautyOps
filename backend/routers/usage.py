from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict
from db import supabase

router = APIRouter()

class UsageStats(BaseModel):
    tier: str
    pos_credits_used: int
    pos_credits_limit: int
    briefings_used: int
    briefings_limit: int

# Mock data for demonstration
MOCK_USAGE = {
    "user_123": {
        "tier": "Solo AE",
        "pos_credits_used": 7,
        "pos_credits_limit": 10,
        "briefings_used": 4,
        "briefings_limit": 5
    }
}

@router.get("/stats", response_model=UsageStats)
async def get_usage_stats(user_id: str = "user_123"):
    if user_id in MOCK_USAGE:
        return MOCK_USAGE[user_id]
    raise HTTPException(status_code=404, detail="User not found")

def check_access(user_id: str, feature: str):
    """
    Utility to check if a user has access to a specific feature based on their tier.
    """
    stats = MOCK_USAGE.get(user_id)
    if not stats:
        return False
    
    tier = stats["tier"]
    
    # Simple gating logic
    if feature == "pos_analysis" and tier == "Solo AE":
        if stats["credits_used"] >= stats["credits_limit"]:
            return False
            
    if feature in ["training_generator", "content_assistant"] and tier == "Solo AE":
        return False # Pro feature
        
    return True
