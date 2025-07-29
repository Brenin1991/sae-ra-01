/**
 * Base Screen - Classe base para todas as telas
 * Fornece funcionalidades comuns a todas as telas
 */

class BaseScreen {
    constructor(elementId, config = {}) {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.config = {
            next: null,
            onEnter: () => {},
            onExit: () => {},
            ...config
        };
        
        this.isActive = false;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        if (!this.element) {
            console.error(`❌ Elemento da tela não encontrado: ${this.elementId}`);
            return;
        }
        
        this.setupEventListeners();
        this.onInit();
    }
    
    setupEventListeners() {
        // Configurar botões padrão se existirem
        const nextButton = this.element.querySelector('[data-screen-next]');
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextScreen());
        }
        
        const prevButton = this.element.querySelector('[data-screen-prev]');
        if (prevButton) {
            prevButton.addEventListener('click', () => this.previousScreen());
        }
    }
    
    // Método para ser sobrescrito pelas classes filhas
    onInit() {
        // Implementação padrão vazia
    }
    
    // Mostrar a tela
    show() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Executar função de saída da tela atual
        if (window.screenManager && window.screenManager.getCurrentScreen()) {
            const currentScreen = window.screenManager.getCurrentScreen();
            if (currentScreen.data && currentScreen.data.onExit) {
                currentScreen.data.onExit();
            }
        }
        
        // Esconder todas as telas
        this.hideAllScreens();
        
        // Mostrar esta tela
        this.element.style.display = 'block';
        
        // Animação de fade in
        setTimeout(() => {
            this.element.style.opacity = '1';
            this.element.style.transition = 'opacity 0.5s ease-in-out';
        }, 50);
        
        this.isActive = true;
        
        // Executar função de entrada
        setTimeout(() => {
            this.config.onEnter();
            this.onEnter();
        }, 100);
        
        // Finalizar transição
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    // Esconder a tela
    hide() {
        this.element.style.display = 'none';
        this.element.style.opacity = '0';
        this.isActive = false;
        
        this.config.onExit();
        this.onExit();
    }
    
    // Ir para próxima tela
    nextScreen() {
        if (this.config.next && window.screenManager) {
            window.screenManager.showScreen(this.config.next);
        }
    }
    
    // Voltar para tela anterior
    previousScreen() {
        if (window.screenManager) {
            window.screenManager.previousScreen();
        }
    }
    
    // Esconder todas as telas
    hideAllScreens() {
        const allScreens = document.querySelectorAll('[id$="-screen"], #main, #tutorial, #ui');
        allScreens.forEach(screen => {
            screen.style.display = 'none';
            screen.style.opacity = '0';
        });
    }
    
    // Métodos para ser sobrescritos pelas classes filhas
    onEnter() {
        // Implementação padrão vazia
    }
    
    onExit() {
        // Implementação padrão vazia
    }
    
    // Verificar se a tela está ativa
    isScreenActive() {
        return this.isActive;
    }
    
    // Obter elemento da tela
    getElement() {
        return this.element;
    }
    
    // Obter configuração da tela
    getConfig() {
        return this.config;
    }
}

// Exportar para uso global
window.BaseScreen = BaseScreen;