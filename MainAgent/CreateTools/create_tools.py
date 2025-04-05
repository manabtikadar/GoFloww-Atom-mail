from langchain_core.tools import tool
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableConfig
import uuid
from dotenv import load_dotenv
from CreateMemory import store, get_user_id
from typing import List
from Refinement_agent import compile_refinement_agent
load_dotenv()

refinement_agent = compile_refinement_agent()

@tool
def save_recall_memory(memory: str, config: RunnableConfig) -> str:
    """Save memory to vectorstore for later semantic retrieval."""
    user_id = get_user_id(config)
    document = Document(
        page_content=memory, id=str(uuid.uuid4()), metadata={"user_id": user_id}
    )
    store.add_documents([document])
    return memory


@tool
def search_recall_memories(comb_str: str, config: RunnableConfig) -> List[str]:
    """Search for relevant memories."""
    user_id = get_user_id(config)

    def _filter_function(doc: Document) -> bool:
        return doc.metadata.get("user_id") == user_id

    documents = store.similarity_search(
        comb_str, k=3, filter=_filter_function
    )
    return [document.page_content for document in documents]

@tool
def refinement_tool(email_input:dict[str,str],query:str,config:RunnableConfig):
    response = refinement_agent.invoke({
        
    })

