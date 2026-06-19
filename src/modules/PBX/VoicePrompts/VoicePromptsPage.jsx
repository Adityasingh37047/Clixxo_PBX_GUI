import React, { useEffect, useMemo, useRef, useState } from "react";
import {Alert,
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

const PBX_COMPACT_MQ = "(max-width: 768px)";

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  errorRed: "#dc2626",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#3E5475] border-[#9CA3AF] hover:bg-[#e2e8f0]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
  formPrimary:
    "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60",
  formCancel:
    "inline-flex items-center justify-center box-border min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60",
  chooseFile:
    "inline-flex items-center justify-center box-border m-0 min-w-0 h-[34px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  className = "",
  style,
  type,
  title,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const VOICE_PROMPT_PAGE_WRAP =
  "bg-[#f8fafc] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const VOICE_PROMPT_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const VOICE_PROMPT_FORM_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const VOICE_PROMPT_FORM_HEADER =
  "flex w-full min-h-[44px] items-center border-b border-[#9CA3AF] bg-white py-0 pl-[6px] pr-[8px] text-[13px] font-bold text-[#3E5475] rounded-t-[10px]";
const VOICE_PROMPT_FORM_HEADER_COMPACT = "flex-col items-stretch";

const PbxBreadcrumb = ({ section, current, className = "" }) => (
  <div
    className={`mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8] ${className}`.trim()}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const TableListLoading = () => (
  <div className="flex items-center justify-center p-[48px]">
    <CircularProgress size={28} sx={{ color: C.accent }} />
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div className="flex min-h-[240px] flex-col items-center justify-center p-[24px] text-center">
    <div
      className="text-[13px] font-semibold text-[#3E5475]"
      style={{ marginBottom: showButton && onAddNew ? 16 : 0 }}
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

const PBX_MODAL_TAB_ACTIVE_COLOR = "#3E5475";
const PBX_MODAL_TAB_INACTIVE_COLOR = "#374151";

const pbxHeaderTabsSx = {
  minHeight: 44,
  pl: 0,
  "& .MuiTabs-flexContainer": { height: 44, paddingLeft: 0 },
  "& .MuiTab-root": {
    color: PBX_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 44,
    py: 0,
    px: 1.25,
    minWidth: 0,
  },
  "& .MuiTab-root.Mui-selected": {
    color: PBX_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

const VoicePromptSectionHeading = ({ title, isFirst = false }) => (
  <div
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
      width: "100%",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#30415A",
      }}
    >
      {title}
    </span>
  </div>
);

// ── Shared UI Components ──────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children, required, align = "center" }) => (
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
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
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
    <div className={`${VOICE_PROMPT_PAGE_WRAP} ${isCompact ? "p-[8px]" : ""}`.trim()}>
      <div className={VOICE_PROMPT_PAGE_INNER}>
        {/* Error / Success Banner */}
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

        <PbxBreadcrumb section="Voice Prompts" current="Voice Prompts" />

        <div className={VOICE_PROMPT_FORM_CARD}>
          <div
            className={`${VOICE_PROMPT_FORM_HEADER} ${isCompact ? VOICE_PROMPT_FORM_HEADER_COMPACT : ""}`.trim()}
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
                  backgroundColor: PBX_MODAL_TAB_ACTIVE_COLOR,
                  height: 2,
                },
              }}
              sx={pbxHeaderTabsSx}
            >
              <Tab label="PROMPT PREFERENCE" value="promptPreference" />
              <Tab label="MUSIC ON HOLD" value="musicOnHold" />
              <Tab label="CUSTOM PROMPT" value="customPrompt" />
            </Tabs>
          </div>

          <div style={{ padding: 16 }}>
            {/* ── TAB 1: PROMPT PREFERENCE ── */}
            {activeTab === "promptPreference" && (
              <div>
                <VoicePromptSectionHeading title="General Preferences" isFirst />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 16,
                    background: "#f8fafc",
                    padding: 16,
                    borderRadius: 6,
                    border: `1px solid #e2e8f0`,
                  }}
                >
                  <FieldRow label="Music On Hold">
                    <FormControl size="small" sx={{ width: 260 }}>
                      <MuiSelect
                        value={promptMohCategory}
                        onChange={(e) => setPromptMohCategory(e.target.value)}
                        displayEmpty
                        sx={{ fontSize: 13, background: "#fff" }}
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

                  <FieldRow label="Play Call Forwarding Prompt">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
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
    alignSelf: "flex-start",
  }}
