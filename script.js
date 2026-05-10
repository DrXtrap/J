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
