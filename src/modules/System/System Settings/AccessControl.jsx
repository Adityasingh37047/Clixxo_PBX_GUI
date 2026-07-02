import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Checkbox,
  Tooltip,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { postLinuxCmd } from "../../../api/apiService";
import {
  IPTABLES_INFO,
  ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT,
  ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION,
  ACCESS_CONTROL_PAGE_TITLE,
  ACCESS_CONTROL_BTN_INVERSE,
  ACCESS_CONTROL_BTN_DELETE,
  ACCESS_CONTROL_BTN_CLEAR_ALL,
  ACCESS_CONTROL_BTN_ADD_NEW,
  ACCESS_CONTROL_BTN_SAVE,
  ACCESS_CONTROL_BTN_CLOSE,
  ACCESS_CONTROL_BTN_APPLY,
  ACCESS_CONTROL_BTN_CANCEL,
  ACCESS_CONTROL_MODAL_TITLE,
  ACCESS_CONTROL_EMPTY_MESSAGE,
  ACCESS_CONTROL_EMPTY_BTN,
  ACCESS_CONTROL_RECORD_LABEL,
  ACCESS_CONTROL_SHOWING_RECORDS,
  ACCESS_CONTROL_SELECTED_SUFFIX,
  ACCESS_CONTROL_LOG_TITLE,
  ACCESS_CONTROL_LOG_NOTES,
  ACCESS_CONTROL_FIELD_TOOLTIPS,
  ACCESS_CONTROL_INDEX_PLACEHOLDER,
  ACCESS_CONTROL_COMMAND_PLACEHOLDER,
  ACCESS_CONTROL_TABLE_COLUMNS,
} from "../../../constants/AccessControlConstants";

const ACCESS_CONTROL_SCROLL_CLASS = "access-control-scroll";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  cardShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  placeholderText: "#9aa3b2",
  strongText: "#1f2937",
  accent: "#3E5475",
  errorRed: "#dc2626",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 6;

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW();
};

const nativeFieldInputStyle = {
  height: 32,
  width: 200,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
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

const { height: _nativeHeight, ...nativeFieldBase } = nativeFieldInputStyle;

const systemModalFieldInputStyle = {
  ...nativeFieldBase,
  minHeight: 32,
  height: 32,
  width: "100%",
  padding: "0 10px",
  lineHeight: 1.35,
  color: C.valueText,
  borderRadius: FIELD_RADIUS,
};

const disabledInputStyle = {
  ...systemModalFieldInputStyle,
  background: "#f1f5f9",
  color: "#94a3b8",
  cursor: "not-allowed",
  borderColor: "#e2e8f0",
};

const accessControlPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const accessControlPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const accessControlTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  boxSizing: "border-box",
};

const accessControlToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
};

const accessControlFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

const accessControlToolbarBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
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

const accessControlModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const accessControlSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const accessControlFixedAlertSx = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  maxWidth: 500,
  wordBreak: "break-word",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

const accessControlLogSectionStyle = {
  width: "100%",
  maxWidth: "100%",
  marginTop: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
};

const accessControlLogTitleStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: C.labelText,
  marginTop: 10,
  marginBottom: 8,
  textAlign: "center",
  letterSpacing: "0.01em",
};

const accessControlLogBoxStyle = {
  width: "100%",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflowY: "auto",
  padding: 12,
  resize: "vertical",
  minHeight: 140,
  maxHeight: 320,
  boxSizing: "border-box",
};

const accessControlLogPreStyle = {
  width: "100%",
  minHeight: 120,
  maxHeight: 260,
  background: C.cardBg,
  color: C.valueText,
  fontSize: 11,
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  whiteSpace: "pre-wrap",
  margin: 0,
  padding: 0,
};

const accessControlLogNotesStyle = {
  marginTop: 8,
  fontSize: 11,
  textAlign: "center",
  color: C.accent,
  lineHeight: 1.5,
};

