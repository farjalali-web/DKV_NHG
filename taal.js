/**
 * taal.js — Dutch Coach / DKV Taaltrainer
 * Modules: Woordenschat · Uitspraak · Luisteren · Zinsbouw
 */

"use strict";

// ─── Vocabulary data ─────────────────────────────────────────────────────────

const VOCAB = [
  // CONSULT
  { nl: "Wat kan ik voor u doen?", fa: "چطور می‌تونم کمکتون کنم؟", en: "How can I help you?", cat: "Consult" },
  { nl: "Goedemorgen, ik ben de arts van vandaag.", fa: "صبح بخیر، من دکتر امروز هستم.", en: "Good morning, I am today's doctor.", cat: "Consult" },
  { nl: "Kunt u mij vertellen waar u last van heeft?", fa: "می‌تونید بگید چه مشکلی دارید؟", en: "Can you tell me what problem you have?", cat: "Consult" },
  { nl: "Hoelang heeft u hier al last van?", fa: "چه مدته این مشکل رو دارید؟", en: "How long have you had this problem?", cat: "Consult" },
  { nl: "Kunt u de pijn beschrijven?", fa: "می‌تونید درد رو توصیف کنید؟", en: "Can you describe the pain?", cat: "Consult" },
  { nl: "Straalt de pijn ergens naartoe?", fa: "درد به جایی می‌کشه؟", en: "Does the pain radiate anywhere?", cat: "Consult" },
  { nl: "In hoeverre beperkt dit u dagelijks?", fa: "تا چه حد روی زندگیتون تأثیر داره؟", en: "To what extent does this limit your daily life?", cat: "Consult" },
  { nl: "Heeft u ook koorts gehad?", fa: "تب هم داشتید؟", en: "Have you also had a fever?", cat: "Consult" },
  { nl: "Gebruikt u momenteel medicijnen?", fa: "الان دارویی مصرف می‌کنید؟", en: "Are you currently using any medication?", cat: "Consult" },
  { nl: "Heeft u allergieën?", fa: "آلرژی دارید؟", en: "Do you have any allergies?", cat: "Consult" },
  { nl: "Rookt u?", fa: "سیگار می‌کشید؟", en: "Do you smoke?", cat: "Consult" },
  { nl: "Hoeveel alcohol drinkt u per week?", fa: "در هفته چقدر الکل مصرف می‌کنید؟", en: "How much alcohol do you drink per week?", cat: "Consult" },
  { nl: "Is er iemand in uw familie met soortgelijke klachten?", fa: "کسی در خانواده مشکل مشابه داشته؟", en: "Is there anyone in your family with similar complaints?", cat: "Consult" },

  // SAMENVATTING
  { nl: "Als ik het goed begrijp…", fa: "اگه درست فهمیدم…", en: "If I understand correctly…", cat: "Samenvatting" },
  { nl: "Klopt dat wat ik gezegd heb?", fa: "آیا این درسته؟", en: "Is what I said correct?", cat: "Samenvatting" },
  { nl: "Ik wil even samenvatten wat u mij heeft verteld.", fa: "می‌خوام خلاصه کنم چی گفتید.", en: "I'd like to summarise what you told me.", cat: "Samenvatting" },

  // UITLEG & BELEID
  { nl: "Ik denk dat het om … gaat.", fa: "فکر می‌کنم مسئله … هست.", en: "I think it concerns…", cat: "Uitleg" },
  { nl: "We gaan eerst kijken of…", fa: "اول می‌بینیم که…", en: "We'll first check whether…", cat: "Uitleg" },
  { nl: "Ik wil graag wat aanvullend onderzoek doen.", fa: "می‌خوام یه آزمایش اضافه انجام بدم.", en: "I'd like to do some additional tests.", cat: "Uitleg" },
  { nl: "Ik verwijs u door naar de specialist.", fa: "شما رو ارجاع می‌دم به متخصص.", en: "I'll refer you to a specialist.", cat: "Uitleg" },

  // SAFETY NET
  { nl: "Als de klachten erger worden, kom dan terug.", fa: "اگه علائم بدتر شد، برگرد.", en: "If symptoms worsen, come back.", cat: "Safety net" },
  { nl: "Let op deze alarmsymptomen:", fa: "به این علائم هشدار توجه کن:", en: "Watch out for these alarm symptoms:", cat: "Safety net" },
  { nl: "Als u zich zorgen maakt, kunt u altijd bellen.", fa: "اگه نگران شدی، می‌تونی زنگ بزنی.", en: "If you're worried, you can always call.", cat: "Safety net" },
  { nl: "Ik wil u over twee weken terugzien.", fa: "می‌خوام ۲ هفته دیگه ببینمتون.", en: "I'd like to see you again in two weeks.", cat: "Safety net" },

  // KLACHTEN
  { nl: "kortademig", fa: "تنگی نفس", en: "short of breath", cat: "Klachten" },
  { nl: "benauwdheid", fa: "احساس فشردگی", en: "tightness / breathlessness", cat: "Klachten" },
  { nl: "pijn op de borst", fa: "درد سینه", en: "chest pain", cat: "Klachten" },
  { nl: "duizeligheid", fa: "سرگیجه", en: "dizziness", cat: "Klachten" },
  { nl: "misselijkheid", fa: "تهوع", en: "nausea", cat: "Klachten" },
  { nl: "vermoeidheid", fa: "خستگی", en: "fatigue", cat: "Klachten" },
  { nl: "gewichtsverlies", fa: "کاهش وزن", en: "weight loss", cat: "Klachten" },
  { nl: "hoest", fa: "سرفه", en: "cough", cat: "Klachten" },
  { nl: "koorts", fa: "تب", en: "fever", cat: "Klachten" },
  { nl: "hartkloppingen", fa: "تپش قلب", en: "palpitations", cat: "Klachten" },
  { nl: "zweten", fa: "تعریق", en: "sweating", cat: "Klachten" },
  { nl: "buikpijn", fa: "دردشکم", en: "abdominal pain", cat: "Klachten" },
  { nl: "rugpijn", fa: "کمردرد", en: "back pain", cat: "Klachten" },
  { nl: "hoofdpijn", fa: "سردرد", en: "headache", cat: "Klachten" },
  { nl: "enkels dik", fa: "ورم مچ پا", en: "swollen ankles", cat: "Klachten" },
  { nl: "nachtzweten", fa: "تعریق شبانه", en: "night sweats", cat: "Klachten" },

  // LICHAAMSDELEN
  { nl: "het hart", fa: "قلب", en: "heart", cat: "Lichaamsdelen" },
  { nl: "de longen", fa: "ریه‌ها", en: "lungs", cat: "Lichaamsdelen" },
  { nl: "de lever", fa: "کبد", en: "liver", cat: "Lichaamsdelen" },
  { nl: "de nieren", fa: "کلیه‌ها", en: "kidneys", cat: "Lichaamsdelen" },
  { nl: "de maag", fa: "معده", en: "stomach", cat: "Lichaamsdelen" },
  { nl: "de borst", fa: "قفسه سینه", en: "chest", cat: "Lichaamsdelen" },
  { nl: "de buik", fa: "شکم", en: "abdomen", cat: "Lichaamsdelen" },
  { nl: "de rug", fa: "پشت/کمر", en: "back", cat: "Lichaamsdelen" },
  { nl: "het been", fa: "پا", en: "leg", cat: "Lichaamsdelen" },
  { nl: "de arm", fa: "بازو", en: "arm", cat: "Lichaamsdelen" },
  { nl: "de nek", fa: "گردن", en: "neck", cat: "Lichaamsdelen" },
  { nl: "de enkel", fa: "مچ پا", en: "ankle", cat: "Lichaamsdelen" },

  // GRAMMATICA
  { nl: "de / het", fa: "de=مذکر/مؤنث، het=خنثی | tip: 't Kofschip", en: "definite articles: de (common) / het (neuter)", cat: "Grammatica" },
  { nl: "ik heb last van…", fa: "من … دارم | پرکاربردترین جمله بیمار", en: "I have complaints of… (most common patient phrase)", cat: "Grammatica" },
  { nl: "al … lang", fa: "از … وقت | 'ik heb dit al 3 weken'", en: "already … long — expresses duration", cat: "Grammatica" },
  { nl: "tussendoor / af en toe / constant", fa: "گاهی / هرازگاهی / دائماً", en: "intermittently / occasionally / constantly", cat: "Grammatica" },
  { nl: "erger geworden", fa: "بدتر شده | 'het is erger geworden'", en: "has gotten worse", cat: "Grammatica" },
  { nl: "in rust / bij inspanning", fa: "در استراحت / با فعالیت", en: "at rest / with exertion", cat: "Grammatica" },
];

