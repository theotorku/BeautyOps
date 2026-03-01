from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
import os
import base64
import logging
from openai import OpenAI
from middleware.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

class VisionResponse(BaseModel):
    analysis: str
    competitors_detected: List[str]
    tactical_suggestion: str

@router.post("/analyze-shelf", response_model=VisionResponse)
async def analyze_shelf(file: UploadFile = File(...), user: Dict = Depends(get_current_user)):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")

    # Validate file type
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not allowed. Accepted: .jpg, .jpeg, .png, .webp, .gif")

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 20MB.")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    client = OpenAI(api_key=api_key)

    try:
        base64_image = base64.b64encode(contents).decode('utf-8')

        mime_types = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}
        mime_type = mime_types.get(ext, "image/jpeg")

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
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )

        full_text = response.choices[0].message.content

        return VisionResponse(
            analysis=full_text,
            competitors_detected=["Competitor X", "Competitor Y"],
            tactical_suggestion="Pivot to Hydra-Silk pitching due to competitor stock gaps detected."
        )
    except Exception as e:
        logger.error(f"Shelf analysis failed for user {user['user_id']}: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze shelf image")
