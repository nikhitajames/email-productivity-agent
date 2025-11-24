# Effortless Inbox - AI Email Agent with RAG

welcome to effortless inbox, an intelligent email productivity agent designed to categorize emails, extract actionable tasks, and draft automated replies using llms (langgraph + groq/openai) and retrieval-augmented generation (rag) for context-aware assistance.

## Table of contents

system requirements

installation & setup

running the application

features & usage

loading the mock inbox

configuring prompts

drafting & sending

troubleshooting

## System requirements

python 3.10+

node.js 16+

groq api key (primary llm) or openai api key (fallback)

## Installation & setup

### 1. backend setup (fastapi + langgraph + chromadb)

navigate to the backend directory, set up the virtual environment, and install dependencies.

cd backend

### create virtual environment named 'email_agent'
python -m venv email_agent

### activate the environment
on windows:
email_agent\Scripts\activate
on macos/linux:
source email_agent/bin/activate

### install dependencies (including new rag libraries)
pip install -r requirements.txt


### configure environment variables:
create a .env file in the backend/app directory (or root backend folder depending on your structure) and add your api keys:

GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here


### 2. frontend setup (react + tailwind)

### navigate to the frontend directory and install node dependencies.

cd frontend
npm install



## Running the application

you need to run the backend and frontend in two separate terminals.

### terminal 1: backend

make sure your email_agent venv is activated.

cd backend
uvicorn app.main:app --reload


the backend will start at http://127.0.0.1:8000

### terminal 2: frontend

cd frontend
npm run dev

the frontend will usually start at http://localhost:5173

## Features & usage

### loading the mock inbox (ingestion pipeline)

open the application in your browser (http://localhost:5173).

you will see a login screen.

enter any dummy username and password (e.g., admin / password).

clicking "login" triggers the full ingestion pipeline:

resets the local sql database (sql_app.db).

ingests all emails into the vector database (chromadb) for rag retrieval.

loads rich mock emails (work, personal, spam).

runs the ai agent to categorize and process the top emails immediately.

### configuring prompts (the "brain")

the agent's behavior is customizable via the "brain" panel.

click the brain (settings) icon in the top-right of the dashboard.

you will see three modifiable system prompts:

categorization prompt: rules for sorting emails.

action extraction prompt: instructions for identifying tasks (returns strict json).

auto-reply prompt: style guide for generating drafts.

click "save & apply" to update the database and re-process your inbox.

### drafting & sending (context-aware)

reply to an email:

select an email from the inbox list.

click the "draft response" button.

the ai will generate a reply using:

the current email's content.

rag context: relevant information retrieved from other emails in your inbox (e.g., checking deadlines discussed in previous threads).

edit the text if needed and click "send". this saves the email to your drafts folder.

### compose new email:

click the "+" icon in the sidebar.

enter "to", "subject", and a short instruction.

click "auto-write". the agent searches your inbox history for context to help write the email.

click "send" to save it to your outbox/drafts list.

## Troubleshooting

backend error: ensure uvicorn is running, the email_agent venv is activated, and you have a valid .env file.

rag/memory issues: if the agent isn't remembering past emails, delete the backend/chroma_db folder and restart the backend to force a clean re-ingestion.

empty dashboard: try refreshing the page or clicking "logout" and logging back in. this triggers the reset-db endpoint to repopulate mock data and vector embeddings.
