document.addEventListener("DOMContentLoaded", function () {
    console.log('🚀 DOM carregado, iniciando aplicação...');
    
    // Inicializar viewportUnitsBuggyfill para corrigir vh/vw em dispositivos móveis
    if (typeof viewportUnitsBuggyfill !== 'undefined') {
        viewportUnitsBuggyfill.init({
            refreshDebounceWait: 250,
            hacks: viewportUnitsBuggyfill.hacks
        });
    }
    
    // Inicializar sistema de áudio simples
    initializeSimpleAudio();
    
    // Configurar evento do botão principal
    setupMainButton();
    
    // Carregar e exibir as fases (mas não mostrar ainda)
    loadFases();
});

// Função para carregar as fases do JSON
async function loadFases() {
    console.log('📂 Iniciando carregamento das fases...');
    
    try {
        console.log('🔍 Buscando arquivo data.json...');
        const response = await fetch('assets/data/data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('📄 Arquivo encontrado, parseando JSON...');
        const data = await response.json();
        console.log('📊 Dados carregados:', data);
        
        const fasesContainer = document.getElementById('fases-container');
        console.log('🎯 Container encontrado:', fasesContainer);
        
        // Limpar container
        fasesContainer.innerHTML = '';
        
        // Carregar fases completadas do localStorage
        const fasesCompletadas = getFasesCompletadas();
        console.log('🏆 Fases completadas:', fasesCompletadas);
        
        // Criar botões para cada fase
        console.log(`🎮 Criando ${data.fases.length} botões de fase...`);
        data.fases.forEach((fase, index) => {
            console.log(`🎯 Criando botão para fase ${fase.id}: ${fase.url}`);
            const faseButton = createFaseButton(fase, fasesCompletadas.includes(fase.id));
            fasesContainer.appendChild(faseButton);
        });
        
        console.log(`✅ ${data.fases.length} fases carregadas com sucesso`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar fases:', error);
        showError(`Erro ao carregar as fases: ${error.message}`);
    }
}

// Função para criar botão de fase
function createFaseButton(fase, isCompleta) {
    const button = document.createElement('a');
    
    // Construir URL completa: URL atual + URL do JSON
    const currentUrl = window.location.href;
    // Remover 'menu' da URL - pegar apenas o diretório pai
    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/menu/')) + '/';
    const fullUrl = baseUrl + fase.url;
    
    button.href = fullUrl;
    button.className = 'fase-button';
    button.setAttribute('data-fase-id', fase.id);
    
    // Criar apenas a imagem
    const icon = document.createElement('img');
    
    // Usar imagem completa se a fase foi completada
    if (isCompleta) {
        icon.src = fase.icon.replace('.png', '-completa.png');
        console.log(`🏆 Usando imagem completa para fase ${fase.id}: ${icon.src}`);
    } else {
        icon.src = fase.icon;
    }
    
    icon.alt = `Fase ${fase.id}`;
    icon.onerror = () => {
        // Fallback se a imagem não carregar
        button.innerHTML = `<span style="color: white; font-size: 18px;">Fase ${fase.id}${isCompleta ? ' ✓' : ''}</span>`;
    };
    
    // Montar botão (apenas imagem)
    button.appendChild(icon);
    
    // Adicionar evento de clique
    button.addEventListener('click', (e) => {
        console.log(`🎯 Navegando para: ${fullUrl}`);
        // Marcar como completa no localStorage
        marcarFaseCompleta(fase.id);
    });
    
    return button;
}

// Função para mostrar erro
function showError(message) {
    const fasesContainer = document.getElementById('fases-container');
    fasesContainer.innerHTML = `
        <div style="color: white; text-align: center; padding: 20px;">
            <h3>❌ Erro</h3>
            <p>${message}</p>
        </div>
    `;
}

// Função para obter fases completadas do localStorage
function getFasesCompletadas() {
    try {
        const fasesCompletadas = localStorage.getItem('fasesCompletadas');
        return fasesCompletadas ? JSON.parse(fasesCompletadas) : [];
    } catch (error) {
        console.error('❌ Erro ao carregar fases completadas:', error);
        return [];
    }
}

// Função para marcar fase como completa
function marcarFaseCompleta(faseId) {
    try {
        const fasesCompletadas = getFasesCompletadas();
        
        // Adicionar fase se não estiver na lista
        if (!fasesCompletadas.includes(faseId)) {
            fasesCompletadas.push(faseId);
            localStorage.setItem('fasesCompletadas', JSON.stringify(fasesCompletadas));
            console.log(`🏆 Fase ${faseId} marcada como completa!`);
        }
    } catch (error) {
        console.error('❌ Erro ao salvar fase completa:', error);
    }
}

// Função para limpar progresso (para debug)
function limparProgresso() {
    localStorage.removeItem('fasesCompletadas');
    console.log('🗑️ Progresso limpo!');
    location.reload();
}

// Sistema simples de áudio
let audioContext = null;
let sounds = {};

// Inicializar sistema de áudio simples
async function initializeSimpleAudio() {
    try {
        // Criar contexto de áudio
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Carregar sons
        await loadSounds();
        
        // Configurar event listeners para sons
        setupAudioListeners();
        
        // Ativar áudio em qualquer interação
        document.addEventListener('click', () => {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        });
        
        document.addEventListener('touchstart', () => {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        });
        
        console.log('🔊 Sistema de áudio inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar áudio:', error);
    }
}

// Carregar sons
async function loadSounds() {
    try {
        // Carregar NA001
        const response1 = await fetch('../1/assets/sounds/NA001.mp3');
        const arrayBuffer1 = await response1.arrayBuffer();
        sounds.NA001 = await audioContext.decodeAudioData(arrayBuffer1);
        
        // Carregar NA002
        const response2 = await fetch('../1/assets/sounds/NA002.mp3');
        const arrayBuffer2 = await response2.arrayBuffer();
        sounds.NA002 = await audioContext.decodeAudioData(arrayBuffer2);
        
        console.log('✅ Sons carregados com sucesso');
    } catch (error) {
        console.error('❌ Erro ao carregar sons:', error);
    }
}

// Tocar som
function playSound(soundId) {
    if (!audioContext || !sounds[soundId]) {
        console.warn(`Som não disponível: ${soundId}`);
        return;
    }
    
    try {
        // Ativar contexto se necessário
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = sounds[soundId];
        gainNode.gain.value = 0.7; // Volume
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start(0);
        console.log(`🔊 Tocando: ${soundId}`);
    } catch (error) {
        console.error(`❌ Erro ao tocar ${soundId}:`, error);
    }
}

// Configurar listeners de áudio
function setupAudioListeners() {
    // main-top toca NA001
    const mainTop = document.getElementById('main-top');
    if (mainTop) {
        mainTop.addEventListener('click', () => {
            playSound('NA001');
        });
    }
    
    // base-top toca NA002
    const baseTop = document.getElementById('enunciado');
    if (baseTop) {
        baseTop.addEventListener('click', () => {
            playSound('NA002');
        });
    }
}

// Função para configurar o botão principal
function setupMainButton() {
    const mainButton = document.getElementById('main-button');
    if (mainButton) {
        mainButton.addEventListener('click', function() {
            console.log('🎯 Botão principal clicado!');
            showMenu();
        });
    }
}

// Função para mostrar o menu
function showMenu() {
    const main = document.getElementById('main');
    const menu = document.getElementById('menu');
    
    if (main && menu) {
        // Fade out da tela principal
        main.style.opacity = '0';
        
        // Após o fade out, mostrar o menu
        setTimeout(() => {
            main.style.visibility = 'hidden';
            menu.classList.add('ativo');
            console.log('✅ Menu ativado!');
        }, 500);
    }
}
