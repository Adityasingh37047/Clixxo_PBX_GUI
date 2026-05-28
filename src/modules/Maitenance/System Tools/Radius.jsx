import React, { useState } from "react";
import {
  RADIUS_FIELDS,
  LOCAL_IP_OPTIONS,
  CALL_TYPE_OPTIONS,
  RADIUS_BUTTONS,
} from "../../../constants/RadiusConstants";
import {
  Checkbox,
  Select,
  MenuItem,
  FormControlLabel,
  Alert,
} from "@mui/material";

// ── Color palette (same as AccountManage) ────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

// ── Button Component (same as AccountManage) ─────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
  component,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  const Component = component || "button";

  return (
    <Component
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 36,
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
      {startIcon && <span style={{ display: "inline-flex" }}>{startIcon}</span>}
      {children}
    </Component>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  marginBottom: 24,
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "0 20px",
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = C.accent),
  onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#64748b";
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = C.cardBorder;
  },
};

const RADIUS_INITIAL_FORM = {
  radius: false,
  certification: false,
  allowCalls: false,
  localIp: "",
  masterServer: "",
  sharedKey: "",
  spareServer: "",
  spareSharedKey: "",
  timeout: "",
  retransmission: "",
  transmitInterval: "",
  callType: [],
};

const Radius = () => {
  const [form, setForm] = useState(RADIUS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCallTypeChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const arr = prev.callType || [];
      if (checked) {
        return { ...prev, callType: [...arr, value] };
      } else {
        return { ...prev, callType: arr.filter((v) => v !== value) };
      }
    });
  };

  const handleReset = () => {
    setForm(RADIUS_INITIAL_FORM);
    showToast("Form reset to default.", "success");
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Radius settings saved successfully!", "success");
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
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

      {/* ── Breadcrumb ── */}
      <div className="w-full" style={{ maxWidth: 1000 }}>
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>Radius</span>
        </div>

        <form onSubmit={handleSave} autoComplete="off">
          <div style={tableContainerStyle}>
            {/* Header */}
            <div style={blueBarStyle}>
              <span>Radius Configuration</span>
            </div>

            <div className="p-6">
              <div className="w-full max-w-[640px] mx-auto">
                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {RADIUS_FIELDS.map((field) =>
                    field.type === "checkboxGroup" ? (
                      <React.Fragment key={field.name || "callTypeGroup"}>
                        <div className="flex items-start min-h-[36px] pt-2 text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 break-words">
                          <span style={{ color: C.labelText }}>
                            {field.label}
                          </span>
                        </div>
                        <div className="flex flex-col min-h-[36px] pl-2 sm:pl-0 gap-0 pt-1">
                          {CALL_TYPE_OPTIONS.map((opt) => (
                            <FormControlLabel
                              key={opt.value}
                              control={
                                <Checkbox
                                  checked={form.callType.includes(opt.value)}
                                  onChange={handleCallTypeChange}
                                  name="callType"
                                  value={opt.value}
                                  sx={{
                                    "& .MuiSvgIcon-root": { fontSize: 20 },
                                    color: "#64748b",
                                    "&.Mui-checked": { color: C.accent },
                                  }}
                                />
                              }
                              label={
                                <span
                                  style={{ fontSize: 14, color: C.valueText }}
                                >
                                  {opt.label}
                                </span>
                              }
                              className="m-0 min-w-[140px] sm:min-w-[160px]"
                            />
                          ))}
                        </div>
                      </React.Fragment>
                    ) : (
                      <React.Fragment key={field.name}>
                        <div className="flex items-center text-[13px] font-semibold text-slate-500 text-left pl-2 sm:pl-4 break-words min-h-[36px]">
                          <span style={{ color: C.labelText }}>
                            {field.label}
                          </span>
                        </div>
                        <div className="flex items-center min-h-[36px] pl-2 sm:pl-0">
                          {field.type === "checkbox" ? (
                            <div className="flex items-center">
                              <Checkbox
                                checked={!!form[field.name]}
                                onChange={handleChange}
                                name={field.name}
                                sx={{
                                  "& .MuiSvgIcon-root": { fontSize: 20 },
                                  color: "#64748b",
                                  "&.Mui-checked": { color: C.accent },
                                }}
                              />
                              <span
                              // style={{
                              //   marginLeft: 4,
                              //   fontSize: 14,
                              //   color: C.valueText,
                              // }}
                              >
                                {field.enableLabel}
                              </span>
                            </div>
                          ) : field.type === "select" ? (
                            <Select
                              value={form[field.name] || ""}
                              onChange={handleChange}
                              name={field.name}
                              size="small"
                              variant="outlined"
                              className="w-full"
                              displayEmpty
                              sx={{
                                backgroundColor: "#f8fafc",
                                borderRadius: "6px",
                                fontSize: 14,
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: C.cardBorder,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#64748b",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: `${C.accent} !important`,
                                  },
                              }}
                            >
                              <MenuItem value="">
                                <em>Select Local IP</em>
                              </MenuItem>
                              {LOCAL_IP_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <input
                              type={
                                field.type === "password" ? "password" : "text"
                              }
                              name={field.name}
                              value={form[field.name] || ""}
                              onChange={handleChange}
                              style={{
                                padding: "8px 12px",
                                borderRadius: 6,
                                border: `1px solid ${C.cardBorder}`,
                                fontSize: 14,
                                width: "100%",
                                backgroundColor: "#f8fafc",
                                outline: "none",
                                color: C.valueText,
                                transition: "border-color 0.2s ease",
                              }}
                              {...inputInteraction}
                            />
                          )}
                        </div>
                      </React.Fragment>
                    ),
                  )}
                </div>

                {/* Action Buttons */}
                <div
                  className="flex flex-col sm:flex-row justify-center gap-6 mt-10 pt-6"
                  style={{ borderTop: `1px solid ${C.divider}` }}
                >
                  <Btn
                    type="button"
                    variant="cancel"
                    onClick={handleReset}
                    style={{ minWidth: 120, height: 38 }}
                  >
                    Reset
                  </Btn>
                  <Btn
                    type="submit"
                    variant="primary"
                    onClick={handleSave}
                    style={{ minWidth: 120, height: 38 }}
                  >
                    Save
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Radius;
