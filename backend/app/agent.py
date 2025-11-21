import json
import os
from typing import TypedDict, Annotated, List
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
import re

from sqlalchemy.orm import Session
from . import models

load_dotenv()

llm = ChatGroq(
    temperature=0.6, 
    model_name="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

class AgentState(TypedDict):
    email_body: str
    sender: str
    category: str
    action_items: List[dict]
    draft: str
    categorize_prompt: str
    action_prompt: str
    reply_prompt: str


def categorize_node(state: AgentState):
    """Node 1: Determine the category."""
    prompt = state["categorize_prompt"]
    email_text = f"Sender: {state['sender']}\nBody: {state['email_body']}"
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=email_text)
    ]
    response = llm.invoke(messages)
    return {"category": response.content.strip()}

def extract_actions_node(state: AgentState):
    """Node 2: Extract tasks into JSON."""
    prompt = state["action_prompt"]
    # APPEND INSTRUCTION TO FORCE JSON
    strict_prompt = f"{prompt}\n\nIMPORTANT: Return ONLY a valid JSON list. Do not add Markdown formatting. Do not add conversational text. Example: [{{ \"task\": \"...\", \"deadline\": \"...\" }}]"
    
    email_text = state["email_body"]
    
    messages = [
        SystemMessage(content=strict_prompt),
        HumanMessage(content=f"Email: {email_text}")
    ]
    response = llm.invoke(messages)
    
    content = response.content.strip()
    
    try:
        # 1. Try direct parse first
        actions = json.loads(content)
    except json.JSONDecodeError:
        # 2. If that fails, use Regex to find the first JSON list [ ... ]
        # The '?' makes it non-greedy (stops at the first closing bracket)
        match = re.search(r"\[.*?\]", content, re.DOTALL)
        if match:
            try:
                json_str = match.group(0)
                actions = json.loads(json_str)
            except:
                actions = []
        else:
            actions = []
            
    return {"action_items": actions}

def draft_reply_node(state: AgentState):
    """Node 3: Write a reply if necessary."""
    category = state.get("category", "").lower()
    
    if "spam" in category or "newsletter" in category:
        return {"draft": "NO_REPLY_NEEDED"}

    prompt = state["reply_prompt"]
    email_text = state["email_body"]
    
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content=email_text)
    ]
    response = llm.invoke(messages)
    return {"draft": response.content.strip()}


workflow = StateGraph(AgentState)
workflow.add_node("categorize", categorize_node)
workflow.add_node("extract_actions", extract_actions_node)
workflow.add_node("draft_reply", draft_reply_node)
workflow.set_entry_point("categorize")
workflow.add_edge("categorize", "extract_actions")
workflow.add_edge("extract_actions", "draft_reply")
workflow.add_edge("draft_reply", END)

app_graph = workflow.compile()

def process_single_email(email: models.Email, db: Session):
    cat_prompt = db.query(models.Prompt).filter_by(prompt_type="categorize").first()
    act_prompt = db.query(models.Prompt).filter_by(prompt_type="extract_actions").first()
    rep_prompt = db.query(models.Prompt).filter_by(prompt_type="auto_reply").first()

    if not cat_prompt or not act_prompt or not rep_prompt:
        print("Error: Prompts missing in DB. Run seed.py again.")
        return email

    initial_state = {
        "email_body": email.body,
        "sender": email.sender,
        "category": "",
        "action_items": [],
        "draft": "",
        "categorize_prompt": cat_prompt.content,
        "action_prompt": act_prompt.content,
        "reply_prompt": rep_prompt.content
    }

    result = app_graph.invoke(initial_state)
    email.category = result["category"]
    email.action_items = result["action_items"]
    email.suggested_reply = result["draft"]
    
    db.commit()
    db.refresh(email)
    return email


def chat_with_single_email(email_body: str, user_query: str, sender: str, history: list = []):
    # DEBUG PRINT: See if history is arriving
    print(f"DEBUG: Received History length: {len(history)}") 
    if len(history) > 0:
        print(f"DEBUG: Last message in history: {history[-1]}")

    system_prompt = (
        f"You are an intelligent Email Assistant. "
        f"You are discussing an email sent by '{sender}'. "
        f"Answer questions based ONLY on the email content below. "
        f"Maintain context from the conversation history."
        f"\n\n--- EMAIL CONTENT ---\n{email_body}"
    )
    
    messages = [SystemMessage(content=system_prompt)]
    
    # Inject Past Conversation History
    for msg in history:
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            messages.append(AIMessage(content=msg.content))
            
    messages.append(HumanMessage(content=user_query))
    
    response = llm.invoke(messages)
    return response.content