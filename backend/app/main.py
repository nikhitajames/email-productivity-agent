import hashlib
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from . import models, schemas, database
from .agent import process_single_email, chat_with_single_email, generate_new_email
from .mock_data import get_mock_emails 

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try: yield db
    finally: db.close()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: List[Message] = [] 
    
class SaveDraftRequest(BaseModel):
    content: str

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
    if not db_prompt: raise HTTPException(status_code=404, detail="Prompt not found")
    db_prompt.content = prompt_data.content
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

@app.post("/process-emails/")
def process_all_emails(db: Session = Depends(get_db)):
    """Trigger the categorization/extraction agent."""
    emails = db.query(models.Email).all()
    count = 0
    for email in emails:
        try:
            if email.category == "Uncategorized":
                process_single_email(email, db)
                count += 1
        except Exception as e:
            print(f"Error processing {email.id}: {e}")
            continue
    return {"message": f"Processed {count} emails."}

@app.post("/emails/{email_id}/chat")
def chat_email(email_id: int, chat_req: ChatRequest, db: Session = Depends(get_db)):
    email = db.query(models.Email).filter(models.Email.id == email_id).first()
    if not email: raise HTTPException(status_code=404, detail="Email not found")
    response_text = chat_with_single_email(email.body, chat_req.query, email.sender, chat_req.history)
    return {"response": response_text}

@app.delete("/emails/{email_id}")
def delete_email(email_id: int, db: Session = Depends(get_db)):
    email = db.query(models.Email).filter(models.Email.id == email_id).first()
    if not email: raise HTTPException(status_code=404, detail="Email not found")
    db.delete(email)
    db.commit()
    return {"message": "Email deleted successfully"}

@app.put("/emails/{email_id}/draft")
def save_reply_draft(email_id: int, draft: SaveDraftRequest, db: Session = Depends(get_db)):
    email = db.query(models.Email).filter(models.Email.id == email_id).first()
    if not email: raise HTTPException(status_code=404, detail="Email not found")
    email.suggested_reply = draft.content
    db.commit()
    return {"message": "Draft saved"}

@app.post("/drafts/generate")
def generate_email_endpoint(req: schemas.GenerateRequest, db: Session = Depends(get_db)):
    body = generate_new_email(req.recipient, req.subject, req.instructions, db)
    return {"body": body}

@app.post("/drafts/", response_model=schemas.DraftResponse)
def save_new_draft(draft: schemas.DraftCreate, db: Session = Depends(get_db)):
    db_draft = models.Draft(**draft.dict())
    db.add(db_draft)
    db.commit()
    db.refresh(db_draft)
    return db_draft

@app.get("/drafts/", response_model=List[schemas.DraftResponse])
def get_all_drafts(db: Session = Depends(get_db)):
    try:
        return db.query(models.Draft).order_by(models.Draft.timestamp.desc()).all()
    except Exception as e:
        return []

@app.post("/reset-db")
def reset_database(db: Session = Depends(get_db)):
    """Resets the DB with Mock Data and Default Prompts."""
    try:
        models.Base.metadata.drop_all(bind=database.engine)
        models.Base.metadata.create_all(bind=database.engine)

        default_prompts = [
            {"prompt_type": "categorize", "content": "Categorize the following email into: 'Work', 'Personal', 'Spam', 'Newsletter', 'Urgent'. Return only the single category name."},
            {"prompt_type": "extract_actions", "content": "Extract specific action items (tasks) and soft suggestions (follow-ups) from the email."},
            {"prompt_type": "auto_reply", "content": "You are a professional assistant. Draft a concise, polite reply."}
        ]
        for p in default_prompts:
            db.add(models.Prompt(prompt_type=p["prompt_type"], content=p["content"]))
        db.commit()

        mock_emails = get_mock_emails()
        created_emails = []
        for e in mock_emails:
            email_obj = models.Email(
                sender=e["sender"], subject=e["subject"], body=e["body"], 
                timestamp=e["timestamp"], category="Uncategorized"
            )
            db.add(email_obj)
            created_emails.append(email_obj)
        db.commit()

        print(f"Processing {len(created_emails)} mock emails...")
        for email in created_emails[:3]: 
            db.refresh(email)
            try:
                process_single_email(email, db)
            except Exception as e:
                print(f"Failed to process email {email.id}: {e}")

        return {"message": "Reset complete. Top 3 emails processed."}
    except Exception as e:
        print(f"Reset Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))