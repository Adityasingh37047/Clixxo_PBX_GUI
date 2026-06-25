import React, { useState, useRef, useEffect } from "react";
import {
  IP_CALL_IN_CALLEEID_FIELDS,
  IP_CALL_IN_CALLEEID_TABLE_COLUMNS,
  IP_CALL_IN_CALLEEID_INITIAL_FORM,
  IP_CALL_IN_CALLEEID_FIELD_TOOLTIPS,
} from "../../../constants/FxsIPCallInCalleeIDConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  CircularProgress,
  TextField,
  Alert,
  Tooltip,
} from "@mui/material";
const C = {
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  accent: "var(--accent-brand)",
};

const CARD_RADIUS = 10;

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--row-alt)]`;
const BTN_OUTLINE = `${BTN_BASE} bg-[var(--bg-surface)] text-[var(--text-label)] border-[var(--border-strong)] hover:bg-[var(--row-alt)]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "var(--bg-surface)",
  "& .MuiOutlinedInput-root": { minHeight: 36, backgroundColor: "var(--bg-surface)" },
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
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: OUTLINED_HOVER },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};

const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "var(--table-header-bg)",
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
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const FXS_NUM_PAGE = "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px]";
const FXS_NUM_INNER = "w-full max-w-full mx-auto";
const FXS_NUM_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const FXS_NUM_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-t-[10px]";
const FXS_NUM_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const FXS_NUM_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[var(--text-label)]";
const FXS_NUM_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] rounded-b-[10px]";
const FXS_NUM_PAGE_BADGE =
  "rounded-[6px] border border-[var(--border-strong)] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[var(--text-label)]";
const FXS_NUM_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const modalInputProps = {
  style: { fontSize: 13, height: 32, padding: "0 8px", boxSizing: "border-box" },
};

const numDialogTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const numDialogContentStyle = { padding: "24px", backgroundColor: "var(--bg-surface)" };

const numDialogFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "var(--row-alt)",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const numDialogFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
};

const numDialogFieldLabelStyle = {
  fontSize: 13,
  color: C.labelText,
  fontWeight: 600,
  whiteSpace: "nowrap",
  width: 170,
  lineHeight: 1.2,
  textAlign: "left",
};

const numDialogFieldControlStyle = { width: "min(100%, 320px)" };

const numDialogActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "var(--row-alt)",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const numDialogPaperSx = {
  width: 600,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const FxsNumBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>Num Manipulate</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const listNumberManipulations = async () => ({ response: true, message: [] });
const createNumberManipulation = async () => ({
  response: true,
  message: "Created successfully",
});
const updateNumberManipulation = async () => ({
  response: true,
  message: "Updated successfully",
});
const deleteNumberManipulation = async () => ({
  response: true,
  message: "Deleted successfully",
});
const listGroups = async () => ({ response: true, message: [] });

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
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
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

const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
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

const IPCallInCalleeID = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(IP_CALL_IN_CALLEEID_INITIAL_FORM);
  const [rules, setRules] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
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
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please/i.test(msg) && !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

  const tableScrollRef = useRef(null);

  const fetchNumberManipulations = async () => {
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listNumberManipulations("ip_in_calleeid");
      if (response.response && response.message) {
        setRules(response.message);
      } else {
        setRules([]);
      }
    } catch (error) {
      console.error("Error fetching number manipulations:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else if (error.response?.status === 500) {
        alert(
          "Server error. The number manipulations endpoint may have issues.",
        );
      } else {
        alert(error.message || "Failed to load number manipulations");
      }
      setRules([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const handleOpenModal = (item = null, index = -1) => {
    if (item) {
      setFormData({
        ...item,
        stripped_digits_from_left:
          item.stripped_digits_from_left === "" ||
          item.stripped_digits_from_left == null
            ? "0"
            : String(item.stripped_digits_from_left),
        stripped_digits_from_right:
          item.stripped_digits_from_right === "" ||
          item.stripped_digits_from_right == null
            ? "0"
            : String(item.stripped_digits_from_right),
        reserved_digits_from_right:
          item.reserved_digits_from_right === "" ||
          item.reserved_digits_from_right == null
            ? "0"
            : String(item.reserved_digits_from_right),
      });
      setEditIndex(item.id);
    } else {
      setFormData({ ...IP_CALL_IN_CALLEEID_INITIAL_FORM });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    if (!formData.call_initiator) {
      alert("Call Initiator is required.");
      return;
    }
    if (!formData.callerid_prefix) {
      alert("CallerID Prefix is required.");
      return;
    }
    if (!formData.calleeid_prefix) {
      alert("CalleeID Prefix is required.");
      return;
    }

    const normalized = {
      ...formData,
      stripped_digits_from_left:
        formData.stripped_digits_from_left === "" ||
        formData.stripped_digits_from_left == null
          ? "0"
          : String(formData.stripped_digits_from_left),
      stripped_digits_from_right:
        formData.stripped_digits_from_right === "" ||
        formData.stripped_digits_from_right == null
          ? "0"
          : String(formData.stripped_digits_from_right),
      reserved_digits_from_right:
        formData.reserved_digits_from_right === "" ||
        formData.reserved_digits_from_right == null
          ? "0"
          : String(formData.reserved_digits_from_right),
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      let response;
      if (editIndex !== null) {
        const updateData = {
          id: editIndex,
          call_initiator: normalized.call_initiator,
          callerid_prefix: normalized.callerid_prefix,
          calleeid_prefix: normalized.calleeid_prefix,
          with_original_calleeid: normalized.with_original_calleeid || "No",
          stripped_digits_from_left: normalized.stripped_digits_from_left,
          stripped_digits_from_right: normalized.stripped_digits_from_right,
          reserved_digits_from_right: normalized.reserved_digits_from_right,
          prefix_to_add: normalized.prefix_to_add,
          suffix_to_add: normalized.suffix_to_add,
          description: normalized.description,
        };
        response = await updateNumberManipulation(updateData, "ip_in_calleeid");
        if (response.response) {
          alert(
            response.message || "Number manipulation updated successfully!",
          );
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchNumberManipulations();
          } catch (reloadError) {
            setRules((prev) =>
              prev.map((rule) =>
                rule.id === editIndex ? { ...rule, ...normalized } : rule,
              ),
            );
          }
        } else {
          alert("Failed to update number manipulation");
        }
      } else {
        response = await createNumberManipulation(normalized, "ip_in_calleeid");
        if (response.response) {
          alert(
            response.message || "Number manipulation created successfully!",
          );
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await fetchNumberManipulations();
          } catch (reloadError) {
            const newItem = {
              ...normalized,
              id: Date.now(),
              manipulation_type: "ip_in_calleeid",
            };
            setRules((prev) => [...prev, newItem]);
          }
        } else {
          alert("Failed to create number manipulation");
        }
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving number manipulation:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to save number manipulation");
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      rules
        .map((_, idx) => (!selected.includes(idx) ? idx : null))
        .filter((i) => i !== null),
    );
  const handleDelete = async () => {
    if (selected.length === 0) {
      alert("Please select items to delete");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected item(s)?`,
    );
    if (!confirmed) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selected.map(async (idx) => {
        const item = rules[idx];
        if (item && item.id) {
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value &&
          result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        alert(`${successCount} item(s) deleted successfully`);
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
          const selectedItems = selected.map((idx) => rules[idx]);
          const selectedIds = selectedItems.map((item) => item.id);
          setRules((prev) =>
            prev.filter((item) => !selectedIds.includes(item.id)),
          );
        }
        setSelected([]);
      }

      if (failCount > 0) {
        alert(`Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error deleting selected items:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to delete selected items");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (rules.length === 0) {
      alert("No data to clear");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL number manipulations? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = rules.map(async (item) => {
        if (item && item.id) {
          return await deleteNumberManipulation(item.id);
        }
        return null;
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) =>
          result.status === "fulfilled" &&
          result.value &&
          result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        alert(`All ${successCount} item(s) deleted successfully`);
        try {
          await fetchNumberManipulations();
        } catch (reloadError) {
          setRules([]);
        }
        setSelected([]);
        setPage(1);
      }

      if (failCount > 0) {
        alert(`Failed to delete ${failCount} item(s)`);
      }
    } catch (error) {
      console.error("Error clearing all items:", error);
      if (error.message === "Network Error") {
        alert("Network error. Please check your connection.");
      } else {
        alert(error.message || "Failed to clear all items");
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleTableScroll = (e) => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  useEffect(() => {
    fetchNumberManipulations();
  }, []);

  const handleRefresh = async () => {
    await fetchNumberManipulations();
  };

  const renderCellValue = (col, item) => {
    if (
      item[col.key] !== undefined &&
      item[col.key] !== null &&
      item[col.key] !== ""
    ) {
      return String(item[col.key]);
    }
    return "--";
  };

  const modalFields = IP_CALL_IN_CALLEEID_FIELDS;

  return (
    <div className={FXS_NUM_PAGE}>
      <div className={FXS_NUM_INNER}>
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={FXS_NUM_TOAST_SX}
          >
            {toast.msg}
          </Alert>
        )}
        <FxsNumBreadcrumb current="IP Call In CalleeID" />

        <div className={FXS_NUM_CARD}>
          <div className={FXS_NUM_TOOLBAR}>
            <div className="flex items-center gap-[8px]">
              {selected.length > 0 && (
                <span className={FXS_NUM_SELECTED_BADGE}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className={FXS_NUM_TOOLBAR_ACTIONS}>
              <Btn
                variant="cancel"
                onClick={handleInverse}
                disabled={loading.delete || rules.length === 0}
              >
                Inverse
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
              >
                {loading.delete ? (
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
                onClick={handleClearAll}
                disabled={loading.delete || rules.length === 0}
              >
                {loading.delete ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Clear All"
                )}
              </Btn>
              <Btn
                variant="cancel"
                onClick={handleRefresh}
                disabled={loading.fetch}
              >
                {loading.fetch ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  "Refresh"
                )}
              </Btn>
              <Btn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {loading.fetch ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 280,
                  borderBottomLeftRadius: CARD_RADIUS,
                  borderBottomRightRadius: CARD_RADIUS,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <CircularProgress size={28} style={{ color: C.accent }} />
                  <div
                    style={{
                      marginTop: 12,
                      color: "var(--text-primary)",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Loading number manipulations...
                  </div>
                </div>
              </div>
            ) : rules.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 240,
                  padding: 24,
                  textAlign: "center",
                  borderBottomLeftRadius: CARD_RADIUS,
                  borderBottomRightRadius: CARD_RADIUS,
                }}
              >
                <div
                  style={{
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No available number manipulation rule (IP Call In CalleeID)!
                </div>
                <Btn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  className="!rounded-[6px] !px-[24px] !py-[8px]"
                >
                  + Add New Rule
                </Btn>
              </div>
            ) : (
              <>
                <div
                  ref={tableScrollRef}
                  onScroll={handleTableScroll}
                  style={{
                    overflowX: "auto",
                    overflowY: "auto",
                    maxHeight: 460,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                    }}
                  >
                    <thead>
                      <tr>
                        <TH
                          style={{ width: 40, padding: 0, borderLeft: "none" }}
                        >
                          <Checkbox
                            size="small"
                            checked={
                              rules.length > 0 &&
                              selected.length === rules.length
                            }
                            indeterminate={
                              selected.length > 0 &&
                              selected.length < rules.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) handleCheckAll();
                              else handleUncheckAll();
                            }}
                            sx={checkboxSx}
                          />
                        </TH>
                        <TH style={{ width: 50 }}>ID</TH>
                        {IP_CALL_IN_CALLEEID_TABLE_COLUMNS.map((col) => (
                          <TH key={col.key}>{col.label}</TH>
                        ))}
                        <TH style={{ width: 60, borderRight: "none" }}>
                          Modify
                        </TH>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRules.map((item, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const isLastRow = idx === pagedRules.length - 1;
                        const rowBg = isSelected
                          ? "#f0f9ff"
                          : idx % 2 === 1
                            ? "#f8fafc"
                            : "#ffffff";
                        const lastRowCellStyle = isLastRow
                          ? { borderBottom: "none" }
                          : {};

                        return (
                          <tr
                            key={item.id || realIdx}
                            style={{
                              background: rowBg,
                              borderBottom: isLastRow
                                ? "none"
                                : `1px solid ${C.cardBorder}`,
                              transition: "background-color 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected)
                                e.currentTarget.style.background = "var(--row-alt)";
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
                                ...(isLastRow
                                  ? { borderBottomLeftRadius: CARD_RADIUS }
                                  : {}),
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => handleSelectRow(idx)}
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
                              {realIdx + 1}
                            </td>
                            {IP_CALL_IN_CALLEEID_TABLE_COLUMNS.map((col) => (
                              <td
                                key={col.key}
                                style={{
                                  ...tdStyle,
                                  background: rowBg,
                                  ...lastRowCellStyle,
                                }}
                              >
                                {renderCellValue(col, item)}
                              </td>
                            ))}
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
                                  style={{
                                    cursor: "pointer",
                                    color: "#2563eb",
                                    fontSize: 22,
                                    opacity: 0.7,
                                    transition: "opacity 0.15s ease",
                                  }}
                                  onClick={() => handleOpenModal(item, realIdx)}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.opacity = "1")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.opacity = "0.7")
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className={FXS_NUM_PAGINATION}>
                  <span className="text-[11px] text-[#94a3b8]">
                    Showing {pagedRules.length} record
                    {pagedRules.length !== 1 ? "s" : ""} on page {page}
                  </span>
                  <div className="flex gap-[8px]">
                    <Btn
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      variant="outline"
                    >
                      ← Prev
                    </Btn>
                    <span className={FXS_NUM_PAGE_BADGE}>
                      Page {page} of {totalPages}
                    </span>
                    <Btn
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      variant="outline"
                    >
                      Next →
                    </Btn>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{ sx: numDialogPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={numDialogTitleStyle}>
          {editIndex !== null
            ? "Edit IP Call In CalleeID"
            : "Add IP Call In CalleeID"}
        </DialogTitle>
        <DialogContent style={numDialogContentStyle}>
          <div style={numDialogFormStyle}>
            {modalFields.map((field) => (
              <div
                key={field.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <FxsFieldLabel
                  tooltipKey={field.name}
                  tooltips={IP_CALL_IN_CALLEEID_FIELD_TOOLTIPS}
                  style={{
                    fontSize: 13,
                    width: 170,
                    lineHeight: 1.2,
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                  }}
                >
                  {field.label}
                </FxsFieldLabel>
                <div style={{ width: "min(100%, 320px)" }}>                  {field.type === "select" ? (
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleInputChange({
                            target: { name: field.name, value: e.target.value },
                          })
                        }
                        variant="outlined"
                        sx={muiSelectSx}
                      >
                        {field.options.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 14 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  ) : (
                    <TextField
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleInputChange}
                      size="small"
                      fullWidth
                      variant="outlined"
                      inputProps={modalInputProps}
                      sx={muiTextFieldSx}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions style={numDialogActionsStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{
              minWidth: 100,
              height: 33,
              fontSize: 13,
              padding: "6px 28px",
              textTransform: "none",
            }}
          >
            {loading.save
              ? "Saving..."
              : editIndex !== null
                ? "Update"
                : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IPCallInCalleeID;
