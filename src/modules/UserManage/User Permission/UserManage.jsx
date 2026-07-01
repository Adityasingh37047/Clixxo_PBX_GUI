import React, { useState, useEffect, useCallback, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import { Checkbox, Alert } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  PAGE_PERMISSION_GROUPS,
  INITIAL_PERMISSIONS,
} from "../../../constants/UserManageConstants";
import {
  fetchUserList,
  createUser,
  updateUserAccess,
  deleteUser,
} from "../../../api/apiService";
import useAuth from "../../../context/useAuth";

// ── Color palette (matches SignalingCapture) ─────────────────────────────────
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
  gridHeaderBg: "#F8FAFC",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

// ── Local field UI (matches SignalingCapture) ──
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
  el.style.boxShadow = FOCUS_RING_SHADOW();
};

const systemToolsFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: FIELD_RADIUS,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: "#ffffff",
  outline: "none",
  color: C.labelText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputStyle = systemToolsFieldInputStyle;

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
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

const pageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pageInnerStyle = {
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
  marginBottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
};

const formFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  marginTop: 24,
  padding: "10px 20px",
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxSizing: "border-box",
  background: C.cardBg,
  boxShadow: C.cardShadow,
};

const formFooterBtnStyle = {
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

const tooltips = {
  username: "The username of the user.",
  password: "The password of the user.",
  confirmPassword: "The confirmation password of the user.",
  accessType: "The access type of the user.",
  rolePermission: "The role permission of the user.",
};  
// ── Button Component (matches SignalingCapture) ───────────────────────────────
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
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
    accent: {
      background: C.accent,
      color: C.cardBg,
      border: `1px solid ${C.accent}`,
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
      edit: "#bbf7d0",
      delete: "#fecaca",
      danger: "#b91c1c",
      accent: C.accentDark,
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      edit: "#86efac",
      delete: "#fca5a5",
      danger: "#991b1b",
      accent: "#2C3E57",
      outline: "#d1d9e6",
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
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 36,
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

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: C.gridHeaderBg,
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "10px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "9px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  background: C.cardBg,
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const cbSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: C.accent },
  "&.MuiCheckbox-indeterminate": { color: C.accent },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

function allChecked(pages, perms) {
  return pages.length > 0 && pages.every((p) => perms[p.id]);
}
function someChecked(pages, perms) {
  const n = pages.filter((p) => perms[p.id]).length;
  return n > 0 && n < pages.length;
}
function sectionPages(section) {
  return section.subGroups.flatMap((sg) => sg.pages);
}

// Build permissions map from saved pages array
function buildPermsFromPages(pages = []) {
  const perms = { ...INITIAL_PERMISSIONS };
  pages.forEach((id) => {
    if (id in perms) perms[id] = true;
  });
  return perms;
}

// Collect checked sections and pages from permissions map
function collectSectionsAndPages(perms) {
  const sections = [];
  const pages = [];
  PAGE_PERMISSION_GROUPS.forEach((section) => {
    const secPages = sectionPages(section);
    const checkedPages = secPages.filter((p) => perms[p.id]).map((p) => p.id);
    if (checkedPages.length > 0) {
      sections.push(section.id);
      pages.push(...checkedPages);
    }
  });
  return { sections, pages };
}

// ── Toast ────────────────────────────────────────────────────────────────────
// Removed custom Toast, using MUI Alert instead

// ConfirmDialog removed

// ── Reset Password Dialog ────────────────────────────────────────────────────
function ResetPasswordDialog({ user, onSave, onCancel, loading }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const handle = () => {
    if (pw.length < 5) {
      setErr("Password must be at least 5 characters.");
      return;
    }
    onSave(pw);
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.35)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "10vh",
      }}
    >
      <div
        style={{
          background: C.cardBg,
          borderRadius: CARD_RADIUS,
          padding: "24px 28px",
          width: 380,
          maxWidth: "calc(100vw - 32px)",
          border: `1.5px solid ${C.cardBorder}`,
          boxShadow: C.cardShadow,
        }}
      >
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 14,
            fontWeight: 700,
            color: C.labelText,
          }}
        >
          Reset Password — {user.username}
        </p>
        <input
          style={{ ...inputStyle, marginBottom: 6, height: 36 }}
          type="password"
          placeholder="New password (min 5 chars)"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setErr("");
          }}
          {...inputInteraction}
        />
        {err && (
          <p
            style={{
              color: C.errorRed,
              fontSize: 12,
              margin: "0 0 8px",
              fontWeight: 600,
            }}
          >
            {err}
          </p>
        )}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <Btn variant="primary" onClick={handle} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Btn>
          <Btn variant="cancel" onClick={onCancel}>
            Cancel
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Permission Checkboxes ────────────────────────────────────────────────────
function PermissionTree({ permissions, setPermissions }) {
  const L1 = 12,
    L2 = 36,
    L3 = 60;

  const toggleSection = (section) => {
    const pages = sectionPages(section);
    const next = !allChecked(pages, permissions);
    setPermissions((prev) => {
      const u = { ...prev };
      pages.forEach((p) => {
        u[p.id] = next;
      });
      return u;
    });
  };
  const toggleSub = (sub) => {
    const next = !allChecked(sub.pages, permissions);
    setPermissions((prev) => {
      const u = { ...prev };
      sub.pages.forEach((p) => {
        u[p.id] = next;
      });
      return u;
    });
  };
  const togglePage = (id) =>
    setPermissions((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div
      style={{
        background: C.cardBg,
        overflow: "hidden",
      }}
    >
      {PAGE_PERMISSION_GROUPS.map((section) => {
        const secPages = sectionPages(section);
        return (
          <div key={section.id}>
            <div
              className="flex items-center py-2 pr-4"
              style={{
                backgroundColor: C.gridHeaderBg,
                paddingLeft: L1,
                borderBottom: `1px solid ${C.divider}`,
              }}
            >
              <Checkbox
                size="small"
                checked={allChecked(secPages, permissions)}
                indeterminate={someChecked(secPages, permissions)}
                onChange={() => toggleSection(section)}
                sx={cbSx}
              />
              <span
                className="ml-2 text-[13px] font-bold"
                style={{
                  color: C.labelText,
                  letterSpacing: "0.02em",
                }}
              >
                {section.label}
              </span>
            </div>
            {section.subGroups.map((sub) => (
              <div key={sub.id}>
                <div
                  className="flex items-center py-1.5 pr-4"
                  style={{
                    backgroundColor: C.cardBg,
                    paddingLeft: L2,
                    borderBottom: `1px solid ${C.divider}`,
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={allChecked(sub.pages, permissions)}
                    indeterminate={someChecked(sub.pages, permissions)}
                    onChange={() => toggleSub(sub)}
                    sx={cbSx}
                  />
                  <span
                    className="ml-2 text-[12.5px] font-semibold"
                    style={{ color: C.valueText }}
                  >
                    {sub.label}
                  </span>
                </div>
                <div
                  className="pr-4 py-2"
                  style={{
                    paddingLeft: L3,
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "8px 10px",
                    borderBottom: `1px solid ${C.divider}`,
                  }}
                >
                  {sub.pages.map((page) => (
                    <label
                      key={page.id}
                      className="flex items-center gap-1.5 cursor-pointer select-none"
                    >
                      <Checkbox
                        size="small"
                        checked={!!permissions[page.id]}
                        onChange={() => togglePage(page.id)}
                        sx={cbSx}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: C.labelText, lineHeight: 1.35 }}
                      >
                        {page.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function UserManage() {
  const { canWrite, showReadOnlyToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  // Form state
  const [mode, setMode] = useState(null); // null | 'add' | 'edit'
  const [editUser, setEditUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accessType, setAccessType] = useState("custom");
  const [rolePermission, setRolePermission] = useState("Read, Write");
  const [permissions, setPermissions] = useState({ ...INITIAL_PERMISSIONS });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const formErrorTimerRef = useRef(null);

  // Toast
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const toastTimerRef = useRef(null);

  const clearFormError = () => {
    if (formErrorTimerRef.current) clearTimeout(formErrorTimerRef.current);
    formErrorTimerRef.current = null;
    setFormError("");
  };

  const showFormError = (msg) => {
    setFormError(msg);
    if (formErrorTimerRef.current) clearTimeout(formErrorTimerRef.current);
    formErrorTimerRef.current = setTimeout(() => {
      setFormError("");
      formErrorTimerRef.current = null;
    }, 5000);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast({ msg: "", type: "success" });
      toastTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (formErrorTimerRef.current) clearTimeout(formErrorTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const data = await fetchUserList();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      if (msg.toLowerCase().includes("only superadmin")) {
        showToast(msg, "error");
      } else {
        setListError("Failed to load users.");
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openAdd = () => {
    setMode("add");
    setEditUser(null);
    setUsername("");
    setPassword("");
    setAccessType("custom");
    setRolePermission("Read, Write");
    setPermissions({ ...INITIAL_PERMISSIONS });
    clearFormError();
  };

  const openEdit = (user) => {
    setMode("edit");
    setEditUser(user);
    setUsername(user.username || "");
    setPassword("");
    const at = user.access?.access_type ?? user.access_type ?? "custom";
    const rp =
      user.access?.role_permission ?? user.role_permission ?? "Read, Write";
    setAccessType(at);
    setRolePermission(rp);
    const pages = user.access?.pages ?? user.pages ?? user.access_pages ?? [];
    setPermissions(buildPermsFromPages(pages));
    clearFormError();
  };

  const closeForm = () => {
    setMode(null);
    setEditUser(null);
    clearFormError();
  };

  const handleSave = async () => {
    clearFormError();
    const { sections, pages } = collectSectionsAndPages(permissions);

    if (mode === "add") {
      if (username.trim().length < 5) {
        showFormError("Username must be at least 5 characters.");
        return;
      }
      if (password.length < 5) {
        showFormError("Password must be at least 5 characters.");
        return;
      }
      setSaving(true);
      try {
        const res = await createUser({
          username: username.trim(),
          password,
          access_type: accessType,
          role_permission: rolePermission,
          sections,
          pages,
        });
        if (res?.response === false) {
          showFormError(res?.message || "Failed to create user.");
          return;
        }
        showToast("User created successfully.");
        closeForm();
        loadUsers();
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to create user.";
        showFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
      } finally {
        setSaving(false);
      }
    } else if (mode === "edit") {
      setSaving(true);
      try {
        const res = await updateUserAccess({
          id: editUser.id,
          access_type: accessType,
          role_permission: rolePermission,
          sections,
          pages,
        });
        if (res?.response === false) {
          showFormError(res?.message || "Failed to update user access.");
          return;
        }
        showToast("User access updated successfully.");
        closeForm();
        loadUsers();
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to update user access.";
        showFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async (user) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete user "${user.username}"?`,
    );
    if (!isConfirmed) return;
    try {
      await deleteUser(user.id);
      showToast("User deleted successfully.");
      loadUsers();
    } catch {
      showToast("Failed to delete user.", "error");
    }
  };

  return (
    <div style={pageWrapStyle} data-native-scroll>
      <div style={pageInnerStyle}>
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
            User Manage
          </span>
        </div>

        {/* ── User List Card ── */}
        <div style={{ ...tableContainerStyle, marginTop: 4 }}>
          <div style={blueBarStyle}>
            <span>User List</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {mode !== null && (
                <Btn
                  variant="cancel"
                  onClick={closeForm}
                  style={{ minWidth: 90, height: 33, fontSize: 13 }}
                >
                  Cancel
                </Btn>
              )}
              {mode === null && (
                <Btn
                  variant="primary"
                  onClick={() => {
                    if (!canWrite) {
                      showReadOnlyToast();
                      return;
                    }
                    openAdd();
                  }}
                  disabled={!canWrite}
                  style={{ minWidth: 110, height: 33, fontSize: 13 }}
                >
                  + Add User
                </Btn>
              )}
            </div>
          </div>
          {loadingList ? (
            <p
              style={{
                textAlign: "center",
                padding: "32px 20px",
                color: C.mutedText,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Loading users...
            </p>
          ) : listError ? (
            <p
              style={{
                textAlign: "center",
                padding: "32px 20px",
                color: C.errorRed,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {listError}
            </p>
          ) : users.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: "32px 20px",
                color: C.mutedText,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              No users found.
            </p>
          ) : (
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
                    <TH
                      style={{
                        width: 50,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH
                      style={{
                        width: 180,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Username
                    </TH>
                    <TH
                      style={{
                        width: 140,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Access Type
                    </TH>
                    <TH
                      style={{
                        width: 160,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Role Permission
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Sections
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Actions
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const access = user.access || user || {};
                    const accessType =
                      access.access_type ?? user.access_type ?? user.role ?? "";
                    const isSuperAdmin =
                      accessType === "superadmin" || accessType === "admin";
                    const isLastRow = i === users.length - 1;
                    const rowBg = i % 2 === 1 ? "#f8fafc" : C.cardBg;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const hoverBg = "#f1f5f9";
                    return (
                      <tr
                        key={user.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = hoverBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            color: C.mutedText,
                            fontWeight: 500,
                            ...lastRowCellStyle,
                          }}
                        >
                          {i + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            textAlign: "left",
                            ...lastRowCellStyle,
                          }}
                        >
                          {user.username}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: 6,
                              background: isSuperAdmin ? "#eff6ff" : "#f0fdf4",
                              border: `1px solid ${isSuperAdmin ? "#bfdbfe" : "#bbf7d0"}`,
                              color: isSuperAdmin ? "#1d4ed8" : "#15803d",
                            }}
                          >
                            {isSuperAdmin ? "Super Admin" : "Custom"}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            ...lastRowCellStyle,
                          }}
                        >
                          {access.role_permission ??
                            user.role_permission ??
                            "-"}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "left",
                            ...lastRowCellStyle,
                          }}
                        >
                          {isSuperAdmin ? (
                            <span
                              style={{
                                color: C.mutedText,
                                fontStyle: "italic",
                                fontSize: 13,
                              }}
                            >
                              All
                            </span>
                          ) : (
                            <span>
                              {(access.sections ?? user.sections ?? []).join(
                                ", ",
                              ) || "-"}
                            </span>
                          )}
                        </td>
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
                              gap: 6,
                              justifyContent: "center",
                            }}
                          >
                            {!isSuperAdmin && (
                              <EditDocumentIcon
                                titleAccess="Edit"
                                style={{
                                  cursor: canWrite ? "pointer" : "not-allowed",
                                  color: C.accent,
                                  fontSize: 22,
                                  opacity: canWrite ? 0.75 : 0.3,
                                  transition: "opacity 0.15s ease, color 0.15s ease",
                                }}
                                onClick={() => {
                                  if (!canWrite) {
                                    showReadOnlyToast();
                                    return;
                                  }
                                  openEdit(user);
                                }}
                                onMouseEnter={(e) => {
                                  if (canWrite) {
                                    e.currentTarget.style.opacity = "1";
                                    e.currentTarget.style.color = C.accentDark;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (canWrite) {
                                    e.currentTarget.style.opacity = "0.75";
                                    e.currentTarget.style.color = C.accent;
                                  }
                                }}
                              />
                            )}
                            {!isSuperAdmin && (
                              <DeleteOutlineOutlinedIcon
                                titleAccess="Delete"
                                style={{
                                  cursor: canWrite ? "pointer" : "not-allowed",
                                  color: C.errorRed,
                                  fontSize: 22,
                                  opacity: canWrite ? 0.75 : 0.3,
                                  transition: "opacity 0.15s ease, color 0.15s ease",
                                }}
                                onClick={() => {
                                  if (!canWrite) {
                                    showReadOnlyToast();
                                    return;
                                  }
                                  handleDelete(user);
                                }}
                                onMouseEnter={(e) => {
                                  if (canWrite) {
                                    e.currentTarget.style.opacity = "1";
                                    e.currentTarget.style.color = "#b91c1c";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (canWrite) {
                                    e.currentTarget.style.opacity = "0.75";
                                    e.currentTarget.style.color = C.errorRed;
                                  }
                                }}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Add / Edit Form ── */}
        {mode && (
          <>
            <div style={{ ...tableContainerStyle, marginTop: 20 }}>
              <div style={{ ...blueBarStyle, justifyContent: "flex-start" }}>
                <span>
                  {mode === "add"
                    ? "Add User"
                    : `Edit User — ${editUser?.username}`}
                </span>
              </div>
              <div className="p-6 flex flex-col items-center">
                <div
                  style={{ width: "100%", maxWidth: 520 }}
                  className="flex flex-col gap-4"
                >
                  {mode === "add" && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <Tooltip title={tooltips.username} {...tooltipProps}>
                        <span
                          className="sm:w-[140px] shrink-0"
                          style={labelStyle}
                        >
                          Username
                        </span>
                      </Tooltip>
                      <input
                        style={inputStyle}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Min 5 characters"
                        {...inputInteraction}
                      />
                    </div>
                  )}
                  {mode === "add" && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <Tooltip title={tooltips.password} {...tooltipProps}>
                        <span
                          className="sm:w-[140px] shrink-0"
                          style={labelStyle}
                        >
                          Password
                        </span>
                      </Tooltip>
                      <input
                        style={inputStyle}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 5 characters"
                        {...inputInteraction}
                      />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Tooltip title={tooltips.accessType} {...tooltipProps}>
                      <span
                        className="sm:w-[140px] shrink-0"
                        style={labelStyle}
                      >
                        Access Type
                      </span>
                    </Tooltip>
                    <select
                      style={inputStyle}
                      value={accessType}
                      onChange={(e) => setAccessType(e.target.value)}
                      {...inputInteraction}
                    >
                      <option value="custom">Custom</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Tooltip title={tooltips.rolePermission} {...tooltipProps}>
                      <span
                        className="sm:w-[140px] shrink-0"
                        style={labelStyle}
                      >
                        Role Permission
                      </span>
                    </Tooltip>
                    <select
                      style={inputStyle}
                      value={rolePermission}
                      onChange={(e) => setRolePermission(e.target.value)}
                      {...inputInteraction}
                    >
                      <option value="Read, Write">Read, Write</option>
                      <option value="Read">Read</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ ...tableContainerStyle, marginTop: 20 }}>
              <div style={{ ...blueBarStyle, justifyContent: "flex-start" }}>
                <span>Page Permissions</span>
              </div>
              <PermissionTree
                permissions={permissions}
                setPermissions={setPermissions}
              />
            </div>

            {formError && (
              <Alert
                severity="error"
                onClose={clearFormError}
                sx={{
                  position: "fixed",
                  top: 20,
                  right: 20,
                  zIndex: 9999,
                  minWidth: 300,
                  boxShadow: 3,
                }}
              >
                {formError}
              </Alert>
            )}

            <div style={formFooterStyle}>
              <Btn
                variant="primary"
                onClick={() => {
                  if (!canWrite) {
                    showReadOnlyToast();
                    return;
                  }
                  handleSave();
                }}
                disabled={saving || !canWrite}
                style={formFooterBtnStyle}
              >
                {saving ? "Saving..." : "Save"}
              </Btn>
              <Btn
                variant="cancel"
                onClick={closeForm}
                style={formFooterBtnStyle}
              >
                Cancel
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
