import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material"; 
import { fetchChangePassword } from "../../../api/apiService";
import useAuth from "../../../context/useAuth";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { IconButton, InputAdornment, TextField, Alert } from "@mui/material";
import {
  CHANGE_PASSWORD_FIELDS,
  CHANGE_PASSWORD_INITIAL_FORM,
  CHANGE_PASSWORD_NOTE,
} from "../../../constants/ChangePasswordConstants";

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  divider: "var(--border-subtle)",
  cardShadow: "var(--shadow-soft)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  strongText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};
// ── Local field UI (inlined from userManageSharedUi) ──
const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";
const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onFocus(e);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onBlur(e);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseEnter(e);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    nativeFieldInteraction.onMouseLeave(e);
  },
};

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
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

const userPermissionMuiTextFieldSx = {
  ...muiTextFieldSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 36,
    fontSize: 13,
    backgroundColor: "var(--bg-surface)",
  },
  "& .MuiInputBase-input": {
    fontSize: 13,
    padding: "6px 10px",
    textAlign: "center",
  },
};

const getUserPermissionMuiTextFieldSx = ({
  hasError = false,
  disabled = false,
  readOnlyLook = false,
} = {}) => {
  const errorColor = "#dc2626";
  const borderDefault = hasError ? errorColor : OUTLINED_BORDER;
  const borderHover =
    disabled || readOnlyLook
      ? borderDefault
      : hasError
        ? errorColor
        : OUTLINED_HOVER;
  const borderFocus = hasError ? errorColor : OUTLINED_FOCUS;

  return {
    ...userPermissionMuiTextFieldSx,
    "& .MuiOutlinedInput-root": {
      ...userPermissionMuiTextFieldSx["& .MuiOutlinedInput-root"],
      backgroundColor: readOnlyLook ? "#f1f5f9" : "#fff",
      transition: "border-color 0.2s ease",
      "& fieldset": {
        borderColor: borderDefault,
        transition: "border-color 0.2s ease",
      },
      "&:hover fieldset": {
        borderColor: borderHover,
      },
      "&.Mui-focused fieldset": {
        borderColor: borderFocus,
        borderWidth: 2,
      },
      "&.Mui-disabled fieldset": {
        borderColor: OUTLINED_BORDER,
      },
    },
    "& .MuiInputBase-input.Mui-disabled": readOnlyLook
      ? {
          color: "var(--text-muted)",
          WebkitTextFillColor: "#94a3b8",
        }
      : {},
  };
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

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;
const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  error: BTN_ERROR,
  delete: BTN_DELETE,
  edit: BTN_EDIT,
  danger: BTN_ERROR,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title, form }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "var(--text-primary)",
  borderBottom: `1px solid ${C.divider}`,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
};

const ChangePassword = () => {
  const [form, setForm] = useState(CHANGE_PASSWORD_INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Pre-fill current username
  useEffect(() => {
    if (user?.username) {
      setForm((prev) => ({ ...prev, username: user.username }));
    }
  }, [user]);

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 5) return "Password must be at least 5 characters";
    if (password.length > 16) return "Password must be maximum 16 characters";
    return "";
  };

  const validateForm = () => {
    const errors = {};

    if (!form.username) errors.username = "Current username is required";

    if (form.newUsername && form.newUsername.length < 5)
      errors.newUsername = "New username must be at least 5 characters";

    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;

    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTogglePasswordVisibility = (fieldName) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the validation errors before saving.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      const response = await fetchChangePassword({
        username: form.username,
        newUsername: form.newUsername || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (response.response === true) {
        showToast("Credentials updated successfully! Redirecting...");
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 1500);
      } else {
        setError(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.message || "Error changing password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {/* Breadcrumb */}
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
          <span>User Manage</span>
          <span>&gt;</span>
          <span>User Permission</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Change Password
          </span>
        </div>

        {/* Global Toast */}
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999,
              boxShadow: C.cardShadow,
            }}
          >
            {toast.msg}
          </Alert>
        )}

        {/* Global Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999,
              boxShadow: C.cardShadow,
            }}
          >
            {error}
          </Alert>
        )}

        <div style={{ ...tableContainerStyle, marginBottom: 12 }}>
          <div style={blueBarStyle}>
            <span>Change Password</span>
          </div>

          <form onSubmit={handleSave} className="w-full">
            <div
              className="w-full px-5 pt-3 pb-0 flex flex-col items-center"
              style={{
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
            >
              <div
                className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center"
                style={{ marginBottom: 12 }}
              >
                {CHANGE_PASSWORD_FIELDS.map((field) => (
                  <React.Fragment key={field.name}>
                    <Tooltip title={tooltips[field.name] || ""} {...tooltipProps}>
                      <label style={labelStyle}>{field.label}:</label>
                    </Tooltip>
                    <div className="flex flex-col min-w-0 w-full">
                      {field.type === "password" ? (
                        <TextField
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          type={showPasswords[field.name] ? "text" : "password"}
                          disabled={loading}
                          autoComplete="off"
                          variant="outlined"
                          size="small"
                          sx={getUserPermissionMuiTextFieldSx({
                            hasError: !!fieldErrors[field.name],
                            disabled: loading,
                          })}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment
                                position="start"
                                sx={{ visibility: "hidden" }}
                              >
                                <IconButton size="small" edge="start" disabled>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() =>
                                    handleTogglePasswordVisibility(field.name)
                                  }
                                  edge="end"
                                  size="small"
                                  sx={{
                                    color: "#666",
                                    "&:hover": {
                                      color: "#888",
                                    },
                                  }}
                                >
                                  {showPasswords[field.name] ? (
                                    <VisibilityOffIcon fontSize="small" />
                                  ) : (
                                    <VisibilityIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      ) : (
                        <TextField
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          type="text"
                          disabled={loading || field.name === "username"}
                          autoComplete="off"
                          variant="outlined"
                          size="small"
                          sx={getUserPermissionMuiTextFieldSx({
                            hasError: !!fieldErrors[field.name],
                            disabled: loading || field.name === "username",
                            readOnlyLook: field.name === "username",
                          })}
                        />
                      )}
                      {fieldErrors[field.name] && (
                        <div
                          style={{
                            color: C.errorRed,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {fieldErrors[field.name]}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div
              style={{
                ...advancedFormInlineFooterStyle,
                width: "100%",
                marginLeft: 0,
                marginRight: 0,
              }}
            >
              <Btn
                variant="primary"
                disabled={loading}
                type="submit"
                style={advancedFormBtnStyle}
              >
                {loading ? "Changing Password..." : "Save"}
              </Btn>
            </div>
          </form>
        </div>

        <p
          style={{
            margin: "16px 0 0",
            textAlign: "center",
            fontSize: 12,
            color: "#dc2626",
            width: "100%",
            whiteSpace: "nowrap",
            overflowX: "auto",
            lineHeight: 1.45,
          }}
        >
          {CHANGE_PASSWORD_NOTE}
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
