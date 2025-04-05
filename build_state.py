from typing_extensions import TypedDict
from langgraph.types import Command
from typing import Literal
from langgraph.graph import END
import json
from typing import Annotated, Sequence, List
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from Router import triage_router_chain,TriageRouter
from dotenv import load_dotenv

load_dotenv()

class GraphState(TypedDict):
    email_input: dict
    classification: str
    recall_memories: List[str]
    messages: Annotated[Sequence[BaseMessage], add_messages]


def triage_router(state: GraphState)-> GraphState:
    email = state["email_input"]
    result = triage_router_chain.invoke({"email": email})
    parsed = TriageRouter(**result.tool_calls[0]["args"]).model_dump()
    response = parsed["classification"]
    return {
        **state,
        "classification":response
    }

def decide_to_triage(state: GraphState) -> str:
    response = state["classification"]
    if response == "Respond":
        print(" Classification: RESPOND - This email requires a response")
        return "response-agent"
    elif response == "Ignore":
        print(" Classification: IGNORE - This email can be safely ignored")
        return "end"
    elif response == "Notify":
        print(" Classification: NOTIFY - This email contains important information")
        return "notify"
    else:
        raise ValueError(f"Invalid classification: {response}")