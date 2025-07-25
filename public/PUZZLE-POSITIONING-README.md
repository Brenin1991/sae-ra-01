# Customização de Posições do Quebra-Cabeça

Este sistema permite customizar as posições exatas de cada peça no quebra-cabeça, criando formatos específicos e layouts personalizados.

## 🎯 Como Funciona

### **Estrutura de Posicionamento:**
```json
{
    "id": "01",
    "peca": "assets/textures/fase1/quebracabeca/fase1-01.png",
    "target": "assets/textures/fase1/quebracabeca/fase1-01-target.png",
    "position": {
        "x": 0,      // Posição horizontal em pixels
        "y": 0,      // Posição vertical em pixels
        "gridX": 0,  // Posição na grade X (opcional)
        "gridY": 0   // Posição na grade Y (opcional)
    }
}
```

### **Sistema de Coordenadas:**
- **Origem**: Canto superior esquerdo (0, 0)
- **X**: Distância da esquerda em pixels
- **Y**: Distância do topo em pixels
- **Tamanho padrão**: 120x120px por peça

## 📐 Exemplos de Layouts

### **1. Layout Irregular (Formato de Objeto):**
```json
[
    {
        "id": "01", 
        "position": {"x": 120, "y": 0, "description": "Topo central"}
    },
    {
        "id": "02", 
        "position": {"x": 0, "y": 60, "description": "Lateral esquerda"}
    },
    {
        "id": "03", 
        "position": {"x": 240, "y": 60, "description": "Lateral direita"}
    },
    {
        "id": "04", 
        "position": {"x": 60, "y": 120, "description": "Base esquerda"}
    },
    {
        "id": "05", 
        "position": {"x": 180, "y": 120, "description": "Base direita"}
    }
]
```

### **2. Layout 3x2 (Retangular):**
```json
[
    {
        "id": "01", "position": {"x": 0, "y": 0}
    },
    {
        "id": "02", "position": {"x": 120, "y": 0}
    },
    {
        "id": "03", "position": {"x": 240, "y": 0}
    },
    {
        "id": "04", "position": {"x": 0, "y": 120}
    },
    {
        "id": "05", "position": {"x": 120, "y": 120}
    },
    {
        "id": "06", "position": {"x": 240, "y": 120}
    }
]
```

### **2. Layout 2x3 (Vertical):**
```json
[
    {
        "id": "01", "position": {"x": 0, "y": 0}
    },
    {
        "id": "02", "position": {"x": 120, "y": 0}
    },
    {
        "id": "03", "position": {"x": 0, "y": 120}
    },
    {
        "id": "04", "position": {"x": 120, "y": 120}
    },
    {
        "id": "05", "position": {"x": 0, "y": 240}
    },
    {
        "id": "06", "position": {"x": 120, "y": 240}
    }
]
```

### **3. Layout em L:**
```json
[
    {
        "id": "01", "position": {"x": 0, "y": 0}
    },
    {
        "id": "02", "position": {"x": 120, "y": 0}
    },
    {
        "id": "03", "position": {"x": 240, "y": 0}
    },
    {
        "id": "04", "position": {"x": 0, "y": 120}
    },
    {
        "id": "05", "position": {"x": 0, "y": 240}
    }
]
```

### **4. Layout em T:**
```json
[
    {
        "id": "01", "position": {"x": 120, "y": 0}
    },
    {
        "id": "02", "position": {"x": 0, "y": 120}
    },
    {
        "id": "03", "position": {"x": 120, "y": 120}
    },
    {
        "id": "04", "position": {"x": 240, "y": 120}
    },
    {
        "id": "05", "position": {"x": 120, "y": 240}
    }
]
```

## 🎨 Customização Visual

### **Container do Quebra-Cabeça:**
```css
.puzzle-targets {
    position: relative;
    width: 360px;    /* Ajustar conforme necessário */
    height: 240px;   /* Ajustar conforme necessário */
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 2px dashed rgba(255, 255, 255, 0.3);
}
```

### **Posicionamento das Peças:**
```css
.puzzle-target {
    position: absolute;
    width: 120px;
    height: 120px;
    /* left e top são definidos dinamicamente via JavaScript */
}
```

## 📱 Responsividade

### **Mobile (≤768px):**
```css
.puzzle-targets {
    width: 300px;
    height: 200px;
}

.puzzle-target {
    width: 100px;
    height: 100px;
}

/* Posições específicas para mobile */
.puzzle-target[data-target-id="01"] { 
    left: 0px !important; 
    top: 0px !important; 
}
```

### **Ajuste Automático:**
- **Desktop**: 120px por peça
- **Mobile**: 100px por peça
- **Posições**: Ajustadas proporcionalmente

## 🔧 Implementação Técnica

### **JavaScript - Aplicação de Posições:**
```javascript
// Em createTargets()
if (pieceData.position) {
    target.style.left = `${pieceData.position.x}px`;
    target.style.top = `${pieceData.position.y}px`;
}
```

### **Logs de Debug:**
```
🧩 Target 01 posicionado em (0, 0)
🧩 Target 02 posicionado em (120, 0)
🧩 Target 03 posicionado em (240, 0)
🧩 Target 04 posicionado em (0, 120)
🧩 Target 05 posicionado em (120, 120)
```

## 🎯 Casos de Uso

### **1. Quebra-Cabeça de Formato Irregular:**
- Layout que forma um objeto específico (letra, símbolo, figura)
- Peças se encaixam em posições não-lineares
- Mais desafiador e visualmente interessante
- Exemplo: Formato de "A", coração, estrela, etc.

