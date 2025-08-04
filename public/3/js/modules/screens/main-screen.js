/**
 * Main Screen - Tela Principal
 * Primeira tela da aplicação com botão de início
 */

class MainScreen extends BaseScreen {
    constructor() {
        super('main', {
            next: 'tutorial',
            onEnter: () => this.handleEnter(),
            onExit: () => this.handleExit()
        });
    }
    
    onInit() {
        // Configurações específicas da tela principal
        this.setupMainButton();
    }
    
    setupMainButton() {
        const mainButton = this.element.querySelector('#main-button');
        if (mainButton) {
            mainButton.addEventListener('click', () => {
                this.nextScreen();
            });
        }
    }
    
    handleEnter() {
        // Lógica específica ao entrar na tela principal
        console.log('🎮 Entrou na tela principal');
        
        // Resetar estado da aplicação se necessário
        this.resetApplicationState();
        
        // Configurar animações de entrada se houver
        this.setupEntranceAnimations();
    }
    
    handleExit() {
        // Lógica específica ao sair da tela principal
        console.log('👋 Saiu da tela principal');
        
        // Limpar animações se necessário
        this.cleanupAnimations();
    }
    
    resetApplicationState() {
        // Resetar estado global da aplicação
        if (window.puzzleManager) {
            // Resetar puzzle se estiver ativo
            if (window.puzzleManager.isPuzzleActive()) {
                window.puzzleManager.backToAR();
            }
        }
        
        // Limpar peças fotografadas
        if (window.resetPhotographedPieces) {
            window.resetPhotographedPieces();
        }
        
        // Limpar todas as peças visíveis
        if (window.clearAllPecas) {
            window.clearAllPecas();
        }
    }
    
    setupEntranceAnimations() {
        // Configurar animações de entrada se necessário
        const elements = this.element.querySelectorAll('.animate-on-enter');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animated');
            }, index * 200);
        });
    }
    
    cleanupAnimations() {
        // Limpar classes de animação
        const elements = this.element.querySelectorAll('.animate-on-enter');
        elements.forEach(element => {
            element.classList.remove('animated');
        });
    }
}

// Exportar para uso global
window.MainScreen = MainScreen;