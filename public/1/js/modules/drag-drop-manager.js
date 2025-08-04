/**
 * Drag Drop Manager - Gerenciador de Drag and Drop Melhorado
 * Sistema de movimento livre e responsivo para peças
 */

class DragDropManager {
    constructor(elementManager, gameManager) {
        this.elementManager = elementManager;
        this.gameManager = gameManager;
        this.draggedPiece = null;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.setupTouchAndMouseEvents();
    }
    
    setupTouchAndMouseEvents() {
        // Prevenir comportamento padrão de drag
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
        
        // Adicionar listeners globais para mouse e touch
        document.addEventListener('mousemove', (e) => this.onMove(e));
        document.addEventListener('touchmove', (e) => this.onMove(e), { passive: false });
        document.addEventListener('mouseup', (e) => this.onEnd(e));
        document.addEventListener('touchend', (e) => this.onEnd(e));
    }
    
    // Configurar eventos de movimento para uma peça
    setupPieceMoveEvents(piece) {
        // Mouse events
        piece.addEventListener('mousedown', (e) => this.onStart(e, piece));
        
        // Touch events
        piece.addEventListener('touchstart', (e) => this.onStart(e, piece), { passive: false });
        
        // Prevenir drag padrão
        piece.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Tornar peça movível
        piece.style.position = 'relative';
        piece.style.cursor = 'grab';
        piece.style.userSelect = 'none';
        piece.style.touchAction = 'none';
        piece.style.zIndex = '99999999';
    }
    
    // Configurar eventos de drop para um target
    setupTargetDropEvents(target) {
        // Remover eventos de drag padrão
        target.addEventListener('dragover', (e) => e.preventDefault());
        target.addEventListener('drop', (e) => e.preventDefault());
        
        // Adicionar eventos de hover para feedback visual
        target.addEventListener('mouseenter', (e) => this.onTargetHover(e, target));
        target.addEventListener('mouseleave', (e) => this.onTargetLeave(e, target));
    }
    
    // Eventos de início de movimento
    onStart(e, piece) {
        e.preventDefault();
        
        this.draggedPiece = piece;
        this.isDragging = true;
        
        // Obter posição inicial
        const rect = piece.getBoundingClientRect();
        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        
        this.startX = clientX - rect.left;
        this.startY = clientY - rect.top;
        
        // Configurar estilo da peça
        piece.style.position = 'fixed';
        piece.style.zIndex = '999999999';
        piece.style.cursor = 'grabbing';
        piece.style.transform = 'scale(1.1) rotate(5deg)';
        piece.style.transition = 'transform 0.2s ease';
        piece.style.pointerEvents = 'none';
        
        // Feedback visual
        piece.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
        
        console.log('🎯 Iniciando movimento da peça:', piece.dataset.pieceId);
    }
    
    // Eventos de movimento
    onMove(e) {
        if (!this.isDragging || !this.draggedPiece) return;
        
        e.preventDefault();
        
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        
        // Calcular nova posição
        const newX = clientX - this.startX;
        const newY = clientY - this.startY;
        
        // Aplicar movimento
        this.draggedPiece.style.left = `${newX}px`;
        this.draggedPiece.style.top = `${newY}px`;
        
        // Verificar sobreposição com targets
        this.checkTargetOverlap();
    }
    
    // Eventos de fim de movimento
    onEnd(e) {
        if (!this.isDragging || !this.draggedPiece) return;
        
        e.preventDefault();
        
        // Encontrar target sobreposto
        const target = this.findOverlappingTarget();
        
        if (target) {
            // Verificar se é o target correto
            if (this.draggedPiece.dataset.pieceId === target.dataset.targetId) {
                this.gameManager.placePieceInTarget(this.draggedPiece, target);
            } else {
                this.gameManager.showIncorrectPlacementFeedback();
                this.returnPieceToOriginalPosition();
            }
        } else {
            // Retornar peça à posição original
            this.returnPieceToOriginalPosition();
        }
        
        // Limpar estado
        this.resetDragState();
    }
    
    // Verificar sobreposição com targets
    checkTargetOverlap() {
        if (!this.draggedPiece) return;
        
        const pieceRect = this.draggedPiece.getBoundingClientRect();
        const targets = this.elementManager.getTargets();
        
        targets.forEach(target => {
            const targetRect = target.getBoundingClientRect();
            
            // Verificar sobreposição
            const isOverlapping = !(pieceRect.right < targetRect.left || 
                                   pieceRect.left > targetRect.right || 
                                   pieceRect.bottom < targetRect.top || 
                                   pieceRect.top > targetRect.bottom);
            
            if (isOverlapping) {
                // Verificar se é o target correto
                if (this.draggedPiece.dataset.pieceId === target.dataset.targetId) {
                    target.classList.add('highlight');
                    target.style.transform = 'scale(1.05)';
                    target.style.transition = 'transform 0.2s ease';
                } else {
                    target.classList.add('invalid');
                    target.style.transform = 'scale(0.95)';
                    target.style.transition = 'transform 0.2s ease';
                }
            } else {
                target.classList.remove('highlight', 'invalid');
                target.style.transform = 'scale(1)';
                target.style.transition = 'transform 0.2s ease';
            }
        });
    }
    
    // Encontrar target sobreposto
    findOverlappingTarget() {
        if (!this.draggedPiece) return null;
        
        const pieceRect = this.draggedPiece.getBoundingClientRect();
        const targets = this.elementManager.getTargets();
        
        for (const target of targets) {
            const targetRect = target.getBoundingClientRect();
            
            // Verificar sobreposição
            const isOverlapping = !(pieceRect.right < targetRect.left || 
                                   pieceRect.left > targetRect.right || 
                                   pieceRect.bottom < targetRect.top || 
                                   pieceRect.top > targetRect.bottom);
            
            if (isOverlapping) {
                return target;
            }
        }
        
        return null;
    }
    
    // Retornar peça à posição original
    returnPieceToOriginalPosition() {
        if (!this.draggedPiece) return;
        
        this.draggedPiece.style.position = 'relative';
        this.draggedPiece.style.left = '';
        this.draggedPiece.style.top = '';
        this.draggedPiece.style.zIndex = '';
        this.draggedPiece.style.cursor = 'grab';
        this.draggedPiece.style.transform = 'scale(1)';
        this.draggedPiece.style.transition = 'all 0.3s ease';
        this.draggedPiece.style.pointerEvents = 'auto';
        this.draggedPiece.style.boxShadow = '';
        
        // Animar retorno
        setTimeout(() => {
            if (this.draggedPiece) {
                this.draggedPiece.style.transform = 'scale(1)';
            }
        }, 50);
    }
    
    // Resetar estado de drag
    resetDragState() {
        // Limpar highlights de todos os targets
        this.elementManager.getTargets().forEach(target => {
            target.classList.remove('highlight', 'invalid');
            target.style.transform = 'scale(1)';
            target.style.transition = 'transform 0.2s ease';
        });
        
        this.draggedPiece = null;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
    }
    
    // Eventos de hover do target (para feedback visual)
    onTargetHover(e, target) {
        if (!this.isDragging) {
            target.style.transform = 'scale(1.02)';
            target.style.transition = 'transform 0.2s ease';
        }
    }
    
    onTargetLeave(e, target) {
        if (!this.isDragging) {
            target.style.transform = 'scale(1)';
            target.style.transition = 'transform 0.2s ease';
        }
    }
}

// Exportar para uso global
window.DragDropManager = DragDropManager;