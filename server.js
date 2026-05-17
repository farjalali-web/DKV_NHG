const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) return;
    const match = clean.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]]) return;
    const value = match[2].replace(/^["']|["']$/g, "");
    process.env[match[1]] = value;
  });
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const API_KEY = (process.env.OPENAI_API_KEY || "").trim();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".webm": "audio/webm",
  ".mp3": "audio/mpeg",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  if (Buffer.isBuffer(body)) {
    res.end(body);
  } else {
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function readRawBody(req, maxBytes = 10_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Audio too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function handleTaalCorrect(req, res) {
  if (!API_KEY) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  let body;
  try { body = await readBody(req); } catch (e) { return send(res, 400, { error: e.message }); }
  const sentence = (body.sentence || "").trim();
  const topic = (body.topic || "").trim();
  if (!sentence) return send(res, 400, { error: "sentence is required" });
  const instructions = [
    "You are a Dutch language coach for a Persian-speaking doctor learning medical Dutch for the DKV exam.",
    "Correct the given Dutch sentence for: grammar, word order (V2 rule), formality (always use 'u' in consultation), article use (de/het), and naturalness.",
    "Return ONLY valid JSON in this exact format (no markdown, no backticks):",
    '{ "corrected": "...", "explanation": ["Fout 1: ...", "Fout 2: ..."] }',
    "Rules:",
    "- Keep explanations in English, max 3 bullet strings in the explanation array.",
    "- If the sentence is already correct, set explanation to [\"Correct! The sentence is grammatically sound and natural.\"]",
    "- Do not add extra keys to the JSON.",
    "- corrected must always contain the best Dutch version of the sentence.",
  ].join("\n");
  const input = JSON.stringify({ topic, sentence });
  let raw = "";
  try { raw = await callOpenAI(input, instructions); }
  catch (e) { return send(res, 502, { error: e.message }); }
  if (!raw) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  try {
    // Strip possible markdown code fences
    const clean = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(clean);
    send(res, 200, parsed);
  } catch {
    // Fallback: return raw as corrected with no explanation
    send(res, 200, { corrected: raw, explanation: [] });
  }
}

async function handleVerslagCheck(req, res) {
  if (!API_KEY) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  let body;
  try { body = await readBody(req); } catch (e) { return send(res, 400, { error: e.message }); }
  const instructions = [
    "Je bent een strenge DKV-examinator die een huisartsconsultverslag beoordeelt.",
    "Beoordeel het verslag op deze 6 onderdelen:",
    "1. Patiënt + reden van komst — naam, leeftijd, hoofdklacht aanwezig?",
    "2. Speciële anamnese — positieve én negatieve bevindingen vermeld?",
    "3. Voorgeschiedenis / medicatie / allergieën / sociale context",
    "4. Lichamelijk onderzoek — vitale parameters en bevindingen vermeld?",
    "5. Probleemlijst + DD — werkdiagnose en differentiaaldiagnose?",
    "6. Plan — aanvullend onderzoek, uitleg, beleid, controle én alarmsymptomen?",
    "Formaat per onderdeel:",
    "  ✓ [Onderdeel] — kort wat goed was",
    "  ✗ [Onderdeel] — wat ontbrak of fout was, met concreet voorbeeld",
    "  ⚠ [Onderdeel] — aanwezig maar onvolledig, met verbeterpunt",
    "Sluit af met één zin: de belangrijkste verbetering voor het examen.",
    "Maximaal 8 regels. Geen inleiding.",
  ].join("\n");
  const input = JSON.stringify({
    casus: body.case,
    verslag: body.verslag,
    transcriptSamenvatting: body.transcript,
  });
  let feedback = "";
  try { feedback = await callOpenAI(input, instructions); }
  catch (e) { return send(res, 502, { error: e.message }); }
  if (!feedback) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  send(res, 200, { feedback });
}

async function handleAnamneseCheck(req, res) {
  if (!API_KEY) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  let body;
  try { body = await readBody(req); } catch (e) { return send(res, 400, { error: e.message }); }
  const instructions = [
    "Je bent een DKV-examinator. Analyseer of de arts alle essentiële anamnesevragen heeft gesteld.",
    "Controleer deze 9 categorieën:",
    "1. Open start — 'Wat kan ik voor u doen?' of vergelijkbaar",
    "2. Hoofdklacht — onset, duur, beloop, ernst (SOCRATES-elementen)",
    "3. Alarmsymptomen / rode vlaggen passend bij de casus",
    "4. Medicatie en allergieën",
    "5. Voorgeschiedenis relevant voor de casus",
    "6. Roken / alcohol / drugs op indicatie",
    "7. Sociale context — werk, thuis, mantelzorg",
    "8. Familieanamnese op indicatie",
    "9. Samenvatting / terugvragen om begrip te controleren",
    "Formaat per categorie:",
    "  ✓ [Categorie] — als het duidelijk aanwezig was",
    "  ✗ [Categorie] — Gemist. Zeg bijv.: \"...\" (geef een voorbeeldzin in het Nederlands)",
    "Wees streng: als iets maar half of impliciet gevraagd is, markeer het als gemist.",
    "Maximaal 11 regels. Geen inleiding, geen conclusie.",
  ].join("\n");
  const input = JSON.stringify({ casus: body.case, transcript: body.transcript });
  let analysis = "";
  try { analysis = await callOpenAI(input, instructions); }
  catch (e) { return send(res, 502, { error: e.message }); }
  if (!analysis) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  send(res, 200, { analysis });
}

async function handleSTT(req, res) {
  if (!API_KEY) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  let audioBuffer;
  try {
    audioBuffer = await readRawBody(req);
  } catch (error) {
    return send(res, 400, { error: error.message });
  }
  const contentType = req.headers["content-type"] || "audio/webm";
  const filename = contentType.includes("ogg") ? "audio.ogg" : "audio.webm";
  const form = new FormData();
  form.append("file", new Blob([audioBuffer], { type: contentType }), filename);
  form.append("model", "whisper-1");
  form.append("language", "nl");
  let response;
  try {
    response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}` },
      body: form,
    });
  } catch (error) {
    return send(res, 502, { error: error.message });
  }
  if (!response.ok) {
    const text = await response.text();
    return send(res, 502, { error: `Whisper ${response.status}: ${text.slice(0, 300)}` });
  }
  const data = await response.json();
  send(res, 200, { text: data.text });
}

async function handleTTS(req, res) {
  if (!API_KEY) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    return send(res, 400, { error: error.message });
  }
  const text = (body.text || "").trim();
  if (!text) return send(res, 400, { error: "text is required" });
  let response;
  try {
    response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "nova",
        input: text.slice(0, 4096),
        response_format: "mp3",
      }),
    });
  } catch (error) {
    return send(res, 502, { error: error.message });
  }
  if (!response.ok) {
    const errText = await response.text();
    return send(res, 502, { error: `TTS ${response.status}: ${errText.slice(0, 300)}` });
  }
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  res.writeHead(200, { "Content-Type": "audio/mpeg", "Access-Control-Allow-Origin": "*" });
  res.end(audioBuffer);
}

async function callOpenAI(input, instructions) {
  if (!API_KEY) return null;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input,
      temperature: 0.35,
      max_output_tokens: 900,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI ${response.status}: ${text.slice(0, 300)}`);
  }
  const data = await response.json();
  return data.output_text || data.output?.flatMap((item) => item.content || []).map((part) => part.text || "").join("\n") || "";
}

