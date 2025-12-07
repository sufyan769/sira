(function () {
  const YEAR_RANGE = { start: -53, end: 12 };
  const eventTitleEl = document.getElementById('eventTitle');
  const timelineEl = document.getElementById('timeline');
  const sourceTabsEl = document.getElementById('sourceTabs');
  const searchInputEl = document.getElementById('globalSearch');
  const searchResultsEl = document.getElementById('globalResults');
  const addEventBtn = document.getElementById('addEventBtn');
  const manageBiosBtn = document.getElementById('manageBiosBtn');
  const managePlacesBtn = document.getElementById('managePlacesBtn');
  const importExportBtn = document.getElementById('importExportBtn');
  const manualSaveBtn = document.getElementById('manualSaveBtn');
  const addSourceBtn = document.getElementById('addSourceBtn');
  const removeSourceBtn = document.getElementById('removeSourceBtn');
  const eventTextEditor = document.getElementById('eventTextEditor');
  const eventTextPreview = document.getElementById('eventTextPreview');
  const sourceBookInput = document.getElementById('sourceBookInput');
  const saveSourceBookBtn = document.getElementById('saveSourceBookBtn');
  const sourcePanelTitle = document.getElementById('sourcePanelTitle');
  const sourceModalEl = document.getElementById('sourceModal');
  const newSourceTitleInput = document.getElementById('sourceTitleInput');
  const newSourceTextInput = document.getElementById('sourceTextInput');
  const saveNewSourceBtn = document.getElementById('saveNewSourceBtn');
  const importExportTextarea = document.getElementById('importExportTextarea');
  const eventFormEl = document.querySelector('.event-form');
  const formEventIdInput = document.getElementById('formEventId');
  const formEventTitleInput = document.getElementById('formEventTitle');
  const formEventYearInput = document.getElementById('formEventYear');
  const saveEventFormBtn = document.getElementById('saveEventFormBtn');
  const clearEventFormBtn = document.getElementById('clearEventFormBtn');
  const loadEventFormBtn = document.getElementById('loadSelectedEventBtn');

  const formAutoSaveInputs = [formEventIdInput, formEventTitleInput, formEventYearInput];

  const state = {
    data: DataStore.loadData(),
    currentEventId: null,
    currentSourceIndex: 0,
    pendingInsert: null
  };
  window.addEventListener('data-store:remote-updated', () => {
    applyRemoteData();
  });

  let formAutoSaveTimer = null;

  function init() {
    SmartLinks.initSmartLinks(eventTextPreview);
    SmartLinks.onPersonClick((person) => {
      UI.openPersonModal(person, savePersonFromModal);
    });
    SmartLinks.onPlaceClick((place) => {
      UI.openPlaceModal(place, savePlaceFromModal);
    });
    ensureEventOrdering();
    buildTimeline();
    bindActions();
    if (state.data.events.length) {
      selectEvent(state.data.events[0].id);
    }
  }

  function bindActions() {
    addEventBtn?.addEventListener('click', () => {
      prepareNewEventForm();
    });
    manageBiosBtn?.addEventListener('click', () => {
      UI.openPersonModal({}, savePersonFromModal);
    });
    managePlacesBtn?.addEventListener('click', () => {
      UI.openPlaceModal({}, savePlaceFromModal);
    });
    importExportBtn?.addEventListener('click', () => {
      const json = JSON.stringify(state.data, null, 2);
      UI.openImportExportModal(json, {
        onImport: importDataFromModal,
        onExport: exportDataToTextarea
      });
    });
    manualSaveBtn?.addEventListener('click', () => {
      DataStore.saveData();
      alert('تم حفظ البيانات.');
    });
    addSourceBtn?.addEventListener('click', openAddSourceModal);
    removeSourceBtn?.addEventListener('click', removeCurrentSource);
    eventTextEditor?.addEventListener('input', handleTextInput);
    saveSourceBookBtn?.addEventListener('click', saveSourceBookName);
    saveNewSourceBtn?.addEventListener('click', saveNewSourceFromModal);
    searchInputEl?.addEventListener('input', handleSearchInput);
    saveEventFormBtn?.addEventListener('click', () => handleEventFormSave());
    clearEventFormBtn?.addEventListener('click', () => clearEventForm());
    loadEventFormBtn?.addEventListener('click', loadCurrentEventIntoForm);
    formAutoSaveInputs.forEach((input) => {
      input?.addEventListener('input', scheduleEventFormAutoSave);
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.header-search')) {
        hideSearchResults();
      }
    });
  }

  function buildTimeline() {
    timelineEl.innerHTML = '';
    const grouped = new Map();
    state.data.events.forEach((event) => {
      const year = typeof event.year === 'number' ? event.year : 'غير محدد';
      if (!grouped.has(year)) grouped.set(year, []);
      grouped.get(year).push(event);
    });
    let sectionCounter = 0;
    for (let year = YEAR_RANGE.start; year <= YEAR_RANGE.end; year += 1) {
      sectionCounter += 1;
      renderYearSection(year, grouped.get(year) || [], sectionCounter);
      grouped.delete(year);
    }
    const extraKeys = [...grouped.keys()].sort((a, b) => {
      if (a === 'غير محدد') return 1;
      if (b === 'غير محدد') return -1;
      return Number(a) - Number(b);
    });
    extraKeys.forEach((key) => {
      sectionCounter += 1;
      renderYearSection(key, grouped.get(key) || [], sectionCounter);
    });
    highlightActiveEvent();
  }

  function renderYearSection(yearKey, events, sectionCounter) {
    const group = document.createElement('div');
    group.className = 'year-group';
    const label = document.createElement('div');
    label.className = 'year-label';
    label.textContent = `${sectionCounter}. ${formatYearLabel(yearKey)}`;
    group.appendChild(label);
    const list = (events || []).slice().sort(compareEventsWithinYear);
    if (!list.length && typeof yearKey === 'number') {
      const placeholder = document.createElement('div');
      placeholder.className = 'event-item placeholder';
      const text = document.createElement('div');
      text.textContent = 'لا أحداث بعد في هذه السنة.';
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.textContent = 'إضافة حدث هنا';
      addBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        prepareInsertForYear(yearKey);
      });
      placeholder.appendChild(text);
      placeholder.appendChild(addBtn);
      group.appendChild(placeholder);
    } else {
      list.forEach((evt, index) => {
        const item = document.createElement('div');
        item.className = 'event-item';
        item.dataset.id = evt.id;
        const titleEl = document.createElement('div');
        titleEl.className = 'event-item-title';
        titleEl.textContent = `${sectionCounter}.${index + 1} ${evt.title}`;
        titleEl.addEventListener('click', () => selectEvent(evt.id));
        item.appendChild(titleEl);
        const controls = document.createElement('div');
        controls.className = 'event-order-controls';
        controls.appendChild(createControlButton('↑', () => moveEvent(evt.id, -1), index === 0));
        controls.appendChild(
          createControlButton('↓', () => moveEvent(evt.id, 1), index === list.length - 1)
        );
        controls.appendChild(createControlButton('إضافة قبل', () => prepareInsertBefore(evt)));
        controls.appendChild(createControlButton('إضافة بعد', () => prepareInsertAfter(evt)));
        controls.appendChild(createControlButton('حذف', () => deleteEvent(evt.id)));
        item.appendChild(controls);
        item.addEventListener('click', () => selectEvent(evt.id));
        group.appendChild(item);
      });
    }
    timelineEl.appendChild(group);
  }

  function formatYearLabel(yearKey) {
    if (yearKey === 'غير محدد') return 'أحداث بلا تاريخ';
    if (typeof yearKey !== 'number') return `السنة ${yearKey}`;
    if (yearKey < 0) return `السنة ${Math.abs(yearKey)} ق هـ`;
    if (yearKey === 0) return 'بداية الهجرة';
    return `السنة ${yearKey} هـ`;
  }

  function selectEvent(id) {
    const sameEvent = state.currentEventId === id;
    state.currentEventId = id;
    if (!sameEvent) {
      state.currentSourceIndex = 0;
    }
    highlightActiveEvent();
    renderEvent();
    const current = getCurrentEvent();
    if (current) {
      populateEventForm(current, { scroll: false });
    }
  }

  function highlightActiveEvent() {
    document.querySelectorAll('#timeline .event-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.id === state.currentEventId);
    });
  }

  function getCurrentEvent() {
    return state.data.events.find((event) => event.id === state.currentEventId) || null;
  }

  function renderEvent() {
    const event = getCurrentEvent();
    if (!event) {
      clearEventView();
      return;
    }
    eventTitleEl.textContent = event.title;
    renderSources(event);
  }

  function clearEventView() {
    eventTitleEl.textContent = 'اختر حدثاً من الخط الزمني';
    if (eventTextEditor) eventTextEditor.value = '';
    if (eventTextPreview) eventTextPreview.innerHTML = '<p>لا توجد بيانات.</p>';
    sourceTabsEl.innerHTML = '';
    if (sourcePanelTitle) {
      sourcePanelTitle.textContent = 'المصادر';
    }
  }

  function renderSources(event) {
    let mutated = false;
    if (ensurePrimarySource(event)) {
      mutated = true;
    }
    const sources = event.sources || [];
    sourceTabsEl.innerHTML = '';
    if (sourcePanelTitle) {
      sourcePanelTitle.textContent = event.title || 'المصادر';
    }
    if (!sources.length) {
      if (eventTextEditor) eventTextEditor.value = '';
      updateTextPreview('');
      return;
    }
    if (state.currentSourceIndex >= sources.length) {
      state.currentSourceIndex = 0;
    }
    sources.forEach((source, index) => {
      const btn = document.createElement('button');
      btn.className = 'source-tab';
      if (index === state.currentSourceIndex) {
        btn.classList.add('active');
      }
      const label = source.book || source.title || `مصدر ${index + 1}`;
      btn.textContent = label;
      btn.addEventListener('click', () => {
        state.currentSourceIndex = index;
        renderSources(event);
      });
      sourceTabsEl.appendChild(btn);
    });
    const current = sources[state.currentSourceIndex];
    if (sourceBookInput) {
      sourceBookInput.value = current.book || '';
    }
    if (eventTextEditor) {
      eventTextEditor.value = current.text || '';
    }
    updateTextPreview(current.text || '');
    if (mutated) {
      DataStore.saveData();
    }
  }

  function applyRemoteData(remote) {
    const latest = (typeof DataStore.getData === 'function' && DataStore.getData()) || remote;
    if (!latest) return;
    state.data = latest;
    ensureEventOrdering();
    buildTimeline();
    if (state.currentEventId && state.data.events.some((evt) => evt.id === state.currentEventId)) {
      selectEvent(state.currentEventId);
    } else if (state.data.events.length) {
      selectEvent(state.data.events[0].id);
    } else {
      state.currentEventId = null;
      clearEventView();
    }
  }

  function handleTextInput() {
    const event = getCurrentEvent();
    if (!event || !eventTextEditor) return;
    if (ensurePrimarySource(event)) {
      syncRemoteAndRender(event);
      return;
    }
    const current = event.sources?.[state.currentSourceIndex];
    if (!current) return;
    current.text = eventTextEditor.value;
    syncRemoteAndRender(event);
    updateTextPreview(current.text);
  }

  function updateTextPreview(text) {
    if (!eventTextPreview) return;
    const html = SmartLinks.applySmartLinks(text || '', state.data.biographies, state.data.places);
    eventTextPreview.innerHTML = html || '<p>لا يوجد نص متاح.</p>';
  }

  function openAddSourceModal() {
    if (!getCurrentEvent()) {
      alert('اختر حدثاً أولاً');
      return;
    }
    newSourceTitleInput.value = '';
    newSourceTextInput.value = '';
    sourceModalEl?.classList.add('show');
  }

  function saveNewSourceFromModal() {
    const event = getCurrentEvent();
    if (!event) return;
    const text = newSourceTextInput.value.trim();
    if (!text) {
      alert('يرجى إدخال نص للمصدر');
      return;
    }
    const title = newSourceTitleInput.value.trim();
    event.sources = event.sources || [];
    event.sources.push({
      book: '',
      title,
      text
    });
    state.currentSourceIndex = event.sources.length - 1;
    DataStore.saveData();
    renderSources(event);
    UI.closeModal(sourceModalEl);
  }

  function removeCurrentSource() {
    const event = getCurrentEvent();
    if (!event) return;
    if (!event.sources || !event.sources.length) {
      alert('لا يوجد مصادر لحذفها');
      return;
    }
    if (!confirm('سيتم حذف المصدر الحالي، هل أنت متأكد؟')) return;
    event.sources.splice(state.currentSourceIndex, 1);
    if (state.currentSourceIndex >= (event.sources.length || 0)) {
      state.currentSourceIndex = Math.max(0, (event.sources.length || 1) - 1);
    }
    DataStore.saveData();
    renderSources(event);
  }

  function saveSourceBookName() {
    const event = getCurrentEvent();
    if (!event) return;
    const current = event.sources?.[state.currentSourceIndex];
    if (!current) return;
    current.book = sourceBookInput.value.trim() || `مصدر ${state.currentSourceIndex + 1}`;
    DataStore.saveData();
    renderSources(event);
  }

  function savePersonFromModal(payload) {
    if (!payload?.name) {
      alert('يجب إدخال اسم الشخصية');
      return;
    }
    state.data.biographies[payload.name] = {
      short: payload.short,
      full: payload.full,
      img: payload.img || 'persons/default.png'
    };
    DataStore.saveData();
    UI.closeModal(document.getElementById('personModal'));
    renderEvent();
  }

  function savePlaceFromModal(payload) {
    if (!payload?.name) {
      alert('يجب إدخال اسم المكان');
      return;
    }
    state.data.places[payload.name] = {
      desc: payload.desc,
      image: payload.image || 'maps/example.png'
    };
    DataStore.saveData();
    UI.closeModal(document.getElementById('placeModal'));
    renderEvent();
  }

  function handleEventFormSave(options = {}) {
    const { silent = false } = options;
    const payload = collectFormPayload();
    if (!payload?.id || !payload.title) {
      if (!silent) {
        alert('يجب إدخال معرف وعنوان الحدث');
      }
      return false;
    }
    const existingIndex = state.data.events.findIndex((evt) => evt.id === payload.id);
    const isNew = existingIndex === -1;
    let targetEvent = null;
    if (isNew) {
      const baseOrder = resolveInsertOrderForNew(payload.year);
      shiftOrdersForInsert(payload.year, baseOrder);
      targetEvent = {
        id: payload.id,
        title: payload.title,
        year: payload.year,
        order: baseOrder,
        tags: [],
        notes: '',
        sources: []
      };
      state.data.events.push(targetEvent);
    } else {
      targetEvent = state.data.events[existingIndex];
      const originalYear = targetEvent.year ?? null;
      const newYear = payload.year ?? null;
      targetEvent.title = payload.title;
      targetEvent.year = payload.year;
      if (originalYear !== newYear) {
        targetEvent.order = resolveDesiredOrder(null, payload.year);
      }
    }
    ensurePrimarySource(targetEvent);
    state.pendingInsert = null;
    ensureEventOrdering();
    DataStore.saveData();
    buildTimeline();
    selectEvent(targetEvent.id);
    console.info('[App] تم تحديث الحدث', targetEvent.id);
    return true;
  }

  function importDataFromModal(raw) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.events || !parsed.biographies || !parsed.places) {
        alert('صيغة البيانات غير صحيحة');
        return;
      }
      DataStore.replaceData(parsed);
      state.data = DataStore.loadData();
      ensureEventOrdering();
      buildTimeline();
      clearEventForm();
      if (state.data.events.length) {
        selectEvent(state.data.events[0].id);
      }
      UI.closeModal(document.getElementById('importExportModal'));
    } catch (err) {
      alert('تعذر قراءة البيانات المدخلة');
    }
  }

  function exportDataToTextarea() {
    if (!importExportTextarea) return;
    importExportTextarea.value = JSON.stringify(state.data, null, 2);
    importExportTextarea.focus();
    importExportTextarea.select();
    try {
      document.execCommand('copy');
      alert('تم تحديث البيانات ونسخها إلى الحافظة');
    } catch {
      alert('تم تحديث البيانات، يمكنك نسخها يدوياً');
    }
  }

  function handleSearchInput() {
    const term = searchInputEl.value.trim().toLowerCase();
    if (!term) {
      hideSearchResults();
      return;
    }
    const results = [];
    state.data.events.forEach((event) => {
      const blob = [
        event.title,
        event.notes,
        ...(event.tags || []),
        ...(event.sources || []).map((src) => src.text)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (blob.includes(term)) {
        results.push({ type: 'event', title: event.title, meta: event.year ? `السنة ${event.year} هـ` : '', id: event.id });
      }
    });
    Object.entries(state.data.biographies).forEach(([name, bio]) => {
      const text = `${name} ${bio.short} ${bio.full}`.toLowerCase();
      if (text.includes(term)) {
        results.push({ type: 'person', title: name, meta: bio.short || 'ترجمة', id: name });
      }
    });
    Object.entries(state.data.places).forEach(([name, place]) => {
      const text = `${name} ${place.desc}`.toLowerCase();
      if (text.includes(term)) {
        results.push({ type: 'place', title: name, meta: place.desc || 'مكان', id: name });
      }
    });
    renderSearchResults(results);
  }

  function renderSearchResults(results) {
    if (!results.length) {
      hideSearchResults();
      return;
    }
    searchResultsEl.innerHTML = '';
    results.forEach((result) => {
      const row = document.createElement('div');
      row.className = 'search-item';
      row.innerHTML = `<strong>${result.title}</strong><span>${result.meta}</span>`;
      row.addEventListener('click', () => handleSearchSelection(result));
      searchResultsEl.appendChild(row);
    });
    searchResultsEl.classList.remove('hidden');
  }

  function handleSearchSelection(result) {
    hideSearchResults();
    searchInputEl.value = '';
    if (result.type === 'event') {
      selectEvent(result.id);
    } else if (result.type === 'person') {
      const info = state.data.biographies[result.id];
      UI.openPersonModal({ name: result.id, ...info }, savePersonFromModal);
    } else if (result.type === 'place') {
      const info = state.data.places[result.id];
      UI.openPlaceModal({ name: result.id, ...info }, savePlaceFromModal);
    }
  }

  function hideSearchResults() {
    searchResultsEl.classList.add('hidden');
    searchResultsEl.innerHTML = '';
  }

  function ensureEventOrdering() {
    state.data.events = state.data.events.filter((event) => event && typeof event === 'object');
    const groups = new Map();
    state.data.events.forEach((event) => {
      if (!event) return;
      const key = typeof event.year === 'number' ? event.year : 'غير محدد';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(event);
    });
    groups.forEach((events) => {
      events.sort((a, b) => getEventOrder(a) - getEventOrder(b));
      let counter = 1;
      events.forEach((event) => {
        if (typeof event.order !== 'number' || Number.isNaN(event.order)) {
          event.order = counter;
        }
        counter += 1;
      });
    });
    sortEvents();
  }

  function sortEvents() {
    state.data.events.sort((a, b) => {
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      const yearA = typeof a.year === 'number' ? a.year : Number.MAX_SAFE_INTEGER;
      const yearB = typeof b.year === 'number' ? b.year : Number.MAX_SAFE_INTEGER;
      if (yearA !== yearB) return yearA - yearB;
      return compareEventsWithinYear(a, b);
    });
  }

  function getEventOrder(event) {
    if (!event) return Number.MAX_SAFE_INTEGER;
    return typeof event.order === 'number' && !Number.isNaN(event.order) ? event.order : Number.MAX_SAFE_INTEGER;
  }

  function getNextOrder(year) {
    const eventsForYear = state.data.events.filter(
      (evt) => evt && (evt.year ?? null) === (year ?? null)
    );
    if (!eventsForYear.length) return 1;
    return Math.max(...eventsForYear.map(getEventOrder)) + 1;
  }

  function compareEventsWithinYear(a, b) {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    const orderDiff = getEventOrder(a) - getEventOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return (a.title || '').localeCompare(b.title || '', 'ar');
  }

  function createControlButton(label, handler, disabled = false) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.disabled = Boolean(disabled);
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (btn.disabled) return;
      handler();
    });
    return btn;
  }

  function moveEvent(eventId, direction) {
    const event = state.data.events.find((evt) => evt.id === eventId);
    if (!event) return;
    const yearKey = event.year ?? null;
    const peers = state.data.events
      .filter((evt) => (evt.year ?? null) === yearKey)
      .sort(compareEventsWithinYear);
    const index = peers.findIndex((evt) => evt.id === eventId);
    const target = peers[index + direction];
    if (!target) return;
    const tempOrder = getEventOrder(event);
    event.order = getEventOrder(target);
    target.order = tempOrder;
    ensureEventOrdering();
    DataStore.saveData();
    buildTimeline();
    highlightActiveEvent();
  }

  function prepareInsertBefore(targetEvent) {
    if (!targetEvent) return;
    clearEventForm();
    formEventYearInput.value = targetEvent.year ?? '';
    state.pendingInsert = {
      year: targetEvent.year ?? null,
      order: getEventOrder(targetEvent)
    };
    scrollEventFormIntoView();
    formEventTitleInput.focus();
  }

  function prepareInsertAfter(targetEvent) {
    if (!targetEvent) return;
    clearEventForm();
    formEventYearInput.value = targetEvent.year ?? '';
    state.pendingInsert = {
      year: targetEvent.year ?? null,
      order: getEventOrder(targetEvent) + 1
    };
    scrollEventFormIntoView();
    formEventTitleInput.focus();
  }

  function prepareInsertForYear(year) {
    clearEventForm();
    if (typeof year === 'number') {
      formEventYearInput.value = year;
      state.pendingInsert = {
        year,
        order: getNextOrder(year)
      };
    } else {
      formEventYearInput.value = '';
      state.pendingInsert = null;
    }
    scrollEventFormIntoView();
    formEventIdInput.focus();
  }

  function collectFormPayload() {
    if (!formEventIdInput || !formEventTitleInput) return null;
    const yearValue = formEventYearInput.value.trim();
    const year = yearValue === '' ? null : Number(yearValue);
    return {
      id: formEventIdInput.value.trim(),
      title: formEventTitleInput.value.trim(),
      year: Number.isFinite(year) ? year : null
    };
  }

  function loadCurrentEventIntoForm() {
    const event = getCurrentEvent();
    if (!event) {
      alert('اختر حدثاً لتحريره');
      return;
    }
    populateEventForm(event);
  }

  function populateEventForm(event, options = {}) {
    const { scroll = true } = options;
    if (!event) return;
    formEventIdInput.value = event.id || '';
    formEventTitleInput.value = event.title || '';
    formEventYearInput.value = event.year ?? '';
    state.pendingInsert = null;
    if (scroll) {
      scrollEventFormIntoView();
    }
  }

  function clearEventForm() {
    if (!formEventIdInput) return;
    formEventIdInput.value = '';
    formEventTitleInput.value = '';
    formEventYearInput.value = '';
    state.pendingInsert = null;
    clearTimeout(formAutoSaveTimer);
  }

  function prepareNewEventForm() {
    clearEventForm();
    const currentYear = getCurrentEvent()?.year;
    if (typeof currentYear === 'number') {
      formEventYearInput.value = currentYear;
    } else {
      formEventYearInput.value = '';
    }
    scrollEventFormIntoView();
    formEventIdInput.focus();
  }

  function scrollEventFormIntoView() {
    eventFormEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function deleteEvent(eventId) {
    const index = state.data.events.findIndex((evt) => evt.id === eventId);
    if (index === -1) return;
    if (!confirm('سيتم حذف هذا الحدث نهائياً، هل أنت متأكد؟')) return;
    const removed = state.data.events.splice(index, 1)[0];
    DataStore.saveData();
    ensureEventOrdering();
    buildTimeline();
    if (state.currentEventId === removed.id) {
      if (state.data.events.length) {
        selectEvent(state.data.events[0].id);
      } else {
        state.currentEventId = null;
        clearEventView();
      }
    } else {
      highlightActiveEvent();
    }
  }

  function shiftOrdersForInsert(year, startingOrder, excludeId) {
    if (typeof startingOrder !== 'number' || Number.isNaN(startingOrder)) return;
    const targetYear = year ?? null;
    state.data.events.forEach((event) => {
      if (event.id === excludeId) return;
      if ((event.year ?? null) !== targetYear) return;
      const current = getEventOrder(event);
      if (current >= startingOrder) {
        event.order = current + 1;
      }
    });
  }

  function resolveDesiredOrder(orderValue, year) {
    if (typeof orderValue === 'number' && !Number.isNaN(orderValue)) {
      return orderValue;
    }
    return getNextOrder(year);
  }

  function resolveInsertOrderForNew(year) {
    if (state.pendingInsert && (state.pendingInsert.year ?? null) === (year ?? null)) {
      return state.pendingInsert.order;
    }
    return resolveDesiredOrder(null, year);
  }

  function scheduleEventFormAutoSave() {
    clearTimeout(formAutoSaveTimer);
    if (!formEventIdInput?.value.trim() || !formEventTitleInput?.value.trim()) {
      return;
    }
    formAutoSaveTimer = setTimeout(() => {
      handleEventFormSave({ silent: true });
    }, 600);
  }

  function ensurePrimarySource(event) {
    if (!event) return false;
    if (!Array.isArray(event.sources)) {
      event.sources = [];
    }
    if (event.sources.length) return false;
    event.sources.push({
      book: event.title || 'مصدر 1',
      text: ''
    });
    state.currentSourceIndex = 0;
    return true;
  }

  function syncRemoteAndRender(event) {
    const existing = state.data.events.find((evt) => evt.id === event.id);
    if (!existing && event.id) {
      state.data.events.push(event);
    }
    DataStore.saveData();
    renderSources(event);
  }

  init();
})();
