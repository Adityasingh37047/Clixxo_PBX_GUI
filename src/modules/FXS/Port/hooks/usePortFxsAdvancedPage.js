import { useState } from "react";
import { PORT_FXS_ADVANCED_ITEMS_PER_PAGE } from "../../../../constants/PortFxsAdvancedPageConstants";
import {
  getInitialPortFxsAdvancedBatchForm,
  initializePortFxsAdvancedData,
  portFxsAdvancedBatchFormFromRow,
  shouldShowPortFxsAdvancedField,
} from "../utils/PortFxsAdvancedTransformers";
import { validatePortFxsAdvancedBatchForm } from "../utils/PortFxsAdvancedValidators";

export function usePortFxsAdvancedPage() {
  const [ports, setPorts] = useState(initializePortFxsAdvancedData());
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState(getInitialPortFxsAdvancedBatchForm());
  const [prohibitLimitCount, setProhibitLimitCount] = useState(1);
  const [message, setMessage] = useState({ type: "", text: "" });

  const itemsPerPage = PORT_FXS_ADVANCED_ITEMS_PER_PAGE;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const totalPages = Math.max(1, Math.ceil(ports.length / itemsPerPage));
  const pagedPorts = ports.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  const handleOpenModal = (port = null) => {
    if (port) {
      setBatchForm(portFxsAdvancedBatchFormFromRow(port));
    } else {
      setBatchForm(getInitialPortFxsAdvancedBatchForm());
    }
    setProhibitLimitCount(1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBatchForm(getInitialPortFxsAdvancedBatchForm());
    setProhibitLimitCount(1);
  };

  const handleBatchModify = () => {
    handleOpenModal();
  };

  const handleFormChange = (key, value) => {
    setBatchForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (key) => {
    setBatchForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePeriodCountChange = (action) => {
    if (action === "plus" && prohibitLimitCount < 5) {
      setProhibitLimitCount((prev) => prev + 1);
    } else if (action === "minus" && prohibitLimitCount > 1) {
      setProhibitLimitCount((prev) => prev - 1);
    }
  };

  const shouldShowField = (field) =>
    shouldShowPortFxsAdvancedField(field, batchForm);

  const handleSave = (e) => {
    e.preventDefault();

    const validation = validatePortFxsAdvancedBatchForm(
      batchForm,
      prohibitLimitCount,
    );
    if (!validation.valid) {
      showMessage("error", validation.message);
      return;
    }

    showMessage("success", "Batch modify settings saved successfully!");
    handleCloseModal();
  };

  const handleReset = () => {
    setBatchForm(getInitialPortFxsAdvancedBatchForm());
    setProhibitLimitCount(1);
  };

  return {
    ports,
    page,
    isModalOpen,
    batchForm,
    prohibitLimitCount,
    message,
    setMessage,
    totalPages,
    pagedPorts,
    handlePageChange,
    handleOpenModal,
    handleCloseModal,
    handleBatchModify,
    handleFormChange,
    handleCheckbox,
    handlePeriodCountChange,
    shouldShowField,
    handleSave,
    handleReset,
  };
}
