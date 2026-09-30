// Elementos do DOM
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const loginStatusBadge = document.getElementById('loginStatusBadge');
const livenessBadge = document.getElementById('livenessBadge');
const hudReticle = document.getElementById('hudReticle');
const scanFeedback = document.getElementById('scanFeedback');
const livenessBanner = document.getElementById('livenessBanner');
const livenessInstruction = document.getElementById('livenessInstruction');
const livenessSubtext = document.getElementById('livenessSubtext');
const telemetryFace = document.getElementById('telemetryFace');
const telemetryBlink = document.getElementById('telemetryBlink');
const telemetryEAR = document.getElementById('telemetryEAR');
const telemetryUser = document.getElementById('telemetryUser');
const telemetryScore = document.getElementById('telemetryScore');
const btnManualMatch = document.getElementById('btnManualMatch');
const toast = document.getElementById('toast');

// Estados do Reconhecimento e Liveness
let isModelLoaded = false;
let isAuthenticating = false;
let isLivenessVerified = false;
let livenessMethod = '';
let currentDescriptor = null;

// Variáveis para Detecção de Piscar de Olhos (Eye Blink Detection)
let eyeWasClosed = false;
let blinkCount = 0;
let lastBlinkTime = 0;

// Exibir Toast
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `show ${type}`;
  setTimeout(() => { toast.className = ''; }, 4000);
}

// Cálculo da distância euclidiana 2D entre 2 marcos anatômicos
function dist2D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Cálculo da Razão de Aspecto do Olho (Eye Aspect Ratio - EAR)
// Baseado na fórmula de Soukupová & Čech (Real-Time Eye Blink Detection using Facial Landmarks)
function calcularEAR(landmarks) {
  // Olho Esquerdo: marcos 36 a 41
  const p36 = landmarks[36];
  const p37 = landmarks[37];
  const p38 = landmarks[38];
  const p39 = landmarks[39];
  const p40 = landmarks[40];
  const p41 = landmarks[41];

  const earEsquerdo = (dist2D(p37, p41) + dist2D(p38, p40)) / (2.0 * dist2D(p36, p39));

  // Olho Direito: marcos 42 a 47
  const p42 = landmarks[42];
  const p43 = landmarks[43];
  const p44 = landmarks[44];
  const p45 = landmarks[45];
  const p46 = landmarks[46];
  const p47 = landmarks[47];

  const earDireito = (dist2D(p43, p47) + dist2D(p44, p46)) / (2.0 * dist2D(p42, p45));

  return (earEsquerdo + earDireito) / 2.0;
}

// 1. Carregar Modelos da IA
async function carregarModelos() {
  try {
    loginStatusBadge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Carregando Redes Neurais...';
    loginStatusBadge.className = 'badge badge-amber';

    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);

    isModelLoaded = true;
    loginStatusBadge.innerHTML = '<i class="fa-solid fa-shield-check"></i> IA de Segurança Pronta';
    loginStatusBadge.className = 'badge badge-emerald';
    console.log('Modelos de reconhecimento e vivacidade prontos.');
    iniciarCamera();
  } catch (err) {
    console.warn('Tentando carregar modelos via CDN...', err);
    try {
      const CDN_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(CDN_URL)
      ]);
      isModelLoaded = true;
      loginStatusBadge.innerHTML = '<i class="fa-solid fa-shield-check"></i> IA Pronta (CDN)';
      loginStatusBadge.className = 'badge badge-emerald';
      iniciarCamera();
    } catch (cdnErr) {
      console.error('Falha crítica ao carregar modelos:', cdnErr);
      loginStatusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Erro nos Modelos';
      loginStatusBadge.className = 'badge badge-red';
      showToast('Erro ao carregar modelos de IA.', 'error');
    }
  }
}

