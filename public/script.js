// Variáveis globais
let gameData = null;
let currentPhase = 'fase1';
let loadedModel = null;

// Componente para fazer objetos sempre olharem para a câmera
AFRAME.registerComponent('billboard', {
    tick: function () {
        const camera = document.querySelector('[camera]');
        if (camera) {
            this.el.object3D.lookAt(camera.object3D.position);
        }
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
        let isGlowing = false;
        
        // Eventos de clique/toque
        el.addEventListener('click', function () {
            console.log('🎯 Objeto clicado:', data.objectId);
            
            if (!isGlowing) {
                // Ativar brilho
                el.setAttribute('animation__glow', {
                    property: 'material.emissiveIntensity',
                    to: 0.8,
                    dur: 1000,
                    loop: true,
                    dir: 'alternate'
                });
                
                el.setAttribute('material', {
                    emissive: '#FF1493',
                    emissiveIntensity: 0.5
                });
                
                // Aumentar tamanho
                el.setAttribute('animation__scale', {
                    property: 'scale',
                    to: '1.2 1.2 1.2',
                    dur: 300
                });
                
                isGlowing = true;
                
                // Mostrar peça
                showPeca(data.pecaSrc);
                
            } else {
                // Voltar ao normal
                el.removeAttribute('animation__glow');
                el.setAttribute('material', {
                    emissive: '#000000',
                    emissiveIntensity: 0
                });
                
                el.setAttribute('animation__scale', {
                    property: 'scale',
                    to: '1 1 1',
                    dur: 300
                });
                
                isGlowing = false;
                
                // Esconder peça
                hidePeca();
            }
        });
        
        // Feedback visual no hover
        el.addEventListener('mouseenter', function () {
            if (!isGlowing) {
                el.setAttribute('animation__hover', {
                    property: 'scale',
                    to: '1.1 1.1 1.1',
                    dur: 200
                });
            }
        });
        
        el.addEventListener('mouseleave', function () {
            if (!isGlowing) {
                el.setAttribute('animation__hover', {
                    property: 'scale',
                    to: '1 1 1',
                    dur: 200
                });
            }
        });
    }
});

// Função para mostrar peça
function showPeca(pecaSrc) {
    const modal = document.getElementById('peca-modal');
    const plane = document.getElementById('peca-plane');
    
    if (modal && plane) {
        plane.setAttribute('material', 'src', pecaSrc);
        modal.setAttribute('visible', true);
        
        // Posicionar na frente da câmera
        const camera = document.querySelector('[camera]');
        if (camera) {
            const cameraPosition = camera.getAttribute('position');
            modal.setAttribute('position', {
                x: cameraPosition.x,
                y: cameraPosition.y,
                z: cameraPosition.z - 2
            });
        }
        
        console.log('📋 Mostrando peça:', pecaSrc);
    }
}

// Função para esconder peça
function hidePeca() {
    const modal = document.getElementById('peca-modal');
    if (modal) {
        modal.setAttribute('visible', false);
        console.log('❌ Peça escondida');
    }
}

// Fechar peça ao clicar no fundo
document.addEventListener('click', function(event) {
    if (event.target.id === 'peca-background') {
        hidePeca();
    }
});

