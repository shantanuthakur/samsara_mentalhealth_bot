from src.config import Config, logger
from src.retrieve import retrieve
from src.embeddings import client

def generate_answer(query: str) -> str:
    """
    Generates an answer to the user query using the retrieved context blocks.
    
    Args:
        query (str): The user's question.
        
    Returns:
        str: The generated response from the AI.
    """
    if not client:
        return "Error: OpenAI client is not initialized."
        
    context_chunks = retrieve(query)
    
    if not context_chunks:
        return "I don't know (No relevant context found)."
        
    context = "\n\n".join(context_chunks)
    
    prompt = f"""
You are a helpful AI assistant.

Answer ONLY using the context below.
If the answer is not in the context, say "I don't know".

Context:
{context}

Question:
{query}
"""
    try:
        response = client.chat.completions.create(
            model=Config.LLM_MODEL,
            messages=[
                {"role": "system", "content": "You are a precise and helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content or "No response generated."
    except Exception as e:
        logger.error(f"Error during response generation: {e}")
        return f"Error: {e}"

def start_interactive_session():
    """Starts an interactive command-line session to chat with the RAG pipeline."""
    Config.validate()
    print("Welcome to the Professional RAG Chatbot. Type 'exit' or 'quit' to stop.")
    while True:
        try:
            query = input("\nAsk: ").strip()
            if query.lower() in ["exit", "quit", "q"]:
                break
            if not query:
                continue
                
            print("Thinking...")
            answer = generate_answer(query)
            print("\n🧠 Answer:\n", answer)
        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            logger.error(f"Unexpected error: {e}")

if __name__ == "__main__":
    start_interactive_session()
