# VibeVoice on Hetzner — Assessment & Deployment Plan

> Status: BLOCKED on SSH access (key auth denied, password auth failing).
> Fix first: from Hetzner web console, run
> `mkdir -p ~/.ssh && echo "<YOUR_PUBLIC_KEY>" >> ~/.ssh/authorized_keys`
> or re-enable `PasswordAuthentication yes` in /etc/ssh/sshd_config + `systemctl restart sshd`.

## 1. Honest viability verdict (read this first)

**VibeVoice on this server (4 vCPU / 8 GB / no GPU) is NOT practical for production.**

- VibeVoice 1.5B needs ~3–4 GB RAM in bf16, ~6 GB in fp32. The box has ~5.9 GB free
  with n8n + Postgres + Traefik already running. It fits, barely, with zero headroom.
- The real problem is speed: the model targets CUDA GPUs. On CPU, expect minutes of
  compute per minute of audio (real-time factor well below 1). A 8-minute story could
  take 30–60+ minutes and peg all 4 vCPUs, starving n8n meanwhile.
- Microsoft's repo ships no official CPU path or quantized GGUF; community CPU runs
  confirm "it works but is very slow".

**Recommended strategy instead:**

| Phase | Audio engine | Cost | Why |
|---|---|---|---|
| Now (V1) | OpenAI TTS (`gpt-4o-mini-tts`) via existing provider layer | ~€0.01–0.02 per story | Already wired in `src/lib/ai/providers/openai-audio.ts`, French quality is good, audio is generated once per story at first listen then cached, so monthly cost is near zero |
| Quality test | VibeVoice on a rented GPU (RunPod/Vast.ai, RTX 4090 spot ≈ $0.30/h) | ~$1 for a full test batch | Generate 5–10 sample stories, A/B against OpenAI TTS, decide with ears not specs |
| If VibeVoice wins | Batch mode: n8n triggers a GPU pod, generates queued audio, uploads to Supabase Storage, pod shuts down | pennies per batch | Orchestration stays on Hetzner, GPU only exists minutes per day |

The Hetzner box stays what it is good at: n8n orchestration, webhooks, Umami analytics.

## 2. If you still want the CPU trial on Hetzner (quality check only)

Isolated stack, untouched Traefik/n8n, internal-only (no public route needed —
n8n reaches it over the Docker network):

`/home/docker/projects/vibevoice/docker-compose.yml`
```yaml
services:
  vibevoice:
    build: .
    container_name: vibevoice
    restart: unless-stopped
    environment:
      - MODEL_ID=microsoft/VibeVoice-1.5B
      - DEVICE=cpu
      - TORCH_DTYPE=bfloat16
    volumes:
      - ./models:/root/.cache/huggingface
    networks:
      - global_web_network   # so n8n-core can call http://vibevoice:8000
    deploy:
      resources:
        limits:
          memory: 5g         # hard cap so it can never OOM the n8n stack
          cpus: "3"          # leave 1 vCPU for everything else
networks:
  global_web_network:
    external: true
```

`/home/docker/projects/vibevoice/Dockerfile`
```dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y git ffmpeg && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/microsoft/VibeVoice /app
WORKDIR /app
RUN pip install --no-cache-dir -e . fastapi uvicorn
# Small FastAPI wrapper: POST /tts {text, voice} -> wav. Write app/server.py
# (20 lines) once repo layout is confirmed on the machine.
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

Run: `docker compose up -d --build` then test from n8n with an HTTP Request node to
`http://vibevoice:8000/tts`. First model download is ~3 GB into `./models`.

Checks before/while running (per your audit requirements):
- `docker network inspect global_web_network` (exists, external)
- No Traefik labels on this container = no public exposure, nothing to collide
- `docker stats` while generating; if the box swaps, stop the trial

## 3. n8n story pipeline (next session, once SSH works)

Workflow "Generate library story":
1. Webhook/manual trigger (theme, genre, age)
2. HTTP → Anthropic API (story + quiz + glossary JSON, same prompt contract as
   `src/lib/ai/providers/anthropic-text.ts`)
3. Insert into Supabase `stories` via Postgres node (pooler URL, port 6543)
4. HTTP → image provider for the cover (slot stays placeholder until Harry's art)
5. Audio is NOT generated here, it happens at first listen via the app

Credentials already in app/.env.local: N8N_API_URL, N8N_API_KEY,
ANTHROPIC_API_KEY, Supabase keys.

## 4. What I need from you to proceed on the server

One of:
- Add my/your SSH public key via Hetzner console (command at the top), or
- A working root password with `PasswordAuthentication yes`, or
- Run the docker-compose above yourself via the Hetzner web console terminal.
