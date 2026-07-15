import { useMemo, useState } from "react";
import {
  SIP_ACCESS_CONTROL_ERR_SELECT_DELETE,
  SIP_ACCESS_CONTROL_ERR_NOTHING_TO_CLEAR,
  SIP_ACCESS_CONTROL_MSG_UPDATED,
  SIP_ACCESS_CONTROL_MSG_ADDED,
  SIP_ACCESS_CONTROL_CONFIRM_DELETE,
  SIP_ACCESS_CONTROL_CONFIRM_CLEAR_ALL,
  SIP_ACCESS_CONTROL_MSG_DELETED,
  SIP_ACCESS_CONTROL_MSG_CLEARED,
} from "../../../../constants/SipAccessControlConstants";
import { validateSipAccessControlForm } from "../utils/SipAccessControlValidators";
import {
  createSipAccessControlEmptyForm,
  rowToSipAccessControlForm,
  buildSipAccessControlModalFields,
} from "../utils/SipAccessControlTransformers";

export function useSipAccessControlPage() {
  const [rows, setRows] = useState([]);
  const [checkedRows, setCheckedRows] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createSipAccessControlEmptyForm);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const modalFormFields = useMemo(() => buildSipAccessControlModalFields(), []);

  const selectedCount = Object.values(checkedRows).filter(Boolean).length;
  const allChecked =
    rows.length > 0 && rows.every((row) => checkedRows[row.id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isErr =
      /error|failed|required|please|invalid|must|choose|select|enter|exists/i.test(
        msg,
      ) && !/successfully/i.test(msg);
    showToast(msg, isErr ? "error" : "success");
  };

  const openModal = (row = null) => {
    if (row) {
      setForm(rowToSipAccessControlForm(row));
      setEditingId(row.id);
    } else {
      setForm(createSipAccessControlEmptyForm());
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(createSipAccessControlEmptyForm());
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e?.preventDefault?.();

    const validation = validateSipAccessControlForm(form, rows, editingId);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const payload = validation.payload;

    if (editingId !== null) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === editingId ? { ...row, ...payload } : row,
        ),
      );
      alert(SIP_ACCESS_CONTROL_MSG_UPDATED);
    } else {
      setRows((prev) => [...prev, { id: Date.now(), ...payload }]);
      alert(SIP_ACCESS_CONTROL_MSG_ADDED);
    }

    closeModal();
  };

  const handleRowCheck = (id) => {
    setCheckedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTableCheckAll = () => {
    if (allChecked) {
      setCheckedRows({});
    } else {
      const next = {};
      rows.forEach((row) => {
        next[row.id] = true;
      });
      setCheckedRows(next);
    }
  };

  const handleTableUncheckAll = () => {
    setCheckedRows({});
  };

  const handleTableInverse = () => {
    const next = {};
    rows.forEach((row) => {
      next[row.id] = !checkedRows[row.id];
    });
    setCheckedRows(next);
  };

  const handleDelete = () => {
    const selected = rows.filter((row) => checkedRows[row.id]);
    if (selected.length === 0) {
      alert(SIP_ACCESS_CONTROL_ERR_SELECT_DELETE);
      return;
    }
    if (!window.confirm(SIP_ACCESS_CONTROL_CONFIRM_DELETE(selected.length))) {
      return;
    }
    setRows((prev) => prev.filter((row) => !checkedRows[row.id]));
    setCheckedRows({});
    alert(SIP_ACCESS_CONTROL_MSG_DELETED);
  };

  const handleClearAll = () => {
    if (rows.length === 0) {
      alert(SIP_ACCESS_CONTROL_ERR_NOTHING_TO_CLEAR);
      return;
    }
    if (!window.confirm(SIP_ACCESS_CONTROL_CONFIRM_CLEAR_ALL(rows.length))) {
      return;
    }
    setRows([]);
    setCheckedRows({});
    alert(SIP_ACCESS_CONTROL_MSG_CLEARED);
  };

  return {
    rows,
    checkedRows,
    modalOpen,
    editingId,
    form,
    toast,
    setToast,
    modalFormFields,
    selectedCount,
    allChecked,
    openModal,
    closeModal,
    handleFormChange,
    handleSave,
    handleRowCheck,
    handleTableCheckAll,
    handleTableUncheckAll,
    handleTableInverse,
    handleDelete,
    handleClearAll,
  };
}
