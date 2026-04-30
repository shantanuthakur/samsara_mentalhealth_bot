import logging
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from src.config import Config, logger

# ─── Qdrant-specific logger → writes to qdrant_db/qdrant.log ─────────────────
qdrant_log_dir = Path(Config.QDRANT_PATH)
qdrant_log_dir.mkdir(exist_ok=True)
qdrant_log_file = qdrant_log_dir / "qdrant.log"

qdrant_logger = logging.getLogger("qdrant")
qdrant_logger.setLevel(logging.INFO)
_fh = logging.FileHandler(qdrant_log_file)
_fh.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
qdrant_logger.addHandler(_fh)


def get_qdrant_client() -> QdrantClient:
    """
    Initializes and returns the Qdrant Client (local file-based).
    
    Returns:
        QdrantClient: The configured Qdrant client instance.
    """
    try:
        client = QdrantClient(path=Config.QDRANT_PATH)
        qdrant_logger.info(f"Connected to local Qdrant at {Config.QDRANT_PATH}")
        return client
    except Exception as e:
        qdrant_logger.error(f"Failed to connect to Qdrant at {Config.QDRANT_PATH}. Error: {e}")
        logger.error(f"Failed to connect to local Qdrant at {Config.QDRANT_PATH}. Error: {e}")
        raise


def initialize_collection(client: QdrantClient):
    """
    Creates the Qdrant collection if it does not already exist.
    
    Args:
        client (QdrantClient): The Qdrant client instance.
    """
    if not client.collection_exists(Config.COLLECTION_NAME):
        client.create_collection(
            collection_name=Config.COLLECTION_NAME,
            vectors_config=VectorParams(
                size=Config.VECTOR_SIZE,
                distance=Distance.COSINE
            )
        )
        qdrant_logger.info(f"Collection '{Config.COLLECTION_NAME}' created successfully.")
        logger.info(f"Collection '{Config.COLLECTION_NAME}' created successfully.")
    else:
        qdrant_logger.info(f"Collection '{Config.COLLECTION_NAME}' already exists.")
        logger.info(f"Collection '{Config.COLLECTION_NAME}' already exists.")
