/**
 * Sistema de Gerenciamento de Telas
 * Gerencia transições entre diferentes telas da aplicação
 */
class ScreenManager {
    constructor() {
        this.screens = {
            main: {
                element: document.getElementById('main'),
                next: 'tutorial',
                onEnter: () => this.onMainEnter(),
                onExit: () => this.onMainExit()
            },
            tutorial: {
                element: document.getElementById('tutorial'),
                next: 'ui',
                onEnter: () => this.onTutorialEnter(),
                onExit: () => this.onTutorialExit()
            },
            ui: {
                element: document.getElementById('ui'),
                next: null, // Última tela
                onEnter: () => this.onUIEnter(),
                onExit: () => this.onUIExit()
            }
        };
        
        this.currentScreen = 'main';
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        // Configurar event listeners para os botões
        this.setupEventListeners();
        
        // Iniciar na tela principal
        this.showScreen('main');
    }
    
    setupEventListeners() {
        // Botão principal
        const mainButton = document.getElementById('main-button');
        if (mainButton) {
            mainButton.addEventListener('click', () => this.nextScreen());
        }
        
        // Botão do tutorial
        const tutorialButton = document.getElementById('tutorial-button');
        if (tutorialButton) {
            tutorialButton.addEventListener('click', () => this.nextScreen());
        }
        
        // Botão de narração
        const narracaoButton = document.getElementById('narracao-button');
        if (narracaoButton) {
            narracaoButton.addEventListener('click', () => this.toggleNarracao());
        }
    }
    
    showScreen(screenName) {
        if (this.isTransitioning || !this.screens[screenName]) {
            return;
        }
        
        this.isTransitioning = true;
        
        // Executar função de saída da tela atual
        if (this.screens[this.currentScreen] && this.screens[this.currentScreen].onExit) {
            this.screens[this.currentScreen].onExit();
        }
        
        // Esconder todas as telas
        Object.values(this.screens).forEach(screen => {
            if (screen.element) {
                screen.element.style.display = 'none';
                screen.element.style.opacity = '0';
            }
        });
        
        // Mostrar a nova tela
        const newScreen = this.screens[screenName];
        if (newScreen && newScreen.element) {
            newScreen.element.style.display = 'block';
            
            // Animação de fade in
            setTimeout(() => {
                newScreen.element.style.opacity = '1';
                newScreen.element.style.transition = 'opacity 0.5s ease-in-out';
            }, 50);
        }
        
        // Atualizar tela atual
        this.currentScreen = screenName;
        
        // Executar função de entrada da nova tela
        if (newScreen && newScreen.onEnter) {
            setTimeout(() => {
                newScreen.onEnter();
            }, 100);
        }
        
        // Finalizar transição
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    nextScreen() {
        const currentScreenData = this.screens[this.currentScreen];
        if (currentScreenData && currentScreenData.next) {
            this.showScreen(currentScreenData.next);
        }
    }
    
    previousScreen() {
        // Encontrar a tela anterior
        for (const [screenName, screenData] of Object.entries(this.screens)) {
            if (screenData.next === this.currentScreen) {
                this.showScreen(screenName);
                break;
            }
        }
    }
    
    // Funções específicas para cada tela
    onMainEnter() {
        console.log('Entrou na tela principal');
        // Aqui você pode adicionar lógica específica para quando entrar na tela principal
    }
    
    onMainExit() {
        console.log('Saiu da tela principal');
        // Aqui você pode adicionar lógica específica para quando sair da tela principal
    }
    
    onTutorialEnter() {
        console.log('Entrou no tutorial');
        // Aqui você pode adicionar lógica específica para quando entrar no tutorial
    }
    
    onTutorialExit() {
        console.log('Saiu do tutorial');
        // Aqui você pode adicionar lógica específica para quando sair do tutorial
    }
    
    onUIEnter() {
        console.log('Entrou na UI');
        // Aqui você pode adicionar lógica específica para quando entrar na UI
        // Por exemplo, iniciar a câmera, carregar modelos 3D, etc.
    }
    
    onUIExit() {
        console.log('Saiu da UI');
        // Aqui você pode adicionar lógica específica para quando sair da UI
    }
    
    toggleNarracao() {
        console.log('Narração toggled');
        // Aqui você pode adicionar lógica para tocar/pausar narração
    }
    
    // Método para adicionar novas telas dinamicamente
    addScreen(screenName, config) {
        this.screens[screenName] = {
            element: document.getElementById(config.elementId),
            next: config.next || null,
            onEnter: config.onEnter || (() => {}),
            onExit: config.onExit || (() => {})
        };
        
        console.log(`Nova tela "${screenName}" adicionada`);
    }
    
    // Método para remover telas
    removeScreen(screenName) {
        if (this.screens[screenName]) {
            delete this.screens[screenName];
            console.log(`Tela "${screenName}" removida`);
        }
    }
    
    // Método para obter informações da tela atual
    getCurrentScreen() {
        return {
            name: this.currentScreen,
            data: this.screens[this.currentScreen]
        };
    }
    
    // Método para verificar se uma tela existe
    hasScreen(screenName) {
        return !!this.screens[screenName];
    }
}

// Inicializar o gerenciador de telas quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.screenManager = new ScreenManager();
});

// Exemplo de como adicionar uma nova tela dinamicamente:
/*
window.screenManager.addScreen('game', {
    elementId: 'game-screen',
    next: 'results',
    onEnter: () => {
        console.log('Iniciando jogo...');
        // Lógica para iniciar o jogo
    },
    onExit: () => {
        console.log('Finalizando jogo...');
        // Lógica para finalizar o jogo
    }
});
*/ 