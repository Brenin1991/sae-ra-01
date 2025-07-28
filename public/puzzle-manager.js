/**
 * Puzzle Manager - Sistema de Quebra-Cabeça
 * Gerencia a lógica do jogo de quebra-cabeça com drag and drop
 */

class PuzzleManager {
    constructor() {
        this.puzzleData = null;
        this.puzzleConfig = null;
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
            
            console.log('🔍 Dados completos carregados:', data);
            
            if (data[phaseName] && data[phaseName].quebracabeca) {
                const quebracabeca = data[phaseName].quebracabeca;
                
                console.log('🔍 Array quebracabeca completo:', quebracabeca);
                
                // Separar configuração (primeiro item) das peças (resto)
                this.puzzleConfig = quebracabeca[0];
                this.puzzleData = quebracabeca.slice(1);
                this.totalPieces = this.puzzleData.length;
                
                console.log(`🧩 Dados do quebra-cabeça carregados: ${this.totalPieces} peças`);
                console.log(`🧩 Base: ${this.puzzleConfig.base}`);
                console.log(`🧩 Resultado: ${this.puzzleConfig.resultado}`);
                console.log('🔍 Peças com posições:', this.puzzleData);
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
        this.setupBase();
        this.createPieces();
        this.createTargets();
    }
    
    // Configurar imagem de base
    setupBase() {
        const targetsContainer = document.getElementById('puzzle-targets');
        if (!targetsContainer || !this.puzzleConfig) return;
        
        // Definir imagem de base como fundo
        targetsContainer.style.backgroundImage = `url('${this.puzzleConfig.base}')`;
        console.log(`🧩 Base configurada: ${this.puzzleConfig.base}`);
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
        
        console.log('🔍 Dados das peças para posicionamento:', this.puzzleData);
        
        this.puzzleData.forEach((pieceData, index) => {
            const target = document.createElement('div');
            target.className = 'puzzle-target';
            target.dataset.targetId = pieceData.id;
            target.dataset.targetIndex = index;
            
            console.log(`🔍 Verificando peça ${pieceData.id}:`, pieceData);
            
            // Aplicar posição customizada se disponível
            if (pieceData.position) {
                target.style.left = `${pieceData.position.x}px`;
                target.style.top = `${pieceData.position.y}px`;
                console.log(`✅ Target ${pieceData.id} posicionado em (${pieceData.position.x}, ${pieceData.position.y})`);
                
                // Verificar se a posição foi aplicada
                setTimeout(() => {
                    const computedLeft = window.getComputedStyle(target).left;
                    const computedTop = window.getComputedStyle(target).top;
                    console.log(`🔍 Target ${pieceData.id} - CSS aplicado: left=${computedLeft}, top=${computedTop}`);
                }, 100);
            } else {
                console.warn(`⚠️ Peça ${pieceData.id} não tem posição definida`);
            }
            
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
        
        console.log(`🧩 ${this.targets.length} targets criados com posições customizadas`);
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
        
        // Mostrar a imagem da peça no target
        const pieceData = this.puzzleData.find(p => p.id === piece.dataset.pieceId);
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
                
                console.log(`🖼️ Peça ${pieceData.id} com tamanho original: ${originalWidth}x${originalHeight}`);
            };
            
            target.appendChild(pieceImg);
            
            // Animar entrada da imagem
            setTimeout(() => {
                pieceImg.style.opacity = '1';
            }, 100);
            
            console.log(`🖼️ Imagem da peça ${pieceData.id} mostrada no target`);
        }
        
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
        
        // Feedback visual de conclusão
        this.showCompletionFeedback();
        
        // Mostrar resultado após um pequeno delay
        setTimeout(() => {
            this.showResult();
        }, 500);
        
        // Mostrar tela de parabéns após um delay maior
        setTimeout(() => {
            this.showCongratulationsScreen(timeTaken);
        }, 4000); // Aumentado para 4 segundos
    }
    
    // Mostrar feedback de conclusão
    showCompletionFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(76, 175, 80, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 5000;
            animation: feedbackFade 1.5s ease-out forwards;
            text-align: center;
        `;
        feedback.innerHTML = '🎉<br>Quebra-Cabeça<br>Completo!';
        
        document.body.appendChild(feedback);
        
        // Remover após animação
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1500);
    }
    
    // Mostrar resultado do quebra-cabeça
    showResult() {
        const resultadoElement = document.getElementById('puzzle-resultado');
        if (!resultadoElement || !this.puzzleConfig) {
            console.error('❌ Elemento de resultado não encontrado ou configuração ausente');
            return;
        }
        
        console.log(`🎉 Tentando mostrar resultado: ${this.puzzleConfig.resultado}`);
        
        // Garantir que o elemento está visível
        resultadoElement.style.display = 'block';
        resultadoElement.style.visibility = 'visible';
        
        // Pré-carregar a imagem para garantir que ela existe
        const img = new Image();
        img.onload = () => {
            console.log('✅ Imagem de resultado carregada com sucesso');
            
            // Definir imagem de resultado
            resultadoElement.style.backgroundImage = `url('${this.puzzleConfig.resultado}')`;
            
            // Forçar reflow para garantir que a imagem seja carregada
            resultadoElement.offsetHeight;
            
            // Ativar com animação
            setTimeout(() => {
                resultadoElement.classList.add('ativo');
                console.log('✅ Classe "ativo" adicionada ao resultado');
                
                // Verificar se a classe foi aplicada
                setTimeout(() => {
                    const isActive = resultadoElement.classList.contains('ativo');
                    const opacity = window.getComputedStyle(resultadoElement).opacity;
                    console.log(`🔍 Verificação: classe ativo = ${isActive}, opacity = ${opacity}`);
                }, 100);
            }, 300);
        };
        
        img.onerror = () => {
            console.error('❌ Erro ao carregar imagem de resultado:', this.puzzleConfig.resultado);
            // Fallback: mostrar mensagem de erro
            resultadoElement.innerHTML = '<div style="color: white; text-align: center; padding: 20px;">🎉 Quebra-Cabeça Completo!</div>';
            resultadoElement.classList.add('ativo');
        };
        
        img.src = this.puzzleConfig.resultado;
        
        console.log(`🎉 Resultado configurado: ${this.puzzleConfig.resultado}`);
    }
    
    // Limpar resultado
    clearResult() {
        const resultadoElement = document.getElementById('puzzle-resultado');
        if (!resultadoElement) return;
        
        // Remover classe ativo
        resultadoElement.classList.remove('ativo');
        
        // Limpar imagem após transição
        setTimeout(() => {
            resultadoElement.style.backgroundImage = 'none';
            resultadoElement.innerHTML = '';
        }, 500);
        
        console.log('🧹 Resultado limpo');
    }
    
    // Método para testar o resultado (debug)
    testResult() {
        console.log('🧪 Testando resultado...');
        this.showResult();
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
        
        // Limpar resultado
        this.clearResult();
        
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

// Expor função para testar resultado (debug)
window.testResult = () => {
    if (window.puzzleManager) {
        window.puzzleManager.testResult();
    }
}; 