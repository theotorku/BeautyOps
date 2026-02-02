from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Optional
from db import supabase
from datetime import datetime
from middleware.auth import get_current_user

router = APIRouter()


class UsageStats(BaseModel):
    tier: str
    pos_credits_used: int
    pos_credits_limit: int
    briefings_used: int
    briefings_limit: int


# Tier-based limits
TIER_LIMITS = {
    "solo_ae": {
        "pos_credits_limit": 10,
        "briefings_limit": 5
    },
    "pro_ae": {
        "pos_credits_limit": -1,  # Unlimited
        "briefings_limit": -1     # Unlimited
    },
    "enterprise": {
        "pos_credits_limit": -1,  # Unlimited
        "briefings_limit": -1     # Unlimited
    }
}


@router.get("/stats", response_model=UsageStats)
async def get_usage_stats(user: Dict = Depends(get_current_user)):
    """
    Get real-time usage statistics for the current user based on their subscription tier.
    Returns current month's usage and limits based on tier.
    """
    user_id = user["user_id"]
    try:
        # Get user's current subscription tier
        subscription = supabase.table("subscriptions").select("*").eq("user_id", user_id).eq("status", "active").execute()

        # Default tier if no subscription (free trial or new user)
        tier = "solo_ae"
        tier_display = "Free Trial"

        if subscription.data and len(subscription.data) > 0:
            tier = subscription.data[0]["subscription_tier"]
            tier_display = tier.replace("_", " ").title()

        # Get usage from usage_tracking table
        usage = supabase.table("usage_tracking").select("*").eq("user_id", user_id).execute()

        # Calculate usage (default to 0 if no records)
        pos_credits_used = 0
        briefings_used = 0

        if usage.data and len(usage.data) > 0:
            # Sum up all usage records for current billing period
            for record in usage.data:
                if record.get("feature_name") == "pos_analysis":
                    pos_credits_used += record.get("count", 0)
                elif record.get("feature_name") == "proactive_briefing":
                    briefings_used += record.get("count", 0)

        # Get limits based on tier
        limits = TIER_LIMITS.get(tier, TIER_LIMITS["solo_ae"])

        return UsageStats(
            tier=tier_display,
            pos_credits_used=pos_credits_used,
            pos_credits_limit=limits["pos_credits_limit"],
            briefings_used=briefings_used,
            briefings_limit=limits["briefings_limit"]
        )

    except Exception as e:
        # Return default stats if database query fails (graceful degradation)
        return UsageStats(
            tier="Free Trial",
            pos_credits_used=0,
            pos_credits_limit=10,
            briefings_used=0,
            briefings_limit=5
        )


def check_access(user_id: str, feature: str) -> bool:
    """
    Utility to check if a user has access to a specific feature based on their tier.
    Returns True if user has access, False if limit exceeded or feature not available.
    """
    try:
        # Get subscription tier
        subscription = supabase.table("subscriptions").select("*").eq("user_id", user_id).eq("status", "active").execute()

        tier = "solo_ae"  # Default
        if subscription.data and len(subscription.data) > 0:
            tier = subscription.data[0]["subscription_tier"]

        # Pro and Enterprise users have access to everything
        if tier in ["pro_ae", "enterprise"]:
            return True

        # Solo AE users: Check feature limits
        if tier == "solo_ae":
            # Check if feature is pro-only
            pro_only_features = ["training_generator", "content_assistant", "team_collaboration"]
            if feature in pro_only_features:
                return False

            # Check POS analysis credits
            if feature == "pos_analysis":
                now = datetime.now()
                first_of_month = datetime(now.year, now.month, 1).isoformat()
                
                usage = supabase.table("usage_tracking")\
                    .select("count")\
                    .eq("user_id", user_id)\
                    .eq("feature_name", "pos_analysis")\
                    .gte("created_at", first_of_month)\
                    .execute()

                credits_used = sum(record.get("count", 0) for record in usage.data) if usage.data else 0
                return credits_used < TIER_LIMITS["solo_ae"]["pos_credits_limit"]

            # Check briefings limit
            if feature == "proactive_briefing":
                now = datetime.now()
                first_of_month = datetime(now.year, now.month, 1).isoformat()

                usage = supabase.table("usage_tracking")\
                    .select("count")\
                    .eq("user_id", user_id)\
                    .eq("feature_name", "proactive_briefing")\
                    .gte("created_at", first_of_month)\
                    .execute()

                briefings_used = sum(record.get("count", 0) for record in usage.data) if usage.data else 0
                return briefings_used < TIER_LIMITS["solo_ae"]["briefings_limit"]

        return True

    except Exception as e:
        # If database query fails, default to allowing access (fail open)
        print(f"Error checking access for user {user_id}, feature {feature}: {str(e)}")
        return True


def record_usage(user_id: str, feature: str, count: int = 1):
    """
    Logs usage of a feature in the usage_tracking table.
    """
    try:
        supabase.table("usage_tracking").insert({
            "user_id": user_id,
            "feature_name": feature,
            "count": count,
            "created_at": datetime.now().isoformat()
        }).execute()
    except Exception as e:
        print(f"Error recording usage for user {user_id}, feature {feature}: {str(e)}")


def require_access(feature: str):
    """
    FastAPI dependency factory to enforce usage limits.
    Usage: Depends(require_access("pos_analysis"))
    """
    async def access_dependency(user: Dict = Depends(get_current_user)):
        if not check_access(user["user_id"], feature):
            raise HTTPException(
                status_code=403, 
                detail=f"Usage limit reached for {feature.replace('_', ' ')}. Upgrade your plan to continue."
            )
        return user
    return access_dependency
