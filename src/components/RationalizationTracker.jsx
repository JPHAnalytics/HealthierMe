import { COLORS, RATIONALIZATIONS, PIE_COLORS } from "../utils/constants";
import { getDateKey, getToday } from "../utils/dates";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function RationalizationTracker({ data, onSave }) {
  const today = getDateKey(getToday());

  function logRat(id) {
    const existing = data.rationalizations[today] || [];
    const updated = [...existing, { id, time: new Date().toISOString() }];
    const newData = {
      ...data,
      rationalizations: { ...data.rationalizations, [today]: updated },
    };
    onSave(newData);
  }

  const allRats = Object.values(data.rationalizations).flat();
  const counts = {};
  RATIONALIZATIONS.forEach((r) => {
    counts[r.id] = 0;
  });
  allRats.forEach((r) => {
    counts[r.id] = (counts[r.id] || 0) + 1;
  });
  const total = allRats.length;

  const pieData = RATIONALIZATIONS.map((r) => ({
    name: r.short,
    value: counts[r.id],
  })).filter((d) => d.value > 0);

  const todayRats = data.rationalizations[today] || [];

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
        What did the rationalizer try today?
      </div>
      <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 12 }}>
        Tap every lie your brain threw at you. Track the enemy.
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 16,
        }}
      >
        {RATIONALIZATIONS.map((r) => {
          const todayCount = todayRats.filter((tr) => tr.id === r.id).length;
          return (
            <button
              key={r.id}
              onClick={() => logRat(r.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background:
                  todayCount > 0 ? "rgba(245,158,11,0.08)" : COLORS.card,
                border: `1px solid ${todayCount > 0 ? "rgba(245,158,11,0.3)" : COLORS.border}`,
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 18 }}>{r.emoji}</span>
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.text,
                }}
              >
                {r.label}
              </span>
              {todayCount > 0 && (
                <span
                  style={{
                    background: COLORS.warning,
                    color: COLORS.bg,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {todayCount}x
                </span>
              )}
              <span
                style={{
                  fontSize: 10,
                  color: COLORS.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {counts[r.id]} total
              </span>
            </button>
          );
        })}
      </div>

      {total > 0 && (
        <>
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
            ALL-TIME BREAKDOWN
          </div>
          <div
            style={{
              height: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    fontSize: 11,
                    color: COLORS.text,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {pieData.map((d, i) => (
              <div
                key={d.name}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: PIE_COLORS[i % PIE_COLORS.length],
                  }}
                />
                <span style={{ fontSize: 10, color: COLORS.textDim }}>
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
