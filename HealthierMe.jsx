import { useState, useEffect, useCallback } from “react”;
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from “recharts”;

const RATIONALIZATIONS = [
{ id: “tomorrow”, label: “I’ll start tomorrow”, short: “Tomorrow”, emoji: “⏳” },
{ id: “earned”, label: “I’ve been good, I earned this”, short: “Earned it”, emoji: “🏆” },
{ id: “justone”, label: “It’s just one”, short: “Just one”, emoji: “☝️” },
{ id: “bored”, label: “I’m bored, nothing to do”, short: “Bored”, emoji: “😑” },
{ id: “notserious”, label: “This isn’t that serious”, short: “Not serious”, emoji: “🙄” },
];

const WORKOUT_TYPES = [“Weights”, “Run”, “Walk”, “HIIT”, “Yoga”, “Cycling”, “Bodyweight”, “Other”];

const AF_DAYS = [2, 4, 0]; // Tue=2, Thu=4, Sun=0

const COLORS = {
bg: “#0a0f0d”,
card: “#111a15”,
cardHover: “#162019”,
accent: “#22c55e”,
accentDim: “#166534”,
accentGlow: “rgba(34,197,94,0.15)”,
warning: “#f59e0b”,
danger: “#ef4444”,
text: “#e8f5e9”,
textDim: “#6b7f71”,
textMuted: “#3d4f44”,
border: “#1e2e24”,
streak: “#22c55e”,
miss: “#ef4444”,
future: “#1a2620”,
today: “#22c55e”,
};

const dayNames = [“Sun”, “Mon”, “Tue”, “Wed”, “Thu”, “Fri”, “Sat”];
const monthNames = [“Jan”, “Feb”, “Mar”, “Apr”, “May”, “Jun”, “Jul”, “Aug”, “Sep”, “Oct”, “Nov”, “Dec”];

function getDateKey(d) {
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function isAFDay(date) {
return AF_DAYS.includes(date.getDay());
}

function getToday() {
const d = new Date();
return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getDaysInRange(startDate, days) {
const result = [];
for (let i = 0; i < days; i++) {
const d = new Date(startDate);
d.setDate(d.getDate() + i);
result.push(d);
}
return result;
}

function getWeekStart(date) {
const d = new Date(date);
d.setDate(d.getDate() - d.getDay());
return d;
}

const StorageManager = {
async load() {
try {
const result = await window.storage.get(“healthierme-data”);
return result ? JSON.parse(result.value) : null;
} catch { return null; }
},
async save(data) {
try {
await window.storage.set(“healthierme-data”, JSON.stringify(data));
} catch (e) { console.error(“Save failed:”, e); }
}
};

function defaultData() {
return {
startDate: getDateKey(getToday()),
afDays: {},
workouts: {},
rationalizations: {},
version: 1,
};
}

// – Components –

function GlowDot({ color = COLORS.accent, size = 8 }) {
return (
<span style={{
display: “inline-block”, width: size, height: size, borderRadius: “50%”,
background: color, boxShadow: `0 0 ${size}px ${color}`, flexShrink: 0
}} />
);
}

function TabBar({ tabs, active, onChange }) {
return (
<div style={{
display: “flex”, gap: 4, padding: “4px”, background: COLORS.card,
borderRadius: 16, border: `1px solid ${COLORS.border}`, marginBottom: 20
}}>
{tabs.map(t => (
<button key={t.id} onClick={() => onChange(t.id)} style={{
flex: 1, padding: “10px 6px”, border: “none”, borderRadius: 12, cursor: “pointer”,
fontSize: 11, fontWeight: 700, letterSpacing: “0.05em”, textTransform: “uppercase”,
fontFamily: “‘JetBrains Mono’, monospace”,
background: active === t.id ? COLORS.accent : “transparent”,
color: active === t.id ? COLORS.bg : COLORS.textDim,
transition: “all 0.2s ease”,
}}>
{t.emoji} {t.label}
</button>
))}
</div>
);
}

function StatCard({ label, value, sub, color = COLORS.accent, big }) {
return (
<div style={{
background: COLORS.card, borderRadius: 16, padding: big ? “20px 16px” : “14px 12px”,
border: `1px solid ${COLORS.border}`, flex: 1, minWidth: 0,
boxShadow: `inset 0 1px 0 ${COLORS.border}`,
}}>
<div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textDim, letterSpacing: “0.1em”,
textTransform: “uppercase”, marginBottom: 6, fontFamily: “‘JetBrains Mono’, monospace” }}>
{label}
</div>
<div style={{ fontSize: big ? 36 : 28, fontWeight: 800, color, lineHeight: 1,
fontFamily: “‘Space Grotesk’, sans-serif” }}>
{value}
</div>
{sub && <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>{sub}</div>}
</div>
);
}

