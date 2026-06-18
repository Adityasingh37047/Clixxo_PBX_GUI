import React, { useEffect, useMemo, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
  InputAdornment,
  IconButton,
  Alert, useMediaQuery } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  createDisa,
  deleteDisa,
  getDisa,
  listDisa,
  listOutboundRoutes,
  updateDisa,
} from "../../../api/apiService";
const SECOND_DIAL_OPTIONS = ["Enable", "Disable"];
const TRANSPARENT_OPTIONS = ["Enable", "Disable"];
const ENABLE_OPTIONS = ["Yes", "No"];

const INITIAL_FORM = {
  name: "",
  responseTimeout: "10",
  digitTimeout: "5",
  secondDial: "Enable",
  transparent: "Disable",
  pinType: "None",
  pin: "",
  outboundRoutes: [],
  enabled: true,
};

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
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[36px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
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

const disaDualListSelectStyle = {
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

const DISA_DUAL_LIST_BTN =
  "box-border m-0 block h-[36px] w-full cursor-pointer border border-[#6b7280] bg-[#d9dde3] p-0 text-center text-[14px] font-semibold leading-none text-[#111827] hover:bg-[#c5cbd3]";
const DISA_DUAL_LIST_BTN_REORDER = `${DISA_DUAL_LIST_BTN} font-normal`;

const DisaDualListBtn = ({ onClick, title, children, reorder }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={reorder ? DISA_DUAL_LIST_BTN_REORDER : DISA_DUAL_LIST_BTN}
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

const PBX_COMPACT_MQ = "(max-width: 768px)";

const DISA_PAGE_WRAP =
  "bg-[#f8fafc] min-h-[calc(100vh-80px)] p-[16px] box-border";
const DISA_PAGE_INNER = "w-full max-w-full mx-auto";
const DISA_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const DISA_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-t-[10px]";
const DISA_TOOLBAR_COMPACT = "flex-col items-stretch gap-[10px]";
const DISA_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const DISA_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const DISA_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#e0f2fe] px-[12px] py-[5px] text-[11px] font-bold text-[#3E5475]";
const DISA_PAGE_BADGE =
  "rounded-[6px] border-[0.5px] border-[#9CA3AF] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[#3E5475]";
const DISA_PAGINATION =
  "flex items-center justify-between border-t border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-b-[10px]";

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

const DisaPagination = ({
  page,
  totalPages,
  recordCount,
  onPrev,
  onNext,
  disabled,
}) => (
  <div className={DISA_PAGINATION}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} record{recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex items-center gap-[8px]">
      <Btn onClick={onPrev} disabled={disabled || page <= 1} variant="outline">
        ← Prev
      </Btn>
      <span className={DISA_PAGE_BADGE}>
        Page {page} of {totalPages}
      </span>
      <Btn onClick={onNext} disabled={disabled || page >= totalPages} variant="outline">
        Next →
      </Btn>
    </div>
  </div>
);

const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 150,
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const PBX_MODAL_SECTION_BG = "#f5f7fa";
const PBX_MODAL_SECTION_HEADING_COLOR = "#30415A";

const SectionHeading = ({ title, isFirst = false, required }) => (
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
        color: "#30415A",
      }}
    >
      {title}
      {required && <span style={{ color: C.errorRed }}> *</span>}
    </span>
  </div>
);

// ── API Helpers ───────────────────────────────────────────────────────────────
const normalizeList = (raw) => {
  const list = raw?.message ?? raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
};

const asBool = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (["true", "1", "yes", "enable", "enabled"].includes(v)) return true;
    if (["false", "0", "no", "disable", "disabled"].includes(v)) return false;
  }
  return fallback;
};

const normalizePinType = (value) => {
  if (String(value || "").toLowerCase() === "single_pin") return "Single Pin";
  return "None";
};

