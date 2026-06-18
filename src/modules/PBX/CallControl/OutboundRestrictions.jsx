import React, { useEffect, useMemo, useRef, useState } from "react";
import { listIvrDestinations } from "../../../api/apiService";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
} from "@mui/material";
import axiosInstance from "../../../api/axiosInstance";
import { listOutboundRouteExtensions } from "../../../api/apiService";

const ENABLE_OPTIONS = ["Yes", "No"];
const PBX_COMPACT_MQ = "(max-width: 768px)";

// ── Outbound Restriction API (local — does not modify apiService) ─────────────
const orPost = async (payload) => {
  try {
    const response = await axiosInstance.post("/outbound-restriction", payload);
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      throw new Error("Network Error");
    }
    throw error.response?.data || { message: "Server unavailable" };
  }
};

const listOutboundRestrictions = () => orPost({ type: "list" });
const createOutboundRestriction = (data) => orPost({ type: "create", ...data });
const updateOutboundRestriction = (id, data) =>
  orPost({ type: "update", id: Number(id), ...data });
const deleteOutboundRestriction = (id) =>
  orPost({ type: "delete", id: Number(id) });

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DIALOG_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const btnVariantCls = {
  default: BTN_OUTLINE,
  primary: BTN_PRIMARY,
  accent: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  dialogPrimary: BTN_DIALOG_PRIMARY,
  dialogCancel: BTN_DIALOG_CANCEL,
  danger: `${BTN_BASE} bg-[#dc2626] text-white border-[0.5px] border-[#dc2626] hover:bg-[#b91c1c]`,
  outline: BTN_OUTLINE,
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
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

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
        top: -12,
        left: 0,
        background: "#f5f7fa", // ya modal ka background color
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

const outboundRestrictionDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#3E5475",
  textAlign: "center",
  marginBottom: 8,
};

const outboundRestrictionDualListSelectStyle = {
  width: "340px",
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

const OUTBOUND_RESTRICTION_DUAL_LIST_BTN =
  "box-border m-0 block h-[36px] w-full cursor-pointer border border-[#6b7280] bg-[#d9dde3] p-0 text-center text-[14px] leading-none text-[#111827] hover:bg-[#c5cbd3]";

const OutboundRestrictionDualListBtn = ({
  onClick,
  title,
  children,
  reorder = false,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`${OUTBOUND_RESTRICTION_DUAL_LIST_BTN} ${reorder ? "font-normal" : "font-semibold"}`}
  >
    {children}
  </button>
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

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
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

const modalTextFieldFullSx = {
  ...muiTextFieldSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    minHeight: 32,
    height: 32,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "5px 8px",
    fontSize: 13,
    boxSizing: "border-box",
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

const outboundRestrictionModalPaperSx = {
  width: 900,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const OUTBOUND_RESTRICTION_DIALOG_TITLE =
  "!m-0 !box-border !flex-[0_0_auto] bg-[#1e2d42] !text-[#ffffff] ![font-family:Roboto,Helvetica,Arial,sans-serif] ![font-size:16px] ![font-weight:700] ![line-height:1.6] ![letter-spacing:0.0075em] !text-center ![padding:14px_24px] ![border-top-left-radius:8px] ![border-top-right-radius:8px]";

const outboundRestrictionModalActionsCls =
  "!flex !justify-center !gap-[16px] ![padding:16px_24px] bg-[#f8fafc] border-t border-[#9CA3AF] rounded-b-[8px]";

const OUTBOUND_RESTRICTION_MENU_ITEM_SX = { fontSize: 13 };

const OUTBOUND_RESTRICTION_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const OUTBOUND_RESTRICTION_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-t-[10px]";
const OUTBOUND_RESTRICTION_TOOLBAR_COMPACT = "flex-col items-stretch gap-[10px]";
const OUTBOUND_RESTRICTION_TOOLBAR_LEFT =
  "ml-auto flex min-w-0 flex-wrap items-center gap-[8px]";
const OUTBOUND_RESTRICTION_TOOLBAR_ACTIONS =
  "flex flex-wrap items-center gap-[8px]";
const OUTBOUND_RESTRICTION_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[#3E5475]";
const OUTBOUND_RESTRICTION_PAGE_BADGE =
  "rounded-[6px] border border-[#9CA3AF] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[#3E5475]";
const OUTBOUND_RESTRICTION_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-b-[10px]";

const OutboundRestrictionPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  className = "",
}) => (
  <div className={`${OUTBOUND_RESTRICTION_PAGINATION} ${className}`.trim()}>
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
      <span className={OUTBOUND_RESTRICTION_PAGE_BADGE}>
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
        minWidth: labelWidth,
        width: "auto",
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

const toUiYesNo = (value, defaultValue = "No") => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "yes") return "Yes";
    if (normalized === "no") return "No";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return defaultValue;
};

const toApiYesNo = (value, defaultValue = "no") => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "yes") return "yes";
  if (normalized === "no") return "no";
  return defaultValue;
};

