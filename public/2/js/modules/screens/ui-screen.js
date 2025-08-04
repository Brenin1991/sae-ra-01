/**
 * UI Screen - Tela de Interface AR
 * Tela principal da experiência AR com câmera e interações
 */

class UIScreen extends BaseScreen {
    constructor() {
        super('ui', {
            next: null, // Última tela
            onEnter: () => this.handleEnter(),
            onExit: () => this.handleExit()
        });
    }
    
    onInit() {
        // Configurações específicas da tela UI
        this.setupUIElements();
        this.setupCameraControls();
        this.setupPuzzleIntegration();
    }
    
    setupUIElements() {
        // Configurar elementos da UI
        this.setupPhotoCounter();
        this.setupCameraButton();
        this.setupClearButton();
        this.setupModeToggle();
    }
    
    setupPhotoCounter() {
        // Configurar contador de fotos
        this.photoCounter = this.element.querySelector('#photo-counter');
        this.photoCount = this.element.querySelector('#photo-count');
        this.totalPieces = this.element.querySelector('#total-pieces');
    }
    
    setupCameraButton() {
        const cameraButton = document.getElementById('camera-icon');
        console.log('🔍 Procurando botão da câmera:', cameraButton);
        if (cameraButton) {
            console.log('✅ Botão da câmera encontrado, configurando evento...');
            cameraButton.addEventListener('click', () => {
                console.log('📸 Clique no botão da câmera detectado!');
                this.takePhoto();
            });
        } else {
            console.error('❌ Botão da câmera não encontrado!');
        }
    }
    
