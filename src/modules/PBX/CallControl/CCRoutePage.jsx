import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import {
  createCCRoute,
  deleteCCRoute,
  fetchCCRouteExtensions,
  fetchCCRoutes,
  updateCCRoute,
} from "../../../api/apiService";

// ── Constants ─────────────────────────────────────────────────────────────────
const CC_INTERVAL_OPTIONS = [
  { value: "10", label: "10s" },
  { value: "30", label: "30s" },
  { value: "60", label: "1 min" },
  { value: "120", label: "2 min" },
  { value: "300", label: "5 min" },
];
const CC_INTERVAL_VALUE_SET = new Set(CC_INTERVAL_OPTIONS.map((o) => o.value));
const getCcIntervalLabel = (value) => {
  const found = CC_INTERVAL_OPTIONS.find((o) => o.value === String(value));
  return found ? found.label : `${value}s`;
};
const THROUGH_OPTIONS = ["Auto", "From Come In"];
const RECORD_KEEP_OPTIONS = [
  "8 hours",
  "16 hours",
  "1 day",
  "2 day",
  "3 day",
  "1 week",
  "2 week",
  "3 week",
  "4 week",
];
const ENABLE_OPTIONS = ["Yes", "No"];
const KEEP_MINUTES_TO_LABEL = {
  480: "8 hours",
  960: "16 hours",
  1440: "1 day",
  2880: "2 day",
  4320: "3 day",
  10080: "1 week",
  20160: "2 week",
  30240: "3 week",
  40320: "4 week",
};

