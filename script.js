const carrossel = document.getElementById('yt-carrossel');

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

document.getElementById('yt-dir').addEventListener('click', () => {
  const item = carrossel.querySelector('.yt-item');
  scrollSuave(carrossel.scrollLeft + item.offsetWidth + 24);
});

document.getElementById('yt-esq').addEventListener('click', () => {
  const item = carrossel.querySelector('.yt-item');
  scrollSuave(carrossel.scrollLeft - item.offsetWidth - 24);
});
