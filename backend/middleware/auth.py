from fastapi import HTTPException, Depends, Header
from typing import Optional, Dict
import jwt
import os
import httpx
import logging
from functools import lru_cache
from db import supabase

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_jwks_public_key():
    """
    Fetch ES256 public key from Supabase JWKS endpoint.
    Cached to avoid repeated API calls.
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        if not supabase_url:
            logger.error("SUPABASE_URL not set, cannot fetch JWKS")
            return None

        jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
        response = httpx.get(jwks_url, timeout=10.0)

        if response.status_code == 200:
            jwks_data = response.json()
            if jwks_data.get("keys"):
                from jwt.algorithms import RSAAlgorithm, ECAlgorithm
                key_data = jwks_data["keys"][0]

                if key_data.get("kty") == "EC":
                    return ECAlgorithm.from_jwk(key_data)
                elif key_data.get("kty") == "RSA":
                    return RSAAlgorithm.from_jwk(key_data)

        logger.warning("No usable keys found in JWKS response")
        return None
    except Exception as e:
        logger.error(f"Error fetching JWKS: {e}")
        return None


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, str]:
    """
    Extract user from Supabase JWT token.
    Raises 401 if token is missing or invalid.
    Supports both HS256 (legacy) and ES256 (modern ECC) algorithms.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")

    try:
        token = authorization.replace("Bearer ", "")

        legacy_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        jwks_public_key = get_jwks_public_key()

        # Must have at least one verification method configured
        if not jwks_public_key and not legacy_jwt_secret:
            logger.error("No JWT verification method available: JWKS fetch failed and SUPABASE_JWT_SECRET not set")
            raise HTTPException(
                status_code=500,
                detail="Authentication service misconfigured"
            )

        # Try ES256 first (modern tokens) using JWKS
        if jwks_public_key:
            try:
                payload = jwt.decode(
                    token,
                    jwks_public_key,
                    algorithms=["ES256"],
                    audience="authenticated"
                )
                user_id = payload.get("sub")
                if not user_id:
                    raise HTTPException(status_code=401, detail="Invalid token: missing subject")
                return {
                    "user_id": user_id,
                    "email": payload.get("email")
                }
            except jwt.InvalidTokenError:
                pass  # Try legacy HS256 next

        # Try HS256 (legacy tokens)
        if legacy_jwt_secret:
            try:
                payload = jwt.decode(
                    token,
                    legacy_jwt_secret,
                    algorithms=["HS256"],
                    audience="authenticated"
                )
                user_id = payload.get("sub")
                if not user_id:
                    raise HTTPException(status_code=401, detail="Invalid token: missing subject")
                return {
                    "user_id": user_id,
                    "email": payload.get("email")
                }
            except jwt.InvalidTokenError:
                pass

        raise HTTPException(status_code=401, detail="Invalid or expired token")

    except HTTPException:
        raise
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        logger.error(f"Unexpected auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


def check_subscription_tier(required_tier: str):
    """
    Dependency to check if user has required subscription tier.
    Tier hierarchy: solo_ae (1) < pro_ae (2) < enterprise (3)
    """
    async def verify_tier(user: Dict[str, str] = Depends(get_current_user)) -> Dict[str, str]:
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
    Extract user from Supabase JWT token if present.
    Returns None if token is missing (does not raise exception).
    """
    if not authorization:
        return None

    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None
