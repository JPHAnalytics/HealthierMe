import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { COLORS, WORKOUT_TYPES, DAY_NAMES } from "../utils/constants";
import { getDateKey, getToday, getDaysInRange } from "../utils/dates";

export default function WorkoutLogger({ data, onSave }) {
  const today = getDateKey(getToday());
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const todayWorkout = data.workouts[today];

  function logWorkout() {
    if (!type) return;
    const newData = {
      ...data,
      workouts: {
        ...data.workouts,
        [today]: { type, duration: Number(duration) || 0, notes, date: today },
      },
    };
    onSave(newData);
    setType("");
    setDuration("");
    setNotes("");
  }

  const last7 = getDaysInRange(
    new Date(getToday().getTime() - 6 * 86400000),
    7
  );
  const chartData = last7.map((d) => {
    const k = getDateKey(d);
    const w = data.workouts[k];
    return { day: DAY_NAMES[d.getDay()], minutes: w?.duration || 0 };
  });

  return (
    <div>
      {todayWorkout ? (
        <div
          style={{
            background: COLORS.accentGlow,
            border: `1px solid ${COLORS.accentDim}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: COLORS.accentDim,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            TODAY&apos;S WORKOUT LOGGED
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent }}>
            {todayWorkout.type} — {todayWorkout.duration} min
          </div>
          {todayWorkout.notes && (
            <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>
              {todayWorkout.notes}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 10,
            }}
          >
            Log today&apos;s workout
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {WORKOUT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  padding: "8px 14px",
                  border: `1.5px solid ${type === t ? COLORS.accent : COLORS.border}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: type === t ? COLORS.accentGlow : COLORS.card,
                  color: type === t ? COLORS.accent : COLORS.textDim,
                  transition: "all 0.15s",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Minutes"
              type="number"
              style={{
                flex: 1,
                padding: "10px 12px",
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                color: COLORS.text,
                fontSize: 13,
                outline: "none",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              style={{
                flex: 2,
                padding: "10px 12px",
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                color: COLORS.text,
                fontSize: 13,
                outline: "none",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>
          <button
            onClick={logWorkout}
            disabled={!type}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: 12,
              cursor: type ? "pointer" : "default",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.05em",
              background: type ? COLORS.accent : COLORS.border,
              color: type ? COLORS.bg : COLORS.textMuted,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.2s",
            }}
          >
            LOG WORKOUT
          </button>
        </div>
      )}

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
        LAST 7 DAYS
      </div>
      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={20}>
            <XAxis
              dataKey="day"
              tick={{
                fill: COLORS.textMuted,
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                fontSize: 11,
                color: COLORS.text,
              }}
              formatter={(v) => [`${v} min`, "Duration"]}
              cursor={false}
            />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.minutes > 0 ? COLORS.accent : COLORS.border}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
