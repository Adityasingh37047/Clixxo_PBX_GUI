import React, { useEffect, useMemo, useRef, useState } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import {
  Alert,
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
  createInboundRoute,
  deleteInboundRoute,
  listInboundRoutes,
  listIvrDestinations,
  listSipRegistrations,
  updateInboundRoute,
} from "../../../api/apiService";

const ENABLE_OPTIONS = ["Yes", "No"];
const T38_OPTIONS = ["Yes", "No"];
const TIME_CONDITION_OPTIONS = ["Yes", "No"];
const MOBILITY_OPTIONS = ["Yes", "No"];
const SEND_RINGTONE_OPTIONS = ["Remote", "Local"];

const DESTINATION_OPTIONS = [
  "Call Queue",
  "CallBacks",
  "Conference Rooms",
  "DISA",
  "Extensions",
  "Fax To Mail",
  "IVR Menus",
  "Ring Groups",
  "Trunks",
  "Outbound",
  "Voicemails",
  "Extension_Range",
  "Other",
];

const DEST_TYPE_TO_UI = {
  extensions: "Extensions",
  voicemail: "Voicemails",
  fax_to_email: "Fax To Mail",
  ring_group: "Ring Groups",
  conference: "Conference Rooms",
  ivr_menu: "IVR Menus",
  extension_range: "Extension_Range",
  other: "Other",
  call_queue: "Call Queue",
  callbacks: "CallBacks",
  disa: "DISA",
  trunk: "Trunks",
  outbound_route: "Outbound",
};

const UI_TO_DEST_TYPE = {
  Extensions: "extensions",
  Voicemails: "voicemail",
  "Fax To Mail": "fax_to_email",
  "Ring Groups": "ring_group",
  "Conference Rooms": "conference",
  "IVR Menus": "ivr_menu",
  Extension_Range: "extension_range",
  Other: "other",
  "Call Queue": "call_queue",
  CallBacks: "callbacks",
  DISA: "disa",
  Trunks: "trunk",
  Outbound: "outbound_route",
};

const OTHER_DESTINATION_OPTIONS = ["Hangup", "Hold Music"];
const DESTINATION_NEEDS_EXTENSION = new Set([
  "Extensions",
  "Fax To Mail",
  "Voicemails",
]);
const DESTINATION_NEEDS_TARGET = new Set([
  "Extensions",
  "Fax To Mail",
  "Voicemails",
  "Conference Rooms",
  "Ring Groups",
  "IVR Menus",
  "Call Queue",
  "CallBacks",
  "DISA",
  "Trunks",
  "Outbound",
  "Other",
]);
const SELECT_MENU_PROPS = {
  PaperProps: {
    sx: {
      maxHeight: 260,
      maxWidth: "90vw",
    },
  },
};

/** Dial / route number for a ring group (matches RingGroup.jsx: rg_number). */
const getRingGroupDialNumber = (item) => {
  if (!item || typeof item !== "object") return "";
  const n =
    item.rg_number ??
    item.ring_group_no ??
    item.group_no ??
    item.group ??
    item.page_number;
  if (n !== undefined && n !== null && String(n).trim() !== "")
    return String(n).trim();
  return "";
};

