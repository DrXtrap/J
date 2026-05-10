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
  iframe.src = iframe.src;
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
  const youtubeComecou = data.event === 'infoDelivery' && data.info?.playerState === 1;

  if (spotifyComecou) {
    pararOutrosSpotify(e.source);
    pausarTodosYouTube();
  }

  if (youtubeComecou) {
    pausarOutrosYouTube(e.source);
    pararTodosSpotify();
  }
});
