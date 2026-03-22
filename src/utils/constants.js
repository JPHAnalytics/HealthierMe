export const COLORS = {
  bg: "#0a0f0d",
  card: "#111a15",
  cardHover: "#162019",
  accent: "#22c55e",
  accentDim: "#166534",
  accentGlow: "rgba(34,197,94,0.15)",
  warning: "#f59e0b",
  danger: "#ef4444",
  text: "#e8f5e9",
  textDim: "#6b7f71",
  textMuted: "#3d4f44",
  border: "#1e2e24",
  streak: "#22c55e",
  miss: "#ef4444",
  future: "#1a2620",
  today: "#22c55e",
};

// AF days: Sunday (0), Tuesday (2), Thursday (4)
// Easy to update when leveling up to more days
export const AF_DAYS = [0, 2, 4];

export const WORKOUT_TYPES = [
  "Weights",
  "Run",
  "Walk",
  "HIIT",
  "Yoga",
  "Cycling",
  "Bodyweight",
  "Other",
];

export const RATIONALIZATIONS = [
  { id: "tomorrow", label: "I'll start tomorrow", short: "Tomorrow", emoji: "\u23F3" },
  { id: "earned", label: "I've been good, I earned this", short: "Earned it", emoji: "\uD83C\uDFC6" },
  { id: "justone", label: "It's just one", short: "Just one", emoji: "\u261D\uFE0F" },
  { id: "bored", label: "I'm bored, nothing to do", short: "Bored", emoji: "\uD83D\uDE11" },
  { id: "notserious", label: "This isn't that serious", short: "Not serious", emoji: "\uD83D\uDE44" },
];

export const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7"];

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const TABS = [
  { id: "score", label: "Score", emoji: "\u26A1" },
  { id: "calendar", label: "AF Days", emoji: "\uD83D\uDD25" },
  { id: "workout", label: "Gym", emoji: "\uD83D\uDCAA" },
  { id: "rats", label: "Lies", emoji: "\uD83E\uDDE0" },
];
