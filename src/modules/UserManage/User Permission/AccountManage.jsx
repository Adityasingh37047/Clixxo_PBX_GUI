import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import {
  ACCOUNT_MANAGE_TABLE_COLUMNS,
  ACCOUNT_MANAGE_MODAL_FIELDS,
  ACCOUNT_MANAGE_INITIAL_FORM,
  ACCOUNT_MANAGE_BREADCRUMB,
  ACCOUNT_MANAGE_CARD_TITLE,
  ACCOUNT_MANAGE_BUTTON_LABELS,
  ACCOUNT_MANAGE_BUTTON_VARIANTS,
  ACCOUNT_MANAGE_BUTTON_STYLE,
  ACCOUNT_MANAGE_TOOLBAR_BUTTON_STYLE,
  ACCOUNT_MANAGE_TOOLTIPS,
  ACCOUNT_MANAGE_MODAL_TITLE,
  ACCOUNT_MANAGE_MESSAGES,
  ACCOUNT_MANAGE_DEFAULT_TOAST,
  ACCOUNT_MANAGE_TOAST_DURATION_MS,
  ACCOUNT_MANAGE_ERROR_HIDE_MS,
  ACCOUNT_MANAGE_ICON_COLORS,
} from "../../../constants/AccountManageConstants";
import {
  fetchAccountManageGetAll,
  fetchAccountManageRegister,
  fetchAccountManageUpdate,
  fetchAccountManageDelete,
} from "../../../api/apiService";
import useAuth from "../../../context/useAuth";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
// ── Color palette (same as UserManage) ────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#94a3b8",
  placeholderText: "#9aa3b2",
  strongText: "#1e293b",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
  errorRed: "#dc2626",
  gridHeaderBg: "#F8FAFC",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

// ── Local field UI (matches Network.jsx design language) ──
const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

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

const userPermissionModalInputStyle = {
  width: "min(100%, 320px)",
  fontSize: 13,
  height: 32,
  padding: "0 8px",
  boxSizing: "border-box",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  color: "#1e293b",
  background: "#ffffff",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const modalInputStyle = userPermissionModalInputStyle;

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

// ── Button Component (same as UserManage) ────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  component,
  startIcon,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    edit: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    delete: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      error: "#b91c1c",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      error: "#991b1b",
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
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
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
      {startIcon && <span style={{ display: "inline-flex" }}>{startIcon}</span>}
      {children}
    </Component>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.5)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const modalStyle = {
  background: "#ffffff",
  border: `none`,
  borderRadius: 8,
  width: 500,
  maxWidth: "95vw",
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
};
const modalHeaderStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  borderBottom: `1px solid ${C.divider}`,
};
const modalBodyStyle = {
  padding: "24px",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  backgroundColor: "#ffffff",
};
const modalRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0",
  marginBottom: 0,
  gap: 12,
};
const modalLabelStyle = {
  width: 170,
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  marginRight: 0,
  whiteSpace: "nowrap",
};
const modalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 16px",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};
const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const AccountManagePageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const AccountManagePageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
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
  background: "#ffffff",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};
// const tableButtonSx = {
//   background: "linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)",
//   color: "#222",
//   fontSize: 10,
//   padding: "4px 18px",
//   border: "1px solid #bbb",
//   borderRadius: 1.5,
//   boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
//   fontWeight: 500,
//   textTransform: "none",
//   minWidth: 90,
//   "&:hover": {
//     background: "linear-gradient(to bottom, #bfc6d1 0%, #e3e7ef 100%)",
//     color: "#222",
//   },
// };
// const addNewButtonSx = {
//   ...tableButtonSx,
//   background:
//     "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
//   color: "#fff",
//   "&:hover": {
//     background: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
//     color: "#fff",
//   },
// };
const ITEMS_PER_PAGE = 20;

// ConfirmDialog removed in favor of window.confirm

