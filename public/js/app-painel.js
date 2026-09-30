const token = localStorage.getItem('visao_lince_token');
const userJson = localStorage.getItem('visao_lince_user');

const userNome = document.getElementById('userNome');
const userCargo = document.getElementById('userCargo');
const userMatricula = document.getElementById('userMatricula');
const userDepto = document.getElementById('userDepto');
const sensorPressao = document.getElementById('sensorPressao');
const sensorTemp = document.getElementById('sensorTemp');
const sensorFiltro = document.getElementById('sensorFiltro');
const sensorPortas = document.getElementById('sensorPortas');
const tabelaProjetos = document.getElementById('tabelaProjetos');
const tabelaLogs = document.getElementById('tabelaLogs');
const btnLogout = document.getElementById('btnLogout');
const btnRevogarLgpd = document.getElementById('btnRevogarLgpd');
const toast = document.getElementById('toast');

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `show ${type}`;
  setTimeout(() => { toast.className = ''; }, 4000);
}

// 1. Verificação de Sessão Inicial
if (!token) {
  window.location.href = '/login.html';
}

let currentUser = null;
if (userJson) {
  try {
    currentUser = JSON.parse(userJson);
    userNome.textContent = currentUser.nome;
    userCargo.textContent = `Cargo: ${currentUser.cargo}`;
    userMatricula.textContent = `Matrícula: ${currentUser.matricula}`;
    userDepto.textContent = `Depto: ${currentUser.departamento || 'Pesquisa Clínica'}`;
  } catch (e) {
    console.error('Erro ao ler usuário salvo:', e);
  }
}

// 2. Carregar Dados Confidenciais do Painel Secreto
async function carregarPainel() {
  try {
    const res = await fetch('/api/painel-secreto', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      localStorage.removeItem('visao_lince_token');
      localStorage.removeItem('visao_lince_user');
      window.location.href = '/login.html';
      return;
    }

    const data = await res.json();

    // Atualizar Telemetria
    sensorPressao.textContent = data.statusAmbiente.pressaoNegativa;
    sensorTemp.textContent = data.statusAmbiente.temperaturaFreezerUlt;
    sensorFiltro.textContent = data.statusAmbiente.filtroHEPA;
    sensorPortas.textContent = data.statusAmbiente.travaBiometricaPortas;

    // Atualizar Tabela de Projetos Confidenciais
    tabelaProjetos.innerHTML = data.projetosConfidenciais.map(proj => `
      <tr>
        <td><strong style="color: var(--accent-cyan); font-family: monospace;">${proj.codigo}</strong></td>
        <td><strong>${proj.titulo}</strong></td>
        <td><span class="badge badge-emerald">${proj.status}</span></td>
        <td>${proj.responsavel}</td>
        <td><span class="badge badge-amber">${proj.sigilo}</span></td>
      </tr>
    `).join('');

    // Atualizar Tabela de Auditoria
    if (data.ultimosAcessos && data.ultimosAcessos.length > 0) {
      tabelaLogs.innerHTML = data.ultimosAcessos.map(log => {
        const dataFormatada = new Date(log.dataHora).toLocaleString('pt-BR');
        let statusBadge = 'badge-cyan';
        if (log.status === 'ACESSO_LIBERADO') statusBadge = 'badge-emerald';
        if (log.status === 'BLOQUEADO' || log.status === 'FALHA_RECONHECIMENTO') statusBadge = 'badge-red';
        if (log.status === 'EXCLUIDO') statusBadge = 'badge-amber';

        return `
          <tr>
            <td style="font-family: monospace; font-size: 0.8rem;">${dataFormatada}</td>
            <td><strong style="color: #fff;">${log.tipo}</strong></td>
            <td>${log.nome || 'Não identificado'}</td>
            <td>${log.provaDeVida || 'N/A'}</td>
            <td style="font-family: monospace;">${log.distanciaEuclidiana ? log.distanciaEuclidiana : '--'}</td>
            <td><span class="badge ${statusBadge}">${log.status}</span></td>
          </tr>
        `;
      }).join('');
    } else {
      tabelaLogs.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhum log registrado ainda.</td></tr>`;
    }

  } catch (err) {
    console.error('Erro ao carregar dados do painel:', err);
    showToast('Erro ao carregar informações da área restrita.', 'error');
  }
}

// 3. Revogação de Dados Biométricos (Art. 18 LGPD)
btnRevogarLgpd.addEventListener('click', async () => {
  if (!currentUser || !currentUser.id) {
    showToast('Identificador de usuário não encontrado.', 'error');
    return;
  }

  const confirma = confirm(
    `Atenção: Você está exercendo seu direito de titular (LGPD Art. 18).\n\nConfirma a exclusão definitiva do seu vetor biométrico dos registros deste laboratório?\n\nApós a exclusão, você perderá o acesso facial a esta área restrita.`
  );

  if (!confirma) return;

  btnRevogarLgpd.disabled = true;
  btnRevogarLgpd.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Excluindo Biometria...';

  try {
    const res = await fetch(`/api/usuarios/${currentUser.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      alert(`LGPD Art. 18: ${data.message}`);
      localStorage.removeItem('visao_lince_token');
      localStorage.removeItem('visao_lince_user');
      window.location.href = '/';
    } else {
      showToast(data.error || 'Erro ao excluir biometria.', 'error');
      btnRevogarLgpd.disabled = false;
      btnRevogarLgpd.innerHTML = '<i class="fa-solid fa-trash-can"></i> Excluir Meus Dados Biométricos (LGPD Art. 18)';
    }
  } catch (err) {
    console.error('Erro ao revogar dados:', err);
    showToast('Falha na comunicação com o servidor.', 'error');
    btnRevogarLgpd.disabled = false;
  }
});

// 4. Logout
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('visao_lince_token');
  localStorage.removeItem('visao_lince_user');
  window.location.href = '/login.html';
});

// Inicializar
carregarPainel();
