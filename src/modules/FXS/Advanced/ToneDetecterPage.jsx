import React, { useState, useEffect } from "react";
import {
  TONE_DETECTER_FIELDS,
  TONE_DETECTER_TABLE_COLUMNS,
  TONE_DETECTER_INITIAL_FORM,
} from "../../../sections/advanced/constants/ToneDetecterConstants";
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
  advancedModalContentStyle,
  advancedModalFooterStyle,
  advancedFormPanelStyle,
} from "../../../sections/advanced/advancedSharedUi";

const LOCAL_STORAGE_KEY = "toneDetectorRules";

const DATA_COLUMNS = TONE_DETECTER_TABLE_COLUMNS.filter(
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

const ToneDetecterPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(TONE_DETECTER_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRules(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Error loading tone detector data:", error);
      setRules([]);
    }
  }, []);

  // Save to localStorage whenever rules change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rules));
    } catch (error) {
      console.error("Error saving tone detector data:", error);
    }
  }, [rules]);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      // Editing existing item
      setFormData({
        ...item,
        index: item.index !== undefined ? String(item.index) : "0",
        first_mid_frequency:
          item.first_mid_frequency !== undefined
            ? String(item.first_mid_frequency)
            : "450",
        second_mid_frequency:
          item.second_mid_frequency !== undefined
            ? String(item.second_mid_frequency)
            : "0",
        duration_on_state:
          item.duration_on_state !== undefined
            ? String(item.duration_on_state)
            : "1500",
        duration_off_state:
          item.duration_off_state !== undefined
            ? String(item.duration_off_state)
            : "0",
        period_count:
          item.period_count !== undefined ? String(item.period_count) : "0",
        duration_error:
          item.duration_error !== undefined
            ? String(item.duration_error)
            : "20",
      });
      setEditIndex(index);
    } else {
      // Adding new item - set next index
      const nextIndex =
        rules.length > 0
          ? Math.max(...rules.map((r) => Number(r.index) || 0)) + 1
          : 0;
      setFormData({
        ...TONE_DETECTER_INITIAL_FORM,
        index: String(nextIndex),
      });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    // Validation
    if (!formData.tone) {
      showToast("Tone is required.", "error");
      return;
    }
    if (
      formData.first_mid_frequency === "" ||
      formData.first_mid_frequency == null
    ) {
      showToast("The 1st Mid-frequency is required.", "error");
      return;
    }
    if (formData.duration_error === "" || formData.duration_error == null) {
      showToast("Duration Error at ON/OFF State is required.", "error");
      return;
    }

    // Normalize numeric fields
    const normalized = {
      ...formData,
      index: String(formData.index || "0"),
      first_mid_frequency: String(formData.first_mid_frequency || "0"),
      second_mid_frequency: String(formData.second_mid_frequency || "0"),
      duration_on_state: String(formData.duration_on_state || "0"),
      duration_off_state: String(formData.duration_off_state || "0"),
      period_count: String(formData.period_count || "0"),
      duration_error: String(formData.duration_error || "20"),
      id: editIndex !== null ? rules[editIndex].id : Date.now(), // Use existing id or create new
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editIndex !== null) {
        // Update existing
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? normalized : rule)),
        );
        showToast("Tone parameter updated successfully!");
      } else {
        // Create new
        setRules((prev) => [...prev, normalized]);
        showToast("Tone parameter created successfully!");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving tone parameter:", error);
      showToast(error.message || "Failed to save tone parameter", "error");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "tone") {
      // When tone changes, update other fields based on tone type
      const toneDefaults = {
        "Dial Tone": {
          first_mid_frequency: "450",
          second_mid_frequency: "0",
          duration_on_state: "600",
          duration_off_state: "0",
          period_count: "0",
          duration_error: "20",
        },
        "Busy Tone": {
          first_mid_frequency: "450",
          second_mid_frequency: "0",
          duration_on_state: "350",
          duration_off_state: "350",
          period_count: "2",
          duration_error: "20",
        },
        "Ringback Tone": {
          first_mid_frequency: "450",
          second_mid_frequency: "0",
          duration_on_state: "1000",
          duration_off_state: "4000",
          period_count: "1",
          duration_error: "20",
        },
        "Fax F1": {
          first_mid_frequency: "1100",
          second_mid_frequency: "0",
          duration_on_state: "250",
          duration_off_state: "0",
          period_count: "0",
          duration_error: "20",
        },
        "Fax F2": {
          first_mid_frequency: "2100",
          second_mid_frequency: "0",
          duration_on_state: "250",
          duration_off_state: "0",
          period_count: "0",
          duration_error: "20",
        },
      };

      const defaults = toneDefaults[value] || {};
      setFormData((prev) => ({ ...prev, [name]: value, ...defaults }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
    setSelected([]);
  };

  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };

  const handleCheckAll = () => {
    const allIndices = pagedRules.map(
      (_, idx) => (page - 1) * itemsPerPage + idx,
    );
    setSelected(allIndices);
  };
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      pagedRules
        .map((_, idx) => (page - 1) * itemsPerPage + idx)
        .filter((i) => !selected.includes(i)),
    );

  const handleDelete = () => {
    if (selected.length === 0) {
      showToast("Please select at least one item to delete.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      showToast(`${selected.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Error deleting selected items:", error);
      showToast(error.message || "Failed to delete selected items", "error");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      showToast("No data to clear", "error");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL tone parameters? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showToast(`All ${rules.length} item(s) deleted successfully`);
    } catch (error) {
      console.error("Error clearing all items:", error);
      showToast(error.message || "Failed to clear all items", "error");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleRefresh = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRules(Array.isArray(parsed) ? parsed : []);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error refreshing tone detector data:", error);
    }
  };

  const pagedSelectedCount = pagedRules.filter((_, idx) =>
    selected.includes((page - 1) * itemsPerPage + idx),
  ).length;
  const allPagedChecked =
    pagedRules.length > 0 && pagedSelectedCount === pagedRules.length;

  return (
    <AdvancedPageShell fullWidth>
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
      <AdvancedBreadcrumb current="Tone Detector" />
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
                disabled={loading.delete || rules.length === 0}
                style={{ height: 30 }}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                style={{ height: 30 }}
              >
                {loading.delete ? "Deleting..." : "Delete"}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
                style={{ height: 30 }}
              >
                {loading.delete ? "Clearing..." : "Clear All"}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.save}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 10,
                }}
              >
                {loading.save ? "Saving..." : "+ Add New"}
              </Btn>
            </div>
          </div>
          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              flex: 1,
            }}
          >
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
                  No available tone detector parameter!
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
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPagedChecked}
                        indeterminate={pagedSelectedCount > 0 && !allPagedChecked}
                        onChange={(e) => {
                          if (e.target.checked) handleCheckAll();
                          else handleUncheckAll();
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
                    ? { borderBottom: `1px solid ${C.cardBorder}` }
                    : {};

                    return (
                    <tr key={realIdx} style={{ background: rowBg }}>
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
        className="z-50"
        PaperProps={{ sx: advancedModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={advancedModalTitleStyle}>
          {editIndex !== null ? "Edit Tone Parameters" : "Add Tone Parameters"}
        </DialogTitle>
        <DialogContent style={advancedModalContentStyle}>
          <div style={advancedFormPanelStyle}>
            {TONE_DETECTER_FIELDS.map((field) => (
              <FieldRow
                key={field.name}
                label={field.label}
                labelWidth={field.name === "duration_error" ? 220 : 180}
              >
                {field.type === "select" ? (
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange({
                          target: { name: field.name, value: e.target.value },
                        })
                      }
                      sx={muiSelectSx}
                    >
                      {field.options.map((opt) => (
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
                ) : (
                  <TextField
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    size="small"
                    fullWidth
                    variant="outlined"
                    sx={muiTextFieldSx}
                    inputProps={{
                      style: { fontSize: 13, padding: "6px 8px" },
                    }}
                  />
                )}
              </FieldRow>
            ))}
          </div>
        </DialogContent>
        <DialogActions style={advancedModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 34, fontSize: 13 }}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            style={{ minWidth: 100, height: 34 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </AdvancedPageShell>
  );
};

export default ToneDetecterPage;
