import { useEffect, useMemo, useState } from "react";
import prayerSource from "../../attached_assets/wtimes-iq_kirkuk_alawail_1786906547797.js?raw";

type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

type Prayer = {
  key: PrayerKey;
  name: string;
  time: string;
};

type Settings = {
  prayerOffsets: Record<PrayerKey, number>;
  iqamaDelays: Record<PrayerKey, number>;
  hijriOffset: number;
};

const TIME_ZONE = "Asia/Baghdad";
const SETTINGS_STORAGE_KEY = "mosque-display-settings";

const prayerDefinitions: Array<{ key: PrayerKey; name: string }> = [
  { key: "fajr", name: "الفجر" },
  { key: "sunrise", name: "الشروق" },
  { key: "dhuhr", name: "الظهر" },
  { key: "asr", name: "العصر" },
  { key: "maghrib", name: "المغرب" },
  { key: "isha", name: "العشاء" },
];

function getDefaultSettings(): Settings {
  return {
    prayerOffsets: {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    },
    iqamaDelays: {
      fajr: 10,
      sunrise: 10,
      dhuhr: 10,
      asr: 10,
      maghrib: 10,
      isha: 10,
    },
    hijriOffset: 0,
  };
}

function clampMinutes(value: number) {
  return Math.max(-180, Math.min(180, Math.round(value)));
}

function adjustPrayerTime(time: string, offset: number) {
  if (time === "--:--") return time;
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = (hours * 60 + minutes + offset + 1440) % 1440;
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(
    totalMinutes % 60,
  ).padStart(2, "0")}`;
}

function parsePrayerTimes(source: string): Map<string, string[]> {
  const rows = new Map<string, string[]>();
  const rowPattern = /["'](\d{2}-\d{2})~~~~~([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(source)) !== null) {
    rows.set(match[1], match[2].split("|"));
  }

  return rows;
}

const prayerTimes = parsePrayerTimes(prayerSource);

function toLatinDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function getBaghdadParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function getBaghdadDate() {
  const parts = getBaghdadParts();
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

function getCalendarParts(
  date: Date,
  calendar: "gregory" | "islamic-umalqura",
) {
  const formatter = new Intl.DateTimeFormat(
    calendar === "gregory" ? "ar-IQ" : "ar-IQ-u-ca-islamic-umalqura",
    {
      timeZone: TIME_ZONE,
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
  const parts = formatter.formatToParts(date);
  return {
    day: parts.find((part) => part.type === "day")?.value ?? "",
    month: parts.find((part) => part.type === "month")?.value ?? "",
    year: parts.find((part) => part.type === "year")?.value ?? "",
  };
}

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatCountdown(totalSeconds: number, withSeconds = false) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const base = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return withSeconds ? `${base}:${String(seconds).padStart(2, "0")}` : base;
}

function makePrayerList(date: Date, offsets: Record<PrayerKey, number>): Prayer[] {
  const parts = getBaghdadParts(date);
  const dayKey = `${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  const times = prayerTimes.get(dayKey) ?? prayerTimes.get("01-01") ?? [];

  return prayerDefinitions.map((definition, index) => ({
    ...definition,
    time: adjustPrayerTime(times[index] ?? "--:--", offsets[definition.key] ?? 0),
  }));
}

function getNextPrayer(prayers: Prayer[], now: Date) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const upcoming = prayers.find(
    (prayer) => prayer.time !== "--:--" && toMinutes(prayer.time) > currentMinutes,
  );

  if (upcoming) {
    const target = new Date(now);
    const [hours, minutes] = upcoming.time.split(":").map(Number);
    target.setHours(hours, minutes, 0, 0);
    return { prayer: upcoming, target };
  }

  const first = prayers[0];
  const target = new Date(now);
  const [hours, minutes] = (first?.time ?? "00:00").split(":").map(Number);
  target.setDate(target.getDate() + 1);
  target.setHours(hours, minutes, 0, 0);
  return { prayer: first, target };
}

