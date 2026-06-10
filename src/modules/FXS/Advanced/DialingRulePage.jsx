import React, { useState } from "react";
import {
  DIALING_RULE_TABLE_COLUMNS,
  DIALING_RULE_INITIAL_FORM,
  DIALING_RULE_INITIAL_DATA,
} from "../../../sections/advanced/constants/DialingRuleConstants";
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
} from "../../../shared/fxsSharedUi";

const DATA_COLUMNS = DIALING_RULE_TABLE_COLUMNS.filter(
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

const DialingRulePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DIALING_RULE_INITIAL_FORM);
  const [rules, setRules] = useState(DIALING_RULE_INITIAL_DATA);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const [editIndex, setEditIndex] = useState(null);
  const [indexSelect, setIndexSelect] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const getAvailableIndices = (currentEditIndex = null) => {
    const currentIndex =
      currentEditIndex !== null && rules[currentEditIndex]
        ? rules[currentEditIndex].index
        : null;
    const usedIndices = rules
      .map((rule, idx) =>
        currentEditIndex !== null && idx === currentEditIndex
          ? null
          : rule.index,
      )
      .filter((idx) => idx !== null && idx !== undefined);
    return Array.from({ length: 100 }, (_, i) => i)
      .filter((idx) => !usedIndices.includes(idx) || idx === currentIndex)
      .map((idx) => ({ value: String(idx), label: String(idx) }));
  };

  const handleOpenModal = (item = null, idx = -1) => {
    if (item) {
      setFormData({
        index: String(item.index),
        description: item.description || "default",
        dialingRule: item.dialingRule || "",
      });
      setIndexSelect(String(item.index));
      setEditIndex(idx);
    } else {
      const available = getAvailableIndices();
      const firstAvailable = available.length > 0 ? available[0].value : "0";
      setFormData({
        ...DIALING_RULE_INITIAL_FORM,
        index: firstAvailable,
      });
      setIndexSelect(firstAvailable);
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(DIALING_RULE_INITIAL_FORM);
    setIndexSelect("");
  };

  const handleIndexSelectChange = (value) => {
    setIndexSelect(value);
    setFormData((prev) => ({ ...prev, index: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.index || formData.index === "") {
      showToast("Index is required.", "error");
      return;
    }

    const indexNum = parseInt(formData.index);
    if (isNaN(indexNum) || indexNum < 0 || indexNum > 99) {
      showToast("Index must be between 0 and 99.", "error");
      return;
    }

    if (editIndex === null) {
      if (rules.some((r) => r.index === indexNum)) {
        showToast("Index already exists. Please choose a different index.", "error");
        return;
      }
    } else {
      if (rules.some((r, idx) => idx !== editIndex && r.index === indexNum)) {
        showToast("Index already exists. Please choose a different index.", "error");
        return;
      }
    }

    if (!formData.dialingRule || formData.dialingRule.trim() === "") {
      showToast("Dialing Rule is required.", "error");
      return;
    }

    const dialingRuleRegex = /^[0-9A-Za-z.*#\[\]\-,]{1,128}$/;
    if (!dialingRuleRegex.test(formData.dialingRule)) {
      showToast(
        "The Dialing Rule can consist only of 0~9, A~Z, a-z, '.', '#', '*' and special characters like '[', ']', ',', '-'!",
        "error",
      );
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      showToast("Description is required.", "error");
      return;
    }

    const descriptionRegex = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
    if (!descriptionRegex.test(formData.description)) {
      showToast(
        "The Description cannot contain special characters like '~', '!', '&', '|' and '='!",
        "error",
      );
      return;
    }

    const normalized = {
      ...formData,
      index: indexNum,
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
    };

    try {
      if (editIndex !== null) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? normalized : rule)),
        );
        showToast("Dialing rule updated successfully!");
      } else {
        setRules((prev) => [...prev, normalized]);
        showToast("Dialing rule created successfully!");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving dialing rule:", error);
      showToast(error.message || "Failed to save dialing rule", "error");
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

  const handleUncheckAll = () => {
    setSelected([]);
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

    if (!window.confirm("Are you sure to clear all dialing rules?")) {
      return;
    }

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showToast(`All dialing rules cleared successfully`);
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
      <AdvancedBreadcrumb current="Dialing Rule" />

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
                No available dialing rule!
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
                      indeterminate={
                        pagedSelectedCount > 0 && !allPagedChecked
                      }
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
                    ? { borderBottom: "none" }
                    : {};

                  return (
                    <tr
                      key={realIdx}
                      style={{
                        background: rowBg,
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "#f1f5f9";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = rowBg;
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
          {editIndex !== null ? "Edit Dialing Rule" : "Add Dialing Rule"}
        </DialogTitle>
        <DialogContent style={addHostModalContentStyle}>
          <div style={addHostFormPanelStyle}>
            <FieldRow label="Index:">
              <FormControl size="small" fullWidth>
                <MuiSelect
                  value={indexSelect || ""}
                  onChange={(e) => handleIndexSelectChange(e.target.value)}
                  sx={muiSelectSx}
                >
                  {getAvailableIndices(editIndex).map((opt) => (
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
            <FieldRow label="Description:">
              <TextField
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                size="small"
                fullWidth
                variant="outlined"
                sx={muiTextFieldSx}
                inputProps={{
                  style: { fontSize: 13, padding: "6px 8px" },
                }}
              />
            </FieldRow>
            <FieldRow label="Dialing Rule:">
              <TextField
                name="dialingRule"
                value={formData.dialingRule || ""}
                onChange={handleInputChange}
                size="small"
                fullWidth
                variant="outlined"
                sx={muiTextFieldSx}
                inputProps={{
                  style: { fontSize: 13, padding: "6px 8px" },
                }}
              />
            </FieldRow>
          </div>
        </DialogContent>
        <DialogActions style={addHostModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
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

export default DialingRulePage;
