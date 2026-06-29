import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select as MuiSelect,
  Tooltip,
  TextField,
  Checkbox,
  Alert,
  Tabs,
  Tab,
  CircularProgress, useMediaQuery } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";

import {
  deleteCustomPrompt,
  deleteMohFile,
  getVoicePromptPreferences,
  listCustomPrompts,
  listMohClasses,
  listMohFiles,
  listVoicePromptExtensions,
  playCustomPrompt,
  playMohFile,
  recordNewCustomPrompt,
  uploadCustomPrompt,
  updateVoicePromptPreferences,
  uploadMohFile,
} from "../../../api/apiService";
import {
  VOICE_PROMPTS_CUSTOM_UPLOAD_NOTE,
  VOICE_PROMPTS_FIELD_TOOLTIPS,
  VOICE_PROMPTS_FORWARDING_HINT,
  VOICE_PROMPTS_MOH_UPLOAD_NOTE,
  VOICE_PROMPTS_RECORD_MODAL_TITLE,
  VOICE_PROMPTS_SECTIONS,
  VOICE_PROMPTS_TABS,
  VOICE_PROMPTS_TITLE,
} from "../../../constants/VoicePromptsConstants";

const VOICE_PROMPTS_COMPACT_MQ = "(max-width: 768px)";

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
  sectionHeading: "#30415A",
};

const VOICE_PROMPTS_CARD_RADIUS = 10;

// ── Local page UI (inlined from pbxSharedUi) ──
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const Component = component || "button";

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
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = baseBg;
          clearPressStyle(e.currentTarget);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverBg;
          clearPressStyle(e.currentTarget);
        }
      }}
    >
      {children}
    </Component>
  );
};

const voicePromptsModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const voicePromptsPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const voicePromptsPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const VoicePromptsBreadcrumb = ({ section, current, style }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      ...style,
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const VOICE_PROMPTS_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const tooltipProps = VOICE_PROMPTS_TOOLTIP_PROPS;

const TableListLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
    }}
  >
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const VOICE_PROMPTS_TAB_ACTIVE_COLOR = "#3E5475";
const VOICE_PROMPTS_TAB_INACTIVE_COLOR = "#374151";

const voicePromptsHeaderTabsSx = {
  minHeight: 44,
  pl: 0,
  borderBottom: `1px solid ${C.divider}`,
  "& .MuiTabs-flexContainer": { height: 44, paddingLeft: 0 },
  "& .MuiTab-root": {
    color: VOICE_PROMPTS_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 44,
    py: 0,
    px: 1.25,
    minWidth: 0,
  },
  "& .MuiTab-root.Mui-selected": {
    color: VOICE_PROMPTS_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

const voicePromptsCardStyle = {
  background: "#ffffff",
  borderRadius: VOICE_PROMPTS_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

const voicePromptsTabHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: VOICE_PROMPTS_CARD_RADIUS,
  borderTopRightRadius: VOICE_PROMPTS_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: 0,
  borderBottom: `1px solid ${C.divider}`,
};

const voicePromptsPrimaryBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const voicePromptsCancelBtnStyle = {
  ...voicePromptsModalCancelBtnStyle,
  boxShadow: "none",
};

const voicePromptsChooseFileBtnStyle = {
  ...voicePromptsPrimaryBtnStyle,
  minWidth: "auto",
  boxShadow: "none",
};

const voicePromptsPanelStyle = {
  background: "#f8fafc",
  padding: 16,
  borderRadius: 8,
  border: `1px solid ${C.cardBorder}`,
};

const voicePromptsTableCardStyle = {
  overflowX: "auto",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  background: "#ffffff",
};

const voicePromptsFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const VoicePromptsSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "28px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.divider}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: C.sectionHeading,
      }}
    >
      {title}
    </span>
  </div>
);

const SipPcmSectionHeading = VoicePromptsSectionHeading;

// ── Shared UI Components ──────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const voicePromptsTdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const getVoicePromptsRowBg = (idx) => (idx % 2 === 1 ? "#f8fafc" : "#ffffff");

const VoicePromptsFieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const FieldRow = VoicePromptsFieldRow;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const voicePromptsOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const voicePromptsTextFieldSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...voicePromptsOutlinedInputRootSx,
    minHeight: 34,
    height: 34,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
    color: C.valueText,
  },
};

const voicePromptsSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 34,
  height: 34,
  ...voicePromptsOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    padding: "7px 32px 7px 10px !important",
    display: "flex",
    alignItems: "center",
    color: C.valueText,
  },
};

const voicePromptsModalPaperSx = {
  width: 560,
  maxWidth: "96vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const voicePromptsModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  margin: 0,
};

const voicePromptsModalContentStyle = {
  padding: "24px",
  paddingTop: 24,
  backgroundColor: "#ffffff",
  boxSizing: "border-box",
};

const voicePromptsModalSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const voicePromptsModalActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const toolIconBtnSx = {
  width: 24,
  height: 24,
  border: "1px solid #c2c8d0",
  borderRadius: 1,
  backgroundColor: "#f5f7fa",
  p: 0,
  "&:hover": { backgroundColor: "#e8edf3" },
};

// ── Utility Functions ────────────────────────────────────────────────────────
const normalizeList = (raw) => {
  const list = raw?.message ?? raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
};

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDateTime = (value) => {
  if (!value) return "--";
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return "--";
  return dt.toLocaleString();
};

const safeFilename = (v) => String(v || "").trim();
const normalizeMohClassList = (res) => {
  const msg = res?.message ?? res?.data ?? {};
  const raw = Array.isArray(msg?.moh_classes)
    ? msg.moh_classes
    : Array.isArray(msg?.classes)
      ? msg.classes
      : Array.isArray(msg?.categories)
        ? msg.categories
        : Array.isArray(msg)
          ? msg
          : Array.isArray(res?.data)
            ? res.data
            : [];
  return raw
    .map((x) =>
      typeof x === "string" ? x : x?.name || x?.category || x?.class || "",
    )
    .map((x) => String(x).trim())
    .filter(Boolean);
};

const triggerBrowserDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const toMessageText = (msg, fallback) => {
  if (typeof msg === "string" && msg.trim()) return msg;
  if (msg && typeof msg === "object") {
    if (typeof msg.message === "string" && msg.message.trim())
      return msg.message;
    if (typeof msg.error === "string" && msg.error.trim()) return msg.error;
    if (typeof msg.details === "string" && msg.details.trim())
      return msg.details;
  }
  return fallback;
};

// ─────────────────────────────────────────────────────────────────────────────

