import React, { useState } from "react";
import {
  PORT_FXS_ADVANCED_TABLE_COLUMNS,
  PORT_FXS_ADVANCED_ITEMS_PER_PAGE,
  PORT_FXS_ADVANCED_TOTAL_PORTS,
  PORT_FXS_ADVANCED_INITIAL_DATA,
  PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES,
  PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE,
  WEEK_DAYS,
} from "../../../sections/port/constants/PortFxsAdvancedPageConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  C,
  Btn,
  TH,
  checkboxSx,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
  PortBreadcrumb,
  FieldRow,
  advancedFormPanelStyle,
  advancedPageWrapStyle,
  advancedPageInnerStyle,
  routeTdStyle,
  routeThExtra,
  fxsNativeFieldInputStyle,
  fxsNativeFieldInteraction,
} from "../../../shared/fxsSharedUi";

const inputStyle = {
  ...fxsNativeFieldInputStyle,
  width: "100%",
  height: "auto",
  padding: "6px 8px",
};

const inputInteraction = fxsNativeFieldInteraction;

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenModal = (port = null) => {
    if (port) {
      setBatchForm((prev) => ({
        ...getInitialBatchForm(),
        port: String(port.port),
        type: port.type || "FXS",
      }));
    } else {
      setBatchForm(getInitialBatchForm());
    }
    setProhibitLimitCount(1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBatchForm(getInitialBatchForm());
    setProhibitLimitCount(1);
  };

  const handleBatchModify = () => {
    handleOpenModal();
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
    handleCloseModal();
  };

  const handleCancel = () => {
    handleCloseModal();
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
                {...inputInteraction}
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
                {...inputInteraction}
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
                {...inputInteraction}
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
                {...inputInteraction}
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
                {...inputInteraction}
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
                {...inputInteraction}
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
                    sx={{ ...checkboxSx, marginRight: "4px" }}
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

  const renderModalForm = () => (
    <form onSubmit={handleSave}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FieldRow label="Port:">
          <select
            value={batchForm.port}
            onChange={(e) => handleFormChange("port", e.target.value)}
            style={inputStyle}
            {...inputInteraction}
          >
            {Array.from({ length: PORT_FXS_ADVANCED_TOTAL_PORTS }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {i + 1}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow label="Type:">
          <input
            type="text"
            value={batchForm.type || "FXS"}
            onChange={(e) => handleFormChange("type", e.target.value)}
            style={inputStyle}
            {...inputInteraction}
            readOnly
          />
        </FieldRow>

        <FieldRow label="Forbid Outgoing Call:">
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
              sx={checkboxSx}
            />
            Enable
          </label>
        </FieldRow>

        {shouldShowField({ conditional: "forbidOutgoingCall" }) && (
          <FieldRow label="Way Of Forbid Outgoing Call:">
            <select
              value={batchForm.wayOfForbidOutgoingCall}
              onChange={(e) =>
                handleFormChange("wayOfForbidOutgoingCall", e.target.value)
              }
              style={inputStyle}
              {...inputInteraction}
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
                      variant="cancel"
                      onClick={() => handlePeriodCountChange("plus")}
                      style={{ padding: "4px 12px", height: 28 }}
                    >
                      + Add Period
                    </Btn>
                  )}
                  {prohibitLimitCount > 1 && (
                    <Btn
                      variant="cancel"
                      onClick={() => handlePeriodCountChange("minus")}
                      style={{ padding: "4px 12px", height: 28 }}
                    >
                      - Remove Period
                    </Btn>
                  )}
                </div>
              </div>
            </>
          )}

        <FieldRow label="Blacklist of FXS Out Calls:" align="flex-start">
          <textarea
            value={batchForm.blacklistOfFxsOutCalls}
            onChange={(e) =>
              handleFormChange("blacklistOfFxsOutCalls", e.target.value)
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
          marginTop: 24,
          padding: "0 4px",
          fontSize: 12,
          color: "#dc2626",
          textAlign: "center",
        }}
      >
        <div
          style={{
            lineHeight: 1.6,
            display: "inline-grid",
            gridTemplateColumns: "40px auto",
            textAlign: "left",
            columnGap: 0,
          }}
        >
          <div>Note:</div>
          <div>{PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES[0].replace(/^Note:/, "")}</div>
          <div></div>
          <div>{PORT_FXS_ADVANCED_BATCH_MODIFY_NOTES[1]}</div>
        </div>
      </div>
    </form>
  );

  return (
    <div style={advancedPageWrapStyle}>
      <div style={advancedPageInnerStyle}>
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

        <PortBreadcrumb segments={["FXS", "Port"]} current="FXS Advanced" />

        <div style={{ ...numManipulateCardStyle, display: "flex", flexDirection: "column" }}>
          <div style={numManipulateToolbarStyle}>
            <div />
            <Btn
              onClick={handleBatchModify}
              variant="primary"
              style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
            >
              Batch Modify
            </Btn>
          </div>

          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              width: "100%",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 600,
              }}
            >
              <thead>
                <tr>
                  {PORT_FXS_ADVANCED_TABLE_COLUMNS.map((col) => (
                    <TH
                      key={col.key}
                      style={{
                        ...(col.key === "modify"
                          ? { width: 70, borderRight: "none" }
                          : {}),
                        ...routeThExtra,
                      }}
                    >
                      {col.label}
                    </TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedPorts.map((port, idx) => {
                  const rowBg = idx % 2 === 1 ? "#f8fafc" : "#ffffff";
                  const isLastRow = idx === pagedPorts.length - 1;
                  const lastRowCellStyle = isLastRow
                    ? { borderBottom: "none" }
                    : {};
                  return (
                    <tr
                      key={port.port}
                      style={{
                        background: rowBg,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f1f5f9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = rowBg;
                      }}
                    >
                      {PORT_FXS_ADVANCED_TABLE_COLUMNS.map((col) => {
                        if (col.key === "modify") {
                          return (
                            <td
                              key={col.key}
                              style={{
                                ...routeTdStyle,
                                background: rowBg,
                                borderRight: "none",
                                ...lastRowCellStyle,
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "center" }}>
                                <EditDocumentIcon
                                  titleAccess="Edit"
                                  style={{
                                    cursor: "pointer",
                                    color: "#2563eb",
                                    fontSize: 22,
                                    opacity: 0.7,
                                    transition: "opacity 0.15s ease",
                                  }}
                                  onClick={() => handleOpenModal(port)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = "1";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.opacity = "0.7";
                                  }}
                                />
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td
                            key={col.key}
                            style={{
                              ...routeTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {port[col.key]}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {ports.length > 0 && (
            <div style={numManipulatePaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedPorts.length} record{pagedPorts.length !== 1 ? "s" : ""} on
                page {page}
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

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth={false}
          PaperProps={{
            sx: {
              width: 720,
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
            {PORT_FXS_ADVANCED_BATCH_MODIFY_TITLE}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              maxHeight: "75vh",
              overflowY: "auto",
            }}
          >
            <div style={advancedFormPanelStyle}>{renderModalForm()}</div>
          </DialogContent>
          <DialogActions
            style={{
              padding: "16px 24px",
              background: "#f8fafc",
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
              Modify
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              style={{ minWidth: 100, height: 33 }}
            >
              Reset
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
    </div>
  );
};

export default PortFxsAdvancedPage;
