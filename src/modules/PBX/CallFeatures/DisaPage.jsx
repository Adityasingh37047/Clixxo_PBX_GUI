import React, { useEffect, useMemo, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
  Select as MuiSelect,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  createDisa,
  deleteDisa,
  getDisa,
  listDisa,
  listOutboundRoutes,
  updateDisa,
} from "../../../api/apiService";
import {
  DISA_ENABLE_OPTIONS,
  DISA_FIELD_TOOLTIPS,
  DISA_ITEMS_PER_PAGE,
  DISA_SECOND_DIAL_OPTIONS,
  DISA_TITLE,
  DISA_TRANSPARENT_OPTIONS,
} from "../../../constants/DisaConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as DisaBreadcrumb,
  ExtensionTableListLoading as DisaTableListLoading,
  ExtensionTableListEmptyState as DisaTableListEmptyState,
  extensionTableCheckboxSx as disaTableCheckboxSx,
  extensionFixedAlertSx as disaFixedAlertSx,
  extensionPageWrapStyle as disaPageWrapStyle,
  extensionPageInnerStyle as disaPageInnerStyle,
  extensionCardStyle as disaCardStyle,
  extensionToolbarStyle as disaToolbarStyle,
  extensionSelectedBadgeStyle as disaSelectedBadgeStyle,
  extensionCancelBtnStyle as disaCancelBtnStyle,
  extensionPrimaryBtnStyle as disaPrimaryBtnStyle,
  ExtensionCodecDualList as DisaCodecDualList,
} from "../../../components/common";

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
};

// ── Local page UI ──


const DISA_TABLE_CARD_RADIUS = 4;

const disaPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: DISA_TABLE_CARD_RADIUS,
  borderBottomRightRadius: DISA_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const disaPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

const disaEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleDisaEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const disaOutlinedInputRootSx = {
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

const disaModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...disaOutlinedInputRootSx,
    minHeight: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
};

const disaModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...disaOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
};

const disaModalPaperSx = {
  width: 900,
  maxWidth: "96vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const disaModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

const disaModalSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  width: "100%",
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: "20px 24px 24px",
  marginTop: 24,
};

const disaModalContentWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  paddingBottom: 4,
};

const disaModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const disaModalDialogContainerSx = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
    borderRadius: 4,
  minWidth: 100,
};

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const disaModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",  
  borderRadius: 4,
};

const DISA_TOOLTIP_PROPS = {
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

const formatDisaTooltipTitle = (text) => {
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

const DISA_MODAL_LABEL_WIDTH = 150;

const DisaFieldLabel = ({
  tooltipKey,
  children,
  required,
  style = {},
}) => {
  const tooltip = DISA_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
      {required ? (
        <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
      ) : null}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatDisaTooltipTitle(tooltip)}
      {...DISA_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const DisaFieldRow = ({ label, tooltipKey, required, children, alignTop }) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    {tooltipKey ? (
      <DisaFieldLabel
        tooltipKey={tooltipKey}
        required={required}
        style={{
          width: DISA_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
        }}
      >
        {label}
      </DisaFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: DISA_MODAL_LABEL_WIDTH,
          flexShrink: 0,
          marginTop: alignTop ? 4 : 0,
        }}
      >
        {label}
        {required ? (
          <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
        ) : null}
      </label>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const DISA_MODAL_SECTION_BG = "#f8fafc";
const DISA_MODAL_SECTION_HEADING_COLOR = "#30415A";

const DisaSectionHeading = ({
  title,
  isFirst = false,
  required = false,
  tooltipKey,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: DISA_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: DISA_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  );
  const tooltip = tooltipKey ? DISA_FIELD_TOOLTIPS[tooltipKey] : "";
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "16px 0 24px 0"
            : "0 0 24px 0"
          : "28px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      {tooltip ? (
        <Tooltip
          title={formatDisaTooltipTitle(tooltip)}
          {...DISA_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

const enableDisableCellStyle = (value) => ({
  color: value === "Enable" ? "#16a34a" : "#dc2626",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.01em",
  whiteSpace: "nowrap",
});

const DISA_COMPACT_MQ = "(max-width: 768px)";

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
  const isCompact = useMediaQuery(DISA_COMPACT_MQ);
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
  const itemsPerPage = DISA_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  // Outbound routes state
  const [allOutboundRoutes, setAllOutboundRoutes] = useState([]);

  const routeNameById = useMemo(() => {
    const map = new Map();
    allOutboundRoutes.forEach((route) => map.set(route.id, route.name));
    return map;
  }, [allOutboundRoutes]);

  const getOutboundRouteLabel = (id) => routeNameById.get(id) || `ID:${id}`;

  const allOutboundRouteOptions = useMemo(
    () =>
      allOutboundRoutes.map(({ id, name }) => ({
        value: id,
        label: name || String(id),
      })),
    [allOutboundRoutes],
  );

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
    setShowPassword(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setShowModal(true);
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

  return (
    <div
      style={{
        ...disaPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={disaPageInnerStyle}>
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
            sx={disaFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <DisaBreadcrumb section="Call Features" current={DISA_TITLE} />

        <div style={disaCardStyle}>
          <div
            style={{
              ...disaToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={disaSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={disaCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={disaPrimaryBtnStyle}
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
              <DisaTableListLoading />
            ) : rows.length === 0 ? (
              <DisaTableListEmptyState
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
                        sx={disaTableCheckboxSx}
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
                            sx={disaTableCheckboxSx}
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
                          <span style={enableDisableCellStyle(row.secondDial)}>
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
                          <span style={enableDisableCellStyle(row.transparent)}>
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
                            style={disaEditIconStyle}
                            onMouseEnter={(e) =>
                              handleDisaEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleDisaEditIconHover(e, false)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <div style={disaPaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.list || page <= 1}
                  variant="outline" 
                  style={{ borderRadius: 4 }}
                >
                  ← Prev
                </Btn>
                <span style={disaPageBadgeStyle}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.list || page >= totalPages}
                  variant="outline"
                  style={{ borderRadius: 4 }}
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save || loading.get ? null : handleCloseModal}
        maxWidth={false}
        sx={disaModalDialogContainerSx}
        PaperProps={{ sx: { ...disaModalPaperSx, borderRadius: editId == null ? "4px" : disaModalPaperSx.borderRadius } }}
      >
        <DialogTitle style={disaModalTitleStyle}>
          {editId != null ? `Edit ${DISA_TITLE}` : `Add ${DISA_TITLE}`}
        </DialogTitle>

        <DialogContent
          className="app-main-scroll"
          sx={{
            ...disaModalDialogContentSx,
            padding: "0 24px 24px",
            backgroundColor: "#ffffff",
          }}
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
            <div style={disaModalContentWrapStyle}>
              <div style={{ background: "#ffffff" }}>
                <div style={disaModalSectionStyle}>
                <DisaSectionHeading title="General Settings" isFirst />

                <div
                  style={{
                    marginTop: 8,
                    width: "100%",
                    maxWidth: 720,
                    margin: "0 auto",
                    display: "grid",
                    gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                    gap: isCompact ? "16px" : "16px 20px",
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
                    <DisaFieldRow label="Name" tooltipKey="name" required>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        sx={disaModalTextFieldFullSx}
                      />
                    </DisaFieldRow>

                    <DisaFieldRow
                      label="Response Timeout (s)"
                      tooltipKey="response_timeout"
                      required
                    >
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
                        inputProps={{ min: 1 }}
                        sx={disaModalTextFieldFullSx}
                      />
                    </DisaFieldRow>

                    <DisaFieldRow label="Second Dial" tooltipKey="second_dial">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.secondDial}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              secondDial: e.target.value,
                            }))
                          }
                          sx={disaModalSelectSx}
                        >
                          {DISA_SECOND_DIAL_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </DisaFieldRow>

                    <DisaFieldRow
                      label="Pin Type"
                      tooltipKey="pin_type"
                      alignTop
                    >
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
                              sx={disaModalTextFieldFullSx}
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
                    </DisaFieldRow>
                  </div>

                  {/* ── RIGHT COLUMN ── */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <DisaFieldRow
                      label="Digit Timeout (s)"
                      tooltipKey="digit_timeout"
                      required
                    >
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
                        inputProps={{ min: 1 }}
                        sx={disaModalTextFieldFullSx}
                      />
                    </DisaFieldRow>

                    <DisaFieldRow label="Transparent" tooltipKey="transparent">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.transparent}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              transparent: e.target.value,
                            }))
                          }
                          sx={disaModalSelectSx}
                        >
                          {DISA_TRANSPARENT_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </DisaFieldRow>

                    <DisaFieldRow label="Enabled" tooltipKey="enabled">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={form.enabled ? "Yes" : "No"}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              enabled: e.target.value === "Yes",
                            }))
                          }
                          sx={disaModalSelectSx}
                        >
                          {DISA_ENABLE_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </DisaFieldRow>
                  </div>
                </div>

                <DisaSectionHeading
                  title="Outbound Routes"
                  tooltipKey="outbound_routes"
                />

                <DisaCodecDualList
                  style={{ marginTop: 8 }}
                  allOptions={allOutboundRouteOptions}
                  selected={form.outboundRoutes}
                  onChange={(outboundRoutes) =>
                    setForm((f) => ({ ...f, outboundRoutes }))
                  }
                  getLabel={getOutboundRouteLabel}
                  emptyTextAvailable="No routes available"
                  emptyTextSelected="No selected routes"
                />
              </div>
            </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save || loading.get}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save && <CircularProgress size={20} color="inherit" />}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update DISA"
                : "Create DISA"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save || loading.get}
            style={disaModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DisaPage;
