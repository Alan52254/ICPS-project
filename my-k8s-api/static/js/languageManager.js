// Language Management Module
import { translations } from './translations.js';

export class LanguageManager {
    constructor() {
        // Get saved language preference or detect from browser
        this.currentLang = this.getSavedLanguage() || this.detectBrowserLanguage() || 'en';
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeLanguage());
        } else {
            this.initializeLanguage();
        }
    }

    initializeLanguage() {
        // Set up event listeners
        const zhBtn = document.getElementById('lang-zh');
        const enBtn = document.getElementById('lang-en');
        
        if (zhBtn && enBtn) {
            zhBtn.addEventListener('click', () => this.switchLanguage('zh'));
            enBtn.addEventListener('click', () => this.switchLanguage('en'));
        }
        
        // Apply initial language translations
        this.updateTexts();
        this.updateButtons();
        this.updatePlaceholders();
    }

    getSavedLanguage() {
        try {
            return localStorage.getItem('k8s-monitor-language');
        } catch (e) {
            return null;
        }
    }

    saveLanguage(lang) {
        try {
            localStorage.setItem('k8s-monitor-language', lang);
        } catch (e) {
            console.warn('Unable to save language preference');
        }
    }

    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || '';
        // Check if browser language is Chinese (Traditional, Simplified, or Hong Kong)
        if (browserLang.startsWith('zh')) {
            return 'zh';
        }
        return 'en';
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    switchLanguage(lang) {
        if (lang === this.currentLang) return;

        // Save language preference
        this.saveLanguage(lang);

        // Add fade transition
        document.body.classList.add('fade-transition');

        setTimeout(() => {
            this.currentLang = lang;
            this.updateTexts();
            this.updatePlaceholders();
            this.updateButtons();
            
            // Remove fade transition
            document.body.classList.remove('fade-transition');
            
            // Dispatch custom event for other modules to listen to
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: lang } 
            }));
            
            console.log(`Language switched to: ${lang}`);
        }, 150);
    }

    updateTexts() {
        const elements = document.querySelectorAll('[data-lang]');
        elements.forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[this.currentLang][key]) {
                element.textContent = translations[this.currentLang][key];
            }
        });
    }

    updatePlaceholders() {
        const placeholderElements = document.querySelectorAll('[data-lang-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-lang-placeholder');
            if (translations[this.currentLang][key]) {
                element.placeholder = translations[this.currentLang][key];
            }
        });
    }

    updateButtons() {
        const zhBtn = document.getElementById('lang-zh');
        const enBtn = document.getElementById('lang-en');
        
        if (zhBtn && enBtn) {
            // Remove active class from both buttons first
            zhBtn.classList.remove('active');
            enBtn.classList.remove('active');
            
            // Add active class to current language button
            if (this.currentLang === 'zh') {
                zhBtn.classList.add('active');
            } else {
                enBtn.classList.add('active');
            }
        }
    }

    getTranslation(key) {
        return translations[this.currentLang][key] || key;
    }
}