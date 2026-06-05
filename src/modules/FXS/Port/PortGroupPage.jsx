import React, { useState, useEffect } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  PORT_GROUP_TOTAL_PORTS,
  PORT_GROUP_TABLE_COLUMNS,
  PORT_GROUP_INDEX_OPTIONS,
  PORT_GROUP_REGISTER_OPTIONS,
  PORT_GROUP_AUTHENTICATION_MODE_OPTIONS,
  PORT_GROUP_SELECT_MODE_OPTIONS,
  PORT_GROUP_MULTI_GROUP_OPTIONS,
} from "../../../sections/port/constants/PortGroupPageConstants";
import {
  C,
  Btn,
  TH,
  tdStyle,
  checkboxSx,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
  routeTableMinWidthForZoom,
  fxsNativeFieldInputStyle,
  fxsNativeFieldSelectStyle,
  fxsNativeFieldInteraction,
} from "../../../sections/fxs/fxsSharedUi";

const routeTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "7px 8px",
};

const routeThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

const FieldRow = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
        textAlign: "left",
      }}
    >
      {label}
    </label>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const inputStyle = {
  ...fxsNativeFieldInputStyle,
  width: "100%",
  height: 32,
};

const selectStyle = {
  ...fxsNativeFieldSelectStyle,
  width: "100%",
};

