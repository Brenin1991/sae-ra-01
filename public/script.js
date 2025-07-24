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
        const video = document.getElementById('webcam');
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment' // Câmera traseira no celular
            } 
        });
        video.srcObject = stream;
        console.log('📷 Webcam inicializada!');
    } catch (error) {
        console.error('❌ Erro ao acessar webcam:', error);
        // Fallback: fundo escuro se não conseguir acessar a câmera
        document.querySelector('a-scene').setAttribute('background', 'color: #001133');
    }
}

// Inicializar webcam quando a página carregar
initWebcam();

// Log de inicialização
console.log('🚀 SAE RA - Experiência 360° Inicializada! Gire para explorar o cinturão de objetos!'); 