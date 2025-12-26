from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import Dict, Any, List

class TrainingScript(BaseModel):
    script: str = Field(description="A 10-minute training script for Beauty Advisors")
    key_selling_points: List[str] = Field(description="Top 3-5 selling points")
    objection_handling: List[str] = Field(description="Common objections and how to handle them")
    quiz: List[str] = Field(description="3-5 question quiz for BAs")
    one_pager_content: str = Field(description="Text for a printable one-pager")

class TrainingScriptChain:
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(api_key=api_key, model="gpt-4o")
        self.output_parser = PydanticOutputParser(pydantic_object=TrainingScript)

    async def run(self, product_info: str) -> Dict[str, Any]:
        format_instructions = self.output_parser.get_format_instructions()
        prompt = ChatPromptTemplate.from_template(
            "You are a Beauty Education Lead. Generate a comprehensive training package for the following product.\n\n"
            "Product Info: {product_info}\n\n"
            "{format_instructions}"
        )
        chain = prompt | self.llm | self.output_parser
        return await chain.ainvoke({"product_info": product_info, "format_instructions": format_instructions})

class ContentCreationPlan(BaseModel):
    instagram_caption: str = Field(description="Engaging IG caption with hashtags")
    tiktok_script: str = Field(description="Short, punchy script for TikTok/Reels")
    event_recap_email: str = Field(description="Email update for the team")
    hashtags: List[str] = Field(description="Strategic list of hashtags")

class ContentCreationChain:
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(api_key=api_key, model="gpt-4o")
        self.output_parser = PydanticOutputParser(pydantic_object=ContentCreationPlan)

    async def run(self, event_details: str) -> Dict[str, Any]:
        format_instructions = self.output_parser.get_format_instructions()
        prompt = ChatPromptTemplate.from_template(
            "You are a Beauty Social Media Manager. Create promotional content based on these event details.\n\n"
            "Event Details: {event_details}\n\n"
            "{format_instructions}"
        )
        chain = prompt | self.llm | self.output_parser
        return await chain.ainvoke({"event_details": event_details, "format_instructions": format_instructions})
