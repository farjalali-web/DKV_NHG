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
      max_output_tokens: 600,
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
    "Geef concrete feedback: 'Je had nog moeten vragen: ...' met voorbeeldzinnen.",
    "Gebruik NHG-achtige huisartsenlogica, maar geen lange richtlijntekst.",
    "Antwoord in het Nederlands met maximaal 8 bullets.",
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
