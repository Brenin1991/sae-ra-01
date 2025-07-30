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
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            // Criar overlay
            this.createOverlay();
            
            // Verificar orientação inicial
            this.checkOrientation();
            
            // Adicionar listeners
            this.addEventListeners();
            
            console.log('🔄 Landscape Blocker inicializado');
        }, 100);
    }
    
    createOverlay() {
        // Verificar se já existe um overlay
        const existingOverlay = document.getElementById('landscape-blocker');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        this.overlay = document.createElement('div');
        this.overlay.id = 'landscape-blocker';
        this.overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            display: none;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 999999999 !important;
            color: white !important;
            font-family: Arial, sans-serif !important;
            text-align: center !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            pointer-events: auto !important;
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
        
        console.log('✅ Overlay criado e adicionado ao DOM');
    }
    
    checkOrientation() {
        // Múltiplas formas de detectar landscape
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = width > height;
        
        // Verificar se é mobile (para não bloquear desktop)
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                         width <= 768 ||
                         ('ontouchstart' in window) ||
                         (navigator.maxTouchPoints > 0);
        
        // Debug: mostrar informações detalhadas
        console.log(`📱 User Agent: ${userAgent}`);
        console.log(`📏 Dimensões: ${width}x${height}`);
        console.log(`🔄 Landscape: ${isLandscape}`);
        console.log(`📱 Mobile: ${isMobile}`);
        console.log(`👆 Touch Support: ${'ontouchstart' in window}`);
        console.log(`👆 Max Touch Points: ${navigator.maxTouchPoints}`);
        
        // Só bloquear se for mobile E landscape
        if (isMobile && isLandscape) {
            console.log('🚫 Condições atendidas: Mobile + Landscape - Ativando overlay');
            this.showBlockingOverlay();
        } else {
            console.log('✅ Condições não atendidas - Desativando overlay');
            this.hideBlockingOverlay();
        }
    }
    
    addEventListeners() {
        // Listener para mudança de orientação
        window.addEventListener('orientationchange', () => {
            console.log('🔄 Evento orientationchange detectado');
            // Aguardar um pouco para a orientação mudar
            setTimeout(() => {
                this.checkOrientation();
            }, 500);
        });
        
        // Listener para redimensionamento da janela
        window.addEventListener('resize', () => {
            console.log('🔄 Evento resize detectado');
            this.checkOrientation();
        });
        
        // Listener para mudança de orientação em dispositivos móveis
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', () => {
                console.log('🔄 Evento screen.orientation.change detectado');
                setTimeout(() => {
                    this.checkOrientation();
                }, 500);
            });
        }
        
        // Listener para mudança de orientação usando matchMedia
        const mediaQuery = window.matchMedia('(orientation: landscape)');
        mediaQuery.addEventListener('change', (e) => {
            console.log('🔄 Evento matchMedia orientation change detectado:', e.matches);
            setTimeout(() => {
                this.checkOrientation();
            }, 100);
        });
    }
    
    showBlockingOverlay() {
        if (this.isBlocked) {
            console.log('⚠️ Overlay já está ativo');
            return;
        }
        
        if (!this.overlay) {
            console.error('❌ Overlay não foi criado!');
            this.createOverlay();
        }
        
        this.isBlocked = true;
        this.overlay.style.display = 'flex';
        
        // Forçar a exibição com !important
        this.overlay.style.setProperty('display', 'flex', 'important');
        
        // Desabilitar interações com elementos abaixo
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        
        // Verificar se o overlay está realmente visível
        setTimeout(() => {
            const rect = this.overlay.getBoundingClientRect();
            console.log('🔄 Modo landscape detectado - Overlay ativado');
            console.log('👁️ Overlay visível:', this.overlay.style.display);
            console.log('📍 Posição do overlay:', rect.top, rect.left);
            console.log('📏 Dimensões do overlay:', rect.width, rect.height);
            console.log('🎨 Z-index:', window.getComputedStyle(this.overlay).zIndex);
        }, 100);
    }
    
    hideBlockingOverlay() {
        if (!this.isBlocked) {
            console.log('⚠️ Overlay já está inativo');
            return;
        }
        
        this.isBlocked = false;
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        
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
        console.log('🔄 Forçando verificação de orientação...');
        this.checkOrientation();
    }
    
    // Método para testar o overlay manualmente
    testOverlay() {
        console.log('🧪 Testando overlay manualmente...');
        this.showBlockingOverlay();
        setTimeout(() => {
            this.hideBlockingOverlay();
        }, 3000);
    }
    
    // Método para simular landscape em desktop
    simulateLandscape() {
        console.log('🧪 Simulando landscape em desktop...');
        // Temporariamente alterar as dimensões da janela para simular landscape
        const originalWidth = window.innerWidth;
        const originalHeight = window.innerHeight;
        
        // Simular dimensões landscape
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalHeight
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: originalWidth
        });
        
        // Forçar verificação
        this.checkOrientation();
        
        // Restaurar dimensões após 3 segundos
        setTimeout(() => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: originalWidth
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: originalHeight
            });
            this.checkOrientation();
        }, 3000);
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
    console.log('🚀 DOM carregado - Iniciando Landscape Blocker');
    window.landscapeBlocker = new LandscapeBlocker();
    
    // Adicionar método de teste global
    window.testLandscapeBlocker = () => {
        if (window.landscapeBlocker) {
            window.landscapeBlocker.testOverlay();
        }
    };
    
    // Adicionar método de simulação global
    window.simulateLandscape = () => {
        if (window.landscapeBlocker) {
            window.landscapeBlocker.simulateLandscape();
        }
    };
});

// Exportar para uso global
window.LandscapeBlocker = LandscapeBlocker; 