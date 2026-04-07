/* ==============================================
   BIRTHDAY SITE - script.js
   ============================================== */

/* ── ✏️ TROQUE AQUI O ID DO VÍDEO DO YOUTUBE ──
   Como pegar o ID:
   No link https://www.youtube.com/watch?v=XXXXXXXXXXX
   o ID é a parte após "v=" → XXXXXXXXXXX
   ──────────────────────────────────────────── */
const YOUTUBE_VIDEO_ID = 'DnGdoEa1tPg'; 

/* ── Configurações gerais ────────────────────── */
const CONFIG = {
  /* Pétalas */
  petalCount:       18,
  petalEmojis:      ['🌸', '✿', '🌷', '✦', '❀'],
  petalMinSize:     0.9,   // rem
  petalMaxSize:     1.6,   // rem
  petalMinDuration: 8,     // segundos
  petalMaxDuration: 18,    // segundos

  /* Typewriter */
  titleSpeed:     55,   // ms por caractere no título
  bodySpeed:      28,   // ms por caractere nos parágrafos
  pauseBetween:   600,  // ms de pausa entre parágrafos
};
/* ────────────────────────────────────────────── */


/* ==============================================
   1. YOUTUBE PLAYER
   A função onYouTubeIframeAPIReady é chamada
   automaticamente pela API do YouTube quando
   o script carrega.
   ============================================== */
let ytPlayer = null;
let musicReady = false;
let shouldPlayOnReady = false;

// Chamada automática pela API do YouTube
window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      loop: 1,
      playlist: YOUTUBE_VIDEO_ID, // necessário para loop funcionar
    },
    events: {
      onReady: () => {
        musicReady = true;
        ytPlayer.setVolume(0);
        if (shouldPlayOnReady) startMusic();
      },
    },
  });
};

function startMusic() {
  if (!ytPlayer || !musicReady) {
    shouldPlayOnReady = true; // toca assim que ficar pronto
    return;
  }
  ytPlayer.playVideo();
  fadeVolumeIn(55, 1500); // volume alvo: 55, fade em 1500ms
}

/* Fade-in suave do volume */
function fadeVolumeIn(targetVol, durationMs) {
  const steps    = 30;
  const interval = durationMs / steps;
  const increment = targetVol / steps;
  let step = 0;
  const timer = setInterval(() => {
    step++;
    ytPlayer.setVolume(Math.min(targetVol, increment * step));
    if (step >= steps) clearInterval(timer);
  }, interval);
}


/* ==============================================
   2. PÉTALAS FLUTUANTES
   ============================================== */
function createPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  for (let i = 0; i < CONFIG.petalCount; i++) {
    const el = document.createElement('span');
    el.classList.add('petal');
    el.textContent = CONFIG.petalEmojis[Math.floor(Math.random() * CONFIG.petalEmojis.length)];

    el.style.left             = `${Math.random() * 100}%`;
    const size                = CONFIG.petalMinSize + Math.random() * (CONFIG.petalMaxSize - CONFIG.petalMinSize);
    el.style.fontSize         = `${size}rem`;
    const dur                 = CONFIG.petalMinDuration + Math.random() * (CONFIG.petalMaxDuration - CONFIG.petalMinDuration);
    el.style.animationDuration = `${dur}s`;
    el.style.animationDelay   = `${Math.random() * -CONFIG.petalMaxDuration}s`; // já começou

    container.appendChild(el);
  }
}


/* ==============================================
   3. TYPEWRITER ENGINE
   ============================================== */

/**
 * Digita um texto dentro de um elemento, caractere por caractere.
 * Mantém um cursor piscante durante a digitação.
 * Retorna uma Promise que resolve quando terminar.
 */
function typeText(element, text, speed) {
  return new Promise((resolve) => {
    // Limpa o conteúdo atual e cria o cursor
    element.textContent = '';
    const cursor = document.createElement('span');
    cursor.classList.add('typewriter-cursor');
    element.appendChild(cursor);

    let index = 0;

    function typeChar() {
      if (index < text.length) {
        // Insere o caractere antes do cursor
        cursor.insertAdjacentText('beforebegin', text[index]);
        index++;
        setTimeout(typeChar, speed);
      } else {
        // Digitação concluída: remove cursor e resolve
        cursor.remove();
        resolve();
      }
    }

    typeChar();
  });
}

/**
 * Digita todos os parágrafos [data-typewriter] em sequência.
 * Cada parágrafo só começa depois que o anterior terminar.
 */
async function typeAllParagraphs() {
  const paragraphs = document.querySelectorAll('[data-typewriter]');

  for (const p of paragraphs) {
    const originalText = p.dataset.originalText; // salvo antes de limpar
    p.classList.add('typing'); // torna visível

    await typeText(p, originalText, CONFIG.bodySpeed);

    // Pequena pausa antes do próximo parágrafo
    await pause(CONFIG.pauseBetween);
  }

  // Após todos os parágrafos, mostra o controle de música
  showMusicControl();
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/* ==============================================
   4. SEQUÊNCIA DE ABERTURA
   ============================================== */
function initOpenButton() {
  const openBtn        = document.getElementById('open-btn');
  const envelopeScreen = document.getElementById('envelope-screen');
  const messageScreen  = document.getElementById('message-screen');
  const titleEl        = document.getElementById('letter-title-text');
  const ornament       = document.getElementById('ornament');

  if (!openBtn || !envelopeScreen || !messageScreen) return;

  // Salva o texto original de cada parágrafo (antes de qualquer manipulação)
  document.querySelectorAll('[data-typewriter]').forEach(p => {
    p.dataset.originalText = p.textContent.trim().replace(/\s+/g, ' ');
    p.textContent = ''; // limpa para começar vazio
  });

  // Salva e limpa o título
  const titleText = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : '';
  if (titleEl) titleEl.textContent = '';

  openBtn.addEventListener('click', () => {
    openBtn.disabled = true;

    // 1. Fade-out da tela do envelope
    envelopeScreen.classList.remove('active');

    setTimeout(async () => {
      // 2. Fade-in da tela da mensagem
      messageScreen.classList.add('active');

      // 3. Inicia música
      startMusic();

      // 4. Aguarda o card aparecer antes de digitar
      await pause(700);

      // 5. Digita o título
      if (titleEl && titleText) {
        await typeText(titleEl, titleText, CONFIG.titleSpeed);
        await pause(400);
      }

      // 6. Mostra o ornamento
      if (ornament) ornament.classList.add('visible');
      await pause(350);

      // 7. Digita os parágrafos
      await typeAllParagraphs();

    }, 900); // duração do fade-out do envelope
  });
}

function showMusicControl() {
  const control = document.getElementById('music-control');
  if (control) control.classList.add('visible');
}


/* ==============================================
   5. CONTROLE DE MÚSICA (botão pausar/tocar)
   ============================================== */
function initMusicButton() {
  const btn   = document.getElementById('music-btn');
  const icon  = document.getElementById('music-icon');
  const label = document.getElementById('music-label');
  if (!btn) return;

  let playing = true;

  btn.addEventListener('click', () => {
    if (!ytPlayer || !musicReady) return;

    if (playing) {
      ytPlayer.pauseVideo();
      icon.textContent  = '♩';
      label.textContent = 'tocar música';
      btn.classList.add('paused');
    } else {
      ytPlayer.playVideo();
      icon.textContent  = '♪';
      label.textContent = 'pausar música';
      btn.classList.remove('paused');
    }
    playing = !playing;
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
