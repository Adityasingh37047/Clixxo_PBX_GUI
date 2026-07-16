import { useEffect, useState } from "react";
import {
  saveCallerWhitelist,
  saveCalleeWhitelist,
  fetchAllNumberFilters,
  fetchNumberFilters,
  deleteNumberFilter,
  deleteAllNumberFilters,
} from "../../../../api/apiService";
import {
  mapWhitelistApiDataToRows,
  getWhitelistNextAvailableNoInGroup,
  buildCallerWhitelistPayload,
  buildCalleeWhitelistPayload,
} from "../utils/WhitelistTransformers";
import {
  validateWhitelistIdValue,
  findWhitelistDuplicate,
  getWhitelistDuplicateMessage,
  isWhitelistEditUnchanged,
} from "../utils/WhitelistValidators";

export function useWhitelistPage() {
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
        const { callerData, calleeData } = mapWhitelistApiDataToRows(
          response.data,
        );
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

  const handleAddNew = (type) => {
    setModalType(type);
    const existingRows = type === "caller" ? callerRows : calleeRows;
    const selectedGroup = "0";
    const nextNoInGroup = getWhitelistNextAvailableNoInGroup(
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
    const nextNoInGroup = getWhitelistNextAvailableNoInGroup(
      existingRows,
      newGroupNo,
    );
    setModalData({
      ...modalData,
      groupNo: newGroupNo,
      noInGroup: nextNoInGroup,
    });
  };

  const handleSave = async () => {
    const idError = validateWhitelistIdValue(modalData.idValue);
    if (idError) {
      displayToast(idError, "error");
      return;
    }
    const existingRows = modalType === "caller" ? callerRows : calleeRows;
    const trimmedId = modalData.idValue.trim();
    const isDuplicate = findWhitelistDuplicate({
      existingRows,
      modalType,
      trimmedId,
      groupNo: modalData.groupNo,
      isEditMode,
      originalIdValue,
      originalGroupNo,
    });
    if (!isEditMode && isDuplicate) {
      displayToast(getWhitelistDuplicateMessage(modalType, trimmedId), "error");
      return;
    }
    if (isEditMode && isWhitelistEditUnchanged(modalData.groupNo, originalGroupNo)) {
      setShowModal(false);
      displayToast("No changes to save.", "info");
      return;
    }
    setIsLoading(true);
    try {
      let saveResp;
      if (modalType === "caller") {
        saveResp = await saveCallerWhitelist(
          buildCallerWhitelistPayload(modalData),
        );
        assertApiSuccess(saveResp, "Failed to save caller whitelist");
        displayToast(
          isEditMode
            ? "Caller ID updated successfully!"
            : "Caller ID saved successfully!",
          "success",
        );
      } else {
        saveResp = await saveCalleeWhitelist(
          buildCalleeWhitelistPayload(modalData),
        );
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

  return {
    callerRows,
    calleeRows,
    showModal,
    setShowModal,
    modalType,
    modalData,
    setModalData,
    isEditMode,
    callerChecked,
    calleeChecked,
    isLoading,
    isInitialLoading,
    isDeleting,
    toast,
    setToast,
    handleAddNew,
    handleEdit,
    handleGroupNoChange,
    handleSave,
    handleCallerCheck,
    handleCalleeCheck,
    handleCallerCheckAll,
    handleCalleeCheckAll,
    handleCallerDelete,
    handleCallerClear,
    handleCalleeDelete,
    handleCalleeClear,
  };
}
