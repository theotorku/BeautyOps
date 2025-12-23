from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from typing import Dict, Any

class TrainingScriptChain:
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(api_key=api_key, model="gpt-4o")
        self.response_schemas = [
            ResponseSchema(name="script", description="A 10-minute training script for Beauty Advisors"),
            ResponseSchema(name="key_selling_points", description="Top 3-5 selling points"),
            ResponseSchema(name="objection_handling", description="Common objections and how to handle them"),
            ResponseSchema(name="quiz", description="3-5 question quiz for BAs"),
            ResponseSchema(name="one_pager_content", description="Text for a printable one-pager")
        ]
        self.output_parser = StructuredOutputParser.from_response_schemas(self.response_schemas)

    async def run(self, product_info: str) -> Dict[str, Any]:
        format_instructions = self.output_parser.get_format_instructions()
        prompt = ChatPromptTemplate.from_template(
            "You are a Beauty Education Lead. Generate a comprehensive training package for the following product.\n\n"
            "Product Info: {product_info}\n\n"
            "{format_instructions}"
        )
        chain = prompt | self.llm | self.output_parser
        return await chain.ainvoke({"product_info": product_info, "format_instructions": format_instructions})

class ContentCreationChain:
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(api_key=api_key, model="gpt-4o")
        self.response_schemas = [
            ResponseSchema(name="instagram_caption", description="Engaging IG caption with hashtags"),
            ResponseSchema(name="tiktok_script", description="Short, punchy script for TikTok/Reels"),
            ResponseSchema(name="event_recap_email", description="Email update for the team"),
            ResponseSchema(name="hashtags", description="Strategic list of hashtags")
        ]
        self.output_parser = StructuredOutputParser.from_response_schemas(self.response_schemas)

    async def run(self, event_details: str) -> Dict[str, Any]:
        format_instructions = self.output_parser.get_format_instructions()
        prompt = ChatPromptTemplate.from_template(
            "You are a Beauty Social Media Manager. Create promotional content based on these event details.\n\n"
            "Event Details: {event_details}\n\n"
            "{format_instructions}"
        )
        chain = prompt | self.llm | self.output_parser
        return await chain.ainvoke({"event_details": event_details, "format_instructions": format_instructions})
