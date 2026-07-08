import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { EXTENSION_COMPACT_MQ } from "../../../../theme/pbxTokens";
import {
  EXTENSION_INITIAL_FORM,
  EXTENSION_CODEC_OPTIONS,
} from "../../../../constants/ExtensionsConstants";
import { parseExtensionCodecList } from "../../../../components/common/CodecListBox";
import {
  transformApiToUi,
  transformUiToApi,
  normalizeCallForwardMutex,
  CF_OTHER_FORWARD_RULES,
} from "../utils/transformers";
import {
  validateExtension,
  validateContext,
  validateAllowCodecs,
  validatePassword,
  validateForm,
} from "../utils/validators";
import {
  fetchSipAccounts,
  createSipAccount,
  updateSipAccount,
  deleteSipAccount,
  bulkDeleteSipAccounts,
  bulkCreateSipAccounts,
  exportSipAccountsCsv,
  importSipAccountsCsv,
} from "../../../../api/apiService";

export function useExtensionsPage() {
  const isCompact = useMediaQuery(EXTENSION_COMPACT_MQ);
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EXTENSION_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");
  const [formMode, setFormMode] = useState("single");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = React.useRef(null);
  const modalScrollRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkForm, setBulkForm] = useState({
    startExtension: "",
    createNumber: "",
    passwordMode: "random",
    fixedPassword: "",
    passwordPrefix: "",
  });

  // Pagination
  const itemsPerPage = 50;
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadAccounts();
    }
  }, []);

  useLayoutEffect(() => {
    if (!showModal || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTop = 0;
  }, [showModal, activeTab]);

  // ── Filter rows by search ──────────────────────────────────────────────────
  const filteredAccounts = searchQuery.trim()
    ? accounts.filter((a) =>
        [
          a.extension,
          a.context,
          a.allow_codecs,
          a.status,
          a.user_name,
          a.email,
        ].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : accounts;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / itemsPerPage),
  );
  const pagedAccounts = filteredAccounts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const extensionOptions = React.useMemo(
    () =>
      Array.from(new Set(accounts.map((a) => String(a.extension)))).sort(
        (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0),
      ),
    [accounts],
  );

  // ── Select-all logic (mirrors CDR) ────────────────────────────────────────
  const allPageSelected =
    pagedAccounts.length > 0 &&
    pagedAccounts.every((item) => selected.includes(String(item.extension)));

  const somePageSelected =
    pagedAccounts.some((item) => selected.includes(String(item.extension))) &&
    !allPageSelected;

  const handleToggleAll = () => {
    const pageKeys = pagedAccounts.map((item) => String(item.extension));
    if (allPageSelected) {
      setSelected((prev) => prev.filter((key) => !pageKeys.includes(key)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageKeys])));
    }
  };

  const handleToggleRow = (extension) => {
    const key = String(extension);
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key],
    );
  };


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // ── Load accounts ─────────────────────────────────────────────────────────
  const loadAccounts = async () => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await fetchSipAccounts();
      if (response.response && response.message) {
        setAccounts(transformApiToUi(response.message));
      } else {
        showMessage("error", "Failed to load SIP accounts");
      }
    } catch (error) {
      showMessage(
        "error",
        error.message === "Network Error"
          ? "Network error. Please check your connection."
          : error.message || "Failed to load SIP accounts",
      );
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };
  const handleChange = (key, value) => {
    setForm((prev) => {
      if (
        CF_OTHER_FORWARD_RULES.some((rule) => key === `cf_${rule}_enabled`) &&
        value === "enabled" &&
        (prev.cf_always_enabled || "disabled") === "enabled"
      ) {
        return prev;
      }

      let next = { ...prev, [key]: value };
      if (key === "cf_always_enabled" && value === "enabled") {
        CF_OTHER_FORWARD_RULES.forEach((rule) => {
          next[`cf_${rule}_enabled`] = "disabled";
        });
      }
      return next;
    });
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    }
    let err = null;
    if (key === "extension") err = validateExtension(value);
    if (key === "password") err = validatePassword(value);
    if (key === "context") err = validateContext(value);
    if (err) setValidationErrors((prev) => ({ ...prev, [key]: err }));
  };

  const selectedCodecList = useMemo(
    () => parseExtensionCodecList(form.allow_codecs),
    [form.allow_codecs],
  );

  const getCodecLabel = (value) =>
    EXTENSION_CODEC_OPTIONS.find((c) => c.value === value)?.label || value;

  const updateCodecList = (newList) => {
    const str = newList.join(",");
    if (validationErrors.allow_codecs) {
      setValidationErrors((p) => {
        const n = { ...p };
        delete n.allow_codecs;
        return n;
      });
    }
    const ae = validateAllowCodecs(str);
    if (ae) setValidationErrors((p) => ({ ...p, allow_codecs: ae }));
    setForm((prev) => ({ ...prev, allow_codecs: str }));
  };

  // ── Follow Me helpers ─────────────────────────────────────────────────────
  const handleFollowMeEntryChange = (index, field, value) => {
    setForm((prev) => {
      const current = Array.isArray(prev.follow_me_entries)
        ? [...prev.follow_me_entries]
        : [];
      current[index] = {
        ...(current[index] || {
          destinationType: "",
          timeout: 30,
          confirm: "unconfirm",
        }),
        [field]: value,
      };
      return { ...prev, follow_me_entries: current };
    });
  };
  const handleAddFollowMeEntry = () => {
    setForm((prev) => ({
      ...prev,
      follow_me_entries: [
        ...(Array.isArray(prev.follow_me_entries)
          ? prev.follow_me_entries
          : []),
        { destinationType: "", timeout: 30, confirm: "unconfirm" },
      ],
    }));
  };

  // ── DND helpers ───────────────────────────────────────────────────────────
  const handleDndNumberChange = (index, value) => {
    setForm((prev) => {
      const cur = Array.isArray(prev.dnd_special_numbers)
        ? [...prev.dnd_special_numbers]
        : [];
      cur[index] = value;
      return {
        ...prev,
        dnd_special_numbers: cur,
        ...(index === 0 ? { dnd_dest: value } : {}),
      };
    });
  };
  const handleAddDndNumber = () => {
    setForm((prev) => ({
      ...prev,
      dnd_special_numbers: [
        ...(Array.isArray(prev.dnd_special_numbers)
          ? prev.dnd_special_numbers
          : []),
        "",
      ],
    }));
  };

  // ── Modal open/close ──────────────────────────────────────────────────────
  const handleOpenModal = (row = null, idx = null) => {
    setForm(
      normalizeCallForwardMutex(
        row
          ? { ...row, allow_codecs: row.allow_codecs || "ulaw,alaw" }
          : { ...EXTENSION_INITIAL_FORM },
      ),
    );
    setEditIndex(row ? idx : null);
    setFormMode("single");
    setActiveTab("basic");
    setShowModal(true);
  };

  const openBulkModal = () => {
    setForm({ ...EXTENSION_INITIAL_FORM });
    setEditIndex(null);
    setBulkForm({
      startExtension: "",
      createNumber: "",
      passwordMode: "random",
      fixedPassword: "",
      passwordPrefix: "",
    });
    setFormMode("bulk");
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setShowPassword(false);
    setValidationErrors({});
    setFormMode("single");
    setActiveTab("basic");
  };

  // ── Save (single) ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      showMessage("error", Object.values(errors)[0]);
      setValidationErrors(errors);
      return;
    }
    try {
      const { fetchSipIpTrunkAccounts } =
        await import("../../../../api/apiService");
      const ipTrunkRes = await fetchSipIpTrunkAccounts();
      if (ipTrunkRes?.response && Array.isArray(ipTrunkRes.message)) {
        if (
          ipTrunkRes.message.some(
            (item) => String(item.extension) === String(form.extension),
          )
        ) {
          showMessage(
            "error",
            "This extension already exists in SIP To SIP Account. Choose a different extension.",
          );
          return;
        }
      }
    } catch (e) {
      console.warn(
        "Extension duplication check (SIP To SIP) failed:",
        e?.message,
      );
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const apiData = transformUiToApi(form);
      if (!apiData.name || !String(apiData.name).trim()) {
        apiData.name = apiData.extension;
        apiData.display_name = apiData.extension;
      }
      if (
        editIndex === null &&
        (!apiData.user_password || !String(apiData.user_password).trim())
      ) {
        apiData.user_password = "pass" + apiData.extension;
      }
      const response =
        editIndex !== null
          ? await updateSipAccount(apiData)
          : await createSipAccount(apiData);
      if (response.response) {
        showMessage(
          "success",
          response.message ||
            (editIndex !== null
              ? "Account updated successfully"
              : "Account created successfully"),
        );
        await new Promise((r) => setTimeout(r, 300));
        await loadAccounts();
        setShowModal(false);
        setEditIndex(null);
      } else if (response.limit_exceeded) {
        showMessage(
          "error",
          `Maximum extension limit (${response.limit}) reached. Please upgrade your license.`,
        );
      } else {
        showMessage(
          "error",
          response.message ||
            (editIndex !== null
              ? "Failed to update account"
              : "Failed to create account"),
        );
      }
    } catch (error) {
      showMessage(
        "error",
        error.message === "Network Error"
          ? "Network error. Please check your connection."
          : error.message || "Failed to save account",
      );
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // ── Bulk save ─────────────────────────────────────────────────────────────
  const handleBulkSave = async () => {
    const start = parseInt(bulkForm.startExtension, 10);
    const count = parseInt(bulkForm.createNumber, 10);
    if (Number.isNaN(start) || start <= 0) {
      showMessage("error", "Start Extension must be a positive number");
      return;
    }
    if (Number.isNaN(count) || count <= 0) {
      showMessage("error", "Create Number must be a positive number");
      return;
    }
    if (bulkForm.passwordMode === "fixed") {
      if (!bulkForm.fixedPassword.trim()) {
        showMessage("error", "Please enter Fixed Registration Password");
        return;
      }
      const pe = validatePassword(bulkForm.fixedPassword);
      if (pe) {
        showMessage("error", pe);
        return;
      }
    }
    if (bulkForm.passwordMode === "prefix" && !bulkForm.passwordPrefix.trim()) {
      showMessage("error", "Please enter Prefix for Registration Password");
      return;
    }
    const defaultContext = form.context || accounts[0]?.context || "sip1";
    const defaultCodecs =
      form.allow_codecs || accounts[0]?.allow_codecs || "ulaw,alaw";
    const singleApiData = transformUiToApi({
      ...form,
      extension: String(start || 0),
      context: defaultContext,
      allow_codecs: defaultCodecs,
      password: "",
    });
    const {
      extension: _ext,
      password: _pwd,
      name: _name,
      ...commonSettings
    } = singleApiData;
    const existingExts = new Set(accounts.map((a) => String(a.extension)));
    const desiredExts = [];
    let candidate = start;
    while (desiredExts.length < count) {
      if (!existingExts.has(String(candidate)))
        desiredExts.push(String(candidate));
      candidate += 1;
      if (candidate - start > count + 200) break;
    }
    if (desiredExts.length === 0) {
      showMessage(
        "error",
        "No new extensions to create. All requested numbers already exist.",
      );
      return;
    }
    const nums = desiredExts.map(Number).sort((a, b) => a - b);
    const ranges = [];
    let rs = nums[0],
      prev = nums[0],
      rc = 1;
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === prev + 1) {
        rc++;
      } else {
        ranges.push({ start: rs, count: rc });
        rs = nums[i];
        rc = 1;
      }
      prev = nums[i];
    }
    ranges.push({ start: rs, count: rc });
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      for (const r of ranges) {
        const payload = {
          start_extension: String(r.start),
          create_number: r.count,
          reg_password_mode: bulkForm.passwordMode,
          reg_password_value:
            bulkForm.passwordMode === "fixed"
              ? bulkForm.fixedPassword
              : bulkForm.passwordMode === "prefix"
                ? bulkForm.passwordPrefix
                : undefined,
          ...commonSettings,
        };
        const response = await bulkCreateSipAccounts(payload);
        if (!response || !response.response) {
          if (response?.limit_exceeded) {
            throw new Error(
              `Maximum extension limit (${response.limit}) reached. Please upgrade your license.`,
            );
          }
          throw new Error(response?.message || "Bulk add failed");
        }
      }
      showMessage(
        "success",
        `Created ${desiredExts.length} SIP account(s) starting from ${start}.`,
      );
      await loadAccounts();
      handleCloseModal();
    } catch (err) {
      showMessage("error", err.message || "Bulk add failed");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // ── Bulk delete (multi-select "Delete Selected") ──────────────────────────
  const handleDelete = async () => {
    if (!selected.length) {
      showMessage("error", "Please select accounts to delete");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} account(s)?`,
      )
    )
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const response = await bulkDeleteSipAccounts(selected);
      if (response?.response) {
        showMessage(
          "success",
          response.message ||
            `${response.deleted ?? selected.length} account(s) deleted successfully`,
        );
        setSelected([]);
        await loadAccounts();
      } else {
        showMessage(
          "error",
          response?.message || "Failed to delete accounts",
        );
      }
    } catch (error) {
      showMessage(
        "error",
        error.message === "Network Error"
          ? "Network error. Please check your connection."
          : error.message || "Failed to delete accounts",
      );
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // ── Single delete (per-row trash icon) ────────────────────────────────────
  const handleDeleteSingle = async (extension) => {
    const account = accounts.find(
      (item) => String(item.extension) === String(extension),
    );
    if (!account) {
      showMessage("error", `Extension ${extension} not found`);
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete extension ${account.extension}?`,
      )
    )
      return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const response = await deleteSipAccount(account.extension, account.context);
      if (response?.response) {
        showMessage(
          "success",
          response.message || `Extension ${account.extension} deleted successfully`,
        );
        setSelected((prev) =>
          prev.filter((key) => key !== String(account.extension)),
        );
        await loadAccounts();
      } else {
        showMessage("error", response?.message || "Failed to delete extension");
      }
    } catch (error) {
      showMessage(
        "error",
        error.message === "Network Error"
          ? "Network error. Please check your connection."
          : error.message || "Failed to delete extension",
      );
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      showMessage("error", "Please select a CSV file to import");
      return;
    }
    setImportLoading(true);
    try {
      const csv = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(importFile);
      });
      const res = await importSipAccountsCsv({
        csv,
        mode: "skip",
        dryRun: false,
      });
      if (res?.response) {
        showMessage(
          "success",
          `Import complete — Created: ${res.created_count ?? 0}, Skipped: ${(res.skipped_validation_rows ?? 0) + (res.skipped_existing ?? 0)}`,
        );
        await loadAccounts();
        setShowImportModal(false);
        setImportFile(null);
      } else {
        showMessage("error", res?.error || "Import failed");
      }
    } catch (e) {
      showMessage("error", e?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { blob, filename } = await exportSipAccountsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showMessage("error", e?.message || "Export failed");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return {
    isCompact,
    accounts,
    selected,
    setSelected,
    showModal,
    form,
    editIndex,
    loading,
    message,
    setMessage,
    isInitialLoad,
    showPassword,
    setShowPassword,
    validationErrors,
    activeTab,
    setActiveTab,
    formMode,
    showImportModal,
    setShowImportModal,
    importFile,
    setImportFile,
    importLoading,
    importFileRef,
    modalScrollRef,
    searchQuery,
    setSearchQuery,
    bulkForm,
    setBulkForm,
    itemsPerPage,
    page,
    setPage,
    filteredAccounts,
    totalPages,
    pagedAccounts,
    extensionOptions,
    allPageSelected,
    somePageSelected,
    handleToggleAll,
    handleToggleRow,
    showMessage,
    loadAccounts,
    handleChange,
    selectedCodecList,
    getCodecLabel,
    updateCodecList,
    handleFollowMeEntryChange,
    handleAddFollowMeEntry,
    handleDndNumberChange,
    handleAddDndNumber,
    handleOpenModal,
    openBulkModal,
    handleCloseModal,
    handleSave,
    handleBulkSave,
    handleDelete,
    handleDeleteSingle,
    handleImportSubmit,
    handleExport,
  };
}
