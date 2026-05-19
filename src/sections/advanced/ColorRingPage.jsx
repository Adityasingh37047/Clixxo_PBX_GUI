import React, { useState, useRef, useEffect } from "react";
import {
  COLOR_RING_TABLE_COLUMNS,
  COLOR_RING_INDEX_OPTIONS,
  COLOR_RING_INITIAL_FORM,
} from "./constants/ColorRingConstants"; // Adjust path if needed
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Button,
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

// ── Color Palette (CDR / PBX Admin Theme) ───────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  amber: "#d97706",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
}) => {
  const variants = {
    default: {
      background: "#1e2d42",
      color: "#fff",
      border: "1px solid #162233",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children, required, align = "center" }) => (
  <div style={{ display: "flex", alignItems: align, gap: 12, minHeight: 32 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 120,
        flexShrink: 0,
        paddingTop: align === "flex-start" ? 8 : 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const ColorRingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(COLOR_RING_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [fileName, setFileName] = useState("No file chosen");
  const [editIndex, setEditIndex] = useState(null);

  const [message, setMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(rules.length / itemsPerPage));
  const pagedRules = rules.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

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
    if (!ext.match(/.wav/i)) return false;
    return true;
  };

  const handleUpload = () => {
    if (!formData.description || formData.description.trim() === "") {
      showMessage("error", "Please enter a description!");
      return;
    }

    const descriptionRegex = /^[^\%\&\~\!\|\(\)\;\"\'\=\\]*$/;
    if (!descriptionRegex.test(formData.description)) {
      showMessage(
        "error",
        "The description cannot contain special characters like '~', '!', '&', '|' and '='!",
      );
      return;
    }

    if (!formData.file && editIndex === null) {
      showMessage("error", "Please select a file to upload!");
      return;
    }

    if (formData.file) {
      const fileExt = formData.file.name
        .substring(formData.file.name.lastIndexOf("."))
        .toLowerCase();
      if (!checkFileExt(fileExt)) {
        showMessage("error", "Only wav files can be uploaded!");
        return;
      }
      if (formData.file.size > 200 * 1024) {
        showMessage("error", "The size of the file must be less than 200KB!");
        return;
      }
    }

    const newItem = {
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
      index: parseInt(formData.index),
      description: formData.description.trim(),
      fileName: formData.file
        ? formData.file.name
        : editIndex !== null
          ? rules[editIndex].fileName
          : "",
      file: formData.file,
    };

    try {
      if (editIndex !== null) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? newItem : rule)),
        );
        showMessage("success", "Color ring updated successfully!");
      } else {
        setRules((prev) => [...prev, newItem]);
        showMessage("success", "Color ring uploaded successfully!");
      }
      handleCloseModal();
    } catch (error) {
      showMessage("error", error.message || "Failed to save color ring");
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

    if (!window.confirm("Are you sure to clear all color rings?")) return;

    try {
      setRules([]);
      setSelected([]);
      setPage(1);
      showMessage("success", `All color rings cleared successfully`);
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
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
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

        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            FXS &rsaquo; Advanced &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Color Ring
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
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
                style={{ fontSize: 14, color: C.mutedText, marginBottom: 16 }}
              >
                No available color ring!
              </div>
              <Btn onClick={() => handleOpenModal()} variant="accent">
                + Upload New Color Ring
              </Btn>
            </div>
          ) : (
            <>
              {/* Toolbar - Placed on Top like ExtensionGroups */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: `1px solid ${C.cardBorder}`,
                  background: "#DCE6F2",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {/* Left Toolbar Info */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      background: "#f1f5f9",
                      border: `0.5px solid ${C.cardBorder}`,
                      color: "#475569",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 12px",
                      borderRadius: 20,
                    }}
                  >
                    Page {page} · {rules.length} items total
                  </span>
                  {selected.length > 0 && (
                    <span
                      style={{
                        background: "#e0f2fe",
                        color: C.accent,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 20,
                        border: `0.5px solid ${C.accent}`,
                      }}
                    >
                      {selected.length} selected
                    </span>
                  )}
                </div>

                {/* Right Toolbar Actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <Btn
                    onClick={handleCheckAll}
                    variant="outline"
                    style={{ fontSize: 10, padding: "4px 8px" }}
                  >
                    Check All
                  </Btn>
                  <Btn
                    onClick={handleUncheckAll}
                    variant="outline"
                    style={{ fontSize: 10, padding: "4px 8px" }}
                  >
                    Uncheck All
                  </Btn>
                  <Btn
                    onClick={handleInverse}
                    variant="outline"
                    style={{ fontSize: 10, padding: "4px 8px" }}
                  >
                    Inverse
                  </Btn>

                  <Btn
                    onClick={handleDelete}
                    disabled={selected.length === 0}
                    variant="danger"
                  >
                    🗑 Delete
                  </Btn>
                  <Btn
                    onClick={handleClearAll}
                    disabled={rules.length === 0}
                    variant="danger"
                  >
                    🗑 Clear All
                  </Btn>
                  <Btn onClick={() => handleOpenModal()} variant="accent">
                    + Upload
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
                        {COLOR_RING_TABLE_COLUMNS.map((c) => (
                          <TH key={c.key}>{c.label}</TH>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const rowBgColor = isSelected
                          ? "#f0f9ff"
                          : idx % 2 === 1
                            ? "#f8fafc"
                            : "#ffffff";

                        return (
                          <tr
                            key={realIdx}
                            style={{
                              background: rowBgColor,
                              borderBottom: "0.5px solid #9ca3af",
                              transition: "background 0.1s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = "#f0f9ff";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = rowBgColor;
                            }}
                          >
                            <td
                              style={{
                                textAlign: "center",
                                padding: "4px 0",
                                borderRight: "0.5px solid #edf2f7",
                              }}
                            >
                              <EditDocumentIcon
                                style={{
                                  cursor: "pointer",
                                  color: "#0284c7",
                                  fontSize: 18,
                                  margin: "0 auto",
                                  opacity: 0.8,
                                }}
                                onClick={() => handleOpenModal(item, realIdx)}
                              />
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "4px 0",
                                borderRight: "0.5px solid #edf2f7",
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => handleSelectRow(idx)}
                                sx={{
                                  padding: "1px",
                                  color: C.accent,
                                  "&.Mui-checked": { color: C.accent },
                                }}
                              />
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "7px 16px",
                                fontSize: 12,
                                color: C.valueText,
                                borderRight: "0.5px solid #edf2f7",
                              }}
                            >
                              {item.index}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "7px 16px",
                                fontSize: 12,
                                color: C.valueText,
                                borderRight: "0.5px solid #edf2f7",
                              }}
                            >
                              {item.description}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "7px 16px",
                                fontSize: 12,
                                fontFamily: "monospace",
                                color: C.mutedText,
                              }}
                            >
                              {item.fileName}
                            </td>
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
        PaperProps={{ sx: { width: 560, maxWidth: "95vw", borderRadius: 2 } }}
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
          {editIndex !== null ? "Edit Color Ring" : "Upload Color Ring"}
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
                    name="index"
                    value={formData.index}
                    onChange={(e) => handleInputChange(e)}
                    sx={{ fontSize: 13 }}
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

              <FieldRow label="Description" required>
                <TextField
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  inputProps={{
                    maxLength: 23,
                    style: { fontSize: 13, padding: "6px 8px" },
                  }}
                />
              </FieldRow>

              <FieldRow label="Color Ring" required>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".wav"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <Btn
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Choose File
                  </Btn>
                  <span
                    style={{
                      fontSize: 12,
                      color: C.mutedText,
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fileName}
                  </span>
                </div>
              </FieldRow>

              <div style={{ fontSize: 11, color: C.mutedText, marginTop: 16 }}>
                Note: The file should be a wav file with 8000Hz sampling rate,
                16-bit mono, A-law formatted, and less than 200KB in size.
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
          <Button
            onClick={handleUpload}
            variant="contained"
            sx={{
              background: "#1e2d42",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 24px",
              minWidth: 120,
              "&:hover": { background: "#0f172a" },
            }}
          >
            {editIndex !== null ? "Update" : "Upload"}
          </Button>
          <Button
            onClick={handleReturn}
            variant="outlined"
            sx={{
              color: "#1e293b",
              borderColor: "#9ca3af",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 24px",
              minWidth: 100,
              "&:hover": { borderColor: "#1e293b", background: "#f8fafc" },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ColorRingPage;
