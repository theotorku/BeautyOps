from fastapi import HTTPException, Depends, Header
from typing import Optional, Dict
import jwt
import os
from db import supabase


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, str]:
    """
    Extract user from Supabase JWT token
    Raises 401 if token is missing or invalid
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")

    try:
        # Extract token from Bearer header
        token = authorization.replace("Bearer ", "")
        supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

        if not supabase_jwt_secret:
            raise HTTPException(status_code=500, detail="JWT secret not configured")

        # Decode and verify token
        payload = jwt.decode(
            token,
            supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated"
        )

        return {
            "user_id": payload.get("sub"),
            "email": payload.get("email")
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def check_subscription_tier(required_tier: str):
    """
    Dependency to check if user has required subscription tier
    Tier hierarchy: solo_ae (1) < pro_ae (2) < enterprise (3)
    """
    async def verify_tier(user: Dict[str, str] = Depends(get_current_user)) -> Dict[str, str]:
        # Get user subscription
        result = supabase.table("subscriptions").select("subscription_tier, status").eq("user_id", user["user_id"]).eq("status", "active").execute()

        if not result.data:
            raise HTTPException(status_code=403, detail="No active subscription")

        subscription = result.data[0]
        tier_hierarchy = {"solo_ae": 1, "pro_ae": 2, "enterprise": 3}

        user_tier_level = tier_hierarchy.get(subscription["subscription_tier"], 0)
        required_tier_level = tier_hierarchy.get(required_tier, 99)

        if user_tier_level < required_tier_level:
            raise HTTPException(
                status_code=403,
                detail=f"Requires {required_tier} subscription or higher"
            )

        return user

    return verify_tier


async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, str]]:
    """
    Extract user from Supabase JWT token if present
    Returns None if token is missing (does not raise exception)
    """
    if not authorization:
        return None

    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None
