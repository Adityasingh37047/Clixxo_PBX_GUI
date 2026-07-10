import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  createPrivateGroup,
  deletePrivateGroup,
  fetchSipAccounts,
  listPrivateGroups,
  updatePrivateGroup,
} from "../../../api/apiService";
import {
  PRIVATE_GROUP_FIELD_TOOLTIPS,
  PRIVATE_GROUP_ITEMS_PER_PAGE,
  PRIVATE_GROUP_TITLE,
} from "../../../constants/PrivateGroupConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as PrivateGroupBreadcrumb,
  ExtensionTableListLoading as PrivateGroupTableListLoading,
  ExtensionTableListEmptyState as PrivateGroupTableListEmptyState,
  extensionTableCheckboxSx as privateGroupTableCheckboxSx,
  extensionFixedAlertSx as privateGroupFixedAlertSx,
  extensionPageWrapStyle as privateGroupPageWrapStyle,
  extensionPageInnerStyle as privateGroupPageInnerStyle,
  extensionCardStyle as privateGroupCardStyle,
  extensionToolbarStyle as privateGroupToolbarStyle,
  extensionSelectedBadgeStyle as privateGroupSelectedBadgeStyle,
  extensionCancelBtnStyle as privateGroupCancelBtnStyle,
  extensionPrimaryBtnStyle as privateGroupPrimaryBtnStyle,
  ExtensionCodecDualList as PrivateGroupCodecDualList,
} from "../../../components/common";

const PRIVATE_GROUP_COMPACT_MQ = "(max-width: 768px)";
const ENABLE_OPTIONS = ["Yes", "No"];

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
  placeholderText: "#94a3b8",
};

// ── Local page UI ──


const PRIVATE_GROUP_TABLE_CARD_RADIUS = 4;

const privateGroupPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: PRIVATE_GROUP_TABLE_CARD_RADIUS,
  borderBottomRightRadius: PRIVATE_GROUP_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const privateGroupPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 4,
  border: `1px solid ${C.cardBorder}`,
};

const privateGroupEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handlePrivateGroupEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const privateGroupOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const privateGroupModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...privateGroupOutlinedInputRootSx,
    minHeight: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
};

const privateGroupModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...privateGroupOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
};

const privateGroupModalPaperSx = {
  width: 900,
  maxWidth: "96vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const privateGroupModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

const privateGroupModalSectionStyle = {
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
  minWidth: 100,
};

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const privateGroupModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",    
  borderRadius: 4,
};

const PRIVATE_GROUP_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatPrivateGroupTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const PRIVATE_GROUP_MODAL_LABEL_WIDTH = 140;
const PRIVATE_GROUP_MODAL_SECTION_BG = "#f8fafc";
const PRIVATE_GROUP_MODAL_SECTION_HEADING_COLOR = "#30415A";