function CalendarHeatmap({ data }) {
const today = getToday();
const startDate = data.startDate ? new Date(data.startDate + “T00:00:00”) : today;
const weekStart = getWeekStart(startDate);
const totalDays = Math.max(56, Math.ceil((today - weekStart) / 86400000) + 14);
const days = getDaysInRange(weekStart, totalDays);

const weeks = [];
let currentWeek = [];
days.forEach((d, i) => {
if (i > 0 && d.getDay() === 0) { weeks.push(currentWeek); currentWeek = []; }
currentWeek.push(d);
});
if (currentWeek.length) weeks.push(currentWeek);

return (
<div>
<div style={{ display: “flex”, gap: 2, marginBottom: 4, paddingLeft: 28 }}>
{dayNames.map((n, i) => (
<div key={i} style={{ width: 28, textAlign: “center”, fontSize: 9, color: COLORS.textMuted,
fontWeight: 600, fontFamily: “‘JetBrains Mono’, monospace” }}>
{i % 2 === 0 ? n[0] : “”}
</div>
))}
</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: 2 }}>
{weeks.map((week, wi) => (
<div key={wi} style={{ display: “flex”, gap: 2, alignItems: “center” }}>
<div style={{ width: 24, fontSize: 9, color: COLORS.textMuted, textAlign: “right”,
fontFamily: “‘JetBrains Mono’, monospace”, fontWeight: 600 }}>
{week[0].getDate() <= 7 ? monthNames[week[0].getMonth()].toUpperCase().slice(0,3) : “”}
</div>
{Array.from({ length: 7 }, (_, di) => {
const d = week.find(dd => dd.getDay() === di);
if (!d) return <div key={di} style={{ width: 28, height: 28 }} />;
const key = getDateKey(d);
const isToday = key === getDateKey(today);
const isFuture = d > today;
const isAF = isAFDay(d);
const completed = data.afDays[key]?.completed;
const missed = isAF && !isFuture && d >= startDate && !completed && d < today;

```
          let bg = COLORS.future;
          let border = "transparent";
          if (isFuture && isAF) { bg = "rgba(34,197,94,0.06)"; border = "rgba(34,197,94,0.2)"; }
          else if (completed) { bg = COLORS.streak; }
          else if (missed) { bg = "rgba(239,68,68,0.3)"; }
          else if (!isAF && !isFuture && d >= startDate) { bg = COLORS.card; }
          if (isToday) border = COLORS.accent;

          return (
            <div key={di} style={{
              width: 28, height: 28, borderRadius: 6, background: bg,
              border: `2px solid ${border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: completed ? COLORS.bg : COLORS.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: completed ? `0 0 8px ${COLORS.accentGlow}` : "none",
              transition: "all 0.2s",
            }}>
              {completed ? "✓" : isToday ? "◆" : ""}
            </div>
          );
        })}
      </div>
    ))}
  </div>
  <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "center" }}>
    {[
      { color: COLORS.streak, label: "Completed" },
      { color: "rgba(239,68,68,0.3)", label: "Missed" },
      { color: "rgba(34,197,94,0.06)", label: "Upcoming AF" },
    ].map(l => (
      <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
        <span style={{ fontSize: 9, color: COLORS.textDim }}>{l.label}</span>
      </div>
    ))}
  </div>
