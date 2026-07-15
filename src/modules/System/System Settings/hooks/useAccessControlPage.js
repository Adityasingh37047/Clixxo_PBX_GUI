import { useEffect, useState } from "react";
import { postLinuxCmd } from "../../../../api/apiService";
import { IPTABLES_INFO } from "../../../../constants/AccessControlConstants";
import { validateAccessControlCommand } from "../utils/AccessControlValidators";
import {
  createAccessControlEmptyForm,
  getNextAccessControlIndex,
  toAccessControlCommandRow,
  removeAccessControlCommandsByIndices,
} from "../utils/AccessControlTransformers";

export function useAccessControlPage() {
  const [commands, setCommands] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(createAccessControlEmptyForm);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    apply: false,
  });
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [executionLogs, setExecutionLogs] = useState(IPTABLES_INFO);
  const [iptablesInfo, setIptablesInfo] = useState(IPTABLES_INFO);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const loadIptablesInfo = async () => {
    try {
      const response = await postLinuxCmd({ cmd: "iptables -L -n -v" });
      if (response.response && response.responseData) {
        setIptablesInfo(response.responseData);
        setExecutionLogs(response.responseData);
        return response.responseData;
      }
    } catch (error) {
      console.error("Error loading iptables info:", error);
    }
    return iptablesInfo;
  };

  useEffect(() => {
    loadIptablesInfo();
  }, []);

  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({ index: row.index, command: row.command });
      setEditIndex(idx);
    } else {
      setForm({
        index: getNextAccessControlIndex(commands),
        command: "",
      });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setForm(createAccessControlEmptyForm());
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const validation = validateAccessControlCommand(form.command);

    if (!validation.valid) {
      showToast(validation.error, "error");
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editIndex !== null) {
        setCommands((prev) =>
          prev.map((cmd, idx) =>
            idx === editIndex ? toAccessControlCommandRow(form) : cmd,
          ),
        );
        showToast("Command updated successfully", "success");
      } else {
        setCommands((prev) => [...prev, toAccessControlCommandRow(form)]);
        showToast("Command added successfully", "success");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving command:", error);
      showToast("Failed to save command", "error");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };

  const handleCheckAll = () => setSelected(commands.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);

  const handleInverse = () => {
    const allIndices = commands.map((_, idx) => idx);
    setSelected(allIndices.filter((i) => !selected.includes(i)));
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      showToast("Please select commands to delete", "error");
      return;
    }

    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${selected.length} selected command(s)?`,
    );
    if (!isConfirmed) return;

    const deletedCount = selected.length;
    setLoading((prev) => ({ ...prev, delete: true }));
    setTimeout(() => {
      setCommands((prev) =>
        removeAccessControlCommandsByIndices(prev, selected),
      );
      setSelected([]);
      showToast(`${deletedCount} command(s) deleted successfully`, "success");
      setLoading((prev) => ({ ...prev, delete: false }));
    }, 500);
  };

  const handleClearAll = () => {
    if (commands.length === 0) {
      showToast("No commands to clear", "info");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL commands? This action cannot be undone.",
      )
    ) {
      return;
    }

    const clearedCount = commands.length;
    setLoading((prev) => ({ ...prev, delete: true }));
    setTimeout(() => {
      setCommands([]);
      setSelected([]);
      showToast(
        `All ${clearedCount} command(s) deleted successfully`,
        "success",
      );
      setLoading((prev) => ({ ...prev, delete: false }));
    }, 500);
  };

  const handleApply = async () => {
    if (commands.length === 0) {
      showToast(
        "No commands to apply. Please add commands to the table first.",
        "warning",
      );
      return;
    }

    setLoading((prev) => ({ ...prev, apply: true }));
    const failedCommands = [];

    try {
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        try {
          const response = await postLinuxCmd({ cmd: cmd.command.trim() });
          if (
            !response.response ||
            (response.responseData === undefined && response.message)
          ) {
            failedCommands.push({ index: cmd.index, command: cmd.command });
          }
        } catch {
          failedCommands.push({ index: cmd.index, command: cmd.command });
        }
      }

      const latestInfo = await loadIptablesInfo();
      setExecutionLogs(latestInfo || iptablesInfo);

      if (failedCommands.length > 0) {
        const failedIndices = failedCommands.map((fc) => fc.index).join(", ");
        const failedCount = failedCommands.length;
        const successCount = commands.length - failedCount;

        let alertMessage = "";
        if (successCount > 0) {
          alertMessage = `${successCount} command(s) executed successfully.\n\n`;
        }
        alertMessage += `Failed command(s) at index: ${failedIndices}`;

        showToast(alertMessage, "error");

        if (successCount > 0) {
          showToast(
            `${successCount} succeeded, ${failedCount} failed`,
            "warning",
          );
        } else {
          showToast(`All ${failedCount} command(s) failed`, "error");
        }
      } else {
        showToast(
          `All ${commands.length} command(s) executed successfully`,
          "success",
        );
      }
    } catch (error) {
      console.error("Error applying commands:", error);
      showToast("Failed to apply commands.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, apply: false }));
    }
  };

  const handleCancelLogs = async () => {
    const latestInfo = await loadIptablesInfo();
    setExecutionLogs(latestInfo || iptablesInfo);
    showToast("Log view reset to current iptables configuration", "info");
  };

  return {
    commands,
    selected,
    showModal,
    form,
    editIndex,
    loading,
    toast,
    setToast,
    executionLogs,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
    handleSelectRow,
    handleCheckAll,
    handleUncheckAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handleApply,
    handleCancelLogs,
  };
}
