# Enterprise-Grade RAG Chatbot Engine

This project contains a production-ready, highly modular system for building and querying a Retrieval-Augmented Generation (RAG) agent. It employs **Qdrant** as the vector database and **OpenAI** block models for embeddings and generative responses. 

## 📂 Project Structure

The project has been refactored into a scalable and robust standard folder structure appropriate for heavy production environments and enterprise usage:

```text
.
├── src/
│   ├── __init__.py
│   ├── config.py         # Standardized ENV configurations & validations
│   ├── database.py       # Manages Qdrant DB connection & abstraction layer
│   ├── embeddings.py     # OpenAI embedding client initialization wrapper
│   ├── seed.py           # Ingestion pipeline batch processing & indexing
│   ├── retrieve.py       # Core semantic retrieval logic 
│   └── generate.py       # Response generation and RAG templating
├── tests/
│   ├── __init__.py
│   ├── test_embedding.py # Sanity checks for embedding functionality
│   └── test_qdrant.py    # Health-checks for Vector Database availability
├── data/                 # Data repository
│   ├── chunks.json       # Example ingested chunks payload
│   └── ...               # (Optional) Original textual/PDF resources
├── main.py               # Main Entrypoint CLI runner 
├── requirements.txt      # Dependency specification file
├── .env.example          # Environment variables example
└── README.md             # Standard Documentation
```

---

## 🚀 Beginner's Quick Start Guide

Welcome! If you are new to the project, follow these step-by-step instructions in exact sequence to quickly get the engine running.

### 1️⃣ Prerequisites
Make sure you have:
1. **Python 3.10+** installed.
2. A running instance of **Qdrant DB**. 
   - *Via Docker:* `docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant`
3. An **OpenAI API Key**.

### 2️⃣ Virtual Environment & Installation
Open your terminal inside the project root directory and run:

```bash
# 1. Create a virtual environment (Good practice to isolate dependencies)
python -m venv .venv

# 2. Activate the virtual environment
# For Windows:
.venv\Scripts\activate
# For macOS/Linux:
source .venv/bin/activate

# 3. Install packages
pip install -r requirements.txt
```

### 3️⃣ Configuration (`.env`)
You should never hardcode your API keys in code! We configure our tool using an environment file.

1. Ensure the `.env` file exists in the root folder. If it does not, you can copy the `.env.example` file and rename it to `.env`.
2. Inside `.env`, paste your private `OPENAI_API_KEY`:

```properties
OPENAI_API_KEY=your-actual-api-key-here
QDRANT_HOST=localhost
QDRANT_PORT=6333
COLLECTION_NAME=rag_chunks
```

### 4️⃣ Sequence of Execution

You interact with the application through the powerful centralized CLI, `main.py`.

#### **Step A: Seed the Data to Qdrant (Ingestion)**
Before conversing, the system must index the knowledge base (chunks). Run this once whenever new data is added:
```bash
python main.py --seed
```
*Behind the scenes*: This loads `data/chunks.json`, converts the text chunks into dense numeric arrays (embeddings) using OpenAI, and saves them strategically into your Qdrant vector database.

#### **Step B: Start Chatting!**
Once data is seeded, you can converse with the AI contextualized entirely upon your dataset.
```bash
python main.py --chat
```
*Behind the scenes*: When you ask questions, the agent semantically retrieves the most closely matching context from Qdrant, and pushes that contextual block to a Large Language Model to articulate a well-informed, targeted response.

---

## 🧪 Testing

To ensure the microservices (DB, Embedding API) are functioning correctly before proceeding, run the tests:

```bash
python tests/test_embedding.py
python tests/test_qdrant.py
```
*(Optionally you can run all tests if you decide to execute `pytest` against the `tests/` directory).*

--

## 🛡️ Professional/Production Improvements
Why is this organized this way?
- **Security:** API keys are never hardcoded inside `seed.py` or `generate.py`. We use `.dotenv` variables.
- **Maintainability:** Distinct domains of concern are refactored into discrete files (`database.py`, `retrieve.py`, etc.).
- **Scalability:** The `Config` Object acts as the single source-of-truth ensuring configuration validation early in execution.
- **Resiliency:** Logging mechanisms are provided via the standardized `logging` module over simple un-captured `print()` statements. Fallbacks and exceptions are carefully handled without crashing unexpectedly.
