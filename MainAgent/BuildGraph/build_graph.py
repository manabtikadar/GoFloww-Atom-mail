from langgraph.graph import START, StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
# import sys
# import os
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(_file_), '..')))
from CreateNode import AgentState, load_memories, agent, should_continue, tool_node
from langchain_core.runnables import RunnableConfig

def compile_agent():
    builder = StateGraph(AgentState)
    builder.add_node("load_memories", load_memories)
    builder.add_node("Model_generative_Agent", agent)
    builder.add_node("Agent_tools", tool_node)

    builder.add_edge(START, "load_memories")
    builder.add_edge("load_memories", "Model_generative_Agent")
    builder.add_conditional_edges(
                                  "Model_generative_Agent", 
                                  should_continue, 
                                  {
                                    "continue":"Agent_tools",
                                    "end": END
                                  }
                                  )
    builder.add_edge("Agent_tools", "Model_generative_Agent")

    memory = MemorySaver()
    return builder.compile(checkpointer=memory)



# from langgraph.graph import START, StateGraph, END
# from langgraph.checkpoint.memory import MemorySaver
# from CreateNode import AgentState, load_memories, agent, should_continue, tool_node,retry_last_tool,check_satisfaction,get_user_feedback
# from langchain_core.runnables import RunnableConfig

# def compile_agent():
#     builder = StateGraph(AgentState)

#     builder.add_node("load_memories", load_memories)
#     builder.add_node("Model_generative_Agent", agent)
#     builder.add_node("Agent_tools", tool_node)
#     builder.add_node("get_user_feedback", get_user_feedback)
#     builder.add_node("retry_last_tool", retry_last_tool)
#     builder.add_node("check_satisfaction", check_satisfaction)

#     builder.add_edge(START, "load_memories")
#     builder.add_edge("load_memories", "Model_generative_Agent")
    
#     builder.add_conditional_edges(
#         "Model_generative_Agent",
#         should_continue,
#         {
#             "continue": "Agent_tools",
#             "end": "get_user_feedback"
#         }
#     )

#     builder.add_edge("get_user_feedback", "check_satisfaction")

#     builder.add_conditional_edges(
#         "check_satisfaction",
#         check_satisfaction,
#         {
#             "end": END,
#             "rewrite": "retry_last_tool"
#         }
#     )

#     builder.add_edge("Agent_tools", "Model_generative_Agent")
#     builder.add_edge("retry_last_tool", "get_user_feedback")

#     memory = MemorySaver()
#     return builder.compile(checkpointer=memory)

