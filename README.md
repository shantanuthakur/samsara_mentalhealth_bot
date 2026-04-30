# 🌿 Samsara — Mental Health Chatbot

An AI-powered mental health support companion built with **FastAPI**, **React**, and **Qdrant** vector database. Uses RAG (Retrieval-Augmented Generation) to provide empathetic, evidence-based responses grounded in professional counseling literature.

---

## 📂 Project Structure

```
samsara_mentalhealth_bot/
│
├── backend/
│   ├── .env                      # API keys (create this — see below)
│   ├── seed.py                   # Step 1 ⭐ Run this first to seed the database
│   ├── app.py                    # Step 2 ⭐ Run this to start the API server
│   ├── requirements.txt          # Python dependencies
│   │
│   ├── src/                      # Core application modules
│   │   ├── config.py             # Environment config & logging
│   │   ├── database.py           # Qdrant client & collection setup
│   │   ├── embeddings.py         # OpenAI embedding generation
│   │   ├── generate.py           # LLM response generation (RAG)
│   │   ├── retrieve.py           # Semantic search against Qdrant
│   │   └── seed.py               # Data ingestion pipeline logic
│   │
│   ├── data/
│   │   └── chunks.json           # 917 mental health knowledge chunks
│   │
│   ├── qdrant_db/                # Local vector database (auto-created after seeding)
│   └── logs/
│       └── app.log               # Application logs (auto-created)
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   └── monk.png              # App icon
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── App.css
        ├── pages/
        │   ├── Onboarding.jsx    # User profile form
        │   └── ChatPage.jsx      # Chat interface
        └── components/
            ├── Sidebar.jsx
            └── ChatBubble.jsx
```

---

## 🚀 Deployment Guide (For Team Lead)

### Prerequisites

- Python 3.10+
- Node.js 18+
- OpenAI API Key

---

### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python3 -m venv .venv

# 2. Activate it
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# 3. Install all dependencies
pip3 install -r requirements.txt

# 4. Create .env file with your API key
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
COLLECTION_NAME=rag_chunks
VECTOR_SIZE=1536
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini
EOF

# 5. Seed the database (run ONCE — stores all book data into Qdrant)
python3 seed.py

# 6. Start the API server (port 4000)
python3 app.py
```

| File | Purpose |
|------|---------|
| `seed.py` | Seeds 917 mental health chunks into Qdrant DB. Run **once**. |
| `app.py` | Starts the FastAPI server on port **4000**. Run after seeding. |

---

### Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chat` | Send message, get AI response |

### Chat Request

```json
POST http://localhost:4000/api/chat
{
  "message": "I've been feeling anxious lately",
  "user_profile": { "name": "John", "age": 25, "gender": "Male" },
  "conversation_history": []
}
```

---

## ⚙️ Configuration

| Setting | Value |
|---------|-------|
| Backend Port | `4000` |
| Frontend Port | `3000` |
| Database | Local Qdrant (file-based, no Docker) |
| Logs | `backend/logs/app.log` |
| Chat History | Last 8 messages sent as context |
| User Data | Browser `localStorage` |
