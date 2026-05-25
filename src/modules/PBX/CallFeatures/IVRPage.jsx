import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
  Checkbox,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";

import {
  listIvrDestinations,
  listIvrs,
  listIvrOptions,
  listIvrDirectOutboundOptions,
  createIvr,
  updateIvr,
  deleteIvr,
  fetchSipAccounts,
  getIvr,
  setIvrKeys,
} from "../../../api/apiService";

// ── Constants & Helpers ───────────────────────────────────────────────────────
const ENABLE_OPTIONS = ["Yes", "No"];
const CHECK_VOICEMAIL_OPTIONS = ["Disable", "Enable"];
const DIRECT_EXTENSION_OPTIONS = ["Disable", "Enable"];
const FXO_FLASH_TRANSFER_OPTIONS = ["Disable", "Enable"];
const EMPTY_PROMPT_OPTIONS = { system: [], custom: [] };
const EMPTY_RING_BACK_OPTIONS = {
  country_tones: [],
  moh_categories: [],
  custom_prompts: [],
};
const KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "#"];
const TEXT_TARGET_TYPES = new Set(["Custom", "DialByName", "FlashCustom"]);

const normalizeGreetShortUi = (v) => {
  if (v == null || v === "") return "Null";
  const s = String(v).trim().toLowerCase();
  if (s === "null") return "Null";
  return String(v);
};

const buildPromptOptions = (
  section,
  fallbackSystem,
  normalizeValue = (v) => v,
) => {
  const systemRaw = Array.isArray(section?.system)
    ? section.system
    : fallbackSystem;
  const customRaw = Array.isArray(section?.custom) ? section.custom : [];
  const dedupe = (arr) => {
    const seen = new Set();
    const out = [];
    arr.forEach((v) => {
      const normalized = normalizeValue(String(v));
      if (!normalized) return;
      const key = normalized.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(normalized);
    });
    return out;
  };
  return { system: dedupe(systemRaw), custom: dedupe(customRaw) };
};

const normalizeArrayFromApi = (res) => {
  const root = res?.data ?? res;
  const candidates = [
    root,
    root?.message,
    root?.data,
    root?.message?.message,
    root?.message?.data,
    root?.data?.message,
    root?.data?.data,
  ];
  if (root?.message?.trunks) {
    const t = root.message.trunks;
    if (Array.isArray(t)) return t;
    if (t && typeof t === "object") return [t];
  }
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    if (c && typeof c === "object") {
      for (const key of [
        "routes",
        "route_list",
        "outbound_routes",
        "outboundRoutes",
        "options",
        "list",
        "items",
        "result",
      ]) {
        if (Array.isArray(c[key])) return c[key];
      }
    }
  }
  return [];
};

const normalizeDestinationOptions = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (item == null) return null;
      if (typeof item === "string" || typeof item === "number")
        return { value: String(item), label: String(item) };
      const value = String(
        item.value ?? item.id ?? item.extension ?? item.ivr_number ?? "",
      ).trim();
      const label = String(
        item.label ?? item.display_name ?? item.name ?? value,
      ).trim();
      if (!value) return null;
      return { value, label: label || value };
    })
    .filter(Boolean);
};

// ── Color Palette (CDR Style) ─────────────────────────────────────────────────
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

// ── Shared UI Components ──────────────────────────────────────────────────────
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

