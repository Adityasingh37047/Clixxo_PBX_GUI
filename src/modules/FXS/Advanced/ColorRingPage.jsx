import React, { useState, useRef } from "react";
import {
  COLOR_RING_TABLE_COLUMNS,
  COLOR_RING_INDEX_OPTIONS,
  COLOR_RING_INITIAL_FORM,
} from "../../../sections/advanced/constants/ColorRingConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
} from "@mui/material";
import {
  C,
  Btn,
  TH,
  muiSelectSx,
  muiTextFieldSx,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
  tdStyle,
  AdvancedBreadcrumb,
  AdvancedPageShell,
  FieldRow,
  advancedModalPaperSx,
  advancedModalTitleStyle,
  addHostModalContentStyle,
  addHostFormPanelStyle,
  addHostModalFooterStyle,
  wavFileNoteStyle,
} from "../../../shared/fxsSharedUi";

const DATA_COLUMNS = COLOR_RING_TABLE_COLUMNS.filter(
  (c) => c.key !== "check" && c.key !== "modify",
);

const PCM_TRUNK_GROUP_TH_GAP = { padding: "8px 14px" };
const PCM_TRUNK_GROUP_TD_GAP = { padding: "6px 14px", lineHeight: 1.2 };
const PCM_TRUNK_GROUP_CHECKBOX_SX = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const ColorRingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(COLOR_RING_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [fileName, setFileName] = useState("No file chosen");
  const [editIndex, setEditIndex] = useState(null);
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const itemsPerPage = 20;
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handleOpenModal = (item = null, idx = -1) => {
    if (item) {
      setFormData({
        index: String(item.index),
        description: item.description || "default",
        file: null,
      });
      setFileName(item.fileName || "No file chosen");
      setEditIndex(idx);
    } else {
      setFormData(COLOR_RING_INITIAL_FORM);
      setFileName("No file chosen");
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(COLOR_RING_INITIAL_FORM);
    setFileName("No file chosen");
  };

  const handleReturn = () => {
    handleCloseModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData((prev) => ({ ...prev, file }));
    } else {
      setFileName("No file chosen");
      setFormData((prev) => ({ ...prev, file: null }));
    }
  };

  const checkFileExt = (ext) => {
    if (!ext.match(/.wav/i)) {
      return false;
    }
    return true;
  };

  const handleUpload = () => {
    if (!formData.description || formData.description.trim() === "") {
      showToast("Please enter a description!", "error");
      return;
    }

    const descriptionRegex = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
    if (!descriptionRegex.test(formData.description)) {
      showToast(
        "The description cannot contain special characters like '~', '!', '&', '|' and '='!",
        "error",
      );
      return;
    }

    if (!formData.file) {
      showToast("Please select a file to upload!", "error");
      return;
    }

    const fileExt = formData.file.name
      .substring(formData.file.name.lastIndexOf("."))
      .toLowerCase();
    if (!checkFileExt(fileExt)) {
      showToast("Only wav files can be uploaded!", "error");
      return;
    }

    if (formData.file.size > 200 * 1024) {
      showToast("The size of the file must be less than 200KB!", "error");
      return;
    }

    const newItem = {
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
      index: parseInt(formData.index),
      description: formData.description.trim(),
      fileName: formData.file.name,
      file: formData.file,
    };

    try {
      if (editIndex !== null) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? newItem : rule)),
        );
        showToast("Color ring updated successfully!");
      } else {
        setRules((prev) => [...prev, newItem]);
        showToast("Color ring uploaded successfully!");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving color ring:", error);
      showToast(error.message || "Failed to save color ring", "error");
    }
  };

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((prev) =>
      prev.includes(realIdx)
        ? prev.filter((i) => i !== realIdx)
        : [...prev, realIdx],
    );
  };

  const handleCheckAll = () => {
    const allIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected(allIndices);
  };

  const handleInverse = () => {
    const allIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected((prev) => allIndices.filter((idx) => !prev.includes(idx)));
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      showToast("Please select at least one item to delete.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    try {
      setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      if (page > Math.ceil((rules.length - selected.length) / itemsPerPage)) {
        setPage(
          Math.max(
            1,
            Math.ceil((rules.length - selected.length) / itemsPerPage),
          ),
        );
      }
      showToast(`${selected.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Error deleting selected items:", error);
      showToast(error.message || "Failed to delete selected items", "error");
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      showToast("No data to clear", "error");
      return;
    }

    if (!window.confirm("Are you sure to clear all color rings?")) {
      return;
    }

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showToast(`All color rings cleared successfully`);
    } catch (error) {
      console.error("Error clearing all items:", error);
      showToast(error.message || "Failed to clear all items", "error");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setSelected([]);
    }
  };

  const pagedSelectedCount = pagedRules.filter((_, idx) =>
    selected.includes((page - 1) * itemsPerPage + idx),
  ).length;
  const allPagedChecked =
    pagedRules.length > 0 && pagedSelectedCount === pagedRules.length;

  return (
    <AdvancedPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <AdvancedBreadcrumb current="Color Ring" />

      <div style={numManipulateCardStyle}>
          <div style={numManipulateToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
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
                variant="cancel"
                onClick={handleInverse}
                disabled={rules.length === 0}
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0}
                style={{ height: 30 }}
              >
                Delete
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={rules.length === 0}
                style={{ height: 30 }}
              >
                Clear All
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
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

          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {rules.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 240,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#3E5475",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No available color ring!
                </div>
                <Btn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New
                </Btn>
              </div>
            ) : (
              <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  <TH
                    style={{
                      width: 40,
                      padding: 0,
                      borderLeft: "none",
                      ...PCM_TRUNK_GROUP_TH_GAP,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={allPagedChecked}
                      indeterminate={pagedSelectedCount > 0 && !allPagedChecked}
                      onChange={(e) => {
                        if (e.target.checked) handleCheckAll();
                        else setSelected([]);
                      }}
                      sx={PCM_TRUNK_GROUP_CHECKBOX_SX}
                    />
                  </TH>
                  {DATA_COLUMNS.map((col) => (
                    <TH key={col.key} style={PCM_TRUNK_GROUP_TH_GAP}>
                      {col.label}
                    </TH>
                  ))}
                  <TH
                    style={{
                      width: 70,
                      borderRight: "none",
                      ...PCM_TRUNK_GROUP_TH_GAP,
                    }}
                  >
                    Modify
                  </TH>
                </tr>
              </thead>
              <tbody>
                {pagedRules.map((item, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  const isSelected = selected.includes(realIdx);
                  const isLastRow = idx === pagedRules.length - 1;
                  const rowBg = isSelected
                    ? "#f0f9ff"
                    : idx % 2 === 1
                      ? "#f8fafc"
                      : "#ffffff";
                  const lastRowCellStyle = isLastRow
                    ? { borderBottom: "none" }
                    : {};

                  return (
                    <tr
                      key={realIdx}
                      style={{
                        background: rowBg,
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td
                        style={{
                          ...tdStyle,
                          ...PCM_TRUNK_GROUP_TD_GAP,
                          background: rowBg,
                          borderLeft: "none",
                          width: 36,
                          ...lastRowCellStyle,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => handleSelectRow(idx)}
                          sx={PCM_TRUNK_GROUP_CHECKBOX_SX}
                        />
                      </td>
                      {DATA_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            ...tdStyle,
                            ...PCM_TRUNK_GROUP_TD_GAP,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {item[col.key]}
                        </td>
                      ))}
                      <td
                        style={{
                          ...tdStyle,
                          ...PCM_TRUNK_GROUP_TD_GAP,
                          background: rowBg,
                          borderRight: "none",
                          ...lastRowCellStyle,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            style={{
                              cursor: "pointer",
                              color: "#2563eb",
                              fontSize: 22,
                              opacity: 0.7,
                              transition: "opacity 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "0.7";
                            }}
                            onClick={() => handleOpenModal(item, realIdx)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>

          {rules.length > 0 && (
            <div style={numManipulatePaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRules.length} record
                {pagedRules.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
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
                    border: `1px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: advancedModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={advancedModalTitleStyle}>
          Color Ring-Upload
        </DialogTitle>
        <DialogContent style={addHostModalContentStyle}>
          <div style={addHostFormPanelStyle}>
            <FieldRow label="Index">
              <FormControl size="small" fullWidth>
                <MuiSelect
                  value={formData.index}
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "index", value: e.target.value },
                    })
                  }
                  sx={muiSelectSx}
                >
                  {COLOR_RING_INDEX_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      sx={{ fontSize: 13 }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </FieldRow>
            <FieldRow label="Description">
              <TextField
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                size="small"
                fullWidth
                variant="outlined"
                sx={muiTextFieldSx}
                inputProps={{
                  maxLength: 23,
                  style: { fontSize: 13, padding: "6px 8px" },
                }}
              />
            </FieldRow>
            <FieldRow label="Color Ring" align="flex-start">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  width: "100%",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <Btn
                  variant="cancel"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ height: 30, fontSize: 12 }}
                >
                  Choose file
                </Btn>
                <span style={{ fontSize: 13, color: C.mutedText }}>
                  {fileName}
                </span>
              </div>
            </FieldRow>
            <p style={{ ...wavFileNoteStyle, color: "#dc2626" }}>
              Note: The file should be a wav file with 8000Hz sampling rate, 16-bit mono, A-law formatted, and less than 200KB in size.
            </p>
          </div>
        </DialogContent>
        <DialogActions style={addHostModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleUpload}
            style={{ minWidth: 100, height: 34, fontSize: 13 }}
          >
            Upload
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleReturn}
            style={{ minWidth: 100, height: 34 }}
          >
            Return
          </Btn>
        </DialogActions>
      </Dialog>
    </AdvancedPageShell>
  );
};

export default ColorRingPage;
