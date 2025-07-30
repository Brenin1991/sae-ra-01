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
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 150);
        });
        
        // Adicionar animação de entrada da tela
        this.element.style.opacity = '0';
        this.element.style.transform = 'scale(0.95)';
        this.element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        
        setTimeout(() => {
            this.element.style.opacity = '1';
            this.element.style.transform = 'scale(1)';
        }, 100);
        
        // Adicionar CSS para animação de confete
        if (!document.getElementById('confetti-css')) {
            const style = document.createElement('style');
            style.id = 'confetti-css';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                
                .puzzle-element {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.3s ease-out, transform 0.3s ease-out;
                }
                
                .puzzle-element.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .dragging {
                    cursor: grabbing !important;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
                }
                
                .highlight {
                    border: 3px solid #4CAF50 !important;
                    box-shadow: 0 0 15px rgba(76, 175, 80, 0.5) !important;
                }
                
                .valid-target {
                    border-color: #4CAF50 !important;
                    background-color: rgba(76, 175, 80, 0.1) !important;
                }
                
                .invalid-target {
                    border-color: #f44336 !important;
                    background-color: rgba(244, 67, 54, 0.1) !important;
                }
                
                .correct {
                    border-color: #4CAF50 !important;
                    background-color: rgba(76, 175, 80, 0.2) !important;
                }
                
                .piece-placed {
                    animation: piecePlaced 0.6s ease-out;
                }
                
                @keyframes piecePlaced {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
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