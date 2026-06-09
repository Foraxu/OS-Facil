// ============================================================
// OS Fácil - App
// ============================================================
// Seções:
//   1. Estado global
//   2. Configuração (menus, labels)
//   3. Inicialização
//   4. Dados (load, save, samples)
//   5. Navegação (telas, splash, sidebar)
//   6. Utilitários (modal, loading, helpers)
//   7. Eventos (login, cadastro, formulários)
//   8. Home pages (carga de cada dashboard)
//   9. Listagens (tabelas de OS)
//  10. Ações (encaminhar, aprovar, negar, cancelar, atualizar)
// ============================================================

// ---- Seção 1: Estado global ----
let currentUser = null;
let ordens = [];
let clientes = [];
let usuarios = [];
let notifications = [];
let currentRole = null;
let currentPage = null;

// Toast notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Sort table by column index (for static HTML tables)
const sortState = {};
function sortTableByColumn(tableBodyId, colIndex) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length === 0 || rows[0].querySelectorAll('td').length <= colIndex) return;

    const key = `sort_${tableBodyId}`;
    const currentOrder = sortState[key];
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    sortState[key] = newOrder;

    rows.sort((a, b) => {
        const dateA = a.querySelectorAll('td')[colIndex]?.textContent.trim() || '';
        const dateB = b.querySelectorAll('td')[colIndex]?.textContent.trim() || '';
        const da = new Date(dateA.split('/').reverse().join('-'));
        const db = new Date(dateB.split('/').reverse().join('-'));
        return newOrder === 'asc' ? da - db : db - da;
    });

    tbody.append(...rows);
    updateSortArrow(tableBodyId, newOrder);
}
function updateSortArrow(tableBodyId, order) {
    document.querySelectorAll(`[data-sort-id="${tableBodyId}"] .sort-arrow`).forEach(el => {
        el.innerHTML = order === 'asc' ? '&#9650;' : '&#9660;';
    });
}

// ---- Seção 2: Configuração ----
const roleMenu = {
    cliente: [
        { label: 'Início', page: 'home-cliente', icon: 'home' },
        { label: 'Solicitação de Serviços', page: 'solicitacao-servico', icon: 'file-plus' },
        { label: 'Minhas Solicitações', page: 'minhas-ordens', icon: 'clipboard-list' },
        { label: 'Notificações', page: 'notificacoes', icon: 'bell' },
        { label: 'Perfil', page: 'perfil', icon: 'user' }
    ],
    analista: [
        { label: 'Início', page: 'home-analista', icon: 'home' },
        { label: 'Notificações', page: 'notificacoes', icon: 'bell' },
        { label: 'Solicitação de Serviços', page: 'solicitacao-servico', icon: 'file-plus' },
        { label: 'Ordens de Serviço', page: 'ordens-servico-analista', icon: 'clipboard-list' },
        { label: 'Perfil dos Clientes', page: 'perfil-usuarios', icon: 'users' },
        { label: 'Documentação', page: 'documentacao', icon: 'file-text' }
    ],
    administrativo: [
        { label: 'Início', page: 'home-administrativo', icon: 'home' },
        { label: 'Notificações', page: 'notificacoes', icon: 'bell' },
        { label: 'Solicitação de Serviços', page: 'solicitacao-servico', icon: 'file-plus' },
        { label: 'Ordens de Serviço', page: 'ordens-servico-administrativo', icon: 'clipboard-list' },
        { label: 'Histórico de Ordens', page: 'historico-ordens', icon: 'archive' },
        { label: 'Perfis', page: 'perfis', icon: 'users' },
        { label: 'Documentação', page: 'documentacao', icon: 'file-text' }
    ],
    operacional: [
        { label: 'Início', page: 'home-operacional', icon: 'home' },
        { label: 'Notificações', page: 'notificacoes', icon: 'bell' },
        { label: 'Ordens de Serviço', page: 'ordens-servico-operacional', icon: 'clipboard-list' },
        { label: 'Serviços Executados', page: 'servicos-executados', icon: 'check-circle' },
        { label: 'Histórico de Serviços', page: 'historico-servicos-operacional', icon: 'archive' },
        { label: 'Documentação', page: 'documentacao', icon: 'file-text' }
    ]
};

const roleLabel = {
    cliente: 'Cliente',
    analista: 'Analista Comercial',
    administrativo: 'Administrativo',
    operacional: 'Operacional'
};

// ---- Seção 3: Inicialização ----
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    updateDates();
});

function updateDates() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('pt-BR', options);
    ['currentDate', 'currentDate2', 'currentDate3', 'currentDate4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = dateStr;
    });
}

// ---- Seção 4: Dados ----
function loadData() {
    ordens = JSON.parse(localStorage.getItem('ordens')) || generateSampleOrders();
    clientes = JSON.parse(localStorage.getItem('clientes')) || generateSampleClientes();
    usuarios = JSON.parse(localStorage.getItem('usuarios')) || generateSampleUsuarios();
    notifications = JSON.parse(localStorage.getItem('notifications')) || generateSampleNotifications();
    saveData();
}

