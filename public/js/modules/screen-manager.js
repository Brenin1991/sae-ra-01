/**
 * Screen Manager - Gerenciador Modular de Telas
 * Sistema modular para gerenciar transições entre telas
 */

class ScreenManager {
    constructor() {
        this.screens = {};
        this.currentScreen = null;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        // Registrar telas padrão
        this.registerDefaultScreens();
        
        // Iniciar na tela principal
        this.showScreen('main');
    }
    
    registerDefaultScreens() {
        // Registrar telas padrão se as classes existirem
        if (window.MainScreen) {
            this.registerScreen('main', new MainScreen());
        }
        
        if (window.TutorialScreen) {
            this.registerScreen('tutorial', new TutorialScreen());
        }
        
        if (window.UIScreen) {
            this.registerScreen('ui', new UIScreen());
        }
        
        if (window.PuzzleScreen) {
            this.registerScreen('puzzle', new PuzzleScreen());
        }
        
        if (window.CongratulationsScreen) {
            this.registerScreen('congratulations', new CongratulationsScreen());
        }
    }
    
    // Registrar uma nova tela
    registerScreen(screenName, screenInstance) {
        this.screens[screenName] = screenInstance;
        console.log(`✅ Tela "${screenName}" registrada`);
    }
    
    // Mostrar uma tela
    showScreen(screenName) {
        if (this.isTransitioning || !this.screens[screenName]) {
            console.warn(`⚠️ Tela "${screenName}" não encontrada ou transição em andamento`);
            return;
        }
        
        this.isTransitioning = true;
        
        // Executar função de saída da tela atual
        if (this.currentScreen && this.screens[this.currentScreen]) {
            this.screens[this.currentScreen].hide();
        }
        
        // Mostrar a nova tela
        const newScreen = this.screens[screenName];
        newScreen.show();
        
        // Atualizar tela atual
        this.currentScreen = screenName;
        
        // Finalizar transição
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    // Ir para próxima tela
    nextScreen() {
        if (this.currentScreen && this.screens[this.currentScreen]) {
            const currentScreen = this.screens[this.currentScreen];
            const nextScreenName = currentScreen.getConfig().next;
            
            if (nextScreenName) {
                this.showScreen(nextScreenName);
            }
        }
    }
    
    // Voltar para tela anterior
    previousScreen() {
        // Encontrar a tela anterior
        for (const [screenName, screenInstance] of Object.entries(this.screens)) {
            const config = screenInstance.getConfig();
            if (config.next === this.currentScreen) {
                this.showScreen(screenName);
                break;
            }
        }
    }
    
    // Obter informações da tela atual
    getCurrentScreen() {
        if (this.currentScreen && this.screens[this.currentScreen]) {
            return {
                name: this.currentScreen,
                instance: this.screens[this.currentScreen],
                config: this.screens[this.currentScreen].getConfig()
            };
        }
        return null;
    }
    
    // Verificar se uma tela existe
    hasScreen(screenName) {
        return !!this.screens[screenName];
    }
    
    // Obter instância de uma tela
    getScreen(screenName) {
        return this.screens[screenName] || null;
    }
    
    // Remover uma tela
    removeScreen(screenName) {
        if (this.screens[screenName]) {
            delete this.screens[screenName];
            console.log(`🗑️ Tela "${screenName}" removida`);
        }
    }
    
    // Listar todas as telas registradas
    listScreens() {
        return Object.keys(this.screens);
    }
    
    // Verificar se está em transição
    isInTransition() {
        return this.isTransitioning;
    }
    
    // Método para adicionar telas dinamicamente (compatibilidade)
    addScreen(screenName, config) {
        // Criar uma instância de BaseScreen com a configuração
        const screenInstance = new BaseScreen(config.elementId, config);
        this.registerScreen(screenName, screenInstance);
    }
    
    // Método para obter configuração de uma tela
    getScreenConfig(screenName) {
        const screen = this.screens[screenName];
        return screen ? screen.getConfig() : null;
    }
    
    // Método para verificar se uma tela está ativa
    isScreenActive(screenName) {
        const screen = this.screens[screenName];
        return screen ? screen.isScreenActive() : false;
    }
    
    // Método para executar ação em uma tela específica
    executeOnScreen(screenName, action) {
        const screen = this.screens[screenName];
        if (screen && typeof screen[action] === 'function') {
            return screen[action]();
        }
        return null;
    }
}

// Inicializar o gerenciador de telas quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.screenManager = new ScreenManager();
});

// Exportar para uso global
window.ScreenManager = ScreenManager;