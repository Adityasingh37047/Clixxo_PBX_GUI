import { useEffect, useState } from "react";
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
  SIP_ACCESS_CONTROL_ERR_FETCH_LIST,
  SIP_ACCESS_CONTROL_ERR_ADD,
  SIP_ACCESS_CONTROL_ERR_UPDATE,
  SIP_ACCESS_CONTROL_ERR_DELETE,
  SIP_ACCESS_CONTROL_ERR_CLEAR,
  SIP_ACCESS_CONTROL_MODE_WHITELIST,
} from "../../../../constants/SipAccessControlConstants";
import { validateSipAccessControlForm } from "../utils/SipAccessControlValidators";
import {
  createSipAccessControlEmptyForm,
  rowToSipAccessControlForm,
  getDefaultRuleAction,
} from "../utils/SipAccessControlTransformers";

/** Surface the server's own validation message (e.g. "Invalid IP or CIDR: ...") when available. */
const extractApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export function useSipAccessControlPage() {
  const [rows, setRows] = useState([]);
  const [checkedRows, setCheckedRows] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createSipAccessControlEmptyForm);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [saving, setSaving] = useState(false);

  const selectedCount = Object.values(checkedRows).filter(Boolean).length;
  const allChecked =
    rows.length > 0 && rows.every((row) => checkedRows[row.id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg, forceError = false) => {
    const isErr =
      forceError ||
      (/error|failed|required|please|invalid|must|choose|select|enter|exists|not found/i.test(
        msg,
      ) &&
        !/successfully/i.test(msg));
    showToast(msg, isErr ? "error" : "success");
  };

  const fetchACLList = async () => {
    try {
      const response = await listACL();
      if (response?.response) {
        const mappedRows = (response.message || []).map((acl) => ({
          id: acl.name,
          name: acl.name,
          rules: Array.isArray(acl.rules) ? acl.rules : [],
        }));
        setRows(mappedRows);
      } else if (response) {
        alert(response.message || SIP_ACCESS_CONTROL_ERR_FETCH_LIST, true);
      }
    } catch (error) {
      console.error("Error fetching ACL:", error);
      alert(extractApiErrorMessage(error, SIP_ACCESS_CONTROL_ERR_FETCH_LIST), true);
    }
  };

  const openModal = (row = null) => {
    // Blur whatever triggered the dialog (Add New / Edit) before it mounts —
    // otherwise MUI marks #root aria-hidden while that button still has DOM
    // focus, which Chrome flags as an aria-hidden/focus conflict.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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

  const handleModeChange = (mode) => {
    setForm((prev) => {
      if (prev.mode === mode) return prev;
      const prevDefaultAction = getDefaultRuleAction(prev.mode);
      const nextDefaultAction = getDefaultRuleAction(mode);
      return {
        ...prev,
        mode,
        // Flip the action of still-blank, untouched rows to the new mode's
        // default (permit for whitelist, deny for blacklist). Rows the user
        // already filled in or explicitly changed the action on are left alone.
        rules: prev.rules.map((rule) =>
          !String(rule.ip || "").trim() && rule.action === prevDefaultAction
            ? { ...rule, action: nextDefaultAction }
            : rule,
        ),
      };
    });
  };

  const handleBlockIpv6Toggle = (checked) => {
    setForm((prev) => ({ ...prev, blockIpv6: checked }));
  };

  const handleRuleChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule,
      ),
    }));
  };

  const handleAddRule = () => {
    setForm((prev) => ({
      ...prev,
      rules: [...prev.rules, { action: getDefaultRuleAction(prev.mode), ip: "" }],
    }));
  };

  const handleRemoveRule = (index) => {
    setForm((prev) => {
      const nextRules = prev.rules.filter((_, i) => i !== index);
      return {
        ...prev,
        rules: nextRules.length
          ? nextRules
          : [{ action: getDefaultRuleAction(prev.mode), ip: "" }],
      };
    });
  };

  const handleMoveRule = (index, direction) => {
    setForm((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.rules.length) return prev;
      const nextRules = [...prev.rules];
      [nextRules[index], nextRules[targetIndex]] = [
        nextRules[targetIndex],
        nextRules[index],
      ];
      return { ...prev, rules: nextRules };
    });
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (saving) return;

    const validation = validateSipAccessControlForm(form, rows, editingId);
    if (!validation.valid) {
      alert(validation.error, true);
      return;
    }

    const { name, rules } = validation.payload;

    setSaving(true);
    try {
      if (editingId !== null) {
        const response = await updateACL(name, rules);
        if (response?.response === false) {
          alert(response.message || SIP_ACCESS_CONTROL_ERR_UPDATE, true);
          return;
        }
        await fetchACLList();
        closeModal();
        alert(SIP_ACCESS_CONTROL_MSG_UPDATED);
      } else {
        const response = await addACL(name, rules);
        if (response?.response === false) {
          alert(response.message || SIP_ACCESS_CONTROL_ERR_ADD, true);
          return;
        }
        await fetchACLList();
        closeModal();
        alert(SIP_ACCESS_CONTROL_MSG_ADDED);
      }
    } catch (error) {
      console.error("Error saving ACL:", error);
      alert(
        extractApiErrorMessage(
          error,
          editingId !== null ? SIP_ACCESS_CONTROL_ERR_UPDATE : SIP_ACCESS_CONTROL_ERR_ADD,
        ),
        true,
      );
    } finally {
      setSaving(false);
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
      alert(SIP_ACCESS_CONTROL_ERR_SELECT_DELETE, true);
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
      alert(extractApiErrorMessage(error, SIP_ACCESS_CONTROL_ERR_DELETE), true);
      await fetchACLList();
    }
  };

  const handleClearAll = async () => {
    if (rows.length === 0) {
      alert(SIP_ACCESS_CONTROL_ERR_NOTHING_TO_CLEAR, true);
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
      alert(extractApiErrorMessage(error, SIP_ACCESS_CONTROL_ERR_CLEAR), true);
      await fetchACLList();
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
    saving,
    isWhitelistMode: form.mode === SIP_ACCESS_CONTROL_MODE_WHITELIST,
    selectedCount,
    allChecked,
    openModal,
    closeModal,
    handleFormChange,
    handleModeChange,
    handleBlockIpv6Toggle,
    handleRuleChange,
    handleAddRule,
    handleRemoveRule,
    handleMoveRule,
    handleSave,
    handleRowCheck,
    handleTableCheckAll,
    handleTableUncheckAll,
    handleTableInverse,
    handleDelete,
    handleClearAll,
  };
}