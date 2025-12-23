from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
import pandas as pd
from typing import Dict, Any, List
import io

class POSAnalysisChain:
    def __init__(self, api_key: str):
        self.llm = ChatOpenAI(api_key=api_key, model="gpt-4o")
        self.response_schemas = [
            ResponseSchema(name="top_sellers", description="List of top selling products"),
            ResponseSchema(name="slow_movers", description="List of slow moving products"),
            ResponseSchema(name="shade_gaps", description="Identification of missing or low-stock shades"),
            ResponseSchema(name="trends", description="Week-over-week or monthly trends observed"),
            ResponseSchema(name="recommendations", description="Strategic recommendations for the store")
        ]
        self.output_parser = StructuredOutputParser.from_response_schemas(self.response_schemas)

    async def run(self, data_summary: str) -> Dict[str, Any]:
        format_instructions = self.output_parser.get_format_instructions()
        
        prompt = ChatPromptTemplate.from_template(
            "You are a Retail Data Analyst for a premium beauty brand. "
            "Analyze the following POS data summary and provide strategic insights.\n\n"
            "Data Summary: {data_summary}\n\n"
            "{format_instructions}"
        )
        
        chain = prompt | self.llm | self.output_parser
        response = await chain.ainvoke({
            "data_summary": data_summary,
            "format_instructions": format_instructions
        })
        return response

    def summarize_csv(self, file_content: bytes) -> str:
        # Basic pandas summary to feed into LLM
        df = pd.read_csv(io.BytesIO(file_content))
        return df.describe().to_string() + "\n\n" + df.head(10).to_string()
