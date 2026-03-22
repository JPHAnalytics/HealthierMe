import { useState } from "react";
import { COLORS, AF_DAYS, DAY_NAMES, MONTH_NAMES } from "../utils/constants";
import { getDateKey, isAFDay, getToday, getDaysInRange, getWeekStart } from "../utils/dates";

function LogAFDay({ data, onSave }) {
  const today = getDateKey(getToday());
  const existing = data.afDays[today];
  const [completed, setCompleted] = useState(existing?.completed ?? null);

  if (!isAFDay(getToday())) {
    const todayDay = getToday().getDay();
    const nextAF = AF_DAYS.slice().sort((a, b) => a - b).find((d) => d > todayDay) || AF_DAYS[0];
    return (
      <div style={{ textAlign: "center", padding: 30, color: COLORS.textDim }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Today is not an AF day</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>
          Next AF day: {DAY_NAMES[nextAF]}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            fontSize: 13,
            color: COLORS.textDim,
            fontWeight: 600,
            marginBottom: 8,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          TODAY — {DAY_NAMES[getToday().getDay()].toUpperCase()}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>
          Did you hold the line?
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {[true, false].map((val) => (
          <button
            key={String(val)}
            onClick={() => {
              setCompleted(val);
              const newData = {
                ...data,
                afDays: {
                  ...data.afDays,
                  [today]: { ...data.afDays[today], completed: val },
                },
              };
              onSave(newData);
            }}
            style={{
              padding: "14px 32px",
              border: `2px solid ${completed === val ? (val ? COLORS.accent : COLORS.danger) : COLORS.border}`,
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 800,
              background:
                completed === val
                  ? val
                    ? COLORS.accentGlow
                    : "rgba(239,68,68,0.1)"
                  : COLORS.card,
              color:
                completed === val
                  ? val
                    ? COLORS.accent
                    : COLORS.danger
                  : COLORS.textDim,
              transition: "all 0.2s",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {val ? "\u2713 YES" : "\u2717 NO"}
          </button>
        ))}
      </div>
    </div>
  );
}

function HeatmapGrid({ data }) {
  const today = getToday();
  const startDate = data.startDate ? new Date(data.startDate + "T00:00:00") : today;
  const weekStart = getWeekStart(startDate);
  const totalDays = Math.max(56, Math.ceil((today - weekStart) / 86400000) + 14);
  const days = getDaysInRange(weekStart, totalDays);

  const weeks = [];
  let currentWeek = [];
  days.forEach((d, i) => {
    if (i > 0 && d.getDay() === 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(d);
  });
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div>
      <div style={{ display: "flex", gap: 2, marginBottom: 4, paddingLeft: 28 }}>
        {DAY_NAMES.map((n, i) => (
          <div
            key={i}
            style={{
              width: 28,
              textAlign: "center",
              fontSize: 9,
              color: COLORS.textMuted,
              fontWeight: 600,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {i % 2 === 0 ? n[0] : ""}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", gap: 2, alignItems: "center" }}>
            <div
              style={{
                width: 24,
                fontSize: 9,
                color: COLORS.textMuted,
                textAlign: "right",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              {week[0].getDate() <= 7
                ? MONTH_NAMES[week[0].getMonth()].toUpperCase().slice(0, 3)
                : ""}
            </div>
            {Array.from({ length: 7 }, (_, di) => {
              const d = week.find((dd) => dd.getDay() === di);
              if (!d) return <div key={di} style={{ width: 28, height: 28 }} />;
              const key = getDateKey(d);
              const isToday = key === getDateKey(today);
              const isFuture = d > today;
              const isAF = isAFDay(d);
              const completed = data.afDays[key]?.completed;
              const missed = isAF && !isFuture && d >= startDate && !completed && d < today;

              let bg = COLORS.future;
              let border = "transparent";
              if (isFuture && isAF) {
                bg = "rgba(34,197,94,0.06)";
                border = "rgba(34,197,94,0.2)";
              } else if (completed) {
                bg = COLORS.streak;
              } else if (missed) {
                bg = "rgba(239,68,68,0.3)";
              } else if (!isAF && !isFuture && d >= startDate) {
                bg = COLORS.card;
              }
              if (isToday) border = COLORS.accent;

              return (
                <div
                  key={di}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: bg,
                    border: `2px solid ${border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: completed ? COLORS.bg : COLORS.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                    boxShadow: completed ? `0 0 8px ${COLORS.accentGlow}` : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {completed ? "\u2713" : isToday ? "\u25C6" : ""}
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
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
            <span style={{ fontSize: 9, color: COLORS.textDim }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CalendarHeatmap({ data, onSave }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <LogAFDay data={data} onSave={onSave} />
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.textDim,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 10,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        YOUR STREAK MAP
      </div>
      <HeatmapGrid data={data} />
    </>
  );
}
