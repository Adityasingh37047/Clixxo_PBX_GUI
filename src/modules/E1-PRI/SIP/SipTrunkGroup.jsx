import React, { useState, useEffect } from "react";
import {
  SIP_TRUNK_GROUP_FIELDS,
  SIP_TRUNK_GROUP_INITIAL_FORM,
  SIP_TRUNK_GROUP_TABLE_COLUMNS,
  SIP_TRUNK_GROUP_FIELD_TOOLTIPS,
} from "../../../constants/SipTrunkGroupConstants";
import {
  addGroup,
  listGroups,
  deleteGroup,
  listSipRegistrations,
  fetchSipIpTrunkAccounts,
  listIpPstnRoutes,
  listNumberManipulations,
} from "../../../api/apiService";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import {
  Button,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
// ── Local page UI (inlined from e1PriSharedUi)
// ── Page-local field label tooltip UI (not shared) ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const E1PriFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  errorRed: "#ef4444",
  amber: "#dc2626",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
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

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
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

const E1_PAGE = "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px]";
const E1_INNER = "w-full max-w-full mx-auto";
const E1_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const E1_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[20px]";
const E1_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const E1_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const E1_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const E1_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[20px]";
const E1_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const E1_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const modalInputProps = {
  style: { fontSize: 13, height: 32, padding: "0 8px", boxSizing: "border-box" },
};

const e1DialogTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const e1DialogContentStyle = { padding: "24px", backgroundColor: "var(--bg-surface)" };

const e1DialogFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: 20,
};

const e1DialogFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
};

const e1DialogFieldLabelStyle = {
  fontSize: 13,
  color: "var(--text-primary)",
  fontWeight: 600,
  whiteSpace: "nowrap",
  width: 170,
  lineHeight: 1.2,
  textAlign: "left",
};

const e1DialogFieldControlStyle = { width: "min(100%, 320px)" };

const e1DialogActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "var(--row-alt)",
  borderTop: "1px solid #9CA3AF",
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const e1DialogPaperSx = {
  width: 600,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const E1Breadcrumb = ({ section, current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
};

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
      color: "var(--text-muted)",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      ...style,
    }}
  >
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{current}</span>
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
        color: "var(--text-primary)",
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

const SIP_PCM_TABLE_CARD_RADIUS = 10;