function saveData() {
    localStorage.setItem('ordens', JSON.stringify(ordens));
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function hoje() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function diasAtras(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateSampleOrders() {
    return [
        { id: 2, cliente: 2, tipo: 'desobstrucao_esgoto', descricao: 'Esgoto retornando para o imóvel', executor: 2, status: 'aprovacao', dataAbertura: diasAtras(3), dataConclusao: null, imagem: null, autor: 1 },
        { id: 3, cliente: 3, tipo: 'troca_cavalete', descricao: 'Cavalete antigo danificado', executor: 3, status: 'concluido', dataAbertura: diasAtras(7), dataConclusao: diasAtras(5), imagem: null, autor: 2 },
        { id: 5, cliente: 5, tipo: 'cavalete_vazando', descricao: 'Vazamento no cavalete', executor: 3, status: 'atraso', dataAbertura: diasAtras(12), dataConclusao: null, imagem: null, autor: 1 },
        { id: 7, cliente: 2, tipo: 'revisao_faturas', descricao: 'Cliente solicitou revisão de faturas dos últimos 3 meses', executor: 2, status: 'pendente', dataAbertura: diasAtras(0), dataConclusao: null, imagem: null, autor: 2 },
        { id: 9, cliente: 4, tipo: 'vazamento_ramal', descricao: 'Vazamento no ramal principal', executor: 3, status: 'atraso', dataAbertura: diasAtras(15), dataConclusao: null, imagem: null, autor: 1 },
        { id: 10, cliente: 5, tipo: 'refaturamento', descricao: 'Refaturamento solicitado devido a erro na leitura', executor: 2, status: 'concluido', dataAbertura: diasAtras(10), dataConclusao: diasAtras(9), imagem: null, autor: 2 },
        { id: 12, cliente: 3, tipo: 'troca_titularidade', descricao: 'Troca de titularidade do imóvel', executor: null, status: 'aprovacao', dataAbertura: diasAtras(1), dataConclusao: null, imagem: null, autor: 2 },
        { id: 14, cliente: 2, tipo: 'troca_cavalete', descricao: 'Solicitado por analista - cavalete danificado', executor: null, status: 'aprovacao', dataAbertura: diasAtras(0), dataConclusao: null, imagem: null, autor: 2 },
        { id: 15, cliente: 4, tipo: 'desobstrucao_esgoto', descricao: 'Solicitado por administrativo - esgoto retornando', executor: null, status: 'pendente', dataAbertura: diasAtras(0), dataConclusao: null, imagem: null, autor: 1 },
        { id: 16, cliente: 6, tipo: 'vazamento_passeio', descricao: 'Vazamento no passeio em frente ao imóvel', executor: null, status: 'pendente', dataAbertura: diasAtras(0), dataConclusao: null, imagem: null, autor: 4 },
    ];
}

function generateSampleClientes() {
    return [
        { id: 1, nome: 'João Silva', documento: '123.456.789-00', telefone: '(11) 99999-9999', email: 'joao.silva@email.com', endereco: 'Rua das Flores, 123 - Centro' },
        { id: 2, nome: 'Maria Santos', documento: '987.654.321-00', telefone: '(11) 98888-8888', email: 'maria.santos@email.com', endereco: 'Av. Brasil, 456 - Jd. América' },
        { id: 3, nome: 'Carlos Oliveira', documento: '111.222.333-44', telefone: '(11) 97777-7777', email: 'carlos.oliveira@email.com', endereco: 'Rua Nova, 789 - Vila Nova' },
        { id: 4, nome: 'Empresa ABC Ltda', documento: '12.345.678/0001-90', telefone: '(11) 96666-6666', email: 'contato@abc.com.br', endereco: 'Av. Industrial, 1000' },
        { id: 5, nome: 'Ana Costa', documento: '555.666.777-88', telefone: '(11) 95555-5555', email: 'ana.costa@email.com', endereco: 'Rua das Palmeiras, 200' },
        { id: 6, nome: 'Luana Ferreira', documento: '444.444.444-44', telefone: '(11) 94444-4444', email: 'luana@osfacil.com', endereco: 'Rua dos Clientes, 100' },
    ];
}

function generateSampleUsuarios() {
    return [
        { id: 1, nome: 'Fernanda Lima', email: 'fernanda@osfacil.com', cpf: '111.111.111-11', senha: '123', tipo: 'administrativo' },
        { id: 2, nome: 'Ricardo Mendes', email: 'ricardo@osfacil.com', cpf: '222.222.222-22', senha: '123', tipo: 'analista' },
        { id: 3, nome: 'Marcos Paulo Costa', email: 'marcos@osfacil.com', cpf: '333.333.333-33', senha: '123', tipo: 'operacional' },
        { id: 4, nome: 'Luana Ferreira', email: 'luana@osfacil.com', cpf: '444.444.444-44', senha: '123', tipo: 'cliente' },
    ];
}

function generateSampleNotifications() {
    return [
        { id: 1, titulo: 'Nova OS atribuída', mensagem: 'Uma nova ordem de serviço foi atribuída a você.', data: `${hoje()} 10:30`, lida: false },
        { id: 2, titulo: 'OS concluída', mensagem: 'A OS #3 foi concluída.', data: `${diasAtras(3)} 15:45`, lida: true },
        { id: 3, titulo: 'Lembrete', mensagem: 'Verificar OS pendentes.', data: `${diasAtras(1)} 09:00`, lida: false },
    ];
}

function addNotification(titulo, mensagem, destinatarios) {
    notifications.unshift({ id: Date.now(), titulo, mensagem, data: new Date().toLocaleString('pt-BR'), lida: false, ...(destinatarios ? { para: destinatarios } : {}) });
    saveData();
    atualizarBadgeNotificacoes();
}

function getUserIdsByRole(role) {
    return usuarios.filter(u => u.tipo === role).map(u => u.id);
}

function atualizarBadgeNotificacoes() {
    const naoLidas = notifications.filter(n => !n.lida && (!n.para || n.para.includes(currentUser?.id))).length;
    document.querySelectorAll('#sidebarMenu a[data-page="notificacoes"] .notif-badge').forEach(el => {
        el.textContent = naoLidas;
        el.style.display = naoLidas > 0 ? 'inline' : 'none';
    });
}

// ---- Seção 5: Navegação ----
function showSplash() {
    document.getElementById('splashScreen').style.display = 'flex';
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appContainer').classList.remove('active');
    document.querySelectorAll('#splashScreen .page').forEach(p => p.classList.remove('active'));
}

function showSplashPage(pageId) {
    document.querySelectorAll('#splashScreen .page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showLogin() {
    document.getElementById('splashScreen').style.display = 'none';
    document.getElementById('loginScreen').classList.add('active');
}

function showCadastro() {
    document.getElementById('cadastroModal').classList.add('active');
}

function showPage(pageId) {
    document.querySelectorAll('.content .page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(pageId);
    if (el) el.classList.add('active');

    document.querySelectorAll('#sidebarMenu a').forEach(a => a.classList.remove('active'));
    const link = document.querySelector(`#sidebarMenu a[data-page="${pageId}"]`);
    if (link) link.classList.add('active');

    currentPage = pageId;
    loadPageContent(pageId);

    if (window.innerWidth < 1024) closeSidebar();
}

function updateSidebar(role) {
    const menu = roleMenu[role];
    if (!menu) return;
    const sidebar = document.getElementById('sidebarMenu');
    sidebar.innerHTML = menu.map(item =>
        `<li><a data-page="${item.page}" onclick="showPage('${item.page}')" class="flex items-center gap-3 px-5 py-4 text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-l-4 hover:border-blue-600 transition-all cursor-pointer"><i data-lucide="${item.icon || 'circle'}" class="w-5 h-5 flex-shrink-0"></i> ${item.label}${item.page === 'notificacoes' ? ' <span class="notif-badge" style="display:none;background:var(--danger);color:#fff;font-size:11px;border-radius:50%;min-width:18px;height:18px;line-height:18px;text-align:center;margin-left:auto;font-weight:700;"></span>' : ''}</a></li>`
    ).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
    atualizarBadgeNotificacoes();
}

function logout() {
    currentUser = null;
    currentRole = null;
    document.getElementById('appContainer').classList.remove('active');
    document.getElementById('loginForm').reset();
    showSplash();
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// Mobile sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const isOpen = sidebar.classList.contains('translate-x-0');
    sidebar.classList.toggle('translate-x-0', !isOpen);
    sidebar.classList.toggle('-translate-x-full', isOpen);
    backdrop.classList.toggle('hidden', isOpen);
    document.body.classList.toggle('overflow-hidden', !isOpen);
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    sidebar.classList.remove('translate-x-0');
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

// ---- Seção 6: Utilitários ----
function criarModal(id, titulo) {
    const contentId = `${id}Content`;
    let modal = document.getElementById(id);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `<div class="modal-content"><div class="modal-header"><h3>${titulo}</h3><button class="close-modal" onclick="closeModal('${id}')">&times;</button></div><div id="${contentId}"></div></div>`;
        document.body.appendChild(modal);
    }
    return modal;
}

function setLoading(btn, loading) {
    if (loading) {
        btn._text = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Aguarde...';
    } else {
        btn.disabled = false;
        btn.textContent = btn._text || btn.textContent;
    }
}

function lerImagemBase64(file) {
    return new Promise((resolve) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
    });
}

function renderStatusBadgeClasse(status) {
    if (status === 'pendente') return 'pendente';
    if (status === 'em_execucao') return 'em_execucao';
    if (status === 'aprovacao') return 'aprovacao';
    if (status === 'concluido') return 'concluido';
    if (status === 'atraso') return 'atraso';
    if (status === 'expirado') return 'expirado';
    if (status === 'cancelado') return 'cancelado';
    if (status === 'negado') return 'negado';
    if (status === 'falha') return 'falha';
    return 'pendente';
}

function statusAberto(status) {
    return status === 'pendente' || status === 'em_execucao' || status === 'aprovacao' || status === 'atraso' || status === 'em_aberto';
}

function getClienteNome(id) {
    return clientes.find(c => c.id === id)?.nome || 'N/A';
}

function getUserIdByClienteId(clienteId) {
    const c = clientes.find(c => c.id === clienteId);
    if (!c) return null;
    const u = usuarios.find(u => u.tipo === 'cliente' && u.email === c.email);
    return u?.id || null;
}

function getTipoLabel(tipo) {
    const labels = {
        'modificacao_tecnica': 'Modificação Técnica',
        'troca_cavalete': 'Troca Cavalete para Caixa UMA',
        'modificacao_dados': 'Modificação Dados Contratuais',
        'refaturamento': 'Refaturamento',
        'pagamento_informado': 'Pagamento Informado',
        'troca_titularidade': 'Troca de Titularidade',
        'revisao_faturas': 'Revisão de Faturas',
        'vazamento_passeio': 'Vazamento no Passeio',
        'vazamento_ramal': 'Vazamento no Ramal',
        'desobstrucao_retorno': 'Desobstrução de Retorno',
        'desobstrucao_esgoto': 'Desobstrução de Esgoto',
        'desobstrucao_ramal_esgoto': 'Desobstrução Ramal de Esgoto',
        'cavalete_vazando': 'Cavalete Vazando',
        'cavalete_quebrado': 'Cavalete Quebrado',
        'troca_hidro': 'Troca de Hidrômetro',
        'cliente': 'Cliente',
        'analista': 'Analista Comercial',
        'administrativo': 'Administrativo',
        'operacional': 'Operacional'
    };
    return labels[tipo] || tipo;
}

function getStatusLabel(status) {
    const labels = {
        'pendente': 'Pendente',
        'em_execucao': 'Em Execução',
        'aprovacao': 'Em Aprovação',
        'concluido': 'Concluído',
        'atraso': 'Em Atraso',
        'expirado': 'Expirado',
        'cancelado': 'Cancelado',
        'negado': 'Negado',
        'em_aberto': 'Em Aberto',
        'falha': 'Falha na Execução'
    };
    return labels[status] || status;
}

function formatDate(date) {
    if (!date) return '-';
    const parts = date.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
}

// ---- Seção 7: Eventos ----
function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('solServicoForm').addEventListener('submit', handleSolicitarServico);
    document.getElementById('cadastroForm').addEventListener('submit', handleCadastro);
    document.getElementById('cancelForm').addEventListener('submit', handleCancelarOS);

    document.getElementById('userBadge').addEventListener('click', showUserProfile);

    document.getElementById('solImagem').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const preview = document.getElementById('solImagemPreview');
                preview.src = ev.target.result;
                preview.style.display = 'block';
                document.getElementById('fileUploadArea').classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('acClientePossuiConta').addEventListener('change', function() {
        const val = this.value;
        document.getElementById('acRefClienteGroup').style.display = val === 'sim' ? 'block' : 'none';
        document.getElementById('acCriarClienteGroup').style.display = val === 'nao' ? 'block' : 'none';
        if (val === 'sim') {
            const select = document.getElementById('acRefCliente');
            select.innerHTML = '<option value="">Selecione o cliente</option>' +
                clientes.map(c => `<option value="${c.id}">${c.nome} (${c.documento})</option>`).join('');
        }
    });
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const userType = document.getElementById('userType').value;

    currentUser = usuarios.find(u => u.tipo === userType) || {
        id: Date.now(),
        nome: `Usuário ${roleLabel[userType]}`,
        email,
        tipo: userType
    };

    currentRole = userType;

    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appContainer').classList.add('active');
    document.getElementById('userBadge').textContent = `${currentUser.nome} (${roleLabel[currentRole]})`;

    updateSidebar(currentRole);
    showPage(`home-${currentRole}`);
}

function handleCadastro(e) {
    e.preventDefault();
    const nome = document.getElementById('cadNome').value;
    const cpf = document.getElementById('cadCPF').value;
    const email = document.getElementById('cadEmail').value;
    const telefone = document.getElementById('cadTelefone').value;
    const senha = document.getElementById('cadSenha').value;
    const tipo = document.getElementById('cadTipo').value;

    const existing = usuarios.find(u => u.email === email || u.cpf === cpf);
    if (existing) {
        document.getElementById('cadastroError').textContent = 'Já existe um usuário com este e-mail ou CPF.';
        document.getElementById('cadastroError').style.display = 'block';
        return;
    }

    const newUser = {
        id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
        nome, cpf, email, telefone, senha, tipo
    };
    usuarios.push(newUser);

    const newCliente = {
        id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
        nome, documento: cpf, telefone, email, endereco: ''
    };
    clientes.push(newCliente);

    saveData();
    closeModal('cadastroModal');
    document.getElementById('cadastroForm').reset();
    showToast('Cadastro realizado com sucesso! Faça o login.', 'success');
}

// ---- Seção 8: Home pages ----
function refreshCurrentList() {
    if (currentPage) loadPageContent(currentPage);
}
function loadPageContent(pageId) {
    switch (pageId) {
        case 'home-cliente': loadHomeCliente(); break;
        case 'home-analista': loadHomeAnalista(); break;
        case 'home-administrativo': loadHomeAdministrativo(); break;
        case 'home-operacional': loadHomeOperacional(); break;
        case 'notificacoes': loadNotificacoes(); break;
        case 'perfil': showUserProfile(); break;
        case 'ordens-pendentes': loadOrdensPendentes(); break;
        case 'perfil-usuarios': loadPerfilUsuarios(); break;
        case 'servicos-aprovacao': loadServicosAprovacao(); break;
        case 'perfil-funcionarios': loadPerfilFuncionarios(); break;
        case 'historico-ordens': loadHistoricoOrdens(); break;
        case 'ordens-expiradas': loadOrdensExpiradas(); break;
        case 'perfis': loadPerfis(); break;
        case 'ordens-servico-analista': loadOrdensServicoAnalista(); break;
        case 'ordens-servico-operacional': loadOrdensServicoOperacional(); break;
        case 'ordens-servico-administrativo': loadOrdensServicoAdministrativo(); break;
        case 'servicos-executados': loadServicosExecutados(); break;
        case 'historico-servicos-operacional': loadHistoricoServicosOperacional(); break;
        case 'minhas-ordens': loadMinhasOrdens(); break;
        case 'solicitacao-servico': loadSolicitacaoServico(); break;
    }
}

function loadSolicitacaoServico() {
    const isAC = currentRole === 'analista' || currentRole === 'administrativo';
    document.getElementById('acClienteSection').style.display = isAC ? 'block' : 'none';
}

function loadHomeCliente() {
    const statusPermitidos = ['pendente', 'aprovacao', 'em_execucao'];
    const abertas = ordens.filter(o =>
        (o.autor === currentUser?.id) && statusPermitidos.includes(o.status)
    ).sort((a, b) => new Date(b.dataAbertura.split('/').reverse().join('-')) - new Date(a.dataAbertura.split('/').reverse().join('-')));
    document.getElementById('clienteHomeOSTable').innerHTML = abertas.length > 0 ?
        abertas.map(o => `<tr>
            <td>#${o.id}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
            <td>${formatDate(o.dataAbertura)}</td>
            <td><button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Detalhes</button></td>
        </tr>`).join('') :
        '<tr><td colspan="5" style="text-align:center;color:var(--gray);">Nenhuma ordem em aberto.</td></tr>';
}

function loadHomeAnalista() {
    document.getElementById('analistaPendentes').textContent =
        ordens.filter(o => o.status === 'pendente').length;
    document.getElementById('analistaExecutados').textContent =
        ordens.filter(o => o.status === 'concluido').length;
    const abertas = ordens.filter(o => statusAberto(o.status)).sort((a, b) => new Date(b.dataAbertura.split('/').reverse().join('-')) - new Date(a.dataAbertura.split('/').reverse().join('-')));
    document.getElementById('analistaHomeOSTable').innerHTML = abertas.length > 0 ?
        abertas.map(o => `<tr>
            <td>#${o.id}</td>
            <td>${getClienteNome(o.cliente)}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
            <td>${formatDate(o.dataAbertura)}</td>
        </tr>`).join('') :
        '<tr><td colspan="5" style="text-align:center;color:var(--gray);">Nenhuma ordem em aberto.</td></tr>';
}

function loadHomeAdministrativo() {
    document.getElementById('adminPendentes').textContent =
        ordens.filter(o => o.status === 'pendente').length;
    document.getElementById('adminAprovacao').textContent =
        ordens.filter(o => o.status === 'aprovacao').length;
    document.getElementById('adminExecutados').textContent =
        ordens.filter(o => o.status === 'concluido').length;

    const abertas = ordens.filter(o => statusAberto(o.status)).sort((a, b) => new Date(b.dataAbertura.split('/').reverse().join('-')) - new Date(a.dataAbertura.split('/').reverse().join('-')));
    document.getElementById('adminHomeOSTable').innerHTML = abertas.length > 0 ?
        abertas.map(o => `<tr>
            <td>#${o.id}</td>
            <td>${getClienteNome(o.cliente)}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
            <td>${formatDate(o.dataAbertura)}</td>
        </tr>`).join('') :
        '<tr><td colspan="5" style="text-align:center;color:var(--gray);">Nenhuma ordem em aberto.</td></tr>';
}

function loadHomeOperacional() {
    document.getElementById('operacionalPendentes').textContent =
        ordens.filter(o => o.executor === currentUser?.id && (o.status === 'em_execucao' || o.status === 'aprovacao')).length;
    document.getElementById('operacionalExecutados').textContent =
        ordens.filter(o => o.executor === currentUser?.id && o.status === 'concluido').length;
    const abertas = ordens.filter(o =>
        o.executor === currentUser?.id && statusAberto(o.status)
    ).sort((a, b) => new Date(b.dataAbertura.split('/').reverse().join('-')) - new Date(a.dataAbertura.split('/').reverse().join('')));
    document.getElementById('operacionalHomeOSTable').innerHTML = abertas.length > 0 ?
        abertas.map(o => `<tr>
            <td>#${o.id}</td>
            <td>${getClienteNome(o.cliente)}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
            <td>${formatDate(o.dataAbertura)}</td>
        </tr>`).join('') :
        '<tr><td colspan="5" style="text-align:center;color:var(--gray);">Nenhuma ordem em aberto.</td></tr>';
}

function loadNotificacoes() {
    const minhas = notifications.filter(n => !n.para || n.para.includes(currentUser?.id));
    document.getElementById('notificationsList').innerHTML = minhas.map(n =>
        `<div class="notification-item ${n.lida ? '' : 'unread'}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <h4>${n.titulo}</h4>
                    <p>${n.mensagem}</p>
                    <small style="color:var(--gray);">${n.data}</small>
                </div>
                <button class="btn btn-sm btn-danger" onclick="excluirNotificacao(${n.id})" style="margin-left:10px;flex-shrink:0;" title="Excluir notificação">🗑</button>
            </div>
        </div>`
    ).join('');
    minhas.forEach(n => { if (!n.lida) { n.lida = true; } });
    saveData();
    atualizarBadgeNotificacoes();
}

function excluirNotificacao(id) {
    notifications = notifications.filter(n => n.id !== id);
    saveData();
    loadNotificacoes();
}

function loadPerfil() {
    if (!currentUser) return;
    document.getElementById('perfilNome').innerHTML = `<strong>Nome:</strong> ${currentUser.nome}`;
    document.getElementById('perfilEmail').innerHTML = `<strong>E-mail:</strong> ${currentUser.email}`;
    document.getElementById('perfilCPF').innerHTML = `<strong>CPF:</strong> ${currentUser.cpf || '-'}`;
    document.getElementById('perfilTipo').innerHTML = `<strong>Tipo:</strong> ${roleLabel[currentRole] || currentUser.tipo}`;
}

function showUserProfile() {
    if (!currentUser) return;
    criarModal('profileModal', 'Meu Perfil');
    document.getElementById('profileModalContent').innerHTML = `
        <div class="info-page">
            <div class="info-card">
                <p><strong>Nome:</strong> ${currentUser.nome}</p>
                <p><strong>E-mail:</strong> ${currentUser.email}</p>
                <p><strong>CPF:</strong> ${currentUser.cpf || '-'}</p>
                <p><strong>Tipo:</strong> ${roleLabel[currentRole] || currentUser.tipo}</p>
            </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:15px;">
            <button class="btn btn-secondary" onclick="closeModal('profileModal')">Fechar</button>
        </div>
    `;
    openModal('profileModal');
}

// ---- Seção 9: Listagens ----
function loadMinhasOrdens() {
    const minhas = ordens.filter(o => o.autor === currentUser?.id).sort((a, b) => new Date(b.dataAbertura.split('/').reverse().join('-')) - new Date(a.dataAbertura.split('/').reverse().join('')));
    document.getElementById('minhasOrdensTable').innerHTML = minhas.map(o =>
        `<tr>
            <td>#${o.id}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
            <td>${formatDate(o.dataAbertura)}</td>
            <td>
                ${o.status === 'em_aberto' || o.status === 'pendente' ?
                    `<button class="btn btn-sm btn-danger" onclick="openCancelModal(${o.id})">Cancelar</button>` : ''}
                <button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Detalhes</button>
            </td>
        </tr>`
    ).join('');
}

function loadOrdensPendentes() {
    const pendentes = ordens.filter(o => o.status === 'pendente').sort((a, b) => new Date(b.dataAbertura.split('/').reverse().join('-')) - new Date(a.dataAbertura.split('/').reverse().join('')));
    document.getElementById('ordensPendentesTable').innerHTML = pendentes.map(o =>
        `<tr>
            <td>#${o.id}</td>
            <td>${getClienteNome(o.cliente)}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td><span class="status-badge status-pendente">Pendente</span></td>
            <td>${formatDate(o.dataAbertura)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Ver</button>
                ${currentRole === 'analista' || currentRole === 'administrativo' ?
                    `<button class="btn btn-sm btn-success" onclick="encaminharAprovacao(${o.id})">Encaminhar</button>` : ''}
                ${currentRole === 'operacional' ?
                    `<button class="btn btn-sm btn-warning" onclick="abrirModalAtualizar(${o.id})">Atualizar</button>` : ''}
            </td>
        </tr>`
    ).join('');
}

function loadPerfis() {
    const container = document.getElementById('perfisContainer');
    if (!container) return;

    let currentTab = 'funcionarios';

    function render() {
        const funcionarios = usuarios.filter(u => u.tipo !== 'cliente');
        const clientes = usuarios.filter(u => u.tipo === 'cliente');

        const tabelaFuncionarios = funcionarios.map(u =>
            `<tr>
                <td>#${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${roleLabel[u.tipo] || u.tipo}</td>
                <td><button class="btn btn-sm btn-info" onclick="detalhesUsuario(${u.id})">Ver</button></td>
            </tr>`
        ).join('');

        const tabelaClientes = clientes.map(u =>
            `<tr>
                <td>#${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${roleLabel[u.tipo] || u.tipo}</td>
                <td><button class="btn btn-sm btn-info" onclick="detalhesUsuario(${u.id})">Ver</button></td>
            </tr>`
        ).join('');

        container.innerHTML = `
            <div class="sub-tabs" style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn ${currentTab === 'funcionarios' ? 'btn-primary active' : 'btn-secondary'}" data-tab="funcionarios">Perfil dos funcionários</button>
                <button class="btn ${currentTab === 'clientes' ? 'btn-primary active' : 'btn-secondary'}" data-tab="clientes">Perfil dos clientes</button>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr>${currentTab === 'funcionarios' ? '<th>ID</th><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Ações</th>' : '<th>ID</th><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Ações</th>'}</tr></thead>
                    <tbody>${currentTab === 'funcionarios' ? (tabelaFuncionarios || '<tr><td colspan="5" style="text-align:center;color:var(--gray);">Nenhum funcionário encontrado.</td></tr>') : (tabelaClientes || '<tr><td colspan="5" style="text-align:center;color:var(--gray);">Nenhum cliente encontrado.</td></tr>')}</tbody>
                </table>
            </div>
        `;

        container.querySelectorAll('.sub-tabs .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTab = btn.dataset.tab;
                render();
            });
        });
    }

    render();
}