// ── Normalization Helpers ─────────────────────────────────────────────────────
function normalizeThroughFromApi(value) {
  const mode = String(value || "").toLowerCase();
  return mode === "from_come_in" || mode === "from come in"
    ? "From Come In"
    : "Auto";
}
function normalizeEnabledFromApi(value) {
  return value === true || String(value || "").toLowerCase() === "yes"
    ? "Yes"
    : "No";
}
function normalizeRecordKeepTime(route) {
  if (route?.record_keep_time) return String(route.record_keep_time);
  const minutes = Number(route?.keep_minutes);
  return KEEP_MINUTES_TO_LABEL[minutes] || "8 hours";
}
function normalizeRoute(item) {
  const rawInterval = Number(item.interval_minutes ?? item.cc_interval_time);
  const normalizedInterval =
    Number.isFinite(rawInterval) && rawInterval > 0
      ? rawInterval <= 5
        ? rawInterval * 60
        : rawInterval
      : 10;
  const ccIntervalTime = CC_INTERVAL_VALUE_SET.has(String(normalizedInterval))
    ? String(normalizedInterval)
    : "10";
  return {
    id: item.id,
    ccIntervalTime,
    through: normalizeThroughFromApi(item.through_mode ?? item.through),
    recordKeepTime: normalizeRecordKeepTime(item),
    enabled: normalizeEnabledFromApi(item.enabled ?? item.enable),
    memberExtensions: Array.isArray(item.extensions)
      ? item.extensions.map(String)
      : [],
  };
}

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2563eb",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};
// ── Shared UI Components ──────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
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
      onClick={onClick}
      disabled={disabled}
      title={title}
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
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const CCRoutePage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
    extensions: false,
  });
  const hasLoadedExtensionsRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [ccIntervalTime, setCcIntervalTime] = useState("10");
  const [through, setThrough] = useState("Auto");
  const [recordKeepTime, setRecordKeepTime] = useState("8 hours");
  const [enabled, setEnabled] = useState("No");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const showAlert = (text) => showMessage("error", text);

  const resetForm = () => {
    setEditId(null);
    setCcIntervalTime("10");
    setThrough("Auto");
    setRecordKeepTime("8 hours");
    setEnabled("No");
    setSelectedExtensions([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const loadRows = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const res = await fetchCCRoutes();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setRows(list.map(normalizeRoute));
    } catch (err) {
      showAlert(err?.message || "Failed to load CC routes.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchCCRouteExtensions();
      const list = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = list
        .map((item) => ({
          extension: String(item?.extension ?? "").trim(),
          label: String(item?.label ?? item?.extension ?? "").trim(),
        }))
        .filter((item) => item.extension)
        .sort(
          (a, b) =>
            (parseInt(a.extension, 10) || 0) - (parseInt(b.extension, 10) || 0),
        );
      setAvailableExtensions(exts);
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load extensions.");
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) =>
      map.set(item.extension, item.label || item.extension),
    );
    return map;
  }, [availableExtensions]);

  const getExtensionLabel = (ext) => extensionLabelMap.get(ext) || ext;

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setCcIntervalTime(row.ccIntervalTime);
    setThrough(row.through);
    setRecordKeepTime(row.recordKeepTime);
    setEnabled(row.enabled);
    setSelectedExtensions(
      Array.isArray(row.memberExtensions) ? row.memberExtensions : [],
    );
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (!loading.save) setShowModal(false);
  };

  const availableList = useMemo(
    () =>
      availableExtensions.filter(
        (item) => !selectedExtensions.includes(item.extension),
      ),
    [availableExtensions, selectedExtensions],
  );

  const addSelectedExtensions = () => {
    if (availableSelected.length === 0) return;
    setSelectedExtensions((prev) => [
      ...prev,
      ...availableSelected.filter((ext) => !prev.includes(ext)),
    ]);
    setAvailableSelected([]);
  };

  const addAllExtensions = () => {
    setSelectedExtensions(availableExtensions.map((item) => item.extension));
    setAvailableSelected([]);
  };

  const removeSelectedExtensions = () => {
    if (chosenSelected.length === 0) return;
    setSelectedExtensions((prev) =>
      prev.filter((ext) => !chosenSelected.includes(ext)),
    );
    setChosenSelected([]);
  };

  const removeAllExtensions = () => {
    setSelectedExtensions([]);
    setChosenSelected([]);
  };

  // ── Sorting Logic ───────────────────────────────────────────────────────────
  const moveExtensionToBottom = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };

  const moveExtensionUp = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i - 1])
        ) {
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        }
      }
      return arr;
    });
  };

  const moveExtensionDown = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i + 1])
        ) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
      }
      return arr;
    });
  };

  const moveExtensionToTop = () => {
    if (!chosenSelected.length) return;
    setSelectedExtensions((prev) => {
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

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
    if (allPageSelected)
      setSelected((prev) => prev.filter((i) => !pageIndices.includes(i)));
    else setSelected((prev) => Array.from(new Set([...prev, ...pageIndices])));
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const ids = selected.map((i) => rows[i]?.id).filter(Boolean);
      await Promise.all(ids.map((id) => deleteCCRoute(id)));
      setSelected([]);
      await loadRows();
      showMessage("success", `Deleted ${ids.length} item(s).`);
    } catch (err) {
      showAlert(err?.message || "Failed to delete CC route.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    if (selectedExtensions.length === 0) {
      showAlert("Please select at least one member extension.");
      return;
    }
    const apiPayload = {
      cc_interval_time: Number(ccIntervalTime),
      through,
      record_keep_time: recordKeepTime,
      enable: enabled,
      extensions: selectedExtensions,
    };
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateCCRoute({ id: editId, ...apiPayload });
        showMessage("success", "CC route updated.");
      } else {
        await createCCRoute(apiPayload);
        showMessage("success", "CC route created.");
      }
      await loadRows();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save CC route.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* ── Error / Success Floating Banner ── */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
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
          {/* Breadcrumb */}
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Call Control &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>CC Route</span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "#ffffff",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid #e2e8f0",
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: C.labelText,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: 999,
                }}
              >
                Page {page} · {rows.length} records
              </span>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#e0f2fe",
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selected.length === 0
                }
                variant="danger"
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: C.errorRed }} />
                )}{" "}
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save || loading.fetch}
                variant="accent"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {loading.fetch ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 48,
                }}
              >
                <CircularProgress size={28} style={{ color: C.accent }} />
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 36 }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    </TH>
                    <TH style={{ width: 40 }}>#</TH>
                    <TH>CC Interval Time</TH>
                    <TH>Through</TH>
                    <TH>Record Keep Time</TH>
                    <TH>Enable</TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Member Extensions
                    </TH>
                    <TH style={{ width: 70 }}>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        No CC routes yet.
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const rowBg = isSelected
                        ? "#e0f2fe"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      return (
                        <tr
                          key={row.id}
                          style={{
                            background: rowBg,
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 0",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(realIdx)}
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
                              padding: "10px 6px",
                              fontSize: 11,
                              color: C.mutedText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {getCcIntervalLabel(row.ccIntervalTime)}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.through}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.recordKeepTime}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <span
                              style={{
                          
                                color:
                                  row.enabled === "Yes" ? "#166534" : "#475569",
                                padding: "4px 11px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 72,
                              }}
                            >
                              {row.enabled}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                              wordBreak: "break-all",
                            }}
                          >
                            {row.memberExtensions?.length > 0 ? (
                              row.memberExtensions
                                .map(getExtensionLabel)
                                .join(", ")
                            ) : (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "7px 8px" }}
                          >
                            <Btn
                              onClick={() => handleOpenEditModal(row)}
                              variant="outline"
                              style={{ fontSize: 10, padding: "3px 10px" }}
                            >
                              Edit
                            </Btn>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          {!loading.fetch && rows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                gap: 8,
              }}
            >
             <span
  style={{
    fontSize: 11,
    color: C.mutedText,
  }}
