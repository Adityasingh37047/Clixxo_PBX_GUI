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
import {
  PbxBreadcrumb,
  TableListLoading,
  TableListEmptyState,
  pbxPageWrapStyle,
  pbxPageInnerStyle,
} from "../../../sections/numManipulate/numManipulateSharedUi";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

// ── Color palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
pageBg: "#f8fafc",
cardBg: "#ffffff",
cardBorder: "#9CA3AF",
labelText: "#3E5475",
valueText: "#0f172a",
mutedText: "#94a3b8",
strongText: "#0f172a",
accent: "#3E5475",
amber: "#dc2626",
};

const CARD_RADIUS = 20;
// ── Shared: Action Button ────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
  type,
  hoverBehavior = "background",
}) => {
  const variants = {
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
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
   cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    accent: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
  };

  const s = variants[variant] || variants.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
      case "accent":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "danger":
        return "#b91c1c";
      case "cancel":
        return "#e2e8f0";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = extraStyle?.background || s.background;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
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
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "0.82";
          } else {
            e.currentTarget.style.background = hoverBg;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "1";
          } else {
            e.currentTarget.style.background = baseBg;
          }
        }
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
      background: "#F8FAFC",
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
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
padding: "1px",
color: "#3E5475",
"&.Mui-checked": { color: "#0284c7" },
"&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
      setIsInitialLoad(false);
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
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
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

        <PbxBreadcrumb section="Call Features" current="Blocked List" />

        {/* Main Card */}
        <div
          style={{
        background: "#ffffff",
borderRadius: 10,
overflow: "hidden",
border: `1.5px solid ${C.cardBorder}`,
boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
           display: "flex",
alignItems: "center",
justifyContent: "space-between",
minHeight: 44,
padding: "7px 14px",
borderBottom: `1px solid ${C.cardBorder}`,
background: "#ffffff",
flexWrap: "wrap",
gap: 12,
borderTopLeftRadius: CARD_RADIUS,
borderTopRightRadius: CARD_RADIUS,
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
              > <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
           Delete
              </Btn>
             <Btn
  onClick={handleOpenAddModal}
  disabled={loading.fetch}
  variant="primary"
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

          {/* Table */}
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No blocked entries found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchQuery && filteredRows.length === 0 ? (
              <TableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={checkboxSx} 
                      />
                    </TH>
                    <TH
                      style={{ width: 36, position: "sticky", top: 0, zIndex: 10  }}
                    >
                      ID
                    </TH>
                    <TH
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Name
                    </TH>
                    <TH
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Match Mode
                    </TH>
                    <TH
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Blocked List Number
                    </TH>
                    <TH
                     style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Direction
                    </TH>
                    <TH
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      Enable
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
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRows.length - 1;
                      const rowBg = isSelected
                        ? "#e0f2fe"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      const lastRowCellStyle =
                        idx === pagedRows.length - 1 ? { borderBottom: "none" } : {};

                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "#f1f5f9";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                        ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            <Checkbox
  size="small"
  checked={isSelected}
  onChange={() => handleToggleRow(realIdx)}
  sx={checkboxSx}
/>
                          </td>
                          <td
                            style={{
                              ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                              
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                            ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                             
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
                             ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                             
                            }}
                          >
                            {row.blockedNumber}
                          </td>
                          <td
                            style={{
                             ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            
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
                              ...tdStyle,
                              background: rowBg,
                              borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
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
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <EditDocumentIcon
                                titleAccess="Edit"
                                onClick={() => handleOpenEditModal(row)}
                                style={{
                                  cursor: "pointer",
                                  color: "#2563eb",
                                  fontSize: 22,
                                  opacity: 0.7,
                                  transition: "opacity 0.15s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.opacity = "1")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.opacity = "0.7")
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 14px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
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
          style={{ padding: "20px 24px",  background: "#ffffff", }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                 background: "#f5f7fa",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div
  style={{
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 700,
    color: C.labelText,
  }}
>
  <span>Block Settings</span>

  <div
    style={{
      flex: 1,
      height: 1,
      background: C.cardBorder,
      marginLeft: 12,
    }}
  />
</div>

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
                        style: { fontSize: 13, padding: "6px 8px" ,  backgroundColor: "#fff",},
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
  sx={{
    fontSize: 13,
    backgroundColor: "#fff",
    height: 32, // Name ke equal
    "& .MuiSelect-select": {
      padding: "6px 8px",
      display: "flex",
      alignItems: "center",
    },
  }}
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
                          style: { fontSize: 13, padding: "6px 8px",   backgroundColor: "#fff", },
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
    sx={{
      fontSize: 13,
      backgroundColor: "#fff",
      height: 32,
      "& .MuiSelect-select": {
        padding: "6px 8px",
        display: "flex",
        alignItems: "center",
      },
    }}
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
                           sx={{
      fontSize: 13,
      backgroundColor: "#fff",
      height: 32,
      "& .MuiSelect-select": {
        padding: "6px 8px",
        display: "flex",
        alignItems: "center",
      },
    }}
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
  variant="primary"
  style={{ minWidth: 100, height: 33, fontSize: 13 }}
>
  {loading.save ? (
    <CircularProgress
      size={13}
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
  variant="cancel"
   style={{ minWidth: 100, height: 33 }}
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
            variant="primary"
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            Import
          </Btn>
         <Btn
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
            }}
            disabled={importLoading}
            variant="cancel"
              style={{ minWidth: 100, height: 33 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BlockedListPage;