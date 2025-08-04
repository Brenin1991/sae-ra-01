/**
 * Congratulations Menu - Menu Dinâmico de Parabéns
 * Controla a sequência de elementos na tela de parabéns
 */

class CongratulationsMenu {
    constructor() {
        this.currentStep = 0;
        this.gameUrl = 'https://example.com/game'; // URL do jogo - altere conforme necessário
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Botão next do menu de parabéns
        const btnNext = document.getElementById('btn-next');
        if (btnNext) {
            btnNext.addEventListener('click', () => this.nextStep());
            console.log('✅ Evento do btn-next configurado');
        } else {
            console.error('❌ Botão btn-next não encontrado');
        }
        
        // Botão jogar novamente
        const btnJogar = document.getElementById('btn-jogar');
        if (btnJogar) {
            btnJogar.addEventListener('click', () => this.jogarNovamente());
            console.log('✅ Evento do btn-jogar configurado');
        } else {
            console.error('❌ Botão btn-jogar não encontrado');
        }
    }
    
    // Inicializar menu
    init() {
        console.log('🎯 Inicializando menu de parabéns');
        this.currentStep = 0;
        this.showStep(0);
        
        // Verificar se prêmio já foi reclamado
        this.checkPremioStatus();
        
        // Debug: verificar elementos
        this.checkElements();
    }
    
    // Aplicar estado do prêmio (chamado quando tela é mostrada)
    applyPremioState() {
        console.log('🎁 Aplicando estado do prêmio');
        this.checkPremioStatus();
    }
    
    // Mostrar passo específico
    showStep(step) {
        console.log(`🎯 Mostrando passo ${step}`);
        
        const texto01 = document.getElementById('parabens-texto-01');
        const texto02 = document.getElementById('parabens-texto-02');
        const premioEmptyContainer = document.getElementById('premio-empty-container');
        const premio01 = document.getElementById('premio-01');
        const btnNext = document.getElementById('btn-next');
        const btnCertificado = document.getElementById('btn-certificado');
        
        if (step === 0) {
            // Passo 0: Texto 01, prêmio 01 sempre visível, botão next visível
            if (texto01) texto01.style.display = 'block';
            if (texto02) texto02.style.display = 'none';
            if (premioEmptyContainer) premioEmptyContainer.style.display = 'none';
            if (premio01) premio01.style.display = 'block'; // SEMPRE VISÍVEL
            if (btnNext) btnNext.style.display = 'block';
            if (btnCertificado) btnCertificado.style.display = 'none'; // Escondido até prêmio ser liberado
            
            console.log('✅ Passo 0: Texto 01 visível, prêmio 01 sempre visível');
        } else if (step === 1) {
            // Passo 1: Texto 02, prêmio 01 sempre visível, container vazio visível (com empty + btn-jogar), botão next escondido
            if (texto01) texto01.style.display = 'none';
            if (texto02) texto02.style.display = 'block';
            if (premioEmptyContainer) premioEmptyContainer.style.display = 'flex';
            if (premio01) premio01.style.display = 'block'; // SEMPRE VISÍVEL
            if (btnNext) btnNext.style.display = 'none';
            if (btnCertificado) btnCertificado.style.display = 'none'; // Escondido até prêmio ser liberado
            
            console.log('✅ Passo 1: Texto 02 visível, prêmio 01 sempre visível, container vazio visível (empty + btn-jogar)');
        }
    }
    
    // Próximo passo
    nextStep() {
        console.log(`🎯 Próximo passo: ${this.currentStep} -> ${this.currentStep + 1}`);
        this.currentStep++;
        this.showStep(this.currentStep);
    }
    
    // Resetar menu
    reset() {
        console.log('🔄 Resetando menu de parabéns');
        this.currentStep = 0;
        this.showStep(0);
    }
    
    // Verificar se elementos existem
    checkElements() {
        const elements = {
            texto01: document.getElementById('parabens-texto-01'),
            texto02: document.getElementById('parabens-texto-02'),
            premioEmptyContainer: document.getElementById('premio-empty-container'),
            premio01: document.getElementById('premio-01'),
            btnNext: document.getElementById('btn-next'),
            btnJogar: document.getElementById('btn-jogar'),
            btnCertificado: document.getElementById('btn-certificado')
        };
        
        console.log('🔍 Verificando elementos:');
        Object.entries(elements).forEach(([name, element]) => {
            console.log(`${name}: ${element ? '✅' : '❌'}`);
            if (element) {
                console.log(`  - Display: ${element.style.display}`);
                console.log(`  - Visible: ${element.offsetParent !== null}`);
            }
        });
        
        return elements;
    }
    
