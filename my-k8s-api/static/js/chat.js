// Chat Page Module
import { LanguageManager } from './languageManager.js';
import { ApiService } from './apiService.js';
import { ChatManager } from './chatManager.js';
import { Utils } from './utils.js';
import { config } from './config.js';

class ChatPage {
    constructor() {
        this.languageManager = null;
        this.apiService = null;
        this.chatManager = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize core modules
            this.languageManager = new LanguageManager();
            this.apiService = new ApiService(this.languageManager);
            this.chatManager = new ChatManager(this.apiService, this.languageManager);

            // Initialize page-specific features
            this.initExampleQuestions();
            this.initChatControls();
            this.initErrorHandling();
            
            // Show mock mode indicator if enabled
            if (config.mockMode) {
                Utils.showToast('Mock mode enabled - using sample data', 'info');
                console.log('Mock mode enabled');
            }

            console.log('Chat page initialized successfully');
        } catch (error) {
            console.error('Failed to initialize chat page:', error);
            Utils.showToast('Failed to initialize chat page', 'danger');
        }
    }

    initExampleQuestions() {
        // Handle example question buttons
        const exampleButtons = document.querySelectorAll('.example-question, .sample-question');
        
        exampleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const question = e.target.closest('button').dataset.question;
                if (question) {
                    const messageInput = document.getElementById('messageInput');
                    if (messageInput) {
                        messageInput.value = question;
                        messageInput.focus();
                        
                        // Auto-submit if chat manager is available
                        if (this.chatManager) {
                            // Trigger form submission
                            const form = document.getElementById('chatForm');
                            if (form) {
                                form.dispatchEvent(new Event('submit'));
                            }
                        }
                    }
                }
            });
        });
    }

    initChatControls() {
        // Clear chat button
        const clearBtn = document.getElementById('clearChatBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (this.chatManager) {
                    this.chatManager.clearChat();
                    Utils.showToast('Chat history cleared', 'info');
                }
            });
        }

        // Export chat button
        const exportBtn = document.getElementById('exportChatBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportChat();
            });
        }

        // Voice input button (if available)
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.handleVoiceInput();
            });
        }
    }

    exportChat() {
        try {
            const chatWindow = document.getElementById('chatWindow');
            if (!chatWindow) return;

            const messages = Array.from(chatWindow.querySelectorAll('.message')).map(msg => {
                const sender = msg.classList.contains('user-message') ? 'User' : 'AI Assistant';
                const content = msg.querySelector('.message-content')?.textContent || '';
                const timestamp = msg.querySelector('.message-timestamp')?.textContent || '';
                
                return `[${timestamp}] ${sender}: ${content}`;
            });

            if (messages.length === 0) {
                Utils.showToast('No chat history to export', 'warning');
                return;
            }

            const chatContent = messages.join('\n\n');
            const blob = new Blob([chatContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `k8s-chat-${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            Utils.showToast('Chat exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export chat:', error);
            Utils.showToast('Failed to export chat', 'danger');
        }
    }

    handleVoiceInput() {
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            Utils.showToast('Voice input not supported in this browser', 'warning');
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = this.languageManager?.currentLanguage === 'zh' ? 'zh-TW' : 'en-US';

            const voiceBtn = document.getElementById('voiceBtn');
            const messageInput = document.getElementById('messageInput');

            recognition.onstart = () => {
                voiceBtn?.classList.add('recording');
                Utils.showToast('Listening...', 'info');
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (messageInput) {
                    messageInput.value = transcript;
                    messageInput.focus();
                }
                Utils.showToast('Voice input captured', 'success');
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                Utils.showToast('Voice input failed', 'danger');
            };

            recognition.onend = () => {
                voiceBtn?.classList.remove('recording');
            };

            recognition.start();
        } catch (error) {
            console.error('Voice input error:', error);
            Utils.showToast('Voice input failed', 'danger');
        }
    }

    initErrorHandling() {
        // Global error handling for chat page
        window.addEventListener('error', (e) => {
            console.error('Chat page error:', e.error);
            Utils.showToast('An unexpected error occurred', 'danger');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection on chat page:', e.reason);
            Utils.showToast('A network error occurred', 'warning');
            e.preventDefault();
        });
    }

    // Public API methods
    clearChat() {
        if (this.chatManager) {
            this.chatManager.clearChat();
        }
    }

    sendMessage(message) {
        if (this.chatManager) {
            return this.chatManager.sendMessage(message);
        }
    }

    getLanguageManager() {
        return this.languageManager;
    }

    getApiService() {
        return this.apiService;
    }

    getChatManager() {
        return this.chatManager;
    }
}

// Initialize chat page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.K8sChatPage = new ChatPage();
});

// Export for potential external use
export default ChatPage;