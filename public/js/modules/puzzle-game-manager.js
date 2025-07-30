/**
 * Puzzle Game Manager - Gerenciador Principal do Jogo
 * Coordena todos os outros módulos do puzzle
 */

class PuzzleGameManager {
    constructor() {
        this.dataManager = new DataManager();
        this.elementManager = new ElementManager();
        this.resultManager = new ResultManager(this.elementManager);
        this.feedbackManager = new FeedbackManager();
        this.dragDropManager = null; // Será inicializado após criar elementos
        
        this.startTime = null;
        this.completedPieces = 0;
        this.isPuzzleComplete = false;
    }
    
    // Iniciar o quebra-cabeça
    async startPuzzle() {
        const success = await this.dataManager.loadPuzzleData();
        if (!success) {
            console.error('❌ Falha ao carregar dados do quebra-cabeça');
            return;
        }
        
        this.startTime = Date.now();
        this.completedPieces = 0;
        this.isPuzzleComplete = false;
        
        this.createPuzzleElements();
        this.showPuzzleScreen();
        
        // Adicionar listener para tecla de simulação
        this.setupSimulationKey();
    }
    
    // Configurar tecla para simular montagem completa
    setupSimulationKey() {
        const handleKeyPress = (event) => {
            // Tecla 'C' para completar puzzle
            if (event.key.toLowerCase() === 'c') {
                console.log('🎮 Tecla C pressionada - Simulando montagem completa');
                this.simulatePuzzleCompletion();
            }
        };
        
        // Adicionar listener
        document.addEventListener('keydown', handleKeyPress);
        
        // Armazenar referência para remover depois
        this.simulationKeyHandler = handleKeyPress;
    }
    
    // Remover listener de simulação
    removeSimulationKey() {
        if (this.simulationKeyHandler) {
            document.removeEventListener('keydown', this.simulationKeyHandler);
            this.simulationKeyHandler = null;
        }
    }
    
    // Criar elementos do quebra-cabeça
    createPuzzleElements() {
        const puzzleData = this.dataManager.getPuzzleData();
        const puzzleConfig = this.dataManager.getPuzzleConfig();
        
        this.elementManager.setupBase(puzzleConfig);
        this.elementManager.createPieces(puzzleData);
        this.elementManager.createTargets(puzzleData, puzzleConfig);
        
        // Configurar drag and drop após criar elementos
        this.dragDropManager = new DragDropManager(this.elementManager, this);
        
        // Configurar eventos de drag para todas as peças
        this.elementManager.getPieces().forEach(piece => {
            this.dragDropManager.setupPieceDragEvents(piece);
        });
        
        // Configurar eventos de drop para todos os targets
        this.elementManager.getTargets().forEach(target => {
            this.dragDropManager.setupTargetDropEvents(target);
        });
    }
    
