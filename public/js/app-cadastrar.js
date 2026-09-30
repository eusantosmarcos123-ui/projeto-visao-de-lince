// Elementos do DOM
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const camStatusBadge = document.getElementById('camStatusBadge');
const fpsBadge = document.getElementById('fpsBadge');
const hudReticle = document.getElementById('hudReticle');
const guideText = document.getElementById('guideText');
const metricFace = document.getElementById('metricFace');
const metricConfidence = document.getElementById('metricConfidence');
const metricQuality = document.getElementById('metricQuality');
const formCadastro = document.getElementById('formCadastro');
const btnSalvar = document.getElementById('btnSalvar');
const checkLgpd = document.getElementById('checkLgpd');
const toast = document.getElementById('toast');

let currentDescriptor = null;
let isProcessing = false;
let isModelLoaded = false;
let lastFrameTime = performance.now();
let frameCount = 0;

// Exibir Toast Feedback
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `show ${type}`;
  setTimeout(() => {
    toast.className = '';
  }, 4000);
}

// 1. Carregar Modelos da IA
async function carregarModelos() {
  try {
    camStatusBadge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Carregando Redes Neurais...';
    camStatusBadge.className = 'badge badge-amber';

    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    isModelLoaded = true;
    camStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> IA Pronta';
    camStatusBadge.className = 'badge badge-emerald';
    console.log('Modelos carregados com sucesso.');
    iniciarCamera();
  } catch (err) {
    console.error('Falha ao carregar modelos locais, tentando CDN...', err);
    try {
      const CDN_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(CDN_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(CDN_URL)
      ]);
      isModelLoaded = true;
      camStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> IA Pronta (CDN)';
      camStatusBadge.className = 'badge badge-emerald';
      iniciarCamera();
    } catch (cdnErr) {
      console.error('Falha crítica ao carregar modelos:', cdnErr);
      camStatusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Erro nos Modelos';
      camStatusBadge.className = 'badge badge-red';
      showToast('Erro ao carregar modelos de IA. Verifique sua conexão.', 'error');
    }
  }
}

// 2. Iniciar Câmera do Usuário
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
    console.error('Erro ao acessar webcam:', err);
    camStatusBadge.innerHTML = '<i class="fa-solid fa-video-slash"></i> Câmera Indisponível';
    camStatusBadge.className = 'badge badge-red';
    guideText.textContent = 'Permissão de webcam negada ou câmera não detectada.';
    showToast('Acesso à webcam recusado. Habilite a câmera para cadastrar.', 'error');
  }
}

// 3. Loop de Detecção Facial e Extração de Pontos
video.addEventListener('play', () => {
  const displaySize = { width: video.videoWidth || 480, height: video.videoHeight || 360 };
  faceapi.matchDimensions(overlay, displaySize);

  setInterval(async () => {
    if (!isModelLoaded || video.paused || video.ended) return;

    // Calcular FPS
    frameCount++;
    const now = performance.now();
    if (now - lastFrameTime >= 1000) {
      fpsBadge.textContent = `FPS: ${frameCount}`;
      frameCount = 0;
      lastFrameTime = now;
    }

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
      const detection = await faceapi.detectSingleFace(video, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      const context = overlay.getContext('2d');
      context.clearRect(0, 0, overlay.width, overlay.height);

      if (detection) {
        const resizedDetections = faceapi.resizeResults(detection, displaySize);

        // Desenhar landmarks na tela com cor ciano futurista
        const landmarks = resizedDetections.landmarks;
        const ctx = overlay.getContext('2d');
        ctx.fillStyle = '#00f0ff';
        landmarks.positions.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Avaliar score e centralização
        const score = Math.round(detection.detection.score * 100);
        metricFace.textContent = 'Detectado';
        metricFace.style.color = 'var(--accent-emerald)';
        metricConfidence.textContent = `${score}%`;
        metricConfidence.style.color = score > 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)';

        if (score >= 75) {
          metricQuality.textContent = 'Excelente (128-D OK)';
          metricQuality.style.color = 'var(--accent-emerald)';
          hudReticle.className = 'hud-reticle active';
          guideText.textContent = 'Face alinhada perfeitamente. Pronto para capturar!';
          currentDescriptor = Array.from(detection.descriptor);
          
          if (checkLgpd.checked) {
            btnSalvar.disabled = false;
          }
        } else {
          metricQuality.textContent = 'Baixo Contraste / Distante';
          metricQuality.style.color = 'var(--accent-amber)';
          hudReticle.className = 'hud-reticle warning';
          guideText.textContent = 'Aproxime-se e melhore a iluminação.';
          btnSalvar.disabled = true;
          currentDescriptor = null;
        }

      } else {
        metricFace.textContent = 'Não detectado';
        metricFace.style.color = 'var(--accent-red)';
        metricConfidence.textContent = '0%';
        metricQuality.textContent = 'Sem Leitura';
        metricQuality.style.color = 'var(--text-muted)';
        hudReticle.className = 'hud-reticle';
        guideText.textContent = 'Posicione seu rosto dentro da marcação circular.';
        btnSalvar.disabled = true;
        currentDescriptor = null;
      }

    } catch (loopErr) {
      console.error('Erro no loop de detecção:', loopErr);
    }
  }, 120);
});

// Listener do Checkbox LGPD
checkLgpd.addEventListener('change', () => {
  btnSalvar.disabled = !(checkLgpd.checked && currentDescriptor);
});

// 4. Submissão do Formulário de Cadastro
formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentDescriptor) {
    showToast('Aguarde a detecção estável do seu rosto antes de salvar.', 'warning');
    return;
  }

  if (!checkLgpd.checked) {
    showToast('Você precisa aceitar os termos de consentimento da LGPD.', 'warning');
    return;
  }

  const payload = {
    nome: document.getElementById('nome').value.trim(),
    matricula: document.getElementById('matricula').value.trim(),
    cargo: document.getElementById('cargo').value,
    departamento: document.getElementById('departamento').value.trim(),
    descriptor: currentDescriptor,
    aceitouTermos: true
  };

  btnSalvar.disabled = true;
  btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Criptografando e Registrando...';

  try {
    const res = await fetch('/api/usuarios/cadastrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      showToast(`Sucesso! ${data.usuario.nome} cadastrado com biometria facial!`, 'success');
      btnSalvar.innerHTML = '<i class="fa-solid fa-check"></i> Cadastro Concluído!';
      btnSalvar.style.background = 'var(--accent-emerald)';

      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1800);
    } else {
      showToast(data.error || 'Erro ao salvar cadastro.', 'error');
      btnSalvar.disabled = false;
      btnSalvar.innerHTML = '<i class="fa-solid fa-camera-retro"></i> Capturar e Salvar Biometria';
    }
  } catch (err) {
    console.error('Erro ao enviar cadastro:', err);
    showToast('Erro de comunicação com o servidor.', 'error');
    btnSalvar.disabled = false;
    btnSalvar.innerHTML = '<i class="fa-solid fa-camera-retro"></i> Capturar e Salvar Biometria';
  }
});

// Inicia aplicação
window.addEventListener('DOMContentLoaded', carregarModelos);