const FieldRow = ({ label, children, required }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 32 }}
  >
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 150,
        flexShrink: 0,
      }}
    >
      {label} {required && <span style={{ color: C.errorRed }}>*</span>}
    </label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const IVRPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // 'basic' | 'keypress'
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    outboundRoutes: false,
    list: false,
    ivrOptions: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [lastUpdated, setLastUpdated] = useState(null);
  const hasLoadedOutboundRoutesRef = useRef(false);

  // Search & Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Basic tab state
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [ivrNumber, setIvrNumber] = useState("");
  const [greetLong, setGreetLong] = useState("Default");
  const [greetShort, setGreetShort] = useState("Null");
  const [responseTimeout, setResponseTimeout] = useState("10000");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkVoicemail, setCheckVoicemail] = useState("Disable");
  const [directOutbound, setDirectOutbound] = useState(false);

  const [interDigitTimeout, setInterDigitTimeout] = useState("3000");
  const [maxFailures, setMaxFailures] = useState("3");
  const [maxTimeouts, setMaxTimeouts] = useState("3");
  const [digitLength, setDigitLength] = useState("4");
  const [enabled, setEnabled] = useState("Yes");
  const [directExtension, setDirectExtension] = useState("Disable");
  const [fxoFlashTransfer, setFxoFlashTransfer] = useState("Disable");

  // Advanced State
  const [invalidSound, setInvalidSound] = useState("Default");
  const [exitSound, setExitSound] = useState("Default");
  const [ringBack, setRingBack] = useState("default");
  const [callerIdNamePrefix, setCallerIdNamePrefix] = useState("");
  const [exitActionType, setExitActionType] = useState("");
  const [exitActionValue, setExitActionValue] = useState("");

  // Outbound routes
  const [allOutboundRoutes, setAllOutboundRoutes] = useState([]);
  const [selectedOutboundRouteIds, setSelectedOutboundRouteIds] = useState([]);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  // Key press events
  const [keyDestinations, setKeyDestinations] = useState(() => {
    const obj = {};
    KEYS.forEach((k) => (obj[k] = ""));
    return obj;
  });
  const [keyDestinationValues, setKeyDestinationValues] = useState(() => {
    const obj = {};
    KEYS.forEach((k) => (obj[k] = ""));
    return obj;
  });

  const [destinationOptions, setDestinationOptions] = useState([]);
  const [destinationMap, setDestinationMap] = useState({});
  const [promptOptions, setPromptOptions] = useState({
    greetLong: EMPTY_PROMPT_OPTIONS,
    greetShort: { system: ["Null"], custom: [] },
    invalidSound: EMPTY_PROMPT_OPTIONS,
    exitSound: EMPTY_PROMPT_OPTIONS,
  });
  const [ringBackOptions, setRingBackOptions] = useState(
    EMPTY_RING_BACK_OPTIONS,
  );

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleGoToVoicePrompts = () => {
    const ok = window.confirm(
      "Are you sure you want to go to Voice Prompt page?",
    );
    if (!ok) return;
    navigate("/voice-prompts");
  };

  const loadIvrPromptOptions = async () => {
    setLoading((prev) => ({ ...prev, ivrOptions: true }));
    try {
      const res = await listIvrOptions();
      const msg = res?.message ?? res?.data ?? {};
      const rb = msg?.ring_back ?? {};
      setPromptOptions({
        greetLong: buildPromptOptions(msg?.greet_long, ["Default"]),
        greetShort: buildPromptOptions(msg?.greet_short, ["Null"], (v) =>
          v.trim().toLowerCase() === "null" ? "Null" : v,
        ),
        invalidSound: buildPromptOptions(msg?.invalid_sound, ["Default"]),
        exitSound: buildPromptOptions(msg?.exit_sound, ["Default"]),
      });
      setRingBackOptions({
        country_tones: Array.isArray(rb.country_tones)
          ? rb.country_tones.map(String)
          : [],
        moh_categories: Array.isArray(rb.moh_categories)
          ? rb.moh_categories.map(String)
          : [],
        custom_prompts: Array.isArray(rb.custom_prompts)
          ? rb.custom_prompts.map(String)
          : [],
      });
    } catch (err) {
      setPromptOptions({
        greetLong: { system: ["Default"], custom: [] },
        greetShort: { system: ["Null"], custom: [] },
        invalidSound: { system: ["Default"], custom: [] },
        exitSound: { system: ["Default"], custom: [] },
      });
      setRingBackOptions(EMPTY_RING_BACK_OPTIONS);
    } finally {
      setLoading((prev) => ({ ...prev, ivrOptions: false }));
    }
  };

  const loadOutboundRoutes = async () => {
    setLoading((prev) => ({ ...prev, outboundRoutes: true }));
    try {
      const res = await listIvrDirectOutboundOptions();
      const list = normalizeArrayFromApi(res);
      const routes = list
        .map((r) => ({
          id: Number(
            r?.id ??
              r?.route_id ??
              r?.routeId ??
              r?.value ??
              r?.trunk_id ??
              r?.trunkId,
          ),
          name: String(
            r?.name ??
              r?.route_name ??
              r?.routeName ??
              r?.label ??
              r?.display_name ??
              r?.displayName ??
              r?.text ??
              r?.value ??
              "",
          ),
        }))
        .filter((r) => Number.isFinite(r.id))
        .map((r) => ({ ...r, name: r.name || String(r.id) }));
      setAllOutboundRoutes(routes);
      hasLoadedOutboundRoutesRef.current = routes.length > 0;
    } catch (err) {
      setAllOutboundRoutes([]);
    } finally {
      setLoading((prev) => ({ ...prev, outboundRoutes: false }));
    }
  };

  const fetchInitialData = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      await loadIvrPromptOptions();
      const ivrRes = await listIvrs();
      const ivrList = Array.isArray(ivrRes?.message)
        ? ivrRes.message
        : Array.isArray(ivrRes?.data)
          ? ivrRes.data
          : [];
      setRows(
        ivrList.map((item) => ({
          id: item.id,
          name: item.name,
          ivrNumber: item.ivr_number,
          greetLong: item.greet_long,
          greetShort: normalizeGreetShortUi(item.greet_short),
          responseTimeout: String(item.response_timeout_ms),
          password: item.password || "",
          checkVoicemail: item.check_voicemail ? "Enable" : "Disable",
          directOutbound: !!item.direct_outbound,
          interDigitTimeout: String(item.inter_digit_timeout_ms),
          maxFailures: String(item.max_failures),
          maxTimeouts: String(item.max_timeouts),
          digitLength: String(item.digit_length),
          enabled: item.enabled ? "Yes" : "No",
          directExtension: item.direct_extension ? "Enable" : "Disable",
          fxoFlashTransfer: item.fxo_flash_transfer ? "Enable" : "Disable",
          invalidSound: item.invalid_sound || "Default",
          exitSound: item.exit_sound || "Default",
          exitActionType: item.exit_action_type || "",
          exitActionValue: item.exit_action_value || "",
          ringBack: item.ring_back || "default",
          callerIdNamePrefix: item.callerid_prefix || "",
          memberOutboundIds: Array.isArray(item.direct_outbound_routes)
            ? item.direct_outbound_routes
                .map((x) => Number(x))
                .filter((n) => Number.isFinite(n))
            : Array.isArray(item.outbound_routes)
              ? item.outbound_routes
                  .map((x) => Number(x))
                  .filter((n) => Number.isFinite(n))
              : [],
        })),
      );

      try {
        const obRes = await listIvrDirectOutboundOptions();
        const obList = normalizeArrayFromApi(obRes);
        const routes = obList
          .map((r) => ({
            id: Number(r?.id ?? r?.route_id ?? r?.value ?? r?.trunk_id),
            name: String(
              r?.name ??
                r?.route_name ??
                r?.label ??
                r?.display_name ??
                r?.text ??
                r?.value ??
                "",
            ),
          }))
          .filter((r) => Number.isFinite(r.id))
          .map((r) => ({ ...r, name: r.name || String(r.id) }));
        setAllOutboundRoutes(routes);
        hasLoadedOutboundRoutesRef.current = routes.length > 0;
      } catch {
        setAllOutboundRoutes([]);
      }

      const destRes = await listIvrDestinations();
      const destMessage = destRes?.message ?? destRes?.data ?? destRes;
      if (
        destMessage &&
        typeof destMessage === "object" &&
        !Array.isArray(destMessage)
      ) {
        const normalizedMap = {};
        Object.entries(destMessage).forEach(([type, options]) => {
          normalizedMap[type] = normalizeDestinationOptions(options);
        });
        setDestinationMap(normalizedMap);
        setDestinationOptions(Object.keys(normalizedMap));
      } else {
        setDestinationMap({});
        setDestinationOptions([]);
      }
      setLastUpdated(new Date());
    } catch (err) {
      showMessage("error", err?.message || "Failed to load IVR data.");
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!showModal) return;
    if (!directOutbound) return;
    if (loading.outboundRoutes) return;
    if (allOutboundRoutes.length > 0) return;
    loadOutboundRoutes();
  }, [showModal, directOutbound]);

  // ── Search & Pagination ──
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.name, r.ivrNumber].some((v) =>
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
    setIvrNumber("");
    setGreetLong("Default");
    setGreetShort("Null");
    setResponseTimeout("10000");
    setPassword("");
    setShowPassword(false);
    setCheckVoicemail("Disable");
    setDirectOutbound(false);
    setInterDigitTimeout("3000");
    setMaxFailures("3");
    setMaxTimeouts("3");
    setDigitLength("4");
    setEnabled("Yes");
    setDirectExtension("Disable");
    setFxoFlashTransfer("Disable");
    setInvalidSound("Default");
    setExitSound("Default");
    setExitActionType("");
    setExitActionValue("");
    setRingBack("default");
    setCallerIdNamePrefix("");
    setSelectedOutboundRouteIds([]);
    setAvailableSelected([]);
    setChosenSelected([]);
    const obj = {};
    KEYS.forEach((k) => (obj[k] = ""));
    setKeyDestinations(obj);
    const objVals = {};
    KEYS.forEach((k) => (objVals[k] = ""));
    setKeyDestinationValues(objVals);
    setActiveTab("basic");
  };

  const handleOpenAddModal = async () => {
    resetForm();
    setShowModal(true);
    await loadIvrPromptOptions();
    if (!hasLoadedOutboundRoutesRef.current) await loadOutboundRoutes();
  };

  const handleOpenEditModal = async (row) => {
    setEditId(row.id);
    setShowModal(true);
    setShowPassword(false);
    setActiveTab("basic");
    setAvailableSelected([]);
    setChosenSelected([]);
    await loadIvrPromptOptions();
    if (!hasLoadedOutboundRoutesRef.current) await loadOutboundRoutes();

    try {
      const res = await getIvr(row.id);
      const raw = res?.message ?? res?.data ?? res;
      const item = Array.isArray(raw) ? raw[0] : raw;

      setName(item?.name || "");
      setIvrNumber(item?.ivr_number != null ? String(item.ivr_number) : "");
      setGreetLong(item?.greet_long || "Default");
      setGreetShort(normalizeGreetShortUi(item?.greet_short));
      setResponseTimeout(
        item?.response_timeout_ms != null
          ? String(item.response_timeout_ms)
          : "10000",
      );
      setPassword(item?.password != null ? String(item.password) : "");
      setCheckVoicemail(item?.check_voicemail ? "Enable" : "Disable");
      setDirectOutbound(!!item?.direct_outbound);
      setInterDigitTimeout(
        item?.inter_digit_timeout_ms != null
          ? String(item.inter_digit_timeout_ms)
          : "3000",
      );
      setMaxFailures(
        item?.max_failures != null ? String(item.max_failures) : "3",
      );
      setMaxTimeouts(
        item?.max_timeouts != null ? String(item.max_timeouts) : "3",
      );
      setDigitLength(
        item?.digit_length != null ? String(item.digit_length) : "4",
      );
      setEnabled(item?.enabled ? "Yes" : "No");
      setDirectExtension(item?.direct_extension ? "Enable" : "Disable");
      setFxoFlashTransfer(item?.fxo_flash_transfer ? "Enable" : "Disable");
      setInvalidSound(item?.invalid_sound || "Default");
      setExitSound(item?.exit_sound || "Default");
      setExitActionType(item?.exit_action_type || "");
      setExitActionValue(item?.exit_action_value || "");
      setRingBack(item?.ring_back || "default");
      setCallerIdNamePrefix(item?.callerid_prefix || "");
      setSelectedOutboundRouteIds(
        Array.isArray(item?.direct_outbound_routes)
          ? item.direct_outbound_routes
              .map((x) => Number(x))
              .filter((n) => Number.isFinite(n))
          : [],
      );

      const keyActions = Array.isArray(item?.key_actions)
        ? item.key_actions
        : Array.isArray(item?.keyActions)
          ? item.keyActions
          : [];
      const destObj = {};
      const valObj = {};
      KEYS.forEach((k) => {
        destObj[k] = "";
        valObj[k] = "";
      });
      keyActions.forEach((a) => {
        const digit = String(a?.digit ?? "");
        if (destObj[digit] == null) return;
        destObj[digit] = a?.dest_type || "";
        valObj[digit] = a?.dest_value != null ? String(a.dest_value) : "";
      });
      setKeyDestinations(destObj);
      setKeyDestinationValues(valObj);
    } catch {
      setName(row.name || "");
      setIvrNumber(row.ivrNumber || "");
      setGreetLong(row.greetLong || "Default");
      setGreetShort(normalizeGreetShortUi(row.greetShort));
      setResponseTimeout(row.responseTimeout || "10000");
      setPassword(row.password || "");
      setCheckVoicemail(row.checkVoicemail || "Disable");
      setDirectOutbound(!!row.directOutbound);
      setInterDigitTimeout(row.interDigitTimeout || "3000");
      setMaxFailures(row.maxFailures || "3");
      setMaxTimeouts(row.maxTimeouts || "3");
      setDigitLength(row.digitLength || "4");
      setEnabled(row.enabled || "Yes");
      setDirectExtension(row.directExtension || "Disable");
      setFxoFlashTransfer(row.fxoFlashTransfer || "Disable");
      setInvalidSound(row.invalidSound || "Default");
      setExitSound(row.exitSound || "Default");
      setExitActionType(row.exitActionType || "");
      setExitActionValue(row.exitActionValue || "");
      setRingBack(row.ringBack || "default");
      setCallerIdNamePrefix(row.callerIdNamePrefix || "");
      setSelectedOutboundRouteIds(
        Array.isArray(row.memberOutboundIds) ? [...row.memberOutboundIds] : [],
      );
    }
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  // ── Save & Delete ──
  const handleDelete = async () => {
    if (selected.length === 0)
      return showMessage("error", "Please select at least one row to delete.");
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const rowsToDelete = filteredRows.filter((_, idx) =>
        selected.includes(idx),
      );
      for (const row of rowsToDelete) {
        if (row.id != null) await deleteIvr(row.id);
      }
      setSelected([]);
      await fetchInitialData();
      showMessage("success", "IVR(s) deleted successfully.");
    } catch (err) {
      showMessage("error", err?.message || "Failed to delete IVR(s).");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return showMessage("error", "Name is required.");
    if (!ivrNumber.trim())
      return showMessage("error", "IVR Number is required.");
    if (!/^[A-Za-z0-9_]+$/.test(trimmedName))
      return showMessage(
        "error",
        "Name may contain only letters, numbers, and underscore.",
      );

    const ivrNumInt = parseInt(ivrNumber.trim(), 10);
    if (Number.isNaN(ivrNumInt) || ivrNumInt < 6500 || ivrNumInt > 6599)
      return showMessage(
        "error",
        "IVR Number must be an integer between 6500 and 6599.",
      );

    const respTimeoutInt = parseInt(responseTimeout, 10);
    if (
      Number.isNaN(respTimeoutInt) ||
      respTimeoutInt < 1000 ||
      respTimeoutInt > 60000
    )
      return showMessage(
        "error",
        "Response Timeout must be between 1000 and 60000 ms.",
      );

    const interDigitInt = parseInt(interDigitTimeout, 10);
    if (
      Number.isNaN(interDigitInt) ||
      interDigitInt < 500 ||
      interDigitInt > 10000
    )
      return showMessage(
        "error",
        "Inter-Digit Timeout must be between 500 and 10000 ms.",
      );

    const digitLengthInt = parseInt(digitLength, 10);
    if (
      Number.isNaN(digitLengthInt) ||
      digitLengthInt < 1 ||
      digitLengthInt > 20
    )
      return showMessage("error", "Digit Length must be between 1 and 20.");

    if (directOutbound && selectedOutboundRouteIds.length === 0)
      return showMessage(
        "error",
        "Please select at least one outbound route when Direct Outbound is enabled.",
      );

    const keyActions = [];
    let keyActionError = "";
    KEYS.forEach((digit) => {
      const destType = keyDestinations[digit] || "";
      if (!destType) return;
      const destValue = String(keyDestinationValues[digit] || "").trim();
      const valueOptional = destType === "DialByName" || destType === "Other";
      if (!valueOptional && !destValue) {
        keyActionError = `Select destination for key digit "${digit}".`;
        return;
      }
      const action = { digit, dest_type: destType };
      if (destValue) action.dest_value = destValue;
      keyActions.push(action);
    });

    if (keyActionError) return showMessage("error", keyActionError);

    const payloadForApi = {
      name: trimmedName,
      ivr_number: ivrNumInt,
      greet_long: normalizePromptForApi(greetLong, "default"),
      greet_short:
        String(greetShort).toLowerCase() === "null" ? null : greetShort,
      response_timeout_ms: respTimeoutInt,
      password: password.trim(),
      check_voicemail: checkVoicemail === "Enable",
      direct_outbound: !!directOutbound,
      inter_digit_timeout_ms: interDigitInt,
      max_failures: parseInt(maxFailures, 10) || 3,
      max_timeouts: parseInt(maxTimeouts, 10) || 3,
      digit_length: digitLengthInt,
      enabled: enabled === "Yes",
      direct_extension: directExtension === "Enable",
      fxo_flash_transfer: fxoFlashTransfer === "Enable",
      invalid_sound: normalizePromptForApi(invalidSound, "default"),
      exit_sound: normalizePromptForApi(exitSound, "default"),
      ring_back: ringBack,
      callerid_prefix: callerIdNamePrefix ? callerIdNamePrefix : null,
      exit_action_type: exitActionType || null,
      exit_action_value: exitActionType ? exitActionValue || null : null,
      direct_outbound_trunk: null,
      direct_outbound_routes: directOutbound ? selectedOutboundRouteIds : [],
    };

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) {
        await updateIvr(editId, payloadForApi);
        await setIvrKeys(editId, keyActions);
      } else {
        await createIvr({ ...payloadForApi, key_actions: keyActions });
      }
      await fetchInitialData();
      handleCloseModal();
      showMessage("success", "IVR saved successfully.");
    } catch (err) {
      showMessage("error", err?.message || "Failed to save IVR.");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile)
      return showMessage("error", "Please select a file to import");
    showMessage("info", "Import API not yet configured");
  };

  const handleExport = () => {
    showMessage("info", "Export API not yet configured");
  };

  // ── Dual Listbox Logic ──
  const routeNameById = useMemo(() => {
    const map = new Map();
    allOutboundRoutes.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [allOutboundRoutes]);

  const getOutboundRouteLabel = (id) => routeNameById.get(id) || `ID:${id}`;
  const availableOutboundList = useMemo(
    () =>
      allOutboundRoutes.filter((r) => !selectedOutboundRouteIds.includes(r.id)),
    [allOutboundRoutes, selectedOutboundRouteIds],
  );

  const addSelectedOutboundRoutes = () => {
    if (availableSelected.length === 0) return;
    setSelectedOutboundRouteIds((prev) => [
      ...prev,
      ...availableSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableSelected([]);
  };
  const addAllOutboundRoutes = () => {
    setSelectedOutboundRouteIds(allOutboundRoutes.map((r) => r.id));
    setAvailableSelected([]);
  };
  const removeSelectedOutboundRoutes = () => {
    if (chosenSelected.length === 0) return;
    setSelectedOutboundRouteIds((prev) =>
      prev.filter((id) => !chosenSelected.includes(id)),
    );
    setChosenSelected([]);
  };
  const removeAllOutboundRoutes = () => {
    setSelectedOutboundRouteIds([]);
    setChosenSelected([]);
  };

  const moveOutboundUp = () => {
    if (!chosenSelected.length) return;
    const ids = [...selectedOutboundRouteIds];
    chosenSelected.forEach((routeId) => {
      const idx = ids.indexOf(routeId);
      if (idx > 0) [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    });
    setSelectedOutboundRouteIds(ids);
  };
  const moveOutboundDown = () => {
    if (!chosenSelected.length) return;
    const ids = [...selectedOutboundRouteIds];
    [...chosenSelected].reverse().forEach((routeId) => {
      const idx = ids.indexOf(routeId);
      if (idx < ids.length - 1)
        [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    });
    setSelectedOutboundRouteIds(ids);
  };
  const moveOutboundTop = () => {
    if (!chosenSelected.length) return;
    const sel = selectedOutboundRouteIds.filter((id) =>
      chosenSelected.includes(id),
    );
    const rest = selectedOutboundRouteIds.filter(
      (id) => !chosenSelected.includes(id),
    );
    setSelectedOutboundRouteIds([...sel, ...rest]);
  };
  const moveOutboundBottom = () => {
    if (!chosenSelected.length) return;
    const sel = selectedOutboundRouteIds.filter((id) =>
      chosenSelected.includes(id),
    );
    const rest = selectedOutboundRouteIds.filter(
      (id) => !chosenSelected.includes(id),
    );
    setSelectedOutboundRouteIds([...rest, ...sel]);
  };

  // ── Keys Logic ──
  const handleKeyDestinationChange = (key, value) =>
    setKeyDestinations((prev) => ({ ...prev, [key]: value }));
  const handleKeyDestinationValueChange = (key, value) =>
    setKeyDestinationValues((prev) => ({ ...prev, [key]: value }));

  const DEFAULT_ACTION_TYPES = [
    "Extensions",
    "Voicemails",
    "IVR",
    "ConferenceRooms",
    "RingGroups",
    "DISA",
    "CallQueue",
    "Callbacks",
    "Custom",
    "FaxToMail",
    "Other",
  ];
  const actionTypeOptions = destinationOptions.length
    ? destinationOptions
    : DEFAULT_ACTION_TYPES;
  const keyActionTypeOptions = actionTypeOptions;

  const formatActionLabel = (type) => {
    if (!type) return "";
    switch (type) {
      case "CallQueue":
        return "Call Queue";
      case "Callbacks":
        return "CallBacks";
      case "ConferenceRooms":
        return "Conference Rooms";
      case "FaxToMail":
        return "Fax To Mail";
      case "RingGroups":
        return "Ring Groups";
      case "FlashCustom":
        return "Flash Custom";
      case "DialByName":
        return "Dial By Name";
      default:
        return type;
    }
  };

  const getDestinationListForType = (type) => {
    if (!type) return [];
    if (!destinationMap) return [];
    const list = destinationMap[type];
    if (Array.isArray(list) && list.length > 0) return list;
    if (
      (type === "Voicemails" || type === "FaxToMail") &&
      Array.isArray(destinationMap.Extensions)
    )
      return destinationMap.Extensions;
    return [];
  };

  const renderDestinationSelect = (type, value, onChange) => {
    if (!type)
      return (
        <TextField
          size="small"
          disabled
          fullWidth
          sx={{ background: "#f8fafc" }}
          inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
        />
      );
    if (TEXT_TARGET_TYPES.has(type)) {
      return (
        <TextField
          size="small"
          fullWidth
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          inputProps={{
            style: { fontSize: 13, padding: "6px 8px", background: "#fff" },
          }}
        />
      );
    }
    const list = getDestinationListForType(type);
    return (
      <FormControl size="small" fullWidth>
        <MuiSelect
          value={value || ""}
          displayEmpty
          onChange={(e) => onChange(e.target.value)}
          renderValue={(v) => (v ? v : "Select destination")}
          sx={{ fontSize: 13, background: "#fff" }}
        >
          <MenuItem value="">
            <em>Select destination</em>
          </MenuItem>
          {(!list || list.length === 0) && (
            <MenuItem value="" disabled>
              No options available
            </MenuItem>
          )}
          {value && !list.some((item) => item.value === value) && (
            <MenuItem value={value}>{value}</MenuItem>
          )}
          {list.map((item) => (
            <MenuItem key={item.value} value={item.value} sx={{ fontSize: 13 }}>
              {item.label || item.value}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    );
  };

  const ensureOptionList = (items, fallback, currentValue) => {
    const base = Array.isArray(items) && items.length > 0 ? items : [fallback];
    return currentValue && !base.includes(currentValue)
      ? [currentValue, ...base]
      : base;
  };
  const greetLongOptions = useMemo(
    () =>
      ensureOptionList(
        [...promptOptions.greetLong.system, ...promptOptions.greetLong.custom],
        "Default",
        greetLong,
      ),
    [promptOptions.greetLong, greetLong],
  );
  const greetShortOptions = useMemo(
    () =>
      ensureOptionList(
        [
          ...promptOptions.greetShort.system,
          ...promptOptions.greetShort.custom,
        ],
        "Null",
        greetShort,
      ),
    [promptOptions.greetShort, greetShort],
  );
  const invalidSoundOptions = useMemo(
    () =>
      ensureOptionList(
        [
          ...promptOptions.invalidSound.system,
          ...promptOptions.invalidSound.custom,
        ],
        "Default",
        invalidSound,
      ),
    [promptOptions.invalidSound, invalidSound],
  );
  const exitSoundOptions = useMemo(
    () =>
      ensureOptionList(
        [...promptOptions.exitSound.system, ...promptOptions.exitSound.custom],
        "Default",
        exitSound,
      ),
    [promptOptions.exitSound, exitSound],
  );
  const ringBackAllValues = useMemo(
    () => [
      ...ringBackOptions.moh_categories,
      ...ringBackOptions.custom_prompts,
      ...ringBackOptions.country_tones,
    ],
    [ringBackOptions],
  );

  const normalizePromptForApi = (value, defaultKeyword) => {
    if (value == null || value === "") return defaultKeyword;
    if (String(value).toLowerCase() === String(defaultKeyword).toLowerCase())
      return defaultKeyword;
    return value;
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Error / Success Banner */}
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

        {/* Breadcrumb + Last Updated */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Call Features &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>IVR</span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "#ffffff",
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          {/* Toolbar */}
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
                Page {page} · {filteredRows.length} records
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
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffff",
                  border: `0.5px solid ${searchFocused ? C.accent : C.cardBorder}`,
                  borderRadius: 6,
                  padding: "5px 10px",
                  transition: "border-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: searchFocused ? C.accent : C.mutedText,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search IVRs..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 11,
                    color: C.valueText,
                    outline: "none",
                    width: 160,
                  }}
                />
                {searchQuery && (
                  <span
                    onClick={() => setSearchQuery("")}
                    style={{
                      fontSize: 11,
                      color: C.mutedText,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </span>
                )}
              </div> */}

              {/* <Btn
                onClick={handlePrev}
                disabled={loading.list || page <= 1}
                variant="outline"
              >
                ← Prev
              </Btn>
              <Btn
                onClick={handleNext}
                disabled={loading.list || page >= totalPages}
                variant="outline"
              >
                Next →
              </Btn> */}

              <Btn
                onClick={() => {
                  setImportFile(null);
                  setShowImportModal(true);
                }}
                variant="outline"
                  style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                ⬇ Import
              </Btn>
              <Btn onClick={handleExport} variant="outline"
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
                >
                ⬆ Export
              </Btn>
              {/* <Btn
                onClick={fetchInitialData}
                disabled={loading.list}
                variant="default"
              >
                {loading.list ? (
                  <CircularProgress size={11} style={{ color: "#fff" }} />
                ) : (
                  "Refresh"
                )}
              </Btn> */}
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="danger"
                  style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
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
                    <TH>Name</TH>
                    <TH>IVR Number</TH>
                    <TH>Enabled</TH>
                    <TH>Direct Outbound</TH>
                    <TH style={{ textAlign: "left", paddingLeft: "16px" }}>
                      Outbound Routes
                    </TH>
                    <TH style={{ width: 70 }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No IVRs found. Click '+ Add New' to create one."}
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
                          key={row.id || realIdx}
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
                              textAlign: "center",
                              padding: "10px 14px",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <span
                              style={{
                                color: C.valueText,
                                padding: "4px 11px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.01em",
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {row.ivrNumber}
                            </span>
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "10px 14px",
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
                              textAlign: "center",
                              padding: "10px 14px",
                              borderRight: "1px solid #f1f5f9",
                            }}
                          >
                            <span
                              style={{
                                color: row.directOutbound
                                  ? "#166534"
                                  : "#475569",
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
                              {row.directOutbound ? "Yes" : "No"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 13,
                              color: C.labelText,
                              borderRight: "1px solid #f1f5f9",
                              whiteSpace: "normal",
                              wordBreak: "break-all",
                            }}
                          >
                            {row.memberOutboundIds?.length > 0 ? (
                              row.memberOutboundIds
                                .map(getOutboundRouteLabel)
                                .join(", ")
                            ) : (
                              <span style={{ color: C.mutedText }}>—</span>
                            )}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                            }}
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
                padding: "12px 18px",
                borderTop: `1px solid ${C.cardBorder}`,
                background: "#ffffff",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRows.length} record
                {pagedRows.length !== 1 ? "s" : ""} on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
        PaperProps={{
          sx: { width: 900, maxWidth: "96vw", borderRadius: 2 },
        }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            textAlign: "center",
            padding: "14px 24px 0",
          }}
        >
          {editId != null ? "Edit IVR" : "Add IVR"}

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              justifyContent: "center",
              marginTop: 14,
            }}
          >
            {[
              { id: "basic", label: "BASIC" },
              { id: "keypress", label: "KEY PRESS EVENT" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: activeTab === t.id ? C.pageBg : "transparent",
                  color: activeTab === t.id ? C.accent : "#9ca3af",
                  border: "none",
                  padding: "8px 16px",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: "6px 6px 0 0",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 0.2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </DialogTitle>

        <DialogContent
          style={{ padding: "20px 24px", backgroundColor: C.pageBg }}
        >
          {/* ── BASIC TAB ── */}
          {activeTab === "basic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                  padding: "20px 24px 16px",
                }}
              >
                {/* ── Naya "Basic" Heading ── */}
                <div style={{ marginBottom: 20, position: "relative" }}>
                  <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
                  <span
                    style={{
                      position: "absolute",
                      top: -10,
                      left: 0,
                      background: "#fff",
                      paddingRight: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.mutedText,
                    }}
                  >
                    Basic
                  </span>
                </div>

                {/* 2-Column Grid for Basic fields */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 40px",
                  }}
                >
                  {/* Left Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Name" required>
                      <TextField
                        size="small"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                    <FieldRow label="IVR Number" required>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={ivrNumber}
                        onChange={(e) => setIvrNumber(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Greet Long">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                        }}
                      >
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={greetLong}
                            onChange={(e) => setGreetLong(e.target.value)}
                            sx={{ fontSize: 13 }}
                          >
                            {greetLongOptions.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        <span
                          onClick={handleGoToVoicePrompts}
                          style={{
                            fontSize: 11,
                            color: "#2563eb",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Prompt
                        </span>
                      </div>
                    </FieldRow>

                    <FieldRow label="Greet Short">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                        }}
                      >
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={greetShort}
                            onChange={(e) => setGreetShort(e.target.value)}
                            sx={{ fontSize: 13 }}
                          >
                            {greetShortOptions.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        <span
                          onClick={handleGoToVoicePrompts}
                          style={{
                            fontSize: 11,
                            color: "#2563eb",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Prompt
                        </span>
                      </div>
                    </FieldRow>

                    <FieldRow label="Response Timeout(ms)" required>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={responseTimeout}
                        onChange={(e) => setResponseTimeout(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Password">
                      <TextField
                        size="small"
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <VisibilityOff sx={{ fontSize: 16 }} />
                                ) : (
                                  <Visibility sx={{ fontSize: 16 }} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Check Voicemail">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={checkVoicemail}
                          onChange={(e) => setCheckVoicemail(e.target.value)}
                          sx={{ fontSize: 13 }}
                        >
                          {CHECK_VOICEMAIL_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.labelText,
                          width: 170,
                          flexShrink: 0,
                        }}
                      >
                        Direct Outbound
                      </label>
                      <div style={{ flex: 1 }}>
                        <Checkbox
                          checked={directOutbound}
                          onChange={(e) => setDirectOutbound(e.target.checked)}
                          size="small"
                          sx={{
                            p: 0,
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Inter-Digit Timeout(ms)" required>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={interDigitTimeout}
                        onChange={(e) => setInterDigitTimeout(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Max Failures" required>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={maxFailures}
                        onChange={(e) => setMaxFailures(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Max Timeouts" required>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={maxTimeouts}
                        onChange={(e) => setMaxTimeouts(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Digit Length" required>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={digitLength}
                        onChange={(e) => setDigitLength(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>

                    <FieldRow label="Enabled" required>
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={enabled}
                          onChange={(e) => setEnabled(e.target.value)}
                          sx={{ fontSize: 13 }}
                        >
                          {ENABLE_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Direct Extension" required>
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={directExtension}
                          onChange={(e) => setDirectExtension(e.target.value)}
                          sx={{ fontSize: 13 }}
                        >
                          {DIRECT_EXTENSION_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="FXO Flash Transfer" required>
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={fxoFlashTransfer}
                          onChange={(e) => setFxoFlashTransfer(e.target.value)}
                          sx={{ fontSize: 13 }}
                        >
                          {FXO_FLASH_TRANSFER_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </div>

                {/* Outbound Routes Section (Conditionally Rendered before Advanced) */}
                {directOutbound && (
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 16,
                      borderTop: `1px dashed ${C.cardBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: C.labelText,
                        }}
                      >
                        Outbound Routes{" "}
                        <span style={{ color: C.errorRed }}>*</span>
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 40px 1fr",
                        gap: 12,
                        marginTop: 16,
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
                          Available Routes
                        </div>
                        <select
                          multiple
                          value={availableSelected.map(String)}
                          onChange={(e) =>
                            setAvailableSelected(
                              Array.from(e.target.selectedOptions, (opt) =>
                                Number(opt.value),
                              ).filter((n) => Number.isFinite(n)),
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
                          {loading.outboundRoutes ? (
                            <option disabled>Loading routes...</option>
                          ) : availableOutboundList.length === 0 ? (
                            <option disabled>No routes available</option>
                          ) : (
                            availableOutboundList.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
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
                          onClick={addSelectedOutboundRoutes}
                          variant="outline"
                          style={{ padding: "4px 0", fontSize: 12 }}
                        >
                          &gt;
                        </Btn>
                        <Btn
                          onClick={addAllOutboundRoutes}
                          variant="outline"
                          style={{ padding: "4px 0", fontSize: 12 }}
                        >
                          &gt;&gt;
                        </Btn>
                        <Btn
                          onClick={removeSelectedOutboundRoutes}
                          variant="outline"
                          style={{ padding: "4px 0", fontSize: 12 }}
                        >
                          &lt;
                        </Btn>
                        <Btn
                          onClick={removeAllOutboundRoutes}
                          variant="outline"
                          style={{ padding: "4px 0", fontSize: 12 }}
                        >
                          &lt;&lt;
                        </Btn>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: C.accent,
                              marginBottom: 6,
                              textAlign: "center",
                            }}
                          >
                            Selected Routes
                          </div>
                          <select
                            multiple
                            value={chosenSelected.map(String)}
                            onChange={(e) =>
                              setChosenSelected(
                                Array.from(e.target.selectedOptions, (opt) =>
                                  Number(opt.value),
                                ).filter((n) => Number.isFinite(n)),
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
                            {selectedOutboundRouteIds.length === 0 ? (
                              <option disabled>No selected routes</option>
                            ) : (
                              selectedOutboundRouteIds.map((id) => (
                                <option key={id} value={id}>
                                  {getOutboundRouteLabel(id)}
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
                            paddingTop: 24,
                          }}
                        >
                          <Btn
                            onClick={moveOutboundTop}
                            variant="outline"
                            style={{ padding: "4px 0", fontSize: 14 }}
                          >
                            &#8679;
                          </Btn>
                          <Btn
                            onClick={moveOutboundUp}
                            variant="outline"
                            style={{ padding: "4px 0", fontSize: 14 }}
                          >
                            &#8593;
                          </Btn>
                          <Btn
                            onClick={moveOutboundDown}
                            variant="outline"
                            style={{ padding: "4px 0", fontSize: 14 }}
                          >
                            &#8595;
                          </Btn>
                          <Btn
                            onClick={moveOutboundBottom}
                            variant="outline"
                            style={{ padding: "4px 0", fontSize: 14 }}
                          >
                            &#8681;
                          </Btn>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Divider */}
                <div style={{ margin: "32px 0 20px 0", position: "relative" }}>
                  <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
                  <span
                    style={{
                      position: "absolute",
                      top: -10,
                      left: 0,
                      background: "#fff",
                      paddingRight: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.mutedText,
                    }}
                  >
                    Advanced
                  </span>
                </div>

                {/* Advanced Section 2-Column Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 40px",
                  }}
                >
                  {/* Advanced Left Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Invalid Sound">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={invalidSound}
                          onChange={(e) => setInvalidSound(e.target.value)}
                          sx={{ fontSize: 13 }}
                        >
                          {invalidSoundOptions.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Exit Sound">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={exitSound}
                          onChange={(e) => setExitSound(e.target.value)}
                          sx={{ fontSize: 13 }}
                        >
                          {exitSoundOptions.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    <FieldRow label="Exit Action">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={exitActionType || ""}
                          displayEmpty
                          onChange={(e) => {
                            setExitActionType(e.target.value);
                            setExitActionValue("");
                          }}
                          renderValue={(value) =>
                            value ? formatActionLabel(value) : "Select action"
                          }
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="" sx={{ fontSize: 13 }}>
                            <em>Select action</em>
                          </MenuItem>
                          {actionTypeOptions.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {formatActionLabel(opt)}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>

                    {exitActionType && (
                      <FieldRow label="Destination">
                        {renderDestinationSelect(
                          exitActionType,
                          exitActionValue,
                          setExitActionValue,
                        )}
                      </FieldRow>
                    )}

                    <FieldRow label="Caller ID Name Prefix">
                      <TextField
                        size="small"
                        fullWidth
                        value={callerIdNamePrefix}
                        onChange={(e) => setCallerIdNamePrefix(e.target.value)}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </FieldRow>
                  </div>

                  {/* Advanced Right Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <FieldRow label="Ring Back" align="flex-start">
                      <FormControl size="small" fullWidth>
                        <MuiSelect
                          value={ringBack}
                          onChange={(e) => setRingBack(e.target.value)}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                          sx={{ fontSize: 13 }}
                        >
                          {ringBack &&
                            !ringBackAllValues.includes(ringBack) && (
                              <MenuItem value={ringBack} sx={{ fontSize: 13 }}>
                                {ringBack}
                              </MenuItem>
                            )}
                          {ringBackOptions.moh_categories.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 12,
                                lineHeight: "24px",
                              }}
                            >
                              Music on Hold
                            </ListSubheader>
                          )}
                          {ringBackOptions.moh_categories.map((opt) => (
                            <MenuItem
                              key={`moh-${opt}`}
                              value={opt}
                              sx={{ pl: 3, fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                          {ringBackOptions.custom_prompts.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 12,
                                lineHeight: "24px",
                              }}
                            >
                              Custom Prompt
                            </ListSubheader>
                          )}
                          {ringBackOptions.custom_prompts.map((opt) => (
                            <MenuItem
                              key={`prompt-${opt}`}
                              value={opt}
                              sx={{ pl: 3, fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                          {ringBackOptions.country_tones.length > 0 && (
                            <ListSubheader
                              disableSticky
                              sx={{
                                fontWeight: 700,
                                fontSize: 12,
                                lineHeight: "24px",
                              }}
                            >
                              Ring Back
                            </ListSubheader>
                          )}
                          {ringBackOptions.country_tones.map((opt) => (
                            <MenuItem
                              key={`tone-${opt}`}
                              value={opt}
                              sx={{ pl: 3, fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── KEY PRESS TAB ── */}
          {activeTab === "keypress" && (
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
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 1fr",
                  gap: 16,
                  marginBottom: 12,
                  borderBottom: `1px solid ${C.cardBorder}`,
                  paddingBottom: 8,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: C.mutedText }}
                >
                  Option
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: C.mutedText }}
                >
                  Destination
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: C.mutedText }}
                >
                  Target
                </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {KEYS.map((key) => (
                  <div
                    key={key}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr 1fr",
                      gap: 16,
                      alignItems: "center",
                      borderBottom: `1px solid #f1f5f9`,
                      paddingBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.labelText,
                      }}
                    >
                      Digit{" "}
                      <span
                        style={{
                          color: C.accent,
                          padding: "2px 6px",
                          background: "#f1f5f9",
                          borderRadius: 4,
                          marginLeft: 4,
                        }}
                      >
                        {key}
                      </span>
                    </span>
                    <FormControl size="small" fullWidth>
                      <MuiSelect
                        value={keyDestinations[key] || ""}
                        displayEmpty
                        onChange={(e) => {
                          const val = e.target.value;
                          handleKeyDestinationChange(key, val);
                          handleKeyDestinationValueChange(key, "");
                        }}
                        renderValue={(value) =>
                          value
                            ? formatActionLabel(value)
                            : "Select destination"
                        }
                        sx={{ fontSize: 13, background: "#fff" }}
                      >
                        <MenuItem value="" sx={{ fontSize: 13 }}>
                          <em>Select destination</em>
                        </MenuItem>
                        {keyActionTypeOptions.map((opt) => (
                          <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                            {formatActionLabel(opt)}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                    <div>
                      {renderDestinationSelect(
                        keyDestinations[key],
                        keyDestinationValues[key],
                        (val) => handleKeyDestinationValueChange(key, val),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
        <Button
  onClick={handleSave}
  disabled={loading.save}
  variant="contained"
  sx={{
    padding: "8px 20px", // chhota width
    fontSize: 13,
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",

    fontWeight: 600,
    textTransform: "none",

    minWidth: "unset",
    width: "auto",

    "&:hover": {
      background:
        "linear-gradient(to bottom, #647A9B 0%, #4A6284 60%, #344A67 100%)",
    },

    "&:disabled": {
      background: "#94a3b8",
      color: "#e2e8f0",
      border: "1px solid #94a3b8",
    },
  }}
>
  {loading.save ? (
    <CircularProgress size={14} sx={{ color: "#fff", mr: 1 }} />
  ) : null}

  {loading.save
    ? "Saving..."
    : editId != null
      ? "Update IVR"
      : "Create IVR"}
</Button>
       <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="outline"
               style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IVRPage;
