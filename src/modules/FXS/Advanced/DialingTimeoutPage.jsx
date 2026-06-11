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
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
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
      border: "1px solid #9ca3af",
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
      color: "#374151",
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


const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
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
  backgroundColor: "#fff",
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
};

const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "7px 8px",
};

const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

const numManipulateCardStyle = {
  background: "#ffffff",
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
  background: "#ffffff",
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
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
  overflow: "hidden",
};


const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
};

const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
  overflow: "hidden",
  marginBottom: 24,
};

const advancedBlueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const advancedFormBodyStyle = {
  padding: "12px 20px 0",
};

const advancedFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: C.pageBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "calc(100% + 40px)",
  marginLeft: -20,
  marginRight: -20,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const AdvancedBreadcrumb = ({ current }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
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
    <span>Advanced</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const AdvancedPageShell = ({ children, fullWidth = false }) => (
  <div style={advancedPageWrapStyle}>
    <div
      style={{
        ...advancedPageInnerStyle,
        maxWidth: fullWidth ? "100%" : advancedPageInnerStyle.maxWidth,
      }}
    >
      {children}
    </div>
  </div>
);

const wavFileNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: 0,
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  textAlign: "center",
  width: "100%",
};

const FieldRow = ({
  label,
  children,
  required,
  align = "center",
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
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
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label}
      {required && <span style={{ color: "#dc2626" }}> *</span>}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const AdvancedFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div style={advancedTableContainerStyle}>
    <div style={advancedBlueBarStyle}>
      <span>{title}</span>
    </div>
    <div
      style={{
        ...advancedFormBodyStyle,
        paddingBottom: footer ? 0 : 12,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: fullWidthContent ? "100%" : 560,
          width: fullWidthContent ? "100%" : undefined,
          margin: fullWidthContent ? 0 : "0 auto",
        }}
      >
        {children}
      </div>
      {footer ? (
        <div style={advancedFormInlineFooterStyle}>{footer}</div>
      ) : null}
    </div>
  </div>
);


const advancedModalPaperSx = {
  width: 500,
  maxWidth: "95vw",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const advancedModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
};

const addHostModalContentStyle = {
 padding: "20px 24px",
  paddingBottom: "16px",
  backgroundColor: "#ffffff",
};

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const addHostModalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 16px",
  borderTop: `1px solid ${C.cardBorder}`,
  background: "#f8fafc",
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
    <AdvancedPageShell>
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
      <AdvancedBreadcrumb current="Dialing Timeout" />
      <div style={numManipulateCardStyle}>
        <div style={{ overflowX: "auto", width: "100%" }}>
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
        PaperProps={{ sx: advancedModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={advancedModalTitleStyle}>
          Dialing Timeout
        </DialogTitle>
        <DialogContent style={addHostModalContentStyle}>
          <div style={addHostFormPanelStyle}>
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
        <DialogActions style={addHostModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            style={{ minWidth: 100, height: 34, fontSize: 13 }}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={{ minWidth: 100, height: 34 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </AdvancedPageShell>
  );
};

export default DialingTimeoutPage;
