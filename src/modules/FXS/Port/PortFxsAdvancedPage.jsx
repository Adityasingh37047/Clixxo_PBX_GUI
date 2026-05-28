import React, { useState } from "react";
import {
  PORT_FXS_ADVANCED_TABLE_COLUMNS,
  PORT_FXS_ADVANCED_ITEMS_PER_PAGE,
  PORT_FXS_ADVANCED_TOTAL_PORTS,
  PORT_FXS_ADVANCED_INITIAL_DATA,
  PORT_FXS_ADVANCED_BATCH_MODIFY_FIELDS,
  PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES,
  PORT_FXS_ADVANCED_PAGE_TITLE,
  PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE,
  WEEK_DAYS,
} from "../../../sections/port/constants/PortFxsAdvancedPageConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Alert, Checkbox } from "@mui/material";

// ── Color Palette (From Source) ───────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  errorRed: "#dc2626",
};

// ── Shared UI Components (From Source) ────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    default: { background: C.cardBg, color: C.valueText, border: "1px solid #9ca3af" },
    primary: {
      background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: { background: C.cardBg, color: C.labelText, border: `0.5px solid ${C.cardBorder}` },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = variant === "primary" ? "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)" : variant === "cancel" ? "#b6c2d3" : "#e2e8f0";

  return (
    <button
      type={type || "button"}
      onClick={onClick}
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
        gap: 5,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = s.background; }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children, style }) => (
  <div style={{ 
    display: "flex", 
    alignItems: "center", 
    background: "#ffffff",
    border: `1px solid #cbd5e1`,
    borderRadius: 6,
    padding: "6px 12px",
    gap: 12, 
    minHeight: 40,
    ...style 
  }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#1e293b",
        width: 160,
        flexShrink: 0,
      }}
    >
      {label}:
    </label>
    <div className="flex-1" style={{ maxWidth: 280 }}>{children}</div>
  </div>
);

const inputStyle = {
  width: "100%",
  fontSize: 13,
  padding: "6px 8px",
  border: "1px solid #cbd5e1",
  borderRadius: 4,
  outline: "none",
  color: "#1e293b",
  background: "#ffffff",
};

// ── Initial State Logic ───────────────────────────────────────────────────────
const initializePortData = () => {
  return Array.from({ length: PORT_FXS_ADVANCED_TOTAL_PORTS }, (_, i) => ({
    ...PORT_FXS_ADVANCED_INITIAL_DATA,
    port: i + 1,
  }));
};

const getInitialBatchForm = () => {
  const form = {
    port: "1",
    type: "FXS",
    forbidOutgoingCall: false,
    wayOfForbidOutgoingCall: "All time",
    blacklistOfFxsOutCalls: "",
    prohibitLimitCount: 1,
  };

  for (let i = 1; i <= 5; i++) {
    form[`period${i}Start1`] = "00:00:00";
    form[`period${i}End1`] = "00:00:00";
    form[`period${i}Start2`] = "00:00:00";
    form[`period${i}End2`] = "00:00:00";
    form[`period${i}Start3`] = "00:00:00";
    form[`period${i}End3`] = "00:00:00";
    WEEK_DAYS.forEach((day, idx) => {
      form[`period${i}Week${idx}`] = false;
    });
  }

  return form;
};

