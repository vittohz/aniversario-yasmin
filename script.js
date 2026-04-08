/* ==============================================
   BIRTHDAY SITE — script.js
   Responsável por:
   1. Criar as partículas flutuantes
   2. Controlar a abertura da mensagem
   3. Tocar / pausar a música
   4. Controlar o vinil animado
   ============================================== */

/* ── Configurações fáceis de ajustar ──────────── */
const CONFIG = {
  /* Partículas flutuantes */
  petalCount:       20,
  petalEmojis:      ['🥀', '✦', '✧', '·', '°'],  // símbolos dark
  petalMinSize:     0.65,  // rem
  petalMaxSize:     1.2,   // rem
  petalMinDuration: 10,    // segundos (lento)
  petalMaxDuration: 22,    // segundos (rápido)

  /* Carta */
  paragraphDelay:   0.16,  // segundos entre parágrafos

  /* Música */
  targetVolume:     0.55,
  fadeInDuration:   2500,  // ms
};
/* ────────────────────────────────────────────── */


/* ==============================================
   1. PARTÍCULAS FLUTUANTES
   ============================================== */
function createPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  for (let i = 0; i < CONFIG.petalCount; i++) {
    const petal = document.createElement('span');
    petal.classList.add('petal');

    const emoji = CONFIG.petalEmojis[Math.floor(Math.random() * CONFIG.petalEmojis.length)];
    petal.textContent = emoji;

    petal.style.left             = `${Math.random() * 100}%`;
    petal.style.fontSize         = `${CONFIG.petalMinSize + Math.random() * (CONFIG.petalMaxSize - CONFIG.petalMinSize)}rem`;

    const duration = CONFIG.petalMinDuration + Math.random() * (CONFIG.petalMaxDuration - CONFIG.petalMinDuration);
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay   = `${Math.random() * -CONFIG.petalMaxDuration}s`;  // já iniciado

    petal.style.opacity = (0.2 + Math.random() * 0.55).toString();

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
    openBtn.disabled = true;

    /* Fade-out da tela do envelope */
    envelopeScreen.classList.remove('active');

    /* Após transição, mostra a mensagem */
    setTimeout(() => {
      messageScreen.classList.add('active');
      applyParagraphDelays();
      playMusic();
    }, 950); // ms — deve ser maior que a transição CSS (1s)
  });
}

/* Escalonamento dos parágrafos e assinatura */
function applyParagraphDelays() {
  const paragraphs = document.querySelectorAll('.letter-body p:not(.letter-sign)');
  paragraphs.forEach((p, index) => {
    const delay = 0.5 + index * CONFIG.paragraphDelay;
    p.style.transitionDelay = `${delay}s`;
  });

  /* Divisor */
  const divider = document.querySelector('.letter-divider');
  if (divider) {
    divider.style.transitionDelay = `${0.5 + paragraphs.length * CONFIG.paragraphDelay}s`;
  }

  /* Assinatura */
  const sign = document.querySelector('.letter-sign');
  if (sign) {
    const signDelay = 0.5 + (paragraphs.length + 1) * CONFIG.paragraphDelay + 0.1;
    sign.style.transitionDelay = `${signDelay}s`;
    /* Garantir que a assinatura também anima */
    sign.style.opacity   = '0';
    sign.style.transform = 'translateY(16px)';
    sign.style.transition = `opacity 0.75s ease ${signDelay}s, transform 0.75s ease ${signDelay}s`;

    /* Força reflow antes de adicionar classe ativa */
    requestAnimationFrame(() => {
      sign.style.opacity   = '1';
      sign.style.transform = 'translateY(0)';
    });
  }
}


/* ==============================================
   3. CONTROLE DE MÚSICA
   ============================================== */
function playMusic() {
  const audio = document.getElementById('bg-music');
  if (!audio) return;

  audio.volume = 0;
  audio.play()
    .then(() => {
      fadeAudioIn(audio, CONFIG.targetVolume, CONFIG.fadeInDuration);
      setPlayerState(true);
    })
    .catch(() => {
      /* Autoplay bloqueado — aguarda clique do usuário no player */
      console.info('Autoplay bloqueado. O usuário pode iniciar pelo player.');
      setPlayerState(false);
    });
}

function fadeAudioIn(audio, targetVolume, durationMs) {
  const steps     = 50;
  const interval  = durationMs / steps;
  const increment = targetVolume / steps;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    audio.volume = Math.min(targetVolume, parseFloat((increment * step).toFixed(4)));
    if (step >= steps) clearInterval(timer);
  }, interval);
}

function initMusicButton() {
  const musicBtn = document.getElementById('music-btn');
  const audio    = document.getElementById('bg-music');

  if (!musicBtn || !audio) return;

  let isPlaying = false;

  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      setPlayerState(false);
      isPlaying = false;
    } else {
      audio.play().catch(() => {});
      setPlayerState(true);
      isPlaying = true;
    }
  });

  /* Sincroniza quando o áudio para por conta própria (raro com loop) */
  audio.addEventListener('play',  () => { isPlaying = true;  setPlayerState(true);  });
  audio.addEventListener('pause', () => { isPlaying = false; setPlayerState(false); });
}


/* ==============================================
   4. VINIL ANIMADO + UI DO PLAYER
   ============================================== */
function setPlayerState(playing) {
  const disc       = document.getElementById('vinyl-disc');
  const needle     = document.querySelector('.vinyl-needle');
  const statusDot  = document.getElementById('status-dot');
  const statusLbl  = document.getElementById('status-label');
  const musicIcon  = document.getElementById('music-icon');

  if (!disc) return;

  if (playing) {
    disc.classList.add('spinning');
    needle && needle.classList.add('on-groove');
    statusDot  && statusDot.classList.add('playing');
    if (statusLbl) statusLbl.textContent = 'tocando agora';
    if (musicIcon) musicIcon.textContent = '⏸';
  } else {
    disc.classList.remove('spinning');
    needle && needle.classList.remove('on-groove');
    statusDot  && statusDot.classList.remove('playing');
    if (statusLbl) statusLbl.textContent = 'pausado';
    if (musicIcon) musicIcon.textContent = '▶';
  }
}


/* ==============================================
   INICIALIZAÇÃO
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
  createPetals();
  initOpenButton();
  initMusicButton();
  /* Player começa na tela de mensagem mas inicia oculto via CSS */
});
