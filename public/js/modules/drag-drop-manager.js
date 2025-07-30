/**
 * Drag Drop Manager - Gerenciador de Drag and Drop
 * Responsável por gerenciar eventos de arrastar e soltar
 */

class DragDropManager {
    constructor(elementManager, gameManager) {
        this.elementManager = elementManager;
        this.gameManager = gameManager;
        this.draggedPiece = null;
        
        this.setupDragAndDrop();
    }
    
    setupDragAndDrop() {
        // Prevenir comportamento padrão de drag
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }
    
    // Configurar eventos de drag para uma peça
    setupPieceDragEvents(piece) {
        piece.addEventListener('dragstart', (e) => this.onDragStart(e, piece));
        piece.addEventListener('dragend', (e) => this.onDragEnd(e, piece));
    }
    
    // Configurar eventos de drop para um target
    setupTargetDropEvents(target) {
        target.addEventListener('dragover', (e) => this.onDragOver(e, target));
        target.addEventListener('dragleave', (e) => this.onDragLeave(e, target));
        target.addEventListener('drop', (e) => this.onDrop(e, target));
    }
    
    // Eventos de drag and drop
    onDragStart(e, piece) {
        this.draggedPiece = piece;
        // Removido: piece.style.opacity = '0.5'; - estava causando fundo preto
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', piece.outerHTML);
    }
    
    onDragEnd(e, piece) {
        // Removido: piece.style.opacity = '1'; - não é mais necessário
        this.draggedPiece = null;
        
        // Remover highlights de todos os targets
        this.elementManager.getTargets().forEach(target => target.classList.remove('highlight'));
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
            this.gameManager.placePieceInTarget(this.draggedPiece, target);
        } else {
            this.gameManager.showIncorrectPlacementFeedback();
        }
    }
}

// Exportar para uso global
window.DragDropManager = DragDropManager;