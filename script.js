// app.js
class WebApp {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.initializeServiceWorker();
        this.handleLazyLoading();
        this.setTheme(this.getSavedTheme());
        this.setupIntersectionObserver();
    }

    setupEventListeners() {
        document.getElementById('themeToggle').addEventListener('click', () => 
            this.toggleTheme()
        );
        
        window.addEventListener('DOMContentLoaded', () => 
            this.handleDOMReady()
        );
    }

    handleDOMReady() {
        this.fadeOutLoadingScreen();
        this.loadDynamicContent();
    }

    fadeOutLoadingScreen() {
        const loader = document.getElementById('app-loading');
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }

    async loadDynamicContent() {
        try {
            const response = await fetch('/api/content');
            const data = await response.json();
            this.renderContent(data);
        } catch (error) {
            this.showErrorState();
        }
    }

    renderContent(data) {
        const contentContainer = document.querySelector('.dynamic-content');
        contentContainer.innerHTML = data
            .map(item => this.createContentCard(item))
            .join('');
    }

    createContentCard(item) {
        return `
            <article class="content-card">
                <h2>${item.title}</h2>
                <p>${item.description}</p>
            </article>
        `;
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-lazy-load]').forEach(element => {
            observer.observe(element);
        });
    }

    toggleTheme() {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' 
            ? 'light' 
            : 'dark';
        this.setTheme(newTheme);
        localStorage.setItem('themePreference', newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    getSavedTheme() {
        return localStorage.getItem('themePreference') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    showErrorState() {
        const contentContainer = document.querySelector('.dynamic-content');
        contentContainer.innerHTML = `
            <div class="error-state">
                <p>Failed to load content. Please try again later.</p>
            </div>
        `;
    }
}

// Initialize Application
const app = new WebApp();
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteResults.contains(e.target)) {
        autocompleteResults.style.display = 'none';
    }
});
