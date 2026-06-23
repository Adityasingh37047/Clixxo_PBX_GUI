/** Theme-aware form field outline tokens — use instead of rgba(0,0,0,…) borders */
export const OUTLINED_BORDER = "var(--border-subtle)";
export const OUTLINED_HOVER = "var(--border-strong)";
export const OUTLINED_FOCUS = "var(--status-primary)";

export const FOCUS_RING_SHADOW = (color = OUTLINED_FOCUS) => `0 0 0 1px ${color}`;

export const nativeFieldBaseStyle = {
  borderRadius: 4,
  outline: "none",
  backgroundColor: "var(--bg-surface)",
  color: "var(--text-primary)",
  border: `1px solid ${OUTLINED_BORDER}`,
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const nativeFieldDisabledStyle = {
  backgroundColor: "var(--bg-muted)",
  color: "var(--text-muted)",
  borderColor: OUTLINED_BORDER,
  cursor: "not-allowed",
};

export const muiOutlinedFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    color: "var(--text-primary)",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-disabled": {
      backgroundColor: "var(--bg-muted)",
      "& fieldset": { borderColor: OUTLINED_BORDER },
    },
  },
  "& .MuiInputBase-input": {
    color: "var(--text-primary)",
    "&::placeholder": { color: "var(--text-muted)", opacity: 1 },
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "var(--text-muted)",
    color: "var(--text-muted)",
  },
};
