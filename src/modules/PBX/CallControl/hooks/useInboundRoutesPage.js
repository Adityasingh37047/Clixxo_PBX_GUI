import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  createInboundRoute,
  deleteInboundRoute,
  listInboundRoutes,
  listIvrDestinations,
  listSipRegistrations,
  updateInboundRoute,
} from "../../../../api/apiService";
import {
  buildInboundRouteApiPayload,
  getInboundDestinationChoices,
  mapInboundRouteFromApi,
  mapSipRegistrationsToTrunkOptions,
  normalizeInboundRouteList,
} from "../utils/InboundRoutesTransformers";
import {
  inboundRouteNeedsDestinationTarget,
  validateInboundRouteForm,
} from "../utils/InboundRoutesValidators";

const INBOUND_ROUTE_COMPACT_MQ = "(max-width: 768px)";

export function useInboundRoutesPage() {
  const isCompact = useMediaQuery(INBOUND_ROUTE_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    trunks: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedTrunksRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [didPattern, setDidPattern] = useState("");
  const [callerIdPattern, setCallerIdPattern] = useState("");
  const [distinctiveRingTone, setDistinctiveRingTone] = useState("");
  const [enableT38, setEnableT38] = useState("No");
  const [enableTimeCondition, setEnableTimeCondition] = useState("No");
  const [destination, setDestination] = useState("");
  const [enabled, setEnabled] = useState("Yes");
  const [priority, setPriority] = useState("102");
  const [enableMobilityExtension, setEnableMobilityExtension] = useState("No");
  const [sendRingTone, setSendRingTone] = useState("Remote");
  const [destinationTarget, setDestinationTarget] = useState("");
  const [extensionRange, setExtensionRange] = useState("");

  const [destinations, setDestinations] = useState({});
  const hasLoadedDestinationDataRef = useRef(false);

  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [selectedTrunks, setSelectedTrunks] = useState([]);

  const itemsPerPage = 50;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(rows.length / itemsPerPage)),
      ),
    );
  }, [rows]);

  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const showAlert = (text) => showMessage("error", text);

  const fetchInboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listInboundRoutes();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load inbound routes.");
        setRows([]);
        return;
      }
      setRows(
        normalizeInboundRouteList(res).map((row) =>
          mapInboundRouteFromApi(row, []),
        ),
      );
    } catch (err) {
      showAlert(err?.message || "Failed to load inbound routes.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchInboundRoutes();
  }, []);

  const loadTrunks = async () => {
    setLoading((prev) => ({ ...prev, trunks: true }));
    try {
      const res = await listSipRegistrations();
      setAvailableTrunks(mapSipRegistrationsToTrunkOptions(res));
      hasLoadedTrunksRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load trunks.");
      setAvailableTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, trunks: false }));
    }
  };

  const loadDestinationData = async () => {
    try {
      const res = await listIvrDestinations();
      if (res?.response && res?.message && typeof res.message === "object") {
        setDestinations(res.message);
      }
      hasLoadedDestinationDataRef.current = true;
    } catch {
      setDestinations({});
    }
  };

  const destinationChoices = getInboundDestinationChoices(
    destination,
    destinations,
  );
  const needsDestinationTarget =
    inboundRouteNeedsDestinationTarget(destination);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setDidPattern("");
    setCallerIdPattern("");
    setDistinctiveRingTone("");
    setEnableT38("No");
    setEnableTimeCondition("No");
    setDestination("");
    setEnabled("Yes");
    setPriority("102");
    setEnableMobilityExtension("No");
    setSendRingTone("Remote");
    setDestinationTarget("");
    setExtensionRange("");
    setSelectedTrunks([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current)
      loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setDidPattern(row.didPattern || "");
    setCallerIdPattern(row.callerIdPattern || "");
    setDistinctiveRingTone(row.distinctiveRingTone || "");
    setEnableT38(row.enableT38 || "No");
    setEnableTimeCondition(row.enableTimeCondition || "No");
    setDestination(row.destination || "Call Queue");
    setEnabled(row.enabled || "Yes");
    setPriority(row.priority || "102");
    setEnableMobilityExtension(row.enableMobilityExtension || "No");
    setSendRingTone(row.sendRingTone || "Remote");
    setDestinationTarget(row.destinationTarget || "");
    setExtensionRange(row.extensionRange || "");
    setSelectedTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current)
      loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const trunkLabelMap = useMemo(() => {
    const map = new Map();
    availableTrunks.forEach((t) => {
      map.set(t.id, t.label);
    });
    return map;
  }, [availableTrunks]);

  const getTrunkLabel = (id) => trunkLabelMap.get(id) || id;

  const allTrunkOptions = useMemo(
    () =>
      availableTrunks.map(({ id, label }) => ({
        value: id,
        label: label || id,
      })),
    [availableTrunks],
  );

  const handleSelectRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const pageIndices = pagedRows.map((_, i) => (page - 1) * itemsPerPage + i);
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;
  const handleToggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => prev.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIndices])));
    }
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} record(s)?`,
      )
    )
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected
        .map((idx) => rows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteInboundRoute(id)),
      );
      const failed = results.find((res) => !res?.response);
      if (failed) {
        showAlert(failed?.message || "Failed to delete one or more routes.");
      } else {
        showMessage("success", "Inbound route(s) deleted successfully.");
      }
      await fetchInboundRoutes();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || "Failed to delete route(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const validationError = validateInboundRouteForm({
      name,
      destination,
      priority,
      extensionRange,
      destinationTarget,
      destinationChoices,
    });
    if (validationError) {
      showAlert(validationError);
      return;
    }

    const apiPayload = buildInboundRouteApiPayload({
      name: name.trim(),
      didPattern,
      callerIdPattern,
      distinctiveRingTone,
      enableT38,
      enableTimeCondition,
      destination,
      destinationTarget:
        destination === "Extension_Range" ? "" : destinationTarget,
      extensionRange:
        destination === "Extension_Range" ? extensionRange.trim() : "",
      enabled,
      priority,
      enableMobilityExtension,
      sendRingTone,
      memberTrunks: [...selectedTrunks],
    });

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response =
        editId != null
          ? await updateInboundRoute(editId, apiPayload)
          : await createInboundRoute(apiPayload);
      if (!response?.response) {
        showAlert(response?.message || "Failed to save inbound route.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Inbound route updated successfully."
          : "Inbound route created successfully.",
      );
      await fetchInboundRoutes();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save inbound route.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return {
    isCompact,
    rows,
    selected,
    showModal,
    loading,
    isInitialLoad,
    editId,
    name,
    setName,
    didPattern,
    setDidPattern,
    callerIdPattern,
    setCallerIdPattern,
    distinctiveRingTone,
    setDistinctiveRingTone,
    enableT38,
    setEnableT38,
    enableTimeCondition,
    setEnableTimeCondition,
    destination,
    setDestination,
    enabled,
    setEnabled,
    priority,
    setPriority,
    enableMobilityExtension,
    setEnableMobilityExtension,
    sendRingTone,
    setSendRingTone,
    destinationTarget,
    setDestinationTarget,
    extensionRange,
    setExtensionRange,
    selectedTrunks,
    setSelectedTrunks,
    itemsPerPage,
    page,
    setPage,
    totalPages,
    pagedRows,
    message,
    setMessage,
    destinationChoices,
    needsDestinationTarget,
    allTrunkOptions,
    allPageSelected,
    somePageSelected,
    getTrunkLabel,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSelectRow,
    handleToggleAll,
    handleDelete,
    handleSave,
  };
}
