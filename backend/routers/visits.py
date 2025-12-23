from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from chains.visit_chain import StoreVisitChain
import os

router = APIRouter()

class VisitResponse(BaseModel):
    summary: str
    inventory_issues: List[str]
    training_needs: List[str]
    opportunities: List[str]
    action_items: List[str]
    follow_up_email: str

@router.post("/process-transcript", response_model=VisitResponse)
async def process_transcript(transcript: str):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")
    
    chain = StoreVisitChain(api_key)
    try:
        result = await chain.run(transcript)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Placeholder for audio upload -> Whisper -> transcript
@router.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    # 1. Upload to Supabase Storage
    # 2. Call OpenAI Whisper API
    # 3. Call process_transcript
    return {"message": "Audio upload functionality under construction"}
