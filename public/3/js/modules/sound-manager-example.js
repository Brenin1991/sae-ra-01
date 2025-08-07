/**
 * Exemplo de uso do SoundManager
 * Este arquivo demonstra como usar o sistema de áudio
 */

// Exemplo de como tocar sons programaticamente
function exemploUsoSoundManager() {
    // Tocar som de narração
    window.SoundManager.playNarration('NA001');
    
    // Tocar qualquer som
    window.SoundManager.playSound('NA002');
    
    // Controlar volume
    window.SoundManager.setVolume(0.8);
    
    // Mutar/desmutar
    window.SoundManager.toggleMute();
    
    // Verificar sons disponíveis
    const sonsDisponiveis = window.SoundManager.getAvailableSounds();
    console.log('Sons disponíveis:', sonsDisponiveis);
}

// Exemplo de como adicionar som a um botão customizado
function adicionarSomAoBotao(botaoElement, soundId) {
    botaoElement.addEventListener('click', () => {
        window.SoundManager.playSound(soundId);
    });
}

// Exemplo de como tocar som em eventos específicos
function exemplosEventos() {
    // Som ao fotografar peça
    function onPiecePhotographed() {
        window.SoundManager.playSound('NA003');
    }
    
    // Som ao completar quebra-cabeça
    function onPuzzleCompleted() {
        window.SoundManager.playSound('NA004');
    }
    
    // Som ao encontrar peça
    function onPieceFound() {
        window.SoundManager.playSound('NA005');
    }
}

// Exemplo de controle de áudio
function controlesAudio() {
    // Aumentar volume
    window.SoundManager.setVolume(1.0);
    
    // Diminuir volume
    window.SoundManager.setVolume(0.3);
    
    // Mutar
    window.SoundManager.mute();
    
    // Desmutar
    window.SoundManager.unmute();
    
    // Alternar mute
    window.SoundManager.toggleMute();
}

// Exemplo de verificação de disponibilidade
function verificarSons() {
    if (window.SoundManager.hasSound('NA001')) {
        console.log('Som NA001 está disponível');
    } else {
        console.log('Som NA001 não está disponível');
    }
}

// Exportar funções para uso global
window.exemploUsoSoundManager = exemploUsoSoundManager;
window.adicionarSomAoBotao = adicionarSomAoBotao;
window.controlesAudio = controlesAudio;
window.verificarSons = verificarSons;