function loadPerfilUsuarios() {
    const clientes = usuarios.filter(u => u.tipo === 'cliente');
    document.getElementById('perfilUsuariosTable').innerHTML = clientes.map(u =>
        `<tr>
            <td>#${u.id}</td>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${roleLabel[u.tipo] || u.tipo}</td>
            <td><button class="btn btn-sm btn-info" onclick="detalhesUsuario(${u.id})">Ver</button></td>
        </tr>`
    ).join('');
}

function loadServicosAprovacao() {
    const aprovacao = ordens.filter(o => o.status === 'aprovacao');
    document.getElementById('servicosAprovacaoTable').innerHTML = aprovacao.map(o =>
        `<tr>
            <td>#${o.id}</td>
            <td>${getClienteNome(o.cliente)}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td>${formatDate(o.dataAbertura)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Detalhes</button>
                <button class="btn btn-sm btn-success" onclick="aprovarOS(${o.id})">Aprovar</button>
                <button class="btn btn-sm btn-danger" onclick="negarOS(${o.id})">Negar</button>
            </td>
        </tr>`
    ).join('');
}

function loadPerfilFuncionarios() {
    const funcionarios = usuarios.filter(u => u.tipo !== 'cliente');
    document.getElementById('perfilFuncionariosTable').innerHTML = funcionarios.map(u =>
        `<tr>
            <td>#${u.id}</td>
            <td>${u.nome}</td>
            <td>${u.email}</td>
            <td>${roleLabel[u.tipo] || u.tipo}</td>
            <td><button class="btn btn-sm btn-info">Ver</button></td>
        </tr>`
    ).join('');
}

