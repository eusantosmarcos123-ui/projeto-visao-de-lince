const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));
app.use('/models', express.static(path.join(__dirname, 'public', 'models')));

// Diretórios e arquivos de banco de dados
const DB_DIR = path.join(__dirname, 'database');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const LOGS_FILE = path.join(DB_DIR, 'access_logs.json');

// Garante que o diretório e os arquivos existam
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(LOGS_FILE)) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
}

// Helpers para leitura e escrita no banco JSON
function getUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler users.json:', err);
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function getLogs() {
  try {
    const data = fs.readFileSync(LOGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler access_logs.json:', err);
    return [];
  }
}

function saveLog(logEntry) {
  const logs = getLogs();
  logs.unshift(logEntry); // mais recente primeiro
  // Manter no máximo 100 registros
  if (logs.length > 100) logs.pop();
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

// Armazenamento em memória de sessões ativas
const activeSessions = new Map();

// Helper: Cálculo de Distância Euclidiana entre 2 vetores de 128 dimensões
function calcularDistanciaEuclidiana(vetorA, vetorB) {
  if (!vetorA || !vetorB || vetorA.length !== vetorB.length) return Infinity;
  let soma = 0;
  for (let i = 0; i < vetorA.length; i++) {
    const diff = vetorA[i] - vetorB[i];
    soma += diff * diff;
  }
  return Math.sqrt(soma);
}

// ================= ROTAS DA API =================

// 1. Status do Sistema
app.get('/api/status', (req, res) => {
  const users = getUsers();
  const logs = getLogs();
  res.json({
    status: 'ONLINE',
    sistema: 'Visão de Lince - HealthTech Biometric Access Control',
    totalUsuariosCadastrados: users.length,
    totalLogsRegistrados: logs.length,
    lgpdCompliance: 'Ativo (Princípio da Minimização: apenas descritores 128D, zero fotos)',
    antiSpoofing: 'Ativo (Prova de Vida / Liveness Detection)'
  });
});

// 2. Cadastro Facial de Usuário
app.post('/api/usuarios/cadastrar', (req, res) => {
  try {
    const { nome, matricula, cargo, departamento, descriptor, aceitouTermos } = req.body;

    // Validações
    if (!nome || !matricula || !cargo) {
      return res.status(400).json({ error: 'Nome, matrícula e cargo são obrigatórios.' });
    }

    if (!aceitouTermos) {
      return res.status(400).json({ 
        error: 'Conformidade LGPD: É obrigatório aceitar os termos de consentimento biométrico para prosseguir.' 
      });
    }

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ 
        error: 'Descritor biométrico inválido. A face precisa conter o vetor matemático de 128 dimensões.' 
      });
    }

    const users = getUsers();

    // Checar duplicidade por matrícula
    const existente = users.find(u => u.matricula.toLowerCase() === matricula.trim().toLowerCase());
    if (existente) {
      return res.status(409).json({ error: `A matrícula ${matricula} já está cadastrada no laboratório.` });
    }

    // Criar registro de usuário
    // IMPORTANTE: NÃO salvamos imagens (PNG/JPG), salvamos APENAS o vetor numérico (LGPD Art. 6º, III)
    const novoUsuario = {
      id: 'colab_' + crypto.randomUUID().slice(0, 8),
      nome: nome.trim(),
      matricula: matricula.trim().toUpperCase(),
      cargo: cargo.trim(),
      departamento: departamento ? departamento.trim() : 'Pesquisa Clínica',
      descriptor: descriptor, // Vetor numérico 128D
      criadoEm: new Date().toISOString(),
      lgpd: {
        consentimentoDado: true,
        dataHora: new Date().toISOString(),
        finalidade: 'Prevenção à fraude e controle de acesso biométrico estrito (LGPD Art. 11, II, g)',
        armazenamentoFoto: false // Prova de conformidade
      }
    };

    users.push(novoUsuario);
    saveUsers(users);

    // Log de auditoria do cadastro
    saveLog({
      id: 'log_' + crypto.randomUUID().slice(0, 8),
      tipo: 'CADASTRO_BIOMETRICO',
      usuarioId: novoUsuario.id,
      nome: novoUsuario.nome,
      matricula: novoUsuario.matricula,
      dataHora: new Date().toISOString(),
      status: 'SUCESSO',
      detalhes: 'Descritor 128D registrado com termo LGPD assinado digitalmente.'
    });

    return res.status(201).json({
      success: true,
      message: 'Colaborador cadastrado com sucesso!',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        matricula: novoUsuario.matricula,
        cargo: novoUsuario.cargo
      }
    });

  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    return res.status(500).json({ error: 'Erro interno ao processar cadastro biométrico.' });
  }
});

