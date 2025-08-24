// Metrics Page Module
import { LanguageManager } from './languageManager.js';
import { ApiService } from './apiService.js';
import { MetricsManager } from './metricsManager.js';
import { Utils } from './utils.js';
import { config } from './config.js';

class MetricsPage {
    constructor() {
        this.languageManager = null;
        this.apiService = null;
        this.metricsManager = null;
        this.autoRefreshInterval = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentSort = 'name';
        this.currentSortOrder = 'asc';
        
        this.init();
    }

    async init() {
        try {
            // Initialize core modules
            this.languageManager = new LanguageManager();
            this.apiService = new ApiService(this.languageManager);
            this.metricsManager = new MetricsManager(this.apiService, this.languageManager);

            // Initialize page-specific features
            this.initControls();
            this.initAutoRefresh();
            this.initPagination();
            this.initStats();
            this.initErrorHandling();
            
            // Show mock mode indicator if enabled
            if (config.mockMode) {
                Utils.showToast('Mock mode enabled - using sample data', 'info');
                console.log('Mock mode enabled');
            }

            console.log('Metrics page initialized successfully');
        } catch (error) {
            console.error('Failed to initialize metrics page:', error);
            Utils.showToast('Failed to initialize metrics page', 'danger');
        }
    }

    initControls() {
        // Sort control
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.refreshMetrics();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportMetrics();
            });
        }

        // Manual refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshMetrics();
            });
        }
    }

    initAutoRefresh() {
        const autoRefreshToggle = document.getElementById('autoRefresh');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });

            // Start with auto-refresh enabled
            if (autoRefreshToggle.checked) {
                this.startAutoRefresh();
            }
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear any existing interval
        this.autoRefreshInterval = setInterval(() => {
            this.refreshMetrics();
        }, 30000); // 30 seconds
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    initPagination() {
        // Pagination will be handled by the MetricsManager
        // but we can add page-specific pagination controls here if needed
    }

    initStats() {
        // Load initial stats for the dashboard cards
        this.loadStats();
    }

    async loadStats() {
        try {
            const [namespaces, metrics] = await Promise.all([
                this.apiService.getNamespaces(),
                this.apiService.getTopUsage()
            ]);

            this.updateStatsCards(namespaces, metrics);
        } catch (error) {
            console.error('Failed to load stats:', error);
            // Use mock data if real data fails
            this.updateStatsCards([], []);
        }
    }

    updateStatsCards(namespaces, metrics) {
        // Update namespace count
        const totalNamespaces = namespaces?.length || 3;
        const namespacesElement = document.getElementById('totalNamespaces');
        if (namespacesElement) {
            namespacesElement.textContent = totalNamespaces;
        }

        // Update pod stats from metrics
        if (metrics && metrics.length > 0) {
            const totalPods = metrics.length;
            const runningPods = metrics.filter(pod => 
                pod.status && pod.status.toLowerCase().includes('running')
            ).length;
            
            // Calculate average CPU usage
            const avgCpu = metrics.reduce((sum, pod) => {
                const cpu = parseFloat(pod.cpu_usage || 0);
                return sum + cpu;
            }, 0) / totalPods;

            // Update DOM elements
            const totalPodsElement = document.getElementById('totalPods');
            const runningPodsElement = document.getElementById('runningPods');
            const avgCpuElement = document.getElementById('avgCpuUsage');

            if (totalPodsElement) {
                totalPodsElement.textContent = totalPods;
            }
            
            if (runningPodsElement) {
                runningPodsElement.textContent = runningPods;
            }
            
            if (avgCpuElement) {
                avgCpuElement.textContent = `${avgCpu.toFixed(2)}`;
            }
        } else {
            // Use mock data if no real data available
            const mockStats = this.getMockStats();
            
            const totalPodsElement = document.getElementById('totalPods');
            const runningPodsElement = document.getElementById('runningPods');
            const avgCpuElement = document.getElementById('avgCpuUsage');

            if (totalPodsElement) {
                totalPodsElement.textContent = mockStats.totalPods;
            }
            
            if (runningPodsElement) {
                runningPodsElement.textContent = mockStats.runningPods;
            }
            
            if (avgCpuElement) {
                avgCpuElement.textContent = mockStats.avgCpu;
            }
        }
    }

    getMockStats() {
        return {
            totalPods: 24,
            runningPods: 20,
            avgCpu: '0.45'
        };
    }

    async refreshMetrics() {
        if (this.metricsManager) {
            // Update last refresh time
            const lastUpdateElement = document.getElementById('lastUpdateTime');
            if (lastUpdateElement) {
                lastUpdateElement.textContent = new Date().toLocaleTimeString();
            }
            
            // Refresh both stats and metrics table
            await Promise.all([
                this.metricsManager.refreshMetrics(),
                this.loadStats()
            ]);
        }
    }

    async exportMetrics() {
        try {
            // Get current metrics data
            const currentNamespace = document.getElementById('namespaceSelect')?.value || '';
            let metrics;
            
            if (currentNamespace) {
                metrics = await this.apiService.getPodMetrics(currentNamespace);
            } else {
                metrics = await this.apiService.getTopUsage();
            }

            if (!metrics || metrics.length === 0) {
                Utils.showToast('No metrics data to export', 'warning');
                return;
            }

            // Convert to CSV format
            const headers = ['Pod Name', 'CPU (cores)', 'Memory (MiB)', 'Network Rx (KB/s)', 'Network Tx (KB/s)', 'Status'];
            const csvContent = [
                headers.join(','),
                ...metrics.map(metric => [
                    metric.name || '-',
                    metric.cpu_usage || '0',
                    metric.memory_usage || '0',
                    metric.network_rx || '0',
                    metric.network_tx || '0',
                    metric.status || 'Unknown'
                ].join(','))
            ].join('\n');

            // Download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `k8s-metrics-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            Utils.showToast('Metrics exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export metrics:', error);
            Utils.showToast('Failed to export metrics', 'danger');
        }
    }

    initErrorHandling() {
        // Global error handling for metrics page
        window.addEventListener('error', (e) => {
            console.error('Metrics page error:', e.error);
            Utils.showToast('An unexpected error occurred', 'danger');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection on metrics page:', e.reason);
            Utils.showToast('A network error occurred', 'warning');
            e.preventDefault();
        });
    }

    destroy() {
        // Clean up intervals when leaving page
        this.stopAutoRefresh();
    }

    // Public API methods
    refresh() {
        this.refreshMetrics();
    }

    exportData() {
        this.exportMetrics();
    }

    getLanguageManager() {
        return this.languageManager;
    }

    getApiService() {
        return this.apiService;
    }

    getMetricsManager() {
        return this.metricsManager;
    }
}

// Initialize metrics page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.K8sMetricsPage = new MetricsPage();
});

// Clean up when leaving page
window.addEventListener('beforeunload', () => {
    if (window.K8sMetricsPage) {
        window.K8sMetricsPage.destroy();
    }
});

// Export for potential external use
export default MetricsPage;