const ACCESS_CONTROL_FIELD_TOOLTIP_PROPS = {
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

const AccessControlFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = ACCESS_CONTROL_FIELD_TOOLTIPS[tooltipKey] || "";
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 130,
        flexShrink: 0,
        textAlign: "left",
        whiteSpace: "nowrap",
        cursor: tooltip ? "help" : undefined,
        display: "block",
        ...style,
      }}
    >
      {children}
    </label>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={tooltip} {...ACCESS_CONTROL_FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const AccessControlScrollbarStyles = () => (
  <style>{`
    .${ACCESS_CONTROL_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .${ACCESS_CONTROL_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  `}</style>
);

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      position: "sticky",
      top: 0,
      zIndex: 10,
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
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const getAccessControlTdStyle = (rowBg, lastRowCellStyle, extra = {}) => ({
  ...tdStyle,
  background: rowBg,
  ...lastRowCellStyle,
  ...extra,
});

const getAccessControlRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

const AccessControlPageShell = ({ children }) => (
  <>
    <AccessControlScrollbarStyles />
    <div
      className={ACCESS_CONTROL_SCROLL_CLASS}
      style={accessControlPageWrapStyle}
      data-native-scroll
    >
      <div style={accessControlPageInnerStyle}>{children}</div>
    </div>
  </>
);

const AccessControlBreadcrumb = () => (
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
    <span>{ACCESS_CONTROL_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{ACCESS_CONTROL_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {ACCESS_CONTROL_PAGE_TITLE}
    </span>
  </div>
);

const AccessControlTableEmptyState = ({ onAddNew, disabled }) => (
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
      {ACCESS_CONTROL_EMPTY_MESSAGE}
    </div>
    <Btn
      variant="cancel"
      onClick={onAddNew}
      disabled={disabled}
      style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
    >
      {ACCESS_CONTROL_EMPTY_BTN}
    </Btn>
  </div>
);

const AccessControlEditIcon = ({ disabled, onClick }) => (
  <EditDocumentIcon
    titleAccess="Edit"
    onClick={() => {
      if (!disabled) onClick();
    }}
    style={{
      cursor: disabled ? "not-allowed" : "pointer",
      color: "#2563eb",
      fontSize: 22,
      opacity: disabled ? 0.4 : 0.7,
      transition: "opacity 0.15s ease",
      pointerEvents: disabled ? "none" : "auto",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "1";
    }}
    onMouseLeave={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "0.7";
    }}
  />
);

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  startIcon,
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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
    error: {
      background: C.errorRed,
      color: C.cardBg,
      border: `1px solid ${C.errorRed}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      outline: "#e2e8f0",
      error: "#b91c1c",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      outline: "#d1d9e6",
      error: "#991b1b",
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

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: 30,
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
      {startIcon && (
        <span style={{ display: "flex", alignItems: "center" }}>
          {startIcon}
        </span>
      )}
      {children}
    </button>
  );
};

const AccessControl = () => {
  // State
  const [commands, setCommands] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ index: "", command: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    apply: false,
  });
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [executionLogs, setExecutionLogs] = useState(IPTABLES_INFO);
  const [iptablesInfo, setIptablesInfo] = useState(IPTABLES_INFO);

  // Toast handling
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // Load iptables info on mount
  useEffect(() => {
    loadIptablesInfo();
  }, []);

  const loadIptablesInfo = async () => {
    try {
      const response = await postLinuxCmd({ cmd: "iptables -L -n -v" });
      if (response.response && response.responseData) {
        setIptablesInfo(response.responseData);
        setExecutionLogs(response.responseData);
        return response.responseData;
      }
    } catch (error) {
      console.error("Error loading iptables info:", error);
      // Keep default IPTABLES_INFO if API fails
    }
    return iptablesInfo;
  };

  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({ index: row.index, command: row.command });
      setEditIndex(idx);
    } else {
      const nextIndex = (commands.length + 1).toString();
      setForm({ index: nextIndex, command: "" });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setForm({ index: "", command: "" });
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Validate iptables command
  const validateCommand = (command) => {
    const trimmedCmd = command.trim();

    if (!trimmedCmd) {
      return { valid: false, error: "Please enter a command" };
    }

    // Check if command starts with iptables or sudo iptables
    const iptablesPattern = /^(sudo\s+)?iptables\s+/i;
    if (!iptablesPattern.test(trimmedCmd)) {
      return {
        valid: false,
        error:
          'Invalid command. Command must start with "iptables" or "sudo iptables"',
      };
    }

    // Check for basic iptables structure (should have at least one option after iptables)
    const parts = trimmedCmd.split(/\s+/);
    const iptablesIndex = parts.findIndex(
      (p) => p.toLowerCase() === "iptables",
    );

    if (iptablesIndex === -1) {
      return {
        valid: false,
        error: 'Invalid command format. Command must contain "iptables"',
      };
    }

    // Check if there are arguments after iptables
    if (parts.length <= iptablesIndex + 1) {
      return {
        valid: false,
        error: 'Invalid command. Command must include options after "iptables"',
      };
    }

    // Check for common iptables operations
    const validOperations = [
      "-A",
      "-I",
      "-D",
      "-R",
      "-P",
      "-F",
      "-X",
      "-N",
      "-E",
      "-L",
      "-S",
      "-C",
      "-Z",
    ];
    const hasValidOperation = parts.some((part) =>
      validOperations.includes(part),
    );

    if (!hasValidOperation) {
      return {
        valid: false,
        error:
          "Invalid command. Command must include a valid iptables operation (e.g., -A, -I, -D, -P, etc.)",
      };
    }

    return { valid: true, error: null };
  };

  const handleSave = () => {
    const validation = validateCommand(form.command);

    if (!validation.valid) {
      showToast(validation.error, "error");
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editIndex !== null) {
        // Update existing command
        setCommands((prev) =>
          prev.map((cmd, idx) =>
            idx === editIndex
              ? { index: form.index, command: form.command.trim() }
              : cmd,
          ),
        );
        showToast("Command updated successfully", "success");
      } else {
        // Add new command
        setCommands((prev) => [
          ...prev,
          { index: form.index, command: form.command.trim() },
        ]);
        showToast("Command added successfully", "success");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving command:", error);
      showToast("Failed to save command", "error");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Table selection logic
  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };
  const handleCheckAll = () => setSelected(commands.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);

  const handleInverse = () => {
    const allIndices = commands.map((_, idx) => idx);
    setSelected(allIndices.filter((i) => !selected.includes(i)));
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      showToast("Please select commands to delete", "error");
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected command(s)?`,
    );
    if (!isConfirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    setTimeout(() => {
      setCommands((prev) =>
        prev
          .filter((_, idx) => !selected.includes(idx))
          .map((cmd, idx) => ({ ...cmd, index: (idx + 1).toString() })),
      );
      setSelected([]);
      showToast(
        `${selected.length} command(s) deleted successfully`,
        "success",
      );
      setLoading((prev) => ({ ...prev, delete: false }));
    }, 500);
  };

  const handleClearAll = () => {
    if (commands.length === 0) {
      showToast("No commands to clear", "info");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL commands? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    setTimeout(() => {
      setCommands([]);
      setSelected([]);

      showToast(
        `All ${commands.length} command(s) deleted successfully`,
        "success",
      );
      setLoading((prev) => ({ ...prev, delete: false }));
    }, 500);
  };

  // Apply all commands
  const handleApply = async () => {
    if (commands.length === 0) {
      showToast(
        "No commands to apply. Please add commands to the table first.",
        "warning",
      );
      return;
    }

    setLoading((prev) => ({ ...prev, apply: true }));
    const failedCommands = [];

    try {
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        try {
          const response = await postLinuxCmd({ cmd: cmd.command.trim() });
          // Check if command failed
          if (
            !response.response ||
            (response.responseData === undefined && response.message)
          ) {
            failedCommands.push({ index: cmd.index, command: cmd.command });
          }
        } catch (error) {
          // Command execution failed
          failedCommands.push({ index: cmd.index, command: cmd.command });
        }
      }

      const latestInfo = await loadIptablesInfo();
      setExecutionLogs(latestInfo || iptablesInfo);

      // Show alert if any commands failed
      if (failedCommands.length > 0) {
        const failedIndices = failedCommands.map((fc) => fc.index).join(", ");
        const failedCount = failedCommands.length;
        const successCount = commands.length - failedCount;

        let alertMessage = "";
        if (successCount > 0) {
          alertMessage = `${successCount} command(s) executed successfully.\n\n`;
        }
        alertMessage += `Failed command(s) at index: ${failedIndices}`;

        showToast(alertMessage, "error");

        if (successCount > 0) {
          showToast(
            `${successCount} succeeded, ${failedCount} failed`,
            "warning",
          );
        } else {
          showToast(`All ${failedCount} command(s) failed`, "error");
        }
      } else {
        showToast(
          `All ${commands.length} command(s) executed successfully`,
          "success",
        );
      }
    } catch (error) {
      console.error("Error applying commands:", error);
      showToast("Failed to apply commands.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, apply: false }));
    }
  };

  return (
    <AccessControlPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{ ...accessControlFixedAlertSx, whiteSpace: "pre-line" }}
        >
          {toast.msg}
        </Alert>
      )}

      <AccessControlBreadcrumb />

      <div style={accessControlTableContainerStyle}>
        <div style={accessControlToolbarStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            {selected.length > 0 && (
              <span style={accessControlSelectedBadgeStyle}>
                {selected.length} {ACCESS_CONTROL_SELECTED_SUFFIX}
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
              disabled={loading.delete || commands.length === 0}
              style={accessControlToolbarBtnStyle}
            >
              {ACCESS_CONTROL_BTN_INVERSE}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleDelete}
              disabled={selected.length === 0 || loading.delete}
              style={accessControlToolbarBtnStyle}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              {loading.delete ? "Deleting..." : ACCESS_CONTROL_BTN_DELETE}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleClearAll}
              disabled={commands.length === 0 || loading.delete}
              style={accessControlToolbarBtnStyle}
            >
              {loading.delete ? "Clearing..." : ACCESS_CONTROL_BTN_CLEAR_ALL}
            </Btn>
            <Btn
              variant="primary"
              onClick={() => handleOpenModal()}
              disabled={loading.save}
              style={accessControlToolbarBtnStyle}
            >
              {ACCESS_CONTROL_BTN_ADD_NEW}
            </Btn>
          </div>
        </div>

        {commands.length === 0 ? (
          <AccessControlTableEmptyState
            onAddNew={() => handleOpenModal()}
            disabled={loading.save}
          />
        ) : (
          <>
            <div
              className={ACCESS_CONTROL_SCROLL_CLASS}
              style={{
                overflowX: "auto",
                overflowY: "auto",
                flex: 1,
              }}
            >
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
                    {ACCESS_CONTROL_TABLE_COLUMNS.map((col) => {
                      if (col.key === "check") {
                        return (
                          <TH
                            key={col.key}
                            style={{
                              width: col.width,
                              padding: 0,
                              borderLeft: "none",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={
                                commands.length > 0 &&
                                selected.length === commands.length
                              }
                              indeterminate={
                                selected.length > 0 &&
                                selected.length < commands.length
                              }
                              onChange={(e) =>
                                e.target.checked
                                  ? handleCheckAll()
                                  : handleUncheckAll()
                              }
                              sx={checkboxSx}
                            />
                          </TH>
                        );
                      }
                      return (
                        <TH
                          key={col.key}
                          style={{
                            ...(col.width ? { width: col.width } : {}),
                            ...(col.key === "modify"
                              ? { borderRight: "none" }
                              : {}),
                          }}
                        >
                          {col.label}
                        </TH>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {commands.map((cmd, rowIdx) => {
                    const isLastRow = rowIdx === commands.length - 1;
                    const isSelected = selected.includes(rowIdx);
                    const rowBg = getAccessControlRowBg(isSelected, rowIdx);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={rowIdx}
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
                          style={getAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              width: 36,
                              borderLeft: "none",
                            },
                          )}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowIdx)}
                            disabled={loading.delete}
                            sx={checkboxSx}
                          />
                        </td>
                        <td
                          style={getAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          {cmd.index}
                        </td>
                        <td
                          style={getAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          {cmd.command}
                        </td>
                        <td
                          style={getAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              borderRight: "none",
                            },
                          )}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <AccessControlEditIcon
                              disabled={loading.delete}
                              onClick={() => handleOpenModal(cmd, rowIdx)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {commands.length > 0 && (
          <div style={accessControlFooterStyle}>
            <span style={{ fontSize: 11, color: C.mutedText }}>
              {ACCESS_CONTROL_SHOWING_RECORDS(
                commands.length,
                ACCESS_CONTROL_RECORD_LABEL,
              )}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                variant="primary"
                onClick={handleApply}
                disabled={loading.apply}
                style={accessControlToolbarBtnStyle}
                startIcon={
                  loading.apply ? (
                    <CircularProgress size={11} style={{ color: "#fff" }} />
                  ) : null
                }
              >
                {ACCESS_CONTROL_BTN_APPLY}
              </Btn>
              <Btn
                variant="cancel"
                onClick={async () => {
                  const latestInfo = await loadIptablesInfo();
                  setExecutionLogs(latestInfo || iptablesInfo);
                  showToast(
                    "Log view reset to current iptables configuration",
                    "info",
                  );
                }}
                disabled={loading.apply}
                style={accessControlToolbarBtnStyle}
              >
                {ACCESS_CONTROL_BTN_CANCEL}
              </Btn>
            </div>
          </div>
        )}
      </div>

      <div style={accessControlLogSectionStyle}>
        <div style={accessControlLogTitleStyle}>{ACCESS_CONTROL_LOG_TITLE}</div>
        <div
          className={ACCESS_CONTROL_SCROLL_CLASS}
          style={accessControlLogBoxStyle}
        >
          <pre style={accessControlLogPreStyle}>{executionLogs}</pre>
        </div>
        <div style={accessControlLogNotesStyle}>
          {ACCESS_CONTROL_LOG_NOTES.map((note, idx) => (
            <div key={idx}>{note}</div>
          ))}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={() => {
          if (!loading.save) handleCloseModal();
        }}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 520,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
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
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          {ACCESS_CONTROL_MODAL_TITLE}
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
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
              }}
            >
              <AccessControlFieldLabel tooltipKey="index">
                Index:
              </AccessControlFieldLabel>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <input
                  type="text"
                  value={form.index || ""}
                  onChange={(e) => handleChange("index", e.target.value)}
                  disabled={editIndex !== null}
                  placeholder={ACCESS_CONTROL_INDEX_PLACEHOLDER}
                  style={
                    editIndex !== null
                      ? { ...disabledInputStyle, width: "100%" }
                      : { ...systemModalFieldInputStyle, width: "100%" }
                  }
                  {...(editIndex === null ? inputInteraction : {})}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
              }}
            >
              <AccessControlFieldLabel tooltipKey="command">
                Command:
              </AccessControlFieldLabel>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <input
                  type="text"
                  value={form.command || ""}
                  onChange={(e) => handleChange("command", e.target.value)}
                  placeholder={ACCESS_CONTROL_COMMAND_PLACEHOLDER}
                  style={{ ...systemModalFieldInputStyle, width: "100%" }}
                  {...inputInteraction}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
            startIcon={
              loading.save ? (
                <CircularProgress size={11} style={{ color: "#fff" }} />
              ) : null
            }
          >
            {loading.save ? "Saving..." : ACCESS_CONTROL_BTN_SAVE}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={accessControlModalCancelBtnStyle}
          >
            {ACCESS_CONTROL_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
    </AccessControlPageShell>
  );
};

export default AccessControl;
