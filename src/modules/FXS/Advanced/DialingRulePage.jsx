import React, { useState, useRef, useEffect } from "react";
import {
  DIALING_RULE_TABLE_COLUMNS,
  DIALING_RULE_INITIAL_FORM,
  DIALING_RULE_INITIAL_DATA,
} from "../../../sections/advanced/constants/DialingRuleConstants"; // Adjust path if needed
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Checkbox,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  C,
  Btn,
  TH,
  checkboxSx,
  muiSelectSx,
  muiTextFieldSx,
  numManipulateCardStyle,
  numManipulateToolbarStyle,
  numManipulatePaginationStyle,
  AdvancedBreadcrumb,
  FieldRow,
  SectionHeading,
  advancedPageWrapStyle,
  advancedPageInnerStyle,
  routeTdStyle,
  routeThExtra,
} from "../../../sections/advanced/advancedSharedUi";

const DialingRulePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DIALING_RULE_INITIAL_FORM);
  const [rules, setRules] = useState(DIALING_RULE_INITIAL_DATA);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState({ type: "", text: "" });

  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const [editIndex, setEditIndex] = useState(null);
  const [indexSelect, setIndexSelect] = useState("");

  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    left: 0,
    width: 0,
    scrollWidth: 0,
  });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Get available indices for dropdown (0-99 excluding used ones, but include current edit index)
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
      showMessage("error", "Index is required.");
      return;
    }

    const indexNum = parseInt(formData.index);
    if (isNaN(indexNum) || indexNum < 0 || indexNum > 99) {
      showMessage("error", "Index must be between 0 and 99.");
      return;
    }

    if (editIndex === null) {
      if (rules.some((r) => r.index === indexNum)) {
        showMessage(
          "error",
          "Index already exists. Please choose a different index.",
        );
        return;
      }
    } else {
      if (rules.some((r, idx) => idx !== editIndex && r.index === indexNum)) {
        showMessage(
          "error",
          "Index already exists. Please choose a different index.",
        );
        return;
      }
    }

    if (!formData.dialingRule || formData.dialingRule.trim() === "") {
      showMessage("error", "Dialing Rule is required.");
      return;
    }

    const dialingRuleRegex = /^[0-9A-Za-z.*#\[\]\-,]{1,128}$/;
    if (!dialingRuleRegex.test(formData.dialingRule)) {
      showMessage(
        "error",
        "The Dialing Rule can consist only of 0~9, A~Z, a-z, '.', '#', '*' and special characters like '[', ']', ',', '-'!",
      );
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      showMessage("error", "Description is required.");
      return;
    }

    const descriptionRegex = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
    if (!descriptionRegex.test(formData.description)) {
      showMessage(
        "error",
        "The Description cannot contain special characters like '~', '!', '&', '|' and '='!",
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
        showMessage("success", "Dialing rule updated successfully!");
      } else {
        setRules((prev) => [...prev, normalized]);
        showMessage("success", "Dialing rule created successfully!");
      }
      handleCloseModal();
    } catch (error) {
      showMessage("error", error.message || "Failed to save dialing rule");
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
      showMessage("error", "Please select at least one item to delete.");
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
      showMessage("success", `${selected.length} item(s) deleted successfully`);
    } catch (error) {
      showMessage("error", error.message || "Failed to delete selected items");
    }
  };

  const handleClearAll = () => {
    if (rules.length === 0) {
      showMessage("error", "No data to clear");
      return;
    }

    if (!window.confirm("Are you sure to clear all dialing rules?")) return;

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showMessage("success", `All dialing rules cleared successfully`);
    } catch (error) {
      showMessage("error", error.message || "Failed to clear all items");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      setSelected([]);
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
    const update = () => {
      if (tableScrollRef.current) {
        const el = tableScrollRef.current;
        setScrollState({
          left: el.scrollLeft,
          width: el.clientWidth,
          scrollWidth: el.scrollWidth,
        });
        setShowCustomScrollbar(el.scrollWidth > el.clientWidth);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [rules, page]);

  const thumbWidth =
    scrollState.width && scrollState.scrollWidth
      ? Math.max(
          40,
          (scrollState.width / scrollState.scrollWidth) *
            (scrollState.width - 8),
        )
      : 40;
  const thumbLeft =
    scrollState.width &&
    scrollState.scrollWidth &&
    scrollState.scrollWidth > scrollState.width
      ? (scrollState.left / (scrollState.scrollWidth - scrollState.width)) *
        (scrollState.width - thumbWidth - 16)
      : 0;

  return (
    <div style={advancedPageWrapStyle}>
      <div style={advancedPageInnerStyle}>
        {/* Error / Success Banner */}
        {message.text && (
          <div
            style={{
              background:
                message.type === "error"
                  ? "#fef2f2"
                  : message.type === "success"
                    ? "#f0fdf4"
                    : "#eff6ff",
              borderLeft: `3px solid ${message.type === "error" ? "#f87171" : message.type === "success" ? "#4ade80" : "#60a5fa"}`,
              color:
                message.type === "error"
                  ? "#b91c1c"
                  : message.type === "success"
                    ? "#166534"
                    : "#1e40af",
              padding: "10px 14px",
              borderRadius: 6,
              marginBottom: 12,
              fontSize: 13,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{message.text}</span>
            <span
              onClick={() => setMessage({ type: "", text: "" })}
              style={{ cursor: "pointer", fontSize: 16 }}
            >
              ✕
            </span>
          </div>
        )}

        <AdvancedBreadcrumb current="Dialing Rule" />

        <div style={{ ...numManipulateCardStyle, display: "flex", flexDirection: "column" }}>
          {rules.length === 0 ? (
            // Empty State
            <div
              style={{
                padding: "60px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
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
            <>
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
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
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

              {/* Table */}
              <div>
                <div
                  ref={tableScrollRef}
                  onScroll={handleTableScroll}
                  style={{
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: 400,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      tableLayout: "auto",
                      minWidth: 800,
                    }}
                  >
                    <thead>
                      <tr>
                        {DIALING_RULE_TABLE_COLUMNS.map((col) => {
                          if (col.key === "check") {
                            return (
                              <TH
                                key={col.key}
                                style={{
                                  width: 40,
                                  padding: 0,
                                  ...routeThExtra,
                                }}
                              >
                                <Checkbox
                                  size="small"
                                  checked={
                                    rules.length > 0 &&
                                    selected.length === rules.length
                                  }
                                  indeterminate={
                                    selected.length > 0 &&
                                    selected.length < rules.length
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) handleCheckAll();
                                    else handleUncheckAll();
                                  }}
                                  sx={checkboxSx}
                                />
                              </TH>
                            );
                          }
                          if (col.key === "modify") {
                            return (
                              <TH
                                key={col.key}
                                style={{
                                  width: 70,
                                  borderRight: "none",
                                  ...routeThExtra,
                                }}
                              >
                                {col.label}
                              </TH>
                            );
                          }
                          return (
                            <TH key={col.key} style={routeThExtra}>
                              {col.label}
                            </TH>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const rowBg = isSelected
                          ? "#f0f9ff"
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
                              if (!isSelected)
                                e.currentTarget.style.background = "#f1f5f9";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = rowBg;
                            }}
                          >
                            {DIALING_RULE_TABLE_COLUMNS.map((col) => {
                              if (col.key === "check") {
                                return (
                                  <td
                                    key={col.key}
                                    style={{
                                      ...routeTdStyle,
                                      background: rowBg,
                                      width: 36,
                                    }}
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={isSelected}
                                      onChange={() => handleSelectRow(idx)}
                                      sx={checkboxSx}
                                    />
                                  </td>
                                );
                              }
                              if (col.key === "modify") {
                                return (
                                  <td
                                    key={col.key}
                                    style={{
                                      ...routeTdStyle,
                                      background: rowBg,
                                      borderRight: "none",
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
                                        onClick={() =>
                                          handleOpenModal(item, realIdx)
                                        }
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.opacity = "1";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.opacity = "0.7";
                                        }}
                                      />
                                    </div>
                                  </td>
                                );
                              }
                              return (
                                <td
                                  key={col.key}
                                  style={{
                                    ...routeTdStyle,
                                    background: rowBg,
                                    fontFamily:
                                      col.key === "dialingRule"
                                        ? "monospace"
                                        : undefined,
                                    color:
                                      col.key === "description"
                                        ? C.mutedText
                                        : C.valueText,
                                  }}
                                >
                                  {item[col.key]}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Custom scrollbar row below the table */}
                {showCustomScrollbar && (
                  <div
                    style={{
                      width: "100%",
                      background: "#f4f6fa",
                      display: "flex",
                      alignItems: "center",
                      height: 24,
                      padding: "0 4px",
                      borderBottom: `1px solid ${C.cardBorder}`,
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        background: "#e3e7ef",
                        border: "1px solid #bbb",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        color: "#888",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleArrowClick("left")}
                    >
                      &#9664;
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 12,
                        background: "#e3e7ef",
                        borderRadius: 8,
                        position: "relative",
                        margin: "0 4px",
                        overflow: "hidden",
                      }}
                      onClick={handleScrollbarDrag}
                    >
                      <div
                        style={{
                          position: "absolute",
                          height: 12,
                          background: "#888",
                          borderRadius: 8,
                          cursor: "pointer",
                          top: 0,
                          width: thumbWidth,
                          left: thumbLeft,
                        }}
                        draggable
                        onDrag={handleScrollbarDrag}
                      />
                    </div>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        background: "#e3e7ef",
                        border: "1px solid #bbb",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        color: "#888",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => handleArrowClick("right")}
                    >
                      &#9654;
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Footer Pagination */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderTop: `0.5px solid ${C.cardBorder}`,
                  background: "#f8fafc",
                }}
              >
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedRules.length} items ({itemsPerPage}/page)
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Btn
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    variant="outline"
                  >
                    First
                  </Btn>
                  <Btn
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    variant="outline"
                  >
                    Prev
                  </Btn>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.accent,
                      background: "#e0f2fe",
                      padding: "5px 14px",
                      borderRadius: 6,
                      border: `0.5px solid ${C.accent}`,
                    }}
                  >
                    {page} / {totalPages}
                  </span>
                  <Btn
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    variant="outline"
                  >
                    Next
                  </Btn>
                  <Btn
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages}
                    variant="outline"
                  >
                    Last
                  </Btn>
                  <select
                    style={{
                      fontSize: 11,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 4,
                      padding: "4px 8px",
                      outline: "none",
                      background: "#fff",
                    }}
                    value={page}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                  >
                    {Array.from({ length: totalPages }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        disableRestoreFocus
        disableEnforceFocus
        PaperProps={{ sx: { width: 500, maxWidth: "95vw", borderRadius: 2 } }}
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
          {editIndex !== null ? "Edit Dialing Rule" : "Add Dialing Rule"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: "20px 24px 16px",
              }}
            >
              <SectionHeading title="General Settings" />

              <FieldRow label="Index" required>
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={indexSelect || ""}
                    onChange={(e) => handleIndexSelectChange(e.target.value)}
                    sx={{ fontSize: 13 }}
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

              <FieldRow label="Description" required>
                <TextField
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
              </FieldRow>

              <FieldRow label="Dialing Rule" required>
                <TextField
                  name="dialingRule"
                  value={formData.dialingRule || ""}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                />
              </FieldRow>
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
            style={{ minWidth: 120, height: 36, fontSize: 14 }}
          >
            {editIndex !== null ? "Update" : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="cancel"
            style={{ minWidth: 120, height: 36, fontSize: 14 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DialingRulePage;