function App() {
  const [now, setNow] = useState(() => new Date());
  const [settings, setSettings] = useState<Settings>(() => getDefaultSettings());
  const [settingsReady, setSettingsReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Settings> & {
          iqamaDelay?: number;
        };
        const defaults = getDefaultSettings();
        const legacyIqamaDelay = Number(parsed.iqamaDelay);
        const storedIqamaDelays: Partial<Record<PrayerKey, number>> =
          parsed.iqamaDelays ?? {};
        const iqamaDelays = { ...defaults.iqamaDelays };

        for (const definition of prayerDefinitions) {
          const savedValue = Number(storedIqamaDelays[definition.key]);
          const value = Number.isFinite(savedValue)
            ? savedValue
            : Number.isFinite(legacyIqamaDelay)
              ? legacyIqamaDelay
              : defaults.iqamaDelays[definition.key];
          iqamaDelays[definition.key] = clampMinutes(value);
        }

        setSettings({
          prayerOffsets: {
            ...defaults.prayerOffsets,
            ...(parsed.prayerOffsets ?? {}),
          },
          iqamaDelays,
          hijriOffset: clampMinutes(Number(parsed.hijriOffset ?? defaults.hijriOffset)),
        });
      }
    } catch {
      // Use the defaults when local storage is unavailable or malformed.
    } finally {
      setSettingsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings, settingsReady]);

  const baghdadDate = useMemo(() => getBaghdadDate(), [now]);
  const prayers = useMemo(
    () => makePrayerList(now, settings.prayerOffsets),
    [now, settings.prayerOffsets],
  );
  const nextPrayer = useMemo(
    () => getNextPrayer(prayers, baghdadDate),
    [prayers, baghdadDate],
  );
  const secondsToNext = Math.floor(
    (nextPrayer.target.getTime() - baghdadDate.getTime()) / 1000,
  );
  const nextIqamaDelay = nextPrayer.prayer
    ? settings.iqamaDelays[nextPrayer.prayer.key] ?? 0
    : 0;
  const hijriDate = useMemo(() => {
    const adjustedDate = new Date(now);
    adjustedDate.setDate(adjustedDate.getDate() + settings.hijriOffset);
    return adjustedDate;
  }, [now, settings.hijriOffset]);
  const hijri = useMemo(
    () => getCalendarParts(hijriDate, "islamic-umalqura"),
    [hijriDate],
  );
  const gregorian = useMemo(() => getCalendarParts(now, "gregory"), [now]);

  const changePrayerOffset = (key: PrayerKey, amount: number) => {
    setSettings((current) => ({
      ...current,
      prayerOffsets: {
        ...current.prayerOffsets,
        [key]: clampMinutes((current.prayerOffsets[key] ?? 0) + amount),
      },
    }));
  };

  const setPrayerOffset = (key: PrayerKey, value: string) => {
    const parsed = Number(value);
    setSettings((current) => ({
      ...current,
      prayerOffsets: {
        ...current.prayerOffsets,
        [key]: clampMinutes(Number.isFinite(parsed) ? parsed : 0),
      },
    }));
  };

  const changeIqama = (key: PrayerKey, amount: number) => {
    setSettings((current) => ({
      ...current,
      iqamaDelays: {
        ...current.iqamaDelays,
        [key]: clampMinutes((current.iqamaDelays[key] ?? 0) + amount),
      },
    }));
  };

  const setIqama = (key: PrayerKey, value: string) => {
    const parsed = Number(value);
    setSettings((current) => ({
      ...current,
      iqamaDelays: {
        ...current.iqamaDelays,
        [key]: clampMinutes(Number.isFinite(parsed) ? parsed : 0),
      },
    }));
  };

  const changeHijriOffset = (amount: number) => {
    setSettings((current) => ({
      ...current,
      hijriOffset: clampMinutes(current.hijriOffset + amount),
    }));
  };

  const setHijriOffset = (value: string) => {
    const parsed = Number(value);
    setSettings((current) => ({
      ...current,
      hijriOffset: clampMinutes(Number.isFinite(parsed) ? parsed : 0),
    }));
  };

  return (
    <main className="mosque-screen" dir="rtl">
      <div className="soft-pattern" aria-hidden="true" />

      <button
        className="settings-button"
        type="button"
        aria-label="فتح إعدادات أوقات الصلاة"
        title="الإعدادات"
        onClick={() => setSettingsOpen(true)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm9 3.8-2-.7a7.3 7.3 0 0 0-.7-1.7l.9-1.9-1.8-1.8-1.9.9a7.3 7.3 0 0 0-1.7-.7l-.7-2h-2.5l-.7 2a7.3 7.3 0 0 0-1.7.7l-1.9-.9L4.5 7.7l.9 1.9a7.3 7.3 0 0 0-.7 1.7l-2 .7v2.5l2 .7c.2.6.4 1.2.7 1.7l-.9 1.9 1.8 1.8 1.9-.9c.5.3 1.1.5 1.7.7l.7 2h2.5l.7-2c.6-.2 1.2-.4 1.7-.7l1.9.9 1.8-1.8-.9-1.9c.3-.5.5-1.1.7-1.7l2-.7v-2.5Z" />
        </svg>
      </button>

      <section className="clock-frame" aria-label="الساعة الحالية">
        <time dateTime={now.toISOString()}>{formatClock(now)}</time>
      </section>

      <section className="date-block" aria-label="التاريخ">
        <strong className="weekday">
          {new Intl.DateTimeFormat("ar-IQ", {
            timeZone: TIME_ZONE,
            weekday: "long",
          }).format(now)}
        </strong>
        <div className="date-line">
          <span>{toLatinDigits(hijri.day)}</span>
          <span>{hijri.month}</span>
          <span>{toLatinDigits(hijri.year)}</span>
        </div>
        <div className="date-line gregorian-line">
          <span>{toLatinDigits(gregorian.day)}</span>
          <span>{gregorian.month}</span>
          <span>{toLatinDigits(gregorian.year)}</span>
        </div>
      </section>

      <section className="prayer-list" aria-label="أوقات الصلاة">
        {prayers.map((prayer) => (
          <div className="prayer-row" key={prayer.key}>
            <time>{prayer.time}</time>
            <strong>{prayer.name}</strong>
          </div>
        ))}
      </section>

      <footer className="countdown-footer">
        <div className="countdown-column">
          <span>المتبقي للإقامة</span>
          <strong>{formatCountdown(secondsToNext + nextIqamaDelay * 60)}</strong>
        </div>
        <div className="countdown-column">
          <span>الأذان التالي</span>
          <strong>{formatCountdown(secondsToNext)}</strong>
        </div>
      </footer>

      {settingsOpen && (
        <div
          className="settings-layer"
          role="presentation"
          onClick={() => setSettingsOpen(false)}
        >
          <section
            className="settings-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="settings-header">
              <div>
                <span>لوحة التحكم</span>
                <h2 id="settings-title">إعدادات المواقيت</h2>
              </div>
              <button
                className="settings-close"
                type="button"
                aria-label="إغلاق الإعدادات"
                onClick={() => setSettingsOpen(false)}
              >
                ×
              </button>
            </header>

            <p className="settings-description">
              اضبط وقت الأذان ووقت الإقامة لكل صلاة بشكل مستقل حسب توجيه إمام المسجد.
            </p>

            <div className="settings-prayers">
              {prayers.map((prayer) => (
                <div className="settings-row" key={prayer.key}>
                  <div>
                    <strong>{prayer.name}</strong>
                    <small>الوقت المعدل: {prayer.time}</small>
                  </div>
                  <div className="prayer-controls">
                    <label className="control-field">
                      <span>الأذان</span>
                      <div className="minute-control">
                        <button
                          type="button"
                          aria-label={`إنقاص دقائق أذان ${prayer.name}`}
                          onClick={() => changePrayerOffset(prayer.key, -1)}
                        >
                          −
                        </button>
                        <input
                          aria-label={`تعديل دقائق أذان ${prayer.name}`}
                          type="number"
                          min="-180"
                          max="180"
                          value={settings.prayerOffsets[prayer.key]}
                          onChange={(event) => setPrayerOffset(prayer.key, event.target.value)}
                        />
                        <button
                          type="button"
                          aria-label={`زيادة دقائق أذان ${prayer.name}`}
                          onClick={() => changePrayerOffset(prayer.key, 1)}
                        >
                          +
                        </button>
                        <em>دقيقة</em>
                      </div>
                    </label>
                    <label className="control-field">
                      <span>الإقامة</span>
                      <div className="minute-control">
                        <button
                          type="button"
                          aria-label={`إنقاص دقائق إقامة ${prayer.name}`}
                          onClick={() => changeIqama(prayer.key, -1)}
                        >
                          −
                        </button>
                        <input
                          aria-label={`تعديل دقائق إقامة ${prayer.name}`}
                          type="number"
                          min="-180"
                          max="180"
                          value={settings.iqamaDelays[prayer.key]}
                          onChange={(event) => setIqama(prayer.key, event.target.value)}
                        />
                        <button
                          type="button"
                          aria-label={`زيادة دقائق إقامة ${prayer.name}`}
                          onClick={() => changeIqama(prayer.key, 1)}
                        >
                          +
                        </button>
                        <em>دقيقة</em>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="settings-special">
              <div className="settings-row">
                <div>
                  <strong>تصحيح التاريخ الهجري</strong>
                  <small>التعديل بالأيام (+ أو −)</small>
                </div>
                <div className="minute-control">
                  <button
                    type="button"
                    aria-label="إنقاص يوم من التاريخ الهجري"
                    onClick={() => changeHijriOffset(-1)}
                  >
                    −
                  </button>
                  <input
                    aria-label="تعديل التاريخ الهجري بالأيام"
                    type="number"
                    min="-180"
                    max="180"
                    value={settings.hijriOffset}
                    onChange={(event) => setHijriOffset(event.target.value)}
                  />
                  <button
                    type="button"
                    aria-label="زيادة يوم في التاريخ الهجري"
                    onClick={() => changeHijriOffset(1)}
                  >
                    +
                  </button>
                  <em>يوم</em>
                </div>
              </div>
            </div>

            <div className="settings-actions">
              <button
                className="reset-button"
                type="button"
                onClick={() => setSettings(getDefaultSettings())}
              >
                إعادة الضبط
              </button>
              <button
                className="save-button"
                type="button"
                onClick={() => setSettingsOpen(false)}
              >
                حفظ وإغلاق
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;