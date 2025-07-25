/**
 * Puzzle Manager - Sistema de Quebra-Cabeça
 * Gerencia a lógica do jogo de quebra-cabeça com drag and drop
 */

class PuzzleManager {
    constructor() {
        this.puzzleData = null;
        this.pieces = [];
        this.targets = [];
        this.draggedPiece = null;
        this.startTime = null;
        this.completedPieces = 0;
        this.totalPieces = 0;
        this.isPuzzleComplete = false;
        
        this.init();
    }
    
    init() {
        console.log('🧩 Puzzle Manager inicializado');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Botões do quebra-cabeça
        document.getElementById('reset-puzzle')?.addEventListener('click', () => this.resetPuzzle());
        document.getElementById('back-to-ar')?.addEventListener('click', () => this.backToAR());
        
        // Botões de parabéns
        document.getElementById('play-again')?.addEventListener('click', () => this.playAgain());
        document.getElementById('back-to-main')?.addEventListener('click', () => this.backToMain());
        
        // Eventos de drag and drop
        this.setupDragAndDrop();
    }
    
    setupDragAndDrop() {
        // Prevenir comportamento padrão de drag
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }
    
    // Carregar dados do quebra-cabeça
    async loadPuzzleData(phaseName = 'fase1') {
        try {
            const response = await fetch('assets/data/data.json');
            const data = await response.json();
            
            if (data[phaseName] && data[phaseName].quebracabeca) {
                this.puzzleData = data[phaseName].quebracabeca;
                this.totalPieces = this.puzzleData.length;
                console.log(`🧩 Dados do quebra-cabeça carregados: ${this.totalPieces} peças`);
                return true;
            } else {
                console.error('❌ Dados do quebra-cabeça não encontrados');
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados do quebra-cabeça:', error);
            return false;
        }
    }
    
    // Iniciar o quebra-cabeça
    async startPuzzle() {
        console.log('🧩 Iniciando quebra-cabeça...');
        
        const success = await this.loadPuzzleData();
        if (!success) {
            console.error('❌ Falha ao carregar dados do quebra-cabeça');
            return;
        }
        
        this.startTime = Date.now();
        this.completedPieces = 0;
        this.isPuzzleComplete = false;
        
        this.createPuzzleElements();
        this.showPuzzleScreen();
        
        console.log('🧩 Quebra-cabeça iniciado com sucesso');
    }
    
    // Criar elementos do quebra-cabeça
    createPuzzleElements() {
        this.createPieces();
        this.createTargets();
    }
    
    // Criar peças arrastáveis
    createPieces() {
        const piecesContainer = document.getElementById('puzzle-pieces');
        if (!piecesContainer) return;
        
        piecesContainer.innerHTML = '';
        this.pieces = [];
        
        this.puzzleData.forEach((pieceData, index) => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.draggable = true;
            piece.dataset.pieceId = pieceData.id;
            piece.dataset.pieceIndex = index;
            
            const img = document.createElement('img');
            img.src = pieceData.peca;
            img.alt = `Peça ${pieceData.id}`;
            img.onerror = () => {
                console.warn(`⚠️ Imagem da peça ${pieceData.id} não carregou`);
                piece.innerHTML = `<span style="color: #666;">Peça ${pieceData.id}</span>`;
            };
            
            piece.appendChild(img);
            
            // Eventos de drag
            piece.addEventListener('dragstart', (e) => this.onDragStart(e, piece));
            piece.addEventListener('dragend', (e) => this.onDragEnd(e, piece));
            
            piecesContainer.appendChild(piece);
            this.pieces.push(piece);
        });
        
        console.log(`🧩 ${this.pieces.length} peças criadas`);
    }
    
    // Criar áreas de destino
    createTargets() {
        const targetsContainer = document.getElementById('puzzle-targets');
        if (!targetsContainer) return;
        
        targetsContainer.innerHTML = '';
        this.targets = [];
        
        this.puzzleData.forEach((pieceData, index) => {
            const target = document.createElement('div');
            target.className = 'puzzle-target';
            target.dataset.targetId = pieceData.id;
            target.dataset.targetIndex = index;
            
            const img = document.createElement('img');
            img.src = pieceData.target;
            img.alt = `Target ${pieceData.id}`;
            img.onerror = () => {
                console.warn(`⚠️ Imagem do target ${pieceData.id} não carregou`);
                target.innerHTML = `<span style="color: rgba(255,255,255,0.7);">Target ${pieceData.id}</span>`;
            };
            
            target.appendChild(img);
            
            // Eventos de drop
            target.addEventListener('dragover', (e) => this.onDragOver(e, target));
            target.addEventListener('dragleave', (e) => this.onDragLeave(e, target));
            target.addEventListener('drop', (e) => this.onDrop(e, target));
            
            targetsContainer.appendChild(target);
            this.targets.push(target);
        });
        
        console.log(`🧩 ${this.targets.length} targets criados`);
    }
    
    // Eventos de drag and drop
    onDragStart(e, piece) {
        this.draggedPiece = piece;
        piece.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', piece.outerHTML);
        
        console.log(`🧩 Iniciando drag da peça ${piece.dataset.pieceId}`);
    }
    
    onDragEnd(e, piece) {
        piece.style.opacity = '1';
        this.draggedPiece = null;
        
        // Remover highlights de todos os targets
        this.targets.forEach(target => target.classList.remove('highlight'));
        
        console.log(`🧩 Finalizando drag da peça ${piece.dataset.pieceId}`);
    }
    
