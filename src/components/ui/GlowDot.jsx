import { COLORS } from "../../utils/constants";

export default function GlowDot({ color = COLORS.accent, size = 8 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size}px ${color}`,
        flexShrink: 0,
      }}
    />
  );
}
