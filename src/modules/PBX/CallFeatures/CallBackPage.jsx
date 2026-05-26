import React, { useState, useEffect, useRef } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Checkbox,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

import {
  fetchSipAccounts,
  listTrunkIds,
  fetchCallbackRules,
  createCallbackRule,
  updateCallbackRule,
  deleteCallbackRule,
} from "../../../api/apiService";

// ── Color palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2563eb",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};

// ── Shared: Action Button ────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
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
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

// ─────────────────────────────────────────────────────────────────────────────

const CallBackPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    fetch: false,
    delete: false,
    save: false,
    extensions: false,
  });
  const [error, setError] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Search & Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Add/Edit modal state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [delay, setDelay] = useState("10");
  const [strip, setStrip] = useState("");
  const [prepend, setPrepend] = useState("");
  const [destination, setDestination] = useState("");
  const [throughAuto, setThroughAuto] = useState(true);
  const [throughFromComeIn, setThroughFromComeIn] = useState(false);
  const [throughSelect, setThroughSelect] = useState(false);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const [trunkOptions, setTrunkOptions] = useState([]);
  const orderOptions = Array.from({ length: 21 }, (_, i) => i * 5);

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = useRef(null);

  const showAlert = (type, text) => {
    setError({ type, text });
    setTimeout(() => setError({ type: "", text: "" }), 5000);
  };

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCallbackRules();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setRows(
        list.map((item) => ({
          id: item.id,
          name: item.name || "",
          delay: item.delay_sec != null ? String(item.delay_sec) : "10",
          strip: item.strip_digits != null ? String(item.strip_digits) : "",
          prepend: item.prepend || "",
          destination: item.destination || "",
          throughAuto: item.through_mode === "auto",
          throughFromComeIn: item.through_mode === "from_in",
          throughSelect: item.through_mode === "select",
        })),
      );
      setLastUpdated(new Date());
    } catch (err) {
      showAlert("error", err?.message || "Failed to load callbacks.");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchSipAccounts();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res)
          ? res
          : [];
      const exts = list
        .map((item) => String(item.extension ?? ""))
        .filter((x) => x)
        .sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
      setExtensionOptions(exts);
    } catch (err) {
      showAlert("error", err?.message || "Failed to load extensions.");
      setExtensionOptions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  const loadTrunks = async () => {
    try {
      const res = await listTrunkIds();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      const trunks = list
        .map((t) => t?.trunk_id || t?.id || t)
        .filter(Boolean)
        .map(String);
      setTrunkOptions(trunks);
    } catch (err) {
      console.error("Failed to load trunk IDs for callback:", err);
      setTrunkOptions([]);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadRows();
    }
  }, []);

  // ── Search & Pagination Logic ──
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.destination, r.delay].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : rows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(filteredRows.length / itemsPerPage)),
      ),
    );
  }, [filteredRows.length]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // ── Checkbox Logic ──
  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("error", "Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const ids = selected.map((i) => filteredRows[i]?.id).filter(Boolean);
      await Promise.all(ids.map((id) => deleteCallbackRule(id)));
      setSelected([]);
      setPage(1);
      await loadRows();
      showAlert("success", `Deleted ${ids.length} item(s).`);
    } catch (err) {
      showAlert("error", err?.message || "Failed to delete.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // ── Form Modal Handlers ──
  const resetForm = () => {
    setEditId(null);
    setName("");
    setDelay("10");
    setStrip("");
    setPrepend("");
    setDestination("");
    setThroughAuto(true);
    setThroughFromComeIn(false);
    setThroughSelect(false);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await Promise.all([loadExtensions(), loadTrunks()]);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setDelay(row.delay ?? "");
    setStrip(row.strip ?? "");
    setPrepend(row.prepend ?? "");
    setDestination(row.destination || "");
    setThroughAuto(!!row.throughAuto);
    setThroughFromComeIn(!!row.throughFromComeIn);
    setThroughSelect(!!row.throughSelect);
    setShowModal(true);
    await Promise.all([loadExtensions(), loadTrunks()]);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return showAlert("error", "Please enter a Name.");
    if (!delay) return showAlert("error", "Please enter Delay (s).");
    if (!destination) return showAlert("error", "Please select Destination.");

    const delaySec = Number(delay) || 0;
    const stripDigits = strip === "" ? 0 : Number(strip) || 0;

    let through_mode = "auto";
    if (throughSelect) through_mode = "select";
    else if (throughFromComeIn) through_mode = "from_in";

    const apiPayload = {
      name: trimmedName,
      delay_sec: delaySec,
      strip_digits: stripDigits,
      prepend,
      destination,
      through_mode,
      enabled: true,
      trunks: [], // Logic kept exactly as original
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateCallbackRule({ id: editId, ...apiPayload });
        showAlert("success", "Callback updated.");
      } else {
        await createCallbackRule(apiPayload);
        showAlert("success", "Callback created.");
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert("error", err?.message || "Failed to save.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile)
      return showAlert("error", "Please select a file to import");
    showAlert("info", "Import API not yet configured");
  };

  const handleExport = () => {
    showAlert("info", "Export API not yet configured");
  };

  const renderThrough = (row) => {
    const labels = [];
    if (row.throughAuto) labels.push("Auto");
    if (row.throughFromComeIn) labels.push("From Come in");
    if (row.throughSelect) labels.push("Select");
    return labels.join(", ") || "Auto";
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Error / Success Banner */}
        {error.text && (
          <Alert
            severity={
              error.type === "error"
                ? "error"
                : error.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setError({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {error.text}
          </Alert>
        )}

        {/* Breadcrumb + Last Updated */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Call Features &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>CallBack</span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "#ffffff",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid #e2e8f0",
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: C.labelText,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: 999,
                }}
              >
                Page {page} · {filteredRows.length} records
              </span>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#e0f2fe",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
                  }}
                >
                  {selected.length} selected
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
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffff",
                  border: `0.5px solid ${searchFocused ? C.accent : C.cardBorder}`,
                  borderRadius: 6,
                  padding: "5px 10px",
                  transition: "border-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: searchFocused ? C.accent : C.mutedText,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search callbacks..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 11,
                    color: C.valueText,
                    outline: "none",
                    width: 160,
                  }}
                />
                {searchQuery && (
                  <span
                    onClick={() => setSearchQuery("")}
                    style={{
                      fontSize: 11,
                      color: C.mutedText,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </span>
                )}
              </div> */}

              {/* <Btn
                onClick={handlePrev}
                disabled={loading.fetch || page <= 1}
                variant="outline"
              >
                ← Prev
              </Btn>
              <Btn
                onClick={handleNext}
                disabled={loading.fetch || page >= totalPages}
                variant="outline"
              >
                Next →
              </Btn> */}
 <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="danger"
                   style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={() => {
                  setImportFile(null);
                  setShowImportModal(true);
                }}
                variant="outline"
                   style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                ⬇ Import
              </Btn>
              <Btn onClick={handleExport} variant="outline"
                 style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}>
                ⬆ Export
              </Btn>
              {/* <Btn
                onClick={loadRows}
                disabled={loading.fetch}
                variant="default"
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#fff" }} />
                ) : (
                  "Refresh"
                )}
              </Btn> */}
             
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.fetch}
                variant="accent"
                   style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {loading.fetch ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 48,
                }}
              >
                <CircularProgress size={28} style={{ color: C.accent }} />
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 36 }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={{
  padding: "1px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
}}
                      />
                    </TH>
                    <TH style={{ width: 40 }}>#</TH>
                    <TH>Name</TH>
                    <TH>Delay (s)</TH>
                    <TH>Strip</TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Prepend
                    </TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Destination
                    </TH>
                    <TH>Through</TH>
                    <TH style={{ width: 70 }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No callbacks found. Click '+ Add New' to create one."}
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const rowBg = isSelected
                        ? "#e0f2fe"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBg,
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 0",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleToggleRow(realIdx)}
                             sx={{
  padding: "1px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
}}
                            />
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 6px",
                              fontSize: 11,
                              color: C.mutedText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 14px",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <span
                              style={{
                                color: C.valueText,
                                padding: "4px 11px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {row.delay}
                            </span>
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 14px",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.strip || "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 13,
                              fontFamily: "monospace",
                              color: C.labelText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.prepend || "—"}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 13,
                              fontWeight: 500,
                              color: C.labelText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.destination || "—"}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 14px",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <span
                              style={{
                                color: row.throughAuto
                                  ? "#166534"
                                  : row.throughFromComeIn
                                    ? C.accent
                                    : "#475569",
                                padding: "4px 11px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 72,
                              }}
                            >
                              {renderThrough(row)}
                            </span>
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "7px 8px" }}
                          >
                            <EditDocumentIcon
  className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
  titleAccess="Edit"
  onClick={() => handleOpenEditModal(row)}
