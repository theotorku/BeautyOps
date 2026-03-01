from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from chains.extra_chains import TrainingScriptChain, ContentCreationChain
from middleware.auth import get_current_user
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class TrainingRequest(BaseModel):
    product_info: str

@router.post("/generate-training")
async def generate_training(request: TrainingRequest, user: Dict = Depends(get_current_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key not configured")

    if not request.product_info or len(request.product_info.strip()) < 10:
        raise HTTPException(status_code=400, detail="Product info is too short")

    chain = TrainingScriptChain(api_key)
    try:
        return await chain.run(request.product_info)
    except Exception as e:
        logger.error(f"Training generation failed for user {user['user_id']}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate training script")

class ContentRequest(BaseModel):
    event_details: str

@router.post("/generate-content")
async def generate_content(request: ContentRequest, user: Dict = Depends(get_current_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key not configured")

    if not request.event_details or len(request.event_details.strip()) < 10:
        raise HTTPException(status_code=400, detail="Event details are too short")

    chain = ContentCreationChain(api_key)
    try:
        return await chain.run(request.event_details)
    except Exception as e:
        logger.error(f"Content generation failed for user {user['user_id']}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate content")