const mapDisaFromApi = (item) => {
  const outboundIdsRaw = Array.isArray(item?.outbound_routes)
    ? item.outbound_routes
    : Array.isArray(item?.outboundRoutes)
      ? item.outboundRoutes
      : [];
  const outboundRoutes = outboundIdsRaw
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  return {
    id: item?.id,
    name: String(item?.name || ""),
    responseTimeout: String(
      item?.response_timeout ?? item?.responseTimeout ?? 10,
    ),
    digitTimeout: String(item?.digit_timeout ?? item?.digitTimeout ?? 5),
    secondDial: asBool(item?.second_dial ?? item?.secondDial, true)
      ? "Enable"
      : "Disable",
    transparent: asBool(item?.transparent, false) ? "Enable" : "Disable",
    pinType: normalizePinType(item?.pin_type ?? item?.pinType),
    pin: String(item?.pin_number ?? item?.pin ?? ""),
    outboundRoutes,
    enabled: asBool(item?.enabled, true),
  };
};

// ─────────────────────────────────────────────────────────────────────────────

const DisaPage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    get: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);

  // Search & Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  // Outbound routes state
  const [allOutboundRoutes, setAllOutboundRoutes] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const routeNameById = useMemo(() => {
    const map = new Map();
    allOutboundRoutes.forEach((route) => map.set(route.id, route.name));
    return map;
  }, [allOutboundRoutes]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const fetchRows = async () => {
    setLoading((p) => ({ ...p, list: true }));
    try {
      const res = await listDisa();
      if (!res?.response) {
        setRows([]);
        return;
      }
      setRows(normalizeList(res).map(mapDisaFromApi));
    } catch {
      setRows([]);
    } finally {
      setLoading((p) => ({ ...p, list: false }));
      setIsInitialLoad(false);
    }
  };

  const fetchOutboundRoutes = async () => {
    try {
      const res = await listOutboundRoutes();
      const list = normalizeList(res);
      const routes = list
        .map((r) => ({
          id: Number(r?.id),
          name: String(r?.name || r?.route_name || ""),
        }))
        .filter((r) => Number.isFinite(r.id) && r.name);
      setAllOutboundRoutes(routes);
    } catch {
      setAllOutboundRoutes([]);
    }
  };

  useEffect(() => {
    fetchRows();
    fetchOutboundRoutes();
  }, []);

  // ── Search & Pagination ──
  const filteredRows = rows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  useEffect(() => {
    setPage((p) =>
      Math.min(
        Math.max(1, p),
        Math.max(1, Math.ceil(filteredRows.length / itemsPerPage)),
      ),
    );
  }, [filteredRows.length]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // ── Checkbox Logic ──
  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  // ── Form Handlers ──
  const resetForm = () => {
    setEditId(null);
    setForm(INITIAL_FORM);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowPassword(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setShowModal(true);
    setAvailableSelected([]);
    setChosenSelected([]);
    setLoading((p) => ({ ...p, get: true }));
    try {
      const res = await getDisa(row.id);
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load DISA details.");
        setForm({ ...row });
        return;
      }
      const detail = Array.isArray(res?.message)
        ? res.message[0]
        : res?.message || res?.data || row;
      setForm(mapDisaFromApi(detail));
    } catch {
      setForm({ ...row });
    } finally {
      setLoading((p) => ({ ...p, get: false }));
    }
  };

  const handleCloseModal = () => {
    if (loading.save || loading.get) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((p) => ({ ...p, delete: true }));
    try {
      const ids = selected
        .map((idx) => filteredRows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(ids.map((id) => deleteDisa(id)));
      const failed = results.find((r) => !r?.response);
      if (failed) showMessage("error", failed?.message || "Failed to delete.");
      else showMessage("success", "DISA deleted successfully.");
      await fetchRows();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showMessage("error", err?.message || "Failed to delete.");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return showMessage("error", "Name is required.");

    const respTimeout = Number(form.responseTimeout);
    if (!form.responseTimeout.trim() || isNaN(respTimeout) || respTimeout < 1) {
      return showMessage("error", "Response Timeout must be 1 or greater.");
    }

    const digTimeout = Number(form.digitTimeout);
    if (!form.digitTimeout.trim() || isNaN(digTimeout) || digTimeout < 1) {
      return showMessage("error", "Digit Timeout must be 1 or greater.");
    }

    if (form.pinType === "Single Pin" && !form.pin.trim())
      return showMessage("error", "Pin number is required.");

    const payload = {
      name: form.name.trim(),
      response_timeout: respTimeout,
      digit_timeout: digTimeout,
      second_dial: form.secondDial === "Enable",
      transparent: form.transparent === "Enable",
      pin_type: form.pinType === "Single Pin" ? "single_pin" : "none",
      pin_number: form.pinType === "Single Pin" ? form.pin.trim() : "",
      outbound_routes: form.outboundRoutes,
      enabled: !!form.enabled,
    };

    setLoading((p) => ({ ...p, save: true }));
    try {
      const res =
        editId != null
          ? await updateDisa(editId, payload)
          : await createDisa(payload);
      if (!res?.response) {
        showMessage("error", res?.message || "Failed to save DISA.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "DISA updated successfully."
          : "DISA created successfully.",
      );
      await fetchRows();
      handleCloseModal();
    } catch (err) {
      showMessage("error", err?.message || "Failed to save DISA.");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  // ── Dual Listbox Computed (IDs) ──
  const availableRoutes = allOutboundRoutes.filter(
    (r) => !form.outboundRoutes.includes(r.id),
  );
  const chosenRoutes = form.outboundRoutes;

  const addSelectedToChosen = () => {
    if (!availableSelected.length) return;
    setForm((f) => ({
      ...f,
      outboundRoutes: [
        ...f.outboundRoutes,
        ...availableSelected.filter((id) => !f.outboundRoutes.includes(id)),
      ],
    }));
    setAvailableSelected([]);
  };

  const addAllToChosen = () => {
    setForm((f) => ({
      ...f,
      outboundRoutes: [
        ...f.outboundRoutes,
        ...availableRoutes.map((r) => r.id),
      ],
    }));
    setAvailableSelected([]);
  };

  const removeSelectedFromChosen = () => {
    if (!chosenSelected.length) return;
    setForm((f) => ({
      ...f,
      outboundRoutes: f.outboundRoutes.filter(
        (id) => !chosenSelected.includes(id),
      ),
    }));
    setChosenSelected([]);
  };

  const removeAllFromChosen = () => {
    setForm((f) => ({ ...f, outboundRoutes: [] }));
    setChosenSelected([]);
  };

  const moveChosenUp = () => {
    if (!chosenSelected.length) return;
    const routes = [...chosenRoutes];
    chosenSelected.forEach((id) => {
      const idx = routes.indexOf(id);
      if (idx > 0)
        [routes[idx - 1], routes[idx]] = [routes[idx], routes[idx - 1]];
    });
    setForm((f) => ({ ...f, outboundRoutes: routes }));
  };

  const moveChosenDown = () => {
    if (!chosenSelected.length) return;
    const routes = [...chosenRoutes];
    [...chosenSelected].reverse().forEach((id) => {
      const idx = routes.indexOf(id);
      if (idx < routes.length - 1)
        [routes[idx], routes[idx + 1]] = [routes[idx + 1], routes[idx]];
    });
    setForm((f) => ({ ...f, outboundRoutes: routes }));
  };

  const moveChosenTop = () => {
    if (!chosenSelected.length) return;
    const sel = chosenRoutes.filter((id) => chosenSelected.includes(id));
    const rest = chosenRoutes.filter((id) => !chosenSelected.includes(id));
    setForm((f) => ({ ...f, outboundRoutes: [...sel, ...rest] }));
  };

  const moveChosenBottom = () => {
    if (!chosenSelected.length) return;
    const sel = chosenRoutes.filter((id) => chosenSelected.includes(id));
    const rest = chosenRoutes.filter((id) => !chosenSelected.includes(id));
    setForm((f) => ({ ...f, outboundRoutes: [...rest, ...sel] }));
  };

  return (
    <div className={`${DISA_PAGE_WRAP} ${isCompact ? "p-[8px]" : ""}`.trim()}>
      <div className={DISA_PAGE_INNER}>
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

        <PbxBreadcrumb section="Call Features" current="DISA" />

        {/* Main Card */}
        <div className={DISA_CARD}>
          <div
            className={`${DISA_TOOLBAR} ${isCompact ? DISA_TOOLBAR_COMPACT : ""}`.trim()}
          >
            <div className={DISA_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={DISA_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div className={DISA_TOOLBAR_ACTIONS}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No DISA entries found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
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
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Response Timeout (s)
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Digit Timeout (s)
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Second Dial
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Transparent
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Pin Type
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Outbound Routes
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
                    const routeNames = row.outboundRoutes.map(
                      (id) => routeNameById.get(id) || `ID:${id}`,
                    );

                    return (
                      <tr
                        key={row.id || realIdx}
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
                            borderLeft: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
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
                          {row.name}
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
                          {row.responseTimeout}
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
                          {row.digitTimeout}
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
                          <span
                            style={{
                              color:
                                row.secondDial === "Enable"
                                  ? "#16a34a"
                                  : "#dc2626",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.secondDial}
                          </span>
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
                          <span
                            style={{
                              color:
                                row.transparent === "Enable"
                                  ? "#16a34a"
                                  : "#dc2626",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.transparent}
                          </span>
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
                          <span
                            style={{
                             
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {row.pinType}
                          </span>
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
                          {routeNames.slice(0, 3).join(", ")}
                          {routeNames.length > 3
                            ? ` +${routeNames.length - 3}`
                            : ""}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
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

          {/* Footer Pagination */}
          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <DisaPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPrev={handlePrev}
              onNext={handleNext}
              disabled={loading.list}
            />
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save || loading.get ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: { width: 1000, maxWidth: "98vw", mx: "auto", p: 0, borderRadius: 2 },
        }}
      >
        <DialogTitle
          style={{
            background: "rgb(30, 45, 62)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
            boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)",
          }}
        >
          {editId != null ? "Edit DISA" : "Add DISA"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "#ffffff" }}
        >
          {loading.get ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 40,
              }}
            >
              <CircularProgress size={30} style={{ color: C.accent }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "#f5f7fa",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                  padding: "20px 24px 16px",
                }}
              >
                <SectionHeading title="General Settings" isFirst />

                {/* TOP-TO-BOTTOM GRID FOR FORM FIELDS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr", ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                    gap: "16px 32px",
                  }}
                >
                  {/* ── LEFT COLUMN ── */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Name" required>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        inputProps={{
                          style: {
                            fontSize: 13,
                            padding: "6px 8px",
                            backgroundColor: "#fff",
                          },
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Response Timeout (s)" required>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.responseTimeout}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            responseTimeout: e.target.value,
                          }))
                        }
                        inputProps={{
                          min: 1,
                          style: {
                            fontSize: 13,
                            padding: "6px 8px",
                            backgroundColor: "#fff",
                          },
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Second Dial">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.secondDial}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              secondDial: e.target.value,
                            }))
                          }
                          sx={{
                            fontSize: 13,
                            backgroundColor: "#fff",
                            height: 32,
                            "& .MuiSelect-select": {
                              padding: "6px 8px",
                              display: "flex",
                              alignItems: "center",
                            },
                          }}
                        >
                          {SECOND_DIAL_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13, backgroundColor: "#fff" }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Pin Type">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 24,
                            height: 32,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 13,
                              cursor: "pointer",
                              color: C.labelText,
                            }}
                          >
                            <input
                              type="radio"
                              name="pinType"
                              value="None"
                              checked={form.pinType === "None"}
                              onChange={() =>
                                setForm((f) => ({
                                  ...f,
                                  pinType: "None",
                                  pin: "",
                                }))
                              }
                              style={{ cursor: "pointer" }}
                            />
                            None
                          </label>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 13,
                              cursor: "pointer",
                              color: C.labelText,
                            }}
                          >
                            <input
                              type="radio"
                              name="pinType"
                              value="Single Pin"
                              checked={form.pinType === "Single Pin"}
                              onChange={() =>
                                setForm((f) => ({
                                  ...f,
                                  pinType: "Single Pin",
                                }))
                              }
                              style={{ cursor: "pointer" }}
                            />
                            Single Pin
                          </label>
                        </div>
                        {form.pinType === "Single Pin" && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Enter pin number"
                              type={showPassword ? "text" : "password"}
                              value={form.pin}
                              onChange={(e) =>
                                setForm((f) => ({ ...f, pin: e.target.value }))
                              }
                              inputProps={{
                                style: {
                                  fontSize: 13,
                                  padding: "6px 8px",
                                  backgroundColor: "#fff",
                                },
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        setShowPassword(!showPassword)
                                      }
                                    >
                                      {showPassword ? (
                                        <VisibilityOff sx={{ fontSize: 16 }} />
                                      ) : (
                                        <Visibility sx={{ fontSize: 16 }} />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </FieldRow>
                  </div>

                  {/* ── RIGHT COLUMN ── */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Digit Timeout (s)" required>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={form.digitTimeout}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            digitTimeout: e.target.value,
                          }))
                        }
                        inputProps={{
                          min: 1,
                          style: {
                            fontSize: 13,
                            padding: "6px 8px",
                            backgroundColor: "#fff",
                          },
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Transparent">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.transparent}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              transparent: e.target.value,
                            }))
                          }
                          sx={{
                            fontSize: 13,
                            backgroundColor: "#fff",
                            height: 32,
                            "& .MuiSelect-select": {
                              padding: "6px 8px",
                              display: "flex",
                              alignItems: "center",
                            },
                          }}
                        >
                          {TRANSPARENT_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Enabled">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.enabled ? "Yes" : "No"}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              enabled: e.target.value === "Yes",
                            }))
                          }
                          sx={{
                            fontSize: 13,
                            backgroundColor: "#fff",
                            height: 32,
                            "& .MuiSelect-select": {
                              padding: "6px 8px",
                              display: "flex",
                              alignItems: "center",
                            },
                          }}
                        >
                          {ENABLE_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </div>

                <SectionHeading title="Outbound Routes" />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 48px 1fr 48px",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#3e5475",
                        textAlign: "center",
                        marginBottom: 8,
                      }}
                    >
                      Available Routes
                    </div>
                    <select
                      multiple
                      value={availableSelected.map(String)}
                      onChange={(e) =>
                        setAvailableSelected(
                          Array.from(e.target.selectedOptions, (opt) =>
                            Number(opt.value),
                          ).filter((n) => Number.isFinite(n)),
                        )
                      }
                      style={disaDualListSelectStyle}
                    >
                      {availableRoutes.length === 0 ? (
                        <option disabled>No routes available</option>
                      ) : (
                        availableRoutes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
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
                      paddingTop: 24,
                    }}
                  >
                    <DisaDualListBtn onClick={addSelectedToChosen}>
                      &gt;
                    </DisaDualListBtn>
                    <DisaDualListBtn onClick={addAllToChosen}>
                      &gt;&gt;
                    </DisaDualListBtn>
                    <DisaDualListBtn onClick={removeSelectedFromChosen}>
                      &lt;
                    </DisaDualListBtn>
                    <DisaDualListBtn onClick={removeAllFromChosen}>
                      &lt;&lt;
                    </DisaDualListBtn>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#3e5475",
                        textAlign: "center",
                        marginBottom: 6,
                      }}
                    >
                      Selected Routes
                    </div>
                    <select
                      multiple
                      value={chosenSelected.map(String)}
                      onChange={(e) =>
                        setChosenSelected(
                          Array.from(e.target.selectedOptions, (opt) =>
                            Number(opt.value),
                          ).filter((n) => Number.isFinite(n)),
                        )
                      }
                      style={disaDualListSelectStyle}
                    >
                      {chosenRoutes.length === 0 ? (
                        <option disabled>No selected routes</option>
                      ) : (
                        chosenRoutes.map((id) => (
                          <option key={id} value={id}>
                            {routeNameById.get(id) || `ID:${id}`}
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
                      paddingTop: 24,
                    }}
                  >
                    <DisaDualListBtn
                      reorder
                      title="Move to bottom"
                      onClick={moveChosenBottom}
                    >
                      vv
                    </DisaDualListBtn>
                    <DisaDualListBtn
                      reorder
                      title="Move up"
                      onClick={moveChosenUp}
                    >
                      ^
                    </DisaDualListBtn>
                    <DisaDualListBtn
                      reorder
                      title="Move down"
                      onClick={moveChosenDown}
                    >
                      v
                    </DisaDualListBtn>
                    <DisaDualListBtn
                      reorder
                      title="Move to top"
                      onClick={moveChosenTop}
                    >
                      ^^
                    </DisaDualListBtn>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions
          style={{
            justifyContent: "center",
            gap: 12,
            padding: 16,
            background: "#f5f7fa",
            borderTop: "1px solid #d1d5db",
          }}
        >
          <Btn
            variant="dialogPrimary"
            onClick={handleSave}
            disabled={loading.save || loading.get}
          >
            {loading.save && <CircularProgress size={20} color="inherit" />}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update DISA"
                : "Create DISA"}
          </Btn>
          <Btn
            variant="dialogCancel"
            onClick={handleCloseModal}
            disabled={loading.save || loading.get}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DisaPage;
