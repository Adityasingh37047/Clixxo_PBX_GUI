import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  createOutboundRoute,
  deleteOutboundRoute,
  fetchSipAccounts,
  listOutboundRoutes,
  listSipRegistrations,
  updateOutboundRoute,
} from "../../../api/apiService";
import {
  PbxBreadcrumb,
  TableListLoading,
  TableListEmptyState,
  pbxPageWrapStyle,
  pbxPageInnerStyle,
  formatPbxItemListDisplay,
  PBX_LIST_TRUNCATE_THRESHOLD,
  PbxModalSectionHeading,
  PbxDualListBtn,
  pbxDualListLabelStyle,
  pbxDualListSelectStyle,
  pbxModalCancelBtnStyle,
} from "../../../shared/pbxSharedUi";
import {
  getNativeFieldInteraction,
  modalSelectSx,
  modalTextFieldFullSx,
  nativeFieldInputStyle,
} from "../../../shared/pbxSharedUi";
import {
  trunkModalPaperSx,
  trunkModalTitleStyle,
} from "../../../shared/pbxSharedUi";
import {
  sipPcmCardStyle,
  sipPcmToolbarStyle,
  sipPcmSelectedBadgeStyle,
  sipPcmCancelBtnStyle,
  sipPcmPrimaryBtnStyle,
  SipPcmPagination,
} from "../../../shared/pbxSharedUi";

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
  cardBorder: "#9CA3AF",

  labelText: "#3E5475",
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
  type,
  hoverBehavior = "background",
}) => {
  const variants = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
   cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    accent: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
    },
  };

  const s = variants[variant] || variants.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
      case "accent":
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
      case "danger":
        return "#b91c1c";
      case "cancel":
        return "#b6c2d3";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = extraStyle?.background || s.background;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "0.82";
          } else {
            e.currentTarget.style.background = hoverBg;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (hoverBehavior === "opacity") {
            e.currentTarget.style.opacity = "1";
          } else {
            e.currentTarget.style.background = baseBg;
          }
        }
      }}
    >
      {children}
    </button>
  );
};

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
};

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const OUTBOUND_MODAL_LABEL_WIDTH = 185;
const OUTBOUND_MODAL_FIELD_WIDTH = 210;
const OUTBOUND_RIGHT_LABEL_PADDING_LEFT = 28;

const FieldRow = ({ label, children, wide = false, labelWidth = 130 }) => (
  <div
    style={{
      display: "flex",
      alignItems: wide ? "flex-start" : "center",
      gap: 12,
      width: "100%",
      minHeight: 36,
    }}
  >
    <label
      style={{
        fontSize: 13,
        color: C.labelText,
        fontWeight: 600,
        whiteSpace: "nowrap",
        textAlign: "left",
        minWidth: labelWidth,
        width: "auto",
        flexShrink: 0,
        paddingTop: wide ? 4 : 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1, minWidth: 0, width: "100%" }}>{children}</div>
  </div>
);

const outboundModalControlSx = {
  ...modalTextFieldFullSx,
  "& .MuiOutlinedInput-root": {
    ...modalTextFieldFullSx["& .MuiOutlinedInput-root"],
    height: 36,
    minHeight: 36,
  },
};