function loadHistoricoOrdens() {
    const historico = ordens.filter(o => o.status === 'concluido' || o.status === 'expirado' || o.status === 'cancelado').sort((a, b) => new Date(b.dataAbertura.split('/').reverse().join('-')) - new Date(a.dataAbertura.split('/').reverse().join('')));
    document.getElementById('historicoOrdensTable').innerHTML = historico.map(o =>
        `<tr>
            <td>#${o.id}</td>
            <td>${getClienteNome(o.cliente)}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
            <td>${formatDate(o.dataAbertura)}</td>
            <td>${o.dataConclusao ? formatDate(o.dataConclusao) : '-'}</td>
        </tr>`
    ).join('');
}

function loadOrdensExpiradas() {
    const expiradas = ordens.filter(o => o.status === 'expirado');
    document.getElementById('ordensExpiradasTable').innerHTML = expiradas.map(o =>
        `<tr>
            <td>#${o.id}</td>
            <td>${getClienteNome(o.cliente)}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td><span class="status-badge status-expirado">Expirado</span></td>
            <td>${formatDate(o.dataAbertura)}</td>
        </tr>`
    ).join('');
}

function loadOrdensServicoAdministrativo() {
    const container = document.getElementById('ordensServicoAdminContainer');
    if (!container) return;

    let currentTab = 'pendentes';
    let searchTerm = '';
    let sortOrder = 'desc';

    function render() {
        let ordensFiltradas = [];

        if (currentTab === 'pendentes') {
            ordensFiltradas = ordens.filter(o => o.status === 'pendente');
        } else if (currentTab === 'aprovacao') {
            ordensFiltradas = ordens.filter(o => o.status === 'aprovacao');
        } else if (currentTab === 'execucao') {
            ordensFiltradas = ordens.filter(o => o.status === 'em_execucao');
        } else if (currentTab === 'concluidos') {
            ordensFiltradas = ordens.filter(o => o.status === 'concluido');
        } else if (currentTab === 'negados') {
            ordensFiltradas = ordens.filter(o => o.status === 'negado');
        } else if (currentTab === 'expiradas') {
            ordensFiltradas = ordens.filter(o => o.status === 'expirado');
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            ordensFiltradas = ordensFiltradas.filter(o =>
                String(o.id).includes(term) ||
                getClienteNome(o.cliente).toLowerCase().includes(term) ||
                getTipoLabel(o.tipo).toLowerCase().includes(term) ||
                (o.descricao || '').toLowerCase().includes(term)
            );
        }

        if (sortOrder) {
            ordensFiltradas.sort((a, b) => {
                const da = new Date(a.dataAbertura.split('/').reverse().join('-'));
                const db = new Date(b.dataAbertura.split('/').reverse().join('-'));
                return sortOrder === 'asc' ? da - db : db - da;
            });
        }

        function acoes(o) {
            if (currentTab === 'pendentes') {
                return `
                    <button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Ver</button>
                    <button class="btn btn-sm btn-success" onclick="encaminharAprovacao(${o.id})">Encaminhar</button>
                    <button class="btn btn-sm btn-danger" onclick="negarOS(${o.id})">Negar</button>`;
            } else if (currentTab === 'aprovacao') {
                return `
                    <button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Detalhes</button>
                    <button class="btn btn-sm btn-success" onclick="aprovarOS(${o.id})">Aprovar</button>
                    <button class="btn btn-sm btn-danger" onclick="negarOS(${o.id})">Negar</button>`;
            }
            return `<button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Ver</button>`;
        }

        const seta = sortOrder === 'asc' ? '&#9650;' : sortOrder === 'desc' ? '&#9660;' : '&#9654;';

        const linhas = ordensFiltradas.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${getClienteNome(o.cliente)}</td>
                <td>${getTipoLabel(o.tipo)}</td>
                <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
                <td>${currentTab === 'concluidos' ? formatDate(o.dataConclusao) : formatDate(o.dataAbertura)}</td>
                <td>${acoes(o)}</td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="search-bar" style="margin-bottom:15px;">
                <input type="text" id="adminOrdensSearch" placeholder="Pesquisar por ID, cliente, tipo ou descrição..." style="width:100%;padding:10px;border:1px solid var(--gray);border-radius:8px;">
            </div>
            <div class="sub-tabs" style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn ${currentTab === 'pendentes' ? 'btn-primary active' : 'btn-secondary'}" data-tab="pendentes">Pendentes</button>
                <button class="btn ${currentTab === 'aprovacao' ? 'btn-primary active' : 'btn-secondary'}" data-tab="aprovacao">Em espera de aprovação</button>
                <button class="btn ${currentTab === 'execucao' ? 'btn-primary active' : 'btn-secondary'}" data-tab="execucao">Em execução</button>
                <button class="btn ${currentTab === 'concluidos' ? 'btn-primary active' : 'btn-secondary'}" data-tab="concluidos">Concluídos</button>
                <button class="btn ${currentTab === 'negados' ? 'btn-primary active' : 'btn-secondary'}" data-tab="negados">Negados</button>
                <button class="btn ${currentTab === 'expiradas' ? 'btn-primary active' : 'btn-secondary'}" data-tab="expiradas">Expiradas</button>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>ID</th><th>Cliente</th><th>Tipo</th><th>Status</th><th id="adminSortHeader" style="cursor:pointer;user-select:none;">Abertura <span id="adminSortArrow">${seta}</span></th><th>Ações</th></tr></thead>
                    <tbody>${linhas || '<tr><td colspan="6" style="text-align:center;color:var(--gray);">Nenhuma ordem encontrada.</td></tr>'}</tbody>
                </table>
            </div>
        `;

        container.querySelectorAll('.sub-tabs .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTab = btn.dataset.tab;
                searchTerm = '';
                render();
            });
        });

        const searchInput = document.getElementById('adminOrdensSearch');
        searchInput.addEventListener('input', function() {
            searchTerm = this.value;
            render();
        });

        const sortHeader = document.getElementById('adminSortHeader');
        if (sortHeader) {
            sortHeader.addEventListener('click', function() {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                render();
            });
        }
    }

    render();
}

function loadOrdensServicoAnalista() {
    const container = document.getElementById('ordensServicoAnalistaContainer');
    if (!container) return;

    let currentTab = 'pendentes';
    let searchTerm = '';
    let sortOrder = 'desc';

    function acoes(o) {
        if (currentTab === 'pendentes') {
            return `
                <button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Ver</button>
                <button class="btn btn-sm btn-success" onclick="encaminharAprovacao(${o.id})">Encaminhar</button>
                <button class="btn btn-sm btn-danger" onclick="negarOS(${o.id})">Negar</button>`;
        }
        return `<button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Ver</button>`;
    }

    function render() {
        let ordensFiltradas = [];

        if (currentTab === 'pendentes') {
            ordensFiltradas = ordens.filter(o => o.status === 'pendente');
        } else if (currentTab === 'aprovacao') {
            ordensFiltradas = ordens.filter(o => o.status === 'aprovacao');
        } else if (currentTab === 'execucao') {
            ordensFiltradas = ordens.filter(o => o.status === 'em_execucao');
        } else if (currentTab === 'concluidos') {
            ordensFiltradas = ordens.filter(o => o.status === 'concluido');
        } else if (currentTab === 'negados') {
            ordensFiltradas = ordens.filter(o => o.status === 'negado');
        } else if (currentTab === 'expiradas') {
            ordensFiltradas = ordens.filter(o => o.status === 'expirado');
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            ordensFiltradas = ordensFiltradas.filter(o =>
                String(o.id).includes(term) ||
                getClienteNome(o.cliente).toLowerCase().includes(term) ||
                getTipoLabel(o.tipo).toLowerCase().includes(term) ||
                (o.descricao || '').toLowerCase().includes(term)
            );
        }

        if (sortOrder) {
            ordensFiltradas.sort((a, b) => {
                const da = new Date(a.dataAbertura.split('/').reverse().join('-'));
                const db = new Date(b.dataAbertura.split('/').reverse().join('-'));
                return sortOrder === 'asc' ? da - db : db - da;
            });
        }

        const seta = sortOrder === 'asc' ? '&#9650;' : sortOrder === 'desc' ? '&#9660;' : '&#9654;';

        const linhas = ordensFiltradas.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${getClienteNome(o.cliente)}</td>
                <td>${getTipoLabel(o.tipo)}</td>
                <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
                <td>${currentTab === 'concluidos' ? formatDate(o.dataConclusao) : formatDate(o.dataAbertura)}</td>
                <td>${acoes(o)}</td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="search-bar" style="margin-bottom:15px;">
                <input type="text" id="analistaSearch" placeholder="Pesquisar por ID, cliente, tipo ou descrição..." style="width:100%;padding:10px;border:1px solid var(--gray);border-radius:8px;">
            </div>
            <div class="sub-tabs" style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn ${currentTab === 'pendentes' ? 'btn-primary active' : 'btn-secondary'}" data-tab="pendentes">Pendentes</button>
                <button class="btn ${currentTab === 'aprovacao' ? 'btn-primary active' : 'btn-secondary'}" data-tab="aprovacao">Em espera de aprovação</button>
                <button class="btn ${currentTab === 'execucao' ? 'btn-primary active' : 'btn-secondary'}" data-tab="execucao">Em execução</button>
                <button class="btn ${currentTab === 'concluidos' ? 'btn-primary active' : 'btn-secondary'}" data-tab="concluidos">Concluídos</button>
                <button class="btn ${currentTab === 'negados' ? 'btn-primary active' : 'btn-secondary'}" data-tab="negados">Negados</button>
                <button class="btn ${currentTab === 'expiradas' ? 'btn-primary active' : 'btn-secondary'}" data-tab="expiradas">Expiradas</button>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>ID</th><th>Cliente</th><th>Tipo</th><th>Status</th><th id="analistaSortHeader" style="cursor:pointer;user-select:none;">Abertura <span id="analistaSortArrow">${seta}</span></th><th>Ações</th></tr></thead>
                    <tbody>${linhas || '<tr><td colspan="6" style="text-align:center;color:var(--gray);">Nenhuma ordem encontrada.</td></tr>'}</tbody>
                </table>
            </div>
        `;

        container.querySelectorAll('.sub-tabs .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTab = btn.dataset.tab;
                searchTerm = '';
                render();
            });
        });

        const searchInput = document.getElementById('analistaSearch');
        searchInput.addEventListener('input', function() {
            searchTerm = this.value;
            render();
        });

        const sortHeader = document.getElementById('analistaSortHeader');
        if (sortHeader) {
            sortHeader.addEventListener('click', function() {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                render();
            });
        }
    }

    render();
}

