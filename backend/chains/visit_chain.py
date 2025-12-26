from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import Dict, Any, List

class StoreVisitReport(BaseModel):
    summary: str = Field(description="Concise summary of the store visit")
    inventory_issues: List[str] = Field(description="List of inventory issues found")
    training_needs: List[str] = Field(description="Specific training needs for the beauty advisors")
    opportunities: List[str] = Field(description="Growth opportunities identified")
    action_items: List[str] = Field(description="List of follow-up tasks")
    follow_up_email: str = Field(description="A draft email to the store manager")

class StoreVisitChain:
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(api_key=api_key, model="gpt-4o")
        self.output_parser = PydanticOutputParser(pydantic_object=StoreVisitReport)

    async def run(self, transcript: str) -> Dict[str, Any]:
        format_instructions = self.output_parser.get_format_instructions()
        
        prompt = ChatPromptTemplate.from_template(
            "You are an expert Beauty Account Executive assistant. "
            "Analyze the following transcript from a store visit and generate a structured report.\n\n"
            "Transcript: {transcript}\n\n"
            "{format_instructions}"
        )
        
        chain = prompt | self.llm | self.output_parser
        response = await chain.ainvoke({
            "transcript": transcript,
            "format_instructions": format_instructions
        })
        return response
