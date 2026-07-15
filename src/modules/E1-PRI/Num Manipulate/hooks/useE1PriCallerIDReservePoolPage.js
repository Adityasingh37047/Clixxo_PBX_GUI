import { useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELDS,
  NUM_MANIPULATE_CALLERID_RESERVE_POOL_INITIAL_FORM,
} from "../../../../constants/E1PriCallerIDReservePoolConstants";
import { validateE1PriCallerIDReservePoolForm } from "../utils/E1PriCallerIDReservePoolValidators";
import { buildCallerIDReservePoolSaveData } from "../utils/E1PriCallerIDReservePoolTransformers";

const RESERVE_POOL_COMPACT_MQ = "(max-width: 768px)";

export function useE1PriCallerIDReservePoolPage() {
  const isCompact = useMediaQuery(RESERVE_POOL_COMPACT_MQ);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(
    NUM_MANIPULATE_CALLERID_RESERVE_POOL_INITIAL_FORM,
  );
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [errors, setErrors] = useState({});

  const handleOpenModal = (item = null, index = -1) => {
    setFormData(
      item
        ? { ...item, originalIndex: index }
        : NUM_MANIPULATE_CALLERID_RESERVE_POOL_INITIAL_FORM,
    );
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    const newErrors = validateE1PriCallerIDReservePoolForm(
      formData,
      NUM_MANIPULATE_CALLERID_RESERVE_POOL_FIELDS,
    );
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    const dataToSave = buildCallerIDReservePoolSaveData(formData);
    const originalIndex = formData.originalIndex;
    setRows((prev) => {
      if (originalIndex !== undefined && originalIndex > -1) {
        const updated = [...prev];
        updated[originalIndex] = dataToSave;
        return updated;
      }
      return [...prev, dataToSave];
    });
    setIsModalOpen(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };

  const allRowsChecked = rows.length > 0 && selected.length === rows.length;
  const someRowsChecked = selected.length > 0 && !allRowsChecked;

  const handleCheckAll = () => {
    setSelected(allRowsChecked ? [] : rows.map((_, idx) => idx));
  };

  const handleDelete = () => {
    setRows(rows.filter((_, idx) => !selected.includes(idx)));
    setSelected([]);
  };

  const handleClearAll = () => {
    setRows([]);
    setSelected([]);
  };

  const isEditMode =
    formData.originalIndex !== undefined && formData.originalIndex > -1;

  return {
    isCompact,
    isModalOpen,
    formData,
    rows,
    selected,
    errors,
    allRowsChecked,
    someRowsChecked,
    isEditMode,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleInputChange,
    handleSelectRow,
    handleCheckAll,
    handleDelete,
    handleClearAll,
  };
}
