import { useEffect, useMemo, useState } from "react";
import {
  listACL,
  addACL,
  updateACL,
  deleteACL,
} from "../../../../api/apiService";

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

  const fetchACLList = async () => {
    try {
      const response = await listACL();

      if (response.response) {
        const mappedRows = (response.message || []).map((acl, index) => ({
          id: index + 1,
          name: acl.name,
          cidr: acl.rules?.[0]?.ip ?? "-",
          domain: "-",
          type:
            acl.rules?.[0]?.action === "permit" ? "Whitelist" : "Blacklist",
          description: "-",
        }));
        setRows(mappedRows);
      }
    } catch (error) {
      console.error("Error fetching ACL:", error);
      alert("Failed to fetch ACL list");
    }
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

  useEffect(() => {
    fetchACLList();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();

    const validation = validateSipAccessControlForm(form, rows, editingId);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const rules = [
      {
        action: form.default === "whitelist" ? "permit" : "deny",
        ip: form.cidr,
      },
    ];

    try {
      if (editingId !== null) {
        await updateACL(form.name, rules);
        await fetchACLList();
        closeModal();
        alert(SIP_ACCESS_CONTROL_MSG_UPDATED);
      } else {
        await addACL(form.name, rules);
        await fetchACLList();
        closeModal();
        alert(SIP_ACCESS_CONTROL_MSG_ADDED);
      }
    } catch (error) {
      console.error("Error saving ACL:", error);
      alert(
        editingId !== null ? "Failed to update ACL" : "Failed to add ACL",
      );
    }
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

  const handleDelete = async () => {
    const selected = rows.filter((row) => checkedRows[row.id]);
    if (selected.length === 0) {
      alert(SIP_ACCESS_CONTROL_ERR_SELECT_DELETE);
      return;
    }
    if (!window.confirm(SIP_ACCESS_CONTROL_CONFIRM_DELETE(selected.length))) {
      return;
    }

    try {
      for (const row of selected) {
        await deleteACL(row.name);
      }
      await fetchACLList();
      setCheckedRows({});
      alert(SIP_ACCESS_CONTROL_MSG_DELETED);
    } catch (error) {
      console.error("Error deleting ACL:", error);
      alert("Failed to delete ACL");
    }
  };

  const handleClearAll = async () => {
    if (rows.length === 0) {
      alert(SIP_ACCESS_CONTROL_ERR_NOTHING_TO_CLEAR);
      return;
    }
    if (!window.confirm(SIP_ACCESS_CONTROL_CONFIRM_CLEAR_ALL(rows.length))) {
      return;
    }

    try {
      for (const row of rows) {
        await deleteACL(row.name);
      }
      await fetchACLList();
      setCheckedRows({});
      alert(SIP_ACCESS_CONTROL_MSG_CLEARED);
    } catch (error) {
      console.error("Error clearing ACL:", error);
      alert("Failed to clear ACL list");
    }
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
