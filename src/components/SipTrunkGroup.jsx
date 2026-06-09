import React, { useState, useRef, useEffect } from "react";
import {
  SIP_TRUNK_GROUP_FIELDS,
  SIP_TRUNK_GROUP_INITIAL_FORM,
  SIP_TRUNK_GROUP_TABLE_COLUMNS,
} from "../constants/SipTrunkGroupConstants";
import {
  addGroup,
  listGroups,
  deleteGroup,
  listSipRegistrations,
  fetchSipIpTrunkAccounts,
  listIpPstnRoutes,
  listNumberManipulations,
} from "../api/apiService";
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
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

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

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: "#1e293b",
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: "1px solid #9ca3af",
      borderRight: "0.5px solid #9ca3af",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
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
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            maxWidth: 420,
          }}
        >
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{ boxShadow: 3 }}
          >
            {message.text}
          </Alert>
        </div>
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
                Page {page} · {groups.length} records
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleCheckAll}
                disabled={loading.delete}
                variant="outline"
              >
                Check All
              </Btn>
              <Btn
                onClick={handleUncheckAll}
                disabled={loading.delete}
                variant="outline"
              >
                Uncheck All
              </Btn>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete}
                variant="outline"
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="danger"
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
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleAddNew}
                disabled={loading.fetch}
                variant="accent"
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
                        color: C.accent,
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
                          borderBottom: "0.5px solid #9ca3af",
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
                            checked={isSel}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={{
                              padding: "1px",
                              color: C.accent,
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
                                fontSize: 12,
                                borderRight: "0.5px solid #edf2f7",
                                padding: "6px 8px",
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
                        <td style={{ textAlign: "center", padding: "4px 0" }}>
                          <Btn
                            onClick={() => handleEdit(realIdx)}
                            disabled={loading.delete}
                            variant="outline"
                            style={{ margin: "0 auto" }}
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
                background: "#f8fafc",
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
                <span>
                  Showing {pagedGroups.length} records on page {page}
                </span>
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
          style={{ padding: "12px 12px 0 12px", backgroundColor: "#f8fafc" }}
        >
          <div className="flex flex-col gap-2 w-full">
            <div
              className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2"
              style={{ minHeight: 32 }}
            >
              <label
                className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                style={{ width: 160, marginRight: 10 }}
              >
                SIP Trunk ID:
              </label>
              <div className="flex-1">
                <Select
                  name="sip_trunk_id"
                  value={formData.sip_trunk_id}
                  onChange={handleInputChange}
                  size="small"
                  displayEmpty
                  sx={{
                    width: 300,
                    "& .MuiOutlinedInput-input": {
                      padding: "6px 8px",
                      fontSize: 14,
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select SIP Trunk ID
                  </MenuItem>
                  {trunkIds.length === 0 ? (
                    <MenuItem value="" disabled>
                      No options
                    </MenuItem>
                  ) : (
                    trunkIds.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </div>
            </div>
            <div
              className="flex items-center bg-white border border-gray-300 rounded px-2 py-1 gap-2"
              style={{ minHeight: 32 }}
            >
              <label
                className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                style={{ width: 160, marginRight: 10 }}
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
                  variant="outlined"
                  placeholder="Enter Group ID"
                  sx={{ width: 300 }}
                  inputProps={{ style: { fontSize: 14, padding: "3px 6px" } }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            background: "#f8fafc",
            padding: "16px 24px",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading.save}
            startIcon={
              loading.save ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
            sx={{
              background: "#1e2d42",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 32px",
              minWidth: 120,
              "&:hover": { background: "#0f172a" },
            }}
          >
            {loading.save ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={() => setShowModal(false)}
            variant="outlined"
            disabled={loading.save}
            sx={{
              color: "#1e293b",
              borderColor: "#9ca3af",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 32px",
              minWidth: 100,
              "&:hover": { borderColor: "#1e293b", background: "#f1f5f9" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipTrunkGroup;
