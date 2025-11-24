Inbox Manager- An email organizer and assistant designed to categorize emails, extract actionable tasks, and draft automated replies using LLMs and the Langraph/Langchain Frameworks.

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

1. Backend Setup (FastAPI + LangGraph)

Navigate to the backend directory, set up the virtual environment, and install dependencies.

cd backend

# Create virtual environment named 'email_agent'

python -m venv email_agent

# Activate the environment

# On Windows:

email_agent\Scripts\activate

# On macOS/Linux:

source email_agent/bin/activate

# Install dependencies from requirements.txt

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

Loading the Mock Inbox

Open the application in your browser (http://localhost:5173).

You will see a Login Screen.

Enter any dummy username and password (e.g., admin / password).

Clicking "Login" automatically:

Resets the local database (sql_app.db).

Loads a set of rich Mock Emails (Work, Personal, Spam, Newsletters).

Runs the AI Agent to categorize and process the top 3 emails immediately.

Configuring Prompts (The "Brain")

The agent's behavior is customizable via the "Brain" panel.

Click the Brain (Settings) icon in the top-right of the dashboard.

You will see three modifiable system prompts:

Categorization Prompt: Rules for sorting emails (e.g., "Mark all emails from 'hr@globex.com' as 'Urgent'").

Action Extraction Prompt: Instructions for identifying tasks (e.g., "Extract deadlines and calendar invites").

Auto-Reply Prompt: Style guide for generating drafts (e.g., "Be professional but brief").

Click "Save & Apply" to update the database and re-process your inbox with the new logic.

Drafting & Sending

Reply to an Email:

Select an email from the inbox list.

Click the "Draft Response" button.

The AI will generate a reply contextually based on the email body and your "Auto-Reply Prompt".

Edit the text if needed and click "Send". This creates a record in your Drafts folder.

Compose New Email:

Click the "+" icon in the sidebar.

Enter "To", "Subject", and a short instruction (e.g., "Ask for a sick leave for tomorrow").

Click "Auto-Write" to let the AI generate the body.

Click "Send" to save it to your Outbox/Drafts list.

Troubleshooting

Backend Error: Ensure uvicorn is running, the email_agent venv is activated, and you have a valid .env file.

Empty Dashboard: Try refreshing the page or clicking "Logout" and logging back in. This triggers the reset-db endpoint to repopulate mock data.

JSON Errors: If the Agent fails to process an email, check the console logs in the backend terminal. The agent includes fallback mechanisms to handle malformed JSON from the LLM.
