(function () {
  const STORAGE_KEY = 'sirahOfflineDataV1';
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

  function loadData() {
    if (dataCache) return dataCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dataCache = JSON.parse(raw);
        return dataCache;
      }
    } catch (err) {
      console.warn('تعذر قراءة البيانات المخزنة محلياً، سيتم استخدام البيانات الافتراضية.', err);
    }
    dataCache = clone(DEFAULT_DATA);
    saveData();
    return dataCache;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function saveData() {
    if (!dataCache) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataCache));
  }

  function resetData() {
    dataCache = clone(DEFAULT_DATA);
    saveData();
  }

  function replaceData(newData) {
    dataCache = newData;
    saveData();
  }

  window.DataStore = {
    loadData,
    saveData,
    resetData,
    replaceData,
    getDefault: () => clone(DEFAULT_DATA)
  };
})();
