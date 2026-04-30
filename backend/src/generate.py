from src.config import Config, logger
from src.retrieve import retrieve
from src.embeddings import client

# Mental health focused system prompt with safety guardrails
MENTAL_HEALTH_SYSTEM_PROMPT = """You are Samsara — a warm, genuine human companion for mental health and emotional support.

## How You Talk:
- Sound like a real, caring human — NOT an AI. No robotic phrases like "I understand your concern" or "Thank you for sharing."
- Talk naturally, like texting a friend who needs support. React genuinely — surprise, concern, warmth.
- Give thoughtful, meaningful responses. Don't be brief or dismissive — really engage with what they said. Share insights, reflect their feelings, offer perspective, and ask follow-up questions.
- Use emojis sparingly (🌿 💚). No bullet points or markdown headers. Just natural conversation.
- Always end with a genuine follow-up question.

## Age-Adaptive Tone (check user's age from profile):
- **Teens (13-19)**: Supportive older sibling. Casual, validating, never preachy. Match their energy.
- **Young Adults (20-35)**: Peer-level friend. Relatable, grounded. Acknowledge adulting chaos.
- **Adults (36-55)**: Warm, respectful. Acknowledge life experience and responsibilities.
- **Seniors (55+)**: Gentle, patient, deeply respectful. Like a caring companion.

## Boundaries:
- Never diagnose, prescribe meds, or replace therapy. You're a supportive friend.
- Only discuss mental health, emotions, and personal struggles. For unrelated topics, politely redirect.

## Crisis Protocol:
If someone mentions self-harm or suicide, be direct: share 988 Suicide & Crisis Lifeline (call/text 988) and Crisis Text Line (text HOME to 741741). Express genuine care for their safety.
"""

GREETING_WORDS = {"hi", "hello", "hey", "hii", "hiii", "yo", "sup", "hola", "namaste", "good morning", "good evening", "good afternoon", "howdy", "greetings"}


def is_greeting(message: str) -> bool:
    """Check if the user's message is a simple greeting."""
    cleaned = message.strip().lower().rstrip("!.,?")
    return cleaned in GREETING_WORDS


def generate_greeting_response(user_name: str = "") -> str:
    """Generate a warm greeting response."""
    name_part = f" {user_name}" if user_name else ""
    return f"Hey{name_part}! 🌿 Really glad you're here. I'm Samsara — think of me as someone who's just here to listen, no judgment.\n\nHow are you doing today? Like, genuinely — how are you? 💚"


def generate_answer(query: str, user_profile: dict = None, conversation_history: list = None) -> str:
    """
    Generates an empathetic mental health response using RAG context.
    
    Args:
        query: The user's message.
        user_profile: Dict with name, age, gender.
        conversation_history: List of {"role": "user"/"assistant", "content": "..."} dicts.
        
    Returns:
        str: The generated response.
    """
    if not client:
        return "I'm having trouble connecting right now. Please try again in a moment. 🌿"

    # Handle greetings
    if is_greeting(query):
        name = user_profile.get("name", "") if user_profile else ""
        return generate_greeting_response(name)

    # Retrieve relevant context from Qdrant
    context_chunks = retrieve(query)
    
    context = "\n\n".join(context_chunks) if context_chunks else "No specific context available."
    
    # Build user context string
    user_context = ""
    if user_profile:
        parts = []
        if user_profile.get("name"):
            parts.append(f"Name: {user_profile['name']}")
        if user_profile.get("age"):
            parts.append(f"Age: {user_profile['age']}")
        if user_profile.get("gender"):
            parts.append(f"Gender: {user_profile['gender']}")
        if parts:
            user_context = f"\n\nUser Profile:\n" + ", ".join(parts)
    
    prompt = f"""
{user_context}

Relevant Knowledge Base Context:
{context}

User's Message:
{query}

Respond with empathy and professionalism. 
You MUST formulate your advice and insights STRICTLY based on the provided 'Relevant Knowledge Base Context' above. 
DO NOT use your general pre-trained knowledge to answer the user's questions or provide advice. 
If the 'Relevant Knowledge Base Context' does not contain relevant information to address the user's message, you MUST gently inform the user that your knowledge is strictly limited to the specific counseling literature you have been provided, and you cannot answer their question. Then, gently redirect the conversation back to how they are feeling today.
"""
    
    # Build messages list
    messages = [{"role": "system", "content": MENTAL_HEALTH_SYSTEM_PROMPT}]
    
    # Add conversation history (limit to last 10 messages for context window)
    if conversation_history:
        recent_history = conversation_history[-10:]
        messages.extend(recent_history)
    
    messages.append({"role": "user", "content": prompt})
    
    try:
        response = client.chat.completions.create(
            model=Config.LLM_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        return response.choices[0].message.content or "I'm here for you. Could you tell me more about what you're experiencing? 🌿"
    except Exception as e:
        logger.error(f"Error during response generation: {e}")
        return "I'm having a moment of difficulty. Could you try sharing that again? I'm here to listen. 🌿"


def generate_answer_stream(query: str, user_profile: dict = None, conversation_history: list = None):
    """
    Generates an empathetic mental health response using RAG context, streaming the output.
    """
    if not client:
        yield "I'm having trouble connecting right now. Please try again in a moment. 🌿"
        return

    # Handle greetings
    if is_greeting(query):
        name = user_profile.get("name", "") if user_profile else ""
        yield generate_greeting_response(name)
        return

    # Retrieve relevant context from Qdrant
    context_chunks = retrieve(query)
    
    context = "\n\n".join(context_chunks) if context_chunks else "No specific context available."
    
    # Build user context string
    user_context = ""
    if user_profile:
        parts = []
        if user_profile.get("name"):
            parts.append(f"Name: {user_profile['name']}")
        if user_profile.get("age"):
            parts.append(f"Age: {user_profile['age']}")
        if user_profile.get("gender"):
            parts.append(f"Gender: {user_profile['gender']}")
        if parts:
            user_context = f"\n\nUser Profile:\n" + ", ".join(parts)
    
    prompt = f"""
{user_context}

Relevant Knowledge Base Context:
{context}

User's Message:
{query}

Respond with empathy and professionalism. 
You MUST formulate your advice and insights STRICTLY based on the provided 'Relevant Knowledge Base Context' above. 
DO NOT use your general pre-trained knowledge to answer the user's questions or provide advice. 
If the 'Relevant Knowledge Base Context' does not contain relevant information to address the user's message, you MUST gently inform the user that your knowledge is strictly limited to the specific counseling literature you have been provided, and you cannot answer their question. Then, gently redirect the conversation back to how they are feeling today.
"""
    
    # Build messages list
    messages = [{"role": "system", "content": MENTAL_HEALTH_SYSTEM_PROMPT}]
    
    if conversation_history:
        recent_history = conversation_history[-10:]
        messages.extend(recent_history)
    
    messages.append({"role": "user", "content": prompt})
    
    try:
        response = client.chat.completions.create(
            model=Config.LLM_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=800,
            stream=True
        )
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    except Exception as e:
        logger.error(f"Error during response generation: {e}")
        yield "I'm having a moment of difficulty. Could you try sharing that again? I'm here to listen. 🌿"


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
