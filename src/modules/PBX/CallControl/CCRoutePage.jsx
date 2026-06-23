import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {Alert,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select, useMediaQuery } from "@mui/material";
import {
  createCCRoute,
  deleteCCRoute,
  fetchCCRouteExtensions,
  fetchCCRoutes,
  updateCCRoute,
} from "../../../api/apiService";
const PBX_COMPACT_MQ = "(max-width: 768px)";

// ── Constants ─────────────────────────────────────────────────────────────────
const CC_INTERVAL_OPTIONS = [
  { value: "10", label: "10s" },
  { value: "30", label: "30s" },
  { value: "60", label: "1 min" },
  { value: "120", label: "2 min" },
  { value: "300", label: "5 min" },
];
const CC_INTERVAL_VALUE_SET = new Set(CC_INTERVAL_OPTIONS.map((o) => o.value));
const getCcIntervalLabel = (value) => {
  const found = CC_INTERVAL_OPTIONS.find((o) => o.value === String(value));
  return found ? found.label : `${value}s`;
};
const THROUGH_OPTIONS = ["Auto", "From Come In"];
const RECORD_KEEP_OPTIONS = [
  "8 hours",
  "16 hours",
  "1 day",
  "2 day",
  "3 day",
  "1 week",
  "2 week",
  "3 week",
  "4 week",
];
const ENABLE_OPTIONS = ["Yes", "No"];
const KEEP_MINUTES_TO_LABEL = {
  480: "8 hours",
  960: "16 hours",
  1440: "1 day",
  2880: "2 day",
  4320: "3 day",
  10080: "1 week",
  20160: "2 week",
  30240: "3 week",
  40320: "4 week",
};

// ── Normalization Helpers ─────────────────────────────────────────────────────
function normalizeThroughFromApi(value) {
  const mode = String(value || "").toLowerCase();
  return mode === "from_come_in" || mode === "from come in"
    ? "From Come In"
    : "Auto";
}
function normalizeEnabledFromApi(value) {
  return value === true || String(value || "").toLowerCase() === "yes"
    ? "Yes"
    : "No";
}
function normalizeRecordKeepTime(route) {
  if (route?.record_keep_time) return String(route.record_keep_time);
  const minutes = Number(route?.keep_minutes);
  return KEEP_MINUTES_TO_LABEL[minutes] || "8 hours";
}
function normalizeRoute(item) {
  const rawInterval = Number(item.interval_minutes ?? item.cc_interval_time);
  const normalizedInterval =
    Number.isFinite(rawInterval) && rawInterval > 0
      ? rawInterval <= 5
        ? rawInterval * 60
        : rawInterval
      : 10;
  const ccIntervalTime = CC_INTERVAL_VALUE_SET.has(String(normalizedInterval))
    ? String(normalizedInterval)
    : "10";
  return {
    id: item.id,
    ccIntervalTime,
    through: normalizeThroughFromApi(item.through_mode ?? item.through),
    recordKeepTime: normalizeRecordKeepTime(item),
    enabled: normalizeEnabledFromApi(item.enabled ?? item.enable),
    memberExtensions: Array.isArray(item.extensions)
      ? item.extensions.map(String)
      : [],
  };
}

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[28px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DIALOG_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";
const btnVariantCls = {
  default: BTN_OUTLINE,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  dialogPrimary: BTN_DIALOG_PRIMARY,
  dialogCancel: BTN_DIALOG_CANCEL,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
  outline: `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`,
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
      className="text-[13px] font-semibold text-[var(--text-label)]"
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

const PBX_LIST_TRUNCATE_THRESHOLD = 10;
const PBX_LIST_DISPLAY_LIMIT = 6;

const formatPbxItemListDisplay = (
  items,
  {
    threshold = PBX_LIST_TRUNCATE_THRESHOLD,
    limit = PBX_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) {
    return labels.join(separator);
  }
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

const PBX_MODAL_SECTION_BG = "var(--bg-main)";
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

const pbxDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-primary)",
  textAlign: "center",
  marginBottom: 8,
};

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "var(--bg-surface)",
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
  backgroundColor: "var(--bg-surface)",
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

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "var(--bg-surface)",
  },
};

const ccRouteModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const DIALOG_TITLE =
  "!m-0 !box-border !flex-[0_0_auto] bg-[#1e2d42] !text-[#ffffff] ![font-family:Roboto,Helvetica,Arial,sans-serif] ![font-size:16px] ![font-weight:600] ![line-height:1.6] ![letter-spacing:0.0075em] !text-center ![padding:16px_24px] ![border-top-left-radius:8px] ![border-top-right-radius:8px]";

const ccRouteModalActionsCls =
  "!flex !justify-center !gap-[16px] ![padding:16px_24px] bg-[var(--bg-main)] border-t border-[var(--border-strong)] rounded-b-[8px]";

const MENU_ITEM_SX = { fontSize: 13 };

const CC_ROUTE_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const CC_ROUTE_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[10px]";
const CC_ROUTE_TOOLBAR_COMPACT = "flex-col items-stretch gap-[10px]";
const CC_ROUTE_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const CC_ROUTE_TOOLBAR_ACTIONS = "flex items-center gap-[8px]";
const CC_ROUTE_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const CC_ROUTE_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const CC_ROUTE_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[10px]";

const CcRoutePagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  className = "",
}) => (
  <div className={`${CC_ROUTE_PAGINATION} ${className}`.trim()}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span className={CC_ROUTE_PAGE_BADGE}>
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

// ── Shared UI Components ──────────────────────────────────────────────────────
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
const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
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
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <PbxModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

const ccDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "var(--bg-main)",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const CC_DUAL_LIST_BTN =
  "box-border m-0 block h-[36px] w-full cursor-pointer border border-[#6b7280] bg-[#d9dde3] p-0 text-center text-[14px] leading-none text-[#111827] hover:bg-[#c5cbd3]";

const CcDualListBtn = ({ onClick, title, children, reorder = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`${CC_DUAL_LIST_BTN} ${reorder ? "font-normal" : "font-semibold"}`}
  >
    {children}
  </button>
);

// ── Main Component ────────────────────────────────────────────────────────────
const CCRoutePage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
    extensions: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedExtensionsRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [ccIntervalTime, setCcIntervalTime] = useState("10");
  const [through, setThrough] = useState("Auto");
  const [recordKeepTime, setRecordKeepTime] = useState("8 hours");
  const [enabled, setEnabled] = useState("No");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const showAlert = (text) => showMessage("error", text);

  const resetForm = () => {
    setEditId(null);
    setCcIntervalTime("10");
    setThrough("Auto");
    setRecordKeepTime("8 hours");
    setEnabled("No");
    setSelectedExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCCRoutes();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setRows(list.map(normalizeRoute));
    } catch (err) {
      showAlert(err?.message || "Failed to load CC routes.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchCCRouteExtensions();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = list
        .map((item) => ({
          extension: String(item?.extension ?? "").trim(),
          label: String(item?.label ?? item?.extension ?? "").trim(),
        }))
        .filter((item) => item.extension)
        .sort(
          (a, b) =>
            (parseInt(a.extension, 10) || 0) - (parseInt(b.extension, 10) || 0),
        );
      setAvailableExtensions(exts);
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load extensions.");
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) =>
      map.set(item.extension, item.label || item.extension),
    );
    return map;
  }, [availableExtensions]);

  const getExtensionLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setCcIntervalTime(row.ccIntervalTime);
    setThrough(row.through);
    setRecordKeepTime(row.recordKeepTime);
    setEnabled(row.enabled);
    setSelectedExtensions(
      Array.isArray(row.memberExtensions) ? row.memberExtensions : [],
    );
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (!loading.save) setShowModal(false);
  };

  const availableList = useMemo(
    () =>
      availableExtensions.filter(
        (item) => !selectedExtensions.includes(item.extension),
      ),
    [availableExtensions, selectedExtensions],
  );

  const addSelectedExtensions = () => {
    if (availableSelected.length === 0) return;
    setSelectedExtensions((prev) => [
      ...prev,
      ...availableSelected.filter((ext) => !prev.includes(ext)),
    ]);
    setAvailableSelected([]);
  };

  const addAllExtensions = () => {
    setSelectedExtensions(availableExtensions.map((item) => item.extension));
    setAvailableSelected([]);
  };

  const removeSelectedExtensions = () => {
    if (chosenSelected.length === 0) return;
    setSelectedExtensions((prev) =>
      prev.filter((ext) => !chosenSelected.includes(ext)),
    );
    setChosenSelected([]);
  };

  const removeAllExtensions = () => {
    setSelectedExtensions([]);
    setChosenSelected([]);
  };

  // ── Sorting Logic ───────────────────────────────────────────────────────────
  const moveExtensionToBottom = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };

  const moveExtensionUp = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i - 1])
        ) {
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        }
      }
      return arr;
    });
  };

  const moveExtensionDown = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i + 1])
        ) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
      }
      return arr;
    });
  };

  const moveExtensionToTop = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const handleSelectRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const pageIndices = pagedRows.map((_, i) => (page - 1) * itemsPerPage + i);
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleAll = () => {
    if (allPageSelected)
      setSelected((prev) => prev.filter((i) => !pageIndices.includes(i)));
    else setSelected((prev) => Array.from(new Set([...prev, ...pageIndices])));
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} record(s)?`,
      )
    )
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const ids = selected.map((i) => rows[i]?.id).filter(Boolean);
      await Promise.all(ids.map((id) => deleteCCRoute(id)));
      setSelected([]);
      await loadRows();
      showMessage("success", `Deleted ${ids.length} item(s).`);
    } catch (err) {
      showAlert(err?.message || "Failed to delete CC route.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    if (selectedExtensions.length === 0) {
      showAlert("Please select at least one member extension.");
      return;
    }
    const apiPayload = {
      cc_interval_time: Number(ccIntervalTime),
      through,
      record_keep_time: recordKeepTime,
      enable: enabled,
      extensions: selectedExtensions,
    };
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateCCRoute({ id: editId, ...apiPayload });
        showMessage("success", "CC route updated.");
      } else {
        await createCCRoute(apiPayload);
        showMessage("success", "CC route created.");
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save CC route.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div
      className={`box-border min-h-[calc(100vh-80px)] bg-[var(--bg-main)] ${isCompact ? "p-[8px]" : "p-[16px]"}`}
    >
      <div className="mx-auto w-full max-w-full">
        {/* ── Error / Success Floating Banner ── */}
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

        <PbxBreadcrumb section="Call Control" current="CC Route" />

        <div className={CC_ROUTE_CARD}>
          <div
            className={`${CC_ROUTE_TOOLBAR} ${isCompact ? CC_ROUTE_TOOLBAR_COMPACT : ""}`.trim()}
          >
            <div className={CC_ROUTE_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={CC_ROUTE_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className={CC_ROUTE_TOOLBAR_ACTIONS}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="cancel"
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "var(--text-secondary)" }} />
                )}{" "}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save || loading.fetch}
                variant="primary"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No CC routes found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900, ...(isCompact ? { minWidth: 720 } : {}),
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
                        onChange={handleToggleAll}
                        sx={checkboxSx}
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
                      CC Interval Time
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Through
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Record Keep Time
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enable
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Extensions
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
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "var(--row-alt)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
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
                            checked={isSelected}
                            onChange={() => handleSelectRow(realIdx)}
                            sx={checkboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {getCcIntervalLabel(row.ccIntervalTime)}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.through}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.recordKeepTime}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span style={{}}>{row.enabled}</span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.memberExtensions?.length > 0 ? (
                            <span
                              title={
                                row.memberExtensions.length >
                                PBX_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberExtensions
                                      .map(getExtensionLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatPbxItemListDisplay(row.memberExtensions, {
                                mapItem: getExtensionLabel,
                              })}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            textAlign: "center",
                            padding: "7px 8px",
                            borderRight: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                                                    <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={{
                              cursor: "pointer",
                              color: "#2563eb",
                              fontSize: 22,
                              opacity: 0.7,
                              transition: "opacity 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "0.7";
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && (
            <CcRoutePagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-start", pt: 5 } }}
        PaperProps={{ sx: ccRouteModalPaperSx }}
      >
        <DialogTitle className={DIALOG_TITLE}>
          {editId != null ? "Edit CC Route" : "Add CC Route"}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "var(--bg-surface)" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: "var(--row-alt)",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr", ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                gap: "8px 32px",
              }}
            >
              <FieldRow label="CC Interval Time *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={ccIntervalTime}
                      onChange={(e) => setCcIntervalTime(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {CC_INTERVAL_OPTIONS.map((o) => (
                        <MenuItem
                          key={o.value}
                          value={o.value}
                          sx={MENU_ITEM_SX}
                        >
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>
                <FieldRow label="Record Keep Time *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={recordKeepTime}
                      onChange={(e) => setRecordKeepTime(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {RECORD_KEEP_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={MENU_ITEM_SX}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>
                <FieldRow label="Through *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={through}
                      onChange={(e) => setThrough(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {THROUGH_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={MENU_ITEM_SX}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>
                <FieldRow label="Enable *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={modalSelectSx}
                    >
                      {ENABLE_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={MENU_ITEM_SX}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>
            </div>

            <SectionCard title="Member Extensions">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                <div>
                  <div style={pbxDualListLabelStyle}>Available</div>
                  <select
                    multiple
                    size={6}
                    value={availableSelected}
                    onChange={(e) =>
                      setAvailableSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={ccDualListSelectStyle}
                  >
                    {availableList.length === 0 ? (
                      <option disabled value="">
                        No extensions
                      </option>
                    ) : (
                      availableList.map((item) => (
                        <option key={item.extension} value={item.extension}>
                          {item.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <CcDualListBtn onClick={addSelectedExtensions}>
                    &gt;
                  </CcDualListBtn>
                  <CcDualListBtn onClick={addAllExtensions}>
                    &gt;&gt;
                  </CcDualListBtn>
                  <CcDualListBtn onClick={removeSelectedExtensions}>
                    &lt;
                  </CcDualListBtn>
                  <CcDualListBtn onClick={removeAllExtensions}>
                    &lt;&lt;
                  </CcDualListBtn>
                </div>
                <div>
                  <div style={pbxDualListLabelStyle}>Selected</div>
                  <select
                    multiple
                    size={6}
                    value={chosenSelected}
                    onChange={(e) =>
                      setChosenSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={ccDualListSelectStyle}
                  >
                    {selectedExtensions.length === 0 ? (
                      <option disabled value="">
                        No selected extensions
                      </option>
                    ) : (
                      selectedExtensions.map((ext) => (
                        <option key={ext} value={ext}>
                          {getExtensionLabel(ext)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <CcDualListBtn
                    reorder
                    title="Move to bottom"
                    onClick={moveExtensionToBottom}
                  >
                    vv
                  </CcDualListBtn>
                  <CcDualListBtn
                    reorder
                    title="Move up"
                    onClick={moveExtensionUp}
                  >
                    ^
                  </CcDualListBtn>
                  <CcDualListBtn
                    reorder
                    title="Move down"
                    onClick={moveExtensionDown}
                  >
                    v
                  </CcDualListBtn>
                  <CcDualListBtn
                    reorder
                    title="Move to top"
                    onClick={moveExtensionToTop}
                  >
                    ^^
                  </CcDualListBtn>
                </div>
              </div>
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions className={ccRouteModalActionsCls}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="dialogPrimary"
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="dialogCancel"
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CCRoutePage;
