// Nuvens: direção aleatória, velocidade lenta, sem buracos no céu
(function(){
  const dir   = Math.random() < 0.5 ? 'left' : 'right';
  const total = 10;
  const sky   = document.querySelector('.sky');
  const srcs  = ['imagens/nuvem1.webp', 'imagens/nuvem2.webp'];

  // Adiciona nuvens extras até chegar em total
  const existentes = document.querySelectorAll('.nuvem-svg').length;
  for (let i = existentes; i < total; i++) {
    const img = document.createElement('img');
    img.className = 'nuvem-svg';
    img.src = srcs[i % srcs.length];
    img.alt = '';
    sky.appendChild(img);
  }

  // Aplica tamanho, posição vertical e animação em todas
  document.querySelectorAll('.nuvem-svg').forEach((el, i) => {
    const dur   = 300 + Math.random() * 60;          // 300–360s (bem devagar)
    const width = 350 + Math.random() * 260;          // 350–610px
    const top   = Math.random() * 78;                 // 0–78% da altura
    const delay = -(i * dur / total);                 // espaçamento uniforme sem buraco

    el.style.width               = width + 'px';
    el.style.top                 = top + '%';
    el.style.animationName       = 'float-' + dir;
    el.style.animationDuration   = dur + 's';
    el.style.animationDelay      = delay + 's';
  });
})();

const DURACAO_SCROLL = 600;
const TOLERANCIA_SCROLL = 4;
const GAP_CARROSSEL = 24;

const carrossel = document.getElementById('yt-carrossel');
const btnEsq = document.getElementById('yt-esq');
const btnDir = document.getElementById('yt-dir');

function animarScroll(destino) {
  const inicio = carrossel.scrollLeft;
  const distancia = destino - inicio;
  let startTime = null;

  function passo(timestamp) {
    if (!startTime) startTime = timestamp;
    const progresso = Math.min((timestamp - startTime) / DURACAO_SCROLL, 1);
    carrossel.scrollLeft = inicio + distancia * (1 - Math.pow(1 - progresso, 3));
    if (progresso < 1) requestAnimationFrame(passo);
  }

  requestAnimationFrame(passo);
}

function setSeta(seta, visivel) {
  seta.style.opacity = visivel ? '1' : '0';
  seta.style.pointerEvents = visivel ? 'auto' : 'none';
}

function atualizarSetas() {
  setSeta(btnEsq, carrossel.scrollLeft > TOLERANCIA_SCROLL);
  setSeta(btnDir, carrossel.scrollLeft + carrossel.clientWidth < carrossel.scrollWidth - TOLERANCIA_SCROLL);
}

function larguraItem() {
  return carrossel.querySelector('.yt-item').offsetWidth + GAP_CARROSSEL;
}

btnDir.addEventListener('click', () => animarScroll(carrossel.scrollLeft + larguraItem()));
btnEsq.addEventListener('click', () => animarScroll(carrossel.scrollLeft - larguraItem()));

carrossel.addEventListener('scroll', atualizarSetas);
atualizarSetas();

// Controle de mídia: só uma fonte toca por vez

function iframesYouTube() {
  return [...document.querySelectorAll('iframe[src*="youtube"]')];
}

function iframesSpotify() {
  return [...document.querySelectorAll('iframe[src*="spotify"]')];
}

function enviarPauseYouTube(iframe) {
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*'
  );
}

function recarregarIframe(iframe) {
  const src = iframe.src;
  iframe.src = '';
  requestAnimationFrame(() => { iframe.src = src; });
}

function pausarOutrosYouTube(janelaTocando) {
  iframesYouTube().filter(i => i.contentWindow !== janelaTocando).forEach(enviarPauseYouTube);
}

function pausarTodosYouTube() {
  iframesYouTube().forEach(enviarPauseYouTube);
}

function pararOutrosSpotify(janelaTocando) {
  iframesSpotify().filter(i => i.contentWindow !== janelaTocando).forEach(recarregarIframe);
}

function pararTodosSpotify() {
  iframesSpotify().forEach(recarregarIframe);
}

window.addEventListener('message', (e) => {
  let data;
  try { data = JSON.parse(e.data); } catch { return; }

  const spotifyComecou = data.type === 'playback_update' && data.payload && !data.payload.isPaused;
  const youtubeComecou =
    (data.event === 'infoDelivery' && data.info?.playerState === 1) ||
    (data.event === 'onStateChange' && data.info === 1);

  if (spotifyComecou) {
    pararOutrosSpotify(e.source);
    pausarTodosYouTube();
  }

  if (youtubeComecou) {
    pausarOutrosYouTube(e.source);
    pararTodosSpotify();
  }
});

// ─── LAZY LOAD FOTOS ───

const observadorFotos = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    const wrap = entrada.target;
    const img = wrap.querySelector('img');
    if (!img) return;

    function marcarCarregada() {
      img.classList.add('loaded');
      wrap.classList.add('loaded');
    }

    if (img.complete && img.naturalWidth > 0) {
      marcarCarregada();
    } else {
      img.addEventListener('load', marcarCarregada, { once: true });
    }

    observadorFotos.unobserve(wrap);
  });
}, { rootMargin: '150px' });

document.querySelectorAll('.fotos-grid .foto-wrap').forEach((wrap) => {
  observadorFotos.observe(wrap);
});
