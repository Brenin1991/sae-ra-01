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
        
        // Feedback visual imediato
        target.classList.add('correct');
        target.style.transform = 'scale(1.1)';
        target.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            target.style.transform = 'scale(1)';
        }, 300);
        
        // Mostrar a imagem da peça no target
        const puzzleData = this.dataManager.getPuzzleData();
        const pieceData = puzzleData.find(p => p.id === piece.dataset.pieceId);
        if (pieceData) {
            // Limpar conteúdo anterior do target
            target.innerHTML = '';
            
            // Criar imagem da peça
            const pieceImg = document.createElement('img');
            pieceImg.src = pieceData.peca;
            pieceImg.alt = `Peça ${pieceData.id} montada`;
            pieceImg.style.cssText = `
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
                transform: scale(0.8);
            `;
            
            // Aplicar tamanho original da peça
            pieceImg.onload = () => {
                const originalWidth = pieceImg.naturalWidth;
                const originalHeight = pieceImg.naturalHeight;
                
                // Aplicar dimensões originais
                pieceImg.style.width = `${originalWidth}px`;
                pieceImg.style.height = `${originalHeight}px`;
            };
            
            target.appendChild(pieceImg);
            
            // Animar entrada da imagem
            setTimeout(() => {
                pieceImg.style.opacity = '1';
                pieceImg.style.transform = 'scale(1)';
                pieceImg.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
            }, 100);
        }
        
        // Animar saída da peça original
        piece.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        piece.style.opacity = '0';
        piece.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            piece.style.display = 'none';
        }, 300);
        
        // Incrementar contador
        this.completedPieces++;
        
        // Verificar se o quebra-cabeça foi completado
        if (this.completedPieces >= this.dataManager.getTotalPieces()) {
            this.completePuzzle();
        }
        
        // Feedback visual e sonoro
        this.feedbackManager.showCorrectPlacementFeedback();
    }
    
    // Mostrar feedback de colocação incorreta
    showIncorrectPlacementFeedback() {
        // Feedback visual de erro
        if (this.draggedPiece) {
            this.draggedPiece.style.transition = 'transform 0.3s ease';
            this.draggedPiece.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                this.draggedPiece.style.transform = 'scale(1)';
            }, 300);
        }
        
        this.feedbackManager.showIncorrectPlacementFeedback();
    }
    
    // Completar o quebra-cabeça
    completePuzzle() {
        this.isPuzzleComplete = true;
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Feedback visual de conclusão
        this.feedbackManager.showCompletionFeedback();
        
        // Animar todos os targets como completos
        this.elementManager.getTargets().forEach((target, index) => {
            setTimeout(() => {
                target.style.transform = 'scale(1.1)';
                target.style.transition = 'transform 0.3s ease';
                
                setTimeout(() => {
                    target.style.transform = 'scale(1)';
                }, 300);
            }, index * 200);
        });
        
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
        
        // Animar reset dos targets
        this.elementManager.getTargets().forEach((target, index) => {
            setTimeout(() => {
                target.style.transform = 'scale(0.9)';
                target.style.transition = 'transform 0.2s ease';
                
                setTimeout(() => {
                    target.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });
        
        // Recriar elementos após animação
        setTimeout(() => {
            this.createPuzzleElements();
        }, 500);
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