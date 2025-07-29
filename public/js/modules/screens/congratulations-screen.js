/**
 * Congratulations Screen - Tela de Parabéns
 * Tela exibida após completar o puzzle com sucesso
 */

class CongratulationsScreen extends BaseScreen {
    constructor() {
        super('congratulations-screen', {
            next: 'main',
            onEnter: () => this.handleEnter(),
            onExit: () => this.handleExit()
        });
    }
    
    onInit() {
        // Configurações específicas da tela de parabéns
        this.setupCongratulationsElements();
        this.setupCongratulationsControls();
    }
    
    setupCongratulationsElements() {
        // Configurar elementos da tela de parabéns
        this.congratulationsMessage = this.element.querySelector('#congratulations-message');
        this.scoreDisplay = this.element.querySelector('#score-display');
        this.timeDisplay = this.element.querySelector('#time-display');
        this.starsDisplay = this.element.querySelector('#stars-display');
    }
    
    setupCongratulationsControls() {
        // Configurar controles da tela de parabéns
        this.setupPlayAgainButton();
        this.setupMainMenuButton();
        this.setupShareButton();
    }
    
    setupPlayAgainButton() {
        const playAgainButton = this.element.querySelector('#play-again');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                this.playAgain();
            });
        }
    }
    
    setupMainMenuButton() {
        const mainMenuButton = this.element.querySelector('#main-menu');
        if (mainMenuButton) {
            mainMenuButton.addEventListener('click', () => {
                this.goToMainMenu();
            });
        }
    }
    
    setupShareButton() {
        const shareButton = this.element.querySelector('#share-result');
        if (shareButton) {
            shareButton.addEventListener('click', () => {
                this.shareResult();
            });
        }
    }
    
    handleEnter() {
        // Lógica específica ao entrar na tela de parabéns
        console.log('🎉 Entrou na tela de parabéns');
        
        // Configurar dados da vitória
        this.setupVictoryData();
        
        // Configurar animações de entrada
        this.setupCongratulationsAnimations();
        
        // Tocar som de vitória
        this.playVictorySound();
        
        // Mostrar confetes
        this.showConfetti();
    }
    
    handleExit() {
        // Lógica específica ao sair da tela de parabéns
        console.log('👋 Saiu da tela de parabéns');
        
        // Parar animações
        this.stopConfetti();
        
        // Limpar animações
        this.cleanupAnimations();
    }
    
    setupVictoryData() {
        // Configurar dados da vitória
        this.victoryData = {
            score: this.calculateScore(),
            time: this.getCompletionTime(),
            stars: this.calculateStars(),
            date: new Date().toLocaleDateString()
        };
        
        this.updateDisplays();
    }
    
    calculateScore() {
        // Calcular pontuação baseada no tempo e precisão
        const baseScore = 1000;
        const timeBonus = Math.max(0, 500 - this.getCompletionTime() * 10);
        const accuracyBonus = 200; // Assumindo 100% de precisão
        
        return baseScore + timeBonus + accuracyBonus;
    }
    
    getCompletionTime() {
        // Obter tempo de conclusão (em segundos)
        if (window.puzzleManager && window.puzzleManager.getCompletionTime) {
            return window.puzzleManager.getCompletionTime();
        }
        return 60; // Tempo padrão
    }
    
    calculateStars() {
        // Calcular estrelas baseadas na pontuação
        const score = this.victoryData.score;
        if (score >= 1500) return 3;
        if (score >= 1200) return 2;
        return 1;
    }
    
    updateDisplays() {
        // Atualizar displays com dados da vitória
        if (this.congratulationsMessage) {
            this.congratulationsMessage.textContent = '🎉 Parabéns! Você completou o puzzle!';
        }
        
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `Pontuação: ${this.victoryData.score}`;
        }
        
        if (this.timeDisplay) {
            const minutes = Math.floor(this.victoryData.time / 60);
            const seconds = this.victoryData.time % 60;
            this.timeDisplay.textContent = `Tempo: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (this.starsDisplay) {
            this.starsDisplay.innerHTML = '⭐'.repeat(this.victoryData.stars);
        }
    }
    
    playAgain() {
        // Jogar novamente
        console.log('🔄 Jogando novamente');
        
        // Resetar puzzle
        if (window.puzzleManager) {
            window.puzzleManager.resetPuzzle();
        }
        
        // Voltar para a tela UI
        if (window.screenManager) {
            window.screenManager.showScreen('ui');
        }
    }
    
    goToMainMenu() {
        // Ir para o menu principal
        console.log('🏠 Indo para o menu principal');
        
        if (window.screenManager) {
            window.screenManager.showScreen('main');
        }
    }
    
    shareResult() {
        // Compartilhar resultado
        console.log('📤 Compartilhando resultado');
        
        const shareText = `🎉 Completei o puzzle em ${this.victoryData.time}s com ${this.victoryData.score} pontos! ${'⭐'.repeat(this.victoryData.stars)}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Puzzle Completo!',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback para copiar para clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showShareFeedback();
            });
        }
    }
    
    showShareFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: rgba(0, 255, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        `;
        
        feedback.textContent = '📋 Resultado copiado!';
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }
    
    playVictorySound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Melodia de vitória
            const notes = [523, 659, 784, 1047]; // C, E, G, C
            let currentTime = audioContext.currentTime;
            
            notes.forEach((frequency, index) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.setValueAtTime(frequency, currentTime);
                gain.gain.setValueAtTime(0.3, currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
                
                osc.start(currentTime);
                osc.stop(currentTime + 0.3);
                
                currentTime += 0.2;
            });
        } catch (error) {
            // Som não disponível
        }
    }
    
    showConfetti() {
        // Criar confetes animados
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfetti();
            }, i * 100);
        }
    }
    
    createConfetti() {
        const confetti = document.createElement('div');
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.cssText = `
            position: fixed;
            top: -10px;
            left: ${Math.random() * 100}%;
            width: 10px;
            height: 10px;
            background: ${color};
            border-radius: 50%;
            z-index: 9999;
            pointer-events: none;
            animation: confettiFall 3s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3000);
    }
    
    stopConfetti() {
        // Parar confetes
        const confettiElements = document.querySelectorAll('[style*="confettiFall"]');
        confettiElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
    
    setupCongratulationsAnimations() {
        // Configurar animações de entrada da tela de parabéns
        const congratulationsElements = this.element.querySelectorAll('.congratulations-element');
        congratulationsElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 200);
        });
    }
    
    cleanupAnimations() {
        // Limpar animações da tela de parabéns
        const congratulationsElements = this.element.querySelectorAll('.congratulations-element');
        congratulationsElements.forEach(element => {
            element.classList.remove('visible');
        });
    }
}

// Exportar para uso global
window.CongratulationsScreen = CongratulationsScreen;