import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
} from "@mui/material";
import {
  createPickupGroup,
  deletePickupGroup,
  listPickupGroupExtensions,
  listPickupGroups,
  updatePickupGroup,
} from "../../../api/apiService";
import { PICKUP_GROUP_ITEMS_PER_PAGE } from "../../../constants/PickupGroupConstants";

// ── Color palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  amber: "#d97706",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: "#1e2d42",
      color: "#fff",
      border: "1px solid #162233",
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
      type="button"
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

const FieldRow = ({ label, children, required }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 32 }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 140,
        flexShrink: 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const PickupGroup = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    extensions: false,
    list: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [lastUpdated, setLastUpdated] = useState(null);
  const hasLoadedExtensionsRef = useRef(false);

  // Search & Pagination
  const itemsPerPage = PICKUP_GROUP_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Modal State
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");

  // Dual list state
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const normalizePickupGroupList = (res) => {
    const list = Array.isArray(res?.message)
      ? res.message
      : Array.isArray(res?.data)
        ? res.data
        : [];
    return list.map((g) => ({
      id: g.id,
      name: g.name,
      members: Array.isArray(g.members) ? g.members.map(String) : [],
    }));
  };

  const refreshPickupGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listPickupGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to list pickup groups.");
        setRows([]);
        return;
      }
      setRows(normalizePickupGroupList(res));
      setLastUpdated(new Date());
    } catch (err) {
      showMessage("error", err?.message || "Failed to list pickup groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  useEffect(() => {
    refreshPickupGroups();
  }, []);

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await listPickupGroupExtensions();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load extensions.");
        setAvailableExtensions([]);
        return;
      }
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = list
        .filter((e) => e && e.extension)
        .map((e) => ({
          value: String(e.extension),
          label: `${(e.display_name || "").trim() || String(e.extension)}-${String(e.extension)}`,
        }))
        .sort((a, b) => {
          const an = parseInt(a.value, 10);
          const bn = parseInt(b.value, 10);
          if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn)
            return an - bn;
          return a.label.localeCompare(b.label);
        });
      setAvailableExtensions(exts);
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showMessage("error", err?.message || "Failed to load extensions.");
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  // ── Search & Pagination ──
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name].some((v) =>
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

  const handleToggleRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  // ── Form Handlers ──
  const resetForm = () => {
    setEditId(null);
    setName("");
    setMemberExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setMemberExtensions(Array.isArray(row.members) ? row.members : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selected.length === 0)
      return showMessage("error", "Please select at least one row to delete.");
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    (async () => {
      try {
        const toDelete = filteredRows.filter((_, idx) =>
          selected.includes(idx),
        );
        for (const row of toDelete) {
          if (row.id != null) {
            const res = await deletePickupGroup(row.id);
            if (res?.response === false) {
              showMessage(
                "error",
                res?.message || "Failed to delete pickup group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshPickupGroups();
        showMessage("success", "Pickup Group(s) deleted successfully.");
      } catch (err) {
        showMessage(
          "error",
          err?.message || "Failed to delete pickup group(s).",
        );
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return showMessage("error", "Name is required.");
    if (!/^[A-Za-z0-9_]+$/.test(trimmed))
      return showMessage(
        "error",
        "Name may contain only letters, numbers, and underscore.",
      );
    if (!memberExtensions.length)
      return showMessage("error", "Please select at least one Member.");

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        if (editId != null) {
          const res = await updatePickupGroup(editId, {
            name: trimmed,
            members: memberExtensions.map(String),
          });
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to update pickup group.",
            );
          await refreshPickupGroups();
          showMessage("success", "Pickup group updated successfully.");
        } else {
          const res = await createPickupGroup(
            trimmed,
            memberExtensions.map(String),
          );
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to create pickup group.",
            );
          setRows(normalizePickupGroupList(res));
          showMessage("success", "Pickup group created successfully.");
        }
        handleCloseModal();
      } catch (err) {
        showMessage("error", err?.message || "Failed to save pickup group.");
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  // ── Dual Listbox Logic ──
  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [availableExtensions]);

  const getExtLabel = (ext) => extensionLabelMap.get(ext) || ext;
  const availableList = useMemo(
    () =>
      availableExtensions.filter((e) => !memberExtensions.includes(e.value)),
    [availableExtensions, memberExtensions],
  );

  const addSelectedMembers = () => {
    if (availableSelected.length === 0) return;
    setMemberExtensions((prev) => [
      ...prev,
      ...availableSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableSelected([]);
  };
  const addAllMembers = () => {
    setMemberExtensions(availableExtensions.map((e) => e.value));
    setAvailableSelected([]);
  };
  const removeSelectedMembers = () => {
    if (chosenSelected.length === 0) return;
    setMemberExtensions((prev) =>
      prev.filter((id) => !chosenSelected.includes(id)),
    );
    setChosenSelected([]);
  };
  const removeAllMembers = () => {
    setMemberExtensions([]);
    setChosenSelected([]);
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Error / Success Banner */}
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
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
              Pickup Group
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
                Page {page} · {filteredRows.length} records
              </span>
              {selected.length > 0 && (
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
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="danger"
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="accent"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {loading.list ? (
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
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                          "&.MuiCheckbox-indeterminate": { color: C.accent },
                        }}
                      />
                    </TH>
                    <TH style={{ width: 40 }}>#</TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Name
                    </TH>
                    <TH>Members</TH>
                    <TH style={{ width: 60 }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No pickup groups found. Click '+ Add New' to create one."}
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const rowBgColor = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBgColor,
                            borderBottom: "0.5px solid #9ca3af",
                            transition: "background 0.1s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f0f9ff";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBgColor;
                          }}
                        >
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
                              onChange={() => handleToggleRow(realIdx)}
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
                              padding: "7px 4px",
                              fontSize: 11,
                              color: C.mutedText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              padding: "7px 16px",
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.valueText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                              fontSize: 12,
                              color: C.labelText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {(row.members || [])
                              .slice(0, 4)
                              .map(getExtLabel)
                              .join(", ")}
                            {(row.members || []).length > 4
                              ? ` +${(row.members || []).length - 4}`
                              : ""}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "4px 8px" }}
                          >
                            <Btn
                              onClick={() => handleOpenEditModal(row)}
                              variant="outline"
                              style={{
                                fontSize: 10,
                                padding: "3px 10px",
                                margin: "0 auto",
                              }}
                            >
                              Edit
                            </Btn>
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
          {!loading.list && filteredRows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#f8fafc",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.list || page <= 1}
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
                    border: `0.5px solid ${C.accent}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.list || page >= totalPages}
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
          {editId != null ? "Edit Pickup Group" : "Add Pickup Group"}
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
                padding: "20px 24px 16px",
              }}
            >
              <div style={{ marginBottom: 20, position: "relative" }}>
                <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
                <span
                  style={{
                    position: "absolute",
                    top: -10,
                    left: 0,
                    background: "#fff",
                    paddingRight: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.mutedText,
                  }}
                >
                  Pickup Group
                </span>
              </div>

              {/* TOP-TO-BOTTOM GRID FOR FORM FIELDS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px 32px",
                }}
              >
                <FieldRow label="Name" required>
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </FieldRow>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                    }}
                  >
                    Member <span style={{ color: C.errorRed }}>*</span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 40px 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: C.mutedText,
                          marginBottom: 6,
                          textAlign: "center",
                        }}
                      >
                        Available
                      </div>
                      <select
                        multiple
                        value={availableSelected}
                        onChange={(e) =>
                          setAvailableSelected(
                            Array.from(
                              e.target.selectedOptions,
                              (opt) => opt.value,
                            ),
                          )
                        }
                        style={{
                          width: "100%",
                          height: 160,
                          border: `1px solid ${C.cardBorder}`,
                          borderRadius: 4,
                          padding: 8,
                          fontSize: 13,
                          outline: "none",
                          background: "#f8fafc",
                        }}
                      >
                        {loading.extensions ? (
                          <option disabled>Loading...</option>
                        ) : availableList.length === 0 ? (
                          <option disabled>No extensions</option>
                        ) : (
                          availableList.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        justifyContent: "center",
                      }}
                    >
                      <Btn
                        onClick={addSelectedMembers}
                        variant="outline"
                        style={{ padding: "4px 0", fontSize: 12 }}
                      >
                        &gt;
                      </Btn>
                      <Btn
                        onClick={addAllMembers}
                        variant="outline"
                        style={{ padding: "4px 0", fontSize: 12 }}
                      >
                        &gt;&gt;
                      </Btn>
                      <Btn
                        onClick={removeSelectedMembers}
                        variant="outline"
                        style={{ padding: "4px 0", fontSize: 12 }}
                      >
                        &lt;
                      </Btn>
                      <Btn
                        onClick={removeAllMembers}
                        variant="outline"
                        style={{ padding: "4px 0", fontSize: 12 }}
                      >
                        &lt;&lt;
                      </Btn>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: C.accent,
                          marginBottom: 6,
                          textAlign: "center",
                        }}
                      >
                        Selected
                      </div>
                      <select
                        multiple
                        value={chosenSelected}
                        onChange={(e) =>
                          setChosenSelected(
                            Array.from(
                              e.target.selectedOptions,
                              (opt) => opt.value,
                            ),
                          )
                        }
                        style={{
                          width: "100%",
                          height: 160,
                          border: `1px solid ${C.cardBorder}`,
                          borderRadius: 4,
                          padding: 8,
                          fontSize: 13,
                          outline: "none",
                          background: "#fff",
                        }}
                      >
                        {memberExtensions.length === 0 ? (
                          <option disabled>No selected members</option>
                        ) : (
                          memberExtensions.map((id) => (
                            <option key={id} value={id}>
                              {getExtLabel(id)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
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
          <Button
            onClick={handleSave}
            disabled={loading.save}
            variant="contained"
            sx={{
              background: "#1e2d42",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 24px",
              minWidth: 120,
              "&:hover": { background: "#0f172a" },
            }}
          >
            {loading.save ? (
              <CircularProgress size={14} sx={{ color: "#fff", mr: 1 }} />
            ) : null}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Group"
                : "Create Group"}
          </Button>
          <Button
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outlined"
            sx={{
              color: "#1e293b",
              borderColor: "#9ca3af",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 24px",
              minWidth: 100,
              "&:hover": { borderColor: "#1e293b", background: "#f8fafc" },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PickupGroup;
