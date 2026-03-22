import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "../utils/constants";
import { getDateKey, isAFDay, getToday, getDaysInRange, getWeekStart } from "../utils/dates";
import StatCard from "./ui/StatCard";

export default function WeeklyScore({ data }) {
  const today = getToday();
  const weekStart = getWeekStart(today);
  const weekDays = getDaysInRange(weekStart, 7).filter((d) => d <= today);

  let afPlanned = 0;
  let afCompleted = 0;
  let workoutDays = 0;
  let totalRats = 0;

  weekDays.forEach((d) => {
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
  const sortedDates = Object.keys(data.afDays)
    .filter((k) => {
      const d = new Date(k + "T00:00:00");
      return isAFDay(d);
    })
    .sort()
    .reverse();

  for (const k of sortedDates) {
    if (data.afDays[k]?.completed) streak++;
    else break;
  }

  const totalAF = Object.values(data.afDays).filter((d) => d.completed).length;
  const totalWorkouts = Object.keys(data.workouts).length;

  // Weekly trend data (last 4 weeks)
  const trendData = [];
  for (let w = 3; w >= 0; w--) {
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
      week: w === 0 ? "This wk" : w === 1 ? "Last wk" : `${w}wk ago`,
      score: planned > 0 ? Math.round((score / planned) * 100) : 0,
    });
  }

  const weekScore =
    afPlanned > 0 ? Math.round((afCompleted / afPlanned) * 100) : 0;

  return (
    <div>
      {/* Big Score */}
      <div
        style={{
          textAlign: "center",
          padding: "24px 0",
          marginBottom: 16,
          background: `radial-gradient(circle at center, ${COLORS.accentGlow} 0%, transparent 70%)`,
          borderRadius: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.textDim,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          THIS WEEK&apos;S SCORE
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            color:
              weekScore >= 80
                ? COLORS.accent
                : weekScore >= 50
                  ? COLORS.warning
                  : COLORS.danger,
            fontFamily: "'Space Grotesk', sans-serif",
            textShadow:
              weekScore >= 80 ? `0 0 40px ${COLORS.accentGlow}` : "none",
          }}
        >
          {weekScore}
          <span style={{ fontSize: 28 }}>%</span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 6 }}>
          {afCompleted}/{afPlanned} AF days completed
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <StatCard
          label="Current Streak"
          value={streak}
          sub="consecutive AF days"
          color={COLORS.accent}
        />
        <StatCard
          label="Total AF Days"
          value={totalAF}
          sub="since you started"
          color={COLORS.accent}
        />
        <StatCard
          label="Workouts"
          value={totalWorkouts}
          sub="total sessions"
          color={COLORS.accent}
        />
        <StatCard
          label="Rationalizations"
          value={totalRats}
          sub="caught this week"
          color={COLORS.warning}
        />
      </div>

      {/* Trend Chart */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.textDim,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 8,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        4-WEEK TREND
      </div>
      <div style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <XAxis
              dataKey="week"
              tick={{
                fill: COLORS.textMuted,
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 11,
                color: COLORS.text,
              }}
              formatter={(v) => [`${v}%`, "Score"]}
              cursor={false}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={COLORS.accent}
              strokeWidth={3}
              dot={{ fill: COLORS.accent, r: 5, strokeWidth: 0 }}
              activeDot={{
                r: 7,
                fill: COLORS.accent,
                stroke: COLORS.bg,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Motivational Quote */}
      <div
        style={{
          marginTop: 16,
          padding: "16px 20px",
          background: COLORS.card,
          borderRadius: 16,
          border: `1px solid ${COLORS.border}`,
          borderLeft: `3px solid ${COLORS.accent}`,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.text,
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          {streak >= 3
            ? `${streak} in a row. You're not just changing behavior \u2014 you're changing IDENTITY. This is who you are now.`
            : totalAF > 0
              ? "Every X on that calendar is proof that the old pattern doesn't own you. Keep building."
              : "The journey starts with Day 1. Log your first AF day and watch the momentum build."}
        </div>
        <div
          style={{
            fontSize: 10,
            color: COLORS.textDim,
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          — Your Coach
        </div>
      </div>
    </div>
  );
}
