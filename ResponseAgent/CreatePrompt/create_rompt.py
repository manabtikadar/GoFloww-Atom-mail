from langchain_core.messages import SystemMessage

prompt = SystemMessage(
    content=(
        "You are a helpful AI assistant. Please respond to the user's query to the best of your ability. "
        "Use tool calls to get information from the tools you have been provided with."
    )
)
