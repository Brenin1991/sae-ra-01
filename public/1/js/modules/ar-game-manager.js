/**
 * AR Game Manager - Gerenciador de AR
 * Integração com a nova engine para funcionalidades de Realidade Aumentada
 */

class ARGameManager {
    constructor(engine, config = {}) {
        this.engine = engine;
        this.config = {
            enableWebcam: config.enableWebcam || true,
            enableAR: config.enableAR || true,
            photographedPieces: config.photographedPieces || new Set(),
            ...config
        };
        
        this.currentStream = null;
        this.loadedModel = null;
        this.isARMode = true;
        this.photographedPieces = this.config.photographedPieces;
        
        this.init();
    }
    
    init() {
        this.engine.log('📱 Inicializando AR Game Manager');
        this.setupARComponents();
        this.setupAREvents();
        this.engine.log('✅ AR Game Manager inicializado');
    }
    
    // Configurar componentes AR
    setupARComponents() {
        // Componente para objetos sempre olharem para a câmera
        AFRAME.registerComponent('billboard', {
            tick: function () {
                const camera = document.querySelector('[camera]');
                if (camera) {
                    this.el.object3D.lookAt(camera.object3D.position);
                }
            }
        });
        
        // Componente para interação com peças AR
        AFRAME.registerComponent('ar-piece-interaction', {
            init: function () {
                this.el.addEventListener('mouseenter', this.onMouseEnter.bind(this));
                this.el.addEventListener('mouseleave', this.onMouseLeave.bind(this));
                this.el.addEventListener('click', this.onClick.bind(this));
            },
            
            onMouseEnter: function () {
                this.el.setAttribute('scale', '1.1 1.1 1.1');
            },
            
            onMouseLeave: function () {
                this.el.setAttribute('scale', '1 1 1');
            },
            
            onClick: function () {
                this.el.emit('arPieceClicked', { pieceId: this.el.dataset.pieceId });
            }
        });
        
        // Componente para detecção de interseção
        AFRAME.registerComponent('intersection-detector', {
            init: function () {
                this.el.addEventListener('raycaster-intersected', this.onIntersected.bind(this));
                this.el.addEventListener('raycaster-intersected-cleared', this.onIntersectionCleared.bind(this));
            },
            
            onIntersected: function (event) {
                this.el.emit('pieceIntersected', { pieceId: this.el.dataset.pieceId });
            },
            
            onIntersectionCleared: function (event) {
                this.el.emit('pieceIntersectionCleared', { pieceId: this.el.dataset.pieceId });
            }
        });
    }
    
    // Configurar eventos AR
    setupAREvents() {
        // Eventos de peças AR
        this.engine.on('arPieceClicked', (data) => {
            this.handlePieceClick(data);
        });
        
        this.engine.on('pieceIntersected', (data) => {
            this.handlePieceIntersection(data);
        });
        
        this.engine.on('pieceIntersectionCleared', (data) => {
            this.handlePieceIntersectionCleared(data);
        });
        
        // Eventos de câmera
        this.engine.on('cameraFlash', () => {
            this.triggerCameraFlash();
        });
        
        this.engine.on('cameraSound', () => {
            this.playCameraSound();
        });
        
        this.engine.on('deviceVibration', () => {
            this.vibrateDevice();
        });
    }
    
    // Inicializar webcam
    async initWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            
            this.currentStream = stream;
            const video = document.getElementById('webcam');
            
            if (video) {
                video.srcObject = stream;
                video.play();
            }
            
