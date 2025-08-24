// Home Page Module
import { LanguageManager } from './languageManager.js';
import { ApiService } from './apiService.js';
import { Utils } from './utils.js';
import { config } from './config.js';

class HomePage {
    constructor() {
        this.languageManager = null;
        this.apiService = null;
        this.statsUpdateInterval = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize core modules
            this.languageManager = new LanguageManager();
            this.apiService = new ApiService(this.languageManager);

            // Initialize page features
            this.initStats();
            this.initErrorHandling();
            
            // Show mock mode indicator if enabled
            if (config.mockMode) {
                Utils.showToast('Mock mode enabled - using sample data', 'info');
                console.log('Mock mode enabled');
            }

            console.log('Home page initialized successfully');
        } catch (error) {
            console.error('Failed to initialize home page:', error);
            Utils.showToast('Failed to initialize home page', 'danger');
        }
    }

    initStats() {
        // Load initial stats
        this.loadStats();
        
        // Auto-refresh stats every 30 seconds
        this.statsUpdateInterval = setInterval(() => {
            this.loadStats();
        }, 30000);
    }

    async loadStats() {
        try {
            const [namespaces, metrics] = await Promise.all([
                this.apiService.getNamespaces(),
                this.apiService.getTopUsage()
            ]);

            this.updateStats(namespaces, metrics);
        } catch (error) {
            console.error('Failed to load stats:', error);
            // Don't show error toast for stats - it's background data
        }
    }

    updateStats(namespaces, metrics) {
        // Update namespace count
        const totalNamespaces = namespaces?.length || 0;
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
                avgCpuElement.textContent = avgCpu.toFixed(2);
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

    initErrorHandling() {
        // Global error handling for home page
        window.addEventListener('error', (e) => {
            console.error('Home page error:', e.error);
            Utils.showToast('An unexpected error occurred', 'danger');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection on home page:', e.reason);
            Utils.showToast('A network error occurred', 'warning');
            e.preventDefault();
        });
    }

    destroy() {
        // Clean up intervals when leaving page
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
            this.statsUpdateInterval = null;
        }
    }

    // Public API methods
    refreshStats() {
        this.loadStats();
    }

    getLanguageManager() {
        return this.languageManager;
    }

    getApiService() {
        return this.apiService;
    }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.K8sHomePage = new HomePage();
});

// Clean up when leaving page
window.addEventListener('beforeunload', () => {
    if (window.K8sHomePage) {
        window.K8sHomePage.destroy();
    }
});

// Export for potential external use
export default HomePage;