import { useEffect, useState } from "react";
import {
  listNumberPool,
  createNumberPool,
  updateNumberPool,
  deleteNumberPool,
} from "../../../../api/apiService";
import {
  mapNumberPoolApiToRows,
  parseNumberPoolRowForEdit,
  buildNumberPoolCreateForm,
  buildNumberPoolApiPayload,
  getNumberPoolNextNoInGroup,
} from "../utils/NumberPoolTransformers";
import {
  validateNumberRange,
  validateNumberPoolRequiredRange,
} from "../utils/NumberPoolValidators";

export function useNumberPoolPage() {
  const [rows, setRows] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    groupNo: 0,
    noInGroup: 0,
    numberRangeStart: "",
    numberRangeEnd: "",
  });
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const openModal = (rowIdx = null) => {
    setEditIndex(rowIdx);
    setValidationError("");
    if (rowIdx !== null) {
      setForm(parseNumberPoolRowForEdit(rows[rowIdx]));
    } else {
      setForm(buildNumberPoolCreateForm(rows, 0));
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
    setValidationError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "groupNo") {
      const newGroupNo = Number(value);
      const nextNoInGroup = getNumberPoolNextNoInGroup(rows, newGroupNo);
      setForm((prev) => ({
        ...prev,
        [name]: newGroupNo,
        noInGroup: nextNoInGroup,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));

      if (name === "numberRangeStart" || name === "numberRangeEnd") {
        const newForm = { ...form, [name]: value };
        const error = validateNumberRange(
          newForm.numberRangeStart,
          newForm.numberRangeEnd,
        );
        setValidationError(error);
      }
    }
  };

  const handleSave = async () => {
    const requiredError = validateNumberPoolRequiredRange(
      form.numberRangeStart,
      form.numberRangeEnd,
    );
    if (requiredError) {
      setValidationError(requiredError);
      showToast(requiredError, "error");
      return;
    }

    const error = validateNumberRange(
      form.numberRangeStart,
      form.numberRangeEnd,
    );
    if (error) {
      setValidationError(error);
      showToast(error, "error");
      return;
    }

    const apiData = buildNumberPoolApiPayload(form);

    try {
      setLoading(true);
      const isEdit =
        editIndex !== null && rows[editIndex] && Boolean(rows[editIndex].id);
      let didUpdate = false;

      if (editIndex !== null && rows[editIndex]?.id) {
        await updateNumberPool(rows[editIndex].id, apiData);
        didUpdate = Boolean(isEdit);
      } else {
        await createNumberPool(apiData);
      }
      await refreshNumberPoolWithRetry();
      showToast(didUpdate ? "Updated successfully" : "Saved successfully");
      closeModal();
    } catch (e) {
      console.error("Save Number Pool failed:", e);
      alert("Failed to save number pool.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (idx) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, checked: !row.checked } : row,
      ),
    );
  };

  const allRowsChecked = rows.length > 0 && rows.every((r) => r.checked);
  const someRowsChecked = rows.some((r) => r.checked) && !allRowsChecked;

  const handleCheckAll = () => {
    const selectAll = !allRowsChecked;
    setRows((prev) => prev.map((row) => ({ ...row, checked: selectAll })));
  };

  const handleDelete = async () => {
    const idsToDelete = rows.filter((r) => r.checked && r.id).map((r) => r.id);
    if (idsToDelete.length === 0) {
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${idsToDelete.length} selected item(s)?`,
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      for (const id of idsToDelete) {
        await deleteNumberPool(id);
      }
      await refreshNumberPoolWithRetry();
      alert("Selected items deleted successfully!");
    } catch (e) {
      console.error("Delete Number Pool failed:", e);
      alert("Delete failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    const ids = rows.filter((r) => r.id).map((r) => r.id);
    if (ids.length === 0) {
      alert("There are no items to clear.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ALL ${ids.length} item(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      for (const id of ids) {
        await deleteNumberPool(id);
      }
      await refreshNumberPoolWithRetry();
      alert("All items deleted successfully!");
    } catch (e) {
      console.error("Clear all Number Pool failed:", e);
      alert("Clear all failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchNumberPool = async () => {
    try {
      setLoading(true);
      const response = await listNumberPool();
      if (response.response && Array.isArray(response.message)) {
        setRows(mapNumberPoolApiToRows(response.message));
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error("List Number Pool failed:", e);
      setRows([]);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const refreshNumberPoolWithRetry = async () => {
    await fetchNumberPool();
    if (rows.length === 0) {
      await new Promise((r) => setTimeout(r, 400));
      await fetchNumberPool();
    }
  };

  useEffect(() => {
    fetchNumberPool();
  }, []);

  return {
    rows,
    modalOpen,
    editIndex,
    form,
    validationError,
    loading,
    isInitialLoad,
    isDeleting,
    toast,
    setToast,
    allRowsChecked,
    someRowsChecked,
    openModal,
    closeModal,
    handleFormChange,
    handleSave,
    handleCheck,
    handleCheckAll,
    handleDelete,
    handleClearAll,
  };
}
