import React, { useState, useRef, useEffect, useMemo } from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import AddIcon from "@mui/icons-material/Add";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
} from "@mui/material";

import {
  sipRegisterFields,
  SIP_REGISTER_INITIAL_FORM,
  CODEC_OPTIONS,
  SIP_REGISTER_COUNTRY_OPTIONS,
  SIP_REGISTER_TRANSPORT_OPTIONS,
  SIP_REGISTER_YES_NO,
  SIP_REGISTER_ETH_PORT_OPTIONS,
  SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS,
  SIP_REGISTER_DTMF_OPTIONS,
} from "../constants/SipRegisterConstants";

import {
  fetchSipAccounts,
  listSipTrunks,
  createSipTrunk,
  updateSipTrunk,
  deleteSipTrunk,
  fetchSystemInfo,
} from "../api/apiService";

// ── Color palette (matches CDR / CallCount) ──────────────────────────────
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

// ── Shared: Action Button ────────────────────────────────────────────────────
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

// ── Shared: Table Header ──────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────

const SipRegisterPage = () => {
  // State
  const [trunks, setTrunks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_REGISTER_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importFileRef = useRef(null);

  const [modalTab, setModalTab] = useState("basic");
  const [dodRows, setDodRows] = useState([]);
  const [dodSelected, setDodSelected] = useState([]);
  const [adaptRows, setAdaptRows] = useState([
    { matchMode: "", strip: "", prepend: "" },
  ]);
  const [dnisRows, setDnisRows] = useState([
    { dnisNumber: "", dnisName: "", replaceCid: "No" },
  ]);
  const [ethPortOptions, setEthPortOptions] = useState(
    SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({ value: v, label: v })),
  );
  const [ethPortLoading, setEthPortLoading] = useState(false);

  // Pagination & Search (CDR Style)
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fields to hide from the table
  const HIDDEN_TABLE_FIELDS = [
    "password",
    "provider",
    "Domain name",
    "Contact User",
    "Outbound Proxy",
    "sip_header",
    "from_user",
    "expire_in_sec",
    "context",
    "allow_codecs",
  ];
  const PREFERRED_ASSERTED_IDENTITY_OPTIONS = [
    "None",
    "Extension Number",
    "Trunk User Name",
    "DOD Number",
  ];
  const REMOTE_PARTY_ID_OPTIONS = [
    "None",
    "Extension Number",
    "Trunk User Name",
  ];
  const CONTACT_MODE_OPTIONS = ["Extension Number", "Trunk User Name"];
  const SIP_PREFIX_FIELDS = [
    "provider",
    "sip_header",
    "Outbound Proxy",
    "server_domain",
    "client_domain",
  ];

  // DOD Add modal
  const [showDodAddModal, setShowDodAddModal] = useState(false);
  const [dodAddName, setDodAddName] = useState("");
  const [dodAddNumber, setDodAddNumber] = useState("");
  const [dodMemberExtensions, setDodMemberExtensions] = useState([]);
  const [dodAvailableSelected, setDodAvailableSelected] = useState([]);
  const [dodChosenSelected, setDodChosenSelected] = useState([]);
  const [dodAvailableExtensions, setDodAvailableExtensions] = useState([]);
  const dodHasLoadedExtensionsRef = useRef(false);

  const dodExtensionLabelMap = useMemo(() => {
    const map = new Map();
    dodAvailableExtensions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [dodAvailableExtensions]);

  const getDodExtLabel = (ext) => dodExtensionLabelMap.get(ext) || ext;

  const dodAvailableList = useMemo(
    () =>
      dodAvailableExtensions.filter(
        (e) => !dodMemberExtensions.includes(e.value),
      ),
    [dodAvailableExtensions, dodMemberExtensions],
  );

  const resetDodAddForm = () => {
    setDodAddName("");
    setDodAddNumber("");
    setDodMemberExtensions([]);
    setDodAvailableSelected([]);
    setDodChosenSelected([]);
  };

  const loadDodExtensions = async () => {
    try {
      const res = await fetchSipAccounts();
      const sipList = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const exts = sipList
        .filter((e) => e && e.extension)
        .map((e) => ({
          value: String(e.extension),
          label: `${(e.display_name || e.name || String(e.extension)).trim()}-${String(e.extension)}`,
        }))
        .sort(
          (a, b) =>
            parseInt(a.value, 10) - parseInt(b.value, 10) ||
            a.label.localeCompare(b.label),
        );
      setDodAvailableExtensions(exts);
      dodHasLoadedExtensionsRef.current = true;
    } catch (e) {
      setDodAvailableExtensions([]);
      dodHasLoadedExtensionsRef.current = true;
    }
  };

  const handleOpenDodAddModal = async () => {
    resetDodAddForm();
    setShowDodAddModal(true);
    if (!dodHasLoadedExtensionsRef.current) await loadDodExtensions();
  };

  const dodAddSelectedMembers = () => {
    if (!dodAvailableSelected.length) return;
    setDodMemberExtensions((prev) => [
      ...prev,
      ...dodAvailableSelected.filter((id) => !prev.includes(id)),
    ]);
    setDodAvailableSelected([]);
  };

  const dodAddAllMembers = () => {
    setDodMemberExtensions(dodAvailableExtensions.map((e) => e.value));
    setDodAvailableSelected([]);
  };

  const dodRemoveSelectedMembers = () => {
    if (!dodChosenSelected.length) return;
    setDodMemberExtensions((prev) =>
      prev.filter((id) => !dodChosenSelected.includes(id)),
    );
    setDodChosenSelected([]);
  };

  const dodRemoveAllMembers = () => {
    setDodMemberExtensions([]);
    setDodChosenSelected([]);
  };

  const handleConfirmDodAdd = () => {
    const name = dodAddName.trim();
    const number = dodAddNumber.trim();
    if (!name || !number || !dodMemberExtensions.length) {
      return showMessage(
        "error",
        "Name, Number, and at least one extension are required",
      );
    }
    setDodRows((prev) => [
      ...prev,
      {
        dodName: name,
        dodNumber: number,
        bindExtensions: [...dodMemberExtensions],
      },
    ]);
    setDodSelected([]);
    setShowDodAddModal(false);
    resetDodAddForm();
  };

  // Load ETH port options
  useEffect(() => {
    if (!showModal) return;
    const getIpFromInterfaceObject = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      if (Array.isArray(obj["IP Address"]) && obj["IP Address"][0])
        return obj["IP Address"][0];
      if (Array.isArray(obj["Ip Address"]) && obj["Ip Address"][0])
        return obj["Ip Address"][0];
      if (typeof obj["IP Address"] === "string") return obj["IP Address"];
      if (typeof obj["Ip Address"] === "string") return obj["Ip Address"];
      return null;
    };

    const loadEthPortOptions = async () => {
      setEthPortLoading(true);
      try {
        const sysInfo = await fetchSystemInfo();
        const details = sysInfo?.details || {};
        const lanInterfaces =
          details.LAN_INTERFACES || details.lan_interfaces || null;

        const interfacesArray = Array.isArray(lanInterfaces)
          ? lanInterfaces
          : lanInterfaces && typeof lanInterfaces === "object"
            ? Object.entries(lanInterfaces).map(([name, data]) => ({
                name,
                data,
              }))
            : [];

        let vpnOpenVpnIp = null;
        let vpnSoftEtherIp = null;

        interfacesArray.forEach((iface) => {
          const name = String(iface?.name || iface?.Name || "").toLowerCase();
          const ip = getIpFromInterfaceObject(iface?.data || iface);
          if (ip) {
            if (
              name.includes("tap0") ||
              name === "tap0" ||
              name.includes("tun0") ||
              name === "tun0"
            )
              vpnOpenVpnIp = vpnOpenVpnIp || ip;
            if (name.includes("vpn_vpn") || name === "vpn_vpn")
              vpnSoftEtherIp = vpnSoftEtherIp || ip;
          }
        });

        const nextOptions = [
          { value: "ETH0", label: "ETH0" },
          { value: "ETH1", label: "ETH1" },
        ];
        if (vpnOpenVpnIp)
          nextOptions.push({
            value: "OpenVPN",
            label: `OpenVPN (${vpnOpenVpnIp})`,
          });
        if (vpnSoftEtherIp)
          nextOptions.push({
            value: vpnSoftEtherIp,
            label: `SoftEther VPN IP (${vpnSoftEtherIp})`,
          });

        setEthPortOptions(nextOptions);

        const validValues = new Set(nextOptions.map((o) => o.value));
        setForm((prev) => {
          if (validValues.has(prev.ui_eth_port)) return prev;
          return {
            ...prev,
            ui_eth_port: nextOptions[0]?.value || prev.ui_eth_port,
          };
        });
      } catch (e) {
        setEthPortOptions(
          SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({ value: v, label: v })),
        );
      } finally {
        setEthPortLoading(false);
      }
    };
    loadEthPortOptions();
  }, [showModal]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const stripSipPrefix = (value) => (value ? value.replace(/^sip:/i, "") : "");

  // Transform Data Logic
  const transformApiToUi = (apiData) => {
    const toBool = (v) => {
      if (typeof v === "boolean") return v;
      const s = v == null ? "" : String(v).toLowerCase();
      return (
        s === "true" ||
        s === "yes" ||
        s === "1" ||
        s === "running" ||
        s === "connected"
      );
    };

    return (Array.isArray(apiData) ? apiData : []).map((item, index) => {
      const trunkId = item?.trunk_id ?? item?.trunkId ?? "";
      const codecsObj = item?.codecs || {};
      const allow_codecs = Object.entries(codecsObj)
        .filter(([, enabled]) => !!enabled)
        .map(([codec]) => codec)
        .join(",");
      const expireSeconds = item?.expire_seconds ?? item?.expire_in_sec ?? "";
      const ui_register = toBool(item?.register)
        ? "Yes"
        : String(expireSeconds) === "0" || String(expireSeconds) === ""
          ? "No"
          : "Yes";
      const expire_in_sec =
        ui_register === "No" ? "0" : String(expireSeconds ?? "");
      const eth_port =
        String(item?.eth_port ?? "").toLowerCase() === "lan"
          ? "ETH0"
          : String(item?.eth_port ?? "").toLowerCase() === "wan"
            ? "ETH1"
            : String(item?.eth_port ?? "");
      const outboundProxyVal =
        item?.proxy_ip ??
        item?.advance?.proxy_ip ??
        item?.outbound_proxy ??
        item?.advance?.outbound_proxy ??
        "";
      const advance = item?.advance || {};

      return {
        index: index.toString(),
        trunk_id: trunkId,
        username: item?.username ?? "",
        context: item?.context ?? "",
        allow_codecs,
        expire_in_sec,
        provider: stripSipPrefix(item?.trunk_ip_domain ?? item?.provider ?? ""),
        password: item?.password ?? "",
        sip_header: stripSipPrefix(item?.sip_header ?? ""),
        "Domain name": item?.["Domain name"] ?? item?.from_domain ?? "",
        "Contact User": item?.["Contact User"] ?? item?.contact_user ?? "",
        "Outbound Proxy": stripSipPrefix(
          item?.["Outbound Proxy"] ?? item?.outbound_proxy ?? "",
        ),
        server_domain: stripSipPrefix(item?.server_domain ?? ""),
        client_domain: stripSipPrefix(item?.client_domain ?? ""),
        from_domain:
          item?.from_domain ?? item?.auth_user ?? item?.authUser ?? "",
        from_user: item?.from_user ?? "",
        identity_ip: item?.identity_ip ?? "",
        registerStatus:
          item?.registration_status ?? item?.register_status ?? "",
        ui_country: item?.country ?? "General",
        ui_transport: String(item?.transport ?? "udp").toLowerCase() || "udp",
        ui_enable_srtp: toBool(item?.enable_srtp),
        ui_register,
        ui_reg_fail_retry: String(item?.reg_fail_retry ?? ""),
        ui_match_username: toBool(item?.match_username) ? "Yes" : "No",
        ui_enable_proxy:
          toBool(item?.enable_proxy ?? item?.advance?.enable_proxy) ||
          (outboundProxyVal != null &&
            String(outboundProxyVal).trim() !== "" &&
            String(outboundProxyVal).trim().toLowerCase() !== "none"),
        ui_proxy_ip: stripSipPrefix(outboundProxyVal),
        ui_outbound_cid_source:
          String(item?.outbound_callerid ?? "") === "register_name"
            ? "Register Name"
            : "Transparent caller",
        ui_show_outbound_cid_name: toBool(item?.show_outbound_cid_name),
        ui_outbound_cid_name: item?.outbound_cid_name ?? "",
        ui_outbound_cid_number: item?.outbound_cid_number ?? "",
        ui_record: toBool(item?.recording) ? "Yes" : "No",
        ui_enabled: toBool(item?.enabled) ? "Yes" : "No",
        ui_eth_port: eth_port,
        ui_trunk_type: item?.trunk_type ?? "sip",
        ui_get_called_id_type: advance?.get_called_id_type ?? "",
        ui_options_interval: advance?.options_interval_s ?? "",
        ui_tx_volume: String(advance?.tx_volume ?? "0"),
        ui_rx_volume: String(advance?.rx_volume ?? "0"),
        ui_send_privacy_id:
          String(advance?.send_privacy_id ?? "").toLowerCase() === "yes"
            ? "Yes"
            : "No",
        ui_sip_force_contact: advance?.sip_force_contact ?? "",
        ui_p_preferred_identity: advance?.p_preferred_identity ?? "None",
        ui_p_asserted_identity: advance?.p_asserted_identity ?? "None",
        ui_remote_party_id: advance?.remote_party_id ?? "None",
        ui_contact_mode:
          String(advance?.contact) === "trunk_username" ||
          String(advance?.contact).toLowerCase() === "trunk user name"
            ? "Trunk User Name"
            : "Extension Number",
        ui_limit_max_calls: String(advance?.limit_max_calls ?? "0"),
        ui_enable_early_session:
          String(advance?.enable_early_session ?? "").toLowerCase() === "yes"
            ? "Yes"
            : "No",
        ui_enable_early_media:
          String(advance?.enable_early_media ?? "").toLowerCase() === "yes"
            ? "Yes"
            : "No",
        ui_user_phone: toBool(advance?.user_phone),
        ui_call_timeout: String(advance?.call_timeout_s ?? "30"),
        ui_max_call_duration: String(advance?.max_call_duration_s ?? "6000"),
        ui_dnis: toBool(advance?.dnis),
        ui_dtmf_transmit: advance?.dtmf_transmit_mode ?? "RFC2833",
        dodRows: Array.isArray(item?.dod)
          ? item.dod.map((d) => ({
              dodName: d?.dod_name ?? d?.dodName ?? "",
              dodNumber: d?.dod_number ?? d?.dodNumber ?? "",
              bindExtensions: Array.isArray(d?.extensions)
                ? d.extensions.map(String)
                : Array.isArray(d?.extension)
                  ? d.extension.map(String)
                  : [],
            }))
          : [],
        adaptRows: Array.isArray(item?.adapt_callerid)
          ? item.adapt_callerid.map((a) => ({
              matchMode: a?.match_mode ?? a?.matchMode ?? "",
              strip: a?.strip ?? "",
              prepend: a?.prepend ?? "",
            }))
          : [{ matchMode: "", strip: "", prepend: "" }],
      };
    });
  };

  const transformUiToApi = (uiData) => {
    const selectedCodecsSet = new Set(
      (uiData.allow_codecs || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
    const codecs = {};
    CODEC_OPTIONS.forEach((c) => {
      codecs[c.value] = selectedCodecsSet.has(c.value);
    });

    return {
      trunk_id: uiData.trunk_id,
      trunk_name: uiData.trunk_id,
      country: uiData.ui_country,
      transport: String(uiData.ui_transport || "udp").toUpperCase(),
      enable_srtp: !!uiData.ui_enable_srtp,
      register: uiData.ui_register === "Yes" ? "yes" : "no",
      username: uiData.username ?? "",
      from_domain: uiData.from_domain ?? "",
      password: uiData.password ?? "",
      reg_fail_retry: uiData.ui_reg_fail_retry ?? 30,
      expire_seconds:
        uiData.ui_register === "No" ? 0 : (uiData.expire_in_sec ?? 1800),
      match_username: uiData.ui_match_username === "Yes",
      enable_proxy: !!uiData.ui_enable_proxy,
      proxy_ip: uiData.ui_proxy_ip ?? "",
      trunk_ip_domain: uiData.provider ?? "",
      outbound_callerid:
        uiData.ui_outbound_cid_source === "Register Name"
          ? "register_name"
          : "transparent_caller",
      show_outbound_cid_name: !!uiData.ui_show_outbound_cid_name,
      outbound_cid_name: uiData.ui_outbound_cid_name ?? "",
      outbound_cid_number: uiData.ui_outbound_cid_number ?? "",
      recording: uiData.ui_record === "Yes" ? "yes" : "no",
      enabled: uiData.ui_enabled === "Yes",
      eth_port: uiData.ui_eth_port ?? "ETH0",
      context: uiData.context ?? "",
      from_user: uiData.from_user ?? "",
      codecs,
      advance: {
        get_called_id_type: uiData.ui_get_called_id_type ?? "",
        options_interval_s: uiData.ui_options_interval ?? "",
        tx_volume: uiData.ui_tx_volume ?? "0",
        rx_volume: uiData.ui_rx_volume ?? "0",
        send_privacy_id: uiData.ui_send_privacy_id === "Yes" ? "yes" : "no",
        sip_force_contact: uiData.ui_sip_force_contact ?? "",
        p_preferred_identity: uiData.ui_p_preferred_identity ?? "None",
        p_asserted_identity: uiData.ui_p_asserted_identity ?? "None",
        remote_party_id: uiData.ui_remote_party_id ?? "None",
        contact:
          uiData.ui_contact_mode === "Trunk User Name"
            ? "trunk_username"
            : "extension_number",
        limit_max_calls: uiData.ui_limit_max_calls ?? "0",
        enable_early_session:
          uiData.ui_enable_early_session === "Yes" ? "yes" : "no",
        enable_early_media:
          uiData.ui_enable_early_media === "Yes" ? "yes" : "no",
        user_phone: !!uiData.ui_user_phone,
        call_timeout_s: uiData.ui_call_timeout ?? "30",
        max_call_duration_s: uiData.ui_max_call_duration ?? "6000",
        dnis: !!uiData.ui_dnis,
        dtmf_transmit_mode: uiData.ui_dtmf_transmit ?? "RFC2833",
      },
      dod: (dodRows || []).map((row) => ({
        dod_name: row.dodName ?? "",
        dod_number: row.dodNumber ?? "",
        extensions: Array.isArray(row.bindExtensions)
          ? row.bindExtensions.map(String)
          : [],
      })),
      adapt_callerid: (adaptRows || []).map((row) => ({
        match_mode: row.matchMode ?? "",
        strip: row.strip ?? "",
        prepend: row.prepend ?? "",
      })),
    };
  };

  const loadTrunks = async (isRefresh = false) => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const response = await listSipTrunks();
      if (response.response && response.message) {
        setTrunks(transformApiToUi(response.message));
        setLastUpdated(new Date());
      } else {
        if (!isRefresh) showMessage("error", "Failed to load SIP trunks");
      }
    } catch (error) {
      if (!isRefresh)
        showMessage("error", error.message || "Failed to load SIP trunks");
      if (!isRefresh) setTrunks([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadTrunks();
    }
  }, []);

  // ── Search & Filter Logic ──
  const filteredRows = searchQuery.trim()
    ? trunks.filter((r) =>
        [r.trunk_id, r.username, r.provider, r.registerStatus].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      )
    : trunks;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // ── CDR Checkbox Logic ──
  const allPageSelected =
    pagedRows.length > 0 &&
    pagedRows
      .map((r) => r.trunk_id)
      .filter(Boolean)
      .every((id) => selectedIds.includes(id));
  const somePageSelected =
    pagedRows.some((r) => r.trunk_id && selectedIds.includes(r.trunk_id)) &&
    !allPageSelected;

  const handleToggleRow = (trunk_id) => {
    if (!trunk_id) return;
    setSelectedIds((prev) =>
      prev.includes(trunk_id)
        ? prev.filter((id) => id !== trunk_id)
        : [...prev, trunk_id],
    );
  };

  const handleToggleAll = () => {
    const pageIds = pagedRows.map((r) => r.trunk_id).filter(Boolean);
    if (!pageIds.length) return;
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };

  const handleInverse = () => {
    const allIds = trunks.map((t) => t.trunk_id).filter(Boolean);
    setSelectedIds(allIds.filter((id) => !selectedIds.includes(id)));
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0)
      return showMessage("error", "Please select trunks to delete");
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      await Promise.allSettled(
        selectedIds.map(async (id) => await deleteSipTrunk(id)),
      );
      showMessage("success", "Selected trunk(s) deleted successfully");
      setSelectedIds([]);
      await loadTrunks(true);
    } catch (error) {
      showMessage("error", "Failed to delete some trunks");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (trunks.length === 0) return showMessage("info", "No trunks to clear");
    if (
      !window.confirm(
        "Are you sure you want to delete ALL SIP trunks? This action cannot be undone.",
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      await Promise.allSettled(
        trunks.map(async (trunk) => await deleteSipTrunk(trunk.trunk_id)),
      );
      showMessage("success", `All trunk(s) deleted successfully`);
      setSelectedIds([]);
      setPage(1);
      await loadTrunks(true);
    } catch (error) {
      showMessage("error", "Failed to clear all trunks");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // ── Modal Handlers ──
  const handleOpenModal = (row = null, idx = null) => {
    setModalTab("basic");
    setDodSelected([]);
    setAdaptRows([{ matchMode: "", strip: "", prepend: "" }]);
    setDnisRows([{ dnisNumber: "", dnisName: "", replaceCid: "No" }]);
    setValidationErrors({});
    if (row && idx !== null) {
      const uiReg =
        row.ui_register ??
        (String(row.expire_in_sec ?? "") === "0" ? "No" : "Yes");
      setForm({ ...SIP_REGISTER_INITIAL_FORM, ...row, ui_register: uiReg });
      setEditIndex(idx);
      setDodRows(Array.isArray(row.dodRows) ? row.dodRows : []);
      setAdaptRows(
        Array.isArray(row.adaptRows) && row.adaptRows.length
          ? row.adaptRows
          : [{ matchMode: "", strip: "", prepend: "" }],
      );
      setDnisRows(
        Array.isArray(row.dnisRows) && row.dnisRows.length
          ? row.dnisRows
          : [{ dnisNumber: "", dnisName: "", replaceCid: "No" }],
      );
    } else {
      setForm({
        ...SIP_REGISTER_INITIAL_FORM,
        index: trunks.length.toString(),
      });
      setEditIndex(null);
      setDodRows([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setModalTab("basic");
    setDodRows([]);
    setDodSelected([]);
    setAdaptRows([{ matchMode: "", strip: "", prepend: "" }]);
    setDnisRows([{ dnisNumber: "", dnisName: "", replaceCid: "No" }]);
    setShowPassword(false);
    setValidationErrors({});
  };

  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "ui_register") {
        if (value === "Yes") {
          if (!next.expire_in_sec || String(next.expire_in_sec).trim() === "")
            next.expire_in_sec = "1800";
        } else {
          next.expire_in_sec = "0";
        }
      }
      return next;
    });

    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleCodecChange = (codec, checked) => {
    setForm((prev) => {
      const currentCodecs = prev.allow_codecs
        ? prev.allow_codecs.split(",").map((c) => c.trim())
        : [];
      let newCodecs = checked
        ? currentCodecs.includes(codec)
          ? currentCodecs
          : [...currentCodecs, codec]
        : currentCodecs.filter((c) => c !== codec);
      return { ...prev, allow_codecs: newCodecs.join(",") };
    });
    if (validationErrors.allow_codecs)
      setValidationErrors((prev) => ({ ...prev, allow_codecs: null }));
  };

  const isCodecSelected = (codec) =>
    form.allow_codecs
      ? form.allow_codecs
          .split(",")
          .map((c) => c.trim())
          .includes(codec)
      : false;

  const handleSave = async () => {
    const errs = {};
    if (!form.trunk_id) errs.trunk_id = "Trunk Name is required";
    if (!form.ui_country) errs.ui_country = "Country is required";
    if (!form.allow_codecs) errs.allow_codecs = "Allow Codecs is required";

    if (form.ui_register === "Yes") {
      if (!form.username) errs.username = "Username is required";
      if (!form.password) errs.password = "Password is required";
      if (!form.provider) errs.provider = "Trunk IP/Domain is required";
      if (!form.expire_in_sec) errs.expire_in_sec = "Expire is required";
      if (form.ui_enable_proxy && !form.ui_proxy_ip)
        errs.ui_proxy_ip = "Proxy IP is required";
    }

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      if (errs.allow_codecs) setModalTab("codec");
      else setModalTab("basic");
      showMessage("error", Object.values(errs)[0]);
      return;
    }

    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const apiData = transformUiToApi(form);
      const response =
        editIndex !== null
          ? await updateSipTrunk(apiData)
          : await createSipTrunk(apiData);

      if (response.response) {
        showMessage(
          "success",
          response.message ||
            `Trunk ${editIndex !== null ? "updated" : "created"} successfully`,
        );
        handleCloseModal();
        await loadTrunks(true);
      } else {
        showMessage("error", "Failed to save trunk");
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to save trunk");
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

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Error Banner */}
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
          {/* Breadcrumb */}
          <div style={{ fontSize: 11, color: C.mutedText }}>
            PBX &rsaquo; Trunks &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              SIP Register
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
            {/* Left: page info + count */}
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
              {selectedIds.length > 0 && (
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
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {/* Right: search + action buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {/* Actions */}
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
              {/* <Btn
                onClick={() => loadTrunks(true)}
                disabled={loading.fetch}
                variant="default"
              >
                {loading.fetch ? (
                  <CircularProgress size={11} style={{ color: "#fff" }} />
                ) : (
                  "Refresh"
                )}
              </Btn> */}
              <Btn
                onClick={handleInverse}
                disabled={loading.delete}
                variant="outline"
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || trunks.length === 0}
                variant="danger"
              >
                Clear All
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selectedIds.length === 0}
                variant="danger"
              >
                🗑 Delete
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch}
                variant="accent"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {loading.fetch ? (
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
                  minWidth: 1200,
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
                    <TH style={{ width: 32 }}>I'D</TH>
                    {sipRegisterFields
                      .filter((f) => !HIDDEN_TABLE_FIELDS.includes(f.name))
                      .map((field) => (
                        <TH key={field.name}>{field.label}</TH>
                      ))}
                    <TH>Status</TH>
                    <TH style={{ width: 60 }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={15}
                        style={{
                          textAlign: "center",
                          padding: "36px 0",
                          color: C.mutedText,
                          fontSize: 13,
                        }}
                      >
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "No records found."}
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((trunk, idx) => {
                      const isSelected =
                        trunk.trunk_id && selectedIds.includes(trunk.trunk_id);
                      const rowBgColor = isSelected
                        ? "#f0f9ff"
                        : idx % 2 === 1
                          ? "#f8fafc"
                          : "#ffffff";

                      return (
                        <tr
                          key={trunk.trunk_id || idx}
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
                              disabled={!trunk.trunk_id}
                              checked={
                                !!trunk.trunk_id &&
                                selectedIds.includes(trunk.trunk_id)
                              }
                              onChange={() => handleToggleRow(trunk.trunk_id)}
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
                            {(page - 1) * itemsPerPage + idx + 1}
                          </td>

                          {sipRegisterFields
                            .filter(
                              (f) => !HIDDEN_TABLE_FIELDS.includes(f.name),
                            )
                            .map((field) => {
                              const value = trunk[field.name];
                              const hasValue =
                                value !== undefined &&
                                value !== null &&
                                value !== "";
                              const displayValue =
                                hasValue &&
                                SIP_PREFIX_FIELDS.includes(field.name)
                                  ? `sip:${value}`
                                  : hasValue
                                    ? value
                                    : "—";
                              return (
                                <td
                                  key={field.name}
                                  style={{
                                    padding: "7px 8px",
                                    fontSize: 12,
                                    color: C.valueText,
                                    textAlign: "center",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    borderRight: "0.5px solid #edf2f7",
                                    fontWeight:
                                      field.name === "trunk_id" ? 600 : 400,
                                  }}
                                >
                                  {displayValue}
                                </td>
                              );
                            })}

                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                              borderRight: "0.5px solid #edf2f7",
                            }}
                          >
                            <span
                              style={{
                                padding: "2px 9px",
                                borderRadius: 10,
                                fontSize: 10.5,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                display: "inline-block",
                                background:
                                  trunk.registerStatus?.toLowerCase() ===
                                  "registered"
                                    ? "#dcfce7"
                                    : trunk.registerStatus?.toLowerCase() ===
                                          "unregistered" ||
                                        trunk.registerStatus?.toLowerCase() ===
                                          "rejected"
                                      ? "#fef2f2"
                                      : trunk.registerStatus?.toLowerCase() ===
                                          "pending"
                                        ? "#fef3c7"
                                        : "#f1f5f9",
                                color:
                                  trunk.registerStatus?.toLowerCase() ===
                                  "registered"
                                    ? "#15803d"
                                    : trunk.registerStatus?.toLowerCase() ===
                                          "unregistered" ||
                                        trunk.registerStatus?.toLowerCase() ===
                                          "rejected"
                                      ? "#dc2626"
                                      : trunk.registerStatus?.toLowerCase() ===
                                          "pending"
                                        ? "#d97706"
                                        : "#475569",
                              }}
                            >
                              {trunk.registerStatus || "—"}
                            </span>
                          </td>

                          <td
                            style={{
                              textAlign: "center",
                              padding: "7px 8px",
                            }}
                          >
                            <EditDocumentIcon
                              className={`cursor-pointer text-blue-600 mx-auto ${loading.delete ? "opacity-50" : "opacity-80 hover:opacity-100 transition-opacity"}`}
                              style={{ fontSize: 18 }}
                              onClick={() =>
                                !loading.delete && handleOpenModal(trunk, idx)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Bottom pagination */}
          {!loading.fetch && filteredRows.length > 0 && (
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
                  disabled={loading.fetch || page <= 1}
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
                  disabled={loading.fetch || page >= totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Add/Edit Dialog ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: { width: 900, maxWidth: "96vw", p: 0, borderRadius: 2 },
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
          {editIndex !== null ? "Edit SIP Register" : "Add Trunk"}
          {/* Custom Tabs inside Modal Title */}
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
              { id: "codec", label: "CODEC" },
              { id: "advance", label: "ADVANCE" },
              { id: "dod", label: "DOD" },
              { id: "adapt", label: "ADAPT CALLER ID" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setModalTab(t.id)}
                style={{
                  background: modalTab === t.id ? C.pageBg : "transparent",
                  color: modalTab === t.id ? C.accent : "#9ca3af",
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
          style={{
            padding: "16px 20px",
            backgroundColor: C.pageBg,
            borderTop: `1px solid ${C.cardBorder}`,
          }}
        >
          {/* ── BASIC TAB ── */}
          {modalTab === "basic" && (
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
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 32px",
                }}
              >
                {/* ── LEFT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Trunk Type <span style={{ color: "red" }}>*</span>
                    </label>
                    <RadioGroup
                      row
                      value={form.ui_trunk_type}
                      onChange={(e) =>
                        handleChange("ui_trunk_type", e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="sip"
                        control={<Radio size="small" sx={{ p: 0.5 }} />}
                        label={<span style={{ fontSize: 13 }}>SIP</span>}
                      />
                    </RadioGroup>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Trunk Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <div style={{ flex: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Trunk Name"
                        fullWidth
                        value={form.trunk_id || ""}
                        onChange={(e) =>
                          handleChange("trunk_id", e.target.value)
                        }
                        error={!!validationErrors.trunk_id}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                      {validationErrors.trunk_id && (
                        <div
                          style={{
                            color: C.errorRed,
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          {validationErrors.trunk_id}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Country <span style={{ color: "red" }}>*</span>
                    </label>
                    <div style={{ flex: 1 }}>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_country || ""}
                        onChange={(e) =>
                          handleChange("ui_country", e.target.value)
                        }
                        error={!!validationErrors.ui_country}
                        sx={{ fontSize: 13 }}
                      >
                        {SIP_REGISTER_COUNTRY_OPTIONS.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                      {validationErrors.ui_country && (
                        <div
                          style={{
                            color: C.errorRed,
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          {validationErrors.ui_country}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Transport
                    </label>
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={form.ui_transport || "udp"}
                      onChange={(e) =>
                        handleChange("ui_transport", e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      {SIP_REGISTER_TRANSPORT_OPTIONS.map((c) => (
                        <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                          {c}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Enable SRTP
                    </label>
                    <Checkbox
                      checked={!!form.ui_enable_srtp}
                      onChange={(e) =>
                        handleChange("ui_enable_srtp", e.target.checked)
                      }
                      size="small"
                      sx={{
                        p: 0,
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Register <span style={{ color: "red" }}>*</span>
                    </label>
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={form.ui_register || "Yes"}
                      onChange={(e) =>
                        handleChange("ui_register", e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      {SIP_REGISTER_YES_NO.map((c) => (
                        <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                          {c}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Outbound CallerId Src
                    </label>
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={
                        form.ui_outbound_cid_source || "Transparent caller"
                      }
                      onChange={(e) =>
                        handleChange("ui_outbound_cid_source", e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      {SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS.map((c) => (
                        <MenuItem
                          key={c || "_empty"}
                          value={c}
                          sx={{ fontSize: 13 }}
                        >
                          {c || "—"}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Show Outbound CID Name
                    </label>
                    <Checkbox
                      checked={!!form.ui_show_outbound_cid_name}
                      onChange={(e) =>
                        handleChange(
                          "ui_show_outbound_cid_name",
                          e.target.checked,
                        )
                      }
                      size="small"
                      sx={{
                        p: 0,
                        color: C.accent,
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                  </div>

                  {form.ui_register === "Yes" && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            width: 140,
                            flexShrink: 0,
                          }}
                        >
                          Username <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ flex: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={form.username || ""}
                            onChange={(e) =>
                              handleChange("username", e.target.value)
                            }
                            error={!!validationErrors.username}
                            inputProps={{
                              style: { fontSize: 13, padding: "6px 8px" },
                            }}
                          />
                          {validationErrors.username && (
                            <div
                              style={{
                                color: C.errorRed,
                                fontSize: 11,
                                marginTop: 2,
                              }}
                            >
                              {validationErrors.username}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            width: 140,
                            flexShrink: 0,
                          }}
                        >
                          From Domain
                        </label>
                        <TextField
                          size="small"
                          fullWidth
                          value={form.from_domain || ""}
                          onChange={(e) =>
                            handleChange("from_domain", e.target.value)
                          }
                          inputProps={{
                            style: { fontSize: 13, padding: "6px 8px" },
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            width: 140,
                            flexShrink: 0,
                          }}
                        >
                          RegFail Retry <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ flex: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={form.ui_reg_fail_retry || ""}
                            onChange={(e) =>
                              handleChange("ui_reg_fail_retry", e.target.value)
                            }
                            error={!!validationErrors.ui_reg_fail_retry}
                            inputProps={{
                              style: { fontSize: 13, padding: "6px 8px" },
                            }}
                          />
                          {validationErrors.ui_reg_fail_retry && (
                            <div
                              style={{
                                color: C.errorRed,
                                fontSize: 11,
                                marginTop: 2,
                              }}
                            >
                              {validationErrors.ui_reg_fail_retry}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {form.ui_show_outbound_cid_name && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Outbound CID Name
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.ui_outbound_cid_name || ""}
                        onChange={(e) =>
                          handleChange("ui_outbound_cid_name", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>
                  )}

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Outbound CID Number
                    </label>
                    <TextField
                      size="small"
                      fullWidth
                      value={form.ui_outbound_cid_number || ""}
                      onChange={(e) =>
                        handleChange("ui_outbound_cid_number", e.target.value)
                      }
                      inputProps={{
                        style: { fontSize: 13, padding: "6px 8px" },
                      }}
                    />
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Record
                    </label>
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={form.ui_record || "No"}
                      onChange={(e) =>
                        handleChange("ui_record", e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      {SIP_REGISTER_YES_NO.map((c) => (
                        <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                          {c}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Enabled <span style={{ color: "red" }}>*</span>
                    </label>
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={form.ui_enabled || "Yes"}
                      onChange={(e) =>
                        handleChange("ui_enabled", e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      {SIP_REGISTER_YES_NO.map((c) => (
                        <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                          {c}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140,
                        flexShrink: 0,
                      }}
                    >
                      Eth Port <span style={{ color: "red" }}>*</span>
                    </label>
                    <MuiSelect
                      size="small"
                      fullWidth
                      value={form.ui_eth_port || "ETH0"}
                      onChange={(e) =>
                        handleChange("ui_eth_port", e.target.value)
                      }
                      sx={{ fontSize: 13 }}
                    >
                      {(ethPortOptions.length
                        ? ethPortOptions
                        : SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({
                            value: v,
                            label: v,
                          }))
                      ).map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        width: 140, // Consistent with your Checkbox label width
                        flexShrink: 0,
                      }}
                    >
                      Trunk IP/Domain <span style={{ color: "red" }}>*</span>
                    </label>
                    <div style={{ flex: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.provider || ""}
                        onChange={(e) =>
                          handleChange("provider", e.target.value)
                        }
                        error={!!validationErrors.provider}
                        placeholder="host:port or domain"
                        sx={{
                          "& .MuiInputBase-root": {
                            backgroundColor: "#fff", // Matches the white background style often used in your forms
                            fontSize: 13,
                          },
                        }}
                        inputProps={{
                          style: { padding: "6px 8px" },
                        }}
                      />
                    </div>
                  </div>

                  {form.ui_register === "Yes" && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            width: 140,
                            flexShrink: 0,
                          }}
                        >
                          Password <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ flex: 1 }}>
                          <TextField
                            size="small"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            value={form.password || ""}
                            onChange={(e) =>
                              handleChange("password", e.target.value)
                            }
                            error={!!validationErrors.password}
                            inputProps={{
                              style: { fontSize: 13, padding: "6px 8px" },
                            }}
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
                                      <VisibilityOff fontSize="small" />
                                    ) : (
                                      <Visibility fontSize="small" />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {validationErrors.password && (
                            <div
                              style={{
                                color: C.errorRed,
                                fontSize: 11,
                                marginTop: 2,
                              }}
                            >
                              {validationErrors.password}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            width: 140,
                            flexShrink: 0,
                          }}
                        >
                          Expire Seconds <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ flex: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={form.expire_in_sec || ""}
                            onChange={(e) =>
                              handleChange("expire_in_sec", e.target.value)
                            }
                            error={!!validationErrors.expire_in_sec}
                            inputProps={{
                              style: { fontSize: 13, padding: "6px 8px" },
                            }}
                          />
                          {validationErrors.expire_in_sec && (
                            <div
                              style={{
                                color: C.errorRed,
                                fontSize: 11,
                                marginTop: 2,
                              }}
                            >
                              {validationErrors.expire_in_sec}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            width: 140,
                            flexShrink: 0,
                          }}
                        >
                          Match Username <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ flex: 1 }}>
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={form.ui_match_username || "Yes"}
                            onChange={(e) =>
                              handleChange("ui_match_username", e.target.value)
                            }
                            error={!!validationErrors.ui_match_username}
                            sx={{ fontSize: 13 }}
                          >
                            {SIP_REGISTER_YES_NO.map((c) => (
                              <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                                {c}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                          {validationErrors.ui_match_username && (
                            <div
                              style={{
                                color: C.errorRed,
                                fontSize: 11,
                                marginTop: 2,
                              }}
                            >
                              {validationErrors.ui_match_username}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            width: 140,
                            flexShrink: 0,
                          }}
                        >
                          Enable Proxy
                        </label>
                        <Checkbox
                          checked={!!form.ui_enable_proxy}
                          onChange={(e) =>
                            handleChange("ui_enable_proxy", e.target.checked)
                          }
                          size="small"
                          sx={{
                            p: 0,
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      </div>

                      {form.ui_enable_proxy && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <label
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              width: 140,
                              flexShrink: 0,
                            }}
                          >
                            Proxy IP <span style={{ color: "red" }}>*</span>
                          </label>
                          <div style={{ flex: 1 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={form.ui_proxy_ip || ""}
                              onChange={(e) =>
                                handleChange("ui_proxy_ip", e.target.value)
                              }
                              error={!!validationErrors.ui_proxy_ip}
                              inputProps={{
                                style: { fontSize: 13, padding: "6px 8px" },
                              }}
                            />
                            {validationErrors.ui_proxy_ip && (
                              <div
                                style={{
                                  color: C.errorRed,
                                  fontSize: 11,
                                  marginTop: 2,
                                }}
                              >
                                {validationErrors.ui_proxy_ip}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CODEC TAB ── */}
          {modalTab === "codec" && (
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <p style={{ fontSize: 13, color: C.mutedText, marginBottom: 12 }}>
                Select codecs allowed on this trunk (required).
              </p>
              <FormGroup row sx={{ gap: 2 }}>
                {CODEC_OPTIONS.map((codec) => {
                  const isChecked = form.allow_codecs
                    ? form.allow_codecs
                        .split(",")
                        .map((c) => c.trim())
                        .includes(codec.value)
                    : false;
                  return (
                    <FormControlLabel
                      key={codec.value}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => {
                            const current = form.allow_codecs
                              ? form.allow_codecs
                                  .split(",")
                                  .map((c) => c.trim())
                              : [];
                            const next = e.target.checked
                              ? [...current, codec.value]
                              : current.filter((c) => c !== codec.value);
                            handleChange("allow_codecs", next.join(","));
                          }}
                          size="small"
                          sx={{
                            p: 0.5,
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      }
                      label={
                        <span style={{ fontSize: 13 }}>{codec.label}</span>
                      }
                      sx={{ m: 0 }}
                    />
                  );
                })}
              </FormGroup>
              {validationErrors.allow_codecs && (
                <div style={{ color: C.errorRed, fontSize: 11, marginTop: 12 }}>
                  {validationErrors.allow_codecs}
                </div>
              )}
            </div>
          )}

          {/* ── ADVANCE TAB ── */}
          {modalTab === "advance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* <div
                style={
                  { */}
              {/* // background: "#fff", // border: `1px solid ${C.cardBorder}`, //
              borderRadius: 6, // padding: 16, */}
              {/* }
                }
              > */}
              {/* <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.labelText,
                    marginBottom: 12,
                    borderBottom: `1px solid ${C.cardBorder}`,
                    paddingBottom: 6,
                  }}
                >
                  SIP Registration
                </h3> */}
              {/* <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "32px",
                  }}
                > */}
              {/* Left Column */}
              {/* <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  > */}
              {/* <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    > */}
              {/* <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        SIP Header
                      </label> */}
              {/* <div style={{ flex: 1 }}> */}
              {/* <TextField
                          size="small"
                          fullWidth
                          value={form.sip_header || ""}
                          onChange={(e) =>
                            handleChange("sip_header", e.target.value)
                          }
                          error={!!validationErrors.sip_header}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontSize: 12, color: C.mutedText }}
                                >
                                  sip:
                                </span>
                              </InputAdornment>
                            ),
                          }}
                          inputProps={{
                            style: { fontSize: 13, padding: "6px 8px" },
                          }}
                        /> */}
              {/* {validationErrors.sip_header && (
                          <div
                            style={{
                              color: C.errorRed,
                              fontSize: 11,
                              marginTop: 2,
                            }}
                          >
                            {validationErrors.sip_header}
                          </div>
                        )} */}
              {/* </div> */}
              {/* </div> */}
              {/* <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    > */}
              {/* <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Server Domain
                      </label> */}
              {/* <div style={{ flex: 1 }}> */}
              {/* <TextField
                          size="small"
                          fullWidth
                          value={form.server_domain || ""}
                          onChange={(e) =>
                            handleChange("server_domain", e.target.value)
                          }
                          error={!!validationErrors.server_domain}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontSize: 12, color: C.mutedText }}
                                >
                                  sip:
                                </span>
                              </InputAdornment>
                            ),
                          }}
                          inputProps={{
                            style: { fontSize: 13, padding: "6px 8px" },
                          }}
                        /> */}
              {/* {validationErrors.server_domain && (
                          <div
                            style={{
                              color: C.errorRed,
                              fontSize: 11,
                              marginTop: 2,
                            }}
                          >
                            {validationErrors.server_domain}
                          </div>
                        )} */}
              {/* </div> */}
              {/* </div> */}
              {/* <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    > */}
              {/* <label
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            width: 140,
                            flexShrink: 0,
                          }}
                        >
                          Client Domain
                        </label> */}
              {/* <div style={{ flex: 1 }}> */}
              {/* <TextField
                          size="small"
                          fullWidth
                          value={form.client_domain || ""}
                          onChange={(e) =>
                            handleChange("client_domain", e.target.value)
                          }
                          error={!!validationErrors.client_domain}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <span
                                  style={{ fontSize: 12, color: C.mutedText }}
                                >
                                  sip:
                                </span>
                              </InputAdornment>
                            ),
                          }}
                          inputProps={{
                            style: { fontSize: 13, padding: "6px 8px" },
                          }}
                        /> */}
              {/* {validationErrors.client_domain && (
                          <div
                            style={{
                              color: C.errorRed,
                              fontSize: 11,
                              marginTop: 2,
                            }}
                          >
                            {validationErrors.client_domain}
                          </div>
                        )} */}
              {/* </div> */}
              {/* </div> */}
              {/* </div> */}
              {/* Right Column */}
              {/* <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  > */}
              {/* <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    > */}
              {/* <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Outbound Proxy
                      </label> */}
              {/* <TextField
                        size="small"
                        fullWidth
                        value={form["Outbound Proxy"] || ""}
                        onChange={(e) =>
                          handleChange("Outbound Proxy", e.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <span
                                style={{ fontSize: 12, color: C.mutedText }}
                              >
                                sip:
                              </span>
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      /> */}
              {/* </div> */}
              {/* <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    > */}
              {/* <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Identifier IP
                      </label> */}
              {/* <div style={{ flex: 1 }}> */}
              {/* <TextField
                          size="small"
                          fullWidth
                          value={form.identity_ip || ""}
                          onChange={(e) =>
                            handleChange("identity_ip", e.target.value)
                          }
                          error={!!validationErrors.identity_ip}
                          inputProps={{
                            style: { fontSize: 13, padding: "6px 8px" },
                          }}
                        /> */}
              {/* {validationErrors.identity_ip && (
                          <div
                            style={{
                              color: C.errorRed,
                              fontSize: 11,
                              marginTop: 2,
                            }}
                          >
                            {validationErrors.identity_ip}
                          </div>
                        )} */}
              {/* </div> */}
              {/* </div> */}
              {/* </div> */}
              {/* </div> */}
              {/* </div> */}
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
                  VoIP Settings
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "32px",
                  }}
                >
                  {/* Left Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Get CalledID Type
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.ui_get_called_id_type || ""}
                        onChange={(e) =>
                          handleChange("ui_get_called_id_type", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        TX Volume
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.ui_tx_volume || ""}
                        onChange={(e) =>
                          handleChange("ui_tx_volume", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        From User
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.from_user || ""}
                        onChange={(e) =>
                          handleChange("from_user", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Send Privacy ID
                      </label>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_send_privacy_id || "No"}
                        onChange={(e) =>
                          handleChange("ui_send_privacy_id", e.target.value)
                        }
                        sx={{ fontSize: 13 }}
                      >
                        {SIP_REGISTER_YES_NO.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        OPTIONS Interval (s)
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.ui_options_interval || ""}
                        onChange={(e) =>
                          handleChange("ui_options_interval", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        RX Volume
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.ui_rx_volume || ""}
                        onChange={(e) =>
                          handleChange("ui_rx_volume", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        From Domain
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form["Domain name"] || ""}
                        onChange={(e) =>
                          handleChange("Domain name", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Sip Force Contact
                      </label>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_sip_force_contact || ""}
                        displayEmpty
                        onChange={(e) =>
                          handleChange("ui_sip_force_contact", e.target.value)
                        }
                        sx={{ fontSize: 13 }}
                      >
                        <MenuItem value="" sx={{ fontSize: 13 }}>
                          <em>—</em>
                        </MenuItem>
                        {SIP_REGISTER_YES_NO.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </div>
                  </div>
                </div>
              </div>
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
                  Outbound Parameters
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "32px",
                  }}
                >
                  {/* Left Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        P-Preferred-Identity
                      </label>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_p_preferred_identity || "None"}
                        onChange={(e) =>
                          handleChange(
                            "ui_p_preferred_identity",
                            e.target.value,
                          )
                        }
                        sx={{ fontSize: 13 }}
                      >
                        {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        P-Asserted-Identity
                      </label>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_p_asserted_identity || "None"}
                        onChange={(e) =>
                          handleChange("ui_p_asserted_identity", e.target.value)
                        }
                        sx={{ fontSize: 13 }}
                      >
                        {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </div>
                  </div>
                  {/* Right Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Remote-Party-ID
                      </label>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_remote_party_id || "None"}
                        onChange={(e) =>
                          handleChange("ui_remote_party_id", e.target.value)
                        }
                        sx={{ fontSize: 13 }}
                      >
                        {REMOTE_PARTY_ID_OPTIONS.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Contact
                      </label>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_contact_mode || "Trunk User Name"}
                        onChange={(e) =>
                          handleChange("ui_contact_mode", e.target.value)
                        }
                        sx={{ fontSize: 13 }}
                      >
                        {CONTACT_MODE_OPTIONS.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </div>
                  </div>
                </div>
              </div>
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
                  Other Settings
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "32px",
                  }}
                >
                  {/* Left Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Limit Max Calls
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.ui_limit_max_calls || ""}
                        onChange={(e) =>
                          handleChange("ui_limit_max_calls", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Enable Early Session
                      </label>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_enable_early_session || "No"}
                        onChange={(e) =>
                          handleChange(
                            "ui_enable_early_session",
                            e.target.value,
                          )
                        }
                        sx={{ fontSize: 13 }}
                      >
                        {SIP_REGISTER_YES_NO.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Enable Early Media
                      </label>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_enable_early_media || "No"}
                        onChange={(e) =>
                          handleChange("ui_enable_early_media", e.target.value)
                        }
                        sx={{ fontSize: 13 }}
                      >
                        {SIP_REGISTER_YES_NO.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        User Phone
                      </label>
                      <Checkbox
                        checked={!!form.ui_user_phone}
                        onChange={(e) =>
                          handleChange("ui_user_phone", e.target.checked)
                        }
                        size="small"
                        sx={{
                          p: 0,
                          color: C.accent,
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    </div>
                  </div>
                  {/* Right Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Call Timeout(s)
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.ui_call_timeout || ""}
                        onChange={(e) =>
                          handleChange("ui_call_timeout", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        DTMF Transmit Mode
                      </label>
                      <MuiSelect
                        size="small"
                        fullWidth
                        value={form.ui_dtmf_transmit || "RFC2833"}
                        onChange={(e) =>
                          handleChange("ui_dtmf_transmit", e.target.value)
                        }
                        sx={{ fontSize: 13 }}
                      >
                        {SIP_REGISTER_DTMF_OPTIONS.map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: 13 }}>
                            {c}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        Max Call Duration (s)
                      </label>
                      <TextField
                        size="small"
                        fullWidth
                        value={form.ui_max_call_duration || ""}
                        onChange={(e) =>
                          handleChange("ui_max_call_duration", e.target.value)
                        }
                        inputProps={{
                          style: { fontSize: 13, padding: "6px 8px" },
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          width: 140,
                          flexShrink: 0,
                        }}
                      >
                        DNIS
                      </label>
                      <Checkbox
                        checked={!!form.ui_dnis}
                        onChange={(e) =>
                          handleChange("ui_dnis", e.target.checked)
                        }
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

                {form.ui_dnis && (
                  <div
                    style={{
                      marginTop: 16,
                      background: "#f8fafc",
                      padding: 12,
                      borderRadius: 6,
                      border: `1px solid ${C.cardBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.labelText,
                        }}
                      >
                        DNIS Settings
                      </span>
                      <Btn
                        onClick={() =>
                          setDnisRows((r) => [
                            ...r,
                            { dnisNumber: "", dnisName: "", replaceCid: "No" },
                          ])
                        }
                        variant="outline"
                        style={{ padding: "2px 6px" }}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </Btn>
                    </div>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr>
                          <TH
                            style={{
                              textAlign: "left",
                              fontSize: 11,
                              background: "transparent",
                            }}
                          >
                            DNIS Number
                          </TH>
                          <TH
                            style={{
                              textAlign: "left",
                              fontSize: 11,
                              background: "transparent",
                            }}
                          >
                            DNIS Name
                          </TH>
                          <TH
                            style={{
                              textAlign: "left",
                              fontSize: 11,
                              background: "transparent",
                            }}
                          >
                            Replace CID
                          </TH>
                        </tr>
                      </thead>
                      <tbody>
                        {dnisRows.map((row, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: `1px solid ${C.cardBorder}`,
                            }}
                          >
                            <td style={{ padding: "6px 8px" }}>
                              <TextField
                                size="small"
                                fullWidth
                                value={row.dnisNumber}
                                onChange={(e) =>
                                  setDnisRows((prev) =>
                                    prev.map((x, j) =>
                                      j === i
                                        ? { ...x, dnisNumber: e.target.value }
                                        : x,
                                    ),
                                  )
                                }
                                inputProps={{
                                  style: { fontSize: 12, padding: "4px 6px" },
                                  sx: { background: "#fff" },
                                }}
                              />
                            </td>
                            <td style={{ padding: "6px 8px" }}>
                              <TextField
                                size="small"
                                fullWidth
                                value={row.dnisName}
                                onChange={(e) =>
                                  setDnisRows((prev) =>
                                    prev.map((x, j) =>
                                      j === i
                                        ? { ...x, dnisName: e.target.value }
                                        : x,
                                    ),
                                  )
                                }
                                inputProps={{
                                  style: { fontSize: 12, padding: "4px 6px" },
                                  sx: { background: "#fff" },
                                }}
                              />
                            </td>
                            <td style={{ padding: "6px 8px" }}>
                              <MuiSelect
                                size="small"
                                fullWidth
                                value={row.replaceCid || "No"}
                                onChange={(e) =>
                                  setDnisRows((prev) =>
                                    prev.map((x, j) =>
                                      j === i
                                        ? { ...x, replaceCid: e.target.value }
                                        : x,
                                    ),
                                  )
                                }
                                sx={{ fontSize: 12, background: "#fff" }}
                              >
                                {SIP_REGISTER_YES_NO.map((c) => (
                                  <MenuItem
                                    key={c}
                                    value={c}
                                    sx={{ fontSize: 12 }}
                                  >
                                    {c}
                                  </MenuItem>
                                ))}
                              </MuiSelect>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DOD TAB ── */}
          {modalTab === "dod" && (
            <div
              style={{
                background: "#fff",
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Btn onClick={handleOpenDodAddModal} variant="default">
                  + Add DOD
                </Btn>
                <Btn
                  onClick={() => {
                    if (!dodSelected.length)
                      return showMessage("error", "Select DOD rows to delete");
                    setDodRows((rows) =>
                      rows.filter((_, i) => !dodSelected.includes(i)),
                    );
                    setDodSelected([]);
                  }}
                  disabled={!dodSelected.length}
                  variant="danger"
                >
                  Delete Selected
                </Btn>
                <Btn
                  onClick={() => showMessage("info", "Import is not connected")}
                  variant="outline"
                >
                  Import
                </Btn>
                <Btn
                  onClick={() => showMessage("info", "Export is not connected")}
                  variant="outline"
                >
                  Export
                </Btn>
              </div>

              <div
                style={{
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <TH style={{ width: 36 }}>
                        <Checkbox
                          size="small"
                          checked={
                            dodRows.length > 0 &&
                            dodSelected.length === dodRows.length
                          }
                          onChange={(e) =>
                            setDodSelected(
                              e.target.checked ? dodRows.map((_, i) => i) : [],
                            )
                          }
                          sx={{
                            p: 0,
                            color: C.accent,
                            "&.Mui-checked": { color: C.accent },
                          }}
                        />
                      </TH>
                      <TH style={{ textAlign: "left" }}>DOD Number</TH>
                      <TH style={{ textAlign: "left" }}>DOD Name</TH>
                      <TH style={{ textAlign: "left" }}>Bind Extension</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {dodRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            textAlign: "center",
                            padding: 24,
                            fontSize: 12,
                            color: C.mutedText,
                          }}
                        >
                          No DOD entries. Click Add DOD.
                        </td>
                      </tr>
                    ) : (
                      dodRows.map((row, i) => (
                        <tr
                          key={i}
                          style={{ borderBottom: `1px solid ${C.cardBorder}` }}
                        >
                          <td style={{ textAlign: "center", padding: 4 }}>
                            <Checkbox
                              size="small"
                              checked={dodSelected.includes(i)}
                              onChange={() =>
                                setDodSelected((s) =>
                                  s.includes(i)
                                    ? s.filter((x) => x !== i)
                                    : [...s, i],
                                )
                              }
                              sx={{
                                p: 0,
                                color: C.accent,
                                "&.Mui-checked": { color: C.accent },
                              }}
                            />
                          </td>
                          <td style={{ padding: "6px 8px" }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={row.dodNumber}
                              onChange={(e) =>
                                setDodRows((r) =>
                                  r.map((x, j) =>
                                    j === i
                                      ? { ...x, dodNumber: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                              inputProps={{
                                style: { fontSize: 13, padding: "4px 6px" },
                              }}
                            />
                          </td>
                          <td style={{ padding: "6px 8px" }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={row.dodName}
                              onChange={(e) =>
                                setDodRows((r) =>
                                  r.map((x, j) =>
                                    j === i
                                      ? { ...x, dodName: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                              inputProps={{
                                style: { fontSize: 13, padding: "4px 6px" },
                              }}
                            />
                          </td>
                          <td style={{ padding: "6px 8px" }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={
                                Array.isArray(row.bindExtensions)
                                  ? row.bindExtensions.join(", ")
                                  : row.bindExtension || ""
                              }
                              onChange={(e) => {
                                const raw = e.target.value || "";
                                setDodRows((r) =>
                                  r.map((x, j) =>
                                    j === i
                                      ? {
                                          ...x,
                                          bindExtensions: raw
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter(Boolean),
                                          bindExtension: raw,
                                        }
                                      : x,
                                  ),
                                );
                              }}
                              inputProps={{
                                style: { fontSize: 13, padding: "4px 6px" },
                              }}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ADAPT TAB ── */}
          {modalTab === "adapt" && (
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
                }}
              >
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: C.labelText }}
                >
                  Adapt Caller ID
                </span>
                <Btn
                  onClick={() =>
                    setAdaptRows((r) => [
                      ...r,
                      { matchMode: "", strip: "", prepend: "" },
                    ])
                  }
                  variant="outline"
                  style={{ padding: "2px 8px" }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </Btn>
              </div>
              <div
                style={{
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <TH style={{ textAlign: "left" }}>Match Mode</TH>
                      <TH style={{ textAlign: "left" }}>Strip</TH>
                      <TH style={{ textAlign: "left" }}>Prepend</TH>
                    </tr>
                  </thead>
                  <tbody>
                    {adaptRows.map((row, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: `1px solid ${C.cardBorder}` }}
                      >
                        <td style={{ padding: "6px 8px" }}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Match"
                            value={row.matchMode}
                            onChange={(e) =>
                              setAdaptRows((r) =>
                                r.map((x, j) =>
                                  j === i
                                    ? { ...x, matchMode: e.target.value }
                                    : x,
                                ),
                              )
                            }
                            inputProps={{
                              style: { fontSize: 13, padding: "4px 6px" },
                            }}
                          />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Strip"
                            value={row.strip}
                            onChange={(e) =>
                              setAdaptRows((r) =>
                                r.map((x, j) =>
                                  j === i ? { ...x, strip: e.target.value } : x,
                                ),
                              )
                            }
                            inputProps={{
                              style: { fontSize: 13, padding: "4px 6px" },
                            }}
                          />
                        </td>
                        <td style={{ padding: "6px 8px" }}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Prepend"
                            value={row.prepend}
                            onChange={(e) =>
                              setAdaptRows((r) =>
                                r.map((x, j) =>
                                  j === i
                                    ? { ...x, prepend: e.target.value }
                                    : x,
                                ),
                              )
                            }
                            inputProps={{
                              style: { fontSize: 13, padding: "4px 6px" },
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              : editIndex != null
                ? "Update Trunk"
                : "Save Trunk"}
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

      {/* ── DOD Add Sub-Modal ── */}
      <Dialog
        open={showDodAddModal}
        onClose={() => setShowDodAddModal(false)}
        maxWidth="sm"
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
          Add DOD Rule
        </DialogTitle>
        <DialogContent style={{ padding: 20, backgroundColor: C.pageBg }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                width: 100,
                flexShrink: 0,
              }}
            >
              DOD Name <span style={{ color: "red" }}>*</span>
            </label>
            <TextField
              size="small"
              fullWidth
              value={dodAddName}
              onChange={(e) => setDodAddName(e.target.value)}
              inputProps={{
                style: { fontSize: 13, padding: "6px 8px", background: "#fff" },
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                width: 100,
                flexShrink: 0,
              }}
            >
              DOD Number <span style={{ color: "red" }}>*</span>
            </label>
            <TextField
              size="small"
              fullWidth
              value={dodAddNumber}
              onChange={(e) => setDodAddNumber(e.target.value)}
              inputProps={{
                style: { fontSize: 13, padding: "6px 8px", background: "#fff" },
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 40px 1fr",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.labelText,
                  marginBottom: 6,
                }}
              >
                Available
              </div>
              <select
                multiple
                value={dodAvailableSelected}
                onChange={(e) =>
                  setDodAvailableSelected(
                    Array.from(e.target.selectedOptions, (o) => o.value),
                  )
                }
                style={{
                  width: "100%",
                  height: 180,
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 4,
                  padding: 8,
                  fontSize: 13,
                  outline: "none",
                  background: "#fff",
                }}
              >
                {!dodHasLoadedExtensionsRef.current ? (
                  <option disabled>Loading...</option>
                ) : dodAvailableList.length === 0 ? (
                  <option disabled>No extensions</option>
                ) : (
                  dodAvailableList.map((t) => (
                    <option key={t.value} value={t.value}>
                      {getDodExtLabel(t.value)}
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
                onClick={dodAddSelectedMembers}
                variant="outline"
                style={{ padding: "4px 0", fontSize: 12 }}
              >
                &gt;
              </Btn>
              <Btn
                onClick={dodAddAllMembers}
                variant="outline"
                style={{ padding: "4px 0", fontSize: 12 }}
              >
                &gt;&gt;
              </Btn>
              <Btn
                onClick={dodRemoveSelectedMembers}
                variant="outline"
                style={{ padding: "4px 0", fontSize: 12 }}
              >
                &lt;
              </Btn>
              <Btn
                onClick={dodRemoveAllMembers}
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
                  color: C.labelText,
                  marginBottom: 6,
                }}
              >
                Selected
              </div>
              <select
                multiple
                value={dodChosenSelected}
                onChange={(e) =>
                  setDodChosenSelected(
                    Array.from(e.target.selectedOptions, (o) => o.value),
                  )
                }
                style={{
                  width: "100%",
                  height: 180,
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 4,
                  padding: 8,
                  fontSize: 13,
                  outline: "none",
                  background: "#fff",
                }}
              >
                {dodMemberExtensions.length === 0 ? (
                  <option disabled>None selected</option>
                ) : (
                  dodMemberExtensions.map((id) => (
                    <option key={id} value={id}>
                      {getDodExtLabel(id)}
                    </option>
                  ))
                )}
              </select>
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
            onClick={handleConfirmDodAdd}
            variant="default"
            style={{ padding: "8px 24px" }}
          >
            Confirm
          </Btn>
          <Btn
            onClick={() => setShowDodAddModal(false)}
            variant="outline"
            style={{ padding: "8px 24px" }}
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
          Import SIP Trunks
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

export default SipRegisterPage;
