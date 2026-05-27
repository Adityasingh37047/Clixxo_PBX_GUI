import React, { useState, useEffect } from "react";
import {
  FILTERING_RULE_COLUMNS,
  FILTERING_RULE_DROPDOWN_OPTIONS,
} from "../../../constants/FilteringRuleConstants";
import {
  listFinalNumberFilter,
  createFinalNumberFilter,
  deleteFinalNumberFilter,
  fetchAllNumberFilters,
  listNumberPool,
} from "../../../api/apiService";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  Alert,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

// ── Color palette (matches Number-Receiving Rule) ─────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 20;

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
      background: " #cbd5e1",
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
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: `0.5px solid #fecaca`,
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "cancel":
        return "#b6c2d3";
      case "danger":
        return "#fca5a5";
      case "outline":
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

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
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
  padding: "10px 14px",
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
};

const MIN_ROWS = 14;
const initialForm = {
  id: 0,
  callerIdWhitelist: "none",
  calleeIdWhitelist: "none",
  callerIdBlacklist: "none",
  calleeIdBlacklist: "none",
  callerIdPoolWhitelist: "none",
  callerIdPoolBlacklist: "none",
  calleeIdPoolWhitelist: "none",
  calleeIdPoolBlacklist: "none",
  originalCallerIdPoolWhitelist: "none",
  originalCallerIdPoolBlacklist: "none",
};

