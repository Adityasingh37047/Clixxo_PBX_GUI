import React, { useState, useRef, useEffect } from "react";
import {
  ROUTE_IP_PSTN_FIELDS,
  ROUTE_IP_PSTN_INITIAL_FORM,
  ROUTE_IP_PSTN_TABLE_COLUMNS,
} from "./constants/RouteIPtoPstnConstants";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";

// ── Color Palette (From Source) ───────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

// ── Shared UI Components (From Source) ────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
  type = "button",
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
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
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
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

const FieldRow = ({ label, children, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, ...style }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const inputStyle = {
  height: 32,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  width: "100%",
};

// ── Main Component ────────────────────────────────────────────────────────────
const RouteIpPstnPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ROUTE_IP_PSTN_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pcmTrunkGroups] = useState([
    { group_id: 1, id: 1 },
    { group_id: 2, id: 2 },
    { group_id: 3, id: 3 },
    { group_id: 4, id: 4 },
    { group_id: 5, id: 5 },
  ]);
  const [indexSelect, setIndexSelect] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [validationErrors, setValidationErrors] = useState({});
  const itemsPerPage = 20;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

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

  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    left: 0,
    width: 0,
    scrollWidth: 0,
  });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  const handleOpenModal = (item = null, index = -1) => {
    setValidationErrors({});
    if (item) {
      const formPayload = {
        index: String(item.index || ""),
        description: item.description || "default",
        sourceIP: item.sourceIP || "",
        callerIdPrefix: item.callerIdPrefix || "*",
        calleeIdPrefix: item.calleeIdPrefix || "*",
        routeByNumber: item.routeByNumber || false,
        callDestination: item.callDestination
          ? String(item.callDestination)
          : "",
      };
      setFormData(formPayload);
      setIndexSelect(String(item.index || ""));
      setEditIndex(index);
    } else {
      const defaultFormData = { ...ROUTE_IP_PSTN_INITIAL_FORM };
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
    setValidationErrors({});
    setIsModalOpen(false);
    setFormData(ROUTE_IP_PSTN_INITIAL_FORM);
    setIndexSelect("");
    setEditIndex(null);
  };

  const handleIndexSelectChange = (value) => {
    setIndexSelect(value);
    setFormData((prev) => ({ ...prev, index: value }));
    setValidationErrors((prev) => ({ ...prev, index: "" }));
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

  const handleSave = async () => {
    const errors = {};

    if (!formData.index || formData.index === "") {
      errors.index = "Index is required.";
    } else {
      const indexNum = parseInt(formData.index);
      if (isNaN(indexNum) || indexNum < 0 || indexNum > 63) {
        errors.index = "Index must be between 0 and 63.";
      } else {
        if (editIndex === null) {
          if (rules.some((r) => r.index === indexNum)) {
            errors.index = "Index already exists. Please choose a different index.";
          }
        } else {
          if (rules.some((r, idx) => idx !== editIndex && r.index === indexNum)) {
            errors.index = "Index already exists. Please choose a different index.";
          }
        }
      }
    }

    if (!formData.description || formData.description === "") {
      errors.description = "Description is required.";
    } else if (!validatePrefix(formData.description)) {
      errors.description = "Description cannot contain special characters like ~, !, &, | and =";
    }

    if (
      formData.sourceIP &&
      formData.sourceIP !== "" &&
      formData.sourceIP !== "*" &&
      !validateIPAddress(formData.sourceIP)
    ) {
      errors.sourceIP = "Please enter a valid Source IP Address!";
    }

    if (!formData.callerIdPrefix || formData.callerIdPrefix === "") {
      errors.callerIdPrefix = "Please enter a CallerID Prefix!";
    } else if (!validatePrefix(formData.callerIdPrefix)) {
      errors.callerIdPrefix = "CallerID Prefix cannot contain special characters like ~, !, &, | and =";
    }

    if (!formData.calleeIdPrefix || formData.calleeIdPrefix === "") {
      errors.calleeIdPrefix = "Please enter a CalleeID Prefix!";
    } else if (!validatePrefix(formData.calleeIdPrefix)) {
      errors.calleeIdPrefix = "CalleeID Prefix cannot contain special characters like ~, !, &, | and =";
    }

    if (formData.routeByNumber) {
      if (!formData.callDestination || formData.callDestination === "") {
        errors.callDestination = "Please select a Destination Port Group!";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showMessage("error", Object.values(errors)[0]);
      return;
    }

    setValidationErrors({});

    const indexNum = parseInt(formData.index);
    const normalized = {
      index: indexNum,
      description: formData.description,
      sourceIP: formData.sourceIP || "*",
      callerIdPrefix: formData.callerIdPrefix,
      calleeIdPrefix: formData.calleeIdPrefix,
      routeByNumber: formData.routeByNumber,
      callDestination: formData.routeByNumber ? formData.callDestination : "",
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
    };

    try {
      if (editIndex !== null && editIndex > -1) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? normalized : rule)),
        );
        showMessage("success", "Route updated successfully!");
      } else {
        setRules((prev) => [...prev, normalized]);
        showMessage("success", "Route created successfully!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving route:", error);
      showMessage("error", error.message || "Failed to save route");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
    setValidationErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleTableScroll = (e) =>
    setScrollState({
      left: e.target.scrollLeft,
      width: e.target.clientWidth,
      scrollWidth: e.target.scrollWidth,
    });

  const handleScrollbarDrag = (e) => {
    const track = e.target.parentNode;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft =
        (scrollState.scrollWidth - scrollState.width) * percent;
  };

  const handleArrowClick = (dir) => {
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft += dir === "left" ? -100 : 100;
  };

  useEffect(() => {
    const update = () => {
      if (tableScrollRef.current) {
        const el = tableScrollRef.current;
        setScrollState({
          left: el.scrollLeft,
          width: el.clientWidth,
          scrollWidth: el.scrollWidth,
        });
        setShowCustomScrollbar(el.scrollWidth > el.clientWidth);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [rules, page]);

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
      case "routeByNumber":
        return value ? "Enable" : "--";
      case "callDestination":
        if (!value) return "--";
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

  const pagedIndices = pagedRules.map((_, idx) => (page - 1) * itemsPerPage + idx);
  const allPageSelected = pagedIndices.length > 0 && pagedIndices.every((idx) => selected.includes(idx));
  const somePageSelected = pagedIndices.length > 0 && pagedIndices.some((idx) => selected.includes(idx)) && !allPageSelected;

  const handleToggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => prev.filter((idx) => !pagedIndices.includes(idx)));
    } else {
      setSelected((prev) => {
        const union = new Set([...prev, ...pagedIndices]);
        return Array.from(union);
      });
    }
  };

  const handleInverse = () =>
    setSelected(
      rules
        .map((_, idx) => (!selected.includes(idx) ? idx : null))
        .filter((i) => i !== null),
    );

  const handleDelete = () => {
    if (selected.length === 0) {
      showMessage("error", "Please select at least one item to delete.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;
    try {
      setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      showMessage("success", "Selected routes deleted successfully!");
    } catch (error) {
      console.error("Error deleting routes:", error);
      showMessage("error", error.message || "Failed to delete routes");
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      showMessage("error", "No routes to clear.");
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
      showMessage("success", "All routes deleted successfully!");
    } catch (error) {
      console.error("Error clearing all routes:", error);
      showMessage("error", error.message || "Failed to clear all routes");
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
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Toast Alert */}
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
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            FXS &rsaquo; Route &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              IP-&gt;Tel Routing Rule
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
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#DCE6F2",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: "#f1f5f9",
                  border: `0.5px solid ${C.cardBorder}`,
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 12px",
                  borderRadius: 20,
                }}
              >
                IP-&gt;Tel Routing Rule · {rules.length} records
              </span>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#e0f2fe",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: `0.5px solid ${C.accent}`,
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
              <Btn onClick={handleInverse} variant="outline">
                Inverse
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={selected.length === 0}
                variant="danger"
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={rules.length === 0}
                variant="danger"
              >
                Clear All
              </Btn>
              <Btn onClick={() => handleOpenModal()} variant="accent">
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table Container with Custom Scrollbar preserved */}
          <div
            style={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            <div
              ref={tableScrollRef}
              onScroll={handleTableScroll}
              style={{
                overflowX: "auto",
                overflowY: "auto",
                maxHeight: 400,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 1200,
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
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
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                          "&.MuiCheckbox-indeterminate": { color: C.accent },
                        }}
                      />
                    </TH>
                    {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
                      <TH
                        key={col.key}
                        style={{ position: "sticky", top: 0, zIndex: 10 }}
                      >
                        {col.label}
                      </TH>
                    ))}
                    <TH
                      style={{
                        width: 70,
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
                  {rules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={ROUTE_IP_PSTN_TABLE_COLUMNS.length + 2}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        No data. Click '+ Add New' to create one.
                      </td>
                    </tr>
                  ) : (
                    pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const rowBg = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      return (
                        <tr
                          key={realIdx}
                          style={{
                            background: rowBg,
                            borderBottom: "0.5px solid #9ca3af",
                            transition: "background 0.1s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f0f9ff";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              textAlign: "center",
                              padding: "4px 8px",
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(idx)}
                              sx={{
                                padding: "1px",
                                color: C.accent,
                                "&.Mui-checked": { color: C.accent },
                              }}
                            />
                          </td>
                          {ROUTE_IP_PSTN_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                textAlign: "center",
                                fontSize: 12,
                                padding: "7px 8px",
                                color: C.valueText,
                                borderRight: "0.5px solid #edf2f7",
                              }}
                            >
                              {formatDisplayValue(col.key, item[col.key])}
                            </td>
                          ))}
                          <td
                            style={{
                              textAlign: "center",
                              padding: "4px 8px",
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            <Btn
                              onClick={() => handleOpenModal(item, realIdx)}
                              variant="outline"
                              style={{
                                fontSize: 10,
                                padding: "3px 10px",
                                margin: "0 auto",
                              }}
                            >
                              <EditDocumentIcon
                                style={{ fontSize: 12, marginRight: 2 }}
                              />{" "}
                              Edit
                            </Btn>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Custom Scrollbar Retained but styled for the new theme */}
            {(() => {
              const thumbWidth =
                scrollState.width && scrollState.scrollWidth
                  ? Math.max(
                      40,
                      (scrollState.width / scrollState.scrollWidth) *
                        (scrollState.width - 8),
                    )
                  : 40;
              const thumbLeft =
                scrollState.width &&
                scrollState.scrollWidth &&
                scrollState.scrollWidth > scrollState.width
                  ? (scrollState.left /
                      (scrollState.scrollWidth - scrollState.width)) *
                    (scrollState.width - thumbWidth - 16)
                  : 0;
              return (
                showCustomScrollbar && (
                  <div
                    style={{
                      width: "100%",
                      margin: "0 auto",
                      background: "#f4f6fa",
                      display: "flex",
                      alignItems: "center",
                      height: 24,
                      borderBottom: `1px solid ${C.cardBorder}`,
                      padding: "0 4px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        background: "#fff",
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: C.mutedText,
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleArrowClick("left")}
                    >
                      &#9664;
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 12,
                        background: "#eef2f7",
                        borderRadius: 8,
                        position: "relative",
                        margin: "0 4px",
                        overflow: "hidden",
                      }}
                      onClick={handleScrollbarDrag}
                    >
                      <div
                        style={{
                          position: "absolute",
                          height: 12,
                          background: C.cardBorder,
                          borderRadius: 8,
                          cursor: "pointer",
                          top: 0,
                          width: thumbWidth,
                          left: thumbLeft,
                        }}
                        draggable
                        onDrag={handleScrollbarDrag}
                      />
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        background: "#fff",
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: C.mutedText,
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleArrowClick("right")}
                    >
                      &#9654;
                    </div>
                  </div>
                )
              );
            })()}
          </div>

          {/* Footer Pagination */}
          {rules.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#f8fafc",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRules.length} records of {rules.length} Total (
                {itemsPerPage} / Page)
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  First
                </Btn>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
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
                    border: `0.5px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
                <Btn
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Btn>
                <span
                  style={{ fontSize: 11, color: C.mutedText, marginLeft: 8 }}
                >
                  Go to Page:
                </span>
                <select
                  style={{
                    fontSize: 11,
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: `1px solid ${C.cardBorder}`,
                    background: "#fff",
                    color: C.valueText,
                    outline: "none",
                  }}
                  value={page}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 550, maxWidth: "95vw", borderRadius: 2 } }}
        disableRestoreFocus
        disableEnforceFocus
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
          IP-&gt;Tel Routing Rule
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div
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
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <FieldRow label="Index:">
                  <FormControl size="small" fullWidth error={!!validationErrors.index}>
                    <MuiSelect
                      value={indexSelect || ""}
                      onChange={(e) => handleIndexSelectChange(e.target.value)}
                      error={!!validationErrors.index}
                      sx={{
                        fontSize: 13,
                        height: 32,
                        backgroundColor: "#fff",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: !!validationErrors.index ? C.errorRed : C.cardBorder,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: !!validationErrors.index ? C.errorRed : "#94a3b8",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: !!validationErrors.index ? C.errorRed : "#1e2d42",
                        },
                      }}
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
                  {validationErrors.index && (
                    <div style={{ color: C.errorRed, fontSize: 11, marginTop: 2 }}>
                      {validationErrors.index}
                    </div>
                  )}
                </FieldRow>

                <FieldRow label="Description:">
                  <div>
                    <input
                      type="text"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      style={{
                        ...inputStyle,
                        borderColor: !!validationErrors.description ? C.errorRed : C.cardBorder,
                      }}
                    />
                    {validationErrors.description && (
                      <div style={{ color: C.errorRed, fontSize: 11, marginTop: 2 }}>
                        {validationErrors.description}
                      </div>
                    )}
                  </div>
                </FieldRow>

                <FieldRow label="Source IP:">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      width: "100%",
                    }}
                  >
                    <input
                      type="text"
                      name="sourceIP"
                      value={formData.sourceIP || ""}
                      onChange={handleInputChange}
                      style={{
                        ...inputStyle,
                        borderColor: !!validationErrors.sourceIP ? C.errorRed : C.cardBorder,
                      }}
                    />
                    {validationErrors.sourceIP ? (
                      <div style={{ color: C.errorRed, fontSize: 11 }}>
                        {validationErrors.sourceIP}
                      </div>
                    ) : (
                      <div style={{ color: C.mutedText, fontSize: 11 }}>
                        We suggest you input Source IP here.
                      </div>
                    )}
                  </div>
                </FieldRow>

                <FieldRow label="CallerID Prefix:">
                  <div>
                    <input
                      type="text"
                      name="callerIdPrefix"
                      value={formData.callerIdPrefix || ""}
                      onChange={handleInputChange}
                      style={{
                        ...inputStyle,
                        borderColor: !!validationErrors.callerIdPrefix ? C.errorRed : C.cardBorder,
                      }}
                    />
                    {validationErrors.callerIdPrefix && (
                      <div style={{ color: C.errorRed, fontSize: 11, marginTop: 2 }}>
                        {validationErrors.callerIdPrefix}
                      </div>
                    )}
                  </div>
                </FieldRow>

                <FieldRow label="CalleeID Prefix:">
                  <div>
                    <input
                      type="text"
                      name="calleeIdPrefix"
                      value={formData.calleeIdPrefix || ""}
                      onChange={handleInputChange}
                      style={{
                        ...inputStyle,
                        borderColor: !!validationErrors.calleeIdPrefix ? C.errorRed : C.cardBorder,
                      }}
                    />
                    {validationErrors.calleeIdPrefix && (
                      <div style={{ color: C.errorRed, fontSize: 11, marginTop: 2 }}>
                        {validationErrors.calleeIdPrefix}
                      </div>
                    )}
                  </div>
                </FieldRow>

                <FieldRow label="Route by Number:">
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: 13,
                      color: C.valueText,
                      cursor: "pointer",
                    }}
                  >
                    <Checkbox
                      size="small"
                      name="routeByNumber"
                      checked={formData.routeByNumber || false}
                      onChange={handleInputChange}
                      sx={{
                        padding: "2px",
                        marginRight: "4px",
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    >
                      Enable
                    </Checkbox>
                  </label>
                </FieldRow>

                {formData.routeByNumber && (
                  <FieldRow label="Call Destination:">
                    <FormControl size="small" fullWidth error={!!validationErrors.callDestination}>
                      <MuiSelect
                        value={formData.callDestination || ""}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            callDestination: e.target.value,
                          }));
                          setValidationErrors((prev) => ({
                            ...prev,
                            callDestination: "",
                          }));
                        }}
                        error={!!validationErrors.callDestination}
                        sx={{
                          fontSize: 13,
                          height: 32,
                          backgroundColor: "#fff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: !!validationErrors.callDestination ? C.errorRed : C.cardBorder,
                          },
                        }}
                      >
                        {(pcmTrunkGroups || []).map((group) => {
                          const groupId = group.group_id ?? group.id ?? group;
                          return (
                            <MenuItem
                              key={String(groupId)}
                              value={String(groupId)}
                              sx={{ fontSize: 13 }}
                            >
                              PCM Trunk Group [{String(groupId)}]
                            </MenuItem>
                          );
                        })}
                      </MuiSelect>
                    </FormControl>
                    {validationErrors.callDestination && (
                      <div style={{ color: C.errorRed, fontSize: 11, marginTop: 2 }}>
                        {validationErrors.callDestination}
                      </div>
                    )}
                  </FieldRow>
                )}
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
            style={{ padding: "8px 36px", fontSize: 13 }}
          >
            Save
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="outline"
            style={{ padding: "8px 36px", fontSize: 13 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RouteIpPstnPage;