function loadOrdensServicoOperacional() {
    const container = document.getElementById('ordensServicoOperacionalContent');
    if (!container) return;

    let currentTab = 'em_execucao';
    let searchTerm = '';
    let sortOrder = 'desc';

    function render() {
        let ordensFiltradas = ordens.filter(o => {
            if (currentTab === 'em_execucao') return o.status === 'em_execucao';
            if (currentTab === 'atraso') return o.status === 'atraso';
            if (currentTab === 'todas') return o.executor === currentUser?.id && !['concluido', 'expirado', 'falha'].includes(o.status);
            return false;
        });

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            ordensFiltradas = ordensFiltradas.filter(o =>
                String(o.id).includes(term) ||
                getClienteNome(o.cliente).toLowerCase().includes(term) ||
                getTipoLabel(o.tipo).toLowerCase().includes(term) ||
                (o.descricao || '').toLowerCase().includes(term)
            );
        }

        if (sortOrder) {
            ordensFiltradas.sort((a, b) => {
                const da = new Date(a.dataAbertura.split('/').reverse().join('-'));
                const db = new Date(b.dataAbertura.split('/').reverse().join('-'));
                return sortOrder === 'asc' ? da - db : db - da;
            });
        }

        const seta = sortOrder === 'asc' ? '&#9650;' : sortOrder === 'desc' ? '&#9660;' : '&#9654;';

        const linhas = ordensFiltradas.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${getClienteNome(o.cliente)}</td>
                <td>${getTipoLabel(o.tipo)}</td>
                <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
                <td>${formatDate(o.dataAbertura)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Ver</button>
                    <button class="btn btn-sm btn-warning" onclick="abrirModalAtualizar(${o.id})">Atualizar</button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="search-bar" style="margin-bottom:15px;">
                <input type="text" id="osOperacionalSearch" placeholder="Pesquisar por ID, cliente, tipo ou descrição..." style="width:100%;padding:10px;border:1px solid var(--gray);border-radius:8px;">
            </div>
            <div class="sub-tabs" style="display:flex;gap:10px;margin-bottom:15px;flex-wrap:wrap;">
                <button class="btn ${currentTab === 'em_execucao' ? 'btn-primary active' : 'btn-secondary'}" data-tab="em_execucao">Em execução</button>
                <button class="btn ${currentTab === 'atraso' ? 'btn-primary active' : 'btn-secondary'}" data-tab="atraso">Em atraso</button>
                <button class="btn ${currentTab === 'todas' ? 'btn-primary active' : 'btn-secondary'}" data-tab="todas">Todas</button>
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>ID</th><th>Cliente</th><th>Tipo</th><th>Status</th><th id="operacionalSortHeader" style="cursor:pointer;user-select:none;">Abertura <span id="operacionalSortArrow">${seta}</span></th><th>Ações</th></tr></thead>
                    <tbody>${linhas || '<tr><td colspan="6" style="text-align:center;color:var(--gray);">Nenhuma ordem encontrada.</td></tr>'}</tbody>
                </table>
            </div>
        `;

        container.querySelectorAll('.sub-tabs .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTab = btn.dataset.tab;
                render();
            });
        });

        document.getElementById('osOperacionalSearch').addEventListener('input', function() {
            searchTerm = this.value;
            render();
        });

        const sortHeader = document.getElementById('operacionalSortHeader');
        if (sortHeader) {
            sortHeader.addEventListener('click', function() {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                render();
            });
        }
    }

    render();
}

function loadServicosExecutados() {
    const executados = ordens.filter(o => o.status === 'concluido');
    document.getElementById('servicosExecutadosTable').innerHTML = executados.map(o =>
        `<tr>
            <td>#${o.id}</td>
            <td>${getClienteNome(o.cliente)}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td>${formatDate(o.dataConclusao || o.dataAbertura)}</td>
            <td><span class="status-badge status-concluido">Concluído</span></td>
        </tr>`
    ).join('');
}

function loadHistoricoServicosOperacional() {
    const container = document.getElementById('historicoServicosOperacionalContent');
    if (!container) return;

    let searchTerm = '';
    let sortOrder = 'desc';

    function render() {
        let ordensFiltradas = ordens.filter(o =>
            o.executor === currentUser?.id && ['concluido', 'expirado', 'falha'].includes(o.status)
        );

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            ordensFiltradas = ordensFiltradas.filter(o =>
                String(o.id).includes(term) ||
                getClienteNome(o.cliente).toLowerCase().includes(term) ||
                getTipoLabel(o.tipo).toLowerCase().includes(term) ||
                (o.descricao || '').toLowerCase().includes(term)
            );
        }

        if (sortOrder) {
            ordensFiltradas.sort((a, b) => {
                const da = new Date(a.dataAbertura.split('/').reverse().join('-'));
                const db = new Date(b.dataAbertura.split('/').reverse().join('-'));
                return sortOrder === 'asc' ? da - db : db - da;
            });
        }

        const seta = sortOrder === 'asc' ? '&#9650;' : sortOrder === 'desc' ? '&#9660;' : '&#9654;';

        const linhas = ordensFiltradas.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${getClienteNome(o.cliente)}</td>
                <td>${getTipoLabel(o.tipo)}</td>
                <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
                <td>${formatDate(o.dataConclusao || o.dataAbertura)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewOS(${o.id})">Ver</button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="search-bar" style="margin-bottom:15px;">
                <input type="text" id="historicoOperacionalSearch" placeholder="Pesquisar por ID, cliente, tipo ou descrição..." style="width:100%;padding:10px;border:1px solid var(--gray);border-radius:8px;">
            </div>
            <div class="table-container">
                <table>
                    <thead><tr><th>ID</th><th>Cliente</th><th>Tipo</th><th>Status</th><th id="historicoSortHeader" style="cursor:pointer;user-select:none;">Conclusão <span id="historicoSortArrow">${seta}</span></th><th>Ações</th></tr></thead>
                    <tbody>${linhas || '<tr><td colspan="6" style="text-align:center;color:var(--gray);">Nenhum serviço no histórico.</td></tr>'}</tbody>
                </table>
            </div>
        `;

        const searchInput = document.getElementById('historicoOperacionalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchTerm = this.value;
                render();
            });
        }

        const sortHeader = document.getElementById('historicoSortHeader');
        if (sortHeader) {
            sortHeader.addEventListener('click', function() {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                render();
            });
        }
    }

    render();
}

