# DKV NHG Trainer - Deploy Finglish

Goal: app az har ja rooye iPhone baz beshe, bedoon inke iPhone va Mac rooye hamoon Wi-Fi bashan.

## Option A: Render

1. Ye GitHub repo besaz va folder `output/dkv_nhg_trainer` ro push kon.
2. Too Render, `New` -> `Web Service` ro bezan.
3. Repo ro connect kon.
4. Agar Render root ro miporse, bezar:

```text
output/dkv_nhg_trainer
```

5. Build command:

```text
npm install
```

6. Start command:

```text
npm start
```

7. Environment variables ro ezafe kon:

```text
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4.1-mini
NODE_ENV=production
```

8. Deploy ro bezan. Baad az deploy, Render ye URL mide mesle:

```text
https://dkv-nhg-trainer.onrender.com
```

Hamoon URL ro too Safari-e iPhone baz kon.

## Option B: Docker / any server

Agar hosting Docker support dare:

```bash
docker build -t dkv-nhg-trainer .
docker run -p 8787:8787 \
  -e OPENAI_API_KEY="sk-proj-..." \
  -e OPENAI_MODEL="gpt-4.1-mini" \
  dkv-nhg-trainer
```

## Important

- `.env` ro upload nakon. Secret hast.
- API key bayad faghat too hosting environment variables bashe.
- Agar app badge `AI error` neshon dad, OpenAI billing/quota ro check kon.
