import React, { useEffect, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  createSpeedDial,
  deleteSpeedDial,
  listSpeedDials,
  updateSpeedDial,
  exportSpeedDialCsv,
  importSpeedDialCsv,
} from "../api/apiService";

const SpeedDialPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
  });

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [speedDialNumber, setSpeedDialNumber] = useState("");
  const [destination, setDestination] = useState("");

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const importFileRef = React.useRef(null);

  const itemsPerPage = 20;
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

  const showAlert = (text) => window.alert(text);

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
      showAlert(e?.message || "Export failed");
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) { showAlert("Please select a CSV file"); return; }
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
        // Success — refresh list and close if no errors
        const fresh = await listSpeedDials();
        setRows(normalizeList(fresh).map(mapFromApi));
        if (!res.validation_errors?.length && !res.runtime_errors?.length) {
          setShowImportModal(false);
          setImportFile(null);
          setImportResult(null);
        }
      }
      // Validation errors (response: false) are shown in the modal via importResult
    } catch (e) {
      showAlert(e?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const normalizeList = (raw) => {
    const list = raw?.message ?? raw?.data ?? raw;
    return Array.isArray(list) ? list : [];
  };

  const mapFromApi = (item) => ({
    id: item?.id,
    name: String(item?.name || ""),
    speedDialNumber: String(item?.speed_number || ""),
    destination: String(item?.destination || ""),
  });

  const fetchSpeedDials = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listSpeedDials();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load speed dials.");
        setRows([]);
        return;
      }
      setRows(normalizeList(res).map(mapFromApi));
    } catch (err) {
      showAlert(err?.message || "Failed to load speed dials.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  useEffect(() => {
    fetchSpeedDials();
  }, []);

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
    setEditId(row.id);
    setName(row.name || "");
    setSpeedDialNumber(row.speedDialNumber || "");
    setDestination(row.destination || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("Please select at least one row to delete.");
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected
        .map((idx) => rows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteSpeedDial(id)),
      );
      const failed = results.find((r) => !r?.response);
      if (failed)
        showAlert(
          failed?.message || "Failed to delete one or more speed dials.",
        );
      else showAlert("Speed dial(s) deleted successfully.");
      await fetchSpeedDials();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || "Failed to delete speed dial(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedSpeed = speedDialNumber.trim();
    const trimmedDest = destination.trim();

    if (!trimmedName) {
      showAlert("Name is required.");
      return;
    }
    if (!trimmedSpeed) {
      showAlert("Speed Dial Number is required.");
      return;
    }
    if (!trimmedDest) {
      showAlert("Destination is required.");
      return;
    }

    const apiPayload = {
      name: trimmedName,
      speed_number: trimmedSpeed,
      destination: trimmedDest,
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const res =
        editId != null
          ? await updateSpeedDial(editId, apiPayload)
          : await createSpeedDial(apiPayload);
      if (!res?.response) {
        showAlert(res?.message || "Failed to save speed dial.");
        return;
      }
      showAlert(
        editId != null
          ? "Speed dial updated successfully."
          : "Speed dial created successfully.",
      );
      await fetchSpeedDials();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save speed dial.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-2">

      {/* Import Modal */}
      <Dialog
        open={showImportModal}
        onClose={() => { if (!importLoading) { setShowImportModal(false); setImportFile(null); setImportResult(null); } }}
        maxWidth={false}
        PaperProps={{ sx: { width: 520, maxWidth: "96vw", mx: "auto", p: 0 } }}
      >
        <DialogTitle
          className="h-10 flex items-center justify-center font-semibold text-[19px] text-[#ffffff] shadow-sm mt-0"
          style={{ background: "linear-gradient(#3E5475 100%)", boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)" }}
        >
          Import Speed Dial
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "#f8fafc", padding: "20px 24px 12px" }}>
          <div className="flex flex-col gap-4 pt-1">
            {/* File picker */}
            <div
              className="border-2 border-dashed border-gray-400 rounded-lg p-5 text-center cursor-pointer hover:border-[#7B8FA8] hover:bg-[#EEF2F7] transition-colors"
              onClick={() => importFileRef.current?.click()}
            >
              <div className="text-gray-500 text-[13px]">
                {importFile
                  ? <span className="text-green-700 font-semibold">{importFile.name}</span>
                  : <span>Click to choose CSV file <span className="text-gray-400">(.csv)</span></span>}
              </div>
              <input ref={importFileRef} type="file" accept=".csv" className="hidden"
                onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }} />
            </div>

            {/* Result summary */}
            {importResult && (
              <div style={{ background: importResult.response ? "#f0fdf4" : "#fef2f2", border: `1px solid ${importResult.response ? "#86efac" : "#fca5a5"}`, borderRadius: 6, padding: "10px 14px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: importResult.response ? "#15803d" : "#b91c1c", marginBottom: 4 }}>
                  {importResult.response ? "Import complete" : importResult.error || "Validation failed — fix errors and retry"}
                </p>
                {/* Stats row */}
                <div style={{ fontSize: 12, color: "#374151", display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {importResult.total        != null && <span>Total: <b>{importResult.total}</b></span>}
                  {importResult.created_count != null && <span>Created: <b style={{ color: "#16a34a" }}>{importResult.created_count}</b></span>}
                  {importResult.invalid_rows  != null && importResult.invalid_rows > 0 && <span>Invalid rows: <b style={{ color: "#d97706" }}>{importResult.invalid_rows}</b></span>}
                  {importResult.would_create  != null && <span>Would create: <b style={{ color: "#16a34a" }}>{importResult.would_create}</b></span>}
                </div>
                {/* Validation error table */}
                {importResult.validation_errors?.length > 0 && (
                  <div style={{ marginTop: 8, maxHeight: 180, overflowY: "auto" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#b91c1c", marginBottom: 4 }}>
                      Validation Errors ({importResult.invalid_rows ?? importResult.validation_errors.length} row{importResult.validation_errors.length !== 1 ? "s" : ""})
                    </p>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: "#fee2e2" }}>
                          {["Row", "Speed Number", "Field", "Error"].map((h) => (
                            <th key={h} style={{ padding: "3px 6px", textAlign: "left", borderBottom: "1px solid #fca5a5", color: "#7f1d1d", fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.validation_errors.flatMap((ve, vi) =>
                          (ve.errors || []).map((err, ei) => (
                            <tr key={`${vi}-${ei}`} style={{ background: vi % 2 === 0 ? "#fff" : "#fff7f7" }}>
                              <td style={{ padding: "2px 6px", borderBottom: "1px solid #fee2e2" }}>{ve.row}</td>
                              <td style={{ padding: "2px 6px", borderBottom: "1px solid #fee2e2", fontFamily: "monospace" }}>{ve.speed_number ?? "—"}</td>
                              <td style={{ padding: "2px 6px", borderBottom: "1px solid #fee2e2", fontFamily: "monospace" }}>{err.field}</td>
                              <td style={{ padding: "2px 6px", borderBottom: "1px solid #fee2e2", color: "#b91c1c" }}>{err.error}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions style={{ backgroundColor: "#f8fafc", justifyContent: "center", gap: 16, padding: "12px 24px 16px" }}>
          <Button variant="contained" onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            startIcon={importLoading && <CircularProgress size={16} color="inherit" />}
            sx={{ background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 100%)", color: "#fff !important", fontWeight: 600, textTransform: "none", minWidth: 100,
              "&:hover": { background: "linear-gradient(to bottom, #3E5475 0%, #2f405c 100%)" },
              "&:disabled": { background: "#94a3b8", color: "#fff" } }}
          >
            {importLoading ? "Importing..." : "Import"}
          </Button>
          <Button variant="contained"
            onClick={() => { setShowImportModal(false); setImportFile(null); setImportResult(null); }}
            disabled={importLoading}
            sx={{ background: "linear-gradient(to bottom, #eef2f7 0%, #d6dde6 100%)", color: "#3E5475 !important", fontWeight: 600, textTransform: "none", minWidth: 100,
              "&:hover": { background: "linear-gradient(to bottom, #d6dde6 0%, #c2ccd9 100%)" },
              "&:disabled": { background: "#f1f5f9", color: "#94a3b8" } }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-8 flex items-center justify-between px-3 font-semibold text-[18px] text-[#ffffff] shadow-sm mt-0"
          style={{
            background: "linear-gradient(#3E5475 100%)",
            boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)",
          }}
        >
          <div className="flex-1" />
          <span>Speed Dial</span>
          <div className="flex-1 flex justify-end gap-2">
            <button
              className="cursor-pointer font-semibold text-xs rounded px-4 py-1 transition-all active:scale-95"
              style={{ background: "linear-gradient(to bottom, #FFFFFF 0%, #DCE6F2 100%)", color: "#1565c0", border: "1px solid #93c5fd", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(to bottom, #dbeafe 0%, #bfdbfe 100%)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(to bottom, #FFFFFF 0%, #DCE6F2 100%)")}
              onClick={() => { setShowImportModal(true); setImportFile(null); setImportResult(null); }}
            >
              Import
            </button>
            <button
              className="cursor-pointer font-semibold text-xs rounded px-4 py-1 transition-all active:scale-95"
              style={{ background: "linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)", color: "#1565c0", border: "1px solid #93c5fd", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(to bottom, #dbeafe 0%, #bfdbfe 100%)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(to bottom, #ffffff 0%, #dbeafe 100%)")}
              onClick={handleExport}
            >
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center"></th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">
                  #
                </th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">
                  Name
                </th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">
                  Speed Dial Number
                </th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">
                  Destination
                </th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border border-gray-300 px-2 py-4 text-center text-gray-500"
                  >
                    No speed dials yet. Click &quot;Add New&quot; to create one.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  return (
                    <tr key={row.id}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(realIdx)}
                          onChange={() => handleSelectRow(realIdx)}
                          disabled={loading.delete}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {realIdx + 1}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-medium">
                        {row.name}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.speedDialNumber}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.destination}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <EditDocumentIcon
                          className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100"
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
        </div>

        <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                loading.delete ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleCheckAll}
              disabled={loading.delete}
            >
              Check All
            </button>
            <button
              className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                loading.delete ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleUncheckAll}
              disabled={loading.delete}
            >
              Uncheck All
            </button>
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${
                loading.delete ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleDelete}
              disabled={loading.delete}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                loading.save ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleOpenAddModal}
              disabled={loading.save}
            >
              Add New
            </button>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{rows.length} items Total</span>
            <span>{itemsPerPage} Items/Page</span>
            <span>
              {page}/{totalPages}
            </span>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              First
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </button>
            <select
              className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span>{totalPages} Pages Total</span>
          </div>
        )}
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 760, maxWidth: "98vw", mx: "auto", p: 0 },
        }}
      >
        <DialogTitle
          className="h-14 flex items-center justify-center font-semibold text-[19px] text-[#ffffff] shadow-sm"
          style={{
            background: "linear-gradient(#3E5475 100%)",
            boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)",
          }}
        >
          {editId != null ? "Edit Speed Dial" : "Add Speed Dial"}
        </DialogTitle>
        <DialogContent
          className="pt-3 pb-0 px-2"
          style={{
            padding: "12px 8px 0 8px",
            backgroundColor: "#dde0e4",
            border: "1px solid #444444",
            borderTop: "none",
          }}
        >
          <div className="flex flex-col gap-3 w-full pb-2">
            <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                Speed Dial
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-y-3">
                  <div
                    className="flex items-center gap-2"
                    style={{ minHeight: 32 }}
                  >
                    <label
                      className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                      style={{ width: 190, marginRight: 10 }}
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div
                    className="flex items-center gap-2"
                    style={{ minHeight: 32 }}
                  >
                    <label
                      className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                      style={{ width: 190, marginRight: 10 }}
                    >
                      Speed Dial Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                      value={speedDialNumber}
                      inputMode="numeric"
                      onChange={(e) => setSpeedDialNumber(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>

                  <div
                    className="flex items-center gap-2"
                    style={{ minHeight: 32 }}
                  >
                    <label
                      className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                      style={{ width: 190, marginRight: 10 }}
                    >
                      Destination <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                      value={destination}
                      inputMode="tel"
                      onChange={(e) => setDestination(e.target.value.replace(/[^\d+]/g, ""))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4 justify-center gap-6">
          <Button
            variant="contained"
            sx={{
              background:
                "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: 1.5,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: "0 2px 8px rgba(62, 84, 117, 0.4)",
              textTransform: "none",

              "&:hover": {
                background:
                  "linear-gradient(to bottom, #3E5475 0%, #2f405c 100%)",
                color: "#fff",
              },

              "&:disabled": {
                background: "#cbd5e1",
                color: "#64748b",
              },
            }}
            onClick={handleSave}
            disabled={loading.save}
            startIcon={
              loading.save && <CircularProgress size={20} color="inherit" />
            }
          >
            {loading.save ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="contained"
            sx={{
              background:
                "linear-gradient(to bottom, #eef2f7 0%, #d6dde6 100%)",
              color: "#3E5475 ",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: 1.5,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: "0 2px 8px rgba(62, 84, 117, 0.4)",
              textTransform: "none",

              "&:hover": {
                background:
                  "linear-gradient(to bottom, #d6dde6 0%, #c2ccd9 100%)",
                color: "#2f405c",
              },

              "&:disabled": {
                background: "#f1f5f9",
                color: "#94a3b8",
              },
            }}
            onClick={handleCloseModal}
            disabled={loading.save}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SpeedDialPage;