const mapRestrictionFromApi = (item) => ({
  id: item?.id,
  name: String(item?.name || ""),
  timeLimit: String(
    item?.time_limit ?? item?.timeLimit ?? item?.time_limit_sec ?? "",
  ),
  callsLimit: String(
    item?.calls_limit ??
      item?.number_of_calls_limit ??
      item?.callsLimit ??
      item?.call_limit ??
      "",
  ),
  autoCancelRestriction: toUiYesNo(
    item?.auto_cancel_restriction ?? item?.auto_cancel ?? item?.autoCancel,
    "No",
  ),
  memberExtensions: Array.isArray(item?.member_extensions)
    ? item.member_extensions.map(String)
    : Array.isArray(item?.extensions)
      ? item.extensions.map(String)
      : [],
  enabled: toUiYesNo(item?.enabled ?? item?.enable, "Yes"),
});

const yesNoCellStyle = (value) => ({
  color: value === "Yes" ? "#16a34a" : "#475569",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

const OutboundRestrictions = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    extensions: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedExtensionsRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [callsLimit, setCallsLimit] = useState("");
  const [autoCancelRestriction, setAutoCancelRestriction] = useState("No");
  const [enabled, setEnabled] = useState("Yes");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);

  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const showAlert = (text) => showMessage("error", text);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((row) => {
      const extStr = (row.memberExtensions || []).join(" ").toLowerCase();
      return (
        (row.name || "").toLowerCase().includes(q) ||
        (row.timeLimit || "").toLowerCase().includes(q) ||
        (row.callsLimit || "").toLowerCase().includes(q) ||
        (row.autoCancelRestriction || "").toLowerCase().includes(q) ||
        (row.enabled || "").toLowerCase().includes(q) ||
        extStr.includes(q)
      );
    });
  }, [rows, searchQuery]);
  const loadDestinations = async () => {
    try {
      const data = await listIvrDestinations();

      const msg = data?.message || {};

      const mapped = (msg.Extensions || []).map((item) => ({
        extension: String(item?.value ?? "").trim(),
        label: String(item?.label ?? "").trim(),
      }));

      setAvailableExtensions(mapped);
    } catch (err) {
      console.error(err);
    }
  };
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(filteredRows.length / itemsPerPage)),
      ),
    );
  }, [filteredRows.length]);

  const fetchRestrictions = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listOutboundRestrictions();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load outbound restrictions.");
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.message)
        ? res.message
        : res?.message
          ? [res.message]
          : [];
      setRows(list.map(mapRestrictionFromApi));
    } catch (err) {
      showAlert(err?.message || "Failed to load outbound restrictions.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await listOutboundRouteExtensions();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = list
        .map((item) => ({
          extension: String(item?.extension ?? item?.id ?? "").trim(),
          label: String(
            item?.label ?? item?.name ?? item?.extension ?? item?.id ?? "",
          ).trim(),
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
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  useEffect(() => {
    fetchRestrictions();
    loadDestinations();
  }, []);

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) =>
      map.set(item.extension, item.label || item.extension),
    );
    return map;
  }, [availableExtensions]);

  const getExtensionLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const resetForm = () => {
    setEditId(null);
    setName("");
    setTimeLimit("");
    setCallsLimit("");
    setAutoCancelRestriction("No");
    setEnabled("Yes");
    setMemberExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    // if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setTimeLimit(row.timeLimit || "");
    setCallsLimit(row.callsLimit || "");
    setAutoCancelRestriction(row.autoCancelRestriction || "No");
    setEnabled(row.enabled || "Yes");
    setMemberExtensions(
      Array.isArray(row.memberExtensions) ? row.memberExtensions : [],
    );
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    // if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const availableList = useMemo(
    () =>
      availableExtensions.filter(
        (item) => !memberExtensions.includes(item.extension),
      ),
    [availableExtensions, memberExtensions],
  );

  const addSelectedExtensions = () => {
    if (availableSelected.length === 0) return;
    setMemberExtensions((prev) => [
      ...prev,
      ...availableSelected.filter((ext) => !prev.includes(ext)),
    ]);
    setAvailableSelected([]);
  };

  const addAllExtensions = () => {
    setMemberExtensions(availableExtensions.map((item) => item.extension));
    setAvailableSelected([]);
  };

  const removeSelectedExtensions = () => {
    if (chosenSelected.length === 0) return;
    setMemberExtensions((prev) =>
      prev.filter((ext) => !chosenSelected.includes(ext)),
    );
    setChosenSelected([]);
  };

  const removeAllExtensions = () => {
    setMemberExtensions([]);
    setChosenSelected([]);
  };

  const moveExtToBottom = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };

  const moveExtUp = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) => {
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

  const moveExtDown = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) => {
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

  const moveExtToTop = () => {
    if (!chosenSelected.length) return;
    setMemberExtensions((prev) => {
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
    if (allPageSelected) {
      setSelected((prev) => prev.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIndices])));
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} record(s)?`,
      )
    ) {
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected
        .map((idx) => filteredRows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteOutboundRestriction(id)),
      );
      const failed = results.find((res) => !res?.response);
      if (failed) {
        showAlert(failed?.message || "Failed to delete one or more records.");
      } else {
        showMessage("success", "Outbound restriction(s) deleted successfully.");
      }
      await fetchRestrictions();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || "Failed to delete record(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showAlert("Name is required.");
      return;
    }
    if (memberExtensions.length === 0) {
      showAlert("Please select at least one member extension.");
      return;
    }

    const apiPayload = {
      name: trimmedName,
      time_limit: timeLimit.trim(),
      calls_limit: callsLimit.trim(),
      auto_cancel_restriction: toApiYesNo(autoCancelRestriction),
      member_extensions: [...memberExtensions],
      enabled: toApiYesNo(enabled, "yes"),
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response =
        editId != null
          ? await updateOutboundRestriction(editId, apiPayload)
          : await createOutboundRestriction(apiPayload);
      if (!response?.response) {
        showAlert(response?.message || "Failed to save outbound restriction.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Outbound restriction updated successfully."
          : "Outbound restriction created successfully.",
      );
      await fetchRestrictions();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save outbound restriction.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const dataEmpty = !isInitialLoad && rows.length === 0;
  const searchEmpty =
    !isInitialLoad && rows.length > 0 && filteredRows.length === 0;

  return (
    <div
      className={`box-border min-h-[calc(100vh-80px)] bg-[#f8fafc] ${isCompact ? "p-[8px]" : "p-[16px]"}`}
    >
      <div className="mx-auto w-full max-w-full">
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

        <PbxBreadcrumb section="Call Control" current="Outbound Restrictions" />

        <div className={OUTBOUND_RESTRICTION_CARD}>
          <div
            className={`${OUTBOUND_RESTRICTION_TOOLBAR} ${isCompact ? OUTBOUND_RESTRICTION_TOOLBAR_COMPACT : ""}`.trim()}
          >
            <div className={OUTBOUND_RESTRICTION_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={OUTBOUND_RESTRICTION_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className={OUTBOUND_RESTRICTION_TOOLBAR_ACTIONS}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save}
                variant="primary"
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <TableListLoading />
            ) : dataEmpty ? (
              <TableListEmptyState
                message="No outbound restrictions found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchEmpty ? (
              <TableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900,
                  ...(isCompact ? { minWidth: 720 } : {}),
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
                        disabled={loading.delete}
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
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Time Limit
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Number of Calls Limit
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Auto Cancel Restriction
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Extensions
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
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
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowBg = isSelected
                      ? "#eff6ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    return (
                      <tr
                        key={row.id ?? realIdx}
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
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={checkboxSx}
                          />
                        </td>
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
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.timeLimit || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.callsLimit || (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={yesNoCellStyle(row.autoCancelRestriction)}
                          >
                            {row.autoCancelRestriction}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 400,
                            whiteSpace: "normal",
                            wordBreak: "break-all",
                            ...lastRowCellStyle,
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
                            ...lastRowCellStyle,
                          }}
                        >
                          <span style={yesNoCellStyle(row.enabled)}>
                            {row.enabled}
                          </span>
                        </td>
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
                              onClick={() => handleOpenEditModal(row)}
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
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && filteredRows.length > 0 && (
            <OutboundRestrictionPagination
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
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: {
            ...outboundRestrictionModalPaperSx,
            mt: 16,
            alignSelf: "flex-start",
          },
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle className={OUTBOUND_RESTRICTION_DIALOG_TITLE}>
          {editId != null
            ? "Edit Outbound Restriction"
            : "Add Outbound Restriction"}
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "#ffffff" }}
        >
          <div
            style={{
              background: "#f5f7fa",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 6,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                gap: 14,
              }}
            >
              <FieldRow label="Name *">
                <TextField
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    ...modalTextFieldFullSx,
                    width: "95%",
                    ml: 0.9,
                  }}
                />
              </FieldRow>
              <FieldRow label="Time Limit *">
                <TextField
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  placeholder="e.g. 30 min"
                  sx={{
                    ...modalTextFieldFullSx,
                    width: "95%",
                    ml: 1.9, // 8px left margin
                  }}
                />
              </FieldRow>
              <FieldRow label="Number of Calls Limit *">
                <TextField
                  value={callsLimit}
                  onChange={(e) => setCallsLimit(e.target.value)}
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    ...modalTextFieldFullSx,
                    width: "95%",
                    ml: 0.9,
                  }}
                />
              </FieldRow>
              <FieldRow label="Auto Cancel Restriction *">
                <FormControl size="small" fullWidth>
                  <Select
                    value={autoCancelRestriction}
                    onChange={(e) => setAutoCancelRestriction(e.target.value)}
                    sx={modalSelectSx}
                  >
                    {ENABLE_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o} sx={OUTBOUND_RESTRICTION_MENU_ITEM_SX}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FieldRow>
              <FieldRow label="Enabled *">
                <FormControl size="small" fullWidth>
                  <Select
                    value={enabled}
                    onChange={(e) => setEnabled(e.target.value)}
                    sx={{
                      ...modalTextFieldFullSx,
                      width: "95%",
                      ml: 0.9,
                    }}
                  >
                    {ENABLE_OPTIONS.map((o) => (
                      <MenuItem key={o} value={o} sx={OUTBOUND_RESTRICTION_MENU_ITEM_SX}>
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
                  gridTemplateColumns: isCompact
                    ? "1fr"
                    : "340px 48px 340px 48px",
                  gap: 12,
                }}
              >
                <div>
                  <div style={outboundRestrictionDualListLabelStyle}>Available</div>
                  <select
                    multiple
                    size={6}
                    value={availableSelected}
                    onChange={(e) =>
                      setAvailableSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={outboundRestrictionDualListSelectStyle}
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
                {!isCompact && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingTop: 28,
                    }}
                  >
                    <OutboundRestrictionDualListBtn onClick={addSelectedExtensions}>
                      &gt;
                    </OutboundRestrictionDualListBtn>
                    <OutboundRestrictionDualListBtn onClick={addAllExtensions}>
                      &gt;&gt;
                    </OutboundRestrictionDualListBtn>
                    <OutboundRestrictionDualListBtn onClick={removeSelectedExtensions}>
                      &lt;
                    </OutboundRestrictionDualListBtn>
                    <OutboundRestrictionDualListBtn onClick={removeAllExtensions}>
                      &lt;&lt;
                    </OutboundRestrictionDualListBtn>
                  </div>
                )}
                <div>
                  <div style={outboundRestrictionDualListLabelStyle}>Selected</div>
                  <select
                    multiple
                    size={6}
                    value={chosenSelected}
                    onChange={(e) =>
                      setChosenSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={outboundRestrictionDualListSelectStyle}
                  >
                    {memberExtensions.length === 0 ? (
                      <option disabled value="">
                        No selected extensions
                      </option>
                    ) : (
                      memberExtensions.map((ext) => (
                        <option key={ext} value={ext}>
                          {getExtensionLabel(ext)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {!isCompact && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingTop: 28,
                    }}
                  >
                    <OutboundRestrictionDualListBtn
                      reorder
                      title="Move to bottom"
                      onClick={moveExtToBottom}
                    >
                      vv
                    </OutboundRestrictionDualListBtn>
                    <OutboundRestrictionDualListBtn reorder title="Move up" onClick={moveExtUp}>
                      ^
                    </OutboundRestrictionDualListBtn>
                    <OutboundRestrictionDualListBtn
                      reorder
                      title="Move down"
                      onClick={moveExtDown}
                    >
                      v
                    </OutboundRestrictionDualListBtn>
                    <OutboundRestrictionDualListBtn
                      reorder
                      title="Move to top"
                      onClick={moveExtToTop}
                    >
                      ^^
                    </OutboundRestrictionDualListBtn>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions className={outboundRestrictionModalActionsCls}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="dialogPrimary"
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} sx={{ color: "#fff" }} />{" "}
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="dialogCancel"
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OutboundRestrictions;