    onDragOver(e, target) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Verificar se é o target correto
        if (this.draggedPiece && this.draggedPiece.dataset.pieceId === target.dataset.targetId) {
            target.classList.add('highlight');
        }
    }
    
    onDragLeave(e, target) {
        target.classList.remove('highlight');
    }
    
    onDrop(e, target) {
        e.preventDefault();
        target.classList.remove('highlight');
        
        if (!this.draggedPiece) return;
        
        // Verificar se é o target correto
        if (this.draggedPiece.dataset.pieceId === target.dataset.targetId) {
            this.placePieceInTarget(this.draggedPiece, target);
        } else {
            console.log('❌ Peça incorreta para este target');
            this.showIncorrectPlacementFeedback();
        }
    }
    
    // Colocar peça no target correto
    placePieceInTarget(piece, target) {
        console.log(`✅ Peça ${piece.dataset.pieceId} colocada corretamente!`);
        
        // Marcar target como correto
        target.classList.add('correct');
        target.classList.remove('highlight');
        
        // Remover peça da área de peças
        piece.style.display = 'none';
        
        // Incrementar contador
        this.completedPieces++;
        
        // Verificar se o quebra-cabeça foi completado
        if (this.completedPieces >= this.totalPieces) {
            this.completePuzzle();
        }
        
        // Feedback visual e sonoro
        this.showCorrectPlacementFeedback();
    }
    
    // Mostrar feedback de colocação correta
    showCorrectPlacementFeedback() {
        // Efeito visual
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 4000;
            animation: feedbackFade 1s ease-out forwards;
        `;
        feedback.textContent = '✅ Correto!';
        
        document.body.appendChild(feedback);
        
        // Remover após animação
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
        
        // Som de sucesso (se disponível)
        this.playSuccessSound();
    }
    
    // Mostrar feedback de colocação incorreta
    showIncorrectPlacementFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(244, 67, 54, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 4000;
            animation: feedbackFade 1s ease-out forwards;
        `;
        feedback.textContent = '❌ Incorreto!';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
    }
    
    // Completar o quebra-cabeça
    completePuzzle() {
        console.log('🎉 Quebra-cabeça completado!');
        
        this.isPuzzleComplete = true;
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Mostrar tela de parabéns
        this.showCongratulationsScreen(timeTaken);
    }
    
    // Mostrar tela de parabéns
    showCongratulationsScreen(timeTaken) {
        // Atualizar estatísticas
        document.getElementById('total-pieces-completed').textContent = this.completedPieces;
        document.getElementById('time-taken').textContent = timeTaken;
        
        // Mostrar tela
        const congratulationsScreen = document.getElementById('congratulations-screen');
        if (congratulationsScreen) {
            congratulationsScreen.style.display = 'flex';
        }
        
        // Som de vitória
        this.playVictorySound();
        
        console.log(`🎉 Parabéns! Completou em ${timeTaken} segundos`);
    }
    
    // Mostrar tela do quebra-cabeça
    showPuzzleScreen() {
        const puzzleScreen = document.getElementById('puzzle-screen');
        if (puzzleScreen) {
            puzzleScreen.style.display = 'flex';
        }
        
        // Esconder tela UI
        const uiScreen = document.getElementById('ui');
        if (uiScreen) {
            uiScreen.style.display = 'none';
        }
        
        console.log('🧩 Tela UI desativada, quebra-cabeça ativado');
    }
    
    // Esconder tela do quebra-cabeça
    hidePuzzleScreen() {
        const puzzleScreen = document.getElementById('puzzle-screen');
        if (puzzleScreen) {
            puzzleScreen.style.display = 'none';
        }
        
        // Reativar tela UI
        const uiScreen = document.getElementById('ui');
        if (uiScreen) {
            uiScreen.style.display = 'block';
        }
        
        console.log('🧩 Tela UI reativada, quebra-cabeça desativado');
    }
    
    // Esconder tela de parabéns
    hideCongratulationsScreen() {
        const congratulationsScreen = document.getElementById('congratulations-screen');
        if (congratulationsScreen) {
            congratulationsScreen.style.display = 'none';
        }
    }
    
    // Resetar quebra-cabeça
    resetPuzzle() {
        console.log('🔄 Resetando quebra-cabeça...');
        
        // Resetar estado
        this.completedPieces = 0;
        this.isPuzzleComplete = false;
        this.startTime = Date.now();
        
        // Recriar elementos
        this.createPuzzleElements();
        
        console.log('🔄 Quebra-cabeça resetado');
    }
    
    // Voltar ao AR
    backToAR() {
        console.log('⬅️ Voltando ao AR...');
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
    
    // Jogar novamente
    playAgain() {
        console.log('🔄 Jogando novamente...');
        this.hideCongratulationsScreen();
        this.resetPuzzle();
    }
    
    // Voltar ao início
    backToMain() {
        console.log('🏠 Voltando ao início...');
        this.hideCongratulationsScreen();
        
        // Notificar sistema principal
        if (window.screenManager) {
            window.screenManager.showScreen('main');
        }
    }
    
    // Tocar som de sucesso
    playSuccessSound() {
        try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('🔊 Som de sucesso não disponível');
        }
    }
    
    // Tocar som de vitória
    playVictorySound() {
        try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Sequência de notas
            const notes = [523, 659, 784, 1047]; // C, E, G, C (oitava)
            let time = audioContext.currentTime;
            
            notes.forEach((freq, index) => {
                oscillator.frequency.setValueAtTime(freq, time + index * 0.2);
                gainNode.gain.setValueAtTime(0.3, time + index * 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + index * 0.2 + 0.1);
            });
            
            oscillator.start(time);
            oscillator.stop(time + notes.length * 0.2);
        } catch (error) {
            console.log('🔊 Som de vitória não disponível');
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.puzzleManager = new PuzzleManager();
});

// Expor função para iniciar quebra-cabeça
window.startPuzzle = () => {
    if (window.puzzleManager) {
        window.puzzleManager.startPuzzle();
    }
}; 