### **2. Quebra-Cabeça Tradicional:**
- Layout retangular 3x2 ou 2x3
- Peças se encaixam lado a lado
- Formato familiar aos usuários

### **3. Quebra-Cabeça Temático:**
- Layout em forma de objeto (L, T, cruz)
- Peças formam uma figura específica
- Mais desafiador e interessante

### **4. Quebra-Cabeça Educacional:**
- Layout que forma letras ou números
- Peças que se encaixam em palavras
- Aprendizado através da montagem

## 🚀 Dicas de Design

### **Espaçamento:**
- **Entre peças**: 0px (encostadas) ou 5-10px (separadas)
- **Margem do container**: 20px mínimo
- **Bordas**: 3px dashed para visibilidade

### **Tamanhos:**
- **Peça padrão**: 120x120px
- **Container**: Múltiplo do tamanho da peça
- **Mobile**: Proporcional (100x100px)

### **Cores e Estilos:**
- **Target vazio**: Borda tracejada branca
- **Target highlight**: Verde quando peça correta
- **Target correto**: Verde sólido com animação

## 🎨 Como Criar Formatos Irregulares

### **Passo a Passo:**

1. **Defina o Objeto Final:**
   - Desenhe ou imagine o formato final
   - Divida em peças lógicas
   - Identifique as posições de cada peça

2. **Calcule as Coordenadas:**
   - Use um editor de imagem ou papel quadriculado
   - Marque as posições (x, y) de cada peça
   - Considere o tamanho da peça (120x120px)

3. **Teste o Layout:**
   - Implemente no JSON
   - Teste no navegador
   - Ajuste as posições conforme necessário

### **Exemplo Prático - Formato "A":**
```
    [1]
   [2][3]
  [4] [5]
```

**Coordenadas:**
- Peça 1: (120, 0) - Topo
- Peça 2: (0, 60) - Lateral esquerda  
- Peça 3: (240, 60) - Lateral direita
- Peça 4: (60, 120) - Base esquerda
- Peça 5: (180, 120) - Base direita

## 📊 Ferramentas de Ajuda
```javascript
// Função para calcular posições automaticamente
function calculatePositions(rows, cols, pieceSize = 120) {
    const positions = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            positions.push({
                x: col * pieceSize,
                y: row * pieceSize
            });
        }
    }
    return positions;
}

// Exemplo: 3x2 grid
const positions = calculatePositions(2, 3);
console.log(positions);
// Resultado: [{x:0,y:0}, {x:120,y:0}, {x:240,y:0}, {x:0,y:120}, {x:120,y:120}, {x:240,y:120}]
```

### **Validador de Layout:**
```javascript
function validateLayout(puzzleData) {
    const positions = puzzleData.map(p => p.position);
    const uniquePositions = new Set(positions.map(p => `${p.x},${p.y}`));
    
    if (uniquePositions.size !== positions.length) {
        console.warn('⚠️ Posições duplicadas encontradas!');
        return false;
    }
    
    console.log('✅ Layout válido');
    return true;
}
```

## 🎮 Exemplos Práticos

### **Layout de Coração:**
```json
[
    {"id": "01", "position": {"x": 60, "y": 0}},
    {"id": "02", "position": {"x": 180, "y": 0}},
    {"id": "03", "position": {"x": 0, "y": 60}},
    {"id": "04", "position": {"x": 60, "y": 60}},
    {"id": "05", "position": {"x": 120, "y": 60}},
    {"id": "06", "position": {"x": 180, "y": 60}},
    {"id": "07", "position": {"x": 240, "y": 60}},
    {"id": "08", "position": {"x": 60, "y": 120}},
    {"id": "09", "position": {"x": 120, "y": 120}},
    {"id": "10", "position": {"x": 180, "y": 120}}
]
```

### **Layout de Estrela:**
```json
[
    {"id": "01", "position": {"x": 120, "y": 0}},
    {"id": "02", "position": {"x": 0, "y": 60}},
    {"id": "03", "position": {"x": 240, "y": 60}},
    {"id": "04", "position": {"x": 60, "y": 120}},
    {"id": "05", "position": {"x": 180, "y": 120}},
    {"id": "06", "position": {"x": 120, "y": 180}}
]
```

## 🔧 Configuração Avançada

### **Múltiplos Tamanhos:**
```json
{
    "id": "01",
    "position": {"x": 0, "y": 0},
    "size": {"width": 120, "height": 120}
}
```

### **Rotação:**
```json
{
    "id": "01",
    "position": {"x": 0, "y": 0},
    "rotation": 45
}
```

### **Animações Personalizadas:**
```css
.puzzle-target.custom-animation {
    animation: customPlacement 0.8s ease-out;
}

@keyframes customPlacement {
    0% { transform: scale(0) rotate(180deg); }
    50% { transform: scale(1.2) rotate(90deg); }
    100% { transform: scale(1) rotate(0deg); }
}
```

## 📈 Próximos Passos

### **Funcionalidades Futuras:**
- [ ] Editor visual de posições
- [ ] Templates de layouts pré-definidos
- [ ] Sistema de grade automática
- [ ] Validação visual de sobreposição
- [ ] Exportação/importação de layouts

### **Melhorias Técnicas:**
- [ ] Sistema de coordenadas relativas
- [ ] Ajuste automático de container
- [ ] Detecção de formato ótimo
- [ ] Otimização de performance
- [ ] Suporte a peças irregulares 