// Função para carregar dados do JSON
async function loadGameData() {
    try {
        console.log('📊 Carregando dados do jogo...');
        const response = await fetch('assets/data/data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        gameData = await response.json();
        console.log('✅ Dados carregados:', gameData);
        
        // Carregar fase atual
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
    console.log('🎮 Carregando fase:', phaseName);
    
    // Carregar modelo 3D
    await loadModel(phaseData.model);
    
    // Configurar objetos interativos
    setupInteractiveObjects(phaseData.objetos);
}

// Função para carregar modelo GLB
function loadModel(modelPath) {
    return new Promise((resolve, reject) => {
        console.log('🏗️ Carregando modelo:', modelPath);
        
        const modelEntity = document.getElementById('main-model');
        if (!modelEntity) {
            reject('Elemento do modelo não encontrado');
            return;
        }
        
        modelEntity.setAttribute('gltf-model', modelPath);
        
        modelEntity.addEventListener('model-loaded', function() {
            loadedModel = modelEntity.getObject3D('mesh');
            console.log('✅ Modelo carregado com sucesso!');
            
            // Debug: listar todos os objetos no modelo
            debugListModelObjects();
            
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
    console.log('🎯 Configurando objetos interativos...');
    
    const container = document.getElementById('interactive-objects');
    if (!container) {
        console.error('❌ Container de objetos não encontrado');
        return;
    }
    
    // Limpar objetos existentes
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    objects.forEach((obj, index) => {
        console.log(`🔧 Configurando objeto ${obj.id}...`);
        
        // Encontrar objeto no modelo e torná-lo transparente
        if (loadedModel) {
            hideObjectInModel(obj.id);
        }
        
        // Criar plane interativo
        createInteractivePlane(obj, container, index);
    });
}

// Função para esconder objeto no modelo 3D
function hideObjectInModel(objectId) {
    if (!loadedModel) return;
    
    // Procurar objeto por nome/ID no modelo
    loadedModel.traverse(function(child) {
        if (child.name === objectId || child.name.includes(objectId)) {
            console.log(`👻 Tornando transparente: ${child.name}`);
            
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
            // Obter posição world do objeto
            const worldPosition = new THREE.Vector3();
            child.getWorldPosition(worldPosition);
            objectPosition = worldPosition;
            console.log(`📍 Posição encontrada para ${objectId}:`, worldPosition);
        }
    });
    
    return objectPosition;
}

// Função de debug para listar objetos do modelo
function debugListModelObjects() {
    if (!loadedModel) {
        console.log('❌ Modelo não carregado para debug');
        return;
    }
    
    console.log('🔍 === DEBUG: Objetos no modelo ===');
    
    loadedModel.traverse(function(child) {
        if (child.name && child.name !== '') {
            const position = new THREE.Vector3();
            child.getWorldPosition(position);
            
            console.log(`📦 Objeto: "${child.name}" | Tipo: ${child.type} | Posição:`, {
                x: Math.round(position.x * 100) / 100,
                y: Math.round(position.y * 100) / 100,
                z: Math.round(position.z * 100) / 100
            });
        }
    });
    
    console.log('🔍 === FIM DEBUG ===');
}

// Função para criar plane interativo
function createInteractivePlane(obj, container, index) {
    const plane = document.createElement('a-plane');
    
    // Tentar obter posição real do modelo, senão usar posição de fallback
    let position = getObjectPositionFromModel(obj.id);
    
    if (!position) {
        // Posição de fallback - distribuir em círculo
        const angle = (index * 360 / 3) * Math.PI / 180;
        const radius = 2;
        position = {
            x: Math.cos(angle) * radius,
            y: 1.5 + (index * 0.2),
            z: Math.sin(angle) * radius
        };
        console.log(`⚠️ Usando posição de fallback para ${obj.id}`);
    } else {
        // Ajustar posição para ficar um pouco à frente
        position = {
            x: position.x,
            y: position.y + 0.3, // Elevar um pouco
            z: position.z
        };
    }
    
    plane.setAttribute('position', position);
    plane.setAttribute('width', '0.5');
    plane.setAttribute('height', '0.5');
    plane.setAttribute('material', {
        src: obj.imagem,
        transparent: true,
        alphaTest: 0.1
    });
    
    // Componentes
    plane.setAttribute('billboard', '');
    plane.setAttribute('interactive-object', {
        objectId: obj.id,
        imageSrc: obj.imagem,
        pecaSrc: obj.peca
    });
    
    plane.classList.add('clickable');
    
    container.appendChild(plane);
    
    console.log(`✅ Plane criado para objeto ${obj.id} em`, position);
}

// Inicializar webcam
async function initWebcam() {
    try {
        // Verificar suporte do navegador
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Navegador não suporta acesso à câmera');
        }
        
        const video = document.getElementById('webcam');
        
        if (!video) {
            console.error('❌ Elemento de vídeo não encontrado!');
            return;
        }
        
        console.log('🔍 Tentando acessar a câmera...');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment', // Câmera traseira no celular
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        video.srcObject = stream;
        currentStream = stream; // Salvar stream para poder parar depois
        
        // Aguardar o vídeo carregar
        video.onloadedmetadata = function() {
            console.log('📷 Webcam inicializada com sucesso!');
        };
        
    } catch (error) {
        console.error('❌ Erro ao acessar webcam:', error);
        console.log('💡 Tentando usar câmera frontal...');
        
        // Tentar câmera frontal como fallback
        try {
            const video = document.getElementById('webcam');
            if (video) {
                const frontStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'user' // Câmera frontal
                    } 
                });
                video.srcObject = frontStream;
                currentStream = frontStream; // Salvar stream da câmera frontal também
                console.log('📷 Câmera frontal inicializada!');
            }
        } catch (frontError) {
            console.error('❌ Erro com câmera frontal também:', frontError);
            
            // Fallback final: fundo escuro
            const scene = document.querySelector('a-scene');
            if (scene) {
                scene.setAttribute('background', 'color: #001133');
                console.log('🎨 Usando fundo escuro como fallback');
            }
        }
    }
}

// Variáveis globais
let isARMode = true;
let currentStream = null;

// Função para alternar entre modo AR e HDRI
function toggleMode() {
    const video = document.getElementById('webcam');
    const sky = document.querySelector('a-sky');
    const scene = document.querySelector('a-scene');
    const button = document.getElementById('toggleMode');
    
    if (isARMode) {
        // Mudar para modo HDRI
        console.log('🌅 Mudando para modo HDRI...');
        
        // Parar webcam
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        if (video) {
            video.srcObject = null;
            video.style.display = 'none';
        }
        
        // Ativar HDRI
        if (sky) {
            sky.setAttribute('visible', 'true');
        }
        if (scene) {
            scene.setAttribute('background', '');
        }
        
        button.textContent = 'Modo AR';
        isARMode = false;
        
        // Esconder objetos interativos em modo HDRI (opcional)
        const interactiveContainer = document.getElementById('interactive-objects');
        if (interactiveContainer) {
            interactiveContainer.setAttribute('visible', 'true'); // Manter visível
        }
        
    } else {
        // Mudar para modo AR
        console.log('📱 Mudando para modo AR...');
        
        // Desativar HDRI
        if (sky) {
            sky.setAttribute('visible', 'false');
        }
        if (scene) {
            scene.setAttribute('background', 'transparent: true');
        }
        
        // Reativar webcam
        if (video) {
            video.style.display = 'block';
        }
        initWebcam();
        
        button.textContent = '🌅 Modo HDRI';
        isARMode = true;
    }
}

// Aguardar DOM carregar antes de inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SAE RA - DOM Carregado!');
    
    // Configurar botão de alternância
    const toggleButton = document.getElementById('toggleMode');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleMode);
    }
    
    // Inicializar em modo AR por padrão
    const sky = document.querySelector('a-sky');
    if (sky) {
        sky.setAttribute('visible', 'false');
    }
    
    // Tentar inicializar webcam imediatamente
    initWebcam();
    
    // Backup: também tentar quando a cena A-Frame carregar
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('loaded', function() {
            console.log('🎬 Cena A-Frame carregada!');
            
            // Carregar dados do jogo
            loadGameData();
            
            // Só inicializar novamente se o vídeo ainda não tem stream
            const video = document.getElementById('webcam');
            if (video && !video.srcObject && isARMode) {
                console.log('🔄 Tentando inicializar webcam novamente...');
                initWebcam();
            }
        });
    }
});

