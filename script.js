const carrossel = document.getElementById('yt-carrossel');
const btnEsq = document.getElementById('yt-esq');
const btnDir = document.getElementById('yt-dir');

function scrollSuave(destino) {
  const inicio = carrossel.scrollLeft;
  const distancia = destino - inicio;
  const duracao = 600;
  let startTime = null;
  function animar(timestamp) {
    if (!startTime) startTime = timestamp;
    const ease = 1 - Math.pow(1 - Math.min((timestamp - startTime) / duracao, 1), 3);
    carrossel.scrollLeft = inicio + distancia * ease;
    if (timestamp - startTime < duracao) requestAnimationFrame(animar);
  }
  requestAnimationFrame(animar);
}

function atualizarSetas() {
  const noInicio = carrossel.scrollLeft <= 4;
  const noFim = carrossel.scrollLeft + carrossel.clientWidth >= carrossel.scrollWidth - 4;

  btnEsq.style.opacity = noInicio ? '0' : '1';
  btnEsq.style.pointerEvents = noInicio ? 'none' : 'auto';

  btnDir.style.opacity = noFim ? '0' : '1';
  btnDir.style.pointerEvents = noFim ? 'none' : 'auto';
}

btnDir.addEventListener('click', () => {
  const item = carrossel.querySelector('.yt-item');
  scrollSuave(carrossel.scrollLeft + item.offsetWidth + 24);
  setTimeout(atualizarSetas, 650);
});

btnEsq.addEventListener('click', () => {
  const item = carrossel.querySelector('.yt-item');
  scrollSuave(carrossel.scrollLeft - item.offsetWidth - 24);
  setTimeout(atualizarSetas, 650);
});

carrossel.addEventListener('scroll', atualizarSetas);
atualizarSetas();

/* PARAR MÍDIA AO TROCAR */

document.querySelectorAll('iframe[src*="youtube.com/embed"]').forEach(function(iframe) {
  if (!iframe.src.includes('enablejsapi')) {
    iframe.src += (iframe.src.includes('?') ? '&' : '?') + 'enablejsapi=1';
  }
});

window.addEventListener('message', function(e) {
  var data;
  try { data = JSON.parse(e.data); } catch(err) { return; }

  if (data.type === 'playback_update' && data.payload && !data.payload.isPaused) {
    document.querySelectorAll('iframe[src*="spotify"]').forEach(function(iframe) {
      if (iframe.contentWindow !== e.source) {
        iframe.src = iframe.src;
      }
    });
  }

  if (data.event === 'infoDelivery' && data.info && data.info.playerState === 1) {
    document.querySelectorAll('iframe[src*="youtube"]').forEach(function(iframe) {
      if (iframe.contentWindow !== e.source) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*'
        );
      }
    });
  }
});