const sipPcmCardStyle = {
  background: "var(--bg-surface)",
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
  background: "var(--bg-surface)",
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
  background: "var(--bg-surface)",
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
  color: "var(--text-secondary)",
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

const sipPcmCheckboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const sipPcmPageWrapStyle = pbxPageWrapStyle;
const sipPcmInnerStyle = pbxPageInnerStyle;

const SipPcmBreadcrumb = ({ current }) => (
  <PbxBreadcrumb section="SIP" current={current} />
);

const pbxModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "var(--text-secondary)",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const getGroupIdValue = (group) =>
  String(group?.group_id ?? group?.groupId ?? "").trim();

const resolveGroupIdValue = (group) => {
  const explicit = getGroupIdValue(group);
  if (explicit) return explicit;
  const recordId = group?.id;
  return recordId !== undefined && recordId !== null
    ? String(recordId).trim()
    : "";
};

const IGNORED_GROUP_REF_VALUES = new Set([
  "",
  "any",
  "Any",
  "undefined",
  "null",
]);

const SIP_ROUTE_REF_FIELDS = [
  "call_source",
  "callSource",
  "source_group",
  "source_group_id",
  "sip_trunk_group",
  "sip_trunk_group_id",
];

const SIP_MANIP_REF_FIELDS = [
  "call_initiator",
  "callInitiator",
  "callInitiatorId",
  "call_initiator_id",
  "sip_trunk_group",
  "sip_trunk_group_id",
];

const SIP_MANIPULATION_TYPES = [
  "ip_in_callerid",
  "ip_in_calleeid",
  "ip_in_oricalleeid",
];

const normalizeGroupRefValue = (value) => String(value ?? "").trim();

const matchesGroupReference = (value, groupKey) => {
  const normalized = normalizeGroupRefValue(value);
  if (IGNORED_GROUP_REF_VALUES.has(normalized)) return false;
  return normalized === groupKey;
};

const itemReferencesGroup = (item, fields, groupKey) =>
  fields.some((field) => matchesGroupReference(item?.[field], groupKey));

const getRouteList = (response) =>
  Array.isArray(response?.message)
    ? response.message
    : Array.isArray(response?.data)
      ? response.data
      : [];

const countGroupsWithSameKey = (allGroups, groupKey) =>
  allGroups.filter((g) => resolveGroupIdValue(g) === groupKey).length;

const normalizeGroupIdForApi = (value) => {
  const trimmed = String(value ?? "").trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  return trimmed;
};


const SipTrunkGroup = () => {
  const [formData, setFormData] = useState(SIP_TRUNK_GROUP_INITIAL_FORM);
  const [groups, setGroups] = useState([]);
  const [trunkIds, setTrunkIds] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const pagedGroups = groups.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const pageIndices = pagedGroups.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleTogglePageSelection = () => {
    if (allPageSelected) {
      setSelected((sel) => sel.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelected((sel) => Array.from(new Set([...sel, ...pageIndices])));
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for group_id: only alphanumeric characters, no spaces
    if (name === "group_id") {
      const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: alphanumericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Fetch SIP Trunk IDs from SIP Registration and extension numbers from SIP-to-SIP account, then build combined options
  const fetchTrunkIds = async () => {
    try {
      const [regRes, ipTrunkRes] = await Promise.all([
        listSipRegistrations(),
        fetchSipIpTrunkAccounts(),
      ]);

      // Collect trunk IDs
      const trunkIdList = Array.isArray(regRes?.message || regRes?.data)
        ? (regRes.message || regRes.data)
            .map((it) => it?.trunkId || it?.trunk_id || it?.id)
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v))
        : [];

      // Unique trunk IDs
      const uniqueTrunkIds = Array.from(new Set(trunkIdList));

      // Collect SIP-to-SIP extensions
      const extList = Array.isArray(ipTrunkRes?.message || ipTrunkRes?.data)
        ? (ipTrunkRes.message || ipTrunkRes.data)
            .map((it) => it?.extension || it?.id)
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v))
        : [];

      const uniqueExts = Array.from(new Set(extList));

      // Build combined options: trunkId/extension. Avoid duplicates.
      const combinedOptions = [];
      uniqueTrunkIds.forEach((tid) => {
        if (uniqueExts.length > 0) {
          uniqueExts.forEach((ext) => {
            combinedOptions.push({
              value: `${tid}/${ext}`,
              label: `${tid}/${ext}`,
            });
          });
        } else {
          // If no extensions exist yet, show plain trunkId option (only once)
          combinedOptions.push({ value: `${tid}`, label: `${tid}` });
        }
      });

      // Also include plain trunkId options for backward compatibility (so editing older rows works),
      // but ensure we don't add duplicates.
      uniqueTrunkIds.forEach((tid) => {
        combinedOptions.push({ value: `${tid}`, label: `${tid}` });
      });

      // Deduplicate by value (preserve first occurrence)
      const uniqueByValue = Array.from(
        new Map(combinedOptions.map((o) => [o.value, o])).values(),
      );
      setTrunkIds(uniqueByValue);
    } catch (error) {
      console.error("Error fetching SIP trunk/extension IDs:", error);
      // Leave dropdown empty rather than failing the page
      setTrunkIds([]);
    }
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listGroups();
      if (response.response && response.message) {
        // Sort groups by ID to ensure proper order
        const sortedGroups = response.message.sort((a, b) => a.id - b.id);
        setGroups(sortedGroups);
      } else {
        // If response is successful but no data, ensure groups is empty
        setGroups([]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showMessage("error", "Network error. Please check your connection.");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const handleSave = async () => {
    if (!formData.sip_trunk_id || !formData.group_id) {
      showMessage("error", "Please fill in all required fields");
      return;
    }
    const desiredGroupId = String(formData.group_id ?? "").trim();
    if (desiredGroupId === "") {
      showMessage("error", "Group ID is required.");
      return;
    }

    const editingRecord =
      editingRecordId != null
        ? groups.find((group) => String(group.id) === String(editingRecordId))
        : editIndex !== -1
          ? groups[editIndex]
          : null;
    const originalGroupId = editingRecord
      ? resolveGroupIdValue(editingRecord)
      : "";
    const groupIdUnchanged =
      editingRecord != null && desiredGroupId === originalGroupId;

    if (!groupIdUnchanged) {
      const isDuplicate = groups.some((group) => {
        if (
          editingRecordId != null &&
          String(group.id) === String(editingRecordId)
        ) {
          return false;
        }
        return resolveGroupIdValue(group) === desiredGroupId;
      });
      if (isDuplicate) {
        showMessage(
          "error",
          `Group ID "${desiredGroupId}" already exists. Please choose a different Group ID.`,
        );
        return;
      }
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const payload = {
        sip_trunk_id: String(formData.sip_trunk_id ?? "").trim(),
        group_id: normalizeGroupIdForApi(desiredGroupId),
      };
      const response =
        editingRecordId != null
          ? await addGroup({
              id: String(editingRecordId),
              ...payload,
            })
          : await addGroup(payload);
      if (response.response) {
        showMessage(
          "success",
          response.message ||
            (editingRecordId != null
              ? "Updated successfully"
              : "Saved successfully"),
        );
        setShowModal(false);
        setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
        setEditIndex(-1);
        setEditingRecordId(null);
        await fetchGroups();
      } else {
        showMessage("error", response.message || "Save failed");
      }
    } catch (error) {
      console.error("Error saving group:", error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Network error. Please check your connection.";
      showMessage("error", apiMessage);
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleAddNew = () => {
    setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
    setEditIndex(-1);
    setEditingRecordId(null);
    setShowModal(true);
  };

  // Table selection logic
  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };
  const handleInverse = () =>
    setSelected(
      pagedGroups
        .map((_, idx) => {
          const realIdx = (page - 1) * itemsPerPage + idx;
          return selected.includes(realIdx) ? null : realIdx;
        })
        .filter((i) => i !== null),
    );
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select items to delete");
      return;
    }
    if (!window.confirm("Are you sure you want to delete the selected groups?"))
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const groupsToDelete = selected
        .map((idx) => groups[idx])
        .filter(Boolean);
      let remainingGroups = [...groups];
      let deletedCount = 0;

      for (const group of groupsToDelete) {
        const reference = await isGroupReferenced(group, remainingGroups);
        if (reference.inUse) {
          showMessage(
            "error",
            `SIP Trunk Group "${resolveGroupIdValue(group)}" cannot be deleted because it is used by ${reference.reason}. Remove or update that rule first.`,
          );
          continue;
        }
        const response = await deleteGroup(group.id);
        if (response?.response === false) {
          showMessage("error", response.message || "Failed to delete group.");
          continue;
        }
        deletedCount += 1;
        remainingGroups = remainingGroups.filter((g) => g.id !== group.id);
      }
      await fetchGroups();
      setSelected([]);
      if (deletedCount > 0) {
        showMessage(
          "success",
          deletedCount === 1
            ? "SIP trunk group deleted successfully."
            : `${deletedCount} SIP trunk group(s) deleted successfully.`,
        );
      }
    } catch (error) {
      console.error("Error deleting groups:", error);
      showMessage("error", "Network error. Please check your connection.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all groups?")) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      let remainingGroups = [...groups];
      let deletedCount = 0;

      for (const group of groups) {
        const reference = await isGroupReferenced(group, remainingGroups);
        if (reference.inUse) {
          showMessage(
            "error",
            `SIP Trunk Group "${resolveGroupIdValue(group)}" cannot be deleted because it is used by ${reference.reason}. Remove or update that rule first.`,
          );
          continue;
        }
        const response = await deleteGroup(group.id);
        if (response?.response === false) {
          showMessage("error", response.message || "Failed to delete group.");
          continue;
        }
        deletedCount += 1;
        remainingGroups = remainingGroups.filter((g) => g.id !== group.id);
      }
      await fetchGroups();
      setSelected([]);
      setPage(1);
      if (deletedCount > 0) {
        showMessage(
          "success",
          deletedCount === groups.length
            ? "All SIP trunk groups deleted successfully."
            : `${deletedCount} SIP trunk group(s) deleted successfully.`,
        );
      }
    } catch (error) {
      console.error("Error clearing all groups:", error);
      showMessage("error", "Network error. Please check your connection.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handlePageChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
  };

  const handleSingleDelete = async (idx) => {
    const group = groups[idx];
    if (
      !window.confirm(
        `Are you sure you want to delete group "${group.group_id}"?`,
      )
    )
      return;
    try {
      const reference = await isGroupReferenced(group, groups);
      if (reference.inUse) {
        showMessage(
          "error",
          `SIP Trunk Group "${resolveGroupIdValue(group)}" cannot be deleted because it is used by ${reference.reason}. Remove or update that rule first.`,
        );
        return;
      }
      await deleteGroup(group.id);
      await fetchGroups();
      if (editIndex === idx) handleAddNew();
    } catch (error) {
      console.error("Error deleting group:", error);
      showMessage("error", "Network error. Please check your connection.");
    }
  };

  useEffect(() => {
    // Fetch trunk IDs and groups on component mount
    fetchTrunkIds();
    fetchGroups();
  }, []);

  // Block delete only when this is the last row for a Group ID still used in routes.
  const isGroupReferenced = async (group, allGroups = groups) => {
    const gid = resolveGroupIdValue(group);
    if (!gid) return { inUse: false };

    if (countGroupsWithSameKey(allGroups, gid) > 1) {
      return { inUse: false };
    }

    try {
      const ipToPstnRes = await listIpPstnRoutes("ip_to_pstn");
      const ipToPstnHit = getRouteList(ipToPstnRes).find((item) =>
        itemReferencesGroup(item, SIP_ROUTE_REF_FIELDS, gid),
      );
      if (ipToPstnHit) {
        return {
          inUse: true,
          reason: `IP→PSTN route${ipToPstnHit.id != null ? ` #${ipToPstnHit.id}` : ""}`,
        };
      }

      const ipToIpRes = await listIpPstnRoutes("ip_to_ip");
      const ipToIpHit = getRouteList(ipToIpRes).find((item) =>
        itemReferencesGroup(item, SIP_ROUTE_REF_FIELDS, gid),
      );
      if (ipToIpHit) {
        return {
          inUse: true,
          reason: `IP→IP route${ipToIpHit.id != null ? ` #${ipToIpHit.id}` : ""}`,
        };
      }

      for (const manipulationType of SIP_MANIPULATION_TYPES) {
        try {
          const manipRes = await listNumberManipulations(manipulationType);
          const manipHit = getRouteList(manipRes).find((item) =>
            itemReferencesGroup(item, SIP_MANIP_REF_FIELDS, gid),
          );
          if (manipHit) {
            return {
              inUse: true,
              reason: `number manipulation rule (${manipulationType.replaceAll("_", " ")})${manipHit.id != null ? ` #${manipHit.id}` : ""}`,
            };
          }
        } catch (e) {
          console.warn(
            `Number manipulation reference check failed for ${manipulationType}:`,
            e?.message,
          );
        }
      }

      return { inUse: false };
    } catch (e) {
      console.warn("Reference check failed:", e?.message);
      return { inUse: false };
    }
  };

  return (
    <div style={sipPcmPageWrapStyle}>
      {/* Toast Alert */}
      {message.text && (
        <Alert
          severity={
            message.type === "error"
              ? "error"
              : message.type === "success"
                ? "success"
                : "info"
          }
          onClose={() => setMessage({ type: "", text: "" })}
          sx={E1_TOAST_SX}
        >
          {message.text}
        </Alert>
      )}

      <div style={sipPcmInnerStyle}>
        <SipPcmBreadcrumb current="SIP Trunk Group" />

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            <div className={E1_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className={E1_TOOLBAR_LEFT}>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: C.accent }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleAddNew}
                disabled={loading.fetch}
                variant="primary"
                style={sipPcmPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {isInitialLoad ? (
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
            ) : groups.length === 0 ? (
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
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No SIP trunk groups found.
                </div>
                <Btn
                  variant="cancel"
                  onClick={handleAddNew}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New
                </Btn>
              </div>
            ) : (
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
                      onChange={handleTogglePageSelection}
                      disabled={loading.delete}
                      sx={sipPcmCheckboxSx}
                    />
                  </TH>
                  {SIP_TRUNK_GROUP_TABLE_COLUMNS.filter(
                    (c) => c.key !== "check",
                  ).map((col) => (
                    <TH key={col.key}>{col.label}</TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                  {pagedGroups.map((item, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSel = selected.includes(realIdx);
                    const isLastRow = idx === pagedGroups.length - 1;
                    const rowBg = isSel
                      ? "#eff6ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSel)
                            e.currentTarget.style.background = "var(--row-alt)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSel) e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSel}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={sipPcmCheckboxSx}
                          />
                        </td>
                        {SIP_TRUNK_GROUP_TABLE_COLUMNS.filter(
                          (c) => c.key !== "check",
                        ).map((col) => {
                          let value = item[col.key];
                          if (col.key === "index") value = realIdx + 1;
                          return (
                            <td
                              key={col.key}
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                borderBottom: isLastRow
                                  ? "none"
                                  : tdStyle.borderBottom,
                              }}
                            >
                              {value !== undefined &&
                              value !== null &&
                              value !== ""
                                ? value
                                : "--"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            )}
          </div>

          {!isInitialLoad && groups.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedGroups.length}
              onPageChange={(nextPage) =>
                setPage(Math.min(totalPages, Math.max(1, nextPage)))
              }
            />
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <Dialog
        open={showModal}
        onClose={() => !loading.save && setShowModal(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 520,
            maxWidth: "90vw",
            mx: "auto",
            p: 0,
            borderRadius: 2,
          },
        }}
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
          {editingRecordId != null ? "Edit SIP Trunk Group" : "Add SIP Trunk Group"}
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "var(--bg-surface)" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#f5f7fa",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* SIP Trunk ID */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <E1PriFieldLabel
                    tooltipKey="sip_trunk_id"
                    tooltips={SIP_TRUNK_GROUP_FIELD_TOOLTIPS}
                    style={{
                      fontSize: 13,
                      width: 120,
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  >
                    SIP Trunk ID:
                  </E1PriFieldLabel>

                  <div style={{ flex: 1 }}>
                    <Select
                      name="sip_trunk_id"
                      value={formData.sip_trunk_id}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      displayEmpty
                      variant="outlined"
                      sx={{
                        fontSize: 13,
                        backgroundColor: "var(--bg-surface)",
                        "& .MuiOutlinedInput-root": {
                          height: "auto",
                          minHeight: "unset",
                        },
                        "& .MuiSelect-select": {
                          padding: "6px 32px 6px 8px !important",
                          fontSize: 13,
                          lineHeight: 1.35,
                          minHeight: "unset !important",
                          boxSizing: "border-box",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                        Select SIP Trunk ID
                      </MenuItem>

                      {trunkIds.length === 0 ? (
                        <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                          No options
                        </MenuItem>
                      ) : (
                        trunkIds.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 13 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>
                </div>

                {/* Group ID */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <E1PriFieldLabel
                    tooltipKey="group_id"
                    tooltips={SIP_TRUNK_GROUP_FIELD_TOOLTIPS}
                    style={{
                      fontSize: 13,
                      width: 120,
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  >
                    Group ID:
                  </E1PriFieldLabel>

                  <div style={{ flex: 1 }}>
                    <TextField
                      type="text"
                      name="group_id"
                      value={formData.group_id}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter Group ID"
                      inputProps={{
                        style: {
                          fontSize: 13,
                          padding: "6px 8px",
                          backgroundColor: "var(--bg-surface)",
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
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
            onClick={handleSave}
            variant="primary"
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13, padding: "6px 28px", textTransform: "none" }}
          >
            {loading.save ? (
              <CircularProgress
                size={14}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={() => setShowModal(false)}
            variant="cancel"
            disabled={loading.save}
            style={pbxModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipTrunkGroup;
