import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
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
  createPrivateGroup,
  deletePrivateGroup,
  fetchSipAccounts,
  listPrivateGroups,
  updatePrivateGroup,
} from "../../../api/apiService";
import { PRIVATE_GROUP_ITEMS_PER_PAGE } from "../../../constants/PrivateGroupConstants";
import {
  PbxBreadcrumb,
  TableListLoading,
  TableListEmptyState,
  pbxPageWrapStyle,
  pbxPageInnerStyle,
} from "../../../sections/numManipulate/numManipulateSharedUi";

const ENABLE_OPTIONS = ["Yes", "No"];

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
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
// ── Shared UI Components ──────────────────────────────────────────────────────
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

const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
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
  <div
    style={{
      display: "flex",
      alignItems: "center",
      margin: "24px 0 16px 0",
    }}
  >
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: C.labelText,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {title}
    </span>

    <div
      style={{
        flex: 1,
        height: 1,
        background: C.cardBorder,
        marginLeft: 12,
      }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const PrivateGroup = () => {
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedExtensionsRef = useRef(false);

  // Search & Pagination
  const itemsPerPage = PRIVATE_GROUP_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Modal State
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState("Yes");

  // Dual list state
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const normalizePrivateGroupList = (res) => {
    const list = Array.isArray(res?.message)
      ? res.message
      : Array.isArray(res?.data)
        ? res.data
        : [];
    return list.map((g) => ({
      id: g.id,
      name: g.name || "",
      enabled: g.enabled ? "Yes" : "No",
      members: Array.isArray(g.members) ? g.members.map(String) : [],
    }));
  };

  const refreshPrivateGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listPrivateGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load private groups.");
        setRows([]);
        return;
      }
      setRows(normalizePrivateGroupList(res));
      setLastUpdated(new Date());
    } catch (err) {
      showMessage("error", err?.message || "Failed to load private groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    refreshPrivateGroups();
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
    setEnabled("Yes");
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
    setEnabled(row.enabled === "No" ? "No" : "Yes");
    setMemberExtensions(Array.isArray(row.members) ? [...row.members] : []);
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
            const res = await deletePrivateGroup(row.id);
            if (res?.response === false) {
              showMessage(
                "error",
                res?.message || "Failed to delete private group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshPrivateGroups();
        showMessage("success", "Private Group(s) deleted successfully.");
      } catch (err) {
        showMessage(
          "error",
          err?.message || "Failed to delete private group(s).",
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
          const res = await updatePrivateGroup(editId, {
            name: trimmed,
            enabled: enabled === "Yes",
            members: memberExtensions.map(String),
          });
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to update private group.",
            );
          await refreshPrivateGroups();
          showMessage("success", "Private group updated successfully.");
        } else {
          const res = await createPrivateGroup({
            name: trimmed,
            enabled: enabled === "Yes",
            members: memberExtensions.map(String),
          });
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to create private group.",
            );
          await refreshPrivateGroups();
          showMessage("success", "Private group created successfully.");
        }
        handleCloseModal();
      } catch (err) {
        showMessage("error", err?.message || "Failed to save private group.");
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  const handleImportSubmit = async () => {
    if (!importFile)
      return showMessage("error", "Please select a file to import");
    showMessage("info", "Import API not yet configured");
  };

  const handleExport = () => {
    showMessage("info", "Export API not yet configured");
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
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
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

        <PbxBreadcrumb section="Call Features" current="Private Group" />

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
              >  <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                 Delete
              </Btn>
              

              
              <Btn
  onClick={handleOpenAddModal}
  disabled={loading.list}
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
          <div style={{overflowX: "auto",
overflowY: "auto",
flex: 1,}}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No private groups found."
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
                    <TH style={{ width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,}}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={checkboxSx}
                      />
                    </TH>
                    <TH style={{ width: 36, position: "sticky", top: 0, zIndex: 10  }}>ID</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10  }}>Name</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10  }}>Enabled</TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10  }}>Members</TH>
                    <TH style={{ width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,}}>Modify</TH>
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
                            {(row.members || [])
                              .slice(0, 4)
                              .map(getExtLabel)
                              .join(", ")}
                            {(row.members || []).length > 4
                              ? ` +${(row.members || []).length - 4}`
                              : ""}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "7px 8px",  ...tdStyle,
  background: rowBg,
  borderBottom: isLastRow ? "none" : tdStyle.borderBottom, }}
                          >
                            <EditDocumentIcon
  className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
  titleAccess="Edit"
  onClick={() => handleOpenEditModal(row)}
/>
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
                    border: `0.5px solid ${C.cardBorder}`,
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
        PaperProps={{ sx: { width: 900, maxWidth: "96vw", borderRadius: 2 } }}
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
          {editId != null ? "Edit Private Group" : "Add Private Group"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px",  backgroundColor:"#ffffff",}}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                 background: "#f5f7fa",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: "20px 24px 16px",
              }}
            >
              {/* TOP-TO-BOTTOM GRID FOR FORM FIELDS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 32px",
                }}
              >
                <FieldRow label="Name" required>
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" ,backgroundColor: "#fff",} }}
                  />
                </FieldRow>

                <FieldRow label="Enable" required>
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
                </FieldRow>
              </div>

              <SectionHeading title="Member Extensions"  />

             <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 40px 1fr",
    gap: 12,
    alignItems: "start",
  }}
>
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
                      backgroundColor: "#fff",
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
    alignItems: "center",
    marginTop: 22, // Available/Selected label ki height
    height: 160,   // select box ki height
  }}
>
                  <Btn
                    onClick={addSelectedMembers}
                    variant="outline"
                   style={{
  width: 40,
  height: "100%",
  fontSize: 12,
}}
                  >
                    &gt;
                  </Btn>
                  <Btn
                    onClick={addAllMembers}
                    variant="outline"
                   style={{
  width: 40,
  height: "100%",
  fontSize: 12,
}}
                  >
                    &gt;&gt;
                  </Btn>
                  <Btn
                    onClick={removeSelectedMembers}
                    variant="outline"
                   style={{
  width: 40,
  height: "100%",
  fontSize: 12,
}}
                  >
                    &lt;
                  </Btn>
                  <Btn
                    onClick={removeAllMembers}
                    variant="outline"
                   style={{
  width: 40,
  height: "100%",
  fontSize: 12,
}}
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
  variant="primary"
  onClick={handleSave}
  disabled={loading.save}
  style={{ minWidth: 100, height: 33, fontSize: 13 }}
>
  {loading.save ? (
    <>
      <CircularProgress
        size={13}
        sx={{ color: "#fff", mr: 1 }}
      />
      Saving...
    </>
  ) : editId != null ? (
    "Update Group"
  ) : (
    "Create Group"
  )}
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
          Import Private Group
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

export default PrivateGroup;
