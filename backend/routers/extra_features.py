from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from chains.extra_chains import TrainingScriptChain, ContentCreationChain
import os

router = APIRouter()

@router.post("/generate-training")
async def generate_training(product_info: str):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key: raise HTTPException(status_code=500, detail="API Key not configured")
    chain = TrainingScriptChain(api_key)
    return await chain.run(product_info)

@router.post("/generate-content")
async def generate_content(event_details: str):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key: raise HTTPException(status_code=500, detail="API Key not configured")
    chain = ContentCreationChain(api_key)
    return await chain.run(event_details)
