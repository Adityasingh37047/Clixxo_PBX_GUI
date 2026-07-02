import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Checkbox from "@mui/material/Checkbox";
import {
  saveCallerBlacklist,
  saveCalleeBlacklist,
  fetchAllNumberFilters,
  deleteNumberFilter,
  deleteAllNumberFilters,
} from "../../../api/apiService";
import {
  NUMBER_FILTER_BLACKLIST_FIELD_TOOLTIPS,
  NUMBER_FILTER_BLACKLIST_PAGE_BREADCRUMB_ROOT,
  NUMBER_FILTER_BLACKLIST_PAGE_BREADCRUMB_SECTION,
  NUMBER_FILTER_BLACKLIST_PAGE_TITLE,
  NUMBER_FILTER_BLACKLIST_CALLER_PANEL_TITLE,
  NUMBER_FILTER_BLACKLIST_CALLEE_PANEL_TITLE,
  NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLER,
  NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLEE,
  NUMBER_FILTER_BLACKLIST_ADD_NEW_LABEL,
  NUMBER_FILTER_BLACKLIST_DELETE_LABEL,
  NUMBER_FILTER_BLACKLIST_CLEAR_ALL_LABEL,
  NUMBER_FILTER_BLACKLIST_SAVE_LABEL,
  NUMBER_FILTER_BLACKLIST_CLOSE_LABEL,
  NUMBER_FILTER_BLACKLIST_LOADING_MESSAGE,
  NUMBER_FILTER_BLACKLIST_NOTE,
} from "../../../constants/NumberFilterBlacklistConstants";
// ── Page-local field label tooltip UI ──
const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const E1PriFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const E1PriFieldRow = ({
  label,
  tooltipKey,
  tooltips,
  children,
  labelWidth = 140,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    }}
  >
    <E1PriFieldLabel
      tooltipKey={tooltipKey}
      tooltips={tooltips}
      style={{
        width: labelWidth,
        flexShrink: 0,
        textAlign: "left",
        display: "inline-block",
        whiteSpace: "normal",
        lineHeight: 1.2,
      }}
    >
      {label}
    </E1PriFieldLabel>
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

// ── Local page UI (matches Route PBX design language) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText:  "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;
const NUMBER_FILTER_BLACKLIST_ADD_NEW_DIALOG_MARGIN = 24;
const NUMBER_FILTER_BLACKLIST_ADD_NEW_DIALOG_LAYOUT_OFFSET = 80;

const NUMBER_FILTER_BLACKLIST_ADD_NEW_DIALOG_SX = {
  "& .MuiDialog-container": {
    alignItems: "center",
    justifyContent: "center",
  },
};

const NUMBER_FILTER_BLACKLIST_ADD_NEW_DIALOG_PAPER_SX = {
  margin: NUMBER_FILTER_BLACKLIST_ADD_NEW_DIALOG_MARGIN,
  maxHeight: `calc(100vh - ${NUMBER_FILTER_BLACKLIST_ADD_NEW_DIALOG_LAYOUT_OFFSET}px - ${NUMBER_FILTER_BLACKLIST_ADD_NEW_DIALOG_MARGIN * 2}px)`,
  display: "flex",
  flexDirection: "column",
  width: 500,
  maxWidth: "95vw",
  p: 0,
  borderRadius: `${CARD_RADIUS}px`,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};
const FIELD_RADIUS = 6;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

// ── Native modal field UI ──
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const inputStyle = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const selectStyle = {
  ...inputStyle,
  padding: "0 28px 0 10px",
  appearance: "auto",
  cursor: "pointer",
};

const addHostFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: FIELD_RADIUS,
  padding: 20,
};

const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};
                                      
const panelCardStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
};

const panelToolbarStyle = {
  minHeight: 44,
  padding: "10px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  background: C.cardBg,
  borderBottom: `1px solid ${C.divider}`,
};

const panelSectionTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  letterSpacing: "-0.01em",
};

const panelFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 16px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
};

