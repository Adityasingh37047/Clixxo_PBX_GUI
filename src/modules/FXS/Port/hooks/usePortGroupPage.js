import { useEffect, useState } from "react";
import {
  buildPortGroupRow,
  getSelectedPortGroupIds,
  initialPortGroupFormState,
  portGroupFormFromRow,
} from "../utils/PortGroupTransformers";
import {
  isPortGroupErrorMessage,
  validatePortGroupForm,
} from "../utils/PortGroupValidators";
import { routeTableMinWidthForZoom } from "../components/PortGroupTableHelpers";

export function usePortGroupPage() {
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [form, setForm] = useState(initialPortGroupFormState());
  const [checkedRows, setCheckedRows] = useState({});
  const [tableMinWidth, setTableMinWidth] = useState("100%");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    showToast(msg, isPortGroupErrorMessage(msg) ? "error" : "success");
  };

  useEffect(() => {
    const updateTableWidthForZoom = () => {
      setTableMinWidth(routeTableMinWidthForZoom(1400));
    };
    updateTableWidthForZoom();
    window.addEventListener("resize", updateTableWidthForZoom);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateTableWidthForZoom);
    vv?.addEventListener("scroll", updateTableWidthForZoom);
    return () => {
      window.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("resize", updateTableWidthForZoom);
      vv?.removeEventListener("scroll", updateTableWidthForZoom);
    };
  }, []);

  const handleOpenModal = (group = null) => {
    if (group) {
      setForm(portGroupFormFromRow(group));
      setEditingGroupId(group.id);
    } else {
      setForm(initialPortGroupFormState());
      setEditingGroupId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroupId(null);
    setForm(initialPortGroupFormState());
  };

  const handleAddNewClick = () => {
    handleOpenModal();
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePortToggle = (idx) => {
    setForm((prev) => ({
      ...prev,
      ports: prev.ports.map((v, i) => (i === idx ? !v : v)),
    }));
  };

  const handleCheckAllPorts = () => {
    setForm((prev) => ({
      ...prev,
      ports: prev.ports.map(() => true),
    }));
  };

  const handleInversePorts = () => {
    setForm((prev) => ({
      ...prev,
      ports: prev.ports.map((v) => !v),
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();

    const validation = validatePortGroupForm(form);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const newGroup = buildPortGroupRow(form, editingGroupId);
    setGroups((prev) => {
      if (editingGroupId !== null) {
        return prev.map((g) => (g.id === editingGroupId ? newGroup : g));
      }
      return [...prev, newGroup];
    });
    handleCloseModal();
    alert(
      editingGroupId !== null
        ? "Port group updated successfully!"
        : "Port group added successfully!",
    );
  };

  const handleRowCheck = (id) => {
    setCheckedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTableCheckAll = () => {
    const allChecked =
      groups.length > 0 && groups.every((g) => checkedRows[g.id]);
    if (allChecked) {
      setCheckedRows({});
    } else {
      const next = {};
      groups.forEach((g) => {
        next[g.id] = true;
      });
      setCheckedRows(next);
    }
  };

  const handleTableUncheckAll = () => {
    setCheckedRows({});
  };

  const handleTableInverse = () => {
    const next = {};
    groups.forEach((g) => {
      next[g.id] = !checkedRows[g.id];
    });
    setCheckedRows(next);
  };

  const handleDelete = () => {
    const selectedIds = getSelectedPortGroupIds(groups, checkedRows);
    if (selectedIds.length === 0) {
      alert("Please select at least one item to delete.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected item(s)?`,
    );
    if (!confirmed) return;
    setGroups((prev) => prev.filter((g) => !checkedRows[g.id]));
    setCheckedRows({});
    alert("Selected port group(s) deleted successfully!");
  };

  const handleClearAll = () => {
    if (groups.length === 0) {
      alert("No port groups to clear.");
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${groups.length} port group(s)? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setGroups([]);
    setCheckedRows({});
    alert("All port groups cleared successfully!");
  };

  const selectedCount = Object.values(checkedRows).filter(Boolean).length;
  const allChecked =
    groups.length > 0 && groups.every((g) => checkedRows[g.id]);

  return {
    groups,
    isModalOpen,
    editingGroupId,
    form,
    checkedRows,
    tableMinWidth,
    toast,
    setToast,
    selectedCount,
    allChecked,
    handleOpenModal,
    handleCloseModal,
    handleAddNewClick,
    handleFormChange,
    handlePortToggle,
    handleCheckAllPorts,
    handleInversePorts,
    handleSave,
    handleRowCheck,
    handleTableCheckAll,
    handleTableUncheckAll,
    handleTableInverse,
    handleDelete,
    handleClearAll,
  };
}
