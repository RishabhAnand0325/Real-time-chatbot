import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

async def create_session(session_id: str, user_id: str):
    """Creates a new session record asynchronously."""
    data = {
        "session_id": session_id,
        "user_id": user_id,
        "start_time": "now()"
    }
    supabase.table("session_metadata").insert(data).execute()

async def log_event(session_id: str, event_type: str, content: str):
    """Logs an event to the event_log table."""
    data = {
        "session_id": session_id,
        "event_type": event_type,
        "content": content
    }
    supabase.table("event_log").insert(data).execute()

async def update_session_summary(session_id: str, summary: str, duration: int):
    """Updates the session with the final summary."""
    supabase.table("session_metadata").update({
        "end_time": "now()",
        "session_summary": summary,
        "duration_seconds": duration
    }).eq("session_id", session_id).execute()

async def get_session_history(session_id: str):
    """Fetches full conversation history for summarization."""
    response = supabase.table("event_log").select("*").eq("session_id", session_id).order("timestamp").execute()

    return response.data
