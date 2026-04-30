from src.config import Config
from src.database import get_qdrant_client
from qdrant_client.models import VectorParams, Distance

def test_qdrant_connection_and_search():
    """Tests the integrity of the Qdrant connection and standard operations."""
    try:
        client = get_qdrant_client()
        collection_name = "test_collection_tmp"
        
        if not client.collection_exists(collection_name):
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=4, distance=Distance.COSINE),
            )
        print("✅ Test Collection ready!")
        
        client.upsert(
            collection_name=collection_name,
            points=[{"id": 1, "vector": [0.1, 0.2, 0.3, 0.4], "payload": {"text": "hello world"}}]
        )
        print("✅ Data inserted!")
        
        results = client.query_points(
            collection_name=collection_name,
            query=[0.1, 0.2, 0.3, 0.4],
            limit=1
        )
        assert len(results.points) == 1, "Didn't retrieve the expected number of results"
        print("🔍 Search result:", results)
        
        # Cleanup routine
        client.delete_collection(collection_name)
        print("🗑️ Cleanup completed!")
    except Exception as e:
        print("❌ Error occurred:", e)

if __name__ == "__main__":
    test_qdrant_connection_and_search()
