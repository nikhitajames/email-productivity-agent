# backend/app/seed.py
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models
from datetime import datetime, timedelta

def init_db():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Create Default Prompts (The "Brain")
    prompts = [
        {
            "prompt_type": "categorize",
            "content": "Categorize the following email into one of these categories: 'Work', 'Personal', 'Spam', 'Newsletter', 'Urgent'. Return only the category name."
        },
        {
            "prompt_type": "extract_actions",
            "content": "Extract action items from the email. Return a valid JSON list where each item has a 'task' and a 'deadline' field. If no tasks, return empty list []."
        },
        {
            "prompt_type": "auto_reply",
            "content": "You are a helpful assistant. Draft a professional and polite reply to this email. If it is a meeting request, ask for an agenda. Keep it concise."
        }
    ]
    
    for p in prompts:
        exists = db.query(models.Prompt).filter_by(prompt_type=p["prompt_type"]).first()
        if not exists:
            db_prompt = models.Prompt(prompt_type=p["prompt_type"], content=p["content"])
            db.add(db_prompt)
    
    # 2. Create Mock Emails (The "Inbox")
    # We create a mix of Work, Spam, and Meeting requests to test the AI later.
    mock_emails = [
        {
            "sender": "boss@company.com",
            "subject": "Project Deadline Urgent",
            "body": "Hi Nikhita, we need to finish the Q3 report by Friday 5 PM. Please send me the draft before then.",
            "timestamp": datetime.utcnow()
        },
        {
            "sender": "newsletter@techweekly.com",
            "subject": "Top 10 AI Tools in 2025",
            "body": "Check out the latest tools in Agentic AI! LangGraph is taking over...",
            "timestamp": datetime.utcnow() - timedelta(hours=2)
        },
        {
            "sender": "hr@company.com",
            "subject": "Meeting: Performance Review",
            "body": "Hi, I would like to schedule your performance review for next Tuesday at 10 AM. Let me know if that works.",
            "timestamp": datetime.utcnow() - timedelta(days=1)
        },
        {
            "sender": "spam@lottery.com",
            "subject": "YOU WON $1,000,000!",
            "body": "Click here to claim your prize now! Urgent!",
            "timestamp": datetime.utcnow() - timedelta(days=2)
        },
         {
            "sender": "client@bigcorp.com",
            "subject": "Contract Revision",
            "body": "Please review the attached contract changes and get back to us by Monday.",
            "timestamp": datetime.utcnow() - timedelta(hours=5)
        }
    ]

    for e in mock_emails:
        # Check if exists to avoid duplicates if run multiple times
        exists = db.query(models.Email).filter_by(subject=e["subject"]).first()
        if not exists:
            email_obj = models.Email(
                sender=e["sender"],
                subject=e["subject"],
                body=e["body"],
                timestamp=e["timestamp"]
            )
            db.add(email_obj)

    db.commit()
    db.close()
    print("Database seeded with Prompts and Mock Emails!")

if __name__ == "__main__":
    init_db()