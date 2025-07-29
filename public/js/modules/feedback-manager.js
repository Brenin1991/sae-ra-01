/**
 * Feedback Manager - Gerenciador de Feedback
 * Responsável por feedback visual e sonoro
 */

class FeedbackManager {
    constructor() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Botões de parabéns
        document.getElementById('play-again')?.addEventListener('click', () => this.playAgain());
        document.getElementById('back-to-main')?.addEventListener('click', () => this.backToMain());
    }
    
    // Mostrar feedback de colocação correta
    showCorrectPlacementFeedback() {
        // Efeito visual
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 4000;
            animation: feedbackFade 1s ease-out forwards;
        `;
        feedback.textContent = '✅ Correto!';
        
        document.body.appendChild(feedback);
        
        // Remover após animação
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
        
        // Som de sucesso
        this.playSuccessSound();
    }
    
    // Mostrar feedback de colocação incorreta
    showIncorrectPlacementFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(244, 67, 54, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 4000;
            animation: feedbackFade 1s ease-out forwards;
        `;
        feedback.textContent = '❌ Incorreto!';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1000);
    }
    
    // Mostrar feedback de conclusão
    showCompletionFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(76, 175, 80, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 5000;
            animation: feedbackFade 1.5s ease-out forwards;
            text-align: center;
        `;
        feedback.innerHTML = '🎉<br>Quebra-Cabeça<br>Completo!';
        
        document.body.appendChild(feedback);
        
        // Remover após animação
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 1500);
    }
    
    // Mostrar tela de parabéns
    showCongratulationsScreen(timeTaken, completedPieces) {
        // Atualizar estatísticas
        document.getElementById('total-pieces-completed').textContent = completedPieces;
        document.getElementById('time-taken').textContent = timeTaken;
        
        // Mostrar tela usando o sistema modular
        if (window.screenManager) {
            window.screenManager.showScreen('congratulations');
        } else {
            // Fallback para o método antigo
            const congratulationsScreen = document.getElementById('congratulations-screen');
            if (congratulationsScreen) {
                congratulationsScreen.style.display = 'flex';
            }
        }
        
        // Som de vitória
        this.playVictorySound();
    }
    
    // Esconder tela de parabéns
    hideCongratulationsScreen() {
        // Usar o sistema modular se disponível
        if (window.screenManager && window.screenManager.getCurrentScreen()) {
            const currentScreen = window.screenManager.getCurrentScreen();
            if (currentScreen.name === 'congratulations') {
                window.screenManager.showScreen('main');
            }
        } else {
            // Fallback para o método antigo
            const congratulationsScreen = document.getElementById('congratulations-screen');
            if (congratulationsScreen) {
                congratulationsScreen.style.display = 'none';
            }
        }
    }
    
    // Tocar som de sucesso
    playSuccessSound() {
        try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Som não disponível
        }
    }
    
    // Tocar som de vitória
    playVictorySound() {
        try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Sequência de notas
            const notes = [523, 659, 784, 1047]; // C, E, G, C (oitava)
            let time = audioContext.currentTime;
            
            notes.forEach((freq, index) => {
                oscillator.frequency.setValueAtTime(freq, time + index * 0.2);
                gainNode.gain.setValueAtTime(0.3, time + index * 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + index * 0.2 + 0.1);
            });
            
            oscillator.start(time);
            oscillator.stop(time + notes.length * 0.2);
        } catch (error) {
            // Som não disponível
        }
    }
    
    // Jogar novamente
    playAgain() {
        this.hideCongratulationsScreen();
        
        // Notificar sistema principal
        if (window.puzzleManager) {
            window.puzzleManager.resetPuzzle();
        }
    }
    
    // Voltar ao início
    backToMain() {
        this.hideCongratulationsScreen();
        
        // Notificar sistema principal
        if (window.screenManager) {
            window.screenManager.showScreen('main');
        }
    }
}

// Exportar para uso global
window.FeedbackManager = FeedbackManager;