const OutboundLeftField = ({ children }) => (
  <div
    style={{
      width: OUTBOUND_MODAL_FIELD_WIDTH,
      maxWidth: "100%",
      minHeight: 36,
      display: "flex",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

const OutboundRightRow = ({
  label,
  children,
  fieldWidth = OUTBOUND_MODAL_FIELD_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      minHeight: 36,
    }}
  >
    <label
      style={{
        fontSize: 13,
        color: C.labelText,
        fontWeight: 600,
        whiteSpace: "nowrap",
        textAlign: "left",
        width: OUTBOUND_MODAL_LABEL_WIDTH,
        minWidth: OUTBOUND_MODAL_LABEL_WIDTH,
        flexShrink: 0,
        paddingLeft: OUTBOUND_RIGHT_LABEL_PADDING_LEFT,
        boxSizing: "border-box",
      }}
    >
      {label}
    </label>
    <div style={{ width: fieldWidth, flexShrink: 0 }}>{children}</div>
  </div>
);

const outboundRightColStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: "100%",
};

const SectionCard = ({ title, children, isFirst = false }) => (
  <div style={{ marginBottom: 8 }}>
    <PbxModalSectionHeading title={title} isFirst={isFirst} />
    <div>{children}</div>
  </div>
);

const outboundCompactInputStyle = {
  ...nativeFieldInputStyle,
  width: "100%",
  height: 36,
  padding: "7px 10px",
};

const outboundPatternActionBtnStyle = {
  height: 32,
  width: 32,
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  borderRadius: 4,
  padding: 0,
  lineHeight: 1,
};

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
      setIsInitialLoad(false);
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
    <div style={pbxPageWrapStyle}>
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
          <Btn
            variant="primary"
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
            style={{ height: 36, padding: "0 24px", fontSize: 13 }}
          >
            {importLoading && <CircularProgress size={16} color="inherit" />}
            {importLoading ? "Importing..." : "Import"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
            }}
            disabled={importLoading}
            style={{ height: 36, padding: "0 24px", fontSize: 13 }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

      <div style={pbxPageInnerStyle}>
        <PbxBreadcrumb section="Call Control" current="Outbound Routes" />

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
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
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleCheckAll}
                disabled={loading.delete || rows.length === 0}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                Check All
              </Btn>
              <Btn
                onClick={handleUncheckAll}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                Uncheck All
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save || loading.list}
                variant="primary"
                style={sipPcmPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: "auto",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {isInitialLoad ? (
              <TableListLoading />
            ) : rows.length === 0 ? (
              <TableListEmptyState
                message="No outbound routes found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allRowsSelected}
                        indeterminate={someRowsSelected}
                        onChange={() =>
                          allRowsSelected ? handleUncheckAll() : handleCheckAll()
                        }
                        sx={checkboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Priority
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Password
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Extensions
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Member Trunks
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedRows.length - 1;
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};
                      const rowBg = isSelected
                        ? "#eff6ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      return (
                        <tr
                          key={row.id}
                          style={{
                            background: rowBg,
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
                              ...tdStyle,
                              background: rowBg,
                              width: 36,
                              borderLeft: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(realIdx)}
                              disabled={loading.delete}
                              sx={checkboxSx}
                            />
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {realIdx + 1}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.name}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.priority}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
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
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.passwordType === "Single Pin"
                              ? `Single Pin (${row.singlePin || ""})`
                              : row.passwordType}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              whiteSpace: "normal",
                              wordBreak: "break-all",
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.memberExtensions?.length > 0 ? (
                              <span
                                title={
                                  row.memberExtensions.length >
                                  PBX_LIST_TRUNCATE_THRESHOLD
                                    ? row.memberExtensions
                                        .map(getExtensionLabel)
                                        .join(", ")
                                    : undefined
                                }
                              >
                                {formatPbxItemListDisplay(
                                  row.memberExtensions,
                                  { mapItem: getExtensionLabel },
                                )}
                              </span>
                            ) : (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight: 400,
                              whiteSpace: "normal",
                              wordBreak: "break-all",
                              ...lastRowCellStyle,
                            }}
                          >
                            {row.memberTrunks?.length > 0 ? (
                              <span
                                title={
                                  row.memberTrunks.length >
                                  PBX_LIST_TRUNCATE_THRESHOLD
                                    ? row.memberTrunks
                                        .map(getTrunkLabel)
                                        .join(", ")
                                    : undefined
                                }
                              >
                                {formatPbxItemListDisplay(row.memberTrunks, {
                                  mapItem: getTrunkLabel,
                                })}
                              </span>
                            ) : (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>
                          <td
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              borderRight: "none",
                              ...lastRowCellStyle,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <EditDocumentIcon
                                titleAccess="Edit"
                                onClick={() => handleOpenEditModal(row)}
                                style={{
                                  cursor: loading.delete
                                    ? "not-allowed"
                                    : "pointer",
                                  color: "#2563eb",
                                  fontSize: 22,
                                  opacity: loading.delete ? 0.4 : 0.7,
                                  transition: "opacity 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (!loading.delete)
                                    e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  if (!loading.delete)
                                    e.currentTarget.style.opacity = "0.7";
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-start", pt: 5 } }}
        PaperProps={{ sx: trunkModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={trunkModalTitleStyle}>
          {editId != null ? "Edit Outbound Route" : "Add Outbound Route"}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 28px",
                alignItems: "start",
              }}
            >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <FieldRow label="Name *">
                    <OutboundLeftField>
                      <TextField
                        size="small"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={outboundModalControlSx}
                      />
                    </OutboundLeftField>
                  </FieldRow>
                  <FieldRow label="Priority *">
                    <OutboundLeftField>
                      <TextField
                        size="small"
                        fullWidth
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        sx={outboundModalControlSx}
                      />
                    </OutboundLeftField>
                  </FieldRow>
                  <FieldRow label="Description">
                    <OutboundLeftField>
                      <TextField
                        size="small"
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={outboundModalControlSx}
                      />
                    </OutboundLeftField>
                  </FieldRow>
                  <FieldRow label="Rmemory Hunt">
                    <OutboundLeftField>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={rememoryHunt}
                          onChange={(e) => setRememoryHunt(e.target.value)}
                          sx={modalSelectSx}
                        >
                          {REMEMORY_HUNT_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </OutboundLeftField>
                  </FieldRow>
                </div>

                <div style={outboundRightColStyle}>
                  <OutboundRightRow label="Next Route">
                    <Checkbox
                      checked={nextRoute}
                      onChange={(e) => setNextRoute(e.target.checked)}
                      sx={checkboxSx}
                    />
                  </OutboundRightRow>
                  <OutboundRightRow label="Enabled *">
                    <FormControl size="small" fullWidth>
                      <Select
                        value={enabled}
                        onChange={(e) => setEnabled(e.target.value)}
                        sx={modalSelectSx}
                      >
                        {ENABLE_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </OutboundRightRow>
                  <OutboundRightRow label="Password">
                    <FormControl size="small" fullWidth>
                      <Select
                        value={passwordType}
                        onChange={(e) => {
                          setPasswordType(e.target.value);
                          if (e.target.value !== "Single Pin") setSinglePin("");
                        }}
                        sx={modalSelectSx}
                      >
                        {PASSWORD_OPTIONS.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </OutboundRightRow>
                  {passwordType === "Single Pin" && (
                    <OutboundRightRow label="Enter Password">
                      <TextField
                        size="small"
                        fullWidth
                        value={singlePin}
                        onChange={(e) => setSinglePin(e.target.value)}
                        sx={outboundModalControlSx}
                      />
                    </OutboundRightRow>
                  )}
                  <OutboundRightRow label="Time Condition" fieldWidth={280}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      {TIME_CONDITION_OPTIONS.map((opt) => (
                        <label
                          key={opt}
                          style={{
                            fontSize: 13,
                            color: C.valueText,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            cursor: "pointer",
                          }}
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
                  </OutboundRightRow>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <PbxModalSectionHeading title="Dial Patterns" />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 72px",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  {["Patterns", "Strip", "Front", "Suffix", "Delay"].map(
                    (heading) => (
                      <div
                        key={heading}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.labelText,
                        }}
                      >
                        {heading}
                      </div>
                    ),
                  )}
                  <div />
                </div>
                {dialPatterns.map((item, index) => (
                  <div
                    key={`pattern-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 72px",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    {(["pattern", "strip", "front", "suffix", "delay"]).map(
                      (field) => (
                        <input
                          key={field}
                          style={outboundCompactInputStyle}
                          placeholder={
                            field === "delay" ? "Unit is ms" : undefined
                          }
                          value={item[field]}
                          onChange={(e) =>
                            updateDialPattern(index, field, e.target.value)
                          }
                          {...getNativeFieldInteraction()}
                        />
                      ),
                    )}
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        type="button"
                        style={outboundPatternActionBtnStyle}
                        onClick={addDialPattern}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        style={{
                          ...outboundPatternActionBtnStyle,
                          opacity: dialPatterns.length <= 1 ? 0.5 : 1,
                        }}
                        onClick={() => removeDialPatternAt(index)}
                        disabled={dialPatterns.length <= 1}
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 8 }}>
                <PbxModalSectionHeading title="Caller Number Conversion" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  {["Strip", "Front", "Suffix"].map((heading) => (
                    <div
                      key={heading}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      {heading}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {(["strip", "front", "suffix"]).map((field) => (
                    <input
                      key={field}
                      style={outboundCompactInputStyle}
                      value={callerConversion[field]}
                      onChange={(e) =>
                        setCallerConversion((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      {...getNativeFieldInteraction()}
                    />
                  ))}
                </div>
            </div>

            <SectionCard title="Member Extensions *">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                <div>
                  <div style={pbxDualListLabelStyle}>Available</div>
                  <select
                    multiple
                    size={6}
                    value={availableExtensionSelected}
                    onChange={(e) =>
                      setAvailableExtensionSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={pbxDualListSelectStyle}
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <PbxDualListBtn onClick={addSelectedExtensions}>
                    &gt;
                  </PbxDualListBtn>
                  <PbxDualListBtn onClick={addAllExtensions}>&gt;&gt;</PbxDualListBtn>
                  <PbxDualListBtn onClick={removeSelectedExtensions}>
                    &lt;
                  </PbxDualListBtn>
                  <PbxDualListBtn onClick={removeAllExtensions}>
                    &lt;&lt;
                  </PbxDualListBtn>
                </div>
                <div>
                  <div style={pbxDualListLabelStyle}>Selected</div>
                  <select
                    multiple
                    size={6}
                    value={chosenExtensionSelected}
                    onChange={(e) =>
                      setChosenExtensionSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={pbxDualListSelectStyle}
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <PbxDualListBtn
                    reorder
                    title="Move to bottom"
                    onClick={moveExtToBottom}
                  >
                    vv
                  </PbxDualListBtn>
                  <PbxDualListBtn reorder title="Move up" onClick={moveExtUp}>
                    ^
                  </PbxDualListBtn>
                  <PbxDualListBtn reorder title="Move down" onClick={moveExtDown}>
                    v
                  </PbxDualListBtn>
                  <PbxDualListBtn reorder title="Move to top" onClick={moveExtToTop}>
                    ^^
                  </PbxDualListBtn>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Member Trunks *">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                <div>
                  <div style={pbxDualListLabelStyle}>Available</div>
                  <select
                    multiple
                    size={6}
                    value={availableTrunkSelected}
                    onChange={(e) =>
                      setAvailableTrunkSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={pbxDualListSelectStyle}
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <PbxDualListBtn onClick={addSelectedTrunks}>&gt;</PbxDualListBtn>
                  <PbxDualListBtn onClick={addAllTrunks}>&gt;&gt;</PbxDualListBtn>
                  <PbxDualListBtn onClick={removeSelectedTrunks}>&lt;</PbxDualListBtn>
                  <PbxDualListBtn onClick={removeAllTrunks}>&lt;&lt;</PbxDualListBtn>
                </div>
                <div>
                  <div style={pbxDualListLabelStyle}>Selected</div>
                  <select
                    multiple
                    size={6}
                    value={chosenTrunkSelected}
                    onChange={(e) =>
                      setChosenTrunkSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={pbxDualListSelectStyle}
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <PbxDualListBtn
                    reorder
                    title="Move to bottom"
                    onClick={moveTrunkToBottom}
                  >
                    vv
                  </PbxDualListBtn>
                  <PbxDualListBtn reorder title="Move up" onClick={moveTrunkUp}>
                    ^
                  </PbxDualListBtn>
                  <PbxDualListBtn
                    reorder
                    title="Move down"
                    onClick={moveTrunkDown}
                  >
                    v
                  </PbxDualListBtn>
                  <PbxDualListBtn
                    reorder
                    title="Move to top"
                    onClick={moveTrunkToTop}
                  >
                    ^^
                  </PbxDualListBtn>
                </div>
              </div>
            </SectionCard>
          </div>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: `1px solid ${C.cardBorder}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
          style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save && <CircularProgress size={20} color="inherit" />}
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
              style={pbxModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OutboundRoutesPage;
