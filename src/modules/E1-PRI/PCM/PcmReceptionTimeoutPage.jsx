import React, { useState, useEffect } from "react";
import {
  PCM_RECEPTION_TIMEOUT_FIELDS,
  PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
  PCM_RECEPTION_TIMEOUT_TABLE_COLUMNS,
} from "../../../constants/PcmReceptionTimeoutConstants";
import EditIcon from "@mui/icons-material/Edit";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";

// ── Theme tokens ──────────────────────────────────────────────────────────────
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

// ── Reusable Button ───────────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "outline",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: C.accent,
      color: "#fff",
      border: `1px solid ${C.cardBorder}`,
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.outline;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
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

// ── Reusable Table Header ─────────────────────────────────────────────────────
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
      borderRight: `0.5px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const PcmReceptionTimeoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
  });
  const [timeoutData, setTimeoutData] = useState(
    PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
  );

  const handleOpenModal = () => {
    setFormData({ ...timeoutData });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setTimeoutData(formData);
    setIsModalOpen(false);
  };

  return (
    <div
      style={{
        background: C.pageBg,
        minHeight: "calc(100vh - 120px)",
        padding: "24px 20px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: C.mutedText, marginBottom: 12 }}>
          E1-PRI &rsaquo; PCM &rsaquo;{" "}
          <span style={{ color: C.valueText, fontWeight: 600 }}>
            Number-Receiving Timeout Info
          </span>
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
            <span
              style={{
                background: "#f1f5f9",
                border: `0.5px solid ${C.cardBorder}`,
                color: "#475569",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 12px",
                borderRadius: 8,
              }}
            >
              Number-Receiving Timeout Info
            </span>
            {/* <Btn onClick={handleOpenModal} variant="accent">
              ✏ Edit
            </Btn> */}
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table
              className="w-full border-collapse whitespace-nowrap"
              style={{ tableLayout: "auto" }}
            >
              <colgroup>
                <col style={{ width: "33%" }} />
                <col style={{ width: "33%" }} />
                <col style={{ width: "34%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TH>Inter Digit Timeout(s)</TH>
                  <TH>Description</TH>
                  <TH>Modify</TH>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={{
                    background: "#ffffff",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  <td
                    style={{
                      padding: "9px 8px",
                      textAlign: "center",
                      fontSize: 13,
                      color: C.valueText,
                      borderBottom: "1px solid #e2e8f0",
                      borderRight: "0.5px solid #e2e8f0",
                    }}
                  >
                    {timeoutData.interDigitTimeout}
                  </td>
                  <td
                    style={{
                      padding: "9px 8px",
                      textAlign: "center",
                      fontSize: 13,
                      color: C.valueText,
                      borderBottom: "1px solid #e2e8f0",
                      borderRight: "0.5px solid #e2e8f0",
                    }}
                  >
                    {timeoutData.description}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      borderBottom: "1px solid #e2e8f0",
                      borderRight: "0.5px solid #e2e8f0",
                      width: 80,
                    }}
                  >
                    <IconButton
                      onClick={handleOpenModal}
                      sx={{
                        padding: "4px",
                        color: C.accent,
                        "&:hover": { backgroundColor: "#e2e8f0" },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 500,
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
            textAlign: "center",
            padding: "16px 24px",
          }}
        >
          Number-Receiving Timeout
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "#f8fafc" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
            }}
          >
            {PCM_RECEPTION_TIMEOUT_FIELDS.map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  padding: "6px 12px",
                  gap: 12,
                  minHeight: 40,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    width: 160,
                  }}
                >
                  {field.label}:
                </label>
                <div className="flex-1" style={{ maxWidth: 280 }}>
                  <TextField
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    size="small"
                    fullWidth
                    variant="outlined"
                    placeholder={field.placeholder || ""}
                    sx={{
                      fontSize: 13,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#cbd5e1",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#94a3b8",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1e2d42",
                      },
                    }}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <Btn
            onClick={handleSave}
            variant="accent"
            style={{ padding: "8px 24px", fontSize: 13, minWidth: 100 }}
          >
            Save
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="outline"
            style={{ padding: "8px 24px", fontSize: 13, minWidth: 100 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PcmReceptionTimeoutPage;
