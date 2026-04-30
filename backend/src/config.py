import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend/ directory (same level as app.py)
BACKEND_DIR = Path(__file__).resolve().parent.parent
env_path = BACKEND_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    # Fallback: try project root
    root_env = BACKEND_DIR.parent / ".env"
    if root_env.exists():
        load_dotenv(root_env)
    else:
        load_dotenv()

# Logging Configuration — logs saved to backend/logs/app.log
log_dir = BACKEND_DIR / "logs"
log_dir.mkdir(exist_ok=True)
log_file = log_dir / "app.log"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    QDRANT_PATH = str(BACKEND_DIR / "qdrant_db")
    COLLECTION_NAME = os.getenv("COLLECTION_NAME", "rag_chunks")
    VECTOR_SIZE = int(os.getenv("VECTOR_SIZE", "1536"))
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
    BACKEND_PORT = int(os.getenv("BACKEND_PORT", "4000"))
    FRONTEND_PORT = int(os.getenv("FRONTEND_PORT", "3000"))

    @classmethod
    def validate(cls):
        """Validates that all required configuration variables are present."""
        if not cls.OPENAI_API_KEY or cls.OPENAI_API_KEY == "your_openai_api_key_here":
            logger.error("OPENAI_API_KEY is not set correctly in environment variables.")
            raise ValueError("OPENAI_API_KEY is required. Please check your .env file.")
