import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
} from "@mui/material";
import {
  createPagingGroup,
  deletePagingGroup,
  fetchSipAccounts,
  listPagingGroups,
  updatePagingGroup,
} from "../../../api/apiService";

// Verify this matches your actual import path
const PAGING_ITEMS_PER_PAGE = 20;
const PAGING_TYPE_OPTIONS = ["one-way", "two-way"];

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
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

const FieldRow = ({ label, children, required, align = "center" }) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      gap: 12,
      minHeight: 32,
    }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 150,
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 16px 0", position: "relative" }}>
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
      {title}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const Paging = () => {
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
  const itemsPerPage = PAGING_ITEMS_PER_PAGE || 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Modal State
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [pagingType, setPagingType] = useState("one-way");
  const [callerIdNamePrefix, setCallerIdNamePrefix] = useState("");

  // Dual list state (Available vs Selected)
  const [availableExtensions, setAvailableExtensions] = useState([]); // { value, label }
  const [memberExtensions, setMemberExtensions] = useState([]); // string[] of extension values
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const normalizePagingList = (res) => {
    const list = Array.isArray(res?.message)
      ? res.message
      : Array.isArray(res?.data)
        ? res.data
        : [];
    return list.map((g) => ({
      id: g.id,
      name: g.name || "",
      number: String(g.page_number ?? g.number ?? ""),
      type: g.type || g.page_type || g.paging_type || "one-way",
      callerIdNamePrefix: g.cid_name_prefix || g.callerIdNamePrefix || "",
      members: Array.isArray(g.members) ? g.members.map(String) : [],
    }));
  };

  const refreshPagingGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listPagingGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load paging groups.");
        setRows([]);
        return;
      }
      setRows(normalizePagingList(res));
      setLastUpdated(new Date());
    } catch (err) {
      showMessage("error", err?.message || "Failed to load paging groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  useEffect(() => {
    refreshPagingGroups();
  }, []);

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchSipAccounts();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load extensions.");
        setAvailableExtensions([]);
        return;
      }
      const sipList = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = sipList
        .filter((e) => e && e.extension)
        .map((e) => ({
          value: String(e.extension),
          label: `${(e.display_name || e.name || String(e.extension)).trim()}-${String(e.extension)}`,
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
        [r.name, r.number].some((v) =>
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

  // ── Form Handlers ──
  const resetForm = () => {
    setEditId(null);
    setName("");
    setNumber("");
    setPagingType("one-way");
    setCallerIdNamePrefix("");
    setMemberExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) {
      await loadExtensions();
    }
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setNumber(row.number || "");
    setPagingType(row.type || "one-way");
    setCallerIdNamePrefix(row.callerIdNamePrefix || "");
    setMemberExtensions(Array.isArray(row.members) ? [...row.members] : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) {
      await loadExtensions();
    }
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      showMessage("error", "Please select at least one row to delete.");
      return;
    }
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
            const res = await deletePagingGroup(row.id);
            if (res?.response === false) {
              showMessage(
                "error",
                res?.message || "Failed to delete paging group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshPagingGroups();
        showMessage("success", "Paging Group(s) deleted successfully.");
      } catch (err) {
        showMessage(
          "error",
          err?.message || "Failed to delete paging group(s).",
        );
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedNumber = number.trim();
    if (!trimmedName) return showMessage("error", "Name is required.");
    if (!trimmedNumber) return showMessage("error", "Number is required.");
    if (!/^\d+$/.test(trimmedNumber))
      return showMessage("error", "Number must be numeric.");
    if (!memberExtensions.length)
      return showMessage("error", "Please select at least one Member.");

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        if (editId != null) {
          const res = await updatePagingGroup(editId, {
            name: trimmedName,
            page_number: Number(trimmedNumber),
            pagingMode: pagingType,
            page_type: pagingType,
            paging_type: pagingType,
            cid_name_prefix: callerIdNamePrefix.trim(),
            members: memberExtensions.map(String),
          });
          if (res?.response === false) {
            showMessage(
              "error",
              res?.message || "Failed to update paging group.",
            );
            return;
          }
          showMessage("success", "Paging group updated successfully.");
        } else {
          const res = await createPagingGroup({
            name: trimmedName,
            page_number: Number(trimmedNumber),
            pagingMode: pagingType,
            page_type: pagingType,
            paging_type: pagingType,
            cid_name_prefix: callerIdNamePrefix.trim(),
            members: memberExtensions.map(String),
          });
          if (res?.response === false) {
            showMessage(
              "error",
              res?.message || "Failed to create paging group.",
            );
            return;
          }
          showMessage("success", "Paging group created successfully.");
        }
        await refreshPagingGroups();
        handleCloseModal();
      } catch (err) {
        showMessage("error", err?.message || "Failed to save paging group.");
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

  const handleReorderSelected = (action) => {
    if (chosenSelected.length !== 1) {
      showMessage(
        "error",
        "Select exactly one member in 'Selected' list to reorder.",
      );
      return;
    }
    const id = chosenSelected[0];
    setMemberExtensions((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      if (action === "top") {
        next.splice(idx, 1);
        next.unshift(id);
      } else if (action === "bottom") {
        next.splice(idx, 1);
        next.push(id);
      } else if (action === "up" && idx > 0) {
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      } else if (action === "down" && idx < next.length - 1) {
        [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      }
      return next;
    });
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
              Paging
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
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
             
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
                style={{
    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.08)",
  }}
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="accent"
                style={{
    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.08)",
  }}
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
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
}}
                      />
                    </TH>
                    <TH style={{ width: 40 }}>ID</TH>
                    <TH> Name </TH>
                    <TH>Number</TH>
                    <TH>Type</TH>
                    <TH>CallerID Name Prefix</TH>
                    <TH>Members</TH>
                    <TH style={{ width: 60 }}>Modify</TH>
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
                          : "No paging groups found. Click '+ Add New' to create one."}
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const rowBgColor = isSelected
                        ? "#e0f2fe"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBgColor,
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBgColor;
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
                              {row.number}
                            </span>
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 14px",
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.type}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 14px",
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.callerIdNamePrefix || "—"}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 14px",
                              fontSize: 12,
                              color: C.labelText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {(row.members || [])
                              .slice(0, 3)
                              .map(getExtLabel)
                              .join(", ")}
                            {(row.members || []).length > 3
                              ? ` +${(row.members || []).length - 3}`
                              : ""}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "10px 8px" }}
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
        PaperProps={{ sx: { width: 760, maxWidth: "96vw", borderRadius: 2 } }}
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
          {editId != null ? "Edit Paging Group" : "Add Paging Group"}
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
              <SectionHeading title="General Settings" />

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
                  <FieldRow label="Name" required>
                    <TextField
                      size="small"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>

                  <FieldRow label="Number" required>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <FieldRow label="Type" required>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={pagingType}
                        onChange={(e) => setPagingType(e.target.value)}
                        sx={{ fontSize: 13 }}
                      >
                        {PAGING_TYPE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  </FieldRow>

                  <FieldRow label="CallerID Name Prefix">
                    <TextField
                      size="small"
                      fullWidth
                      value={callerIdNamePrefix}
                      onChange={(e) => setCallerIdNamePrefix(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>
                </div>
              </div>

              <SectionHeading title="Member Extensions" />

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
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingTop: 22,
                    }}
                  >
                    <Btn
                      onClick={() => handleReorderSelected("top")}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 14 }}
                    >
                      <VerticalAlignTopIcon sx={{ fontSize: 16 }} />
                    </Btn>
                    <Btn
                      onClick={() => handleReorderSelected("up")}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 14 }}
                    >
                      <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                    </Btn>
                    <Btn
                      onClick={() => handleReorderSelected("down")}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 14 }}
                    >
                      <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                    </Btn>
                    <Btn
                      onClick={() => handleReorderSelected("bottom")}
                      variant="outline"
                      style={{ padding: "4px 0", fontSize: 14 }}
                    >
                      <VerticalAlignBottomIcon sx={{ fontSize: 16 }} />
                    </Btn>
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
    padding: "8px 28px",
    fontSize: 13,
    borderRadius: "6px",
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",

    fontWeight: 600,
    textTransform: "none",
    minWidth: 120,

    "&:hover": {
      background:
        "linear-gradient(to bottom, #647A9B 0%, #4A6284 60%, #344A67 100%)",
      opacity: 0.85,
    },

    "&:disabled": {
      background: "#94a3b8",
      color: "#e2e8f0",
      border: "1px solid #94a3b8",
    },
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
    padding: "8px 28px",
    fontSize: 13,
    minWidth: 120,
    borderRadius: "6px",

    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.08)",

    fontWeight: 600,
    textTransform: "none",

    "&:hover": {
      background: "#cbd5e1",
      border: "1px solid #cbd5e1",
      opacity: 0.85,
    },
  }}
>
  Cancel
</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Paging;