/** If dest_value was saved as DB id, map to rg_number for display and API. */
const resolveRingGroupDestValue = (rawDestValue, ringGroupRows) => {
  if (rawDestValue == null || rawDestValue === "") return "";
  const s = String(rawDestValue).trim();
  if (!Array.isArray(ringGroupRows) || ringGroupRows.length === 0) return s;
  if (ringGroupRows.some((g) => getRingGroupDialNumber(g) === s)) return s;
  const byId = ringGroupRows.find((g) => String(g?.id) === s);
  if (byId) {
    const num = getRingGroupDialNumber(byId);
    return num || s;
  }
  return s;
};

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
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
      color: "#1e293b",
      fontWeight: 700,
      fontSize: 10.5,
      padding: "9px 8px",
      textAlign: "center",
      borderBottom: "1px solid #9ca3af",
      borderRight: "0.5px solid #9ca3af",
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
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 170,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const InboundRoutesPage = () => {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState({
    list: false,
    save: false,
    delete: false,
    trunks: false,
  });
  const hasLoadedTrunksRef = useRef(false);

  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [didPattern, setDidPattern] = useState("");
  const [callerIdPattern, setCallerIdPattern] = useState("");
  const [distinctiveRingTone, setDistinctiveRingTone] = useState("");
  const [enableT38, setEnableT38] = useState("No");
  const [enableTimeCondition, setEnableTimeCondition] = useState("No");
  const [destination, setDestination] = useState("");
  const [enabled, setEnabled] = useState("Yes");
  const [priority, setPriority] = useState("102");
  const [enableMobilityExtension, setEnableMobilityExtension] = useState("No");
  const [sendRingTone, setSendRingTone] = useState("Remote");
  const [destinationTarget, setDestinationTarget] = useState("");
  const [extensionRange, setExtensionRange] = useState("");

  const [destinations, setDestinations] = useState({});
  const hasLoadedDestinationDataRef = useRef(false);

  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [selectedTrunks, setSelectedTrunks] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

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

  const [message, setMessage] = useState({ type: "", text: "" });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const showAlert = (text) => showMessage("error", text);

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

  const mapDestTypeToUi = (destType) =>
    DEST_TYPE_TO_UI[String(destType || "").toLowerCase()] || "";
  const mapUiToDestType = (uiDest) => UI_TO_DEST_TYPE[uiDest] || "call_queue";

  /** Ring-group list API uses `rg_number` (same as Ring Group page); do not use DB id as dial target. */
  const getRingGroupDialNumber = (g) => {
    if (!g || typeof g !== "object") return "";
    const n =
      g.rg_number ?? g.ring_group_no ?? g.group_no ?? g.group ?? g.page_number;
    if (n != null && String(n).trim() !== "") return String(n).trim();
    return "";
  };

  /** If dest_value was saved as ring-group row id, map it to the real group number (e.g. 6200). */
  const resolveRingGroupDestValue = (storedValue, ringGroupsList) => {
    if (storedValue == null || storedValue === "") return "";
    const s = String(storedValue).trim();
    if (!Array.isArray(ringGroupsList) || ringGroupsList.length === 0) return s;

    if (ringGroupsList.some((g) => getRingGroupDialNumber(g) === s)) return s;

    const byId = ringGroupsList.find((g) => String(g?.id) === s);
    if (byId) {
      const dial = getRingGroupDialNumber(byId);
      return dial || s;
    }
    return s;
  };

  const mapRouteFromApi = (item, ringGroupsList = []) => {
    const uiDestination = mapDestTypeToUi(item?.dest_type);
    const rawDestValue =
      item?.dest_value != null ? String(item.dest_value) : "";
    const destinationTargetRaw =
      uiDestination === "Extension_Range"
        ? ""
        : uiDestination === "Ring Groups"
          ? resolveRingGroupDestValue(rawDestValue, ringGroupsList)
          : rawDestValue;
    return {
      id: item?.id,
      name: String(item?.name || ""),
      didPattern: String(item?.did_pattern || ""),
      callerIdPattern: String(item?.callerid_pattern || ""),
      distinctiveRingTone: String(item?.distinctive_ringtone || ""),
      enableT38: toUiYesNo(item?.enable_t38, "No"),
      enableTimeCondition: toUiYesNo(item?.enable_time_condition, "No"),
      destination: uiDestination,
      destinationTarget: destinationTargetRaw,
      extensionRange: uiDestination === "Extension_Range" ? rawDestValue : "",
      memberTrunks: Array.isArray(item?.member_trunks)
        ? item.member_trunks.map(String)
        : [],
      enabled: toUiYesNo(item?.enabled, "Yes"),
      priority: String(item?.priority ?? "100"),
      enableMobilityExtension: toUiYesNo(item?.enable_mobility_ext, "No"),
      sendRingTone: String(item?.send_ringtone || "Remote"),
    };
  };

  const normalizeList = (raw) => {
    const list = raw?.message ?? raw?.data ?? raw;
    return Array.isArray(list) ? list : [];
  };

  const fetchInboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listInboundRoutes();
      if (!res?.response) {
        showAlert(res?.message || "Failed to load inbound routes.");
        setRows([]);
        return;
      }
      const list = Array.isArray(res?.message)
        ? res.message
        : res?.message
          ? [res.message]
          : [];
      setRows(list.map((row) => mapRouteFromApi(row, [])));
    } catch (err) {
      showAlert(err?.message || "Failed to load inbound routes.");
      setRows([]);
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  useEffect(() => {
    fetchInboundRoutes();
  }, []);

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
          const host = t?.host || t?.sip_server || "";
          let label = "";
          if (name && host) label = `${name}@${host}`;
          else if (name) label = name;
          else if (host) label = host;
          else label = String(id || "");
          return { id: String(id), label: label || String(id || "") };
        })
        .filter((t) => t.id);
      setAvailableTrunks(trunks);
      hasLoadedTrunksRef.current = true;
    } catch (err) {
      showAlert(err?.message || "Failed to load trunks.");
      setAvailableTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, trunks: false }));
    }
  };

  const loadDestinationData = async () => {
    try {
      const res = await listIvrDestinations();
      if (res?.response && res?.message && typeof res.message === "object") {
        setDestinations(res.message);
      }
      hasLoadedDestinationDataRef.current = true;
    } catch {
      setDestinations({});
    }
  };

  const DEST_UI_TO_API_KEY = {
    Extensions: "Extensions",
    Voicemails: "Voicemails",
    "Fax To Mail": "FaxToMail",
    "Ring Groups": "RingGroups",
    "Conference Rooms": "ConferenceRooms",
    "IVR Menus": "IVR",
    "Call Queue": "CallQueue",
    CallBacks: "Callbacks",
    DISA: "DISA",
    Trunks: "Trunks",
    Outbound: "Outbound",
    Other: "Other",
  };

  const getDestinationChoices = () => {
    const apiKey = DEST_UI_TO_API_KEY[destination];
    if (!apiKey) return [];
    const list = Array.isArray(destinations[apiKey])
      ? destinations[apiKey]
      : [];
    return list.map((opt) => ({
      id: String(opt.value),
      label: String(opt.label),
    }));
  };

  const destinationChoices = getDestinationChoices();
  const needsDestinationTarget = DESTINATION_NEEDS_TARGET.has(destination);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setDidPattern("");
    setCallerIdPattern("");
    setDistinctiveRingTone("");
    setEnableT38("No");
    setEnableTimeCondition("No");
    setDestination("");
    setEnabled("Yes");
    setPriority("102");
    setEnableMobilityExtension("No");
    setSendRingTone("Remote");
    setDestinationTarget("");
    setExtensionRange("");
    setSelectedTrunks([]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current)
      loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setName(row.name || "");
    setDidPattern(row.didPattern || "");
    setCallerIdPattern(row.callerIdPattern || "");
    setDistinctiveRingTone(row.distinctiveRingTone || "");
    setEnableT38(row.enableT38 || "No");
    setEnableTimeCondition(row.enableTimeCondition || "No");
    setDestination(row.destination || "Call Queue");
    setEnabled(row.enabled || "Yes");
    setPriority(row.priority || "102");
    setEnableMobilityExtension(row.enableMobilityExtension || "No");
    setSendRingTone(row.sendRingTone || "Remote");
    setDestinationTarget(row.destinationTarget || "");
    setExtensionRange(row.extensionRange || "");
    setSelectedTrunks(Array.isArray(row.memberTrunks) ? row.memberTrunks : []);
    setAvailableSelected([]);
    setChosenSelected([]);
    setShowModal(true);
    const loaders = [];
    if (!hasLoadedTrunksRef.current) loaders.push(loadTrunks());
    if (!hasLoadedDestinationDataRef.current)
      loaders.push(loadDestinationData());
    if (loaders.length > 0) await Promise.allSettled(loaders);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const trunkLabelMap = useMemo(() => {
    const map = new Map();
    availableTrunks.forEach((t) => {
      map.set(t.id, t.label);
    });
    return map;
  }, [availableTrunks]);

  const getTrunkLabel = (id) => trunkLabelMap.get(id) || id;

  const availableList = useMemo(
    () => availableTrunks.filter((t) => !selectedTrunks.includes(t.id)),
    [availableTrunks, selectedTrunks],
  );

  const addSelectedTrunks = () => {
    if (availableSelected.length === 0) return;
    setSelectedTrunks((prev) => [
      ...prev,
      ...availableSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableSelected([]);
  };

  const addAllTrunks = () => {
    setSelectedTrunks(availableTrunks.map((t) => t.id));
    setAvailableSelected([]);
  };

  const removeSelectedTrunks = () => {
    if (chosenSelected.length === 0) return;
    setSelectedTrunks((prev) =>
      prev.filter((id) => !chosenSelected.includes(id)),
    );
    setChosenSelected([]);
  };

  const removeAllTrunks = () => {
    setSelectedTrunks([]);
    setChosenSelected([]);
  };

  const moveTrunkToBottom = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };
  const moveTrunkUp = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i - 1])
        )
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
      return arr;
    });
  };
  const moveTrunkDown = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i + 1])
        )
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
      return arr;
    });
  };
  const moveTrunkToTop = () => {
    if (!chosenSelected.length) return;
    setSelectedTrunks((prev) => {
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  // Page-level checkbox helpers
  const pageIndices = pagedRows.map((_, i) => (page - 1) * itemsPerPage + i);
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;
  const handleToggleAll = () => {
    if (allPageSelected) {
      setSelected((prev) => prev.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIndices])));
    }
  };

  const inputStyle = {
    width: "100%",
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 4,
    padding: "6px 8px",
    fontSize: 13,
    outline: "none",
    color: C.valueText,
    background: "#fff",
    boxSizing: "border-box",
  };

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
        idsToDelete.map((id) => deleteInboundRoute(id)),
      );
      const failed = results.find((res) => !res?.response);
      if (failed) {
        showAlert(failed?.message || "Failed to delete one or more routes.");
      } else {
        showMessage("success", "Inbound route(s) deleted successfully.");
      }
      await fetchInboundRoutes();
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
    if (!destination) {
      showAlert("Destination is required.");
      return;
    }
    const parsedPriority = Number(priority);
    if (
      !Number.isInteger(parsedPriority) ||
      parsedPriority < 1 ||
      parsedPriority > 9999
    ) {
      showAlert("Priority must be a number between 1 and 9999.");
      return;
    }
    if (destination === "Extension_Range") {
      if (!extensionRange.trim()) {
        showAlert("Extension range is required (example: 100-136).");
        return;
      }
      const rangePattern = /^\d+\s*-\s*\d+$/;
      if (!rangePattern.test(extensionRange.trim())) {
        showAlert("Invalid extension range format. Use format like 100-136.");
        return;
      }
    } else if (destinationChoices.length > 0 && !destinationTarget) {
      showAlert("Please select a destination target.");
      return;
    }

    const payload = {
      id: editId ?? Date.now(),
      name: trimmedName,
      didPattern,
      callerIdPattern,
      distinctiveRingTone,
      enableT38,
      enableTimeCondition,
      destination,
      destinationTarget:
        destination === "Extension_Range" ? "" : destinationTarget,
      extensionRange:
        destination === "Extension_Range" ? extensionRange.trim() : "",
      enabled,
      priority,
      enableMobilityExtension,
      sendRingTone,
      memberTrunks: [...selectedTrunks],
    };

    const destType = mapUiToDestType(destination);
    const destValue =
      destination === "Extension_Range"
        ? extensionRange.trim()
        : destinationTarget;

    const apiPayload = {
      name: payload.name,
      did_pattern: payload.didPattern || "",
      callerid_pattern: payload.callerIdPattern || "",
      distinctive_ringtone: payload.distinctiveRingTone || "",
      enable_t38: toApiYesNo(payload.enableT38, "no"),
      enable_time_condition: toApiYesNo(payload.enableTimeCondition, "no"),
      dest_type: destType,
      dest_value: destValue || "",
      member_trunks: Array.isArray(payload.memberTrunks)
        ? payload.memberTrunks
        : [],
      enabled: toApiYesNo(payload.enabled, "yes"),
      priority: parsedPriority,
      enable_mobility_ext: toApiYesNo(payload.enableMobilityExtension, "no"),
      send_ringtone: payload.sendRingTone || "Remote",
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const response =
        editId != null
          ? await updateInboundRoute(editId, apiPayload)
          : await createInboundRoute(apiPayload);
      if (!response?.response) {
        showAlert(response?.message || "Failed to save inbound route.");
        return;
      }
      showMessage(
        "success",
        editId != null
          ? "Inbound route updated successfully."
          : "Inbound route created successfully.",
      );
      await fetchInboundRoutes();
      handleCloseModal();
    } catch (err) {
      showAlert(err?.message || "Failed to save inbound route.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
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
        {/* Alert */}
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
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Call Control &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              Inbound Routes
            </span>
          </span>
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
                Page {page} · {rows.length} records
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
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: C.errorRed }} />
                )}
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.save}
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
                        disabled={loading.delete}
                        sx={{
                          padding: "1px",
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                          "&.MuiCheckbox-indeterminate": { color: C.accent },
                        }}
                      />
                    </TH>
                    <TH style={{ width: 40 }}>#</TH>
                    <TH style={{ textAlign: "left", paddingLeft: 16 }}>Name</TH>
                    <TH>DID Pattern</TH>
                    <TH>Caller ID Pattern</TH>
                    <TH>Destination</TH>
                    <TH>Enabled</TH>
                    <TH style={{ textAlign: "left", paddingLeft: 16 }}>
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
                        No inbound routes yet. Click &quot;+ Add New&quot; to
                        create one.
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const rowBg = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";
                      const destinationStr =
                        row.destination === "Extension_Range"
                          ? `${row.destination}: ${row.extensionRange || ""}`
                          : row.destinationTarget
                            ? `${row.destination}: ${row.destinationTarget}`
                            : row.destination;
                      return (
                        <tr
                          key={row.id}
                          style={{
                            background: rowBg,
                            borderBottom: "0.5px solid #9ca3af",
                            transition: "background 0.1s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f0f9ff";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBg;
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
                            {row.didPattern || "—"}
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
                            {row.callerIdPattern || "—"}
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
                            {destinationStr || "—"}
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

          {/* Pagination */}
          {!loading.list && rows.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#f8fafc",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  First
                </Btn>
                <Btn
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
                <Btn
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Btn>
                <select
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  style={{
                    fontSize: 11,
                    borderRadius: 4,
                    border: `0.5px solid ${C.cardBorder}`,
                    padding: "3px 6px",
                    color: C.labelText,
                    background: "#fff",
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 11, color: C.mutedText }}>
                  {rows.length} total
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

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
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            textAlign: "center",
            padding: "14px 24px",
          }}
        >
          Import Inbound Routes
        </DialogTitle>
        <DialogContent
          style={{ backgroundColor: C.pageBg, padding: "20px 24px 12px" }}
        >
          <div className="flex flex-col gap-4 pt-1">
            <p className="text-[13px] text-gray-600">
              Select a CSV or JSON file to import.
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
            backgroundColor: C.pageBg,
            justifyContent: "center",
            gap: 16,
            padding: "12px 24px 16px",
          }}
        >
          <Btn
            onClick={handleImportSubmit}
            disabled={importLoading || !importFile}
          >
            {importLoading ? "Importing..." : "Import"}
          </Btn>
          <Btn
            onClick={() => {
              setShowImportModal(false);
              setImportFile(null);
            }}
            disabled={importLoading}
            variant="outline"
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>

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
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px",
          }}
        >
          {editId != null ? "Edit Inbound Route" : "Add Inbound Route"}
        </DialogTitle>
        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Route Settings */}
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
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 14,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 6,
                }}
              >
                Inbound Call Routing
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 32px",
                }}
              >
                <FieldRow label="Name *">
                  <input
                    style={inputStyle}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Enabled">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enabled}
                      onChange={(e) => setEnabled(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {ENABLE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>

                <FieldRow label="DID Pattern">
                  <input
                    style={inputStyle}
                    value={didPattern}
                    onChange={(e) => setDidPattern(e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Priority">
                  <input
                    style={inputStyle}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  />
                </FieldRow>

                <FieldRow label="Caller ID Pattern">
                  <input
                    style={inputStyle}
                    value={callerIdPattern}
                    onChange={(e) => setCallerIdPattern(e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Enable Mobility Extension">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableMobilityExtension}
                      onChange={(e) =>
                        setEnableMobilityExtension(e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      {MOBILITY_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>

                <FieldRow label="Distinctive RingTone">
                  <input
                    style={inputStyle}
                    value={distinctiveRingTone}
                    onChange={(e) => setDistinctiveRingTone(e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Send RingTone">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={sendRingTone}
                      onChange={(e) => setSendRingTone(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {SEND_RINGTONE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>

                <FieldRow label="Enable T.38">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableT38}
                      onChange={(e) => setEnableT38(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {T38_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>
                <FieldRow label="Enable Time Condition">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={enableTimeCondition}
                      onChange={(e) => setEnableTimeCondition(e.target.value)}
                      sx={{ fontSize: 13 }}
                    >
                      {TIME_CONDITION_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    borderTop: `1px solid ${C.cardBorder}`,
                    margin: "4px 0",
                  }}
                />

                <FieldRow label="Destination *">
                  <FormControl size="small" fullWidth>
                    <Select
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setDestinationTarget("");
                        setExtensionRange("");
                      }}
                      displayEmpty
                      MenuProps={SELECT_MENU_PROPS}
                      sx={{ fontSize: 13 }}
                    >
                      <MenuItem value="">
                        <em>Select</em>
                      </MenuItem>
                      {DESTINATION_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </FieldRow>

                {destination === "Extension_Range" ? (
                  <FieldRow label="Extension Range *">
                    <input
                      style={inputStyle}
                      value={extensionRange}
                      onChange={(e) => setExtensionRange(e.target.value)}
                      placeholder="100-136"
                    />
                  </FieldRow>
                ) : needsDestinationTarget ? (
                  <FieldRow label="Destination Value *">
                    <FormControl size="small" fullWidth>
                      <Select
                        value={destinationTarget}
                        onChange={(e) => setDestinationTarget(e.target.value)}
                        displayEmpty
                        MenuProps={SELECT_MENU_PROPS}
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem
                          value=""
                          disabled={destinationChoices.length === 0}
                        >
                          <em>Select</em>
                        </MenuItem>
                        {destinationChoices.length === 0 ? (
                          <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                            No options available
                          </MenuItem>
                        ) : (
                          destinationChoices.map((opt) => (
                            <MenuItem
                              key={opt.id}
                              value={opt.id}
                              sx={{ fontSize: 13 }}
                            >
                              {opt.label}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </FieldRow>
                ) : (
                  <div />
                )}
              </div>
            </div>

            {/* Member Trunks */}
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
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 14,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 6,
                }}
              >
                Member Trunks <span style={{ color: C.errorRed }}>*</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#325a84",
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    Available
                  </div>
                  <select
                    multiple
                    value={availableSelected}
                    onChange={(e) =>
                      setAvailableSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={{
                      width: "100%",
                      height: 160,
                      border: `1px solid ${C.cardBorder}`,
                      background: "#fff",
                      borderRadius: 4,
                      padding: "4px 8px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    {loading.trunks ? (
                      <option>Loading trunks...</option>
                    ) : availableList.length === 0 ? (
                      <option disabled>No trunks</option>
                    ) : (
                      availableList.map((t) => (
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
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <button
                    type="button"
                    className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                    onClick={addSelectedTrunks}
                  >
                    &gt;
                  </button>
                  <button
                    type="button"
                    className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                    onClick={addAllTrunks}
                  >
                    &gt;&gt;
                  </button>
                  <button
                    type="button"
                    className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                    onClick={removeSelectedTrunks}
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    className="h-9 border border-gray-500 bg-[#d9dde3] text-sm font-semibold hover:bg-[#c5cbd3]"
                    onClick={removeAllTrunks}
                  >
                    &lt;&lt;
                  </button>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#325a84",
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    Selected
                  </div>
                  <select
                    multiple
                    value={chosenSelected}
                    onChange={(e) =>
                      setChosenSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={{
                      width: "100%",
                      height: 160,
                      border: `1px solid ${C.cardBorder}`,
                      background: "#fff",
                      borderRadius: 4,
                      padding: "4px 8px",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    {selectedTrunks.length === 0 ? (
                      <option disabled>No selected trunks</option>
                    ) : (
                      selectedTrunks.map((id) => (
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
                  <button
                    type="button"
                    className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]"
                    title="Move to bottom"
                    onClick={moveTrunkToBottom}
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
                  </button>
                  <button
                    type="button"
                    className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]"
                    title="Move up"
                    onClick={moveTrunkUp}
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
                  </button>
                  <button
                    type="button"
                    className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]"
                    title="Move down"
                    onClick={moveTrunkDown}
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
                  </button>
                  <button
                    type="button"
                    className="h-8 w-8 flex items-center justify-center border border-gray-500 bg-[#d9dde3] hover:bg-[#c5cbd3]"
                    title="Move to top"
                    onClick={moveTrunkToTop}
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
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{ padding: "16px 24px", justifyContent: "center", gap: 16 }}
        >
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 110, padding: "8px 24px", fontSize: 13 }}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} style={{ color: "#fff" }} />{" "}
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
            style={{ minWidth: 110, padding: "8px 24px", fontSize: 13 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InboundRoutesPage;
