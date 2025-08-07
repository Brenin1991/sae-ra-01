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
        
        // Configurar animações de entrada
        this.setupTutorialAnimations();
    }
    
    handleExit() {
        // Lógica específica ao sair do tutorial
        console.log('📖 Saiu do tutorial');
        
        // Parar narração se estiver tocando
        window.SoundManager.stopCurrentSound();
        
        // Limpar animações
        this.cleanupAnimations();
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