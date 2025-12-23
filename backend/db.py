from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def get_supabase() -> Client:
    if not url or not key:
        print("Warning: Supabase credentials not found in environment variables.")
    return create_client(url, key)

supabase: Client = get_supabase()
