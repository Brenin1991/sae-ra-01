/**
 * Element Manager - Gerenciador de Elementos
 * Responsável por criar e gerenciar peças e targets do puzzle
 */

class ElementManager {
    constructor() {
        this.pieces = [];
        this.targets = [];
    }
    
    // Criar peças arrastáveis
    createPieces(puzzleData) {
        const piecesContainer = document.getElementById('puzzle-pieces');
        if (!piecesContainer) return;
        
        piecesContainer.innerHTML = '';
        this.pieces = [];
        
        puzzleData.forEach((pieceData, index) => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.draggable = true;
            piece.dataset.pieceId = pieceData.id;
            piece.dataset.pieceIndex = index;
            
            const img = document.createElement('img');
            img.src = pieceData.peca;
            img.alt = `Peça ${pieceData.id}`;
            img.onerror = () => {
                piece.innerHTML = `<span style="color: #666;">Peça ${pieceData.id}</span>`;
            };
            
            piece.appendChild(img);
            piecesContainer.appendChild(piece);
            this.pieces.push(piece);
        });
        
        console.log(`🧩 ${this.pieces.length} peças criadas`);
    }
    
    // Criar áreas de destino
    createTargets(puzzleData, puzzleConfig) {
        const targetsContainer = document.getElementById('puzzle-targets');
        if (!targetsContainer) return;
        
        // Preservar o elemento puzzle-resultado antes de limpar
        const resultadoElement = targetsContainer.querySelector('#puzzle-resultado');
        
        targetsContainer.innerHTML = '';
        this.targets = [];
        
        // Restaurar o elemento puzzle-resultado se existia
        if (resultadoElement) {
            targetsContainer.appendChild(resultadoElement);
        }
        
        puzzleData.forEach((pieceData, index) => {
            const target = document.createElement('div');
            target.className = 'puzzle-target';
            target.dataset.targetId = pieceData.id;
            target.dataset.targetIndex = index;
            
            // Aplicar posição customizada se disponível
            if (pieceData.position) {
                target.style.left = `${pieceData.position.x}px`;
                target.style.top = `${pieceData.position.y}px`;
            }
            
            const img = document.createElement('img');
            img.src = pieceData.target;
            img.alt = `Target ${pieceData.id}`;
            img.onerror = () => {
                target.innerHTML = `<span style="color: rgba(255,255,255,0.7);">Target ${pieceData.id}</span>`;
            };
            
            target.appendChild(img);
            targetsContainer.appendChild(target);
            this.targets.push(target);
        });
        
        console.log(`🧩 ${this.targets.length} targets criados`);
    }
    
    // Configurar imagem de base
    setupBase(puzzleConfig) {
        const targetsContainer = document.getElementById('puzzle-targets');
        if (!targetsContainer || !puzzleConfig) return;
        
        targetsContainer.style.backgroundImage = `url('${puzzleConfig.base}')`;
    }
    
    // Esconder todas as peças
    hidePieces() {
        this.pieces.forEach(piece => {
            piece.style.display = 'none';
        });
    }
    
    // Esconder todos os targets
    hideTargets() {
        this.targets.forEach(target => {
            target.style.display = 'none';
        });
    }
    
    // Mostrar todas as peças
    showPieces() {
        this.pieces.forEach(piece => {
            piece.style.display = 'flex';
        });
    }
    
    // Mostrar todos os targets
    showTargets() {
        this.targets.forEach(target => {
            target.style.display = 'flex';
        });
    }
    
    // Marcar target como correto
    markTargetAsCorrect(targetId) {
        const target = this.targets.find(t => t.dataset.targetId === targetId);
        if (target) {
            target.classList.add('correct');
        }
    }
    
    // Obter peças
    getPieces() {
        return this.pieces;
    }
    
    // Obter targets
    getTargets() {
        return this.targets;
    }
}

// Exportar para uso global
window.ElementManager = ElementManager;