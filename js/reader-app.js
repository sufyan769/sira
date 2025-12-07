(function () {
  const FIREBASE_DB_URL = window.FIREBASE_DB_URL || '';
  const STORAGE_KEY = 'sirahOfflineDataV1';
  const timelineEl = document.getElementById('readerTimeline');
  const eventTitleEl = document.getElementById('readerEventTitle');
  const eventTextEl = document.getElementById('readerEventText');
  const sourceTabsEl = document.getElementById('readerSourceTabs');
  const sourcePanelTitle = document.getElementById('readerSourcePanelTitle');
  const searchInputEl = document.getElementById('readerSearch');
  const searchResultsEl = document.getElementById('readerSearchResults');

  const sharedData = (() => {
    try {
      const raw = localStorage.getItem('sirahOfflineDataV1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.events && parsed.biographies && parsed.places) {
          return parsed;
        }
      }
    } catch (_) {}
    return ReaderData;
  })();

  const state = {
    events: sharedData.events,
    bios: sharedData.biographies,
    places: sharedData.places,
    currentEventId: null,
    currentSourceIndex: 0
  };

  function init() {
    ReaderSmartLinks.initSmartLinks(eventTextEl);
    ensureEventOrdering();
    buildTimeline();
    bindSearch();
    if (state.events.length) selectEvent(state.events[0].id);
    fetchRemoteSnapshot();
  }

  function buildTimeline() {
    timelineEl.innerHTML = '';
    const grouped = new Map();
    state.events.forEach((event) => {
      const year = event.year ?? 'غير محدد';
      if (!grouped.has(year)) grouped.set(year, []);
      grouped.get(year).push(event);
    });
    const years = [...grouped.keys()].sort((a, b) => {
      if (a === 'غير محدد') return 1;
      if (b === 'غير محدد') return -1;
      return Number(a) - Number(b);
    });
    let yearCounter = 0;
    years.forEach((year) => {
      yearCounter += 1;
      const group = document.createElement('div');
      group.className = 'year-group';
      const label = document.createElement('div');
      label.className = 'year-label';
      const title = year === 'غير محدد' ? 'أحداث بلا تاريخ' : `السنة ${year} هـ`;
      label.textContent = `${yearCounter}. ${title}`;
      group.appendChild(label);
      const eventsForYear = grouped
        .get(year)
        .slice()
        .sort(compareEventsWithinYear);
      eventsForYear.forEach((event, index) => {
        const item = document.createElement('div');
        item.className = 'event-item';
        item.dataset.id = event.id;
        item.textContent = `${yearCounter}.${index + 1} ${event.title}`;
        item.addEventListener('click', () => selectEvent(event.id));
        group.appendChild(item);
      });
      timelineEl.appendChild(group);
    });
  }

  function selectEvent(id) {
    state.currentEventId = id;
    state.currentSourceIndex = 0;
    document.querySelectorAll('#readerTimeline .event-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.id === id);
    });
    renderEvent();
  }

  function renderEvent() {
    const event = state.events.find((evt) => evt.id === state.currentEventId);
    if (!event) return;
    eventTitleEl.textContent = event.title;
    if (sourcePanelTitle) sourcePanelTitle.textContent = event.title || 'المصادر';
    renderSources(event);
  }

  function renderSources(event) {
    const sources = event.sources || [];
    sourceTabsEl.innerHTML = '';
    if (!sources.length) {
      eventTextEl.innerHTML = '<p>لا يوجد نص متاح.</p>';
      return;
    }
    if (state.currentSourceIndex >= sources.length) state.currentSourceIndex = 0;
    sources.forEach((source, index) => {
      const btn = document.createElement('button');
      btn.className = 'source-tab';
      if (index === state.currentSourceIndex) btn.classList.add('active');
      btn.textContent = source.book || `مصدر ${index + 1}`;
      btn.addEventListener('click', () => {
        state.currentSourceIndex = index;
        renderSources(event);
      });
      sourceTabsEl.appendChild(btn);
    });
    const current = sources[state.currentSourceIndex];
    const html = ReaderSmartLinks.applySmartLinks(current.text || '', state.bios, state.places);
    eventTextEl.innerHTML = html || '<p>لا يوجد نص متاح.</p>';
  }

  function bindSearch() {
    searchInputEl.addEventListener('input', () => {
      const term = searchInputEl.value.trim().toLowerCase();
      if (!term) return hideSearchResults();
      const results = [];
      state.events.forEach((event) => {
        const blob = [event.title, event.notes, ...(event.tags || []), ...(event.sources || []).map((s) => s.text)]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (blob.includes(term)) {
          results.push({ type: 'event', title: event.title, meta: event.year ? `السنة ${event.year} هـ` : '', id: event.id });
        }
      });
      Object.entries(state.bios).forEach(([name, bio]) => {
        if ((`${name} ${bio.short} ${bio.full}`).toLowerCase().includes(term)) {
          results.push({ type: 'person', title: name, meta: bio.short || 'ترجمة', id: name });
        }
      });
      Object.entries(state.places).forEach(([name, place]) => {
        if ((`${name} ${place.desc}`).toLowerCase().includes(term)) {
          results.push({ type: 'place', title: name, meta: place.desc || 'مكان', id: name });
        }
      });
      renderSearchResults(results);
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.header-search')) hideSearchResults();
    });
  }

  function renderSearchResults(results) {
    if (!results.length) return hideSearchResults();
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
      const info = state.bios[result.id];
      ReaderUI.openPersonModal({ name: result.id, ...info });
    } else if (result.type === 'place') {
      const info = state.places[result.id];
      ReaderUI.openPlaceModal({ name: result.id, ...info });
    }
  }

  function hideSearchResults() {
    searchResultsEl.classList.add('hidden');
    searchResultsEl.innerHTML = '';
  }

  function ensureEventOrdering() {
    const groups = new Map();
    state.events.forEach((event) => {
      const key = event.year ?? 'غير محدد';
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
    state.events.sort((a, b) => {
      const yearA = typeof a.year === 'number' ? a.year : Number.MAX_SAFE_INTEGER;
      const yearB = typeof b.year === 'number' ? b.year : Number.MAX_SAFE_INTEGER;
      if (yearA !== yearB) return yearA - yearB;
      return compareEventsWithinYear(a, b);
    });
  }

  function getEventOrder(event) {
    return typeof event.order === 'number' && !Number.isNaN(event.order) ? event.order : Number.MAX_SAFE_INTEGER;
  }

  function compareEventsWithinYear(a, b) {
    const diff = getEventOrder(a) - getEventOrder(b);
    if (diff !== 0) return diff;
    return (a.title || '').localeCompare(b.title || '', 'ar');
  }

  function fetchRemoteSnapshot() {
    if (!FIREBASE_DB_URL) return;
    fetch(FIREBASE_DB_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Firebase fetch failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((remote) => {
        if (!isValidDataset(remote)) return;
        state.events = remote.events || [];
        state.bios = remote.biographies || {};
        state.places = remote.places || {};
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        } catch (_) {}
        ensureEventOrdering();
        buildTimeline();
        if (state.currentEventId && state.events.some((evt) => evt.id === state.currentEventId)) {
          selectEvent(state.currentEventId);
        } else if (state.events.length) {
          selectEvent(state.events[0].id);
        }
      })
      .catch((err) => {
        console.warn('تعذر جلب بيانات Firebase للقراءة', err);
      });
  }

  function isValidDataset(payload) {
    return (
      payload &&
      Array.isArray(payload.events) &&
      typeof payload.biographies === 'object' &&
      typeof payload.places === 'object'
    );
  }

  init();
})();