// 2. Iniciar Câmera
async function iniciarCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: false
    });
    video.srcObject = stream;
  } catch (err) {
    console.error('Erro na câmera:', err);
    loginStatusBadge.innerHTML = '<i class="fa-solid fa-video-slash"></i> Câmera Offline';
    loginStatusBadge.className = 'badge badge-red';
    scanFeedback.textContent = 'Acesso à câmera não concedido.';
    showToast('Habilite a câmera para efetuar login.', 'error');
  }
}

// 3. Processamento de Vídeo em Tempo Real
video.addEventListener('play', () => {
  const displaySize = { width: video.videoWidth || 480, height: video.videoHeight || 360 };
  faceapi.matchDimensions(overlay, displaySize);

  setInterval(async () => {
    if (!isModelLoaded || video.paused || video.ended || isAuthenticating) return;

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
      const detection = await faceapi.detectSingleFace(video, options)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor();

      const ctx = overlay.getContext('2d');
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      if (detection) {
        const resized = faceapi.resizeResults(detection, displaySize);
        const landmarks = resized.landmarks.positions;
        const expressions = detection.expressions;

        // Desenhar landmarks com efeito cibernético
        ctx.fillStyle = isLivenessVerified ? '#10b981' : '#00f0ff';
        landmarks.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });

        // 1. Avaliar Detecção
        const score = Math.round(detection.detection.score * 100);
        telemetryFace.innerHTML = `<span style="color: var(--accent-emerald);">Face Alinhada (${score}% confiança)</span>`;
        currentDescriptor = Array.from(detection.descriptor);

        // 2. Métrica de Vivacidade (Anti-Spoofing): Cálculo do EAR e Expressões
        const ear = calcularEAR(landmarks);
        telemetryEAR.textContent = `EAR: ${ear.toFixed(2)}`;

        // Lógica de Piscar (Blink):
        // Olho normal: EAR > 0.26
        // Olho fechado: EAR < 0.21
        if (ear < 0.21) {
          eyeWasClosed = true;
        } else if (eyeWasClosed && ear > 0.25) {
          // Completou o ciclo: fechou e abriu os olhos!
          eyeWasClosed = false;
          blinkCount++;
          lastBlinkTime = Date.now();
          console.log(`Piscar detectado! Total: ${blinkCount}`);
        }

        // Lógica de Sorriso (Smile):
        const isSmiling = expressions && expressions.happy > 0.65;

        // Validação da Prova de Vida
        if (!isLivenessVerified) {
          if (blinkCount >= 1 || isSmiling) {
            isLivenessVerified = true;
            livenessMethod = isSmiling ? 'Expressão Facial (Sorriso)' : 'Piscamento Biológico (EAR)';
            
            // Atualizar UI para modo Aprovado
            livenessBadge.className = 'badge badge-emerald';
            livenessBadge.innerHTML = '<i class="fa-solid fa-shield-check"></i> Prova de Vida Aprovada!';
            
            livenessBanner.className = 'liveness-banner verified';
            livenessInstruction.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-emerald);"></i> Vivacidade Confirmada: ${livenessMethod}`;
            livenessSubtext.textContent = 'Autenticidade biológica verificada. Comparando vetor biométrico com a base...';
            
            telemetryBlink.innerHTML = `<span style="color: var(--accent-emerald); font-weight: 700;">Humano Real Confirmado (${livenessMethod})</span>`;
            hudReticle.className = 'hud-reticle active';
            scanFeedback.textContent = 'Identificando colaborador...';
            btnManualMatch.disabled = false;

            // Disparar autenticação automática imediata!
            executarAutenticacao();
          } else {
            // Ainda no estado pendente (Alerta contra Spoofing de Foto Impressa)
            hudReticle.className = 'hud-reticle warning';
            scanFeedback.textContent = 'Pisque os olhos ou sorria para provar vivacidade!';
            telemetryBlink.innerHTML = `<span style="color: var(--accent-amber);"><i class="fa-solid fa-triangle-exclamation"></i> Foto Estática? Pisque os olhos...</span>`;
          }
        }

      } else {
        // Nenhuma face
        telemetryFace.innerHTML = '<span style="color: var(--accent-red);">Nenhuma face detectada</span>';
        telemetryEAR.textContent = 'EAR: --';
        telemetryBlink.textContent = 'Aguardando presença humana...';
        hudReticle.className = 'hud-reticle';
        scanFeedback.textContent = 'Posicione o rosto em frente à lente.';
        currentDescriptor = null;
        btnManualMatch.disabled = true;
      }
    } catch (err) {
      console.error('Erro no loop de autenticação:', err);
    }
  }, 120);
});