const PrivateGroupFieldLabel = ({
  tooltipKey,
  children,
  required,
  style = {},
}) => {
  const tooltip = PRIVATE_GROUP_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
      {required ? (
        <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
      ) : null}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip
      title={formatPrivateGroupTooltipTitle(tooltip)}
      {...PRIVATE_GROUP_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const PrivateGroupFieldRow = ({ label, tooltipKey, required, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    {tooltipKey ? (
      <PrivateGroupFieldLabel
        tooltipKey={tooltipKey}
        required={required}
        style={{
          width: PRIVATE_GROUP_MODAL_LABEL_WIDTH,
          flexShrink: 0,
        }}
      >
        {label}
      </PrivateGroupFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: PRIVATE_GROUP_MODAL_LABEL_WIDTH,
          flexShrink: 0,
        }}
      >
        {label}
        {required ? (
          <span style={{ color: C.errorRed, marginLeft: 2 }}>*</span>
        ) : null}
      </label>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const PrivateGroupSectionHeading = ({
  title,
  isFirst = false,
  required = false,
  tooltipKey,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  const heading = (
    <span
      style={{
        position: "absolute",
        top: -10,
        left: isLaptopNarrow ? 0 : -6,
        background: PRIVATE_GROUP_MODAL_SECTION_BG,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: PRIVATE_GROUP_MODAL_SECTION_HEADING_COLOR,
        cursor: tooltipKey ? "help" : undefined,
      }}
    >
      {title}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </span>
  );
  const tooltip = tooltipKey ? PRIVATE_GROUP_FIELD_TOOLTIPS[tooltipKey] : "";
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "16px 0 24px 0"
            : "0 0 24px 0"
          : "28px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.divider}` }} />
      {tooltip ? (
        <Tooltip
          title={formatPrivateGroupTooltipTitle(tooltip)}
          {...PRIVATE_GROUP_TOOLTIP_PROPS}
        >
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const PrivateGroup = () => {
  const isCompact = useMediaQuery(PRIVATE_GROUP_COMPACT_MQ);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    extensions: false,
    list: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedExtensionsRef = useRef(false);

  // Search & Pagination
  const itemsPerPage = PRIVATE_GROUP_ITEMS_PER_PAGE;
  const [page, setPage] = useState(1);

  // Modal State
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState("Yes");

  // Dual list state
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const normalizePrivateGroupList = (res) => {
    const list = Array.isArray(res?.message)
      ? res.message
      : Array.isArray(res?.data)
        ? res.data
        : [];
    return list.map((g) => ({
      id: g.id,
      name: g.name || "",
      enabled: g.enabled ? "Yes" : "No",
      members: Array.isArray(g.members) ? g.members.map(String) : [],
    }));
  };

  const refreshPrivateGroups = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listPrivateGroups();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load private groups.");
        setRows([]);
        return;
      }
      setRows(normalizePrivateGroupList(res));
    } catch (err) {
      showMessage("error", err?.message || "Failed to load private groups.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    refreshPrivateGroups();
  }, []);

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, extensions: true }));
    try {
      const res = await fetchSipAccounts();
      if (res?.response === false) {
        showMessage("error", res?.message || "Failed to load extensions.");
        setAvailableExtensions([]);
        return;
      }
      const sipList = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = sipList
        .filter((e) => e && e.extension)
        .map((e) => {
          const ext = String(e.extension);
          const display = (e.display_name || e.name || "").trim();
          return {
            value: ext,
            label: display ? `${ext}-${display}` : ext,
          };
        })
        .sort((a, b) => {
          const an = parseInt(a.value, 10);
          const bn = parseInt(b.value, 10);
          if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn)
            return an - bn;
          return a.label.localeCompare(b.label);
        });
      setAvailableExtensions(exts);
      hasLoadedExtensionsRef.current = true;
    } catch (err) {
      showMessage("error", err?.message || "Failed to load extensions.");
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, extensions: false }));
    }
  };

  // ── Search & Pagination ──
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

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // ── Checkbox Logic ──
  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  // ── Form Handlers ──
  const resetForm = () => {
    setEditId(null);
    setName("");
    setEnabled("Yes");
    setMemberExtensions([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setEnabled(row.enabled === "No" ? "No" : "Yes");
    setMemberExtensions(Array.isArray(row.members) ? [...row.members] : []);
    setShowModal(true);
    if (!hasLoadedExtensionsRef.current) await loadExtensions();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selected.length === 0)
      return showMessage("error", "Please select at least one row to delete.");
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    (async () => {
      try {
        const toDelete = filteredRows.filter((_, idx) =>
          selected.includes(idx),
        );
        for (const row of toDelete) {
          if (row.id != null) {
            const res = await deletePrivateGroup(row.id);
            if (res?.response === false) {
              showMessage(
                "error",
                res?.message || "Failed to delete private group.",
              );
              break;
            }
          }
        }
        setSelected([]);
        await refreshPrivateGroups();
        showMessage("success", "Private Group(s) deleted successfully.");
      } catch (err) {
        showMessage(
          "error",
          err?.message || "Failed to delete private group(s).",
        );
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return showMessage("error", "Name is required.");
    if (!/^[A-Za-z0-9_]+$/.test(trimmed))
      return showMessage(
        "error",
        "Name may contain only letters, numbers, and underscore.",
      );
    if (!memberExtensions.length)
      return showMessage("error", "Please select at least one Member.");

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        if (editId != null) {
          const res = await updatePrivateGroup(editId, {
            name: trimmed,
            enabled: enabled === "Yes",
            members: memberExtensions.map(String),
          });
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to update private group.",
            );
          await refreshPrivateGroups();
          showMessage("success", "Private group updated successfully.");
        } else {
          const res = await createPrivateGroup({
            name: trimmed,
            enabled: enabled === "Yes",
            members: memberExtensions.map(String),
          });
          if (res?.response === false)
            return showMessage(
              "error",
              res?.message || "Failed to create private group.",
            );
          await refreshPrivateGroups();
          showMessage("success", "Private group created successfully.");
        }
        handleCloseModal();
      } catch (err) {
        showMessage("error", err?.message || "Failed to save private group.");
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  const getExtLabel = (ext) => {
    const found = availableExtensions.find((e) => e.value === ext);
    return found?.label || ext;
  };

  const allExtensionOptions = useMemo(
    () =>
      availableExtensions.map(({ value, label }) => ({ value, label })),
    [availableExtensions],
  );

  const availableMemberEmptyText = loading.extensions
    ? "Loading..."
    : "No extension";

  return (
    <div
      style={{
        ...privateGroupPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={privateGroupPageInnerStyle}>
        {message.text && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={privateGroupFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <PrivateGroupBreadcrumb
          section="Call Features"
          current={PRIVATE_GROUP_TITLE}
        />

        <div style={privateGroupCardStyle}>
          <div
            style={{
              ...privateGroupToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
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
              {selected.length > 0 && (
                <span style={privateGroupSelectedBadgeStyle}>
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
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={privateGroupCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={privateGroupPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <PrivateGroupTableListLoading />
            ) : rows.length === 0 ? (
              <PrivateGroupTableListEmptyState
                message="No private groups found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
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
                        sx={privateGroupTableCheckboxSx}
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
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Members
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
                    const lastRowCellStyle = {
                      borderBottom: isLastRow ? "none" : tdStyle.borderBottom,
                    };

                    return (
                      <tr
                        key={row.id || realIdx}
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
                            borderLeft: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={privateGroupTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={{
                              color:
                                row.enabled === "Yes" ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {(row.members || [])
                            .slice(0, 4)
                            .map(getExtLabel)
                            .join(", ")}
                          {(row.members || []).length > 4
                            ? ` +${(row.members || []).length - 4}`
                            : ""}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
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
                              onClick={() => handleOpenEditModal(row)}
                              style={privateGroupEditIconStyle}
                              onMouseEnter={(e) =>
                                handlePrivateGroupEditIconHover(e, true)
                              }
                              onMouseLeave={(e) =>
                                handlePrivateGroupEditIconHover(e, false)
                              }
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

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <div style={privateGroupPaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.list || page <= 1}
                  variant="outline" 
                  style={{ borderRadius: 4 }}
                >
                  ← Prev
                </Btn>
                <span style={privateGroupPageBadgeStyle}>
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.list || page >= totalPages}
                  variant="outline"
                  style={{ borderRadius: 4 }}
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: { ...privateGroupModalPaperSx, borderRadius: editId == null ? "4px" : privateGroupModalPaperSx.borderRadius } }}
      >
        <DialogTitle style={privateGroupModalTitleStyle}>
          {editId != null ? `Edit ${PRIVATE_GROUP_TITLE}` : `Add ${PRIVATE_GROUP_TITLE}`}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div style={privateGroupModalSectionStyle}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                gap: "16px 32px",
              }}
            >
              <PrivateGroupFieldRow label="Name" tooltipKey="name" required>
                <TextField
                  size="small"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={privateGroupModalTextFieldFullSx}
                />
              </PrivateGroupFieldRow>

              <PrivateGroupFieldRow label="Enable" tooltipKey="enabled" required>
                <FormControl size="small" fullWidth>
                  <MuiSelect
                    value={enabled}
                    onChange={(e) => setEnabled(e.target.value)}
                    sx={privateGroupModalSelectSx}
                  >
                    {ENABLE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              </PrivateGroupFieldRow>
            </div>

            <PrivateGroupSectionHeading
              title="Member Extensions"
              required
              tooltipKey="member"
            />

            <PrivateGroupCodecDualList
              hideReorder
              allOptions={allExtensionOptions}
              selected={memberExtensions}
              onChange={setMemberExtensions}
              getLabel={getExtLabel}
              emptyTextAvailable={availableMemberEmptyText}
              emptyTextSelected="No selected member"
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={13} sx={{ color: "#fff", mr: 1 }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update Group"
            ) : (
              "Create Group"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={privateGroupModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PrivateGroup;
