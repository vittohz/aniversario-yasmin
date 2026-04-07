/* ==============================================
   BIRTHDAY SITE - script.js
   Responsável por:
   1. Criar as pétalas flutuantes
   2. Controlar a abertura da mensagem
   3. Tocar / pausar a música
   ============================================== */

/* ── Configurações fáceis de ajustar ──────────── */
const CONFIG = {
  petalCount: 18,          // número de pétalas na tela
  petalEmojis: ['🌸', '✿', '🌷', '✦', '❀'],   // símbolos flutuantes
  petalMinSize: 0.9,       // rem (tamanho mínimo)
  petalMaxSize: 1.6,       // rem (tamanho máximo)
  petalMinDuration: 8,     // segundos (mais lento)
  petalMaxDuration: 18,    // segundos (mais rápido)
  paragraphDelay: 0.18,    // segundos entre cada parágrafo ao revelar
};
/* ────────────────────────────────────────────── */


/* ==============================================
   1. PÉTALAS FLUTUANTES
   ============================================== */
function createPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  for (let i = 0; i < CONFIG.petalCount; i++) {
    const petal = document.createElement('span');
    petal.classList.add('petal');

    // Símbolo aleatório
    const emoji = CONFIG.petalEmojis[Math.floor(Math.random() * CONFIG.petalEmojis.length)];
    petal.textContent = emoji;

    // Posição horizontal aleatória
    const leftPercent = Math.random() * 100;
    petal.style.left = `${leftPercent}%`;

    // Tamanho aleatório
    const size = CONFIG.petalMinSize + Math.random() * (CONFIG.petalMaxSize - CONFIG.petalMinSize);
    petal.style.fontSize = `${size}rem`;

    // Duração e delay aleatórios para distribuição natural
    const duration = CONFIG.petalMinDuration + Math.random() * (CONFIG.petalMaxDuration - CONFIG.petalMinDuration);
    const delay    = Math.random() * -CONFIG.petalMaxDuration; // delay negativo = já começou
    petal.style.animationDuration  = `${duration}s`;
    petal.style.animationDelay     = `${delay}s`;

    // Opacidade base variada
    petal.style.opacity = (0.4 + Math.random() * 0.4).toString();

    container.appendChild(petal);
  }
}


/* ==============================================
   2. ABERTURA DA MENSAGEM
   ============================================== */
function initOpenButton() {
  const openBtn        = document.getElementById('open-btn');
  const envelopeScreen = document.getElementById('envelope-screen');
  const messageScreen  = document.getElementById('message-screen');

  if (!openBtn || !envelopeScreen || !messageScreen) return;

  openBtn.addEventListener('click', () => {
    // Desabilita o botão para evitar clique duplo
    openBtn.disabled = true;

    // Fade-out da tela do envelope
    envelopeScreen.classList.remove('active');

    // Após a transição do envelope, mostra a mensagem
    const envelopeDuration = 900; // ms – deve coincidir com a transição CSS
    setTimeout(() => {
      messageScreen.classList.add('active');

      // Aplica delays escalonados nos parágrafos para entrada suave
      applyParagraphDelays();

      // Toca a música
      playMusic();
    }, envelopeDuration);
  });
}

/* Escalonamento dos parágrafos */
function applyParagraphDelays() {
  const paragraphs = document.querySelectorAll('.letter-body p');
  paragraphs.forEach((p, index) => {
    // Delay base de 0.4s + incremento por parágrafo
    const delay = 0.4 + index * CONFIG.paragraphDelay;
    p.style.transitionDelay = `${delay}s`;
  });

  // A assinatura entra por último
  const sign = document.querySelector('.letter-sign');
  if (sign) {
    const signDelay = 0.4 + paragraphs.length * CONFIG.paragraphDelay + 0.1;
    sign.style.transitionDelay = `${signDelay}s`;
  }
}


/* ==============================================
   3. CONTROLE DE MÚSICA
   ============================================== */
function playMusic() {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  // Tenta reproduzir (pode ser bloqueado pelo browser se não houver interação)
  audio.volume = 0;
  audio.play().then(() => {
    // Fade-in do volume para uma entrada suave
    fadeAudioIn(audio, 0.55, 2000);
  }).catch(() => {
    // Silenciosamente falha se o browser bloquear – o botão ainda funciona
    console.info('Autoplay bloqueado: o usuário pode clicar em "pausar música" para iniciar.');
  });
}

/* Fade-in gradual do áudio */
function fadeAudioIn(audio, targetVolume, durationMs) {
  const steps    = 40;
  const interval = durationMs / steps;
  const increment = targetVolume / steps;
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    audio.volume = Math.min(targetVolume, increment * currentStep);
    if (currentStep >= steps) clearInterval(timer);
  }, interval);
}

function initMusicButton() {
  const musicBtn   = document.getElementById('music-btn');
  const musicIcon  = document.getElementById('music-icon');
  const musicLabel = document.getElementById('music-label');
  const audio      = document.getElementById('bg-music');

  if (!musicBtn || !audio) return;

  let isPlaying = true; // presume que vai tocar ao abrir

  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      // Pausar
      audio.pause();
      musicIcon.textContent  = '♩';
      musicLabel.textContent = 'tocar música';
      musicBtn.classList.add('paused');
      isPlaying = false;
    } else {
      // Retomar
      audio.play().catch(() => {});
      musicIcon.textContent  = '♪';
      musicLabel.textContent = 'pausar música';
      musicBtn.classList.remove('paused');
      isPlaying = true;
    }
  });
}


/* ==============================================
   INICIALIZAÇÃO
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
  createPetals();
  initOpenButton();
  initMusicButton();
});