// AC: Buscar Ordens
function buscarOrdens() {
    const tipo = document.getElementById('buscaTipo').value;
    const id = document.getElementById('buscaId').value;
    const data = document.getElementById('buscaData').value;

    let result = [...ordens];
    if (tipo) result = result.filter(o => o.tipo === tipo);
    if (id) result = result.filter(o => o.id === parseInt(id));
    if (data) result = result.filter(o => o.dataAbertura === data || o.dataConclusao === data);

    document.getElementById('buscaOSTable').innerHTML = result.length > 0 ?
        result.map(o => `<tr>
            <td>#${o.id}</td>
            <td>${getClienteNome(o.cliente)}</td>
            <td>${getTipoLabel(o.tipo)}</td>
            <td><span class="status-badge status-${renderStatusBadgeClasse(o.status)}">${getStatusLabel(o.status)}</span></td>
            <td>${formatDate(o.dataAbertura)}</td>
        </tr>`).join('') :
        '<tr><td colspan="5" style="text-align:center;color:var(--gray);">Nenhuma ordem de serviço encontrada.</td></tr>';
}

// ---- Seção 10: Ações ----
// Encaminhar para aprovação
function encaminharAprovacao(id) {
    const os = ordens.find(o => o.id === id);
    if (!os) return;
    const cliente = clientes.find(c => c.id === os.cliente);
    const detalhes = `
        <div style="margin-bottom:20px;">
            <p><strong>ID:</strong> #${os.id}</p>
            <p><strong>Status:</strong> <span class="status-badge status-pendente">Pendente</span></p>
            <p><strong>Abertura:</strong> ${formatDate(os.dataAbertura)}</p>
        </div>
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Cliente</h4>
            <p><strong>Nome:</strong> ${cliente?.nome || 'N/A'}</p>
            <p><strong>Endereço:</strong> ${cliente?.endereco || 'N/A'}</p>
        </div>
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Serviço</h4>
            <p><strong>Tipo:</strong> ${getTipoLabel(os.tipo)}</p>
            <p><strong>Descrição:</strong> ${os.descricao}</p>
            ${os.imagem ? `<p><strong>Imagem anexada:</strong> ${os.imagem}</p>` : ''}
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn btn-secondary" onclick="closeModal('encaminharModal')">Cancelar</button>
            <button class="btn btn-success" onclick="confirmarEncaminhar(${os.id})">Confirmar Encaminhamento</button>
        </div>
    `;
    criarModal('encaminharModal', 'Encaminhar para Aprovação');
    document.getElementById('encaminharModalContent').innerHTML = detalhes;
    openModal('encaminharModal');
}

function confirmarEncaminhar(id) {
    const os = ordens.find(o => o.id === id);
    if (os) {
        os.status = 'aprovacao';
        saveData();
        if (currentUser?.tipo === 'analista') {
            addNotification('OS encaminhada', `A OS #${id} foi encaminhada para aprovação.`, getUserIdsByRole('administrativo'));
        } else if (currentUser?.tipo === 'administrativo') {
            if (os.autor !== currentUser?.id) {
                addNotification('OS encaminhada', `A OS #${id} foi encaminhada para aprovação.`, [os.autor]);
            }
        } else {
            addNotification('OS encaminhada', `A OS #${id} foi encaminhada para aprovação.`, getUserIdsByRole('analista'));
        }
        showToast(`OS #${id} encaminhada para aprovação.`, 'success');
        closeModal('encaminharModal');
        refreshCurrentList();
    }
}

