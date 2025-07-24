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

// Aguardar DOM carregar antes de inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SAE RA - DOM Carregado!');
    
    // Tentar inicializar webcam imediatamente
    initWebcam();
    
    // Backup: também tentar quando a cena A-Frame carregar
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('loaded', function() {
            console.log('🎬 Cena A-Frame carregada!');
            // Só inicializar novamente se o vídeo ainda não tem stream
            const video = document.getElementById('webcam');
            if (video && !video.srcObject) {
                console.log('🔄 Tentando inicializar webcam novamente...');
                initWebcam();
            }
        });
    }
});

// Log de inicialização
console.log('🚀 SAE RA - Experiência 360° Inicializada! Gire para explorar o cinturão de objetos!'); 