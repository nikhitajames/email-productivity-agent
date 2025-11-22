import hashlib
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Relative imports
from . import models, schemas, database
from .agent import process_single_email, chat_with_single_email
from .mock_data import get_mock_emails 

# 1. Database Setup
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# 2. CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- REQUEST MODELS ---
class Message(BaseModel):
    role: str
    content: str

# ONLY ONE DEFINITION OF CHATREQUEST ALLOWED
class ChatRequest(BaseModel):
    query: str
    history: List[Message] = [] 

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Email Productivity Agent API is running"}

@app.get("/emails/", response_model=List[schemas.EmailResponse])
def read_emails(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    emails = db.query(models.Email).order_by(models.Email.timestamp.desc()).offset(skip).limit(limit).all()
    return emails

@app.get("/prompts/", response_model=List[schemas.PromptResponse])
def read_prompts(db: Session = Depends(get_db)):
    prompts = db.query(models.Prompt).all()
    return prompts

@app.put("/prompts/{prompt_id}", response_model=schemas.PromptResponse)
def update_prompt(prompt_id: int, prompt_data: schemas.PromptCreate, db: Session = Depends(get_db)):
    db_prompt = db.query(models.Prompt).filter(models.Prompt.id == prompt_id).first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    db_prompt.content = prompt_data.content
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

@app.post("/process-emails/")
def process_all_emails(db: Session = Depends(get_db)):
    emails = db.query(models.Email).all()
    count = 0
    for email in emails:
        try:
            process_single_email(email, db)
            count += 1
        except Exception as e:
            print(f"Error processing email {email.id}: {e}")
            continue
    return {"message": f"Processed {count} emails."}

@app.post("/emails/{email_id}/chat")
def chat_email(email_id: int, chat_req: ChatRequest, db: Session = Depends(get_db)):
    email = db.query(models.Email).filter(models.Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Call the Agent Logic WITH HISTORY
    response_text = chat_with_single_email(
        email_body=email.body, 
        user_query=chat_req.query,
        sender=email.sender,
        history=chat_req.history 
    )
    
    return {"response": response_text}

# --- IMPROVED RESET ENDPOINT ---
@app.post("/reset-db")
def reset_database(db: Session = Depends(get_db)):
    """
    Wipes DB, Re-seeds Prompts, Creates realistic mock emails, AND runs the agent.
    """
    try:
        # 1. Clear Old Data (Emails AND Prompts)
        db.query(models.Email).delete()
        db.query(models.Prompt).delete()
        db.commit()

        # 2. Seed Default Prompts (The "Brain")
        # These are the instructions the Agent uses.
        default_prompts = [
            {
                "prompt_type": "categorize",
                "content": "Categorize the following email into one of these categories: 'Work', 'Personal', 'Spam', 'Newsletter', 'Urgent'. Return only the category name."
            },
            {
                "prompt_type": "extract_actions",
                "content": "Extract action items and suggestions from the email."
            },
            {
                "prompt_type": "auto_reply",
                "content": "You are a helpful assistant. Draft a professional and polite reply to this email. If it is a meeting request, ask for an agenda. Keep it concise."
            }
        ]
        
        for p in default_prompts:
            db_prompt = models.Prompt(prompt_type=p["prompt_type"], content=p["content"])
            db.add(db_prompt)
        db.commit()

        # 3. Load Rich Mock Data from file
        mock_emails = get_mock_emails()

        created_emails = []
        for e in mock_emails:
            email_obj = models.Email(
                sender=e["sender"],
                subject=e["subject"],
                body=e["body"],
                timestamp=e["timestamp"],
                category="Uncategorized"
            )
            db.add(email_obj)
            created_emails.append(email_obj)
        
        db.commit()

        # 4. TRIGGER AGENT IMMEDIATELY
        for email in created_emails:
            db.refresh(email)
            process_single_email(email, db)

        return {"message": "Inbox reset, Prompts seeded, and AI processing complete."}
        
    except Exception as e:
        print(f"Reset Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/emails/{email_id}")
def delete_email(email_id: int, db: Session = Depends(get_db)):
    email = db.query(models.Email).filter(models.Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    db.delete(email)
    db.commit()
    return {"message": "Email deleted successfully"}