</div>
```

);
}

function LogAFDay({ data, onSave }) {
const today = getDateKey(getToday());
const existing = data.afDays[today];
const [completed, setCompleted] = useState(existing?.completed || false);

if (!isAFDay(getToday())) {
return (
<div style={{ textAlign: “center”, padding: 30, color: COLORS.textDim }}>
<div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
<div style={{ fontSize: 14, fontWeight: 600 }}>Today is not an AF day</div>
<div style={{ fontSize: 12, marginTop: 4 }}>
Next AF day: {dayNames[AF_DAYS.find(d => d > getToday().getDay()) || AF_DAYS[0]]}
</div>
</div>
);
}

return (
<div>
<div style={{ textAlign: “center”, marginBottom: 16 }}>
<div style={{ fontSize: 13, color: COLORS.textDim, fontWeight: 600, marginBottom: 8,
fontFamily: “‘JetBrains Mono’, monospace” }}>TODAY — {dayNames[getToday().getDay()].toUpperCase()}</div>
<div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>Did you hold the line?</div>
</div>
<div style={{ display: “flex”, gap: 10, justifyContent: “center” }}>
{[true, false].map(val => (
<button key={String(val)} onClick={() => {
setCompleted(val);
const newData = { …data, afDays: { …data.afDays, [today]: { …data.afDays[today], completed: val } } };
onSave(newData);
}} style={{
padding: “14px 32px”, border: `2px solid ${completed === val ? (val ? COLORS.accent : COLORS.danger) : COLORS.border}`,
borderRadius: 12, cursor: “pointer”, fontSize: 15, fontWeight: 800,
background: completed === val ? (val ? COLORS.accentGlow : “rgba(239,68,68,0.1)”) : COLORS.card,
color: completed === val ? (val ? COLORS.accent : COLORS.danger) : COLORS.textDim,
transition: “all 0.2s”,
fontFamily: “‘Space Grotesk’, sans-serif”,
}}>
{val ? “✓ YES” : “✗ NO”}
</button>
))}
</div>
</div>
);
}

function WorkoutLogger({ data, onSave }) {
const today = getDateKey(getToday());
const [type, setType] = useState(””);
const [duration, setDuration] = useState(””);
const [notes, setNotes] = useState(””);
const todayWorkout = data.workouts[today];

function logWorkout() {
if (!type) return;
const newData = {
…data,
workouts: { …data.workouts, [today]: { type, duration: Number(duration) || 0, notes, date: today } }
};
onSave(newData);
setType(””); setDuration(””); setNotes(””);
}

const last7 = getDaysInRange(new Date(getToday().getTime() - 6 * 86400000), 7);
const chartData = last7.map(d => {
const k = getDateKey(d);
const w = data.workouts[k];
return { day: dayNames[d.getDay()], minutes: w?.duration || 0 };
});

return (
<div>
{todayWorkout ? (
<div style={{ background: COLORS.accentGlow, border: `1px solid ${COLORS.accentDim}`,
borderRadius: 12, padding: 16, marginBottom: 16, textAlign: “center” }}>
<div style={{ fontSize: 11, color: COLORS.accentDim, fontWeight: 700, letterSpacing: “0.1em”,
textTransform: “uppercase”, marginBottom: 4, fontFamily: “‘JetBrains Mono’, monospace” }}>
TODAY’S WORKOUT LOGGED
</div>
<div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent }}>
{todayWorkout.type} — {todayWorkout.duration} min
</div>
{todayWorkout.notes && <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>{todayWorkout.notes}</div>}
</div>
) : (
<div style={{ marginBottom: 16 }}>
<div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>Log today’s workout</div>
<div style={{ display: “flex”, flexWrap: “wrap”, gap: 6, marginBottom: 10 }}>
{WORKOUT_TYPES.map(t => (
<button key={t} onClick={() => setType(t)} style={{
padding: “8px 14px”, border: `1.5px solid ${type === t ? COLORS.accent : COLORS.border}`,
borderRadius: 10, cursor: “pointer”, fontSize: 12, fontWeight: 600,
background: type === t ? COLORS.accentGlow : COLORS.card,
color: type === t ? COLORS.accent : COLORS.textDim,
transition: “all 0.15s”, fontFamily: “‘JetBrains Mono’, monospace”,
}}>{t}</button>
))}
</div>
<div style={{ display: “flex”, gap: 8, marginBottom: 10 }}>
<input value={duration} onChange={e => setDuration(e.target.value)} placeholder=“Minutes”
type=“number” style={{
flex: 1, padding: “10px 12px”, background: COLORS.card, border: `1px solid ${COLORS.border}`,
borderRadius: 10, color: COLORS.text, fontSize: 13, outline: “none”,
fontFamily: “‘JetBrains Mono’, monospace”,
}} />
<input value={notes} onChange={e => setNotes(e.target.value)} placeholder=“Notes (optional)”
style={{
flex: 2, padding: “10px 12px”, background: COLORS.card, border: `1px solid ${COLORS.border}`,
borderRadius: 10, color: COLORS.text, fontSize: 13, outline: “none”,
fontFamily: “‘JetBrains Mono’, monospace”,
}} />
</div>
<button onClick={logWorkout} disabled={!type} style={{
width: “100%”, padding: “12px”, border: “none”, borderRadius: 12, cursor: type ? “pointer” : “default”,
fontSize: 13, fontWeight: 800, letterSpacing: “0.05em”,
background: type ? COLORS.accent : COLORS.border,
color: type ? COLORS.bg : COLORS.textMuted,
fontFamily: “‘Space Grotesk’, sans-serif”,
transition: “all 0.2s”,
}}>LOG WORKOUT</button>
</div>
)}

```
  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: "0.1em",
    textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
    LAST 7 DAYS
  </div>
  <div style={{ height: 140 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} barSize={20}>
        <XAxis dataKey="day" tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: 8, fontSize: 11, color: COLORS.text }}
          formatter={v => [`${v} min`, "Duration"]} cursor={false} />
        <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={chartData[i].minutes > 0 ? COLORS.accent : COLORS.border} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
