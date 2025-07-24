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
        
        // Função para criar peça permanente quando raycaster detecta intersecção
        let alreadyTriggered = false;
        
        function showPecaOnIntersection(event) {
            // Evitar multiple triggers do mesmo objeto
            if (alreadyTriggered) return;
            alreadyTriggered = true;
            
            console.log('🎯 Cursor detectou objeto:', data.objectId);
            
            // Criar plane da peça permanente na frente do objeto
            const pecaPlane = document.createElement('a-plane');
            const objectPosition = el.getAttribute('position');
            
            console.log('📍 Posição do objeto:', objectPosition);
            
            // Posicionar peça em cima do objeto clicado
            const pecaPosition = {
                x: objectPosition.x,
                y: objectPosition.y + 0.8, // 0.8 unidades acima do objeto
                z: objectPosition.z - 0.3   // Um pouco na frente do objeto
            };
            
            console.log('🎯 Peça vai aparecer em cima do objeto:', pecaPosition);
            console.log('💥 INICIANDO EFEITO POPUP DRAMÁTICO!');
            
            pecaPlane.setAttribute('position', pecaPosition);
            pecaPlane.setAttribute('width', '1.2');
            pecaPlane.setAttribute('height', '1.2');
            
            // Começar invisível para efeito de aparecer
            pecaPlane.setAttribute('scale', '0.1 0.1 0.1');
            pecaPlane.setAttribute('color', '#FFFF00'); // Amarelo para teste
            
            // Efeito dramático de aparecer
            pecaPlane.setAttribute('animation__popup', {
                property: 'scale',
                from: '0.1 0.1 0.1',
                to: '1.3 1.3 1.3',
                dur: 300
            });
            
            // Depois volta ao tamanho normal
            setTimeout(() => {
                pecaPlane.setAttribute('animation__normalize', {
                    property: 'scale',
                    from: '1.3 1.3 1.3',
                    to: '1 1 1',
                    dur: 200
                });
                console.log('✨ Efeito popup finalizado - peça estabilizada!');
            }, 300);
            
            // Carregar textura após animação
            setTimeout(() => {
                pecaPlane.setAttribute('material', {
                    src: data.pecaSrc,
                    transparent: true,
                    alphaTest: 0.1,
                    emissive: '#FFFFFF',
                    emissiveIntensity: 0.4
                });
                console.log('🖼️ Textura aplicada:', data.pecaSrc);
            }, 100);
            
            // Fazer a peça sempre olhar para a câmera
            pecaPlane.setAttribute('billboard', '');
            
            // Adicionar brilho pulsante para chamar atenção
            setTimeout(() => {
                pecaPlane.setAttribute('animation__glow', {
                    property: 'material.emissiveIntensity',
                    from: 0.4,
                    to: 0.8,
                    dur: 1500,
                    loop: true,
                    dir: 'alternate'
                });
            }, 500);
            
            // ID único para cada peça
            const timestamp = Date.now();
            pecaPlane.id = 'peca-' + timestamp;
            pecaPlane.classList.add('peca-plane');
            
            // Adicionar à cena
            const container = document.getElementById('interactive-objects');
            if (container) {
                container.appendChild(pecaPlane);
                console.log('✅ Peça permanente criada via hover!');
            } else {
                console.log('❌ ERRO: Container não encontrado');
            }
        }
        
        // As peças agora são permanentes - não esconder quando o cursor sai
        
        // Debug: adicionar logs para entender se o raycaster funciona
        console.log('🔧 Adicionando event listener para', data.objectId);
        
        // Usar eventos do raycaster do A-Frame (funciona em desktop e mobile)
        el.addEventListener('raycaster-intersection', function(event) {
            console.log('🎯 RAYCASTER DETECTOU:', data.objectId);
            showPecaOnIntersection(event);
        });
        
        // Backup: adicionar mouseenter para desktop
        el.addEventListener('mouseenter', function(event) {
            console.log('🖱️ MOUSE ENTER detectado:', data.objectId);
            showPecaOnIntersection(event);
        });
        
        // Adicionar touchstart para mobile (sem precisar de click completo)
        el.addEventListener('touchstart', function(event) {
            console.log('👆 TOUCH START detectado:', data.objectId);
            event.preventDefault(); // Evitar que vire um click
            showPecaOnIntersection(event);
        });
        
        // Para mobile: adicionar também touchend (mais compatível)
        el.addEventListener('touchend', function(event) {
            console.log('👆 TOUCH END detectado:', data.objectId);
            event.preventDefault(); // Evitar que vire um click
            showPecaOnIntersection(event);
        });
        
        // Armazenar função no elemento para acesso móvel
        el.showPecaOnIntersection = showPecaOnIntersection;
        
        // Removido: raycaster-intersection-cleared - peças ficam permanentes
        // Agora funciona com hover, mouseenter e touchstart
    }
});