// 4. Executar Autenticação Biométrica no Backend
async function executarAutenticacao() {
  if (isAuthenticating || !currentDescriptor || !isLivenessVerified) return;

  isAuthenticating = true;
  scanFeedback.textContent = 'Validando biometria no servidor...';
  loginStatusBadge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';
  loginStatusBadge.className = 'badge badge-amber';

  try {
    const res = await fetch('/api/auth/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descriptor: currentDescriptor,
        livenessVerified: true,
        livenessType: livenessMethod
      })
    });

    const data = await res.json();

    if (res.ok && data.authenticated) {
      // Sucesso!
      telemetryUser.textContent = data.usuario.nome;
      telemetryUser.style.color = 'var(--accent-emerald)';
      telemetryScore.textContent = `Distância Euclidiana: ${data.distancia} | Confiança: ${data.confianca}`;
      
      hudReticle.className = 'hud-reticle active';
      scanFeedback.textContent = `Acesso Autorizado! Olá, ${data.usuario.nome}`;
      scanFeedback.style.color = 'var(--accent-emerald)';
      loginStatusBadge.innerHTML = '<i class="fa-solid fa-lock-open"></i> Acesso Liberado';
      loginStatusBadge.className = 'badge badge-emerald';

      // Salvar token e dados no LocalStorage
      localStorage.setItem('visao_lince_token', data.token);
      localStorage.setItem('visao_lince_user', JSON.stringify(data.usuario));

      showToast(`Bem-vindo(a), ${data.usuario.nome}! Redirecionando para o Painel Secreto...`, 'success');

      setTimeout(() => {
        window.location.href = '/painel.html';
      }, 1500);

    } else {
      // Falha / Rosto não encontrado
      telemetryUser.textContent = 'Não Autorizado';
      telemetryUser.style.color = 'var(--accent-red)';
      telemetryScore.textContent = data.detalhesDistancia 
        ? `Distância: ${data.detalhesDistancia} (Acima da margem de segurança)` 
        : 'Face não consta na base.';

      hudReticle.className = 'hud-reticle danger';
      scanFeedback.textContent = 'Acesso Negado: Rosto não cadastrado!';
      scanFeedback.style.color = 'var(--accent-red)';
      loginStatusBadge.innerHTML = '<i class="fa-solid fa-ban"></i> Acesso Negado';
      loginStatusBadge.className = 'badge badge-red';

      showToast(data.error || 'Acesso negado. Face não reconhecida.', 'error');

      // Resetar após 3 segundos para permitir nova tentativa
      setTimeout(() => {
        isAuthenticating = false;
        isLivenessVerified = false;
        blinkCount = 0;
        livenessBadge.className = 'badge badge-amber';
        livenessBadge.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Prova de Vida Pendente';
        livenessBanner.className = 'liveness-banner';
        livenessInstruction.innerHTML = '<i class="fa-solid fa-bullseye" style="color: var(--accent-cyan);"></i> Desafio: Pisque os olhos ou Dê um sorriso';
        livenessSubtext.textContent = 'Proteção contra fotos impressas e telas.';
      }, 3000);
    }
  } catch (err) {
    console.error('Erro na requisição de autenticação:', err);
    showToast('Erro de comunicação com o servidor biométrico.', 'error');
    isAuthenticating = false;
  }
}

// Botão de Autenticação Manual
btnManualMatch.addEventListener('click', executarAutenticacao);

// Inicialização
window.addEventListener('DOMContentLoaded', carregarModelos);
