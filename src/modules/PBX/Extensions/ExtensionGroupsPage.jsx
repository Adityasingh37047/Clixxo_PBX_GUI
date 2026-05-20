import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";

import {
  fetchSipAccounts,
  fetchExtensionGroups,
  createExtensionGroup,
  updateExtensionGroup,
  deleteExtensionGroup,
} from "../../../api/apiService";

// ── Color palette (matches PBX / CDR) ────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────

const ExtensionGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    delete: false,
    save: false,
    extensions: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const hasInitialLoadRef = useRef(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);

  // ── Load Data ──
  const loadGroups = async () => {
    setLoading((p) => ({ ...p, fetch: true }));
    setMessage({ type: "", text: "" });
    try {
      const res = await fetchExtensionGroups();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setGroups(
        list.map((g) => ({
          id: g.id,
          name: g.name || "",
          extensions: Array.isArray(g.extensions)
            ? g.extensions.map(String)
            : [],
        })),
      );
      setLastUpdated(new Date());
    } catch (err) {
      showMessage("error", err?.message || "Failed to load extension groups.");
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadGroups();
    }
  }, []);

  // ── Search & Pagination ──
  const filteredGroups = searchQuery.trim()
    ? groups.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.extensions.some((ext) =>
            ext.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    : groups;

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / limit));
  const pagedGroups = filteredGroups.slice((page - 1) * limit, page * limit);

  // ── Checkbox Selection Logic ──
  const pageIds = pagedGroups.map((g) => g.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected =
    pagedGroups.some((g) => selectedIds.includes(g.id)) && !allPageSelected;

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (!pageIds.length) return;
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!selectedIds.length) {
      showMessage("error", "Please select at least one record to delete.");
      return;
    }
    const msg =
      selectedIds.length === 1
        ? "Are you sure you want to delete this group?"
        : `Are you sure you want to delete ${selectedIds.length} groups?`;

    if (!window.confirm(msg)) return;

    setLoading((p) => ({ ...p, delete: true }));
    setMessage({ type: "", text: "" });
    try {
      await Promise.all(selectedIds.map((id) => deleteExtensionGroup(id)));
      setSelectedIds([]);
      await loadGroups();
    } catch (err) {
      showMessage("error", err?.message || "Failed to delete some groups.");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  // ── Modal Actions ──
  const openExtensionList = () => {
    setLoading((p) => ({ ...p, extensions: true }));
    fetchSipAccounts()
      .then((res) => {
        const list = res?.message ?? [];
        const exts = (Array.isArray(list) ? list : [])
          .map((item) => ({
            extension: String(item.extension ?? ""),
            name: item.name || item.display_name || item.extension || "",
          }))
          .filter((e) => e.extension);
        setAvailableExtensions(exts);
      })
      .catch(() => {
        setAvailableExtensions([]);
        showMessage(
          "error",
          "Failed to load available extensions for the modal.",
        );
      })
      .finally(() => setLoading((p) => ({ ...p, extensions: false })));
  };

  const handleOpenAddModal = () => {
    setEditGroupId(null);
    setGroupName("");
    setSelectedExtensions([]);
    setShowModal(true);
    openExtensionList();
  };

  const handleOpenEditModal = (group) => {
    setEditGroupId(group.id);
    setGroupName(group.name || "");
    setSelectedExtensions(
      Array.isArray(group.extensions) ? [...group.extensions] : [],
    );
    setShowModal(true);
    openExtensionList();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditGroupId(null);
    setGroupName("");
    setSelectedExtensions([]);
  };

  const handleExtensionCheckAll = () =>
    setSelectedExtensions(availableExtensions.map((e) => e.extension));
  const handleExtensionUncheckAll = () => setSelectedExtensions([]);
  const toggleExtension = (ext) => {
    setSelectedExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext],
    );
  };

  const handleSaveGroup = async () => {
    const name = groupName?.trim();
    if (!name) return showMessage("error", "Please enter a group name.");
    if (selectedExtensions.length === 0)
      return showMessage("error", "Please select at least one extension.");

    const extensions = [...selectedExtensions].sort(
      (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0),
    );
    setLoading((p) => ({ ...p, save: true }));
    setMessage({ type: "", text: "" });

    try {
      if (editGroupId != null) {
        await updateExtensionGroup({ id: editGroupId, name, extensions });
      } else {
        await createExtensionGroup({ name, extensions });
      }
      await loadGroups();
      handleCloseModal();
    } catch (err) {
      showMessage("error", err?.message || "Failed to save group.");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
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
        {/* Error Banner */}
        {/* ── Error / Success Floating Banner ── */}
        {message.text && (
          <Alert
            severity={message.type}
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
          {/* Breadcrumb */}
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Extesions &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              Extension Group
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
            {/* Left Toolbar Info */}
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
                Page {page} · {filteredGroups.length} records
              </span>
              {selectedIds.length > 0 && (
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
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {/* Right Toolbar Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {/* Search Box */}
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
                  placeholder="Search group name or ext..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 11,
                    color: C.valueText,
                    outline: "none",
                    width: 200,
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

              {/* Action Buttons */}
              {/* <Btn
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading.fetch || page <= 1}
                variant="outline"
              >
                ← Prev
              </Btn>
              <Btn
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={loading.fetch || page >= totalPages}
                variant="outline"
              >
                Next →
              </Btn> */}
              {/* <Btn
                onClick={loadGroups}
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
                  loading.delete || loading.fetch || selectedIds.length === 0
                }
                variant="danger"
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.fetch}
                variant="accent"
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
                  minWidth: 800,
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
                      Group Name
                    </TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Extensions
                    </TH>
                    <TH style={{ width: 80 }}>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedGroups.length === 0 ? (
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
                          : "No extension groups found. Click '+ Add New' to create one."}
                      </td>
                    </tr>
                  ) : (
                    pagedGroups.map((row, idx) => {
                      const isSelected = selectedIds.includes(row.id);
                      const rowBg = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      const realIndex = (page - 1) * limit + idx + 1;

                      return (
                        <tr
                          key={row.id}
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
                            if (!isSelected)
                              e.currentTarget.style.background = rowBg;
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
                              onChange={() => handleToggleRow(row.id)}
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
                            {realIndex}
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
                              padding: "7px 16px",
                              fontSize: 12,
                              color: C.labelText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.extensions?.length > 0 ? (
                              row.extensions.join(", ")
                            ) : (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
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
          {!loading.fetch && filteredGroups.length > 0 && (
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
                Showing {pagedGroups.length} record
                {pagedGroups.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {/* <Btn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading.fetch || page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn> */}
                {/* <span
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
                </span> */}
                {/* <Btn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={loading.fetch || page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn> */}
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
        PaperProps={{ sx: { width: 500, maxWidth: "95vw", borderRadius: 2 } }}
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
          {editGroupId != null
            ? "Edit Extension Group"
            : "Add New Extension Group"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Group Name Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  marginBottom: 6,
                }}
              >
                Group Name
              </label>
              <TextField
                fullWidth
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Sales, Support"
                size="small"
                variant="outlined"
                sx={{ background: "#fff" }}
                inputProps={{ style: { fontSize: 13, padding: "8px 12px" } }}
              />
            </div>

            {/* Extensions Selection */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "#f8fafc",
                  borderBottom: `1px solid ${C.cardBorder}`,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: C.labelText }}
                >
                  Select Extensions
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    onClick={handleExtensionCheckAll}
                    variant="outline"
                    style={{ fontSize: 10, padding: "2px 8px" }}
                  >
                    Check All
                  </Btn>
                  <Btn
                    onClick={handleExtensionUncheckAll}
                    variant="outline"
                    style={{ fontSize: 10, padding: "2px 8px" }}
                  >
                    Uncheck All
                  </Btn>
                </div>
              </div>

              <div style={{ maxHeight: 220, overflowY: "auto", padding: 12 }}>
                {loading.extensions ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 30,
                    }}
                  >
                    <CircularProgress size={20} />
                  </div>
                ) : availableExtensions.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: C.mutedText,
                      margin: "20px 0",
                    }}
                  >
                    No extensions found. Create SIP accounts first.
                  </p>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    {availableExtensions.map(({ extension, name }) => (
                      <FormControlLabel
                        key={extension}
                        control={
                          <Checkbox
                            checked={selectedExtensions.includes(extension)}
                            onChange={() => toggleExtension(extension)}
                            size="small"
                            sx={{
                              padding: "2px 8px",
                              color: C.accent,
                              "&.Mui-checked": { color: C.accent },
                            }}
                          />
                        }
                        label={
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            {extension} {name ? `— ${name}` : ""}
                          </span>
                        }
                        sx={{ margin: 0 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{ fontSize: 11, color: C.mutedText, textAlign: "right" }}
            >
              {selectedExtensions.length} extension(s) selected
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
            onClick={handleSaveGroup}
            disabled={loading.save}
            variant="default"
            style={{ padding: "8px 24px", fontSize: 13 }}
          >
            {loading.save ? (
              <CircularProgress
                size={14}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save ? "Saving..." : "Save Group"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
            style={{ padding: "8px 24px", fontSize: 13 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExtensionGroupsPage;
