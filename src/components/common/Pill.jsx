import { C } from "../../theme/pbxTokens";

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = ({ text, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "1px 8px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.01em",
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 64,
    }}
  >
    {text}
  </span>
);

// ── Status style helper ───────────────────────────────────────────────────────
const statusStyle = (s) => {
  const v = String(s || "").toLowerCase();

  if (v === "online") {
    return { color: "#16a34a" };
  }

  if (v === "offline") {
    return { color: "#dc2626" };
  }

  if (v === "expired") {
    return { color: "#f59e0b" };
  }

  if (v === "pending") {
    return { color: C.accent };
  }

  return { color: "#475569" };
};

export { Pill, statusStyle };
