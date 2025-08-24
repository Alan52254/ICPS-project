# Mock endpoints for testing frontend functionality
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# Mock data
mock_namespaces = ["default", "kube-system", "monitoring", "prod", "staging"]

mock_pod_metrics = {
    "default": [
        {"pod": "nginx-deployment-7d7c6d8b9f-abc12", "cpu": 0.0234, "mem": 128.5, "disk": 1024.2, "net_rx": 15.3, "net_tx": 8.7, "ready": True},
        {"pod": "redis-master-6b8c7d9e8f-def34", "cpu": 0.0156, "mem": 256.8, "disk": 512.1, "net_rx": 23.1, "net_tx": 12.4, "ready": True},
        {"pod": "postgres-db-5a7b8c9d0e-ghi56", "cpu": 0.0445, "mem": 512.3, "disk": 2048.7, "net_rx": 31.2, "net_tx": 18.9, "ready": False},
    ],
    "kube-system": [
        {"pod": "kube-dns-7f4c8d9e8f-xyz01", "cpu": 0.0089, "mem": 64.2, "disk": 256.1, "net_rx": 12.5, "net_tx": 6.3, "ready": True},
        {"pod": "kube-proxy-4f6g7h8i9j-abc02", "cpu": 0.0067, "mem": 48.7, "disk": 128.5, "net_rx": 8.2, "net_tx": 4.1, "ready": True},
    ],
    "monitoring": [
        {"pod": "prometheus-server-3e5f6g7h8i-mon01", "cpu": 0.1234, "mem": 1024.8, "disk": 4096.2, "net_rx": 145.7, "net_tx": 89.3, "ready": True},
        {"pod": "grafana-dashboard-2d4f5g6h7i-gra01", "cpu": 0.0456, "mem": 384.5, "disk": 1536.8, "net_rx": 67.2, "net_tx": 34.6, "ready": True},
        {"pod": "alertmanager-1c3e5f7g9h-alt01", "cpu": 0.0089, "mem": 128.3, "disk": 512.4, "net_rx": 23.8, "net_tx": 12.7, "ready": False},
    ],
    "prod": [
        {"pod": "api-service-4f6g7h8i9j-jkl78", "cpu": 0.0789, "mem": 384.6, "disk": 1536.4, "net_rx": 42.8, "net_tx": 26.1, "ready": True},
        {"pod": "worker-queue-3e5f6g7h8i-mno90", "cpu": 0.0123, "mem": 192.1, "disk": 768.9, "net_rx": 8.5, "net_tx": 4.2, "ready": True},
        {"pod": "database-primary-2d4e6f8g0h-db001", "cpu": 0.1567, "mem": 2048.7, "disk": 8192.3, "net_rx": 234.5, "net_tx": 156.8, "ready": True},
    ],
    "staging": [
        {"pod": "test-app-1a2b3c4d5e-test01", "cpu": 0.0234, "mem": 256.4, "disk": 1024.1, "net_rx": 34.7, "net_tx": 18.9, "ready": True},
    ]
}

class ChatRequest(BaseModel):
    user_message: str
    history: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    assistant: str
    history: List[dict]

@router.get("/namespaces")
async def get_namespaces():
    """Get list of available namespaces"""
    return {"namespaces": mock_namespaces}

@router.get("/pod_metrics")
async def get_pod_metrics(namespace: str = "default"):
    """Get pod metrics for a specific namespace"""
    return mock_pod_metrics.get(namespace, [])

@router.post("/llm_chat", response_model=ChatResponse)
async def llm_chat(req: ChatRequest):
    """Mock LLM chat endpoint"""
    user_message = req.user_message
    current_history = req.history or []
    
    # Simple mock response based on user message
    if "pod" in user_message.lower() or "資源" in user_message or "metrics" in user_message.lower():
        assistant_response = f"""根據您的查詢「{user_message}」，我為您分析當前集群狀況：

**🔍 集群資源概況：**
- 總共 {len(mock_namespaces)} 個命名空間正在運行
- 發現高資源使用的 Pod：`database-primary-2d4e6f8g0h-db001` (CPU: 0.1567 cores)
- 有 1 個 Pod 處於未就緒狀態需要關注

**💡 建議：**
1. 檢查未就緒的 Pod 日誌
2. 考慮調整資源限制
3. 監控磁碟使用情況

這是演示模式的回應。在實際環境中，我會查詢真實的 Prometheus 指標數據。"""
    
    elif "help" in user_message.lower() or "幫助" in user_message or "功能" in user_message:
        assistant_response = """**🤖 AI 助手功能介紹：**

我可以協助您：

**📊 監控分析：**
- 查詢 Pod 資源使用情況
- 分析 CPU、記憶體、網路指標
- 識別效能瓶頸

**🔧 故障排除：**
- 診斷 Pod 狀態異常
- 提供最佳化建議
- 容量規劃指導

**💬 使用方式：**
- 直接詢問集群相關問題
- 支援中英文查詢
- 可查看即時指標數據

目前為演示模式，實際部署時將連接真實的 Kubernetes 集群和 Prometheus 監控系統。"""
    
    else:
        assistant_response = f"""感謝您的查詢：「{user_message}」

🚀 **這是演示模式的 AI 助手回應！**

在實際環境中，我可以：
- 執行 PromQL 查詢分析集群指標
- 提供即時的 Kubernetes 資源分析
- 協助故障排除和效能優化

**可嘗試的查詢範例：**
- "顯示所有 Pod 的資源使用情況"
- "哪些 Pod 使用最多 CPU？"
- "有哪些 Pod 狀態異常？"
- "幫助我了解系統功能"

請嘗試問我關於 Kubernetes 監控的問題！"""

    # Build new history
    new_history = current_history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": assistant_response}
    ]

    return ChatResponse(
        assistant=assistant_response,
        history=new_history
    )