// Função antiga showPeca (não mais usada - agora as peças são criadas no início)
// Mantida apenas para compatibilidade se necessário
function showPeca(pecaSrc, targetElement) {
    console.log('⚠️ showPeca() chamada mas não é mais usada - peças são criadas no hover');
}

// Função para esconder peça (não usada mais automaticamente)
function hidePeca() {
    // Esta função não é mais usada automaticamente
    // As peças agora ficam permanentes até o usuário clicar "Limpar Peças"
    console.log('ℹ️ hidePeca() chamada mas peças agora são permanentes');
}

// Função para limpar todas as peças permanentes
function clearAllPecas() {
    const pecas = document.querySelectorAll('.peca-plane');
    let count = 0;
    pecas.forEach(peca => {
        peca.remove();
        count++;
    });
    console.log(`🗑️ ${count} peça(s) removida(s)`);
}

// Comentar temporariamente para debug - peça não deve sumir
// document.addEventListener('click', function(event) {
//     console.log('🖱️ Clique detectado em:', event.target.tagName, event.target.classList);
//     
//     // Se clicou na cena ou no fundo, fechar peça
//     if (event.target.tagName === 'A-SCENE' || 
//         event.target.tagName === 'CANVAS' ||
//         event.target.id === 'webcam') {
//         hidePeca();
//     }
// });

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
    plane.setAttribute('width', '2.0');
    plane.setAttribute('height', '2.0');
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
    
    // Tornar o plane clicável pelo cursor do A-Frame
    plane.setAttribute('cursor-listener', '');
    plane.classList.add('clickable');
    
    // Debug: verificar se a classe foi adicionada
    console.log(`🎯 Objeto ${obj.id} criado com classe clickable:`, plane.classList.contains('clickable'));
    
    container.appendChild(plane);
    
    // Criar peça correspondente (INVISÍVEL no início)
    const pecaPlane = document.createElement('a-plane');
    const pecaPosition = {
        x: position.x,
        y: position.y + 0.8, // 0.8 unidades acima do objeto
        z: position.z - 0.3   // Um pouco na frente do objeto
    };
    
    pecaPlane.setAttribute('position', pecaPosition);
    pecaPlane.setAttribute('width', '2.0');
    pecaPlane.setAttribute('height', '2.0');
    pecaPlane.setAttribute('visible', 'false'); // INVISÍVEL no início
    
    // Fazer a peça sempre olhar para a câmera
    pecaPlane.setAttribute('billboard', '');
    
    // ID único para cada peça
    const timestamp = Date.now() + Math.random();
    pecaPlane.id = 'peca-' + obj.id + '-' + timestamp;
    pecaPlane.classList.add('peca-plane');
    
    // Carregar textura da peça
    pecaPlane.setAttribute('material', {
        src: obj.peca,
        transparent: true,
        alphaTest: 0.1,
        emissive: '#FFFFFF',
        emissiveIntensity: 0.4
    });
    
    // Adicionar peça à cena
    container.appendChild(pecaPlane);
    
    // Armazenar referência da peça no plane do objeto para fácil acesso
    plane.pecaPlane = pecaPlane;
    
    console.log(`✅ Plane criado para objeto ${obj.id} em`, position);
    console.log(`✅ Peça criada para objeto ${obj.id} (inicialmente invisível)`);
    
    // Log de debug para verificar se os event listeners foram adicionados
    console.log(`🎧 Event listeners adicionados para objeto ${obj.id}`);
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
        
        button.textContent = 'Modo HDRI';
        isARMode = true;
    }
}

