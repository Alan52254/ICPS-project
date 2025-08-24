// API Service Module
import { config, mockData } from './config.js';

export class ApiService {
    constructor(languageManager) {
        this.languageManager = languageManager;
    }

    async request(endpoint, options = {}) {
        if (config.mockMode) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (endpoint.includes('namespaces')) {
                return { data: { namespaces: mockData.namespaces } };
            } else if (endpoint.includes('pod_metrics')) {
                return { data: mockData.podMetrics };
            } else if (endpoint.includes('llm_chat')) {
                const currentLang = this.languageManager.getCurrentLanguage();
                return { 
                    data: { 
                        assistant: mockData.chatResponse[currentLang] || mockData.chatResponse['zh'] 
                    } 
                };
            }
        }

        try {
            return await axios({ 
                url: endpoint, 
                timeout: 10000, 
                ...options 
            });
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getNamespaces() {
        return this.request(config.endpoints.namespaces);
    }

    async getPodMetrics(namespace) {
        return this.request(config.endpoints.podMetrics, {
            params: { namespace }
        });
    }

    async sendChatMessage(message, history = []) {
        return this.request(config.endpoints.chat, {
            method: 'POST',
            data: { 
                user_message: message, 
                history: history 
            }
        });
    }
}