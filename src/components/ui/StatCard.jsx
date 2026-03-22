import { COLORS } from "../../utils/constants";

export default function StatCard({ label, value, sub, color = COLORS.accent, big }) {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 16,
        padding: big ? "20px 16px" : "14px 12px",
        border: `1px solid ${COLORS.border}`,
        flex: 1,
        minWidth: 0,
        boxShadow: `inset 0 1px 0 ${COLORS.border}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: COLORS.textDim,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 6,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: big ? 36 : 28,
          fontWeight: 800,
          color,
          lineHeight: 1,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
