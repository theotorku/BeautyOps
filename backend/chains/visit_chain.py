from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from typing import Dict, Any

class StoreVisitChain:
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(api_key=api_key, model="gpt-4o")
        
        # Define the structure of the AI report
        self.response_schemas = [
            ResponseSchema(name="summary", description="Concise summary of the store visit"),
            ResponseSchema(name="inventory_issues", description="List of inventory issues found"),
            ResponseSchema(name="training_needs", description="Specific training needs for the beauty advisors"),
            ResponseSchema(name="opportunities", description="Growth opportunities identified"),
            ResponseSchema(name="action_items", description="List of follow-up tasks"),
            ResponseSchema(name="follow_up_email", description="A draft email to the store manager")
        ]
        self.output_parser = StructuredOutputParser.from_response_schemas(self.response_schemas)

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
