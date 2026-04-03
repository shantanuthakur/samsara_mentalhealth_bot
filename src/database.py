from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from src.config import Config, logger

def get_qdrant_client() -> QdrantClient:
    """
    Initializes and returns the Qdrant Client.
    
    Returns:
        QdrantClient: The configured Qdrant client instance.
    """
    try:
        client = QdrantClient(host=Config.QDRANT_HOST, port=Config.QDRANT_PORT)
        return client
    except Exception as e:
        logger.error(f"Failed to connect to Qdrant at {Config.QDRANT_HOST}:{Config.QDRANT_PORT}. Error: {e}")
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
        logger.info(f"Collection '{Config.COLLECTION_NAME}' created successfully.")
    else:
        logger.info(f"Collection '{Config.COLLECTION_NAME}' already exists.")
