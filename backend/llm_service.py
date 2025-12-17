import os
import google.generativeai as genai
from google.api_core.exceptions import GoogleAPIError
from dotenv import load_dotenv

load_dotenv()

# 1. Configure Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# We use gemini-1.5-flash for speed (low latency is critical for websockets)
model = genai.GenerativeModel('gemini-2.5-flash')

# Mock Tool Definition (Gemini Native Format)
# Gemini Python SDK allows passing actual functions, but we will simulate for the protocol
tools_schema = [
    {
        "function_declarations": [
            {
                "name": "get_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "OBJECT",
                    "properties": {
                        "location": {"type": "STRING", "description": "The city and state, e.g. San Francisco, CA"},
                    },
                    "required": ["location"],
                },
            }
        ]
    }
]

tool_model = genai.GenerativeModel('gemini-2.5-flash', tools=tools_schema)

def convert_history_to_gemini(messages):
    """
    Converts OpenAI-style messages [{"role": "user", "content": "..."}] 
    to Gemini-style history.
    """
    gemini_history = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        # System messages are handled differently in Gemini (often in system_instruction), 
        # but for simple chat, we can treat them as user context or skip if strict.
        if msg["role"] == "system":
            # Prepend system prompt to the first user message or handle separately
            continue 
        
        gemini_history.append({
            "role": role,
            "parts": [msg["content"]]
        })
    return gemini_history

async def stream_response(messages):
    """
    Streams response from Gemini.
    Yields raw text chunks to be sent via WebSocket.
    """
    try:
        # Extract the latest user message (Gemini 'chat' object manages history, 
        # but stateless calls need full context or a managed chat session)
        
        # For a simple stateless backend pattern (easiest for this assignment):
        formatted_history = convert_history_to_gemini(messages[:-1]) # All except last
        last_message = messages[-1]["content"]

        # Initialize chat with history
        chat = model.start_chat(history=formatted_history)
        
        # Send message and stream
        response = await chat.send_message_async(last_message, stream=True)
        
        async for chunk in response:
            if chunk.text:
                yield chunk.text

    except GoogleAPIError as e:
        yield f"[Error: {str(e)}]"
    except Exception as e:
        # Handle cases where safety filters block content (chunk.text might be empty)
        print(f"Streaming Error: {e}")
        yield "" 

async def generate_summary(history):
    """Generates a summary of the conversation history using Gemini."""
    
    # Convert DB history to string transcript
    transcript = "\n".join([f"{h['event_type']}: {h['content']}" for h in history])
    
    prompt = f"""
    You are an expert analyst. Summarize this technical conversation efficiently.
    
    TRANSCRIPT:
    {transcript}
    
    SUMMARY:
    """
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        return "Summary generation failed."