async function handlePatient(req, res) {
  const body = await readBody(req);
  const isExam = body.mode === "onderzoek";
  const mode = isExam ? "lichamelijk onderzoek" : "anamnese";
  const instructions = isExam
    ? [
        "Je bent een realistische DKV-simulator voor lichamelijk onderzoek in de Nederlandse huisartsenpraktijk.",
        "Geef alleen de onderzoeksbevinding waar de arts om vraagt. Geef geen diagnose, onderwijsfeedback of beleid.",
        "Gebruik uitsluitend de casus en het meegegeven onderzoeksprofiel. Verzin geen nieuwe ernstige afwijkingen.",
        "Als de arts meerdere onderzoeken noemt, beantwoord ze kort puntsgewijs.",
        "Als een bevinding niet in het profiel staat, antwoord: 'Niet afwijkend voor zover nu bekend' of 'Dat is niet op de voorgrond'.",
        "Antwoord in het Nederlands, maximaal 4 korte zinnen.",
      ].join("\n")
    : [
        "Je bent één realistische patiënt in een Nederlandse DKV/huisartsconsult-oefening.",
        "Beantwoord uitsluitend de laatste vraag van de arts, in gewone patiëntentaal en vanuit de ik-vorm.",
        "Herhaal eerdere antwoorden niet, tenzij de arts expliciet samenvat of opnieuw vraagt.",
        "Bij een open vraag geef je de hoofdklacht kort met enkele relevante details. Bij een gesloten vraag antwoord je gericht en kort.",
        "Gebruik uitsluitend de casus, het patiëntprofiel en het gesprek tot nu toe. Verzin geen nieuwe rode vlaggen of diagnosen.",
        "Als iets niet bekend is, zeg natuurlijk: 'Dat weet ik niet precies' of 'Nee, dat staat niet zo op de voorgrond'.",
        "BELANGRIJK — Medisch jargon: als de arts een woord of term gebruikt dat een gewone patiënt niet begrijpt (bijv. 'orthopneu', 'dyspneu', 'auscultatie', 'ausculteren', 'percussie', 'palpatie', 'tachycardie', 'saturatie', 'hemoptoe', 'diureticum', 'antistolling', 'anticoagulantia', 'trombose', 'embolie', 'ischemie', 'radiculair', 'neuropathie', 'maligniteit', 'metastase', of andere medische vaktermen), reageer dan NIET met een antwoord maar zeg iets als: 'Wat bedoelt u daarmee?' of 'Dat woord ken ik niet, kunt u dat uitleggen?' of 'Kunt u dat in gewone taal zeggen?'. Doe dit realistisch — een gewone patiënt herkent medische termen niet.",
        "Antwoord in het Nederlands, meestal 1-3 zinnen.",
      ].join("\n");
  const input = JSON.stringify({
    taak: mode,
    casus: body.case,
    patientprofiel: body.dialogue,
    gesprekTotNuToe: body.transcript,
    vraagVanArts: body.question,
  });
  let answer = "";
  try {
    answer = await callOpenAI(input, instructions);
  } catch (error) {
    return send(res, 502, { error: error.message, source: "ai" });
  }
  if (!answer) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  send(res, 200, { answer, source: "ai", model: MODEL });
}

