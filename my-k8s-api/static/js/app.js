// Main Application Module
import { LanguageManager } from './languageManager.js';
import { ApiService } from './apiService.js';
import { ChatManager } from './chatManager.js';
import { MetricsManager } from './metricsManager.js';
import { Utils } from './utils.js';
import { config } from './config.js';

class App {
    constructor() {
        this.languageManager = null;
        this.apiService = null;
        this.chatManager = null;
        this.metricsManager = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize core modules
            this.languageManager = new LanguageManager();
            this.apiService = new ApiService(this.languageManager);
            this.chatManager = new ChatManager(this.apiService, this.languageManager);
            this.metricsManager = new MetricsManager(this.apiService, this.languageManager);

            // Initialize navigation
            this.initNavigation();
            
            // Initialize error handling
            this.initErrorHandling();

            // Show mock mode indicator if enabled
            if (config.mockMode) {
                Utils.showToast('Mock mode enabled - using sample data', 'info');
                console.log('Mock mode enabled');
            }

            console.log('K8s Monitoring Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            Utils.showToast('Failed to initialize application', 'danger');
        }
    }

    initNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = anchor.getAttribute('href');
                Utils.smoothScrollTo(target);
            });
        });

        // Active nav link highlighting
        this.updateActiveNavLink();
        window.addEventListener('scroll', Utils.throttle(() => {
            this.updateActiveNavLink();
        }, 100));
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    initErrorHandling() {
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            Utils.showToast('An unexpected error occurred', 'danger');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            Utils.showToast('A network error occurred', 'warning');
            e.preventDefault();
        });
    }

    // Public API for other scripts
    getLanguageManager() {
        return this.languageManager;
    }

    getApiService() {
        return this.apiService;
    }

    getChatManager() {
        return this.chatManager;
    }

    getMetricsManager() {
        return this.metricsManager;
    }

    // Utility methods for external access
    refreshData() {
        if (this.metricsManager) {
            this.metricsManager.refreshMetrics();
        }
    }

    clearChat() {
        if (this.chatManager) {
            this.chatManager.clearChat();
        }
    }

    switchLanguage(lang) {
        if (this.languageManager) {
            this.languageManager.switchLanguage(lang);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.K8sApp = new App();
});

// Export for potential external use
export default App;