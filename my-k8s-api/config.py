import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# Prometheus URL
PROMETHEUS_URL = os.getenv("PROMETHEUS_URL", "http://localhost:9090")

# Ollama LLM Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "ollama")
FUNC_MODEL = os.getenv("FUNC_MODEL", "llama3.1:latest")
CHAT_MODEL = os.getenv("CHAT_MODEL", "llama3.1:latest")

# Grafana Configuration
GRAFANA_URL = os.getenv("GRAFANA_URL", "http://localhost:3000")
GRAFANA_API_KEY = os.getenv("GRAFANA_API_KEY", "")

# Development Settings
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

# 若需要 K8s 原生操作，嘗試載入 kube config
try:
    from kubernetes import client, config
    try:
        config.load_incluster_config()
        IN_CLUSTER = True
    except:
        try:
            config.load_kube_config()
            IN_CLUSTER = False
        except Exception as e:
            print(f"Warning: Could not load Kubernetes config: {e}")
            print("Running in mock mode - K8s operations will use fake data")
            IN_CLUSTER = False
            V1 = None
            HAS_K8S = False

    if 'V1' not in locals():
        V1 = client.CoreV1Api()
        HAS_K8S = True
except Exception as e:
    print(f"Warning: Kubernetes client not available: {e}")
    print("Running in mock mode - K8s operations will use fake data")
    IN_CLUSTER = False
    V1 = None
    HAS_K8S = False
