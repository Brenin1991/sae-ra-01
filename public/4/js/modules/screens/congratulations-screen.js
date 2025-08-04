/**
 * Congratulations Screen - Tela de Parabéns
 * Tela exibida após completar o puzzle com sucesso
 */

class CongratulationsScreen extends BaseScreen {
    constructor() {
        super('congratulations-screen', {
            next: 'main',
            onEnter: () => this.handleEnter(),
            onExit: () => this.handleExit()
        });
    }
    
    onInit() {
        // Configurações específicas da tela de parabéns
        this.setupCongratulationsControls();
    }
    
    setupCongratulationsControls() {
        // Configurar controles da tela de parabéns
        this.setupCertificadoButton();
    }
    
    setupCertificadoButton() {
        const certificadoButton = this.element.querySelector('#btn-certificado');
        if (certificadoButton) {
            certificadoButton.addEventListener('click', () => {
                this.openSelfieScreen();
            });
        }
    }
    
    openSelfieScreen() {
        console.log('📸 Abrindo tela de selfie...');
        
        if (window.screenManager) {
            window.screenManager.showScreen('selfie');
        }
    }
    
    handleEnter() {
        // Lógica específica ao entrar na tela de parabéns
        console.log('🎉 Entrou na tela de parabéns');
    }
    
    handleExit() {
        // Lógica específica ao sair da tela de parabéns
        console.log('👋 Saiu da tela de parabéns');
    }
}

// Exportar para uso global
window.CongratulationsScreen = CongratulationsScreen;