async function handleEvaluate(req, res) {
  const body = await readBody(req);
  const instructions = [
    "Je bent een strenge maar behulpzame DKV-examinator voor de huisartsenpraktijk.",
    "Beoordeel het consult op: gemiste anamnesevragen, gemist lichamelijk onderzoek, DD, lab/imaging, uitleg, beleid, safety net en verslag.",
    "Beoordeel ook de consultstructuur en communicatie:",
    "  - Begon de arts met een open vraag? (bijv. 'Wat kan ik voor u doen?')",
    "  - Werd er samengevat/teruggevraagd om begrip te controleren?",
    "  - Werd de patiënt uitleg gegeven in gewone taal?",
    "  - Werd een duidelijk safety net gegeven met alarmsymptomen?",
    "  - Werd de patiënt actief betrokken bij het beleid?",
    "Geef concrete feedback: 'Je had nog moeten vragen/zeggen: ...' met voorbeeldzinnen in het Nederlands.",
    "Markeer gemiste safety net apart met ⚠️.",
    "Gebruik NHG-achtige huisartsenlogica, maar geen lange richtlijntekst.",
    "Antwoord in het Nederlands met maximaal 10 bullets. Begin met de grootste missen.",
  ].join("\n");
  const input = JSON.stringify({
    casus: body.case,
    route: body.route,
    verwachteElementen: body.correct,
    antwoorden: body.answers,
    transcript: body.transcript,
    verslag: body.verslag,
  });
  let feedback = "";
  try {
    feedback = await callOpenAI(input, instructions);
  } catch (error) {
    return send(res, 502, { error: error.message, source: "ai" });
  }
  if (!feedback) return send(res, 503, { error: "OPENAI_API_KEY ontbreekt" });
  send(res, 200, { feedback, source: "ai", model: MODEL });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = decodeURIComponent(url.pathname);
  if (filePath === "/") filePath = "/index.html";
  const fullPath = path.normalize(path.join(ROOT, filePath));
  if (!fullPath.startsWith(ROOT)) return send(res, 403, "Forbidden", "text/plain");
  fs.readFile(fullPath, (error, data) => {
    if (error) return send(res, 404, "Not found", "text/plain");
    send(res, 200, data, MIME[path.extname(fullPath)] || "application/octet-stream");
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return send(res, 204, "");
    if (req.url === "/api/status") return send(res, 200, { ai: Boolean(API_KEY), model: API_KEY ? MODEL : null, keySource: API_KEY ? "server" : null });
    if (req.url === "/healthz") return send(res, 200, { ok: true });
    if (req.method === "POST" && req.url === "/api/patient") return handlePatient(req, res);
    if (req.method === "POST" && req.url === "/api/evaluate") return handleEvaluate(req, res);
    if (req.method === "POST" && req.url === "/api/stt") return handleSTT(req, res);
    if (req.method === "POST" && req.url === "/api/tts") return handleTTS(req, res);
    if (req.method === "POST" && req.url === "/api/anamnese-check") return handleAnamneseCheck(req, res);
    if (req.method === "POST" && req.url === "/api/verslag-check") return handleVerslagCheck(req, res);
    if (req.method === "POST" && req.url === "/api/taal/correct") return handleTaalCorrect(req, res);
    // Serve /taal as taal.html
    if (req.method === "GET" && (req.url === "/taal" || req.url === "/taal/")) {
      const filePath = path.join(ROOT, "taal.html");
      fs.readFile(filePath, (error, data) => {
        if (error) return send(res, 404, "Not found", "text/plain");
        send(res, 200, data, "text/html; charset=utf-8");
      });
      return;
    }
    return serveStatic(req, res);
  } catch (error) {
    send(res, 500, { error: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`DKV trainer: http://${HOST}:${PORT}`);
  if (HOST === "0.0.0.0") console.log(`LAN mode: open http://<mac-ip>:${PORT} on your iPhone.`);
  console.log(API_KEY ? `AI bridge enabled with ${MODEL}` : "AI bridge inactive: OPENAI_API_KEY missing, app will use local fallback.");
});
