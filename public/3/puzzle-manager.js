/**
 * Puzzle Manager - Nova Versão Modular
 * Sistema de Quebra-Cabeça usando arquitetura modular
 */

class PuzzleManager {
    constructor() {
        this.gameManager = new PuzzleGameManager();
    }
    
    // Iniciar o quebra-cabeça
    async startPuzzle() {
        await this.gameManager.startPuzzle();
    }
    
    // Resetar quebra-cabeça
    resetPuzzle() {
        this.gameManager.resetPuzzle();
    }
    
    // Voltar ao AR
    backToAR() {
        this.gameManager.backToAR();
    }
    
    // Simular conclusão do puzzle
    async simulatePuzzleCompletion() {
        await this.gameManager.simulatePuzzleCompletion();
    }
    
    // Verificar se o puzzle está ativo
    isPuzzleActive() {
        return this.gameManager.isPuzzleActive();
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
    window.puzzleManager = new PuzzleManager();
        console.log('✅ PuzzleManager inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar PuzzleManager:', error);
    }
});

// Expor função para iniciar quebra-cabeça
window.startPuzzle = () => {
    if (window.puzzleManager) {
        window.puzzleManager.startPuzzle();
    } else {
        console.error('❌ PuzzleManager não encontrado');
    }
}; 