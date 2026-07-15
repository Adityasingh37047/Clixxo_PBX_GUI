import { useEffect, useRef, useState } from "react";
import { fetchHostsFile, updateHostsFile } from "../../../../api/apiService";
import {
  HOSTS_MESSAGE_DEFAULT,
  HOSTS_MESSAGE_TIMEOUT_MS,
  HOSTS_NETWORK_ERROR,
  HOSTS_MESSAGES,
  HOSTS_FILE_HEADER,
} from "../../../../constants/HostsConstants";
import {
  parseHostsFile,
  generateHostsFileContent,
  createHostsEmptyForm,
  applyHostsFieldChange,
  updateHostsList,
  filterHostsByIndices,
} from "../utils/HostsTransformers";
import {
  validateHostsForm,
  validateHostsField,
  shouldConfirmHostsDelete,
  shouldConfirmHostsClear,
} from "../utils/HostsValidators";

export function useHostsPage() {
  const [hosts, setHosts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [message, setMessage] = useState(HOSTS_MESSAGE_DEFAULT);
  const hasInitialLoadRef = useRef(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [form, setForm] = useState(createHostsEmptyForm(0));

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(HOSTS_MESSAGE_DEFAULT), HOSTS_MESSAGE_TIMEOUT_MS);
  };

  const loadHosts = async () => {
    if (loading.fetch) {
      return;
    }

    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await fetchHostsFile();

      if (response.response && response.responseData) {
        const parsedHosts = parseHostsFile(response.responseData);
        setHosts(parsedHosts);
      } else {
        showMessage("error", HOSTS_MESSAGES.LOAD_FAILED);
      }
    } catch (error) {
      console.error("Error loading hosts:", error);
      if (error.message === HOSTS_NETWORK_ERROR) {
        showMessage("error", HOSTS_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || HOSTS_MESSAGES.LOAD_FAILED);
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadHosts();
    }
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => applyHostsFieldChange(prev, key, value));

    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    const error = validateHostsField(key, value);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({ ...row });
      setEditIndex(idx);
    } else {
      setForm(createHostsEmptyForm(hosts.length));
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setValidationErrors({});
  };

  const handleSave = async () => {
    const errors = validateHostsForm(form);

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      showMessage("error", firstError);
      setValidationErrors(errors);
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const updatedHosts = updateHostsList(hosts, form, editIndex);
      const fileContent = generateHostsFileContent(updatedHosts);
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts(updatedHosts);
        showMessage(
          "success",
          editIndex !== null
            ? HOSTS_MESSAGES.UPDATE_SUCCESS
            : HOSTS_MESSAGES.ADD_SUCCESS,
        );
        setShowModal(false);
        setEditIndex(null);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await loadHosts();
      } else {
        showMessage("error", HOSTS_MESSAGES.SAVE_FAILED);
      }
    } catch (error) {
      console.error("Error saving host:", error);
      if (error.message === HOSTS_NETWORK_ERROR) {
        showMessage("error", HOSTS_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || HOSTS_MESSAGES.SAVE_FAILED);
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };

  const allSelected = hosts.length > 0 && selected.length === hosts.length;
  const someSelected = selected.length > 0 && selected.length < hosts.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(hosts.map((_, idx) => idx));
    }
  };

  const handleInverse = () =>
    setSelected(
      hosts
        .map((_, idx) => (selected.includes(idx) ? null : idx))
        .filter((i) => i !== null),
    );

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", HOSTS_MESSAGES.DELETE_NONE_SELECTED);
      return;
    }
    const confirmed = window.confirm(HOSTS_MESSAGES.DELETE_CONFIRM);
    if (!shouldConfirmHostsDelete(confirmed)) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const reindexedHosts = filterHostsByIndices(hosts, selected);
      const fileContent = generateHostsFileContent(reindexedHosts);
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts(reindexedHosts);
        setSelected([]);
        showMessage(
          "success",
          HOSTS_MESSAGES.DELETE_SUCCESS(selected.length),
        );
      } else {
        showMessage("error", HOSTS_MESSAGES.DELETE_FAILED);
      }
    } catch (error) {
      console.error("Error deleting hosts:", error);
      if (error.message === HOSTS_NETWORK_ERROR) {
        showMessage("error", HOSTS_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || HOSTS_MESSAGES.DELETE_FAILED);
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (hosts.length === 0) {
      showMessage("info", HOSTS_MESSAGES.CLEAR_NONE);
      return;
    }
    const confirmed = window.confirm(HOSTS_MESSAGES.CLEAR_CONFIRM);
    if (!shouldConfirmHostsClear(confirmed)) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const fileContent = HOSTS_FILE_HEADER;
      const response = await updateHostsFile(fileContent);

      if (response.message) {
        setHosts([]);
        setSelected([]);
        showMessage("success", HOSTS_MESSAGES.CLEAR_SUCCESS);
      } else {
        showMessage("error", HOSTS_MESSAGES.CLEAR_FAILED);
      }
    } catch (error) {
      console.error("Error clearing all hosts:", error);
      if (error.message === HOSTS_NETWORK_ERROR) {
        showMessage("error", HOSTS_MESSAGES.NETWORK_ERROR);
      } else {
        showMessage("error", error.message || HOSTS_MESSAGES.CLEAR_FAILED);
      }
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  return {
    hosts,
    selected,
    loading,
    showModal,
    editIndex,
    message,
    setMessage,
    validationErrors,
    form,
    allSelected,
    someSelected,
    handleChange,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleSelectRow,
    handleToggleAll,
    handleInverse,
    handleDelete,
    handleClearAll,
  };
}
