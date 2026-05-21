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
      type="button"
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
        width: 220,
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
  width: "280px",
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
                    color: C.valueText,
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
                      padding: "2px",
                      marginRight: "2px",
                      color: C.accent,
                      "&.Mui-checked": { color: C.accent },
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
            <div style={{ fontSize: 11, color: C.mutedText }}>
              FXS &rsaquo; Port &rsaquo;{" "}
              <span style={{ color: "#1e293b", fontWeight: 600 }}>
                FXS Advanced
              </span>
            </div>
          </div>
        )}

        {/* Main Table View */}
        {!showBatchModify ? (
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
                  {PORT_FXS_ADVANCED_PAGE_TITLE} · {ports.length} records
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Btn onClick={handleBatchModify} variant="accent">
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
                          background: rowBg,
                          borderBottom: "0.5px solid #9ca3af",
                          transition: "background 0.1s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f0f9ff";
                        }}
                        onMouseLeave={(e) => {
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
                          <Btn
                            onClick={() => {
                              const portNumber = String(port.port);
                              setBatchForm((prev) => ({
                                ...prev,
                                port: portNumber,
                                type: "FXS",
                              }));
                              setShowBatchModify(true);
                            }}
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
                  padding: "10px 14px",
                  borderTop: `0.5px solid ${C.cardBorder}`,
                  background: "#f8fafc",
                  gap: 8,
                  flexWrap: "wrap",
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
              <div style={{ fontSize: 11, color: C.mutedText }}>
                PBX &rsaquo; Port FXS Advanced &rsaquo;{" "}
                <span style={{ color: C.valueText, fontWeight: 600 }}>
                  Modify
                </span>
              </div>
            </div>

            <div
              style={{
                background: C.cardBg,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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

              <div style={{ padding: "24px 32px" }}>
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
                            marginRight: "4px",
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
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
                      borderTop: `1px solid ${C.cardBorder}`,
                    }}
                  >
                    <Btn
                      onClick={handleSave}
                      style={{ padding: "8px 36px", fontSize: 13 }}
                    >
                      Modify
                    </Btn>
                    <Btn
                      onClick={handleReset}
                      variant="outline"
                      style={{ padding: "8px 36px", fontSize: 13 }}
                    >
                      Reset
                    </Btn>
                    <Btn
                      onClick={handleCancel}
                      variant="outline"
                      style={{ padding: "8px 36px", fontSize: 13 }}
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
