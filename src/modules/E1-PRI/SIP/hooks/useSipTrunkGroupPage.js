import { useState, useEffect } from "react";
import {
  SIP_TRUNK_GROUP_INITIAL_FORM,
  SIP_TRUNK_GROUP_ERR_REQUIRED_FIELDS,
  SIP_TRUNK_GROUP_ERR_GROUP_ID_REQUIRED,
  SIP_TRUNK_GROUP_ERR_DUPLICATE_GROUP_ID,
  SIP_TRUNK_GROUP_ERR_SAVE_FAILED,
  SIP_TRUNK_GROUP_ERR_NETWORK,
  SIP_TRUNK_GROUP_ERR_SELECT_TO_DELETE,
  SIP_TRUNK_GROUP_ERR_DELETE_FAILED,
  SIP_TRUNK_GROUP_ERR_IN_USE,
  SIP_TRUNK_GROUP_MSG_UPDATED,
  SIP_TRUNK_GROUP_MSG_SAVED,
  SIP_TRUNK_GROUP_MSG_DELETED_ONE,
  SIP_TRUNK_GROUP_MSG_DELETED_MANY,
  SIP_TRUNK_GROUP_MSG_DELETED_ALL,
  SIP_TRUNK_GROUP_CONFIRM_DELETE_SELECTED,
  SIP_TRUNK_GROUP_CONFIRM_CLEAR_ALL,
  SIP_TRUNK_GROUP_CONFIRM_DELETE_ONE,
} from "../../../../constants/SipTrunkGroupConstants";
import {
  addGroup,
  listGroups,
  deleteGroup,
  listSipRegistrations,
  fetchSipIpTrunkAccounts,
  listIpPstnRoutes,
  listNumberManipulations,
} from "../../../../api/apiService";
import {
  resolveGroupIdValue,
  SIP_ROUTE_REF_FIELDS,
  SIP_MANIP_REF_FIELDS,
  SIP_MANIPULATION_TYPES,
  itemReferencesGroup,
  getRouteList,
  countGroupsWithSameKey,
  normalizeGroupIdForApi,
} from "../utils/SipTrunkGroupTransformers";

