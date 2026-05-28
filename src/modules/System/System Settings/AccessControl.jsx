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
      padding: "12px 14px",
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
  padding: "10px 14px",
  fontSize: 13,
  color: "#0f172a",
  textAlign: "center",
  background: "#ffffff",
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
            padding: "14px 18px",
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
              style={{ height: 30, minWidth: 110 }}
            >
              + Add New
            </Btn>
          </div>
        </div>

        <div
          ref={tableScrollRef}
          className="scrollbar-hide w-full overflow-x-auto"
          style={{
            maxHeight: 400,
            overflowY: "auto",
            scrollbarWidth: "auto",
          }}
          onScroll={() => {
            if (tableScrollRef.current) {
              const el = tableScrollRef.current;
              setScrollState({
                left: el.scrollLeft,
                width: el.clientWidth,
                scrollWidth: el.scrollWidth,
              });
              setShowCustomScrollbar(el.scrollWidth > el.clientWidth);
            }
          }}
        >
          <table
            className="w-full md:min-w-[700px]"
            style={{ borderCollapse: "separate", borderSpacing: 0 }}
          >
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr>
                <TH style={{ borderLeft: "none" }}>
                  <Checkbox
                    size="small"
                    checked={
                      commands.length > 0 && selected.length === commands.length
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
                <TH>Id</TH>
                <TH>Command</TH>
                <TH style={{ borderRight: "none" }}>Modify</TH>
              </tr>
            </thead>
            <tbody>
              {commands.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      ...tdStyle,
                      borderLeft: "none",
                      borderRight: "none",
                      borderBottom: "none",
                      padding: "32px 14px",
                      color: C.mutedText,
                    }}
                  >
                    No data
                  </td>
                </tr>
              ) : (
                pagedCommands.map((cmd, pageIdx) => {
                  const rowIdx = (page - 1) * itemsPerPage + pageIdx;
                  const isLastRow = pageIdx === pagedCommands.length - 1;
                  const lastRowCellStyle = isLastRow
                    ? { borderBottom: "none" }
                    : {};
                  return (
                    <tr
                      key={rowIdx}
                      className="hover:bg-[#f8fafc] transition-colors"
                    >
                      <td
                        style={{
                          ...tdStyle,
                          ...lastRowCellStyle,
                          borderLeft: "none",
                          ...(isLastRow ? { borderBottomLeftRadius: 0 } : {}),
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={selected.includes(rowIdx)}
                          onChange={() => handleSelectRow(rowIdx)}
                          disabled={loading.delete}
                          sx={checkboxSx}
                        />
                      </td>
                      <td style={{ ...tdStyle, ...lastRowCellStyle }}>
                        {cmd.index}
                      </td>
                      <td style={{ ...tdStyle, ...lastRowCellStyle }}>
                        {cmd.command}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          ...lastRowCellStyle,
                          borderRight: "none",
                          ...(isLastRow ? { borderBottomRightRadius: 0 } : {}),
                        }}
                      >
                        <EditDocumentIcon
                          className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                          titleAccess="Edit"
                          onClick={() => {
                            if (!loading.delete) handleOpenModal(cmd, rowIdx);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: C.footerBg,
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: CARD_RADIUS,
            borderBottomRightRadius: CARD_RADIUS,
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
            backgroundColor: "#f8fafc",
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
            display: "flex",
            flexDirection: "column",
            gap: 3,
            p: 3,
            pt: "24px !important",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: editIndex !== null ? "#f1f5f9" : "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "6px 12px",
              }}
            >
              <label
                style={{
                  width: 110,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                  marginRight: 10,
                  whiteSpace: "nowrap",
                }}
              >
                Index:
              </label>
              <input
                type="text"
                value={form.index || ""}
                onChange={(e) => handleChange("index", e.target.value)}
                disabled={editIndex !== null}
                placeholder="Auto-generated"
                style={{
                  flex: 1,
                  fontSize: 13,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #cbd5e1",
                  background: editIndex !== null ? "#f1f5f9" : "#ffffff",
                  color: editIndex !== null ? "#94a3b8" : "#1e293b",
                  outline: "none",
                  width: "100%",
                  cursor: editIndex !== null ? "not-allowed" : "text",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => {
                  if (editIndex === null)
                    e.target.style.borderColor = "#0284c7";
                }}
                onBlur={(e) => {
                  if (editIndex === null)
                    e.target.style.borderColor = "#cbd5e1";
                }}
                onMouseEnter={(e) => {
                  if (editIndex === null && document.activeElement !== e.target)
                    e.target.style.borderColor = "#64748b";
                }}
                onMouseLeave={(e) => {
                  if (editIndex === null && document.activeElement !== e.target)
                    e.target.style.borderColor = "#cbd5e1";
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "6px 12px",
              }}
            >
              <label
                style={{
                  width: 110,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                  marginRight: 10,
                  whiteSpace: "nowrap",
                }}
              >
                Command:
              </label>
              <input
                type="text"
                value={form.command || ""}
                onChange={(e) => handleChange("command", e.target.value)}
                placeholder="e.g., iptables -P OUTPUT ACCEPT"
                style={{
                  flex: 1,
                  fontSize: 13,
                  padding: "6px 8px",
                  borderRadius: 4,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#1e293b",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0284c7")}
                onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target)
                    e.target.style.borderColor = "#64748b";
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target)
                    e.target.style.borderColor = "#cbd5e1";
                }}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            p: 3,
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
