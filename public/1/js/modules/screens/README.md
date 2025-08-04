# 🖥️ Sistema Modular de Telas

## 📁 Estrutura de Módulos

### `base-screen.js`
- **Responsabilidade**: Classe base para todas as telas
- **Funcionalidades**:
  - Gerenciamento de transições
  - Configuração de eventos padrão
  - Animações de entrada/saída
  - Controle de estado da tela

### `main-screen.js`
- **Responsabilidade**: Tela principal da aplicação
- **Funcionalidades**:
  - Botão de início
  - Reset do estado da aplicação
  - Animações de entrada
  - Integração com outros sistemas

### `tutorial-screen.js`
- **Responsabilidade**: Tela de tutorial
- **Funcionalidades**:
  - Sistema de narração
  - Botão de pular tutorial
  - Animações sequenciais
  - Controle de áudio

### `ui-screen.js`
- **Responsabilidade**: Tela de interface AR
- **Funcionalidades**:
  - Sistema de câmera
  - Controle de fotografia
  - Integração com puzzle
  - Gerenciamento de peças

### `puzzle-screen.js`
- **Responsabilidade**: Tela do quebra-cabeça
- **Funcionalidades**:
  - Inicialização do puzzle
  - Controles de navegação
  - Integração com puzzle manager
  - Animações específicas

### `congratulations-screen.js`
- **Responsabilidade**: Tela de parabéns após completar o puzzle
- **Funcionalidades**:
  - Exibição de pontuação e tempo
  - Sistema de estrelas
  - Compartilhamento de resultados
  - Animações de confete
  - Som de vitória

### `screen-manager.js`
- **Responsabilidade**: Gerenciador principal de telas
- **Funcionalidades**:
  - Registro de telas
  - Controle de transições
  - Navegação entre telas
  - Gerenciamento de estado

## 🔄 Fluxo de Navegação

```
Main → Tutorial → UI → Puzzle → Congratulations
  ↑                    ↓           ↓
  └─── AR ←───────────┘           └─── Main
```

## 🎯 Benefícios da Arquitetura Modular

1. **Separação de Responsabilidades**: Cada tela tem sua própria lógica
2. **Reutilização**: Telas podem ser reutilizadas em diferentes contextos
3. **Manutenibilidade**: Fácil de modificar e debugar
4. **Escalabilidade**: Fácil adicionar novas telas
5. **Testabilidade**: Cada tela pode ser testada isoladamente

## 📋 Como Usar

### 1. Carregar Módulos
```html
<!-- Carregar na ordem correta -->
<script src="js/modules/screens/base-screen.js"></script>
<script src="js/modules/screens/main-screen.js"></script>
<script src="js/modules/screens/tutorial-screen.js"></script>
<script src="js/modules/screens/ui-screen.js"></script>
<script src="js/modules/screens/puzzle-screen.js"></script>
<script src="js/modules/screens/congratulations-screen.js"></script>
<script src="js/modules/screen-manager.js"></script>
```

### 2. Navegar Entre Telas
```javascript
// Mostrar tela específica
window.screenManager.showScreen('main');

// Próxima tela
window.screenManager.nextScreen();

// Tela anterior
window.screenManager.previousScreen();
```

### 3. Adicionar Nova Tela
```javascript
// Criar nova tela
class MinhaTela extends BaseScreen {
    constructor() {
        super('minha-tela', {
            next: 'ui',
            onEnter: () => this.handleEnter(),
            onExit: () => this.handleExit()
        });
    }
    
    handleEnter() {
        // Lógica de entrada
    }
    
    handleExit() {
        // Lógica de saída
    }
}

// Registrar no ScreenManager
window.screenManager.registerScreen('minha-tela', new MinhaTela());
```

## 🔧 Desenvolvimento

### Criar Nova Tela:
1. Estender `BaseScreen`
2. Implementar métodos `handleEnter()` e `handleExit()`
3. Configurar eventos específicos em `onInit()`
4. Registrar no `ScreenManager`

### Adicionar Funcionalidades:
1. Identificar responsabilidade
2. Criar método específico na tela
3. Integrar com outros sistemas se necessário
4. Testar isoladamente

## 📊 Métodos Disponíveis

### BaseScreen
- `show()` - Mostrar tela
- `hide()` - Esconder tela
- `nextScreen()` - Ir para próxima tela
- `previousScreen()` - Voltar para tela anterior
- `isScreenActive()` - Verificar se está ativa

### ScreenManager
- `showScreen(name)` - Mostrar tela específica
- `registerScreen(name, instance)` - Registrar nova tela
- `getCurrentScreen()` - Obter tela atual
- `listScreens()` - Listar todas as telas
- `hasScreen(name)` - Verificar se tela existe

## 🎨 Animações

### Classes CSS Disponíveis:
- `.animate-on-enter` - Animar na entrada
- `.tutorial-step` - Passos do tutorial
- `.ui-element` - Elementos da UI
- `.puzzle-element` - Elementos do puzzle

### Animações Automáticas:
- Fade in/out nas transições
- Animações sequenciais
- Feedback visual
- Transições suaves