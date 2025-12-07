(function () {
  let biosStore = {};
  let placesStore = {};
  let personClickHandler = null;
  let placeClickHandler = null;

  function escapeHtml(str = '') {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const ARABIC_LETTER_REGEX = /[\u0600-\u06FF]/;
  const ARABIC_DIACRITICS = '[\u064B-\u065F\u0670\u06D6-\u06ED]*';

  function wrapOccurrences(text, term, className, attr) {
    if (!term) return text;
    const pattern = buildTermPattern(term);
    const regex = new RegExp(`(^|[^\\w\\u0600-\\u06FF])(${pattern})(?=$|[^\\w\\u0600-\\u06FF])`, 'g');
    const attrValue = term.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return text.replace(regex, (match, prefix, value) => {
      return `${prefix}<span class="${className}" data-${attr}='${attrValue}'>${value}</span>`;
    });
  }

  function buildTermPattern(term) {
    return term
      .split('')
      .map((char) => {
        const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (ARABIC_LETTER_REGEX.test(char)) {
          return `${escaped}(?:${ARABIC_DIACRITICS})`;
        }
        return escaped;
      })
      .join('');
  }

  function protectPersonSpans(html) {
    const placeholders = [];
    const safe = html.replace(/<span class="person-link"[\s\S]*?<\/span>/g, (span) => {
      const key = `__PERSON_${placeholders.length}__`;
      placeholders.push(span);
      return key;
    });
    return { safe, placeholders };
  }

  function restorePersonSpans(html, placeholders) {
    let result = html;
    placeholders.forEach((span, index) => {
      result = result.replace(`__PERSON_${index}__`, span);
    });
    return result;
  }

  function applyPersonLinks(text = '', bios = {}) {
    biosStore = bios || {};
    let html = escapeHtml(text);
    Object.keys(biosStore)
      .sort((a, b) => b.length - a.length)
      .forEach((name) => {
        html = wrapOccurrences(html, name, 'person-link', 'person');
      });
    return html;
  }

  function applyPlaceLinks(html = '', places = {}) {
    placesStore = places || {};
    const { safe, placeholders } = protectPersonSpans(html);
    let processed = safe;
    Object.keys(placesStore)
      .sort((a, b) => b.length - a.length)
      .forEach((name) => {
        processed = wrapOccurrences(processed, name, 'place-link', 'place');
      });
    return restorePersonSpans(processed, placeholders);
  }

  function applySmartLinks(text = '', bios = {}, places = {}) {
    let html = applyPersonLinks(text, bios);
    html = applyPlaceLinks(html, places);
    return html.replace(/\n/g, '<br>');
  }

  function handleOver(event) {
    const target = event.target.closest('.person-link, .place-link');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const position = { x: rect.left + rect.width / 2, y: rect.top + window.scrollY };
    if (target.classList.contains('person-link')) {
      const info = biosStore[target.dataset.person];
      if (!info) return;
      window.UI?.showTooltip(`${target.dataset.person} — ${info.short || ''}`, position);
    } else {
      const info = placesStore[target.dataset.place];
      if (!info) return;
      window.UI?.showTooltip(`${target.dataset.place} — ${info.desc || ''}`, position);
    }
  }

  function handleOut(event) {
    if (!event.target.closest) return;
    const target = event.target.closest('.person-link, .place-link');
    if (!target) return;
    window.UI?.hideTooltip();
  }

  function handleClick(event) {
    const person = event.target.closest('.person-link');
    if (person) {
      const info = biosStore[person.dataset.person];
      if (!info) return;
      personClickHandler?.({
        name: person.dataset.person,
        ...info
      });
      return;
    }
    const place = event.target.closest('.place-link');
    if (place) {
      const info = placesStore[place.dataset.place];
      if (!info) return;
      placeClickHandler?.({
        name: place.dataset.place,
        ...info
      });
    }
  }

  function initSmartLinks(root) {
    if (!root || root.__smartLinksBound) return;
    root.addEventListener('pointerover', handleOver);
    root.addEventListener('pointerout', handleOut);
    root.addEventListener('click', handleClick);
    root.__smartLinksBound = true;
  }

  function onPersonClick(handler) {
    personClickHandler = handler;
  }

  function onPlaceClick(handler) {
    placeClickHandler = handler;
  }

  window.SmartLinks = {
    applySmartLinks,
    initSmartLinks,
    onPersonClick,
    onPlaceClick
  };
})();