/>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          {!loading.fetch && filteredRows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.fetch || page <= 1}
                  variant="outline"
                >
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
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.fetch || page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 700, maxWidth: "95vw", borderRadius: 2 } }}
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
          {editId != null ? "Edit CallBack Rule" : "Add CallBack"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 12,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 6,
                }}
              >
                CallBack Settings
              </h3>

              {/* TOP-TO-BOTTOM GRID FOR FORM FIELDS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 32px",
                }}
              >
                {/* ── LEFT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Name */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 90,
                        flexShrink: 0,
                      }}
                    >
                      Name <span style={{ color: C.labelText }}>:</span>
                    </label>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </div>

                  {/* Strip */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 90,
                        flexShrink: 0,
                      }}
                    >
                      Strip :
                    </label>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={strip}
                      onChange={(e) => setStrip(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </div>

                  {/* Destination */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 90,
                        flexShrink: 0,
                      }}
                    >
                      Destination <span style={{ color: C.labelText }}>:</span>
                    </label>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        displayEmpty
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                          <span style={{ color: C.mutedText }}>
                            {loading.extensions
                              ? "Loading..."
                              : "Select Destination"}
                          </span>
                        </MenuItem>
                        {extensionOptions.map((ext) => (
                          <MenuItem key={ext} value={ext} sx={{ fontSize: 13 }}>
                            {ext}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {/* Delay */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 90,
                        flexShrink: 0,
                      }}
                    >
                      Delay (s) <span style={{ color: C.labelText }}>:</span>
                    </label>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={delay}
                      onChange={(e) => setDelay(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </div>

                  {/* Prepend */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 90,
                        flexShrink: 0,
                      }}
                    >
                      Prepend :
                    </label>
                    <TextField
                      size="small"
                      fullWidth
                      value={prepend}
                      onChange={(e) => setPrepend(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </div>

                  {/* Through Mode */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 90,
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    >
                      Through :
                    </label>
                    <RadioGroup
                      value={
                        throughSelect
                          ? "select"
                          : throughFromComeIn
                            ? "from_in"
                            : "auto"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setThroughAuto(val === "auto");
                        setThroughFromComeIn(val === "from_in");
                        setThroughSelect(val === "select");
                      }}
                      sx={{ display: "flex", flexDirection: "column", gap: 0 }}
                    >
                      <FormControlLabel
                        value="auto"
                        control={<Radio size="small" sx={{ p: 0.5 }} />}
                        label={<span style={{ fontSize: 13 }}>Auto</span>}
                        sx={{ m: 0 }}
                      />
                      <FormControlLabel
                        value="from_in"
                        control={<Radio size="small" sx={{ p: 0.5 }} />}
                        label={
                          <span style={{ fontSize: 13 }}>From come in</span>
                        }
                        sx={{ m: 0 }}
                      />
                      <FormControlLabel
                        value="select"
                        control={<Radio size="small" sx={{ p: 0.5 }} />}
                        label={<span style={{ fontSize: 13 }}>Select</span>}
                        sx={{ m: 0 }}
                      />
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* Dynamic Select Trunks (Visible only if Through == Select) */}
              {throughSelect && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px dashed ${C.cardBorder}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                      paddingLeft: 102,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.mutedText,
                      }}
                    >
                      Trunk
                    </div>
                    <div
                      style={{
                        width: 80,
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.mutedText,
                        textAlign: "center",
                      }}
                    >
                      Order
                    </div>
                  </div>
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ width: 90 }}></div>{" "}
                      {/* spacer to align with labels */}
                      <div style={{ flex: 1 }}>
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value=""
                            displayEmpty
                            sx={{ fontSize: 13 }}
                          >
                            <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                              {trunkOptions.length
                                ? "Select trunk"
                                : "No trunks"}
                            </MenuItem>
                            {trunkOptions.map((t) => (
                              <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>
                                {t}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                      <div style={{ width: 80 }}>
                        <FormControl size="small" fullWidth>
                          <MuiSelect value={0} sx={{ fontSize: 13 }}>
                            {orderOptions.map((val) => (
                              <MenuItem
                                key={val}
                                value={val}
                                sx={{ fontSize: 13 }}
                              >
                                {val}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>

        <DialogActions
          style={{
            padding: "16px 24px",
            background: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="default"
           style={{
    padding: "8px 28px",
    fontSize: 13,
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",
  }}
          >
            {loading.save ? (
              <CircularProgress
                size={14}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Rule"
                : "Create"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
               style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

      {/* ── Import Modal ── */}
      <Dialog
        open={showImportModal}
        onClose={() => !importLoading && setShowImportModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { p: 0, borderRadius: 2 } }}
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
          Import Callbacks
        </DialogTitle>
        <DialogContent
          style={{ padding: "24px 16px", backgroundColor: C.pageBg }}
        >
          <div
            style={{
              textAlign: "center",
              border: `2px dashed ${C.cardBorder}`,
              borderRadius: 8,
              padding: 32,
              cursor: "pointer",
              background: "#fff",
            }}
            onClick={() => importFileRef.current?.click()}
          >
            <div
              style={{
                fontSize: 13,
                color: importFile ? "#15803d" : C.mutedText,
                fontWeight: importFile ? 600 : 400,
              }}
            >
              {importFile ? importFile.name : "Click to choose CSV/JSON file"}
            </div>
            <input
              ref={importFileRef}
              type="file"
              accept=".csv,.json"
              style={{ display: "none" }}
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>
        </DialogContent>
        <DialogActions
          style={{
            padding: "16px 24px",
            background: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            variant="default"
            style={{ padding: "8px 24px" }}
          >
            Import
          </Btn>
          <Btn
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
            }}
            disabled={importLoading}
            variant="outline"
            style={{ padding: "8px 24px" }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CallBackPage;
