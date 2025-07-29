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
            }, 100);
        }
        
        // Remover peça da área de peças
        piece.style.display = 'none';
        
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
        this.feedbackManager.showIncorrectPlacementFeedback();
    }
    
    // Completar o quebra-cabeça
    completePuzzle() {
        this.isPuzzleComplete = true;
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Feedback visual de conclusão
        this.feedbackManager.showCompletionFeedback();
        
        // Mostrar resultado após um delay maior
        setTimeout(() => {
            this.resultManager.showResult(this.dataManager.getPuzzleConfig());
        }, 1500);
        
        // Mostrar tela de parabéns após um delay muito maior
        setTimeout(() => {
            this.feedbackManager.showCongratulationsScreen(timeTaken, this.completedPieces);
        }, 6000);
    }
    
    // Mostrar tela do quebra-cabeça
    showPuzzleScreen() {
        const puzzleScreen = document.getElementById('puzzle-screen');
        console.log('🎮 Tentando mostrar tela do puzzle...');
        console.log('🎮 Elemento puzzle-screen encontrado:', !!puzzleScreen);
        
        if (puzzleScreen) {
            console.log('🎮 Estado atual do puzzle-screen:');
            console.log('  - display:', puzzleScreen.style.display);
            console.log('  - opacity:', puzzleScreen.style.opacity);
            console.log('  - visibility:', puzzleScreen.style.visibility);
            console.log('  - classes:', puzzleScreen.className);
            
            puzzleScreen.classList.add('ativo');
            puzzleScreen.style.setProperty('display', 'flex', 'important');
            puzzleScreen.style.setProperty('opacity', '1', 'important');
            puzzleScreen.style.setProperty('visibility', 'visible', 'important');
            
            console.log('🎮 Estado após ativação:');
            console.log('  - display:', puzzleScreen.style.display);
            console.log('  - opacity:', puzzleScreen.style.opacity);
            console.log('  - visibility:', puzzleScreen.style.visibility);
            console.log('  - classes:', puzzleScreen.className);
            console.log('🎮 Tela do puzzle ativada');
        } else {
            console.error('❌ Elemento puzzle-screen não encontrado');
        }
        
        // Esconder tela UI
        const uiScreen = document.getElementById('ui');
        if (uiScreen) {
            uiScreen.style.setProperty('display', 'none', 'important');
            uiScreen.style.setProperty('opacity', '0', 'important');
            console.log('👁️ Tela UI escondida');
        }
    }
    
    // Esconder tela do quebra-cabeça
    hidePuzzleScreen() {
        const puzzleScreen = document.getElementById('puzzle-screen');
        if (puzzleScreen) {
            puzzleScreen.classList.remove('ativo');
            puzzleScreen.style.display = 'none';
            puzzleScreen.style.opacity = '0';
            console.log('👋 Tela do puzzle desativada');
        }
        
        // Reativar tela UI
        const uiScreen = document.getElementById('ui');
        if (uiScreen) {
            uiScreen.style.display = 'block';
            uiScreen.style.opacity = '1';
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
}

// Exportar para uso global
window.PuzzleGameManager = PuzzleGameManager;