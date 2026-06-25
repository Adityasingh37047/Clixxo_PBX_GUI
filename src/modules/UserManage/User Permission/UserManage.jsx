import React, { useState, useEffect, useCallback, useRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material"; 
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

// ── Color palette (matches CallCount) ────────────────────────────────────────
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
  successGreen: "#16a34a",
  errorRed: "#dc2626",
};

const SYS_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};
// ── Local field UI (inlined from systemSharedUi) ──
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

const nativeFieldInputStyle = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "var(--bg-surface)",
  color: "var(--text-primary)",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

const userPermissionFieldInputStyle = {
  height: 30,
  padding: "0 10px",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  color: "var(--text-primary)",
  background: "var(--bg-surface)",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const inputStyle = userPermissionFieldInputStyle;


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
// ── Button Component ──────────────────────────────────────────────────────────
const BTN_BASE =
  "inline-flex items-center justify-center gap-[5px] h-[30px] px-[14px] py-[5px] rounded-[6px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-transparent text-[var(--text-label)] border-[0.5px] border-[var(--border-strong)] hover:bg-[rgba(2,132,199,0.10)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_EDIT = `${BTN_BASE} bg-[#dcfce7] text-[#166534] border-[#bbf7d0] hover:bg-[#bbf7d0]`;
const BTN_DELETE = `${BTN_BASE} bg-[#fee2e2] text-[#991b1b] border-[#fecaca] hover:bg-[#fecaca]`;
const BTN_ACCENT = `${BTN_BASE} bg-[#3E5475] text-white border-[0.5px] border-[#3E5475] hover:bg-[#0369a1]`;
const BTN_ERROR = `${BTN_BASE} bg-[#dc2626] text-white border-[0.5px] border-[#dc2626] hover:bg-[#b91c1c]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  edit: BTN_EDIT,
  delete: BTN_DELETE,
  outline: BTN_OUTLINE,
  accent: BTN_ACCENT,
  danger: BTN_ERROR,
  cancel: BTN_CANCEL,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
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

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
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
  background: "var(--bg-surface)",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const cbSx = {
  p: 0,
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 16 },
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
        background: "rgba(15, 23, 42, 0.3)",
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
          borderRadius: 12,
          padding: "24px 28px",
          width: 380,
          border: `1px solid ${C.cardBorder}`,
          boxShadow:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        }}
      >
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 14,
            fontWeight: 700,
            color: C.accent,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
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
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 14,
          }}
        >
          <Btn variant="accent" onClick={handle} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Btn>
          <Btn variant="default" onClick={onCancel}>
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
        background: "var(--bg-surface)",
        overflow: "hidden",
      }}
    >
      {PAGE_PERMISSION_GROUPS.map((section, si) => {
        const secPages = sectionPages(section);
        return (
          <div key={section.id}>
            <div
              className="flex items-center py-1.5 pr-3"
              style={{
                backgroundColor: "var(--row-alt)",
                paddingLeft: L1,
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
                className="ml-2 text-[12.5px] font-bold"
                style={{
                  color: C.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                {section.label}
              </span>
            </div>
            {section.subGroups.map((sub) => (
              <div key={sub.id}>
                <div
                  className="flex items-center py-1 pr-3"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    paddingLeft: L2,
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
                    className="ml-2 text-[12px] font-semibold"
                    style={{ color: C.valueText }}
                  >
                    {sub.label}
                  </span>
                </div>
                <div
                  className="pr-4 py-1.5"
                  style={{
                    paddingLeft: L3,
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(135px, 1fr))",
                    gap: "6px 8px",
                  }}
                >
                  {sub.pages.map((page) => (
                    <label
                      key={page.id}
                      className="flex items-center gap-1 cursor-pointer select-none"
                    >
                      <Checkbox
                        size="small"
                        checked={!!permissions[page.id]}
                        onChange={() => togglePage(page.id)}
                        sx={cbSx}
                      />
                      <span
                        className="text-[11.5px]"
                        style={{ color: C.labelText }}
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
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={SYS_TOAST_SX}
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

          <span
            style={{
              color: C.strongText,
              fontWeight: 600,
            }}
          >
            User Manage
          </span>
        </div>

        {/* ── User List Card ── */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1.5px solid ${C.cardBorder}`,
          }}
        >
          {/* Card Toolbar */}
          <div
            style={{
              minHeight: 44,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 14px",
              borderBottom: `1px solid ${C.divider}`,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.strongText,
                letterSpacing: "0.02em",
                marginLeft: 6,
              }}
            >
              User List
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {mode !== null && (
                <Btn
                  variant="cancel"
                  onClick={closeForm}
                  style={{ height: 30, padding: "0 14px", borderRadius: 10 }}
                >
                  Cancel
                </Btn>
              )}
              {mode === null && (
                <button
                  onClick={() => {
                    if (!canWrite) {
                      showReadOnlyToast();
                      return;
                    }
                    openAdd();
                  }}
                  style={{
                    background:
                      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
                    color: "#fff",
                    border: "1px solid #5A6F8F",
                    borderRadius: 10,
                    padding: "6px 14px",
                    height: 30,
                    cursor: !canWrite ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                    opacity: !canWrite ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (canWrite)
                      e.currentTarget.style.background =
                        "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
                  }}
                  onMouseLeave={(e) => {
                    if (canWrite)
                      e.currentTarget.style.background =
                        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)";
                  }}
                >
                  + Add User
                </button>
              )}
            </div>
          </div>
          {loadingList ? (
            <p
              style={{
                textAlign: "center",
                padding: 20,
                color: C.mutedText,
                fontSize: 13,
              }}
            >
              Loading users...
            </p>
          ) : listError ? (
            <p
              style={{
                textAlign: "center",
                padding: 20,
                color: C.errorRed,
                fontSize: 13,
              }}
            >
              {listError}
            </p>
          ) : users.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: 20,
                color: C.mutedText,
                fontSize: 13,
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
                    const rowBg = i % 2 === 1 ? "var(--row-alt)" : "var(--bg-surface)";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={user.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--row-alt)";
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
                              padding: "2px 8px",
                              borderRadius: 10,
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
                                  color: "#2563eb",
                                  fontSize: 22,
                                  opacity: canWrite ? 0.7 : 0.3,
                                  transition: "opacity 0.15s ease",
                                }}
                                onClick={() => {
                                  if (!canWrite) {
                                    showReadOnlyToast();
                                    return;
                                  }
                                  openEdit(user);
                                }}
                                onMouseEnter={(e) => {
                                  if (canWrite)
                                    e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  if (canWrite)
                                    e.currentTarget.style.opacity = "0.7";
                                }}
                              />
                            )}
                            {!isSuperAdmin && (
                              <DeleteOutlineOutlinedIcon
                                titleAccess="Delete"
                                style={{
                                  cursor: canWrite ? "pointer" : "not-allowed",
                                  color: "#dc2626",
                                  fontSize: 22,
                                  opacity: canWrite ? 0.7 : 0.3,
                                  transition: "opacity 0.15s ease",
                                }}
                                onClick={() => {
                                  if (!canWrite) {
                                    showReadOnlyToast();
                                    return;
                                  }
                                  handleDelete(user);
                                }}
                                onMouseEnter={(e) => {
                                  if (canWrite)
                                    e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  if (canWrite)
                                    e.currentTarget.style.opacity = "0.7";
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
            <div
              style={{
                background: C.cardBg,
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: C.cardShadow,
                marginTop: 24,
                marginBottom: 24,
                border: `1.5px solid ${C.cardBorder}`,
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 18px",
                  borderBottom: `1px solid ${C.divider}`,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.strongText,
                    letterSpacing: "0.02em",
                  }}
                >
                  {mode === "add"
                    ? "Add User"
                    : `Edit User — ${editUser?.username}`}
                </span>
              </div>
              {/* Card Body */}
              <div
                style={{ padding: "20px 24px" }}
                className="flex flex-col items-center"
              >
                <div style={{ width: 480 }} className="flex flex-col gap-3">
                  {mode === "add" && (
                    <div className="flex items-center gap-4">
                       <Tooltip title={tooltips.username} {...tooltipProps}
                       >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: C.labelText,
                            width: 120,
                            shrink: 0,
                          }}
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
                    <div className="flex items-center gap-4">
                     
                      <Tooltip title={tooltips.password} {...tooltipProps}
                      >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.labelText,
                          width: 120,
                          shrink: 0,
                        }}
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
                  <div className="flex items-center gap-4">
                    <Tooltip title={tooltips.accessType} {...tooltipProps}
                    >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 120,
                        shrink: 0,
                      }}
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
                  <div className="flex items-center gap-4">
                    <Tooltip title={tooltips.rolePermission} {...tooltipProps}
                    >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 120,
                        shrink: 0,
                      }}
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
            {/* Page Permissions */}
            <div
              style={{
                background: C.cardBg,
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: C.cardShadow,
                marginTop: 24,
                marginBottom: 0,
                border: `1.5px solid ${C.cardBorder}`,
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 18px",
                  borderBottom: `1px solid ${C.divider}`,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.strongText,
                    letterSpacing: "0.02em",
                  }}
                >
                  Page Permissions
                </span>
              </div>
              <PermissionTree
                permissions={permissions}
                setPermissions={setPermissions}
              />
            </div>

            {/* Form error */}
            {formError && (
              <Alert
                severity="error"
                onClose={clearFormError}
                sx={SYS_TOAST_SX}
              >
                {formError}
              </Alert>
            )}

            {/* Form buttons */}
            <div
              className="flex gap-3 justify-center py-2"
              style={{ marginTop: 20, marginBottom: 24 }}
            >
              <button
                onClick={() => {
                  if (!canWrite) {
                    showReadOnlyToast();
                    return;
                  }
                  handleSave();
                }}
                disabled={saving}
                style={{
                  background:
                    "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
                  color: "#fff",
                  border: "1px solid #5A6F8F",
                  borderRadius: 12,
                  padding: "10px 28px",
                  minWidth: 110,
                  cursor: saving || !canWrite ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  opacity: saving || !canWrite ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving && canWrite)
                    e.currentTarget.style.background =
                      "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
                }}
                onMouseLeave={(e) => {
                  if (!saving && canWrite)
                    e.currentTarget.style.background =
                      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)";
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={closeForm}
                style={{
                  background: "#cbd5e1",
                  color: "var(--text-secondary)",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 28px",
                  minWidth: 110,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                  transition:
                    "background-color 0.15s ease, box-shadow 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#b6c2d3";
                  // e.currentTarget.style.boxShadow =
                  //   "0 4px 10px rgba(15, 23, 42, 0.10)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#cbd5e1";
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(15, 23, 42, 0.08)";
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
