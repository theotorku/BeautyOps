from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import base64
from openai import OpenAI

router = APIRouter()

class VisionResponse(BaseModel):
    analysis: str
    competitors_detected: List[str]
    tactical_suggestion: str

@router.post("/analyze-shelf", response_model=VisionResponse)
async def analyze_shelf(file: UploadFile = File(...)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")
    
    client = OpenAI(api_key=api_key)
    
    try:
        # Read file and encode to base64
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a retail execution expert specializing in the beauty industry. Analyze shelf photos to identify competitors, stock gaps, and promotional moves."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this beauty shelf photo. Identify the main competitors, note any interesting promotional materials, and provide one specific tactical suggestion for the brand rep on-site."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        
        full_text = response.choices[0].message.content
        
        # In a real app, we'd use structured output or a secondary agent call to parse this
        # For this prototype, we'll return the full analysis with mock categories
        return VisionResponse(
            analysis=full_text,
            competitors_detected=["Competitor X", "Competitor Y"], # Placeholder
            tactical_suggestion="Pivot to Hydra-Silk pitching due to competitor stock gaps detected." # Placeholder
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