/>
                      <span style={{ fontSize: 11, color: C.mutedText }}>
                        If enabled, the system plays default forwarding prompt
                        before transfer.
                      </span>
                    </div>
                  </FieldRow>
                </div>
                <div style={{ marginTop: 24, display: "flex" }}>
                  <Btn
                    onClick={handleSavePreferences}
                    disabled={savingPrefs}
                    variant="formPrimary"
                  >
                    {savingPrefs ? "Saving..." : "SAVE"}
                  </Btn>
                </div>
              </div>
            )}

            {/* ── TAB 2: MUSIC ON HOLD ── */}
            {activeTab === "musicOnHold" && (
              <div>
                <VoicePromptSectionHeading title="Upload New MOH File" isFirst />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    background: "#f8fafc",
                    padding: 16,
                    borderRadius: 6,
                    border: `1px solid #e2e8f0`,
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
                      Category
                    </label>
                    <TextField
                      size="small"
                      value={mohCategoryName}
                      onChange={(e) => setMohCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      inputProps={{
                        style: {
                          fontSize: 13,
                          padding: "6px 8px",
                          background: "#fff",
                          width: 200,
                        },
                      }}
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
                      variant="chooseFile"
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
                    variant="formPrimary"
                    className="ml-auto"
                  >
                    UPLOAD
                  </Btn>
                </div>
                <div
                  style={{ fontSize: 11, color: C.mutedText, marginBottom: 5 }}
                >
                  Note: only supports uploading G711A, G711U, PCM16 encoding,
                  8000Hz sampling rate, mono wav, MP3 files.
                </div>

                <VoicePromptSectionHeading title="All Uploaded MOH Files" />
                <div
                  style={{
                    overflowX: "auto",
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 6,
                  }}
                >
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
                        {mohFiles.map((item, idx) => (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: "1px solid #e2e8f0",
                              background: idx % 2 === 1 ? "#f8fafc" : "#fff",
                            }}
                          >
                            <td
                              style={{
                                padding: "8px 16px",
                                fontSize: 12,
                                color: C.valueText,
                                fontWeight: 500,
                              }}
                            >
                              {item.filename}
                            </td>
                            <td
                              style={{
                                padding: "8px 16px",
                                fontSize: 12,
                                color: C.valueText,
                              }}
                            >
                              {item.category || "--"}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                fontSize: 12,
                                color: C.mutedText,
                                textAlign: "center",
                              }}
                            >
                              {formatSize(item.sizeBytes)}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                fontSize: 12,
                                color: C.mutedText,
                                textAlign: "center",
                              }}
                            >
                              {formatDateTime(item.uploadedAt)}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center" }}>
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
                        ))}
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
                  <Btn onClick={openRecordModal} variant="formPrimary">
                    + RECORD NEW
                  </Btn>
                </div>

                <VoicePromptSectionHeading title="Upload Custom Prompt" isFirst />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    background: "#f8fafc",
                    padding: 16,
                    borderRadius: 6,
                    border: `1px solid #e2e8f0`,
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
                      variant="chooseFile"
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
                    variant="formPrimary"
                    className="ml-auto"
                  >
                    UPLOAD
                  </Btn>
                </div>
                <div
                  style={{ fontSize: 11, color: C.mutedText, marginBottom: 5 }}
                >
                  Note: supports uploading .wav, .mp3, .gsm files.
                </div>

                <VoicePromptSectionHeading title="Recordings" />
                <div
                  style={{
                    overflowX: "auto",
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 6,
                  }}
                >
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
                        {customItems.map((item, idx) => (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: "1px solid #e2e8f0",
                              background: idx % 2 === 1 ? "#f8fafc" : "#fff",
                            }}
                          >
                            <td
                              style={{
                                padding: "8px 16px",
                                fontSize: 12,
                                color: C.valueText,
                                fontWeight: 600,
                              }}
                            >
                              {item.recordingName}
                            </td>
                            <td
                              style={{
                                padding: "8px 16px",
                                fontSize: 12,
                                color: C.mutedText,
                                fontFamily: "monospace",
                              }}
                            >
                              {item.fileName}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                fontSize: 12,
                                color: C.mutedText,
                                textAlign: "center",
                              }}
                            >
                              {formatSize(item.sizeBytes)}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                fontSize: 12,
                                color: C.mutedText,
                                textAlign: "center",
                              }}
                            >
                              {formatDateTime(item.uploadedAt)}
                            </td>
                            <td style={{ padding: "8px", textAlign: "center" }}>
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
                        ))}
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
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
          }}
        >
          Record New Prompt
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: C.pageBg }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "#fff",
              padding: 20,
              borderRadius: 6,
              border: `1px solid ${C.cardBorder}`,
            }}
          >
            <FieldRow label="File Name" required>
              <TextField
                size="small"
                fullWidth
                value={recordFileName}
                onChange={(e) => setRecordFileName(e.target.value)}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </FieldRow>
            <FieldRow label="Extension" required>
              <FormControl size="small" fullWidth>
                <MuiSelect
                  value={recordExtension}
                  onChange={(e) => setRecordExtension(e.target.value)}
                  displayEmpty
                  sx={{ fontSize: 13 }}
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
        <DialogActions
          style={{
            padding: "16px 24px",
            background: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn onClick={handleSaveRecordedPrompt} variant="formPrimary">
            RECORD
          </Btn>
          <Btn
            onClick={() => setRecordModalOpen(false)}
            variant="formCancel"
          >
            CANCEL
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VoicePromptsPage;
