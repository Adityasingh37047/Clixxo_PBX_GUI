import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Checkbox from "@mui/material/Checkbox";
import {
  saveCallerWhitelist,
  saveCalleeWhitelist,
  fetchAllNumberFilters,
  fetchNumberFilters,
  deleteNumberFilter,
  deleteAllNumberFilters,
} from "../../../api/apiService";
import { WHITELIST_FIELD_TOOLTIPS } from "../../../constants/WhitelistConstants";
// ── Page-local field label tooltip UI ──
const FIELD_LABEL_COLOR = "#374151";

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

// ── Local page UI (matches FxsVoipMediaPage design language) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 20px rgba(0, 0, 0, 0.25), 0 0 8px rgba(0, 0, 0, 0.15)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#4A5D75",
  accentDark: "#3a4a5e",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: "1px",
      boxShadow: "0 0 0 2px rgba(62, 84, 117, 0.15)",
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: "1px",
      boxShadow: "0 0 0 2px rgba(62, 84, 117, 0.15)",
    },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
    boxShadow: "0 0 0 2px rgba(62, 84, 117, 0.15)",
  },
};

const modalTextFieldSx = {
  ...muiTextFieldSx,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
  },
};

const modalSelectSx = {
  ...muiSelectSx,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    height: 36,
    backgroundColor: "#fff",
  },
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
  padding: "8px 28px 16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
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
  fontSize: 14,
  fontWeight: 500,
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

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const WhitelistBreadcrumb = ({ current }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 12,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      flexShrink: 0,
    }}
  >
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>Number Filter</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
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

const Whitelist = () => {
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
    fetchWhitelistData();
  }, []);

  const displayToast = (message, type = "success") => {
    setToast({ msg: message, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const assertApiSuccess = (response, fallbackMessage) => {
    if (response && response.success === false) {
      throw new Error(
        response.message || response.error || fallbackMessage || "Request failed",
      );
    }
  };

  const fetchWhitelistData = async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetchAllNumberFilters("whitelist");
      if (response.success && response.data) {
        const callerData = response.data
          .filter((item) => item.type === "callerid")
          .map((item) => ({
            groupNo: item.group,
            noInGroup: item.no_of_groups,
            callerId: item.number,
          }))
          .sort((a, b) => {
            const groupDiff = parseInt(a.groupNo) - parseInt(b.groupNo);
            if (groupDiff !== 0) return groupDiff;
            return parseInt(a.noInGroup) - parseInt(b.noInGroup);
          });
        const calleeData = response.data
          .filter((item) => item.type === "calleeid")
          .map((item) => ({
            groupNo: item.group,
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
      console.error("Error fetching whitelist data:", error);
      displayToast(
        "Failed to load whitelist data. Please refresh the page.",
        "error",
      );
    } finally {
      setIsInitialLoading(false);
    }
  };

  const getNextAvailableNoInGroup = (existingRows, groupNo) => {
    const entriesInGroup = existingRows.filter(
      (row) => row.groupNo === groupNo,
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
      groupNo: row.groupNo,
      noInGroup: row.noInGroup ?? "0",
      idValue: type === "caller" ? row.callerId : row.calleeId,
    });
    setOriginalGroupNo(row.groupNo);
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
    if (isEditMode && String(modalData.groupNo) === String(originalGroupNo)) {
      setShowModal(false);
      displayToast("No changes to save.", "info");
      return;
    }
    setIsLoading(true);
    try {
      let saveResp;
      if (modalType === "caller") {
        saveResp = await saveCallerWhitelist({
          groupNo: modalData.groupNo,
          noInGroup: modalData.noInGroup,
          callerId: modalData.idValue,
        });
        assertApiSuccess(saveResp, "Failed to save caller whitelist");
        displayToast(
          isEditMode
            ? "Caller ID updated successfully!"
            : "Caller ID saved successfully!",
          "success",
        );
      } else {
        saveResp = await saveCalleeWhitelist({
          groupNo: modalData.groupNo,
          noInGroup: modalData.noInGroup,
          calleeId: modalData.idValue,
        });
        assertApiSuccess(saveResp, "Failed to save callee whitelist");
        displayToast(
          isEditMode
            ? "Callee ID updated successfully!"
            : "Callee ID saved successfully!",
          "success",
        );
      }
      if (isEditMode) {
        const subtype = modalType === "caller" ? "callerid" : "calleeid";
        try {
          const verifyResp = await fetchNumberFilters(
            "whitelist",
            modalData.idValue,
          );
          const existsInTarget =
            Array.isArray(verifyResp?.data) &&
            verifyResp.data.some(
              (item) =>
                String(item.group) === String(modalData.groupNo) &&
                item.type === subtype &&
                item.number === modalData.idValue,
            );
          if (existsInTarget) {
            await deleteNumberFilter(
              "whitelist",
              originalIdValue,
              subtype,
              originalGroupNo,
            );
          }
        } catch (e) {
          console.warn("Verification or delete failed after update:", e);
        }
      }
      setShowModal(false);
      setIsEditMode(false);
      await fetchWhitelistData();
    } catch (error) {
      console.error("Error saving whitelist:", error);
      displayToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to save whitelist. Please try again.",
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
          "whitelist",
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
      await fetchWhitelistData();
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
      const response = await deleteAllNumberFilters("whitelist", "callerid");
      if (response.success) {
        displayToast(`Successfully cleared all caller IDs!`, "success");
        setCallerChecked([]);
        await fetchWhitelistData();
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
          "whitelist",
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
      await fetchWhitelistData();
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
      const response = await deleteAllNumberFilters("whitelist", "calleeid");
      if (response.success) {
        displayToast(`Successfully cleared all callee IDs!`, "success");
        setCalleeChecked([]);
        await fetchWhitelistData();
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
                  color: C.accent,
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
                  Delete
                </>
              )}
            </Btn>
            <Btn
              variant="cancel"
              onClick={onClear}
              disabled={rows.length === 0 || isDeleting}
              style={{ height: 30, padding: "6px 14px", fontSize: 12 }}
            >
              Clear All
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
              + Add New
            </Btn>
          </div>
        </div>

        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 360 }}>
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
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            style={{
                              cursor: "pointer",
                              color: C.accent,
                              fontSize: 22,
                              opacity: 0.75,
                              transition: "opacity 0.15s ease",
                            }}
                            onClick={() => onEdit(row)}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.opacity = "1")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.opacity = "0.75")
                            }
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

        <div style={panelFooterStyle}>
          <span style={{ fontSize: 11, color: C.mutedText }}>
            Showing {rows.length} record
            {rows.length !== 1 ? "s" : ""}
          </span>
        </div>
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

   
      <WhitelistBreadcrumb current="Whitelist" />

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
            Loading whitelist data...
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
            }}
          >
            {renderTablePanel({
              title: "CallerID Whitelist",
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
              title: "CalleeID Whitelist",
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

          <p
            style={{
              color: C.accent,
              fontSize: 11,
              lineHeight: 1.5,
              margin: "16px 0 0",
              padding: "0 4px",
            }}
          >
            Note: The one list, only the latest 200 pieces will be displayed.
            To check all the records, please backup the file.
          </p>
        </>
      )}

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            mt: 0,
            p: 0,
            borderRadius: `${CARD_RADIUS}px`,
            overflow: "hidden",
            
          }
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
       <DialogTitle
  sx={{
    m: 0,
    p: "14px 24px",
    backgroundColor: "#1e2d42",
    color: "#fff",
    fontWeight: 600,
    fontSize: 16,
    textAlign: "center",
    letterSpacing: "-0.01em",
    minHeight: "unset",
  }}