// ─── Listening exercises ──────────────────────────────────────────────────────

const LISTEN_ITEMS = [
  {
    sentence: "Ik heb al drie weken last van kortademigheid bij het traplopen.",
    question: "Hoelang heeft de patiënt klachten?",
    questionFa: "بیمار چه مدتی شکایت دارد؟",
    answer: "drie weken",
  },
  {
    sentence: "De pijn begon plotseling en straalt uit naar mijn linkerarm.",
    question: "Waar straalt de pijn naartoe?",
    questionFa: "درد به کجا می‌کشد؟",
    answer: "linkerarm",
  },
  {
    sentence: "Ik gebruik bloeddrukpillen en cholesterolverlagers.",
    question: "Welke medicijnen gebruikt de patiënt?",
    questionFa: "بیمار چه داروهایی مصرف می‌کند؟",
    answer: "bloeddrukpillen, cholesterolverlagers",
  },
  {
    sentence: "Ik rook al dertig jaar, ongeveer een pakje per dag.",
    question: "Hoeveel en hoe lang rookt de patiënt?",
    questionFa: "بیمار چقدر و چه مدت سیگار می‌کشد؟",
    answer: "een pakje per dag, 30 jaar",
  },
  {
    sentence: "Mijn vader heeft ook hartproblemen gehad.",
    question: "Wat is er met de vader van de patiënt?",
    questionFa: "با پدر بیمار چه اتفاقی افتاده؟",
    answer: "hartproblemen",
  },
  {
    sentence: "De klachten zijn erger bij inspanning en verdwijnen in rust.",
    question: "Wanneer zijn de klachten erger?",
    questionFa: "شکایت‌ها چه موقع بدتر می‌شوند؟",
    answer: "bij inspanning",
  },
  {
    sentence: "Ik ben de laatste maand vijf kilo afgevallen zonder dieet.",
    question: "Hoeveel is de patiënt afgevallen?",
    questionFa: "بیمار چقدر وزن از دست داده؟",
    answer: "vijf kilo",
  },
  {
    sentence: "Ik slaap slecht, heb geen eetlust en voel me somber.",
    question: "Noem drie klachten van de patiënt.",
    questionFa: "سه شکایت بیمار را نام ببرید.",
    answer: "slaapproblemen, geen eetlust, somber",
  },
  {
    sentence: "De pijn zit rechts onder in mijn buik en begon gisteravond.",
    question: "Waar zit de pijn?",
    questionFa: "درد کجاست؟",
    answer: "rechts onder in de buik",
  },
  {
    sentence: "Ik heb hoge bloeddruk en diabetes, dat weet ik al jaren.",
    question: "Welke voorgeschiedenis heeft de patiënt?",
    questionFa: "سابقه پزشکی بیمار چیست؟",
    answer: "hoge bloeddruk en diabetes",
  },
  {
    sentence: "Soms heb ik het gevoel dat mijn hart heel snel klopt, voor een paar minuten.",
    question: "Hoe lang duren de aanvallen?",
    questionFa: "حملات چه مدت طول می‌کشند؟",
    answer: "een paar minuten",
  },
  {
    sentence: "Ik ben zwanger, acht weken.",
    question: "Hoeveel weken zwanger is de patiënt?",
    questionFa: "بیمار چند هفته باردار است؟",
    answer: "acht weken",
  },
  {
    sentence: "De hoest begon na een verkoudheid twee weken geleden.",
    question: "Waarna begon de hoest?",
    questionFa: "سرفه بعد از چه چیزی شروع شد؟",
    answer: "na een verkoudheid",
  },
  {
    sentence: "Ik heb moeite met traplopen, maar vlak lopen gaat nog wel.",
    question: "Wat gaat de patiënt nog wel?",
    questionFa: "چه کاری برای بیمار هنوز ممکن است؟",
    answer: "vlak lopen",
  },
  {
    sentence: "Mijn enkels zijn de laatste week dikker geworden.",
    question: "Welk lichaamsdeel is aangedaan?",
    questionFa: "کدام اندام درگیر شده؟",
    answer: "enkels",
  },
];