```

);
}

function RationalizationLogger({ data, onSave }) {
const today = getDateKey(getToday());

function logRat(id) {
const existing = data.rationalizations[today] || [];
const updated = […existing, { id, time: new Date().toISOString() }];
const newData = { …data, rationalizations: { …data.rationalizations, [today]: updated } };
onSave(newData);
}

// Aggregate counts
const allRats = Object.values(data.rationalizations).flat();
const counts = {};
RATIONALIZATIONS.forEach(r => { counts[r.id] = 0; });
allRats.forEach(r => { counts[r.id] = (counts[r.id] || 0) + 1; });
const total = allRats.length;

const pieData = RATIONALIZATIONS.map(r => ({ name: r.short, value: counts[r.id] }))
.filter(d => d.value > 0);
const pieColors = [”#22c55e”, “#f59e0b”, “#ef4444”, “#3b82f6”, “#a855f7”];

const todayRats = data.rationalizations[today] || [];

return (
<div>
<div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
What did the rationalizer try today?
</div>
<div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 12 }}>
Tap every lie your brain threw at you. Track the enemy.
</div>
<div style={{ display: “flex”, flexDirection: “column”, gap: 6, marginBottom: 16 }}>
{RATIONALIZATIONS.map(r => {
const todayCount = todayRats.filter(tr => tr.id === r.id).length;
return (
<button key={r.id} onClick={() => logRat(r.id)} style={{
display: “flex”, alignItems: “center”, gap: 10, padding: “10px 14px”,
background: todayCount > 0 ? “rgba(245,158,11,0.08)” : COLORS.card,
border: `1px solid ${todayCount > 0 ? "rgba(245,158,11,0.3)" : COLORS.border}`,
borderRadius: 12, cursor: “pointer”, textAlign: “left”,
transition: “all 0.15s”,
}}>
<span style={{ fontSize: 18 }}>{r.emoji}</span>
<span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: COLORS.text }}>{r.label}</span>
{todayCount > 0 && (
<span style={{
background: COLORS.warning, color: COLORS.bg, fontSize: 10, fontWeight: 800,
padding: “2px 8px”, borderRadius: 10, fontFamily: “‘JetBrains Mono’, monospace”,
}}>{todayCount}x</span>
)}
<span style={{ fontSize: 10, color: COLORS.textMuted, fontFamily: “‘JetBrains Mono’, monospace” }}>
{counts[r.id]} total
</span>
</button>
);
})}
</div>

```
  {total > 0 && (
    <>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: "0.1em",
        textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
        ALL-TIME BREAKDOWN
      </div>
      <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
              innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
              {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, fontSize: 11, color: COLORS.text }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {pieData.map((d, i) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: pieColors[i % pieColors.length] }} />
            <span style={{ fontSize: 10, color: COLORS.textDim }}>{d.name} ({d.value})</span>
          </div>
        ))}
      </div>
    </>
  )}
