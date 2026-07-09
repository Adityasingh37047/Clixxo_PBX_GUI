import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  listIvrDestinations,
  listIvrs,
  listIvrOptions,
  listIvrDirectOutboundOptions,
  createIvr,
  updateIvr,
  deleteIvr,
  getIvr,
  setIvrKeys,
} from "../../../api/apiService";
import {
  IVR_CHECK_VOICEMAIL_OPTIONS,
  IVR_DIRECT_EXTENSION_OPTIONS,
  IVR_EMPTY_PROMPT_OPTIONS,
  IVR_EMPTY_RING_BACK_OPTIONS,
  IVR_ENABLE_OPTIONS,
  IVR_FIELD_TOOLTIPS,
  IVR_FXO_FLASH_TRANSFER_OPTIONS,
  IVR_KEYS,
  IVR_MODAL_TABS,
  IVR_TEXT_TARGET_TYPES,
  IVR_TITLE,
} from "../../../constants/IVRConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as IvrBreadcrumb,
  ExtensionTableListLoading as IvrTableListLoading,
  ExtensionTableListEmptyState as IvrTableListEmptyState,
  ExtensionModalTabs as IvrModalTabs,
  extensionTableCheckboxSx as ivrTableCheckboxSx,
  extensionFixedAlertSx as ivrFixedAlertSx,
  extensionPageWrapStyle as ivrPageWrapStyle,
  extensionPageInnerStyle as ivrPageInnerStyle,
  extensionCardStyle as ivrCardStyle,
  extensionToolbarStyle as ivrToolbarStyle,
  extensionSelectedBadgeStyle as ivrSelectedBadgeStyle,
  extensionCancelBtnStyle as ivrCancelBtnStyle,
  extensionPrimaryBtnStyle as ivrPrimaryBtnStyle,
  ExtensionCodecDualList as IvrCodecDualList,
} from "../../../components/common";

const IVR_COMPACT_MQ = "(max-width: 768px)";

const TEXT_TARGET_TYPES = new Set(IVR_TEXT_TARGET_TYPES);
const EMPTY_PROMPT_OPTIONS = IVR_EMPTY_PROMPT_OPTIONS;
const EMPTY_RING_BACK_OPTIONS = IVR_EMPTY_RING_BACK_OPTIONS;
const KEYS = IVR_KEYS;

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

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#d8dde5",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#6b7280",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
  errorRed: "#dc2626",
  successGreen: "#16a34a",
};

// ── Local page UI ──



// ── Local page shell UI (pilot: inlined from pbxSharedUi) ──
const IVR_TABLE_CARD_RADIUS = 10;

const ivrPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: IVR_TABLE_CARD_RADIUS,
  borderBottomRightRadius: IVR_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const ivrPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const ivrEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

const handleIvrEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";
const FOCUS_RING_SHADOW = "0 0 0 2px rgba(62, 84, 117, 0.15)";

const ivrOutlinedInputRootSx = {
  backgroundColor: "#fff",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  "& fieldset": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover fieldset": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused": {
    boxShadow: FOCUS_RING_SHADOW,
  },
  "&.Mui-focused fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "&.Mui-focused:hover fieldset": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
};

const ivrModalTextFieldFullSx = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    ...ivrOutlinedInputRootSx,
    minHeight: 36,
    height: 36,
    fontSize: 13,
  },
  "& .MuiOutlinedInput-input": {
    padding: "7px 10px",
    fontSize: 13,
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
};

const ivrModalSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  width: "100%",
  minHeight: 36,
  height: 36,
  ...ivrOutlinedInputRootSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
    fontSize: 13,
    backgroundColor: "#fff",
  },
};

const ivrModalPaperSx = {
  width: 900,
  maxWidth: "96vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const ivrModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const ivrModalFormStyle = {
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
  marginTop: 24,
};

