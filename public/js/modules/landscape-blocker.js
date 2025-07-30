/**
 * Landscape Blocker - Bloqueador de Modo Landscape
 * Impede o uso da aplicação em orientação landscape
 */

class LandscapeBlocker {
    constructor() {
        this.overlay = null;
        this.isBlocked = false;
        this.init();
    }
    
    init() {
        // Criar overlay
        this.createOverlay();
        
        // Verificar orientação inicial
        this.checkOrientation();
        
        // Adicionar listeners
        this.addEventListeners();
        
        console.log('🔄 Landscape Blocker inicializado');
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'landscape-blocker';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 99999;
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
        `;
        
        // Ícone de rotação
        const rotateIcon = document.createElement('div');
        rotateIcon.innerHTML = `
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
                <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/>
            </svg>
        `;
        rotateIcon.style.cssText = `
            margin-bottom: 20px;
            animation: rotate 2s ease-in-out infinite;
        `;
        
        // Título
        const title = document.createElement('h2');
        title.textContent = 'Gire seu dispositivo';
        title.style.cssText = `
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            margin-top: 0;
        `;
        
        // Mensagem
        const message = document.createElement('p');
        message.textContent = 'Esta experiência foi projetada para ser usada no modo retrato. Por favor, gire seu dispositivo para continuar.';
        message.style.cssText = `
            font-size: 16px;
            line-height: 1.5;
            max-width: 300px;
            margin: 0;
            opacity: 0.9;
        `;
        
        // Adicionar elementos ao overlay
        this.overlay.appendChild(rotateIcon);
        this.overlay.appendChild(title);
        this.overlay.appendChild(message);
        
        // Adicionar CSS para animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rotate {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(90deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Adicionar ao body
        document.body.appendChild(this.overlay);
    }
    
    checkOrientation() {
        // Múltiplas formas de detectar landscape
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = width > height;
        
        // Verificar se é mobile (para não bloquear desktop)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         width <= 768;
        
        // Só bloquear se for mobile E landscape
        if (isMobile && isLandscape) {
            this.showBlockingOverlay();
        } else {
            this.hideBlockingOverlay();
        }
        
        console.log(`🔄 Orientação: ${width}x${height}, Landscape: ${isLandscape}, Mobile: ${isMobile}`);
    }
    
    addEventListeners() {
        // Listener para mudança de orientação
        window.addEventListener('orientationchange', () => {
            // Aguardar um pouco para a orientação mudar
            setTimeout(() => {
                this.checkOrientation();
            }, 500);
        });
        
        // Listener para redimensionamento da janela
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
        
        // Listener para mudança de orientação em dispositivos móveis
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', () => {
                setTimeout(() => {
                    this.checkOrientation();
                }, 500);
            });
        }
    }
    
    showBlockingOverlay() {
        if (this.isBlocked) return;
        
        this.isBlocked = true;
        this.overlay.style.display = 'flex';
        
        // Desabilitar interações com elementos abaixo
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        
        console.log('🔄 Modo landscape detectado - Overlay ativado');
    }
    
    hideBlockingOverlay() {
        if (!this.isBlocked) return;
        
        this.isBlocked = false;
        this.overlay.style.display = 'none';
        
        // Reabilitar interações
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        
        console.log('✅ Modo retrato detectado - Overlay desativado');
    }
    
    // Método para verificar se está bloqueado
    isCurrentlyBlocked() {
        return this.isBlocked;
    }
    
    // Método para forçar verificação
    forceCheck() {
        this.checkOrientation();
    }
    
    // Método para destruir o blocker
    destroy() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        
        // Remover listeners
        window.removeEventListener('orientationchange', this.checkOrientation);
        window.removeEventListener('resize', this.checkOrientation);
        
        console.log('🗑️ Landscape Blocker destruído');
    }
}

// Criar instância global quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.landscapeBlocker = new LandscapeBlocker();
});

// Exportar para uso global
window.LandscapeBlocker = LandscapeBlocker; 