</div>
```

);
}

function WeeklyScore({ data }) {
const today = getToday();
const weekStart = getWeekStart(today);
const weekDays = getDaysInRange(weekStart, 7).filter(d => d <= today);

let afPlanned = 0, afCompleted = 0, workoutDays = 0, totalRats = 0;

weekDays.forEach(d => {
const k = getDateKey(d);
if (isAFDay(d)) {
afPlanned++;
if (data.afDays[k]?.completed) afCompleted++;
}
if (data.workouts[k]) workoutDays++;
totalRats += (data.rationalizations[k] || []).length;
});

// Calculate streak
let streak = 0;
const allKeys = Object.keys(data.afDays).filter(k => data.afDays[k]?.completed).sort().reverse();
if (allKeys.length > 0) {
// Count consecutive AF days completed going backwards
const sortedDates = Object.keys(data.afDays)
.filter(k => {
const d = new Date(k + “T00:00:00”);
return isAFDay(d);
})
.sort()
.reverse();

```
for (const k of sortedDates) {
  if (data.afDays[k]?.completed) streak++;
  else break;
}
```

}

// Total AF days ever
const totalAF = Object.values(data.afDays).filter(d => d.completed).length;
const totalWorkouts = Object.keys(data.workouts).length;

// Weekly trend data (last 4 weeks)
const trendData = [];
for (let w = 3; w >= 0; w–) {
const ws = new Date(weekStart);
ws.setDate(ws.getDate() - w * 7);
let score = 0;
let planned = 0;
for (let i = 0; i < 7; i++) {
const d = new Date(ws);
d.setDate(d.getDate() + i);
if (d > today) break;
const k = getDateKey(d);
if (isAFDay(d)) {
planned++;
if (data.afDays[k]?.completed) score++;
}
}
trendData.push({
week: w === 0 ? “This wk” : w === 1 ? “Last wk” : `${w}wk ago`,
score: planned > 0 ? Math.round((score / planned) * 100) : 0,
});
}

const weekScore = afPlanned > 0 ? Math.round((afCompleted / afPlanned) * 100) : 0;

return (
<div>
{/* Big Score */}
<div style={{
textAlign: “center”, padding: “24px 0”, marginBottom: 16,
background: `radial-gradient(circle at center, ${COLORS.accentGlow} 0%, transparent 70%)`,
borderRadius: 20,
}}>
<div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: “0.15em”,
textTransform: “uppercase”, marginBottom: 8, fontFamily: “‘JetBrains Mono’, monospace” }}>
THIS WEEK’S SCORE
</div>
<div style={{
fontSize: 72, fontWeight: 900, lineHeight: 1,
color: weekScore >= 80 ? COLORS.accent : weekScore >= 50 ? COLORS.warning : COLORS.danger,
fontFamily: “‘Space Grotesk’, sans-serif”,
textShadow: weekScore >= 80 ? `0 0 40px ${COLORS.accentGlow}` : “none”,
}}>
{weekScore}<span style={{ fontSize: 28 }}>%</span>
</div>
<div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 6 }}>
{afCompleted}/{afPlanned} AF days completed
</div>
</div>

```
  {/* Stats Grid */}
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
    <StatCard label="Current Streak" value={streak} sub="consecutive AF days" color={COLORS.accent} />
    <StatCard label="Total AF Days" value={totalAF} sub="since you started" color={COLORS.accent} />
    <StatCard label="Workouts" value={totalWorkouts} sub="total sessions" color={COLORS.accent} />
    <StatCard label="Rationalizations" value={totalRats} sub="caught this week" color={COLORS.warning} />
  </div>

  {/* Trend Chart */}
  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: "0.1em",
    textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
    4-WEEK TREND
  </div>
  <div style={{ height: 130 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trendData}>
        <XAxis dataKey="week" tick={{ fill: COLORS.textMuted, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} hide />
        <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`,
          borderRadius: 8, fontSize: 11, color: COLORS.text }}
          formatter={v => [`${v}%`, "Score"]} cursor={false} />
        <Line type="monotone" dataKey="score" stroke={COLORS.accent} strokeWidth={3}
          dot={{ fill: COLORS.accent, r: 5, strokeWidth: 0 }}
          activeDot={{ r: 7, fill: COLORS.accent, stroke: COLORS.bg, strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* Motivational Quote */}
  <div style={{
    marginTop: 16, padding: "16px 20px", background: COLORS.card,
    borderRadius: 16, border: `1px solid ${COLORS.border}`,
    borderLeft: `3px solid ${COLORS.accent}`,
  }}>
    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontStyle: "italic", lineHeight: 1.5 }}>
      {streak >= 3
        ? `${streak} in a row. You're not just changing behavior — you're changing IDENTITY. This is who you are now.`
        : totalAF > 0
          ? "Every X on that calendar is proof that the old pattern doesn't own you. Keep building."
          : "The journey starts with Day 1. Log your first AF day and watch the momentum build."
      }
    </div>
    <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 6, fontWeight: 600 }}>
      — Your Coach
    </div>
  </div>
</div>
```

);
}

