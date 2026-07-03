import React, { useState, useRef, useEffect } from "react";
import {
  CONFIG_FILE_TITLE,
  CONFIG_FILE_OPTIONS,
  CONFIG_FILE_CONTENT_MAP, 
  CONFIG_FILE_MESSAGES,
  CONFIG_FILE_STATUS_MESSAGES,
  CONFIG_FILE_BREADCRUMB,
  CONFIG_FILE_HOSTS_VALUE,
  CONFIG_FILE_TEXTAREA_PLACEHOLDER,
  CONFIG_FILE_MESSAGE_DEFAULT,
  CONFIG_FILE_MESSAGE_TIMEOUT_MS,
  CONFIG_FILE_NETWORK_ERROR,
} from "../../../constants/ConfigFileConstants";
import { fetchHostsFile, updateHostsFile } from "../../../api/apiService";
import { Alert, CircularProgress } from "@mui/material";
// ── Color palette (same as AccountManage) ────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
  errorRed: "#dc2626",
  gridHeaderBg: "#F8FAFC",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

// ── Local field UI (matches Network.jsx design language) ──
const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;  


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
  backgroundColor: "#f8fafc",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "#f1f5f9";

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
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
  form,
  component,
  title,
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
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
    error: {
      background: C.errorRed,
      color: C.cardBg,
      border: `1px solid ${C.errorRed}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      error: "#b91c1c",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      error: "#991b1b",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
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

  const Component = component || "button";
  return (
    <Component
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
        height: 36,
        gap: 6,
        whiteSpace: "nowrap",
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
        <span style={{ display: "inline-flex" }}>
          {startIcon}
        </span>
      )}
      {children}
    </Component>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const ConfigFilePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const ConfigFilePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
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
  color: "#3E5475",
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
  const [message, setMessage] = useState(CONFIG_FILE_MESSAGE_DEFAULT);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(CONFIG_FILE_MESSAGE_DEFAULT), CONFIG_FILE_MESSAGE_TIMEOUT_MS);
  };

  const textareaRef = useRef(null);
  const hasInitialLoadRef = useRef(false);

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
        showMessage("success", CONFIG_FILE_MESSAGES.LOAD_SUCCESS);
      } else {
        showMessage("error", CONFIG_FILE_MESSAGES.LOAD_FAILED);
      }
    } catch (error) {
      if (error.message === CONFIG_FILE_NETWORK_ERROR) {
        showMessage("error", CONFIG_FILE_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || CONFIG_FILE_MESSAGES.LOAD_FAILED);
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
          response.message || CONFIG_FILE_MESSAGES.SAVE_SUCCESS,
        );
        setIsEditing(true);
      } else {
        showMessage("error", CONFIG_FILE_MESSAGES.SAVE_FAILED);
      }
    } catch (error) {
      if (error.message === CONFIG_FILE_NETWORK_ERROR) {
        showMessage("error", CONFIG_FILE_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || CONFIG_FILE_MESSAGES.SAVE_FAILED);
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Load hosts file on component mount when hosts is selected
  useEffect(() => {
    if (selectedFile === CONFIG_FILE_HOSTS_VALUE && !hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadHostsFile();
    }
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const value = e.target.value;
    setSelectedFile(value);

    if (value === CONFIG_FILE_HOSTS_VALUE) {
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
    if (selectedFile === CONFIG_FILE_HOSTS_VALUE) {
      saveHostsFile();
    } else {
      setIsEditing(true);
    }
  };

  const handleReset = () => {
    if (selectedFile === CONFIG_FILE_HOSTS_VALUE) {
      loadHostsFile();
    } else {
      setContent(CONFIG_FILE_CONTENT_MAP[selectedFile] || "");
    }
  };

  return (
    <div style={ConfigFilePageWrapStyle} data-native-scroll>
      <div style={ConfigFilePageInnerStyle}>
    
      {/* Message Display */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(CONFIG_FILE_MESSAGE_DEFAULT)}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: 3,
          }}
        >
          {message.text}
        </Alert>
      )}

      {/* ── Breadcrumb ── */}
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
          <span>{CONFIG_FILE_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{CONFIG_FILE_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {CONFIG_FILE_BREADCRUMB[2]}
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
                className="px-3 py-1 border rounded text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              {loading.fetch && selectedFile === CONFIG_FILE_HOSTS_VALUE && (
                <div
                  className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10"
                  style={{ backdropFilter: "blur(2px)" }}
                >
                  <div
                    className="flex items-center gap-3 bg-white px-6 py-4 rounded-lg shadow-lg"
                    style={{ border: `1px solid ${C.cardBorder}` }}
                  >
                    <CircularProgress size={24} style={{ color: C.primary }} />
                    <span className="text-gray-700 font-medium">
                      {CONFIG_FILE_STATUS_MESSAGES.LOADING_FILE}
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
                placeholder={CONFIG_FILE_TEXTAREA_PLACEHOLDER}
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
              {loading.save ? CONFIG_FILE_STATUS_MESSAGES.SAVING : CONFIG_FILE_STATUS_MESSAGES.SAVE_CHANGES}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              disabled={loading.fetch || loading.save}
              style={footerBtnStyle}
            >
              {CONFIG_FILE_STATUS_MESSAGES.RESET}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigFile;
