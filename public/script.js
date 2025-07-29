document.addEventListener("DOMContentLoaded", function () {
    // Inicializar viewportUnitsBuggyfill para corrigir vh/vw em dispositivos móveis
    viewportUnitsBuggyfill.init({
        refreshDebounceWait: 250,
        hacks: viewportUnitsBuggyfill.hacks
    });
    
    // Prevenir zoom de pinça
    preventPinchZoom();
    
    // Aguardar o ScreenManager ser inicializado
    setTimeout(() => {
        if (window.screenManager) {
            integrateWithScreenManager();
        } else {
            console.log('⚠️ Aguardando ScreenManager...');
            // Tentar novamente após mais tempo
            setTimeout(() => {
                if (window.screenManager) {
                    integrateWithScreenManager();
                } else {
                    console.error('❌ ScreenManager não encontrado após timeout');
                }
            }, 1000);
        }
    }, 500);
});

// Função para prevenir zoom de pinça
function preventPinchZoom() {
    let lastTouchEnd = 0;
    
    document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    document.addEventListener('gesturestart', function (event) {
        event.preventDefault();
    }, { passive: false });
    
    document.addEventListener('gesturechange', function (event) {
        event.preventDefault();
    }, { passive: false });
    
    document.addEventListener('gestureend', function (event) {
        event.preventDefault();
    }, { passive: false });
    
    document.addEventListener('wheel', function (event) {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && (event.key === '+' || event.key === '-' || event.key === '=')) {
            event.preventDefault();
        }
    }, { passive: false });
    
    // Recarregar viewportUnitsBuggyfill quando a orientação mudar
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            viewportUnitsBuggyfill.refresh();
        }, 500);
    });
    
    window.addEventListener('resize', function() {
        viewportUnitsBuggyfill.refresh();
    });
}

// Variáveis globais
let gameData = null;
let currentPhase = 'fase1';
let loadedModel = null;
let isARMode = true;
let currentStream = null;
let photographedPieces = new Set();

