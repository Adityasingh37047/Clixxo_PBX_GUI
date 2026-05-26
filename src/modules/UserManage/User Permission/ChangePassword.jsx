import React, { useState, useEffect } from "react";
import { fetchChangePassword } from "../../../api/apiService";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  IconButton,
  InputAdornment,
  TextField,
  Paper,
  Typography,
  Alert,
} from "@mui/material";

import {
  CHANGE_PASSWORD_FIELDS,
  CHANGE_PASSWORD_INITIAL_FORM,
  CHANGE_PASSWORD_BUTTONS,
  CHANGE_PASSWORD_NOTE,
} from "../../../constants/ChangePasswordConstants";
import Button from "@mui/material/Button";

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
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
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
      borderRadius: 6,
      boxShadow: "0 2px 8px #3E5475",
      textTransform: "none",
      padding: "6px 28px",
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "danger":
        return "#b91c1c";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type={type}
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
    </button>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  paddingBottom: "24px",
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginLeft: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
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

        <div style={tableContainerStyle}>
          {/* Header */}
          <div style={blueBarStyle}>Change Password</div>

          <form
            onSubmit={handleSave}
            style={{
              padding: "32px 24px",
              maxWidth: 500,
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div className="space-y-4">
              {CHANGE_PASSWORD_FIELDS.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center"
                  style={{ flexWrap: "wrap" }}
                >
                  <label
                    style={{
                      width: "auto",
                      minWidth: 130,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.labelText,
                      textAlign: "left",
                      marginRight: 10,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {field.label}:
                  </label>
                  <div className="flex-1 flex flex-col">
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
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            height: 36,
                            fontSize: 13,
                            backgroundColor: C.cardBg,
                            transition: "border-color 0.2s ease",
                            "& fieldset": {
                              borderColor: fieldErrors[field.name]
                                ? C.errorRed
                                : C.cardBorder,
                              transition: "border-color 0.2s ease",
                            },
                            "&:hover fieldset": {
                              borderColor: fieldErrors[field.name]
                                ? C.errorRed
                                : "#94a3b8",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: fieldErrors[field.name]
                                ? C.errorRed
                                : C.accent,
                            },
                          },
                          "& .MuiInputBase-input": {
                            fontSize: 13,
                            color: C.valueText,
                            padding: "6px 10px",
                            textAlign: "center",
                          },
                        }}
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
                        sx={{
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            height: 36,
                            fontSize: 13,
                            backgroundColor:
                              field.name === "username" || loading
                                ? "#f1f5f9"
                                : C.cardBg,
                            transition: "border-color 0.2s ease",
                            "& fieldset": {
                              borderColor: fieldErrors[field.name]
                                ? C.errorRed
                                : C.cardBorder,
                              transition: "border-color 0.2s ease",
                            },
                            "&:hover fieldset": {
                              borderColor:
                                field.name === "username" || loading
                                  ? C.cardBorder
                                  : fieldErrors[field.name]
                                    ? C.errorRed
                                    : "#94a3b8",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: fieldErrors[field.name]
                                ? C.errorRed
                                : C.accent,
                            },
                            "&.Mui-disabled": {
                              cursor: "not-allowed",
                            },
                            "&.Mui-disabled fieldset": {
                              borderColor: C.cardBorder,
                            },
                          },
                          "& .MuiInputBase-input": {
                            fontSize: 13,
                            color: C.valueText,
                            padding: "6px 10px",
                            textAlign: "center",
                          },
                          "& .MuiInputBase-input.Mui-disabled": {
                            color: "#94a3b8",
                            WebkitTextFillColor: "#94a3b8",
                          },
                        }}
                      />
                    )}
                    {fieldErrors[field.name] && (
                      <div
                        style={{
                          color: C.errorRed,
                          fontSize: "12px",
                          marginTop: "4px",
                          marginLeft: "4px",
                        }}
                      >
                        {fieldErrors[field.name]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8 gap-4">
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={loading}
                type="submit"
                style={{ minWidth: 110, height: 36, fontSize: 13, letterSpacing: "0.2px" }}
              >
                {loading ? "Changing Password..." : "Save"}
              </Btn>
            </div>
          </form>
        </div>

        {/* Red note text in background */}
        <div className="w-full text-center mt-6">
          <Typography
            variant="body2"
            sx={{
              color: C.errorRed,
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {CHANGE_PASSWORD_NOTE}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