const FilteringRule = () => {
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [groupOptions, setGroupOptions] = useState({
    wlCaller: ["none"],
    wlCallee: ["none"],
    blCaller: ["none"],
    blCallee: ["none"],
    poolGroups: ["none"],
  });
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please/i.test(msg) && !/successfully/i.test(msg);
    displayToast(msg, isErr ? "error" : "success");
  };

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    if (rowIdx !== null) {
      setForm(rows[rowIdx]);
    } else {
      setForm(initialForm);
    }
    setModalOpen(true);
  };

  const loadGroupOptions = async () => {
    try {
      const [filtersRes, poolRes] = await Promise.all([
        fetchAllNumberFilters().catch(() => ({ success: false, data: [] })),
        listNumberPool().catch(() => ({})),
      ]);

      const data = filtersRes && filtersRes.data ? filtersRes.data : [];
      const unique = (arr) =>
        Array.from(new Set(arr)).sort((a, b) => Number(a) - Number(b));
      const wlCaller = unique(
        data
          .filter(
            (i) =>
              i.type === "whitelist" &&
              i.caller_id !== null &&
              i.group !== undefined,
          )
          .map((i) => String(i.group)),
      );
      const wlCallee = unique(
        data
          .filter(
            (i) =>
              i.type === "whitelist" &&
              i.callee_id !== null &&
              i.group !== undefined,
          )
          .map((i) => String(i.group)),
      );
      const blCaller = unique(
        data
          .filter(
            (i) =>
              i.type === "blacklist" &&
              i.caller_id !== null &&
              i.group !== undefined,
          )
          .map((i) => String(i.group)),
      );
      const blCallee = unique(
        data
          .filter(
            (i) =>
              i.type === "blacklist" &&
              i.callee_id !== null &&
              i.group !== undefined,
          )
          .map((i) => String(i.group)),
      );

      const poolArray = poolRes?.data || poolRes?.message || [];
      const poolGroups = unique(
        Array.isArray(poolArray)
          ? poolArray
              .map((e) => e?.group ?? e?.group_no ?? e?.groupNo)
              .filter((v) => v !== undefined)
              .map(String)
          : [],
      );

      setGroupOptions({
        wlCaller: wlCaller.length ? wlCaller : ["none"],
        wlCallee: wlCallee.length ? wlCallee : ["none"],
        blCaller: blCaller.length ? blCaller : ["none"],
        blCallee: blCallee.length ? blCallee : ["none"],
        poolGroups: poolGroups.length ? poolGroups : ["none"],
      });
    } catch (e) {
      setGroupOptions({
        wlCaller: ["none"],
        wlCallee: ["none"],
        blCaller: ["none"],
        blCallee: ["none"],
        poolGroups: ["none"],
      });
    }
  };

  useEffect(() => {
    loadGroupOptions();
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = {
      caller_id_white_list: String(form.callerIdWhitelist),
      callee_id_white_list: String(form.calleeIdWhitelist),
      caller_id_black_list: String(form.callerIdBlacklist),
      callee_id_black_list: String(form.calleeIdBlacklist),
      caller_id_pool_in_white_list: String(form.callerIdPoolWhitelist),
      callee_id_pool_in_white_list: String(form.calleeIdPoolWhitelist),
      caller_id_pool_in_black_list: String(form.callerIdPoolBlacklist),
      callee_id_pool_in_black_list: String(form.calleeIdPoolBlacklist),
      original_caller_id_pool_in_white_list: String(
        form.originalCallerIdPoolWhitelist,
      ),
      original_caller_id_pool_in_black_list: String(
        form.originalCallerIdPoolBlacklist,
      ),
    };
    try {
      setIsLoading(true);
      await createFinalNumberFilter(payload);
      await loadRows();
      displayToast("Filtering rule saved successfully.", "success");
      closeModal();
    } catch (e) {
      console.error("Failed to save filtering rule", e);
      displayToast("Failed to save filtering rule.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const handleDelete = async () => {
    const toDelete = rows.filter((r) => r.checked).map((r) => r.id);
    if (toDelete.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${toDelete.length} selected item(s)?`,
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      for (const id of toDelete) {
        await deleteFinalNumberFilter(id);
      }
      await loadRows();
      displayToast(
        `Deleted ${toDelete.length} item(s) successfully.`,
        "success",
      );
    } catch (e) {
      console.error("Delete filtering rule failed", e);
      displayToast("Delete failed. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    if (rows.length === 0) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${rows.length} item(s)?`,
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const ids = rows.map((r) => r.id).filter(Boolean);
      for (const id of ids) {
        await deleteFinalNumberFilter(id);
      }
      await loadRows();
      displayToast(
        `Cleared all ${ids.length} item(s) successfully.`,
        "success",
      );
    } catch (e) {
      console.error("Clear all filtering rules failed", e);
      displayToast("Clear all failed.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadRows = async () => {
    try {
      const res = await listFinalNumberFilter();
      if (res?.response && Array.isArray(res.message)) {
        const mapped = res.message.map((item) => ({
          id: item.id,
          callerIdWhitelist: item.caller_id_white_list,
          calleeIdWhitelist: item.callee_id_white_list,
          callerIdBlacklist: item.caller_id_black_list,
          calleeIdBlacklist: item.callee_id_black_list,
          callerIdPoolWhitelist: item.caller_id_pool_in_white_list,
          callerIdPoolBlacklist: item.caller_id_pool_in_black_list,
          calleeIdPoolWhitelist: item.callee_id_pool_in_white_list,
          calleeIdPoolBlacklist: item.callee_id_pool_in_black_list,
          originalCallerIdPoolWhitelist:
            item.original_caller_id_pool_in_white_list,
          originalCallerIdPoolBlacklist:
            item.original_caller_id_pool_in_black_list,
        }));
        setRows(mapped);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error("Failed to load filtering rules", e);
      setRows([]);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      {/* Alerts */}
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
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb / Title area */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            display: "flex",
            gap: 4,
          }}
        >
          E1-PRI &rsaquo; Number Filter &rsaquo;{" "} 
          <span style={{ color: C.valueText, fontWeight: 600 }}>
            Filtering Rule
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Top Actions Bar */}
          <div
            style={{
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              background: "#ffffff",
              borderBottom: `1px solid ${C.cardBorder}`,
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
            }}
          >
            {/* Left Section */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {rows.some((r) => r.checked) && (
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
                  {rows.filter((r) => r.checked).length} selected
                </span>
              )}
            </div>

            {/* Right Section: Actions */}
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
                onClick={handleDelete}
                disabled={!rows.some((r) => r.checked) || isDeleting}
                style={{ height: 30 }}
              >
                {isDeleting ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    Delete
                  </>
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rows.length === 0 || isDeleting}
                style={{ height: 30 }}
              >
                Clear All
              </Btn>
              <Btn
                variant="primary"
                onClick={() => openModal()}
                disabled={isDeleting}
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
              flex: 1,
            }}
          >
            {rows.length === 0 ? (
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
                  No Filtering Rules Configured!
                </div>
                <Btn
                  onClick={() => openModal()}
                  variant="cancel"
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New Rule
                </Btn>
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: "1800px",
                }}
              >
                  <thead>
                    <tr>
                      {FILTERING_RULE_COLUMNS.map((col) => (
                        <TH
                          key={col.key}
                          style={{
                            ...(col.key === "check" ? { borderLeft: "none" } : {}),
                            ...(col.key === "modify" ? { borderRight: "none" } : {}),
                            width:
                              col.key === "check"
                                ? 60
                                : col.key === "modify"
                                  ? 80
                                  : col.key === "description"
                                    ? 180
                                    : [
                                          "callerIdPoolWhitelist",
                                          "callerIdPoolBlacklist",
                                          "calleeIdPoolWhitelist",
                                          "calleeIdPoolBlacklist",
                                          "originalCallerIdPoolWhitelist",
                                          "originalCallerIdPoolBlacklist",
                                        ].includes(col.key)
                                      ? 160
                                      : [
                                            "callerIdWhitelist",
                                            "calleeIdWhitelist",
                                            "callerIdBlacklist",
                                            "calleeIdBlacklist",
                                          ].includes(col.key)
                                        ? 140
                                        : 100,
                          }}
                        >
                          {col.label}
                        </TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const realIdx = idx;
                      const isChecked = row?.checked || false;
                      const isLastRow = idx === rows.length - 1;
                      const rowBg = isChecked
                        ? "#f0f9ff"
                        : realIdx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: `1px solid ${C.cardBorder}` }
                        : {};
                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.1s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isChecked)
                              e.currentTarget.style.background = "#f1f5f9";
                          }}
                          onMouseLeave={(e) => {
                            if (!isChecked)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          {FILTERING_RULE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                ...(col.key === "check"
                                  ? { borderLeft: "none" }
                                  : {}),
                                ...(col.key === "modify"
                                  ? { borderRight: "none" }
                                  : {}),
                                ...lastRowCellStyle,
                              }}
                            >
                              {col.key === "check" ? (
                                <Checkbox
                                  checked={isChecked}
                                  onChange={() => handleCheck(realIdx)}
                                  size="small"
                                  sx={checkboxSx}
                                />
                              ) : col.key === "modify" ? (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <EditDocumentIcon
                                    titleAccess="Edit"
                                    style={{
                                      cursor: "pointer",
                                      color: "#2563eb",
                                      fontSize: 22,
                                      opacity: 0.7,
                                      transition: "opacity 0.15s ease",
                                    }}
                                    onClick={() => openModal(realIdx)}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.opacity = "1")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.opacity = "0.7")
                                    }
                                  />
                                </div>
                              ) : col.key === "id" ? (
                                realIdx + 1
                              ) : (
                                row[col.key]
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
              </table>
            )}
          </div>

          {rows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#ffffff",
                borderTop: `1px solid ${C.cardBorder}`,
                borderBottomLeftRadius: CARD_RADIUS,
                borderBottomRightRadius: CARD_RADIUS,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {rows.length} record
                {rows.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: {
            width: 600,
            maxWidth: "95vw",
            mx: "auto",
            p: 0,
            borderRadius: 2,
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
            textAlign: "center",
            padding: "16px 24px",
          }}
        >
          {editIndex !== null ? "Edit" : "Add"} Filtering Rule
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#f8fafc" }}>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 200,
                  whiteSpace: "normal",
                  lineHeight: 1.2,
                }}
              >
                No.:
              </label>
              <TextField
                name="id"
                value={editIndex !== null ? editIndex + 1 : rows.length + 1}
                disabled
                size="small"
                fullWidth
                inputProps={{ style: { fontSize: 13, height: 16 } }}
                sx={{
                  backgroundColor: "#f1f5f9",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: C.cardBorder,
                      transition: "border-color 0.2s ease",
                    },
                  },
                  "& .Mui-disabled": {
                    WebkitTextFillColor: "#64748b",
                  }
                }}
              />
            </div>
            {[
              {
                key: "callerIdWhitelist",
                label: "CallerID Whitelist:",
                options: groupOptions.wlCaller,
              },
              {
                key: "calleeIdWhitelist",
                label: "CalleeID Whitelist:",
                options: groupOptions.wlCallee,
              },
              {
                key: "callerIdBlacklist",
                label: "CallerID Blacklist:",
                options: groupOptions.blCaller,
              },
              {
                key: "calleeIdBlacklist",
                label: "CalleeID Blacklist:",
                options: groupOptions.blCallee,
              },
              {
                key: "callerIdPoolWhitelist",
                label: "CallerID Pool in Whitelist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "callerIdPoolBlacklist",
                label: "CallerID Pool in Blacklist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "calleeIdPoolWhitelist",
                label: "CalleeID Pool in Whitelist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "calleeIdPoolBlacklist",
                label: "CalleeID Pool in Blacklist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "originalCallerIdPoolWhitelist",
                label: "Original CallerID Pool in Whitelist:",
                options: groupOptions.poolGroups,
              },
              {
                key: "originalCallerIdPoolBlacklist",
                label: "Original CallerID Pool in Blacklist:",
                options: groupOptions.poolGroups,
              },
            ].map((field) => (
              <div
                key={field.key}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.labelText,
                    width: 200,
                    whiteSpace: "normal",
                    lineHeight: 1.2,
                  }}
                >
                  {field.label}
                </label>
                <MuiSelect
                  name={field.key}
                  value={form[field.key] || "none"}
                  onChange={handleFormChange}
                  size="small"
                  fullWidth
                  sx={{
                    fontSize: 13,
                    height: 36,
                    backgroundColor: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: C.cardBorder,
                      transition: "border-color 0.2s ease",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#64748b",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0284c7 !important",
                      borderWidth: "1px !important",
                    },
                  }}
                >
                  {[
                    "none",
                    ...Array.from(
                      new Set(
                        (field.options || []).filter((o) => o !== "none"),
                      ),
                    ),
                  ].map((opt) => (
                    <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                      {opt === "none" ? "None" : opt}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            background: "#ffffff",
            padding: "16px 24px",
            borderTop: `1px solid ${C.cardBorder}`,
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            variant="primary"
            style={{ width: 120, height: 38 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={16} style={{ color: "#fff" }} />
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={closeModal}
            variant="cancel"
            style={{ width: 120, height: 38 }}
            disabled={isLoading}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FilteringRule;
