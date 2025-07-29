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

// Componente para fazer objetos sempre olharem para a câmera
AFRAME.registerComponent('billboard', {
    tick: function () {
        const camera = document.querySelector('[camera]');
        if (camera) {
            this.el.object3D.lookAt(camera.object3D.position);
        }
    }
});

// Componente para detecção automática baseada na DIREÇÃO da câmera
AFRAME.registerComponent('auto-detect', {
    init: function () {
        this.lastTriggered = {};
        this.lastIntersectedObjects = new Set();
        this.checkInterval = 100;
        this.lastCheck = 0;
        this.cooldown = 800;
        this.raycaster = new THREE.Raycaster();
        this.camera = null;
    },
    
    tick: function (time) {
        if (time - this.lastCheck < this.checkInterval) return;
        this.lastCheck = time;
        
        if (!this.camera) {
            this.camera = document.querySelector('a-camera');
            if (!this.camera) return;
        }
        
        const interactiveObjects = document.querySelectorAll('.clickable');
        if (interactiveObjects.length === 0) return;
        
        const cameraObj = this.camera.object3D;
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(cameraObj.quaternion);
        
        this.raycaster.set(cameraObj.position, direction);
        
        const threeObjects = [];
        interactiveObjects.forEach(el => {
            if (el.object3D) {
                el.object3D.userData.aframeElement = el;
                threeObjects.push(el.object3D);
            }
        });
        
        const intersections = this.raycaster.intersectObjects(threeObjects, true);
        const previouslyIntersected = new Set();
        
        if (intersections.length > 0) {
            let targetObject = intersections[0].object;
            
            while (targetObject && !targetObject.userData.aframeElement) {
                targetObject = targetObject.parent;
            }
            
            if (targetObject && targetObject.userData.aframeElement) {
                const firstEl = targetObject.userData.aframeElement;
                
                if (firstEl.hasAttribute('interactive-object')) {
                    const component = firstEl.components['interactive-object'];
                    if (component) {
                        const objectId = component.data.objectId;
                        previouslyIntersected.add(objectId);
                        
                        if (!this.lastTriggered[objectId] || 
                            time - this.lastTriggered[objectId] > this.cooldown) {
                            
                            this.lastTriggered[objectId] = time;
                            
                            const showFunction = firstEl.showPecaOnIntersection;
                            if (showFunction) {
                                const pecaPlane = firstEl.pecaPlane;
                                if (pecaPlane && !pecaPlane.getAttribute('visible')) {
                                    showFunction();
                                }
                            }
                        }
                    }
                }
            }
        }
        
        if (this.lastIntersectedObjects) {
            this.lastIntersectedObjects.forEach(objectId => {
                if (!previouslyIntersected.has(objectId)) {
                    const interactiveObjects = document.querySelectorAll('.clickable');
                    interactiveObjects.forEach(el => {
                        if (el.hasAttribute('interactive-object')) {
                            const component = el.components['interactive-object'];
                            if (component && component.data.objectId === objectId) {
                                const hideFunction = el.hidePecaOnIntersectionCleared;
                                if (hideFunction) {
                                    hideFunction();
                                }
                            }
                        }
                    });
                }
            });
        }
        
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
        }
        
        function hidePecaOnIntersectionCleared(event) {
            if (el.pecaPlane) {
                el.pecaPlane.removeAttribute('animation__glow');
                
                setTimeout(() => {
                    el.pecaPlane.setAttribute('visible', 'false');
                    el.pecaPlane.removeAttribute('animation__hide');
                }, 200);
            }
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
    try {
        const response = await fetch('assets/data/data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        gameData = await response.json();
        
        await loadPhase(currentPhase);
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
}

// Função para carregar uma fase
async function loadPhase(phaseName) {
    if (!gameData || !gameData[phaseName]) {
        console.error('❌ Fase não encontrada:', phaseName);
        return;
    }
    
    const phaseData = gameData[phaseName];
    
    await loadModel(phaseData.model);
    setupInteractiveObjects(phaseData.objetos);
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
    const container = document.getElementById('interactive-objects');
    if (!container) {
        console.error('❌ Container de objetos não encontrado');
        return;
    }
    
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    objects.forEach((obj, index) => {
        if (loadedModel) {
            hideObjectInModel(obj.id);
        }
        
        createInteractivePlane(obj, container, index);
    });
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
    pecaPlane.setAttribute('visible', 'false');
    
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
            loadGameData();
            
            const video = document.getElementById('webcam');
            if (video && !video.srcObject && isARMode) {
                initWebcam();
            }
            
            setupAutoReset();
        });
    }
});

// Sistema simplificado de reset por tempo
function setupAutoReset() {
    setInterval(() => {
        const cursor = document.querySelector('#main-cursor');
        if (cursor && cursor.components && cursor.components['auto-detect']) {
            cursor.components['auto-detect'].lastTriggered = {};
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
        checkVisiblePieces();
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
    
    const finalVisiblePieces = aframeVisiblePieces.length > 0 ? aframeVisiblePieces : visiblePieces;
    
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