>
  {modalType === "caller"
    ? "CallerIDs in Whitelist"
    : "CalleeIDs in Whitelist"}
</DialogTitle>

<DialogContent
  sx={{
    p: 3,
    backgroundColor: "#fff",
    "&:first-of-type": {
      paddingTop: 3,
    },
  }}
>
          <div style={{ ...addHostFormPanelStyle, gap: 16 }}>
            {/* Group No. */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <E1PriFieldLabel
                tooltipKey="groupNo"
                tooltips={WHITELIST_FIELD_TOOLTIPS}
                style={{
                  width: 140,
                  whiteSpace: "normal",
                  lineHeight: 1.2,
                  textAlign: "left",
                  display: "inline-block",
                }}
              >
                Group No.:
              </E1PriFieldLabel>
              <MuiSelect
                value={modalData.groupNo}
                onChange={(e) => handleGroupNoChange(e.target.value)}
                size="small"
                fullWidth
                sx={{ ...modalSelectSx, height: 36 }}
                MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
              >
                {[...Array(200).keys()].map((i) => (
                  <MenuItem key={i} value={i} sx={{ fontSize: 13 }}>
                    {i}
                  </MenuItem>
                ))}
              </MuiSelect>
            </div>

            {/* ID Value */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <E1PriFieldLabel
                tooltipKey={modalType === "caller" ? "callerId" : "calleeId"}
                tooltips={WHITELIST_FIELD_TOOLTIPS}
                style={{
                  width: 140,
                  whiteSpace: "normal",
                  lineHeight: 1.2,
                  textAlign: "left",
                  display: "inline-block",
                }}
              >
                {modalType === "caller" ? "CallerID:" : "CalleeID:"}
              </E1PriFieldLabel>
              <TextField
                type="text"
                value={modalData.idValue}
                onChange={(e) =>
                  setModalData({ ...modalData, idValue: e.target.value })
                }
                size="small"
                fullWidth
                disabled={isEditMode}
                inputProps={{ style: { fontSize: 13, height: 16 } }}
                sx={modalTextFieldSx}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions
          style={{
            background: C.cardBg,
            padding: "12px 24px",
            borderTop: `1px solid ${C.divider}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            variant="primary"
            style={advancedFormBtnStyle}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={16} style={{ color: "#fff" }} />
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={() => setShowModal(false)}
            variant="cancel"
            style={advancedFormBtnStyle}
            disabled={isLoading}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </AdvancedPageShell>
  );
};

export default Whitelist;
