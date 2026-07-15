import { useState } from "react";
import {
  PCM_PCM_INITIAL_DATA,
  applyPcmPcmFormToRows,
  pcmPcmFormFromRow,
} from "../utils/PcmPcmTransformers";

export function usePcmPcmPage() {
  const [pcmData, setPcmData] = useState(PCM_PCM_INITIAL_DATA);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [modalForm, setModalForm] = useState({});

  const openModal = (idx) => {
    setEditIndex(idx);
    setModalForm(pcmPcmFormFromRow(pcmData[idx]));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditIndex(null);
  };

  const handleModalChange = (field, value) => {
    setModalForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleModalCheckbox = (field) => {
    setModalForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    setPcmData((prev) => applyPcmPcmFormToRows(prev, editIndex, modalForm));
    closeModal();
  };

  return {
    pcmData,
    modalOpen,
    modalForm,
    openModal,
    closeModal,
    handleModalChange,
    handleModalCheckbox,
    handleSave,
  };
}
