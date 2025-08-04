/**
 * Data Manager - Gerenciador de Dados
 * Responsável por carregar e gerenciar dados do puzzle
 */

class DataManager {
    constructor() {
        this.puzzleData = null;
        this.puzzleConfig = null;
        this.totalPieces = 0;
    }
    
    // Carregar dados do quebra-cabeça
    async loadPuzzleData(phaseName = 'fase1') {
        try {
            const response = await fetch('assets/data/data.json');
            const data = await response.json();
            
            if (data[phaseName] && data[phaseName].quebracabeca) {
                const quebracabeca = data[phaseName].quebracabeca;
                
                // Separar configuração (primeiro item) das peças (resto)
                this.puzzleConfig = quebracabeca[0];
                this.puzzleData = quebracabeca.slice(1);
                this.totalPieces = this.puzzleData.length;
                
                console.log(`🧩 Dados carregados: ${this.totalPieces} peças`);
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
    
    // Obter dados das peças
    getPuzzleData() {
        return this.puzzleData;
    }
    
    // Obter configuração do puzzle
    getPuzzleConfig() {
        return this.puzzleConfig;
    }
    
    // Obter total de peças
    getTotalPieces() {
        return this.totalPieces;
    }
    
    // Verificar se dados estão carregados
    isDataLoaded() {
        return this.puzzleConfig !== null && this.puzzleData !== null;
    }
}

// Exportar para uso global
window.DataManager = DataManager;