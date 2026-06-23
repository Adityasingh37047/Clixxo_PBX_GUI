import React, { useState, useEffect } from "react";
import {
  ROUTE_IP_PSTN_FIELDS,
  ROUTE_IP_PSTN_INITIAL_FORM,
  ROUTE_IP_PSTN_TABLE_COLUMNS,
} from "../../../constants/RouteIPtoPstnConstants";
import {
  Button,
  Checkbox,
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
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  listIpPstnRoutes,
  createIpPstnRoute,
  updateIpPstnRoute,
  deleteIpPstnRoute,
  listGroups,
  listPstnGroups,
} from "../../../api/apiService";
// ── Color palette (matches Number-Receiving Rule) ─────────────────────────────
const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
  amber: "#dc2626",
};

const CARD_RADIUS = 20;

// ── Local modal field UI (inlined from e1PriSharedUi) ──
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

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
  "& .MuiOutlinedInput-root": { minHeight: 36, backgroundColor: "var(--bg-surface)" },
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
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: OUTLINED_HOVER },
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
    backgroundColor: "var(--bg-surface)",
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

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
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
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fee2e2]`,
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
  background: "var(--bg-surface)",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const FieldRow = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
        textAlign: "left",
      }}
    >
      {label}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
};

const RouteIpPstnPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_IP_PSTN_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const [sipTrunkGroups, setSipTrunkGroups] = useState([]);
  const [pcmTrunkGroups, setPcmTrunkGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [tableMinWidth, setTableMinWidth] = useState("100%");

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Fetch SIP Trunk Groups for Call Source
  const fetchSipTrunkGroups = async () => {
    try {
      const response = await listGroups();
      if (response.response && response.message) {
        const sipGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        setSipTrunkGroups(sipGroups);
      } else {
        setSipTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching SIP trunk groups:", error);
      setSipTrunkGroups([]);
    }
  };

  // Fetch PCM Trunk Groups for Call Destination
  const fetchPcmTrunkGroups = async () => {
    try {
      const response = await listPstnGroups();
      if (response.response && response.message) {
        const pcmGroups = Array.isArray(response.message)
          ? response.message
          : [response.message];
        setPcmTrunkGroups(pcmGroups);
      } else {
        setPcmTrunkGroups([]);
      }
    } catch (error) {
      console.error("Error fetching PCM trunk groups:", error);
      setPcmTrunkGroups([]);
    }
  };

  // Fetch IP PSTN Routes
  const fetchIpPstnRoutes = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listIpPstnRoutes("ip_to_pstn");
      if (response.response && Array.isArray(response.message)) {
        const mappedRules = response.message.map((rule) => ({
          id: rule.id,
          callSource: rule.call_source,
          callerIdPrefix: rule.caller_id_prefix,
          calleeIdPrefix: rule.callee_id_prefix,
          callDestination: rule.call_destination,
          numberFilter: rule.number_filter,
          description: rule.description,
        }));
        setRules(mappedRules);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error fetching IP PSTN routes:", error);
      showMessage("error", error.message || "Failed to load IP PSTN routes");
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.allSettled([
        fetchIpPstnRoutes(),
        fetchSipTrunkGroups(),
        fetchPcmTrunkGroups(),
      ]);
    };
    loadAllData();
  }, []);

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      const scale = window.visualViewport?.scale || 1;
      setTableMinWidth(scale >= 1.15 ? 1200 : "100%");
    };

    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    window.visualViewport?.addEventListener("resize", updateTableWidthForZoom);

    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      window.visualViewport?.removeEventListener(
        "resize",
        updateTableWidthForZoom,
      );
    };
  }, []);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      setFormData({ ...item, originalIndex: index });
    } else {
      const defaultFormData = { ...ROUTE_IP_PSTN_INITIAL_FORM };
      if (sipTrunkGroups && sipTrunkGroups.length > 0) {
        const firstSipGroup = sipTrunkGroups[0];
        defaultFormData.callSource = String(
          firstSipGroup.group_id || firstSipGroup.id || "",
        );
      }
      if (pcmTrunkGroups && pcmTrunkGroups.length > 0) {
        const firstPcmGroup = pcmTrunkGroups[0];
        defaultFormData.callDestination = String(
          firstPcmGroup.group_id || firstPcmGroup.id || firstPcmGroup,
        );
      }
      defaultFormData.originalIndex = -1;
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const validatePrefix = (prefix) => /^[\d*]+$/.test(prefix || "");

  const handleSave = async () => {
    const { originalIndex, ...dataToSave } = formData;
    if (!validatePrefix(dataToSave.callerIdPrefix)) {
      showMessage(
        "error",
        "Invalid CallerID Prefix! Only numbers (0-9) and asterisks (*) are allowed.",
      );
      return;
    }
    if (!validatePrefix(dataToSave.calleeIdPrefix)) {
      showMessage(
        "error",
        "Invalid CalleeID Prefix! Only numbers (0-9) and asterisks (*) are allowed.",
      );
      return;
    }

    const apiData = {
      call_source: dataToSave.callSource,
      caller_id_prefix: dataToSave.callerIdPrefix,
      callee_id_prefix: dataToSave.calleeIdPrefix,
      call_destination: dataToSave.callDestination,
      number_filter: dataToSave.numberFilter,
      description: dataToSave.description,
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (originalIndex !== undefined && originalIndex > -1) {
        const response = await updateIpPstnRoute(
          rules[originalIndex].id,
          apiData,
          "ip_to_pstn",
        );
        if (response?.response) {
          showMessage("success", "Route updated successfully!");
          handleCloseModal();
          await fetchIpPstnRoutes();
        } else {
          showMessage("error", response?.message || "Failed to update route");
        }
      } else {
        const response = await createIpPstnRoute(apiData, "ip_to_pstn");
        if (response?.response) {
          showMessage("success", "Route created successfully!");
          handleCloseModal();
          await fetchIpPstnRoutes();
        } else {
          showMessage("error", response?.message || "Failed to create route");
        }
      }
    } catch (e) {
      console.error("Error saving route:", e);
      showMessage("error", e.message || "Failed to save route");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handlePageChange = (newPage) =>
    setPage(Math.max(1, Math.min(totalPages, newPage)));

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };

  const formatDisplayValue = (key, value, rowIndex = 0) => {
    if (key === "index") {
      return (page - 1) * itemsPerPage + rowIndex + 1;
    }
    if (value === undefined || value === null || value === "") return "--";

    switch (key) {
      case "callSource":
        return `SIP Trunk Group [${String(value)}]`;
      case "callDestination":
        const pcmGroup = pcmTrunkGroups.find(
          (group) =>
            String(group.group_id || group.id || group) === String(value),
        );
        if (pcmGroup) {
          const gid = pcmGroup.group_id ?? pcmGroup.id ?? value;
          return `PCM Trunk Group [${String(gid)}]`;
        }
        return `PCM Trunk Group [${String(value)}]`;
      default:
        return String(value);
    }
  };

  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      rules
        .map((_, idx) => (!selected.includes(idx) ? idx : null))
        .filter((i) => i !== null),
    );

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("warning", "Please select items to delete");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = rules
        .filter((_, idx) => selected.includes(idx))
        .map((r) => r.id);
      for (const id of idsToDelete) {
        await deleteIpPstnRoute(id, "ip_to_pstn");
      }
      await fetchIpPstnRoutes();
      setSelected([]);
      showMessage("success", "Selected routes deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      showMessage("error", error.message || "Failed to delete routes");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (rules.length === 0) {
      showMessage("warning", "No routes to clear");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${rules.length} routes?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const r of rules) {
        await deleteIpPstnRoute(r.id, "ip_to_pstn");
      }
      await fetchIpPstnRoutes();
      setSelected([]);
      setPage(1);
      showMessage("success", "All routes deleted successfully!");
    } catch (error) {
      showMessage("error", "Failed to clear all routes");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return (
    <div className={E1_PAGE}>
      <div className={E1_INNER}>
        {/* Toast Alert */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={E1_TOAST_SX}
          >
            {message.text}
          </Alert>
        )}

        <E1Breadcrumb section="Route" current="IP-&gt;PSTN Routing Rule" />

        {/* Main Card */}
        <div className={E1_CARD}>
          {/* Toolbar */}
          <div className={E1_TOOLBAR}>
            <div className={E1_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span className={E1_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className={E1_TOOLBAR_ACTIONS}>
              <Btn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || loading.fetch}
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={{ height: 30 }}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0 || loading.delete}
                style={{ height: 30 }}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                variant="primary"
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 10,
                }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table Area */}
          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {loading.fetch ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 240,
                }}
              >
                <CircularProgress size={24} />
              </div>
            ) : rules.length === 0 ? (
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
                  No rules configured!
                </div>
                <Btn
                  onClick={() => handleOpenModal()}
                  variant="cancel"
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New Rule
                </Btn>
              </div>
            ) : (
              <>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    minWidth: tableMinWidth,
                  }}
                >
                  <thead>
                    <tr>
                      <TH style={{ width: 40, padding: 0, borderLeft: "none" }}>
                        <Checkbox
                          size="small"
                          checked={
                            rules.length > 0 && selected.length === rules.length
                          }
                          indeterminate={
                            selected.length > 0 &&
                            selected.length < rules.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) handleCheckAll();
                            else handleUncheckAll();
                          }}
                          sx={checkboxSx}
                        />
                      </TH>
                      {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
                        <TH key={col.key}>{col.label}</TH>
                      ))}
                      <TH style={{ width: 70, borderRight: "none" }}>Modify</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRules.length - 1;
                      const rowBg = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
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
                              borderLeft: "none",
                              width: 36,
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(idx)}
                              sx={checkboxSx}
                            />
                          </td>
                          {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                ...lastRowCellStyle,
                              }}
                            >
                              {formatDisplayValue(col.key, item[col.key], idx)}
                            </td>
                          ))}
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
                                style={{
                                  cursor: "pointer",
                                  color: "#2563eb",
                                  fontSize: 22,
                                  opacity: 0.7,
                                  transition: "opacity 0.15s ease",
                                }}
                                onClick={() => handleOpenModal(item, realIdx)}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.opacity = "1")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.opacity = "0.7")
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Pagination Footer */}
          {!loading.fetch && rules.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                background: "var(--bg-surface)",
                borderTop: `1px solid ${C.cardBorder}`,
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRules.length} record
                {pagedRules.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span className={E1_PAGE_BADGE}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: "95vw",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
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
          {formData.originalIndex !== undefined && formData.originalIndex > -1
            ? "Edit IP->PSTN Routing Rule"
            : "Add IP->PSTN Routing Rule"}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "var(--bg-surface)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={addHostFormPanelStyle}>
              {/* <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 14,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 6,
                }}
              >
                Configuration
              </div> */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {ROUTE_IP_PSTN_FIELDS.map((field) => (
                  <FieldRow key={field.key} label={`${field.label}:`}>
                    {field.type === "select" ? (
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={formData[field.key] || ""}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              [field.key]: e.target.value,
                            }))
                          }
                          displayEmpty
                          sx={modalSelectSx}
                        >
                          {field.key === "callSource" ? (
                            sipTrunkGroups.length > 0 ? (
                              sipTrunkGroups.map((g) => {
                                const id = g.group_id ?? g.id ?? g;
                                return (
                                  <MenuItem
                                    key={String(id) || "any"}
                                    value={String(id)}
                                    sx={{ fontSize: 13 }}
                                  >
                                    SIP Trunk Group [{String(id) || "Any"}]
                                  </MenuItem>
                                );
                              })
                            ) : (
                              <MenuItem value="any" sx={{ fontSize: 13 }}>
                                SIP Trunk Group [Any]
                              </MenuItem>
                            )
                          ) : field.key === "callDestination" ? (
                            pcmTrunkGroups.length > 0 ? (
                              pcmTrunkGroups.map((g) => {
                                const id = g.group_id ?? g.id ?? g;
                                return (
                                  <MenuItem
                                    key={String(id) || "any"}
                                    value={String(id)}
                                    sx={{ fontSize: 13 }}
                                  >
                                    PCM Trunk Group [{String(id) || "Any"}]
                                  </MenuItem>
                                );
                              })
                            ) : (
                              <MenuItem value="any" sx={{ fontSize: 13 }}>
                                PCM Trunk Group [Any]
                              </MenuItem>
                            )
                          ) : (
                            field.options?.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))
                          )}
                        </MuiSelect>
                      </FormControl>
                    ) : (
                      <TextField
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            [field.key]: e.target.value,
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
                    )}
                  </FieldRow>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            padding: "16px 24px",
            background: "var(--row-alt)",
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13, padding: "6px 28px", textTransform: "none" }}
          >
            {loading.save ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RouteIpPstnPage;