            this.engine.log('📹 Webcam inicializada com sucesso');
            this.engine.emit('webcamReady', { stream });
            
        } catch (error) {
            this.engine.log('❌ Erro ao inicializar webcam', 'error');
            this.engine.emit('webcamError', { error });
        }
    }
    
    // Carregar modelo 3D
    async load3DModel(modelPath, position = { x: 0, y: 0, z: -5 }, scale = { x: 1, y: 1, z: 1 }) {
        try {
            const scene = document.querySelector('a-scene');
            if (!scene) {
                throw new Error('Cena A-Frame não encontrada');
            }
            
            // Remover modelo anterior se existir
            if (this.loadedModel) {
                scene.removeChild(this.loadedModel);
            }
            
            // Criar entidade do modelo
            const modelEntity = document.createElement('a-entity');
            modelEntity.setAttribute('gltf-model', modelPath);
            modelEntity.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
            modelEntity.setAttribute('scale', `${scale.x} ${scale.y} ${scale.z}`);
            modelEntity.setAttribute('billboard', '');
            
            scene.appendChild(modelEntity);
            this.loadedModel = modelEntity;
            
            this.engine.log('🎯 Modelo 3D carregado com sucesso');
            this.engine.emit('modelLoaded', { modelPath, position, scale });
            
            return modelEntity;
            
        } catch (error) {
            this.engine.log('❌ Erro ao carregar modelo 3D', 'error');
            this.engine.emit('modelLoadError', { error });
            return null;
        }
    }
    
    // Configurar objetos interativos no modelo
    setupInteractiveObjects(objects) {
        if (!this.loadedModel) {
            this.engine.log('⚠️ Modelo não carregado, não é possível configurar objetos interativos');
            return;
        }
        
        objects.forEach((obj, index) => {
            const plane = this.createInteractivePlane(obj, this.loadedModel, index);
            if (plane) {
                this.loadedModel.appendChild(plane);
            }
        });
        
        this.engine.log(`🎮 ${objects.length} objetos interativos configurados`);
    }
    
    // Criar plano interativo
    createInteractivePlane(obj, container, index) {
        try {
            const plane = document.createElement('a-plane');
            
            // Configurar propriedades do plano
            plane.setAttribute('position', `${obj.position.x} ${obj.position.y} ${obj.position.z}`);
            plane.setAttribute('rotation', `${obj.rotation.x} ${obj.rotation.y} ${obj.rotation.z}`);
            plane.setAttribute('width', obj.width || 1);
            plane.setAttribute('height', obj.height || 1);
            plane.setAttribute('color', 'transparent');
            plane.setAttribute('opacity', 0);
            plane.setAttribute('raycaster', 'objects: .interactive');
            plane.setAttribute('cursor', 'rayOrigin: mouse');
            plane.setAttribute('ar-piece-interaction', '');
            plane.setAttribute('intersection-detector', '');
            
            // Configurar dados da peça
            plane.dataset.pieceId = obj.id;
            plane.dataset.pieceIndex = index;
            
            // Adicionar classe para raycaster
            plane.classList.add('interactive');
            
            return plane;
            
        } catch (error) {
            this.engine.log(`❌ Erro ao criar plano interativo ${index}`, 'error');
            return null;
        }
    }
    
    // Esconder objeto no modelo
    hideObjectInModel(objectId) {
        if (!this.loadedModel) return;
        
        const object = this.loadedModel.querySelector(`[data-piece-id="${objectId}"]`);
        if (object) {
            object.setAttribute('visible', false);
            this.engine.log(`👻 Objeto ${objectId} escondido`);
        }
    }
    
    // Obter posição do objeto no modelo
    getObjectPositionFromModel(objectId) {
        if (!this.loadedModel) return null;
        
        const object = this.loadedModel.querySelector(`[data-piece-id="${objectId}"]`);
        if (object) {
            const position = object.getAttribute('position');
            return {
                x: position.x,
                y: position.y,
                z: position.z
            };
        }
        return null;
    }
    
    // Limpar todas as peças
    clearAllPecas() {
        if (!this.loadedModel) return;
        
        const pieces = this.loadedModel.querySelectorAll('[data-piece-id]');
        pieces.forEach(piece => {
            piece.setAttribute('visible', false);
        });
        
        this.engine.log('🗑️ Todas as peças foram limpas');
    }
    
    // Alternar modo AR/HDRI
    toggleMode() {
        this.isARMode = !this.isARMode;
        
        const video = document.getElementById('webcam');
        const scene = document.querySelector('a-scene');
        
        if (this.isARMode) {
            // Modo AR
            if (video) video.style.display = 'block';
            if (scene) scene.setAttribute('background', 'transparent: true');
            this.engine.log('🌅 Modo AR ativado');
        } else {
            // Modo HDRI
            if (video) video.style.display = 'none';
            if (scene) scene.setAttribute('background', 'color: #87CEEB');
            this.engine.log('🌅 Modo HDRI ativado');
        }
        
        this.engine.emit('modeChanged', { isARMode: this.isARMode });
    }
    
    // Capturar foto
    async takePhoto() {
        try {
            const canvas = document.createElement('canvas');
            const video = document.getElementById('webcam');
            
            if (!video || !video.srcObject) {
                throw new Error('Vídeo não disponível');
            }
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            
            this.engine.log('📸 Foto capturada com sucesso');
            this.engine.emit('photoTaken', { photoData });
            
            return photoData;
            
        } catch (error) {
            this.engine.log('❌ Erro ao capturar foto', 'error');
            this.engine.emit('photoError', { error });
            return null;
        }
    }
    
    // Verificar peças visíveis
    checkVisiblePieces() {
        if (!this.loadedModel) return [];
        
        const visiblePieces = [];
        const pieces = this.loadedModel.querySelectorAll('[data-piece-id]');
        
        pieces.forEach(piece => {
            if (piece.getAttribute('visible') !== false) {
                const pieceId = piece.dataset.pieceId;
                visiblePieces.push(pieceId);
            }
        });
        
        return visiblePieces;
    }
    
    // Marcar peça como fotografada
    markPieceAsPhotographed(pieceId) {
        this.photographedPieces.add(pieceId);
        this.engine.emit('piecePhotographed', { pieceId });
        this.engine.log(`📸 Peça ${pieceId} marcada como fotografada`);
    }
    
    // Verificar se peça foi fotografada
    isPiecePhotographed(pieceId) {
        return this.photographedPieces.has(pieceId);
    }
    
    // Resetar peças fotografadas
    resetPhotographedPieces() {
        this.photographedPieces.clear();
        this.engine.log('🔄 Peças fotografadas resetadas');
    }
    
    // Handlers de eventos
    handlePieceClick(data) {
        this.engine.log(`🎯 Peça clicada: ${data.pieceId}`);
        this.engine.emit('pieceClicked', data);
    }
    
    handlePieceIntersection(data) {
        this.engine.log(`🎯 Peça intersectada: ${data.pieceId}`);
        this.engine.emit('pieceIntersected', data);
    }
    
    handlePieceIntersectionCleared(data) {
        this.engine.log(`🎯 Interseção da peça removida: ${data.pieceId}`);
        this.engine.emit('pieceIntersectionCleared', data);
    }
    
    // Efeitos visuais e sonoros
    triggerCameraFlash() {
        const flash = document.getElementById('camera-flash');
        if (flash) {
            flash.style.opacity = '1';
            setTimeout(() => {
                flash.style.opacity = '0';
            }, 200);
        }
    }
    
    playCameraSound() {
        // Criar áudio de câmera
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        audio.play().catch(() => {
            // Ignorar erro se autoplay for bloqueado
        });
    }
    
    vibrateDevice() {
        if ('vibrate' in navigator) {
            navigator.vibrate(100);
        }
    }
    
    // Métodos de conveniência
    getCurrentStream() {
        return this.currentStream;
    }
    
    getLoadedModel() {
        return this.loadedModel;
    }
    
    isARModeActive() {
        return this.isARMode;
    }
    
    getPhotographedPieces() {
        return Array.from(this.photographedPieces);
    }
    
    // Destruir módulo
    destroy() {
        // Parar stream de vídeo
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
        }
        
        // Remover modelo carregado
        if (this.loadedModel) {
            const scene = document.querySelector('a-scene');
            if (scene) {
                scene.removeChild(this.loadedModel);
            }
        }
        
        this.engine.log('🛑 AR Game Manager destruído');
    }
}

// Exportar para uso global
window.ARGameManager = ARGameManager;