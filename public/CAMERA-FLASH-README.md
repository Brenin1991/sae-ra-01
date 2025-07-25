# Sistema de Flash da Câmera

Este sistema implementa um efeito de flash realista quando o usuário clica no botão da câmera, simulando uma foto sendo tirada.

## 🎯 Funcionalidades

### **Efeito Visual:**
- ✅ Flash branco que cobre toda a tela
- ✅ Animação suave de fade in/out
- ✅ Duração de 300ms para realismo

### **Feedback Sensorial:**
- ✅ Som de "click" da câmera
- ✅ Vibração do dispositivo (se suportado)
- ✅ Feedback visual de sucesso/erro

### **Detecção Inteligente:**
- ✅ Verifica se há peças visíveis na foto
- ✅ Conta quantas peças foram capturadas
- ✅ Mostra mensagem personalizada

## 📸 Como Funciona

### **1. Clique no Botão:**
```javascript
// Quando o usuário clica no ícone da câmera
cameraButton.addEventListener('click', function() {
    triggerCameraFlash();
});
```

### **2. Efeito de Flash:**
```css
.camera-flash.active {
    opacity: 1;
    animation: flashEffect 0.3s ease-out;
}
```

### **3. Detecção de Peças:**
```javascript
// Verifica peças visíveis na cena
const visiblePieces = Array.from(activePieces).filter(piece => {
    const rect = piece.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
});
```

## 🎨 CSS Implementado

### **Efeito de Flash:**
```css
.camera-flash {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: white;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.1s ease-out;
}
```

### **Animação do Flash:**
```css
@keyframes flashEffect {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
}
```

### **Feedback Visual:**
```css
@keyframes feedbackFade {
    0% { opacity: 0; transform: scale(0.8); }
    20% { opacity: 1; transform: scale(1.1); }
    80% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.9); }
}
```

## 🔊 Sistema de Áudio

### **Som de Câmera:**
```javascript
function playCameraSound() {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    
    // Frequência que simula "click" da câmera
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}
```

### **Características do Som:**
- **Frequência**: 800Hz → 400Hz (decrescendo)
- **Duração**: 100ms
- **Volume**: 30% → 1% (fade out)

## 📳 Vibração do Dispositivo

### **Implementação:**
```javascript
function vibrateDevice() {
    if (navigator.vibrate) {
        navigator.vibrate(100); // 100ms
    }
}
```

### **Compatibilidade:**
- ✅ Android (Chrome, Firefox)
- ✅ iOS Safari (limitado)
- ✅ Desktop (não suportado)

## 🎯 Detecção de Peças

### **Lógica de Detecção:**
1. **Busca peças ativas**: `.peca-ativa`
2. **Verifica visibilidade**: `getBoundingClientRect()`
3. **Conta peças visíveis**: `width > 0 && height > 0`

### **Feedback Personalizado:**
- **Com peças**: "📸 Foto tirada! X peça(s) capturada(s)"
- **Sem peças**: "📸 Nenhuma peça encontrada na foto"

## 🎮 Interatividade

### **Estados do Botão:**
```css
#ui .camera-icon:hover {
    transform: scale(1.1);
}

#ui .camera-icon:active {
    transform: scale(0.95);
}
```

### **Cursor:**
- **Hover**: Cursor pointer
- **Transição**: Suave (0.2s)

## 📱 Responsividade

### **Posicionamento:**
- **Mobile**: `bottom: 5%; right: 10%`
- **Tablet**: Ajustado automaticamente
- **Desktop**: Mantém proporção

### **Tamanho:**
- **Mobile**: 50px × 50px
- **Tablet**: 55px × 55px
- **Desktop**: 60px × 60px

## 🔧 Configuração

### **HTML Necessário:**
```html
<div id="ui">
    <img id="camera-icon" class="camera-icon" src="assets/textures/camera-icon.png" alt="Camera">
</div>
<div class="camera-flash" id="camera-flash"></div>
```

### **JavaScript Automático:**
```javascript
// Configurado automaticamente quando entra na UI
setupCameraButton();
```

## 🐛 Debug

### **Logs no Console:**
```
📷 Botão da câmera configurado
📸 Botão da câmera clicado!
⚡ Efeito de flash ativado!
🔊 Som de câmera tocado
📳 Dispositivo vibrou
📸 Foto tirada com 3 peça(s) visível(is)!
```

## 🚀 Extensões Possíveis

### **Funcionalidades Futuras:**
- [ ] Salvar foto no dispositivo
- [ ] Compartilhar foto
- [ ] Galeria de fotos tiradas
- [ ] Filtros de câmera
- [ ] Contador de fotos
- [ ] Modo burst (múltiplas fotos)

### **Melhorias de UX:**
- [ ] Som personalizado
- [ ] Efeitos visuais diferentes
- [ ] Feedback haptico avançado
- [ ] Animações mais elaboradas

## 📊 Performance

### **Otimizações:**
- **CSS**: Hardware acceleration com `transform`
- **Áudio**: Contexto reutilizável
- **DOM**: Elementos criados dinamicamente
- **Memória**: Limpeza automática após 2s

### **Compatibilidade:**
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers 