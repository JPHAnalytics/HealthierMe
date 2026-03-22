import { COLORS } from "../utils/constants";

export default function TabBar({ tabs, active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "4px",
        background: COLORS.card,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 20,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            padding: "10px 6px",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
            background: active === t.id ? COLORS.accent : "transparent",
            color: active === t.id ? COLORS.bg : COLORS.textDim,
            transition: "all 0.2s ease",
          }}
        >
          {t.emoji} {t.label}
        </button>
      ))}
    </div>
  );
}
