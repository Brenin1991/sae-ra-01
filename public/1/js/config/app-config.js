/**
 * App Config - Configurações da Aplicação
 * Configurações centralizadas e organizadas
 */

const AppConfig = {
    // Configurações da Engine
    engine: {
        name: 'PuzzleAREngine',
        version: '1.0.0',
        debug: true,
        modules: []
    },
    
    // Configurações de AR
    ar: {
        enableWebcam: true,
        enableAR: true,
        defaultModelPath: 'assets/models/fase1.glb',
        defaultModelPosition: { x: 0, y: 0, z: -5 },
        defaultModelScale: { x: 1, y: 1, z: 1 },
        cameraFacingMode: 'environment',
        cameraWidth: { ideal: 1920 },
        cameraHeight: { ideal: 1080 }
    },
    
    // Configurações do Puzzle
    puzzle: {
        defaultPhase: 'fase1',
        autoSave: true,
        enableDragDrop: true,
        enableFeedback: true,
        enableSound: true,
        enableVibration: true
    },
    
    // Configurações de UI
    ui: {
        enablePhotoCounter: true,
        enableCameraFlash: true,
        enableCameraSound: true,
        enableDeviceVibration: true,
        showControls: false // Controles de desenvolvimento
    },
    
    // Configurações de Dados
    data: {
        dataPath: 'assets/data/data.json',
        cacheEnabled: true,
        autoSave: true,
        saveInterval: 30000 // 30 segundos
    },
    
    // Configurações de Telas
    screens: {
        defaultScreen: 'main',
        enableHistory: true,
        transitionDuration: 300,
        screens: {
            main: {
                name: 'main',
                autoShow: true
            },
            tutorial: {
                name: 'tutorial',
                autoShow: false,
                showOnFirstTime: true
            },
            puzzle: {
                name: 'puzzle',
                autoShow: false
            },
            congratulations: {
                name: 'congratulations',
                autoShow: false
            }
        }
    },
    
    // Configurações de Performance
    performance: {
        enableLogging: true,
        enableMetrics: true,
        enableProfiling: false,
        maxFPS: 60,
        enableVSync: true
    },
    
    // Configurações de Debug
    debug: {
        enabled: true,
        logLevel: 'info', // 'error', 'warn', 'info', 'debug'
        showFPS: false,
        showStats: false,
        enableConsole: true
    },
    
    // Configurações de Assets
    assets: {
        textures: {
            cameraIcon: 'assets/textures/camera-icon.png',
            lupa: 'assets/textures/lupa.png',
            tutorialText: 'assets/textures/tutorial-text.png',
            sky: 'assets/textures/sky.png',
            mainBg: 'assets/textures/main-bg.png'
        },
        models: {
            fase1: 'assets/models/fase1.glb',
            fase1Blend: 'assets/models/fase1.blend'
        },
        data: {
            gameData: 'assets/data/data.json'
        }
    },
    
    // Configurações de Eventos
    events: {
        enableGlobalEvents: true,
        enableKeyboardEvents: true,
        enableMouseEvents: true,
        enableTouchEvents: true,
        enableResizeEvents: true,
        enableVisibilityEvents: true
    },
    
    // Configurações de Localização
    localization: {
        defaultLanguage: 'pt-BR',
        fallbackLanguage: 'en',
        enableAutoDetect: true,
        translations: {
            'pt-BR': {
                congratulations: 'Parabéns!',
                puzzleCompleted: 'Você completou o quebra-cabeça com sucesso!',
                piecesCompleted: 'peças montadas',
                seconds: 'segundos',
                photographedPieces: 'peças fotografadas',
                tutorial: 'Tutorial',
                start: 'Começar',
                play: 'Jogar',
                next: 'Próximo',
                certificate: 'Certificado'
            },
            'en': {
                congratulations: 'Congratulations!',
                puzzleCompleted: 'You successfully completed the puzzle!',
                piecesCompleted: 'pieces completed',
                seconds: 'seconds',
                photographedPieces: 'photographed pieces',
                tutorial: 'Tutorial',
                start: 'Start',
                play: 'Play',
                next: 'Next',
                certificate: 'Certificate'
            }
        }
    },
    
    // Configurações de Acessibilidade
    accessibility: {
        enableScreenReader: true,
        enableHighContrast: false,
        enableLargeText: false,
        enableKeyboardNavigation: true,
        enableVoiceCommands: false
    },
    
    // Configurações de Analytics
    analytics: {
        enabled: false,
        trackingId: '',
        enableEventTracking: true,
        enablePerformanceTracking: true,
        enableErrorTracking: true
    },
    
    // Métodos de conveniência
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    },
    
    set(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        let obj = this;
        
        for (const k of keys) {
            if (!(k in obj) || typeof obj[k] !== 'object') {
                obj[k] = {};
            }
            obj = obj[k];
        }
        
        obj[lastKey] = value;
    },
    
    merge(config) {
        return this.deepMerge(this, config);
    },
    
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    },
    
    // Obter configuração para um módulo específico
    getModuleConfig(moduleName) {
        return this.get(moduleName, {});
    },
    
    // Obter configuração de tela
    getScreenConfig(screenName) {
        return this.screens.screens[screenName] || {};
    },
    
    // Obter tradução
    getTranslation(key, language = null) {
        const lang = language || this.localization.defaultLanguage;
        const translations = this.localization.translations[lang] || this.localization.translations[this.localization.fallbackLanguage];
        return translations[key] || key;
    },
    
    // Verificar se debug está habilitado
    isDebugEnabled() {
        return this.debug.enabled;
    },
    
    // Verificar se um recurso está habilitado
    isFeatureEnabled(feature) {
        return this.get(feature, false);
    }
};

// Exportar para uso global
window.AppConfig = AppConfig;