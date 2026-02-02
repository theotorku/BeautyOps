from fastapi import HTTPException, Depends, Header
from typing import Optional, Dict
import jwt
import os
import httpx
from functools import lru_cache
from db import supabase


@lru_cache(maxsize=1)
def get_jwks_public_key() -> Optional[str]:
    """
    Fetch ES256 public key from Supabase JWKS endpoint.
    Cached to avoid repeated API calls.
    """
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        if not supabase_url:
            return None

        # Fetch JWKS from Supabase discovery endpoint
        jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
        response = httpx.get(jwks_url, timeout=10.0)

        if response.status_code == 200:
            jwks_data = response.json()
            # Extract first key (Supabase typically has one signing key)
            if jwks_data.get("keys"):
                # Convert JWK to PEM format using PyJWT
                from jwt.algorithms import RSAAlgorithm, ECAlgorithm
                key_data = jwks_data["keys"][0]

                # Determine algorithm type
                if key_data.get("kty") == "EC":
                    # Elliptic Curve key (ES256)
                    public_key = ECAlgorithm.from_jwk(key_data)
                    return public_key
                elif key_data.get("kty") == "RSA":
                    # RSA key
                    public_key = RSAAlgorithm.from_jwk(key_data)
                    return public_key

        return None
    except Exception as e:
        print(f"Error fetching JWKS: {e}")
        return None


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, str]:
    """
    Extract user from Supabase JWT token
    Raises 401 if token is missing or invalid
    Supports both HS256 (legacy) and ES256 (modern ECC) algorithms
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")

    try:
        # Extract token from Bearer header
        token = authorization.replace("Bearer ", "")

        # Get legacy secret
        legacy_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")  # HS256 legacy secret

        # Try ES256 first (modern tokens) using JWKS
        try:
            jwks_public_key = get_jwks_public_key()
            if jwks_public_key:
                payload = jwt.decode(
                    token,
                    jwks_public_key,
                    algorithms=["ES256"],
                    audience="authenticated"
                )
                return {
                    "user_id": payload.get("sub"),
                    "email": payload.get("email")
                }
        except jwt.InvalidTokenError:
            pass  # Try legacy HS256 next
        except Exception as e:
            print(f"ES256 verification failed: {e}")
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
                return {
                    "user_id": payload.get("sub"),
                    "email": payload.get("email")
                }
            except jwt.InvalidTokenError:
                pass  # Will raise error below

        # If both fail, raise invalid token error
        raise jwt.InvalidTokenError("Token verification failed with both HS256 and ES256")

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
