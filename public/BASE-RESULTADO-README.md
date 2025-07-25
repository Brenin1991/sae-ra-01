# Sistema de Base e Resultado - Quebra-Cabeça

Este sistema permite definir uma imagem de base onde as peças são montadas e uma imagem de resultado que aparece quando o quebra-cabeça é completado.

## 🎯 Como Funciona

### **Estrutura no JSON:**
```json
{
    "quebracabeca": [
        {
            "base": "assets/textures/fase1/quebracabeca/fase1-base.png",
            "resultado": "assets/textures/fase1/quebracabeca/fase1-resultado.png"
        },
        {
            "id": "01",
            "peca": "assets/textures/fase1/quebracabeca/fase1-01.png",
            "target": "assets/textures/fase1/quebracabeca/fase1-01-target.png",
            "position": {"x": 120, "y": 0}
        }
        // ... mais peças
    ]
}
```

### **Fluxo de Funcionamento:**

1. **Base**: A imagem de base é carregada como fundo da área de montagem
2. **Montagem**: O usuário arrasta as peças para suas posições corretas
3. **Resultado**: Quando todas as peças estão no lugar, a imagem de resultado aparece por cima
4. **Parabéns**: Após 2 segundos, a tela de parabéns é exibida

## 🎨 Implementação Visual

### **CSS - Base:**
```css
.puzzle-targets {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
```

### **CSS - Resultado:**
```css
.puzzle-resultado {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    z-index: 10;
}

.puzzle-resultado.ativo {
    opacity: 1;
}
```

## 🔧 Funcionalidades

### **Métodos JavaScript:**

- **`setupBase()`**: Configura a imagem de base como fundo
- **`showResult()`**: Exibe a imagem de resultado com animação
- **`clearResult()`**: Remove a imagem de resultado

### **Logs de Debug:**
```
🧩 Base configurada: assets/textures/fase1/quebracabeca/fase1-base.png
🧩 Resultado: assets/textures/fase1/quebracabeca/fase1-resultado.png
🎉 Resultado mostrado: assets/textures/fase1/quebracabeca/fase1-resultado.png
🧹 Resultado limpo
```

## 📱 Responsividade

- **Desktop**: 300x180px
- **Mobile**: 250x150px
- **Imagens**: Ajustadas automaticamente com `background-size: cover`

## 🎮 Casos de Uso

### **1. Quebra-Cabeça Educacional:**
- **Base**: Imagem com contornos vazios
- **Resultado**: Imagem completa colorida

### **2. Quebra-Cabeça de Montagem:**
- **Base**: Plano de fundo neutro
- **Resultado**: Objeto montado final

### **3. Quebra-Cabeça de Descoberta:**
- **Base**: Imagem borrada ou em preto e branco
- **Resultado**: Imagem nítida e colorida

## 🚀 Dicas de Design

### **Imagem de Base:**
- Use contornos sutis para guiar o usuário
- Mantenha cores neutras para não distrair
- Considere usar transparência para sobreposição

### **Imagem de Resultado:**
- Deve ser visualmente impactante
- Use cores vibrantes e detalhes
- Considere efeitos especiais ou animações

### **Transições:**
- A transição do resultado é suave (0.5s)
- O delay para parabéns é de 2 segundos
- Permite tempo para apreciar o resultado

## 📊 Exemplo Prático

```json
{
    "base": "assets/puzzle/base-outline.png",      // Contornos vazios
    "resultado": "assets/puzzle/resultado-colorido.png"  // Imagem completa
}
```

**Resultado:**
1. Usuário vê contornos vazios
2. Monta as peças nas posições corretas
3. Imagem colorida aparece magicamente
4. Tela de parabéns é exibida 