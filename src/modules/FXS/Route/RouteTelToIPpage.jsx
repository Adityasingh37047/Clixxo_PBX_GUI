import React, { useState, useEffect } from "react";
import {
  ROUTE_PSTN_IP_INITIAL_FORM,
  ROUTE_PSTN_IP_TABLE_COLUMNS,
  ROUTE_PSTN_IP_FIELD_TOOLTIPS,
} from "../../../constants/FxsRoutePstnToIPConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  TextField,
  Alert,
  Tooltip,
} from "@mui/material";
/** Compact table text — original FXS route sizing (not enlarged shared defaults) */
// ── Local page UI (inlined from fxsSharedUi) ──

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

const CARD_RADIUS = 10;

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
      border: "1px solid var(--border-subtle)",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "var(--text-secondary)",
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


const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
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


const checkboxSx = {
  padding: "1px",
  color: "var(--text-primary)",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};


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
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const numManipulateCardStyle = {
  background: "var(--bg-surface)",
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const numManipulateToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "var(--bg-surface)",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
};

const numManipulatePaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "var(--bg-surface)",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
  overflow: "hidden",
};


const getBrowserZoomPercent = () => {
  const scale = window.visualViewport?.scale;
  if (typeof scale === "number" && scale > 0) {
    return Math.round(scale * 100);
  }
  return 100;
};

const routeTableMinWidthForZoom = (widePx) => {
  const scale = window.visualViewport?.scale ?? 1;
  if (scale >= 1.15) return widePx;
  const zoomPct = getBrowserZoomPercent();
  return zoomPct >= 130 ? widePx : "100%";
};

const routeTdStyle = tdStyle;

const routeThExtra = {};

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

const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

