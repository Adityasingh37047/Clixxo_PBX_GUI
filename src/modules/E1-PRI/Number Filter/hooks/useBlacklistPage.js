import { useEffect, useState } from "react";
import {
  saveCallerBlacklist,
  saveCalleeBlacklist,
  fetchAllNumberFilters,
  deleteNumberFilter,
  deleteAllNumberFilters,
} from "../../../../api/apiService";
import {
  mapBlacklistApiDataToRows,
  getBlacklistNextAvailableNoInGroup,
  buildCallerBlacklistPayload,
  buildCalleeBlacklistPayload,
} from "../utils/BlacklistTransformers";
import {
  validateBlacklistIdValue,
  findBlacklistDuplicate,
  getBlacklistDuplicateMessage,
  isBlacklistEditUnchanged,
} from "../utils/BlacklistValidators";

export function useBlacklistPage() {
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
        const { callerData, calleeData } = mapBlacklistApiDataToRows(
          response.data,
        );
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

  const handleAddNew = (type) => {
    setModalType(type);
    const existingRows = type === "caller" ? callerRows : calleeRows;
    const selectedGroup = "0";
    const nextNoInGroup = getBlacklistNextAvailableNoInGroup(
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
    const nextNoInGroup = getBlacklistNextAvailableNoInGroup(
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
    const idError = validateBlacklistIdValue(modalData.idValue);
    if (idError) {
      displayToast(idError, "error");
      return;
    }
    const existingRows = modalType === "caller" ? callerRows : calleeRows;
    const trimmedId = modalData.idValue.trim();
    const isDuplicate = findBlacklistDuplicate({
      existingRows,
      modalType,
      trimmedId,
      groupNo: modalData.groupNo,
      isEditMode,
      originalIdValue,
      originalGroupNo,
    });
    if (!isEditMode && isDuplicate) {
      displayToast(getBlacklistDuplicateMessage(modalType, trimmedId), "error");
      return;
    }
    const groupUnchanged =
      String(modalData.groupNo) === String(originalGroupNo);
    const idUnchanged = trimmedId === String(originalIdValue ?? "").trim();
    if (isEditMode && isBlacklistEditUnchanged(
      modalData.groupNo,
      originalGroupNo,
      trimmedId,
      originalIdValue,
    )) {
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
        saveResp = await saveCallerBlacklist(
          buildCallerBlacklistPayload(modalData, trimmedId),
        );
        assertApiSuccess(saveResp, "Failed to save caller blacklist");
        displayToast(
          isEditMode
            ? "Caller ID updated successfully!"
            : "Caller ID saved successfully!",
          "success",
        );
      } else {
        saveResp = await saveCalleeBlacklist(
          buildCalleeBlacklistPayload(modalData, trimmedId),
        );
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