// Função para tentar carregar HDRI em diferentes formatos
function loadHDRI() {
    const formats = ['jpg', 'png', 'hdr'];
    let formatIndex = 0;
    
    function tryNextFormat() {
        if (formatIndex >= formats.length) {
            console.log('⚠️ Nenhum formato de skybox encontrado - usando gradient');
            console.log('💡 Coloque sky.jpg ou sky.png na pasta assets/');
            console.log('🔧 Dica: Use https://www.hdri-to-cubemap.com/ para converter');
            return;
        }
        
        const format = formats[formatIndex];
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            console.log(`✅ Skybox ${format.toUpperCase()} carregado com sucesso!`);
            // Substituir o gradient pelo skybox real
            const sky = document.querySelector('a-sky');
            if (sky) {
                sky.setAttribute('src', `assets/textures/sky.${format}`);
            }
        };
        
        img.onerror = function() {
            console.log(`❌ sky.${format} não encontrado, tentando próximo formato...`);
            formatIndex++;
            tryNextFormat();
        };
        
        img.src = `assets/textures/sky.${format}`;
    }
    
    tryNextFormat();
}

// Log de inicialização
console.log('🚀 SAE RA - Experiência 360° Inicializada! Gire para explorar o cinturão de objetos!');

// Tentar carregar HDRI
loadHDRI(); 