import React, { useState, useRef, useEffect } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { postLinuxCmd } from "../../../api/apiService";
import { IPTABLES_INFO } from "../../../constants/AccessControlConstants";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 10px 30px rgba(15,23,42,0.06)",
  gridHeaderBg: "#F8FAFC",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
  footerBg: "#ffffff",
};

const CARD_RADIUS = 20;

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
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    delete: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    edit: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    error: {
      background: C.errorRed,
      color: C.cardBg,
      border: `1px solid ${C.errorRed}`,
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "error":
        return "#b91c1c";
      case "delete":
        return "#fecaca";
      case "edit":
        return "#bbf7d0";
      case "cancel":
        return "#b6c2d3";
      case "outline":
        return "#e2e8f0";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

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
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
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

  // Scroll state for custom horizontal scrollbar
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    left: 0,
    width: 0,
    scrollWidth: 0,
  });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(commands.length / itemsPerPage));
  const pagedCommands = commands.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [commands.length, totalPages, page]);

  // Update scroll state when data changes
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
  }, [commands]);

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
      const nextIndex = commands.length.toString();
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
      setCommands((prev) => prev.filter((_, idx) => !selected.includes(idx)));
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

  // Scroll handling functions
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

  // Calculate scrollbar thumb dimensions
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
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* ── Alerts ── */}
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
            boxShadow: 3,
          }}
        >
          {toast.msg}
        </Alert>
      )}

      {/* ── Breadcrumbs ── */}
      <div className="w-full" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>System</span>
          <span>&gt;</span>
          <span>System Settings</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Access Control{" "}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="w-full mx-auto"
        style={{
          maxWidth: 1000,
          background: C.cardBg,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: C.cardShadow,
          marginBottom: 24,
          border: `1.5px solid ${C.cardBorder}`,
        }}
      >
        {/* ── Toolbar ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 44,
            padding: "7px 14px",
            borderBottom: `1px solid ${C.cardBorder}`,
            background: "#ffffff",
            borderTopLeftRadius: CARD_RADIUS,
            borderTopRightRadius: CARD_RADIUS,
          }}
        >
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
              disabled={loading.delete || commands.length === 0}
              style={{ height: 30 }}
            >
              Inverse
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleDelete}
              disabled={selected.length === 0 || loading.delete}
              style={{ height: 30 }}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              {loading.delete ? "Deleting..." : "Delete"}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleClearAll}
              disabled={commands.length === 0 || loading.delete}
              style={{ height: 30 }}
            >
              {loading.delete ? "Clearing..." : "Clear All"}
            </Btn>
            <Btn
              variant="primary"
              onClick={() => handleOpenModal()}
              disabled={loading.save}
              style={{ height: 30 }}
            >
              + Add New
            </Btn>
          </div>
        </div>

        <div
          ref={commands.length > 0 ? tableScrollRef : undefined}
          className={commands.length > 0 ? "scrollbar-hide w-full" : "w-full"}
          style={
            commands.length === 0
              ? {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 150,
                  padding: 24,
                  textAlign: "center",
                }
              : {
                  overflowX: "auto",
                  overflowY: "auto",
                  flex: 1,
                }
          }
          onScroll={
            commands.length > 0
              ? () => {
                  if (tableScrollRef.current) {
                    const el = tableScrollRef.current;
                    setScrollState({
                      left: el.scrollLeft,
                      width: el.clientWidth,
                      scrollWidth: el.scrollWidth,
                    });
                    setShowCustomScrollbar(el.scrollWidth > el.clientWidth);
                  }
                }
              : undefined
          }
        >
          {commands.length === 0 ? (
            <>
              <div
                style={{
                  color: "#3E5475",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                No command configured!
              </div>
              <Btn
                onClick={() => handleOpenModal()}
                variant="cancel"
                disabled={loading.save}
                style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
              >
                + Add New Command
              </Btn>
            </>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
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
                      checked={
                        commands.length > 0 &&
                        selected.length === commands.length
                      }
                      indeterminate={
                        selected.length > 0 && selected.length < commands.length
                      }
                      onChange={(e) =>
                        e.target.checked ? handleCheckAll() : handleUncheckAll()
                      }
                      sx={checkboxSx}
                    />
                  </TH>
                  <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>Id</TH>
                  <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                    Command
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
                {pagedCommands.map((cmd, pageIdx) => {
                  const rowIdx = (page - 1) * itemsPerPage + pageIdx;
                  const isLastRow = pageIdx === pagedCommands.length - 1;
                  const isSelected = selected.includes(rowIdx);
                  const rowBg = isSelected
                    ? "#f0f9ff"
                    : pageIdx % 2 === 1
                      ? "#f8fafc"
                      : "#ffffff";
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
                          background: rowBg,
                          borderLeft: "none",
                          width: 36,
                          ...lastRowCellStyle,
                          ...(isLastRow
                            ? { borderBottomLeftRadius: CARD_RADIUS }
                            : {}),
                        }}
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
                        style={{
                          ...tdStyle,
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
                      >
                        {cmd.index}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
                      >
                        {cmd.command}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          background: rowBg,
                          borderRight: "none",
                          ...lastRowCellStyle,
                          ...(isLastRow
                            ? { borderBottomRightRadius: CARD_RADIUS }
                            : {}),
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
                            onClick={() => {
                              if (!loading.delete) handleOpenModal(cmd, rowIdx);
                            }}
                            style={{
                              cursor: loading.delete
                                ? "not-allowed"
                                : "pointer",
                              color: "#2563eb",
                              fontSize: 22,
                              opacity: loading.delete ? 0.4 : 0.7,
                              transition: "opacity 0.15s ease",
                              pointerEvents: loading.delete ? "none" : "auto",
                            }}
                            onMouseEnter={(e) => {
                              if (!loading.delete)
                                e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              if (!loading.delete)
                                e.currentTarget.style.opacity = "0.7";
                            }}
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

        {/* ── Footer ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "7px 14px",
            background: C.footerBg,
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: CARD_RADIUS,
            borderBottomRightRadius: CARD_RADIUS,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 11, color: C.mutedText }}>
              Showing {commands.length} record{commands.length !== 1 ? "s" : ""}
            </span>
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
              variant="primary"
              onClick={handleApply}
              disabled={loading.apply}
              style={{ height: 30 }}
            >
              {loading.apply && (
                <CircularProgress size={12} color="inherit" sx={{ mr: 0.5 }} />
              )}{" "}
              Apply
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
              style={{ height: 30 }}
            >
              Cancel
            </Btn>
          </div>
        </div>
      </div>

      {/* Iptables Info Log Field */}
      <div className="w-full max-w-[900px] mx-auto mt-4 flex flex-col items-center">
        <div className="text-gray-600 text-sm font-semibold mb-2 text-center">
          Iptables Info
        </div>
        <div
          className="w-full bg-white border-2 border-gray-400 rounded-md shadow-sm overflow-y-auto p-3 resize-y"
          style={{ minHeight: 140, maxHeight: 320 }}
        >
          <pre
            className="w-full h-full bg-white text-gray-800 text-xs font-mono whitespace-pre-wrap m-0 p-0"
            style={{ minHeight: 120, maxHeight: 260, fontSize: "11px" }}
          >
            {executionLogs}
          </pre>
        </div>
        <div className="mt-2 text-[11px] text-red-600 text-center">
          <div>
            Note: Please don't enable "SIP" =&gt; "Calls from SIP Trunk Address
            only".
          </div>
          <div>
            Note: Application and cancel application buttons are for all current
            set rules, not direct at a certain rule.
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Command */}
      <Dialog
        open={showModal}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          if (!loading.save) handleCloseModal();
        }}
        maxWidth={false}
        className="z-50"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        }}
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "95vw",
            mx: "auto",
            borderRadius: "8px",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
            backgroundImage: "none",
          },
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#1e2d42",
            borderBottom: `1px solid ${C.divider}`,
            px: 3,
            py: 2,
            textAlign: "center",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          Access Control Command
        </DialogTitle>
        <DialogContent
          sx={{
            p: "24px",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
              marginTop: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <label
                style={{
                  width: 170,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                Index:
              </label>
              <div style={{ width: "min(100%, 320px)" }}>
                <input
                  type="text"
                  value={form.index || ""}
                  onChange={(e) => handleChange("index", e.target.value)}
                  disabled={editIndex !== null}
                  placeholder="Auto-generated"
                  style={{
                    fontSize: 13,
                    padding: "0 8px",
                    height: 32,
                    borderRadius: 4,
                    border: `1px solid ${C.cardBorder}`,
                    background: editIndex !== null ? "#f1f5f9" : "#ffffff",
                    color: editIndex !== null ? "#94a3b8" : "#1e293b",
                    outline: "none",
                    width: "100%",
                    cursor: editIndex !== null ? "not-allowed" : "text",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    if (editIndex === null)
                      e.target.style.borderColor = "#0284c7";
                  }}
                  onBlur={(e) => {
                    if (editIndex === null)
                      e.target.style.borderColor = C.cardBorder;
                  }}
                  onMouseEnter={(e) => {
                    if (
                      editIndex === null &&
                      document.activeElement !== e.target
                    )
                      e.target.style.borderColor = "#64748b";
                  }}
                  onMouseLeave={(e) => {
                    if (
                      editIndex === null &&
                      document.activeElement !== e.target
                    )
                      e.target.style.borderColor = C.cardBorder;
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <label
                style={{
                  width: 170,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                Command:
              </label>
              <div style={{ width: "min(100%, 320px)" }}>
                <input
                  type="text"
                  value={form.command || ""}
                  onChange={(e) => handleChange("command", e.target.value)}
                  placeholder="e.g., iptables -P OUTPUT ACCEPT"
                  style={{
                    fontSize: 13,
                    padding: "0 8px",
                    height: 32,
                    borderRadius: 4,
                    border: `1px solid ${C.cardBorder}`,
                    background: "#ffffff",
                    color: "#1e293b",
                    outline: "none",
                    width: "100%",
                    transition: "border-color 0.2s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0284c7")}
                  onBlur={(e) => (e.target.style.borderColor = C.cardBorder)}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target)
                      e.target.style.borderColor = "#64748b";
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target)
                      e.target.style.borderColor = C.cardBorder;
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            py: "10px",
            px: "16px",
            borderTop: `1px solid ${C.divider}`,
            backgroundColor: "#f8fafc",
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 36, fontSize: 13 }}
            startIcon={
              loading.save && <CircularProgress size={16} color="inherit" />
            }
          >
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={{ minWidth: 100, height: 36, fontSize: 13 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AccessControl;
