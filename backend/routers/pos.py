from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
from chains.pos_chain import POSAnalysisChain
from middleware.auth import get_current_user
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}

class POSResponse(BaseModel):
    top_sellers: List[str]
    slow_movers: List[str]
    shade_gaps: List[str]
    trends: List[str]
    recommendations: List[str]

@router.post("/analyze", response_model=POSResponse)
async def analyze_pos(file: UploadFile = File(...), user: Dict = Depends(get_current_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

    # Validate file type
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Accepted: {', '.join(ALLOWED_EXTENSIONS)}")

    # Validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    chain = POSAnalysisChain(api_key)

    try:
        summary = chain.summarize_csv(content)
        result = await chain.run(summary)
        return result
    except Exception as e:
        logger.error(f"POS analysis failed for user {user['user_id']}: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze POS data")
