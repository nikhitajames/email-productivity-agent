# Agentic Email Productivity Assistant

An intelligent, AI-powered email dashboard built with **LangGraph**, **FastAPI**, and **React**. This application ingests a mock inbox, uses an LLM to categorize emails, extract action items, and allows users to "chat" with their emails using RAG (Retrieval Augmented Generation).

## Key Features

- **Agentic Workflow:** Emails are processed through a LangGraph pipeline (Categorize -> Extract -> Draft).
- **Split-View Chat:** Interactive "Talk to Agent" mode to ask questions about specific emails.
- **Configurable "Brain":** Users can edit the system prompts to change the AI's personality or rules.
- **Inline Drafting:** AI auto-drafts replies which users can edit or regenerate.
- **Secure Ingestion:** Simulates a secure login and database reset/ingestion process.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS (Vercel Design System)
- **Backend:** Python (FastAPI)
- **AI/LLM:** LangChain, LangGraph, Groq (Llama-3.3-70b)
- **Database:** SQLite (Local relational DB)

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Activate Virtual Env:
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```
