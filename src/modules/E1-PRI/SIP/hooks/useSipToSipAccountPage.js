import { useEffect, useRef, useState, useMemo } from "react";
import {
  SIP_TO_SIP_ACCOUNT_CODEC_OPTIONS,
  SIP_TO_SIP_ACCOUNT_INITIAL_FORM,
  SIP_TO_SIP_ACCOUNT_ERR_DUPLICATE_EXTENSION,
  SIP_TO_SIP_ACCOUNT_ERR_LOAD_FAILED,
  SIP_TO_SIP_ACCOUNT_ERR_SAVE_FAILED,
  SIP_TO_SIP_ACCOUNT_ERR_DELETE_FAILED,
  SIP_TO_SIP_ACCOUNT_ERR_CLEAR_ALL_FAILED,
  SIP_TO_SIP_ACCOUNT_MSG_NO_ACCOUNTS_TO_CLEAR,
  SIP_TO_SIP_ACCOUNT_CONFIRM_DELETE,
  SIP_TO_SIP_ACCOUNT_CONFIRM_CLEAR_ALL,
  SIP_TO_SIP_ACCOUNT_ALERT_DELETE_BLOCKED,
  SIP_TO_SIP_ACCOUNT_ALERT_CLEAR_BLOCKED,
} from "../../../../constants/SipToSipAccountConstants";
import {
  fetchSipAccounts,
  fetchSipIpTrunkAccounts,
  createSipIpTrunkAccount,
  updateSipIpTrunkAccount,
  deleteSipIpTrunkAccount,
  listGroups,
} from "../../../../api/apiService";
import {
  parseCodecList,
  normalizeAllowCodecs,
  transformSipToSipAccountList,
  transformSipToSipAccountUiToApi,
} from "../utils/SipToSipAccountTransformers";
import {
  validateSipToSipAccountForm,
  validateExtension,
  validatePassword,
  validateContext,
  validateAllowCodecs,
  validateContact,
} from "../utils/SipToSipAccountValidators";

