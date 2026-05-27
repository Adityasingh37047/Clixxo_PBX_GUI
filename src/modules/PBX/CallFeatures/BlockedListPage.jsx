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
} from "@mui/material";

import {
  fetchBlockedList,
  createBlockedEntry,
  updateBlockedEntry,
  deleteBlockedEntry,
  listConferenceExtensions,
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

const BlockedListPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    fetch: false,
    delete: false,
    save: false,
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
  const [matchMode, setMatchMode] = useState("Exact Match");
  const [blockedNumber, setBlockedNumber] = useState("");
  const [selectedExtension, setSelectedExtension] = useState("");
  const [direction, setDirection] = useState("Inbound");
  const [enabled, setEnabled] = useState("Yes");
  const [availableExtensions, setAvailableExtensions] = useState([]);

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
      const res = await fetchBlockedList();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setRows(
        list.map((item) => ({
          id: item.id,
          name: item.name || "",
          matchMode:
            item.match_mode === "regex"
              ? "Regex Match"
              : item.match_mode === "extension"
                ? "Extension"
                : "Exact Match",
          blockedNumber: item.pattern || "",
          direction: (() => {
            const d = (item.direction || "").toLowerCase();
            if (d === "outbound") return "Outbound";
            if (d === "internal") return "Internal";
            return "Inbound";
          })(),
          enabled:
            item.enabled === false ||
            String(item.enabled).toLowerCase() === "no"
              ? "No"
              : "Yes",
        })),
      );
      setLastUpdated(new Date());
    } catch (err) {
      showAlert("error", err?.message || "Failed to load blocked list.");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const loadAvailableExtensions = async () => {
    try {
      const extRes = await listConferenceExtensions();
      const extRaw = Array.isArray(extRes?.message)
        ? extRes.message
        : Array.isArray(extRes?.data)
          ? extRes.data
          : [];
      const extList = extRaw
        .filter((e) => e && e.extension)
        .map((e) => ({
          value: String(e.extension),
          label: e.display_name
            ? `${e.display_name} (${e.extension})`
            : String(e.extension),
        }));
      setAvailableExtensions(extList);
    } catch (err) {
      console.error("Failed to load extensions for blocked list:", err);
      setAvailableExtensions([]);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadRows();
      loadAvailableExtensions();
    }
  }, []);

  // ── Search & Pagination Logic ──
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.blockedNumber, r.matchMode].some((v) =>
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
      await Promise.all(ids.map((id) => deleteBlockedEntry(id)));
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
    setMatchMode("Exact Match");
    setBlockedNumber("");
    setSelectedExtension("");
    setDirection("Inbound");
    setEnabled("Yes");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setMatchMode(row.matchMode || "Exact Match");
    setBlockedNumber(row.blockedNumber || "");
    setSelectedExtension(
      row.matchMode === "Extension" ? row.blockedNumber || "" : "",
    );
    setDirection(row.direction || "Inbound");
    setEnabled(row.enabled || "Yes");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedNumber = blockedNumber.trim();
    const valueToBlock =
      matchMode === "Extension"
        ? String(selectedExtension || "").trim()
        : trimmedNumber;

    if (!trimmedName) {
      showAlert("error", "Please enter a Name.");
      return;
    }
    if (!valueToBlock) {
      showAlert(
        "error",
        matchMode === "Extension"
          ? "Please select an Extension."
          : "Please enter a Blocked List Number.",
      );
      return;
    }

    const apiPayload = {
      name: trimmedName,
      match_mode:
        matchMode === "Regex Match"
          ? "regex"
          : matchMode === "Extension"
            ? "extension"
            : "exact",
      pattern: valueToBlock,
      direction: direction.toLowerCase(),
      enabled: enabled === "Yes",
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateBlockedEntry({ id: editId, ...apiPayload });
        showAlert("success", "Blocked entry updated.");
      } else {
        await createBlockedEntry(apiPayload);
        showAlert("success", "Blocked entry created.");
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
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              Blocked List
            </span>
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
                  placeholder="Search blocked lists..."
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
              <Btn onClick={handleExport} variant="outline" style={{
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
                    <TH style={{ width: 40 }}>ID</TH>
                    <TH>Name</TH>
                    <TH>Match Mode</TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Blocked List Number
                    </TH>
                    <TH>Direction</TH>
                    <TH>Enable</TH>
                    <TH style={{ width: 70 }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No blocked entries found. Click '+ Add New' to create one."}
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
                              {row.matchMode}
                            </span>
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
                            {row.blockedNumber}
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
                                color:
                                  row.direction === "Inbound"
                                    ? "#166534"
                                    : row.direction === "Outbound"
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
                              {row.direction}
                            </span>
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
                                color:
                                  row.enabled === "Yes" ? "#166534" : "#475569",
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
                              {row.enabled}
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
          {editId != null ? "Edit Blocked Entry" : "Add Blocked Entry"}
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
                Block Settings
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 120,
                        flexShrink: 0,
                      }}
                    >
                      Name <span style={{ color: C.errorRed }}>*</span>
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

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 120,
                        flexShrink: 0,
                      }}
                    >
                      Match Mode <span style={{ color: C.errorRed }}>*</span>
                    </label>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={matchMode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMatchMode(val);
                          if (val === "Extension") setBlockedNumber("");
                          else setSelectedExtension("");
                        }}
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem
  value="Exact Match"
  sx={{ fontSize: 13, fontWeight: 400 }}
