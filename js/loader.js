(function () {
  const STORAGE_KEY = 'sirahOfflineDataV1';
  const FIREBASE_DB_URL = window.FIREBASE_DB_URL || '';
  const REMOTE_EVENT = 'data-store:remote-updated';
  const DEFAULT_DATA = {
    events: [
      {
        id: 'badr',
        year: 2,
        order: 1,
        title: 'غزوة بدر الكبرى',
        tags: ['غزوات', 'بدر', 'السنة الثانية'],
        sources: [
          {
            book: 'ابن كثير',
            text: 'وقعت غزوة بدر في السابع عشر من رمضان من السنة الثانية للهجرة، وخرج النبي صلى الله عليه وسلم وأصحابه لاعتراض قافلة قريش، ثم دار القتال عند ماء بدر فكان النصر للمسلمين.'
          },
          {
            book: 'الذهبي',
            text: 'يقول الذهبي إن بدرًا كانت أول المعارك الفاصلة، وأن الله أيد فيها رسوله بالملائكة، فاستبشر المسلمون وانهزمت قريش.'
          }
        ],
        notes: 'يستحسن إضافة تفاصيل عن الأسرى وتقسيم الغنائم.'
      },
      {
        id: 'uhud',
        year: 3,
        order: 1,
        title: 'غزوة أحد',
        tags: ['غزوات', 'أحد', 'السنة الثالثة'],
        sources: [
          {
            book: 'ابن هشام',
            text: 'خرج رسول الله صلى الله عليه وسلم لمواجهة قريش عند جبل أحد، فبدأ النصر للمسلمين ثم تغير بعد مخالفة الرماة لأمر النبي.'
          }
        ],
        notes: 'يمكن توثيق استشهاد حمزة بن عبد المطلب وموقف الرماة.'
      }
    ],
    biographies: {
      'محمد بن عبد الله': {
        short: 'رسول الله صلى الله عليه وسلم وخاتم الأنبياء.',
        full: 'بعث في مكة ثم هاجر إلى المدينة وأسس دولة الإسلام حتى وفاته سنة 11 هـ.',
        img: 'persons/default.png'
      },
      'حمزة بن عبد المطلب': {
        short: 'أسد الله وأسد رسوله، استشهد في غزوة أحد.',
        full: 'هو حمزة بن عبد المطلب الهاشمي القرشي، عم رسول الله صلى الله عليه وسلم وأخوه من الرضاعة، أسلم في مكة وشهد بدرًا وأُحدًا واستشهد هناك.',
        img: 'persons/default.png'
      },
      'مصعب بن عمير': {
        short: 'أول سفير في الإسلام وحامل لواء أحد.',
        full: 'بعثه النبي صلى الله عليه وسلم داعية إلى المدينة واستشهد وهو يحمل اللواء يوم أحد.',
        img: 'persons/default.png'
      }
    },
    places: {
      'بدر': {
        desc: 'وادي يقع بين مكة والمدينة شهد أول انتصار حاسم للمسلمين.',
        image: 'maps/badr.png'
      },
      'أحد': {
        desc: 'جبل شمال المدينة المنورة وقع عنده القتال في السنة الثالثة.',
        image: 'maps/example.png'
      },
      'اليرموك': {
        desc: 'سهل واسع جنوب غرب دمشق دارت فيه معركة اليرموك ضد الروم.',
        image: 'maps/example.png'
      }
    }
  };

  let dataCache = null;
  let remoteSyncStarted = false;
  let remotePushTimer = null;

  function loadData() {
    if (dataCache) {
      startRemoteSync();
      return dataCache;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dataCache = normalizeDataset(JSON.parse(raw));
        startRemoteSync();
        return dataCache;
      }
    } catch (err) {
      console.warn('تعذر قراءة البيانات المخزنة محلياً، سيتم استخدام البيانات الافتراضية.', err);
    }
    dataCache = clone(DEFAULT_DATA);
    dataCache.events = sanitizeEvents(dataCache.events);
    saveData({ skipRemote: true });
    startRemoteSync();
    return dataCache;
  }

  function startRemoteSync() {
    if (remoteSyncStarted || !FIREBASE_DB_URL) return;
    remoteSyncStarted = true;
    fetchRemoteSnapshot();
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function saveData(options = {}) {
    if (!dataCache) return;
    dataCache = normalizeDataset(dataCache);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataCache));
    if (!options.skipRemote) {
      queueRemotePush(dataCache);
    }
  }

  function resetData() {
    dataCache = clone(DEFAULT_DATA);
    saveData();
  }

  function replaceData(newData) {
    dataCache = newData;
    saveData();
  }

  function fetchRemoteSnapshot() {
    const url = FIREBASE_DB_URL;
    if (!url) return;
    console.debug('[Firebase] طلب البيانات من', url);
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Firebase fetch failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((remote) => {
        const normalized = !remote || typeof remote !== 'object' ? clone(DEFAULT_DATA) : remote;
        if (isValidDataset(normalized)) {
          console.info('[Firebase] تم استقبال بيانات من السحابة');
          applyRemoteSnapshot(normalized);
        } else {
          console.warn('[Firebase] بيانات غير صالحة من السحابة', remote);
        }
      })
      .catch((err) => {
        console.error('تعذر مزامنة بيانات Firebase', err);
      });
  }

  function queueRemotePush(payload) {
    if (!FIREBASE_DB_URL) return;
    console.debug('[Firebase] تحضير إرسال البيانات', payload);
    clearTimeout(remotePushTimer);
    remotePushTimer = setTimeout(() => {
      pushRemoteSnapshot(payload);
    }, 400);
  }

  function pushRemoteSnapshot(payload) {
    if (!FIREBASE_DB_URL) return;
    console.debug('[Firebase] إرسال التحديث إلى', FIREBASE_DB_URL);
    fetch(FIREBASE_DB_URL, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`PATCH failed with status ${res.status}`);
        }
        console.info('[Firebase] تم حفظ البيانات بنجاح');
      })
      .catch((err) => {
        console.error('تعذر حفظ البيانات على Firebase', err);
      });
  }

  function applyRemoteSnapshot(snapshot) {
    dataCache = normalizeDataset(snapshot);
    saveData({ skipRemote: true });
    window.dispatchEvent(
      new CustomEvent(REMOTE_EVENT, {
        detail: clone(dataCache)
      })
    );
  }

  function isValidDataset(payload) {
    return (
      payload &&
      Array.isArray(payload.events) &&
      typeof payload.biographies === 'object' &&
      typeof payload.places === 'object'
    );
  }

  function normalizeDataset(dataset) {
    const next = dataset || {};
    next.events = sanitizeEvents(next.events);
    if (typeof next.biographies !== 'object' || !next.biographies) {
      next.biographies = {};
    }
    if (typeof next.places !== 'object' || !next.places) {
      next.places = {};
    }
    return next;
  }

  function sanitizeEvents(events) {
    if (!Array.isArray(events)) return [];
    return events.filter((event) => event && typeof event === 'object' && event.id);
  }

  function getData() {
    if (dataCache) {
      return dataCache;
    }
    return loadData();
  }

  window.DataStore = {
    loadData,
    saveData,
    resetData,
    replaceData,
    getData,
    getDefault: () => clone(DEFAULT_DATA),
    syncRemote: fetchRemoteSnapshot
  };
})();
