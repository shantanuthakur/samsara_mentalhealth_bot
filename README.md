# 🌿 Samsara — Mental Health Chatbot

An AI-powered mental health support companion built with **FastAPI**, **React**, and **Qdrant** vector database. Uses RAG (Retrieval-Augmented Generation) to provide empathetic, evidence-based responses strictly grounded in professional counseling literature.

---

## 📂 Project Structure

```
samsara_mentalhealth_bot/
│
├── backend/                      # Python FastAPI Backend
│   ├── .env                      # Backend API keys & ports (create this)
│   ├── seed.py                   # ⭐ DB Initialization Script (Run First)
│   ├── app.py                    # ⭐ API Server (Run Second)
│   ├── requirements.txt          # Python dependencies
│   │
│   ├── src/                      # Core backend modules
│   │   ├── config.py             # Environment config & logging setup
│   │   ├── database.py           # Qdrant client & collection initialization
│   │   ├── embeddings.py         # OpenAI embedding generation
│   │   ├── generate.py           # LLM response generation & prompt engineering
│   │   ├── retrieve.py           # Semantic search against Qdrant
│   │   └── seed.py               # Data ingestion pipeline logic
│   │
│   ├── data/                     
│   │   └── chunks.json           # 917 mental health knowledge chunks
│   │
│   ├── qdrant_db/                # Local vector database (auto-created)
│   │   └── qdrant.log            # Database operations log
│   └── logs/
│       └── app.log               # Main application logs (auto-created)
│
└── frontend/                     # React + Vite Frontend
    ├── .env                      # Frontend API URLs & ports (create this)
    ├── package.json              # Node dependencies
    ├── vite.config.js            # Vite bundler configuration
    ├── public/
    │   └── monk.png              # App icon
    └── src/
        ├── App.jsx               # Main React Application
        ├── pages/
        │   ├── Onboarding.jsx    # User profile form (Name, Age, Gender)
        │   └── ChatPage.jsx      # Chat interface & API integration
        └── components/
            ├── Sidebar.jsx
            └── ChatBubble.jsx
```

---

## 🚀 Deployment Guide 

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API Key

### 1. Environment Variables Setup

You must create two separate `.env` files before running the application.

**Backend `.env`** (`backend/.env`):
```env
OPENAI_API_KEY=your_openai_api_key_here
COLLECTION_NAME=rag_chunks
VECTOR_SIZE=1536
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini
BACKEND_PORT=4000
FRONTEND_PORT=3000
```

**Frontend `.env`** (`frontend/.env`):
```env
VITE_PORT=3000
VITE_API_URL=http://localhost:4000
```

---

### 2. Backend & Database Setup

The backend uses a local, file-based Qdrant database, so no Docker container is required.

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# Install dependencies
pip3 install -r requirements.txt

# ⭐ STEP 1: Seed the Database
# Run this ONCE to process chunks.json and populate the Qdrant DB.
python3 seed.py

# ⭐ STEP 2: Start the API Server
# This starts the FastAPI server on the port defined in backend/.env
python3 app.py
```

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will be available at **http://localhost:3000** (or whatever port is in `frontend/.env`).

---

## 🔌 API Endpoints

The backend server exposes the following REST API endpoints:

### 1. Health Check
`GET /api/health`
Used to verify the server is running.
**Response:**
```json
{
    "status": "healthy",
    "service": "Samsara Mental Health Chatbot",
    "version": "1.0.0"
}
```

### 2. Chat (RAG Pipeline)
`POST /api/chat`
Processes user messages, queries the Qdrant database for mental health context, and returns an empathetic response using OpenAI. It strictly rejects non-mental health questions.

**Request:**
```json
{
  "message": "I've been feeling overwhelmed lately.",
  "user_profile": {
    "name": "Alex",
    "age": 28,
    "gender": "Non-binary"
  },
  "conversation_history": []
}
```

**Response:**
```json
{
  "response": "Hello Alex. I hear you... [AI generated empathetic response based on literature]",
  "status": "success"
}
```

---

## ⚙️ Architecture Notes
* **Strict Grounding:** The AI prompt is strictly instructed to *only* answer mental health questions based on the seeded Qdrant database. If asked about unrelated topics (like coding or math), it will politely decline.
* **State Management:** Chat history (last 8 messages) and user profiles are stored in the browser's `localStorage` to ensure persistence across page reloads without requiring a backend SQL database.
* **Logging:** Comprehensive logs are maintained in `backend/logs/app.log` and `backend/qdrant_db/qdrant.log`.
