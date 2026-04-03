from src.config import Config, logger
from src.database import get_qdrant_client
from src.embeddings import get_embedding

def retrieve(query: str, top_k: int = 3) -> list[str]:
    """
    Retrieves the most semantically similar context chunks for a given query.
    
    Args:
        query (str): The search query.
        top_k (int, optional): The number of chunks to retrieve. Defaults to 3.
        
    Returns:
        list[str]: A list of relevant text chunks.
    """
    try:
        client = get_qdrant_client()
    except Exception as e:
        logger.error(f"Cannot retrieve due to database error: {e}")
        return []
        
    try:
        vector = get_embedding(query)
    except Exception as e:
        logger.error(f"Failed to embed query: {e}")
        return []
        
    try:
        results = client.query_points(
            collection_name=Config.COLLECTION_NAME,
            query=vector,
            limit=top_k
        )
        
        chunks = [r.payload["text"] for r in results.points]
        return chunks
    except Exception as e:
        logger.error(f"Failed to query Qdrant: {e}")
        return []

if __name__ == "__main__":
    Config.validate()
    sample_query = "What is importance of strengths in counseling?"
    logger.info(f"Test Query: {sample_query}")
    
    results = retrieve(sample_query)
    
    print("\n🔍 Retrieved Chunks:\n")
    for i, r in enumerate(results):
        print(f"{i+1}. {r}\n")
