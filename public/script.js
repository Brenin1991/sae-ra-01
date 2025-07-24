// Registrar componente de cursor listener
AFRAME.registerComponent('cursor-listener', {
    init: function () {
        const el = this.el;
        let isGlowing = false;
        let originalColor = el.getAttribute('color');
        
        // Salvar cor original
        el.setAttribute('data-original-color', originalColor);
        
        // Eventos de clique/toque
        el.addEventListener('click', function () {
            console.log('Objeto clicado!', el.tagName);
            
            if (!isGlowing) {
                // Ativar brilho rosa
                el.setAttribute('color', '#FF69B4');
                el.setAttribute('material', {
                    color: '#FF69B4',
                    emissive: '#FF1493',
                    emissiveIntensity: 0.5
                });
                
                // Animação de pulsação
                el.setAttribute('animation__glow', {
                    property: 'material.emissiveIntensity',
                    to: 0.8,
                    dur: 1000,
                    loop: true,
                    dir: 'alternate'
                });
                
                // Aumentar tamanho
                el.setAttribute('animation__scale', {
                    property: 'scale',
                    to: '1.2 1.2 1.2',
                    dur: 300
                });
                
                isGlowing = true;
                console.log('✨ BRILHANDO!');
                
            } else {
                // Voltar ao normal
                el.setAttribute('color', originalColor);
                el.setAttribute('material', {
                    color: originalColor,
                    emissive: '#000000',
                    emissiveIntensity: 0
                });
                
                // Remover animações
                el.removeAttribute('animation__glow');
                
                // Voltar tamanho normal
                el.setAttribute('animation__scale', {
                    property: 'scale',
                    to: '1 1 1',
                    dur: 300
                });
                
                isGlowing = false;
                console.log('🔄 Voltou ao normal');
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
                sky.setAttribute('src', `assets/sky.${format}`);
            }
        };
        
        img.onerror = function() {
            console.log(`❌ sky.${format} não encontrado, tentando próximo formato...`);
            formatIndex++;
            tryNextFormat();
        };
        
        img.src = `assets/sky.${format}`;
    }
    
    tryNextFormat();
}

// Log de inicialização
console.log('🚀 SAE RA - Experiência 360° Inicializada! Gire para explorar o cinturão de objetos!');

// Tentar carregar HDRI
loadHDRI(); 