// Função para mostrar mensagens de debug na tela
function showDebugMessage(message) {
    console.log(message);
    
    // Criar ou atualizar elemento de debug na tela
    let debugElement = document.getElementById('debug-messages');
    if (!debugElement) {
        debugElement = document.createElement('div');
        debugElement.id = 'debug-messages';
        debugElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            font-family: monospace;
            z-index: 10000;
            max-height: 200px;
            overflow-y: auto;
        `;
        document.body.appendChild(debugElement);
    }
    
    // Adicionar nova mensagem
    const messageElement = document.createElement('div');
    messageElement.textContent = new Date().toLocaleTimeString() + ': ' + message;
    debugElement.appendChild(messageElement);
    
    // Manter apenas as últimas 10 mensagens
    while (debugElement.children.length > 10) {
        debugElement.removeChild(debugElement.firstChild);
    }
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 5000);
}

// Componente billboard para orientar objetos sempre para a câmera
AFRAME.registerComponent('billboard', {
    init: function() {
        this.camera = document.querySelector('[camera]');
    },
    tick: function() {
        if (this.camera) {
            const cameraPosition = this.camera.getAttribute('position');
            this.el.object3D.lookAt(cameraPosition);
        }
    }
});

// Componente para detecção automática baseada na DIREÇÃO da câmera (SEM MOUSE!)
AFRAME.registerComponent('auto-detect', {
    init: function () {
        this.lastTriggered = {};
        this.lastIntersectedObjects = new Set(); // Rastrear objetos intersectados
        this.checkInterval = 100; // ms entre verificações
        this.lastCheck = 0;
        this.cooldown = 800; // 0.8 segundos entre triggers do mesmo objeto
        this.raycaster = new THREE.Raycaster();
        this.camera = null;
        
        console.log('🎯 DETECÇÃO AUTOMÁTICA POR DIREÇÃO DA CÂMERA!');
    },
    
    tick: function (time) {
        // Verificar apenas a cada intervalo
        if (time - this.lastCheck < this.checkInterval) return;
        this.lastCheck = time;
        
        // Pegar câmera
        if (!this.camera) {
            this.camera = document.querySelector('a-camera');
            if (!this.camera) return;
        }
        
        // Pegar todos os objetos interativos
        const interactiveObjects = document.querySelectorAll('.clickable');
        if (interactiveObjects.length === 0) return;
        
        // Configurar raycaster baseado na direção da câmera
        const cameraObj = this.camera.object3D;
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(cameraObj.quaternion);
        
        this.raycaster.set(cameraObj.position, direction);
        
        // Converter elementos A-Frame para objetos Three.js
        const threeObjects = [];
        interactiveObjects.forEach(el => {
            if (el.object3D) {
                el.object3D.userData.aframeElement = el;
                threeObjects.push(el.object3D);
            }
        });
        
        // Testar intersecções
        const intersections = this.raycaster.intersectObjects(threeObjects, true);
        
        // Debug: verificar se há objetos interativos
        if (interactiveObjects.length === 0) {
            console.log('⚠️ Nenhum objeto interativo encontrado');
        } else {
            console.log(`🎯 ${interactiveObjects.length} objetos interativos encontrados`);
        }
        
        // Debug: verificar interseções
        if (intersections.length > 0) {
            console.log(`🎯 ${intersections.length} interseções detectadas`);
        }
        
        // Rastrear objetos que estavam sendo mirados no frame anterior
        const previouslyIntersected = new Set();
        
        if (intersections.length > 0) {
            // Pegar o primeiro objeto intersectado
            let targetObject = intersections[0].object;
            
            // Subir na hierarquia até encontrar o elemento A-Frame
            while (targetObject && !targetObject.userData.aframeElement) {
                targetObject = targetObject.parent;
            }
            
            if (targetObject && targetObject.userData.aframeElement) {
                const firstEl = targetObject.userData.aframeElement;
                
                        // Verificar se é um objeto interativo
        if (firstEl.hasAttribute('interactive-object')) {
            const component = firstEl.components['interactive-object'];
            if (component) {
                const objectId = component.data.objectId;
                previouslyIntersected.add(objectId);
                
                console.log('🎯 Objeto interativo detectado:', objectId);
                        
                        // Verificar cooldown
                        if (!this.lastTriggered[objectId] || 
                            time - this.lastTriggered[objectId] > this.cooldown) {
                            
                            console.log('🎯 CÂMERA MIROU NO OBJETO:', objectId);
                            this.lastTriggered[objectId] = time;
                            
                            // Chamar diretamente a função de mostrar peça
                            const showFunction = firstEl.showPecaOnIntersection;
                            if (showFunction) {
                                // Verificar se a peça já está visível para evitar conflitos
                                const pecaPlane = firstEl.pecaPlane;
                                if (pecaPlane && !pecaPlane.getAttribute('visible')) {
                                    console.log('🚀 EXECUTANDO POR DIREÇÃO DA CÂMERA!');
                                    console.log('📸 Peça antes de mostrar:', pecaPlane.getAttribute('visible'));
                                    showFunction();
                                    console.log('📸 Peça depois de mostrar:', pecaPlane.getAttribute('visible'));
                                } else {
                                    console.log('⚠️ Peça já visível ou não encontrada');
                                }
                            } else {
                                console.log('❌ Função showPecaOnIntersection não encontrada');
                            }
                        }
                    }
                }
            }
        }
        
        // DESABILITADO PARA TESTE - Peças sempre visíveis
        // Esconder peças de objetos que não estão mais sendo mirados
        /*
        if (this.lastIntersectedObjects) {
            this.lastIntersectedObjects.forEach(objectId => {
                if (!previouslyIntersected.has(objectId)) {
                    // Encontrar o elemento e esconder a peça
                    const interactiveObjects = document.querySelectorAll('.clickable');
                    interactiveObjects.forEach(el => {
                        if (el.hasAttribute('interactive-object')) {
                            const component = el.components['interactive-object'];
                            if (component && component.data.objectId === objectId) {
                                const hideFunction = el.hidePecaOnIntersectionCleared;
                                if (hideFunction) {
                                    console.log('🙈 CÂMERA SAIU DO OBJETO:', objectId);
                                    hideFunction();
                                }
                            }
                        }
                    });
                }
            });
        }
        */
        
        // Atualizar lista de objetos intersectados
        this.lastIntersectedObjects = previouslyIntersected;
    }
});

// Componente para objetos interativos
AFRAME.registerComponent('interactive-object', {
    schema: {
        objectId: {type: 'string'},
        imageSrc: {type: 'string'},
        pecaSrc: {type: 'string'}
    },
    
    init: function () {
        const el = this.el;
        const data = this.data;
        
        function showPecaOnIntersection(event) {
            // DESABILITADO PARA TESTE - Peças sempre visíveis
            console.log('🎯 showPecaOnIntersection chamada (DESABILITADA)');
            /*
            if (el.pecaPlane) {
                el.pecaPlane.setAttribute('visible', 'true');
                el.pecaPlane.setAttribute('scale', '1 1 1');
                
                setTimeout(() => {
                    el.pecaPlane.setAttribute('animation__glow', {
                        property: 'material.emissiveIntensity',
                        from: 0.4,
                        to: 0.8,
                        dur: 1500,
                        loop: true,
                        dir: 'alternate'
                    });
                }, 500);
            }
            */
        }
        
        function hidePecaOnIntersectionCleared(event) {
            // DESABILITADO PARA TESTE - Peças sempre visíveis
            console.log('🎯 hidePecaOnIntersectionCleared chamada (DESABILITADA)');
            /*
            if (el.pecaPlane) {
                el.pecaPlane.removeAttribute('animation__glow');
                
                setTimeout(() => {
                    el.pecaPlane.setAttribute('visible', 'false');
                    el.pecaPlane.removeAttribute('animation__hide');
                }, 200);
            }
            */
        }
        
        el.showPecaOnIntersection = showPecaOnIntersection;
        el.hidePecaOnIntersectionCleared = hidePecaOnIntersectionCleared;
        
        el.addEventListener('raycaster-intersected', showPecaOnIntersection);
        el.addEventListener('raycaster-intersected-cleared', hidePecaOnIntersectionCleared);
    }
});

// Função para limpar todas as peças permanentes
function clearAllPecas() {
    const pecas = document.querySelectorAll('.peca-plane');
    let count = 0;
    pecas.forEach(peca => {
        peca.remove();
        count++;
    });
}

// Função para carregar dados do JSON
async function loadGameData() {
    showDebugMessage('🎯 loadGameData iniciando...');
    try {
        showDebugMessage('📡 Fazendo fetch do data.json...');
        const response = await fetch('assets/data/data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showDebugMessage('✅ data.json carregado, fazendo parse...');
        gameData = await response.json();
        showDebugMessage('✅ gameData carregado');
        
        showDebugMessage('🎯 Carregando fase: ' + currentPhase);
        await loadPhase(currentPhase);
        
    } catch (error) {
        showDebugMessage('❌ Erro ao carregar dados: ' + error.message);
    }
}

// Função para carregar uma fase
async function loadPhase(phaseName) {
    showDebugMessage('🎯 loadPhase chamada: ' + phaseName);
    
    if (!gameData || !gameData[phaseName]) {
        showDebugMessage('❌ Fase não encontrada: ' + phaseName);
        return;
    }
    
    const phaseData = gameData[phaseName];
    showDebugMessage('✅ Dados da fase carregados');
    
    showDebugMessage('🎯 Carregando modelo...');
    await loadModel(phaseData.model);
    showDebugMessage('✅ Modelo carregado');
    
    showDebugMessage('🎯 Configurando objetos interativos...');
    setupInteractiveObjects(phaseData.objetos);
    showDebugMessage('✅ Fase carregada completamente');
}

// Função para carregar modelo GLB
function loadModel(modelPath) {
    return new Promise((resolve, reject) => {
        const modelEntity = document.getElementById('main-model');
        if (!modelEntity) {
            reject('Elemento do modelo não encontrado');
            return;
        }
        
        modelEntity.setAttribute('gltf-model', modelPath);
        
        modelEntity.addEventListener('model-loaded', function() {
            loadedModel = modelEntity.getObject3D('mesh');
            resolve(loadedModel);
        });
        
        modelEntity.addEventListener('model-error', function(error) {
            console.error('❌ Erro ao carregar modelo:', error);
            reject(error);
        });
    });
}

// Função para configurar objetos interativos
function setupInteractiveObjects(objects) {
    showDebugMessage('🎯 setupInteractiveObjects chamada: ' + objects.length + ' objetos');
    
    const container = document.getElementById('interactive-objects');
    if (!container) {
        showDebugMessage('❌ Container de objetos não encontrado');
        return;
    }
    
    showDebugMessage('✅ Container encontrado, limpando...');
    showDebugMessage('🔍 Container ID: ' + container.id);
    showDebugMessage('🔍 Container children antes: ' + container.children.length);
    
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    showDebugMessage('🔍 Container children depois: ' + container.children.length);
    
    showDebugMessage('🎯 Criando objetos interativos...');
    objects.forEach((obj, index) => {
        if (loadedModel) {
            hideObjectInModel(obj.id);
        }
        
        createInteractivePlane(obj, container, index);
    });
    
    showDebugMessage('🔍 Container children final: ' + container.children.length);
    showDebugMessage('✅ setupInteractiveObjects concluída');
}

// Função para esconder objeto no modelo 3D
function hideObjectInModel(objectId) {
    if (!loadedModel) return;
    
    loadedModel.traverse(function(child) {
        if (child.name === objectId || child.name.includes(objectId)) {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = 0;
                child.visible = false;
            }
        }
    });
}

// Função para obter posição do objeto no modelo
function getObjectPositionFromModel(objectId) {
    if (!loadedModel) return null;
    
    let objectPosition = null;
    
    loadedModel.traverse(function(child) {
        if (child.name === objectId || child.name.includes(objectId)) {
            const worldPosition = new THREE.Vector3();
            child.getWorldPosition(worldPosition);
            objectPosition = worldPosition;
        }
    });
    
    return objectPosition;
}

// Função para criar plane interativo
function createInteractivePlane(obj, container, index) {
    showDebugMessage('🎯 createInteractivePlane: ' + obj.id + ' (index: ' + index + ')');
    const plane = document.createElement('a-plane');
    
    let position = getObjectPositionFromModel(obj.id);
    
    if (!position) {
        const angle = (index * 360 / 3) * Math.PI / 180;
        const radius = 2;
        position = {
            x: Math.cos(angle) * radius,
            y: 1.5 + (index * 0.2),
            z: Math.sin(angle) * radius
        };
    } else {
        position = {
            x: position.x,
            y: position.y + 0.3,
            z: position.z
        };
    }
    
    plane.setAttribute('position', position);
    plane.setAttribute('width', '3.0');
    plane.setAttribute('height', '3.0');
    plane.setAttribute('material', {
        src: obj.imagem,
        transparent: true,
        alphaTest: 0.1
    });
    
    plane.setAttribute('billboard', '');
    plane.setAttribute('interactive-object', {
        objectId: obj.id,
        imageSrc: obj.imagem,
        pecaSrc: obj.peca
    });
    
    plane.setAttribute('cursor-listener', '');
    plane.classList.add('clickable');
    

    
    container.appendChild(plane);
    
    const pecaPlane = document.createElement('a-plane');
    const pecaPosition = {
        x: position.x,
        y: position.y,
        z: position.z
    };
    
    pecaPlane.setAttribute('position', pecaPosition);
    pecaPlane.setAttribute('width', '3.0');
    pecaPlane.setAttribute('height', '3.0');
    pecaPlane.setAttribute('visible', 'true'); // SEMPRE VISÍVEL PARA TESTE
    
    pecaPlane.setAttribute('billboard', '');
    
    const timestamp = Date.now() + Math.random();
    pecaPlane.id = 'peca-' + obj.id + '-' + timestamp;
    pecaPlane.classList.add('peca-plane');
    
    pecaPlane.setAttribute('material', {
        src: obj.peca,
        transparent: true,
        alphaTest: 0.1,
        emissive: '#FFFFFF',
        emissiveIntensity: 0.4
    });
    
    container.appendChild(pecaPlane);
    plane.pecaPlane = pecaPlane;
    
    showDebugMessage(`✅ Plane criado para objeto ${obj.id}`);
    showDebugMessage(`✅ Peça criada para objeto ${obj.id} (sempre visível)`);
    
    // Verificar se as peças foram realmente criadas
    setTimeout(() => {
        const allPieces = document.querySelectorAll('.peca-plane');
        showDebugMessage(`🔍 Verificação: ${allPieces.length} peças encontradas no DOM`);
        
        allPieces.forEach((piece, i) => {
            const isVisible = piece.getAttribute('visible');
            const position = piece.getAttribute('position');
            showDebugMessage(`🔍 Peça ${i+1}: visible=${isVisible}, position=${position}`);
        });
    }, 1000);
}

// Inicializar webcam
async function initWebcam() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Navegador não suporta acesso à câmera');
        }
        
        const video = document.getElementById('webcam');
        
        if (!video) {
            console.error('❌ Elemento de vídeo não encontrado!');
            return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        video.srcObject = stream;
        currentStream = stream;
        
        video.onloadedmetadata = function() {
            console.log('📷 Webcam inicializada com sucesso!');
        };
        
    } catch (error) {
        console.error('❌ Erro ao acessar webcam:', error);
        
        try {
            const video = document.getElementById('webcam');
            if (video) {
                const frontStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'user'
                    } 
                });
                video.srcObject = frontStream;
                currentStream = frontStream;
            }
        } catch (frontError) {
            console.error('❌ Erro com câmera frontal também:', frontError);
            
            const scene = document.querySelector('a-scene');
            if (scene) {
                scene.setAttribute('background', 'color: #001133');
            }
        }
    }
}

// Função para alternar entre modo AR e HDRI
function toggleMode() {
    const video = document.getElementById('webcam');
    const sky = document.querySelector('a-sky');
    const scene = document.querySelector('a-scene');
    const button = document.getElementById('toggleMode');
    
    if (isARMode) {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        if (video) {
            video.srcObject = null;
            video.style.display = 'none';
        }
        
        if (sky) {
            sky.setAttribute('visible', 'true');
        }
        if (scene) {
            scene.setAttribute('background', '');
        }
        
        button.textContent = 'Modo AR';
        isARMode = false;
        
    } else {
        if (sky) {
            sky.setAttribute('visible', 'false');
        }
        if (scene) {
            scene.setAttribute('background', 'transparent: true');
        }
        
        if (video) {
            video.style.display = 'block';
        }
        initWebcam();
        
        button.textContent = 'Modo HDRI';
        isARMode = true;
    }
}

// Aguardar DOM carregar antes de inicializar
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleMode');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleMode);
    }
    
    const clearButton = document.getElementById('clearPecas');
    if (clearButton) {
        clearButton.addEventListener('click', clearAllPecas);
    }
    
    const sky = document.querySelector('a-sky');
    if (sky) {
        sky.setAttribute('visible', 'false');
    }
    
    initWebcam();
    
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('loaded', function() {
            showDebugMessage('🎮 Cena A-Frame carregada - inicializando sistema...');
            
            loadGameData();
            
            const video = document.getElementById('webcam');
            if (video && !video.srcObject && isARMode) {
                initWebcam();
            }
            
            setupAutoReset();
            
            showDebugMessage('✅ Sistema inicializado com sucesso!');
        });
    } else {
        showDebugMessage('❌ Cena A-Frame não encontrada!');
    }
});

// Sistema simplificado de reset por tempo
function setupAutoReset() {
    console.log('📱 Sistema de reset automático por tempo');
    
    setInterval(() => {
        const cursor = document.querySelector('#main-cursor');
        if (cursor && cursor.components && cursor.components['auto-detect']) {
            cursor.components['auto-detect'].lastTriggered = {};
            console.log('🔄 Reset automático - permitindo novas detecções');
        }
    }, 2000);
}

// Função para integrar com o sistema de gerenciamento de telas
function integrateWithScreenManager() {
    try {
        // Integração com o sistema modular de telas
        if (window.screenManager) {
            console.log('🔗 Integrando com ScreenManager');
            
            // O puzzleManager já está integrado automaticamente
            // Não precisa de configuração adicional
        } else {
            console.log('⚠️ ScreenManager não disponível ainda');
        }
    } catch (error) {
        console.error('❌ Erro na integração com ScreenManager:', error);
    }
}

// Função para ativar o efeito de flash
function triggerCameraFlash() {
    const flashElement = document.getElementById('camera-flash');
    if (flashElement) {
        flashElement.classList.add('active');
        
        setTimeout(() => {
            flashElement.classList.remove('active');
        }, 300);
        
        playCameraSound();
        vibrateDevice();
        // checkVisiblePieces(); // Removido para evitar chamada duplicada
    }
}

// Função para tocar som de câmera
function playCameraSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        // Som não disponível
    }
}

// Função para vibrar dispositivo
function vibrateDevice() {
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
}

// Função para verificar peças visíveis
function checkVisiblePieces() {
    // Evitar chamadas duplicadas
    if (window.isCheckingPieces) {
        console.log('⚠️ checkVisiblePieces já em execução, ignorando...');
        return;
    }
    
    window.isCheckingPieces = true;
    console.log('🎯 Iniciando checkVisiblePieces...');
    const allPieces = document.querySelectorAll('.peca-plane');
    

    
    const visiblePieces = Array.from(allPieces).filter(piece => {
        const isVisible = piece.getAttribute('visible') === 'true';
        const rect = piece.getBoundingClientRect();
        const isOnScreen = rect.width > 0 && rect.height > 0 && 
                          rect.top >= 0 && rect.left >= 0 && 
                          rect.bottom <= window.innerHeight && 
                          rect.right <= window.innerWidth;
        const notPhotographed = !isPiecePhotographed(piece);
        

        
        return isVisible && isOnScreen && notPhotographed;
    });
    
    const aframeVisiblePieces = Array.from(allPieces).filter(piece => {
        if (piece.object3D) {
            const isVisible = piece.object3D.visible === true;
            const notPhotographed = !isPiecePhotographed(piece);
            return isVisible && notPhotographed;
        }
        return false;
    });
    
    // Para mobile, usar apenas A-Frame, para desktop usar ambos
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;
    
    console.log('📱 Mobile:', isMobile);
    console.log('📊 Total peças:', allPieces.length);
    console.log('👁️ Peças visíveis (getBoundingClientRect):', visiblePieces.length);
    console.log('🎯 Peças visíveis (A-Frame):', aframeVisiblePieces.length);
    
    const finalVisiblePieces = isMobile ? aframeVisiblePieces : (aframeVisiblePieces.length > 0 ? aframeVisiblePieces : visiblePieces);
    
    console.log('✅ Peças finais selecionadas:', finalVisiblePieces.length);
    

    
    if (finalVisiblePieces.length > 0) {
        finalVisiblePieces.forEach(piece => {
            markPieceAsPhotographed(piece);
        });
        
        const firstPiece = finalVisiblePieces[0];
        const pieceImageSrc = firstPiece.getAttribute('material')?.src || null;
        
        showPhotoFeedback(true, finalVisiblePieces.length, pieceImageSrc);
    } else {
        showPhotoFeedback(false, 0, null);
    }
    
    // Reset da flag
    window.isCheckingPieces = false;
    console.log('📸 Verificação de peças concluída');
}

// Função para marcar peça como fotografada
function markPieceAsPhotographed(piece) {
    const pieceId = piece.id;
    photographedPieces.add(pieceId);
    
    piece.classList.add('photographed');
    
    piece.setAttribute('material', {
        ...piece.getAttribute('material'),
        opacity: 0.3,
        transparent: true
    });
    
    updatePhotoCounter();
    
    if (photographedPieces.size >= document.querySelectorAll('.peca-plane').length) {
        setTimeout(() => {
            if (window.puzzleManager) {
                window.puzzleManager.startPuzzle();
            } else {
                console.error('❌ Puzzle Manager não encontrado');
            }
        }, 2000);
    }
}

// Função para verificar se peça já foi fotografada
function isPiecePhotographed(piece) {
    return photographedPieces.has(piece.id);
}

// Função de debug para testar detecção de peças em dispositivos móveis
function debugVisiblePieces() {
    const allPieces = document.querySelectorAll('.peca-plane');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;
    
    console.log('🔍 Debug de peças visíveis:');
    console.log('📱 Dispositivo móvel:', isMobile);
    console.log('📊 Total de peças:', allPieces.length);
    
    allPieces.forEach((piece, index) => {
        const isVisible = piece.getAttribute('visible') === 'true';
        const object3DVisible = piece.object3D ? piece.object3D.visible : 'N/A';
        const isPhotographed = isPiecePhotographed(piece);
        
        console.log(`Peça ${index + 1}:`, {
            id: piece.id,
            visible: isVisible,
            object3DVisible: object3DVisible,
            photographed: isPhotographed,
            position: piece.getAttribute('position')
        });
    });
}

// Função para resetar peças fotografadas
function resetPhotographedPieces() {
    photographedPieces.clear();
    
    const allPieces = document.querySelectorAll('.peca-plane');
    allPieces.forEach(piece => {
        piece.classList.remove('photographed');
        const material = piece.getAttribute('material');
        if (material) {
            piece.setAttribute('material', {
                ...material,
                opacity: 1.0,
                transparent: true
            });
        }
    });
    
    updatePhotoCounter();
}

// Função para atualizar o contador de peças fotografadas
function updatePhotoCounter() {
    const photoCountElement = document.getElementById('photo-count');
    const totalPiecesElement = document.getElementById('total-pieces');
    const counterElement = document.getElementById('photo-counter');
    
    if (photoCountElement && totalPiecesElement && counterElement) {
        const totalPieces = document.querySelectorAll('.peca-plane').length;
        const photographedCount = photographedPieces.size;
        
        photoCountElement.textContent = photographedCount;
        totalPiecesElement.textContent = totalPieces;
        
        counterElement.classList.add('updated');
        setTimeout(() => {
            counterElement.classList.remove('updated');
        }, 500);
    }
}

// Função para inicializar o contador
function initPhotoCounter() {
    updatePhotoCounter();
}

// Função para mostrar feedback da foto
function showPhotoFeedback(success, pieceCount, pieceImageSrc = null) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        background: ${success ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)'};
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        animation: feedbackFade 2s ease-out forwards;
        min-width: 200px;
        max-width: 300px;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    `;
    
    const text = document.createElement('div');
    text.textContent = success 
        ? `📸 Foto tirada! ${pieceCount} peça(s) capturada(s)`
        : '📸 Nenhuma peça encontrada na foto';
    text.style.cssText = `
        font-size: 16px;
        line-height: 1.4;
    `;
    content.appendChild(text);
    
    if (success && pieceImageSrc && pieceCount > 0) {
        const pieceImage = document.createElement('img');
        pieceImage.src = pieceImageSrc;
        pieceImage.style.cssText = `
            width: 80px;
            height: 80px;
            object-fit: contain;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: pieceImagePop 0.5s ease-out 0.3s both;
        `;
        
        pieceImage.onerror = () => {
            pieceImage.style.display = 'none';
        };
        
        content.appendChild(pieceImage);
        
        if (pieceCount > 1) {
            const extraText = document.createElement('div');
            extraText.textContent = `+${pieceCount - 1} mais`;
            extraText.style.cssText = `
                font-size: 14px;
                opacity: 0.8;
                font-style: italic;
            `;
            content.appendChild(extraText);
        }
    }
    
    feedback.appendChild(content);
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 2000);
}

// Exportar funções globais para uso pelos módulos
window.triggerCameraFlash = triggerCameraFlash;
window.checkVisiblePieces = checkVisiblePieces;
window.markPieceAsPhotographed = markPieceAsPhotographed;
window.isPiecePhotographed = isPiecePhotographed;
window.updatePhotoCounter = updatePhotoCounter;
window.playCameraSound = playCameraSound;
window.vibrateDevice = vibrateDevice;
window.showPhotoFeedback = showPhotoFeedback;
window.resetPhotographedPieces = resetPhotographedPieces;
window.clearAllPecas = clearAllPecas;
window.initWebcam = initWebcam;
window.loadGameData = loadGameData;
window.toggleMode = toggleMode; 