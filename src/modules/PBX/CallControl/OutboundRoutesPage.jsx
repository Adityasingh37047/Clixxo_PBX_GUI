import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import {
  createOutboundRoute,
  deleteOutboundRoute,
  fetchSipAccounts,
  listOutboundRoutes,
  listSipRegistrations,
  updateOutboundRoute,
} from "../../../api/apiService";

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

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",

  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",

  accent: "#2563eb",

  successGreen: "#22c55e",
  errorRed: "#ef4444",

  purple: "#8b5cf6",
};

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
      border: "0.5px solid #fecaca",
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
      background: "#f8fafc",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "12px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const OutboundRoutesPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    members: false,
    trunks: false,
  });
  const hasLoadedMembersRef = useRef(false);
  const hasLoadedTrunksRef = useRef(false);

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

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage((current) =>
      Math.min(
        Math.max(1, current),
        Math.max(1, Math.ceil(rows.length / itemsPerPage)),
      ),
    );
  }, [rows]);

  const showAlert = (text) => window.alert(text);

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = React.useRef(null);

  const handleImportSubmit = async () => {
    if (!importFile) {
      showAlert("Please select a file to import");
      return;
    }
    showAlert("Import API not yet configured");
  };

  const handleExport = () => {
    showAlert("Export API not yet configured");
  };

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

  const fetchOutboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listOutboundRoutes();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load outbound routes.");
        setRows([]);
        return;
      }
      setRows(normalizeList(res).map(mapRouteFromApi));
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
      showAlert(err?.message || "Failed to load extension list.");
      setAvailableExtensions([]);
    } finally {
      setLoading((prev) => ({ ...prev, members: false }));
    }
  };

  const loadTrunks = async () => {
    setLoading((prev) => ({ ...prev, trunks: true }));
    try {
      const res = await listSipRegistrations();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
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
      showAlert(err?.message || "Failed to load trunk list.");
      setAvailableTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, trunks: false }));
    }
  };

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

  useEffect(() => {
    const load = async () => {
      await Promise.allSettled([loadExtensions(), loadTrunks()]);
      await fetchOutboundRoutes();
    };
    load();
  }, []);

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

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) =>
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );

  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("Please select at least one row to delete.");
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const idsToDelete = selected
        .map((idx) => rows[idx]?.id)
        .filter((id) => id != null);
      const results = await Promise.all(
        idsToDelete.map((id) => deleteOutboundRoute(id)),
      );
      const failed = results.find((r) => !r?.response);
      if (failed)
        showAlert(failed?.message || "Failed to delete one or more routes.");
      else showAlert("Outbound route(s) deleted successfully.");
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
    if (!trimmedName) {
      showAlert("Name is required.");
      return;
    }
    const parsedPriority = Number(priority);
    if (
      !Number.isInteger(parsedPriority) ||
      parsedPriority < 1 ||
      parsedPriority > 99999
    ) {
      showAlert("Priority must be a number between 1 and 99999.");
      return;
    }
    if (passwordType === "Single Pin" && !singlePin.trim()) {
      showAlert("Please enter password for Single Pin.");
      return;
    }
    if (passwordType === "Single Pin" && !/^\d{1,16}$/.test(singlePin.trim())) {
      showAlert("Password PIN must be digits only (1–16 digits).");
      return;
    }
    if (memberExtensions.length === 0) {
      showAlert("Please select at least one member extension.");
      return;
    }
    if (memberTrunks.length === 0) {
      showAlert("Please select at least one member trunk.");
      return;
    }
    if (timeConditions.includes("Holiday") && !timeConditions.includes("All")) {
      showAlert("Holiday is only valid when All is checked.");
      return;
    }

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
    try {
      const res =
        editId != null
          ? await updateOutboundRoute(editId, apiPayload)
          : await createOutboundRoute(apiPayload);
      if (!res?.response) {
        showAlert(res?.message || "Failed to save outbound route.");
        return;
      }
      showAlert(
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

  const toggleTimeCondition = (value) => {
    setTimeConditions((prev) => {
      if (value === "Holiday" && !prev.includes("All")) return prev;
      const exists = prev.includes(value);
      const next = exists
        ? prev.filter((item) => item !== value)
        : [...prev, value];
      if (value === "All" && exists) {
        return next.filter((item) => item !== "Holiday");
      }
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

  const addSelectedExtensions = () => {
    if (availableExtensionSelected.length === 0) return;
    setMemberExtensions((prev) => [
      ...prev,
      ...availableExtensionSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableExtensionSelected([]);
  };
  const addAllExtensions = () => {
    setMemberExtensions(availableExtensions.map((item) => item.id));
    setAvailableExtensionSelected([]);
  };
  const removeSelectedExtensions = () => {
    if (chosenExtensionSelected.length === 0) return;
    setMemberExtensions((prev) =>
      prev.filter((id) => !chosenExtensionSelected.includes(id)),
    );
    setChosenExtensionSelected([]);
  };
  const removeAllExtensions = () => {
    setMemberExtensions([]);
    setChosenExtensionSelected([]);
  };

  const moveExtToBottom = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const rest = prev.filter((id) => !chosenExtensionSelected.includes(id));
      const chosen = prev.filter((id) => chosenExtensionSelected.includes(id));
      return [...rest, ...chosen];
    });
  };
  const moveExtUp = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (chosenExtensionSelected.includes(arr[i]) && !chosenExtensionSelected.includes(arr[i - 1]))
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
      return arr;
    });
  };
  const moveExtDown = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (chosenExtensionSelected.includes(arr[i]) && !chosenExtensionSelected.includes(arr[i + 1]))
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
      return arr;
    });
  };
  const moveExtToTop = () => {
    if (!chosenExtensionSelected.length) return;
    setMemberExtensions((prev) => {
      const chosen = prev.filter((id) => chosenExtensionSelected.includes(id));
      const rest = prev.filter((id) => !chosenExtensionSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const addSelectedTrunks = () => {
    if (availableTrunkSelected.length === 0) return;
    setMemberTrunks((prev) => [
      ...prev,
      ...availableTrunkSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableTrunkSelected([]);
  };
  const addAllTrunks = () => {
    setMemberTrunks(availableTrunks.map((item) => item.id));
    setAvailableTrunkSelected([]);
  };
  const removeSelectedTrunks = () => {
    if (chosenTrunkSelected.length === 0) return;
    setMemberTrunks((prev) =>
      prev.filter((id) => !chosenTrunkSelected.includes(id)),
    );
    setChosenTrunkSelected([]);
  };
  const removeAllTrunks = () => {
    setMemberTrunks([]);
    setChosenTrunkSelected([]);
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
        if (chosenTrunkSelected.includes(arr[i]) && !chosenTrunkSelected.includes(arr[i - 1]))
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
      return arr;
    });
  };
  const moveTrunkDown = () => {
    if (!chosenTrunkSelected.length) return;
    setMemberTrunks((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (chosenTrunkSelected.includes(arr[i]) && !chosenTrunkSelected.includes(arr[i + 1]))
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
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

  const allRowsSelected =
    rows.length > 0 && rows.every((_, index) => selected.includes(index));
  const someRowsSelected =
    rows.some((_, index) => selected.includes(index)) && !allRowsSelected;

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 24,
      }}
    >
      {/* Import Modal */}
      <Dialog
        open={showImportModal}
        onClose={() => {
          if (!importLoading) {
            setShowImportModal(false);
            setImportFile(null);
          }
        }}
        maxWidth={false}
        PaperProps={{ sx: { width: 420, maxWidth: "96vw", mx: "auto", p: 0 } }}
      >
        <DialogTitle
          className="h-10 flex items-center justify-center font-semibold text-[19px] text-[#ffffff] shadow-sm mt-0"
          style={{
            background: "linear-gradient(#3E5475 100%)",
            boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)",
          }}
        >
          Import Outbound Routes
        </DialogTitle>
        <DialogContent
          style={{ backgroundColor: "#dde0e4", padding: "20px 24px 12px" }}
        >
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-[13px] text-gray-600">
              Select a CSV or JSON file containing outbound route data to
              import.
            </p>
            <div
              className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-[#7B8FA8] hover:bg-[#EEF2F7] transition-colors"
              onClick={() => importFileRef.current?.click()}
            >
              <div className="text-gray-500 text-[13px] mb-1">
                {importFile ? (
                  <span className="text-green-700 font-semibold">
                    {importFile.name}
                  </span>
                ) : (
                  <span>
                    Click to choose file{" "}
                    <span className="text-gray-400">(CSV / JSON)</span>
                  </span>
                )}
              </div>
              <input
                ref={importFileRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            backgroundColor: "#dde0e4",
            justifyContent: "center",
            gap: 16,
            padding: "12px 24px 16px",
          }}
        >
          <Button
            variant="contained"
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            startIcon={
              importLoading && <CircularProgress size={16} color="inherit" />
            }
            sx={{
              background:
                "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 100%)",
              color: "#fff !important",
              fontWeight: 600,
              textTransform: "none",
              minWidth: 100,

              "&:hover": {
                background:
                  "linear-gradient(to bottom, #3E5475 0%, #2f405c 100%)",
                color: "#fff",
              },

              "&:disabled": {
                background: "#3E5475",
                color: "#fff",
              },
            }}
          >
            {importLoading ? "Importing..." : "Import"}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
            }}
            disabled={importLoading}
            sx={{
              background:
                "linear-gradient(to bottom, #eef2f7 0%, #d6dde6 100%)",
              color: "#3E5475 !important",
              fontWeight: 600,
              textTransform: "none",
              minWidth: 100,

              "&:hover": {
                background:
                  "linear-gradient(to bottom, #d6dde6 0%, #c2ccd9 100%)",
                color: "#2f405c",
              },

              "&:disabled": {
                background: "#f1f5f9",
                color: "#94a3b8",
              },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
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

        <div
          style={{
            background: "#ffffff",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: "1px solid #e2e8f0",
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: C.labelText,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 14px",
                  borderRadius: 999,
                }}
              >
                Page {page} · {rows.length} records
              </span>
              {selected.length > 0 && (
                <span
                  style={{
                    background: "#e0f2fe",
                    color: C.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.accent}`,
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
                disabled={importLoading}
                variant="outline"
                style={{  background: "#cbd5e1", color: "#374151", border: "1px solid #cbd5e1", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)" }}
              >
                ⬇ Import
              </Btn>
              <Btn onClick={handleExport} variant="outline" style={{
    background: "#cbd5e1",
    color: "#374151",
    border: "1px solid #cbd5e1",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  }}>
                ⬆ Export
              </Btn>
            </div>
          </div>

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
                        checked={allRowsSelected}
                        indeterminate={someRowsSelected}
                        onChange={() =>
                          allRowsSelected ? handleUncheckAll() : handleCheckAll()
                        }
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    </TH>
                    <TH style={{ width: 40 }}>#</TH>
                    <TH>Name</TH>
                    <TH>Priority</TH>
                    <TH>Enabled</TH>
                    <TH>Password</TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Member Extensions
                    </TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Member Trunks
                    </TH>
                    <TH style={{ width: 70 }}>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
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
                        No outbound routes yet.
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const rowBg = isSelected
                        ? "#e0f2fe"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      return (
                        <tr
                          key={row.id}
                          style={{
                            background: rowBg,
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 0",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={loading.delete}
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
                              padding: "10px 6px",
                              fontSize: 11,
                              color: C.mutedText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.priority}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  row.enabled === "Yes" ? "#166534" : "#475569",
                                padding: "4px 11px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: 72,
                              }}
                            >
                              {row.enabled}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            {row.passwordType === "Single Pin"
                              ? `Single Pin (${row.singlePin || ""})`
                              : row.passwordType}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
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
                              padding: "10px 14px",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
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
                            style={{ textAlign: "center", padding: "7px 8px" }}
                          >
                            <Btn
                              onClick={() => handleOpenEditModal(row)}
                              variant="outline"
                              style={{ fontSize: 10, padding: "3px 10px" }}
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              borderTop: `1px solid ${C.cardBorder}`,
              background: "#ffffff",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Btn
                onClick={handleCheckAll}
                disabled={loading.delete || rows.length === 0}
                variant="outline"
                style={{  background: "#cbd5e1", color: "#374151", border: "1px solid #cbd5e1", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)" }}
              >
                Check All
              </Btn>
              <Btn
                onClick={handleUncheckAll}
                disabled={loading.delete || selected.length === 0}
                variant="outline"
                style={{  background: "#cbd5e1", color: "#374151", border: "1px solid #cbd5e1", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)" }}
              >
                Uncheck All
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="danger"
                style={{  background: "#cbd5e1", color: "#374151", border: "1px solid #cbd5e1", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)" }}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: C.errorRed }} />
                )}
                Delete
              </Btn>
            </div>
            <Btn
              onClick={handleOpenAddModal}
              disabled={loading.save || loading.list}
              variant="accent"
              style={{
                background: "#cbd5e1",
                color: "#374151",
                border: "1px solid #cbd5e1",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
              }}
            >
              + Add New
            </Btn>
          </div>
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 1000, maxWidth: "98vw", mx: "auto", p: 0 },
        }}
      >
        <DialogTitle
          className="h-14 flex items-center justify-center font-semibold text-[19px] text-[#ffffff] shadow-sm"
          style={{
            background: "rgb(30, 45, 62)",
            boxShadow: "0 2px 8px 0 rgba(80,160,255,0.10)",
          }}
        >
          {editId != null ? "Edit Outbound Route" : "Add Outbound Route"}
        </DialogTitle>
        <DialogContent
          className="pt-3 pb-0 px-2"
          style={{
            padding: "12px 8px 0 8px",
            backgroundColor: "#dde0e4",
            border: "1px solid #444444",
            borderTop: "none",
          }}
        >
          <div className="flex flex-col gap-3 w-full pb-2">
            <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
              <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                Outbound Call Routing
              </div>
              <div className="p-4 flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-2"
                      style={{ minHeight: 32 }}
                    >
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div
                      className="flex items-center gap-2"
                      style={{ minHeight: 32 }}
                    >
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      />
                    </div>

                    <div
                      className="flex items-center gap-2"
                      style={{ minHeight: 32 }}
                    >
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 10 }}
                      >
                        Description
                      </label>
                      <input
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div
                      className="flex items-center gap-2"
                      style={{ minHeight: 32 }}
                    >
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 190, marginRight: 10 }}
                      >
                        Next Route
                      </label>
                      <input
                        type="checkbox"
                        checked={nextRoute}
                        onChange={(e) => setNextRoute(e.target.checked)}
                      />
                    </div>

                    <div
                      className="flex items-center gap-2"
                      style={{ minHeight: 32 }}
                    >
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 190, marginRight: 10 }}
                      >
                        Enabled <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select
                            value={enabled}
                            onChange={(e) => setEnabled(e.target.value)}
                          >
                            {ENABLE_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2"
                      style={{ minHeight: 32 }}
                    >
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 190, marginRight: 10 }}
                      >
                        Password
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select
                            value={passwordType}
                            onChange={(e) => {
                              setPasswordType(e.target.value);
                              if (e.target.value !== "Single Pin")
                                setSinglePin("");
                            }}
                          >
                            {PASSWORD_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    {passwordType === "Single Pin" && (
                      <div
                        className="flex items-center gap-2"
                        style={{ minHeight: 32 }}
                      >
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 190, marginRight: 10 }}
                        >
                          Enter Password
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={singlePin}
                          onChange={(e) => setSinglePin(e.target.value)}
                        />
                      </div>
                    )}

                    <div
                      className="flex items-center gap-2"
                      style={{ minHeight: 32 }}
                    >
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 190, marginRight: 10 }}
                      >
                        Rmemory Hunt
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select
                            value={rememoryHunt}
                            onChange={(e) => setRememoryHunt(e.target.value)}
                          >
                            {REMEMORY_HUNT_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 flex-wrap"
                      style={{ minHeight: 32 }}
                    >
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 190, marginRight: 10 }}
                      >
                        Time Condition
                      </label>
                      <div className="flex items-center gap-3">
                        {TIME_CONDITION_OPTIONS.map((opt) => (
                          <label
                            key={opt}
                            className="text-[13px] text-gray-700 flex items-center gap-1"
                          >
                            <input
                              type="checkbox"
                              checked={timeConditions.includes(opt)}
                              onChange={() => toggleTimeCondition(opt)}
                              disabled={
                                opt === "Holiday" &&
                                !timeConditions.includes("All")
                              }
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-gray-700 font-medium">
                    Dial Patterns
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="hidden md:grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                      <div className="text-[12px] text-gray-600 font-medium">
                        Patterns
                      </div>
                      <div className="text-[12px] text-gray-600 font-medium">
                        Strip
                      </div>
                      <div className="text-[12px] text-gray-600 font-medium">
                        Front
                      </div>
                      <div className="text-[12px] text-gray-600 font-medium">
                        Suffix
                      </div>
                      <div className="text-[12px] text-gray-600 font-medium">
                        Delay
                      </div>
                      <div />
                    </div>
                    {dialPatterns.map((item, index) => (
                      <div
                        key={`pattern-${index}`}
                        className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center"
                      >
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? "" : undefined}
                          value={item.pattern}
                          onChange={(e) =>
                            updateDialPattern(index, "pattern", e.target.value)
                          }
                        />
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? "" : undefined}
                          value={item.strip}
                          onChange={(e) =>
                            updateDialPattern(index, "strip", e.target.value)
                          }
                        />
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? "" : undefined}
                          value={item.front}
                          onChange={(e) =>
                            updateDialPattern(index, "front", e.target.value)
                          }
                        />
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? "" : undefined}
                          value={item.suffix}
                          onChange={(e) =>
                            updateDialPattern(index, "suffix", e.target.value)
                          }
                        />
                        <input
                          className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                          placeholder={index === 0 ? "Unit is ms" : undefined}
                          value={item.delay}
                          onChange={(e) =>
                            updateDialPattern(index, "delay", e.target.value)
                          }
                        />
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="h-7 w-7 border border-gray-400 bg-[#d9dde3] text-sm font-semibold"
                            onClick={addDialPattern}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="h-7 w-7 border border-gray-400 bg-[#d9dde3] text-sm font-semibold"
                            onClick={() => removeDialPatternAt(index)}
                            disabled={dialPatterns.length <= 1}
                          >
                            x
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] text-gray-700 font-medium">
                    Caller Number Conversion
                  </label>
                  <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="text-[12px] text-gray-600 font-medium">
                      Strip
                    </div>
                    <div className="text-[12px] text-gray-600 font-medium">
                      Front
                    </div>
                    <div className="text-[12px] text-gray-600 font-medium">
                      Suffix
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                      value={callerConversion.strip}
                      onChange={(e) =>
                        setCallerConversion((prev) => ({
                          ...prev,
                          strip: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                      value={callerConversion.front}
                      onChange={(e) =>
                        setCallerConversion((prev) => ({
                          ...prev,
                          front: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="border border-gray-300 rounded px-2 py-1 text-[13px] outline-none"
                      value={callerConversion.suffix}
                      onChange={(e) =>
                        setCallerConversion((prev) => ({
                          ...prev,
                          suffix: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <label className="text-[14px] text-gray-700 font-medium">
                    Member Extensions <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">
                        Available
                      </div>
                      <select
                        multiple
                        value={availableExtensionSelected}
                        onChange={(e) =>
                          setAvailableExtensionSelected(
                            Array.from(
                              e.target.selectedOptions,
                              (opt) => opt.value,
                            ),
                          )
                        }
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {loading.members ? (
                          <option>Loading extensions...</option>
                        ) : extensionAvailableList.length === 0 ? (
                          <option disabled>No extensions</option>
                        ) : (
                          extensionAvailableList.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold"
                        onClick={addSelectedExtensions}
                      >
                        &gt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold"
                        onClick={addAllExtensions}
                      >
                        &gt;&gt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold"
                        onClick={removeSelectedExtensions}
                      >
                        &lt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold"
                        onClick={removeAllExtensions}
                      >
                        &lt;&lt;
                      </button>
                    </div>

                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">
                        Selected
                      </div>
                      <select
                        multiple
                        value={chosenExtensionSelected}
                        onChange={(e) =>
                          setChosenExtensionSelected(
                            Array.from(
                              e.target.selectedOptions,
                              (opt) => opt.value,
                            ),
                          )
                        }
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {memberExtensions.length === 0 ? (
                          <option disabled>No selected extensions</option>
                        ) : (
                          memberExtensions.map((id) => (
                            <option key={id} value={id}>
                              {getExtensionLabel(id)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]" title="Move to bottom" onClick={moveExtToBottom}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,3 7,8 12,3" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="2" y1="11" x2="12" y2="11" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]" title="Move up" onClick={moveExtUp}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,9 7,4 12,9" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]" title="Move down" onClick={moveExtDown}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,5 7,10 12,5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]" title="Move to top" onClick={moveExtToTop}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="2" y1="3" x2="12" y2="3" stroke="#333" strokeWidth="2" strokeLinecap="round"/><polyline points="2,11 7,6 12,11" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <label className="text-[14px] text-gray-700 font-medium">
                    Member Trunks <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-[1fr_48px_1fr_48px] gap-3 items-start">
                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">
                        Available
                      </div>
                      <select
                        multiple
                        value={availableTrunkSelected}
                        onChange={(e) =>
                          setAvailableTrunkSelected(
                            Array.from(
                              e.target.selectedOptions,
                              (opt) => opt.value,
                            ),
                          )
                        }
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {loading.trunks ? (
                          <option>Loading trunks...</option>
                        ) : trunkAvailableList.length === 0 ? (
                          <option disabled>No trunks</option>
                        ) : (
                          trunkAvailableList.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold"
                        onClick={addSelectedTrunks}
                      >
                        &gt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold"
                        onClick={addAllTrunks}
                      >
                        &gt;&gt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold"
                        onClick={removeSelectedTrunks}
                      >
                        &lt;
                      </button>
                      <button
                        type="button"
                        className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold"
                        onClick={removeAllTrunks}
                      >
                        &lt;&lt;
                      </button>
                    </div>

                    <div>
                      <div className="text-[13px] font-semibold text-[#325a84] text-center mb-2">
                        Selected
                      </div>
                      <select
                        multiple
                        value={chosenTrunkSelected}
                        onChange={(e) =>
                          setChosenTrunkSelected(
                            Array.from(
                              e.target.selectedOptions,
                              (opt) => opt.value,
                            ),
                          )
                        }
                        className="w-full h-40 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] outline-none"
                      >
                        {memberTrunks.length === 0 ? (
                          <option disabled>No selected trunks</option>
                        ) : (
                          memberTrunks.map((id) => (
                            <option key={id} value={id}>
                              {getTrunkLabel(id)}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 pt-7">
                      <button type="button" className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]" title="Move to bottom" onClick={moveTrunkToBottom}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,3 7,8 12,3" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="2" y1="11" x2="12" y2="11" stroke="#333" strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]" title="Move up" onClick={moveTrunkUp}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,9 7,4 12,9" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]" title="Move down" onClick={moveTrunkDown}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polyline points="2,5 7,10 12,5" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button type="button" className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]" title="Move to top" onClick={moveTrunkToTop}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="2" y1="3" x2="12" y2="3" stroke="#333" strokeWidth="2" strokeLinecap="round"/><polyline points="2,11 7,6 12,11" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4 justify-center gap-6">
          <Button
            variant="contained"
            sx={{
              background:
                "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: 1.5,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: "0 2px 8px rgba(62, 84, 117, 0.4)",
              textTransform: "none",

              "&:hover": {
                background:
                  "linear-gradient(to bottom, #3E5475 0%, #2f405c 100%)",
                color: "#fff",
              },

              "&:disabled": {
                background: "#cbd5e1",
                color: "#64748b",
              },
            }}
            onClick={handleSave}
            disabled={loading.save}
            startIcon={
              loading.save && <CircularProgress size={20} color="inherit" />
            }
          >
            {loading.save ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="contained"
            sx={{
              background:
                "linear-gradient(to bottom, #eef2f7 0%, #d6dde6 100%)",
              color: "#3E5475 ",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: 1.5,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: "0 2px 8px rgba(62, 84, 117, 0.4)",
              textTransform: "none",

              "&:hover": {
                background:
                  "linear-gradient(to bottom, #d6dde6 0%, #c2ccd9 100%)",
                color: "#2f405c",
              },

              "&:disabled": {
                background: "#f1f5f9",
                color: "#94a3b8",
              },
            }}
            onClick={handleCloseModal}
            disabled={loading.save}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OutboundRoutesPage;