// 3. Autenticação Facial com Prova de Vida
app.post('/api/auth/verificar', (req, res) => {
  try {
    const { descriptor, livenessVerified, livenessType } = req.body;

    // Validação da Prova de Vida (Anti-Spoofing)
    if (!livenessVerified) {
      saveLog({
        id: 'log_' + crypto.randomUUID().slice(0, 8),
        tipo: 'TENTATIVA_SPOOFING',
        dataHora: new Date().toISOString(),
        status: 'BLOQUEADO',
        detalhes: 'Tentativa de login sem validação de prova de vida (Possível foto impressa / tela estática).'
      });

      return res.status(403).json({
        authenticated: false,
        error: 'Prova de vida não confirmada! O sistema bloqueou a tentativa contra ataque de foto impressa (Spoofing).'
      });
    }

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ error: 'Descritor biométrico da câmera inválido.' });
    }

    const users = getUsers();
    if (users.length === 0) {
      return res.status(404).json({
        authenticated: false,
        error: 'Nenhum colaborador cadastrado no sistema. Cadastre-se primeiro!'
      });
    }

    // Limiar de reconhecimento facial:
    // Distância euclidiana típica no face-api.js:
    // < 0.45 = Correspondência quase idêntica (mesma pessoa)
    // 0.45 - 0.55 = Correspondência segura
    // > 0.60 = Pessoas diferentes
    const LIMIAR_MAXIMO = 0.52;

    let melhorCorrespondencia = null;
    let menorDistancia = Infinity;

    for (const usuario of users) {
      const distancia = calcularDistanciaEuclidiana(descriptor, usuario.descriptor);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        melhorCorrespondencia = usuario;
      }
    }

    if (melhorCorrespondencia && menorDistancia <= LIMIAR_MAXIMO) {
      // Confiança estimada baseada na distância
      const confianca = Math.max(75, Math.min(99.9, ((1 - menorDistancia / 0.6) * 100))).toFixed(1);

      // Gerar Token de Sessão Secreta
      const token = crypto.randomBytes(32).toString('hex');
      activeSessions.set(token, {
        usuarioId: melhorCorrespondencia.id,
        nome: melhorCorrespondencia.nome,
        cargo: melhorCorrespondencia.cargo,
        matricula: melhorCorrespondencia.matricula,
        departamento: melhorCorrespondencia.departamento,
        expiraEm: Date.now() + 2 * 60 * 60 * 1000 // 2 horas
      });

      // Registrar Log de Acesso
      saveLog({
        id: 'log_' + crypto.randomUUID().slice(0, 8),
        tipo: 'LOGIN_BIOMETRICO',
        usuarioId: melhorCorrespondencia.id,
        nome: melhorCorrespondencia.nome,
        matricula: melhorCorrespondencia.matricula,
        cargo: melhorCorrespondencia.cargo,
        dataHora: new Date().toISOString(),
        distanciaEuclidiana: menorDistancia.toFixed(4),
        confianca: `${confianca}%`,
        provaDeVida: `Aprovada (${livenessType || 'Interativa'})`,
        status: 'ACESSO_LIBERADO'
      });

      return res.json({
        authenticated: true,
        token: token,
        confianca: `${confianca}%`,
        distancia: menorDistancia.toFixed(4),
        usuario: {
          id: melhorCorrespondencia.id,
          nome: melhorCorrespondencia.nome,
          matricula: melhorCorrespondencia.matricula,
          cargo: melhorCorrespondencia.cargo,
          departamento: melhorCorrespondencia.departamento
        }
      });
    } else {
      // Não reconhecido
      saveLog({
        id: 'log_' + crypto.randomUUID().slice(0, 8),
        tipo: 'ACESSO_RECUSADO',
        dataHora: new Date().toISOString(),
        distanciaEuclidiana: menorDistancia === Infinity ? 'N/A' : menorDistancia.toFixed(4),
        status: 'FALHA_RECONHECIMENTO',
        detalhes: 'Rosto não coincide com nenhum colaborador cadastrado ou distância euclidiana acima da margem segura.'
      });

      return res.status(401).json({
        authenticated: false,
        error: 'Rosto não identificado ou sem autorização para a área confidencial.',
        detalhesDistancia: menorDistancia === Infinity ? null : menorDistancia.toFixed(4)
      });
    }

  } catch (err) {
    console.error('Erro na autenticação biométrica:', err);
    return res.status(500).json({ error: 'Erro interno ao processar login biométrico.' });
  }
});

