import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
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
import {
  Btn,
  PbxBreadcrumb,
  TableListLoading,
  TableListEmptyState,
  pbxPageWrapStyle,
  pbxPageInnerStyle,
  pbxModalCancelBtnStyle,
  formatPbxItemListDisplay,
  PBX_LIST_TRUNCATE_THRESHOLD,
  PbxModalSectionHeading,
  pbxDualListLabelStyle,
} from "../../../shared/pbxSharedUi";
import { modalSelectSx } from "../../../shared/pbxSharedUi";
import {
  sipPcmCardStyle,
  sipPcmToolbarStyle,
  sipPcmSelectedBadgeStyle,
  sipPcmCancelBtnStyle,
  sipPcmPrimaryBtnStyle,
  SipPcmPagination,
} from "../../../shared/pbxSharedUi";
import {
  trunkModalPaperSx,
  trunkModalTitleStyle,
} from "../../../shared/pbxSharedUi";

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
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};
const CARD_RADIUS = 20;
// ── Shared UI Components ──────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);
const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};
const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};
const FieldRow = ({ label, children, wide = false, labelWidth = 130 }) => (
  <div
    style={{
      display: "flex",
      alignItems: wide ? "flex-start" : "center",
      gap: 12,
      width: "100%",
    }}
  >
    <label
      style={{
        fontSize: 13,
        color: C.labelText,
        fontWeight: 600,
        whiteSpace: "nowrap",
        textAlign: "left",
        width: labelWidth,
        flexShrink: 0,
        paddingTop: wide ? 4 : 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <PbxModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

const ccDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const ccDualListBtnStyle = {
  height: 36,
  width: "100%",
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "block",
  boxSizing: "border-box",
  textAlign: "center",
};

const ccDualListReorderBtnStyle = {
  ...ccDualListBtnStyle,
  fontWeight: 400,
};

const CcDualListBtn = ({ onClick, title, children, reorder = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={reorder ? ccDualListReorderBtnStyle : ccDualListBtnStyle}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#d9dde3";
    }}
  >
    {children}
  </button>
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
      setIsInitialLoad(false);
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
    <div style={pbxPageWrapStyle}>
      <div style={pbxPageInnerStyle}>
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

        <PbxBreadcrumb section="Call Control" current="CC Route" />

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
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
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}{" "}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save || loading.fetch}
                variant="primary"
                style={sipPcmPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No CC routes found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={checkboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      CC Interval Time
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Through
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Record Keep Time
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enable
                    </TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Member Extensions
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
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
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(realIdx)}
                            sx={checkboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {getCcIntervalLabel(row.ccIntervalTime)}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.through}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.recordKeepTime}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span style={{}}>{row.enabled}</span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.memberExtensions?.length > 0 ? (
                            <span
                              title={
                                row.memberExtensions.length >
                                PBX_LIST_TRUNCATE_THRESHOLD
                                  ? row.memberExtensions
                                      .map(getExtensionLabel)
                                      .join(", ")
                                  : undefined
                              }
                            >
                              {formatPbxItemListDisplay(row.memberExtensions, {
                                mapItem: getExtensionLabel,
                              })}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            textAlign: "center",
                            padding: "7px 8px",
                            borderRight: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <EditDocumentIcon
                            className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-start", pt: 5 } }}
        PaperProps={{ sx: trunkModalPaperSx }}
      >
        <DialogTitle style={trunkModalTitleStyle}>
          {editId != null ? "Edit CC Route" : "Add CC Route"}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 32px",
              }}
            >
              <FieldRow label="CC Interval Time *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={ccIntervalTime}
                      onChange={(e) => setCcIntervalTime(e.target.value)}
                      sx={modalSelectSx}
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
                      sx={modalSelectSx}
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
                      sx={modalSelectSx}
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
                      sx={modalSelectSx}
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

            <SectionCard title="Member Extensions">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                <div>
                  <div style={pbxDualListLabelStyle}>Available</div>
                  <select
                    multiple
                    size={6}
                    value={availableSelected}
                    onChange={(e) =>
                      setAvailableSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={ccDualListSelectStyle}
                  >
                    {availableList.length === 0 ? (
                      <option disabled value="">
                        No extensions
                      </option>
                    ) : (
                      availableList.map((item) => (
                        <option key={item.extension} value={item.extension}>
                          {item.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <CcDualListBtn onClick={addSelectedExtensions}>
                    &gt;
                  </CcDualListBtn>
                  <CcDualListBtn onClick={addAllExtensions}>
                    &gt;&gt;
                  </CcDualListBtn>
                  <CcDualListBtn onClick={removeSelectedExtensions}>
                    &lt;
                  </CcDualListBtn>
                  <CcDualListBtn onClick={removeAllExtensions}>
                    &lt;&lt;
                  </CcDualListBtn>
                </div>
                <div>
                  <div style={pbxDualListLabelStyle}>Selected</div>
                  <select
                    multiple
                    size={6}
                    value={chosenSelected}
                    onChange={(e) =>
                      setChosenSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={ccDualListSelectStyle}
                  >
                    {selectedExtensions.length === 0 ? (
                      <option disabled value="">
                        No selected extensions
                      </option>
                    ) : (
                      selectedExtensions.map((ext) => (
                        <option key={ext} value={ext}>
                          {getExtensionLabel(ext)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <CcDualListBtn
                    reorder
                    title="Move to bottom"
                    onClick={moveExtensionToBottom}
                  >
                    vv
                  </CcDualListBtn>
                  <CcDualListBtn
                    reorder
                    title="Move up"
                    onClick={moveExtensionUp}
                  >
                    ^
                  </CcDualListBtn>
                  <CcDualListBtn
                    reorder
                    title="Move down"
                    onClick={moveExtensionDown}
                  >
                    v
                  </CcDualListBtn>
                  <CcDualListBtn
                    reorder
                    title="Move to top"
                    onClick={moveExtensionToTop}
                  >
                    ^^
                  </CcDualListBtn>
                </div>
              </div>
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={pbxModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CCRoutePage;
