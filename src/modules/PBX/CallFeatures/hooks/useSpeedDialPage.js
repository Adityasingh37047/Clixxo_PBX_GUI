import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { SPEED_DIAL_ITEMS_PER_PAGE } from "../../../../constants/SpeedDialConstants";
import {
  createSpeedDial,
  deleteSpeedDial,
  exportSpeedDialCsv,
  importSpeedDialCsv,
  listSpeedDials,
  updateSpeedDial,
} from "../../../../api/apiService";
import {
  buildSpeedDialApiPayload,
  mapSpeedDialFromApi,
  normalizeSpeedDialList,
  speedDialFormFromRow,
} from "../utils/SpeedDialTransformers";
import { validateSpeedDialForm } from "../utils/SpeedDialValidators";
import { getApiErrorMessage, cleanErrorText } from "../../../../utils/getApiErrorMessage";

const SPEED_DIAL_COMPACT_MQ = "(max-width: 768px)";

export function useSpeedDialPage() {
  const isCompact = useMediaQuery(SPEED_DIAL_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const itemsPerPage = SPEED_DIAL_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [speedDialNumber, setSpeedDialNumber] = useState("");
  const [destination, setDestination] = useState("");

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const importFileRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const fetchSpeedDials = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listSpeedDials();
      if (!res?.response) {
        showMessage("error", res?.message || "Failed to load speed dials.");
        setRows([]);
        return;
      }
      setRows(normalizeSpeedDialList(res).map(mapSpeedDialFromApi));
    } catch (err) {
      showMessage("error", err?.message || "Failed to load speed dials.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchSpeedDials();
  }, []);

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

  const resetForm = () => {
    setEditId(null);
    setName("");
    setSpeedDialNumber("");
    setDestination("");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (row) => {
    const formState = speedDialFormFromRow(row);
    setEditId(formState.editId);
    setName(formState.name);
    setSpeedDialNumber(formState.speedDialNumber);
    setDestination(formState.destination);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async () => {
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
    try {
      const idsToDelete = selected
        .map((idx) => filteredRows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteSpeedDial(id)),
      );
      const failed = results.find((r) => !r?.response);
      if (failed) {
        showMessage(
          "error",
          failed?.message || "Failed to delete one or more speed dials.",
        );
      } else {
        showMessage("success", "Speed dial(s) deleted successfully.");
      }
      await fetchSpeedDials();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showMessage("error", err?.message || "Failed to delete speed dial(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const validationError = validateSpeedDialForm({
      name,
      speedDialNumber,
      destination,
    });
    if (validationError) {
      showMessage("error", validationError);
      return;
    }

    const apiPayload = buildSpeedDialApiPayload({
      name,
      speedDialNumber,
      destination,
    });

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const res =
        editId != null
          ? await updateSpeedDial(editId, apiPayload)
          : await createSpeedDial(apiPayload);

      if (!res?.response) {
        showMessage("error", cleanErrorText(res?.message, "Failed to save speed dial."));
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Speed dial updated successfully."
          : "Speed dial created successfully.",
      );
      await fetchSpeedDials();
      handleCloseModal();
    } catch (err) {
      showMessage("error", getApiErrorMessage(err, "Failed to save speed dial."));
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleExport = async () => {
    try {
      const { blob, filename } = await exportSpeedDialCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showMessage("error", e?.message || "Export failed");
    }
  };

  const handleOpenImportModal = () => {
    setImportFile(null);
    setShowImportModal(true);
    setImportResult(null);
  };

  const handleCloseImportModal = () => {
    if (!importLoading) {
      setShowImportModal(false);
      setImportFile(null);
      setImportResult(null);
    }
  };

  const handleImportFileChange = (file) => {
    setImportFile(file);
    setImportResult(null);
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      showMessage("error", "Please select a CSV file");
      return;
    }
    setImportLoading(true);
    setImportResult(null);
    try {
      const csv = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(importFile);
      });
      const res = await importSpeedDialCsv({ csv, dryRun: false });
      setImportResult(res);
      if (res?.response) {
        const fresh = await listSpeedDials();
        setRows(normalizeSpeedDialList(fresh).map(mapSpeedDialFromApi));
        if (!res.validation_errors?.length && !res.runtime_errors?.length) {
          setShowImportModal(false);
          setImportFile(null);
          setImportResult(null);
          showMessage("success", "Speed Dials imported successfully.");
        }
      }
    } catch (e) {
      showMessage("error", e?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportCancel = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportResult(null);
  };

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
    speedDialNumber,
    setSpeedDialNumber,
    destination,
    setDestination,
    showImportModal,
    importFile,
    importLoading,
    importResult,
    importFileRef,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    handleToggleAll,
    handleDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSave,
    handleExport,
    handleOpenImportModal,
    handleCloseImportModal,
    handleImportFileChange,
    handleImportSubmit,
    handleImportCancel,
  };
}
