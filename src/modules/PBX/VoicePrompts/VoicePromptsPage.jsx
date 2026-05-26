import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
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
  CircularProgress,
  Alert,
} from "@mui/material";
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

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2563eb",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: "#1e2d42",
      color: "#fff",
      border: "1px solid #162233",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.accent,
      color: C.cardBg,
      border: `0.5px solid ${C.accent}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

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

const SectionHeading = ({ title }) => (
  <div style={{ margin: "24px 0 16px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
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
  const [activeTab, setActiveTab] = useState("promptPreference");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [lastUpdated, setLastUpdated] = useState(null);

  const [playCallForwardingPrompt, setPlayCallForwardingPrompt] =
    useState(false);
  const [promptMohCategory, setPromptMohCategory] = useState("default");

  const [mohCategoryName, setMohCategoryName] = useState("");
  const [mohFile, setMohFile] = useState(null);
  const [mohClasses, setMohClasses] = useState([]);
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
        const prefClasses = Array.isArray(msg?.moh_classes)
          ? msg.moh_classes
          : [];
        if (prefClasses.length > 0) {
          setMohClasses(
            prefClasses.map((x) => String(x).trim()).filter(Boolean),
          );
        }
      }
    } catch {}

    try {
      const clsRes = await listMohClasses();
      if (clsRes?.response) setMohClasses(normalizeMohClassList(clsRes));
      else setMohClasses([]);
    } catch {
      setMohClasses([]);
    }

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
      setLastUpdated(new Date());
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
      if (!clsRes?.response) {
        setMohClasses([]);
        return [];
      }
      const classes = normalizeMohClassList(clsRes);
      setMohClasses(classes);
      return classes;
    } catch {
      setMohClasses([]);
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

      setMohClasses((prev) => Array.from(new Set([...prev, trimmedCategory])));
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
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
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

        {/* Breadcrumb + Last Updated */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Voice Prompts &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              Voice Prompts
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              
              borderBottom: `1px solid ${C.cardBorder}`,
              padding: "10px 14px 0 14px",
            }}
          >
            {[
              { id: "promptPreference", label: "PROMPT PREFERENCE" },
              { id: "musicOnHold", label: "MUSIC ON HOLD" },
              { id: "customPrompt", label: "CUSTOM PROMPT" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  stopMohPlayer();
                  stopCustomPlayer();
                  setActiveTab(t.id);
                }}
                style={{
                  background: activeTab === t.id ? C.cardBg : "transparent",
                  color: activeTab === t.id ? C.accent : "#17181a",
                  border:
                    activeTab === t.id
                      ? `1px solid ${C.cardBorder}`
                      : "1px solid transparent",
                  borderBottom: "none",
                  padding: "8px 16px",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: "6px 6px 0 0",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 0.2s",
                  position: "relative",
                  top: activeTab === t.id ? 1 : 0,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 16 }}>
            {/* ── TAB 1: PROMPT PREFERENCE ── */}
            {activeTab === "promptPreference" && (
              <div style={{ maxWidth: 800 }}>
                <SectionHeading title="General Preferences" />
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
    color: "#64748b",
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
  variant="default"
  style={{
    padding: "8px 28px",
    fontSize: 13,
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",
  }}
>
  {savingPrefs ? "Saving..." : "SAVE"}
</Btn>
                </div>
              </div>
            )}

            {/* ── TAB 2: MUSIC ON HOLD ── */}
            {activeTab === "musicOnHold" && (
              <div>
                <SectionHeading title="Upload New MOH File" />
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
                      variant="outline"
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
  variant="default"
  style={{
    marginLeft: "auto",
    padding: "8px 28px",
    fontSize: 13,
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",
  }}
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

                <SectionHeading title="All Uploaded MOH Files" />
                <div
                  style={{
                    overflowX: "auto",
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 6,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 600,
                    }}
                  >
                    <thead>
                      <tr>
                        <TH style={{ textAlign: "left", paddingLeft: 16 }}>
                          File Name
                        </TH>
                        <TH style={{ textAlign: "left", paddingLeft: 16 }}>
                          Category
                        </TH>
                        <TH>File Size</TH>
                        <TH>Uploaded</TH>
                        <TH style={{ width: 100 }}>Tools</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {mohLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{ textAlign: "center", padding: 32 }}
                          >
                            <CircularProgress size={24} />
                          </td>
                        </tr>
                      ) : mohFiles.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              textAlign: "center",
                              padding: 32,
                              fontSize: 13,
                              color: C.mutedText,
                            }}
                          >
                            No hold music uploaded yet.
                          </td>
                        </tr>
                      ) : (
                        mohFiles.map((item, idx) => (
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
                                        showMessage(
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
                                        showMessage(
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
                                          return showMessage(
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
                                        showMessage(
                                          "success",
                                          "File deleted successfully.",
                                        );
                                      } catch (e) {
                                        showMessage(
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {mohAudioUrl && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 16,
                      background: "#f0fdf4",
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "1px solid #86efac",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#166534",
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
  variant="accent"
  style={{
    padding: "8px 28px",
    fontSize: 13,
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",
  }}
>
  + RECORD NEW
</Btn>
                </div>

                <SectionHeading title="Upload Custom Prompt" />
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
                      variant="outline"
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
  variant="default"
  style={{
    marginLeft: "auto",
    padding: "8px 28px",
    fontSize: 13,
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",
  }}
>
  UPLOAD
</Btn>
                </div>
                <div
                  style={{ fontSize: 11, color: C.mutedText, marginBottom: 5 }}
                >
                  Note: supports uploading .wav, .mp3, .gsm files.
                </div>

                <SectionHeading title="Recordings" />
                <div
                  style={{
                    overflowX: "auto",
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 6,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 700,
                    }}
                  >
                    <thead>
                      <tr>
                        <TH style={{ textAlign: "left", paddingLeft: 16 }}>
                          Recording Name
                        </TH>
                        <TH style={{ textAlign: "left", paddingLeft: 16 }}>
                          File Name
                        </TH>
                        <TH>File Size</TH>
                        <TH>Uploaded</TH>
                        <TH style={{ width: 120 }}>Tools</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {customLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{ textAlign: "center", padding: 32 }}
                          >
                            <CircularProgress size={24} />
                          </td>
                        </tr>
                      ) : customItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              textAlign: "center",
                              padding: 32,
                              fontSize: 13,
                              color: C.mutedText,
                            }}
                          >
                            No custom prompts uploaded/recorded yet.
                          </td>
                        </tr>
                      ) : (
                        customItems.map((item, idx) => (
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
                                        showMessage(
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
                                        showMessage(
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
                                          return showMessage(
                                            "error",
                                            res?.message ||
                                              "Failed to delete file.",
                                          );
                                        await refreshCustomPrompts();
                                        showMessage(
                                          "success",
                                          "File deleted successfully.",
                                        );
                                      } catch (e) {
                                        showMessage(
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {customAudioUrl && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 16,
                      background: "#f0fdf4",
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "1px solid #86efac",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#166534",
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
          <Btn
            onClick={handleSaveRecordedPrompt}
            variant="default"
            style={{ padding: "8px 24px" }}
          >
            RECORD
          </Btn>
          <Btn
            onClick={() => setRecordModalOpen(false)}
            variant="outline"
            style={{ padding: "8px 24px" }}
          >
            CANCEL
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default VoicePromptsPage;
