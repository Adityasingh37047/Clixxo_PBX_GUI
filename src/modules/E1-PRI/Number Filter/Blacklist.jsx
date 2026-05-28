import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Checkbox from "@mui/material/Checkbox";
import {
  saveCallerBlacklist,
  saveCalleeBlacklist,
  fetchAllNumberFilters,
  fetchNumberFilters,
  deleteNumberFilter,
  deleteAllNumberFilters,
} from "../../../api/apiService";

// ── Color palette (matches Number-Receiving Rule) ─────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 20;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    default: {
      background: " #cbd5e1",
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
      borderRadius: 6,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: `0.5px solid #fecaca`,
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
      case "cancel":
        return "#b6c2d3";
      case "danger":
        return "#fca5a5";
      case "outline":
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
      {children}
    </button>
  );
};

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
  color: C.valueText,
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

  const fetchBlacklistData = async () => {
    setIsInitialLoading(true);
    try {
      const response = await fetchAllNumberFilters("blacklist");
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
      if (modalType === "caller") {
        await saveCallerBlacklist({
          groupNo: modalData.groupNo,
          noInGroup: modalData.noInGroup,
          callerId: modalData.idValue,
        });
        displayToast(
          isEditMode
            ? "Caller ID updated successfully!"
            : "Caller ID saved successfully!",
          "success",
        );
      } else {
        await saveCalleeBlacklist({
          groupNo: modalData.groupNo,
          noInGroup: modalData.noInGroup,
          calleeId: modalData.idValue,
        });
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
            "blacklist",
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
              "blacklist",
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
    onDelete,
    onClear,
    onAddNew,
    onEdit,
    idKey,
  }) => {
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Top Actions Bar */}
          <div
            style={{
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              background: "#ffffff",
              borderBottom: `1px solid ${C.cardBorder}`,
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
            }}
          >
            {/* Left Section */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#3E5475",
                  letterSpacing: "0.02em",
                }}
              >
                {title}
              </span>
              {checkedItems.length > 0 && (
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
                  {checkedItems.length} selected
                </span>
              )}
            </div>

            {/* Right Section: Actions */}
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
                style={{ height: 30 }}
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
                style={{ height: 30 }}
              >
                Clear All
              </Btn>
              <Btn
                variant="primary"
                onClick={onAddNew}
                disabled={isDeleting}
                style={{
                  height: 30,
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 10,
                }}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
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
                  <TH style={{ width: 56, borderLeft: "none" }}>Check</TH>
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
                        color: "#3E5475",
                        fontSize: 13,
                        fontWeight: 600,
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
                        <td style={{ ...tdStyle, background: rowBg, ...lastRowCellStyle }}>
                          {row.groupNo}
                        </td>
                        <td style={{ ...tdStyle, background: rowBg, ...lastRowCellStyle }}>
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
                                cursor: "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onClick={() => onEdit(row)}
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderTop: `1px solid ${C.cardBorder}`,
              background: "#ffffff",
              borderBottomLeftRadius: CARD_RADIUS,
              borderBottomRightRadius: CARD_RADIUS,
            }}
          >
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
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      {/* Alerts */}
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

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            display: "flex",
            gap: 4,
          }}
        >
          E1-PRI &rsaquo; Number Filter &rsaquo;{" "} 
          <span style={{ color: C.valueText, fontWeight: 600 }}>
            Blacklist
          </span>
        </div>

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
              Loading blacklist data...
            </span>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {renderTablePanel({
                title: "CallerID Blacklist",
                rows: callerRows,
                checkedItems: callerChecked,
                onCheck: handleCallerCheck,
                onDelete: handleCallerDelete,
                onClear: handleCallerClear,
                onAddNew: () => handleAddNew("caller"),
                onEdit: (row) => handleEdit("caller", row),
                idKey: "callerId",
              })}
              {renderTablePanel({
                title: "CalleeID Blacklist",
                rows: calleeRows,
                checkedItems: calleeChecked,
                onCheck: handleCalleeCheck,
                onDelete: handleCalleeDelete,
                onClear: handleCalleeClear,
                onAddNew: () => handleAddNew("callee"),
                onEdit: (row) => handleEdit("callee", row),
                idKey: "calleeId",
              })}
            </div>

            <div
              style={{
                textAlign: "center",
                color: "#dc2626",
                fontSize: 12,
                marginTop: 24,
                padding: "8px 16px",
                borderRadius: 6,
              }}
            >
              Note: The one list, only the latest 200 pieces will be displayed.
              To check all the records, please backup the file.
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "95vw",
            mx: "auto",
            p: 0,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
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
            textAlign: "center",
            padding: "16px 24px",
          }}
        >
          {modalType === "caller"
            ? "CallerIDs in Blacklist"
            : "CalleeIDs in Blacklist"}
        </DialogTitle>

        <DialogContent style={{ padding: "24px", backgroundColor: "#f8fafc" }}>
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Group No. */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 140,
                  whiteSpace: "normal",
                  lineHeight: 1.2,
                }}
              >
                Group No.:
              </label>
              <MuiSelect
                value={modalData.groupNo}
                onChange={(e) => handleGroupNoChange(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  fontSize: 13,
                  height: 36,
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: C.cardBorder,
                    transition: "border-color 0.2s ease",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#64748b",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0284c7 !important",
                    borderWidth: "1px !important",
                  },
                }}
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
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 140,
                  whiteSpace: "normal",
                  lineHeight: 1.2,
                }}
              >
                {modalType === "caller" ? "CallerID:" : "CalleeID:"}
              </label>
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
                sx={{
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: C.cardBorder,
                      transition: "border-color 0.2s ease",
                    },
                    "&:hover fieldset": {
                      borderColor: "#64748b",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0284c7",
                      borderWidth: 1,
                    },
                  },
                }}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions
          style={{
            background: "#ffffff",
            padding: "16px 24px",
            borderTop: `1px solid ${C.cardBorder}`,
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            variant="primary"
            style={{ width: 120, height: 38 }}
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
            style={{ width: 120, height: 38 }}
            disabled={isLoading}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Blacklist;
