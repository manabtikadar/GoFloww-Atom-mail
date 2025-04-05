import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ComposingGenerator import email_generation_chain, EmailOutput
from Classifier import email_type_router_chain

from typing_extensions import TypedDict
from langgraph.types import Command
from typing import Literal
from langgraph.graph import END
import json

class AgentState(TypedDict):
    """Agent state representation."""
    email: dict[str,str]
    query: str
    email_type: str
    generate_email: dict[str,str] 

def generate_email(state: AgentState) -> Command:
    """Generate email using the email generation chain."""
  
    result = email_generation_chain.invoke({
        "email_type":state["email_type"],
        "email": state["email"],
        "query": state["query"],
    })
    
    response_data = json.loads(result.additional_kwargs['function_call']['arguments'])
    ordered_output = EmailOutput(**response_data).model_dump()

    return {
        **state,
        "generate_email": ordered_output}

def Email_Type_Router(state: AgentState) -> Command:
    """Route email type using the email classifier chain."""
    result = email_type_router_chain.invoke({
      "query":state["query"]
    })
    
    response_data = result.additional_kwargs['tool_calls'][0]['function']['arguments']

    return {
        **state,
        "email_type": response_data} 