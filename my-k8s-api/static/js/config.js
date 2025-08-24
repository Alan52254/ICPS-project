// Application Configuration Module
export const config = {
    mockMode: new URLSearchParams(window.location.search).get('mock') === '1',
    endpoints: {
        chat: '/api/llm_chat',
        namespaces: '/api/namespaces',
        podMetrics: '/api/pod_metrics'
    }
};

// Mock data for development
export const mockData = {
    namespaces: ['default', 'kube-system', 'monitoring', 'app'],
    podMetrics: [
        { pod: 'nginx-7d7c6d8b9f-abc12', cpu: 0.0234, mem: 128.5, net_rx: 15.3, net_tx: 8.7, ready: true },
        { pod: 'redis-6b8c7d9e8f-def34', cpu: 0.0156, mem: 256.8, net_rx: 23.1, net_tx: 12.4, ready: true },
        { pod: 'postgres-5a7b8c9d0e-ghi56', cpu: 0.0445, mem: 512.3, net_rx: 31.2, net_tx: 18.9, ready: false }
    ],
    chatResponse: {
        'zh': "這是 Mock 模式回應。在正式環境中，我可以幫您分析 Kubernetes 集群狀態、資源使用情況，並提供故障排除建議。",
        'en': "This is a Mock mode response. In a production environment, I can help you analyze Kubernetes cluster status, resource usage, and provide troubleshooting advice."
    }
};