# Jandy — Deployment Guide

Jandy is an OpenClaw-powered Telegram accountability bot that sends scheduled check-in messages and responds to AF day reports, workout logs, and rationalization tracking.

## Prerequisites

- A running OpenClaw instance (gateway + agent)
- A GCP VM (or any server) with OpenClaw installed
- A Telegram account
- Node.js 18+ on the server

## Step-by-Step Deployment

### 1. Back Up Existing Configs

```bash
cd /path/to/openclaw
cp config.yml config.yml.bak
cp SOUL.md SOUL.md.bak 2>/dev/null
```

### 2. Copy Configuration Files

```bash
# Copy soul and heartbeat definitions
cp jandy_configs/SOUL.md /path/to/openclaw/SOUL.md
cp jandy_configs/HEARTBEAT.md /path/to/openclaw/HEARTBEAT.md

# Copy skills
mkdir -p /path/to/openclaw/skills
cp jandy_configs/skills/accountability-coach.md /path/to/openclaw/skills/

# Merge config additions into your existing config.yml
# Review jandy_configs/config_additions.yml and add relevant sections
```

### 3. Set Up Telegram Bot

1. Open Telegram and message **@BotFather**
2. Send `/newbot` and follow the prompts
3. Choose a name (e.g., "Jandy Coach") and username (e.g., `jandy_coach_bot`)
4. Copy the bot token provided by BotFather
5. Set the token as an environment variable:

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token_here"
```

### 4. Get Your Chat ID

1. Message your new bot on Telegram (send anything)
2. Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
3. Find the `chat.id` value in the response
4. Update `config_additions.yml` with your `chat_id`

### 5. Configure Timezone and Allowlist

In your merged config.yml:

```yaml
heartbeat:
  timezone: "America/New_York"  # Your timezone

telegram:
  chat_id: "YOUR_CHAT_ID"
  allowlist:
    - "YOUR_TELEGRAM_USER_ID"
```

### 6. Create Memory Files

```bash
mkdir -p /path/to/openclaw/memory
touch /path/to/openclaw/memory/accountability.json
touch /path/to/openclaw/memory/fitness.json
touch /path/to/openclaw/memory/rationalizations.json
touch /path/to/openclaw/memory/personal.json
```

Initialize each with an empty JSON array:
```bash
for f in /path/to/openclaw/memory/*.json; do echo '[]' > "$f"; done
```

### 7. Restart the Gateway

```bash
# Stop existing process
pm2 stop openclaw-gateway  # or however you manage the process

# Start with new config
pm2 start openclaw-gateway

# Verify it's running
pm2 logs openclaw-gateway
```

### 8. Test with Manual Heartbeat

Send a test message to verify the bot works:

```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "YOUR_CHAT_ID", "text": "🔥 Jandy is LIVE. Let'\''s build something."}'
```

If you see the message in Telegram, Jandy is ready.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Bot doesn't respond | Check `TELEGRAM_BOT_TOKEN` env var is set |
| Messages not sending | Verify `chat_id` and `allowlist` in config |
| Wrong timezone | Update `heartbeat.timezone` in config |
| No heartbeat messages | Check `heartbeat.enabled: true` and interval |
| Memory not saving | Ensure memory directory exists and is writable |

## File Reference

| File | Purpose |
|------|---------|
| `SOUL.md` | Agent personality and coaching framework |
| `HEARTBEAT.md` | Message schedule and protocols |
| `config_additions.yml` | OpenClaw configuration additions |
| `skills/accountability-coach.md` | Check-in processing and rationalization detection |