    // Colocar peça no target correto
    placePieceInTarget(piece, target) {
        // Marcar target como correto
        this.elementManager.markTargetAsCorrect(piece.dataset.pieceId);
        
        // Adicionar classe de sucesso ao target
        target.classList.add('correct');
        target.classList.add('piece-placed');
        
        // Mostrar a imagem da peça no target
        const puzzleData = this.dataManager.getPuzzleData();
        const pieceData = puzzleData.find(p => p.id === piece.dataset.pieceId);
        if (pieceData) {
            // Limpar conteúdo anterior do target
            target.innerHTML = '';
            
            // Criar container para a peça
            const pieceContainer = document.createElement('div');
            pieceContainer.className = 'placed-piece';
            pieceContainer.style.cssText = `
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.6s ease-out;
            `;
            
            // Criar imagem da peça
            const pieceImg = document.createElement('img');
            pieceImg.src = pieceData.peca;
            pieceImg.alt = `Peça ${pieceData.id} montada`;
            pieceImg.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
            `;
            
            pieceContainer.appendChild(pieceImg);
            target.appendChild(pieceContainer);
            
            // Animar entrada da imagem (apenas fade, sem scale)
            setTimeout(() => {
                pieceContainer.style.opacity = '1';
            }, 100);
            
            // Adicionar efeito de brilho
            setTimeout(() => {
                pieceContainer.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) brightness(1.1)';
                setTimeout(() => {
                    pieceContainer.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))';
                }, 300);
            }, 600);
        }
        
        // Animar saída da peça original (apenas fade, sem scale)
        piece.style.opacity = '0';
        piece.style.transition = 'opacity 0.3s ease-out';
        
        setTimeout(() => {
            piece.style.display = 'none';
        }, 300);
        
        // Incrementar contador
        this.completedPieces++;
        
        // Atualizar progresso visual
        this.updateProgressVisual();
        
        // Verificar se o quebra-cabeça foi completado
        if (this.completedPieces >= this.dataManager.getTotalPieces()) {
            setTimeout(() => {
                this.completePuzzle();
            }, 800);
        }
        
        // Feedback visual e sonoro
        this.feedbackManager.showCorrectPlacementFeedback();
    }
    
    // Mostrar feedback de colocação incorreta
    showIncorrectPlacementFeedback() {
        this.feedbackManager.showIncorrectPlacementFeedback();
    }
    
    // Completar o quebra-cabeça
    completePuzzle() {
        this.isPuzzleComplete = true;
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Feedback visual de conclusão
        this.feedbackManager.showCompletionFeedback();
        
        // Obter configuração do puzzle
        const puzzleConfig = this.dataManager.getPuzzleConfig();
        console.log('🔧 Configuração do puzzle:', puzzleConfig);
        
        // Mostrar tela de parabéns após um delay
        setTimeout(() => {
            this.feedbackManager.showCongratulationsScreen(timeTaken, this.completedPieces, puzzleConfig);
        }, 1500);
    }
    
    // Mostrar tela do quebra-cabeça
    showPuzzleScreen() {
        console.log('🎮 Mostrando tela do puzzle via ScreenManager');
        
        if (window.screenManager) {
            window.screenManager.showScreen('puzzle');
        } else {
            console.error('❌ ScreenManager não disponível');
        }
    }
    
    // Esconder tela do quebra-cabeça
    hidePuzzleScreen() {
        console.log('👋 Escondendo tela do puzzle via ScreenManager');
        
        // Remover listener de simulação
        this.removeSimulationKey();
        
        // Voltar para tela UI
        if (window.screenManager) {
            window.screenManager.showScreen('ui');
        }
    }
    
    // Resetar quebra-cabeça
    resetPuzzle() {
        // Resetar estado
        this.completedPieces = 0;
        this.isPuzzleComplete = false;
        this.startTime = Date.now();
        
        // Limpar resultado
        this.resultManager.clearResult();
        
        // Recriar elementos
        this.createPuzzleElements();
    }
    
    // Voltar ao AR
    backToAR() {
        this.hidePuzzleScreen();
        
        // Reativar tela UI explicitamente
        const uiScreen = document.getElementById('ui');
        if (uiScreen) {
            uiScreen.style.display = 'block';
        }
        
        // Notificar sistema principal
        if (window.screenManager) {
            window.screenManager.showScreen('ui');
        }
    }
    
    // Verificar se o puzzle está ativo
    isPuzzleActive() {
        const puzzleScreen = document.getElementById('puzzle-screen');
        return puzzleScreen && puzzleScreen.style.display === 'flex';
    }
    
    // Atualizar progresso visual
    updateProgressVisual() {
        const totalPieces = this.dataManager.getTotalPieces();
        const progressPercentage = (this.completedPieces / totalPieces) * 100;
        
        // Atualizar barra de progresso se existir
        const progressBar = document.querySelector('.puzzle-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
        
        // Atualizar contador se existir
        const progressText = document.querySelector('.puzzle-progress-text');
        if (progressText) {
            progressText.textContent = `${this.completedPieces}/${totalPieces}`;
        }
        
        // Efeito de confete para peças importantes
        if (this.completedPieces === Math.floor(totalPieces / 2)) {
            this.showHalfwayConfetti();
        }
    }
    
    // Mostrar confete na metade do progresso
    showHalfwayConfetti() {
        // Criar confete simples
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 50);
        }
    }
    
    // Criar confete
    createConfetti() {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            left: ${Math.random() * window.innerWidth}px;
            top: -10px;
            animation: confettiFall 2s ease-in forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 2000);
    }
    
    // Simular conclusão do puzzle
    async simulatePuzzleCompletion() {
        // Garantir que os dados estão carregados
        if (!this.dataManager.isDataLoaded()) {
            await this.dataManager.loadPuzzleData();
        }
        
        // Simular que todas as peças foram colocadas
        this.completedPieces = this.dataManager.getTotalPieces();
        this.isPuzzleComplete = true;
        
        // Esconder todas as peças
        this.elementManager.hidePieces();
        
        // Marcar todos os targets como corretos
        this.elementManager.getTargets().forEach(target => {
            target.classList.add('correct');
        });
        
        // Completar o puzzle
        this.completePuzzle();
    }
    
    // Método de teste para verificar se tudo funciona
    testCompletePuzzle() {
        console.log('🧪 Testando conclusão do puzzle...');
        
        // Garantir que os dados estão carregados
        if (!this.dataManager.isDataLoaded()) {
            console.log('📊 Carregando dados do puzzle...');
            this.dataManager.loadPuzzleData().then(() => {
                this.completePuzzle();
            });
        } else {
            this.completePuzzle();
        }
    }
}

// Exportar para uso global
window.PuzzleGameManager = PuzzleGameManager;