    setupClearButton() {
        const clearButton = document.getElementById('clearPecas');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearAllPieces();
            });
        }
    }
    
    setupModeToggle() {
        const toggleButton = document.getElementById('toggleMode');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleARMode();
            });
        }
    }
    
    setupCameraControls() {
        // Configurar controles de câmera
        this.cameraInitialized = false;
        this.currentStream = null;
    }
    
    setupPuzzleIntegration() {
        // Configurar integração com o sistema de puzzle
        this.puzzleReady = false;
    }
    
    handleEnter() {
        // Lógica específica ao entrar na UI
        console.log('📱 Entrou na tela UI (AR)');
        
        // Inicializar câmera
        this.initializeCamera();
        
        // Carregar dados do jogo
        this.loadGameData();
        
        // Configurar sistema de fotografia
        this.setupPhotoSystem();
        
        // Resetar estado
        this.resetUIState();
        
        // Configurar animações de entrada
        this.setupUIAnimations();
    }
    
    handleExit() {
        // Lógica específica ao sair da UI
        console.log('🛑 Saiu da tela UI (AR)');
        
        // Parar câmera
        this.stopCamera();
        
        // Limpar peças
        this.clearAllPieces();
        
        // Resetar estado
        this.resetPhotographedPieces();
        
        // Limpar animações
        this.cleanupAnimations();
    }
    
    initializeCamera() {
        if (this.cameraInitialized) return;
        
        // Inicializar webcam
        if (window.initWebcam) {
            window.initWebcam();
            this.cameraInitialized = true;
        }
    }
    
    loadGameData() {
        // Carregar dados do jogo
        if (window.loadGameData) {
            window.loadGameData();
        }
    }
    
    setupPhotoSystem() {
        // Configurar sistema de fotografia
        this.photographedPieces = new Set();
        this.updatePhotoCounter();
    }
    
    resetUIState() {
        // Resetar estado da UI
        this.photographedPieces = new Set();
        this.updatePhotoCounter();
        
        // Resetar peças fotografadas
        if (window.resetPhotographedPieces) {
            window.resetPhotographedPieces();
        }
    }
    
    takePhoto() {
        // Tirar foto usando as funções globais do script.js
        console.log('📸 Foto tirada!');
        
        // Usar as funções globais do script.js
        if (window.triggerCameraFlash) {
            console.log('✅ Chamando triggerCameraFlash...');
            window.triggerCameraFlash();
        } else {
            console.error('❌ triggerCameraFlash não encontrada!');
        }
        
        if (window.playCameraSound) {
            console.log('✅ Chamando playCameraSound...');
            window.playCameraSound();
        } else {
            console.error('❌ playCameraSound não encontrada!');
        }
        
        if (window.vibrateDevice) {
            console.log('✅ Chamando vibrateDevice...');
            window.vibrateDevice();
        } else {
            console.error('❌ vibrateDevice não encontrada!');
        }
        
        // Chamar checkVisiblePieces APENAS UMA VEZ
        if (window.checkVisiblePieces) {
            console.log('✅ Chamando checkVisiblePieces...');
            window.checkVisiblePieces();
        } else {
            console.error('❌ checkVisiblePieces não encontrada!');
        }
    }
    
    triggerCameraFlash() {
        // Usar APENAS a função global do script.js
        if (window.triggerCameraFlash) {
            window.triggerCameraFlash();
        } else {
            console.error('❌ Função triggerCameraFlash não encontrada no script.js');
        }
    }
    

    
    markPieceAsPhotographed(piece) {
        // Usar APENAS a função global do script.js
        if (window.markPieceAsPhotographed) {
            window.markPieceAsPhotographed(piece);
        } else {
            console.error('❌ Função markPieceAsPhotographed não encontrada no script.js');
        }
    }
    
    isPiecePhotographed(piece) {
        // Usar APENAS a função global do script.js
        if (window.isPiecePhotographed) {
            return window.isPiecePhotographed(piece);
        } else {
            console.error('❌ Função isPiecePhotographed não encontrada no script.js');
            return false;
        }
    }
    
    updatePhotoCounter() {
        // Usar APENAS a função global do script.js
        if (window.updatePhotoCounter) {
            window.updatePhotoCounter();
        } else {
            console.error('❌ Função updatePhotoCounter não encontrada no script.js');
        }
    }
    
    startPuzzle() {
        // Iniciar quebra-cabeça após delay
        setTimeout(() => {
            if (window.puzzleManager) {
                window.puzzleManager.startPuzzle();
            }
        }, 2000);
    }
    
    clearAllPieces() {
        const pecas = document.querySelectorAll('.peca-plane');
        pecas.forEach(peca => peca.remove());
    }
    
    resetPhotographedPieces() {
        this.photographedPieces.clear();
        
        const allPieces = document.querySelectorAll('.peca-plane');
        allPieces.forEach(piece => {
            piece.classList.remove('photographed');
            const material = piece.getAttribute('material');
            if (material) {
                piece.setAttribute('material', {
                    ...material,
                    opacity: 1.0,
                    transparent: true
                });
            }
        });
        
        this.updatePhotoCounter();
    }
    
    toggleARMode() {
        // Alternar entre modo AR e HDRI
        if (window.toggleMode) {
            window.toggleMode();
        }
    }
    
    playCameraSound() {
        // Usar APENAS a função global do script.js
        if (window.playCameraSound) {
            window.playCameraSound();
        } else {
            console.error('❌ Função playCameraSound não encontrada no script.js');
        }
    }
    
    vibrateDevice() {
        // Usar APENAS a função global do script.js
        if (window.vibrateDevice) {
            window.vibrateDevice();
        } else {
            console.error('❌ Função vibrateDevice não encontrada no script.js');
        }
    }
    
    showPhotoFeedback(success, pieceCount) {
        // Usar APENAS a função global do script.js
        if (window.showPhotoFeedback) {
            window.showPhotoFeedback(success, pieceCount);
        } else {
            console.error('❌ Função showPhotoFeedback não encontrada no script.js');
        }
    }
    
    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
    }
    
    setupUIAnimations() {
        // Configurar animações de entrada da UI
        const uiElements = this.element.querySelectorAll('.ui-element');
        uiElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 100);
        });
    }
    
    cleanupAnimations() {
        // Limpar animações da UI
        const uiElements = this.element.querySelectorAll('.ui-element');
        uiElements.forEach(element => {
            element.classList.remove('visible');
        });
    }
}

// Exportar para uso global
window.UIScreen = UIScreen;