"use strict";

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const PX = 66; // عرض هر ضرب روی نوار نت‌ها (پیکسل)
  const MAX_NOTES = 12;
  const PITCHES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const SEMITONES = Object.fromEntries(PITCHES.map((name, i) => [name, i]));
  const KEYMAP = { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "-": 10, "=": 11 };

  const SCALES = {
    // ترتیب درجات عمداً با چیدمان قابل‌نواختن هنگ‌درام تنظیم شده است.
    // هر عدد فاصله (نیم‌پرده) از نت پایه است و در هر کوک تکراری نیست.
    major: { name: "C Major", root: "C", intervals: [0, 7, 12, 14, 16, 17, 19, 21, 24, 26] },
    bella: { name: "E Minor (Bella Ciao)", root: "E", intervals: [0, 7, 12, 14, 15, 17, 19, 20, 24, 26, 27, 29] },
    kurd: { name: "D Kurd", root: "D", intervals: [0, 7, 10, 12, 14, 15, 17, 19, 22, 24, 26, 29] },
    minor: { name: "A Minor", root: "A", intervals: [0, 7, 12, 2, 3, 5, 8, 10, 14, 17] },
    celtic: { name: "D Celtic", root: "D", intervals: [0, 7, 10, 12, 14, 18, 19, 22, 24, 26, 29, 31] },
    dorian: { name: "E Dorian (Scarborough Fair)", root: "E", intervals: [0, 7, 12, 14, 15, 17, 19, 21, 22, 24] },
    risingsun: { name: "A Minor (House of the Rising Sun)", root: "A", intervals: [0, 7, 12, 2, 3, 5, 8, 10, 14, 17] },
    em: { name: "E Minor (Greensleeves)", root: "E", intervals: [0, 7, 12, 14, 15, 17, 19, 10, 24, 26] },
    custom: { name: "کوک سفارشی", root: "D", intervals: [0, 7, 10, 12, 14, 15, 17, 19, 22, 24, 26, 29] }
  };

  // قالب قطعه‌ها: «شماره‌ی نت روی ساز : کشش». R = سکوت.
  // q=سیاه، h=سفید، w=گرد، e=چنگ، s=دولاچنگ؛ نقطه=افزایش ۵۰٪ کشش.
  const songs = [
    {
      id: "scarborough", title: "Scarborough Fair",
      artist: "ترانه‌ی سنتی انگلیسی", level: "آسان", icon: "❦",
      bpm: 96, meter: [3, 4],
      instrument: { preset: "dorian", root: "E", octave: 3, count: 10 },
      description: "تنظیم ملودیک در E Dorian؛ جمله‌بندی سه‌ضربی با فرودهای روشن روی نت مرکزی.",
      notes: [
        "2:q", "3:q", "4:h", "3:q", "2:q", "8:q", "2:q", "3:q", "4:h",
        "R:q", "4:q", "5:q", "6:h", "5:q", "4:q", "3:q", "2:q", "3:h",
        "R:q", "6:q", "6:q", "5:q", "4:h", "3:q", "2:q", "8:q", "7:q", "6:h",
        "2:q", "3:q", "4:h", "5:q", "4:q", "3:q", "2:q", "8:q", "2:h"
      ]
    },
    {
      id: "risingsun", title: "House of the Rising Sun",
      artist: "ترانه‌ی سنتی آمریکایی", level: "متوسط", icon: "☀",
      bpm: 104, meter: [6, 8],
      instrument: { preset: "risingsun", root: "A", octave: 3, count: 10 },
      description: "تنظیم در لا مینور با آرپژهای قابل‌نواختن و حس ۶/۸؛ فرودهای جمله روی A.",
      notes: [
        "0:q", "1:q", "2:q", "1:q", "4:q", "1:q",
        "0:q", "1:q", "2:q", "7:q", "6:q", "5:q",
        "2:q", "8:q", "9:q", "8:q", "7:q", "6:q",
        "5:q", "6:q", "7:q", "8:q", "7:q", "6:q",
        "0:q", "3:q", "4:q", "5:q", "6:q", "7:q",
        "6:q", "5:q", "4:q", "3:q", "0:q", "0:q"
      ]
    },
    {
      id: "bellaciao", title: "Bella Ciao",
      artist: "ترانه‌ی مردمی ایتالیایی", level: "متوسط", icon: "✿",
      bpm: 116, meter: [4, 4],
      instrument: { preset: "bella", root: "E", octave: 3, count: 9 },
      description: "ملودی Bella Ciao در می‌نور، شامل بخش اول، «O bella ciao» و بخش بالای پایانی.",
      notes: [
        "1:e", "2:e", "3:e",
        "4:e", "2:h", "1:e", "2:e", "3:e",
        "4:e", "2:h", "1:e", "2:e", "3:e",

        "4:q", "3:e", "2:e", "4:q", "3:e", "2:e",
        "6:q", "6:q", "6:e", "6:e", "5:e", "6:e",

        "7:e", "7:h", "7:e", "6:e", "5:e",
        "7:e", "6:h", "6:e", "5:e", "4:e",

        "3:q", "6:q", "4:q", "3:q",
        "2:w"
      ]
    },
    {
      id: "ode", title: "سرود شادی", artist: "Beethoven · Ode to Joy",
      level: "آسان", icon: "♫", bpm: 112, meter: [4, 4],
      instrument: { preset: "major", root: "C", octave: 3, count: 10 },
      description: "تنظیم در دو ماژور با حرکت پله‌ای، تکرار موتیف و پایان‌بندی روی تونیک.",
      notes: [
        "4:q", "4:q", "5:q", "6:q", "6:q", "5:q", "4:q", "3:q",
        "2:q", "2:q", "3:q", "4:q", "4:q.", "3:e", "3:h",
        "4:q", "4:q", "5:q", "6:q", "6:q", "5:q", "4:q", "3:q",
        "2:q", "2:q", "3:q", "4:q", "3:q.", "2:e", "2:h"
      ]
    },
    {
      id: "twinkle", title: "ستاره‌ی کوچک",
      artist: "Twinkle, Twinkle, Little Star",
      level: "آسان", icon: "✦", bpm: 92, meter: [4, 4],
      instrument: { preset: "major", root: "C", octave: 3, count: 10 },
      description: "ملودی کامل در دو ماژور با تکرارهای متقارن و فرود درست روی تونیک.",
      notes: [
        "2:q", "2:q", "6:q", "6:q", "7:q", "7:q", "6:h",
        "5:q", "5:q", "4:q", "4:q", "3:q", "3:q", "2:h",
        "6:q", "6:q", "5:q", "5:q", "4:q", "4:q", "3:h",
        "6:q", "6:q", "5:q", "5:q", "4:q", "4:q", "3:h",
        "2:q", "2:q", "6:q", "6:q", "7:q", "7:q", "6:h"
      ]
    },
    {
      id: "greensleeves", title: "Greensleeves",
      artist: "ملودی سنتی انگلیسی", level: "متوسط", icon: "❋",
      bpm: 84, meter: [3, 4],
      instrument: { preset: "em", root: "E", octave: 3, count: 10 },
      description: "تنظیم در می مینور؛ ملودی با حرکت B–D–E و فرودهای متناسب با رنگ مینور.",
      notes: [
        "1:q", "7:q", "2:h", "3:q", "4:q", "3:q",
        "2:h", "7:q", "1:q", "4:h", "5:q", "1:q",
        "2:h", "R:q", "1:q", "4:q", "2:h",
        "3:q", "4:q", "5:q", "4:h", "3:q", "2:q",
        "1:h", "2:h"
      ]
    },
    {
      id: "rain", title: "قدم‌های باران",
      artist: "تمرین اختصاصی", level: "آسان", icon: "〰",
      bpm: 78, meter: [4, 4],
      instrument: { preset: "kurd", root: "D", octave: 3, count: 9 },
      description: "اتود سه‌میزانی در رِ کُرد؛ سکوت‌های چنگی و پاسخ ملودیک با فرود روی Ding.",
      notes: [
        "0:q", "4:e", "R:e", "2:q", "5:e", "R:e", "3:q", "6:q",
        "4:q", "0:q", "2:q", "R:q", "0:h"
      ]
    },
    {
      id: "waves", title: "موج آرام",
      artist: "تمرین آرپژ", level: "متوسط", icon: "☼",
      bpm: 88, meter: [4, 4],
      instrument: { preset: "kurd", root: "D", octave: 3, count: 9 },
      description: "آرپژ دو میزانی با حرکت رفت‌وبرگشت، فضای تنفسی و بازگشت به نت مرکزی.",
      notes: [
        "0:e", "1:e", "3:q", "4:e", "5:e", "4:q", "3:q", "R:e", "1:e",
        "2:q", "0:q"
      ]
    }
  ];

  const lessons = [
    {
      title: "۱. آشنایی با نت مرکزی",
      text: "نت مرکزی یا Ding نقطه‌ی شروع خوبی برای شناخت رنگ صوتی ساز است.",
      tip: "یک نت مرکزی (شماره‌ی ۰) بنواز و تا پایان طنین آن گوش بده.",
      notes: ["0:h", "R:q", "0:q"]
    },
    {
      title: "۲. شناخت نت‌ها",
      text: "با چند نت نزدیک شروع کن و جای آن‌ها را به خاطر بسپار.",
      tip: "الگوی کوتاه را آهسته بنواز و سپس با سرعت بیشتر تکرار کن.",
      notes: ["1:q", "3:q", "4:q", "3:q", "1:h"]
    },
    {
      title: "۳. ریتم و سکوت",
      text: "سکوت هم بخشی از موسیقی است؛ همیشه لازم نیست ضربه بزنی.",
      tip: "به فاصله‌ی سکوت بین دو نت توجه کن.",
      notes: ["0:q", "R:e", "4:e", "R:q", "2:h"]
    },
    {
      title: "۴. ساخت اولین جمله",
      text: "از یک الگوی کوتاه شروع کن و در پایان به نت مرکزی برگرد.",
      tip: "هر بار فقط یک نت تازه به جمله اضافه کن.",
      notes: ["0:q", "2:e", "4:e", "5:q", "4:q", "2:q", "0:h"]
    }
  ];

  const DURATIONS = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25 };

  // ---------- وضعیت ----------
  let audio = null, master = null, convolver = null, dryGain = null, wetGain = null;

  let instrument = {
    preset: "kurd", root: "D", octave: 3, count: 9,
    timbre: "warm", sustain: 2.2, reverb: 30, fine: 0,
    layout: "circle", customFrequencies: null
  };

  let notes = [];
  let pattern = [];
  let generatedPattern = [];
  let title = "تمرین آزاد";
  let baseBpm = 90;
  let meter = [4, 4];

  let playing = false;
  let paused = false;
  let currentIndex = 0;
  let startedAt = 0;
  let pausedSeconds = 0;
  let playTimer = null;
  let rafId = null;
  let scheduledEvents = new Set();
  let nextClick = 0;

  let metronomeTimer = null;
  let metronomeEnabled = false;
  let droneOscillator = null;
  let selectedGenerated = -1;
  let toastTimer = null;

  let loopA = null, loopB = null;
  let practice = null;
  let recState = "idle", recStart = 0, recording = [], recTimers = [];
  let replayTimers = [];
  let taps = [];

  const settings = { speed: 1, loop: false };

  // ---------- ابزارها ----------
  function notify(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  const midiFrequency = midi => 440 * Math.pow(2, (midi - 69) / 12);
  const frequencyToMidi = f => Math.max(0, Math.min(127, Math.round(69 + 12 * Math.log2(f / 440))));
  const getRootMidi = () => (instrument.octave + 1) * 12 + (SEMITONES[instrument.root] ?? 2);
  const currentScale = () => SCALES[instrument.preset] || SCALES.kurd;
  const getInterval = index => currentScale().intervals[index];

  function ensureOption(select, value, text) {
    if (!$$("option", select).some(o => o.value === String(value))) {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = text ?? String(value);
      select.appendChild(option);
    }
  }

  const store = {
    get() { try { return JSON.parse(localStorage.getItem("handpan-patterns") || "[]"); } catch { return []; } },
    set(value) { try { localStorage.setItem("handpan-patterns", JSON.stringify(value)); return true; } catch { notify("ذخیره‌سازی در دسترس نیست."); return false; } }
  };

  // ---------- نت‌ها و ساز ----------
  function calculateNotes() {
    const scale = currentScale();
    // بیش از تعداد درجات کوک، نت تکراری (هم‌نام و هم‌صدا) تولید می‌شد؛ پس سقف می‌گذاریم.
    instrument.count = Math.max(1, Math.min(instrument.count, scale.intervals.length, MAX_NOTES));

    const rootMidi = getRootMidi();
    const custom = instrument.customFrequencies;
    notes = [];

    for (let i = 0; i < instrument.count; i++) {
      const midi = rootMidi + getInterval(i);
      const name = PITCHES[((midi % 12) + 12) % 12];
      let frequency = midiFrequency(midi) * Math.pow(2, instrument.fine / 1200);
      if (custom && Number.isFinite(custom[i]) && custom[i] > 0) frequency = custom[i];

      notes.push({
        index: i, midi, name,
        octave: Math.floor(midi / 12) - 1,
        label: name + (Math.floor(midi / 12) - 1),
        frequency
      });
    }
  }

  // ساخت دکمه‌های ساز (تا ۱۲ نت). هر دکمه شماره‌ی یکتای خودش را دارد.
  function buildTones() {
    const pan = $("#handpan");
    $$(".tone", pan).forEach(b => b.remove());

    for (let i = 0; i < MAX_NOTES; i++) {
      const button = document.createElement("button");
      button.className = "tone";
      button.dataset.note = i;
      button.type = "button";
      button.innerHTML = "<b></b><small></small>";

      // نواختن بدون تأخیر با لمس/ماوس
      button.addEventListener("pointerdown", event => {
        if (event.button > 0) return;
        event.preventDefault();
        liveNote(i);
      });
      // کلیک واقعی ماوس/لمس قبلاً در pointerdown پردازش شده؛ کلیک صفحه‌کلید/برنامه‌ای detail=0 دارد.
      button.addEventListener("click", event => {
        if (event.detail !== 0) return;
        liveNote(i);
      });
      pan.appendChild(button);
    }
  }

  function layoutTones() {
    const n = notes.length;
    const compact = instrument.layout === "compact";
    const ringR = compact ? 30 : 36;
    const m = Math.max(1, n - 1);
    const ringSize = Math.max(11, Math.min(22, 2 * Math.PI * ringR / m * 0.86));
    const dingSize = compact ? 24 : 27;

    $$("#handpan .tone").forEach(button => {
      const i = Number(button.dataset.note);
      button.hidden = i >= n;
      if (i >= n) return;
      let x = 50, y = 50, size = dingSize;
      if (i > 0) {
        const angle = (-90 + (i - 0.5) * 360 / m) * Math.PI / 180;
        x = 50 + ringR * Math.cos(angle);
        y = 50 + ringR * Math.sin(angle);
        size = ringSize;
      }
      button.style.left = x + "%";
      button.style.top = y + "%";
      button.style.width = size + "%";
    });
  }

  // قطعه‌ی بارگذاری‌شده: کلیدهای استفاده‌شده مشخص و بقیه کم‌رنگ می‌شوند.
  function markUsedKeys() {
    const used = new Set(pattern.filter(e => e.note != null).map(e => e.note));
    $$("#handpan .tone").forEach(button => {
      const i = Number(button.dataset.note);
      button.classList.toggle("used", used.size > 0 && used.has(i));
      button.classList.toggle("unused", used.size > 0 && !used.has(i));
    });
  }

  // ---------- صدا ----------
  function ensureAudio() {
    if (!audio) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        notify("مرورگر شما Web Audio را پشتیبانی نمی‌کند.");
        return false;
      }

      audio = new AudioContextClass();
      master = audio.createGain();
      master.gain.value = Math.min(1.5, Number($("#volume").value) / 100);

      dryGain = audio.createGain();
      wetGain = audio.createGain();
      dryGain.gain.value = 0.9;
      wetGain.gain.value = instrument.reverb / 100;

      const length = audio.sampleRate * 2;
      const impulse = audio.createBuffer(2, length, audio.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
        }
      }

      convolver = audio.createConvolver();
      convolver.buffer = impulse;

      dryGain.connect(master);
      wetGain.connect(convolver);
      convolver.connect(master);
      master.connect(audio.destination);
    }

    if (audio.state === "suspended") audio.resume();
    $("#audioDot").classList.add("ready");
    $("#audioLabel").textContent = "موتور صدا فعال است";
    return true;
  }

  function playTone(index, options = {}) {
    if (!ensureAudio()) return null;

    const note = notes[index];
    if (!note) return null;

    const frequency = options.frequency ?? note.frequency;
    const now = options.when ?? audio.currentTime;
    const velocity = Math.max(0.02, Math.min(1, options.velocity ?? 0.65));
    const duration = instrument.sustain;
    const voice = audio.createGain();
    const filter = audio.createBiquadFilter();

    const cutoff = { warm: 2800, bright: 7000, deep: 1200, metal: 10000 }[instrument.timbre] || 2800;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, now);

    const peak = velocity * 0.40;
    voice.gain.setValueAtTime(0.0001, now);
    voice.gain.exponentialRampToValueAtTime(peak, now + 0.012);
    voice.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.4), now + 0.12);
    voice.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    filter.connect(voice);
    voice.connect(dryGain);
    voice.connect(wetGain);

    const partials = instrument.timbre === "metal"
      ? [[1, 0.8], [2.76, 0.25], [4.13, 0.13], [6.2, 0.06]]
      : [[1, 0.8], [2, 0.20], [3.01, 0.08], [4.2, 0.03]];

    for (const [ratio, amplitude] of partials) {
      const oscillator = audio.createOscillator();
      const partialGain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency * ratio, now);
      oscillator.detune.setValueAtTime(instrument.timbre === "metal" ? 2 : -1, now);
      partialGain.gain.value = amplitude;
      oscillator.connect(partialGain);
      partialGain.connect(filter);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.04);
    }

    // نمایش ضربه روی ساز؛ اگر نت برای آینده زمان‌بندی شده، نمایش هم به همان لحظه موکول می‌شود.
    const delay = Math.max(0, (now - audio.currentTime) * 1000);
    setTimeout(() => {
      const button = $(`#handpan .tone[data-note="${index}"]`);
      if (button) {
        button.classList.add("hit");
        setTimeout(() => button.classList.remove("hit"), 170);
      }
      $("#lastNote").textContent = "آخرین نت: " + note.label;
      $("#nextName").textContent = note.label;
      $("#nextHand").textContent = index % 2 ? "دست چپ" : "دست راست";
    }, delay);

    return note;
  }

  // ---------- نت‌نویسی ----------
  function parseDuration(symbol) {
    const dotted = symbol.endsWith(".");
    const base = dotted ? symbol.slice(0, -1) : symbol;
    if (!(base in DURATIONS)) throw new Error("کشش نامعتبر: " + symbol);
    return DURATIONS[base] * (dotted ? 1.5 : 1);
  }

  function parseScoreToken(token, beat) {
    const parts = token.split(":");
    if (parts.length !== 2) throw new Error("رویداد نامعتبر: " + token);

    const pitch = parts[0].trim().toUpperCase();
    const notation = parts[1].trim();
    const duration = parseDuration(notation);
    const isRest = pitch === "R";

    if (!isRest && !/^\d+$/.test(pitch)) throw new Error("شماره‌ی نت نامعتبر: " + pitch);

    const note = isRest ? null : Number(pitch);
    if (note !== null && (note < 0 || note >= instrument.count)) {
      throw new Error("نت " + note + " خارج از محدوده‌ی ساز فعلی است.");
    }

    return { note, beat, duration, type: isRest ? "rest" : "note", notation, velocity: 0.65 };
  }

  function createEvents(input) {
    let beat = 0;
    return input.map(token => {
      const event = parseScoreToken(token, beat);
      beat += event.duration;
      return event;
    });
  }

  function patternBeats() {
    if (!pattern.length) return 0;
    return Math.max(...pattern.map(event => event.beat + event.duration));
  }

  const effectiveBpm = () => Math.max(1, baseBpm * settings.speed);
  const durationSeconds = () => patternBeats() * 60 / effectiveBpm();
  const beatToSeconds = beat => beat * 60 / effectiveBpm();

  function currentBeat() {
    const seconds = playing ? (performance.now() - startedAt) / 1000 : pausedSeconds;
    return seconds * effectiveBpm() / 60;
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" +
      String(Math.floor(seconds % 60)).padStart(2, "0");
  }

  function notationSymbol(event) {
    if (event.notation) {
      const base = event.notation.replace(".", "");
      const dotted = event.notation.endsWith(".");
      const symbols = { w: "𝅝", h: "𝅗𝅥", q: "♩", e: "♪", s: "𝅘𝅥𝅯" };
      return (symbols[base] || "♪") + (dotted ? "·" : "");
    }
    if (event.duration >= 4) return "𝅝";
    if (event.duration >= 2) return "𝅗𝅥";
    if (event.duration >= 1) return "♩";
    if (event.duration >= 0.5) return "♪";
    return "𝅘𝅥𝅯";
  }

  function restSymbol(duration) {
    if (duration >= 4) return "𝄻";
    if (duration >= 2) return "𝄼";
    if (duration >= 1) return "𝄽";
    if (duration >= 0.5) return "𝄾";
    return "𝄿";
  }

  // ---------- نوار نت‌ها ----------
  function setPlayhead(beat) {
    $("#playhead").style.left = beat * PX + "px";
  }

  function renderTimeline() {
    const lane = $("#noteLane");
    const ruler = $("#timelineRuler");
    const scroll = $("#timelineScroll");
    lane.innerHTML = "";
    ruler.innerHTML = "";

    if (!pattern.length) {
      lane.innerHTML = '<div class="empty">یک قطعه انتخاب کن یا آزادانه بنواز.</div>';
      lane.style.width = "100%";
      ruler.style.width = "100%";
      $("#playhead").style.display = "none";
      $("#totalTime").textContent = "00:00";
      $("#currentTime").textContent = "00:00";
      $("#seek").value = 0;
      $("#timelineTitle").textContent = "نوار نت‌ها";
      $("#timelineSubtitle").textContent = "قطعه یا بداهه را انتخاب کن.";
      markUsedKeys();
      return;
    }

    const beats = patternBeats();
    const beatsPerBar = meter[0] * 4 / meter[1];
    const width = Math.max(scroll.clientWidth, beats * PX + 40);

    lane.style.width = width + "px";
    ruler.style.width = width + "px";
    $("#playhead").style.display = "block";

    for (let bar = 0; bar <= Math.ceil(beats / beatsPerBar); bar++) {
      const label = document.createElement("span");
      label.className = "bar-label";
      label.style.left = (bar * beatsPerBar * PX) + "px";
      label.textContent = String(bar + 1);
      ruler.appendChild(label);
    }

    pattern.forEach((event, index) => {
      const block = document.createElement("button");
      const rest = event.note == null;
      const note = rest ? null : notes[event.note];

      block.className = "timeline-note";
      if (rest) block.classList.add("rest-note");
      else if (event.note % 2) block.classList.add("left");

      block.dataset.index = index;
      block.style.left = (event.beat * PX + 2) + "px";
      block.style.width = Math.max(12, event.duration * PX - 4) + "px";

      if (rest) {
        block.innerHTML = `<b>${restSymbol(event.duration)}</b><small>سکوت · ${event.duration} ضرب</small>`;
        block.title = `سکوت · ${event.duration} ضرب`;
      } else {
        // شماره‌ی نت (همان عدد روی ساز) بزرگ، نام نت کوچک
        block.innerHTML = `<b>${event.note}</b><small>${note ? note.name : "؟"} ${notationSymbol(event)} · ${event.duration} ضرب</small>`;
        block.title = `نت ${event.note} · ${note?.label || ""} · ${event.duration} ضرب`;
      }

      block.addEventListener("click", () => seekToIndex(index));
      lane.appendChild(block);
    });

    $("#timelineTitle").textContent = title;
    $("#timelineSubtitle").textContent =
      `${pattern.length} رویداد · میزان ${meter[0]}/${meter[1]} · ${baseBpm} BPM`;
    $("#totalTime").textContent = formatTime(durationSeconds());
    updateTransportUI();
    markUsedKeys();
    markLoop();
    markTarget();
  }

  function renderInstrument() {
    calculateNotes();
    layoutTones();

    $$("#handpan .tone").forEach(button => {
      const index = Number(button.dataset.note);
      const note = notes[index];
      if (!note) return;
      $("b", button).textContent = index; // شماره‌ی یکتا، همان عددی که در نت‌نویسی قطعه‌ها آمده
      $("small", button).textContent = index === 0 ? note.name + " · DING" : note.name;
      button.title = `نت ${index} · ${note.label} · ${note.frequency.toFixed(2)} Hz`;
    });

    ensureOption($("#noteCountSelect"), instrument.count);
    $("#noteCountSelect").value = String(instrument.count);

    const dingName = $("#dingName");
    if (dingName) dingName.textContent = notes[0]?.name || "—";
    const scaleName = currentScale().name;
    $("#sideScale").textContent = `${scaleName} · ${notes.length} نت`;
    $("#scaleLabel").textContent = scaleName;
    $("#countLabel").textContent = notes.length;
    $("#handpan").classList.toggle("compact", instrument.layout === "compact");

    if (droneOscillator && audio) {
      droneOscillator.frequency.setTargetAtTime(notes[0].frequency / 2, audio.currentTime, 0.05);
    }

    renderTuning();
    renderTimeline();
  }

  // ---------- پخش ----------
  function stopPlayback(reset = true) {
    playing = false;
    paused = false;
    clearTimeout(playTimer);
    cancelAnimationFrame(rafId);
    playTimer = null;
    rafId = null;
    stopReplay();

    if (reset) {
      currentIndex = 0;
      pausedSeconds = 0;
      setPlayhead(0);
      $("#timelineScroll").scrollLeft = 0;
      $$(".timeline-note").forEach(el => el.classList.remove("current"));
    }

    $("#playBtn").textContent = "▶";
    updateTransportUI();
  }

  function pausePlayback() {
    if (!playing) return;
    pausedSeconds = Math.max(0, Math.min(durationSeconds(), (performance.now() - startedAt) / 1000));
    playing = false;
    paused = true;
    clearTimeout(playTimer);
    cancelAnimationFrame(rafId);
    $("#playBtn").textContent = "▶";
    updateTransportUI();
  }

  function highlightEvent(index) {
    $$(".timeline-note").forEach((el, i) => el.classList.toggle("current", i === index));
  }

  function findEventAtTime(seconds) {
    const beat = seconds * effectiveBpm() / 60;
    let index = pattern.findIndex(event => event.beat + event.duration > beat + 0.0001);
    if (index < 0) index = pattern.length;
    return index;
  }

  function seekToSeconds(seconds) {
    if (!pattern.length) return;
    const wasPlaying = playing;
    if (playing) pausePlayback();

    pausedSeconds = Math.max(0, Math.min(durationSeconds(), seconds));
    paused = true; // وگرنه شروع بعدی از صفر می‌شد
    currentIndex = Math.min(pattern.length - 1, findEventAtTime(pausedSeconds));

    const beat = pausedSeconds * effectiveBpm() / 60;
    setPlayhead(beat);
    const viewport = $("#timelineScroll");
    const px = beat * PX;
    if (px < viewport.scrollLeft || px > viewport.scrollLeft + viewport.clientWidth - 70) {
      viewport.scrollLeft = Math.max(0, px - 100);
    }
    highlightEvent(currentIndex);
    updateTransportUI();

    if (wasPlaying) startPlayback();
  }

  function seekToIndex(index) {
    if (!pattern.length) return;
    index = Math.max(0, Math.min(index, pattern.length - 1));
    seekToSeconds(beatToSeconds(pattern[index].beat));
  }

  function updateTransportUI() {
    const total = durationSeconds();
    $("#totalTime").textContent = formatTime(total);
    $("#currentTime").textContent = formatTime(pausedSeconds);
    $("#seek").value = total ? Math.round(pausedSeconds / total * 1000) : 0;
  }

  function clickAt(when, accent) {
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = accent ? 1200 : 850;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.12, when + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    osc.connect(gain);
    gain.connect(master);
    osc.start(when);
    osc.stop(when + 0.06);
  }

  function startPlayback() {
    if (!pattern.length) {
      notify("ابتدا قطعه‌ای انتخاب کن یا بداهه بساز.");
      return;
    }
    if (!ensureAudio()) return;

    if (playing) {
      pausePlayback();
      return;
    }

    if (!paused || currentIndex >= pattern.length || pausedSeconds >= durationSeconds() - 0.01) {
      currentIndex = 0;
      pausedSeconds = 0;
    }

    stopReplay();
    playing = true;
    paused = false;
    startedAt = performance.now() - pausedSeconds * 1000;
    scheduledEvents = new Set();
    nextClick = Math.ceil(pausedSeconds * effectiveBpm() / 60 - 1e-6);
    $("#playBtn").textContent = "Ⅱ";

    const beatsPerBar = meter[0] * 4 / meter[1];

    function scheduler() {
      if (!playing) return;

      const bpm = effectiveBpm();
      let elapsed = (performance.now() - startedAt) / 1000;
      const abActive = loopA != null && loopB != null;

      // حلقه‌ی A–B
      if (abActive && elapsed * bpm / 60 >= loopB) {
        elapsed = loopA * 60 / bpm;
        startedAt = performance.now() - elapsed * 1000;
        scheduledEvents.clear();
        nextClick = Math.ceil(loopA - 1e-6);
      }

      const lookAhead = 0.12;

      for (let i = Math.max(0, currentIndex); i < pattern.length; i++) {
        const event = pattern[i];
        if (abActive && event.beat >= loopB - 1e-6) break;
        const eventSeconds = event.beat * 60 / bpm;

        if (eventSeconds < elapsed - 0.06) continue;
        if (eventSeconds - elapsed > lookAhead) break;
        if (scheduledEvents.has(i)) continue;

        if (event.note != null) {
          playTone(event.note, {
            when: audio.currentTime + Math.max(0, eventSeconds - elapsed),
            velocity: event.velocity ?? 0.65
          });
        }
        scheduledEvents.add(i);
      }

      // مترونوم: روی هر ضرب، نه فقط روی شروع نت‌ها
      if (metronomeEnabled) {
        const endBeat = abActive ? loopB : patternBeats();
        while (nextClick < endBeat - 1e-6 && nextClick * 60 / bpm - elapsed < lookAhead) {
          const t = nextClick * 60 / bpm;
          if (t >= elapsed - 0.03) {
            clickAt(audio.currentTime + Math.max(0, t - elapsed), nextClick % beatsPerBar < 0.001);
          }
          nextClick++;
        }
      }

      currentIndex = findEventAtTime(elapsed);

      if (elapsed >= durationSeconds()) {
        if (settings.loop) {
          pausedSeconds = 0;
          currentIndex = 0;
          startedAt = performance.now();
          nextClick = 0;
          scheduledEvents.clear();
          $("#timelineScroll").scrollLeft = 0;
        } else {
          pausedSeconds = durationSeconds();
          stopPlayback(false);
          currentIndex = pattern.length;
          return;
        }
      } else {
        pausedSeconds = elapsed;
      }

      updateTransportUI();
      playTimer = setTimeout(scheduler, 25);
    }

    function animate() {
      if (!playing) return;

      const beat = currentBeat();
      const px = beat * PX;
      setPlayhead(beat);

      const index = findEventAtTime((performance.now() - startedAt) / 1000);
      if (index < pattern.length) highlightEvent(index);

      const viewport = $("#timelineScroll");
      if (px > viewport.scrollLeft + viewport.clientWidth - 70 || px < viewport.scrollLeft) {
        viewport.scrollLeft = Math.max(0, px - 110);
      }

      rafId = requestAnimationFrame(animate);
    }

    scheduler();
    animate();
  }

  function setPattern(events, newTitle, bpm, newMeter = [4, 4]) {
    stopPlayback();
    stopPractice();
    loopA = loopB = null;
    pattern = events.map(event => ({ ...event }));
    title = newTitle;
    baseBpm = Math.max(30, Math.min(220, Number(bpm) || 90));
    meter = newMeter;
    currentIndex = 0;
    pausedSeconds = 0;

    $("#bpm").value = baseBpm;
    $("#tempoLabel").textContent = baseBpm;
    renderTimeline();
    $("#timelineScroll").scrollLeft = 0;
    navigate("play");
  }

  // تغییر تمپو/سرعت بدون پرش در موقعیت پخش
  function changeTempo(apply) {
    const beat = currentBeat();
    apply();
    if (playing) startedAt = performance.now() - beatToSeconds(beat) * 1000;
    else pausedSeconds = beatToSeconds(beat);
    $("#tempoLabel").textContent = baseBpm;
    renderTimeline();
    restartMetronomeTimer();
  }

  // ---------- قطعه‌ها و آموزش ----------
  function applySongInstrument(config) {
    ensureOption($("#preset"), config.preset, SCALES[config.preset]?.name);
    instrument = { ...instrument, ...config, customFrequencies: null };

    $("#preset").value = instrument.preset;
    $("#root").value = instrument.root;
    $("#octave").value = String(instrument.octave);
    renderInstrument();
  }

  function loadSong(song) {
    try {
      if (song.instrument) applySongInstrument(song.instrument);
      const events = createEvents(song.notes);
      setPattern(events, song.title, song.bpm, song.meter);
      notify(`«${song.title}» بارگذاری شد. عدد هر نت روی ساز نوشته شده است.`);
    } catch (error) {
      notify("خطا در نت‌نویسی قطعه: " + error.message);
    }
  }

  function renderSongs() {
    const query = ($("#songSearch").value || "").trim().toLowerCase();
    const level = $("#songFilter").value;

    const filtered = songs.filter(song =>
      `${song.title} ${song.artist} ${song.description}`.toLowerCase().includes(query) &&
      (level === "all" || song.level === level)
    );

    $("#songGrid").innerHTML = filtered.map(song => `
      <article class="song-card">
        <div class="song-art">${song.icon}</div>
        <h3>${song.title}</h3>
        <p>${song.description}</p>
        <div class="song-meta">${song.artist} · ${song.level} · ${song.meter.join("/")} · ${song.bpm} BPM</div>
        <button class="primary" data-load="${song.id}">▶ بارگذاری قطعه</button>
      </article>
    `).join("") || '<div class="empty">قطعه‌ای پیدا نشد.</div>';

    $$("[data-load]").forEach(button => {
      button.addEventListener("click", () => {
        const song = songs.find(item => item && item.id === button.dataset.load);
        if (song) loadSong(song);
      });
    });
  }

  function renderLessons() {
    $("#lessonGrid").innerHTML = lessons.map((lesson, index) => `
      <article class="lesson-card">
        <h3>${lesson.title}</h3>
        <p>${lesson.text}</p>
        <p><b>تمرین:</b> ${lesson.tip}</p>
        <button class="primary" data-lesson="${index}">▶ شنیدن تمرین</button>
      </article>
    `).join("");

    $$("[data-lesson]").forEach(button => {
      button.addEventListener("click", () => {
        const lesson = lessons[Number(button.dataset.lesson)];
        try {
          setPattern(createEvents(lesson.notes), lesson.title, 70, [4, 4]);
        } catch (error) {
          notify("خطا در تمرین: " + error.message);
        }
      });
    });
  }

  // ---------- بداهه ----------
  function generateImprovisation() {
    const mood = $("#mood").value;
    const complexity = $("#complexity").value;
    const targetBeats = Number($("#length").value); // «تعداد ضرب» واقعاً بر حسب ضرب است
    const useDing = $("#useDing").checked;

    const pools = {
      calm: [0, 1, 3, 4, 5, 7],
      dreamy: [0, 2, 4, 5, 7, 8],
      happy: [0, 1, 3, 4, 5, 6, 7],
      mystery: [0, 2, 3, 6, 7, 8],
      rhythm: Array.from({ length: notes.length }, (_, i) => i)
    };

    let pool = pools[mood].filter(index => index < notes.length);
    if (!useDing) pool = pool.filter(index => index !== 0);
    if (!pool.length) pool = notes.length > 1 ? [1] : [0];

    const events = [];
    const bpm = Number($("#genTempo").value);
    let beat = 0;
    let previous = pool[0];
    let i = 0;

    while (beat < targetBeats && events.length < 400) {
      let choices = pool;

      if (complexity === "simple" && Math.random() < 0.65) {
        choices = [previous, previous, 0, 1, 3, 4].filter(index => pool.includes(index));
      } else if (complexity === "medium" && Math.random() < 0.35) {
        choices = pool.filter(index => Math.abs(index - previous) <= 3);
      }
      if (!choices.length) choices = pool;

      let note = choices[Math.floor(Math.random() * choices.length)];
      if (i % 4 === 3 && useDing && Math.random() < 0.65) note = 0;

      const durationOptions = complexity === "simple"
        ? [1, 1, 2, 0.5]
        : complexity === "medium"
          ? [1, 1, 0.5, 0.5, 2]
          : [1, 0.5, 0.5, 0.25, 1.5, 2];
      let duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];

      if (i > 0 && Math.random() < (complexity === "rich" ? 0.18 : 0.10)) {
        const restDuration = Math.min(0.5, duration);
        events.push({
          note: null, beat, duration: restDuration, type: "rest",
          notation: restDuration === 0.5 ? "e" : "s"
        });
        beat += restDuration;
      }

      duration = Math.min(duration, Math.max(0.25, targetBeats - beat));
      events.push({
        note, beat, duration, type: "note",
        notation: duration === 2 ? "h" : duration === 1.5 ? "q." :
          duration === 0.5 ? "e" : duration === 0.25 ? "s" : "q",
        velocity: i % 4 === 0 ? 0.75 : 0.5
      });

      beat += duration;
      previous = note;
      i++;
    }

    generatedPattern = events;
    selectedGenerated = -1;
    $("#generatedTitle").textContent = "بداهه‌ی جدید";
    $("#generatedInfo").textContent =
      `${events.length} رویداد · ${bpm} BPM · ${currentScale().name}`;
    renderGenerated();
    notify("بداهه ساخته شد.");
  }

  function renderGenerated() {
    const root = $("#generatedNotes");
    if (!generatedPattern.length) {
      root.innerHTML = '<div class="empty">برای شروع «ساخت بداهه» را بزن.</div>';
      return;
    }

    root.innerHTML = generatedPattern.map((event, index) => {
      const rest = event.note == null;
      const note = rest ? null : notes[event.note];
      return `<button class="generated-note ${selectedGenerated === index ? "selected" : ""}" data-generated="${index}">
        <b>${rest ? restSymbol(event.duration) : event.note}</b>
        <small>${rest ? "سکوت" : note?.label || ""} · ${event.duration} ضرب</small>
      </button>`;
    }).join("");

    $$("[data-generated]").forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.generated);
        const event = generatedPattern[index];
        if (selectedGenerated === index) {
          if (event.note != null) {
            event.note = (event.note + 1) % notes.length;
          } else {
            event.note = 0;
            event.type = "note";
            event.notation = event.notation || "q";
          }
        }
        selectedGenerated = index;
        renderGenerated();
        if (event.note != null) playTone(event.note);
      });
    });
  }

  // ---------- کوک و تنظیمات ساز ----------
  function renderTuning() {
    const root = $("#tuningList");
    if (!root) return;

    root.innerHTML = notes.map((note, index) => `
      <div class="tuning-row">
        <b>${index === 0 ? "Ding (۰)" : "نت " + index}</b>
        <div>
          <small>${note.label}</small>
          <input type="range" min="-100" max="100" value="0" data-cents="${index}" aria-label="تنظیم سنت">
        </div>
        <input type="number" min="20" max="3000" step="0.01" value="${note.frequency.toFixed(2)}" data-frequency="${index}" aria-label="فرکانس هرتز">
        <button data-preview="${index}" title="شنیدن نت">▶</button>
      </div>
    `).join("");

    $$("[data-frequency]").forEach(input => {
      input.addEventListener("change", () => {
        const index = Number(input.dataset.frequency);
        const value = Number(input.value);

        if (!Number.isFinite(value) || value < 20 || value > 3000) {
          input.value = notes[index].frequency.toFixed(2);
          notify("فرکانس باید بین ۲۰ تا ۳۰۰۰ هرتز باشد.");
          return;
        }

        notes[index].frequency = value;
        instrument.customFrequencies = notes.map(note => note.frequency);
        input.value = value.toFixed(2);
      });
    });

    $$("[data-cents]").forEach(input => {
      input.addEventListener("input", () => {
        const index = Number(input.dataset.cents);
        const midi = getRootMidi() + getInterval(index);
        const base = midiFrequency(midi) * Math.pow(2, instrument.fine / 1200);
        notes[index].frequency = base * Math.pow(2, Number(input.value) / 1200);
        $(`[data-frequency="${index}"]`).value = notes[index].frequency.toFixed(2);
        instrument.customFrequencies = notes.map(note => note.frequency);
      });
    });

    $$("[data-preview]").forEach(button => {
      button.addEventListener("click", () => playTone(Number(button.dataset.preview)));
    });
  }

  function readInstrumentControls() {
    instrument.preset = $("#preset").value || instrument.preset;
    instrument.root = $("#root").value || instrument.root;
    instrument.octave = Number($("#octave").value);
    instrument.count = Number($("#noteCountSelect").value);
    instrument.timbre = $("#timbre").value;
    instrument.reverb = Number($("#reverb").value);
    instrument.sustain = Number($("#sustain").value);
    instrument.fine = Number($("#fineTune").value);
    instrument.layout = $("#layout").value;
  }

  function updateInstrumentLabels() {
    $("#reverbLabel").textContent = instrument.reverb + "%";
    $("#sustainLabel").textContent = Number(instrument.sustain).toFixed(1) + " ثانیه";
    $("#fineLabel").textContent = instrument.fine + " سنت";
  }

  function applyInstrument(resetCustom = false) {
    readInstrumentControls();
    if (resetCustom) instrument.customFrequencies = null;
    if (wetGain) wetGain.gain.setTargetAtTime(instrument.reverb / 100, audio.currentTime, 0.025);
    renderInstrument();
    updateInstrumentLabels();
    notify("تنظیمات ساز اعمال شد.");
  }

  function exportSettings() {
    const data = {
      version: 2,
      instrument,
      frequencies: notes.map(note => ({ label: note.label, frequency: note.frequency }))
    };
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), "handpan-settings.json");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importSettings(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const incoming = data.instrument;
        if (!incoming || !SCALES[incoming.preset]) throw new Error("پروفایل نامعتبر است.");

        instrument = { ...instrument, ...incoming };
        instrument.count = Math.max(1, Math.min(MAX_NOTES, Number(instrument.count) || 9));
        if (!["warm", "bright", "deep", "metal"].includes(instrument.timbre)) instrument.timbre = "warm";
        if (!["circle", "compact"].includes(instrument.layout)) instrument.layout = "circle";
        if (!Array.isArray(instrument.customFrequencies)) instrument.customFrequencies = null;

        ensureOption($("#preset"), instrument.preset, SCALES[instrument.preset].name);
        ensureOption($("#noteCountSelect"), instrument.count);
        $("#preset").value = instrument.preset;
        $("#root").value = instrument.root;
        $("#octave").value = String(instrument.octave);
        $("#noteCountSelect").value = String(instrument.count);
        $("#timbre").value = instrument.timbre;
        $("#reverb").value = instrument.reverb;
        $("#sustain").value = instrument.sustain;
        $("#fineTune").value = instrument.fine;
        $("#layout").value = instrument.layout;

        // applyInstrument مقدار کنترل‌ها را می‌خواند؛ فرکانس‌های سفارشی را نگه می‌داریم.
        const keepCustom = instrument.customFrequencies;
        applyInstrument(false);
        instrument.customFrequencies = keepCustom;
        renderInstrument();
      } catch (error) {
        notify("فایل تنظیمات معتبر نیست: " + error.message);
      }
    };
    reader.readAsText(file);
  }

  function navigate(page) {
    $$(".page").forEach(section => section.classList.toggle("active", section.id === "page-" + page));
    $$(".nav").forEach(button => button.classList.toggle("active", button.dataset.page === page));

    const titles = {
      play: "نواختن هنگ‌درام",
      songs: "کتابخانه قطعه‌ها",
      learn: "آموزش هنگ‌درام",
      generator: "آزمایشگاه بداهه‌نوازی",
      instrument: "ساز من"
    };
    $("#pageTitle").textContent = titles[page] || "Handpan Studio";
  }

  // ---------- مترونوم و درون ----------
  function metroTick() {
    if (playing || !audio || !metronomeEnabled) return; // هنگام پخش، مترونوم داخل زمان‌بند است
    clickAt(audio.currentTime, false);
  }

  function restartMetronomeTimer() {
    clearInterval(metronomeTimer);
    metronomeTimer = null;
    if (metronomeEnabled) metronomeTimer = setInterval(metroTick, 60000 / effectiveBpm());
  }

  function toggleMetronome() {
    if (metronomeEnabled) {
      metronomeEnabled = false;
      restartMetronomeTimer();
      $("#metronomeBtn").textContent = "♩ مترونوم خاموش";
      return;
    }

    if (!ensureAudio()) return;
    metronomeEnabled = true;
    nextClick = Math.ceil(currentBeat() - 1e-6);
    metroTick();
    restartMetronomeTimer();
    $("#metronomeBtn").textContent = "♩ مترونوم روشن";
  }

  function toggleDrone() {
    if (!ensureAudio()) return;

    if (droneOscillator) {
      droneOscillator.stop();
      droneOscillator = null;
      $("#droneBtn").textContent = "〰 درون خاموش";
      return;
    }

    droneOscillator = audio.createOscillator();
    const droneGain = audio.createGain();
    droneOscillator.type = "sine";
    droneOscillator.frequency.value = notes[0].frequency / 2;
    droneGain.gain.value = 0.035;
    droneOscillator.connect(droneGain);
    droneGain.connect(master);
    droneOscillator.start();
    $("#droneBtn").textContent = "〰 درون روشن";
  }

  // ---------- نواختن زنده ----------
  function liveNote(index) {
    if (!notes[index]) return;
    playTone(index);
    if (practice) judge(index);
    if (recState === "recording") {
      recording.push({ note: index, ms: performance.now() - recStart });
    }
  }

  // ---------- حالت تمرین ----------
  function startPractice() {
    const seq = pattern.map((e, index) => ({ note: e.note, index })).filter(e => e.note != null);
    if (!seq.length) { notify("ابتدا یک قطعه بارگذاری کن."); return; }
    stopPlayback(true);
    practice = { seq, i: 0, hit: 0, miss: 0, streak: 0, best: 0 };
    $("#practiceBtn").classList.add("active");
    markTarget();
    notify("نت هایلایت‌شده را بزن؛ قطعه منتظر تو می‌ماند.");
  }

  function stopPractice(message) {
    const was = practice;
    practice = null;
    $("#practiceBtn").classList.remove("active");
    markTarget();
    if (was && typeof message === "string") notify(message);
  }

  function markTarget() {
    $$(".tone.target, .timeline-note.next").forEach(e => e.classList.remove("target", "next"));
    const stats = $("#practiceStats");
    if (!practice) { if (stats) stats.textContent = ""; return; }

    const { seq, i, hit, miss, streak } = practice;
    const current = seq[i];
    if (!current) return;

    $(`#handpan .tone[data-note="${current.note}"]`)?.classList.add("target");
    const el = $(`.timeline-note[data-index="${current.index}"]`);
    if (el) {
      el.classList.add("next");
      $("#timelineScroll").scrollLeft = Math.max(0, el.offsetLeft - 120);
    }
    if (stats) stats.textContent = `نت ${i + 1} از ${seq.length} · درست ${hit} · اشتباه ${miss} · رشته ${streak}`;
  }

  function judge(noteIndex) {
    if (!practice) return;
    const expected = practice.seq[practice.i];
    if (!expected) return;

    if (noteIndex === expected.note) {
      practice.hit++;
      practice.streak++;
      practice.best = Math.max(practice.best, practice.streak);
      practice.i++;
    } else {
      practice.miss++;
      practice.streak = 0;
    }

    if (practice.i >= practice.seq.length) {
      const total = practice.hit + practice.miss;
      const accuracy = total ? Math.round(practice.hit / total * 100) : 0;
      stopPractice(`تمرین تمام شد · دقت ${accuracy}% · بهترین رشته ${practice.best}`);
      return;
    }
    markTarget();
  }

  // ---------- حلقه‌ی A–B ----------
  function markLoop() {
    const active = loopA != null && loopB != null;
    $$(".timeline-note").forEach(el => {
      const event = pattern[Number(el.dataset.index)];
      el.classList.toggle("in-loop", active && event && event.beat >= loopA - 0.001 && event.beat < loopB);
    });
    const btn = $("#abBtn");
    btn.classList.toggle("active", loopA != null);
    btn.textContent = loopA == null ? "A–B" : loopB == null ? "A ✓ → B؟" : "A–B فعال";
  }

  function cycleLoop() {
    if (!pattern.length) { notify("ابتدا یک قطعه بارگذاری کن."); return; }
    const beat = currentBeat();
    if (loopA == null) {
      loopA = beat;
      notify("نقطه‌ی A ثبت شد؛ پخش را جلو ببر و دوباره بزن.");
    } else if (loopB == null) {
      if (beat <= loopA + 0.25) { notify("نقطه‌ی B باید بعد از A باشد."); return; }
      loopB = beat;
      notify("حلقه‌ی A–B فعال شد.");
    } else {
      loopA = loopB = null;
      notify("حلقه پاک شد.");
    }
    markLoop();
  }

  // ---------- ضبط زنده ----------
  function beep(freq) {
    if (!ensureAudio()) return;
    clickAt(audio.currentTime, freq > 1000);
  }

  function snapshotFreqs() { return notes.map(n => n.frequency); }

  function toggleRecord() {
    const btn = $("#recBtn");

    if (recState === "counting") {
      recTimers.forEach(clearTimeout);
      recTimers = [];
      recState = "idle";
      btn.classList.remove("active");
      btn.textContent = "⏺ ضبط";
      notify("ضبط لغو شد.");
      return;
    }

    if (recState === "recording") {
      recState = "idle";
      btn.classList.remove("active");
      btn.textContent = "⏺ ضبط";
      if (!recording.length) { notify("نتی ضبط نشد."); return; }

      const bpm = Number($("#bpm").value) || 90;
      const events = recording.map((e, i) => {
        const beat = Math.round(e.ms / 60000 * bpm * 100) / 100;
        const next = recording[i + 1];
        const gap = next ? next.ms / 60000 * bpm - beat : 1;
        return { note: e.note, beat, duration: Math.max(0.25, Math.min(2, Math.round(gap * 100) / 100)), type: "note" };
      });
      const list = store.get();
      list.push({ title: "ضبط زنده", bpm, meter: [4, 4], events, freqs: snapshotFreqs(), date: new Date().toISOString() });
      store.set(list);
      renderSaved();
      notify(`${events.length} نت ضبط و ذخیره شد.`);
      return;
    }

    if (!ensureAudio()) return;
    if (practice) stopPractice();
    stopPlayback(true);
    const beatMs = 60000 / (Number($("#bpm").value) || 90);
    recState = "counting";
    recording = [];
    recTimers = [];
    btn.classList.add("active");
    btn.textContent = "… شمارش";
    for (let i = 0; i < 4; i++) {
      recTimers.push(setTimeout(() => { beep(i ? 850 : 1200); notify("شمارش: " + (i + 1)); }, i * beatMs));
    }
    recTimers.push(setTimeout(() => {
      recState = "recording";
      recStart = performance.now();
      btn.textContent = "⏹ پایان ضبط";
      notify("ضبط شروع شد.");
    }, 4 * beatMs));
  }

  // ---------- خروجی MIDI ----------
  const vlq = n => {
    const bytes = [n & 127];
    while ((n >>= 7)) bytes.unshift((n & 127) | 128);
    return bytes;
  };

  function saveMidi(list, bpm) {
    list = list.filter(e => e.midi != null);
    if (!list.length) { notify("الگویی برای خروجی وجود ندارد."); return; }

    const PPQ = 480;
    const mpq = Math.round(60000000 / (bpm || 90));
    const items = [];
    list.forEach(e => {
      items.push([Math.round(e.beat * PPQ), 1, e.midi]);
      items.push([Math.max(Math.round(e.beat * PPQ) + 1, Math.round((e.beat + e.dur) * PPQ)), 0, e.midi]);
    });
    items.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

    const track = [0, 0xFF, 0x51, 3, (mpq >> 16) & 255, (mpq >> 8) & 255, mpq & 255];
    let last = 0;
    items.forEach(([tick, on, midi]) => {
      track.push(...vlq(tick - last), on ? 0x90 : 0x80, midi, on ? 90 : 0);
      last = tick;
    });
    track.push(0, 0xFF, 0x2F, 0);

    const n = track.length;
    const bytes = new Uint8Array([
      0x4D, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, PPQ >> 8, PPQ & 255,
      0x4D, 0x54, 0x72, 0x6B, (n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255,
      ...track
    ]);

    downloadBlob(new Blob([bytes], { type: "audio/midi" }), "handpan.mid");
    notify("فایل MIDI ساخته شد.");
  }

  function exportMidi() {
    saveMidi(
      pattern.filter(e => e.note != null && notes[e.note]).map(e => ({
        midi: frequencyToMidi(notes[e.note].frequency), beat: e.beat, dur: e.duration
      })),
      baseBpm
    );
  }

  // ---------- الگوهای ذخیره‌شده ----------
  function stopReplay() {
    replayTimers.forEach(clearTimeout);
    replayTimers = [];
  }

  function replay(item) {
    stopReplay();
    stopPlayback(false);
    if (practice) stopPractice();
    const events = (item.events || []).filter(e => e.note != null);
    replayTimers = events.map(e => setTimeout(() => {
      playTone(e.note, { frequency: item.freqs?.[e.note] });
    }, e.beat * 60000 / item.bpm));
  }

  function renderSaved() {
    const list = store.get();
    const root = $("#savedList");
    root.innerHTML = list.length ? "" : '<div class="empty">هنوز چیزی ذخیره نشده.</div>';

    list.forEach((item, i) => {
      const noteEvents = (item.events || []).filter(e => e.note != null);
      const row = document.createElement("div");
      row.className = "saved-row";

      const info = document.createElement("span");
      info.textContent = `${item.title} · ${noteEvents.length} نت · ${item.bpm} BPM`;

      const make = (text, tip, fn) => {
        const b = document.createElement("button");
        b.className = "secondary";
        b.textContent = text;
        b.title = tip;
        b.addEventListener("click", fn);
        return b;
      };

      row.append(
        info,
        make("▶", "شنیدن", () => replay(item)),
        make("↥", "بارگذاری روی نوار نت‌ها", () => setPattern(item.events || [], item.title, item.bpm, item.meter || [4, 4])),
        make("MIDI", "خروجی MIDI", () => saveMidi(
          noteEvents.map(e => {
            const f = item.freqs?.[e.note] ?? notes[e.note]?.frequency;
            return { midi: f ? frequencyToMidi(f) : null, beat: e.beat, dur: e.duration };
          }), item.bpm)),
        make("✕", "حذف", () => { const l = store.get(); l.splice(i, 1); store.set(l); renderSaved(); })
      );
      root.appendChild(row);
    });
  }

  // ---------- اتصال رویدادها ----------
  $$(".nav").forEach(button => {
    button.addEventListener("click", () => {
      navigate(button.dataset.page);
      if (button.dataset.page === "songs") renderSongs();
      if (button.dataset.page === "learn") renderLessons();
    });
  });

  $("#playBtn").addEventListener("click", startPlayback);
  $("#stopBtn").addEventListener("click", () => stopPlayback(true));
  $("#prevBtn").addEventListener("click", () => seekToIndex(Math.max(0, currentIndex - 1)));
  $("#nextBtn").addEventListener("click", () => seekToIndex(Math.min(pattern.length - 1, currentIndex + 1)));
  $("#backBtn").addEventListener("click", () => seekToSeconds(currentBeat() * 60 / effectiveBpm() - 4));
  $("#forwardBtn").addEventListener("click", () => seekToSeconds(currentBeat() * 60 / effectiveBpm() + 4));

  $("#seek").addEventListener("input", event => {
    if (!pattern.length) return;
    seekToSeconds(Number(event.target.value) / 1000 * durationSeconds());
  });

  $("#loop").addEventListener("change", event => { settings.loop = event.target.checked; });
  $("#speed").addEventListener("change", event => {
    changeTempo(() => { settings.speed = Number(event.target.value); });
  });

  $("#bpm").addEventListener("change", event => {
    changeTempo(() => {
      baseBpm = Math.max(30, Math.min(220, Number(event.target.value) || 90));
      event.target.value = baseBpm;
    });
  });

  $("#volume").addEventListener("input", event => {
    $("#volumeValue").textContent = event.target.value + "%";
    if (master) master.gain.value = Math.min(1.5, Number(event.target.value) / 100);
  });

  $("#clearBtn").addEventListener("click", () => {
    stopPlayback();
    stopPractice();
    loopA = loopB = null;
    pattern = [];
    title = "تمرین آزاد";
    renderTimeline();
  });

  $("#saveBtn").addEventListener("click", () => {
    if (!pattern.length) { notify("الگویی برای ذخیره وجود ندارد."); return; }
    const list = store.get();
    list.push({ title, bpm: baseBpm, meter, events: pattern, freqs: snapshotFreqs(), date: new Date().toISOString() });
    if (store.set(list)) notify("الگو در همین مرورگر ذخیره شد.");
    renderSaved();
  });

  $("#songSearch").addEventListener("input", renderSongs);
  $("#songFilter").addEventListener("change", renderSongs);

  $("#generateBtn").addEventListener("click", generateImprovisation);
  $("#newGenBtn").addEventListener("click", generateImprovisation);
  $("#genTempo").addEventListener("input", event => { $("#genTempoLabel").textContent = event.target.value; });

  $("#playGenBtn").addEventListener("click", () => {
    if (!generatedPattern.length) generateImprovisation();
    setPattern(generatedPattern, "بداهه‌ی تولیدشده", Number($("#genTempo").value));
    startPlayback(); // «پخش بداهه» باید واقعاً پخش کند
  });
  $("#sendGenBtn").addEventListener("click", () => {
    if (!generatedPattern.length) generateImprovisation();
    setPattern(generatedPattern, "بداهه‌ی من", Number($("#genTempo").value));
  });

  $("#preset").addEventListener("change", event => {
    const scale = SCALES[event.target.value];
    if (scale) $("#root").value = scale.root;
  });

  $("#applyInstrument").addEventListener("click", () => applyInstrument(true));

  $("#resetInstrument").addEventListener("click", () => {
    instrument = {
      preset: "kurd", root: "D", octave: 3, count: 9,
      timbre: "warm", sustain: 2.2, reverb: 30, fine: 0,
      layout: "circle", customFrequencies: null
    };

    $("#preset").value = "kurd";
    $("#root").value = "D";
    $("#octave").value = "3";
    $("#noteCountSelect").value = "9";
    $("#timbre").value = "warm";
    $("#sustain").value = "2.2";
    $("#reverb").value = "30";
    $("#fineTune").value = "0";
    $("#layout").value = "circle";
    applyInstrument(true);
  });

  $("#reverb").addEventListener("input", event => { $("#reverbLabel").textContent = event.target.value + "%"; });
  $("#sustain").addEventListener("input", event => { $("#sustainLabel").textContent = Number(event.target.value).toFixed(1) + " ثانیه"; });
  $("#fineTune").addEventListener("input", event => { $("#fineLabel").textContent = event.target.value + " سنت"; });

  $("#resetTuning").addEventListener("click", () => {
    instrument.customFrequencies = null;
    renderInstrument();
    notify("فرکانس‌های پایه بازنشانی شدند.");
  });

  $("#exportSettings").addEventListener("click", exportSettings);
  $("#importSettings").addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (file) importSettings(file);
    event.target.value = "";
  });

  $("#metronomeBtn").addEventListener("click", toggleMetronome);
  $("#droneBtn").addEventListener("click", toggleDrone);

  $("#practiceBtn").addEventListener("click", () => (practice ? stopPractice() : startPractice()));
  $("#abBtn").addEventListener("click", cycleLoop);
  $("#recBtn").addEventListener("click", toggleRecord);
  $("#midiBtn").addEventListener("click", exportMidi);

  $("#tapBtn").addEventListener("click", () => {
    const now = performance.now();
    taps = taps.filter(t => now - t < 2500);
    taps.push(now);
    if (taps.length < 2) return;
    const average = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
    const bpm = Math.round(Math.min(220, Math.max(30, 60000 / average)));
    changeTempo(() => { baseBpm = bpm; $("#bpm").value = bpm; });
  });

  $("#fullBtn").addEventListener("click", () => {
    const panel = $(".instrument-panel");
    if (document.fullscreenElement) document.exitFullscreen();
    else panel.requestFullscreen?.().catch(() => notify("تمام‌صفحه پشتیبانی نمی‌شود."));
  });

  $("#helpBtn").addEventListener("click", () => $("#helpDialog").showModal());
  $("#closeHelp").addEventListener("click", () => $("#helpDialog").close());
  $("#closeHelpBottom").addEventListener("click", () => $("#helpDialog").close());

  const isTyping = () => ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName);

  document.addEventListener("keydown", event => {
    if ($("#helpDialog").open || event.ctrlKey || event.metaKey || event.altKey) return;
    if (isTyping() || event.repeat) return;

    if (event.key in KEYMAP) {
      const index = KEYMAP[event.key];
      if (notes[index]) liveNote(index);
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      startPlayback();
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "escape") {
      if (practice) stopPractice("تمرین متوقف شد.");
      stopPlayback(true);
    }
    else if (key === "m") toggleMetronome();
    else if (key === "d") toggleDrone();
    else if (key === "l") { const l = $("#loop"); l.checked = !l.checked; settings.loop = l.checked; }
    else if (key === "p") (practice ? stopPractice() : startPractice());
    else if (key === "r") toggleRecord();
    else if (key === "a") cycleLoop();
    else if (key === "," || key === ".") {
      const s = $("#speed");
      const next = Math.max(0, Math.min(s.options.length - 1, s.selectedIndex + (key === "." ? 1 : -1)));
      s.selectedIndex = next;
      changeTempo(() => { settings.speed = Number(s.value); });
      notify("سرعت: " + s.options[next].text);
    }
  });

  // جلوگیری از فعال شدن دکمه‌ی فوکوس‌شده با Space (تداخل با میانبر پخش)
  document.addEventListener("keyup", event => {
    if (event.code === "Space" && !isTyping() && !$("#helpDialog").open) event.preventDefault();
  });

  // ---------- راه‌اندازی اولیه ----------
  const style = document.createElement("style");
  style.textContent = `
    #handpan{position:relative}
    #handpan .ding{display:none}
    #handpan .tone{position:absolute;translate:-50% -50%;aspect-ratio:1/1;border-radius:50%;padding:0;
      display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}
    #handpan .tone[hidden]{display:none}
    #handpan .tone b{font-size:clamp(14px,2.6vw,26px)}
    #handpan .tone small{font-size:clamp(9px,1.2vw,12px);opacity:.8}
    #handpan .tone.unused{opacity:.45}
    #handpan .tone.used{box-shadow:0 0 0 2px rgba(255,205,110,.75)}
    #handpan .tone.target{box-shadow:0 0 0 3px #ffd36e,0 0 18px #ffd36e;opacity:1}
    .timeline-note{direction:rtl}
    .timeline-note.next{outline:2px solid #ffd36e}
    .timeline-note.in-loop{box-shadow:inset 0 -3px 0 #6ee7b7}
  `;
  document.head.appendChild(style);

  $("#timelineScroll").style.direction = "ltr"; // محور زمان همیشه چپ‌به‌راست؛ در RTL، scrollLeft و left معکوس می‌شد

  updateInstrumentLabels();
  $("#volumeValue").textContent = $("#volume").value + "%";
  $("#genTempoLabel").textContent = $("#genTempo").value;

  buildTones();
  renderInstrument();
  renderSongs();
  renderLessons();
  renderGenerated();
  renderSaved();
})();