from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PromptBase(BaseModel):
    prompt_type: str
    content: str

class PromptCreate(PromptBase):
    pass

class PromptResponse(PromptBase):
    id: int
    class Config:
        from_attributes = True

class EmailBase(BaseModel):
    sender: str
    subject: str
    body: str

class EmailResponse(EmailBase):
    id: int
    timestamp: datetime
    category: str
    action_items: Optional[Dict[str, Any]] = {} 
    suggested_reply: Optional[str] = None
    
    class Config:
        from_attributes = True

class DraftBase(BaseModel):
    recipient: str
    subject: str
    body: str

class DraftCreate(DraftBase):
    pass

class DraftResponse(DraftBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class GenerateRequest(BaseModel):
    recipient: str
    subject: str
    instructions: str