// Pronunciation practice words (subset of VOCAB, hard for Persian speakers)
const PR_WORDS = [
  { nl: "kortademig", cat: "Klachten", hint: "Let op: -ademig = [ah-de-mikh]" },
  { nl: "benauwdheid", cat: "Klachten", hint: "Let op: -heid = [hayt]" },
  { nl: "hartkloppingen", cat: "Klachten", hint: "Samengesteld woord: hart + kloppingen" },
  { nl: "duizeligheid", cat: "Klachten", hint: "ui = [ou] als in 'house'" },
  { nl: "gewichtsverlies", cat: "Klachten", hint: "g = zachte g [khh]" },
  { nl: "nachtzweten", cat: "Klachten", hint: "ch = [khh], zw = [zv]" },
  { nl: "bloeddrukpillen", cat: "Medicatie", hint: "oe = [oo], ui = [ou]" },
  { nl: "cholesterolverlagers", cat: "Medicatie", hint: "ch = [k] hier" },
  { nl: "kortademigheid", cat: "Klachten", hint: "Lange zin: break it: kort-ade-mig-heid" },
  { nl: "Straalt de pijn ergens naartoe?", cat: "Consult", hint: "str = [str], aa = lang [aa]" },
  { nl: "aanvullend onderzoek", cat: "Uitleg", hint: "aa = lang; on-der-zoek" },
  { nl: "alarmsymptomen", cat: "Safety net", hint: "symptomen = [simp-toh-men]" },
  { nl: "familieanamnese", cat: "Consult", hint: "anamnese = [ah-nam-neh-ze]" },
  { nl: "lichamelijk onderzoek", cat: "Uitleg", hint: "lijk = [lek]" },
  { nl: "differentiaaldiagnose", cat: "Uitleg", hint: "Lang woord — breek het: dif-fe-ren-ti-aal-di-ag-no-ze" },
  { nl: "Hoeveel alcohol drinkt u per week?", cat: "Consult", hint: "oe = [oo]; al-co-hol" },
  { nl: "misselijkheid", cat: "Klachten", hint: "ij = [ay]" },
  { nl: "vermoeidheid", cat: "Klachten", hint: "oe = [oo]; ei = [ay]" },
  { nl: "rugpijn", cat: "Klachten", hint: "ui = [ou], g = [khh]" },
  { nl: "enkels", cat: "Lichaamsdelen", hint: "e = kort [e]" },
];

