from langchain_core.tools import tool
from dotenv import load_dotenv
from langchain.schema import Document
from langchain_core.runnables import RunnableConfig
import uuid
import json
from dotenv import load_dotenv
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from CreateMemory import store, get_user_id
from typing import List
from Refinement_agent import compile_refinement_agent
from ContextReplyAgent import compile_reply_agent
from Composing_mail import compile_generate_agent

load_dotenv()

composing_agent = compile_generate_agent()
reply_agent = compile_reply_agent()
refinement_agent = compile_refinement_agent()

@tool
def save_recall_memory(memory: str, config: RunnableConfig) -> str:
    """Save important email content or responses to memory for later semantic search."""
    user_id = get_user_id(config)
    document = Document(
        page_content=memory, id=str(uuid.uuid4()), metadata={"user_id": user_id}
    )
    store.add_documents([document])
    return memory


@tool
def search_recall_memories(comb_str: str, config: RunnableConfig) -> List[str]:
    """Search and retrieve past saved email conversations or outputs relevant to a given query."""
    user_id = get_user_id(config)

    def _filter_function(doc: Document) -> bool:
        return doc.metadata.get("user_id") == user_id

    documents = store.similarity_search(
        comb_str, k=3, filter=_filter_function
    )
    return [document.page_content for document in documents]

@tool
def refinement_tool(email_input:dict[str,str], query:str, config:RunnableConfig) -> str:
    """Refine a generated email to make it clearer, more polite, or professional based on the query."""
    response = refinement_agent.invoke({
        "email":email_input,
        "query":query
    })

    refined_email = response["refined_email"]
    refined_email_str = json.dumps(refined_email)

    save_recall_memory.invoke({
        "memory":refined_email_str,
        "config":config
    })
    return refined_email_str

@tool
def reply_agent_tool(email_input:dict[str,str], query:str, previous_responses:str, config:RunnableConfig) -> str:
    """Generate a reply to an email by using previous related conversations and refine the response."""
    response = reply_agent.invoke({
        "previous_response": previous_responses,
        "email": email_input,  
        "query": query
    })


    result = response["generate_email"]
    output_str = refinement_tool.invoke({
        "email_input":result,
        "query":query,
        "config":config
    })
    
    email_input_str = json.dumps(email_input)
    combined_str = email_input_str + output_str + previous_responses
    save_recall_memory.invoke({
        "memory":combined_str,
        "config":config
    })
     
    return output_str

@tool
def composing_email_tool(email_details:dict[str,str], query:str, config:RunnableConfig) -> str:
    """Compose a fresh new email based on user intent and message context, then refine it."""
    response = composing_agent.invoke({
        "email":email_details,
        "query":query
    })

    result = response["generate_email"]
    output_str = refinement_tool.invoke({
        "email_input":result,
        "query":query,
        "config":config
    })

    save_recall_memory.invoke({
        "memory":output_str,
        "config":config
    })

    return output_str
