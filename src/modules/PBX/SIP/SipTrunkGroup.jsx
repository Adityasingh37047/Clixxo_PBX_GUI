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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  C,
  Btn,
  TH,
  tdStyle,
  SipPcmBreadcrumb,
  sipPcmPageWrapStyle,
  sipPcmInnerStyle,
  sipPcmCardStyle,
  sipPcmToolbarStyle,
  SipPcmPagination,
  sipPcmCheckboxSx,
  sipPcmSelectedBadgeStyle,
  sipPcmCancelBtnStyle,
  sipPcmPrimaryBtnStyle,
} from "../../../sections/sip/sipPcmSharedUi";

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
    <div style={sipPcmPageWrapStyle}>
      {/* Toast Alert */}
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

      <div style={sipPcmInnerStyle}>
        <SipPcmBreadcrumb current="SIP Trunk Group" />

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: C.accent }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleAddNew}
                disabled={loading.fetch}
                variant="primary"
                style={sipPcmPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
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
                      sx={sipPcmCheckboxSx}
                    />
                  </TH>
                  {SIP_TRUNK_GROUP_TABLE_COLUMNS.filter(
                    (c) => c.key !== "check" && c.key !== "modify",
                  ).map((col) => (
                    <TH key={col.key}>{col.label}</TH>
                  ))}
                  <TH
                    style={{
                      width: 70,
                      borderRight: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    Actions
                  </TH>
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
                    const isLastRow = idx === pagedGroups.length - 1;
                    const rowBg = isSel
                      ? "#eff6ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSel)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSel) e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSel}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={sipPcmCheckboxSx}
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
                                ...tdStyle,
                                background: rowBg,
                                borderBottom: isLastRow
                                  ? "none"
                                  : tdStyle.borderBottom,
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
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
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

          {!loading.fetch && groups.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedGroups.length}
              onPageChange={(nextPage) =>
                setPage(Math.min(totalPages, Math.max(1, nextPage)))
              }
            />
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
          style={{ padding: "20px 24px", backgroundColor: "#ffffff" }}
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* SIP Trunk ID */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
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
                    SIP Trunk ID:
                  </label>

                  <div style={{ flex: 1 }}>
                    <Select
                      name="sip_trunk_id"
                      value={formData.sip_trunk_id}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      displayEmpty
                      sx={{
                        fontSize: 13,
                        backgroundColor: "#fff",
                      }}
                    >
                      <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                        Select SIP Trunk ID
                      </MenuItem>

                      {trunkIds.length === 0 ? (
                        <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                          No options
                        </MenuItem>
                      ) : (
                        trunkIds.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 13 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </div>
                </div>

                {/* Group ID */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
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
                    Group ID:
                  </label>

                  <div style={{ flex: 1 }}>
                    <TextField
                      type="text"
                      name="group_id"
                      value={formData.group_id}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      variant="outlined"
                      placeholder="Enter Group ID"
                      inputProps={{
                        style: {
                          fontSize: 13,
                          padding: "6px 8px",
                          backgroundColor: "#fff",
                        },
                      }}
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
            variant="primary"
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? (
              <CircularProgress
                size={14}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={() => setShowModal(false)}
            variant="cancel"
            disabled={loading.save}
            style={{ minWidth: 100, height: 33 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipTrunkGroup;
