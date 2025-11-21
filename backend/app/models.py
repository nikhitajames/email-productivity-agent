from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, index=True)
    subject = Column(String)
    body = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    
  
    category = Column(String, default="Uncategorized") 
    action_items = Column(JSON, default=[])            
    suggested_reply = Column(Text, nullable=True)      
    
class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    prompt_type = Column(String, unique=True) 
    content = Column(Text)                   
    last_updated = Column(DateTime, default=datetime.utcnow)