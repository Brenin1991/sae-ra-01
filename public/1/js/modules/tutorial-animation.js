/**
 * Tutorial Animation Manager - Gerenciador de Animação do Tutorial
 * Controla a sequência animada das imagens do tutorial
 */

class TutorialAnimationManager {
    constructor() {
        this.currentFrame = 0;
        this.totalFrames = 4;
        this.animationSpeed = 2000; // 2 segundos por frame
        this.isPlaying = false;
        this.animationInterval = null;
        this.tutorialImage = null;
        
        this.init();
    }
    
    init() {
        this.tutorialImage = document.getElementById('tutorial-animation');
        if (this.tutorialImage) {
            console.log('🎬 Tutorial Animation Manager inicializado');
            this.startAnimation();
        } else {
            console.error('❌ Elemento tutorial-animation não encontrado');
        }
    }
    
    startAnimation() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentFrame = 0;
        
        console.log('🎬 Iniciando animação do tutorial');
        
        // Mostrar primeiro frame
        this.showFrame(1);
        
        // Iniciar loop de animação
        this.animationInterval = setInterval(() => {
            this.nextFrame();
        }, this.animationSpeed);
    }
    
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.isPlaying = false;
        console.log('⏹️ Animação do tutorial parada');
    }
    
    nextFrame() {
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        const frameNumber = this.currentFrame + 1;
        
        this.showFrame(frameNumber);
    }
    
    showFrame(frameNumber) {
        if (!this.tutorialImage) return;
        
        // Formatar número do frame com zero à esquerda
        const frameString = frameNumber.toString().padStart(2, '0');
        const newSrc = `assets/textures/tutorial/${frameString}.png`;
        
        // Verificar se a imagem existe antes de trocar
        const img = new Image();
        img.onload = () => {
            // Fade out
            this.tutorialImage.style.opacity = '0';
            
            setTimeout(() => {
                // Trocar imagem
                this.tutorialImage.src = newSrc;
                
                // Fade in
                setTimeout(() => {
                    this.tutorialImage.style.opacity = '1';
                }, 50);
                
                console.log(`🎬 Frame ${frameNumber} exibido: ${newSrc}`);
            }, 150);
        };
        img.onerror = () => {
            console.warn(`⚠️ Imagem não encontrada: ${newSrc}`);
            // Se a imagem não existir, voltar para o frame 1
            if (frameNumber > 1) {
                this.showFrame(1);
            }
        };
        img.src = newSrc;
    }
    
    // Método para pausar a animação
    pauseAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        console.log('⏸️ Animação do tutorial pausada');
    }
    
    // Método para retomar a animação
    resumeAnimation() {
        if (!this.isPlaying) return;
        
        this.animationInterval = setInterval(() => {
            this.nextFrame();
        }, this.animationSpeed);
        console.log('▶️ Animação do tutorial retomada');
    }
    
    // Método para definir velocidade da animação
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
        
        // Se estiver rodando, reiniciar com nova velocidade
        if (this.isPlaying && this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = setInterval(() => {
                this.nextFrame();
            }, this.animationSpeed);
        }
        
        console.log(`⚡ Velocidade da animação alterada para ${speed}ms`);
    }
    
    // Método para ir para um frame específico
    goToFrame(frameNumber) {
        if (frameNumber < 1 || frameNumber > this.totalFrames) {
            console.warn(`⚠️ Frame ${frameNumber} inválido. Deve ser entre 1 e ${this.totalFrames}`);
            return;
        }
        
        this.currentFrame = frameNumber - 1;
        this.showFrame(frameNumber);
        console.log(`🎬 Indo para frame ${frameNumber}`);
    }
    
    // Método para verificar se está rodando
    isAnimationPlaying() {
        return this.isPlaying;
    }
    
    // Método para obter frame atual
    getCurrentFrame() {
        return this.currentFrame + 1;
    }
    
    // Método para destruir o manager
    destroy() {
        this.stopAnimation();
        this.tutorialImage = null;
        console.log('🗑️ Tutorial Animation Manager destruído');
    }
}

// Criar instância global quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.tutorialAnimation = new TutorialAnimationManager();
});

// Exportar para uso global
window.TutorialAnimationManager = TutorialAnimationManager; 