const FieldRow = ({ label, tooltipKey, tooltips, children, labelWidth = 170 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <FxsFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
      }}
    >
      {label}
    </FxsFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const RoutePstnToIPPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_PSTN_IP_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [portGroups] = useState([
    { group_id: "*", id: "*" },
    { group_id: 1, id: 1 },
    { group_id: 2, id: 2 },
    { group_id: 3, id: 3 },
    { group_id: 4, id: 4 },
    { group_id: 5, id: 5 },
  ]);
  const [indexSelect, setIndexSelect] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [tableMinWidth, setTableMinWidth] = useState("100%");
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please|invalid|must|already exists/i.test(msg) &&
      !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      setTableMinWidth(routeTableMinWidthForZoom(1600));
    };

    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateTableWidthForZoom);
    vv?.addEventListener("scroll", updateTableWidthForZoom);

    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("scroll", updateTableWidthForZoom);
    };
  }, []);

  const getAvailableIndices = (currentEditIndex = null) => {
    const currentIndex =
      currentEditIndex !== null && rules[currentEditIndex]
        ? rules[currentEditIndex].index
        : null;
    const usedIndices = rules
      .map((rule, idx) =>
        currentEditIndex !== null && idx === currentEditIndex
          ? null
          : rule.index,
      )
      .filter((idx) => idx !== null && idx !== undefined);
    return Array.from({ length: 64 }, (_, i) => i)
      .filter((idx) => !usedIndices.includes(idx) || idx === currentIndex)
      .map((idx) => ({ value: String(idx), label: String(idx) }));
  };

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      setFormData({
        index: String(item.index || ""),
        description: item.description || "default",
        sourcePortGroup: item.sourcePortGroup || "*",
        callerIdPrefix: item.callerIdPrefix || "*",
        calleeIdPrefix: item.calleeIdPrefix || "*",
        routeSelf: item.routeSelf || false,
        destinationAddress: item.destinationAddress || "",
        destinationPort: item.destinationPort || "5060",
      });
      setIndexSelect(String(item.index || ""));
      setEditIndex(index);
    } else {
      const defaultFormData = { ...ROUTE_PSTN_IP_INITIAL_FORM };
      const available = getAvailableIndices();
      const firstAvailable = available.length > 0 ? available[0].value : "0";
      defaultFormData.index = firstAvailable;
      setFormData(defaultFormData);
      setIndexSelect(firstAvailable);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(ROUTE_PSTN_IP_INITIAL_FORM);
    setIndexSelect("");
    setEditIndex(null);
  };

  const handleIndexSelectChange = (value) => {
    setIndexSelect(value);
    setFormData((prev) => ({ ...prev, index: value }));
  };

  const validateIPAddress = (ip) => {
    if (!ip || ip === "" || ip === "*") return true;
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    const parts = ip.split(".");
    if (parseInt(parts[0]) === 0 || parseInt(parts[3]) === 0) return false;
    for (let i = 0; i < parts.length; i++) {
      if (parseInt(parts[i]) > 254) return false;
    }
    return true;
  };

  const validatePrefix = (prefix) => {
    if (!prefix || prefix === "") return false;
    const regTest = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
    return regTest.test(prefix);
  };

  const handleSave = () => {
    if (!formData.index || formData.index === "") {
      alert("Index is required.");
      return;
    }
    const indexNum = parseInt(formData.index);
    if (isNaN(indexNum) || indexNum < 0 || indexNum > 63) {
      alert("Index must be between 0 and 63.");
      return;
    }

    if (editIndex === null) {
      if (rules.some((r) => r.index === indexNum)) {
        alert("Index already exists. Please choose a different index.");
        return;
      }
    } else {
      if (rules.some((r, idx) => idx !== editIndex && r.index === indexNum)) {
        alert("Index already exists. Please choose a different index.");
        return;
      }
    }

    if (!formData.description || formData.description === "") {
      alert("Description is required.");
      return;
    }
    if (!validatePrefix(formData.description)) {
      alert(
        "Description cannot contain special characters like ~, !, &, | and =",
      );
      return;
    }

    if (!formData.callerIdPrefix || formData.callerIdPrefix === "") {
      alert("Please enter a CallerID Prefix!");
      return;
    }
    if (!validatePrefix(formData.callerIdPrefix)) {
      alert(
        "CallerID Prefix cannot contain special characters like ~, !, &, | and =",
      );
      return;
    }

    if (!formData.calleeIdPrefix || formData.calleeIdPrefix === "") {
      alert("Please enter a CalleeID Prefix!");
      return;
    }
    if (!validatePrefix(formData.calleeIdPrefix)) {
      alert(
        "CalleeID Prefix cannot contain special characters like ~, !, &, | and =",
      );
      return;
    }

    if (!formData.routeSelf) {
      if (!formData.destinationAddress || formData.destinationAddress === "") {
        alert("Please enter a Destination Address!");
        return;
      }
      if (!validateIPAddress(formData.destinationAddress)) {
        alert("Please enter a valid Destination Address!");
        return;
      }
      if (!formData.destinationPort || formData.destinationPort === "") {
        alert("Please enter a Destination Port!");
        return;
      }
    }

    const normalized = {
      index: indexNum,
      description: formData.description,
      sourcePortGroup: formData.sourcePortGroup || "*",
      callerIdPrefix: formData.callerIdPrefix,
      calleeIdPrefix: formData.calleeIdPrefix,
      routeSelf: formData.routeSelf,
      destinationAddress: formData.routeSelf ? "" : formData.destinationAddress,
      destinationPort: formData.routeSelf ? "5060" : formData.destinationPort,
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
    };

    try {
      if (editIndex !== null && editIndex > -1) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? normalized : rule)),
        );
        alert("Route updated successfully!");
      } else {
        setRules((prev) => [...prev, normalized]);
        alert("Route created successfully!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving route:", error);
      alert(error.message || "Failed to save route");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const formatDisplayValue = (key, value) => {
    if (value === undefined || value === null || value === "") return "--";

    switch (key) {
      case "sourcePortGroup": {
        const portGroup = portGroups.find(
          (group) =>
            String(group.group_id || group.id || group) === String(value),
        );
        if (portGroup) {
          const gid = portGroup.group_id ?? portGroup.id ?? value;
          return String(gid);
        }
        return String(value);
      }
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

  const handleDelete = () => {
    if (selected.length === 0) {
      alert("Please select at least one item to delete.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    try {
      setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      alert("Selected routes deleted successfully!");
    } catch (error) {
      console.error("Error deleting routes:", error);
      alert(error.message || "Failed to delete routes");
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      alert("No routes to clear.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${rules.length} routes? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      alert("All routes deleted successfully!");
    } catch (error) {
      console.error("Error clearing all routes:", error);
      alert(error.message || "Failed to clear all routes");
    }
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {toast.msg}
          </Alert>
        )}

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
          }}
        >
          <span>FXS</span>
          <span>&gt;</span>
          <span>Route</span>
          <span>&gt;</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Tel-&gt;IP Routing Rule
          </span>
        </div>

        <div style={numManipulateCardStyle}>
          <div style={numManipulateToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
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
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0}
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0}
                style={{ height: 30 }}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0}
                style={{ height: 30 }}
              >
                Clear All
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
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

          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {rules.length === 0 ? (
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
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New Rule
                </Btn>
              </div>
            ) : (
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
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        ...routeThExtra,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={
                          rules.length > 0 && selected.length === rules.length
                        }
                        indeterminate={
                          selected.length > 0 && selected.length < rules.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) handleCheckAll();
                          else handleUncheckAll();
                        }}
                        sx={checkboxSx}
                      />
                    </TH>
                    {ROUTE_PSTN_IP_TABLE_COLUMNS.map((col) => (
                      <TH key={col.key} style={routeThExtra}>
                        {col.label}
                      </TH>
                    ))}
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        ...routeThExtra,
                      }}
                    >
                      Modify
                    </TH>
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
                            ...routeTdStyle,
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
                        {ROUTE_PSTN_IP_TABLE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...routeTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {formatDisplayValue(col.key, item[col.key])}
                          </td>
                        ))}
                        <td
                          style={{
                            ...routeTdStyle,
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
            )}
          </div>

          {rules.length > 0 && (
            <div style={numManipulatePaginationStyle}>
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
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.accent,
                    background: "#e0f2fe",
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: `1px solid ${C.cardBorder}`,
                  }}
                >
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
        disableRestoreFocus
        disableEnforceFocus
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
          {editIndex !== null
            ? "Edit Tel->IP Routing Rule"
            : "Add Tel->IP Routing Rule"}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "var(--bg-surface)" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "var(--row-alt)",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            <FieldRow label="Index:" tooltipKey="index" tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}>
              <FormControl size="small" fullWidth>
                <MuiSelect
                  value={indexSelect || ""}
                  onChange={(e) => handleIndexSelectChange(e.target.value)}
                  displayEmpty
                  sx={muiSelectSx}
                >
                  {getAvailableIndices(editIndex).map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      sx={{ fontSize: 13 }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </FieldRow>

            <FieldRow label="Description:" tooltipKey="description" tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}>
              <TextField
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
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
                sx={muiTextFieldSx}
              />
            </FieldRow>

            <FieldRow label="Source Port Group:" tooltipKey="sourcePortGroup" tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}>
              <FormControl size="small" fullWidth>
                <MuiSelect
                  value={formData.sourcePortGroup || "*"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sourcePortGroup: e.target.value,
                    }))
                  }
                  sx={muiSelectSx}
                >
                  {portGroups.map((group) => {
                    const groupId = group.group_id ?? group.id ?? group;
                    return (
                      <MenuItem
                        key={String(groupId)}
                        value={String(groupId)}
                        sx={{ fontSize: 13 }}
                      >
                        {String(groupId)}
                      </MenuItem>
                    );
                  })}
                </MuiSelect>
              </FormControl>
            </FieldRow>

            <FieldRow label="CallerID Prefix:" tooltipKey="callerIdPrefix" tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}>
              <TextField
                name="callerIdPrefix"
                value={formData.callerIdPrefix || ""}
                onChange={handleInputChange}
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
                sx={muiTextFieldSx}
              />
            </FieldRow>

            <FieldRow label="CalleeID Prefix:" tooltipKey="calleeIdPrefix" tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}>
              <TextField
                name="calleeIdPrefix"
                value={formData.calleeIdPrefix || ""}
                onChange={handleInputChange}
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
                sx={muiTextFieldSx}
              />
            </FieldRow>

            <FieldRow label="Destination Address:" tooltipKey="destinationAddress" tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}>
              <TextField
                name="destinationAddress"
                value={formData.destinationAddress || ""}
                onChange={handleInputChange}
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
                sx={muiTextFieldSx}
              />
            </FieldRow>

            <FieldRow label="Destination Port:" tooltipKey="destinationPort" tooltips={ROUTE_PSTN_IP_FIELD_TOOLTIPS}>
              <TextField
                name="destinationPort"
                value={formData.destinationPort || ""}
                onChange={handleInputChange}
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
                sx={muiTextFieldSx}
              />
            </FieldRow>
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
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={{ minWidth: 100, height: 33 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RoutePstnToIPPage;
