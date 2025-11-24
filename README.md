Effortless Inbox - AI Email Agent with RAG

Welcome to Effortless Inbox, an intelligent email productivity agent designed to categorize emails, extract actionable tasks, and draft automated replies using LLMs (LangGraph + Groq/OpenAI) and Retrieval-Augmented Generation (RAG) for context-aware assistance.

Table of Contents

System Requirements
Installation & Setup
Running the Application
Features & Usage
Loading the Mock Inbox
Configuring Prompts
Drafting & Sending
Troubleshooting

System Requirements

Python 3.10+

Node.js 16+

Groq API Key (Primary LLM) or OpenAI API Key (Fallback)

Installation & Setup

1. Backend Setup (FastAPI + LangGraph + ChromaDB)

Navigate to the backend directory, set up the virtual environment, and install dependencies.

cd backend

# Create virtual environment named 'email_agent'

python -m venv email_agent

# Activate the environment

# On Windows:

email_agent\Scripts\activate

# On macOS/Linux:

source email_agent/bin/activate

# Install dependencies (including new RAG libraries)

pip install -r requirements.txt

Configure Environment Variables:
Create a .env file in the backend/app directory (or root backend folder depending on your structure) and add your API keys:

GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

2. Frontend Setup (React + Tailwind)

Navigate to the frontend directory and install Node dependencies.

cd frontend
npm install

Running the Application

You need to run the Backend and Frontend in two separate terminals.

Terminal 1: Backend

Make sure your email_agent venv is activated.

cd backend
uvicorn app.main:app --reload

The backend will start at http://127.0.0.1:8000

Terminal 2: Frontend

cd frontend
npm run dev

The frontend will usually start at http://localhost:5173

Features & Usage

Loading the Mock Inbox (Ingestion Pipeline)

Open the application in your browser (http://localhost:5173).

You will see a Login Screen.

Enter any dummy username and password (e.g., admin / password).

Clicking "Login" triggers the full ingestion pipeline:

Resets the local SQL database (sql_app.db).

Ingests all emails into the Vector Database (ChromaDB) for RAG retrieval.

Loads rich Mock Emails (Work, Personal, Spam).

Runs the AI Agent to categorize and process the top emails immediately.

Configuring Prompts (The "Brain")

The agent's behavior is customizable via the "Brain" panel.

Click the Brain (Settings) icon in the top-right of the dashboard.

You will see three modifiable system prompts:

Categorization Prompt: Rules for sorting emails.

Action Extraction Prompt: Instructions for identifying tasks (returns strict JSON).

Auto-Reply Prompt: Style guide for generating drafts.

Click "Save & Apply" to update the database and re-process your inbox.

Drafting & Sending (Context-Aware)

Reply to an Email:

Select an email from the inbox list.

Click the "Draft Response" button.

The AI will generate a reply using:

The current email's content.

RAG Context: Relevant information retrieved from other emails in your inbox (e.g., checking deadlines discussed in previous threads).

Edit the text if needed and click "Send". This saves the email to your Drafts folder.

Compose New Email:

Click the "+" icon in the sidebar.

Enter "To", "Subject", and a short instruction.

Click "Auto-Write". The agent searches your inbox history for context to help write the email.

Click "Send" to save it to your Outbox/Drafts list.

Troubleshooting

Backend Error: Ensure uvicorn is running, the email_agent venv is activated, and you have a valid .env file.

RAG/Memory Issues: If the agent isn't remembering past emails, delete the backend/chroma_db folder and restart the backend to force a clean re-ingestion.

Empty Dashboard: Try refreshing the page or clicking "Logout" and logging back in. This triggers the reset-db endpoint to repopulate mock data and vector embeddings.
