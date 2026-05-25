import React, { useState, useEffect, useCallback, useRef } from "react";
import { Checkbox, Alert } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  PAGE_PERMISSION_GROUPS,
  INITIAL_PERMISSIONS,
} from "../constants/UserManageConstants";
import {
  fetchUserList,
  createUser,
  updateUserAccess,
  deleteUser,
} from "../api/apiService";

// ── Color palette (matches CallCount) ────────────────────────────────────────
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
  successGreen: "#16a34a",
  errorRed: "#dc2626",
};

// ── Button Component ──────────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
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
      background: "transparent",
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
    accent: {
      background: C.accent,
      color: C.cardBg,
      border: `0.5px solid ${C.accent}`,
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
      case "edit":
        return "#bbf7d0";
      case "delete":
        return "#fecaca";
      case "accent":
        return "#0369a1"; // darker than C.accent
      case "danger":
        return "#b91c1c"; // darker than C.errorRed
      case "outline":
        return "rgba(2, 132, 199, 0.10)";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 14px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 5,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = s.background;
        }
      }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: C.pageBg,
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "14px 18px",
      textAlign: "left",
      borderBottom: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const cbSx = {
  p: 0,
  color: C.accent,
  "&.Mui-checked": { color: C.accent },
  "&.MuiCheckbox-indeterminate": { color: C.accent },
  "& .MuiSvgIcon-root": { fontSize: 16 },
};

const inputStyle = {
  height: 30,
  padding: "0 10px",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 6,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  color: C.valueText,
  background: C.cardBg,
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
    if (pw.length < 8) {
      setErr("Password must be at least 8 characters.");
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
          placeholder="New password (min 8 chars)"
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
        background: "#ffffff",
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
                backgroundColor: "#f8fafc",
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
                    backgroundColor: "#ffffff",
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
      if (password.length < 8) {
        showFormError("Password must be at least 8 characters.");
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
    const isConfirmed = window.confirm(`Are you sure you want to delete user "${user.username}"?`);
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
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
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
              padding: "10px 14px",
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
                  variant="default"
                  onClick={closeForm}
                  style={{ height: 30, padding: "0 14px", borderRadius: 10 }}
                >
                  Cancel
                </Btn>
              )}
              {mode === null && (
                <button
                  onClick={openAdd}
                  style={{
                    background: C.primary,
                    color: C.cardBg,
                    border: "none",
                    borderRadius: 10,
                    padding: "6px 14px",
                    height: 30,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = C.primary;
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
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 50, textAlign: "center" }}>#</TH>
                    <TH style={{ width: 180 }}>Username</TH>
                    <TH style={{ width: 140, textAlign: "center" }}>
                      Access Type
                    </TH>
                    <TH style={{ width: 160, textAlign: "center" }}>
                      Role Permission
                    </TH>
                    <TH>Sections</TH>
                    <TH style={{ width: 160, textAlign: "center" }}>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const access = user.access || user || {};
                    const accessType =
                      access.access_type ?? user.access_type ?? user.role ?? "";
                    const isSuperAdmin =
                      accessType === "superadmin" || accessType === "admin";
                    return (
                      <tr
                        key={user.id}
                        style={{
                          background: C.cardBg,
                          borderBottom: `1px solid ${C.divider}`,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.pageBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = C.cardBg;
                        }}
                      >
                        <td
                          style={{
                            padding: "16px 18px",
                            color: C.mutedText,
                            textAlign: "center",
                            fontSize: 13,
                            fontWeight: 500,
                            borderBottom: `1px solid ${C.divider}`,
                          }}
                        >
                          {i + 1}
                        </td>
                        <td
                          style={{
                            padding: "16px 18px",
                            fontWeight: 500,
                            color: C.valueText,
                            fontSize: 13,
                            borderBottom: `1px solid ${C.divider}`,
                          }}
                        >
                          {user.username}
                        </td>
                        <td
                          style={{
                            padding: "16px 18px",
                            textAlign: "center",
                            borderBottom: `1px solid ${C.divider}`,
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
                            padding: "16px 18px",
                            color: C.valueText,
                            fontSize: 13,
                            textAlign: "center",
                            fontWeight: 500,
                            borderBottom: `1px solid ${C.divider}`,
                          }}
                        >
                          {access.role_permission ??
                            user.role_permission ??
                            "-"}
                        </td>
                        <td
                          style={{
                            padding: "16px 18px",
                            color: C.valueText,
                            fontSize: 13,
                            fontWeight: 500,
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            borderBottom: `1px solid ${C.divider}`,
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
                            padding: "16px 18px",
                            textAlign: "center",
                            borderBottom: `1px solid ${C.divider}`,
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
                              <Btn
                                variant="edit"
                                style={{
                                  padding: "2px 10px",
                                  fontSize: 11,
                                  height: 24,
                                  minWidth: 74,
                                }}
                                onClick={() => openEdit(user)}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 14 }} />
                                Edit
                              </Btn>
                            )}
                            {!isSuperAdmin && (
                              <Btn
                                variant="delete"
                                style={{
                                  padding: "2px 10px",
                                  fontSize: 11,
                                  height: 24,
                                  minWidth: 74,
                                }}
                                onClick={() => handleDelete(user)}
                              >
                                <DeleteOutlineOutlinedIcon
                                  sx={{ fontSize: 14 }}
                                />
                                Delete
                              </Btn>
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
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: C.cardShadow,
                marginTop: 24,
                marginBottom: 24,
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
                      <input
                        style={inputStyle}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        {...inputInteraction}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-4">
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
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: C.cardShadow,
                marginTop: 24,
                marginBottom: 0,
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

            {/* Form buttons */}
            <div
              className="flex gap-3 justify-center py-2"
              style={{ marginTop: 20, marginBottom: 24 }}
            >
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: C.primary,
                  color: C.cardBg,
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 28px",
                  minWidth: 110,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  opacity: saving ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving)
                    e.currentTarget.style.backgroundColor = C.primaryHover;
                }}
                onMouseLeave={(e) => {
                  if (!saving)
                    e.currentTarget.style.backgroundColor = C.primary;
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={closeForm}
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
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