>
  Exact Match
</MenuItem>
                        <MenuItem
  value="Regex Match"
  sx={{ fontSize: 13, fontWeight: 400 }}
>
  Regex Match
</MenuItem>
<MenuItem
  value="Extension"
  sx={{ fontSize: 13, fontWeight: 400 }}
>
  Extension
</MenuItem>

                        <MenuItem value="Extension" sx={{ fontSize: 13 }}>
                          Extension
                        </MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>

                  {matchMode === "Extension" ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.labelText,
                          width: 120,
                          flexShrink: 0,
                        }}
                      >
                        Extension <span style={{ color: C.errorRed }}>*</span>
                      </label>
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={selectedExtension}
                          onChange={(e) => setSelectedExtension(e.target.value)}
                          displayEmpty
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                            <span style={{ color: C.mutedText }}>
                              Select Extension
                            </span>
                          </MenuItem>
                          {availableExtensions.map((ext) => (
                            <MenuItem
                              key={ext.value}
                              value={ext.value}
                              sx={{ fontSize: 13 }}
                            >
                              {ext.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </div>
                  ) : (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.labelText,
                          width: 120,
                          flexShrink: 0,
                        }}
                      >
                        Blocked List Number{" "}
                        <span style={{ color: C.errorRed }}>*</span>
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        value={blockedNumber}
                        onChange={(e) => setBlockedNumber(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 120,
                        flexShrink: 0,
                      }}
                    >
                      Blocked List Direction{" "}
                      <span style={{ color: C.errorRed }}>*</span>
                    </label>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={direction}
                        onChange={(e) => setDirection(e.target.value)}
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem value="Inbound" sx={{ fontSize: 13 }}>
                          Inbound
                        </MenuItem>
                        <MenuItem value="Outbound" sx={{ fontSize: 13 }}>
                          Outbound
                        </MenuItem>
                        <MenuItem value="Internal" sx={{ fontSize: 13 }}>
                          Internal
                        </MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                        width: 120,
                        flexShrink: 0,
                      }}
                    >
                      Enable <span style={{ color: C.errorRed }}>*</span>
                    </label>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={enabled}
                        onChange={(e) => setEnabled(e.target.value)}
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem value="Yes" sx={{ fontSize: 13 }}>
                          Yes
                        </MenuItem>
                        <MenuItem value="No" sx={{ fontSize: 13 }}>
                          No
                        </MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </div>
                </div>
              </div>
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
                ? "Update Entry"
                : "Create"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
              style={{
                 padding: "8px 28px",
    fontSize: 13,
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0  2px 8px rgba(15, 23, 42, 0.08)",
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
          Import Blocked List
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

export default BlockedListPage;