// Zinsbouw topics
const ZB_TOPICS = [
  "Vraag naar de duur van de klacht",
  "Geef uitleg over de diagnose",
  "Vertel de patiënt wat de alarmsymptomen zijn",
  "Vraag naar medicatiegebruik",
  "Maak een afspraak voor controle",
  "Vraag naar familieanamnese",
  "Leg uit wat je gaat onderzoeken",
  "Vraag of de patiënt het begrijpt",
];

// ─── AudioContext (singleton, unlocked on first gesture) ─────────────────────

let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === "suspended") {
    _audioCtx.resume();
  }
  return _audioCtx;
}

async function playMp3Buffer(arrayBuffer) {
  const ctx = getAudioCtx();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  const src = ctx.createBufferSource();
  src.buffer = decoded;
  src.connect(ctx.destination);
  src.start(0);
}

async function playTTS(text) {
  if (!text) return;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("TTS failed");
    const buf = await res.arrayBuffer();
    await playMp3Buffer(buf);
  } catch (err) {
    console.error("TTS error:", err);
  }
}

// ─── STT recording helper ─────────────────────────────────────────────────────

let _mediaRecorder = null;
let _recordingChunks = [];

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  _recordingChunks = [];
  _mediaRecorder = new MediaRecorder(stream);
  _mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) _recordingChunks.push(e.data);
  };
  _mediaRecorder.start();
}

function stopRecording() {
  return new Promise((resolve) => {
    _mediaRecorder.onstop = () => {
      const blob = new Blob(_recordingChunks, { type: "audio/webm" });
      // Stop all tracks to release mic
      _mediaRecorder.stream.getTracks().forEach((t) => t.stop());
      resolve(blob);
    };
    _mediaRecorder.stop();
  });
}

async function transcribeBlob(blob) {
  const res = await fetch("/api/stt", {
    method: "POST",
    headers: { "Content-Type": blob.type || "audio/webm" },
    body: blob,
  });
  if (!res.ok) throw new Error("STT failed");
  const data = await res.json();
  return (data.text || "").trim();
}

