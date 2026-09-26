from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

# Enable CORS so the frontend can talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default Ollama configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_MODEL = "llama3.2:3b"

class ChatRequest(BaseModel):
    prompt: str
    model: str = DEFAULT_MODEL

@app.get("/")
async def root():
    return {"message": "Hello! Your AI-powered FastAPI backend is running. 🤖"}

@app.get("/models")
async def list_models():
    """Returns a list of models available in Ollama."""
    try:
        response = requests.get("http://localhost:11434/api/tags")
        response.raise_for_status()
        data = response.json()
        # Extract just the model names for the frontend dropdown
        models = [m['name'] for m in data.get('models', [])]
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not fetch models: {str(e)}")

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Sends a prompt to the local Ollama instance using the specified model.
    """
    payload = {
        "model": request.model,
        "prompt": request.prompt,
        "stream": False
    }
    
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return {"response": data.get("response", "No response from AI")}
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Ollama is not running. Please start Ollama on localhost:11434")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