export function useSipToSipAccountPage() {
  const [accounts, setAccounts] = useState([]);
  const [pjsipExtensions, setPjsipExtensions] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const modalScrollRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [form, setForm] = useState(SIP_TO_SIP_ACCOUNT_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasInitialLoadRef = useRef(false);

  const showMessageFn = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadData();
    }
  }, []);

  const selectedCodecList = useMemo(
    () => parseCodecList(form.allow_codecs),
    [form.allow_codecs],
  );

  const allCodecOptions = useMemo(
    () => SIP_TO_SIP_ACCOUNT_CODEC_OPTIONS,
    [],
  );

  const getCodecLabel = (value) =>
    SIP_TO_SIP_ACCOUNT_CODEC_OPTIONS.find((c) => c.value === value)?.label ||
    value;

  useEffect(() => {
    if (!showModal || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTop = 0;
  }, [showModal]);

  const updateCodecList = (newList) => {
    const newCodecsString = newList.join(",");

    if (validationErrors.allow_codecs) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.allow_codecs;
        return newErrors;
      });
    }

    const codecError = validateAllowCodecs(newCodecsString);
    if (codecError) {
      setValidationErrors((prev) => ({ ...prev, allow_codecs: codecError }));
    }

    setForm((prev) => ({ ...prev, allow_codecs: newCodecsString }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const loadData = async () => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const [resIpTrunk, resPjsip] = await Promise.allSettled([
        fetchSipIpTrunkAccounts(),
        fetchSipAccounts(),
      ]);
      if (
        resIpTrunk.status === "fulfilled" &&
        resIpTrunk.value?.response &&
        Array.isArray(resIpTrunk.value.message)
      ) {
        setAccounts(transformSipToSipAccountList(resIpTrunk.value.message));
      } else {
        setAccounts([]);
      }
      if (
        resPjsip.status === "fulfilled" &&
        resPjsip.value?.response &&
        Array.isArray(resPjsip.value.message)
      ) {
        const extSet = new Set(
          resPjsip.value.message.map((r) => String(r.extension)),
        );
        setPjsipExtensions(extSet);
      } else {
        setPjsipExtensions(new Set());
      }
    } catch (e) {
      showMessageFn("error", e.message || SIP_TO_SIP_ACCOUNT_ERR_LOAD_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({
        ...SIP_TO_SIP_ACCOUNT_INITIAL_FORM,
        ...row,
        allow_codecs: normalizeAllowCodecs(row.allow_codecs) || "ulaw,alaw",
      });
      setEditIndex(idx);
    } else {
      setForm(SIP_TO_SIP_ACCOUNT_INITIAL_FORM);
      setEditIndex(null);
    }
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowPassword(false);
    setValidationErrors({});
  };

    const validateForm = () => validateSipToSipAccountForm(form);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    // Real-time validation for specific fields
    let error = null;
    switch (key) {
      case "extension":
        error = validateExtension(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "context":
        error = validateContext(value);
        break;
      case "contact":
        error = validateContact(value);
        break;
      default:
        break;
    }

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const handleSave = async () => {
    // Comprehensive validation
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      // Show the first validation error
      const firstError = Object.values(validationErrors)[0];
      showMessageFn("error", firstError);
      setValidationErrors(validationErrors);
      return;
    }

    // Duplicate extension across classic PJSIP
    if (pjsipExtensions.has(String(form.extension))) {
      showMessageFn(
        "error",
        SIP_TO_SIP_ACCOUNT_ERR_DUPLICATE_EXTENSION,
      );
      return;
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const payload = transformSipToSipAccountUiToApi(form);
      const resp =
        editIndex !== null
          ? await updateSipIpTrunkAccount(payload)
          : await createSipIpTrunkAccount(payload);
      if (resp?.response) {
        showMessageFn("success", resp.message || "Saved");
        await new Promise((r) => setTimeout(r, 600));
        await loadData();
        setShowModal(false);
        setEditIndex(null);
      } else {
        showMessageFn("error", resp?.message || "Failed to save");
      }
    } catch (e) {
      showMessageFn("error", e.message || SIP_TO_SIP_ACCOUNT_ERR_SAVE_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async (indices) => {
    if (!indices || indices.length === 0) return;
    if (!window.confirm(SIP_TO_SIP_ACCOUNT_CONFIRM_DELETE)) {
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      // Fetch SIP trunk groups to block deletion when referenced as trunkId/extension
      let groupRefList = [];
      try {
        const grpRes = await listGroups();
        groupRefList = (grpRes && (grpRes.message || grpRes.data)) || [];
      } catch {}

      const referencedExtensions = new Set(
        groupRefList
          .map((g) => g?.sip_trunk_id)
          .filter(Boolean)
          .map((v) => String(v))
          .map((v) => (v.includes("/") ? v.split("/")[1] : null))
          .filter(Boolean),
      );

      const ops = indices.map((i) => {
        const ext = accounts[i].extension;
        if (referencedExtensions.has(String(ext))) {
          alert(SIP_TO_SIP_ACCOUNT_ALERT_DELETE_BLOCKED(ext));
          return { skipped: true };
        }
        return deleteSipIpTrunkAccount(ext);
      });

      const results = await Promise.allSettled(ops);
      const success = results.filter(
        (r) => r.status === "fulfilled" && r.value?.response,
      ).length;
      if (success > 0)
        showMessageFn("success", `${success} account(s) deleted`);
      await loadData();
    } catch (e) {
      showMessageFn("error", e.message || SIP_TO_SIP_ACCOUNT_ERR_DELETE_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (accounts.length === 0) {
      showMessageFn("info", SIP_TO_SIP_ACCOUNT_MSG_NO_ACCOUNTS_TO_CLEAR);
      return;
    }
    if (!window.confirm(SIP_TO_SIP_ACCOUNT_CONFIRM_CLEAR_ALL)) {
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      // Block deletion for any extension referenced by SIP Trunk Group
      let groupRefList = [];
      try {
        const grpRes = await listGroups();
        groupRefList = (grpRes && (grpRes.message || grpRes.data)) || [];
      } catch {}
      const referencedExtensions = new Set(
        groupRefList
          .map((g) => g?.sip_trunk_id)
          .filter(Boolean)
          .map((v) => String(v))
          .map((v) => (v.includes("/") ? v.split("/")[1] : null))
          .filter(Boolean),
      );

      const deletables = accounts.filter(
        (acc) => !referencedExtensions.has(String(acc.extension)),
      );
      const blocked = accounts.length - deletables.length;
      if (blocked > 0) {
        alert(SIP_TO_SIP_ACCOUNT_ALERT_CLEAR_BLOCKED(blocked));
      }

      const results = await Promise.allSettled(
        deletables.map((acc) => deleteSipIpTrunkAccount(acc.extension)),
      );
      const success = results.filter(
        (r) => r.status === "fulfilled" && r.value?.response,
      ).length;
      if (success > 0)
        showMessageFn("success", `All ${success} account(s) deleted`);
      setSelected([]);
      await loadData();
    } catch (e) {
      showMessageFn("error", e.message || SIP_TO_SIP_ACCOUNT_ERR_CLEAR_ALL_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(accounts.length / itemsPerPage));
  const pagedAccounts = accounts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return {
    accounts,
    selected,
    setSelected,
    showModal,
    modalScrollRef,
    showPassword,
    message,
    setMessage,
    loading,
    form,
    editIndex,
    validationErrors,
    isInitialLoad,
    selectedCodecList,
    allCodecOptions,
    getCodecLabel,
    updateCodecList,
    togglePasswordVisibility,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
    handleDelete,
    handleClearAll,
    page,
    setPage,
    totalPages,
    pagedAccounts,
    itemsPerPage,
  };
}
