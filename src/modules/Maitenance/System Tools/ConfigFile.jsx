import React, { useState, useRef, useEffect } from "react";
import {
  CONFIG_FILE_TITLE,
  CONFIG_FILE_OPTIONS,
  CONFIG_FILE_EDIT_BUTTON,
  CONFIG_FILE_SAVE_BUTTON,
  CONFIG_FILE_CONTENT_MAP,
} from "../../../constants/ConfigFileConstants";
import { fetchHostsFile, updateHostsFile } from "../../../api/apiService";
import { Alert, CircularProgress } from "@mui/material";
// ── Color palette (same as AccountManage) ────────────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "#3e5475",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

const SYS_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};
// ── Local field UI (inlined from maitenanceSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const getSystemToolsInputInteraction = (hasError, errorColor = "#dc2626") => {
  if (!hasError) return inputInteraction;
  const ring = (el, focused) => {
    el.style.borderColor = errorColor;
    el.style.borderWidth = "1px";
    el.style.boxShadow = focused ? `0 0 0 1px ${errorColor}` : "none";
  };
  return {
    onFocus: (e) => ring(e.target, true),
    onBlur: (e) => ring(e.target, false),
    onMouseEnter: (e) => ring(e.target, document.activeElement === e.target),
    onMouseLeave: (e) => ring(e.target, document.activeElement === e.target),
  };
};

const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "var(--row-alt)",
  outline: "none",
  color: "var(--text-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "var(--bg-main)";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "var(--bg-muted)";

const systemToolsFieldSelectStyle = {
  ...systemToolsFieldInputStyle,
  appearance: "auto",
};
const selectStyle = systemToolsFieldSelectStyle;

const advancedFormInlineFooterStyle = {
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
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

// ── Button Component (same as AccountManage) ─────────────────────────────────
const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[var(--border-subtle)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:opacity-90`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_ERROR,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title, startIcon }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {startIcon && <span className="inline-flex items-center">{startIcon}</span>}
    {children}
  </button>
);

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const footerBtnStyle = {
  ...advancedFormBtnStyle,
  width: 110,
  minWidth: 110,
  maxWidth: 110,
  padding: "0 10px",
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "var(--text-primary)",
  borderBottom: `1px solid ${C.divider}`,
};

const ConfigFile = () => {
  const [selectedFile, setSelectedFile] = useState(
    CONFIG_FILE_OPTIONS[0].value,
  );
  const [content, setContent] = useState(
    CONFIG_FILE_CONTENT_MAP[CONFIG_FILE_OPTIONS[0].value],
  );
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const textareaRef = useRef(null);
  const hasInitialLoadRef = useRef(false);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Load hosts file from API
  const loadHostsFile = async () => {
    if (loading.fetch) {
      return;
    }

    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await fetchHostsFile();
      if (response.response && response.responseData) {
        setContent(response.responseData);
        showMessage("success", "Hosts file loaded successfully");
      } else {
        showMessage("error", "Failed to load hosts file");
      }
    } catch (error) {
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to load hosts file");
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Save hosts file to API
  const saveHostsFile = async () => {
    if (loading.save) {
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response = await updateHostsFile(content);
      if (response.message) {
        showMessage(
          "success",
          response.message || "Hosts file saved successfully",
        );
        setIsEditing(true);
      } else {
        showMessage("error", "Failed to save hosts file");
      }
    } catch (error) {
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to save hosts file");
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Load hosts file on component mount when hosts is selected
  useEffect(() => {
    if (selectedFile === "hosts" && !hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadHostsFile();
    }
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const value = e.target.value;
    setSelectedFile(value);

    if (value === "hosts") {
      loadHostsFile();
    } else {
      setContent(CONFIG_FILE_CONTENT_MAP[value] || "");
    }
    setIsEditing(true);
  };

  const handleTextareaClick = () => {
    if (!isEditing && !loading.fetch) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (selectedFile === "hosts") {
      saveHostsFile();
    } else {
      setIsEditing(true);
    }
  };

  const handleReset = () => {
    if (selectedFile === "hosts") {
      loadHostsFile();
    } else {
      setContent(CONFIG_FILE_CONTENT_MAP[selectedFile] || "");
    }
  };

  return (
    <div
      className="clixxo-system-settings theme-page-bg min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* Message Display */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={SYS_TOAST_SX}
        >
          {message.text}
        </Alert>
      )}

      {/* ── Breadcrumb ── */}
      <div className="w-full" style={{ maxWidth: 1000 }}>
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Config File
          </span>
        </div>

        <div style={tableContainerStyle}>
          {/* Top Blue Bar */}
          <div style={blueBarStyle}>
            <span style={{ flex: 1, textAlign: "left" }}>
              {CONFIG_FILE_TITLE}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <select
                className="px-3 py-1 border rounded text-sm text-[var(--text-secondary)] bg-[var(--bg-surface)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedFile}
                onChange={handleFileChange}
                disabled={loading.fetch}
                style={{
                  ...selectStyle,
                  minWidth: "180px",
                  height: 30,
                  fontSize: 13,
                  fontWeight: 500,
                }}
                {...inputInteraction}
              >
                {CONFIG_FILE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
              {loading.fetch && selectedFile === "hosts" && (
                <div
                  className="absolute inset-0 bg-[var(--bg-surface)] bg-opacity-70 flex items-center justify-center z-10"
                  style={{ backdropFilter: "blur(2px)" }}
                >
                  <div
                    className="flex items-center gap-3 bg-[var(--bg-surface)] px-6 py-4 rounded-lg shadow-lg"
                    style={{ border: `1px solid ${C.cardBorder}` }}
                  >
                    <CircularProgress size={24} style={{ color: C.primary }} />
                    <span className="text-[var(--text-secondary)] font-medium">
                      Loading config file...
                    </span>
                  </div>
                </div>
              )}
              <textarea
                ref={textareaRef}
                className="w-full min-h-[450px] resize-vertical text-sm box-border outline-none cursor-text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onClick={handleTextareaClick}
                readOnly={loading.fetch}
                spellCheck={false}
                style={{
                  border: "none",
                  margin: "0",
                  padding: "24px",
                  fontFamily: "monospace",
                  backgroundColor: C.cardBg,
                  color: C.valueText,
                  lineHeight: "1.6",
                }}
                placeholder="Click to edit configuration content..."
              />
          </div>

          <div
            style={{
              ...advancedFormInlineFooterStyle,
              width: "100%",
              marginLeft: 0,
              marginRight: 0,
            }}
          >
            <Btn
              variant="primary"
              onClick={handleSave}
              disabled={loading.fetch || loading.save}
              startIcon={
                loading.save && <CircularProgress size={16} color="inherit" />
              }
              style={footerBtnStyle}
            >
              {loading.save ? "Saving..." : "Save Changes"}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              disabled={loading.fetch || loading.save}
              style={footerBtnStyle}
            >
              Reset
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigFile;