// ── Main Component ────────────────────────────────────────────────────────────
const PortFxsAdvancedPage = () => {
  const [ports, setPorts] = useState(initializePortData());
  const [page, setPage] = useState(1);
  const [showBatchModify, setShowBatchModify] = useState(false);
  const [batchForm, setBatchForm] = useState(getInitialBatchForm());
  const [prohibitLimitCount, setProhibitLimitCount] = useState(1);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(ports.length / PORT_FXS_ADVANCED_ITEMS_PER_PAGE),
  );
  const pagedPorts = ports.slice(
    (page - 1) * PORT_FXS_ADVANCED_ITEMS_PER_PAGE,
    page * PORT_FXS_ADVANCED_ITEMS_PER_PAGE,
  );

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  const handleBatchModify = () => {
    setShowBatchModify(true);
    setBatchForm(getInitialBatchForm());
  };

  const handleFormChange = (key, value) => {
    setBatchForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (key) => {
    setBatchForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePeriodCountChange = (action) => {
    if (action === "plus" && prohibitLimitCount < 5) {
      setProhibitLimitCount((prev) => prev + 1);
    } else if (action === "minus" && prohibitLimitCount > 1) {
      setProhibitLimitCount((prev) => prev - 1);
    }
  };

  const shouldShowField = (field) => {
    if (!field.conditional) return true;
    return !!batchForm[field.conditional];
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (
      batchForm.forbidOutgoingCall &&
      batchForm.wayOfForbidOutgoingCall === "Select time"
    ) {
      for (let i = 1; i <= prohibitLimitCount; i++) {
        const start1 = batchForm[`period${i}Start1`];
        const end1 = batchForm[`period${i}End1`];
        if (!start1 || !end1) {
          showMessage(
            "error",
            `Please input the start and end time for period ${i}!`,
          );
          return;
        }
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        if (!timeRegex.test(start1) || !timeRegex.test(end1)) {
          showMessage(
            "error",
            `Please input the time in the right format (hh:mm:ss) for period ${i}!`,
          );
          return;
        }
      }
    }

    showMessage("success", "Batch modify settings saved successfully!");
    setShowBatchModify(false);
  };

  const handleCancel = () => {
    setShowBatchModify(false);
    setBatchForm(getInitialBatchForm());
    setProhibitLimitCount(1);
  };

  const handleReset = () => {
    setBatchForm(getInitialBatchForm());
    setProhibitLimitCount(1);
  };

  const renderTimePeriods = () => {
    if (
      !batchForm.forbidOutgoingCall ||
      batchForm.wayOfForbidOutgoingCall !== "Select time"
    ) {
      return null;
    }

    const periods = [];
    for (let i = 1; i <= prohibitLimitCount; i++) {
      periods.push(
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "16px 12px",
            border: `1px dashed ${C.cardBorder}`,
            borderRadius: 6,
            marginTop: 8,
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: C.labelText }}>
            Time Period {i}
          </div>
          <FieldRow label="Period 1 (hh:mm:ss):">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                value={batchForm[`period${i}Start1`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}Start1`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ color: C.mutedText }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End1`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}End1`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                maxLength={8}
                placeholder="00:00:00"
              />
            </div>
          </FieldRow>
          <FieldRow label="Period 2 (hh:mm:ss):">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                value={batchForm[`period${i}Start2`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}Start2`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ color: C.mutedText }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End2`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}End2`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                maxLength={8}
                placeholder="00:00:00"
              />
            </div>
          </FieldRow>
          <FieldRow label="Period 3 (hh:mm:ss):">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                value={batchForm[`period${i}Start3`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}Start3`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                maxLength={8}
                placeholder="00:00:00"
              />
              <span style={{ color: C.mutedText }}>-</span>
              <input
                type="text"
                value={batchForm[`period${i}End3`] || "00:00:00"}
                onChange={(e) =>
                  handleFormChange(`period${i}End3`, e.target.value)
                }
                style={{ ...inputStyle, width: 100 }}
                maxLength={8}
                placeholder="00:00:00"
              />
            </div>
          </FieldRow>
          <FieldRow label="Week:">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {WEEK_DAYS.map((day, idx) => (
                <label
                  key={day}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.labelText,
                    cursor: "pointer",
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={!!batchForm[`period${i}Week${idx}`]}
                    onChange={() =>
                      handleFormChange(
                        `period${i}Week${idx}`,
                        !batchForm[`period${i}Week${idx}`],
                      )
                    }
                    sx={{
                      padding: "1px",
                      marginRight: "4px",
                      color: "#64748b",
                      "&.Mui-checked": { color: "#0284c7" },
                    }}
                  />
                  {day}
                </label>
              ))}
            </div>
          </FieldRow>
        </div>,
      );
    }
    return periods;
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
        {/* Error / Success Banner */}
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
        {!showBatchModify && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 12, color: C.mutedText, display: "flex", gap: 4 }}>
              <span>FXS</span>
              <span>&gt;</span>
              <span>Port</span>
              <span>&gt;</span>
              <span style={{ color: C.strongText, fontWeight: 600 }}>FXS Advanced</span>
            </div>
          </div>
        )}

        {/* Main Table View */}
        {!showBatchModify ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: 22,
              overflow: "hidden",
              border: `1px solid ${C.cardBorder}`,
              boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            }}
          >
            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "1px solid #e2e8f0",
                background: "#ffffff",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Btn onClick={handleBatchModify} variant="primary" style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 10,
                }}>
                  Batch Modify
                </Btn>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 600,
                }}
              >
                <thead>
                  <tr>
                    {PORT_FXS_ADVANCED_TABLE_COLUMNS.map((col) => (
                      <TH key={col.key}>{col.label}</TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedPorts.map((port, idx) => {
                    const rowBg = idx % 2 === 1 ? "#f8fafc" : "#ffffff";
                    return (
                      <tr
                        key={port.port}
                        style={{
                          background: idx % 2 === 1 ? "#f8fafc" : "#ffffff",
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = idx % 2 === 1 ? "#f8fafc" : "#ffffff";
                        }}
                      >
                        <td
                          style={{
                            textAlign: "center",
                            padding: "4px 8px",
                            borderRight: "0.5px solid #edf2f7",
                          }}
                        >
                          <EditDocumentIcon
  className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
  titleAccess="Edit"
  onClick={() => {
    const portNumber = String(port.port);

    setBatchForm((prev) => ({
      ...prev,
      port: portNumber,
      type: "FXS",
    }));

    setShowBatchModify(true);
  }}
/>
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontSize: 12,
                            padding: "7px 4px",
                            color: C.valueText,
                            borderRight: "0.5px solid #edf2f7",
                          }}
                        >
                          {port.port}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontSize: 12,
                            padding: "7px 4px",
                            color: C.valueText,
                            borderRight: "0.5px solid #edf2f7",
                          }}
                        >
                          {port.type}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontSize: 12,
                            padding: "7px 4px",
                            color: C.valueText,
                            borderRight: "0.5px solid #edf2f7",
                          }}
                        >
                          {port.forbidOutgoingCall}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontSize: 12,
                            padding: "7px 4px",
                            color: C.valueText,
                            borderRight: "0.5px solid #edf2f7",
                          }}
                        >
                          {port.blacklistOfOutCalls}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {ports.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  borderTop: `1px solid ${C.cardBorder}`,
                  background: "#ffffff",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedPorts.length} records of {ports.length} Total (
                  {PORT_FXS_ADVANCED_ITEMS_PER_PAGE} / Page)
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
                      border: `1px solid ${C.cardBorder}`,
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
                    style={{ fontSize: 11, color: C.mutedText }}
                  >
                    Go to
                  </span>
                  <select
                    style={{
                      fontSize: 11,
                      padding: "3px 6px",
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
        ) : (
          /* Modify View */
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 12, color: C.mutedText, display: "flex", gap: 4 }}>
                <span>PBX</span>
                <span>&gt;</span>
                <span>Port FXS Advanced</span>
                <span>&gt;</span>
                <span style={{ color: C.strongText, fontWeight: 600 }}>Modify</span>
              </div>
            </div>

            <div
              style={{
                background: C.cardBg,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 22,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
              }}
            >
              <div
                style={{
                  background: "#1e2d42",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  textAlign: "center",
                  padding: "14px 24px",
                }}
              >
                {PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE}
              </div>

              <div style={{ padding: "24px 32px", backgroundColor: "#f8fafc" }}>
                <form onSubmit={handleSave}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Port">
                      <select
                        value={batchForm.port}
                        onChange={(e) =>
                          handleFormChange("port", e.target.value)
                        }
                        style={inputStyle}
                      >
                        {Array.from(
                          { length: PORT_FXS_ADVANCED_TOTAL_PORTS },
                          (_, i) => (
                            <option key={i + 1} value={String(i + 1)}>
                              {i + 1}
                            </option>
                          ),
                        )}
                      </select>
                    </FieldRow>

                    <FieldRow label="Type">
                      <input
                        type="text"
                        value={batchForm.type || "FXS"}
                        onChange={(e) =>
                          handleFormChange("type", e.target.value)
                        }
                        style={inputStyle}
                        readOnly
                      />
                    </FieldRow>

                    <FieldRow label="Forbid Outgoing Call">
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
                          checked={!!batchForm.forbidOutgoingCall}
                          onChange={() => handleCheckbox("forbidOutgoingCall")}
                          sx={{
                            padding: "2px",
                            marginRight: "6px",
                            color: "#64748b",
                            "&.Mui-checked": { color: "#0284c7" },
                          }}
                        />
                        Enable
                      </label>
                    </FieldRow>

                    {shouldShowField({ conditional: "forbidOutgoingCall" }) && (
                      <FieldRow label="Way Of Forbid Outgoing Call">
                        <select
                          value={batchForm.wayOfForbidOutgoingCall}
                          onChange={(e) =>
                            handleFormChange(
                              "wayOfForbidOutgoingCall",
                              e.target.value,
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="All time">All time</option>
                          <option value="Select time">Select time</option>
                        </select>
                      </FieldRow>
                    )}

                    {batchForm.forbidOutgoingCall &&
                      batchForm.wayOfForbidOutgoingCall === "Select time" && (
                        <>
                          {renderTimePeriods()}

                          {/* Limit controls inline with the previous blocks */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              marginTop: 8,
                            }}
                          >
                            <div style={{ display: "flex", gap: 8 }}>
                              {prohibitLimitCount < 5 && (
                                <Btn
                                  variant="outline"
                                  onClick={() =>
                                    handlePeriodCountChange("plus")
                                  }
                                  style={{ padding: "4px 12px" }}
                                >
                                  + Add Period
                                </Btn>
                              )}
                              {prohibitLimitCount > 1 && (
                                <Btn
                                  variant="outline"
                                  onClick={() =>
                                    handlePeriodCountChange("minus")
                                  }
                                  style={{ padding: "4px 12px" }}
                                >
                                  - Remove Period
                                </Btn>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                    <FieldRow
                      label="Blacklist of FXS Out Calls"
                      style={{ alignItems: "flex-start" }}
                    >
                      <textarea
                        value={batchForm.blacklistOfFxsOutCalls}
                        onChange={(e) =>
                          handleFormChange(
                            "blacklistOfFxsOutCalls",
                            e.target.value,
                          )
                        }
                        style={{
                          ...inputStyle,
                          height: "80px",
                          resize: "vertical",
                          paddingTop: "8px",
                        }}
                        maxLength={1000}
                      />
                    </FieldRow>
                  </div>

                  <div
                    style={{
                      marginTop: 32,
                      padding: 16,
                      background: "#fef2f2",
                      borderRadius: 6,
                      border: "1px dashed #fecaca",
                      fontSize: 12,
                      color: C.errorRed,
                    }}
                  >
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES.map((note, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 12,
                      marginTop: 24,
                      paddingTop: 16,
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <Btn
                      onClick={handleSave}
                      variant="primary"
                      style={{ minWidth: 120, height: 36, fontSize: 14 }}
                    >
                      Modify
                    </Btn>
                    <Btn
                      onClick={handleReset}
                      variant="cancel"
                      style={{ minWidth: 120, height: 36, fontSize: 14 }}
                    >
                      Reset
                    </Btn>
                    <Btn
                      onClick={handleCancel}
                      variant="cancel"
                      style={{ minWidth: 120, height: 36, fontSize: 14 }}
                    >
                      Cancel
                    </Btn>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortFxsAdvancedPage;
