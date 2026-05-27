import React, { useState, useRef, useEffect } from "react";
import {
  SIP_TRUNK_GROUP_FIELDS,
  SIP_TRUNK_GROUP_INITIAL_FORM,
  SIP_TRUNK_GROUP_TABLE_COLUMNS,
} from "../../../constants/SipTrunkGroupConstants";
import {
  addGroup,
  listGroups,
  deleteGroup,
  listSipRegistrations,
  fetchSipIpTrunkAccounts,
  listIpPstnRoutes,
  listNumberManipulations,
} from "../../../api/apiService";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import {
  Button,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditDocumentIcon from "@mui/icons-material/EditDocument";

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#2563eb",
  successGreen: "#22c55e",
  errorRed: "#ef4444",
  purple: "#8b5cf6",
};
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  title,
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
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "6px 14px",
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
        if (!disabled) e.currentTarget.style.opacity = "0.85";
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
const SipTrunkGroup = () => {
  const [formData, setFormData] = useState(SIP_TRUNK_GROUP_INITIAL_FORM);
  const [groups, setGroups] = useState([]);
  const [trunkIds, setTrunkIds] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const pagedGroups = groups.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for group_id: only alphanumeric characters, no spaces
    if (name === "group_id") {
      const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: alphanumericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Fetch SIP Trunk IDs from SIP Registration and extension numbers from SIP-to-SIP account, then build combined options
  const fetchTrunkIds = async () => {
    try {
      const [regRes, ipTrunkRes] = await Promise.all([
        listSipRegistrations(),
        fetchSipIpTrunkAccounts(),
      ]);

      // Collect trunk IDs
      const trunkIdList = Array.isArray(regRes?.message || regRes?.data)
        ? (regRes.message || regRes.data)
            .map((it) => it?.trunkId || it?.trunk_id || it?.id)
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v))
        : [];

      // Unique trunk IDs
      const uniqueTrunkIds = Array.from(new Set(trunkIdList));

      // Collect SIP-to-SIP extensions
      const extList = Array.isArray(ipTrunkRes?.message || ipTrunkRes?.data)
        ? (ipTrunkRes.message || ipTrunkRes.data)
            .map((it) => it?.extension || it?.id)
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v))
        : [];

      const uniqueExts = Array.from(new Set(extList));

      // Build combined options: trunkId/extension. Avoid duplicates.
      const combinedOptions = [];
      uniqueTrunkIds.forEach((tid) => {
        if (uniqueExts.length > 0) {
          uniqueExts.forEach((ext) => {
            combinedOptions.push({
              value: `${tid}/${ext}`,
              label: `${tid}/${ext}`,
            });
          });
        } else {
          // If no extensions exist yet, show plain trunkId option (only once)
          combinedOptions.push({ value: `${tid}`, label: `${tid}` });
        }
      });

      // Also include plain trunkId options for backward compatibility (so editing older rows works),
      // but ensure we don't add duplicates.
      uniqueTrunkIds.forEach((tid) => {
        combinedOptions.push({ value: `${tid}`, label: `${tid}` });
      });

      // Deduplicate by value (preserve first occurrence)
      const uniqueByValue = Array.from(
        new Map(combinedOptions.map((o) => [o.value, o])).values(),
      );
      setTrunkIds(uniqueByValue);
    } catch (error) {
      console.error("Error fetching SIP trunk/extension IDs:", error);
      // Leave dropdown empty rather than failing the page
      setTrunkIds([]);
    }
  };

  // Fetch groups from API
  const fetchGroups = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listGroups();
      if (response.response && response.message) {
        // Sort groups by ID to ensure proper order
        const sortedGroups = response.message.sort((a, b) => a.id - b.id);
        setGroups(sortedGroups);
      } else {
        // If response is successful but no data, ensure groups is empty
        setGroups([]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showMessage("error", "Network error. Please check your connection.");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const handleSave = async () => {
    if (!formData.sip_trunk_id || !formData.group_id) {
      showMessage("error", "Please fill in all required fields");
      return;
    }
    const desiredGroupId = String(formData.group_id ?? "").trim();
    if (desiredGroupId === "") {
      showMessage("error", "Group ID is required.");
      return;
    }
    const isDuplicate = groups.some((group, index) => {
      if (editIndex !== -1 && index === editIndex) return false;
      return String(group.group_id ?? "").trim() === desiredGroupId;
    });
    if (isDuplicate) {
      showMessage(
        "error",
        `Group ID "${desiredGroupId}" already exists. Please choose a different Group ID.`,
      );
      return;
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response = await addGroup({
        sip_trunk_id: formData.sip_trunk_id,
        group_id: formData.group_id,
      });
      if (response.response) {
        showMessage("success", response.message || "Saved successfully");
        setShowModal(false);
        setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
        setEditIndex(-1);
        await fetchGroups();
      } else {
        showMessage("error", response.message || "Save failed");
      }
    } catch (error) {
      console.error("Error saving group:", error);
      showMessage("error", "Network error. Please check your connection.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleAddNew = () => {
    setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
    setEditIndex(-1);
    setShowModal(true);
  };

  const handleEdit = (idx) => {
    const group = groups[idx];
    setFormData({
      sip_trunk_id: group.sip_trunk_id,
      group_id: group.group_id,
    });
    setEditIndex(idx);
    setShowModal(true);
  };

  // Table selection logic
  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };
  const handleCheckAll = () =>
    setSelected(pagedGroups.map((_, idx) => (page - 1) * itemsPerPage + idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      pagedGroups
        .map((_, idx) => {
          const realIdx = (page - 1) * itemsPerPage + idx;
          return selected.includes(realIdx) ? null : realIdx;
        })
        .filter((i) => i !== null),
    );
  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select items to delete");
      return;
    }
    if (!window.confirm("Are you sure you want to delete the selected groups?"))
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const idx of selected) {
        const group = groups[idx];
        const inUse = await isGroupReferenced(group.group_id);
        if (inUse) {
          showMessage(
            "error",
            "The SIP trunk group cannot be deleted because it is quoted by the routing rule!",
          );
          continue;
        }
        await deleteGroup(group.id);
      }
      await fetchGroups();
      setSelected([]);
    } catch (error) {
      console.error("Error deleting groups:", error);
      showMessage("error", "Network error. Please check your connection.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all groups?")) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const group of groups) {
        const inUse = await isGroupReferenced(group.group_id);
        if (inUse) {
          showMessage(
            "error",
            `Group ${group.group_id} cannot be deleted because it is quoted by the routing rule!`,
          );
          continue;
        }
        await deleteGroup(group.id);
      }
      await fetchGroups();
      setSelected([]);
      setPage(1);
    } catch (error) {
      console.error("Error clearing all groups:", error);
      showMessage("error", "Network error. Please check your connection.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handlePageChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) setPage(val);
  };

  const handleSingleDelete = async (idx) => {
    const group = groups[idx];
    if (
      !window.confirm(
        `Are you sure you want to delete group "${group.group_id}"?`,
      )
    )
      return;
    try {
      const inUse = await isGroupReferenced(group.group_id);
      if (inUse) {
        showMessage(
          "error",
          "The SIP trunk group cannot be deleted because it is quoted by the routing rule!",
        );
        return;
      }
      await deleteGroup(group.id);
      await fetchGroups();
      if (editIndex === idx) handleAddNew();
    } catch (error) {
      console.error("Error deleting group:", error);
      showMessage("error", "Network error. Please check your connection.");
    }
  };

  const handleTableScroll = (e) =>
    setScrollState({
      left: e.target.scrollLeft,
      width: e.target.clientWidth,
      scrollWidth: e.target.scrollWidth,
    });
  const handleScrollbarDrag = (e) => {
    const track = e.target.parentNode;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft =
        (scrollState.scrollWidth - scrollState.width) * percent;
  };
  const handleArrowClick = (dir) => {
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft += dir === "left" ? -100 : 100;
  };

  useEffect(() => {
    // Fetch trunk IDs and groups on component mount
    fetchTrunkIds();
    fetchGroups();
  }, []);

  // Check if SIP trunk group is referenced by routing rules (exact field checks; avoid substring false positives)
  const isGroupReferenced = async (groupId) => {
    try {
      const gid = String(groupId);
      // Only IP->PSTN routes should reference SIP trunk groups as call_source
      const res = await listIpPstnRoutes("ip_to_pstn");
      const list = (res && (res.message || res.data)) || [];
      const foundInRoutes = list.some((item) => {
        try {
          const candidates = [
            item?.call_source,
            item?.callSource,
            item?.source_group,
            item?.source_group_id,
            item?.sip_trunk_group,
            item?.sip_trunk_group_id,
          ]
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v));
          return candidates.some((v) => v === gid);
        } catch {
          return false;
        }
      });

      if (foundInRoutes) return true;

      // Also check number manipulation rules (they may reference SIP trunk groups via call_initiator)
      try {
        const manipRes = await listNumberManipulations();
        const manipList =
          (manipRes && (manipRes.message || manipRes.data)) || [];
        const foundInManip = manipList.some((item) => {
          try {
            const candidates = [
              item?.call_initiator,
              item?.callInitiator,
              item?.callInitiatorId,
              item?.call_initiator_id,
              item?.call_source,
              item?.callSource,
              item?.sip_trunk_group,
              item?.sip_trunk_group_id,
            ]
              .filter((v) => v !== undefined && v !== null)
              .map((v) => String(v));
            return candidates.some((v) => v === gid);
          } catch {
            return false;
          }
        });
        if (foundInManip) return true;
      } catch (e) {
        console.warn("Number manipulation reference check failed:", e?.message);
      }

      return false;
    } catch (e) {
      console.warn("Reference check failed:", e?.message);
      return false;
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
      {/* Toast Alert */}
      {message.text && (
        <Alert
          severity={message.type === "error" ? "error" : message.type === "success" ? "success" : "info"}
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

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: C.mutedText, marginBottom: 12 }}>
          PBX &rsaquo; SIP &rsaquo;{" "}
          <span style={{ color: C.valueText, fontWeight: 600 }}>
            SIP Trunk Group
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleCheckAll}
                disabled={loading.delete}
                variant="outline"
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                Check All
              </Btn>
              <Btn
                onClick={handleUncheckAll}
                disabled={loading.delete}
                variant="outline"
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                Uncheck All
              </Btn>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete}
                variant="outline"
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="danger"
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#dc2626" }} />
                )}
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete}
                variant="outline"
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleAddNew}
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 600,
              }}
            >
              <thead>
                <tr>
                  <TH style={{ width: 36 }}>
                    <Checkbox
                      size="small"
                      checked={
                        selected.length > 0 && selected.length === groups.length
                      }
                      indeterminate={
                        selected.length > 0 && selected.length < groups.length
                      }
                      onChange={
                        selected.length === groups.length
                          ? handleUncheckAll
                          : handleCheckAll
                      }
                      disabled={loading.delete}
                      sx={{
                        padding: "1px",
                        color: "#64748b",
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                  </TH>
                  {SIP_TRUNK_GROUP_TABLE_COLUMNS.filter(
                    (c) => c.key !== "check" && c.key !== "modify",
                  ).map((col) => (
                    <TH key={col.key}>{col.label}</TH>
                  ))}
                  <TH style={{ width: 70 }}>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {loading.fetch ? (
                  <tr>
                    <td
                      colSpan={SIP_TRUNK_GROUP_TABLE_COLUMNS.length + 2}
                      style={{ textAlign: "center", padding: "48px 0" }}
                    >
                      <CircularProgress size={28} style={{ color: C.accent }} />
                    </td>
                  </tr>
                ) : pagedGroups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={SIP_TRUNK_GROUP_TABLE_COLUMNS.length + 2}
                      style={{
                        textAlign: "center",
                        padding: "36px 0",
                        color: C.mutedText,
                        fontSize: 13,
                      }}
                    >
                      No groups found.
                    </td>
                  </tr>
                ) : (
                  pagedGroups.map((item, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSel = selected.includes(realIdx);
                    const rowBg = isSel
                      ? "#f0f9ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: rowBg,
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSel) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSel) e.currentTarget.style.background = rowBg;
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
                            checked={isSel}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={{
                              padding: "1px",
                              color: "#64748b",
                              "&.Mui-checked": { color: C.accent },
                            }}
                          />
                        </td>
                        {SIP_TRUNK_GROUP_TABLE_COLUMNS.filter(
                          (c) => c.key !== "check" && c.key !== "modify",
                        ).map((col) => {
                          let value = item[col.key];
                          if (col.key === "index") value = realIdx + 1;
                          return (
                            <td
                              key={col.key}
                              style={{
                                textAlign: "center",
                                padding: "10px 14px",
                                fontSize: 13,
                                color: C.valueText,
                                borderRight: "1px solid #f1f5f9",
                              }}
                            >
                              {value !== undefined &&
                              value !== null &&
                              value !== ""
                                ? value
                                : "--"}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: "center", padding: "7px 8px" }}>
                          <EditDocumentIcon
                            className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                            titleAccess="Edit"
                            onClick={() => handleEdit(realIdx)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading.fetch && groups.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#ffffff",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 11,
                  color: C.mutedText,
                }}
              >
                <span>Showing {pagedGroups.length} records on page {page}</span>
                {/* <span>{groups.length} items Total</span>   */}
                {/* <span>{itemsPerPage} Items/Page</span> */}
                {/* <span style={{ color: C.accent, fontWeight: 600 }}>{page} / {totalPages} Pages</span> */}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  First
                </Btn>
                <Btn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    color: C.mutedText,
                    margin: "0 4px",
                  }}
                >
                  <span>Go to</span>
                  <select
                    value={page}
                    onChange={(e) => setPage(Number(e.target.value))}
                    style={{
                      padding: "2px 4px",
                      borderRadius: 4,
                      border: `1px solid ${C.cardBorder}`,
                      fontSize: 11,
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <Btn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
                <Btn
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <Dialog
        open={showModal}
        onClose={() => !loading.save && setShowModal(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 520,
            maxWidth: "90vw",
            mx: "auto",
            p: 0,
            borderRadius: 2,
          },
        }}
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
          {editIndex !== -1 ? "Edit SIP Trunk Group" : "Add SIP Trunk Group"}
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: "#f8fafc" }}
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
                Trunk Group Info
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 32px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 120,
                      flexShrink: 0,
                    }}
                  >
                    SIP Trunk ID:
                  </label>
                  <div className="flex-1">
                    <Select
                      name="sip_trunk_id"
                      value={formData.sip_trunk_id}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      displayEmpty
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: 13 }}>Select SIP Trunk ID</MenuItem>
                      {trunkIds.length === 0 ? (
                        <MenuItem value="" disabled sx={{ fontSize: 13 }}>No options</MenuItem>
                      ) : (
                        trunkIds.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                            {opt.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 120,
                      flexShrink: 0,
                    }}
                  >
                    Group ID:
                  </label>
                  <div className="flex-1">
                    <TextField
                      type="text"
                      name="group_id"
                      value={formData.group_id}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter Group ID"
                      inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                    />
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
            variant="contained"
            disabled={loading.save}
            style={{
              padding: "8px 28px",
              fontSize: 13,
              background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
              color: "#fff",
              border: "1px solid #5A6F8F",
              boxShadow: "0 2px 8px #3E5475",
            }}
          >
            {loading.save ? (
              <CircularProgress size={14} style={{ color: "#fff", marginRight: 8 }} />
            ) : null}
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={() => setShowModal(false)}
            variant="outlined"
            disabled={loading.save}
            style={{
              background: "#cbd5e1",
              color: "#374151",
              border: "1px solid #cbd5e1",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
              padding: "8px 28px",
              fontSize: 13,
            }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipTrunkGroup;