// Sistema de detecção automática para mobile
function startMobileDetection() {
    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('📱 Mobile detectado - iniciando sistema de auto-detecção');
        
        // Usar orientação da câmera para detectar objetos
        const camera = document.querySelector('a-camera');
        
        // Verificar intersecções a cada 200ms (mais responsivo)
        setInterval(() => {
            const cursor = document.querySelector('a-cursor');
            if (cursor && cursor.components && cursor.components.raycaster) {
                const intersections = cursor.components.raycaster.intersectedEls;
                
                if (intersections.length > 0) {
                    const intersectedEl = intersections[0];
                    
                    // Verificar se tem o componente interactive-object
                    if (intersectedEl.hasAttribute('interactive-object')) {
                        const component = intersectedEl.components['interactive-object'];
                        if (component && !intersectedEl.alreadyTriggeredMobile) {
                            console.log('📱 Auto-detecção móvel:', component.data.objectId);
                            intersectedEl.alreadyTriggeredMobile = true;
                            
                            // Disparar diretamente a função de criar peça
                            const showPecaFunction = intersectedEl.showPecaOnIntersection;
                            if (showPecaFunction) {
                                showPecaFunction();
                            }
                        }
                    }
                }
            }
        }, 200); // Verificar a cada 200ms
    }
}

// Função para adicionar detecção via movimento do dispositivo
function addDeviceOrientationDetection() {
    // Para mobile: quando mexer o celular, resetar flags para permitir nova detecção
    if ('DeviceOrientationEvent' in window) {
        let lastCheck = 0;
        
        window.addEventListener('deviceorientation', function() {
            const now = Date.now();
            if (now - lastCheck > 1000) { // A cada 1 segundo
                // Resetar flags para permitir nova detecção
                const interactiveObjects = document.querySelectorAll('[interactive-object]');
                interactiveObjects.forEach(obj => {
                    obj.alreadyTriggeredMobile = false;
                });
                lastCheck = now;
            }
        });
        
        console.log('📱 Detecção por orientação do dispositivo ativada');
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
    
    // Configurar botão de limpar peças
    const clearButton = document.getElementById('clearPecas');
    if (clearButton) {
        clearButton.addEventListener('click', clearAllPecas);
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
            
            // Iniciar detecção automática para mobile
            setTimeout(startMobileDetection, 2000);
            setTimeout(addDeviceOrientationDetection, 1000);
            
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

// Função de teste para debug de hover
function createTestPlane() {
    console.log('🧪 Criando plane de teste...');
    
    const testPlane = document.createElement('a-plane');
    testPlane.setAttribute('position', '0 2 -3');
    testPlane.setAttribute('width', '2');
    testPlane.setAttribute('height', '2');
    testPlane.setAttribute('color', '#FF0000'); // Vermelho para ser visível
    testPlane.classList.add('clickable');
    testPlane.id = 'test-plane';
    
    // Teste de hover/raycaster
    testPlane.addEventListener('raycaster-intersection', function() {
        console.log('🎉 TESTE: Raycaster funcionando!');
        testPlane.setAttribute('color', '#00FF00'); // Muda para verde
    });
    
    // Teste de mouseenter como backup
    testPlane.addEventListener('mouseenter', function() {
        console.log('🎉 TESTE: MouseEnter funcionando!');
        testPlane.setAttribute('color', '#0000FF'); // Muda para azul
    });
    
    const container = document.getElementById('interactive-objects');
    if (container) {
        container.appendChild(testPlane);
        console.log('✅ Plane de teste adicionado com classe clickable:', testPlane.classList.contains('clickable'));
    }
}

// Log de inicialização
console.log('🚀 SAE RA - Experiência 360° Inicializada! Gire para explorar o cinturão de objetos!');

// Criar plane de teste para debug
setTimeout(createTestPlane, 2000); // Esperar 2 segundos para a cena carregar

// Tentar carregar HDRI
loadHDRI(); 