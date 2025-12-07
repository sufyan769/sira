(function () {
  const personModal = document.getElementById('personModal');
  const placeModal = document.getElementById('placeModal');
  const eventModal = document.getElementById('eventModal');
  const importExportModal = document.getElementById('importExportModal');
  const tooltipEl = document.getElementById('tooltip');

  let personSaveHandler = null;
  let placeSaveHandler = null;
  let eventSaveHandler = null;
  let importHandler = null;
  let exportHandler = null;

  function openPersonModal(person, handler) {
    if (!personModal) return;
    personSaveHandler = handler || null;
    personModal.querySelector('#personImage').src = resolveImage(person?.img, 'persons/default.png');
    personModal.querySelector('#personNameInput').value = person?.name || '';
    personModal.querySelector('#personShortInput').value = person?.short || '';
    personModal.querySelector('#personFullInput').value = person?.full || '';
    personModal.querySelector('#personImageInput').value = person?.img || '';
    personModal.classList.add('show');
  }

  function openPlaceModal(place, handler) {
    if (!placeModal) return;
    placeSaveHandler = handler || null;
    placeModal.querySelector('#placeImage').src = resolveImage(place?.image, 'maps/example.png');
    placeModal.querySelector('#placeNameInput').value = place?.name || '';
    placeModal.querySelector('#placeDescInput').value = place?.desc || '';
    placeModal.querySelector('#placeImageInput').value = place?.image || '';
    placeModal.classList.add('show');
  }

  function openEventModal(event, handler) {
    if (!eventModal) return;
    eventSaveHandler = handler || null;
    document.getElementById('eventIdInput').value = event?.id || '';
    document.getElementById('eventTitleInput').value = event?.title || '';
    document.getElementById('eventYearInput').value = event?.year ?? '';
    document.getElementById('eventOrderInput').value = event?.order ?? '';
    document.getElementById('eventTagsInput').value = (event?.tags || []).join(', ');
    document.getElementById('eventNotesInput').value = event?.notes || '';
    const source = event?.sources?.[0] || {};
    document.getElementById('eventSourceBookInput').value = source.book || '';
    document.getElementById('eventSourceTextInput').value = source.text || '';
    eventModal.classList.add('show');
  }

  function openImportExportModal(data, { onImport, onExport } = {}) {
    if (!importExportModal) return;
    importHandler = onImport || null;
    exportHandler = onExport || null;
    document.getElementById('importExportTextarea').value = data || '';
    importExportModal.classList.add('show');
  }

  function resolveImage(path, fallback) {
    if (!path) return `images/${fallback}`;
    if (path.startsWith('http')) {
      return path;
    }
    return `images/${path}`;
  }

  function hideModal(modal) {
    modal?.classList.remove('show');
  }

  document.addEventListener('click', (event) => {
    if (event.target.matches('.modal')) {
      hideModal(event.target);
    }
  });

  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.close;
      if (id) {
        hideModal(document.getElementById(id));
      }
    });
  });

  document.getElementById('savePersonBtn')?.addEventListener('click', () => {
    if (typeof personSaveHandler === 'function') {
      personSaveHandler({
        name: document.getElementById('personNameInput').value.trim(),
        short: document.getElementById('personShortInput').value.trim(),
        full: document.getElementById('personFullInput').value.trim(),
        img: document.getElementById('personImageInput').value.trim()
      });
    }
  });

  document.getElementById('savePlaceBtn')?.addEventListener('click', () => {
    if (typeof placeSaveHandler === 'function') {
      placeSaveHandler({
        name: document.getElementById('placeNameInput').value.trim(),
        desc: document.getElementById('placeDescInput').value.trim(),
        image: document.getElementById('placeImageInput').value.trim()
      });
    }
  });

  document.getElementById('saveEventModalBtn')?.addEventListener('click', () => {
    if (typeof eventSaveHandler === 'function') {
      eventSaveHandler({
        id: document.getElementById('eventIdInput').value.trim(),
        title: document.getElementById('eventTitleInput').value.trim(),
        year: document.getElementById('eventYearInput').value ? Number(document.getElementById('eventYearInput').value) : null,
        order: document.getElementById('eventOrderInput').value ? Number(document.getElementById('eventOrderInput').value) : null,
        tags: document.getElementById('eventTagsInput').value
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes: document.getElementById('eventNotesInput').value.trim(),
        source: {
          book: document.getElementById('eventSourceBookInput').value.trim(),
          text: document.getElementById('eventSourceTextInput').value.trim()
        }
      });
    }
  });

  document.getElementById('importDataBtn')?.addEventListener('click', () => {
    if (typeof importHandler === 'function') {
      importHandler(document.getElementById('importExportTextarea').value);
    }
  });

  document.getElementById('exportDataBtn')?.addEventListener('click', () => {
    if (typeof exportHandler === 'function') {
      exportHandler();
    }
  });

  function showTooltip(text, position) {
    if (!tooltipEl || !text) return;
    tooltipEl.textContent = text;
    tooltipEl.style.left = `${position.x}px`;
    tooltipEl.style.top = `${position.y}px`;
    tooltipEl.classList.remove('hidden');
  }

  function hideTooltip() {
    tooltipEl?.classList.add('hidden');
  }

  window.UI = {
    openPersonModal,
    openPlaceModal,
    openEventModal,
    openImportExportModal,
    showTooltip,
    hideTooltip,
    closeModal: hideModal,
    resolveImage
  };
})();
