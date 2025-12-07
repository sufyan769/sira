(function () {
  let biosStore = {};
  let placesStore = {};

  function escapeHtml(str = '') {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function wrap(text, term, cls, attr) {
    if (!term) return text;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^\\w\\u0600-\\u06FF])(${escaped})(?=$|[^\\w\\u0600-\\u06FF])`, 'g');
    const attrValue = term.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return text.replace(regex, (match, prefix, value) => `${prefix}<span class="${cls}" data-${attr}='${attrValue}'>${value}</span>`);
  }

  function protectPersons(html) {
    const placeholders = [];
    const safe = html.replace(/<span class="person-link"[\s\S]*?<\/span>/g, (span) => {
      const key = `__PERSON_${placeholders.length}__`;
      placeholders.push(span);
      return key;
    });
    return { safe, placeholders };
  }

  function restorePersons(html, placeholders) {
    let result = html;
    placeholders.forEach((span, index) => {
      result = result.replace(`__PERSON_${index}__`, span);
    });
    return result;
  }

  function applySmartLinks(text = '', bios = {}, places = {}) {
    biosStore = bios;
    placesStore = places;
    let html = escapeHtml(text);
    Object.keys(biosStore)
      .sort((a, b) => b.length - a.length)
      .forEach((name) => {
        html = wrap(html, name, 'person-link', 'person');
      });
    const { safe, placeholders } = protectPersons(html);
    let processed = safe;
    Object.keys(placesStore)
      .sort((a, b) => b.length - a.length)
      .forEach((name) => {
        processed = wrap(processed, name, 'place-link', 'place');
      });
    return restorePersons(processed, placeholders).replace(/\n/g, '<br>');
  }

  function initSmartLinks(root) {
    if (!root || root.__readerSmartLinks) return;
    root.addEventListener('pointerover', handleOver);
    root.addEventListener('pointerout', handleOut);
    root.addEventListener('click', handleClick);
    root.__readerSmartLinks = true;
  }

  function handleOver(event) {
    const target = event.target.closest('.person-link, .place-link');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const position = { x: rect.left + rect.width / 2, y: rect.top + window.scrollY };
    if (target.classList.contains('person-link')) {
      const info = biosStore[target.dataset.person];
      if (!info) return;
      ReaderUI.showTooltip(`${target.dataset.person} — ${info.short || ''}`, position);
    } else {
      const info = placesStore[target.dataset.place];
      if (!info) return;
      ReaderUI.showTooltip(`${target.dataset.place} — ${info.desc || ''}`, position);
    }
  }

  function handleOut(event) {
    if (!event.target.closest) return;
    const target = event.target.closest('.person-link, .place-link');
    if (!target) return;
    ReaderUI.hideTooltip();
  }

  function handleClick(event) {
    const person = event.target.closest('.person-link');
    if (person) {
      const info = biosStore[person.dataset.person];
      if (!info) return;
      ReaderUI.openPersonModal({ name: person.dataset.person, ...info });
      return;
    }
    const place = event.target.closest('.place-link');
    if (place) {
      const info = placesStore[place.dataset.place];
      if (!info) return;
      ReaderUI.openPlaceModal({ name: place.dataset.place, ...info });
    }
  }

  window.ReaderSmartLinks = {
    applySmartLinks,
    initSmartLinks
  };
})();
