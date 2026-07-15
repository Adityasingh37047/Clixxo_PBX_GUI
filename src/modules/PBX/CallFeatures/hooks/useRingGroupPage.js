import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  createRingGroup,
  deleteRingGroup,
  fetchSipAccounts,
  listConferences,
  listIvrs,
  listRingBackOptions,
  listRingGroups,
  updateRingGroup,
} from "../../../../api/apiService";
import {
  RING_GROUP_EMPTY_RING_BACK_OPTIONS,
  RING_GROUP_ITEMS_PER_PAGE,
} from "../../../../constants/RingGroupConstants";
import { EXTENSION_COMPACT_MQ } from "../../../../theme/pbxTokens";
import {
  buildRingGroupApiPayload,
  getRingGroupTimeoutValueOptions,
  mapConferencesToDestinationOptions,
  mapIvrsToDestinationOptions,
  mapRingGroupFromApi,
  mapSipAccountsToExtensionOptions,
  normalizeRingBackOptions,
  normalizeRingGroupList,
  ringGroupFormFromRow,
} from "../utils/RingGroupTransformers";
import { validateRingGroupForm } from "../utils/RingGroupValidators";

export function useRingGroupPage() {
  const isCompact = useMediaQuery(EXTENSION_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    members: false,
    destinations: false,
    list: false,
    ringBackOptions: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedDataRef = useRef(false);

  const itemsPerPage = RING_GROUP_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [ringGroupNumber, setRingGroupNumber] = useState("");
  const [ringStrategy, setRingStrategy] = useState("simultaneous");
  const [timeoutDestinationType, setTimeoutDestinationType] = useState("");
  const [timeoutDestinationValue, setTimeoutDestinationValue] = useState("");
  const [ringTimeout, setRingTimeout] = useState("30");
  const [enabled, setEnabled] = useState("Yes");
  const [alertInfo, setAlertInfo] = useState("");
  const [ringBack, setRingBack] = useState("us-ring");
  const [ringBackOptions, setRingBackOptions] = useState(
    RING_GROUP_EMPTY_RING_BACK_OPTIONS,
  );
  const [cidNamePrefix, setCidNamePrefix] = useState("");
  const [extensionAnswerConfirm, setExtensionAnswerConfirm] = useState("No");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [destinationData, setDestinationData] = useState({
    extensions: [],
    conferenceRooms: [],
    ivrMenus: [],
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const loadRingBackOptionsAPI = async () => {
    setLoading((prev) => ({ ...prev, ringBackOptions: true }));
    try {
      const res = await listRingBackOptions();
      if (res?.response === false) {
        showMessage(
          "error",
          typeof res?.message === "string"
            ? res.message
            : "Failed to load ring back options.",
        );
        setRingBackOptions(RING_GROUP_EMPTY_RING_BACK_OPTIONS);
        return;
      }
      setRingBackOptions(
        normalizeRingBackOptions(
          res?.message,
          RING_GROUP_EMPTY_RING_BACK_OPTIONS,
        ),
      );
    } catch (err) {
      setRingBackOptions(RING_GROUP_EMPTY_RING_BACK_OPTIONS);
    } finally {
      setLoading((prev) => ({ ...prev, ringBackOptions: false }));
    }
  };

  const refreshRingGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listRingGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load ring groups.");
        setRows([]);
        return;
      }
      setRows(normalizeRingGroupList(res).map(mapRingGroupFromApi));
    } catch (err) {
      showMessage("error", err?.message || "Failed to load ring groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    refreshRingGroups();
  }, []);

  const loadFormData = async () => {
    setLoading((prev) => ({ ...prev, members: true, destinations: true }));
    try {
      const [sipRes, confRes, ivrRes] = await Promise.all([
        fetchSipAccounts(),
        listConferences(),
        listIvrs(),
      ]);

      const extensions = mapSipAccountsToExtensionOptions(sipRes);
      setAvailableExtensions(extensions);
      setDestinationData({
        extensions,
        conferenceRooms: mapConferencesToDestinationOptions(confRes),
        ivrMenus: mapIvrsToDestinationOptions(ivrRes),
      });
      hasLoadedDataRef.current = true;
    } catch (err) {
      showMessage(
        "error",
        err?.message || "Failed to load ring group form data.",
      );
      setAvailableExtensions([]);
      setDestinationData({ extensions: [], conferenceRooms: [], ivrMenus: [] });
    } finally {
      setLoading((prev) => ({ ...prev, members: false, destinations: false }));
    }
  };

  const filteredRows = rows;
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

  const resetForm = () => {
    setEditId(null);
    setName("");
    setRingGroupNumber("");
    setRingStrategy("simultaneous");
    setTimeoutDestinationType("");
    setTimeoutDestinationValue("");
    setRingTimeout("30");
    setEnabled("Yes");
    setAlertInfo("");
    setRingBack("us-ring");
    setCidNamePrefix("");
    setExtensionAnswerConfirm("No");
    setMemberExtensions([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await Promise.all([
      loadRingBackOptionsAPI(),
      !hasLoadedDataRef.current ? loadFormData() : Promise.resolve(),
    ]);
  };

  const handleOpenEditModal = async (row) => {
    const form = ringGroupFormFromRow(row);
    setEditId(form.editId);
    setName(form.name);
    setRingGroupNumber(form.ringGroupNumber);
    setRingStrategy(form.ringStrategy);
    setTimeoutDestinationType(form.timeoutDestinationType);
    setTimeoutDestinationValue(form.timeoutDestinationValue);
    setRingTimeout(form.ringTimeout);
    setEnabled(form.enabled);
    setAlertInfo(form.alertInfo);
    setRingBack(form.ringBack);
    setCidNamePrefix(form.cidNamePrefix);
    setExtensionAnswerConfirm(form.extensionAnswerConfirm);
    setMemberExtensions(form.memberExtensions);
    setShowModal(true);
    await Promise.all([
      loadRingBackOptionsAPI(),
      !hasLoadedDataRef.current ? loadFormData() : Promise.resolve(),
    ]);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selected.length)
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
        let deleteFailed = false;
        for (const row of toDelete) {
          if (row.id != null) {
            const res = await deleteRingGroup(row.id);
            if (res?.response === false) {
              deleteFailed = true;
              showMessage(
                "error",
                res?.message || "Failed to delete ring group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshRingGroups();
        if (!deleteFailed) {
          showMessage(
            "success",
            toDelete.length === 1
              ? "Ring group deleted successfully."
              : `${toDelete.length} ring groups deleted successfully.`,
          );
        }
      } catch (err) {
        showMessage("error", err?.message || "Failed to delete ring group(s).");
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const validationError = validateRingGroupForm({
      name,
      ringGroupNumber,
      ringTimeout,
      timeoutDestinationType,
      timeoutDestinationValue,
      memberExtensions,
    });
    if (validationError) return showMessage("error", validationError);

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        const apiPayload = buildRingGroupApiPayload({
          name,
          ringGroupNumber,
          ringStrategy,
          ringTimeout,
          memberExtensions,
          enabled,
          alertInfo,
          ringBack,
          cidNamePrefix,
          extensionAnswerConfirm,
          timeoutDestinationType,
          timeoutDestinationValue,
        });

        let res;
        if (editId != null) {
          res = await updateRingGroup(editId, apiPayload);
        } else {
          res = await createRingGroup(apiPayload);
        }

        if (res?.response === false) {
          showMessage("error", res?.message || "Failed to save ring group.");
          return;
        }
        await refreshRingGroups();
        handleCloseModal();
        showMessage("success", "Ring group saved successfully.");
      } catch (err) {
        showMessage("error", err?.message || "Failed to save ring group.");
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  const getExtLabel = (ext) => {
    const found = availableExtensions.find((e) => e.value === ext);
    return found?.label || ext;
  };

  const allExtensionOptions = useMemo(
    () => availableExtensions.map(({ value, label }) => ({ value, label })),
    [availableExtensions],
  );

  const timeoutValueOptions = getRingGroupTimeoutValueOptions({
    timeoutDestinationType,
    destinationData,
    rows,
    editId,
  });
  const shouldShowTimeoutValue = Boolean(timeoutDestinationType);

  const ringBackAllValues = useMemo(
    () => [
      ...ringBackOptions.moh_categories,
      ...ringBackOptions.custom_prompts,
      ...ringBackOptions.country_tones,
    ],
    [ringBackOptions],
  );

  const availableMemberEmptyText = loading.members
    ? "Loading..."
    : "No extension";

  return {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    message,
    setMessage,
    isInitialLoad,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    filteredRows,
    editId,
    name,
    setName,
    ringGroupNumber,
    setRingGroupNumber,
    ringStrategy,
    setRingStrategy,
    timeoutDestinationType,
    setTimeoutDestinationType,
    timeoutDestinationValue,
    setTimeoutDestinationValue,
    ringTimeout,
    setRingTimeout,
    enabled,
    setEnabled,
    alertInfo,
    setAlertInfo,
    ringBack,
    setRingBack,
    ringBackOptions,
    cidNamePrefix,
    setCidNamePrefix,
    extensionAnswerConfirm,
    setExtensionAnswerConfirm,
    memberExtensions,
    setMemberExtensions,
    allPageSelected,
    somePageSelected,
    allExtensionOptions,
    timeoutValueOptions,
    shouldShowTimeoutValue,
    ringBackAllValues,
    availableMemberEmptyText,
    getExtLabel,
    handleToggleRow,
    handleToggleAll,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSave,
  };
}