const inputInteraction = fxsNativeFieldInteraction;

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [form, setForm] = useState(initialFormState());
  const [checkedRows, setCheckedRows] = useState({});
  const [tableMinWidth, setTableMinWidth] = useState("100%");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please|invalid|must|choose|select|no port groups/i.test(
        msg,
      ) && !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      setTableMinWidth(routeTableMinWidthForZoom(1400));
    };
    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateTableWidthForZoom);
    vv?.addEventListener("scroll", updateTableWidthForZoom);
    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("scroll", updateTableWidthForZoom);
    };
  }, []);

  const handleOpenModal = (group = null) => {
    if (group) {
      setForm({
        ...initialFormState(),
        index: group.index,
      });
      setEditingGroupId(group.id);
    } else {
      setForm(initialFormState());
      setEditingGroupId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroupId(null);
    setForm(initialFormState());
  };

  const handleAddNewClick = () => {
    handleOpenModal();
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
    handleCloseModal();
    alert(
      editingGroupId !== null
        ? "Port group updated successfully!"
        : "Port group added successfully!",
    );
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
    const selectedIds = groups.filter((g) => checkedRows[g.id]);
    if (selectedIds.length === 0) {
      alert("Please select at least one item to delete.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected item(s)?`,
    );
    if (!confirmed) return;
    setGroups((prev) => prev.filter((g) => !checkedRows[g.id]));
    setCheckedRows({});
    alert("Selected port group(s) deleted successfully!");
  };

  const handleClearAll = () => {
    if (groups.length === 0) {
      alert("No port groups to clear.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${groups.length} port group(s)? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setGroups([]);
    setCheckedRows({});
    alert("All port groups cleared successfully!");
  };

  const selectedCount = Object.values(checkedRows).filter(Boolean).length;
  const allChecked =
    groups.length > 0 && groups.every((g) => checkedRows[g.id]);

  const renderEmptyState = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "#3E5475",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        No available port group!
      </div>
      <Btn
        variant="cancel"
        onClick={handleAddNewClick}
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        + Add New
      </Btn>
    </div>
  );

  const renderTableCell = (col, group, isSelected, rowBg, cellExtra = {}) => {
    if (col.key === "modify") {
      return (
        <td
          key={col.key}
          style={{
            ...routeTdStyle,
            background: rowBg,
            borderRight: "none",
            ...cellExtra,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <EditDocumentIcon
              titleAccess="Edit"
              style={{
                cursor: "pointer",
                color: "#2563eb",
                fontSize: 22,
                opacity: 0.7,
                transition: "opacity 0.15s ease",
              }}
              onClick={() => handleOpenModal(group)}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
            />
          </div>
        </td>
      );
    }
    if (col.key === "check") {
      return (
        <td
          key={col.key}
          style={{
            ...routeTdStyle,
            background: rowBg,
            width: 36,
            ...cellExtra,
          }}
        >
          <Checkbox
            size="small"
            checked={isSelected}
            onChange={() => handleRowCheck(group.id)}
            sx={checkboxSx}
          />
        </td>
      );
    }
    return (
      <td
        key={col.key}
        style={{
          ...routeTdStyle,
          background: rowBg,
          wordBreak: col.key === "ports" ? "break-all" : undefined,
          ...cellExtra,
        }}
      >
        {group[col.key]}
      </td>
    );
  };

  const tableSectionBorder = `1px solid ${C.cardBorder}`;

  const renderTable = () => (
    <div
      style={{
        ...numManipulateCardStyle,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={numManipulateToolbarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {selectedCount > 0 && (
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
              {selectedCount} selected
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
            variant="cancel"
            onClick={handleTableInverse}
            disabled={groups.length === 0}
            style={{ height: 30 }}
          >
            Inverse
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleDelete}
            disabled={selectedCount === 0}
            style={{ height: 30 }}
          >
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            Delete
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleClearAll}
            disabled={groups.length === 0}
            style={{ height: 30 }}
          >
            Clear All
          </Btn>
          <Btn
            variant="primary"
            onClick={handleAddNewClick}
            style={{
              height: 30,
              padding: "6px 14px",
              fontSize: 12,
              borderRadius: 10,
            }}
          >
            + Add New
          </Btn>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          overflowY: "auto",
          width: "100%",
          boxSizing: "border-box",
          borderBottom: groups.length > 0 ? tableSectionBorder : undefined,
        }}
      >
        {groups.length === 0 ? (
          renderEmptyState()
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              minWidth: tableMinWidth,
            }}
          >
            <thead>
              <tr>
                {PORT_GROUP_TABLE_COLUMNS.map((col) => {
                  if (col.key === "check") {
                    return (
                      <TH
                        key={col.key}
                        style={{
                          width: 40,
                          padding: 0,
                          ...routeThExtra,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={allChecked}
                          indeterminate={
                            selectedCount > 0 && !allChecked
                          }
                          onChange={(e) => {
                            if (e.target.checked) handleTableCheckAll();
                            else handleTableUncheckAll();
                          }}
                          sx={checkboxSx}
                        />
                      </TH>
                    );
                  }
                  if (col.key === "modify") {
                    return (
                      <TH
                        key={col.key}
                        style={{
                          width: 70,
                          borderRight: "none",
                          ...routeThExtra,
                        }}
                      >
                        {col.label}
                      </TH>
                    );
                  }
                  return (
                    <TH key={col.key} style={routeThExtra}>
                      {col.label}
                    </TH>
                  );
                })}
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
                    {PORT_GROUP_TABLE_COLUMNS.map((col) =>
                      renderTableCell(col, group, isSelected, rowBg, {}),
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {groups.length > 0 && (
        <div style={{ ...numManipulatePaginationStyle, borderTop: "none" }}>
          <span style={{ fontSize: 11, color: C.mutedText }}>
            Showing {groups.length} record{groups.length !== 1 ? "s" : ""} on
            page 1
          </span>
          <div style={{ display: "flex", gap: 8 }}>
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
                border: `1px solid ${C.cardBorder}`,
              }}
            >
              Page 1 of 1
            </span>
            <Btn disabled variant="outline">
              Next →
            </Btn>
          </div>
        </div>
      )}
    </div>
  );

  const renderFormFields = () => (
    <>
              <FieldRow label="ID:">
                <select
                  value={form.index}
                  onChange={(e) => handleFormChange("index", e.target.value)}
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {PORT_GROUP_INDEX_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Description:">
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  style={inputStyle}
                  {...inputInteraction}
                  maxLength={23}
                />
              </FieldRow>

              <FieldRow label="Register Port Group:">
                <select
                  value={form.registerPortGroup}
                  onChange={(e) =>
                    handleFormChange("registerPortGroup", e.target.value)
                  }
                  style={selectStyle}
                  {...inputInteraction}
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
                  <FieldRow label="SIP Account:">
                    <input
                      type="text"
                      value={form.sipAccount}
                      onChange={(e) =>
                        handleFormChange("sipAccount", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                  <FieldRow label="Display Name:">
                    <input
                      type="text"
                      value={form.displayName}
                      onChange={(e) =>
                        handleFormChange("displayName", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                  <FieldRow label="Password:">
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        handleFormChange("password", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                </>
              )}

              <FieldRow label="Authentication Mode:">
                <select
                  value={form.registerSelectMode}
                  onChange={(e) =>
                    handleFormChange("registerSelectMode", e.target.value)
                  }
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {PORT_GROUP_AUTHENTICATION_MODE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="Port Select Mode:">
                <select
                  value={form.portSelectMode}
                  onChange={(e) =>
                    handleFormChange("portSelectMode", e.target.value)
                  }
                  style={selectStyle}
                  {...inputInteraction}
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
                  <FieldRow label="Rule for Ringing by Turns:">
                    <input
                      type="text"
                      value={form.enumRule}
                      onChange={(e) =>
                        handleFormChange("enumRule", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                  <FieldRow label="Timeout for Ringing by Turns (s):">
                    <input
                      type="text"
                      value={form.ringExpire}
                      onChange={(e) =>
                        handleFormChange("ringExpire", e.target.value)
                      }
                      style={inputStyle}
                      {...inputInteraction}
                    />
                  </FieldRow>
                </>
              )}

              {form.portSelectMode !== "4" && form.portSelectMode !== "5" && (
                <FieldRow label="Preemptive Answer Keyboard Shortcut:">
                  <input
                    type="text"
                    value={form.robKey}
                    onChange={(e) => handleFormChange("robKey", e.target.value)}
                    style={inputStyle}
                    {...inputInteraction}
                  />
                </FieldRow>
              )}

              <FieldRow label="Port Reused by Multiple Groups:">
                <select
                  value={form.enablePortMultiGroup}
                  onChange={(e) =>
                    handleFormChange("enablePortMultiGroup", e.target.value)
                  }
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {PORT_GROUP_MULTI_GROUP_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldRow>
    </>
  );

  const renderPortsSection = () => (
          <div
            style={{
              background: "#ffffff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
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
                  variant="cancel"
                  style={{ height: 28, padding: "4px 12px", fontSize: 11 }}
                >
                  Check All
                </Btn>
                <Btn
                  onClick={handleInversePorts}
                  variant="cancel"
                  style={{ height: 28, padding: "4px 12px", fontSize: 11 }}
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
                    sx={checkboxSx}
                  />
                  Port {idx + 1}(FXS)
                </label>
              ))}
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
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}>
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
          <span>FXS</span>
          <span>&gt;</span>
          <span>Port</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Port Group
          </span>
        </div>

        {renderTable()}

        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          maxWidth={false}
          PaperProps={{
            sx: {
              width: 720,
              maxWidth: "95vw",
              p: 0,
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow:
                "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            },
          }}
          disableRestoreFocus
          disableEnforceFocus
        >
          <DialogTitle
            style={{
              background: "#1e2d42",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 16,
              padding: "16px 24px",
              textAlign: "center",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            {editingGroupId !== null ? "Edit Port Group" : "Add Port Group"}
          </DialogTitle>
          <DialogContent
            style={{
              padding: "24px",
              backgroundColor: "#ffffff",
              maxHeight: "75vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  background: "#f8fafc",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 8,
                  padding: 20,
                }}
              >
                {renderFormFields()}
              </div>
              {renderPortsSection()}
            </div>
          </DialogContent>
          <DialogActions
            style={{
              padding: "16px 24px",
              background: "#f8fafc",
              borderTop: `1px solid ${C.cardBorder}`,
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Btn
              variant="primary"
              onClick={handleSave}
              style={{ minWidth: 100, height: 33, fontSize: 13 }}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleCloseModal}
              style={{ minWidth: 100, height: 33 }}
            >
              Close
            </Btn>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PortGroupPage;
