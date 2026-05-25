import React, { useState, useEffect } from "react";
import {
  ACCOUNT_MANAGE_TABLE_COLUMNS,
  ACCOUNT_MANAGE_MODAL_FIELDS,
  ACCOUNT_MANAGE_INITIAL_FORM,
  ACCOUNT_MANAGE_BUTTONS,
} from "../../../constants/AccountManageConstants";
import {
  fetchAccountManageGetAll,
  fetchAccountManageRegister,
  fetchAccountManageUpdate,
  fetchAccountManageDelete,
} from "../../../api/apiService";
import { useAuth } from "../../../context/AuthContext";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";

// ── Color palette (same as UserManage) ────────────────────────────────────────
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

// ── Button Component (same as UserManage) ────────────────────────────────────
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
      background: C.primary,
      color: C.cardBg,
      border: `1px solid ${C.primary}`,
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
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return C.primaryHover;
      case "cancel":
        return "#b6c2d3";
      case "edit":
        return "#bbf7d0";
      case "delete":
        return "#fecaca";
      case "danger":
        return "#b91c1c"; // darker than C.errorRed
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
        if (!disabled) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = baseBg;
      }}
    >
      {children}
    </button>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.3)",
  backdropFilter: "blur(4px)",
  zIndex: 1000,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "10vh",
};
const modalStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 12,
  width: 340,
  maxWidth: "95vw",
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  boxShadow:
    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  display: "flex",
  flexDirection: "column",
};
const modalHeaderStyle = {
  background: C.cardBg,
  color: C.strongText,
  fontWeight: 700,
  fontSize: 13,
  padding: "12px 18px",
  textAlign: "center",
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  borderBottom: `1px solid ${C.divider}`,
};
const modalBodyStyle = {
  padding: "16px 18px 0 18px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
const modalRowStyle = {
  display: "flex",
  alignItems: "center",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 10,
  padding: "8px 10px",
  marginBottom: 2,
  minHeight: 32,
  gap: 16,
};
const modalLabelStyle = {
  width: 110,
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  marginRight: 10,
  whiteSpace: "nowrap",
};
const modalInputStyle = {
  width: "100%",
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 10,
  border: `1px solid ${C.cardBorder}`,
  background: C.cardBg,
  color: C.valueText,
  outline: "none",
  transition: "border-color 0.2s ease",
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = C.accent),
  onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#94a3b8";
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = C.cardBorder;
  },
};
const modalFooterStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 24,
  padding: "16px 0 18px",
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
};
const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginLeft: 6,

  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};