const ivrModalDialogContentSx = {
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const addNewModalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "16px 24px",
  boxSizing: "border-box",
  background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const addNewModalFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const addNewModalFooterCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const ivrModalCancelBtnStyle = {
  ...addNewModalFooterBtnStyle,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const IVR_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatIvrTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const ivrModalTabBarStyle = {

  background: "#ffffff",
};

const ivrModalTabsSx = {
  minHeight: 45,
  "& .MuiTab-root": {
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "none",
    minHeight: 45,
  },
  "& .MuiTab-root.Mui-selected": {
    color: C.accent,
    fontWeight: 700,
  },
};


const IVR_MODAL_LABEL_WIDTH = 150;

const IvrFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = IVR_FIELD_TOOLTIPS[tooltipKey] || "";
  const label = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return label;
  return (
    <Tooltip title={formatIvrTooltipTitle(tooltip)} {...IVR_TOOLTIP_PROPS}>
      {label}
    </Tooltip>
  );
};

const IvrFieldRow = ({
  label,
  tooltipKey,
  children,
  required = false,
  alignTop = false,
  labelWidth = IVR_MODAL_LABEL_WIDTH,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      gap: 12,
      minHeight: alignTop ? undefined : 32,
    }}
  >
    <IvrFieldLabel
      tooltipKey={tooltipKey}
      style={{
        width: labelWidth,
        flexShrink: 0,
        marginTop: alignTop ? 4 : 0,
      }}
    >
      {label}
      {required ? <span style={{ color: C.errorRed }}> *</span> : null}
    </IvrFieldLabel>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const IVRPage = () => {
  const isCompact = useMediaQuery(IVR_COMPACT_MQ);
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedOutboundRoutesRef = useRef(false);
  const modalScrollRef = useRef(null);

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
    } catch (err) {
      showMessage("error", err?.message || "Failed to load IVR data.");
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
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

  useLayoutEffect(() => {
    if (!showModal || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTop = 0;
  }, [showModal, activeTab]);

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

  // ── Dual Listbox Logic ──
  const routeNameById = useMemo(() => {
    const map = new Map();
    allOutboundRoutes.forEach((r) => map.set(r.id, r.name));
    return map;
  }, [allOutboundRoutes]);

  const getOutboundRouteLabel = (id) => routeNameById.get(id) || `ID:${id}`;

  const allOutboundRouteOptions = useMemo(
    () =>
      allOutboundRoutes.map(({ id, name }) => ({
        value: id,
        label: name || String(id),
      })),
    [allOutboundRoutes],
  );

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
          sx={ivrModalTextFieldFullSx}
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
        ...ivrPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={ivrPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={ivrFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <IvrBreadcrumb section="Call Features" current={IVR_TITLE} />

        <div style={ivrCardStyle}>
          <div
            style={{
              ...ivrToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
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
              {selected.length > 0 && (
                <span style={ivrSelectedBadgeStyle}>
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
                      fontSize: 11
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
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={ivrCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>

              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={ivrPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "hidden", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <IvrTableListLoading />
            ) : rows.length === 0 ? (
              <IvrTableListEmptyState
                message="No IVRs found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchQuery && filteredRows.length === 0 ? (
              <IvrTableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
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
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={ivrTableCheckboxSx}
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
                      IVR Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Direct Outbound
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Outbound Routes
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
                            borderLeft: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={ivrTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
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
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                              color:
                                row.enabled === "Yes" ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                              color: row.directOutbound ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.directOutbound ? "Yes" : "No"}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
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
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            borderRight: "none",
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={ivrEditIconStyle}
                            onMouseEnter={(e) =>
                              handleIvrEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleIvrEditIconHover(e, false)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <div style={ivrPaginationStyle}>
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
                <span style={ivrPageBadgeStyle}>
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

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: ivrModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={ivrModalTitleStyle}>
          {editId != null ? "Edit IVR" : "Add IVR"}
        </DialogTitle>

        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          style={{
            padding: "0px 24px 20px",
            backgroundColor: "#ffffff",
          }}
          sx={ivrModalDialogContentSx}
        >
          <div
            style={{
              borderBottom: `1px solid ${C.divider}`,
              background: "#ffffff",
              marginLeft: "-24px",
              marginRight: "-24px",
            }}
          >
            <IvrModalTabs
              value={activeTab}
              onChange={setActiveTab}
              tabs={IVR_MODAL_TABS}
            />
          </div>
          <div style={ivrModalFormStyle}>
            <div style={{ padding: 0 }}>
              {/* ── BASIC TAB ── */}
              {activeTab === "basic" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
  style={{
    padding: "0",
  }}
>
                    {/* ── Naya "Basic" Heading ── */}
                    
                    {/* 2-Column Grid for Basic fields */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr", ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
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
                  <IvrFieldRow label="Name" tooltipKey="name" required>
  <TextField
    size="small"
    fullWidth
    value={name}
    onChange={(e) => setName(e.target.value)}
    sx={ivrModalTextFieldFullSx}
  />
</IvrFieldRow>
                        <IvrFieldRow label="IVR Number" tooltipKey="ivr_number" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={ivrNumber}
                            onChange={(e) => setIvrNumber(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Greet Long" tooltipKey="greet_long" required>
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
                                sx={ivrModalSelectSx}
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
                                color: C.accent,
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              Prompt
                            </span>
                          </div>
                        </IvrFieldRow>

                        <IvrFieldRow label="Greet Short" tooltipKey="greet_short" required>
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
                                sx={ivrModalSelectSx}
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
                                color: C.accent,
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              Prompt
                            </span>
                          </div>
                        </IvrFieldRow>

                        <IvrFieldRow label="Response Timeout(ms)" tooltipKey="response_timeout" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={responseTimeout}
                            onChange={(e) => setResponseTimeout(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Password" tooltipKey="password" required>
                          <TextField
                            size="small"
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
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
                        </IvrFieldRow>

                        <IvrFieldRow label="Check Voicemail" tooltipKey="check_voicemail" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={checkVoicemail}
                              onChange={(e) =>
                                setCheckVoicemail(e.target.value)
                              }
                              sx={ivrModalSelectSx}
                            >
                              {IVR_CHECK_VOICEMAIL_OPTIONS.map((opt) => (
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
                        </IvrFieldRow>

                        <IvrFieldRow
                          label="Direct Outbound"
                          tooltipKey="direct_outbound"
                          labelWidth={170}
                        >
                          <Checkbox
                            checked={directOutbound}
                            onChange={(e) =>
                              setDirectOutbound(e.target.checked)
                            }
                            size="small"
                            sx={ivrTableCheckboxSx}
                          />
                        </IvrFieldRow>
                      </div>

                      {/* Right Column */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <IvrFieldRow label="Inter-Digit Timeout(ms)" tooltipKey="inter_digit_timeout" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={interDigitTimeout}
                            onChange={(e) =>
                              setInterDigitTimeout(e.target.value)
                            }
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Max Failures" tooltipKey="max_failures" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={maxFailures}
                            onChange={(e) => setMaxFailures(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Max Timeouts" tooltipKey="max_timeouts" required>
                          <TextField  
                            size="small"
                            fullWidth
                            type="number"
                            value={maxTimeouts}
                            onChange={(e) => setMaxTimeouts(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Digit Length" tooltipKey="digit_length" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={digitLength}
                            onChange={(e) => setDigitLength(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Enabled" tooltipKey="enabled" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={enabled}
                              onChange={(e) => setEnabled(e.target.value)}
                              sx={ivrModalSelectSx}
                            >
                              {IVR_ENABLE_OPTIONS.map((opt) => (
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
                        </IvrFieldRow>

                        <IvrFieldRow label="Direct Extension" tooltipKey="direct_extension" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={directExtension}
                              onChange={(e) =>
                                setDirectExtension(e.target.value)
                              }
                              sx={ivrModalSelectSx}
                            >
                              {IVR_DIRECT_EXTENSION_OPTIONS.map((opt) => (
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
                        </IvrFieldRow>

                        <IvrFieldRow label="FXO Flash Transfer" tooltipKey="fxo_flash_transfer" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={fxoFlashTransfer}
                              onChange={(e) =>
                                setFxoFlashTransfer(e.target.value)
                              }
                              sx={ivrModalSelectSx}
                            >
                              {IVR_FXO_FLASH_TRANSFER_OPTIONS.map((opt) => (
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
                        </IvrFieldRow>
                      </div>
                    </div>

                    {/* Outbound Routes Section (Conditionally Rendered before Advanced) */}
                    {directOutbound && (
                      <div
                        style={{
                          marginTop: 24,
                          paddingTop: 16,
                       
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

                        <IvrCodecDualList
                          style={{ marginTop: 16 }}
                          allOptions={
                            loading.outboundRoutes ? [] : allOutboundRouteOptions
                          }
                          selected={selectedOutboundRouteIds}
                          onChange={setSelectedOutboundRouteIds}
                          getLabel={getOutboundRouteLabel}
                          emptyTextAvailable={
                            loading.outboundRoutes
                              ? "Loading routes..."
                              : "No routes available"
                          }
                          emptyTextSelected="No selected routes"
                        />
                      </div>
                    )}

                    {/* Advanced Divider */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "32px 0 20px 0",
                      }}
                    >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.labelText,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Advanced
                        </span>

                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: C.cardBorder,
                          marginLeft: 12,
                        }}
                      />
                    </div>

                    {/* Advanced Section 2-Column Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr", ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
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
                        <IvrFieldRow label="Invalid Sound" tooltipKey="invalid_sound" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={invalidSound}
                              onChange={(e) => setInvalidSound(e.target.value)}
                              sx={ivrModalSelectSx}
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
                        </IvrFieldRow>

                        <IvrFieldRow label="Exit Sound" tooltipKey="exit_sound" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={exitSound}
                              onChange={(e) => setExitSound(e.target.value)}
                              sx={ivrModalSelectSx}
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
                        </IvrFieldRow>

                        <IvrFieldRow label="Exit Action" tooltipKey="exit_action" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={exitActionType || ""}
                              displayEmpty
                              onChange={(e) => {
                                setExitActionType(e.target.value);
                                setExitActionValue("");
                              }}
                              renderValue={(value) =>
                                value
                                  ? formatActionLabel(value)
                                  : "Select action"
                              }
                              sx={ivrModalSelectSx}
                            >
                              <MenuItem value="" sx={{ fontSize: 13 }}>
                                <em>Select action</em>
                              </MenuItem>
                              {actionTypeOptions.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={{ fontSize: 13, backgroundColor: "#fff" }}
                                >
                                  {formatActionLabel(opt)}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </IvrFieldRow>
                      </div>

                      {/* Advanced Right Column */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <IvrFieldRow label="Ring Back" tooltipKey="ring_back" alignTop>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={ringBack}
                              onChange={(e) => setRingBack(e.target.value)}
                              MenuProps={{
                                PaperProps: { sx: { maxHeight: 360 } },
                              }}
                              sx={ivrModalSelectSx}
                            >
                              {ringBack &&
                                !ringBackAllValues.includes(ringBack) && (
                                  <MenuItem
                                    value={ringBack}
                                    sx={{ fontSize: 13 }}
                                  >
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
                        </IvrFieldRow>

                        <IvrFieldRow label="Caller ID Name Prefix" tooltipKey="caller_id_name_prefix" required>
                          <TextField
                            size="small"
                            fullWidth
                            value={callerIdNamePrefix}
                            onChange={(e) =>
                              setCallerIdNamePrefix(e.target.value)
                            }
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        {exitActionType && (
                          <IvrFieldRow label="Destination" tooltipKey="exit_destination" required>
                            {renderDestinationSelect(
                              exitActionType,
                              exitActionValue,
                              setExitActionValue,
                            )}
                          </IvrFieldRow>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── KEY PRESS TAB ── */}
              {activeTab === "keypress" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div style={{ padding: 0 }}>
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
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.labelText,
                      }}
                    >
                      Option
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.labelText,
                      }}
                    >
                      Destination
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.labelText,
                      }}
                    >
                      Target
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.labelText,
                    }}
                  >
                    {KEYS.map((key) => (
                      <div
                        key={key}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "100px 1fr 1fr",
                          gap: 16,
                          alignItems: "center",
                          borderBottom: `1px solid ${C.cardBorder}`,
                          paddingBottom: 12,
                          marginBottom: 12,
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
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} style={{ color: "#fff" }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update IVR"
            ) : (
              "Create IVR"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={ivrModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IVRPage;