const VoicePromptsPage = () => {
  const isCompact = useMediaQuery(VOICE_PROMPTS_COMPACT_MQ);
  const [activeTab, setActiveTab] = useState("promptPreference");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [playCallForwardingPrompt, setPlayCallForwardingPrompt] =
    useState(false);
  const [promptMohCategory, setPromptMohCategory] = useState("default");

  const [mohCategoryName, setMohCategoryName] = useState("");
  const [mohFile, setMohFile] = useState(null);
  const [mohFiles, setMohFiles] = useState([]);
  const [mohLoading, setMohLoading] = useState(false);

  const [customFile, setCustomFile] = useState(null);
  const [customItems, setCustomItems] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordFileName, setRecordFileName] = useState("");
  const [recordExtension, setRecordExtension] = useState("");
  const [extensions, setExtensions] = useState([]);

  const mohFileInputRef = useRef(null);
  const customFileInputRef = useRef(null);

  const [mohAudioUrl, setMohAudioUrl] = useState("");
  const [customAudioUrl, setCustomAudioUrl] = useState("");
  const mohAudioRef = useRef(null);
  const customAudioRef = useRef(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const categories = useMemo(() => {
    const listCats = mohFiles
      .map((f) => String(f?.category || "").trim())
      .filter(Boolean);
    return Array.from(new Set(listCats));
  }, [mohFiles]);

  const loadInitial = async () => {
    try {
      const prefRes = await getVoicePromptPreferences();
      if (prefRes?.response) {
        const msg = prefRes?.message ?? prefRes?.data ?? {};
        setPromptMohCategory(String(msg?.music_on_hold || "default"));
        setPlayCallForwardingPrompt(!!msg?.play_call_forwarding_prompt);
      }
    } catch {}

    await loadMohFiles();

    try {
      const extRes = await listVoicePromptExtensions();
      if (extRes?.response) {
        const list = normalizeList(extRes);
        const extList = list
          .map((x) => String(x?.extension ?? x?.ext ?? x).trim())
          .filter(Boolean);
        setExtensions(Array.from(new Set(extList)));
      } else {
        setExtensions([]);
      }
    } catch {
      setExtensions([]);
    }

    try {
      setCustomLoading(true);
      const res = await listCustomPrompts();
      if (res?.response) {
        const list = normalizeList(res);
        setCustomItems(
          list.map((it, idx) => ({
            id: it?.id ?? `${idx}`,
            recordingName: String(
              it?.recording_name || it?.name || it?.filename || "",
            ).replace(/\.[^/.]+$/, ""),
            fileName: safeFilename(
              it?.filename || it?.file_name || it?.file || "",
            ),
            extension: String(it?.extension || it?.ext || "--"),
            sizeBytes: Number(it?.size_bytes ?? it?.size ?? 0) || 0,
            uploadedAt: it?.uploaded_at || it?.uploaded || it?.date || "",
          })),
        );
      } else {
        setCustomItems([]);
      }
    } catch {
      setCustomItems([]);
    } finally {
      setCustomLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(promptMohCategory)) {
      setPromptMohCategory(categories[0]);
      return;
    }
    if (categories.length === 0 && !mohLoading) {
      setPromptMohCategory("");
    }
  }, [categories, promptMohCategory, mohLoading]);

  const loadMohFiles = async () => {
    setMohLoading(true);
    try {
      const res = await listMohFiles();
      if (!res?.response) {
        setMohFiles([]);
        return;
      }
      const msg = res?.message ?? res?.data ?? {};
      const list = Array.isArray(msg)
        ? msg
        : Array.isArray(msg?.files)
          ? msg.files
          : Array.isArray(res?.data)
            ? res.data
            : [];
      setMohFiles(
        list.map((it, idx) => ({
          id: it?.id ?? `${idx}`,
          category: String(it?.category || ""),
          filename: safeFilename(
            it?.filename || it?.file_name || it?.name || it,
          ),
          sizeBytes: Number(it?.size_bytes ?? it?.size ?? 0) || 0,
          uploadedAt:
            it?.uploaded_at || it?.created_at || it?.uploaded || it?.date || "",
        })),
      );
    } catch {
      setMohFiles([]);
    } finally {
      setMohLoading(false);
    }
  };

  const refreshMohClasses = async () => {
    try {
      const clsRes = await listMohClasses();
      if (!clsRes?.response) return [];
      return normalizeMohClassList(clsRes);
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (activeTab === "musicOnHold") {
      loadMohFiles();
    }
  }, [activeTab]);

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await updateVoicePromptPreferences({
        music_on_hold: promptMohCategory,
        play_call_forwarding_prompt: playCallForwardingPrompt,
      });
      if (!res?.response)
        return showMsg(
          "error",
          res?.message || "Failed to update preferences.",
        );
      showMsg("success", "Preferences updated successfully.");
    } catch (e) {
      showMsg("error", e?.message || "Failed to update preferences.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleUploadMoh = async () => {
    const trimmedCategory = mohCategoryName.trim();
    if (!trimmedCategory) return showMsg("error", "Category is required.");
    if (!mohFile) return showMsg("error", "Please select a hold music file.");

    try {
      const res = await uploadMohFile({
        category: trimmedCategory,
        file: mohFile,
      });
      if (!res?.response)
        return showMsg("error", res?.message || "Upload failed.");

      await refreshMohClasses();
      setPromptMohCategory(trimmedCategory);
      setMohCategoryName("");
      setMohFile(null);
      await loadMohFiles();
      showMsg("success", "MOH File uploaded successfully.");
    } catch (e) {
      showMsg("error", e?.message || "Upload failed.");
    }
  };

  const refreshCustomPrompts = async () => {
    setCustomLoading(true);
    try {
      const res = await listCustomPrompts();
      if (!res?.response) {
        setCustomItems([]);
        return;
      }
      const list = normalizeList(res);
      setCustomItems(
        list.map((it, idx) => ({
          id: it?.id ?? `${idx}`,
          recordingName: String(
            it?.recording_name || it?.name || it?.filename || "",
          ).replace(/\.[^/.]+$/, ""),
          fileName: safeFilename(
            it?.filename || it?.file_name || it?.file || "",
          ),
          extension: String(it?.extension || it?.ext || "--"),
          sizeBytes: Number(it?.size_bytes ?? it?.size ?? 0) || 0,
          uploadedAt: it?.uploaded_at || it?.uploaded || it?.date || "",
        })),
      );
    } catch {
      setCustomItems([]);
    } finally {
      setCustomLoading(false);
    }
  };

  const handleUploadCustomPrompt = async () => {
    if (!customFile)
      return showMsg("error", "Please select a custom prompt file.");

    try {
      const res = await uploadCustomPrompt({ file: customFile });
      if (!res?.response)
        return showMsg(
          "error",
          res?.message || "Failed to upload custom prompt.",
        );

      setCustomFile(null);
      await refreshCustomPrompts();
      showMsg("success", "Custom prompt uploaded successfully.");
    } catch (e) {
      showMsg("error", e?.message || "Failed to upload custom prompt.");
    }
  };

  const openRecordModal = () => {
    setRecordFileName("");
    setRecordExtension(extensions[0] || "");
    setRecordModalOpen(true);
  };

  const handleSaveRecordedPrompt = async () => {
    const trimmed = recordFileName.trim();
    if (!trimmed) return showMsg("error", "File Name is required.");
    if (!recordExtension)
      return showMsg("error", "Please select an extension.");

    try {
      const res = await recordNewCustomPrompt({
        file_name: trimmed,
        extension: recordExtension,
      });
      if (!res?.response)
        return showMsg(
          "error",
          toMessageText(res?.message, "Failed to start recording."),
        );

      showMsg("success", toMessageText(res?.message, "Recording started."));
      setRecordModalOpen(false);
      await refreshCustomPrompts();
    } catch (e) {
      showMsg(
        "error",
        toMessageText(
          e?.response?.data?.message || e?.message,
          "Failed to start recording.",
        ),
      );
    }
  };

  const stopMohPlayer = () => {
    if (mohAudioRef.current) {
      mohAudioRef.current.pause();
      mohAudioRef.current.currentTime = 0;
    }
    if (mohAudioUrl) {
      URL.revokeObjectURL(mohAudioUrl);
      setMohAudioUrl("");
    }
  };

  const stopCustomPlayer = () => {
    if (customAudioRef.current) {
      customAudioRef.current.pause();
      customAudioRef.current.currentTime = 0;
    }
    if (customAudioUrl) {
      URL.revokeObjectURL(customAudioUrl);
      setCustomAudioUrl("");
    }
  };

  useEffect(() => {
    return () => {
      if (mohAudioUrl) URL.revokeObjectURL(mohAudioUrl);
      if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
    };
  }, [mohAudioUrl, customAudioUrl]);

  return (
    <div
      style={{
        ...voicePromptsPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={voicePromptsPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={voicePromptsFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <VoicePromptsBreadcrumb
          section={VOICE_PROMPTS_TITLE}
          current={VOICE_PROMPTS_TITLE}
        />

        <div style={voicePromptsCardStyle}>
          <div
            style={{
              ...voicePromptsTabHeaderStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch" }
                : {}),
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, id) => {
                stopMohPlayer();
                stopCustomPlayer();
                setActiveTab(id);
              }}
              variant="standard"
              TabIndicatorProps={{
                style: {
                  backgroundColor: VOICE_PROMPTS_TAB_ACTIVE_COLOR,
                  height: 2,
                },
              }}
              sx={voicePromptsHeaderTabsSx}
            >
              {VOICE_PROMPTS_TABS.map((tab) => (
                <Tab key={tab.id} label={tab.label} value={tab.id} />
              ))}
            </Tabs>
          </div>

          <div style={{ padding: 16 }}>
            {/* ── TAB 1: PROMPT PREFERENCE ── */}
            {activeTab === "promptPreference" && (
              <div>
                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.general_preferences}
                  isFirst
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 16,
                    ...voicePromptsPanelStyle,
                  }}
                >
                  <FieldRow
                    label={
                      <Tooltip
                        title={VOICE_PROMPTS_FIELD_TOOLTIPS.music_on_hold}
                        {...tooltipProps}
                      >
                        <span style={{ cursor: "help" }}>Music On Hold</span>
                      </Tooltip>
                    }
                  >
                    <FormControl size="small" sx={{ width: 260 }}>
                      <MuiSelect
                        variant="outlined"
                        value={promptMohCategory}
                        onChange={(e) => setPromptMohCategory(e.target.value)}
                        displayEmpty
                        sx={voicePromptsSelectSx}
                      >
                        {categories.length === 0 ? (
                          promptMohCategory ? (
                            <MenuItem
                              value={promptMohCategory}
                              sx={{ fontSize: 13 }}
                            >
                              {promptMohCategory}
                            </MenuItem>
                          ) : (
                            <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                              <em>No uploaded music yet</em>
                            </MenuItem>
                          )
                        ) : (
                          categories.map((category) => (
                            <MenuItem
                              key={category}
                              value={category}
                              sx={{ fontSize: 13 }}
                            >
                              {category}
                            </MenuItem>
                          ))
                        )}
                      </MuiSelect>
                    </FormControl>
                  </FieldRow>

                  <div>
                    <FieldRow
                      label={
                        <Tooltip
                          title={
                            VOICE_PROMPTS_FIELD_TOOLTIPS.play_call_forwarding_prompt
                          }
                          {...tooltipProps}
                        >
                          <span style={{ cursor: "help" }}>
                            Play Call Forwarding Prompt
                          </span>
                        </Tooltip>
                      }
                    >
                      <Checkbox
                        checked={playCallForwardingPrompt}
                        onChange={(e) =>
                          setPlayCallForwardingPrompt(e.target.checked)
                        }
                        size="small"
                        sx={{
                          padding: "1px",
                          color: "#3E5475",
                          "&.Mui-checked": { color: "#0284c7" },
                          "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
                        }}
                      />
                    </FieldRow>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        marginTop: 4,
                      }}
                    >
                      <div style={{ width: 170, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: C.mutedText }}>
                        {VOICE_PROMPTS_FORWARDING_HINT}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 24, display: "flex" }}>
                  <Btn
                    onClick={handleSavePreferences}
                    disabled={savingPrefs}
                    variant="primary"
                    style={voicePromptsPrimaryBtnStyle}
                  >
                    {savingPrefs ? "Saving..." : "SAVE"}
                  </Btn>
                </div>
              </div>
            )}

            {/* ── TAB 2: MUSIC ON HOLD ── */}
            {activeTab === "musicOnHold" && (
              <div>
                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.upload_moh}
                  isFirst
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    ...voicePromptsPanelStyle,
                    marginBottom: 5,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Tooltip
                      title={VOICE_PROMPTS_FIELD_TOOLTIPS.moh_category}
                      {...tooltipProps}
                    >
                      <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      Category
                      </label>
                    </Tooltip>
                    <TextField
                      size="small"
                      variant="outlined"
                      value={mohCategoryName}
                      onChange={(e) => setMohCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      sx={{ ...voicePromptsTextFieldSx, width: 220 }}
                    />
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      File
                    </label>
                    <input
                      ref={mohFileInputRef}
                      type="file"
                      onChange={(e) => setMohFile(e.target.files?.[0] || null)}
                      style={{ display: "none" }}
                    />
                    <Btn
                      onClick={() => mohFileInputRef.current?.click()}
                      variant="cancel"
                      style={voicePromptsChooseFileBtnStyle}
                    >
                      Choose File
                    </Btn>
                    <span
                      style={{
                        fontSize: 12,
                        color: C.mutedText,
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {mohFile?.name || "No file chosen"}
                    </span>
                  </div>

                  <Btn
                    onClick={handleUploadMoh}
                    variant="primary"
                    style={{
                      ...voicePromptsPrimaryBtnStyle,
                      marginLeft: "auto",
                    }}
                  >
                    UPLOAD
                  </Btn>
                </div>
                <div
                  style={{ fontSize: 11, color: C.mutedText, marginBottom: 5 }}
                >
                  {VOICE_PROMPTS_MOH_UPLOAD_NOTE}
                </div>

                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.all_moh_files}
                />
                <div style={voicePromptsTableCardStyle}>
                  {mohLoading ? (
                    <TableListLoading />
                  ) : mohFiles.length === 0 ? (
                    <TableListEmptyState
                      message="No hold music uploaded yet."
                      showButton={false}
                    />
                  ) : (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 600, ...(isCompact ? { minWidth: 720 } : {}),
                    }}
                  >
                    <thead>
                      <tr>
                        <TH>File Name</TH>
                        <TH>Category</TH>
                        <TH>File Size</TH>
                        <TH>Uploaded</TH>
                        <TH style={{ width: 100 }}>Tools</TH>
                      </tr>
                    </thead>
                    <tbody>
                        {mohFiles.map((item, idx) => {
                          const rowBg = getVoicePromptsRowBg(idx);
                          const isLastRow = idx === mohFiles.length - 1;
                          const cellStyle = {
                            ...voicePromptsTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : voicePromptsTdStyle.borderBottom,
                          };
                          const lastCellStyle = {
                            ...cellStyle,
                            borderRight: "none",
                          };
                          return (
                          <tr
                            key={item.id}
                            style={{
                              background: rowBg,
                              transition: "background 0.15s ease",
                            }}
                          >
                            <td
                              style={{
                                ...cellStyle,
                                textAlign: "left",
                                fontWeight: 500,
                              }}
                            >
                              {item.filename}
                            </td>
                            <td style={{ ...cellStyle, textAlign: "left" }}>
                              {item.category || "--"}
                            </td>
                            <td style={{ ...cellStyle, color: C.mutedText }}>
                              {formatSize(item.sizeBytes)}
                            </td>
                            <td style={{ ...cellStyle, color: C.mutedText }}>
                              {formatDateTime(item.uploadedAt)}
                            </td>
                            <td style={lastCellStyle}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  gap: 8,
                                }}
                              >
                                <Tooltip title="Play">
                                  <IconButton
                                    size="small"
                                    sx={toolIconBtnSx}
                                    onClick={async () => {
                                      try {
                                        const resp = await playMohFile({
                                          category: item.category,
                                          filename: item.filename,
                                        });
                                        const url = URL.createObjectURL(
                                          resp.data,
                                        );
                                        stopCustomPlayer();
                                        if (mohAudioUrl)
                                          URL.revokeObjectURL(mohAudioUrl);
                                        setMohAudioUrl(url);
                                        setTimeout(
                                          () => mohAudioRef.current?.play?.(),
                                          0,
                                        );
                                      } catch (e) {
                                        showMsg(
                                          "error",
                                          e?.message || "Failed to play file.",
                                        );
                                      }
                                    }}
                                  >
                                    <PlayArrowRoundedIcon
                                      sx={{ fontSize: 16, color: "#16a34a" }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
                                  <IconButton
                                    size="small"
                                    sx={toolIconBtnSx}
                                    onClick={async () => {
                                      try {
                                        const resp = await playMohFile({
                                          category: item.category,
                                          filename: item.filename,
                                        });
                                        triggerBrowserDownload(
                                          resp.data,
                                          item.filename,
                                        );
                                      } catch (e) {
                                        showMsg(
                                          "error",
                                          e?.message ||
                                            "Failed to download file.",
                                        );
                                      }
                                    }}
                                  >
                                    <DownloadRoundedIcon
                                      sx={{ fontSize: 15, color: "#0284c7" }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    sx={toolIconBtnSx}
                                    onClick={async () => {
                                      if (
                                        !window.confirm(
                                          `Delete ${item.filename}?`,
                                        )
                                      )
                                        return;
                                      try {
                                        const res = await deleteMohFile({
                                          category: item.category,
                                          filename: item.filename,
                                        });
                                        if (!res?.response)
                                          return showMsg(
                                            "error",
                                            res?.message ||
                                              "Failed to delete file.",
                                          );
                                        const classes =
                                          await refreshMohClasses();
                                        if (
                                          !classes.includes(promptMohCategory)
                                        ) {
                                          setPromptMohCategory(
                                            classes[0] || "",
                                          );
                                        }
                                        await loadMohFiles();
                                        showMsg(
                                          "success",
                                          "File deleted successfully.",
                                        );
                                      } catch (e) {
                                        showMsg(
                                          "error",
                                          e?.message ||
                                            "Failed to delete file.",
                                        );
                                      }
                                    }}
                                  >
                                    <DeleteOutlineRoundedIcon
                                      sx={{ fontSize: 15, color: C.errorRed }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  )}
                </div>

                {mohAudioUrl && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 16,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      Now Playing:
                    </span>
                    <audio
                      ref={mohAudioRef}
                      controls
                      src={mohAudioUrl}
                      style={{ height: 30, flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={stopMohPlayer}
                      sx={toolIconBtnSx}
                    >
                      <StopRoundedIcon
                        sx={{ fontSize: 16, color: C.errorRed }}
                      />
                    </IconButton>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: CUSTOM PROMPT ── */}
            {activeTab === "customPrompt" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <Btn
                    onClick={openRecordModal}
                    variant="primary"
                    style={voicePromptsPrimaryBtnStyle}
                  >
                    + RECORD NEW
                  </Btn>
                </div>

                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.upload_custom}
                  isFirst
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    ...voicePromptsPanelStyle,
                    marginBottom: 5,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      File Path
                    </label>
                    <input
                      ref={customFileInputRef}
                      type="file"
                      onChange={(e) =>
                        setCustomFile(e.target.files?.[0] || null)
                      }
                      style={{ display: "none" }}
                    />
                    <Btn
                      onClick={() => customFileInputRef.current?.click()}
                      variant="cancel"
                      style={voicePromptsChooseFileBtnStyle}
                    >
                      Choose File
                    </Btn>
                    <span
                      style={{
                        fontSize: 12,
                        color: C.mutedText,
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {customFile?.name || "No file chosen"}
                    </span>
                  </div>
                  <Btn
                    onClick={handleUploadCustomPrompt}
                    variant="primary"
                    style={{
                      ...voicePromptsPrimaryBtnStyle,
                      marginLeft: "auto",
                    }}
                  >
                    UPLOAD
                  </Btn>
                </div>
                <div
                  style={{ fontSize: 11, color: C.mutedText, marginBottom: 5 }}
                >
                  {VOICE_PROMPTS_CUSTOM_UPLOAD_NOTE}
                </div>

                <VoicePromptsSectionHeading
                  title={VOICE_PROMPTS_SECTIONS.recordings}
                />
                <div style={voicePromptsTableCardStyle}>
                  {customLoading ? (
                    <TableListLoading />
                  ) : customItems.length === 0 ? (
                    <TableListEmptyState
                      message="No custom prompts uploaded yet."
                      showButton={false}
                    />
                  ) : (
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 700, ...(isCompact ? { minWidth: 720 } : {}),
                    }}
                  >
                    <thead>
                      <tr>
                        <TH>Recording Name</TH>
                        <TH>File Name</TH>
                        <TH>File Size</TH>
                        <TH>Uploaded</TH>
                        <TH style={{ width: 120 }}>Tools</TH>
                      </tr>
                    </thead>
                    <tbody>
                        {customItems.map((item, idx) => {
                          const rowBg = getVoicePromptsRowBg(idx);
                          const isLastRow = idx === customItems.length - 1;
                          const cellStyle = {
                            ...voicePromptsTdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : voicePromptsTdStyle.borderBottom,
                          };
                          const lastCellStyle = {
                            ...cellStyle,
                            borderRight: "none",
                          };
                          return (
                          <tr
                            key={item.id}
                            style={{
                              background: rowBg,
                              transition: "background 0.15s ease",
                            }}
                          >
                            <td
                              style={{
                                ...cellStyle,
                                textAlign: "left",
                                fontWeight: 600,
                              }}
                            >
                              {item.recordingName}
                            </td>
                            <td
                              style={{
                                ...cellStyle,
                                textAlign: "left",
                                color: C.mutedText,
                                fontFamily: "monospace",
                              }}
                            >
                              {item.fileName}
                            </td>
                            <td style={{ ...cellStyle, color: C.mutedText }}>
                              {formatSize(item.sizeBytes)}
                            </td>
                            <td style={{ ...cellStyle, color: C.mutedText }}>
                              {formatDateTime(item.uploadedAt)}
                            </td>
                            <td style={lastCellStyle}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  gap: 8,
                                }}
                              >
                                <Tooltip title="Play">
                                  <IconButton
                                    size="small"
                                    sx={toolIconBtnSx}
                                    onClick={async () => {
                                      try {
                                        const resp = await playCustomPrompt({
                                          filename: item.fileName,
                                        });
                                        const url = URL.createObjectURL(
                                          resp.data,
                                        );
                                        stopMohPlayer();
                                        if (customAudioUrl)
                                          URL.revokeObjectURL(customAudioUrl);
                                        setCustomAudioUrl(url);
                                        setTimeout(
                                          () =>
                                            customAudioRef.current?.play?.(),
                                          0,
                                        );
                                      } catch (e) {
                                        showMsg(
                                          "error",
                                          e?.message || "Failed to play file.",
                                        );
                                      }
                                    }}
                                  >
                                    <PlayArrowRoundedIcon
                                      sx={{ fontSize: 16, color: "#16a34a" }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download">
                                  <IconButton
                                    size="small"
                                    sx={toolIconBtnSx}
                                    onClick={async () => {
                                      try {
                                        const resp = await playCustomPrompt({
                                          filename: item.fileName,
                                        });
                                        triggerBrowserDownload(
                                          resp.data,
                                          item.fileName,
                                        );
                                      } catch (e) {
                                        showMsg(
                                          "error",
                                          e?.message ||
                                            "Failed to download file.",
                                        );
                                      }
                                    }}
                                  >
                                    <DownloadRoundedIcon
                                      sx={{ fontSize: 15, color: "#0284c7" }}
                                    />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    sx={toolIconBtnSx}
                                    onClick={async () => {
                                      if (
                                        !window.confirm(
                                          `Delete ${item.fileName}?`,
                                        )
                                      )
                                        return;
                                      try {
                                        const res = await deleteCustomPrompt({
                                          filename: item.fileName,
                                        });
                                        if (!res?.response)
                                          return showMsg(
                                            "error",
                                            res?.message ||
                                              "Failed to delete file.",
                                          );
                                        await refreshCustomPrompts();
                                        showMsg(
                                          "success",
                                          "File deleted successfully.",
                                        );
                                      } catch (e) {
                                        showMsg(
                                          "error",
                                          e?.message ||
                                            "Failed to delete file.",
                                        );
                                      }
                                    }}
                                  >
                                    <DeleteOutlineRoundedIcon
                                      sx={{ fontSize: 15, color: C.errorRed }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  )}
                </div>

                {customAudioUrl && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 16,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      Now Playing:
                    </span>
                    <audio
                      ref={customAudioRef}
                      controls
                      src={customAudioUrl}
                      style={{ height: 30, flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={stopCustomPlayer}
                      sx={toolIconBtnSx}
                    >
                      <StopRoundedIcon
                        sx={{ fontSize: 16, color: C.errorRed }}
                      />
                    </IconButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Record New Prompt Modal ── */}
      <Dialog
        open={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        maxWidth={false}
        PaperProps={{ sx: voicePromptsModalPaperSx }}
      >
        <DialogTitle style={voicePromptsModalTitleStyle}>
          {VOICE_PROMPTS_RECORD_MODAL_TITLE}
        </DialogTitle>
        <DialogContent
          style={voicePromptsModalContentStyle}
          sx={{ "&.MuiDialogContent-root": { paddingTop: "24px" } }}
        >
          <div style={voicePromptsModalSectionStyle}>
            <FieldRow label="File Name" required>
              <TextField
                size="small"
                fullWidth
                variant="outlined"
                value={recordFileName}
                onChange={(e) => setRecordFileName(e.target.value)}
                sx={voicePromptsTextFieldSx}
              />
            </FieldRow>
            <FieldRow label="Extension" required>
              <FormControl size="small" fullWidth variant="outlined">
                <MuiSelect
                  variant="outlined"
                  value={recordExtension}
                  onChange={(e) => setRecordExtension(e.target.value)}
                  displayEmpty
                  sx={voicePromptsSelectSx}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                    <em>Select extension</em>
                  </MenuItem>
                  {extensions.map((ext) => (
                    <MenuItem key={ext} value={ext} sx={{ fontSize: 13 }}>
                      {ext}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </FieldRow>
          </div>
        </DialogContent>
        <DialogActions style={voicePromptsModalActionsStyle}>
          <Btn
            onClick={handleSaveRecordedPrompt}
            variant="primary"
            style={voicePromptsPrimaryBtnStyle}
          >
            RECORD
          </Btn>
          <Btn
            onClick={() => setRecordModalOpen(false)}
            variant="cancel"
            style={voicePromptsCancelBtnStyle}
          >
            CANCEL
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VoicePromptsPage;