// Admin: Aprovar / Negar OS
function aprovarOS(id) {
    const os = ordens.find(o => o.id === id);
    if (!os) return;
    const cliente = clientes.find(c => c.id === os.cliente);
    const ops = usuarios.filter(u => u.tipo === 'operacional');
    const opcoes = ops.map(u => `<option value="${u.id}">${u.nome}</option>`).join('');

    const detalhes = `
        <div style="margin-bottom:20px;">
            <p><strong>ID:</strong> #${os.id}</p>
            <p><strong>Abertura:</strong> ${formatDate(os.dataAbertura)}</p>
        </div>
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Cliente</h4>
            <p><strong>Nome:</strong> ${cliente?.nome || 'N/A'}</p>
            <p><strong>Endereço:</strong> ${cliente?.endereco || 'N/A'}</p>
        </div>
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Serviço</h4>
            <p><strong>Tipo:</strong> ${getTipoLabel(os.tipo)}</p>
            <p><strong>Descrição:</strong> ${os.descricao}</p>
            ${os.imagem ? `<p><strong>Imagem anexada:</strong> ${os.imagem}</p>` : ''}
        </div>
        <div class="form-group">
            <label>Designar Operacional</label>
            <select id="aprovarOpSelect">
                <option value="">Selecione o operacional</option>
                ${opcoes}
            </select>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
            <button class="btn btn-secondary" onclick="closeModal('aprovarModal')">Cancelar</button>
            <button class="btn btn-success" onclick="confirmarAprovacao(${os.id})">Confirmar Aprovação</button>
        </div>
    `;
    criarModal('aprovarModal', 'Aprovar Ordem de Serviço');
    document.getElementById('aprovarModalContent').innerHTML = detalhes;
    openModal('aprovarModal');
}

function confirmarAprovacao(id) {
    const opId = document.getElementById('aprovarOpSelect').value;
    if (!opId) {
        showToast('Selecione um operacional responsável antes de aprovar.', 'error');
        return;
    }
    const os = ordens.find(o => o.id === id);
    if (os) {
        os.status = 'em_execucao';
        os.executor = parseInt(opId);
        saveData();

        const op = usuarios.find(u => u.id === parseInt(opId));
        addNotification('OS aprovada', `A OS #${id} foi aprovada e designada a ${op ? op.nome : 'operacional'}.`, [os.autor]);
        addNotification('Nova OS atribuída', `A OS #${id} foi atribuída a você.`, [parseInt(opId)]);
        showToast(`OS #${id} aprovada e designada a ${op ? op.nome : 'operacional'}.`, 'success');

        closeModal('aprovarModal');
        refreshCurrentList();
    }
}

function negarOS(id) {
    const os = ordens.find(o => o.id === id);
    if (!os) return;
    const cliente = clientes.find(c => c.id === os.cliente);
    const detalhes = `
        <div style="margin-bottom:20px;">
            <p><strong>ID:</strong> #${os.id}</p>
            <p><strong>Abertura:</strong> ${formatDate(os.dataAbertura)}</p>
        </div>
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Cliente</h4>
            <p><strong>Nome:</strong> ${cliente?.nome || 'N/A'}</p>
            <p><strong>Endereço:</strong> ${cliente?.endereco || 'N/A'}</p>
        </div>
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Serviço</h4>
            <p><strong>Tipo:</strong> ${getTipoLabel(os.tipo)}</p>
            <p><strong>Descrição:</strong> ${os.descricao}</p>
            ${os.imagem ? `<p><strong>Imagem anexada:</strong> ${os.imagem}</p>` : ''}
        </div>
        <div class="form-group">
            <label>Motivo da Negação</label>
            <textarea id="negarMotivo" rows="4" required></textarea>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
            <button class="btn btn-secondary" onclick="closeModal('negarModal')">Cancelar</button>
            <button class="btn btn-danger" onclick="confirmarNegacao(${os.id})">Confirmar Negação</button>
        </div>
    `;
    criarModal('negarModal', 'Negar Ordem de Serviço');
    document.getElementById('negarModalContent').innerHTML = detalhes;
    openModal('negarModal');
}

function confirmarNegacao(id) {
    const motivo = document.getElementById('negarMotivo').value;
    if (!motivo) {
        showToast('Informe o motivo da negação.', 'error');
        return;
    }
    const os = ordens.find(o => o.id === id);
    if (os) {
        os.status = 'negado';
        os.motivoNegacao = motivo;
        os.dataConclusao = hoje();
        saveData();
        addNotification('OS negada', `A OS #${id} foi negada. Motivo: ${motivo}`, [os.autor]);
        showToast(`OS #${id} negada.`, 'error');
        closeModal('negarModal');
        refreshCurrentList();
    }
}

// Cancelamento de OS (Cliente)
function openCancelModal(id) {
    document.getElementById('cancelOSId').value = id;
    openModal('cancelModal');
}

function handleCancelarOS(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('cancelOSId').value);
    const motivo = document.getElementById('cancelMotivo').value;
    const os = ordens.find(o => o.id === id);

    if (!os) return;

    if (os.status !== 'em_aberto' && os.status !== 'pendente') {
        showToast('Esta OS não pode ser cancelada pois não está mais em aberto.', 'error');
        closeModal('cancelModal');
        return;
    }

    if (os.autor !== currentUser?.id) {
        showToast('Você não pode cancelar esta OS pois não foi o autor do pedido.', 'error');
        closeModal('cancelModal');
        return;
    }

    os.status = 'cancelado';
    os.motivoCancelamento = motivo;
    os.dataConclusao = hoje();
    saveData();
    addNotification('OS cancelada', `A OS #${id} foi cancelada. Motivo: ${motivo}`, getUserIdsByRole('administrativo'));
    closeModal('cancelModal');
    document.getElementById('cancelForm').reset();
    refreshCurrentList();
    showToast('Cancelamento solicitado com sucesso!', 'success');
}

// OP: Atualizar OS (modal com sucesso/falha, descrição e imagens)
function abrirModalAtualizar(id) {
    const os = ordens.find(o => o.id === id);
    if (!os) return;

    const modalId = 'atualizarOSModal';
    criarModal(modalId, 'Atualizar OS');

    document.getElementById(`${modalId}Content`).innerHTML = `
        <div class="modal-os-details">
            <p><strong>OS #${os.id}</strong></p>
            <p><strong>Cliente:</strong> ${getClienteNome(os.cliente)}</p>
            <p><strong>Tipo:</strong> ${getTipoLabel(os.tipo)}</p>
            <p><strong>Descrição:</strong> ${os.descricao || '-'}</p>
            <p><strong>Endereço:</strong> ${os.endereco || '-'}</p>
        </div>
        <form id="atualizarModalForm">
            <label>Resultado:</label>
            <select id="atualizarResultado" required>
                <option value="">Selecione</option>
                <option value="sucesso">Sucesso</option>
                <option value="falha">Falha</option>
            </select>
            <label>Descrição dos procedimentos:</label>
            <textarea id="atualizarDescricao" rows="4" required></textarea>
            <label>Anexo de imagens:</label>
            <div class="file-upload" onclick="document.getElementById('atualizarImagemInput').click()">
                <span>Clique para anexar imagem</span>
                <input type="file" id="atualizarImagemInput" accept="image/*" style="display:none">
            </div>
            <div id="atualizarImagensPreview" class="file-preview"></div>
            <div id="atualizarModalError" class="error-msg" style="display:none;margin-bottom:10px;"></div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:10px;">Confirmar Atualização</button>
            <button type="button" class="btn btn-secondary" style="width:100%;margin-top:5px;" onclick="closeModal('${modalId}')">Cancelar</button>
        </form>
    `;

    document.getElementById('atualizarImagemInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                document.getElementById('atualizarImagensPreview').innerHTML = `<img src="${ev.target.result}" style="max-width:100%;max-height:150px;border-radius:8px;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('atualizarModalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        setLoading(btn, true);

        const resultado = document.getElementById('atualizarResultado').value;
        const descricao = document.getElementById('atualizarDescricao').value;
        const fileInput = document.getElementById('atualizarImagemInput');
        const files = fileInput.files;
        const errorEl = document.getElementById('atualizarModalError');

        if (!resultado || !descricao) {
            errorEl.textContent = 'Preencha todos os campos obrigatórios.';
            errorEl.style.display = 'block';
            setLoading(btn, false);
            return;
        }

        lerImagemBase64(files[0]).then(imagemBase64 => {
            os.descricaoExecucao = descricao;
            os.imagensExecucao = imagemBase64 ? [imagemBase64] : [];
            os.status = resultado === 'sucesso' ? 'concluido' : 'falha';
            os.dataConclusao = hoje();

            saveData();
            const userIdCliente = getUserIdByClienteId(os.cliente);
            const destAtualizar = [os.autor, ...getUserIdsByRole('administrativo')];
            if (userIdCliente && !destAtualizar.includes(userIdCliente)) destAtualizar.push(userIdCliente);
            addNotification('OS atualizada', `A OS #${id} foi atualizada com status: ${resultado === 'sucesso' ? 'Concluído' : 'Falha'}.`, destAtualizar);

            setLoading(btn, false);
            closeModal(modalId);
            refreshCurrentList();
            showToast('OS atualizada com sucesso!', 'success');
        });
    });

    openModal(modalId);
}

