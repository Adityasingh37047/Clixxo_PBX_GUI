import React, { useState, useRef, useEffect } from "react";
import {
  CONFIG_FILE_CARD_TITLE,
  CONFIG_FILE_OPTIONS,
  CONFIG_FILE_CONTENT_MAP,
  CONFIG_FILE_MESSAGES,
  CONFIG_FILE_BUTTON_LABELS,
  CONFIG_FILE_BUTTON_VARIANTS,
  CONFIG_FILE_BUTTON_STYLE,
  CONFIG_FILE_BREADCRUMB,
  CONFIG_FILE_HOSTS_VALUE,
  CONFIG_FILE_TEXTAREA_PLACEHOLDER,
  CONFIG_FILE_MESSAGE_DEFAULT,
  CONFIG_FILE_MESSAGE_TIMEOUT_MS,
  CONFIG_FILE_NETWORK_ERROR,
} from "../../../constants/ConfigFileConstants";
import { fetchHostsFile, updateHostsFile } from "../../../api/apiService";
import { Alert, CircularProgress, useMediaQuery } from "@mui/material";

const CONFIG_FILE_COMPACT_MQ = "(max-width: 768px)";
const CONFIG_FILE_FORM_PAD_X = 28;
const CARD_RADIUS = 4;
const FIELD_RADIUS = 6;

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

const systemToolsFieldSelectStyle = {
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 13,
  appearance: "auto",
  backgroundColor: "#ffffff",
  outline: "none",
  color: C.valueText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  cursor: "pointer",
};

const configFileHeaderSelectStyle = {
  ...systemToolsFieldSelectStyle,
  width: "auto",
  minWidth: 180,
  maxWidth: 220,
  height: 30,
  flexShrink: 0,
  marginLeft: "auto",
};

const configFileHeaderTitleStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  lineHeight: 1.35,
};
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
        <span style={{ display: "inline-flex" }}>
          {startIcon}
        </span>
      )}
      {children}
    </Component>
  );
};

const configFileCardStyle = {
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

const configFilePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const configFilePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const configFileHeaderStyle = {
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
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const configFileBodyWrapStyle = {
  position: "relative",
  width: "100%",
  background: C.cardBg,
};

const configFileTextareaBodyStyle = {
  backgroundColor: C.cardBg,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  overflow: "hidden",
};

const configFileTextareaStyle = {
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
  cursor: "text",
};

const configFileLoadingOverlayStyle = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(255, 255, 255, 0.72)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
};

const configFileLoadingBoxStyle = {
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

const configFileFooterStyle = {
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

const configFileFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const ConfigFileBreadcrumb = () => (
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
    <span>{CONFIG_FILE_BREADCRUMB[0]}</span>
    <span>&gt;</span>
    <span>{CONFIG_FILE_BREADCRUMB[1]}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {CONFIG_FILE_BREADCRUMB[2]}
    </span>
  </div>
);

const ConfigFile = () => {
  const isCompact = useMediaQuery(CONFIG_FILE_COMPACT_MQ);
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
    <div
      style={{
        ...configFilePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={configFilePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(CONFIG_FILE_MESSAGE_DEFAULT)}
            sx={{
              ...configFileFixedAlertSx,
              ...(isCompact
                ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
                : {}),
            }}
          >
            {message.text}
          </Alert>
        )}

        <ConfigFileBreadcrumb />

        <div style={configFileCardStyle}>
          <div style={configFileHeaderStyle}>
            <span style={configFileHeaderTitleStyle}>{CONFIG_FILE_CARD_TITLE}</span>
            <select
              value={selectedFile}
              onChange={handleFileChange}
              disabled={loading.fetch}
              style={configFileHeaderSelectStyle}
              {...inputInteraction}
            >
              {CONFIG_FILE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={configFileBodyWrapStyle}>
            {loading.fetch && selectedFile === CONFIG_FILE_HOSTS_VALUE && (
              <div style={configFileLoadingOverlayStyle}>
                <div style={configFileLoadingBoxStyle}>
                  <CircularProgress size={22} sx={{ color: C.accent }} />
                  <span>{CONFIG_FILE_BUTTON_LABELS.LOADING_FILE}</span>
                </div>
              </div>
            )}
            <div style={configFileTextareaBodyStyle}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onClick={handleTextareaClick}
                readOnly={loading.fetch}
                spellCheck={false}
                style={configFileTextareaStyle}
                placeholder={CONFIG_FILE_TEXTAREA_PLACEHOLDER}
              />
            </div>
          </div>

          <div style={configFileFooterStyle}>
            <Btn
              variant={CONFIG_FILE_BUTTON_VARIANTS.SAVE}
              onClick={handleSave}
              disabled={loading.fetch || loading.save}
              startIcon={
                loading.save ? <CircularProgress size={14} color="inherit" /> : null
              }
              style={CONFIG_FILE_BUTTON_STYLE}
            >
              {loading.save
                ? CONFIG_FILE_BUTTON_LABELS.SAVING
                : CONFIG_FILE_BUTTON_LABELS.SAVE}
            </Btn>
            <Btn
              variant={CONFIG_FILE_BUTTON_VARIANTS.RESET}
              onClick={handleReset}
              disabled={loading.fetch || loading.save}
              style={CONFIG_FILE_BUTTON_STYLE}
            >
              {CONFIG_FILE_BUTTON_LABELS.RESET}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigFile;
