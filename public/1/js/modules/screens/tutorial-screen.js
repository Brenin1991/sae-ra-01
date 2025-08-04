/**
 * Tutorial Screen - Tela de Tutorial
 * Tela intermediária com instruções e botão de narração
 */

class TutorialScreen extends BaseScreen {
    constructor() {
        super('tutorial', {
            next: 'ui',
            onEnter: () => this.handleEnter(),
            onExit: () => this.handleExit()
        });
    }
    
    onInit() {
        // Configurações específicas da tela de tutorial
        this.setupTutorialButton();
        this.setupNarracaoButton();
        this.setupSkipButton();
    }
    
    setupTutorialButton() {
        const tutorialButton = this.element.querySelector('#tutorial-button');
        if (tutorialButton) {
            tutorialButton.addEventListener('click', () => {
                this.nextScreen();
            });
        }
    }
    
    setupNarracaoButton() {
        const narracaoButton = this.element.querySelector('#narracao-button');
        if (narracaoButton) {
            narracaoButton.addEventListener('click', () => {
                this.toggleNarracao();
            });
        }
    }
    
    setupSkipButton() {
        const skipButton = this.element.querySelector('#skip-tutorial');
        if (skipButton) {
            skipButton.addEventListener('click', () => {
                this.skipTutorial();
            });
        }
    }
    
    handleEnter() {
        // Lógica específica ao entrar no tutorial
        console.log('📚 Entrou no tutorial');
        
        // Iniciar narração automática se configurado
        this.startAutoNarracao();
        
        // Configurar animações de entrada
        this.setupTutorialAnimations();
    }
    
    handleExit() {
        // Lógica específica ao sair do tutorial
        console.log('📖 Saiu do tutorial');
        
        // Parar narração se estiver tocando
        this.stopNarracao();
        
        // Limpar animações
        this.cleanupAnimations();
    }
    
    toggleNarracao() {
        if (this.isNarracaoPlaying) {
            this.stopNarracao();
        } else {
            this.playNarracao();
        }
    }
    
    playNarracao() {
        // Implementar reprodução de narração
        console.log('🔊 Reproduzindo narração...');
        this.isNarracaoPlaying = true;
        
        // Atualizar botão
        const narracaoButton = this.element.querySelector('#narracao-button');
        if (narracaoButton) {
            narracaoButton.textContent = '⏸️ Pausar';
        }
    }
    
    stopNarracao() {
        // Parar narração
        console.log('🔇 Narração pausada');
        this.isNarracaoPlaying = false;
        
        // Atualizar botão
        const narracaoButton = this.element.querySelector('#narracao-button');
        if (narracaoButton) {
            narracaoButton.textContent = '🔊 Ouvir';
        }
    }
    
    startAutoNarracao() {
        // Iniciar narração automaticamente após um delay
        setTimeout(() => {
            if (this.isScreenActive()) {
                this.playNarracao();
            }
        }, 1000);
    }
    
    skipTutorial() {
        // Pular tutorial e ir direto para a UI
        console.log('⏭️ Tutorial pulado');
        this.nextScreen();
    }
    
    setupTutorialAnimations() {
        // Configurar animações específicas do tutorial
        const tutorialElements = this.element.querySelectorAll('.tutorial-step');
        tutorialElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 500);
        });
    }
    
    cleanupAnimations() {
        // Limpar animações do tutorial
        const tutorialElements = this.element.querySelectorAll('.tutorial-step');
        tutorialElements.forEach(element => {
            element.classList.remove('visible');
        });
    }
}

// Exportar para uso global
window.TutorialScreen = TutorialScreen;