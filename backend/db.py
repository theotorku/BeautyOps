from supabase import create_client, Client
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

url: str = os.getenv("SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def get_supabase() -> Client:
    if not url:
        raise EnvironmentError("SUPABASE_URL is not set. Check your .env file.")
    if not key:
        raise EnvironmentError("SUPABASE_SERVICE_ROLE_KEY is not set. Check your .env file.")
    return create_client(url, key)

supabase: Client = get_supabase()
