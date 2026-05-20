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
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  saveCallerBlacklist,
  saveCalleeBlacklist,
  fetchAllNumberFilters,
  fetchNumberFilters,
  deleteNumberFilter,
  deleteAllNumberFilters,
} from "../../../api/apiService";

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

// ── Shared: Action Button ─────────────────────────────────────────────────────
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

// ── Shared: Table Header ──────────────────────────────────────────────────────
const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const Blacklist = () => {
  const [callerRows, setCallerRows] = useState([]);
  const [calleeRows, setCalleeRows] = useState([]);
  const [callerSearch, setCallerSearch] = useState("");
  const [calleeSearch, setCalleeSearch] = useState("");
  const [callerSearchFocused, setCallerSearchFocused] = useState(false);
  const [calleeSearchFocused, setCalleeSearchFocused] = useState(false);
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
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    fetchBlacklistData();
  }, []);

  const displayToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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

  const handleCallerSearch = async () => {
    if (!callerSearch.trim()) {
      displayToast("Please enter a caller ID to search", "error");
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetchNumberFilters(
        "blacklist",
        callerSearch.trim(),
      );
      if (response && response.success && response.data) {
        const callerData = response.data
          .filter((item) => item.type === "callerid")
          .map((item) => ({
            groupNo: item.group,
            noInGroup: item.no_of_groups,
            callerId: item.number,
          }))
          .sort((a, b) => {
            const g = parseInt(a.groupNo) - parseInt(b.groupNo);
            return g !== 0 ? g : parseInt(a.noInGroup) - parseInt(b.noInGroup);
          });
        setCallerRows(callerData);
        if (callerData.length === 0)
          displayToast("No caller IDs found matching your search", "info");
      } else {
        setCallerRows([]);
        displayToast("No data found", "info");
      }
    } catch (error) {
      console.error("Error searching caller data:", error);
      displayToast("Failed to search caller data. Please try again.", "error");
      setCallerRows([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCalleeSearch = async () => {
    if (!calleeSearch.trim()) {
      displayToast("Please enter a callee ID to search", "error");
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetchNumberFilters(
        "blacklist",
        calleeSearch.trim(),
      );
      if (response && response.success && response.data) {
        const calleeData = response.data
          .filter((item) => item.type === "calleeid")
          .map((item) => ({
            groupNo: item.group,
            noInGroup: item.no_of_groups,
            calleeId: item.number,
          }))
          .sort((a, b) => {
            const g = parseInt(a.groupNo) - parseInt(b.groupNo);
            return g !== 0 ? g : parseInt(a.noInGroup) - parseInt(b.noInGroup);
          });
        setCalleeRows(calleeData);
        if (calleeData.length === 0)
          displayToast("No callee IDs found matching your search", "info");
      } else {
        setCalleeRows([]);
        displayToast("No data found", "info");
      }
    } catch (error) {
      console.error("Error searching callee data:", error);
      displayToast("Failed to search callee data. Please try again.", "error");
      setCalleeRows([]);
    } finally {
      setIsSearching(false);
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

  const handleCallerReset = () => {
    setCallerSearch("");
    fetchBlacklistData();
  };
  const handleCalleeReset = () => {
    setCalleeSearch("");
    fetchBlacklistData();
  };

  // Reusable table panel
  const renderTablePanel = ({
    title,
    rows,
    checkedItems,
    searchValue,
    searchFocused,
    onSearchChange,
    onSearchFocus,
    onSearchBlur,
    onSearch,
    onReset,
    onCheck,
    onDelete,
    onClear,
    onAddNew,
    onEdit,
    idKey,
    isSearchingFlag,
  }) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.labelText,
            minWidth: 72,
          }}
        >
          {idKey === "callerId" ? "CallerID:" : "CalleeID:"}
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#ffffff",
            border: `0.5px solid ${searchFocused ? C.accent : C.cardBorder}`,
            borderRadius: 6,
            padding: "5px 10px",
            transition: "border-color 0.15s ease",
            flex: 1,
            minWidth: 140,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: searchFocused ? C.accent : C.mutedText,
            }}
          >
            🔍
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onKeyPress={(e) => e.key === "Enter" && onSearch()}
            placeholder={`Search ${idKey === "callerId" ? "caller" : "callee"} ID...`}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 11,
              color: C.valueText,
              outline: "none",
              width: "100%",
            }}
          />
          {searchValue && (
            <span
              onClick={() => onSearchChange("")}
              style={{ fontSize: 11, color: C.mutedText, cursor: "pointer" }}
            >
              ✕
            </span>
          )}
        </div>
        <Btn
          onClick={onSearch}
          disabled={isSearchingFlag}
          variant="default"
          style={{ gap: 4 }}
        >
          {isSearchingFlag ? (
            <CircularProgress size={11} style={{ color: "#fff" }} />
          ) : null}
          {isSearchingFlag ? "Searching..." : "Search"}
        </Btn>
        <Btn onClick={onReset} disabled={isSearchingFlag} variant="outline">
          Reset
        </Btn>
      </div>

      {/* Card */}
      <div
        style={{
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderBottom: `1px solid ${C.cardBorder}`,
            background: "#DCE6F2",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                background: "#f1f5f9",
                border: `0.5px solid ${C.cardBorder}`,
                color: "#475569",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 12px",
                borderRadius: 20,
              }}
            >
              {rows.length} records
            </span>
            {checkedItems.length > 0 && (
              <span
                style={{
                  background: "#e0f2fe",
                  color: C.accent,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: `0.5px solid ${C.accent}`,
                }}
              >
                {checkedItems.length} selected
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Btn
              onClick={onDelete}
              disabled={checkedItems.length === 0 || isDeleting}
              variant="danger"
            >
              {isDeleting ? (
                <CircularProgress size={11} style={{ color: C.errorRed }} />
              ) : null}
              🗑 Delete
            </Btn>
            <Btn
              onClick={onClear}
              disabled={rows.length === 0 || isDeleting}
              variant="danger"
            >
              Clear All
            </Btn>
            <Btn onClick={onAddNew} disabled={isDeleting} variant="accent">
              + Add New
            </Btn>
          </div>
        </div>

        {/* Table header title */}
        <div
          style={{
            background: "#f3f4f6",
            color: "#1e293b",
            fontWeight: 700,
            fontSize: 13,
            textAlign: "center",
            padding: "8px 14px",
            letterSpacing: "0.02em",
            borderBottom: "0.5px solid #9ca3af",
          }}
        >
          {title}
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 360 }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}
          >
            <thead>
              <tr>
                <TH style={{ width: 56 }}>Check</TH>
                <TH>Group No.</TH>
                <TH>{idKey === "callerId" ? "CallerID" : "CalleeID"}</TH>
                <TH style={{ width: 80 }}>Modify</TH>
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
                    }}
                  >
                    No entries found.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const isChecked = checkedItems.includes(idx);
                  const rowBg = isChecked
                    ? "#f0f9ff"
                    : idx % 2 === 1
                      ? "#f8fafc"
                      : "#ffffff";
                  return (
                    <tr
                      key={idx}
                      style={{
                        background: rowBg,
                        borderBottom: "0.5px solid #9ca3af",
                        transition: "background 0.1s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked)
                          e.currentTarget.style.background = "#f0f9ff";
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked)
                          e.currentTarget.style.background = rowBg;
                      }}
                    >
                      <td
                        style={{
                          textAlign: "center",
                          padding: "6px 4px",
                          borderRight: "0.5px solid #edf2f7",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onCheck(idx)}
                          style={{
                            width: 14,
                            height: 14,
                            cursor: "pointer",
                            accentColor: C.accent,
                          }}
                        />
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "7px 8px",
                          fontSize: 12,
                          color: C.valueText,
                          borderRight: "0.5px solid #edf2f7",
                        }}
                      >
                        {row.groupNo}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          padding: "7px 8px",
                          fontSize: 12,
                          color: C.valueText,
                          borderRight: "0.5px solid #edf2f7",
                        }}
                      >
                        {row[idKey]}
                      </td>
                      <td style={{ textAlign: "center", padding: "4px 8px" }}>
                        <Btn
                          onClick={() => onEdit(row)}
                          variant="outline"
                          style={{
                            fontSize: 10,
                            padding: "3px 10px",
                            margin: "0 auto",
                          }}
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
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "8px 14px",
            borderTop: `0.5px solid ${C.cardBorder}`,
            background: "#f8fafc",
          }}
        >
          <span style={{ fontSize: 11, color: C.mutedText }}>
            {rows.length} record{rows.length !== 1 ? "s" : ""} total
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: C.mutedText, marginBottom: 12 }}>
          E1-PRI &rsaquo; Number Filter &rsaquo;{" "}
          <span style={{ color: C.valueText, fontWeight: 600 }}>Blacklist</span>
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
                searchValue: callerSearch,
                searchFocused: callerSearchFocused,
                onSearchChange: setCallerSearch,
                onSearchFocus: () => setCallerSearchFocused(true),
                onSearchBlur: () => setCallerSearchFocused(false),
                onSearch: handleCallerSearch,
                onReset: handleCallerReset,
                onCheck: handleCallerCheck,
                onDelete: handleCallerDelete,
                onClear: handleCallerClear,
                onAddNew: () => handleAddNew("caller"),
                onEdit: (row) => handleEdit("caller", row),
                idKey: "callerId",
                isSearchingFlag: isSearching,
              })}
              {renderTablePanel({
                title: "CalleeID Blacklist",
                rows: calleeRows,
                checkedItems: calleeChecked,
                searchValue: calleeSearch,
                searchFocused: calleeSearchFocused,
                onSearchChange: setCalleeSearch,
                onSearchFocus: () => setCalleeSearchFocused(true),
                onSearchBlur: () => setCalleeSearchFocused(false),
                onSearch: handleCalleeSearch,
                onReset: handleCalleeReset,
                onCheck: handleCalleeCheck,
                onDelete: handleCalleeDelete,
                onClear: handleCalleeClear,
                onAddNew: () => handleAddNew("callee"),
                onEdit: (row) => handleEdit("callee", row),
                idKey: "calleeId",
                isSearchingFlag: isSearching,
              })}
            </div>

            <div
              style={{
                textAlign: "center",
                color: C.errorRed,
                fontSize: 12,
                marginTop: 24,
                padding: "8px 16px",
                // background: "#fef2f2",
                // border: "0.5px solid #fecaca",
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
        PaperProps={{ sx: { width: 400, maxWidth: "96vw", borderRadius: 2 } }}
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
          {modalType === "caller"
            ? "CallerIDs in Blacklist"
            : "CalleeIDs in Blacklist"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 6,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Group No. */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 120,
                  flexShrink: 0,
                }}
              >
                Group No.:
              </label>
              <div style={{ flex: 1 }}>
                <MuiSelect
                  value={modalData.groupNo}
                  onChange={(e) => handleGroupNoChange(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ fontSize: 13, background: "#fff" }}
                  MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                >
                  {[...Array(200).keys()].map((i) => (
                    <MenuItem key={i} value={i} sx={{ fontSize: 13 }}>
                      {i}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </div>
            </div>

            {/* ID Value */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  width: 120,
                  flexShrink: 0,
                }}
              >
                {modalType === "caller" ? "CallerID:" : "CalleeID:"}
              </label>
              <div style={{ flex: 1 }}>
                <TextField
                  type="text"
                  value={modalData.idValue}
                  onChange={(e) =>
                    setModalData({ ...modalData, idValue: e.target.value })
                  }
                  size="small"
                  fullWidth
                  disabled={isEditMode}
                  sx={{
                    "& .MuiInputBase-input": { fontSize: 13 },
                    "& .MuiInputBase-root": { background: "#fff" },
                  }}
                />
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
            disabled={isLoading}
            style={{ padding: "8px 28px", fontSize: 13 }}
          >
            {isLoading ? (
              <CircularProgress
                size={13}
                style={{ color: "#fff", marginRight: 6 }}
              />
            ) : null}
            {isLoading ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={() => setShowModal(false)}
            disabled={isLoading}
            variant="outline"
            style={{ padding: "8px 28px", fontSize: 13 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 9999,
            maxWidth: 360,
          }}
        >
          <Alert
            severity={toastType}
            onClose={() => setShowToast(false)}
            sx={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: "8px",
            }}
          >
            {toastMessage}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default Blacklist;
