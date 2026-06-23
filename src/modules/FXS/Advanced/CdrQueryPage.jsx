import React, { useState } from "react";
import {
  CDR_QUERY_INITIAL_FORM,
  PORT_OPTIONS,
  CALL_DIRECTION_OPTIONS,
} from "../../../constants/CdrQueryConstants";
import {
  Alert,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  labelText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
};

const CDR_QUERY_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const CDR_QUERY_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const CDR_QUERY_TABLE_CONTAINER =
  "w-full max-w-full mx-auto overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)] mb-[24px]";
const CDR_QUERY_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const CDR_QUERY_FORM_BODY = "px-[20px] pt-[12px]";
const CDR_QUERY_FORM_FOOTER =
  "flex flex-wrap items-center justify-center gap-[12px] w-[calc(100%+40px)] -ml-[20px] -mr-[20px] mt-0 mb-0 border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";

const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";

const Btn = ({ children, onClick, disabled, variant = "formPrimary", type }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={BTN_FORM_PRIMARY}
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

const CdrQueryBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const CdrQueryPageShell = ({ children, fullWidth = false }) => (
  <div className={CDR_QUERY_PAGE_WRAP}>
    <div
      className={fullWidth ? "w-full max-w-full mx-auto" : CDR_QUERY_PAGE_INNER}
    >
      {children}
    </div>
  </div>
);

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

const CdrQueryFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div className={CDR_QUERY_TABLE_CONTAINER}>
    <div className={CDR_QUERY_BLUE_BAR}>
      <span>{title}</span>
    </div>
    <div
      className={footer ? CDR_QUERY_FORM_BODY : `${CDR_QUERY_FORM_BODY} pb-[12px]`}
    >
      <div
        className={
          fullWidthContent
            ? "flex flex-col gap-[14px] w-full max-w-full"
            : "flex flex-col gap-[14px] mx-auto max-w-[560px]"
        }
      >
        {children}
      </div>
      {footer ? <div className={CDR_QUERY_FORM_FOOTER}>{footer}</div> : null}
    </div>
  </div>
);

const CDR_LABEL_WIDTH = 190;
const CDR_FIELD_GAP = 16;

const CdrFieldRow = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: CDR_FIELD_GAP,
    }}
  >
    <label
      style={{
        width: CDR_LABEL_WIDTH,
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        textAlign: "left",
      }}
    >
      {label}
    </label>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </div>
);

const CdrQueryPage = () => {
  const [formData, setFormData] = useState(CDR_QUERY_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if ((key > 47 && key < 59) || key === 45 || key === 32) {
    } else if (key !== 8) {
      e.preventDefault();
    }
  };

  const handleStringKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (
      key === 32 ||
      key === 46 ||
      key === 95 ||
      key === 8 ||
      (key >= 48 && key <= 57) ||
      (key >= 65 && key <= 90) ||
      (key >= 97 && key <= 122)
    ) {
    } else {
      e.preventDefault();
    }
  };

  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (key > 47 && key < 58) {
    } else if (key !== 8) {
      e.preventDefault();
    }
  };

  const handleQuery = () => {
    if (
      formData.startdate &&
      formData.enddate &&
      formData.startdate > formData.enddate
    ) {
      alert("The Ending Date should not be earlier than the Starting Date!");
      return;
    }

    const minTalkTime = Number(formData.mintalktime);
    const maxTalkTime = Number(formData.maxtalktime);
    if (
      formData.mintalktime &&
      formData.maxtalktime &&
      minTalkTime > maxTalkTime
    ) {
      alert(
        "The max talk duration should not be smaller than the min talk duration!",
      );
      return;
    }

    alert("Query submitted successfully!");
  };

  const compactFieldSx = {
    ...muiTextFieldSx,
    width: 132,
  };

  return (
    <CdrQueryPageShell>
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
      <CdrQueryBreadcrumb current="CDR Query" />
      <CdrQueryFormCard
        title="CDR Query"
        footer={
          <Btn type="button" onClick={handleQuery} variant="formPrimary">
            Query
          </Btn>
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            paddingTop: 8,
            paddingBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            <CdrFieldRow label="Starting Date">
              <TextField
                id="startdate"
                type="date"
                value={formData.startdate || ""}
                onChange={(e) => handleInputChange("startdate", e.target.value)}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="Ending Date">
              <TextField
                id="enddate"
                type="date"
                value={formData.enddate || ""}
                onChange={(e) => handleInputChange("enddate", e.target.value)}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="Port">
              <FormControl size="small" sx={{ width: 132 }}>
                <MuiSelect
                  value={formData.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  sx={muiSelectSx}
                >
                  {PORT_OPTIONS.map((opt) => (
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
            </CdrFieldRow>
            <CdrFieldRow label="Call Direction">
              <FormControl size="small" sx={{ width: 132 }}>
                <MuiSelect
                  value={formData.billtype}
                  onChange={(e) =>
                    handleInputChange("billtype", e.target.value)
                  }
                  sx={muiSelectSx}
                >
                  {CALL_DIRECTION_OPTIONS.map((opt) => (
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
            </CdrFieldRow>
            <CdrFieldRow label="CallerID">
              <TextField
                id="callingnum"
                value={formData.callingnum || ""}
                onChange={(e) =>
                  handleInputChange("callingnum", e.target.value)
                }
                onKeyPress={handleStringKeyPress}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="CalleeID">
              <TextField
                id="callednum"
                value={formData.callednum || ""}
                onChange={(e) => handleInputChange("callednum", e.target.value)}
                onKeyPress={handleStringKeyPress}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
            <CdrFieldRow label="Call Duration(s)">
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <TextField
                  id="mintalktime"
                  value={formData.mintalktime || ""}
                  onChange={(e) =>
                    handleInputChange("mintalktime", e.target.value)
                  }
                  onKeyPress={handleNumberKeyPress}
                  size="small"
                  variant="outlined"
                  sx={{ ...muiTextFieldSx, width: 54.5 }}
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
                <span style={{ fontSize: 13, color: C.mutedText }}>—</span>
                <TextField
                  id="maxtalktime"
                  value={formData.maxtalktime || ""}
                  onChange={(e) =>
                    handleInputChange("maxtalktime", e.target.value)
                  }
                  onKeyPress={handleNumberKeyPress}
                  size="small"
                  variant="outlined"
                  sx={{ ...muiTextFieldSx, width: 54.5 }}
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
              </div>
            </CdrFieldRow>
            <CdrFieldRow label="Keyword">
              <TextField
                id="keyword"
                value={formData.keyword || ""}
                onChange={(e) => handleInputChange("keyword", e.target.value)}
                onKeyPress={handleStringKeyPress}
                size="small"
                variant="outlined"
                sx={compactFieldSx}
                inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
              />
            </CdrFieldRow>
          </div>
        </div>
      </CdrQueryFormCard>
    </CdrQueryPageShell>
  );
};

export default CdrQueryPage;
