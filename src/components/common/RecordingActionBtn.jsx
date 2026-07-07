import Tooltip from "@mui/material/Tooltip";

const recordingIconBtnBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 26,
  height: 26,
  borderRadius: 6,
  fontSize: 12,
  lineHeight: 1,
  cursor: "pointer",
  padding: 0,
  transition:
    "background 0.15s ease, border-color 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
  boxSizing: "border-box",
};

const RECORDING_BTN_THEMES = {
  play: {
    color: "#3E5475",
    baseBg: "#eff6ff",
    baseBorder: "#bfdbfe",
    hoverBg: "#dbeafe",
    hoverBorder: "#93c5fd",
    activeBg: "#bfdbfe",
    activeShadow: "inset 0 1px 3px rgba(59, 111, 232, 0.22)",
  },
  delete: {
    color: "#dc2626",
    baseBg: "#fef2f2",
    baseBorder: "#fecaca",
    hoverBg: "#fee2e2",
    hoverBorder: "#fca5a5",
    activeBg: "#fecaca",
    activeShadow: "inset 0 1px 3px rgba(220, 38, 38, 0.22)",
  },
};

const recordingActionTooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const RecordingActionBtn = ({
  variant = "play",
  onClick,
  disabled = false,
  title,
  children,
}) => {
  const theme = RECORDING_BTN_THEMES[variant] || RECORDING_BTN_THEMES.play;

  const resetStyle = (el) => {
    el.style.background = theme.baseBg;
    el.style.borderColor = theme.baseBorder;
    el.style.transform = "";
    el.style.boxShadow = "none";
  };

  const applyHover = (el) => {
    if (disabled) return;
    el.style.background = theme.hoverBg;
    el.style.borderColor = theme.hoverBorder;
  };

  const button = (
    <button
      type="button"
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...recordingIconBtnBase,
        background: theme.baseBg,
        color: theme.color,
        border: `1px solid ${theme.baseBorder}`,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => applyHover(e.currentTarget)}
      onMouseLeave={(e) => resetStyle(e.currentTarget)}
      onMouseDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = theme.activeBg;
        e.currentTarget.style.transform = "translateY(1px) scale(0.96)";
        e.currentTarget.style.boxShadow = theme.activeShadow;
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        applyHover(e.currentTarget);
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );

  if (!title) return button;

  return (
    <Tooltip title={title} {...recordingActionTooltipProps}>
      <span style={{ display: "inline-flex", lineHeight: 0 }}>{button}</span>
    </Tooltip>
  );
};

export { RecordingActionBtn };