// Solicitação de Serviço (com fluxo AC, anexo e confirmação)
function handleSolicitarServico(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setLoading(btn, true);

    const tipo = document.getElementById('solTipo').value;
    const descricao = document.getElementById('solDescricao').value;
    const fileInput = document.getElementById('solImagem');
    const isAC = currentRole === 'analista';
    const isAdmin = currentRole === 'administrativo';
    const podeReferenciar = isAC || isAdmin;

    if (!tipo || !descricao) {
        document.getElementById('solServicoError').textContent = 'Preencha todos os campos obrigatórios.';
        document.getElementById('solServicoError').style.display = 'block';
        setLoading(btn, false);
        return;
    }

    let clienteId = currentUser?.id || 1;
    let novoClienteData = null;

    if (podeReferenciar) {
        const possuiConta = document.getElementById('acClientePossuiConta').value;
        if (!possuiConta) {
            document.getElementById('solServicoError').textContent = 'Informe se o cliente possui conta.';
            document.getElementById('solServicoError').style.display = 'block';
            setLoading(btn, false);
            return;
        }
        if (possuiConta === 'sim') {
            clienteId = parseInt(document.getElementById('acRefCliente').value);
            if (!clienteId) {
                document.getElementById('solServicoError').textContent = 'Selecione o cliente.';
                document.getElementById('solServicoError').style.display = 'block';
                setLoading(btn, false);
                return;
            }
        } else {
            const nome = document.getElementById('acNovoClienteNome').value;
            const email = document.getElementById('acNovoClienteEmail').value;
            const cpf = document.getElementById('acNovoClienteCPF').value;
            if (!nome || !email || !cpf) {
                document.getElementById('solServicoError').textContent = 'Preencha os dados do novo cliente.';
                document.getElementById('solServicoError').style.display = 'block';
                setLoading(btn, false);
                return;
            }
            clienteId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
            novoClienteData = { id: clienteId, nome, documento: cpf, telefone: '', email, endereco: '' };
        }
    }

    lerImagemBase64(fileInput.files[0]).then(imagemBase64 => {
        setLoading(btn, false);

        let clienteNome;
        if (podeReferenciar && novoClienteData) {
            clienteNome = novoClienteData.nome;
        } else if (podeReferenciar) {
            clienteNome = getClienteNome(clienteId);
        } else {
            clienteNome = currentUser?.nome || 'N/A';
        }

        const modalId = 'confirmarSolicitacaoModal';
        criarModal(modalId, 'Confirmar Solicitação');
        document.getElementById(`${modalId}Content`).innerHTML = `
            <div style="margin-bottom:20px;">
                <p style="margin-bottom:8px;"><strong>Tipo de serviço:</strong> ${getTipoLabel(tipo)}</p>
                <p style="margin-bottom:8px;"><strong>Descrição:</strong> ${descricao}</p>
                <p style="margin-bottom:8px;"><strong>Cliente:</strong> ${clienteNome}</p>
                ${imagemBase64 ? `<p style="margin-bottom:8px;"><strong>Imagem anexada:</strong></p><img src="${imagemBase64}" style="max-width:200px;max-height:150px;border-radius:8px;margin-top:4px;object-fit:cover;">` : ''}
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid var(--gray);padding-top:16px;">
                <button class="btn btn-secondary" onclick="closeModal('${modalId}')">Cancelar</button>
                <button class="btn btn-success" id="confirmarEnvioBtn">Confirmar Envio</button>
            </div>
        `;

        document.getElementById('confirmarEnvioBtn').addEventListener('click', function() {
            closeModal(modalId);
            setLoading(btn, true);
            if (novoClienteData) clientes.push(novoClienteData);

            const newOS = {
                id: ordens.length > 0 ? Math.max(...ordens.map(o => o.id)) + 1 : 1,
                cliente: clienteId,
                tipo,
                descricao,
                imagem: imagemBase64,
                executor: null,
                status: isAC ? 'aprovacao' : 'pendente',
                autor: currentUser?.id || clienteId,
                dataAbertura: hoje(),
                dataConclusao: null
            };

            ordens.push(newOS);
            saveData();

            if (isAC) {
                addNotification('OS solicitada', `Uma nova OS #${newOS.id} foi solicitada e aguarda aprovação.`, getUserIdsByRole('administrativo'));
            } else if (isAdmin) {
                addNotification('OS registrada', `A OS #${newOS.id} foi criada e encaminhada.`, getUserIdsByRole('analista'));
            } else {
                addNotification('Solicitação enviada', `Sua solicitação #${newOS.id} foi recebida.`);
                addNotification('Nova OS recebida', `Uma nova OS #${newOS.id} foi solicitada por ${currentUser?.nome}.`, getUserIdsByRole('analista'));
            }

            document.getElementById('solServicoForm').reset();
            document.getElementById('solImagemPreview').style.display = 'none';
            document.getElementById('fileUploadArea').classList.remove('has-image');
            document.getElementById('solServicoError').style.display = 'none';
            setLoading(btn, false);
            refreshCurrentList();
            if (isAC) showToast('OS solicitada com sucesso! Aguarda aprovação.', 'success');
            else if (isAdmin) showToast('OS criada com sucesso!', 'success');
            else showToast('Solicitação enviada com sucesso!', 'success');
        });

        openModal(modalId);
    });
}

function detalhesUsuario(id) {
    const u = usuarios.find(user => user.id === id);
    if (!u) return;
    criarModal('detalhesUsuarioModal', 'Detalhes do Usuário');
    document.getElementById('detalhesUsuarioModalContent').innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;">
            <p><strong>Nome:</strong> ${u.nome}</p>
            <p><strong>E-mail:</strong> ${u.email}</p>
            <p><strong>CPF:</strong> ${u.cpf || '-'}</p>
            <p><strong>Cargo:</strong> ${roleLabel[u.tipo] || u.tipo}</p>
            ${u.tipo === 'cliente' ? `<p><strong>Telefone:</strong> ${u.telefone || '-'}</p><p><strong>Endereço:</strong> ${u.endereco || '-'}</p>` : ''}
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
            <button class="btn btn-secondary" onclick="closeModal('detalhesUsuarioModal')">Fechar</button>
        </div>
    `;
    openModal('detalhesUsuarioModal');
}

function viewOS(id) {
    const os = ordens.find(o => o.id === id);
    if (!os) return;
    const cliente = clientes.find(c => c.id === os.cliente);
    const executor = os.executor ? usuarios.find(u => u.id === os.executor) : null;

    const detalhes = `
        <div style="margin-bottom:20px;">
            <p><strong>ID:</strong> #${os.id}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${renderStatusBadgeClasse(os.status)}">${getStatusLabel(os.status)}</span></p>
            <p><strong>Abertura:</strong> ${formatDate(os.dataAbertura)}</p>
            ${os.dataConclusao ? `<p><strong>Conclusão:</strong> ${formatDate(os.dataConclusao)}</p>` : ''}
        </div>
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Cliente</h4>
            <p><strong>Nome:</strong> ${cliente?.nome || 'N/A'}</p>
            <p><strong>Endereço:</strong> ${cliente?.endereco || 'N/A'}</p>
        </div>
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Serviço</h4>
            <p><strong>Tipo:</strong> ${getTipoLabel(os.tipo)}</p>
            <p><strong>Descrição:</strong> ${os.descricao}</p>
            ${os.imagem ? `<p><strong>Imagem anexada:</strong> <img src="${os.imagem}" style="max-width:200px;display:block;margin-top:5px;border-radius:5px;"></p>` : ''}
            <p><strong>Executor:</strong> ${executor?.nome || 'Não atribuído'}</p>
        </div>
        ${os.descricaoExecucao ? `
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Execução</h4>
            <p><strong>Descrição:</strong> ${os.descricaoExecucao}</p>
            ${os.imagensExecucao?.length ? `<p><strong>Imagens:</strong></p>${os.imagensExecucao.map(img => `<img src="${img}" style="max-width:200px;display:block;margin-top:5px;border-radius:5px;">`).join('')}` : ''}
        </div>` : ''}
        ${os.motivoCancelamento ? `
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Cancelamento</h4>
            <p><strong>Motivo:</strong> ${os.motivoCancelamento}</p>
        </div>` : ''}
        ${os.motivoNegacao ? `
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--secondary);margin-bottom:10px;">Negação</h4>
            <p><strong>Motivo:</strong> ${os.motivoNegacao}</p>
        </div>` : ''}
        <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn btn-secondary" onclick="closeModal('osDetailModal')">Fechar</button>
        </div>
    `;

    criarModal('osDetailModal', 'Detalhes da OS');
    document.getElementById('osDetailModalContent').innerHTML = detalhes;
    openModal('osDetailModal');
}
