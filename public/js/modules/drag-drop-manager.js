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
        
        // Aplicar transparência corretamente
        piece.style.opacity = '0.6';
        piece.style.transform = 'scale(1.1)';
        piece.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        piece.style.zIndex = '1000';
        
        // Adicionar classe para feedback visual
        piece.classList.add('dragging');
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', piece.outerHTML);
        
        // Feedback sonoro
        this.playDragSound();
    }
    
    onDragEnd(e, piece) {
        // Restaurar aparência original
        piece.style.opacity = '1';
        piece.style.transform = 'scale(1)';
        piece.style.zIndex = 'auto';
        piece.classList.remove('dragging');
        
        this.draggedPiece = null;
        
        // Remover highlights de todos os targets
        this.elementManager.getTargets().forEach(target => {
            target.classList.remove('highlight');
            target.classList.remove('valid-target');
            target.classList.remove('invalid-target');
        });
    }
    
    onDragOver(e, target) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Verificar se é o target correto
        if (this.draggedPiece && this.draggedPiece.dataset.pieceId === target.dataset.targetId) {
            target.classList.add('highlight');
            target.classList.add('valid-target');
            target.classList.remove('invalid-target');
        } else {
            target.classList.add('highlight');
            target.classList.add('invalid-target');
            target.classList.remove('valid-target');
        }
    }
    
    onDragLeave(e, target) {
        target.classList.remove('highlight');
        target.classList.remove('valid-target');
        target.classList.remove('invalid-target');
    }
    
    onDrop(e, target) {
        e.preventDefault();
        target.classList.remove('highlight');
        target.classList.remove('valid-target');
        target.classList.remove('invalid-target');
        
        if (!this.draggedPiece) return;
        
        // Verificar se é o target correto
        if (this.draggedPiece.dataset.pieceId === target.dataset.targetId) {
            this.gameManager.placePieceInTarget(this.draggedPiece, target);
            this.playCorrectDropSound();
        } else {
            this.gameManager.showIncorrectPlacementFeedback();
            this.playIncorrectDropSound();
        }
    }
    
    // Funções de feedback sonoro
    playDragSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Som não disponível
        }
    }
    
    playCorrectDropSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Som não disponível
        }
    }
    
    playIncorrectDropSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            // Som não disponível
        }
    }
}

// Exportar para uso global
window.DragDropManager = DragDropManager;