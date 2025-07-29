/**
 * Result Manager - Gerenciador de Resultado
 * Responsável por mostrar e gerenciar o resultado do puzzle
 */

class ResultManager {
    constructor(elementManager) {
        this.elementManager = elementManager;
    }
    
    // Mostrar resultado do quebra-cabeça
    showResult(puzzleConfig) {
        const resultadoElement = document.getElementById('puzzle-resultado');
        if (!resultadoElement) {
            console.error('❌ Elemento puzzle-resultado não encontrado');
            return;
        }
        
        if (!puzzleConfig) {
            console.error('❌ Configuração do puzzle não encontrada');
            return;
        }
        
        // Esconder todas as peças e targets
        this.elementManager.hidePieces();
        this.elementManager.hideTargets();
        
        // Garantir que o elemento está visível e com z-index alto
        resultadoElement.style.display = 'block';
        resultadoElement.style.visibility = 'visible';
        resultadoElement.style.zIndex = '1000';
        
        // Pré-carregar a imagem para garantir que ela existe
        const img = new Image();
        img.onload = () => {
            // Definir imagem de resultado
            resultadoElement.style.backgroundImage = `url('${puzzleConfig.resultado}')`;
            
            // Forçar reflow para garantir que a imagem seja carregada
            resultadoElement.offsetHeight;
            
            // Ativar com animação após delay maior
            setTimeout(() => {
                resultadoElement.classList.add('ativo');
            }, 1000);
        };
        
        img.onerror = () => {
            console.error('❌ Erro ao carregar imagem de resultado:', puzzleConfig.resultado);
            // Fallback: mostrar mensagem de erro
            resultadoElement.innerHTML = '<div style="color: white; text-align: center; padding: 20px; font-size: 1.2em;">🎉 Quebra-Cabeça Completo!</div>';
            resultadoElement.classList.add('ativo');
        };
        
        img.src = puzzleConfig.resultado;
    }
    
    // Limpar resultado
    clearResult() {
        const resultadoElement = document.getElementById('puzzle-resultado');
        if (!resultadoElement) return;
        
        // Remover classe ativo
        resultadoElement.classList.remove('ativo');
        
        // Restaurar peças e targets
        this.elementManager.showPieces();
        this.elementManager.showTargets();
        
        // Limpar imagem após transição
        setTimeout(() => {
            resultadoElement.style.backgroundImage = 'none';
            resultadoElement.innerHTML = '';
        }, 500);
    }
    
    // Método para testar o resultado
    testResult(puzzleConfig) {
        // Forçar configuração se não existir
        if (!puzzleConfig) {
            puzzleConfig = {
                resultado: 'assets/textures/fase1/quebracabeca/fase1-resultado.png'
            };
        }
        
        this.showResult(puzzleConfig);
    }
}

// Exportar para uso global
window.ResultManager = ResultManager;