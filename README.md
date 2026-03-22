# HealthierMe

**Your ADHD-Proof Accountability System**

A mobile-first dashboard + AI accountability coach for reducing alcohol and building fitness habits. Track alcohol-free days, log workouts, catch rationalizations, and monitor weekly progress — all with a dark, terminal-meets-fitness-tracker aesthetic.

## Architecture

```
┌──────────────────┐     ┌─────────────────────────┐     ┌──────────────┐
│  Browser (SPA)   │◄───►│  GCP VM                 │◄───►│  Telegram    │
│  HealthierMe     │     │  Jandy (OpenClaw Agent)  │     │  Messages    │
│  Dashboard       │     │  Accountability Coach    │     │  Check-ins   │
└──────────────────┘     └─────────────────────────┘     └──────────────┘
```

- **Dashboard:** Pure client-side React SPA with localStorage persistence
- **Jandy:** OpenClaw-powered Telegram bot that sends scheduled accountability messages
- **Telegram:** The communication channel for check-ins, coaching, and rationalization countering

## Features

- **AF Day Calendar** — GitHub-style heatmap tracking alcohol-free days (Tue/Thu/Sun)
- **AF Day Logger** — One-tap YES/NO check-in on AF days
- **Workout Logger** — Log workouts with type, duration, and 7-day bar chart
- **Rationalization Tracker** — Track the 5 mental lies with tap-to-log and pie chart breakdown
- **Weekly Score** — Giant percentage score, stat grid, 4-week trend line, coaching messages
- **Dark Theme** — High-contrast dark design optimized for mobile

## Quick Start — Dashboard

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

## Quick Start — Jandy (Telegram Bot)

See [jandy_configs/README.md](./jandy_configs/README.md) for the full deployment guide.

## Tech Stack

- **Vite** + **React 18** — Fast dev server and optimized builds
- **Recharts** — Charts (LineChart, BarChart, PieChart)
- **localStorage** — Client-side data persistence
- **Custom CSS** — Dark theme, no CSS framework
- **OpenClaw** — AI agent framework for Jandy

## Screenshots

_Coming soon — screenshots of the dashboard on mobile._

## Roadmap

- [ ] Jandy webhook integration (auto-populate dashboard from Telegram check-ins)
- [ ] PWA support (installable on phone home screen)
- [ ] Data export (CSV/JSON)
- [ ] Customizable AF days
- [ ] Mood tracking
- [ ] Sleep tracking integration
- [ ] Multi-week goal progression (3 days → 4 days → 5 days)

## License

MIT
