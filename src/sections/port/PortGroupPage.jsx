import React, { useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Checkbox } from "@mui/material";
import {
  PORT_GROUP_TOTAL_PORTS,
  PORT_GROUP_TABLE_COLUMNS,
  PORT_GROUP_INDEX_OPTIONS,
  PORT_GROUP_REGISTER_OPTIONS,
  PORT_GROUP_AUTHENTICATION_MODE_OPTIONS,
  PORT_GROUP_SELECT_MODE_OPTIONS,
  PORT_GROUP_MULTI_GROUP_OPTIONS,
  PORT_GROUP_PAGE_TITLE,
  PORT_GROUP_ADD_TITLE,
} from "./constants/PortGroupPageConstants";

// ── Color Palette (From Source) ───────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

// ── Shared UI Components (From Source) ────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 200,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const inputStyle = {
  width: "100%",
  height: 32,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
};

// ── Initial State ─────────────────────────────────────────────────────────────
const initialFormState = () => ({
  index: "1",
  description: "default",
  registerPortGroup: "0",
  sipAccount: "",
  displayName: "",
  password: "",
  authUserName: "",
  registerSelectMode: "0",
  portSelectMode: "0",
  enumRule: "",
  ringExpire: "20",
  robKey: "",
  enablePortMultiGroup: "0",
  ports: Array.from({ length: PORT_GROUP_TOTAL_PORTS }, () => false),
});

const PortGroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(initialFormState());
  const [checkedRows, setCheckedRows] = useState({});

  const handleAddNewClick = () => {
    setForm(initialFormState());
    setShowAddForm(true);
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePortToggle = (idx) => {
    setForm((prev) => ({
      ...prev,
      ports: prev.ports.map((v, i) => (i === idx ? !v : v)),
    }));
  };

  const checkAnyPortSelected = () => form.ports.some(Boolean);

  const handleCheckAllPorts = () => {
    setForm((prev) => ({
      ...prev,
      ports: prev.ports.map(() => true),
    }));
  };

  const handleInversePorts = () => {
    setForm((prev) => ({
      ...prev,
      ports: prev.ports.map((v) => !v),
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();

    if (!form.description.trim()) {
      alert("Please enter a description!");
      return;
    }

    if (!checkAnyPortSelected()) {
      alert("Please choose a port!");
      return;
    }

    const selectedPorts = form.ports
      .map((v, i) => (v ? i + 1 : null))
      .filter((n) => n !== null)
      .join(",");

    const newGroup = {
      id: Date.now(),
      index: form.index,
      description: form.description,
      sipAccount: form.registerPortGroup === "1" ? form.sipAccount : "---",
      displayName:
        form.registerPortGroup === "1" && form.displayName
          ? form.displayName
          : "---",
      ports: selectedPorts || "---",
      portSelectMode:
        PORT_GROUP_SELECT_MODE_OPTIONS.find(
          (o) => o.value === form.portSelectMode,
        )?.label || "",
      enumRule: form.portSelectMode === "5" ? form.enumRule || "---" : "---",
      ringExpire:
        form.portSelectMode === "5" ? form.ringExpire || "---" : "---",
      robKey:
        form.portSelectMode !== "4" &&
        form.portSelectMode !== "5" &&
        form.robKey
          ? form.robKey
          : "---",
    };

    setGroups((prev) => [...prev, newGroup]);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
  };

  const handleResetForm = () => {
    setForm(initialFormState());
  };

  const handleRowCheck = (id) => {
    setCheckedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTableCheckAll = () => {
    const allChecked =
      groups.length > 0 && groups.every((g) => checkedRows[g.id]);
    if (allChecked) {
      setCheckedRows({});
    } else {
      const next = {};
      groups.forEach((g) => {
        next[g.id] = true;
      });
      setCheckedRows(next);
    }
  };

  const handleTableUncheckAll = () => {
    setCheckedRows({});
  };

  const handleTableInverse = () => {
    const next = {};
    groups.forEach((g) => {
      next[g.id] = !checkedRows[g.id];
    });
    setCheckedRows(next);
  };

  const handleDelete = () => {
    const anyChecked = groups.some((g) => checkedRows[g.id]);
    if (!anyChecked) return;
    setGroups((prev) => prev.filter((g) => !checkedRows[g.id]));
    setCheckedRows({});
  };

  const handleClearAll = () => {
    setGroups([]);
    setCheckedRows({});
  };

  // ── Renders ─────────────────────────────────────────────────────────────────
  const renderEmptyState = () => (
    <div style={{ padding: 48, textAlign: "center" }}>
      <div style={{ fontSize: 14, color: C.mutedText, marginBottom: 16 }}>
        No available port group!
      </div>
      <Btn
        onClick={handleAddNewClick}
        variant="accent"
        style={{ margin: "0 auto", padding: "6px 20px" }}
      >
        + Add New
      </Btn>
    </div>
  );

  const renderTable = () => (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Toolbar */}
      {/* <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: `1px solid ${C.cardBorder}`,
          background: "#DCE6F2",
          flexWrap: "wrap",
          gap: 8,
        }}
      > */}
      {/* <div style={{ display: "flex", alignItems: "center", gap: 8 }}> */}
      {/* <span
            style={{
              background: "#f1f5f9",
              border: `0.5px solid ${C.cardBorder}`,
              color: "#475569",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 12px",
              borderRadius: 20,
            }}
          >
            {PORT_GROUP_PAGE_TITLE} · {groups.length} records
          </span>
          {Object.values(checkedRows).filter(Boolean).length > 0 && (
            <span
              style={{
                background: "#e0f2fe",
                color: C.accent,
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 20,
                border: `0.5px solid ${C.accent}`,
              }}
            >
              {Object.values(checkedRows).filter(Boolean).length} selected
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
          <Btn onClick={handleTableCheckAll} variant="outline">
            Check All
          </Btn>
          <Btn onClick={handleTableUncheckAll} variant="outline">
            Uncheck All
          </Btn>
          <Btn onClick={handleTableInverse} variant="outline">
            Inverse
          </Btn>
          <Btn
            onClick={handleDelete}
            disabled={groups.length === 0}
            variant="danger"
          >
            🗑 Delete
          </Btn>
          <Btn
            onClick={handleClearAll}
            disabled={groups.length === 0}
            variant="danger"
          >
            Clear All
          </Btn>
          <Btn onClick={handleAddNewClick} variant="accent">
            + Add New
          </Btn> */}
      {/* </div> */}
      {/* </div> */}

      {/* Table Data */}
      <div style={{ overflowX: "auto" }}>
        {groups.length === 0 ? (
          renderEmptyState()
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 900,
            }}
          >
            <thead>
              <tr>
                {PORT_GROUP_TABLE_COLUMNS.map((col) => (
                  <TH key={col.key}>{col.label}</TH>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group, idx) => {
                const isSelected = !!checkedRows[group.id];
                const rowBg = isSelected
                  ? "#f0f9ff"
                  : idx % 2 === 1
                    ? "#f8fafc"
                    : "#ffffff";

                return (
                  <tr
                    key={group.id}
                    style={{
                      background: rowBg,
                      borderBottom: "0.5px solid #9ca3af",
                      transition: "background 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#f0f9ff";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = rowBg;
                    }}
                  >
                    <td
                      style={{
                        textAlign: "center",
                        padding: "4px 8px",
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      <Btn
                        onClick={() => {
                          setForm((prev) => ({
                            ...initialFormState(),
                            index: group.index,
                          }));
                          setShowAddForm(true);
                        }}
                        variant="outline"
                        style={{
                          fontSize: 10,
                          padding: "3px 10px",
                          margin: "0 auto",
                        }}
                      >
                        <EditDocumentIcon
                          style={{ fontSize: 12, marginRight: 2 }}
                        />{" "}
                        Edit
                      </Btn>
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        padding: "4px 0",
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => handleRowCheck(group.id)}
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "7px 4px",
                        color: C.valueText,
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      {group.index}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "7px 4px",
                        color: C.valueText,
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      {group.description}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "7px 4px",
                        color: C.valueText,
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      {group.sipAccount}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "7px 4px",
                        color: C.valueText,
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      {group.displayName}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "7px 4px",
                        color: C.valueText,
                        borderRight: "0.5px solid #edf2f7",
                        wordBreak: "break-all",
                      }}
                    >
                      {group.ports}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "7px 4px",
                        color: C.valueText,
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      {group.portSelectMode}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "7px 4px",
                        color: C.valueText,
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      {group.enumRule}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "7px 4px",
                        color: C.valueText,
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      {group.ringExpire}
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontSize: 12,
                        padding: "7px 4px",
                        color: C.valueText,
                        borderRight: "0.5px solid #edf2f7",
                      }}
                    >
                      {group.robKey}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Pagination */}
      {groups.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderTop: `0.5px solid ${C.cardBorder}`,
            background: "#f8fafc",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: C.mutedText }}>
            Showing {groups.length} records on page 1
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Btn disabled variant="outline">
              First
            </Btn>
            <Btn disabled variant="outline">
              ← Prev
            </Btn>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.accent,
                background: "#e0f2fe",
                padding: "5px 14px",
                borderRadius: 6,
                border: `0.5px solid ${C.cardBorder}`,
              }}
            >
              Page 1 of 1
            </span>
            <Btn disabled variant="outline">
              Next →
            </Btn>
            <Btn disabled variant="outline">
              Last
            </Btn>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddForm = () => (
    <div
      style={{
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "#1e2d42",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16,
          textAlign: "center",
          padding: "14px 24px",
        }}
      >
        {PORT_GROUP_ADD_TITLE}
      </div>

      <div style={{ padding: "20px 24px", backgroundColor: C.pageBg }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Settings Section */}
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 6,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                marginBottom: 14,
                borderBottom: `1px solid ${C.cardBorder}`,
                paddingBottom: 6,
              }}
            >
              Configuration
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FieldRow label="Index">
                <select
                  value={form.index}
                  onChange={(e) => handleFormChange("index", e.target.value)}
                  style={inputStyle}
                >
                  {PORT_GROUP_INDEX_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Description">
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  style={inputStyle}
                  maxLength={23}
                />
              </FieldRow>

              <FieldRow label="Register Port Group">
                <select
                  value={form.registerPortGroup}
                  onChange={(e) =>
                    handleFormChange("registerPortGroup", e.target.value)
                  }
                  style={inputStyle}
                >
                  {PORT_GROUP_REGISTER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>

              {form.registerPortGroup === "1" && (
                <>
                  <FieldRow label="SIP Account">
                    <input
                      type="text"
                      value={form.sipAccount}
                      onChange={(e) =>
                        handleFormChange("sipAccount", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </FieldRow>
                  <FieldRow label="Display Name">
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) =>
                        handleFormChange("displayName", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </FieldRow>
                  <FieldRow label="Password">
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        handleFormChange("password", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </FieldRow>
                </>
              )}

              <FieldRow label="Authentication Mode">
                <select
                  value={form.registerSelectMode}
                  onChange={(e) =>
                    handleFormChange("registerSelectMode", e.target.value)
                  }
                  style={inputStyle}
                >
                  {PORT_GROUP_AUTHENTICATION_MODE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Port Select Mode">
                <select
                  value={form.portSelectMode}
                  onChange={(e) =>
                    handleFormChange("portSelectMode", e.target.value)
                  }
                  style={inputStyle}
                >
                  {PORT_GROUP_SELECT_MODE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>

              {form.portSelectMode === "5" && (
                <>
                  <FieldRow label="Rule for Ringing by Turns">
                    <input
                      type="text"
                      value={form.enumRule}
                      onChange={(e) =>
                        handleFormChange("enumRule", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </FieldRow>
                  <FieldRow label="Timeout for Ringing by Turns (s)">
                    <input
                      type="text"
                      value={form.ringExpire}
                      onChange={(e) =>
                        handleFormChange("ringExpire", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </FieldRow>
                </>
              )}

              {form.portSelectMode !== "4" && form.portSelectMode !== "5" && (
                <FieldRow label="Preemptive Answer Keyboard Shortcut">
                  <input
                    type="text"
                    value={form.robKey}
                    onChange={(e) => handleFormChange("robKey", e.target.value)}
                    style={inputStyle}
                  />
                </FieldRow>
              )}

              <FieldRow label="Port Reused by Multiple Groups">
                <select
                  value={form.enablePortMultiGroup}
                  onChange={(e) =>
                    handleFormChange("enablePortMultiGroup", e.target.value)
                  }
                  style={inputStyle}
                >
                  {PORT_GROUP_MULTI_GROUP_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>
            </div>
          </div>

          {/* Ports Section */}
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 6,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.labelText,
                marginBottom: 14,
                borderBottom: `1px solid ${C.cardBorder}`,
                paddingBottom: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Assign Ports
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={handleCheckAllPorts}
                  variant="outline"
                  style={{ padding: "3px 10px", fontSize: 10 }}
                >
                  Check All
                </Btn>
                <Btn
                  onClick={handleInversePorts}
                  variant="outline"
                  style={{ padding: "3px 10px", fontSize: 10 }}
                >
                  Inverse
                </Btn>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 12,
              }}
            >
              {form.ports.map((val, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 12,
                    color: C.valueText,
                    cursor: "pointer",
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={val}
                    onChange={() => handlePortToggle(idx)}
                    sx={{
                      padding: "2px",
                      marginRight: "4px",
                      color: C.accent,
                      "&.Mui-checked": { color: C.accent },
                    }}
                  />
                  Port {idx + 1}(FXS)
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "16px 24px",
          background: C.pageBg,
          borderTop: `1px solid ${C.cardBorder}`,
          display: "flex",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <Btn onClick={handleSave} style={{ padding: "8px 28px", fontSize: 13 }}>
          Save
        </Btn>
        <Btn
          onClick={handleCancel}
          variant="outline"
          style={{ padding: "8px 28px", fontSize: 13 }}
        >
          Cancel
        </Btn>
      </div>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            FXS &rsaquo; Port &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Port Group
            </span>
          </div>
        </div>

        {/* Main Content */}
        {!showAddForm && renderTable()}
        {showAddForm && renderAddForm()}
      </div>
    </div>
  );
};

export default PortGroupPage;
