/**
 * Selfie Screen - Tela de Selfie
 * Tela para tirar selfie após completar o puzzle
 */

class SelfieScreen extends BaseScreen {
    constructor() {
        super('selfie-screen', {
            next: 'congratulations',
            onEnter: () => this.handleEnter(),
            onExit: () => this.handleExit()
        });
        
        this.selfieStream = null;
        this.selfieImage = null;
        this.isPhotoTaken = false;
    }
    
    onInit() {
        // Configurações específicas da tela de selfie
        this.setupSelfieElements();
        this.setupSelfieControls();
        this.setupCameraIcon();
        
        // Detectar se é mobile
        this.isMobile = this.detectMobile();
        console.log('📱 Dispositivo móvel:', this.isMobile);
    }
    
    setupSelfieElements() {
        // Configurar elementos da tela de selfie
        this.selfieCamera = this.element.querySelector('#selfie-camera');
        this.selfieCanvas = this.element.querySelector('#selfie-canvas');
        this.selfieImage = this.element.querySelector('#selfie-image');
        this.selfiePreview = this.element.querySelector('#selfie-preview');
    }
    
    setupSelfieControls() {
        // Configurar controles da tela de selfie
        this.setupTakeSelfieButton();
        this.setupRetakeSelfieButton();
        this.setupSaveSelfieButton();
        this.setupBackButton();
    }
    
    setupCameraIcon() {
        // Configurar ícone da câmera para captura da tela
        const cameraIcon = this.element.querySelector('#camera-icon-selfie');
        if (cameraIcon) {
            cameraIcon.addEventListener('click', () => {
                this.captureSelfieScreen();
            });
            console.log('📷 Ícone da câmera configurado para captura');
        }
    }
    
    setupTakeSelfieButton() {
        const takeSelfieButton = this.element.querySelector('#btn-take-selfie');
        if (takeSelfieButton) {
            takeSelfieButton.addEventListener('click', () => {
                this.takeSelfie();
            });
        }
    }
    
    setupRetakeSelfieButton() {
        const retakeSelfieButton = this.element.querySelector('#btn-retake-selfie');
        if (retakeSelfieButton) {
            retakeSelfieButton.addEventListener('click', () => {
                this.retakeSelfie();
            });
        }
    }
    
    setupSaveSelfieButton() {
        const saveSelfieButton = this.element.querySelector('#btn-save-selfie');
        if (saveSelfieButton) {
            saveSelfieButton.addEventListener('click', () => {
                this.saveSelfie();
            });
        }
    }
    
