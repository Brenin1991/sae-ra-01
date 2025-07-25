# Sistema de Gerenciamento de Telas

Este sistema permite gerenciar transições entre diferentes telas da aplicação de forma dinâmica e extensível.

## Como Funciona

O sistema usa uma classe `ScreenManager` que:
- Gerencia o estado atual da tela
- Controla transições suaves entre telas
- Permite adicionar/remover telas dinamicamente
- Executa funções específicas ao entrar/sair de cada tela

## Fluxo Atual

1. **Main** → **Tutorial** → **UI**

## Uso Básico

### Acessar o Gerenciador
```javascript
// O gerenciador é automaticamente criado como window.screenManager
const manager = window.screenManager;
```

### Navegar entre Telas
```javascript
// Ir para próxima tela
manager.nextScreen();

// Voltar para tela anterior
manager.previousScreen();

// Ir para tela específica
manager.showScreen('tutorial');
```

### Obter Informações
```javascript
// Tela atual
const current = manager.getCurrentScreen();
console.log(current.name); // 'main', 'tutorial', 'ui'

// Verificar se tela existe
if (manager.hasScreen('game')) {
    console.log('Tela game existe!');
}
```

## Adicionando Novas Telas

### 1. Criar o HTML
```html
<div id="game-screen">
    <h1>Jogo</h1>
    <button id="game-button">Jogar</button>
</div>
```

### 2. Adicionar CSS
```css
#game-screen {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2100;
    width: 100vw;
    height: 100vh;
    display: none;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
}
```

### 3. Registrar no JavaScript
```javascript
manager.addScreen('game', {
    elementId: 'game-screen',
    next: 'results', // próxima tela
    onEnter: () => {
        console.log('Iniciando jogo...');
        // Lógica para iniciar o jogo
    },
    onExit: () => {
        console.log('Finalizando jogo...');
        // Lógica para finalizar o jogo
    }
});
```

## Configuração de Tela

Cada tela pode ter:

- **elementId**: ID do elemento HTML
- **next**: Nome da próxima tela (null para última)
- **onEnter**: Função executada ao entrar na tela
- **onExit**: Função executada ao sair da tela

## Exemplo Completo

```javascript
// Adicionar tela de resultados
manager.addScreen('results', {
    elementId: 'results-screen',
    next: 'main', // volta para o início
    onEnter: () => {
        // Mostrar pontuação
        showScore();
        // Tocar música de vitória
        playVictorySound();
    },
    onExit: () => {
        // Limpar pontuação
        clearScore();
        // Parar música
        stopMusic();
    }
});

// Modificar fluxo: main → tutorial → game → results → main
manager.screens.main.next = 'tutorial';
manager.screens.tutorial.next = 'game';
manager.screens.game.next = 'results';
manager.screens.results.next = 'main';
```

## Integração com AR

O sistema já está integrado com a funcionalidade AR:

- **onUIEnter**: Inicializa webcam e carrega dados do jogo
- **onUIExit**: Limpa peças e finaliza experiência AR

## Dicas

1. **Sempre use `display: none` e `opacity: 0`** no CSS inicial das telas
2. **Adicione `transition: opacity 0.5s ease-in-out`** para transições suaves
3. **Use `onEnter` e `onExit`** para lógica específica de cada tela
4. **Mantenha o fluxo linear** para melhor experiência do usuário
5. **Teste as transições** em diferentes dispositivos

## Debug

O sistema loga todas as transições no console:
- `Entrou na tela X`
- `Saiu da tela X`
- `Nova tela "X" adicionada`

Use o console do navegador para acompanhar o fluxo! 