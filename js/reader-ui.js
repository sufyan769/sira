(function () {
  const personModal = document.getElementById('readerPersonModal');
  const placeModal = document.getElementById('readerPlaceModal');
  const tooltipEl = document.getElementById('readerTooltip');

  function openPersonModal(person) {
    if (!person) return;
    personModal.querySelector('#readerPersonImage').src = resolveImage(person.img, 'persons/default.png');
    personModal.querySelector('#readerPersonName').textContent = person.name || '—';
    personModal.querySelector('#readerPersonBio').textContent = person.full || person.short || '';
    personModal.classList.add('show');
  }

  function openPlaceModal(place) {
    if (!place) return;
    placeModal.querySelector('#readerPlaceImage').src = resolveImage(place.image, 'maps/example.png');
    placeModal.querySelector('#readerPlaceName').textContent = place.name || '—';
    placeModal.querySelector('#readerPlaceDesc').textContent = place.desc || '';
    placeModal.classList.add('show');
  }

  function resolveImage(path, fallback) {
    if (!path) return `images/${fallback}`;
    if (path.startsWith('http')) return path;
    return `images/${path}`;
  }

  function hideModal(modal) {
    modal?.classList.remove('show');
  }

  document.addEventListener('click', (event) => {
    if (event.target.matches('.modal')) hideModal(event.target);
  });

  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', () => hideModal(document.getElementById(btn.dataset.close)));
  });

  function showTooltip(text, position) {
    if (!tooltipEl) return;
    tooltipEl.textContent = text;
    tooltipEl.style.left = `${position.x}px`;
    tooltipEl.style.top = `${position.y}px`;
    tooltipEl.classList.remove('hidden');
  }

  function hideTooltip() {
    tooltipEl?.classList.add('hidden');
  }

  window.ReaderUI = {
    openPersonModal,
    openPlaceModal,
    showTooltip,
    hideTooltip
  };
})();