    setupBackButton() {
        const backButton = this.element.querySelector('#btn-back-to-congratulations');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.backToCongratulations();
            });
        }
    }
    
    handleEnter() {
        // Lógica específica ao entrar na tela de selfie
        console.log('📸 Entrou na tela de selfie');
        
        // Inicializar câmera
        this.initializeSelfieCamera();
        
        // Configurar animações de entrada
        this.setupSelfieAnimations();
    }
    
    handleExit() {
        // Lógica específica ao sair da tela de selfie
        console.log('👋 Saiu da tela de selfie');
        
        // Parar câmera
        this.stopSelfieCamera();
        
        // Limpar animações
        this.cleanupAnimations();
    }
    
    async initializeSelfieCamera() {
        try {
            console.log('📷 Inicializando câmera de selfie...');
            
            // Configurações específicas para mobile
            const constraints = {
                video: {
                    facingMode: 'user', // Câmera frontal
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    aspectRatio: { ideal: 16/9 }
                },
                audio: false
            };
            
            // Tentar câmera frontal primeiro
            try {
                this.selfieStream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('✅ Câmera frontal inicializada');
            } catch (frontError) {
                console.log('⚠️ Câmera frontal falhou, tentando traseira...');
                
                // Se falhar, tentar câmera traseira
                const backConstraints = {
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 1280, max: 1920 },
                        height: { ideal: 720, max: 1080 },
                        aspectRatio: { ideal: 16/9 }
                    },
                    audio: false
                };
                
                this.selfieStream = await navigator.mediaDevices.getUserMedia(backConstraints);
                console.log('✅ Câmera traseira inicializada como fallback');
            }
            
            // Conectar stream ao vídeo
            if (this.selfieCamera) {
                this.selfieCamera.srcObject = this.selfieStream;
                
                // Configurar para mobile
                this.selfieCamera.style.objectFit = 'cover';
                this.selfieCamera.style.width = '100%';
                this.selfieCamera.style.height = '100%';
                
                // Aguardar vídeo carregar
                await new Promise((resolve) => {
                    this.selfieCamera.onloadedmetadata = () => {
                        console.log('✅ Vídeo carregado:', this.selfieCamera.videoWidth, 'x', this.selfieCamera.videoHeight);
                        resolve();
                    };
                });
                
                console.log('✅ Câmera de selfie inicializada com sucesso');
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar câmera de selfie:', error);
            this.showCameraError();
        }
    }
    
    stopSelfieCamera() {
        if (this.selfieStream) {
            this.selfieStream.getTracks().forEach(track => track.stop());
            this.selfieStream = null;
            console.log('📷 Câmera de selfie parada');
        }
    }
    
    takeSelfie() {
        if (!this.selfieCamera || !this.selfieCanvas) {
            console.error('❌ Elementos de câmera não encontrados');
            return;
        }
        
        try {
            console.log('📸 Tirando selfie...');
            
            // Configurar canvas com tamanho otimizado para mobile
            const context = this.selfieCanvas.getContext('2d');
            
            // Usar dimensões da tela para melhor qualidade no mobile
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            this.selfieCanvas.width = screenWidth;
            this.selfieCanvas.height = screenHeight;
            
            // Calcular proporções para manter aspect ratio
            const videoAspect = this.selfieCamera.videoWidth / this.selfieCamera.videoHeight;
            const canvasAspect = screenWidth / screenHeight;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (videoAspect > canvasAspect) {
                // Vídeo mais largo que canvas
                drawHeight = screenHeight;
                drawWidth = screenHeight * videoAspect;
                offsetX = (screenWidth - drawWidth) / 2;
                offsetY = 0;
            } else {
                // Vídeo mais alto que canvas
                drawWidth = screenWidth;
                drawHeight = screenWidth / videoAspect;
                offsetX = 0;
                offsetY = (screenHeight - drawHeight) / 2;
            }
            
            // Desenhar vídeo no canvas (espelhado para selfie)
            context.scale(-1, 1);
            context.translate(-screenWidth, 0);
            context.drawImage(this.selfieCamera, offsetX, offsetY, drawWidth, drawHeight);
            
            // Converter para imagem com alta qualidade
            const imageData = this.selfieCanvas.toDataURL('image/jpeg', 0.9);
            
            // Mostrar preview
            this.showSelfiePreview(imageData);
            
            // Atualizar botões
            this.updateSelfieButtons(true);
            
            this.isPhotoTaken = true;
            console.log('✅ Selfie tirada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao tirar selfie:', error);
        }
    }
    
    showSelfiePreview(imageData) {
        if (this.selfieImage && this.selfiePreview) {
            this.selfieImage.src = imageData;
            this.selfiePreview.style.display = 'flex';
            
            // Esconder preview após 3 segundos
            setTimeout(() => {
                this.selfiePreview.style.display = 'none';
            }, 3000);
        }
    }
    
    retakeSelfie() {
        console.log('🔄 Tirando selfie novamente');
        
        // Esconder preview
        if (this.selfiePreview) {
            this.selfiePreview.style.display = 'none';
        }
        
        // Atualizar botões
        this.updateSelfieButtons(false);
        
        this.isPhotoTaken = false;
    }
    
    saveSelfie() {
        if (!this.isPhotoTaken) {
            console.warn('⚠️ Nenhuma selfie tirada');
            return;
        }
        
        try {
            console.log('💾 Salvando selfie...');
            
            // Criar link para download
            const link = document.createElement('a');
            link.download = `selfie-${Date.now()}.jpg`;
            link.href = this.selfieImage.src;
            link.click();
            
            console.log('✅ Selfie salva com sucesso');
            
            // Mostrar feedback
            this.showSaveFeedback();
            
        } catch (error) {
            console.error('❌ Erro ao salvar selfie:', error);
        }
    }
    
    showSaveFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 18000;
            background: rgba(0, 255, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        `;
        
        feedback.textContent = '💾 Selfie salva!';
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }
    
    showCameraError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 18000;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        `;
        
        errorDiv.textContent = '❌ Erro ao acessar câmera';
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    async captureSelfieScreen() {
        try {
            console.log('📸 Capturando tela de selfie...');
            
            // Mostrar feedback de captura
            this.showCaptureFeedback();
            
            // Aguardar um pouco para o feedback aparecer
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Verificar se html2canvas está disponível
            if (typeof html2canvas === 'undefined') {
                console.error('❌ html2canvas não está disponível');
                this.showErrorFeedback('Biblioteca html2canvas não carregada');
                return;
            }
            
            // Configurações otimizadas para mobile
            const options = {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#000000',
                scale: window.devicePixelRatio || 2, // Usar pixel ratio do dispositivo
                logging: false,
                width: window.innerWidth,
                height: window.innerHeight,
                scrollX: 0,
                scrollY: 0,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                // Configurações específicas para mobile
                foreignObjectRendering: false, // Melhor compatibilidade mobile
                removeContainer: true,
                ignoreElements: (element) => {
                    // Ignorar elementos que podem causar problemas
                    return element.classList.contains('capture-ignore');
                }
            };
            
            // Capturar a tela de selfie
            const canvas = await html2canvas(this.element, options);
            
            // Converter para imagem com qualidade otimizada
            const imageData = canvas.toDataURL('image/jpeg', 0.9);
            
            // Salvar a imagem
            this.saveCapturedImage(imageData);
            
            console.log('✅ Tela de selfie capturada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao capturar tela de selfie:', error);
            this.showErrorFeedback('Erro ao capturar imagem');
        }
    }
    
    saveCapturedImage(imageData) {
        try {
            // Criar link para download
            const link = document.createElement('a');
            link.download = `selfie-certificado-${Date.now()}.jpg`;
            link.href = imageData;
            link.click();
            
            console.log('💾 Imagem capturada salva com sucesso');
            
            // Mostrar feedback de sucesso
            this.showSaveSuccessFeedback();
            
        } catch (error) {
            console.error('❌ Erro ao salvar imagem capturada:', error);
            this.showErrorFeedback('Erro ao salvar imagem');
        }
    }
    
    showCaptureFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 18000;
            background: rgba(0, 150, 255, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        `;
        
        feedback.textContent = '📸 Capturando...';
        feedback.id = 'capture-feedback';
        document.body.appendChild(feedback);
        
        // Remover após 2 segundos
        setTimeout(() => {
            const element = document.getElementById('capture-feedback');
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 2000);
    }
    
    showSaveSuccessFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 18000;
            background: rgba(0, 255, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        `;
        
        feedback.textContent = '💾 Certificado salvo!';
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }
    
    showErrorFeedback(message) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 18000;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        `;
        
        feedback.textContent = `❌ ${message}`;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 3000);
    }
    
    updateSelfieButtons(photoTaken) {
        const takeButton = this.element.querySelector('#btn-take-selfie');
        const retakeButton = this.element.querySelector('#btn-retake-selfie');
        const saveButton = this.element.querySelector('#btn-save-selfie');
        
        if (photoTaken) {
            if (takeButton) takeButton.style.display = 'none';
            if (retakeButton) retakeButton.style.display = 'inline-block';
            if (saveButton) saveButton.style.display = 'inline-block';
        } else {
            if (takeButton) takeButton.style.display = 'inline-block';
            if (retakeButton) retakeButton.style.display = 'none';
            if (saveButton) saveButton.style.display = 'none';
        }
    }
    
    backToCongratulations() {
        console.log('⬅️ Voltando para tela de parabéns');
        
        if (window.screenManager) {
            window.screenManager.showScreen('congratulations');
        }
    }
    
    setupSelfieAnimations() {
        // Configurar animações de entrada da tela de selfie
        const selfieElements = this.element.querySelectorAll('.selfie-button');
        selfieElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = this.isMobile ? 'translateY(30px)' : 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * (this.isMobile ? 150 : 200));
        });
        
        // Animar ícone da câmera se for mobile
        if (this.isMobile) {
            const cameraIcon = this.element.querySelector('#camera-icon-selfie');
            if (cameraIcon) {
                cameraIcon.style.opacity = '0';
                cameraIcon.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    cameraIcon.style.transition = 'all 0.5s ease';
                    cameraIcon.style.opacity = '1';
                    cameraIcon.style.transform = 'scale(1)';
                }, 500);
            }
        }
    }
    
    cleanupAnimations() {
        // Limpar animações da tela de selfie
        const selfieElements = this.element.querySelectorAll('.selfie-button');
        selfieElements.forEach(element => {
            element.style.opacity = '';
            element.style.transform = '';
            element.style.transition = '';
        });
    }
    
    // Detectar se é dispositivo móvel
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }
    
    // Método de teste para verificar se a captura funciona
    testCapture() {
        console.log('🧪 Testando captura de tela...');
        this.captureSelfieScreen();
    }
}

// Exportar para uso global
window.SelfieScreen = SelfieScreen;