// Simple normalise for comparison (lowercase, strip punctuation, trim)
function normalise(str) {
  return str
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCloseEnough(a, b) {
  const na = normalise(a);
  const nb = normalise(b);
  if (na === nb) return true;
  // Accept if all words of answer appear in user text (allows paraphrasing)
  const ansWords = nb.split(" ").filter(Boolean);
  const matches = ansWords.filter((w) => na.includes(w));
  return matches.length >= Math.ceil(ansWords.length * 0.6);
}

// ─── Tab switching ────────────────────────────────────────────────────────────

function initTabs() {
  const tabs = document.querySelectorAll(".module-tab");
  const panels = document.querySelectorAll(".module-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const mod = tab.dataset.module;
      tabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      panels.forEach((p) => {
        p.classList.toggle("active", p.id === `panel-${mod}`);
      });
    });
  });
}

// ─── AI status check ─────────────────────────────────────────────────────────

async function checkAiStatus() {
  const el = document.getElementById("aiStatus");
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    if (data.ai) {
      el.textContent = "AI";
      el.classList.add("online");
    } else {
      el.textContent = "Local";
      el.classList.add("local");
    }
  } catch {
    el.textContent = "Offline";
    el.classList.add("error");
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 1 — WOORDENSCHAT
// ═════════════════════════════════════════════════════════════════════════════

const FC = {
  allCards: [...VOCAB],
  queue: [],
  known: new Set(),
  current: null,
  flipped: false,

  init() {
    this.buildQueue();
    this.render();

    document.getElementById("catFilter").addEventListener("change", () => {
      this.buildQueue();
      this.render();
    });
    const card = document.getElementById("flashcard");
    card.addEventListener("click", () => this.flip());
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.flip(); }
    });
    document.getElementById("fcTts").addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.current) playTTS(this.current.nl);
    });
    document.getElementById("fcKnow").addEventListener("click", (e) => {
      e.stopPropagation();
      this.markKnown();
    });
    document.getElementById("fcRetry").addEventListener("click", (e) => {
      e.stopPropagation();
      this.markRetry();
    });
    const resetBtn = document.getElementById("fcReset");
    if (resetBtn) resetBtn.addEventListener("click", () => {
      this.known.clear();
      this.buildQueue();
      this.render();
    });
  },

  buildQueue() {
    const cat = document.getElementById("catFilter").value;
    const filtered = cat === "all" ? this.allCards : this.allCards.filter((c) => c.cat === cat);
    this.queue = filtered.filter((c) => !this.known.has(c.nl));
    this.shuffle(this.queue);
    this.current = this.queue[0] || null;
    this.flipped = false;
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  },

  flip() {
    if (!this.current) return;
    this.flipped = !this.flipped;
    document.getElementById("flashcard").classList.toggle("flipped", this.flipped);
  },

  markKnown() {
    if (!this.current) return;
    this.known.add(this.current.nl);
    this.queue.shift();
    this.current = this.queue[0] || null;
    this.flipped = false;
    document.getElementById("flashcard").classList.remove("flipped");
    this.render();
  },

  markRetry() {
    if (!this.current) return;
    // Move to end of queue
    const card = this.queue.shift();
    this.queue.push(card);
    this.current = this.queue[0] || null;
    this.flipped = false;
    document.getElementById("flashcard").classList.remove("flipped");
    this.render();
  },

  render() {
    const cat = document.getElementById("catFilter").value;
    const total = cat === "all" ? this.allCards.length : this.allCards.filter((c) => c.cat === cat).length;
    const knownInCat = cat === "all"
      ? this.known.size
      : this.allCards.filter((c) => c.cat === cat && this.known.has(c.nl)).length;

    const pct = total ? Math.round((knownInCat / total) * 100) : 0;
    document.getElementById("fcProgressFill").style.width = pct + "%";
    document.getElementById("fcProgressLabel").textContent = `${knownInCat} / ${total} bekend`;

    const emptyEl = document.getElementById("fcEmpty");
    const buttonsEl = document.getElementById("fcButtons");
    const cardEl = document.getElementById("flashcard");

    if (!this.current) {
      emptyEl.style.display = "";
      buttonsEl.style.display = "none";
      cardEl.style.visibility = "hidden";
      return;
    }

    emptyEl.style.display = "none";
    buttonsEl.style.display = "";
    cardEl.style.visibility = "";

    document.getElementById("fcCategory").textContent = this.current.cat;
    document.getElementById("fcFront").textContent = this.current.nl;
    document.getElementById("fcFarsi").textContent = this.current.fa;
    document.getElementById("fcEnglish").textContent = this.current.en;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 2 — UITSPRAAK
// ═════════════════════════════════════════════════════════════════════════════

const PR = {
  words: [...PR_WORDS],
  idx: 0,
  recording: false,

  init() {
    this.shuffle(this.words);
    this.render();

    document.getElementById("prTts").addEventListener("click", () => {
      playTTS(this.words[this.idx].nl);
    });
    document.getElementById("prMic").addEventListener("click", () => this.toggleMic());
    document.getElementById("prNext").addEventListener("click", () => this.next());
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  },

  render() {
    const w = this.words[this.idx];
    document.getElementById("prCategory").textContent = w.cat;
    document.getElementById("prWord").textContent = w.nl;
    document.getElementById("prHint").textContent = w.hint || "";
    document.getElementById("prResult").classList.remove("visible", "match", "mismatch");
    document.getElementById("prResultText").textContent = "";
    document.getElementById("prCorrectText").textContent = "";
  },

  async toggleMic() {
    const btn = document.getElementById("prMic");
    if (this.recording) {
      // Stop
      this.recording = false;
      btn.classList.remove("recording");
      btn.textContent = "🎙 Spreek";
      btn.disabled = true;
      try {
        const blob = await stopRecording();
        btn.textContent = "⏳ Verwerken…";
        const text = await transcribeBlob(blob);
        this.showResult(text);
      } catch (err) {
        alert("Opname mislukt: " + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = "🎙 Spreek";
      }
    } else {
      // Start
      try {
        await startRecording();
        this.recording = true;
        btn.classList.add("recording");
        btn.textContent = "⏹ Stop";
      } catch (err) {
        alert("Microfoon niet beschikbaar: " + err.message);
      }
    }
  },

  showResult(transcribed) {
    const word = this.words[this.idx].nl;
    const match = isCloseEnough(transcribed, word);
    const resultEl = document.getElementById("prResult");
    resultEl.classList.add("visible");
    resultEl.classList.toggle("match", match);
    resultEl.classList.toggle("mismatch", !match);
    document.getElementById("prResultText").textContent = transcribed || "(geen spraak herkend)";
    document.getElementById("prCorrectText").textContent = word;
  },

  next() {
    this.idx = (this.idx + 1) % this.words.length;
    this.render();
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 3 — LUISTEREN
// ═════════════════════════════════════════════════════════════════════════════

const LS = {
  items: [...LISTEN_ITEMS],
  idx: 0,
  correct: 0,
  total: 0,
  answered: false,

  init() {
    this.shuffle(this.items);
    this.render();

    document.getElementById("lsTts").addEventListener("click", () => {
      playTTS(this.items[this.idx].sentence);
    });
    document.getElementById("lsCheck").addEventListener("click", () => this.check());
    document.getElementById("lsNext").addEventListener("click", () => this.next());
    document.getElementById("lsReveal").addEventListener("click", () => this.revealSentence());
    document.getElementById("lsAnswer").addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.check();
    });
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  },

  render() {
    const item = this.items[this.idx];
    document.getElementById("lsQuestion").textContent = item.question;
    document.getElementById("lsQuestionFarsi").textContent = item.questionFa;
    document.getElementById("lsAnswer").value = "";
    document.getElementById("lsAnswer").disabled = false;
    document.getElementById("lsCheck").disabled = false;
    const fb = document.getElementById("lsFeedback");
    fb.classList.remove("visible", "correct", "wrong");
    fb.textContent = "";
    const sentEl = document.getElementById("lsSentenceText");
    sentEl.textContent = "";
    sentEl.classList.remove("revealed");
    this.answered = false;

    // Auto-play sentence after small delay
    setTimeout(() => playTTS(item.sentence), 400);
  },

  revealSentence() {
    const item = this.items[this.idx];
    const sentEl = document.getElementById("lsSentenceText");
    sentEl.textContent = item.sentence;
    sentEl.classList.add("revealed");
  },

  check() {
    if (this.answered) return;
    const userAnswer = document.getElementById("lsAnswer").value.trim();
    if (!userAnswer) return;

    const item = this.items[this.idx];
    const ok = isCloseEnough(userAnswer, item.answer);

    this.answered = true;
    this.total++;
    if (ok) this.correct++;

    document.getElementById("lsCorrect").textContent = this.correct;
    document.getElementById("lsTotal").textContent = this.total;
    document.getElementById("lsAnswer").disabled = true;
    document.getElementById("lsCheck").disabled = true;

    const fb = document.getElementById("lsFeedback");
    fb.classList.add("visible");
    if (ok) {
      fb.classList.add("correct");
      fb.textContent = "✓ Goed! " + (userAnswer !== item.answer ? `(Verwacht: "${item.answer}")` : "");
    } else {
      fb.classList.add("wrong");
      fb.textContent = `✗ Niet helemaal. Antwoord: "${item.answer}"`;
    }
    // Reveal sentence after checking
    this.revealSentence();
  },

  next() {
    this.idx = (this.idx + 1) % this.items.length;
    this.render();
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// MODULE 4 — ZINSBOUW
// ═════════════════════════════════════════════════════════════════════════════

const ZB = {
  topics: [...ZB_TOPICS],
  idx: 0,
  recording: false,
  lastCorrected: "",

  init() {
    this.shuffle(this.topics);
    this.renderTopic();

    document.getElementById("zbCorrect").addEventListener("click", () => this.correct());
    document.getElementById("zbNewTopic").addEventListener("click", () => this.newTopic());
    document.getElementById("zbMic").addEventListener("click", () => this.toggleMic());
    document.getElementById("zbTts").addEventListener("click", () => {
      if (this.lastCorrected) playTTS(this.lastCorrected);
    });
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  },

  renderTopic() {
    document.getElementById("zbTopicText").textContent = this.topics[this.idx];
    document.getElementById("zbInput").value = "";
    const result = document.getElementById("zbResult");
    result.classList.remove("visible");
    this.lastCorrected = "";
  },

  newTopic() {
    this.idx = (this.idx + 1) % this.topics.length;
    this.renderTopic();
  },

  async correct() {
    const sentence = document.getElementById("zbInput").value.trim();
    if (!sentence) {
      document.getElementById("zbInput").focus();
      return;
    }

    const topic = this.topics[this.idx];
    const btn = document.getElementById("zbCorrect");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Bezig…';

    try {
      const res = await fetch("/api/taal/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence, topic }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      this.showResult(sentence, data.corrected, data.explanation || []);
    } catch (err) {
      alert("Correctie mislukt: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = "Corrigeer";
    }
  },

  showResult(original, corrected, explanation) {
    this.lastCorrected = corrected;

    document.getElementById("zbOriginal").textContent = original;
    document.getElementById("zbCorrected").textContent = corrected;

    const ul = document.getElementById("zbExplanation");
    ul.innerHTML = "";
    if (explanation.length === 0) {
      const li = document.createElement("li");
      li.className = "correct-note";
      li.textContent = "Zin is correct!";
      ul.appendChild(li);
    } else {
      explanation.forEach((exp) => {
        const li = document.createElement("li");
        const lower = exp.toLowerCase();
        const isPositive = lower.startsWith("correct") || lower.includes("goed") || lower.includes("perfect");
        if (isPositive) li.className = "correct-note";
        li.textContent = exp;
        ul.appendChild(li);
      });
    }

    document.getElementById("zbResult").classList.add("visible");
  },

  async toggleMic() {
    const btn = document.getElementById("zbMic");
    if (this.recording) {
      this.recording = false;
      btn.classList.remove("recording");
      btn.textContent = "🎙";
      btn.disabled = true;
      try {
        const blob = await stopRecording();
        btn.textContent = "⏳";
        const text = await transcribeBlob(blob);
        document.getElementById("zbInput").value = text;
      } catch (err) {
        alert("Opname mislukt: " + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = "🎙";
      }
    } else {
      try {
        await startRecording();
        this.recording = true;
        btn.classList.add("recording");
        btn.textContent = "⏹";
      } catch (err) {
        alert("Microfoon niet beschikbaar: " + err.message);
      }
    }
  },
};

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  checkAiStatus();
  FC.init();
  PR.init();
  LS.init();
  ZB.init();
});
