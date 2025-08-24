#!/usr/bin/env python3
"""
Development server with minimal dependencies for testing frontend functionality
"""

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Initialize FastAPI app
app = FastAPI(title="K8s Monitor Platform - Dev Mode", version="1.0.0")

# Mount static files - IMPORTANT: This must be done before other routes
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize templates
templates = Jinja2Templates(directory="templates")

# Basic routes for testing
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/chat", response_class=HTMLResponse)
def chat(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

@app.get("/metrics", response_class=HTMLResponse)  
def metrics(request: Request):
    return templates.TemplateResponse("metrics.html", {"request": request})

# Mock API endpoints
@app.get("/api/health")
def health_check():
    return {"status": "ok", "mode": "development"}

@app.get("/api/namespaces")
def get_namespaces():
    return {"namespaces": ["default", "kube-system", "monitoring"]}

@app.get("/api/pod_metrics")
def get_pod_metrics(namespace: str = "default"):
    return [
        {
            "pod": "nginx-deployment-7fb96c846b-abc12",
            "cpu": 0.25,
            "mem": 128.5,
            "disk": 1024.0,
            "net_rx": 1.2,
            "net_tx": 0.8,
            "ready": True
        },
        {
            "pod": "redis-master-74b58c9f4d-def34",
            "cpu": 0.15,
            "mem": 64.2,
            "disk": 512.0,
            "net_rx": 0.5,
            "net_tx": 0.3,
            "ready": True
        }
    ]

@app.get("/api/top_usage")
def get_top_usage():
    return [
        {
            "name": "nginx-deployment-7fb96c846b-abc12",
            "cpu_usage": "0.25",
            "memory_usage": "128.5",
            "network_rx": "1.2",
            "network_tx": "0.8",
            "status": "Running"
        },
        {
            "name": "redis-master-74b58c9f4d-def34",
            "cpu_usage": "0.15",
            "memory_usage": "64.2",
            "network_rx": "0.5",
            "network_tx": "0.3",
            "status": "Running"
        },
        {
            "name": "postgres-primary-0",
            "cpu_usage": "0.45",
            "memory_usage": "256.8",
            "network_rx": "2.1",
            "network_tx": "1.5",
            "status": "Running"
        }
    ]

@app.post("/api/llm_chat")
def chat_with_ai(request_data: dict):
    user_message = request_data.get('user_message', 'unknown message')
    return {
        "assistant": f"Mock AI response to: {user_message}",
        "history": [
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": f"Mock AI response to: {user_message}"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting K8s Monitor Platform Development Server")
    print("📍 Frontend URLs:")
    print("   - Home: http://localhost:8000/")
    print("   - AI Assistant: http://localhost:8000/chat")  
    print("   - Monitoring: http://localhost:8000/metrics")
    print("🔧 Running in development mode with mock data")
    
    uvicorn.run(
        "main_dev:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )