import React, { useState, useRef, useEffect } from "react";
import {
  MODIFICATION_RECORD_CARD_TITLE,
  MODIFICATION_RECORD_BUTTON_LABELS,
  MODIFICATION_RECORD_BUTTON_VARIANTS,
  MODIFICATION_RECORD_BUTTON_STYLE,
  MODIFICATION_RECORD_NOTE,
  MODIFICATION_RECORD_TEXTAREA_PLACEHOLDER,
  MODIFICATION_RECORD_BREADCRUMB,
  MODIFICATION_RECORD_COMMANDS,
  MODIFICATION_RECORD_MESSAGES,
  MODIFICATION_RECORD_TOAST_DEFAULT,
  MODIFICATION_RECORD_TOAST_DURATION_MS,
} from "../../../constants/ModificationRecordConstants";
import { Alert, CircularProgress, useMediaQuery } from "@mui/material";
import { postLinuxCmd } from "../../../api/apiService";

const MODIFICATION_RECORD_COMPACT_MQ = "(max-width: 768px)";
const MODIFICATION_RECORD_FORM_PAD_X = 28;
const CARD_RADIUS = 10;

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#30415A",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  errorRed: "#dc2626",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
    cancel: {
      background: "#e2e8f0",
      color: "#475569",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#d4dce6",
      default: "#f1f5f9",
    }[variant] || "#f1f5f9";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#c5ced9",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {startIcon && (
        <span style={{ display: "inline-flex" }}>{startIcon}</span>
      )}
      {children}
    </button>
  );
};

const mrPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const mrPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const mrCardStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const mrHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  padding: `10px ${MODIFICATION_RECORD_FORM_PAD_X}px`,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const mrHeaderTitleStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  lineHeight: 1.35,
};

const mrBodyWrapStyle = {
  position: "relative",
  width: "100%",
  background: C.cardBg,
};

const mrTextareaBodyStyle = {
  backgroundColor: C.cardBg,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  overflow: "hidden",
};

const mrTextareaStyle = {
  display: "block",
  width: "100%",
  minHeight: 450,
  margin: 0,
  padding: "24px",
  border: "none",
  borderRadius: 0,
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "monospace",
  color: C.valueText,
  backgroundColor: C.cardBg,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  cursor: "default",
};

const mrLoadingOverlayStyle = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
};

const mrLoadingBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: C.cardBg,
  padding: "14px 20px",
  borderRadius: 8,
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
  fontSize: 13,
  fontWeight: 500,
  color: C.valueText,
};

const mrFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "10px 18px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  minHeight: 50,
  boxSizing: "border-box",
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

const mrNoteStyle = {
  margin: "16px 0 0",
  textAlign: "center",
  fontSize: 12,
  color: C.accent,
  width: "100%",
  lineHeight: 1.45,
};

const mrFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const ModificationRecordBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: C.mutedText,
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{MODIFICATION_RECORD_BREADCRUMB[0]}</span>
    <span>&gt;</span>
    <span>{MODIFICATION_RECORD_BREADCRUMB[1]}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {MODIFICATION_RECORD_BREADCRUMB[2]}
    </span>
  </div>
);

const ModificationRecord = () => {
  const isCompact = useMediaQuery(MODIFICATION_RECORD_COMPACT_MQ);
  const outputRef = useRef(null);
  const [record, setRecord] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(MODIFICATION_RECORD_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(MODIFICATION_RECORD_TOAST_DEFAULT),
      MODIFICATION_RECORD_TOAST_DURATION_MS,
    );
  };

  useEffect(() => {
    if (!outputRef.current || !record) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [record]);

  const handleCheck = async () => {
    try {
      setLoading(true);
      const response = await postLinuxCmd({
        cmd: MODIFICATION_RECORD_COMMANDS.FETCH_LATEST,
      });
      const logData = String(response?.responseData || "").trim();

      if (
        logData.includes(MODIFICATION_RECORD_MESSAGES.READ_ERROR) ||
        !logData
      ) {
        setRecord(MODIFICATION_RECORD_MESSAGES.FILE_UNREADABLE_OR_EMPTY);
      } else {
        setRecord(logData);
      }
    } catch (error) {
      console.error("Error fetching auth.log:", error);
      setRecord(MODIFICATION_RECORD_MESSAGES.FETCH_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await postLinuxCmd({
        cmd: MODIFICATION_RECORD_COMMANDS.FETCH_ALL,
      });
      const logData = String(response?.responseData || "").trim();

      if (logData.includes(MODIFICATION_RECORD_MESSAGES.READ_ERROR)) {
        showToast(MODIFICATION_RECORD_MESSAGES.FILE_UNREADABLE, "error");
        return;
      }

      if (!logData) {
        showToast(MODIFICATION_RECORD_MESSAGES.FILE_EMPTY, "error");
        return;
      }

      const blob = new Blob([logData], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "auth.log";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading auth.log:", error);
      showToast(MODIFICATION_RECORD_MESSAGES.DOWNLOAD_FAILED, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        ...mrPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={mrPageInnerStyle}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(MODIFICATION_RECORD_TOAST_DEFAULT)}
            sx={{
              ...mrFixedAlertSx,
              ...(isCompact
                ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
                : {}),
            }}
          >
            {toast.msg}
          </Alert>
        )}

        <ModificationRecordBreadcrumb />

        <div style={mrCardStyle}>
          <div style={mrHeaderStyle}>
            <span style={mrHeaderTitleStyle}>
              {MODIFICATION_RECORD_CARD_TITLE}
            </span>
          </div>

          <div style={mrBodyWrapStyle}>
            {loading && (
              <div style={mrLoadingOverlayStyle}>
                <div style={mrLoadingBoxStyle}>
                  <CircularProgress size={22} sx={{ color: C.accent }} />
                  <span>{MODIFICATION_RECORD_BUTTON_LABELS.LOADING}</span>
                </div>
              </div>
            )}
            <div style={mrTextareaBodyStyle}>
              <textarea
                ref={outputRef}
                value={record}
                readOnly
                spellCheck={false}
                tabIndex={-1}
                onFocus={(e) => e.target.blur()}
                style={mrTextareaStyle}
                placeholder={MODIFICATION_RECORD_TEXTAREA_PLACEHOLDER}
              />
            </div>
          </div>

          <div style={mrFooterStyle}>
            <Btn
              variant={MODIFICATION_RECORD_BUTTON_VARIANTS.CHECK}
              type="button"
              onClick={handleCheck}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={14} color="inherit" /> : null
              }
              style={MODIFICATION_RECORD_BUTTON_STYLE}
            >
              {loading
                ? MODIFICATION_RECORD_BUTTON_LABELS.LOADING
                : MODIFICATION_RECORD_BUTTON_LABELS.CHECK}
            </Btn>
            <Btn
              variant={MODIFICATION_RECORD_BUTTON_VARIANTS.DOWNLOAD}
              type="button"
              onClick={handleDownload}
              disabled={loading}
              style={MODIFICATION_RECORD_BUTTON_STYLE}
            >
              {MODIFICATION_RECORD_BUTTON_LABELS.DOWNLOAD}
            </Btn>
          </div>
        </div>

        <p style={mrNoteStyle}>{MODIFICATION_RECORD_NOTE}</p>
      </div>
    </div>
  );
};

export default ModificationRecord;
