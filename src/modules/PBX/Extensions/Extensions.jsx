import React, { useState, useRef, useEffect } from "react";
import {
  SIP_ACCOUNT_FIELDS,
  SIP_ACCOUNT_TABLE_COLUMNS,
  SIP_ACCOUNT_INITIAL_FORM,
  CODEC_OPTIONS,
} from "../../../constants/SipAccountConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Tabs,
  Tab,
} from "@mui/material";
import {
  fetchSipAccounts,
  createSipAccount,
  updateSipAccount,
  deleteSipAccount,
  bulkCreateSipAccounts,
  exportSipAccountsCsv,
  importSipAccountsCsv,
} from "../../../api/apiService";
// ── Local page UI (inlined from pbxSharedUi) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#ef4444",
  successGreen: "#22c55e",
};

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
  const baseBg = extraStyle?.background ?? s.background;
  const Component = component || "button";
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
      {children}
    </Component>
  );
};

const pbxModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PbxBreadcrumb = ({ section, current, style }) => (
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

const PBX_MODAL_TAB_BAR_STYLE = {
  borderBottom: "1px solid #e5e7eb",
  background: "#ffffff",
};

const PBX_MODAL_TAB_ACTIVE_COLOR = "#3E5475";
const PBX_MODAL_TAB_INACTIVE_COLOR = "#374151";

const pbxModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: PBX_MODAL_TAB_INACTIVE_COLOR,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: PBX_MODAL_TAB_ACTIVE_COLOR,
    fontWeight: 700,
  },
};

const PbxModalTabs = ({ value, onChange, tabs, fullWidth = true }) => (
  <div style={PBX_MODAL_TAB_BAR_STYLE}>
    <Tabs
      value={value}
      onChange={(_, next) => onChange(next)}
      variant={fullWidth ? "fullWidth" : "standard"}
      TabIndicatorProps={{
        style: { backgroundColor: PBX_MODAL_TAB_ACTIVE_COLOR, height: 2 },
      }}
      sx={pbxModalTabsSx}
    >
      {tabs.map((t) => (
        <Tab key={t.id} label={t.label} value={t.id} />
      ))}
    </Tabs>
  </div>
);

const PBX_MODAL_SECTION_BG = "#f8fafc";
const PBX_MODAL_SECTION_HEADING_COLOR = "#30415A";

const PbxModalSectionHeading = ({ title, isFirst = false }) => (
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
        background: PBX_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: PBX_MODAL_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

const SIP_PCM_TABLE_CARD_RADIUS = 10;

const sipPcmCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
};

const sipPcmPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const sipPcmSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const sipPcmCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const sipPcmPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const sipPcmPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const SipPcmPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...sipPcmPaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span style={sipPcmPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        Next →
      </Btn>
    </div>
  </div>
);

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  ...muiSelectInnerSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const modalTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
};

const gatedModalFieldSx = (
  enabled,
  baseSx = modalSelectSx,
  enabledCursor = "pointer",
) => {
  const outlinedRootSx = baseSx["& .MuiOutlinedInput-root"] || {};
  const outlinedInputSx = baseSx["& .MuiOutlinedInput-input"] || {};
  const disabledBg = "#f1f5f9";

  return {
    ...baseSx,
    backgroundColor: enabled ? "#fff" : disabledBg,
    cursor: enabled ? enabledCursor : "not-allowed",
    ...(!enabled && {
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: OUTLINED_BORDER,
      },
    }),
    "& .MuiOutlinedInput-root": {
      ...outlinedRootSx,
      backgroundColor: enabled ? "#fff" : disabledBg,
      cursor: enabled ? enabledCursor : "not-allowed",
      ...(!enabled && {
        "&:hover fieldset": { borderColor: OUTLINED_BORDER },
      }),
    },
    "& .MuiOutlinedInput-input, & .MuiInputBase-input": {
      ...outlinedInputSx,
      backgroundColor: enabled ? "#fff" : disabledBg,
      cursor: enabled ? enabledCursor : "not-allowed",
    },
    "& .MuiSelect-select": {
      cursor: enabled ? enabledCursor : "not-allowed",
    },
    "&.Mui-disabled, & .MuiOutlinedInput-root.Mui-disabled": {
      cursor: "not-allowed",
      backgroundColor: disabledBg,
    },
  };
};

const pbxDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#3E5475",
  textAlign: "center",
  marginBottom: 8,
};

const pbxDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const pbxDualListBtnStyle = {
  height: 36,
  width: "100%",
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "block",
  boxSizing: "border-box",
  textAlign: "center",
};

const PbxDualListBtn = ({ onClick, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={pbxDualListBtnStyle}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#d9dde3";
    }}
  >
    {children}
  </button>
);

const MONITOR_DUAL_LIST_LABEL_OFFSET = 28;

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = ({ text, bg, color }) => (
  <span
    style={{
      background: bg,
      color,
      padding: "1px 8px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.01em",
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 64,
    }}
  >
    {text}
  </span>
);

const extensionTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

// ── Status style helper ───────────────────────────────────────────────────────
const statusStyle = (s) => {
  const v = String(s || "").toLowerCase();

  if (v === "online") {
    return { color: "#16a34a" };
  }

  if (v === "offline") {
    return { color: "#dc2626" };
  }

  if (v === "expired") {
    return { color: "#f59e0b" };
  }

  if (v === "pending") {
    return { color: C.accent };
  }

  return { bg: "#f1f5f9", color: "#475569" };
};
// ── Constants ─────────────────────────────────────────────────────────────────
const FOLLOW_ME_TIMEOUT_OPTIONS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
];
const FOLLOW_ME_DESTINATION_TYPES = [
  "Call Queue",
  "CallBacks",
  "Conference Rooms",
  "DISA",
  "Extensions",
  "Fax To Mail",
  "IVR Menus",
  "Ring Groups",
  "Voicemails",
  "Other",
];

// ─────────────────────────────────────────────────────────────────────────────

const SipAccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_ACCOUNT_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const [formMode, setFormMode] = useState("single");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = React.useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    startExtension: "",
    createNumber: "",
    passwordMode: "random",
    fixedPassword: "",
    passwordPrefix: "",
  });

  // Pagination
  const itemsPerPage = 50;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadAccounts();
    }
  }, []);

  // ── Filter rows by search ──────────────────────────────────────────────────
  const filteredAccounts = searchQuery.trim()
    ? accounts.filter((a) =>
        [
          a.extension,
          a.context,
          a.allow_codecs,
          a.status,
          a.user_name,
          a.email,
        ].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : accounts;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / itemsPerPage),
  );
  const pagedAccounts = filteredAccounts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const extensionOptions = React.useMemo(
    () =>
      Array.from(new Set(accounts.map((a) => String(a.extension)))).sort(
        (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0),
      ),
    [accounts],
  );

  // ── Select-all logic (mirrors CDR) ────────────────────────────────────────
  const allPageSelected =
    pagedAccounts.length > 0 &&
    pagedAccounts.every((_, i) =>
      selected.includes((page - 1) * itemsPerPage + i),
    );

  const somePageSelected =
    pagedAccounts.some((_, i) =>
      selected.includes((page - 1) * itemsPerPage + i),
    ) && !allPageSelected;

  const handleToggleAll = () => {
    const pageIdxs = pagedAccounts.map((_, i) => (page - 1) * itemsPerPage + i);
    if (allPageSelected) {
      setSelected((prev) => prev.filter((id) => !pageIdxs.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIdxs])));
    }
  };

  const handleToggleRow = (realIdx) => {
    setSelected((prev) =>
      prev.includes(realIdx)
        ? prev.filter((i) => i !== realIdx)
        : [...prev, realIdx],
    );
  };

  // ── Message ───────────────────────────────────────────────────────────────
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // ── Transform helpers (unchanged from original) ───────────────────────────
  const transformApiToUi = (apiData) => {
    const isEnabled = (value) =>
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "yes" ||
      value === "on";
    const yesNoToToggle = (value) =>
      isEnabled(value) ? "enabled" : "disabled";
    const boolToYesNo = (value) => (isEnabled(value) ? "yes" : "no");
    const normalizeTC = (value) => {
      const n = String(value || "")
        .toLowerCase()
        .trim();
      if (n === "office") return "work_time";
      if (n === "non_office") return "holiday";
      if (["all", "work_time", "holiday", "custom"].includes(n)) return n;
      return "all";
    };

    return [...apiData]
      .sort(
        (a, b) => (parseInt(a.extension) || 0) - (parseInt(b.extension) || 0),
      )
      .map((item, index) => ({
        index: index.toString(),
        extension: item.extension,
        context: item.context,
        allow_codecs: item.allow_codecs || item.codecs || "",
        password: item.password,
        max_registrations: item.max_registrations ?? "",
        user_name: item.name || item.display_name || "",
        user_password: item.user_password || "",
        email: item.email || "",
        mobile_number: item.mobile_number || item.mobile || "",
        voicemail_enabled: boolToYesNo(item.voicemail_enabled),
        voicemail_password: item.voicemail_password || "",
        voicemail_file:
          item.voicemail_file === "Audio File Attachment"
            ? "audio_file_attachment"
            : item.voicemail_file === "Download Link"
              ? "download_link"
              : item.voicemail_file || "audio_file_attachment",
        voicemail_keep_local: item.voicemail_keep_local || "no",
        cf_always_enabled: yesNoToToggle(
          item.cf_always_enabled ?? item.call_forward_always_enabled,
        ),
        cf_always_number:
          item.cf_always_dest || item.call_forward_always_dest || "",
        cf_always_time: normalizeTC(
          item.cf_always_time_condition ||
            item.call_forward_always_time_condition,
        ),
        cf_busy_enabled: yesNoToToggle(
          item.cf_busy_enabled ?? item.call_forward_busy_enabled,
        ),
        cf_busy_number: item.cf_busy_dest || item.call_forward_busy_dest || "",
        cf_busy_time: normalizeTC(
          item.cf_busy_time_condition || item.call_forward_busy_time_condition,
        ),
        cf_no_answer_enabled: yesNoToToggle(
          item.cf_noanswer_enabled ?? item.call_forward_noanswer_enabled,
        ),
        cf_no_answer_number:
          item.cf_noanswer_dest || item.call_forward_noanswer_dest || "",
        cf_no_answer_time: normalizeTC(
          item.cf_noanswer_time_condition ||
            item.call_forward_noanswer_time_condition,
        ),
        cf_not_registered_enabled: yesNoToToggle(
          item.cf_unreg_enabled ?? item.call_forward_unreg_enabled,
        ),
        cf_not_registered_number:
          item.cf_unreg_dest || item.call_forward_unreg_dest || "",
        cf_not_registered_time: normalizeTC(
          item.cf_unreg_time_condition ||
            item.call_forward_unreg_time_condition,
        ),
        dnd_enabled: yesNoToToggle(item.dnd_enabled),
        dnd_time: normalizeTC(item.dnd_time_condition),
        dnd_special_numbers:
          (Array.isArray(item.dnd_special_numbers) &&
            item.dnd_special_numbers) ||
          (Array.isArray(item.dnd_special_number) && item.dnd_special_number) ||
          (Array.isArray(item.dnd_allow_numbers) && item.dnd_allow_numbers) ||
          [],
        enable_mobility_extension: boolToYesNo(
          item.mobility_enabled ??
            item.enable_mobility_extension ??
            item.enable_mobility_ext,
        ),
        ring_simultaneously: boolToYesNo(
          item.mobility_ring_simultaneously ?? item.ring_simultaneously,
        ),
        mobility_prefix: item.mobility_prefix || item.prefix || "",
        mobility_timeout:
          Number(item.mobility_timeout ?? item.timeout ?? 30) || 30,
        secretary_service: yesNoToToggle(
          item.secretary_enabled ??
            item.secretary_service_enabled ??
            item.secretary_service,
        ),
        secretary_extension:
          item.secretary_extension ||
          item.secretary_number ||
          item.ss1 ||
          item.ss2 ||
          "",
        follow_me_enabled: yesNoToToggle(item.follow_me_enabled),
        follow_me_time: normalizeTC(item.follow_me_time_condition),
        follow_me_entries: item.follow_me_dest
          ? [
              {
                destinationType: String(item.follow_me_dest),
                timeout: 30,
                confirm: "unconfirm",
              },
            ]
          : [],
        follow_me_timeout_destination: item.follow_me_timeout_destination || "",
        from_domain: item.from_domain || item["Domain name"] || "",
        contact_user: item.contact_user || item["Contact User"] || "",
        outbound_proxy: item.outbound_proxy || item["Outbound Proxy"] || "",
        status: item.status || "",
        enable_srtp: boolToYesNo(item.adv_enable_srtp ?? item.enable_srtp),
        sip_bypass_media: (() => {
          const v = item.adv_bypass_media || item.sip_bypass_media || "proxy";
          return v === "bypass" ? "bypass_media" : "proxy_media";
        })(),
        call_timeout: Number(
          item.adv_call_timeout_sec ?? item.call_timeout ?? 30,
        ),
        max_call_duration: Number(
          item.adv_max_call_duration_sec ?? item.max_call_duration ?? 6000,
        ),
        outbound_restriction:
          (item.adv_outbound_restriction ?? item.outbound_restriction)
            ? "enable"
            : "disable",
        admin_call_permission: (() => {
          const v = String(item.adv_call_permission_admin || "international")
            .toLowerCase()
            .replace(/[\s-]/g, "_");
          if (v === "no_call" || v === "none" || v === "no") return "no_call";
          if (v === "internal" || v === "internal_call") return "internal_call";
          if (v === "local" || v === "local_call") return "local_call";
          if (
            v === "long_distance" ||
            v === "long_distance_call" ||
            v === "longdistance"
          )
            return "long_distance_call";
          return "international_call";
        })(),
        call_permission: (() => {
          const v = String(
            item.adv_call_permission_dynamic ||
              item.adv_call_permission ||
              item.call_permission ||
              "international",
          )
            .toLowerCase()
            .replace(/[\s-]/g, "_");
          if (v === "no_call" || v === "none" || v === "no") return "no_call";
          if (v === "internal" || v === "internal_call") return "internal_call";
          if (v === "local" || v === "local_call") return "local_call";
          if (
            v === "long_distance" ||
            v === "long_distance_call" ||
            v === "longdistance"
          )
            return "long_distance_call";
          return "international_call";
        })(),
        extension_trunk:
          (item.adv_extension_trunk ?? item.extension_trunk)
            ? "enable"
            : "disable",
        dynamic_lock_pin:
          Number(
            item.adv_dynamic_lock_pin ?? item.adv_dynamic_lock_mode ?? 0,
          ) === 1
            ? "user_password"
            : "default",
        diversion: boolToYesNo(
          item.adv_send_diversion ??
            item.send_diversion ??
            item.diversion ??
            true,
        ),
        call_prohibition:
          (item.adv_call_prohibition ?? item.call_prohibition)
            ? "enable"
            : "disable",

        rx_volume: Number(item.adv_rx_volume ?? item.rx_volume ?? 0),
        tx_volume: Number(item.adv_tx_volume ?? item.tx_volume ?? 0),
        monitor_allow: item.monitor_allow || "disable",
        monitor_allowed_extensions: Array.isArray(
          item.monitor_allowed_extensions,
        )
          ? item.monitor_allowed_extensions
          : [],
        monitor_mode: item.monitor_mode || "none",
      }));
  };

  const transformUiToApi = (uiData) => {
    const toggleToBool = (value) =>
      value === "enabled" || value === "yes" || value === true;
    const voicemailFileForApi =
      uiData.voicemail_file === "audio_file_attachment"
        ? "Audio File Attachment"
        : uiData.voicemail_file === "download_link"
          ? "Download Link"
          : uiData.voicemail_file || "Audio File Attachment";

    return {
      extension: uiData.extension,
      context: uiData.context,
      allow_codecs: uiData.allow_codecs,
      password: uiData.password,
      max_registrations: uiData.max_registrations
        ? Number(uiData.max_registrations)
        : undefined,
      name: uiData.user_name || uiData.name || "",
      display_name: uiData.user_name || uiData.name || "",
      user_password: uiData.user_password || "",
      email: uiData.email || "",
      mobile_number: uiData.mobile_number || "",
      mobile: uiData.mobile_number || "",
      voicemail_enabled: uiData.voicemail_enabled || "no",
      voicemail_password: uiData.voicemail_password || "",
      voicemail_file: voicemailFileForApi,
      voicemail_keep_local: uiData.voicemail_keep_local || "no",
      cf_always_enabled: toggleToBool(uiData.cf_always_enabled),
      cf_always_dest: uiData.cf_always_number || "",
      cf_always_time_condition: uiData.cf_always_time || "all",
      cf_busy_enabled: toggleToBool(uiData.cf_busy_enabled),
      cf_busy_dest: uiData.cf_busy_number || "",
      cf_busy_time_condition: uiData.cf_busy_time || "all",
      cf_noanswer_enabled: toggleToBool(uiData.cf_no_answer_enabled),
      cf_noanswer_dest: uiData.cf_no_answer_number || "",
      cf_noanswer_time_condition: uiData.cf_no_answer_time || "all",
      cf_unreg_enabled: toggleToBool(uiData.cf_not_registered_enabled),
      cf_unreg_dest: uiData.cf_not_registered_number || "",
      cf_unreg_time_condition: uiData.cf_not_registered_time || "all",
      follow_me_enabled: toggleToBool(uiData.follow_me_enabled),
      follow_me_dest:
        (Array.isArray(uiData.follow_me_entries) &&
          uiData.follow_me_entries.find((e) => e?.destinationType)
            ?.destinationType) ||
        "",
      follow_me_destination:
        (Array.isArray(uiData.follow_me_entries) &&
          uiData.follow_me_entries.find((e) => e?.destinationType)
            ?.destinationType) ||
        "",
      follow_me_time_condition: uiData.follow_me_time || "all",
      dnd_enabled: toggleToBool(uiData.dnd_enabled),
      dnd_time_condition: uiData.dnd_time || "all",
      dnd_special_numbers: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      dnd_special_number: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      dnd_allow_numbers: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      mobility_enabled: toggleToBool(uiData.enable_mobility_extension),
      enable_mobility_extension: uiData.enable_mobility_extension || "no",
      enable_mobility_ext: uiData.enable_mobility_extension || "no",
      mobility_ring_simultaneously: toggleToBool(uiData.ring_simultaneously),
      ring_simultaneously: uiData.ring_simultaneously || "no",
      mobility_prefix: uiData.mobility_prefix || "",
      mobility_timeout: Number(uiData.mobility_timeout || 30),
      monitor_allow: uiData.monitor_allow || "disable",
      monitor_allowed_extensions: Array.isArray(
        uiData.monitor_allowed_extensions,
      )
        ? uiData.monitor_allowed_extensions
        : [],
      monitor_mode: uiData.monitor_mode || "none",
      secretary_enabled: toggleToBool(uiData.secretary_service),
      secretary_service_enabled: toggleToBool(uiData.secretary_service),
      secretary_service: toggleToBool(uiData.secretary_service),
      secretary_extension: uiData.secretary_extension || "",
      secretary_number: uiData.secretary_extension || "",
      from_domain: uiData.from_domain,
      contact_user: uiData.contact_user,
      outbound_proxy: uiData.outbound_proxy,
      adv_enable_srtp: uiData.enable_srtp === "yes",
      adv_bypass_media:
        uiData.sip_bypass_media === "bypass_media" ? "bypass" : "proxy",
      adv_call_timeout_sec: Number(uiData.call_timeout ?? 30),
      adv_max_call_duration_sec: Number(uiData.max_call_duration ?? 6000),
      adv_outbound_restriction: uiData.outbound_restriction === "enable",
      adv_call_permission_admin: (() => {
        const v = uiData.admin_call_permission || "international_call";
        if (v === "no_call") return "no_call";
        if (v === "internal_call") return "internal";
        if (v === "local_call") return "local";
        if (v === "long_distance_call") return "long_distance";
        return "international";
      })(),
      adv_extension_trunk: uiData.extension_trunk === "enable",
      adv_dynamic_lock_mode:
        uiData.dynamic_lock_pin === "user_password" ? 1 : 0,
      adv_send_diversion: uiData.diversion === "yes",
      adv_call_prohibition: uiData.call_prohibition === "enable",
      adv_rx_volume: Number(uiData.rx_volume ?? 0),
      adv_tx_volume: Number(uiData.tx_volume ?? 0),
    };
  };

  // ── Load accounts ─────────────────────────────────────────────────────────
  const loadAccounts = async () => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await fetchSipAccounts();
      if (response.response && response.message) {
        setAccounts(transformApiToUi(response.message));
      } else {
        showMessage("error", "Failed to load SIP accounts");
      }
    } catch (error) {
      showMessage(
        "error",
        error.message === "Network Error"
          ? "Network error. Please check your connection."
          : error.message || "Failed to load SIP accounts",
      );
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateExtension = (v) =>
    !v || !v.trim() ? "Extension is required" : null;
  const validateContext = (v) =>
    !v || !v.trim() ? "Context is required" : null;
  const validateAllowCodecs = (v) =>
    !v || !v.trim() ? "Allow Codecs is required" : null;
  const validatePassword = (v) => {
    if (!v || !v.trim()) return "Password is required";
    if (v.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(v))
      return "Password must include at least one uppercase letter";
    if (!/[0-9]/.test(v)) return "Password must include at least one number";
    if (!/[^a-zA-Z0-9]/.test(v))
      return "Password must include at least one special character";
    return null;
  };

  const validateForm = () => {
    const errors = {};
    const e = validateExtension(form.extension);
    if (e) errors.extension = e;
    const p = validatePassword(form.password);
    if (p) errors.password = p;
    const c = validateContext(form.context);
    if (c) errors.context = c;
    const a = validateAllowCodecs(form.allow_codecs);
    if (a) errors.allow_codecs = a;
    return errors;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    }
    let err = null;
    if (key === "extension") err = validateExtension(value);
    if (key === "password") err = validatePassword(value);
    if (key === "context") err = validateContext(value);
    if (err) setValidationErrors((prev) => ({ ...prev, [key]: err }));
  };

  const handleCodecChange = (codec, checked) => {
    setForm((prev) => {
      const cur = prev.allow_codecs
        ? prev.allow_codecs.split(",").map((c) => c.trim())
        : [];
      const next = checked
        ? cur.includes(codec)
          ? cur
          : [...cur, codec]
        : cur.filter((c) => c !== codec);
      const str = next.join(",");
      if (validationErrors.allow_codecs) {
        setValidationErrors((p) => {
          const n = { ...p };
          delete n.allow_codecs;
          return n;
        });
      }
      const ae = validateAllowCodecs(str);
      if (ae) setValidationErrors((p) => ({ ...p, allow_codecs: ae }));
      return { ...prev, allow_codecs: str };
    });
  };

  const isCodecSelected = (codec) => {
    if (!form.allow_codecs) return false;
    return form.allow_codecs
      .split(",")
      .map((c) => c.trim())
      .includes(codec);
  };

  // ── Follow Me helpers ─────────────────────────────────────────────────────
  const handleFollowMeEntryChange = (index, field, value) => {
    setForm((prev) => {
      const current = Array.isArray(prev.follow_me_entries)
        ? [...prev.follow_me_entries]
        : [];
      current[index] = {
        ...(current[index] || {
          destinationType: "",
          timeout: 30,
          confirm: "unconfirm",
        }),
        [field]: value,
      };
      return { ...prev, follow_me_entries: current };
    });
  };
  const handleAddFollowMeEntry = () => {
    setForm((prev) => ({
      ...prev,
      follow_me_entries: [
        ...(Array.isArray(prev.follow_me_entries)
          ? prev.follow_me_entries
          : []),
        { destinationType: "", timeout: 30, confirm: "unconfirm" },
      ],
    }));
  };

  // ── DND helpers ───────────────────────────────────────────────────────────
  const handleDndNumberChange = (index, value) => {
    setForm((prev) => {
      const cur = Array.isArray(prev.dnd_special_numbers)
        ? [...prev.dnd_special_numbers]
        : [];
      cur[index] = value;
      return { ...prev, dnd_special_numbers: cur };
    });
  };
  const handleAddDndNumber = () => {
    setForm((prev) => ({
      ...prev,
      dnd_special_numbers: [
        ...(Array.isArray(prev.dnd_special_numbers)
          ? prev.dnd_special_numbers
          : []),
        "",
      ],
    }));
  };

  // ── Modal open/close ──────────────────────────────────────────────────────
  const handleOpenModal = (row = null, idx = null) => {
    setForm(row ? { ...row } : { ...SIP_ACCOUNT_INITIAL_FORM });
    setEditIndex(row ? idx : null);
    setFormMode("single");
    setActiveTab("basic");
    setShowModal(true);
  };

  const openBulkModal = () => {
    setForm({ ...SIP_ACCOUNT_INITIAL_FORM });
    setEditIndex(null);
    setBulkForm({
      startExtension: "",
      createNumber: "",
      passwordMode: "random",
      fixedPassword: "",
      passwordPrefix: "",
    });
    setFormMode("bulk");
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setShowPassword(false);
    setValidationErrors({});
    setFormMode("single");
    setActiveTab("basic");
  };

  // ── Save (single) ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      showMessage("error", Object.values(errors)[0]);
      setValidationErrors(errors);
      return;
    }
    try {
      const { fetchSipIpTrunkAccounts } =
        await import("../../../api/apiService");
      const ipTrunkRes = await fetchSipIpTrunkAccounts();
      if (ipTrunkRes?.response && Array.isArray(ipTrunkRes.message)) {
        if (
          ipTrunkRes.message.some(
            (item) => String(item.extension) === String(form.extension),
          )
        ) {
          showMessage(
            "error",
            "This extension already exists in SIP To SIP Account. Choose a different extension.",
          );
          return;
        }
      }
    } catch (e) {
      console.warn(
        "Extension duplication check (SIP To SIP) failed:",
        e?.message,
      );
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const apiData = transformUiToApi(form);
      if (
        editIndex === null &&
        (!apiData.user_password || !String(apiData.user_password).trim())
      ) {
        apiData.user_password = "pass" + apiData.extension;
      }
      const response =
        editIndex !== null
          ? await updateSipAccount(apiData)
          : await createSipAccount(apiData);
      if (response.response) {
        showMessage(
          "success",
          response.message ||
            (editIndex !== null
              ? "Account updated successfully"
              : "Account created successfully"),
        );
        await new Promise((r) => setTimeout(r, 300));
        await loadAccounts();
        setShowModal(false);
        setEditIndex(null);
      } else if (response.limit_exceeded) {
        showMessage(
          "error",
          `Maximum extension limit (${response.limit}) reached. Please upgrade your license.`,
        );
      } else {
        showMessage(
          "error",
          editIndex !== null
            ? "Failed to update account"
            : response.message || "Failed to create account",
        );
      }
    } catch (error) {
      showMessage(
        "error",
        error.message === "Network Error"
          ? "Network error. Please check your connection."
          : error.message || "Failed to save account",
      );
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // ── Bulk save ─────────────────────────────────────────────────────────────
  const handleBulkSave = async () => {
    const start = parseInt(bulkForm.startExtension, 10);
    const count = parseInt(bulkForm.createNumber, 10);
    if (Number.isNaN(start) || start <= 0) {
      showMessage("error", "Start Extension must be a positive number");
      return;
    }
    if (Number.isNaN(count) || count <= 0) {
      showMessage("error", "Create Number must be a positive number");
      return;
    }
    if (bulkForm.passwordMode === "fixed") {
      if (!bulkForm.fixedPassword.trim()) {
        showMessage("error", "Please enter Fixed Registration Password");
        return;
      }
      const pe = validatePassword(bulkForm.fixedPassword);
      if (pe) {
        showMessage("error", pe);
        return;
      }
    }
    if (bulkForm.passwordMode === "prefix" && !bulkForm.passwordPrefix.trim()) {
      showMessage("error", "Please enter Prefix for Registration Password");
      return;
    }
    const defaultContext = form.context || accounts[0]?.context || "sip1";
    const defaultCodecs =
      form.allow_codecs || accounts[0]?.allow_codecs || "ulaw,alaw";
    const singleApiData = transformUiToApi({
      ...form,
      extension: String(start || 0),
      context: defaultContext,
      allow_codecs: defaultCodecs,
      password: "",
    });
    const {
      extension: _ext,
      password: _pwd,
      name: _name,
      ...commonSettings
    } = singleApiData;
    const existingExts = new Set(accounts.map((a) => String(a.extension)));
    const desiredExts = [];
    let candidate = start;
    while (desiredExts.length < count) {
      if (!existingExts.has(String(candidate)))
        desiredExts.push(String(candidate));
      candidate += 1;
      if (candidate - start > count + 200) break;
    }
    if (desiredExts.length === 0) {
      showMessage(
        "error",
        "No new extensions to create. All requested numbers already exist.",
      );
      return;
    }
    const nums = desiredExts.map(Number).sort((a, b) => a - b);
    const ranges = [];
    let rs = nums[0],
      prev = nums[0],
      rc = 1;
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === prev + 1) {
        rc++;
      } else {
        ranges.push({ start: rs, count: rc });
        rs = nums[i];
        rc = 1;
      }
      prev = nums[i];
    }
    ranges.push({ start: rs, count: rc });
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      for (const r of ranges) {
        const payload = {
          start_extension: String(r.start),
          create_number: r.count,
          reg_password_mode: bulkForm.passwordMode,
          reg_password_value:
            bulkForm.passwordMode === "fixed"
              ? bulkForm.fixedPassword
              : bulkForm.passwordMode === "prefix"
                ? bulkForm.passwordPrefix
                : undefined,
          ...commonSettings,
        };
        const response = await bulkCreateSipAccounts(payload);
        if (!response || !response.response) {
          if (response?.limit_exceeded) {
            throw new Error(
              `Maximum extension limit (${response.limit}) reached. Please upgrade your license.`,
            );
          }
          throw new Error(response?.message || "Bulk add failed");
        }
      }
      showMessage(
        "success",
        `Created ${desiredExts.length} SIP account(s) starting from ${start}.`,
      );
      await loadAccounts();
      handleCloseModal();
    } catch (err) {
      showMessage("error", err.message || "Bulk add failed");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // ── Delete / ClearAll ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selected.length) {
      showMessage("error", "Please select accounts to delete");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} account(s)?`,
      )
    )
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const results = await Promise.allSettled(
        selected.map((idx) =>
          deleteSipAccount(accounts[idx].extension, accounts[idx].context),
        ),
      );
      const ok = results.filter(
        (r) => r.status === "fulfilled" && r.value.response,
      ).length;
      const bad = results.length - ok;
      if (ok) showMessage("success", `${ok} account(s) deleted successfully`);
      if (bad) showMessage("error", `Failed to delete ${bad} account(s)`);
      setSelected([]);
      await loadAccounts();
    } catch (error) {
      showMessage("error", error.message || "Failed to delete accounts");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      showMessage("error", "Please select a CSV file to import");
      return;
    }
    setImportLoading(true);
    try {
      const csv = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(importFile);
      });
      const res = await importSipAccountsCsv({
        csv,
        mode: "skip",
        dryRun: false,
      });
      if (res?.response) {
        showMessage(
          "success",
          `Import complete — Created: ${res.created_count ?? 0}, Skipped: ${(res.skipped_validation_rows ?? 0) + (res.skipped_existing ?? 0)}`,
        );
        await loadAccounts(true);
        setShowImportModal(false);
        setImportFile(null);
      } else {
        showMessage("error", res?.error || "Import failed");
      }
    } catch (e) {
      showMessage("error", e?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { blob, filename } = await exportSipAccountsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showMessage("error", e?.message || "Export failed");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
        {/* ── Error / success banner ── */}
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

        <PbxBreadcrumb section="Extensions" current="Extensions" />

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>

            {/* Right: search + buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {/* Search */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: C.cardBg,
                  border: `1px solid ${searchFocused ? C.accent : C.cardBorder}`,
                  borderRadius: 10,
                  padding: "5px 12px",
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  boxShadow: searchFocused
                    ? "0 0 0 3px rgba(62,84,117,0.10)"
                    : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: searchFocused ? C.accent : C.mutedText,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search extension, context, status..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: C.valueText,
                    outline: "none",
                    width: 240,
                    minWidth: 180,
                  }}
                />
                {searchQuery && (
                  <span
                    onClick={() => setSearchQuery("")}
                    style={{
                      fontSize: 11,
                      color: C.mutedText,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </span>
                )}
              </div>

              <Btn
                onClick={handleDelete}
                disabled={loading.delete || !selected.length}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>

              <Btn
                onClick={() => {
                  setShowImportModal(true);
                  setImportFile(null);
                }}
                disabled={loading.fetch}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                ⬇ Import
              </Btn>

              <Btn
                onClick={handleExport}
                disabled={loading.fetch}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                ⬆ Export
              </Btn>
              <Btn
                onClick={openBulkModal}
                disabled={loading.fetch || loading.save}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                + Bulk Add
              </Btn>

              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                variant="primary"
                style={sipPcmPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <TableListLoading />
          ) : accounts.length === 0 && !searchQuery.trim() ? (
            <TableListEmptyState
              message="No extensions found."
              onAddNew={() => handleOpenModal()}
            />
          ) : (
            <>
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    tableLayout: "auto",
                    minWidth: 900,
                  }}
                >
                  <thead>
                    <tr>
                      {/* Select-all checkbox */}
                      <TH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={allPageSelected}
                          indeterminate={somePageSelected}
                          onChange={handleToggleAll}
                          sx={extensionTableCheckboxSx}
                        />
                      </TH>
                      <TH
                        style={{
                          width: 36,
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        ID
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        Extension
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        Context
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        Codecs
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        Password
                      </TH>
                      <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                        Status
                      </TH>
                      <TH
                        style={{
                          width: 70,
                          borderRight: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        Modify
                      </TH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAccounts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            textAlign: "center",
                            padding: "36px 0",
                            color: C.mutedText,
                            fontSize: 13,
                          }}
                        >
                          {`No results for "${searchQuery}"`}
                        </td>
                      </tr>
                    ) : (
                      pagedAccounts.map((item, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const rowBg = isSelected
                          ? "#eff6ff"
                          : idx % 2 === 1
                            ? "#f8fafc"
                            : "#ffffff";
                        const ss = statusStyle(item.status);
                        const isLastRow = idx === pagedAccounts.length - 1;
                        const lastRowCellStyle = isLastRow
                          ? { borderBottom: "none" }
                          : {};

                        return (
                          <tr
                            key={realIdx}
                            style={{
                              background: rowBg,
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = "#f8fafc";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = rowBg;
                            }}
                          >
                            {/* Checkbox */}
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                width: 36,
                                borderLeft: "none",
                                ...lastRowCellStyle,
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => handleToggleRow(realIdx)}
                                disabled={loading.delete}
                                sx={extensionTableCheckboxSx}
                              />
                            </td>

                            {/* Row number */}
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                fontWeight: 400,
                                ...lastRowCellStyle,
                              }}
                            >
                              {realIdx + 1}
                            </td>

                            {/* Extension */}
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                fontWeight: 400,
                                ...lastRowCellStyle,
                              }}
                            >
                              {item.extension || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            {/* Context */}
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                fontWeight: 400,
                                ...lastRowCellStyle,
                              }}
                            >
                              {item.context || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            {/* Codecs */}
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                fontWeight: 400,
                                ...lastRowCellStyle,
                              }}
                            >
                              {item.allow_codecs || (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            {/* Password (masked) */}
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                fontWeight: 400,
                                ...lastRowCellStyle,
                              }}
                            >
                              {"•".repeat(
                                Math.min(item.password?.length || 0, 10),
                              )}
                            </td>

                            {/* Status pill */}
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                ...lastRowCellStyle,
                              }}
                            >
                              {item.status ? (
                                <Pill
                                  text={item.status}
                                  bg={ss.bg}
                                  color={ss.color}
                                />
                              ) : (
                                <span style={{ color: C.mutedText }}>—</span>
                              )}
                            </td>

                            {/* Edit */}
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                borderRight: "none",
                                ...lastRowCellStyle,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <EditDocumentIcon
                                  titleAccess="Edit"
                                  onClick={() => {
                                    if (!loading.delete)
                                      handleOpenModal(item, realIdx);
                                  }}
                                  style={{
                                    cursor: loading.delete
                                      ? "not-allowed"
                                      : "pointer",
                                    color: "#2563eb",
                                    fontSize: 22,
                                    opacity: loading.delete ? 0.4 : 0.7,
                                    transition: "opacity 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!loading.delete)
                                      e.currentTarget.style.opacity = "1";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!loading.delete)
                                      e.currentTarget.style.opacity = "0.7";
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredAccounts.length > 0 && (
                <SipPcmPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={pagedAccounts.length}
                  recordLabel="extension"
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          IMPORT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={showImportModal}
        onClose={() => {
          if (!importLoading) {
            setShowImportModal(false);
            setImportFile(null);
          }
        }}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 420,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            py: 1.5,
          }}
        >
          Import Extensions
        </DialogTitle>
        <DialogContent
          style={{ backgroundColor: C.pageBg, padding: "20px 24px 12px" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingTop: 4,
            }}
          >
            <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
              Select a CSV or JSON file containing extension data to import.
            </p>
            <div
              onClick={() => importFileRef.current?.click()}
              style={{
                border: "2px dashed #9ca3af",
                borderRadius: 8,
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.15s",
                background: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.accent;
                e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#9ca3af";
                e.currentTarget.style.background = "#fff";
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: importFile ? "#15803d" : "#64748b",
                  fontWeight: importFile ? 600 : 400,
                }}
              >
                {importFile
                  ? importFile.name
                  : "Click to choose file (CSV / JSON)"}
              </span>
              <input
                ref={importFileRef}
                type="file"
                accept=".csv,.json"
                style={{ display: "none" }}
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: "#dde0e4",
            justifyContent: "center",
            gap: 16,
            padding: "12px 24px 16px",
          }}
        >
          <Btn
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            variant="primary"
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {importLoading && (
              <CircularProgress size={11} style={{ color: "#fff" }} />
            )}
            Import
          </Btn>
          <Btn
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
            }}
            disabled={importLoading}
            variant="cancel"
            style={pbxModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          ADD / EDIT / BULK MODAL  (same tab structure, CDR-styled shell)
        ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={showModal}
        onClose={() => {
          if (loading.save) return;
          handleCloseModal();
        }}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            pt: 8,
          },
        }}
        PaperProps={{
          sx: {
            width: 760,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          {formMode === "bulk"
            ? "Bulk Add Extensions"
            : editIndex !== null
              ? "Edit Extension"
              : "Add Extension"}
        </DialogTitle>
        <PbxModalTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "basic", label: "BASIC" },
            { id: "features", label: "FEATURES" },
            { id: "advanced", label: "ADVANCED" },
          ]}
        />

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          {/* Tab content container matching PcmPstnPage styling */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            {/* ── BASIC TAB ── */}
            {activeTab === "basic" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                <SectionCard title="General" isFirst>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 32px",
                    }}
                  >
                    {formMode === "single" ? (
                      <FieldRow
                        label="Extension:"
                        error={validationErrors.extension}
                      >
                        <TextField
                          type="text"
                          value={form.extension || ""}
                          onChange={(e) =>
                            handleChange("extension", e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors.extension}
                          placeholder="e.g. 1001"
                          disabled={editIndex !== null}
                          inputProps={{
                            style: {
                              fontSize: 13,
                              height: 32,
                              padding: "0 8px",
                              boxSizing: "border-box",
                            },
                          }}
                          sx={modalTextFieldSx}
                        />
                        {validationErrors.extension && (
                          <ErrMsg>{validationErrors.extension}</ErrMsg>
                        )}
                      </FieldRow>
                    ) : (
                      <>
                        <FieldRow label="Start Extension:">
                          <TextField
                            type="number"
                            value={bulkForm.startExtension}
                            onChange={(e) =>
                              setBulkForm((p) => ({
                                ...p,
                                startExtension: e.target.value,
                              }))
                            }
                            size="small"
                            fullWidth
                            variant="outlined"
                            inputProps={{
                              style: {
                                fontSize: 13,
                                height: 32,
                                padding: "0 8px",
                                boxSizing: "border-box",
                              },
                            }}
                            sx={modalTextFieldSx}
                          />
                        </FieldRow>
                        <FieldRow label="Create Number:">
                          <TextField
                            type="number"
                            value={bulkForm.createNumber}
                            onChange={(e) =>
                              setBulkForm((p) => ({
                                ...p,
                                createNumber: e.target.value,
                              }))
                            }
                            size="small"
                            fullWidth
                            variant="outlined"
                            inputProps={{
                              style: {
                                fontSize: 13,
                                height: 32,
                                padding: "0 8px",
                                boxSizing: "border-box",
                              },
                            }}
                            sx={modalTextFieldSx}
                          />
                        </FieldRow>
                        <FieldRow label="Reg Password:">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            <FormControl size="small" fullWidth>
                              <MuiSelect
                                value={bulkForm.passwordMode}
                                onChange={(e) =>
                                  setBulkForm((p) => ({
                                    ...p,
                                    passwordMode: e.target.value,
                                  }))
                                }
                                sx={modalSelectSx}
                              >
                                <MenuItem value="random">Random</MenuItem>
                                <MenuItem value="fixed">Fixed</MenuItem>
                                <MenuItem value="prefix">
                                  Prefix + Extension
                                </MenuItem>
                              </MuiSelect>
                            </FormControl>
                            {bulkForm.passwordMode === "fixed" && (
                              <TextField
                                type="text"
                                value={bulkForm.fixedPassword}
                                onChange={(e) =>
                                  setBulkForm((p) => ({
                                    ...p,
                                    fixedPassword: e.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="Fixed password"
                                inputProps={{
                                  style: {
                                    fontSize: 13,
                                    height: 32,
                                    padding: "0 8px",
                                    boxSizing: "border-box",
                                  },
                                }}
                                sx={modalTextFieldSx}
                              />
                            )}
                            {bulkForm.passwordMode === "prefix" && (
                              <TextField
                                type="text"
                                value={bulkForm.passwordPrefix}
                                onChange={(e) =>
                                  setBulkForm((p) => ({
                                    ...p,
                                    passwordPrefix: e.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="e.g. pw_"
                                inputProps={{
                                  style: {
                                    fontSize: 13,
                                    height: 32,
                                    padding: "0 8px",
                                    boxSizing: "border-box",
                                  },
                                }}
                                sx={modalTextFieldSx}
                              />
                            )}
                          </div>
                        </FieldRow>
                      </>
                    )}

                    <FieldRow label="Context:">
                      <FormControl
                        fullWidth
                        size="small"
                        error={!!validationErrors.context}
                      >
                        <MuiSelect
                          value={form.context || ""}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("context", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="" disabled>
                            <em>Select Context</em>
                          </MenuItem>
                          {Array.from(
                            { length: 10 },
                            (_, i) => `sip${i + 1}`,
                          ).map((ctx, i) => (
                            <MenuItem key={ctx} value={ctx}>
                              Sip {i + 1}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                      {validationErrors.context && (
                        <ErrMsg>{validationErrors.context}</ErrMsg>
                      )}
                    </FieldRow>

                    {formMode === "single" && (
                      <FieldRow label="Password:">
                        <TextField
                          type={showPassword ? "text" : "password"}
                          value={form.password || ""}
                          onChange={(e) =>
                            handleChange("password", e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors.password}
                          placeholder="Enter password"
                          inputProps={{
                            style: {
                              fontSize: 13,
                              height: 32,
                              padding: "0 8px",
                              boxSizing: "border-box",
                            },
                          }}
                          sx={modalTextFieldSx}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  size="small"
                                  sx={{ padding: "2px" }}
                                >
                                  {showPassword ? (
                                    <VisibilityOff fontSize="small" />
                                  ) : (
                                    <Visibility fontSize="small" />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {validationErrors.password && (
                          <ErrMsg>{validationErrors.password}</ErrMsg>
                        )}
                      </FieldRow>
                    )}

                    <FieldRow label="Max Registrations:">
                      <TextField
                        type="number"
                        value={form.max_registrations || ""}
                        onChange={(e) =>
                          handleChange("max_registrations", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <FieldRow label="Allow Codecs:" wide>
                        <FormGroup
                          row
                          sx={{
                            gap: 0.5,
                            flexWrap: "nowrap",
                            width: "100%",
                            justifyContent: "flex-start",
                          }}
                        >
                          {CODEC_OPTIONS.map((codec) => (
                            <FormControlLabel
                              key={codec.value}
                              control={
                                <Checkbox
                                  checked={isCodecSelected(codec.value)}
                                  onChange={(e) =>
                                    handleCodecChange(
                                      codec.value,
                                      e.target.checked,
                                    )
                                  }
                                  size="small"
                                  sx={{
                                    padding: "9px 4px",
                                    "& .MuiSvgIcon-root": { fontSize: 15 },
                                  }}
                                />
                              }
                              label={codec.label}
                              sx={{
                                margin: 0,
                                flexShrink: 0,
                                "& .MuiFormControlLabel-label": {
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "#374151",
                                },
                              }}
                            />
                          ))}
                        </FormGroup>
                        {validationErrors.allow_codecs && (
                          <ErrMsg>{validationErrors.allow_codecs}</ErrMsg>
                        )}
                      </FieldRow>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="User Info">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="Name:">
                      <TextField
                        type="text"
                        value={form.user_name || ""}
                        onChange={(e) =>
                          handleChange("user_name", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="User Password:">
                      <TextField
                        type="password"
                        value={form.user_password || ""}
                        onChange={(e) =>
                          handleChange("user_password", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Email:">
                      <TextField
                        type="email"
                        value={form.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Mobile Number:">
                      <TextField
                        type="text"
                        value={form.mobile_number || ""}
                        onChange={(e) =>
                          handleChange("mobile_number", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        placeholder="+91XXXXXXXXXX"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── FEATURES TAB ── */}
            {activeTab === "features" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                {/* Voicemail */}
                <SectionCard title="Voicemail" isFirst>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="Voicemail Enabled:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_enabled || "no"}
                          onChange={(e) =>
                            handleChange("voicemail_enabled", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Voicemail Keep Local:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_keep_local || "yes"}
                          onChange={(e) =>
                            handleChange("voicemail_keep_local", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Voicemail File:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_file || "audio_file_attachment"}
                          onChange={(e) =>
                            handleChange("voicemail_file", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="audio_file_attachment">
                            Audio File Attachment
                          </MenuItem>
                          <MenuItem value="download_link">
                            Download Link
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Voicemail Password:">
                      <TextField
                        type="password"
                        value={form.voicemail_password || ""}
                        onChange={(e) =>
                          handleChange("voicemail_password", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Select Voice:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.voicemail_voice || "system_default"}
                          onChange={(e) =>
                            handleChange("voicemail_voice", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="system_default">
                            System Default
                          </MenuItem>
                          <MenuItem value="blank">Blank</MenuItem>
                          <MenuItem value="busy">Busy</MenuItem>
                          <MenuItem value="welcome">Welcome</MenuItem>
                          <MenuItem value="none">None</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Call Forwarding */}
                <SectionCard title="Call Forwarding">
                  {[
                    { key: "always", label: "Always" },
                    { key: "busy", label: "On Busy" },
                    { key: "no_answer", label: "No Answer" },
                    { key: "not_registered", label: "Not Registered" },
                  ].map((rule) => {
                    const cfRuleEnabled =
                      (form[`cf_${rule.key}_enabled`] || "disabled") ===
                      "enabled";
                    const cfFieldSx = gatedModalFieldSx(cfRuleEnabled);

                    return (
                      <div
                        key={rule.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                          paddingBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            minWidth: 100,
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.labelText,
                          }}
                        >
                          {rule.label}
                        </span>
                        <RadioGroup
                          row
                          value={form[`cf_${rule.key}_enabled`] || "disabled"}
                          onChange={(e) =>
                            handleChange(
                              `cf_${rule.key}_enabled`,
                              e.target.value,
                            )
                          }
                          sx={{ flexWrap: "nowrap" }}
                        >
                          <FormControlLabel
                            value="disabled"
                            control={<Radio size="small" />}
                            label="Disabled"
                            sx={{
                              mr: 1.5,
                              whiteSpace: "nowrap",
                              "& .MuiFormControlLabel-label": { fontSize: 12 },
                            }}
                          />
                          <FormControlLabel
                            value="enabled"
                            control={<Radio size="small" />}
                            label="Enabled"
                            sx={{
                              mr: 0,
                              whiteSpace: "nowrap",
                              "& .MuiFormControlLabel-label": { fontSize: 12 },
                            }}
                          />
                        </RadioGroup>
                        <FormControl
                          size="small"
                          disabled={!cfRuleEnabled}
                          sx={{ minWidth: 150 }}
                        >
                          <MuiSelect
                            value={form[`cf_${rule.key}_number`] || ""}
                            displayEmpty
                            disabled={!cfRuleEnabled}
                            onChange={(e) =>
                              handleChange(
                                `cf_${rule.key}_number`,
                                e.target.value,
                              )
                            }
                            sx={cfFieldSx}
                          >
                            <MenuItem value="">
                              <em>Destination Number</em>
                            </MenuItem>
                            {extensionOptions.map((ext) => (
                              <MenuItem key={ext} value={ext}>
                                {ext}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#374151",
                          }}
                        >
                          Time Condition
                        </span>
                        <FormControl
                          size="small"
                          disabled={!cfRuleEnabled}
                          sx={{ minWidth: 90 }}
                        >
                          <MuiSelect
                            value={form[`cf_${rule.key}_time`] || "all"}
                            disabled={!cfRuleEnabled}
                            onChange={(e) =>
                              handleChange(
                                `cf_${rule.key}_time`,
                                e.target.value,
                              )
                            }
                            sx={cfFieldSx}
                          >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="work_time">Work Time</MenuItem>
                            <MenuItem value="holiday">Holiday</MenuItem>
                            <MenuItem value="custom">Custom</MenuItem>
                          </MuiSelect>
                        </FormControl>
                      </div>
                    );
                  })}
                </SectionCard>

                {/* Follow Me */}
                <SectionCard title="Follow Me">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        minWidth: 140,
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      Follow Me
                    </span>
                    <RadioGroup
                      row
                      value={form.follow_me_enabled || "disabled"}
                      onChange={(e) =>
                        handleChange("follow_me_enabled", e.target.value)
                      }
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <FormControlLabel
                        value="disabled"
                        control={<Radio size="small" />}
                        label="Disabled"
                        sx={{
                          mr: 1.5,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                      <FormControlLabel
                        value="enabled"
                        control={<Radio size="small" />}
                        label="Enabled"
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                    </RadioGroup>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      Time Condition
                    </span>
                    <FormControl
                      size="small"
                      disabled={form.follow_me_enabled !== "enabled"}
                      sx={{ minWidth: 90 }}
                    >
                      <MuiSelect
                        value={form.follow_me_time || "all"}
                        disabled={form.follow_me_enabled !== "enabled"}
                        onChange={(e) =>
                          handleChange("follow_me_time", e.target.value)
                        }
                        sx={gatedModalFieldSx(
                          form.follow_me_enabled === "enabled",
                        )}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="work_time">Work Time</MenuItem>
                        <MenuItem value="holiday">Holiday</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>
                  {form.follow_me_enabled === "enabled" && (
                    <div
                      style={{
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 6,
                        padding: 8,
                        background: "#fafbfc",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.labelText,
                          }}
                        >
                          Destinations
                        </span>
                        <button
                          onClick={handleAddFollowMeEntry}
                          style={{
                            width: 22,
                            height: 22,
                            border: `1px solid ${C.cardBorder}`,
                            borderRadius: 4,
                            background: "#f1f5f9",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1,
                            color: C.labelText,
                          }}
                        >
                          +
                        </button>
                      </div>
                      {(form.follow_me_entries?.length
                        ? form.follow_me_entries
                        : [
                            {
                              destinationType: "",
                              timeout: 30,
                              confirm: "unconfirm",
                            },
                          ]
                      ).map((entry, idx) => (
                        <div
                          key={idx}
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <MuiSelect
                              value={entry?.destinationType || ""}
                              displayEmpty
                              onChange={(e) =>
                                handleFollowMeEntryChange(
                                  idx,
                                  "destinationType",
                                  e.target.value,
                                )
                              }
                              sx={modalSelectSx}
                            >
                              <MenuItem value="">
                                <em>Select extension</em>
                              </MenuItem>
                              {extensionOptions.map((ext) => (
                                <MenuItem key={ext} value={ext}>
                                  {ext}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                          <FormControl size="small" sx={{ minWidth: 80 }}>
                            <MuiSelect
                              value={entry?.timeout ?? 30}
                              onChange={(e) =>
                                handleFollowMeEntryChange(
                                  idx,
                                  "timeout",
                                  Number(e.target.value),
                                )
                              }
                              sx={modalSelectSx}
                            >
                              {FOLLOW_ME_TIMEOUT_OPTIONS.map((v) => (
                                <MenuItem key={v} value={v}>
                                  {v}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                          <FormControl size="small" sx={{ minWidth: 110 }}>
                            <MuiSelect
                              value={entry?.confirm || "unconfirm"}
                              onChange={(e) =>
                                handleFollowMeEntryChange(
                                  idx,
                                  "confirm",
                                  e.target.value,
                                )
                              }
                              sx={modalSelectSx}
                            >
                              <MenuItem value="confirm">Confirm</MenuItem>
                              <MenuItem value="unconfirm">UnConfirm</MenuItem>
                            </MuiSelect>
                          </FormControl>
                        </div>
                      ))}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.labelText,
                            minWidth: 140,
                          }}
                        >
                          Timeout Destination
                        </span>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <MuiSelect
                            value={form.follow_me_timeout_destination || ""}
                            displayEmpty
                            onChange={(e) =>
                              handleChange(
                                "follow_me_timeout_destination",
                                e.target.value,
                              )
                            }
                            sx={modalSelectSx}
                          >
                            <MenuItem value="">
                              <em>Select destination</em>
                            </MenuItem>
                            {FOLLOW_ME_DESTINATION_TYPES.map((l) => (
                              <MenuItem key={l} value={l}>
                                {l}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Do Not Disturb */}
                <SectionCard title="Do Not Disturb">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        minWidth: 140,
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      Do Not Disturb
                    </span>
                    <RadioGroup
                      row
                      value={form.dnd_enabled || "disabled"}
                      onChange={(e) =>
                        handleChange("dnd_enabled", e.target.value)
                      }
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <FormControlLabel
                        value="disabled"
                        control={<Radio size="small" />}
                        label="Disabled"
                        sx={{
                          mr: 1.5,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                      <FormControlLabel
                        value="enabled"
                        control={<Radio size="small" />}
                        label="Enabled"
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                    </RadioGroup>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      Time Condition
                    </span>
                    <FormControl
                      size="small"
                      disabled={form.dnd_enabled !== "enabled"}
                      sx={{ minWidth: 90 }}
                    >
                      <MuiSelect
                        value={form.dnd_time || "all"}
                        disabled={form.dnd_enabled !== "enabled"}
                        onChange={(e) =>
                          handleChange("dnd_time", e.target.value)
                        }
                        sx={gatedModalFieldSx(form.dnd_enabled === "enabled")}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="work_time">Work Time</MenuItem>
                        <MenuItem value="holiday">Holiday</MenuItem>
                        <MenuItem value="custom">Custom</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>
                  {form.dnd_enabled === "enabled" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.labelText,
                          }}
                        >
                          Special Numbers
                        </span>
                        <button
                          onClick={handleAddDndNumber}
                          style={{
                            width: 22,
                            height: 22,
                            border: `1px solid ${C.cardBorder}`,
                            borderRadius: 4,
                            background: "#f1f5f9",
                            cursor: "pointer",
                            fontSize: 14,
                            lineHeight: 1,
                            color: C.labelText,
                          }}
                        >
                          +
                        </button>
                      </div>
                      {(form.dnd_special_numbers?.length
                        ? form.dnd_special_numbers
                        : [""]
                      ).map((val, idx) => (
                        <FormControl
                          key={idx}
                          size="small"
                          sx={{ maxWidth: 260 }}
                        >
                          <MuiSelect
                            value={val || ""}
                            displayEmpty
                            onChange={(e) =>
                              handleDndNumberChange(idx, e.target.value)
                            }
                            sx={modalSelectSx}
                          >
                            <MenuItem value="">
                              <em>Select extension</em>
                            </MenuItem>
                            {extensionOptions.map((ext) => (
                              <MenuItem key={ext} value={ext}>
                                {ext}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      ))}
                    </div>
                  )}
                </SectionCard>

                {/* Mobility Extension */}
                <SectionCard title="Mobility Extension">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 32px",
                      paddingTop: 4,
                    }}
                  >
                    <FieldRow
                      label="Enable Mobility Extension:"
                      labelWidth={200}
                    >
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.enable_mobility_extension || "no"}
                          onChange={(e) =>
                            handleChange(
                              "enable_mobility_extension",
                              e.target.value,
                            )
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Prefix">
                      <TextField
                        type="text"
                        value={form.mobility_prefix || ""}
                        disabled={form.enable_mobility_extension !== "yes"}
                        onChange={(e) =>
                          handleChange("mobility_prefix", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={gatedModalFieldSx(
                          form.enable_mobility_extension === "yes",
                          modalTextFieldSx,
                          "text",
                        )}
                      />
                    </FieldRow>
                    <FieldRow label="Ring Simultaneously:" labelWidth={200}>
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.ring_simultaneously || "no"}
                          onChange={(e) =>
                            handleChange("ring_simultaneously", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Timeout">
                      <FormControl
                        fullWidth
                        size="small"
                        disabled={form.ring_simultaneously !== "yes"}
                      >
                        <MuiSelect
                          value={Number(form.mobility_timeout || 30)}
                          disabled={form.ring_simultaneously !== "yes"}
                          onChange={(e) =>
                            handleChange(
                              "mobility_timeout",
                              Number(e.target.value),
                            )
                          }
                          sx={gatedModalFieldSx(
                            form.ring_simultaneously === "yes",
                          )}
                        >
                          {FOLLOW_ME_TIMEOUT_OPTIONS.map((v) => (
                            <MenuItem key={v} value={v}>
                              {v}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Secretary Service */}
                <SectionCard title="Secretary Service">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      paddingBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        minWidth: 140,
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      Secretary Service
                    </span>
                    <RadioGroup
                      row
                      value={form.secretary_service || "disabled"}
                      onChange={(e) =>
                        handleChange("secretary_service", e.target.value)
                      }
                      sx={{ flexWrap: "nowrap" }}
                    >
                      <FormControlLabel
                        value="disabled"
                        control={<Radio size="small" />}
                        label="Disabled"
                        sx={{
                          mr: 1.5,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                      <FormControlLabel
                        value="enabled"
                        control={<Radio size="small" />}
                        label="Enabled"
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": { fontSize: 12 },
                        }}
                      />
                    </RadioGroup>
                  </div>
                  {form.secretary_service === "enabled" && (
                    <FieldRow label="Secretary Number:">
                      <FormControl sx={{ maxWidth: 260 }} size="small">
                        <MuiSelect
                          value={form.secretary_extension || ""}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("secretary_extension", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="">
                            <em>Select extension</em>
                          </MenuItem>
                          {["ss1", "ss2", ...extensionOptions].map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  )}
                </SectionCard>

                {/* Monitor */}
                <SectionCard title="Monitor">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="Allow Being Monitored:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.monitor_allow || "disable"}
                          onChange={(e) =>
                            handleChange("monitor_allow", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable_all">Enable All</MenuItem>
                          <MenuItem value="extensions">Extensions</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Monitor Mode:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.monitor_mode || "none"}
                          onChange={(e) =>
                            handleChange("monitor_mode", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="none">None</MenuItem>
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="listen">Listen</MenuItem>
                          <MenuItem value="whisper">Whisper</MenuItem>
                          <MenuItem value="barge_in">Barge-in</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                  {form.monitor_allow === "extensions" && (
                    <MonitorDualListbox
                      available={extensionOptions.filter(
                        (e) =>
                          !(form.monitor_allowed_extensions || []).includes(e),
                      )}
                      selected={form.monitor_allowed_extensions || []}
                      onChange={(newSelected) =>
                        handleChange("monitor_allowed_extensions", newSelected)
                      }
                    />
                  )}
                </SectionCard>
              </div>
            )}

            {/* ── ADVANCED TAB ── */}
            {activeTab === "advanced" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                {/* RTP Settings */}
                <SectionCard title="RTP Settings" isFirst>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="Enable SRTP:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.enable_srtp || "no"}
                          onChange={(e) =>
                            handleChange("enable_srtp", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="SIP Bypass Media:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.sip_bypass_media || "proxy_media"}
                          onChange={(e) =>
                            handleChange("sip_bypass_media", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="proxy_media">Proxy Media</MenuItem>
                          <MenuItem value="bypass_media">Bypass Media</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Call Settings */}
                <SectionCard title="Call Settings">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="Call Timeout (s):">
                      <TextField
                        type="number"
                        value={form.call_timeout ?? 30}
                        onChange={(e) =>
                          handleChange("call_timeout", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Max Call Duration (s):">
                      <TextField
                        type="number"
                        value={form.max_call_duration ?? 6000}
                        onChange={(e) =>
                          handleChange("max_call_duration", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Outbound Restriction:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.outbound_restriction || "disable"}
                          onChange={(e) =>
                            handleChange("outbound_restriction", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable">Enable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Max Call Permission:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={
                            form.admin_call_permission || "international_call"
                          }
                          onChange={(e) =>
                            handleChange(
                              "admin_call_permission",
                              e.target.value,
                            )
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="no_call">No Call</MenuItem>
                          <MenuItem value="internal_call">
                            Internal Call
                          </MenuItem>
                          <MenuItem value="local_call">Local Call</MenuItem>
                          <MenuItem value="long_distance_call">
                            Long-Distance Call
                          </MenuItem>
                          <MenuItem value="international_call">
                            International Call
                          </MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Extension Trunk:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.extension_trunk || "disable"}
                          onChange={(e) =>
                            handleChange("extension_trunk", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable">Enable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Used Call Permission:">
                      <div
                        style={{
                          fontSize: 13,
                          color: "#475569",
                          padding: "6px 8px",
                          background: "#f1f5f9",
                          borderRadius: 4,
                          border: `1px solid ${C.cardBorder}`,
                        }}
                      >
                        {{
                          no_call: "No Call",
                          internal_call: "Internal Call",
                          local_call: "Local Call",
                          long_distance_call: "Long-Distance Call",
                        }[form.call_permission] || "International Call"}
                      </div>
                    </FieldRow>
                    <FieldRow label="Dynamic Lock Pin:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.dynamic_lock_pin || "default"}
                          onChange={(e) =>
                            handleChange("dynamic_lock_pin", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="default">Default</MenuItem>
                          {form.dynamic_lock_pin === "user_password" && (
                            <MenuItem value="user_password">
                              User Password
                            </MenuItem>
                          )}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Diversion:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.diversion || "yes"}
                          onChange={(e) =>
                            handleChange("diversion", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                    <FieldRow label="Call Prohibition:">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.call_prohibition || "disable"}
                          onChange={(e) =>
                            handleChange("call_prohibition", e.target.value)
                          }
                          sx={modalSelectSx}
                        >
                          <MenuItem value="disable">Disable</MenuItem>
                          <MenuItem value="enable">Enable</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </SectionCard>

                {/* Other Settings */}
                <SectionCard title="Other Settings">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="RX Volume:">
                      <TextField
                        type="number"
                        value={form.rx_volume ?? 0}
                        onChange={(e) =>
                          handleChange("rx_volume", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="TX Volume:">
                      <TextField
                        type="number"
                        value={form.tx_volume ?? 0}
                        onChange={(e) =>
                          handleChange("tx_volume", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        inputProps={{
                          style: {
                            fontSize: 13,
                            height: 32,
                            padding: "0 8px",
                            boxSizing: "border-box",
                          },
                        }}
                        sx={modalTextFieldSx}
                      />
                    </FieldRow>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            onClick={formMode === "single" ? handleSave : handleBulkSave}
            disabled={loading.save}
            variant="primary"
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={pbxModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// ── Small helper components (inline, no extra file needed) ────────────────────
const MonitorDualListbox = ({ available, selected, onChange }) => {
  const [leftSel, setLeftSel] = React.useState([]);
  const [rightSel, setRightSel] = React.useState([]);

  const addSelected = () => {
    if (!leftSel.length) return;
    onChange([...selected, ...leftSel.filter((e) => !selected.includes(e))]);
    setLeftSel([]);
  };
  const addAll = () => {
    onChange([...selected, ...available]);
    setLeftSel([]);
  };
  const removeSelected = () => {
    if (!rightSel.length) return;
    onChange(selected.filter((e) => !rightSel.includes(e)));
    setRightSel([]);
  };
  const removeAll = () => {
    onChange([]);
    setRightSel([]);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 48px 1fr",
        gap: 12,
        alignItems: "start",
        marginTop: 12,
      }}
    >
      <div>
        <div style={pbxDualListLabelStyle}>Available</div>
        <select
          multiple
          value={leftSel}
          onChange={(e) =>
            setLeftSel(Array.from(e.target.selectedOptions, (o) => o.value))
          }
          style={pbxDualListSelectStyle}
        >
          {available.length === 0 ? (
            <option disabled>No extensions available</option>
          ) : (
            available.map((ext) => (
              <option key={ext} value={ext}>
                {ext}
              </option>
            ))
          )}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: pbxDualListSelectStyle.height,
          paddingTop: MONITOR_DUAL_LIST_LABEL_OFFSET,
          boxSizing: "content-box",
        }}
      >
        <PbxDualListBtn onClick={addSelected}>&gt;</PbxDualListBtn>
        <PbxDualListBtn onClick={addAll}>&gt;&gt;</PbxDualListBtn>
        <PbxDualListBtn onClick={removeSelected}>&lt;</PbxDualListBtn>
        <PbxDualListBtn onClick={removeAll}>&lt;&lt;</PbxDualListBtn>
      </div>

      <div>
        <div style={pbxDualListLabelStyle}>Selected</div>
        <select
          multiple
          value={rightSel}
          onChange={(e) =>
            setRightSel(Array.from(e.target.selectedOptions, (o) => o.value))
          }
          style={pbxDualListSelectStyle}
        >
          {selected.length === 0 ? (
            <option disabled>No selected extensions</option>
          ) : (
            selected.map((ext) => (
              <option key={ext} value={ext}>
                {ext}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};

const FieldRow = ({ label, children, wide = false, labelWidth = 130 }) => (
  <div
    style={{
      display: "flex",
      alignItems: wide ? "flex-start" : "center",
      gap: 12,
      width: "100%",
    }}
  >
    <label
      style={{
        fontSize: 13,
        color: C.labelText,
        fontWeight: 600,
        whiteSpace: "nowrap",
        textAlign: "left",
        width: labelWidth,
        flexShrink: 0,
        paddingTop: wide ? 4 : 0,
      }}
    >
      {label}
    </label>
    <div
      style={{
        flex: 1,
        minWidth: 0,
        width: "100%",
      }}
    >
      {children}
    </div>
  </div>
);

const ErrMsg = ({ children }) => (
  <div style={{ color: "#dc2626", fontSize: 11, marginTop: 2 }}>{children}</div>
);

const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <PbxModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

export default SipAccountPage;