export function useSipTrunkGroupPage() {
  const [formData, setFormData] = useState(SIP_TRUNK_GROUP_INITIAL_FORM);
  const [groups, setGroups] = useState([]);
  const [trunkIds, setTrunkIds] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(groups.length / itemsPerPage));
  const pagedGroups = groups.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const pageIndices = pagedGroups.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleTogglePageSelection = () => {
    if (allPageSelected) {
      setSelected((sel) => sel.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelected((sel) => Array.from(new Set([...sel, ...pageIndices])));
    }
  };

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
      showMessage("error", SIP_TRUNK_GROUP_ERR_NETWORK);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const handleSave = async () => {
    if (!formData.sip_trunk_id || !formData.group_id) {
      showMessage("error", SIP_TRUNK_GROUP_ERR_REQUIRED_FIELDS);
      return;
    }
    const desiredGroupId = String(formData.group_id ?? "").trim();
    if (desiredGroupId === "") {
      showMessage("error", SIP_TRUNK_GROUP_ERR_GROUP_ID_REQUIRED);
      return;
    }

    const editingRecord =
      editingRecordId != null
        ? groups.find((group) => String(group.id) === String(editingRecordId))
        : editIndex !== -1
          ? groups[editIndex]
          : null;
    const originalGroupId = editingRecord
      ? resolveGroupIdValue(editingRecord)
      : "";
    const groupIdUnchanged =
      editingRecord != null && desiredGroupId === originalGroupId;

    if (!groupIdUnchanged) {
      const isDuplicate = groups.some((group) => {
        if (
          editingRecordId != null &&
          String(group.id) === String(editingRecordId)
        ) {
          return false;
        }
        return resolveGroupIdValue(group) === desiredGroupId;
      });
      if (isDuplicate) {
        showMessage(
          "error",
          SIP_TRUNK_GROUP_ERR_DUPLICATE_GROUP_ID(desiredGroupId),
        );
        return;
      }
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const payload = {
        sip_trunk_id: String(formData.sip_trunk_id ?? "").trim(),
        group_id: normalizeGroupIdForApi(desiredGroupId),
      };
      const response =
        editingRecordId != null
          ? await addGroup({
              id: String(editingRecordId),
              ...payload,
            })
          : await addGroup(payload);
      if (response.response) {
        showMessage(
          "success",
          response.message ||
            (editingRecordId != null
              ? SIP_TRUNK_GROUP_MSG_UPDATED
              : SIP_TRUNK_GROUP_MSG_SAVED),
        );
        setShowModal(false);
        setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
        setEditIndex(-1);
        setEditingRecordId(null);
        await fetchGroups();
      } else {
        showMessage("error", response.message || SIP_TRUNK_GROUP_ERR_SAVE_FAILED);
      }
    } catch (error) {
      console.error("Error saving group:", error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        SIP_TRUNK_GROUP_ERR_NETWORK;
      showMessage("error", apiMessage);
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleAddNew = () => {
    setFormData(SIP_TRUNK_GROUP_INITIAL_FORM);
    setEditIndex(-1);
    setEditingRecordId(null);
    setShowModal(true);
  };

  // Table selection logic
  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };
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
      showMessage("error", SIP_TRUNK_GROUP_ERR_SELECT_TO_DELETE);
      return;
    }
    if (!window.confirm(SIP_TRUNK_GROUP_CONFIRM_DELETE_SELECTED))
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const groupsToDelete = selected
        .map((idx) => groups[idx])
        .filter(Boolean);
      let remainingGroups = [...groups];
      let deletedCount = 0;

      for (const group of groupsToDelete) {
        const reference = await isGroupReferenced(group, remainingGroups);
        if (reference.inUse) {
          showMessage(
            "error",
            SIP_TRUNK_GROUP_ERR_IN_USE(
              resolveGroupIdValue(group),
              reference.reason,
            ),
          );
          continue;
        }
        const response = await deleteGroup(group.id);
        if (response?.response === false) {
          showMessage("error", response.message || SIP_TRUNK_GROUP_ERR_DELETE_FAILED);
          continue;
        }
        deletedCount += 1;
        remainingGroups = remainingGroups.filter((g) => g.id !== group.id);
      }
      await fetchGroups();
      setSelected([]);
      if (deletedCount > 0) {
        showMessage(
          "success",
          deletedCount === 1
            ? SIP_TRUNK_GROUP_MSG_DELETED_ONE
            : SIP_TRUNK_GROUP_MSG_DELETED_MANY(deletedCount),
        );
      }
    } catch (error) {
      console.error("Error deleting groups:", error);
      showMessage("error", SIP_TRUNK_GROUP_ERR_NETWORK);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(SIP_TRUNK_GROUP_CONFIRM_CLEAR_ALL)) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      let remainingGroups = [...groups];
      let deletedCount = 0;

      for (const group of groups) {
        const reference = await isGroupReferenced(group, remainingGroups);
        if (reference.inUse) {
          showMessage(
            "error",
            SIP_TRUNK_GROUP_ERR_IN_USE(
              resolveGroupIdValue(group),
              reference.reason,
            ),
          );
          continue;
        }
        const response = await deleteGroup(group.id);
        if (response?.response === false) {
          showMessage("error", response.message || SIP_TRUNK_GROUP_ERR_DELETE_FAILED);
          continue;
        }
        deletedCount += 1;
        remainingGroups = remainingGroups.filter((g) => g.id !== group.id);
      }
      await fetchGroups();
      setSelected([]);
      setPage(1);
      if (deletedCount > 0) {
        showMessage(
          "success",
          deletedCount === groups.length
            ? SIP_TRUNK_GROUP_MSG_DELETED_ALL
            : SIP_TRUNK_GROUP_MSG_DELETED_MANY(deletedCount),
        );
      }
    } catch (error) {
      console.error("Error clearing all groups:", error);
      showMessage("error", SIP_TRUNK_GROUP_ERR_NETWORK);
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
        SIP_TRUNK_GROUP_CONFIRM_DELETE_ONE(group.group_id),
      )
    )
      return;
    try {
      const reference = await isGroupReferenced(group, groups);
      if (reference.inUse) {
        showMessage(
          "error",
          SIP_TRUNK_GROUP_ERR_IN_USE(
            resolveGroupIdValue(group),
            reference.reason,
          ),
        );
        return;
      }
      await deleteGroup(group.id);
      await fetchGroups();
      if (editIndex === idx) handleAddNew();
    } catch (error) {
      console.error("Error deleting group:", error);
      showMessage("error", SIP_TRUNK_GROUP_ERR_NETWORK);
    }
  };

  useEffect(() => {
    // Fetch trunk IDs and groups on component mount
    fetchTrunkIds();
    fetchGroups();
  }, []);

  // Block delete only when this is the last row for a Group ID still used in routes.
  const isGroupReferenced = async (group, allGroups = groups) => {
    const gid = resolveGroupIdValue(group);
    if (!gid) return { inUse: false };

    if (countGroupsWithSameKey(allGroups, gid) > 1) {
      return { inUse: false };
    }

    try {
      const ipToPstnRes = await listIpPstnRoutes("ip_to_pstn");
      const ipToPstnHit = getRouteList(ipToPstnRes).find((item) =>
        itemReferencesGroup(item, SIP_ROUTE_REF_FIELDS, gid),
      );
      if (ipToPstnHit) {
        return {
          inUse: true,
          reason: `IP→PSTN route${ipToPstnHit.id != null ? ` #${ipToPstnHit.id}` : ""}`,
        };
      }

      const ipToIpRes = await listIpPstnRoutes("ip_to_ip");
      const ipToIpHit = getRouteList(ipToIpRes).find((item) =>
        itemReferencesGroup(item, SIP_ROUTE_REF_FIELDS, gid),
      );
      if (ipToIpHit) {
        return {
          inUse: true,
          reason: `IP→IP route${ipToIpHit.id != null ? ` #${ipToIpHit.id}` : ""}`,
        };
      }

      for (const manipulationType of SIP_MANIPULATION_TYPES) {
        try {
          const manipRes = await listNumberManipulations(manipulationType);
          const manipHit = getRouteList(manipRes).find((item) =>
            itemReferencesGroup(item, SIP_MANIP_REF_FIELDS, gid),
          );
          if (manipHit) {
            return {
              inUse: true,
              reason: `number manipulation rule (${manipulationType.replaceAll("_", " ")})${manipHit.id != null ? ` #${manipHit.id}` : ""}`,
            };
          }
        } catch (e) {
          console.warn(
            `Number manipulation reference check failed for ${manipulationType}:`,
            e?.message,
          );
        }
      }

      return { inUse: false };
    } catch (e) {
      console.warn("Reference check failed:", e?.message);
      return { inUse: false };
    }
  };

  return {
    formData,
    groups,
    trunkIds,
    editIndex,
    editingRecordId,
    selected,
    setSelected,
    page,
    setPage,
    loading,
    showModal,
    setShowModal,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    totalPages,
    pagedGroups,
    allPageSelected,
    somePageSelected,
    handleTogglePageSelection,
    handleInputChange,
    handleSave,
    handleAddNew,
    handleSelectRow,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
    handleSingleDelete,
  };
}
