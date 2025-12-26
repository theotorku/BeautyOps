from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from chains.pos_chain import POSAnalysisChain
import os

router = APIRouter()

class POSResponse(BaseModel):
    top_sellers: List[str]
    slow_movers: List[str]
    shade_gaps: List[str]
    trends: List[str]
    recommendations: List[str]

@router.post("/analyze", response_model=POSResponse)
async def analyze_pos(file: UploadFile = File(...)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")
    
    content = await file.read()
    chain = POSAnalysisChain(api_key)
    
    try:
        # In a real scenario, we'd handle both CSV and XLSX
        summary = chain.summarize_csv(content)
        result = await chain.run(summary)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
