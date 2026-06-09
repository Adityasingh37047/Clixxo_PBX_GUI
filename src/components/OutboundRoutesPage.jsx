import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
  FormControlLabel,
} from "@mui/material";

import {
  createOutboundRoute,
  deleteOutboundRoute,
  fetchSipAccounts,
  listOutboundRoutes,
  listSipRegistrations,
  updateOutboundRoute,
} from "../api/apiService";

// ── Constants & Initial States ────────────────────────────────────────────────
const ENABLE_OPTIONS = ["Yes", "No"];
const PASSWORD_OPTIONS = ["None", "Single Pin"];
const REMEMORY_HUNT_OPTIONS = ["No", "Yes"];
const TIME_CONDITION_OPTIONS = ["WorkTime", "Holiday", "All"];

const DEFAULT_DIAL_PATTERN = {
  pattern: "",
  strip: "",
  front: "",
  suffix: "",
  delay: "",
};
const DEFAULT_CALLER_CONVERSION = { strip: "", front: "", suffix: "" };

// ── Color Palette (CDR Style) ─────────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  successGreen: "#16a34a",
  errorRed: "#dc2626",
  amber: "#d97706",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#f3f4f6",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `0.5px solid #9ca3af`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const FieldRow = ({ label, children }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 32 }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 140,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────

const OutboundRoutesPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]); // Array of row indices
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    members: false,
    trunks: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const setError = (text) => {
    if (text) showMessage("error", text);
    else setMessage({ type: "", text: "" });
  };
  const [lastUpdated, setLastUpdated] = useState(null);

  const hasLoadedMembersRef = useRef(false);
  const hasLoadedTrunksRef = useRef(false);

  // Search & Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Form State
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [nextRoute, setNextRoute] = useState(false);
  const [enabled, setEnabled] = useState("Yes");
  const [passwordType, setPasswordType] = useState("None");
  const [singlePin, setSinglePin] = useState("");
  const [rememoryHunt, setRememoryHunt] = useState("No");
  const [timeConditions, setTimeConditions] = useState([]);
  const [dialPatterns, setDialPatterns] = useState([
    { ...DEFAULT_DIAL_PATTERN },
  ]);
  const [callerConversion, setCallerConversion] = useState({
    ...DEFAULT_CALLER_CONVERSION,
  });

  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [memberExtensions, setMemberExtensions] = useState([]);
  const [availableExtensionSelected, setAvailableExtensionSelected] = useState(
    [],
  );
  const [chosenExtensionSelected, setChosenExtensionSelected] = useState([]);

  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [memberTrunks, setMemberTrunks] = useState([]);
  const [availableTrunkSelected, setAvailableTrunkSelected] = useState([]);
  const [chosenTrunkSelected, setChosenTrunkSelected] = useState([]);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = useRef(null);

  // ── Helpers ──
  const showAlert = (text) => setError(text);

  const normalizeList = (raw) => {
    const list = raw?.message ?? raw?.data ?? raw;
    return Array.isArray(list) ? list : [];
  };

  const toUiYesNo = (value, defaultValue = "No") => {
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      if (normalized === "yes") return "Yes";
      if (normalized === "no") return "No";
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return defaultValue;
  };

  const toApiYesNo = (value, defaultValue = "no") => {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "yes") return "yes";
    if (normalized === "no") return "no";
    return defaultValue;
  };

  const mapPasswordTypeToUi = (apiValue) =>
    String(apiValue || "").toLowerCase() === "single_pin"
      ? "Single Pin"
      : "None";
  const mapPasswordTypeToApi = (uiValue) =>
    uiValue === "Single Pin" ? "single_pin" : "none";

  const mapRouteFromApi = (item) => {
    const timeCond = item?.time_condition || {};
    const callerConv = item?.caller_number_conversion || {};
    const dial = Array.isArray(item?.dial_patterns) ? item.dial_patterns : [];

    const uiTime = [];
    const all = !!timeCond?.all;
    if (timeCond?.work_time) uiTime.push("WorkTime");
    if (all) uiTime.push("All");
    if (all && timeCond?.holiday) uiTime.push("Holiday");

    const parsedNextRoute =
      typeof item?.next_route === "string"
        ? item.next_route.toLowerCase() === "yes"
        : !!item?.next_route;
    const parsedRmemory =
      typeof item?.rrmemory_hunt === "string"
        ? item.rrmemory_hunt.toLowerCase() === "yes"
        : !!(item?.rrmemory_hunt ?? item?.rrmemory_hunt);

    return {
      id: item?.id,
      name: String(item?.name || ""),
      priority: String(item?.priority ?? ""),
      description: String(item?.description || ""),
      nextRoute: parsedNextRoute,
      enabled: toUiYesNo(item?.enabled, "Yes"),
      passwordType: mapPasswordTypeToUi(item?.password_type),
      singlePin: item?.password_pin != null ? String(item.password_pin) : "",
      rememoryHunt: parsedRmemory ? "Yes" : "No",
      timeConditions: uiTime,
      callerConversion: {
        strip: String(callerConv?.strip ?? 0),
        front: String(callerConv?.front ?? ""),
        suffix: String(callerConv?.suffix ?? ""),
      },
      memberExtensions: Array.isArray(item?.member_extensions)
        ? item.member_extensions.map(String)
        : [],
      memberTrunks: Array.isArray(item?.member_trunks)
        ? item.member_trunks.map(String)
        : [],
      dialPatterns:
        dial.length > 0
          ? dial.map((d) => ({
              pattern: String(d?.pattern ?? ""),
              strip: String(d?.strip ?? 0),
              front: String(d?.front ?? ""),
              suffix: String(d?.suffix ?? ""),
              delay: String(d?.delay_ms ?? 0),
            }))
          : [{ ...DEFAULT_DIAL_PATTERN, pattern: "^\\d*$" }],
    };
  };

  // ── Data Fetching ──
  const fetchOutboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    setError("");
    try {
      const res = await listOutboundRoutes();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load outbound routes.");
        setRows([]);
        return;
      }
      setRows(normalizeList(res).map(mapRouteFromApi));
      setLastUpdated(new Date());
    } catch (err) {
      showAlert(err?.message || "Failed to load outbound routes.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  const loadExtensions = async () => {
    setLoading((prev) => ({ ...prev, members: true }));
    try {
      const res = await fetchSipAccounts();
      const list = normalizeList(res)
        .map((item) => {
          const ext = item?.extension ?? item?.ext ?? item?.id ?? item;
          const display = item?.display_name ?? item?.name ?? "";
          return {
            id: String(ext ?? ""),
            label: display
              ? `${display}-${String(ext ?? "")}`
              : String(ext ?? ""),
          };
        })
        .filter((item) => item.id);
      setAvailableExtensions(list);
      hasLoadedMembersRef.current = true;
    } catch (err) {
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, members: false }));
    }
  };

  const loadTrunks = async () => {
    setLoading((prev) => ({ ...prev, trunks: true }));
    try {
      const res = await listSipRegistrations();
      const list = Array.isArray(res?.message ?? res?.data ?? res)
        ? (res?.message ?? res?.data ?? res)
        : [];
      const trunks = list
        .map((t) => {
          const id = t?.trunkId || t?.trunk_id || t?.id || t;
          const name = t?.name || t?.trunk_name || "";
          const domain =
            t?.domain_id || t?.domain || t?.sip_server || t?.host || "";
          const label =
            name && domain
              ? `${name} : ${domain}`
              : name
                ? name
                : domain
                  ? domain
                  : String(id || "");
          return { id: String(id), label };
        })
        .filter((t) => t.id);
      setAvailableTrunks(trunks);
      hasLoadedTrunksRef.current = true;
    } catch (err) {
      setAvailableTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, trunks: false }));
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.allSettled([loadExtensions(), loadTrunks()]);
      await fetchOutboundRoutes();
    };
    load();
  }, []);

  const extensionLabelMap = useMemo(() => {
    const map = new Map();
    availableExtensions.forEach((item) => map.set(item.id, item.label));
    return map;
  }, [availableExtensions]);

  const trunkLabelMap = useMemo(() => {
    const map = new Map();
    availableTrunks.forEach((item) => map.set(item.id, item.label));
    return map;
  }, [availableTrunks]);

  const getExtensionLabel = (id) => extensionLabelMap.get(id) || id;
  const getTrunkLabel = (id) => trunkLabelMap.get(id) || id;

  const extensionAvailableList = useMemo(
    () =>
      availableExtensions.filter((item) => !memberExtensions.includes(item.id)),
    [availableExtensions, memberExtensions],
  );
  const trunkAvailableList = useMemo(
    () => availableTrunks.filter((item) => !memberTrunks.includes(item.id)),
    [availableTrunks, memberTrunks],
  );

  // ── Sorting Logic ADDED FROM Reference ──
  const moveExtensionToBottom = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const rest = prev.filter((id) => !chosenExtensionSelected.includes(id));
      const chosen = prev.filter((id) => chosenExtensionSelected.includes(id));
      return [...rest, ...chosen];
    });
  };

  const moveExtensionUp = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenExtensionSelected.includes(arr[i]) &&
          !chosenExtensionSelected.includes(arr[i - 1])
        ) {
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        }
      }
      return arr;
    });
  };

  const moveExtensionDown = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenExtensionSelected.includes(arr[i]) &&
          !chosenExtensionSelected.includes(arr[i + 1])
        ) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
      }
      return arr;
    });
  };

  const moveExtensionToTop = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const chosen = prev.filter((id) => chosenExtensionSelected.includes(id));
      const rest = prev.filter((id) => !chosenExtensionSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const moveTrunkToBottom = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((prev) => {
      const rest = prev.filter((id) => !chosenTrunkSelected.includes(id));
      const chosen = prev.filter((id) => chosenTrunkSelected.includes(id));
      return [...rest, ...chosen];
    });
  };

  const moveTrunkUp = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenTrunkSelected.includes(arr[i]) &&
          !chosenTrunkSelected.includes(arr[i - 1])
        ) {
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        }
      }
      return arr;
    });
  };

  const moveTrunkDown = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenTrunkSelected.includes(arr[i]) &&
          !chosenTrunkSelected.includes(arr[i + 1])
        ) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
      }
      return arr;
    });
  };

  const moveTrunkToTop = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((prev) => {
      const chosen = prev.filter((id) => chosenTrunkSelected.includes(id));
      const rest = prev.filter((id) => !chosenTrunkSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  // ── Search & Pagination ──
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.priority, r.description].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : rows;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(filteredRows.length / itemsPerPage)),
      ),
    );
  }, [filteredRows.length]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // ── Selection Logic ──
  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  // ── Form Modal Handlers ──
  const resetForm = () => {
    setEditId(null);
    setName("");
    setPriority("");
    setDescription("");
    setNextRoute(false);
    setEnabled("Yes");
    setPasswordType("None");
    setSinglePin("");
    setRememoryHunt("No");
    setTimeConditions([]);
    setDialPatterns([{ ...DEFAULT_DIAL_PATTERN, pattern: "^\\d*$" }]);
    setCallerConversion({ ...DEFAULT_CALLER_CONVERSION });
    setMemberExtensions([]);
    setMemberTrunks([]);
    setAvailableExtensionSelected([]);
    setChosenExtensionSelected([]);
    setAvailableTrunkSelected([]);
    setChosenTrunkSelected([]);
  };

  const ensureFormListsLoaded = async () => {
    const promises = [];
    if (!hasLoadedMembersRef.current) promises.push(loadExtensions());
    if (!hasLoadedTrunksRef.current) promises.push(loadTrunks());
    if (promises.length > 0) await Promise.allSettled(promises);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await ensureFormListsLoaded();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setPriority(row.priority || "");
    setDescription(row.description || "");
    setNextRoute(!!row.nextRoute);
    setEnabled(row.enabled || "Yes");
    setPasswordType(row.passwordType || "None");
    setSinglePin(row.singlePin || "");
    setRememoryHunt(row.rememoryHunt || "No");
    setTimeConditions(
      Array.isArray(row.timeConditions) ? row.timeConditions : [],
    );
    setDialPatterns(
      Array.isArray(row.dialPatterns) && row.dialPatterns.length > 0
        ? row.dialPatterns
        : [{ ...DEFAULT_DIAL_PATTERN }],
    );
    setCallerConversion(
      row.callerConversion || { ...DEFAULT_CALLER_CONVERSION },
    );
    setMemberExtensions(
      Array.isArray(row.memberExtensions) ? row.memberExtensions : [],
    );
    setMemberTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setAvailableExtensionSelected([]);
    setChosenExtensionSelected([]);
    setAvailableTrunkSelected([]);
    setChosenTrunkSelected([]);
    setShowModal(true);
    await ensureFormListsLoaded();
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  // ── Actions ──
  const handleDelete = async () => {
    if (selected.length === 0)
      return showAlert("Please select at least one row to delete.");
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    setError("");
    try {
      const idsToDelete = selected
        .map((idx) => rows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteOutboundRoute(id)),
      );
      const failed = results.find((r) => !r?.response);
      if (failed) {
        showAlert(failed?.message || "Failed to delete one or more routes.");
      } else {
        showMessage("success", "Outbound route(s) deleted successfully.");
      }
      await fetchOutboundRoutes();
      setSelected([]);
      setPage(1);
    } catch (err) {
      showAlert(err?.message || "Failed to delete route(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return showAlert("Name is required.");
    const parsedPriority = Number(priority);
    if (
      !Number.isInteger(parsedPriority) ||
      parsedPriority < 1 ||
      parsedPriority > 99999
    )
      return showAlert("Priority must be between 1 and 99999.");
    if (passwordType === "Single Pin" && !singlePin.trim())
      return showAlert("Please enter password for Single Pin.");
    if (passwordType === "Single Pin" && !/^\d{1,16}$/.test(singlePin.trim()))
      return showAlert("Password PIN must be digits only (1–16 digits).");
    if (memberExtensions.length === 0)
      return showAlert("Please select at least one member extension.");
    if (memberTrunks.length === 0)
      return showAlert("Please select at least one member trunk.");
    if (timeConditions.includes("Holiday") && !timeConditions.includes("All"))
      return showAlert("Holiday is only valid when All is checked.");

    const time_condition = {
      work_time: timeConditions.includes("WorkTime"),
      holiday: timeConditions.includes("Holiday"),
      all: timeConditions.includes("All"),
    };

    const dial_patterns = dialPatterns
      .filter((d) => String(d.pattern || "").trim())
      .map((d) => ({
        pattern: String(d.pattern || "").trim(),
        strip: Number(d.strip || 0),
        front: String(d.front || ""),
        suffix: String(d.suffix || ""),
        delay_ms: Number(d.delay || 0),
      }));

    const apiPayload = {
      name: trimmedName,
      priority: parsedPriority,
      description: description || null,
      next_route: toApiYesNo(nextRoute ? "yes" : "no", "yes"),
      enabled: toApiYesNo(enabled, "yes"),
      password_type: mapPasswordTypeToApi(passwordType),
      password_pin: passwordType === "Single Pin" ? singlePin.trim() : null,
      rrmemory_hunt: toApiYesNo(rememoryHunt, "no"),
      time_condition,
      dial_patterns:
        dial_patterns.length > 0 ? dial_patterns : [{ pattern: "^\\d*$" }],
      caller_number_conversion: {
        strip: Number(callerConversion.strip || 0),
        front: String(callerConversion.front || ""),
        suffix: String(callerConversion.suffix || ""),
      },
      member_extensions: [...memberExtensions],
      member_trunks: [...memberTrunks],
    };

    setLoading((prev) => ({ ...prev, save: true }));
    setError("");
    try {
      const res =
        editId != null
          ? await updateOutboundRoute(editId, apiPayload)
          : await createOutboundRoute(apiPayload);
      if (!res?.response)
        return showAlert(res?.message || "Failed to save outbound route.");
      showMessage(
        "success",
        editId != null
          ? "Outbound route updated successfully."
          : "Outbound route created successfully.",
      );
      await fetchOutboundRoutes();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save outbound route.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) return setError("Please select a file to import");
    setError("Import API not yet configured");
  };

  const handleExport = () => {
    setError("Export API not yet configured");
  };

  // ── Dial Patterns & Time Conditions ──
  const toggleTimeCondition = (value) => {
    setTimeConditions((prev) => {
      if (value === "Holiday" && !prev.includes("All")) return prev;
      const exists = prev.includes(value);
      const next = exists
        ? prev.filter((item) => item !== value)
        : [...prev, value];
      if (value === "All" && exists)
        return next.filter((item) => item !== "Holiday");
      return next;
    });
  };

  const updateDialPattern = (index, key, value) => {
    setDialPatterns((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  };

  const addDialPattern = () =>
    setDialPatterns((prev) => [
      ...prev,
      { ...DEFAULT_DIAL_PATTERN, pattern: "^\\d*$" },
    ]);
  const removeDialPatternAt = (index) =>
    setDialPatterns((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );

  // ── Dual Listbox Ext / Trunks ──
  const addSelectedExtensions = () => {
    if (!availableExtensionSelected.length) return;
    setMemberExtensions((p) => [
      ...p,
      ...availableExtensionSelected.filter((id) => !p.includes(id)),
    ]);
    setAvailableExtensionSelected([]);
  };
  const addAllExtensions = () => {
    setMemberExtensions(availableExtensions.map((i) => i.id));
    setAvailableExtensionSelected([]);
  };
  const removeSelectedExtensions = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((p) =>
      p.filter((id) => !chosenExtensionSelected.includes(id)),
    );
    setChosenExtensionSelected([]);
  };
  const removeAllExtensions = () => {
    setMemberExtensions([]);
    setChosenExtensionSelected([]);
  };

  const addSelectedTrunks = () => {
    if (!availableTrunkSelected.length) return;
    setMemberTrunks((p) => [
      ...p,
      ...availableTrunkSelected.filter((id) => !p.includes(id)),
    ]);
    setAvailableTrunkSelected([]);
  };
  const addAllTrunks = () => {
    setMemberTrunks(availableTrunks.map((i) => i.id));
    setAvailableTrunkSelected([]);
  };
  const removeSelectedTrunks = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((p) => p.filter((id) => !chosenTrunkSelected.includes(id)));
    setChosenTrunkSelected([]);
  };
  const removeAllTrunks = () => {
    setMemberTrunks([]);
    setChosenTrunkSelected([]);
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* ── Error / Success Floating Banner ── */}
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Call Control &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              Outbound Routes
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#DCE6F2",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: "#f1f5f9",
                  border: `0.5px solid ${C.cardBorder}`,
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 12px",
                  borderRadius: 20,
                }}
              >
                Page {page} · {filteredRows.length} records
              </span>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#e0f2fe",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    border: `0.5px solid ${C.accent}`,
                  }}
                >
                  {selected.length} selected
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Btn
                onClick={() => {
                  setImportFile(null);
                  setShowImportModal(true);
                }}
                variant="outline"
              >
                ⬇ Import
              </Btn>
              <Btn onClick={handleExport} variant="outline">
                ⬆ Export
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="danger"
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="accent"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {loading.list ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 48,
                }}
              >
                <CircularProgress size={28} style={{ color: C.accent }} />
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH style={{ width: 36 }}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                          "&.MuiCheckbox-indeterminate": { color: C.accent },
                        }}
                      />
                    </TH>
                    <TH style={{ width: 40 }}>#</TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Name
                    </TH>
                    <TH>Priority</TH>
                    <TH>Enabled</TH>
                    <TH>Password</TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Member Extensions
                    </TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Member Trunks
                    </TH>
                    <TH style={{ width: 60 }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No outbound routes found. Click '+ Add New' to create one."}
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const rowBgColor = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={row.id || realIdx}
                          style={{
                            background: rowBgColor,
                            borderBottom: "0.5px solid #9ca3af",
                            transition: "background 0.1s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f0f9ff";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBgColor;
                          }}
                        >
                          <td
                            style={{
                              textAlign: "center",
                              padding: "4px 0",
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleToggleRow(realIdx)}
                              sx={{
                                padding: "1px",
                                color: C.accent,
                                "&.Mui-checked": { color: C.accent },
                              }}
                            />
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 4px",
                              fontSize: 11,
                              color: C.mutedText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              padding: "7px 16px",
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.valueText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                              fontSize: 12,
                              color: C.valueText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.priority}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            <span
                              style={{
                                background:
                                  row.enabled === "Yes" ? "#dcfce7" : "#f1f5f9",
                                color:
                                  row.enabled === "Yes" ? "#15803d" : "#475569",
                                padding: "2px 8px",
                                borderRadius: 10,
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            >
                              {row.enabled}
                            </span>
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                              fontSize: 12,
                              color: C.valueText,
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            {row.passwordType === "Single Pin"
                              ? `Single Pin (${row.singlePin || ""})`
                              : row.passwordType}
                          </td>
                          <td
                            style={{
                              padding: "7px 16px",
                              fontSize: 12,
                              color: C.labelText,
                              borderRight: "0.5px solid #edf2f7",
                              whiteSpace: "normal",
                              wordBreak: "break-all",
                            }}
                          >
                            {row.memberExtensions?.length > 0 ? (
                              row.memberExtensions
                                .map(getExtensionLabel)
                                .join(", ")
                            ) : (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "7px 16px",
                              fontSize: 12,
                              color: C.labelText,
                              borderRight: "0.5px solid #edf2f7",
                              whiteSpace: "normal",
                              wordBreak: "break-all",
                            }}
                          >
                            {row.memberTrunks?.length > 0 ? (
                              row.memberTrunks.map(getTrunkLabel).join(", ")
                            ) : (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>
                          <td
                            style={{ textAlign: "center", padding: "4px 8px" }}
                          >
                            <Btn
                              onClick={() => handleOpenEditModal(row)}
                              variant="outline"
                              style={{
                                fontSize: 10,
                                padding: "3px 10px",
                                margin: "0 auto",
                              }}
                            >
                              Edit
                            </Btn>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          {!loading.list && filteredRows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#f8fafc",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  onClick={handlePrev}
                  disabled={loading.list || page <= 1}
                  variant="outline"
                >
                  ← Prev
                </Btn>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.accent,
                    background: "#e0f2fe",
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: `0.5px solid ${C.cardBorder}`,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <Btn
                  onClick={handleNext}
                  disabled={loading.list || page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{ sx: { width: 1000, maxWidth: "98vw", borderRadius: 2 } }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
          }}
        >
          {editId != null ? "Edit Outbound Route" : "Add Outbound Route"}
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* General Settings */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 12,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 6,
                }}
              >
                Route Settings
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 32px",
                }}
              >
                <FieldRow label="Name *">
                  <TextField
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </FieldRow>
                <FieldRow label="Enabled">
                  <MuiSelect
                    size="small"
                    fullWidth
                    value={enabled}
                    onChange={(e) => setEnabled(e.target.value)}
                    sx={{ fontSize: 13 }}
                  >
                    {ENABLE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FieldRow>

                <FieldRow label="Priority *">
                  <TextField
                    size="small"
                    fullWidth
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </FieldRow>
                <FieldRow label="Next Route">
                  <Checkbox
                    checked={nextRoute}
                    onChange={(e) => setNextRoute(e.target.checked)}
                    size="small"
                    sx={{
                      p: 0,
                      color: C.accent,
                      "&.Mui-checked": { color: C.accent },
                    }}
                  />
                </FieldRow>

                <FieldRow label="Description">
                  <TextField
                    size="small"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                  />
                </FieldRow>
                <FieldRow label="Rmemory Hunt">
                  <MuiSelect
                    size="small"
                    fullWidth
                    value={rememoryHunt}
                    onChange={(e) => setRememoryHunt(e.target.value)}
                    sx={{ fontSize: 13 }}
                  >
                    {REMEMORY_HUNT_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FieldRow>

                <FieldRow label="Password">
                  <MuiSelect
                    size="small"
                    fullWidth
                    value={passwordType}
                    onChange={(e) => {
                      setPasswordType(e.target.value);
                      if (e.target.value !== "Single Pin") setSinglePin("");
                    }}
                    sx={{ fontSize: 13 }}
                  >
                    {PASSWORD_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FieldRow>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 140,
                      flexShrink: 0,
                    }}
                  >
                    Time Condition
                  </label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {TIME_CONDITION_OPTIONS.map((opt) => (
                      <FormControlLabel
                        key={opt}
                        control={
                          <Checkbox
                            checked={timeConditions.includes(opt)}
                            onChange={() => toggleTimeCondition(opt)}
                            disabled={
                              opt === "Holiday" &&
                              !timeConditions.includes("All")
                            }
                            size="small"
                            sx={{
                              p: 0.5,
                              color: C.accent,
                              "&.Mui-checked": { color: C.accent },
                            }}
                          />
                        }
                        label={<span style={{ fontSize: 13 }}>{opt}</span>}
                        sx={{ m: 0 }}
                      />
                    ))}
                  </div>
                </div>

                {passwordType === "Single Pin" && (
                  <FieldRow label="Enter Password">
                    <TextField
                      size="small"
                      fullWidth
                      value={singlePin}
                      onChange={(e) => setSinglePin(e.target.value)}
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>
                )}
              </div>
            </div>

            {/* Dial Patterns & Caller Conversion */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {/* Dial Patterns */}
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    borderBottom: `1px solid ${C.cardBorder}`,
                    paddingBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.labelText,
                    }}
                  >
                    Dial Patterns
                  </span>
                  <Btn
                    onClick={addDialPattern}
                    variant="outline"
                    style={{ padding: "2px 8px" }}
                  >
                    + Add
                  </Btn>
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            fontSize: 11,
                            color: C.mutedText,
                            paddingBottom: 4,
                          }}
                        >
                          Pattern
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            fontSize: 11,
                            color: C.mutedText,
                            paddingBottom: 4,
                          }}
                        >
                          Strip
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            fontSize: 11,
                            color: C.mutedText,
                            paddingBottom: 4,
                          }}
                        >
                          Front
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            fontSize: 11,
                            color: C.mutedText,
                            paddingBottom: 4,
                          }}
                        >
                          Suffix
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            fontSize: 11,
                            color: C.mutedText,
                            paddingBottom: 4,
                          }}
                        >
                          Delay(ms)
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dialPatterns.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: "2px 4px 2px 0" }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={item.pattern}
                              onChange={(e) =>
                                updateDialPattern(
                                  index,
                                  "pattern",
                                  e.target.value,
                                )
                              }
                              inputProps={{
                                style: { fontSize: 12, padding: "4px" },
                              }}
                            />
                          </td>
                          <td style={{ padding: "2px 4px" }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={item.strip}
                              onChange={(e) =>
                                updateDialPattern(
                                  index,
                                  "strip",
                                  e.target.value,
                                )
                              }
                              inputProps={{
                                style: { fontSize: 12, padding: "4px" },
                              }}
                            />
                          </td>
                          <td style={{ padding: "2px 4px" }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={item.front}
                              onChange={(e) =>
                                updateDialPattern(
                                  index,
                                  "front",
                                  e.target.value,
                                )
                              }
                              inputProps={{
                                style: { fontSize: 12, padding: "4px" },
                              }}
                            />
                          </td>
                          <td style={{ padding: "2px 4px" }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={item.suffix}
                              onChange={(e) =>
                                updateDialPattern(
                                  index,
                                  "suffix",
                                  e.target.value,
                                )
                              }
                              inputProps={{
                                style: { fontSize: 12, padding: "4px" },
                              }}
                            />
                          </td>
                          <td style={{ padding: "2px 4px" }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={item.delay}
                              onChange={(e) =>
                                updateDialPattern(
                                  index,
                                  "delay",
                                  e.target.value,
                                )
                              }
                              inputProps={{
                                style: { fontSize: 12, padding: "4px" },
                              }}
                            />
                          </td>
                          <td style={{ padding: "2px 0 2px 4px", width: 24 }}>
                            <Btn
                              onClick={() => removeDialPatternAt(index)}
                              disabled={dialPatterns.length <= 1}
                              variant="danger"
                              style={{ padding: "2px 6px", minWidth: 24 }}
                            >
                              ✕
                            </Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Caller Conversion */}
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                  padding: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.labelText,
                    marginBottom: 12,
                    borderBottom: `1px solid ${C.cardBorder}`,
                    paddingBottom: 6,
                  }}
                >
                  Caller Number Conversion
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <FieldRow label="Strip:">
                    <TextField
                      size="small"
                      fullWidth
                      value={callerConversion.strip}
                      onChange={(e) =>
                        setCallerConversion((p) => ({
                          ...p,
                          strip: e.target.value,
                        }))
                      }
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>
                  <FieldRow label="Front:">
                    <TextField
                      size="small"
                      fullWidth
                      value={callerConversion.front}
                      onChange={(e) =>
                        setCallerConversion((p) => ({
                          ...p,
                          front: e.target.value,
                        }))
                      }
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>
                  <FieldRow label="Suffix:">
                    <TextField
                      size="small"
                      fullWidth
                      value={callerConversion.suffix}
                      onChange={(e) =>
                        setCallerConversion((p) => ({
                          ...p,
                          suffix: e.target.value,
                        }))
                      }
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </FieldRow>
                </div>
              </div>
            </div>

            {/* Member Extensions Dual List */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 12,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 6,
                }}
              >
                Member Extensions <span style={{ color: C.errorRed }}>*</span>
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 40px 1fr 40px",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.mutedText,
                      marginBottom: 6,
                      textAlign: "center",
                    }}
                  >
                    Available
                  </div>
                  <select
                    multiple
                    value={availableExtensionSelected}
                    onChange={(e) =>
                      setAvailableExtensionSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={{
                      width: "100%",
                      height: 160,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 4,
                      padding: 8,
                      fontSize: 13,
                      outline: "none",
                      background: "#f8fafc",
                    }}
                  >
                    {loading.members ? (
                      <option disabled>Loading...</option>
                    ) : extensionAvailableList.length === 0 ? (
                      <option disabled>No extensions available</option>
                    ) : (
                      extensionAvailableList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    justifyContent: "center",
                    paddingTop: 24,
                  }}
                >
                  <Btn
                    onClick={addSelectedExtensions}
                    variant="outline"
                    style={{ padding: "4px 0", fontSize: 12 }}
                  >
                    &gt;
                  </Btn>
                  <Btn
                    onClick={addAllExtensions}
                    variant="outline"
                    style={{ padding: "4px 0", fontSize: 12 }}
                  >
                    &gt;&gt;
                  </Btn>
                  <Btn
                    onClick={removeSelectedExtensions}
                    variant="outline"
                    style={{ padding: "4px 0", fontSize: 12 }}
                  >
                    &lt;
                  </Btn>
                  <Btn
                    onClick={removeAllExtensions}
                    variant="outline"
                    style={{ padding: "4px 0", fontSize: 12 }}
                  >
                    &lt;&lt;
                  </Btn>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.accent,
                      marginBottom: 6,
                      textAlign: "center",
                    }}
                  >
                    Selected
                  </div>
                  <select
                    multiple
                    value={chosenExtensionSelected}
                    onChange={(e) =>
                      setChosenExtensionSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={{
                      width: "100%",
                      height: 160,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 4,
                      padding: 8,
                      fontSize: 13,
                      outline: "none",
                      background: "#fff",
                    }}
                  >
                    {memberExtensions.length === 0 ? (
                      <option disabled>None selected</option>
                    ) : (
                      memberExtensions.map((id) => (
                        <option key={id} value={id}>
                          {getExtensionLabel(id)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {/* SORTING BUTTONS EXTENSIONS */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    justifyContent: "center",
                    paddingTop: 24,
                  }}
                >
                  <Btn
                    onClick={moveExtensionToBottom}
                    variant="outline"
                    style={{ padding: "6px 0", fontSize: 10 }}
                    title="Move to bottom"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2,3 7,8 12,3"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="2"
                        y1="11"
                        x2="12"
                        y2="11"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Btn>
                  <Btn
                    onClick={moveExtensionUp}
                    variant="outline"
                    style={{ padding: "6px 0", fontSize: 10 }}
                    title="Move up"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2,9 7,4 12,9"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Btn>
                  <Btn
                    onClick={moveExtensionDown}
                    variant="outline"
                    style={{ padding: "6px 0", fontSize: 10 }}
                    title="Move down"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2,5 7,10 12,5"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Btn>
                  <Btn
                    onClick={moveExtensionToTop}
                    variant="outline"
                    style={{ padding: "6px 0", fontSize: 10 }}
                    title="Move to top"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <line
                        x1="2"
                        y1="3"
                        x2="12"
                        y2="3"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <polyline
                        points="2,11 7,6 12,11"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Btn>
                </div>
              </div>
            </div>

            {/* Member Trunks Dual List */}
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 12,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 6,
                }}
              >
                Member Trunks <span style={{ color: C.errorRed }}>*</span>
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 40px 1fr 40px",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.mutedText,
                      marginBottom: 6,
                      textAlign: "center",
                    }}
                  >
                    Available
                  </div>
                  <select
                    multiple
                    value={availableTrunkSelected}
                    onChange={(e) =>
                      setAvailableTrunkSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={{
                      width: "100%",
                      height: 160,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 4,
                      padding: 8,
                      fontSize: 13,
                      outline: "none",
                      background: "#f8fafc",
                    }}
                  >
                    {loading.trunks ? (
                      <option disabled>Loading...</option>
                    ) : trunkAvailableList.length === 0 ? (
                      <option disabled>No trunks available</option>
                    ) : (
                      trunkAvailableList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    justifyContent: "center",
                    paddingTop: 24,
                  }}
                >
                  <Btn
                    onClick={addSelectedTrunks}
                    variant="outline"
                    style={{ padding: "4px 0", fontSize: 12 }}
                  >
                    &gt;
                  </Btn>
                  <Btn
                    onClick={addAllTrunks}
                    variant="outline"
                    style={{ padding: "4px 0", fontSize: 12 }}
                  >
                    &gt;&gt;
                  </Btn>
                  <Btn
                    onClick={removeSelectedTrunks}
                    variant="outline"
                    style={{ padding: "4px 0", fontSize: 12 }}
                  >
                    &lt;
                  </Btn>
                  <Btn
                    onClick={removeAllTrunks}
                    variant="outline"
                    style={{ padding: "4px 0", fontSize: 12 }}
                  >
                    &lt;&lt;
                  </Btn>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.accent,
                      marginBottom: 6,
                      textAlign: "center",
                    }}
                  >
                    Selected
                  </div>
                  <select
                    multiple
                    value={chosenTrunkSelected}
                    onChange={(e) =>
                      setChosenTrunkSelected(
                        Array.from(e.target.selectedOptions, (o) => o.value),
                      )
                    }
                    style={{
                      width: "100%",
                      height: 160,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 4,
                      padding: 8,
                      fontSize: 13,
                      outline: "none",
                      background: "#fff",
                    }}
                  >
                    {memberTrunks.length === 0 ? (
                      <option disabled>None selected</option>
                    ) : (
                      memberTrunks.map((id) => (
                        <option key={id} value={id}>
                          {getTrunkLabel(id)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {/* SORTING BUTTONS TRUNKS */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    justifyContent: "center",
                    paddingTop: 24,
                  }}
                >
                  <Btn
                    onClick={moveTrunkToBottom}
                    variant="outline"
                    style={{ padding: "6px 0", fontSize: 10 }}
                    title="Move to bottom"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2,3 7,8 12,3"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="2"
                        y1="11"
                        x2="12"
                        y2="11"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Btn>
                  <Btn
                    onClick={moveTrunkUp}
                    variant="outline"
                    style={{ padding: "6px 0", fontSize: 10 }}
                    title="Move up"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2,9 7,4 12,9"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Btn>
                  <Btn
                    onClick={moveTrunkDown}
                    variant="outline"
                    style={{ padding: "6px 0", fontSize: 10 }}
                    title="Move down"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <polyline
                        points="2,5 7,10 12,5"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Btn>
                  <Btn
                    onClick={moveTrunkToTop}
                    variant="outline"
                    style={{ padding: "6px 0", fontSize: 10 }}
                    title="Move to top"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <line
                        x1="2"
                        y1="3"
                        x2="12"
                        y2="3"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <polyline
                        points="2,11 7,6 12,11"
                        stroke="#333"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          style={{
            padding: "16px 24px",
            background: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="default"
            style={{ padding: "8px 24px", fontSize: 13 }}
          >
            {loading.save ? (
              <CircularProgress
                size={14}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Route"
                : "Save Route"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
            style={{ padding: "8px 24px", fontSize: 13 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

      {/* ── Import Modal ── */}
      <Dialog
        open={showImportModal}
        onClose={() => !importLoading && setShowImportModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { p: 0, borderRadius: 2 } }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
          }}
        >
          Import Outbound Routes
        </DialogTitle>
        <DialogContent
          style={{ padding: "24px 16px", backgroundColor: C.pageBg }}
        >
          <div
            style={{
              textAlign: "center",
              border: `2px dashed ${C.cardBorder}`,
              borderRadius: 8,
              padding: 32,
              cursor: "pointer",
              background: "#fff",
            }}
            onClick={() => importFileRef.current?.click()}
          >
            <div
              style={{
                fontSize: 13,
                color: importFile ? "#15803d" : C.mutedText,
                fontWeight: importFile ? 600 : 400,
              }}
            >
              {importFile ? importFile.name : "Click to choose CSV/JSON file"}
            </div>
            <input
              ref={importFileRef}
              type="file"
              accept=".csv,.json"
              style={{ display: "none" }}
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>
        </DialogContent>
        <DialogActions
          style={{
            padding: "16px 24px",
            background: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Btn
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            variant="default"
            style={{ padding: "8px 24px" }}
          >
            Import
          </Btn>
          <Btn
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
            }}
            disabled={importLoading}
            variant="outline"
            style={{ padding: "8px 24px" }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OutboundRoutesPage;
