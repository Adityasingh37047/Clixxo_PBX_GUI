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
} from "@mui/material";

import {
  CHANGE_PASSWORD_FIELDS,
  CHANGE_PASSWORD_INITIAL_FORM,
  CHANGE_PASSWORD_BUTTONS,
  CHANGE_PASSWORD_NOTE,
} from "../../../constants/ChangePasswordConstants";
import Button from "@mui/material/Button";

const blueBarStyle = {
  width: "100%",
  height: 32,
  background: "linear-gradient(#3E5475 100%)",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  fontWeight: 600,
  fontSize: 18,
  color: "#ffffff",
  justifyContent: "center",
  boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)",
};
const buttonSx = {
  background:
    "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
  color: "#fff",
  fontWeight: 600,
  fontSize: "16px",
  borderRadius: 1.5,
  minWidth: 120,
  px: 2,
  py: 0.5,
  boxShadow: "0 2px 8px #3E5475",
  textTransform: "none",
  "&:hover": {
    background: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
    color: "#fff",
  },
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Pre-fill current username
  useEffect(() => {
    if (user?.username) {
      setForm((prev) => ({ ...prev, username: user.username }));
    }
  }, [user]);

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 5) return "Password must be at least 5 characters";
    if (password.length > 16) return "Password must be maximum 16 characters";
    return "";
  };

  const validateUsername = (username) => {
    if (!username) return "Username is required";
    if (username.length < 5) return "Username must be at least 5 characters";
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
        username:        form.username,
        newUsername:     form.newUsername || undefined,
        password:        form.password,
        confirmPassword: form.confirmPassword,
      });

      if (response.response === true) {
        alert("Credentials updated successfully! You will be redirected to login.");
        logout();
        navigate("/login");
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
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center md:p-2">
      <div className="w-full max-w-6xl mx-auto">
        {/* Error Message */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              color: "#dc2626",
              fontSize: "14px",
              maxWidth: "600px",
              width: "100%",
            }}
          >
            <span style={{ marginRight: "8px" }}>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading Message */}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
              padding: "12px 16px",
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "6px",
              color: "#1d4ed8",
              fontSize: "14px",
              maxWidth: "600px",
              width: "100%",
            }}
          >
            <span style={{ marginRight: "8px" }}>⏳</span>
            <span>Changing password...</span>
          </div>
        )}

        {/* Header */}
        <div style={blueBarStyle}>Change Password</div>

        {/* Content */}
        <Paper
          elevation={3}
          className="p-6 bg-white rounded-b-lg shadow-lg"
          style={{ borderTop: "none" }}
        >
          <div className="space-y-6">
            <form onSubmit={handleSave}>
              <div className="space-y-6 max-w-md mx-auto">
                {CHANGE_PASSWORD_FIELDS.map((field) => (
                  <div key={field.name} className="flex items-center">
                    <label className="w-48 text-left pr-6 text-gray-700 font-medium whitespace-nowrap">
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
                              backgroundColor: "#fff",
                              "& fieldset": {
                                borderColor: fieldErrors[field.name]
                                  ? "#dc2626"
                                  : "#ccc",
                              },
                              "&:hover fieldset": {
                                borderColor: fieldErrors[field.name]
                                  ? "#dc2626"
                                  : "#888",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: fieldErrors[field.name]
                                  ? "#dc2626"
                                  : "#888",
                              },
                            },
                            "& .MuiInputBase-input": {
                              fontSize: 15,
                              color: "#000",
                            },
                          }}
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
                                  sx={{
                                    color: "#666",
                                    "&:hover": {
                                      color: "#888",
                                    },
                                  }}
                                >
                                  {showPasswords[field.name] ? (
                                    <VisibilityOffIcon />
                                  ) : (
                                    <VisibilityIcon />
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
                          disabled={loading}
                          autoComplete="off"
                          variant="outlined"
                          size="small"
                          sx={{
                            width: "100%",
                            "& .MuiOutlinedInput-root": {
                              height: 36,
                              fontSize: 13,
                              backgroundColor:
                                field.name === "currentUsername"
                                  ? "#f5f5f5"
                                  : "#fff",
                              "& fieldset": {
                                borderColor: fieldErrors[field.name]
                                  ? "#dc2626"
                                  : "#ccc",
                              },
                              "&:hover fieldset": {
                                borderColor: fieldErrors[field.name]
                                  ? "#dc2626"
                                  : "#888",
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: fieldErrors[field.name]
                                  ? "#dc2626"
                                  : "#888",
                              },
                            },
                            "& .MuiInputBase-input": {
                              fontSize: 15,
                              color: "#000",
                            },
                          }}
                        />
                      )}
                      {fieldErrors[field.name] && (
                        <div
                          style={{
                            color: "#dc2626",
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

              <div className="flex justify-center mt-8">
                <Button
                  sx={buttonSx}
                  onClick={handleSave}
                  disabled={loading}
                  size="large"
                >
                  {loading ? "Changing Password..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </Paper>
      </div>

      {/* Red note text in background */}
      <div className="w-full text-center mt-6">
        <Typography
          variant="body2"
          sx={{
            color: "red",
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          {CHANGE_PASSWORD_NOTE}
        </Typography>
      </div>
    </div>
  );
};

export default ChangePassword;
