import React, { useState, useRef, useEffect } from "react";
import {
  TONE_DETECTER_FIELDS,
  TONE_DETECTER_TABLE_COLUMNS,
  TONE_DETECTER_INITIAL_FORM,
} from "./constants/ToneDetecterConstants"; // Adjust path
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
  CircularProgress,
  Checkbox,
} from "@mui/material";

const LOCAL_STORAGE_KEY = "toneDetectorRules";

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
        width: 220,
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

const ToneDetecterPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(TONE_DETECTER_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRules(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      setRules([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rules));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [rules]);

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
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
      const nextIndex =
        rules.length > 0
          ? Math.max(...rules.map((r) => Number(r.index) || 0)) + 1
          : 0;
      setFormData({ ...TONE_DETECTER_INITIAL_FORM, index: String(nextIndex) });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    if (!formData.tone) return showMessage("error", "Tone is required.");
    if (!formData.first_mid_frequency)
      return showMessage("error", "The 1st Mid-frequency is required.");
    if (!formData.duration_error)
      return showMessage("error", "Duration Error is required.");

    const normalized = {
      ...formData,
      index: String(formData.index || "0"),
      first_mid_frequency: String(formData.first_mid_frequency || "0"),
      second_mid_frequency: String(formData.second_mid_frequency || "0"),
      duration_on_state: String(formData.duration_on_state || "0"),
      duration_off_state: String(formData.duration_off_state || "0"),
      period_count: String(formData.period_count || "0"),
      duration_error: String(formData.duration_error || "20"),
      id: editIndex !== null ? rules[editIndex].id : Date.now(),
    };

    setLoading((p) => ({ ...p, save: true }));
    try {
      if (editIndex !== null) {
        setRules((prev) =>
          prev.map((rule, idx) => (idx === editIndex ? normalized : rule)),
        );
        showMessage("success", "Tone parameter updated successfully!");
      } else {
        setRules((prev) => [...prev, normalized]);
        showMessage("success", "Tone parameter created successfully!");
      }
      handleCloseModal();
    } catch (err) {
      showMessage("error", "Failed to save.");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "tone") {
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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(toneDefaults[value] || {}),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePageChange = (newPage) =>
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  const handleSelectRow = (idx) => {
    const realIdx = (page - 1) * itemsPerPage + idx;
    setSelected((sel) =>
      sel.includes(realIdx)
        ? sel.filter((i) => i !== realIdx)
        : [...sel, realIdx],
    );
  };
  const handleCheckAll = () => setSelected(rules.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      rules.map((_, idx) => idx).filter((i) => !selected.includes(i)),
    );

  const handleDelete = () => {
    if (selected.length === 0)
      return showMessage("error", "Please select items to delete");
    if (!window.confirm(`Delete ${selected.length} item(s)?`)) return;
    setLoading((p) => ({ ...p, delete: true }));
    setRules((prev) => prev.filter((_, idx) => !selected.includes(idx)));
    setSelected([]);
    showMessage("success", "Deleted successfully");
    setLoading((p) => ({ ...p, delete: false }));
  };

  const handleClearAll = () => {
    if (rules.length === 0) return showMessage("error", "No data to clear");
    if (!window.confirm("Delete ALL tone parameters?")) return;
    setLoading((p) => ({ ...p, delete: true }));
    setRules([]);
    setSelected([]);
    setPage(1);
    showMessage("success", "Cleared all successfully");
    setLoading((p) => ({ ...p, delete: false }));
  };

  const handleRefresh = () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    setRules(stored ? JSON.parse(stored) : []);
    showMessage("success", "Data Refreshed");
  };

  const handleTableScroll = (e) =>
    setScrollState({
      left: e.target.scrollLeft,
      width: e.target.clientWidth,
      scrollWidth: e.target.scrollWidth,
    });
  const handleArrowClick = (dir) => {
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft += dir === "left" ? -100 : 100;
  };
  const handleScrollbarDrag = (e) => {
    const track = e.target.parentNode;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft =
        (scrollState.scrollWidth - scrollState.width) * percent;
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
        {/* Banner */}
        {message.text && (
          <div
            style={{
              background: message.type === "error" ? "#fef2f2" : "#f0fdf4",
              borderLeft: `3px solid ${message.type === "error" ? "#f87171" : "#4ade80"}`,
              color: message.type === "error" ? "#b91c1c" : "#166534",
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
              Tone Detector
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
                No available tone detector parameter!
              </div>
              <Btn onClick={() => handleOpenModal()} variant="accent">
                + Add New
              </Btn>
            </div>
          ) : (
            <>
              {/* Toolbar */}
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
                    Page {page} · {rules.length} items
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Btn
                    onClick={handleCheckAll}
                    variant="outline"
                    style={{ fontSize: 10 }}
                  >
                    Check All
                  </Btn>
                  <Btn
                    onClick={handleUncheckAll}
                    variant="outline"
                    style={{ fontSize: 10 }}
                  >
                    Uncheck All
                  </Btn>
                  <Btn
                    onClick={handleInverse}
                    variant="outline"
                    style={{ fontSize: 10 }}
                  >
                    Inverse
                  </Btn>
                  <Btn
                    onClick={handleDelete}
                    variant="danger"
                    disabled={selected.length === 0}
                  >
                    Delete
                  </Btn>
                  <Btn
                    onClick={handleClearAll}
                    variant="danger"
                    disabled={rules.length === 0}
                  >
                    Clear All
                  </Btn>
                  <Btn onClick={handleRefresh} variant="outline">
                    Refresh
                  </Btn>
                  <Btn onClick={() => handleOpenModal()} variant="accent">
                    + Add New
                  </Btn>
                </div>
              </div>

              {/* Table */}
              <div
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: 400,
                  scrollbarWidth: "none",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "auto",
                    minWidth: 1400,
                  }}
                >
                  <thead>
                    <tr>
                      <TH style={{ width: 50 }}>Edit</TH>
                      <TH style={{ width: 50 }}>Select</TH>
                      {TONE_DETECTER_TABLE_COLUMNS.map((c) => (
                        <TH key={c.key}>{c.label}</TH>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRules.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      return (
                        <tr
                          key={realIdx}
                          style={{
                            background: isSelected
                              ? "#f0f9ff"
                              : idx % 2 === 1
                                ? "#f8fafc"
                                : "#fff",
                            borderBottom: "0.5px solid #9ca3af",
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
                              fontSize: 12,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {item.index}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: 12,
                              borderRight: "0.5px solid #edf2f7",
                              fontWeight: 600,
                            }}
                          >
                            {item.tone}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: 12,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {item.first_mid_frequency}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: 12,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {item.second_mid_frequency}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: 12,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {item.duration_on_state}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: 12,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {item.duration_off_state}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontSize: 12,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {item.period_count}
                          </td>
                          <td style={{ textAlign: "center", fontSize: 12 }}>
                            {item.duration_error}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Scrollbar */}
              {showCustomScrollbar && (
                <div
                  style={{
                    width: "100%",
                    background: "#f4f6fa",
                    display: "flex",
                    alignItems: "center",
                    height: 24,
                    padding: "0 4px",
                    borderTop: `1px solid ${C.cardBorder}`,
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
                    }}
                    onClick={() => handleArrowClick("right")}
                  >
                    &#9654;
                  </div>
                </div>
              )}

              {/* Footer Pagination */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderTop: `1px solid ${C.cardBorder}`,
                  background: "#f8fafc",
                }}
              >
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  Showing {pagedRules.length} items on page {page}
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
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
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
          {editIndex !== null ? "Edit Tone Parameters" : "Add Tone Parameters"}
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
              {TONE_DETECTER_FIELDS.map((f) => (
                <FieldRow
                  key={f.name}
                  label={f.label}
                  required={
                    f.name === "tone" || f.name === "first_mid_frequency"
                  }
                >
                  {f.type === "select" ? (
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        name={f.name}
                        value={formData[f.name] || ""}
                        onChange={handleInputChange}
                        sx={{ fontSize: 13 }}
                      >
                        {f.options.map((o) => (
                          <MenuItem
                            // key={opt.value}
                            value={o.value}
                            sx={{ fontSize: 13 }}
                          >
                            {o.label}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  ) : (
                    <TextField
                      name={f.name}
                      value={formData[f.name] || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      // Number type enable kiya hai taaki increaser/decreaser arrows aa jayein
                      type={f.name === "tone" ? "text" : "number"}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px", step: "1" },
                        // CSS to ensure spinners (up/down arrows) are always visible
                        "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button":
                          {
                            display: "block",
                            opacity: 1,
                            cursor: "pointer",
                          },
                        // For Firefox support
                        MozAppearance: "textfield",
                      }}
                    />
                  )}
                </FieldRow>
              ))}
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
            onClick={handleSave}
            disabled={loading.save}
            variant="contained"
            sx={{
              background: "#1e2d42",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 24px",
              minWidth: 120,
            }}
          >
            {loading.save ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            sx={{
              color: "#1e293b",
              borderColor: "#9ca3af",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "none",
              padding: "6px 24px",
              minWidth: 100,
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ToneDetecterPage;
