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
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
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
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

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
        transition: "all 0.15s ease",
        height: 36,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {startIcon && <span style={{ display: "inline-flex" }}>{startIcon}</span>}
      {children}
    </button>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
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
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* Message Display */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
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
          <div style={{ ...blueBarStyle, flexWrap: "wrap", height: "auto", minHeight: 44, padding: "8px 20px" }}>
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
                  minWidth: "180px",
                  borderColor: C.cardBorder,
                  height: 30,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {CONFIG_FILE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main content container */}
          <div style={{ backgroundColor: C.pageBg }}>
            <div className="relative">
              {loading.fetch && selectedFile === "hosts" && (
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

            {/* Action buttons */}
            <div
              className="flex justify-center gap-4 py-5 flex-wrap"
              style={{ borderTop: `1px solid ${C.divider}` }}
            >
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={loading.fetch || loading.save}
                startIcon={
                  loading.save && <CircularProgress size={16} color="inherit" />
                }
                style={{ minWidth: 120, height: 38 }}
              >
                {loading.save ? "Saving..." : "Save Changes"}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleReset}
                disabled={loading.fetch || loading.save}
                style={{ minWidth: 120, height: 38 }}
              >
                Reset
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigFile;
