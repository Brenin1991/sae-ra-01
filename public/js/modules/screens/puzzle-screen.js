/**
 * Puzzle Screen - Tela do Quebra-Cabeça
 * Tela do jogo de quebra-cabeça
 */

class PuzzleScreen extends BaseScreen {
    constructor() {
        super('puzzle-screen', {
            next: 'ui',
            onEnter: () => this.handleEnter(),
            onExit: () => this.handleExit()
        });
    }
    
    onInit() {
        // Configurações específicas da tela de puzzle
        this.setupPuzzleElements();
        this.setupPuzzleControls();
    }
    
    setupPuzzleElements() {
        // Configurar elementos do puzzle
        this.piecesContainer = this.element.querySelector('#puzzle-pieces');
        this.targetsContainer = this.element.querySelector('#puzzle-targets');
        this.resultadoElement = this.element.querySelector('#puzzle-resultado');
    }
    
    setupPuzzleControls() {
        // Configurar controles do puzzle
        this.setupBackButton();
        this.setupResetButton();
    }
    
    setupBackButton() {
        const backButton = this.element.querySelector('#back-to-ar');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.backToAR();
            });
        }
    }
    
    setupResetButton() {
        const resetButton = this.element.querySelector('#reset-puzzle');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetPuzzle();
            });
        }
    }
    
    handleEnter() {
        // Lógica específica ao entrar na tela de puzzle
        console.log('🧩 Entrou na tela de puzzle');
        
        // Inicializar puzzle
        this.initializePuzzle();
        
        // Configurar animações de entrada
        this.setupPuzzleAnimations();
    }
    
    handleExit() {
        // Lógica específica ao sair da tela de puzzle
        console.log('👋 Saiu da tela de puzzle');
        
        // Limpar puzzle
        this.cleanupPuzzle();
        
        // Limpar animações
        this.cleanupAnimations();
    }
    
    initializePuzzle() {
        // Inicializar o puzzle sem chamar showPuzzleScreen novamente
        console.log('🧩 Inicializando puzzle...');
        
        if (window.puzzleManager && window.puzzleManager.gameManager) {
            // Chamar diretamente o método de inicialização sem mostrar tela
            window.puzzleManager.gameManager.createPuzzleElements();
        }
    }
    
    cleanupPuzzle() {
        // Limpar estado do puzzle
        if (window.puzzleManager) {
            // O puzzle manager já cuida da limpeza
        }
    }
    
    backToAR() {
        // Voltar para a tela AR
        console.log('⬅️ Voltando para AR');
        
        if (window.puzzleManager) {
            window.puzzleManager.backToAR();
        }
        
        // Mostrar tela UI
        if (window.screenManager) {
            window.screenManager.showScreen('ui');
        }
    }
    
    resetPuzzle() {
        // Resetar o puzzle
        console.log('🔄 Resetando puzzle');
        
        if (window.puzzleManager) {
            window.puzzleManager.resetPuzzle();
        }
    }
    
    setupPuzzleAnimations() {
        // Configurar animações de entrada do puzzle
        const puzzleElements = this.element.querySelectorAll('.puzzle-element');
        puzzleElements.forEach((element, index) => {
            // Inicializar estado
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            // Animar entrada
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 150);
        });
        
        // Animar peças e targets
        const pieces = this.element.querySelectorAll('.puzzle-piece');
        pieces.forEach((piece, index) => {
            piece.style.opacity = '0';
            piece.style.transform = 'scale(0.8)';
            piece.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            
            setTimeout(() => {
                piece.style.opacity = '1';
                piece.style.transform = 'scale(1)';
            }, 300 + (index * 100));
        });
        
        const targets = this.element.querySelectorAll('.puzzle-target');
        targets.forEach((target, index) => {
            target.style.opacity = '0';
            target.style.transform = 'scale(0.8)';
            target.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            
            setTimeout(() => {
                target.style.opacity = '1';
                target.style.transform = 'scale(1)';
            }, 500 + (index * 100));
        });
    }
    
    cleanupAnimations() {
        // Limpar animações do puzzle
        const puzzleElements = this.element.querySelectorAll('.puzzle-element');
        puzzleElements.forEach(element => {
            element.classList.remove('visible');
        });
    }
    
    // Método para verificar se o puzzle está ativo
    isPuzzleActive() {
        return this.isScreenActive();
    }
    
    // Método para obter elementos do puzzle
    getPuzzleElements() {
        return {
            pieces: this.piecesContainer,
            targets: this.targetsContainer,
            resultado: this.resultadoElement
        };
    }
}

// Exportar para uso global
window.PuzzleScreen = PuzzleScreen;