>
  Showing {rows.length} record
  {rows.length !== 1 ? "s" : ""} on
  page {page}
</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  First
                </Btn>
                <Btn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
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
                    border: `0.5px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page}
                </span>
                <Btn
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
                <Btn
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 980, maxWidth: "98vw", borderRadius: 2 } }}
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
          {editId != null ? "Edit CC Route" : "Add CC Route"}
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Settings Section */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 14,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 6,
                }}
              >
                CC Route Settings
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 32px",
                }}
              >
                <FieldRow label="CC Interval Time *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={ccIntervalTime}
                      onChange={(e) => setCcIntervalTime(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {CC_INTERVAL_OPTIONS.map((o) => (
                        <MenuItem
                          key={o.value}
                          value={o.value}
                          sx={{ fontSize: 13 }}
                        >
                          {o.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>
                <FieldRow label="Record Keep Time *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={recordKeepTime}
                      onChange={(e) => setRecordKeepTime(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {RECORD_KEEP_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>
                <FieldRow label="Through *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={through}
                      onChange={(e) => setThrough(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {THROUGH_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>
                <FieldRow label="Enable *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {ENABLE_OPTIONS.map((o) => (
                        <MenuItem key={o} value={o} sx={{ fontSize: 13 }}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>
              </div>
            </div>

            {/* Extensions Selection */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 14,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 6,
                }}
              >
                Member Extensions
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                {/* Available */}
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.accent,
                      marginBottom: 6,
                      textAlign: "center",
                    }}
                  >
                    Available
                  </div>
                  <select
                    multiple
                    value={availableSelected}
                    onChange={(e) =>
                      setAvailableSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={{
                      width: "100%",
                      height: 180,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 4,
                      padding: 8,
                      fontSize: 13,
                      background: "#f8fafc",
                    }}
                  >
                    {availableList.map((item) => (
                      <option key={item.extension} value={item.extension}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Move Controls */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    justifyContent: "center",
                    paddingTop: 24,
                  }}
                >
                  <Btn
                    onClick={addSelectedExtensions}
                    variant="outline"
                    style={{ padding: "6px 0" }}
                  >
                    &gt;
                  </Btn>
                  <Btn
                    onClick={addAllExtensions}
                    variant="outline"
                    style={{ padding: "6px 0" }}
                  >
                    &gt;&gt;
                  </Btn>
                  <Btn
                    onClick={removeSelectedExtensions}
                    variant="outline"
                    style={{ padding: "6px 0" }}
                  >
                    &lt;
                  </Btn>
                  <Btn
                    onClick={removeAllExtensions}
                    variant="outline"
                    style={{ padding: "6px 0" }}
                  >
                    &lt;&lt;
                  </Btn>
                </div>
                {/* Selected */}
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.accent,
                      marginBottom: 6,
                      textAlign: "center",
                    }}
                  >
                    Selected
                  </div>
                  <select
                    multiple
                    value={chosenSelected}
                    onChange={(e) =>
                      setChosenSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={{
                      width: "100%",
                      height: 180,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 4,
                      padding: 8,
                      fontSize: 13,
                    }}
                  >
                    {selectedExtensions.map((ext) => (
                      <option key={ext} value={ext}>
                        {getExtensionLabel(ext)}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Sort Controls - EXACTLY FROM REFERENCE */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    justifyContent: "center",
                    paddingTop: 24,
                  }}
                >
                  <Btn
                    onClick={moveExtensionToBottom}
                    variant="outline"
                    style={{ padding: "6px 0" }}
                    title="Move to bottom"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2,3 7,8 12,3"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="2"
                        y1="11"
                        x2="12"
                        y2="11"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Btn>
                  <Btn
                    onClick={moveExtensionUp}
                    variant="outline"
                    style={{ padding: "6px 0" }}
                    title="Move up"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2,9 7,4 12,9"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Btn>
                  <Btn
                    onClick={moveExtensionDown}
                    variant="outline"
                    style={{ padding: "6px 0" }}
                    title="Move down"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2,5 7,10 12,5"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Btn>
                  <Btn
                    onClick={moveExtensionToTop}
                    variant="outline"
                    style={{ padding: "6px 0" }}
                    title="Move to top"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <line
                        x1="2"
                        y1="3"
                        x2="12"
                        y2="3"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <polyline
                        points="2,11 7,6 12,11"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Btn>
                </div>
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
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            style={{ padding: "8px 28px", fontSize: 13 }}
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
            style={{ padding: "8px 28px", fontSize: 13 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CCRoutePage;
