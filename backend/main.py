import asyncio
import uuid
import json
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import create_session, log_event, get_session_history, update_session_summary
from llm_service import stream_response, generate_summary

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/session/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    
    session_id = str(uuid.uuid4())
    start_ts = time.time()
    
    # 1. Initialize Session
    await create_session(session_id, client_id)
    
    # Context now stores simple dicts, conversion happens in llm_service
    conversation_context = [
        {"role": "system", "content": "You are a helpful AI assistant."}
    ]

    try:
        while True:
            # 2. Receive User Message
            data = await websocket.receive_text()
            
            # Log & Update Context
            await log_event(session_id, "user_message", data)
            conversation_context.append({"role": "user", "content": data})
            
            # 3. Stream AI Response (GEMINI UPDATED LOGIC)
            full_response = ""
            
            # Note: stream_response now yields direct strings, not objects
            async for text_chunk in stream_response(conversation_context):
                if text_chunk:
                    full_response += text_chunk
                    # Send token to client
                    await websocket.send_text(json.dumps({"type": "token", "content": text_chunk}))
            
            # Log AI Response
            await log_event(session_id, "ai_response", full_response)
            conversation_context.append({"role": "assistant", "content": full_response})

    except WebSocketDisconnect:
        print(f"Client #{client_id} disconnected")
        # 4. Post-Session Analysis
        asyncio.create_task(run_post_session_analysis(session_id, start_ts))

async def run_post_session_analysis(session_id, start_ts):
    print(f"Running analysis for {session_id}...")
    history = await get_session_history(session_id)
    summary = await generate_summary(history)
    duration = int(time.time() - start_ts)
    await update_session_summary(session_id, summary, duration)
    print(f"Session {session_id} finalized.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)