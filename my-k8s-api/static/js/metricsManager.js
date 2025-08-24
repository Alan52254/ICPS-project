// Metrics Management Module
export class MetricsManager {
    constructor(apiService, languageManager) {
        this.apiService = apiService;
        this.languageManager = languageManager;
        this.namespaceSelect = document.getElementById('namespaceSelect');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.metricsBody = document.getElementById('metricsBody');
        
        this.init();
    }

    init() {
        this.refreshBtn.addEventListener('click', () => this.loadMetrics());
        this.namespaceSelect.addEventListener('change', () => this.loadMetrics());
        
        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            this.updateMessages();
            this.updateNamespaceSelect();
        });
        
        this.loadNamespaces();
    }

    async loadNamespaces() {
        try {
            const response = await this.apiService.getNamespaces();
            const namespaces = response.data.namespaces;

            this.namespaceSelect.innerHTML = '';
            namespaces.forEach(ns => {
                const option = document.createElement('option');
                option.value = ns;
                option.textContent = ns;
                this.namespaceSelect.appendChild(option);
            });

            if (namespaces.length > 0) {
                this.loadMetrics();
            }
        } catch (error) {
            console.error('Failed to load namespaces:', error);
            this.namespaceSelect.innerHTML = `<option>${this.languageManager.getTranslation('loading-failed')}</option>`;
        }
    }

    async loadMetrics() {
        const namespace = this.namespaceSelect.value;
        if (!namespace) return;

        this.showLoading();
        this.refreshBtn.disabled = true;

        try {
            const response = await this.apiService.getPodMetrics(namespace);
            this.renderMetrics(response.data);
        } catch (error) {
            console.error('Failed to load metrics:', error);
            this.showError();
        } finally {
            this.refreshBtn.disabled = false;
        }
    }

    showLoading() {
        this.metricsBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="loading me-2"></div>${this.languageManager.getTranslation('metrics-loading-data')}
                </td>
            </tr>
        `;
    }

    showError() {
        this.metricsBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>${this.languageManager.getTranslation('loading-failed')}
                </td>
            </tr>
        `;
    }

    renderMetrics(metrics) {
        if (!metrics || metrics.length === 0) {
            this.metricsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        ${this.languageManager.getTranslation('no-data')}
                    </td>
                </tr>
            `;
            return;
        }

        this.metricsBody.innerHTML = '';
        metrics.forEach(metric => {
            const row = document.createElement('tr');
            const statusText = metric.ready ? 
                this.languageManager.getTranslation('status-normal') : 
                this.languageManager.getTranslation('status-error');
            const statusClass = metric.ready ? 'bg-success' : 'bg-danger';
            
            row.innerHTML = `
                <td class="fw-medium">${this.escapeHtml(metric.pod)}</td>
                <td>${(metric.cpu || 0).toFixed(4)}</td>
                <td>${(metric.mem || 0).toFixed(1)}</td>
                <td>${(metric.net_rx || 0).toFixed(1)}</td>
                <td>${(metric.net_tx || 0).toFixed(1)}</td>
                <td>
                    <span class="badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
            `;
            this.metricsBody.appendChild(row);
        });
    }

    updateMessages() {
        // Update any displayed messages when language changes
        const currentContent = this.metricsBody.innerHTML;
        
        if (currentContent.includes('loading me-2')) {
            this.showLoading();
        } else if (currentContent.includes('exclamation-triangle')) {
            this.showError();
        } else if (currentContent.includes('text-muted') && !this.metricsBody.querySelector('tr:not([colspan])')) {
            // Re-render no data message
            this.metricsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        ${this.languageManager.getTranslation('no-data')}
                    </td>
                </tr>
            `;
        }
    }

    updateNamespaceSelect() {
        // Update namespace select options with current language
        const currentOptions = Array.from(this.namespaceSelect.options);
        
        // Check if there's a loading failed message
        if (currentOptions.length === 1 && (currentOptions[0].textContent.includes('失敗') || currentOptions[0].textContent.includes('Failed'))) {
            this.namespaceSelect.innerHTML = `<option>${this.languageManager.getTranslation('loading-failed')}</option>`;
        }
        // Check if there's a loading message  
        else if (currentOptions.length === 1 && (currentOptions[0].textContent.includes('載入中') || currentOptions[0].textContent.includes('Loading'))) {
            this.namespaceSelect.innerHTML = `<option>${this.languageManager.getTranslation('metrics-loading')}</option>`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    refreshMetrics() {
        this.loadMetrics();
    }

    getCurrentNamespace() {
        return this.namespaceSelect.value;
    }
}