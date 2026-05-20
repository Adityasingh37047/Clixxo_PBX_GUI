import React, { useState, useRef, useEffect } from "react";
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

// ── Color Palette & Shared Styles ─────────────────────────────────────────────
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

// ── Shared: Action Button ─────────────────────────────────────────────────────
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
      background: "#fff",
      color: "#1e293b",
      border: "1px solid #9ca3af",
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

// ── Shared: Table Header ──────────────────────────────────────────────────────
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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

  const displayRows = [
    ...rows,
    ...Array.from({ length: Math.max(0, MIN_ROWS - rows.length) }).map(
      () => null,
    ),
  ];

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb / Title area */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            E1-PRI &rsaquo; Number Filter &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Filtering Rule
            </span>
          </div>
        </div>

        {/* Main Card */}
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
          <div
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
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
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
                  {rows.length} rules
                </span>
                {rows.some((r) => r.checked) && (
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
                    {rows.filter((r) => r.checked).length} selected
                  </span>
                )}
              </div>
              <div
                style={{
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.02em",
                }}
              >
                Filtering Rule
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleDelete}
                disabled={!rows.some((r) => r.checked) || isDeleting}
                variant="danger"
              >
                {isDeleting ? (
                  <CircularProgress size={11} style={{ color: C.errorRed }} />
                ) : null}
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={rows.length === 0 || isDeleting}
                variant="danger"
              >
                Clear All
              </Btn>
              <Btn
                onClick={() => openModal()}
                disabled={isDeleting}
                variant="accent"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table Area */}
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: 400,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1800px",
              }}
            >
              <thead>
                <tr>
                  {FILTERING_RULE_COLUMNS.map((col) => (
                    <TH
                      key={col.key}
                      style={{
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
                {displayRows.map((row, idx) => {
                  const isChecked = row?.checked || false;
                  const rowBg = isChecked
                    ? "#f0f9ff"
                    : idx % 2 === 1
                      ? "#f8fafc"
                      : "#ffffff";
                  return (
                    <tr
                      key={idx}
                      style={{
                        background: rowBg,
                        borderBottom: "0.5px solid #9ca3af",
                        transition: "background 0.1s ease",
                      }}
                    >
                      {FILTERING_RULE_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            textAlign: "center",
                            padding: "7px 8px",
                            fontSize: 12,
                            color: C.valueText,
                            borderRight: "0.5px solid #edf2f7",
                            height: 32,
                          }}
                        >
                          {row ? (
                            col.key === "check" ? (
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleCheck(idx)}
                                size="small"
                                sx={{
                                  padding: 0,
                                  color: C.accent,
                                  "&.Mui-checked": { color: C.accent },
                                }}
                              />
                            ) : col.key === "modify" ? (
                              <Btn
                                onClick={() => openModal(idx)}
                                variant="outline"
                                style={{
                                  fontSize: 10,
                                  padding: "3px 10px",
                                  margin: "0 auto",
                                }}
                              >
                                Edit
                              </Btn>
                            ) : (
                              row[col.key]
                            )
                          ) : (
                            "\u00A0"
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "8px 14px",
              borderTop: `0.5px solid ${C.cardBorder}`,
              background: "#f8fafc",
            }}
          >
            <span style={{ fontSize: 11, color: C.mutedText }}>
              {rows.length} rule{rows.length !== 1 ? "s" : ""} total
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 440, borderRadius: 2 } }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
          }}
        >
          {editIndex !== null ? "Edit" : "Add"} Filtering Rule
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "#eef2f7" }}
        >
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 6,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 160,
                }}
              >
                No.:
              </label>
              <TextField
                name="id"
                value={form.id}
                onChange={handleFormChange}
                size="small"
                fullWidth
                inputProps={{ style: { fontSize: 12, height: 16 } }}
                sx={{ backgroundColor: "#fff" }}
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
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.labelText,
                    width: 160,
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
                    fontSize: 12,
                    height: 32,
                    backgroundColor: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#999999",
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
                    <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>
                      {opt}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions
          style={{
            padding: "16px 24px",
            background: "#eef2f7",
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            disabled={isLoading}
            style={{ padding: "8px 32px" }}
          >
            {isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={closeModal}
            variant="outline"
            style={{ padding: "8px 32px" }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

      {showToast && (
        <div className="fixed top-4 right-4 z-[9999] max-w-sm w-[90vw] sm:w-auto">
          <Alert
            severity={toastType}
            onClose={() => setShowToast(false)}
            sx={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: "8px",
            }}
          >
            {toastMessage}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default FilteringRule;
