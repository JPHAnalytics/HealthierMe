# API Directory — Future Jandy Integration

This directory is a placeholder for the planned webhook integration with Jandy (the OpenClaw accountability bot).

## Planned Endpoints

### POST /api/checkin
Receives check-in data from Jandy via Telegram webhook:
```json
{
  "type": "af_day" | "workout" | "rationalization",
  "date": "YYYY-MM-DD",
  "data": { ... }
}
```

### GET /api/stats
Returns current stats for Jandy to reference in accountability messages:
```json
{
  "streak": 5,
  "weekScore": 100,
  "totalAFDays": 12,
  "lastWorkout": "2024-01-15"
}
```

## Architecture
Once implemented, the flow will be:
1. User responds to Jandy on Telegram
2. Jandy processes the response and sends a webhook to this API
3. Dashboard auto-updates with the latest data
4. Jandy can query stats to personalize messages
