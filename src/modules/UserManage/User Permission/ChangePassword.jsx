import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
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
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  errorRed: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
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

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const tooltips = {
  username: "The current username of the user.",
  newUsername: "The new username of the user.",
  password: "The password of the user.",
  confirmPassword: "The confirmation password of the user.",
};

const getUserPermissionMuiTextFieldSx = ({
  hasError = false,
  disabled = false,
  readOnlyLook = false,
} = {}) => {
  const errorColor = C.errorRed;
  const borderDefault = hasError ? errorColor : OUTLINED_BORDER;
  const borderHover =
    disabled || readOnlyLook
      ? borderDefault
      : hasError
        ? errorColor
        : OUTLINED_HOVER;
  const borderFocus = hasError ? errorColor : OUTLINED_FOCUS;

  return {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      height: 34,
      fontSize: 13,
      backgroundColor: readOnlyLook ? "#f1f5f9" : "#fff",
      borderRadius: `${FIELD_RADIUS}px`,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "& fieldset": {
        borderColor: borderDefault,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      },
      "&:hover fieldset": {
        borderColor: borderHover,
      },
      "&.Mui-focused fieldset": {
        borderColor: borderFocus,
        borderWidth: "1px",
        boxShadow: hasError
          ? `0 0 0 2px rgba(220, 38, 38, 0.15)`
          : `0 0 0 2px rgba(62, 84, 117, 0.15)`,
      },
      "&.Mui-disabled fieldset": {
        borderColor: readOnlyLook ? "#e2e8f0" : OUTLINED_BORDER,
      },
    },
    "& .MuiInputBase-input": {
      fontSize: 13,
      padding: "6px 10px",
      color: C.valueText,
    },
    "& .MuiInputBase-input.Mui-disabled": readOnlyLook
      ? {
          color: C.mutedText,
          WebkitTextFillColor: C.mutedText,
        }
      : {},
  };
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
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
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize: variant === "primary" || variant === "cancel" ? 14 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: variant === "primary" || variant === "cancel" ? 38 : 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </button>
  );
};

const pageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 12,
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
  width: "100%",
};

const fixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  wordBreak: "break-word",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const PageShell = ({ children }) => (
  <div style={pageWrapStyle} data-native-scroll>
    <div style={pageInnerStyle}>{children}</div>
  </div>
);

const ChangePasswordBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 12,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>User Manage</span>
    <span>&gt;</span>
    <span>User Permission</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>Change Password</span>
  </div>
);

const FieldRow = ({ name, label, children }) => {
  const tooltip = tooltips[name];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center w-full gap-2 sm:gap-4">
      <Tooltip
        title={tooltip || ""}
        disableHoverListener={!tooltip}
        {...tooltipProps}
      >
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.labelText,
            width: "100%",
            maxWidth: 220,
            flexShrink: 0,
            cursor: tooltip ? "help" : "default",
          }}
        >
          {label}
        </label>
      </Tooltip>
      <div className="flex-1 w-full max-w-[280px]">{children}</div>
    </div>
  );
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

  useEffect(() => {
    if (user?.username) {
      setForm((prev) => ({ ...prev, username: user.username }));
    }
  }, [user]);

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
    <PageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={fixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            ...fixedAlertSx,
            top: toast.msg ? 88 : 20,
          }}
        >
          {error}
        </Alert>
      )}

      <ChangePasswordBreadcrumb />

      <div>
        <div style={tableContainerStyle}>
          <div style={toolbarStyle}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                letterSpacing: "0.02em",
              }}
            >
              Change Password
            </span>
          </div>

          <form id="change-password-form" onSubmit={handleSave}>
            <div style={{ padding: "24px 36px 32px" }}>
              <div
                className="flex flex-col w-full"
                style={{
                  ...fieldGroupStyle,
                  maxWidth: 640,
                  margin: "0 auto",
                }}
              >
                {CHANGE_PASSWORD_FIELDS.map((field) => (
                  <FieldRow
                    key={field.name}
                    name={field.name}
                    label={`${field.label}:`}
                  >
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
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() =>
                                    handleTogglePasswordVisibility(field.name)
                                  }
                                  edge="end"
                                  size="small"
                                  disabled={loading}
                                  sx={{
                                    color: C.mutedText,
                                    "&:hover": {
                                      color: C.accent,
                                      backgroundColor: "rgba(62, 84, 117, 0.06)",
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
                            fontWeight: 500,
                          }}
                        >
                          {fieldErrors[field.name]}
                        </div>
                      )}
                    </div>
                  </FieldRow>
                ))}
              </div>
            </div>

            <div style={advancedFormInlineFooterStyle}>
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
            color: C.accent,
            width: "100%",
            lineHeight: 1.45,
            whiteSpace: "normal",
            overflowWrap: "break-word",
          }}
        >
          {CHANGE_PASSWORD_NOTE}
        </p>
      </div>
    </PageShell>
  );
};

export default ChangePassword;
