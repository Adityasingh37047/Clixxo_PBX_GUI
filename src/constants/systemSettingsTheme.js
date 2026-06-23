/** Shared theme tokens & field styles for System Settings pages */
export const SYS_C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-subtle)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
  primary: "var(--status-primary)",
  errorRed: "var(--status-danger)",
  gridHeaderBg: "var(--table-header-bg)",
};

export const SYS_OUTLINED_BORDER = "var(--border-subtle)";
export const SYS_OUTLINED_HOVER = "var(--border-strong)";
export const SYS_OUTLINED_FOCUS = "var(--status-primary)";

export const SYS_PAGE_CLASS =
  "clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center";

export const SYS_CARD_STYLE = {
  background: SYS_C.cardBg,
  borderRadius: 10,
  overflow: "hidden",
  boxShadow: SYS_C.cardShadow,
  marginBottom: 24,
  border: `1px solid ${SYS_C.cardBorder}`,
};

export const SYS_NATIVE_FIELD_BASE = {
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${SYS_OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "var(--bg-main)",
  color: "var(--text-primary)",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const SYS_INPUT_STYLE = {
  ...SYS_NATIVE_FIELD_BASE,
  width: "100%",
  padding: "6px 10px",
  borderRadius: 10,
  lineHeight: 1.4,
  minHeight: 34,
  maxWidth: "280px",
};

export const SYS_DISABLED_INPUT_STYLE = {
  ...SYS_INPUT_STYLE,
  background: "var(--bg-muted)",
  color: "var(--text-muted)",
  cursor: "not-allowed",
  borderColor: SYS_OUTLINED_BORDER,
};

export const SYS_FOOTER_STYLE = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "calc(100% + 40px)",
  marginLeft: -20,
  marginRight: -20,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
  borderTop: `1px solid ${SYS_C.divider}`,
  background: SYS_C.cardBg,
  boxSizing: "border-box",
};

export const SYS_BTN_CANCEL =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60 bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90";

export const SYS_TH_STYLE = {
  background: "var(--table-header-bg)",
  color: "var(--text-label)",
  fontWeight: 700,
  fontSize: 11,
  padding: "9px 14px",
  textAlign: "center",
  borderBottom: `1px solid ${SYS_C.divider}`,
  borderRight: `1px solid ${SYS_C.divider}`,
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};

export const SYS_TD_STYLE = {
  padding: "8px 14px",
  fontSize: 12,
  color: "var(--text-primary)",
  textAlign: "center",
  borderBottom: `1px solid ${SYS_C.divider}`,
  borderRight: `1px solid ${SYS_C.divider}`,
};

export const SYS_BREADCRUMB_STYLE = {
  fontSize: 12,
  color: "var(--text-muted)",
  marginBottom: 16,
  fontWeight: 400,
  display: "flex",
  alignItems: "center",
  gap: 4,
};
