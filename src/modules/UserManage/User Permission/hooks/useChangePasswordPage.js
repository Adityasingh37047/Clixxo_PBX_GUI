import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchChangePassword } from "../../../../api/apiService";
import useAuth from "../../../../context/useAuth";
import {
  CHANGE_PASSWORD_DEFAULT_TOAST,
  CHANGE_PASSWORD_ERROR_HIDE_MS,
  CHANGE_PASSWORD_INITIAL_FORM,
  CHANGE_PASSWORD_MESSAGES,
  CHANGE_PASSWORD_REDIRECT_DELAY_MS,
  CHANGE_PASSWORD_TOAST_DURATION_MS,
} from "../../../../constants/ChangePasswordConstants";
import { buildChangePasswordPayload } from "../utils/ChangePasswordTransformers";
import { validateChangePasswordForm } from "../utils/ChangePasswordValidators";

export function useChangePasswordPage() {
  const [form, setForm] = useState(CHANGE_PASSWORD_INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [toast, setToast] = useState(CHANGE_PASSWORD_DEFAULT_TOAST);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(CHANGE_PASSWORD_DEFAULT_TOAST),
      CHANGE_PASSWORD_TOAST_DURATION_MS,
    );
  }, []);

  const clearToast = useCallback(() => {
    setToast(CHANGE_PASSWORD_DEFAULT_TOAST);
  }, []);

  useEffect(() => {
    if (user?.username) {
      setForm((prev) => ({ ...prev, username: user.username }));
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), CHANGE_PASSWORD_ERROR_HIDE_MS);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const handleTogglePasswordVisibility = useCallback((fieldName) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  }, []);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();

      const errors = validateChangePasswordForm(form);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError(CHANGE_PASSWORD_MESSAGES.validationFix);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setFieldErrors({});

        const response = await fetchChangePassword(buildChangePasswordPayload(form));

        if (response.response === true) {
          showToast(CHANGE_PASSWORD_MESSAGES.saveSuccess);
          setTimeout(() => {
            logout();
            navigate("/login");
          }, CHANGE_PASSWORD_REDIRECT_DELAY_MS);
        } else {
          setError(response.message || CHANGE_PASSWORD_MESSAGES.saveFailed);
        }
      } catch (err) {
        console.error("Error changing password:", err);
        setError(err.message || CHANGE_PASSWORD_MESSAGES.saveError);
      } finally {
        setLoading(false);
      }
    },
    [form, logout, navigate, showToast],
  );

  return {
    form,
    loading,
    error,
    setError,
    fieldErrors,
    showPasswords,
    toast,
    clearToast,
    handleChange,
    handleTogglePasswordVisibility,
    handleSave,
  };
}