// Middleware de verificação de sessão
function verificarAutenticacao(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso negado: Token de sessão biométrica ausente.' });
  }

  const token = authHeader.split(' ')[1];
  const sessao = activeSessions.get(token);

  if (!sessao || Date.now() > sessao.expiraEm) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Sessão expirada ou inválida. Faça login novamente via biometria.' });
  }

  req.usuarioSessao = sessao;
  next();
}

// 4. Painel Secreto do Laboratório (Área Restrita HealthTech)
app.get('/api/painel-secreto', verificarAutenticacao, (req, res) => {
  const logs = getLogs();
  
  // Dados confidenciais do laboratório de pesquisas clínicas
  const dadosLaboratorio = {
    sessaoAtiva: req.usuarioSessao,
    nivelSeguranca: 'NÍVEL 4 (BIOSSEGURANÇA MÁXIMA)',
    projetosConfidenciais: [
      {
        codigo: 'HT-GEN-902',
        titulo: 'Terapia Gênica CRISPR para Regeneração Celular',
        status: 'FASE III CLÍNICA',
        responsavel: 'Dra. Elena Vasconcelos',
        sigilo: 'ULTRASSECRETO'
      },
      {
        codigo: 'HT-VAC-104',
        titulo: 'Imunizante de Amplo Espectro com Nanopartículas Lipídicas',
        status: 'VALIDAÇÃO EM AUDITORIA',
        responsavel: 'Dr. Roberto Lins',
        sigilo: 'RESTRITO'
      },
      {
        codigo: 'HT-BIO-550',
        titulo: 'Contenção Biológica e Isolamento de Patógenos Raros',
        status: 'ATIVO - MONITORAMENTO 24/7',
        responsavel: 'Equipe de Biossegurança',
        sigilo: 'CRÍTICO'
      }
    ],
    statusAmbiente: {
      pressaoNegativa: 'NORMAL (-15 Pa)',
      temperaturaFreezerUlt: '-82.4 ºC',
      filtroHEPA: 'EFICIÊNCIA 99.99%',
      travaBiometricaPortas: 'BLOQUEADA (ACESSO SOMENTE VISÃO DE LINCE)'
    },
    ultimosAcessos: logs.slice(0, 10)
  };

  res.json(dadosLaboratorio);
});

// 5. Consulta de Logs de Auditoria
app.get('/api/auditoria', (req, res) => {
  res.json(getLogs());
});

// 6. Direito do Titular LGPD: Exclusão de Biometria (Art. 18)
app.delete('/api/usuarios/:id', (req, res) => {
  try {
    const { id } = req.params;
    let users = getUsers();
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const removido = users.splice(index, 1)[0];
    saveUsers(users);

    saveLog({
      id: 'log_' + crypto.randomUUID().slice(0, 8),
      tipo: 'REVOGACAO_LGPD',
      usuarioId: removido.id,
      nome: removido.nome,
      dataHora: new Date().toISOString(),
      status: 'EXCLUIDO',
      detalhes: 'Dados biométricos excluídos a pedido do titular conforme Art. 18 da LGPD.'
    });

    res.json({
      success: true,
      message: `Dados biométricos do colaborador ${removido.nome} foram eliminados definitivamente do banco de dados.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar revogação de dados.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 PROJETO VISÃO DE LINCE - RECONHECIMENTO FACIAL HEALTHTECH`);
  console.log(`📡 Servidor ativo na porta: http://localhost:${PORT}`);
  console.log(`🔒 Conformidade LGPD: Ativa (Zero fotos armazenadas)`);
  console.log(`🛡️  Proteção Anti-Spoofing: Ativa (Prova de Vida / Liveness)`);
  console.log('========================================================');
});