function ResetButton({ onReset }) {
const [confirm, setConfirm] = useState(false);
if (confirm) {
return (
<div style={{ display: “flex”, gap: 8, justifyContent: “center”, marginTop: 12 }}>
<span style={{ fontSize: 11, color: COLORS.danger, alignSelf: “center” }}>Reset all data?</span>
<button onClick={() => { onReset(); setConfirm(false); }} style={{
padding: “6px 16px”, border: `1px solid ${COLORS.danger}`, borderRadius: 8,
background: “rgba(239,68,68,0.1)”, color: COLORS.danger, fontSize: 11,
fontWeight: 700, cursor: “pointer”,
}}>Yes, reset</button>
<button onClick={() => setConfirm(false)} style={{
padding: “6px 16px”, border: `1px solid ${COLORS.border}`, borderRadius: 8,
background: COLORS.card, color: COLORS.textDim, fontSize: 11,
fontWeight: 700, cursor: “pointer”,
}}>Cancel</button>
</div>
);
}
return (
<button onClick={() => setConfirm(true)} style={{
display: “block”, margin: “12px auto 0”, padding: “6px 16px”,
border: `1px solid ${COLORS.border}`, borderRadius: 8,
background: “transparent”, color: COLORS.textMuted, fontSize: 10,
fontWeight: 600, cursor: “pointer”, fontFamily: “‘JetBrains Mono’, monospace”,
}}>Reset Data</button>
);
}

// – Main App –

export default function HealthierMe() {
const [data, setData] = useState(null);
const [tab, setTab] = useState(“score”);
const [loading, setLoading] = useState(true);

useEffect(() => {
StorageManager.load().then(saved => {
setData(saved || defaultData());
setLoading(false);
});
}, []);

const saveData = useCallback(async (newData) => {
setData(newData);
await StorageManager.save(newData);
}, []);

const resetData = useCallback(async () => {
const fresh = defaultData();
setData(fresh);
await StorageManager.save(fresh);
}, []);

if (loading || !data) {
return (
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “center”,
height: “100vh”, background: COLORS.bg, color: COLORS.accent,
fontFamily: “‘Space Grotesk’, sans-serif”, fontSize: 18, fontWeight: 700 }}>
<GlowDot size={12} /> <span style={{ marginLeft: 12 }}>Loading…</span>
</div>
);
}

const tabs = [
{ id: “score”, label: “Score”, emoji: “⚡” },
{ id: “calendar”, label: “AF Days”, emoji: “🔥” },
{ id: “workout”, label: “Gym”, emoji: “💪” },
{ id: “rats”, label: “Lies”, emoji: “🧠” },
];

return (
<div style={{
minHeight: “100vh”, background: COLORS.bg, color: COLORS.text,
fontFamily: “‘Space Grotesk’, -apple-system, sans-serif”,
maxWidth: 480, margin: “0 auto”, padding: “16px 16px 100px”,
}}>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

```
  {/* Header */}
  <div style={{ textAlign: "center", marginBottom: 20, paddingTop: 8 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <GlowDot size={10} />
      <span style={{
        fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em",
        background: `linear-gradient(135deg, ${COLORS.accent}, #86efac)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        HealthierMe
      </span>
      <GlowDot size={10} />
    </div>
    <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 600, marginTop: 4,
      letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
      Where Focus Goes, Energy Flows
    </div>
  </div>

  <TabBar tabs={tabs} active={tab} onChange={setTab} />

  {/* Content */}
  <div style={{
    background: COLORS.card, borderRadius: 20, padding: 16,
    border: `1px solid ${COLORS.border}`,
    boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
  }}>
    {tab === "score" && <WeeklyScore data={data} />}
    {tab === "calendar" && (
      <>
        <div style={{ marginBottom: 16 }}>
          <LogAFDay data={data} onSave={saveData} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: "0.1em",
          textTransform: "uppercase", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          YOUR STREAK MAP
        </div>
        <CalendarHeatmap data={data} />
      </>
    )}
    {tab === "workout" && <WorkoutLogger data={data} onSave={saveData} />}
    {tab === "rats" && <RationalizationLogger data={data} onSave={saveData} />}
  </div>

  <ResetButton onReset={resetData} />
</div>
```

);
}
