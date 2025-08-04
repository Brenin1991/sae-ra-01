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
        
        // Usar rgba para transparência correta
        piece.style.opacity = '0.5';
        piece.style.transform = 'scale(1.1)';
        piece.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', piece.outerHTML);
    }
    
    onDragEnd(e, piece) {
        // Restaurar estilo original
        piece.style.opacity = '1';
        piece.style.transform = 'scale(1)';
        piece.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        
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
            target.style.transform = 'scale(1.05)';
            target.style.transition = 'transform 0.2s ease';
        } else {
            target.classList.add('invalid');
            target.style.transform = 'scale(0.95)';
            target.style.transition = 'transform 0.2s ease';
        }
    }
    
    onDragLeave(e, target) {
        target.classList.remove('highlight', 'invalid');
        target.style.transform = 'scale(1)';
        target.style.transition = 'transform 0.2s ease';
    }
    
    onDrop(e, target) {
        e.preventDefault();
        target.classList.remove('highlight', 'invalid');
        target.style.transform = 'scale(1)';
        target.style.transition = 'transform 0.2s ease';
        
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