const AccountManage = () => {
  const { user: currentUser, canWrite, showReadOnlyToast } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ACCOUNT_MANAGE_INITIAL_FORM);
  const [editIdx, setEditIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(ACCOUNT_MANAGE_DEFAULT_TOAST);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(ACCOUNT_MANAGE_DEFAULT_TOAST),
      ACCOUNT_MANAGE_TOAST_DURATION_MS,
    );
  };

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(
        () => setError(null),
        ACCOUNT_MANAGE_ERROR_HIDE_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // API Functions
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchAccountManageGetAll();

      if (response && response.response === true && response.data) {
        const usersWithAdminFlag = response.data.map((user) => ({
          ...user,
          isAdmin: user.username?.toLowerCase() === "admin",
        }));

        setAccounts(usersWithAdminFlag);
      } else {
        throw new Error(response?.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);

      // Handle different types of errors
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        setError(ACCOUNT_MANAGE_MESSAGES.loadTimeout);
      } else if (error.response?.status === 404) {
        setError(ACCOUNT_MANAGE_MESSAGES.loadNotFound);
      } else if (error.response?.status >= 500) {
        setError(ACCOUNT_MANAGE_MESSAGES.loadServerError);
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        setError(ACCOUNT_MANAGE_MESSAGES.loadNetworkError);
      } else {
        setError(error.message || ACCOUNT_MANAGE_MESSAGES.loadFailed);
      }

      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchAccountManageRegister(userData);

      if (response && response.response === true) {
        // Refresh the user list after successful save
        await fetchAllUsers();
        showToast(ACCOUNT_MANAGE_MESSAGES.saveSuccess);
        return true;
      } else {
        throw new Error(response?.message || "Failed to save user");
      }
    } catch (error) {
      console.error("Error saving user:", error);

      let errorMessage = ACCOUNT_MANAGE_MESSAGES.saveFailed;

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.saveTimeout;
      } else if (error.response?.status === 400) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.saveInvalid;
      } else if (error.response?.status >= 500) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.saveServerError;
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.saveNetworkError;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchAccountManageUpdate(userData);

      if (response && response.response === true) {
        // Refresh the user list after successful update
        await fetchAllUsers();
        showToast(ACCOUNT_MANAGE_MESSAGES.updateSuccess);
        return true;
      } else {
        throw new Error(response?.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);

      let errorMessage = ACCOUNT_MANAGE_MESSAGES.updateFailed;

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.updateTimeout;
      } else if (error.response?.status === 400) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.updateInvalid;
      } else if (error.response?.status >= 500) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.updateServerError;
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.updateNetworkError;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchAccountManageDelete(userData);

      if (response && response.response === true) {
        await fetchAllUsers();
        const skipped = response.data?.skipped ?? [];
        if (skipped.length > 0) {
          showToast(
            ACCOUNT_MANAGE_MESSAGES.deleteSkipped(
              skipped.map((u) => u.username),
            ),
            "warning",
          );
        } else {
          showToast(ACCOUNT_MANAGE_MESSAGES.deleteSuccess);
        }
        return true;
      } else {
        throw new Error(response?.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);

      let errorMessage = ACCOUNT_MANAGE_MESSAGES.deleteFailed;

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.deleteTimeout;
      } else if (error.response?.status === 400) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.deleteInvalid;
      } else if (error.response?.status >= 500) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.deleteServerError;
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.deleteNetworkError;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Send all current users data for deletion (excluding current user)
      const allUsersData = accounts
        .filter((user) => !user.isAdmin)
        .map((user) => ({ id: user.id, username: user.username }));

      const response = await fetchAccountManageDelete({ users: allUsersData });

      if (response && response.response === true) {
        setAccounts([]);
        setSelected([]);
        showToast(ACCOUNT_MANAGE_MESSAGES.clearAllSuccess);
        return true;
      } else {
        throw new Error(response?.message || "Failed to clear all users");
      }
    } catch (error) {
      console.error("Error clearing all users:", error);

      let errorMessage = ACCOUNT_MANAGE_MESSAGES.clearAllFailed;

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.clearAllTimeout;
      } else if (error.response?.status === 400) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.clearAllInvalid;
      } else if (error.response?.status >= 500) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.clearAllServerError;
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage = ACCOUNT_MANAGE_MESSAGES.clearAllNetworkError;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create combined accounts list with current user at the top
  const combinedAccounts = accounts;

  // Table row selection logic
  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };
  const pageSelectableIndices = combinedAccounts
    .map((_, idx) => idx)
    .filter((idx) => !combinedAccounts[idx].isAdmin);

  const allPageSelected =
    pageSelectableIndices.length > 0 &&
    pageSelectableIndices.every((idx) => selected.includes(idx));

  const somePageSelected =
    pageSelectableIndices.some((idx) => selected.includes(idx)) &&
    !allPageSelected;

  const handleToggleAll = () => {
    if (!pageSelectableIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageSelectableIndices.includes(id))
        : Array.from(new Set([...prev, ...pageSelectableIndices])),
    );
  };

  const handleInverse = () => {
    const selectableIndices = combinedAccounts
      .map((_, idx) => idx)
      .filter((idx) => !combinedAccounts[idx].isAdmin);
    setSelected(selectableIndices.filter((i) => !selected.includes(i)));
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      setError(ACCOUNT_MANAGE_MESSAGES.deleteSelectRequired);
      return;
    }

    const selectedUsers = selected
      .map((idx) => combinedAccounts[idx])
      .filter((user) => !user.isAdmin)
      .map((user) => ({ id: user.id, username: user.username }));

    if (selectedUsers.length === 0) {
      showToast(ACCOUNT_MANAGE_MESSAGES.adminCannotDelete, "error");
      return;
    }

    const isConfirmed = window.confirm(
      ACCOUNT_MANAGE_MESSAGES.deleteConfirm(selectedUsers.length),
    );
    if (isConfirmed) {
      const success = await deleteUser({ users: selectedUsers });
      if (success) {
        setSelected([]);
      }
    }
  };

  const handleClearAll = async () => {
    if (accounts.length === 0) {
      setError(ACCOUNT_MANAGE_MESSAGES.clearAllEmpty);
      return;
    }

    const isConfirmed = window.confirm(ACCOUNT_MANAGE_MESSAGES.clearAllConfirm);
    if (isConfirmed) {
      await deleteAllUsers();
    }
  };

  // Modal logic
  const handleOpenModal = (item = null, idx = null) => {
    if (item) {
      // Don't allow editing current user
      if (item.isCurrentUser) {
        setError(ACCOUNT_MANAGE_MESSAGES.cannotEditCurrentUser);
        return;
      }

      setFormData({
        index: idx + 1,
        userName: item.username,
        password: "",
        authority: item.authority ?? "Read",
      });
      setEditIdx(idx);
    } else {
      // For new user, show next index number but don't set actual ID
      const nextIndex = combinedAccounts.length + 1;
      setFormData({ ...ACCOUNT_MANAGE_INITIAL_FORM, index: nextIndex });
      setEditIdx(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validate form data
    if (!formData.userName.trim() || !formData.password.trim()) {
      setError(ACCOUNT_MANAGE_MESSAGES.formRequired);
      return;
    }

    const userData = {
      username: formData.userName.trim(),
      password: formData.password,
      authority: formData.authority,
    };

    let success = false;
    if (editIdx !== null) {
      // Update existing user
      success = await updateUser(userData);
    } else {
      // Create new user
      success = await saveUser(userData);
    }

    if (success) {
      setIsModalOpen(false);
      setError(null);
    }
  };

  return (
    <div style={AccountManagePageWrapStyle} data-native-scroll>
      <div style={AccountManagePageInnerStyle}>
        {/* ── Breadcrumb ── */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>{ACCOUNT_MANAGE_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{ACCOUNT_MANAGE_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {ACCOUNT_MANAGE_BREADCRUMB[2]}
          </span>
        </div>

        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(ACCOUNT_MANAGE_DEFAULT_TOAST)}
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

        {/* Error Message */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "16px",
              marginBottom: "16px",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            <svg
              style={{
                animation: "spin 1s linear infinite",
                width: "20px",
                height: "20px",
                marginRight: "12px",
                color: "#1d4ed8",
              }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: "0.25" }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                style={{ opacity: "0.75" }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span style={{ fontWeight: "500" }}>
              {ACCOUNT_MANAGE_MESSAGES.loading}
            </span>
          </div>
        )}

        {/* Table */}
        <div
          style={{
            ...tableContainerStyle,
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 10,
          }}
        >
          <div style={blueBarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>{ACCOUNT_MANAGE_CARD_TITLE}</span>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
                  {ACCOUNT_MANAGE_MESSAGES.selectedCount(selected.length)}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.CANCEL}
                onClick={handleInverse}
                disabled={loading}
                style={ACCOUNT_MANAGE_TOOLBAR_BUTTON_STYLE}
              >
                {ACCOUNT_MANAGE_BUTTON_LABELS.INVERSE}
              </Btn>
              <Btn
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.CANCEL}
                onClick={handleClearAll}
                disabled={loading || accounts.length === 0}
                style={ACCOUNT_MANAGE_TOOLBAR_BUTTON_STYLE}
              >
                {ACCOUNT_MANAGE_BUTTON_LABELS.CLEAR_ALL}
              </Btn>
              <Btn
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.CANCEL}
                onClick={() => {
                  if (!canWrite) {
                    showReadOnlyToast();
                    return;
                  }
                  handleDelete();
                }}
                disabled={loading || selected.length === 0}
                style={ACCOUNT_MANAGE_TOOLBAR_BUTTON_STYLE}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {ACCOUNT_MANAGE_BUTTON_LABELS.DELETE}
              </Btn>
              <Btn
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.PRIMARY}
                onClick={() => {
                  if (!canWrite) {
                    showReadOnlyToast();
                    return;
                  }
                  handleOpenModal();
                }}
                disabled={loading}
                style={ACCOUNT_MANAGE_TOOLBAR_BUTTON_STYLE}
              >
                {ACCOUNT_MANAGE_BUTTON_LABELS.ADD_NEW}
              </Btn>
            </div>
          </div>
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "100%",
                minWidth: 600,
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  {ACCOUNT_MANAGE_TABLE_COLUMNS.map((col, colIdx) => {
                    const isFirst = colIdx === 0;
                    const isLast =
                      colIdx === ACCOUNT_MANAGE_TABLE_COLUMNS.length - 1;
                    return (
                      <TH
                        key={col.key}
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          ...(isFirst
                            ? { width: 40, padding: 0, borderLeft: "none" }
                            : {}),
                          ...(isLast ? { width: 70, borderRight: "none" } : {}),
                        }}
                      >
                        {col.key === "choose" ? (
                          <Checkbox
                            size="small"
                            checked={allPageSelected}
                            indeterminate={somePageSelected}
                            onChange={handleToggleAll}
                            sx={checkboxSx}
                          />
                        ) : (
                          col.label
                        )}
                      </TH>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {combinedAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={ACCOUNT_MANAGE_TABLE_COLUMNS.length}
                      style={{
                        ...tdStyle,
                        padding: "32px 14px",
                        borderRight: "none",
                        borderLeft: "none",
                        borderBottom: "none",
                        color: C.labelText,
                        fontWeight: 600,
                      }}
                    >
                      {loading
                        ? ACCOUNT_MANAGE_MESSAGES.loadingTable
                        : ACCOUNT_MANAGE_MESSAGES.noData}
                    </td>
                  </tr>
                ) : (
                  combinedAccounts.map((item, idx) => {
                    const realIdx = idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === combinedAccounts.length - 1;
                    const rowBg = isSelected
                      ? "#f0f9ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        {/* Choose */}
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            width: 40,
                            ...lastRowCellStyle,
                          }}
                        >
                          {!item.isAdmin && (
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(realIdx)}
                              sx={checkboxSx}
                            />
                          )}
                        </td>
                        {/* Id */}
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            color: C.mutedText,
                            fontWeight: 500,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        {/* Username */}
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            textAlign: "left",
                            ...lastRowCellStyle,
                          }}
                        >
                          {item.username}
                        </td>
                        {/* Authority */}
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            ...lastRowCellStyle,
                          }}
                        >
                          {item.authority ?? "-"}
                        </td>
                        {/* Modify */}
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <EditDocumentIcon
                              titleAccess="Edit"
                              style={{
                                cursor: canWrite ? "pointer" : "not-allowed",
                                color: ACCOUNT_MANAGE_ICON_COLORS.EDIT,
                                fontSize: 22,
                                opacity: canWrite ? 0.7 : 0.3,
                                transition: "opacity 0.15s ease",
                              }}
                              onClick={() => {
                                if (!canWrite) {
                                  showReadOnlyToast();
                                  return;
                                }
                                if (item.isAdmin) {
                                  showToast(
                                    ACCOUNT_MANAGE_MESSAGES.cannotModifyAdmin,
                                    "error",
                                  );
                                  return;
                                }
                                handleOpenModal(item, realIdx);
                              }}
                              onMouseEnter={(e) => {
                                if (canWrite) {
                                  e.currentTarget.style.opacity = "1";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (canWrite) {
                                  e.currentTarget.style.opacity = "0.7";
                                }
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {combinedAccounts.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                background: "#ffffff",
                borderTop: `1px solid ${C.cardBorder}`,
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                {ACCOUNT_MANAGE_MESSAGES.showingRecords(
                  combinedAccounts.length,
                )}
              </span>
            </div>
          )}
        </div>
        {/* Table Buttons (removed as they are now in the top bar) */}
        <div style={{ padding: 0 }} />
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div
          style={modalOverlayStyle}
          onClick={() => {
            if (!loading) handleCloseModal();
          }}
        >
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>{ACCOUNT_MANAGE_MODAL_TITLE}</div>
            <div style={modalBodyStyle}>
              <div style={addHostFormPanelStyle}>
                {ACCOUNT_MANAGE_MODAL_FIELDS.map((field) => (
                  <div key={field.name} style={modalRowStyle}>
                    <Tooltip
                      title={ACCOUNT_MANAGE_TOOLTIPS[field.name] || ""}
                      {...tooltipProps}
                    >
                      <label style={modalLabelStyle}>{field.label}:</label>
                    </Tooltip>
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        style={{
                          ...modalInputStyle,
                          ...(field.disabled
                            ? {
                                backgroundColor: "#f1f5f9",
                                color: "#94a3b8",
                                cursor: "not-allowed",
                              }
                            : {}),
                        }}
                        disabled={field.disabled}
                        {...(field.disabled ? {} : inputInteraction)}
                      >
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        style={{
                          ...modalInputStyle,
                          ...(field.disabled
                            ? {
                                backgroundColor: "#f1f5f9",
                                color: "#94a3b8",
                                cursor: "not-allowed",
                              }
                            : {}),
                        }}
                        disabled={field.disabled}
                        {...(field.disabled ? {} : inputInteraction)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div style={modalFooterStyle}>
              <Btn
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.PRIMARY}
                onClick={handleSave}
                disabled={loading}
                style={ACCOUNT_MANAGE_BUTTON_STYLE}
              >
                {loading
                  ? ACCOUNT_MANAGE_BUTTON_LABELS.SAVING
                  : ACCOUNT_MANAGE_BUTTON_LABELS.SAVE}
              </Btn>
              <Btn
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.CANCEL}
                onClick={handleCloseModal}
                disabled={loading}
                style={ACCOUNT_MANAGE_BUTTON_STYLE}
              >
                {ACCOUNT_MANAGE_BUTTON_LABELS.CLOSE}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManage;
