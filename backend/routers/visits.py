from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
from chains.visit_chain import StoreVisitChain
from middleware.auth import get_current_user
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".webm"}

class VisitResponse(BaseModel):
    summary: str
    inventory_issues: List[str]
    training_needs: List[str]
    opportunities: List[str]
    action_items: List[str]
    follow_up_email: str

class VisitRequest(BaseModel):
    transcript: str

@router.post("/process-transcript", response_model=VisitResponse)
async def process_transcript(request: VisitRequest, user: Dict = Depends(get_current_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

    if not request.transcript or len(request.transcript.strip()) < 10:
        raise HTTPException(status_code=400, detail="Transcript is too short. Please provide more detail.")
    if len(request.transcript) > 50000:
        raise HTTPException(status_code=400, detail="Transcript is too long. Maximum 50,000 characters.")

    chain = StoreVisitChain(api_key)
    try:
        result = await chain.run(request.transcript)
        return result
    except Exception as e:
        logger.error(f"Transcript processing failed for user {user['user_id']}: {e}")
        raise HTTPException(status_code=500, detail="Failed to process transcript")

@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...), user: Dict = Depends(get_current_user)):
    # Validate file type
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Accepted: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}")

    contents = await file.read()
    if len(contents) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    # TODO: Upload to Supabase Storage, call OpenAI Whisper, then process_transcript
    return {"message": "Audio upload functionality under construction"}