const thStyle = {
  background: C.pageBg,
  color: C.labelText,
  fontWeight: 700,
  fontSize: 11,
  borderBottom: `1px solid ${C.divider}`,
  padding: "14px 18px",
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};
const tdStyle = {
  borderBottom: `1px solid ${C.divider}`,
  padding: "16px 18px",
  fontSize: 13,
  fontWeight: 500,
  background: C.cardBg,
  color: C.valueText,
  textAlign: "center",
  whiteSpace: "nowrap",
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
  const { user: currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(ACCOUNT_MANAGE_INITIAL_FORM);
  const [editIdx, setEditIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
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
        setError(
          "Request timeout. Please check your connection and try again.",
        );
      } else if (error.response?.status === 404) {
        setError("User data not found. Please contact administrator.");
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later or contact support.");
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        setError(
          "Network connection failed. Please check your internet connection.",
        );
      } else {
        setError(
          error.message ||
            "Failed to load users. Please refresh the page and try again.",
        );
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
        showToast("User saved successfully!");
        return true;
      } else {
        throw new Error(response?.message || "Failed to save user");
      }
    } catch (error) {
      console.error("Error saving user:", error);

      let errorMessage = "Failed to save user.";

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Save operation timed out. Please check your connection and try again.";
      } else if (error.response?.status === 400) {
        errorMessage =
          "Invalid user data. Please check your input and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error during save. Please try again later or contact support.";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network connection failed during save. Please check your connection.";
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
        showToast("User updated successfully!");
        return true;
      } else {
        throw new Error(response?.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);

      let errorMessage = "Failed to update user.";

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Update operation timed out. Please check your connection and try again.";
      } else if (error.response?.status === 400) {
        errorMessage =
          "Invalid user data. Please check your input and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error during update. Please try again later or contact support.";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network connection failed during update. Please check your connection.";
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
            `Deleted successfully. Skipped: ${skipped.map((u) => u.username).join(", ")}`,
            "warning",
          );
        } else {
          showToast("User(s) deleted successfully!");
        }
        return true;
      } else {
        throw new Error(response?.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);

      let errorMessage = "Failed to delete user.";

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Delete operation timed out. Please check your connection and try again.";
      } else if (error.response?.status === 400) {
        errorMessage =
          "Invalid delete request. Please check your selection and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error during delete. Please try again later or contact support.";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network connection failed during delete. Please check your connection.";
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
        showToast("All users cleared successfully!");
        return true;
      } else {
        throw new Error(response?.message || "Failed to clear all users");
      }
    } catch (error) {
      console.error("Error clearing all users:", error);

      let errorMessage = "Failed to clear all users.";

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Clear operation timed out. Please check your connection and try again.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid clear request. Please try again.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error during clear operation. Please try again later or contact support.";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network connection failed during clear operation. Please check your connection.";
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
      setError("Please select users to delete.");
      return;
    }

    const selectedUsers = selected
      .map((idx) => combinedAccounts[idx])
      .filter((user) => !user.isAdmin)
      .map((user) => ({ id: user.id, username: user.username }));

    if (selectedUsers.length === 0) {
      showToast("Admin user cannot be deleted.", "error");
      return;
    }

    const isConfirmed = window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected user(s)?`);
    if (isConfirmed) {
      const success = await deleteUser({ users: selectedUsers });
      if (success) {
        setSelected([]);
      }
    }
  };

  const handleClearAll = async () => {
    if (accounts.length === 0) {
      setError("No users to clear.");
      return;
    }

    const isConfirmed = window.confirm("Are you sure you want to delete all users? This action cannot be undone. (Current user will not be deleted)");
    if (isConfirmed) {
      await deleteAllUsers();
    }
  };

  // Modal logic
  const handleOpenModal = (item = null, idx = null) => {
    if (item) {
      // Don't allow editing current user
      if (item.isCurrentUser) {
        setError("Cannot edit current user.");
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
      setError("User name and password are required.");
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
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          }}
        >
          <span>User Manage</span>
          <span>&gt;</span>
          <span>User Permission</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Account Manage
          </span>
        </div>

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
            <span style={{ fontWeight: "500" }}>Loading account data...</span>
          </div>
        )}

        {/* Table */}
        <div
          style={{
            ...tableContainerStyle,
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 20,
          }}
        >
          <div style={blueBarStyle}>
            <span>Info</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                variant="default"
                onClick={handleInverse}
                disabled={loading}
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="delete"
                onClick={handleClearAll}
                disabled={loading || accounts.length === 0}
                style={{ height: 30 }}
              >
                Clear All
              </Btn>
              <Btn
                variant="delete"
                onClick={handleDelete}
                disabled={loading || selected.length === 0}
                style={{ height: 30 }}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading}
                style={{ height: 30, minWidth: 110 }}
              >
                + {ACCOUNT_MANAGE_BUTTONS.addNew}
              </Btn>
            </div>
          </div>
          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "100%",
                minWidth: 600,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  {ACCOUNT_MANAGE_TABLE_COLUMNS.map((col) => (
                    <th key={col.key} style={thStyle}>
                      {col.key === "choose" ? (
                        <Checkbox
                          size="small"
                          checked={allPageSelected}
                          indeterminate={somePageSelected}
                          onChange={handleToggleAll}
                          sx={{
                            padding: "1px",
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                            "&.MuiCheckbox-indeterminate": { color: C.accent },
                          }}
                        />
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {combinedAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={ACCOUNT_MANAGE_TABLE_COLUMNS.length}
                      style={tdStyle}
                    >
                      {loading ? "Loading..." : "No data"}
                    </td>
                  </tr>
                ) : (
                  combinedAccounts.map((item, idx) => {
                    const realIdx = idx;
                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: C.cardBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.pageBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = C.cardBg;
                        }}
                      >
                        {/* Choose */}
                        <td style={tdStyle}>
                          {!item.isAdmin && (
                            <Checkbox
                              size="small"
                              checked={selected.includes(realIdx)}
                              onChange={() => handleSelectRow(realIdx)}
                              sx={{
                                padding: "1px",
                                color: C.accent,
                                "&.Mui-checked": { color: C.accent },
                              }}
                            />
                          )}
                        </td>
                        {/* Id */}
                        <td style={tdStyle}>{realIdx + 1}</td>
                        {/* Username */}
                        <td style={tdStyle}>{item.username}</td>
                        {/* Authority */}
                        <td style={tdStyle}>{item.authority ?? "-"}</td>
                        {/* Modify */}
                        <td style={tdStyle}>
                          <Btn
                            variant="edit"
                            onClick={() => {
                              if (item.isAdmin) {
                                showToast(
                                  "Admin user cannot be modified.",
                                  "error",
                                );
                                return;
                              }
                              handleOpenModal(item, realIdx);
                            }}
                            style={{
                              height: 28,
                              minWidth: 74,
                              padding: "2px 10px",
                            }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 14 }} />
                            Edit
                          </Btn>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Table Buttons (removed as they are now in the top bar) */}
        <div style={{ padding: 0 }} />
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>User Information</div>
            <div style={modalBodyStyle}>
              {ACCOUNT_MANAGE_MODAL_FIELDS.map((field) => (
                <div key={field.name} style={modalRowStyle}>
                  <label style={modalLabelStyle}>{field.label}:</label>
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
            <div style={modalFooterStyle}>
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={loading}
                style={{ minWidth: 110, height: 34 }}
              >
                {loading ? "Saving..." : ACCOUNT_MANAGE_BUTTONS.save}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleCloseModal}
                disabled={loading}
                style={{ minWidth: 110, height: 34 }}
              >
                {ACCOUNT_MANAGE_BUTTONS.close}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this style for plain gray buttons
const plainBtnStyle = {
  background: "linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)",
  color: "#222",
  fontSize: 15,
  padding: "4px 18px",
  border: "1px solid #bbb",
  borderRadius: 6,
  boxShadow: "0 1px 2px rgba(0,0,0,0.10)",
  fontWeight: 500,
  textTransform: "none",
  minWidth: 60,
  cursor: "pointer",
  opacity: 1,
  marginLeft: 2,
  marginRight: 2,
  transition: "background 0.2s",
  ":disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export default AccountManage;
