import React, { useState } from "react";
import {
  DIALING_TIMEOUT_TABLE_COLUMNS,
  DIALING_TIMEOUT_INITIAL_FORM,
  DIALING_TIMEOUT_INITIAL_DATA,
} from "../../../constants/DialingTimeoutConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
};

const DIALING_TIMEOUT_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const DIALING_TIMEOUT_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const DIALING_TIMEOUT_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const DIALING_TIMEOUT_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[10px]";
const DIALING_TIMEOUT_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[10px]";

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[34px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DIALOG_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[34px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const btnVariantCls = {
  cancel: BTN_CANCEL,
  dialogPrimary: BTN_DIALOG_PRIMARY,
  dialogCancel: BTN_DIALOG_CANCEL,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "dialogPrimary",
  className = "",
  style,
  type,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={style}
    className={`${btnVariantCls[variant] || BTN_DIALOG_PRIMARY} ${className}`.trim()}
  >
    {children}
  </button>
);

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

const routeTdStyle = tdStyle;

const routeThExtra = {};

const DialingTimeoutBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const DialingTimeoutPageShell = ({ children }) => (
  <div className={DIALING_TIMEOUT_PAGE_WRAP}>
    <div className={DIALING_TIMEOUT_PAGE_INNER}>{children}</div>
  </div>
);

const FieldRow = ({
  label,
  children,
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      minHeight: 32,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
      }}
    >
      {label}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const dialingTimeoutModalPaperSx = {
  width: 500,
  maxWidth: "95vw",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const DIALING_TIMEOUT_MODAL_TITLE_STYLE = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
};

const DIALING_TIMEOUT_MODAL_CONTENT_STYLE = {
  padding: "20px 24px",
  paddingBottom: "16px",
  backgroundColor: "var(--bg-surface)",
};

const DIALING_TIMEOUT_MODAL_FORM_PANEL_STYLE = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const DIALING_TIMEOUT_MODAL_FOOTER_STYLE = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 16px",
  borderTop: `1px solid ${C.cardBorder}`,
  background: "var(--row-alt)",
};

const DIALING_TIMEOUT_FIELD_LABEL_WIDTH = 220;

const dialingTimeoutTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
};

const dialingTimeoutInputProps = {
  style: {
    fontSize: 13,
    height: 32,
    padding: "0 8px",
    boxSizing: "border-box",
  },
};

const DialingTimeoutPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DIALING_TIMEOUT_INITIAL_FORM);
  const [timeoutData, setTimeoutData] = useState(DIALING_TIMEOUT_INITIAL_DATA);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleOpenModal = () => {
    setFormData({
      interDigitTimeout: String(timeoutData.interDigitTimeout),
      offHookTimeout: String(timeoutData.offHookTimeout),
      description: timeoutData.description || "example",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(DIALING_TIMEOUT_INITIAL_FORM);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.description || formData.description.trim() === "") {
      alert("Description is required.");
      return;
    }

    if (
      !formData.interDigitTimeout ||
      formData.interDigitTimeout.trim() === ""
    ) {
      alert("Inter Digit Timeout is required.");
      return;
    }

    const interDigit = parseInt(formData.interDigitTimeout);
    if (isNaN(interDigit) || interDigit < 0) {
      alert("Inter Digit Timeout must be a valid positive number.");
      return;
    }

    if (!formData.offHookTimeout || formData.offHookTimeout.trim() === "") {
      alert("Off-hook Waiting Keypress Timeout is required.");
      return;
    }

    const offHook = parseInt(formData.offHookTimeout);
    if (isNaN(offHook) || offHook < 0) {
      alert(
        "Off-hook Waiting Keypress Timeout must be a valid positive number.",
      );
      return;
    }

    setTimeoutData({
      ...timeoutData,
      interDigitTimeout: interDigit,
      offHookTimeout: offHook,
      description: formData.description.trim(),
    });

    alert("Dialing timeout settings saved successfully!");
    handleCloseModal();
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 8 || key === 127)) {
      e.preventDefault();
    }
  };

  return (
    <DialingTimeoutPageShell>
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
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <DialingTimeoutBreadcrumb current="Dialing Timeout" />
      <div className={DIALING_TIMEOUT_CARD}>
        <div className="w-full overflow-x-auto">
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr>
                {DIALING_TIMEOUT_TABLE_COLUMNS.map((col, colIdx) => (
                  <TH
                    key={col.key}
                    style={{
                      ...routeThExtra,
                      ...(col.key === "modify" ? { width: 70 } : {}),
                      ...(colIdx === 0 ? { borderLeft: "none" } : {}),
                      ...(colIdx === DIALING_TIMEOUT_TABLE_COLUMNS.length - 1
                        ? { borderRight: "none" }
                        : {}),
                    }}
                  >
                    {col.label}
                  </TH>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {DIALING_TIMEOUT_TABLE_COLUMNS.map((col, colIdx) => (
                  <td
                    key={col.key}
                    style={{
                      ...routeTdStyle,
                      borderBottom: "none",
                      ...(colIdx === 0 ? { borderLeft: "none" } : {}),
                      ...(colIdx === DIALING_TIMEOUT_TABLE_COLUMNS.length - 1
                        ? { borderRight: "none" }
                        : {}),
                    }}
                  >
                    {col.key === "modify" ? (
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
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
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.7";
                          }}
                          onClick={handleOpenModal}
                        />
                      </div>
                    ) : (
                      timeoutData[col.key]
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: dialingTimeoutModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={DIALING_TIMEOUT_MODAL_TITLE_STYLE}>
          Dialing Timeout
        </DialogTitle>
        <DialogContent style={DIALING_TIMEOUT_MODAL_CONTENT_STYLE}>
          <div style={DIALING_TIMEOUT_MODAL_FORM_PANEL_STYLE}>
            <FieldRow
              label="Description:"
              labelWidth={DIALING_TIMEOUT_FIELD_LABEL_WIDTH}
            >
              <TextField
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                size="small"
                fullWidth
                variant="outlined"
                sx={dialingTimeoutTextFieldSx}
                inputProps={dialingTimeoutInputProps}
              />
            </FieldRow>
            <FieldRow
              label="Inter Digit Timeout (s):"
              labelWidth={DIALING_TIMEOUT_FIELD_LABEL_WIDTH}
            >
              <TextField
                name="interDigitTimeout"
                value={formData.interDigitTimeout || ""}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                size="small"
                fullWidth
                variant="outlined"
                sx={dialingTimeoutTextFieldSx}
                inputProps={dialingTimeoutInputProps}
              />
            </FieldRow>
            <FieldRow
              label="Off-hook waiting digit timeout(s):"
              labelWidth={DIALING_TIMEOUT_FIELD_LABEL_WIDTH}
            >
              <TextField
                name="offHookTimeout"
                value={formData.offHookTimeout || ""}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                size="small"
                fullWidth
                variant="outlined"
                sx={dialingTimeoutTextFieldSx}
                inputProps={dialingTimeoutInputProps}
              />
            </FieldRow>
          </div>
        </DialogContent>
        <DialogActions style={DIALING_TIMEOUT_MODAL_FOOTER_STYLE}>
          <Btn variant="dialogPrimary" onClick={handleSave}>
            Save
          </Btn>
          <Btn variant="dialogCancel" onClick={handleCloseModal}>
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </DialingTimeoutPageShell>
  );
};

export default DialingTimeoutPage;
