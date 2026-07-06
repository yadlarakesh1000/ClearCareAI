# Gemini Setup & Quota Troubleshooting (self-service)

The FastAPI service uses Google Gemini to clean/summarize/analyze voice-review
transcripts. The model name is **configurable** — you never need to edit code to
change it. This doc is everything you need to keep it running yourself.

---

## Where the model is configured

- File: `fastapi-service/.env`
- Line: `GEMINI_MODEL=gemini-2.5-flash-lite`
- If that line is absent, the code default in `config.py` is used.
- The API key: `GEMINI_API_KEY=...` in the same `.env`.

**After ANY change to `.env`, you MUST restart FastAPI** (uvicorn's `--reload`
watches `.py` files, NOT `.env`):
```bash
# stop the running uvicorn (Ctrl+C in its terminal), then:
cd fastapi-service
uvicorn main:app --reload --port 8000
```
Only ONE uvicorn may hold port 8000. If restart says "address already in use",
find and stop the old one first:
```bash
# Windows: find the PID on 8000, then kill it
netstat -ano | findstr :8000
taskkill /F /PID <pid>
```

---

## Symptom → cause map

| What you see | Cause | Fix |
|---|---|---|
| Review COMPLETES but `cleaned_review` = raw text, `summary` = "Review processing failed", `sentiment` = NEUTRAL | Gemini call failed; the service fell back gracefully | Check the FastAPI log for the real error (below) |
| Log: `404 ... model ... not found` | Model name retired/unavailable | Change `GEMINI_MODEL` to a supported model |
| Log: `429 ... ResourceExhausted ... quota` | Free-tier quota used up | Wait for reset, switch model, or new key (below) |
| Log: `401/403 ... API key not valid` | Bad/expired key | Generate a new key (below) |

**The pipeline never breaks on a Gemini failure** — the review still completes with
the raw transcript and NEUTRAL sentiment (graceful fallback by design). Fixing
Gemini just upgrades those three fields to real AI output.

---

## Step 1 — See which models YOUR key supports

Run this from `fastapi-service/` (reads your key from `.env`):
```bash
python -c "import google.generativeai as genai; key=[l.split('=',1)[1].strip() for l in open('.env') if l.startswith('GEMINI_API_KEY=')][0]; genai.configure(api_key=key); [print(m.name) for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]"
```
Any name it prints (drop the `models/` prefix) is valid for `GEMINI_MODEL`.

## Step 2 — Test whether a model actually generates (not just listed)

Listing ≠ having quota. Test generation directly:
```bash
python -c "import google.generativeai as genai; key=[l.split('=',1)[1].strip() for l in open('.env') if l.startswith('GEMINI_API_KEY=')][0]; genai.configure(api_key=key); print(genai.GenerativeModel('gemini-2.5-flash-lite').generate_content('say ok').text)"
```
- Prints text → model works, use it.
- `ResourceExhausted / 429` → quota gone, pick another model or wait.

## Step 3 — Switch the model

Edit `.env`, change the line, restart FastAPI:
```
GEMINI_MODEL=gemini-2.5-flash
```
Good fallbacks to try, in order (each has separate quota buckets):
`gemini-2.5-flash-lite` → `gemini-flash-lite-latest` → `gemini-2.5-flash`
→ `gemini-flash-latest` → `gemini-3.5-flash` (use whatever Step 1 lists).

---

## If ALL models show 429 (whole key is quota-limited)

Free-tier limits are **per-minute** AND **per-day**:
- **Per-minute limit:** just wait ~60 seconds and retry. Each webhook makes 3
  Gemini calls, so rapid testing trips this fast.
- **Per-day limit:** resets ~24h later (midnight Pacific). Options meanwhile:
  1. **Use a different key** (below) — a second Google account = fresh quota.
  2. **Enable billing** on the Google Cloud project behind the key to lift free
     limits: https://ai.google.dev → your key's project → enable billing.
  3. **Reduce calls per review** (optional code change): the webhook calls Gemini
     3× (grammar, summary, sentiment). You could drop to 1 combined prompt, but
     that's an optimization, not required.

## Get a new / replacement API key (2 minutes, free)

1. Go to https://aistudio.google.com/app/apikey (Google AI Studio → API keys).
2. Sign in (a different Google account gives a fresh free quota).
3. Click **Create API key**, copy it.
4. Paste into `fastapi-service/.env`:
   ```
   GEMINI_API_KEY=your-new-key
   ```
5. Restart FastAPI. Re-run Step 1/2 to confirm which models the new key supports.

---

## Quick reference — the two lines that matter in `.env`
```
GEMINI_API_KEY=<your key from aistudio.google.com/app/apikey>
GEMINI_MODEL=<a model from Step 1 that passes Step 2>
```
Change either → restart FastAPI → done. No code edits ever needed.