    // Jogar novamente
    jogarNovamente() {
        console.log('🎮 Jogar novamente clicado');
        
        // Esconder o botão
        const btnJogar = document.getElementById('btn-jogar');
        if (btnJogar) {
            btnJogar.style.display = 'none';
            console.log('✅ Botão escondido');
        } else {
            console.error('❌ Botão btn-jogar não encontrado');
        }
        
        // Trocar imagem do empty para premio-01
        const premioEmpty = document.getElementById('premio-empty');
        if (premioEmpty) {
            premioEmpty.src = 'assets/textures/premio-01.png';
            console.log('✅ Imagem trocada para premio-01');
        } else {
            console.error('❌ Elemento premio-empty não encontrado');
        }
        
        // Mostrar certificado quando prêmio é liberado
        const btnCertificado = document.getElementById('btn-certificado');
        if (btnCertificado) {
            btnCertificado.style.display = 'block';
            console.log('✅ Certificado visível (prêmio liberado)');
        } else {
            console.error('❌ Botão certificado não encontrado');
        }
        
        // Testar localStorage
        try {
            localStorage.setItem('premioClaimed', 'true');
            localStorage.setItem('premioClaimedDate', new Date().toISOString());
            
            // Verificar se salvou
            const saved = localStorage.getItem('premioClaimed');
            const savedDate = localStorage.getItem('premioClaimedDate');
            
            console.log('🔍 Verificação localStorage:');
            console.log('  - premioClaimed:', saved);
            console.log('  - premioClaimedDate:', savedDate);
            
            if (saved === 'true') {
                console.log('✅ Status salvo no localStorage com sucesso');
            } else {
                console.error('❌ Falha ao salvar no localStorage');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar no localStorage:', error);
        }
        
        // Abrir link em nova aba
        window.open(this.gameUrl, '_blank');
        
        console.log('✅ Link aberto em nova aba:', this.gameUrl);
    }
    
    // Configurar URL do jogo
    setGameUrl(url) {
        this.gameUrl = url;
        console.log('🔗 URL do jogo configurada:', url);
    }
    
    // Verificar status do prêmio no localStorage
    checkPremioStatus() {
        try {
            const premioClaimed = localStorage.getItem('premioClaimed');
            const premioClaimedDate = localStorage.getItem('premioClaimedDate');
            
            console.log('🔍 Verificando localStorage:');
            console.log('  - premioClaimed:', premioClaimed);
            console.log('  - premioClaimedDate:', premioClaimedDate);
            
            if (premioClaimed === 'true') {
                console.log('🎁 Prêmio já foi reclamado anteriormente');
                
                // Aplicar estado de prêmio reclamado
                const btnJogar = document.getElementById('btn-jogar');
                const premioEmpty = document.getElementById('premio-empty');
                const btnCertificado = document.getElementById('btn-certificado');
                
                if (btnJogar) {
                    btnJogar.style.display = 'none';
                    console.log('✅ Botão escondido (prêmio já reclamado)');
                } else {
                    console.error('❌ Botão btn-jogar não encontrado');
                }
                
                if (premioEmpty) {
                    premioEmpty.src = 'assets/textures/premio-01.png';
                    console.log('✅ Imagem já é premio-01 (prêmio já reclamado)');
                } else {
                    console.error('❌ Elemento premio-empty não encontrado');
                }
                
                // Mostrar certificado quando prêmio é liberado
                if (btnCertificado) {
                    btnCertificado.style.display = 'block';
                    console.log('✅ Certificado visível (prêmio liberado)');
                } else {
                    console.error('❌ Botão certificado não encontrado');
                }
            } else {
                console.log('🎁 Prêmio ainda não foi reclamado');
                
                // Esconder certificado se prêmio não foi liberado
                const btnCertificado = document.getElementById('btn-certificado');
                if (btnCertificado) {
                    btnCertificado.style.display = 'none';
                    console.log('✅ Certificado escondido (prêmio não liberado)');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao verificar localStorage:', error);
        }
    }
    
    // Debug: Forçar mostrar container vazio
    debugShowPremioEmpty() {
        const premioEmptyContainer = document.getElementById('premio-empty-container');
        if (premioEmptyContainer) {
            premioEmptyContainer.style.display = 'flex';
            premioEmptyContainer.style.visibility = 'visible';
            premioEmptyContainer.style.opacity = '1';
            console.log('🔧 DEBUG: Container vazio forçado a aparecer');
        } else {
            console.error('❌ DEBUG: Container vazio não encontrado');
        }
    }
    
    // Debug: Resetar prêmio (para testes)
    debugResetPremio() {
        try {
            localStorage.removeItem('premioClaimed');
            localStorage.removeItem('premioClaimedDate');
            
            const btnJogar = document.getElementById('btn-jogar');
            const premioEmpty = document.getElementById('premio-empty');
            const btnCertificado = document.getElementById('btn-certificado');
            
            if (btnJogar) {
                btnJogar.style.display = 'block';
            }
            
            if (premioEmpty) {
                premioEmpty.src = 'assets/textures/premio-empty.png';
            }
            
            if (btnCertificado) {
                btnCertificado.style.display = 'none';
            }
            
            console.log('🔧 DEBUG: Prêmio resetado para estado inicial');
        } catch (error) {
            console.error('❌ Erro ao resetar prêmio:', error);
        }
    }
    
    // Debug: Testar localStorage
    debugTestLocalStorage() {
        try {
            console.log('🧪 Testando localStorage...');
            
            // Teste de escrita
            localStorage.setItem('test', 'value');
            const testValue = localStorage.getItem('test');
            console.log('  - Teste de escrita:', testValue === 'value' ? '✅' : '❌');
            
            // Teste de leitura
            const premioClaimed = localStorage.getItem('premioClaimed');
            console.log('  - premioClaimed atual:', premioClaimed);
            
            // Teste de remoção
            localStorage.removeItem('test');
            const removedValue = localStorage.getItem('test');
            console.log('  - Teste de remoção:', removedValue === null ? '✅' : '❌');
            
            console.log('🧪 Teste localStorage concluído');
        } catch (error) {
            console.error('❌ localStorage não suportado:', error);
        }
    }
}

// Criar instância global
window.congratulationsMenu = new CongratulationsMenu();

// Verificar status do prêmio sempre que a página carrega
document.addEventListener('DOMContentLoaded', () => {
    if (window.congratulationsMenu) {
        console.log('🌐 Página carregada - verificando status do prêmio');
        window.congratulationsMenu.checkPremioStatus();
    }
});

// Exportar para uso global
window.CongratulationsMenu = CongratulationsMenu; 