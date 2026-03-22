import { useState } from "react";
import { COLORS, TABS } from "./utils/constants";
import { getDateKey, getToday } from "./utils/dates";
import { useStorage } from "./hooks/useStorage";
import TabBar from "./components/TabBar";
import WeeklyScore from "./components/WeeklyScore";
import CalendarHeatmap from "./components/CalendarHeatmap";
import WorkoutLogger from "./components/WorkoutLogger";
import RationalizationTracker from "./components/RationalizationTracker";
import GlowDot from "./components/ui/GlowDot";

function defaultData() {
  return {
    version: 1,
    startDate: getDateKey(getToday()),
    afDays: {},
    workouts: {},
    rationalizations: {},
  };
}

function ResetButton({ onReset }) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
        <span style={{ fontSize: 11, color: COLORS.danger, alignSelf: "center" }}>
          Reset all data?
        </span>
        <button
          onClick={() => {
            onReset();
            setConfirm(false);
          }}
          style={{
            padding: "6px 16px",
            border: `1px solid ${COLORS.danger}`,
            borderRadius: 8,
            background: "rgba(239,68,68,0.1)",
            color: COLORS.danger,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Yes, reset
        </button>
        <button
          onClick={() => setConfirm(false)}
          style={{
            padding: "6px 16px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            background: COLORS.card,
            color: COLORS.textDim,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      style={{
        display: "block",
        margin: "12px auto 0",
        padding: "6px 16px",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        background: "transparent",
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      Reset Data
    </button>
  );
}

export default function App() {
  const { data, loading, saveData, resetData } = useStorage(defaultData);
  const [tab, setTab] = useState("score");

  if (loading || !data) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: COLORS.bg,
          color: COLORS.accent,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        <GlowDot size={12} />
        <span style={{ marginLeft: 12 }}>Loading...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Space Grotesk', -apple-system, sans-serif",
        maxWidth: 480,
        margin: "0 auto",
        padding: "16px 16px 100px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20, paddingTop: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <GlowDot size={10} />
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              background: `linear-gradient(135deg, ${COLORS.accent}, #86efac)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            HealthierMe
          </span>
          <GlowDot size={10} />
        </div>
        <div
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            fontWeight: 600,
            marginTop: 4,
            letterSpacing: "0.15em",
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: "uppercase",
          }}
        >
          Where Focus Goes, Energy Flows
        </div>
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* Content */}
      <div
        style={{
          background: COLORS.card,
          borderRadius: 20,
          padding: 16,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {tab === "score" && <WeeklyScore data={data} />}
        {tab === "calendar" && (
          <CalendarHeatmap data={data} onSave={saveData} />
        )}
        {tab === "workout" && (
          <WorkoutLogger data={data} onSave={saveData} />
        )}
        {tab === "rats" && (
          <RationalizationTracker data={data} onSave={saveData} />
        )}
      </div>

      <ResetButton onReset={resetData} />
    </div>
  );
}
