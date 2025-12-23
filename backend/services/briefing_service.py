from openai import OpenAI
import os
from typing import List, Dict

class BriefingService:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    async def generate_briefing(self, store_name: str, past_reports: List[str], pos_data: Dict) -> str:
        """
        Generates a proactive briefing for a store visit.
        """
        prompt = f"""
        You are an AI assistant for a Beauty Account Executive.
        You are preparing a briefing for a visit to {store_name}.
        
        PAST REPORTS SUMMARY:
        {past_reports}
        
        LATEST POS DATA:
        {pos_data}
        
        Based on this, provide a concise 3-bullet point briefing for the AE:
        1. Context from last visit.
        2. Key inventory or sales issue to address.
        3. Strategic opportunity.
        
        Keep it professional, encouraging, and data-driven.
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a professional retail consultant advisor."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.choices[0].message.content
