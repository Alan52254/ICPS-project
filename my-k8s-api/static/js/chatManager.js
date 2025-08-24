// Chat Management Module
export class ChatManager {
    constructor(apiService, languageManager) {
        this.apiService = apiService;
        this.languageManager = languageManager;
        this.chatWindow = document.getElementById('chatWindow');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.history = [];
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Auto-resize textarea and handle Shift+Enter
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Listen for language changes to update loading messages
        window.addEventListener('languageChanged', () => this.updateLoadingMessages());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.messageInput.value = '';
        this.resetTextareaHeight();
        
        const loadingDiv = this.addMessage('ai', '', true);
        this.isLoading = true;

        try {
            const response = await this.apiService.sendChatMessage(message, this.history);
            this.updateMessage(loadingDiv, response.data.assistant);
            this.history.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response.data.assistant }
            );
        } catch (error) {
            console.error('Chat error:', error);
            this.updateMessage(loadingDiv, this.languageManager.getTranslation('connection-failed'));
        } finally {
            this.isLoading = false;
        }
    }

    addMessage(role, content, isLoading = false) {
        // Clear welcome message on first interaction
        if (this.chatWindow.querySelector('.text-center.text-muted')) {
            this.chatWindow.innerHTML = '';
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${role === 'user' ? 'user-message ms-auto' : 'ai-message'}`;
        
        if (isLoading) {
            messageDiv.innerHTML = `<div class="loading me-2"></div>${this.languageManager.getTranslation('thinking')}`;
            messageDiv.setAttribute('data-loading', 'true');
        } else {
            // Preserve line breaks by converting them to HTML
            this.setMessageContent(messageDiv, content);
        }

        this.chatWindow.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    updateMessage(element, content) {
        this.setMessageContent(element, content);
        element.removeAttribute('data-loading');
    }

    setMessageContent(element, content) {
        // Escape HTML to prevent XSS attacks
        const escapedContent = this.escapeHtml(content);
        
        // Convert line breaks to HTML <br> tags
        const htmlContent = escapedContent.replace(/\n/g, '<br>');
        
        // Set the HTML content
        element.innerHTML = htmlContent;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateLoadingMessages() {
        const loadingMessages = this.chatWindow.querySelectorAll('[data-loading="true"]');
        loadingMessages.forEach(msg => {
            msg.innerHTML = `<div class="loading me-2"></div>${this.languageManager.getTranslation('thinking')}`;
        });
    }

    scrollToBottom() {
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    handleKeydown(e) {
        // Handle Shift+Enter for new line, Enter for submit
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.chatForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    }

    autoResizeTextarea() {
        const textarea = this.messageInput;
        
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        
        // Calculate the new height based on content
        const maxHeight = 120; // Maximum height in pixels (about 5 lines)
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        
        // Set the new height
        textarea.style.height = newHeight + 'px';
        
        // Show/hide scrollbar if content exceeds max height
        if (textarea.scrollHeight > maxHeight) {
            textarea.style.overflowY = 'auto';
        } else {
            textarea.style.overflowY = 'hidden';
        }
    }

    resetTextareaHeight() {
        // Reset to single line height
        this.messageInput.style.height = 'auto';
        this.messageInput.style.overflowY = 'hidden';
    }

    clearChat() {
        this.history = [];
        this.chatWindow.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-comments fa-3x mb-3" style="color: var(--primary);"></i>
                <h5 data-lang="chat-welcome-title">${this.languageManager.getTranslation('chat-welcome-title')}</h5>
                <p data-lang="chat-welcome-desc">${this.languageManager.getTranslation('chat-welcome-desc')}</p>
            </div>
        `;
    }
}