const panelNoteStyle = {
  color: C.accent,
  fontSize: 11,
  lineHeight: 1.5,
  margin: "16px 0 0",
  padding: "0 4px",
  textAlign: "center",
  width: "100%",
  boxSizing: "border-box",
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
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const BlacklistBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>{NUMBER_FILTER_BLACKLIST_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{NUMBER_FILTER_BLACKLIST_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {NUMBER_FILTER_BLACKLIST_PAGE_TITLE}
    </span>
  </div>
);

const AdvancedPageShell = ({ children }) => (
  <div style={advancedPageWrapStyle}>
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          variant === "primary" || variant === "cancel"
            ? "8px 32px"
            : "6px 14px",
        borderRadius: 8,
        fontSize: variant === "primary" || variant === "cancel" ? 14 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: variant === "primary" || variant === "cancel" ? 38 : 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </Component>
  );
};

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
  background: "#ffffff",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: C.accent,
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const headerCheckThStyle = {
  padding: "1px 14px",
  lineHeight: 1,
};

const Blacklist = () => {
  const [callerRows, setCallerRows] = useState([]);
  const [calleeRows, setCalleeRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("caller");
  const [modalData, setModalData] = useState({
    groupNo: "0",
    noInGroup: "0",
    idValue: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalGroupNo, setOriginalGroupNo] = useState("0");
  const [originalIdValue, setOriginalIdValue] = useState("");
  const [callerChecked, setCallerChecked] = useState([]);
  const [calleeChecked, setCalleeChecked] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  useEffect(() => {
    fetchBlacklistData();
  }, []);

  const displayToast = (message, type = "success") => {
    setToast({ msg: message, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const isCallerFilterItem = (item) =>
    item.type === "callerid" ||
    (item.type === "blacklist" && item.subtype === "callerid");

  const isCalleeFilterItem = (item) =>
    item.type === "calleeid" ||
    (item.type === "blacklist" && item.subtype === "calleeid");

  const assertApiSuccess = (response, fallbackMessage) => {
    if (response && response.success === false) {
      throw new Error(
        response.message || response.error || fallbackMessage || "Request failed",
      );
    }
  };

  const fetchBlacklistData = async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetchAllNumberFilters("blacklist");
      if (response.success && response.data) {
        const callerData = response.data
          .filter(isCallerFilterItem)
          .map((item) => ({
            groupNo: String(item.group),
            noInGroup: item.no_of_groups,
            callerId: item.number,
          }))
          .sort((a, b) => {
            const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
            if (groupDiff !== 0) return groupDiff;
            return parseInt(a.noInGroup) - parseInt(b.noInGroup);
          });
        const calleeData = response.data
          .filter(isCalleeFilterItem)
          .map((item) => ({
            groupNo: String(item.group),
            noInGroup: item.no_of_groups,
            calleeId: item.number,
          }))
          .sort((a, b) => {
            const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
            if (groupDiff !== 0) return groupDiff;
            return parseInt(a.noInGroup) - parseInt(b.noInGroup);
          });
        setCallerRows(callerData);
        setCalleeRows(calleeData);
      }
    } catch (error) {
      console.error("Error fetching blacklist data:", error);
      displayToast(
        "Failed to load blacklist data. Please refresh the page.",
        "error",
      );
    } finally {
      setIsInitialLoading(false);
    }
  };

  const getNextAvailableNoInGroup = (existingRows, groupNo) => {
    const entriesInGroup = existingRows.filter(
      (row) => String(row.groupNo) === String(groupNo),
    );
    if (entriesInGroup.length === 0) return "0";
    const existingNos = entriesInGroup
      .map((row) => parseInt(row.noInGroup))
      .sort((a, b) => a - b);
    for (let i = 0; i <= Math.max(...existingNos) + 1; i++) {
      if (!existingNos.includes(i)) return i.toString();
    }
    return (Math.max(...existingNos) + 1).toString();
  };

  const handleAddNew = (type) => {
    setModalType(type);
    const existingRows = type === "caller" ? callerRows : calleeRows;
    const selectedGroup = "0";
    const nextNoInGroup = getNextAvailableNoInGroup(
      existingRows,
      selectedGroup,
    );
    setModalData({
      groupNo: selectedGroup,
      noInGroup: nextNoInGroup,
      idValue: "",
    });
    setIsEditMode(false);
    setOriginalGroupNo(selectedGroup);
    setShowModal(true);
  };

  const handleEdit = (type, row) => {
    setModalType(type);
    setModalData({
      groupNo: String(row.groupNo),
      noInGroup: row.noInGroup ?? "0",
      idValue: type === "caller" ? row.callerId : row.calleeId,
    });
    setOriginalGroupNo(String(row.groupNo));
    setOriginalIdValue(type === "caller" ? row.callerId : row.calleeId);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleGroupNoChange = (newGroupNo) => {
    const existingRows = modalType === "caller" ? callerRows : calleeRows;
    const nextNoInGroup = getNextAvailableNoInGroup(existingRows, newGroupNo);
    setModalData({
      ...modalData,
      groupNo: newGroupNo,
      noInGroup: nextNoInGroup,
    });
  };

  const handleSave = async () => {
    if (!modalData.idValue.trim()) {
      displayToast("Please enter a valid ID value.", "error");
      return;
    }
    const existingRows = modalType === "caller" ? callerRows : calleeRows;
    const trimmedId = modalData.idValue.trim();
    const isDuplicate = existingRows.some((row) => {
      const rowId = modalType === "caller" ? row.callerId : row.calleeId;
      const sameRecord =
        isEditMode &&
        rowId === originalIdValue &&
        String(row.groupNo) === String(originalGroupNo);
      if (sameRecord) return false;
      return (
        rowId === trimmedId && String(row.groupNo) === String(modalData.groupNo)
      );
    });
    if (!isEditMode && isDuplicate) {
      displayToast(
        `${modalType === "caller" ? "Caller" : "Callee"} ID "${trimmedId}" already exists. Please use a different ID.`,
        "error",
      );
      return;
    }
    const groupUnchanged =
      String(modalData.groupNo) === String(originalGroupNo);
    const idUnchanged = trimmedId === String(originalIdValue ?? "").trim();
    if (isEditMode && groupUnchanged && idUnchanged) {
      setShowModal(false);
      displayToast("No changes to save.", "info");
      return;
    }
    setIsLoading(true);
    try {
      if (isEditMode && (!groupUnchanged || !idUnchanged)) {
        const subtype = modalType === "caller" ? "callerid" : "calleeid";
        const deleteResp = await deleteNumberFilter(
          "blacklist",
          originalIdValue,
          subtype,
          originalGroupNo,
        );
        assertApiSuccess(deleteResp, "Failed to remove old blacklist entry");
      }

      let saveResp;
      if (modalType === "caller") {
        saveResp = await saveCallerBlacklist({
          groupNo: modalData.groupNo,
          noInGroup: modalData.noInGroup,
          callerId: trimmedId,
        });
        assertApiSuccess(saveResp, "Failed to save caller blacklist");
        displayToast(
          isEditMode
            ? "Caller ID updated successfully!"
            : "Caller ID saved successfully!",
          "success",
        );
      } else {
        saveResp = await saveCalleeBlacklist({
          groupNo: modalData.groupNo,
          noInGroup: modalData.noInGroup,
          calleeId: trimmedId,
        });
        assertApiSuccess(saveResp, "Failed to save callee blacklist");
        displayToast(
          isEditMode
            ? "Callee ID updated successfully!"
            : "Callee ID saved successfully!",
          "success",
        );
      }
      setShowModal(false);
      setIsEditMode(false);
      await fetchBlacklistData();
    } catch (error) {
      console.error("Error saving blacklist:", error);
      displayToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to save blacklist. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallerCheck = (idx) =>
    setCallerChecked((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  const handleCalleeCheck = (idx) =>
    setCalleeChecked((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );

  const handleCallerCheckAll = (selectAll) => {
    setCallerChecked(selectAll ? callerRows.map((_, idx) => idx) : []);
  };
  const handleCalleeCheckAll = (selectAll) => {
    setCalleeChecked(selectAll ? calleeRows.map((_, idx) => idx) : []);
  };

  const handleCallerDelete = async () => {
    if (callerChecked.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${callerChecked.length} selected caller ID(s)?`,
      )
    )
      return;
    setIsDeleting(true);
    try {
      for (const idx of callerChecked) {
        const item = callerRows[idx];
        const response = await deleteNumberFilter(
          "blacklist",
          item.callerId,
          "callerid",
          item.groupNo,
        );
        if (!response.success)
          throw new Error(`Failed to delete caller ID: ${item.callerId}`);
      }
      displayToast(
        `Successfully deleted ${callerChecked.length} caller ID(s)!`,
        "success",
      );
      setCallerChecked([]);
      await fetchBlacklistData();
    } catch (error) {
      displayToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete caller IDs. Please try again.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCallerClear = async () => {
    if (callerRows.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to clear all ${callerRows.length} caller IDs?`,
      )
    )
      return;
    setIsDeleting(true);
    try {
      const response = await deleteAllNumberFilters("blacklist", "callerid");
      if (response.success) {
        displayToast(`Successfully cleared all caller IDs!`, "success");
        setCallerChecked([]);
        await fetchBlacklistData();
      } else throw new Error("Failed to clear all caller IDs");
    } catch (error) {
      displayToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to clear caller IDs. Please try again.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCalleeDelete = async () => {
    if (calleeChecked.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${calleeChecked.length} selected callee ID(s)?`,
      )
    )
      return;
    setIsDeleting(true);
    try {
      for (const idx of calleeChecked) {
        const item = calleeRows[idx];
        const response = await deleteNumberFilter(
          "blacklist",
          item.calleeId,
          "calleeid",
          item.groupNo,
        );
        if (!response.success)
          throw new Error(`Failed to delete callee ID: ${item.calleeId}`);
      }
      displayToast(
        `Successfully deleted ${calleeChecked.length} callee ID(s)!`,
        "success",
      );
      setCalleeChecked([]);
      await fetchBlacklistData();
    } catch (error) {
      displayToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete callee IDs. Please try again.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCalleeClear = async () => {
    if (calleeRows.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to clear all ${calleeRows.length} callee IDs?`,
      )
    )
      return;
    setIsDeleting(true);
    try {
      const response = await deleteAllNumberFilters("blacklist", "calleeid");
      if (response.success) {
        displayToast(`Successfully cleared all callee IDs!`, "success");
        setCalleeChecked([]);
        await fetchBlacklistData();
      } else throw new Error("Failed to clear all callee IDs");
    } catch (error) {
      displayToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to clear callee IDs. Please try again.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Reusable table panel
  const renderTablePanel = ({
    title,
    rows,
    checkedItems,
    onCheck,
    onCheckAll,
    onDelete,
    onClear,
    onAddNew,
    onEdit,
    idKey,
  }) => {
    const allChecked = rows.length > 0 && checkedItems.length === rows.length;
    const someChecked = checkedItems.length > 0 && !allChecked;

    return (
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={panelCardStyle}>
          <div style={panelToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={panelSectionTitleStyle}>{title}</span>
              {checkedItems.length > 0 && (
                <span
                  style={{
                    background: "#eff6ff",
                    color: C.labelText,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: `1px solid ${C.accentDark}`,
                  }}
                >
                  {checkedItems.length} selected
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
                onClick={onDelete}
                disabled={checkedItems.length === 0 || isDeleting}
                style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
              >
                {isDeleting ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    {NUMBER_FILTER_BLACKLIST_DELETE_LABEL}
                  </>
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={onClear}
                disabled={rows.length === 0 || isDeleting}
                style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
              >
                {NUMBER_FILTER_BLACKLIST_CLEAR_ALL_LABEL}
              </Btn>
              <Btn
                variant="primary"
                onClick={onAddNew}
                disabled={isDeleting}
                style={{
                  height: 30,
                  padding: "6px 16px",
                  fontSize: 12,
                }}
              >
                {NUMBER_FILTER_BLACKLIST_ADD_NEW_LABEL}
              </Btn>
            </div>
          </div>

          <div
            className="notepad-scrollbar"
            style={{ overflowX: "auto", overflowY: "auto", maxHeight: 360 }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                minWidth: 460,
              }}
            >
              <thead>
                <tr>
                  <TH style={{ width: 56, borderLeft: "none", ...headerCheckThStyle }}>
                    <Checkbox
                      checked={allChecked}
                      indeterminate={someChecked}
                      onChange={() => onCheckAll(!allChecked)}
                      size="small"
                      sx={checkboxSx}
                      disabled={rows.length === 0}
                    />
                  </TH>
                  <TH>Group No.</TH>
                  <TH>{idKey === "callerId" ? "CallerID" : "CalleeID"}</TH>
                  <TH style={{ width: 80, borderRight: "none" }}>Modify</TH>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "36px 0",
                        color: C.mutedText,
                        fontSize: 13,
                        fontWeight: 600,
                        borderBottom: "none",
                      }}
                    >
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const isChecked = checkedItems.includes(idx);
                    const isLastRow = idx === rows.length - 1;
                    const rowBg = isChecked
                      ? "#f0f9ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    return (
                      <tr
                        key={row.id || idx}
                        style={{
                          background: rowBg,
                          transition: "background 0.1s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isChecked)
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isChecked)
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
                            checked={isChecked}
                            onChange={() => onCheck(idx)}
                            size="small"
                            sx={checkboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row.groupNo}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          {row[idKey]}
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
                              style={{
                                cursor: isDeleting ? "not-allowed" : "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: isDeleting ? 0.4 : 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onClick={() => {
                                if (!isDeleting) onEdit(row);
                              }}
                              onMouseEnter={(e) => {
                                if (!isDeleting)
                                  e.currentTarget.style.opacity = "1";
                              }}
                              onMouseLeave={(e) => {
                                if (!isDeleting)
                                  e.currentTarget.style.opacity = "0.7";
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
          <div style={panelFooterStyle}>
            <span style={{ fontSize: 11, color: C.mutedText }}>
              Showing {rows.length} record
              {rows.length !== 1 ? "s" : ""}
            </span>
          </div>
          )}
        </div>
      </div>
    );
  };

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

      <BlacklistBreadcrumb />

      {isInitialLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 64,
            flexDirection: "column",
            gap: 12,
          }}
        >
          <CircularProgress size={32} style={{ color: C.accent }} />
          <span style={{ fontSize: 13, color: C.mutedText }}>
            {NUMBER_FILTER_BLACKLIST_LOADING_MESSAGE}
          </span>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              width: "100%",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            {renderTablePanel({
              title: NUMBER_FILTER_BLACKLIST_CALLER_PANEL_TITLE,
              rows: callerRows,
              checkedItems: callerChecked,
              onCheck: handleCallerCheck,
              onCheckAll: handleCallerCheckAll,
              onDelete: handleCallerDelete,
              onClear: handleCallerClear,
              onAddNew: () => handleAddNew("caller"),
              onEdit: (row) => handleEdit("caller", row),
              idKey: "callerId",
            })}
            {renderTablePanel({
              title: NUMBER_FILTER_BLACKLIST_CALLEE_PANEL_TITLE,
              rows: calleeRows,
              checkedItems: calleeChecked,
              onCheck: handleCalleeCheck,
              onCheckAll: handleCalleeCheckAll,
              onDelete: handleCalleeDelete,
              onClear: handleCalleeClear,
              onAddNew: () => handleAddNew("callee"),
              onEdit: (row) => handleEdit("callee", row),
              idKey: "calleeId",
            })}
          </div>

          <p style={panelNoteStyle}>
            {NUMBER_FILTER_BLACKLIST_NOTE}
          </p>
        </>
      )}

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth={false}
        sx={NUMBER_FILTER_BLACKLIST_ADD_NEW_DIALOG_SX}
        PaperProps={{
          sx: NUMBER_FILTER_BLACKLIST_ADD_NEW_DIALOG_PAPER_SX,
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
            letterSpacing: "-0.01em",
            flexShrink: 0,
          }}
        >
          {modalType === "caller"
            ? NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLER
            : NUMBER_FILTER_BLACKLIST_MODAL_TITLE_CALLEE}
        </DialogTitle>

        <DialogContent
          className="notepad-scrollbar"
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div style={{ ...addHostFormPanelStyle, gap: 16 }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <E1PriFieldRow
                label="Group No.:"
                tooltipKey="groupNo"
                tooltips={NUMBER_FILTER_BLACKLIST_FIELD_TOOLTIPS}
              >
                <select
                  value={modalData.groupNo}
                  onChange={(e) => handleGroupNoChange(e.target.value)}
                  style={selectStyle}
                  {...inputInteraction}
                >
                  {[...Array(200).keys()].map((i) => (
                    <option key={i} value={String(i)}>
                      {i}
                    </option>
                  ))}
                </select>
              </E1PriFieldRow>

              <E1PriFieldRow
                label={
                  modalType === "caller" ? "CallerID:" : "CalleeID:"
                }
                tooltipKey={modalType === "caller" ? "callerId" : "calleeId"}
                tooltips={NUMBER_FILTER_BLACKLIST_FIELD_TOOLTIPS}
              >
                <input
                  type="text"
                  value={modalData.idValue}
                  onChange={(e) =>
                    setModalData({ ...modalData, idValue: e.target.value })
                  }
                  disabled={isEditMode}
                  style={{
                    ...inputStyle,
                    ...(isEditMode
                      ? { backgroundColor: "#f3f4f6", cursor: "not-allowed" }
                      : {}),
                  }}
                  {...inputInteraction}
                />
              </E1PriFieldRow>
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            variant="primary"
            style={addNewModalFooterBtnStyle}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={16} style={{ color: "#fff" }} />
            ) : (
              NUMBER_FILTER_BLACKLIST_SAVE_LABEL
            )}
          </Btn>
          <Btn
            onClick={() => setShowModal(false)}
            variant="cancel"
            style={blacklistModalCancelBtnStyle}
            disabled={isLoading}
          >
            {NUMBER_FILTER_BLACKLIST_CLOSE_LABEL}
          </Btn>
        </DialogActions>
      </Dialog>
    </AdvancedPageShell>
  );
};

export default Blacklist;
