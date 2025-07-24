# 🎮 Sistema SAE RA - Nova Arquitetura

## 📁 Estrutura de Arquivos Necessária

```
public/
├── assets/
│   ├── data/
│   │   └── data.json (✅ Já existe)
│   ├── models/
│   │   └── fase1.glb (📥 Precisa ser criado)
│   └── textures/
│       └── fase1/
│           ├── 01.png (📥 Texturas dos objetos)
│           ├── 02.png
│           ├── 03.png
│           ├── peca01.png (📥 Texturas das peças)
│           ├── peca02.png
│           └── peca03.png
```

## 🔧 Como Funciona

### 1. **Carregamento do Modelo**
- O sistema carrega o arquivo GLB definido no JSON
- Lista todos os objetos no modelo (console debug)
- Torna transparentes os objetos com IDs correspondentes

### 2. **Criação dos Planes**
- Para cada objeto no JSON, cria um plane com a textura `imagem`
- O plane sempre olha para a câmera (comportamento billboard)
- Posicionado na localização do objeto original (ou fallback em círculo)

### 3. **Interação**
- **Clique simples:** Ativa brilho rosa + cria nova `peca` permanente EM CIMA do objeto clicado
- **Efeito dramático:** Peça aparece com animação popup (pequeno → grande → normal)
- **Múltiplos cliques:** Criam múltiplas peças que se acumulam na cena
- **Posicionamento:** Peça fica 0.8 unidades acima e 0.3 na frente do objeto
- **Botão "Limpar Peças":** Remove todas as peças da cena

## 🎯 Sistema de IDs

O sistema procura objetos no modelo GLB pelos seguintes critérios:
- Nome exato igual ao ID (`child.name === objectId`)
- Nome contendo o ID (`child.name.includes(objectId)`)

**Exemplo:**
```json
{
    "id": "01",
    "imagem": "assets/textures/fase1/01.png",
    "peca": "assets/textures/fase1/peca01.png"
}
```

Vai procurar objetos com nome: `"01"`, `"objeto01"`, `"peca_01"`, etc.

## 🐛 Debug e Teste

### **Console Logs**
- `🏗️ Carregando modelo:` - Início do carregamento
- `📦 Objeto: "nome"` - Lista todos os objetos encontrados
- `👻 Tornando transparente:` - Objetos que foram escondidos
- `📍 Posição encontrada:` - Posições reais dos objetos
- `✅ Plane criado para objeto` - Planes criados com sucesso

### **Teste Sem Modelo GLB**
Se não tiver o arquivo `fase1.glb`, o sistema:
1. Mostra erro de carregamento
2. Usa posições de fallback em círculo
3. Cria os planes mesmo assim para teste

## 🚀 Para Implementar

### **1. Criar Modelo GLB**
- Exporte seu modelo 3D como `.glb`
- Nomeie os objetos interativos como: `01`, `02`, `03`
- Coloque em `public/assets/models/fase1.glb`

### **2. Criar Texturas**
- Crie imagens PNG para cada objeto
- Crie imagens PNG para cada peça detalhada
- Organize na estrutura de pastas

### **3. Testar**
```bash
node server.js
```

## 🎨 Componentes A-Frame Criados

### **`billboard`**
- Faz o elemento sempre olhar para a câmera
- Atualizado a cada frame

### **`interactive-object`**
- Gerencia cliques e interações
- Parâmetros: `objectId`, `imageSrc`, `pecaSrc`
- Controla animações de brilho

## 🔄 Funcionalidades Mantidas

✅ **Modo AR/HDRI** - Botão de alternância ainda funciona  
✅ **Webcam** - Funciona normalmente no modo AR  
✅ **Responsivo** - Interface adaptável  
✅ **Fallbacks** - Sistema robusto com alternativas  

## 📝 Próximos Passos

1. **Adicionar modelo GLB** real
2. **Criar texturas** das imagens e peças
3. **Ajustar posições** se necessário
4. **Adicionar mais fases** no JSON
5. **Implementar navegação** entre fases

---

**Status:** ✅ Sistema implementado e pronto para receber conteúdo! 