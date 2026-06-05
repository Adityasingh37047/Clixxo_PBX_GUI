import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  SIP_TRUNK_FIELDS,
  SIP_TRUNK_INITIAL_FORM,
  TRUNK_CODEC_OPTIONS,
} from "../constants/SipTrunkConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
} from "@mui/material";
import {
  listGlobalSipSettings,
  createGlobalSipSettings,
  updateGlobalSipSettings,
  deleteGlobalSipSettings,
  fetchSystemInfo,
} from "../api/apiService";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#64748b",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  disableHover = false,
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
cancel: {
background: "#cbd5e1",
color: "#374151",
border: "1px solid #cbd5e1",
boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
},
    outline: {
      background: C.cardBg,
color: C.labelText,
border: `1px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `1px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `1px solid ${C.cardBorder}`,
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
        return "#e2e8f0";
      case "outline":
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s ease",
        height:30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => { // This logic is slightly different from DisaPage.jsx, but matches the original siptrunkpage.jsx behavior.
        if (!disabled && !disableHover) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !disableHover) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </button>
  );
};
const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
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

const FieldRow = ({ label, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 180,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const SipTrunkPage = () => {
  // State
  const [registers, setRegisters] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_TRUNK_INITIAL_FORM);
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
  const [localIpOptions, setLocalIpOptions] = useState([
    { value: "lan1-unavailable", label: "LAN 1 (Unavailable)", disabled: true },
    { value: "lan2-unavailable", label: "LAN 2 (Unavailable)", disabled: true },
    { value: "0.0.0.0", label: "Any LAN (0.0.0.0)" },
  ]);

  // Scroll state for custom horizontal scrollbar
  const tableScrollRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    left: 0,
    width: 0,
    scrollWidth: 0,
  });
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);

  // Fields to hide from the table
  const HIDDEN_TABLE_FIELDS = [
    "working_period_text",
    "sip_agent",
    "username",
    "password",
    "allow_codecs",
    "working_period",
    "vos11_rtp_encryptkey",
    "encrypt_key",
    "external_bound_address",
    "external_bound_port",
  ];
  const visibleTableFields = useMemo(
    () =>
      SIP_TRUNK_FIELDS.filter(
        (field) => !HIDDEN_TABLE_FIELDS.includes(field.name),
      ),
    [],
  );
  const visibleFieldsCount = visibleTableFields.length;
  const buildFormStateFromSettings = (settings = {}) => {
    const base = { ...SIP_TRUNK_INITIAL_FORM };
    if (settings.id !== undefined && settings.id !== null) {
      base.index = String(settings.id);
    }
    if (settings.description) {
      base.description =
        String(settings.description).trim() || base.description;
    }
    if (settings.local_ip !== undefined) {
      base.local_ip = String(settings.local_ip).trim();
    }
    if (settings.local_port !== undefined) {
      base.local_port = String(settings.local_port);
    }
    if (settings.transport_mode) {
      base.transport_mode = String(settings.transport_mode).toUpperCase();
    }
    base.local_ip = base.local_ip || SIP_TRUNK_INITIAL_FORM.local_ip;
    base.local_port = base.local_port || SIP_TRUNK_INITIAL_FORM.local_port;
    base.transport_mode =
      base.transport_mode || SIP_TRUNK_INITIAL_FORM.transport_mode;

    return base;
  };

  const renderCellValue = (field, row) => {
    const raw = row[field.name];
    if (raw === undefined || raw === null || raw === "") return "--";
    if (field.name === "local_ip") {
      const match = localIpOptions.find((option) => option.value === raw);
      if (match) return match.label;
    }
    if (field.type === "select" && Array.isArray(field.options)) {
      const match = field.options.find((option) => option.value === raw);
      return match ? match.label : raw;
    }
    return raw;
  };

  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(registers.length / itemsPerPage));
  const pagedRegisters = registers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const fetchGlobalSipSettings = async () => {
    try {
      setLoading((prev) => ({ ...prev, fetch: true }));
      const payload = await listGlobalSipSettings();
      const list = payload?.message?.sip_settings;
      if (Array.isArray(list) && list.length > 0) {
        const rows = list.map((s) => ({
          ...buildFormStateFromSettings(s),
          id: s.id,
        }));
        setRegisters(rows);
      } else {
        setRegisters([]);
      }
    } catch (error) {
      console.error("Failed to fetch global SIP settings", error);
      setRegisters([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      fetchGlobalSipSettings();
      const loadLocalIps = async () => {
        const ensureCurrentValue = (options) => {
          if (!form.local_ip) return options;
          if (options.some((opt) => opt.value === form.local_ip))
            return options;
          return [...options, { value: form.local_ip, label: form.local_ip }];
        };
        try {
          const si = await fetchSystemInfo();
          const details = si?.details || si?.responseData || {};
          let rawInterfaces = [];
          if (Array.isArray(details.LAN_INTERFACES)) {
            rawInterfaces = details.LAN_INTERFACES;
          } else if (
            details.LAN_INTERFACES &&
            typeof details.LAN_INTERFACES === "object"
          ) {
            rawInterfaces = Object.entries(details.LAN_INTERFACES).map(
              ([name, data]) => ({ name, data }),
            );
          } else if (Array.isArray(details.interfaces)) {
            rawInterfaces = details.interfaces;
          } else if (
            details.network &&
            Array.isArray(details.network.interfaces)
          ) {
            rawInterfaces = details.network.interfaces;
          }

          const toIp = (dataObj) => {
            if (!dataObj || typeof dataObj !== "object") return "";
            for (const val of Object.values(dataObj)) {
              if (
                typeof val === "string" &&
                /^(\d{1,3}\.){3}\d{1,3}$/.test(val)
              )
                return val;
              if (Array.isArray(val)) {
                for (const inner of val) {
                  if (
                    typeof inner === "string" &&
                    /^(\d{1,3}\.){3}\d{1,3}$/.test(inner)
                  )
                    return inner;
                }
              }
            }
            return "";
          };

          let lan1 = "";
          let lan2 = "";
          (rawInterfaces || []).forEach((iface) => {
            const name = iface && iface.name ? String(iface.name) : "";
            const data = iface?.data || iface;
            if (name === "eth0" || name === "LAN 1") lan1 = toIp(data) || lan1;
            if (name === "eth1" || name === "LAN 2") lan2 = toIp(data) || lan2;
          });

          const orderedOptions = [];
          orderedOptions.push({
            value: lan1 || "lan1-unavailable",
            label: lan1 ? `LAN 1 (${lan1})` : "LAN 1 (Unavailable)",
            disabled: !lan1,
          });
          orderedOptions.push({
            value: lan2 || "lan2-unavailable",
            label: lan2 ? `LAN 2 (${lan2})` : "LAN 2 (Unavailable)",
            disabled: !lan2,
          });
          orderedOptions.push({ value: "0.0.0.0", label: "Any LAN (0.0.0.0)" });

          setLocalIpOptions(ensureCurrentValue(orderedOptions));
        } catch (error) {
          console.warn("Failed to load system info for LAN IPs", error);
          setLocalIpOptions(
            ensureCurrentValue([
              {
                value: "lan1-unavailable",
                label: "LAN 1 (Unavailable)",
                disabled: true,
              },
              {
                value: "lan2-unavailable",
                label: "LAN 2 (Unavailable)",
                disabled: true,
              },
              { value: "0.0.0.0", label: "Any LAN (0.0.0.0)" },
            ]),
          );
        }
      };
      loadLocalIps();
    }
  }, []);

  useEffect(() => {
    if (!form.local_ip) return;
    setLocalIpOptions((prev) => {
      if (prev.some((opt) => opt.value === form.local_ip)) return prev;
      return [...prev, { value: form.local_ip, label: form.local_ip }];
    });
  }, [form.local_ip]);

  // Update scroll state when data changes
  useEffect(() => {
    const update = () => {
      if (tableScrollRef.current) {
        const el = tableScrollRef.current;
        setScrollState({
          left: el.scrollLeft,
          width: el.clientWidth,
          scrollWidth: el.scrollWidth,
        });
        setShowCustomScrollbar(el.scrollWidth > el.clientWidth);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [registers, page]);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm(buildFormStateFromSettings(row));
      setEditIndex(idx);
    } else {
      setForm({ ...SIP_TRUNK_INITIAL_FORM });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setShowPassword(false);
    setValidationErrors({});
  };

  // Form handling
  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
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
      let newCodecs;

      if (checked) {
        // Add codec if not already present
        if (!currentCodecs.includes(codec)) {
          newCodecs = [...currentCodecs, codec];
        } else {
          newCodecs = currentCodecs;
        }
      } else {
        // Remove codec
        newCodecs = currentCodecs.filter((c) => c !== codec);
      }

      return { ...prev, allow_codecs: newCodecs.join(",") };
    });
  };

  const isCodecSelected = (codec) => {
    if (!form.allow_codecs) return false;
    const currentCodecs = form.allow_codecs.split(",").map((c) => c.trim());
    return currentCodecs.includes(codec);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSave = async () => {
    setLoading((prev) => ({ ...prev, save: true }));

    const safeTrim = (val, fallback = "") => {
      const value = val === undefined || val === null ? fallback : val;
      return String(value).trim();
    };

    const resolveLocalIp = () => {
      const current = safeTrim(form.local_ip, "0.0.0.0");
      if (current === "lan1-unavailable" || current === "lan2-unavailable") {
        return current === "lan1-unavailable"
          ? localIpOptions.find(
              (opt) => opt.label?.includes("LAN 1") && !opt.disabled,
            )?.value || "0.0.0.0"
          : localIpOptions.find(
              (opt) => opt.label?.includes("LAN 2") && !opt.disabled,
            )?.value || "0.0.0.0";
      }
      return current || "0.0.0.0";
    };

    const isEditing = editIndex !== null;
    const settingsPayload = {
      ...(isEditing ? { id: Number(form.index) } : {}),
      description: safeTrim(form.description) || undefined,
      local_ip: resolveLocalIp(),
      local_port: safeTrim(form.local_port, "5060") || "5060",
      transport_mode:
        safeTrim(form.transport_mode, "UDP").toUpperCase() || "UDP",
    };

    try {
      const fn = isEditing ? updateGlobalSipSettings : createGlobalSipSettings;
      const response = await fn(settingsPayload);
      if (response?.response) {
        showMessage(
          "success",
          `${response?.message || (isEditing ? "Entry updated" : "Entry created")}. SIP service will restart briefly.`,
        );
        await fetchGlobalSipSettings();
        setShowModal(false);
        setEditIndex(null);
      } else {
        showMessage("error", response?.message || "Save failed");
      }
    } catch (error) {
      showMessage("error", error?.message || "Failed to save settings");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Table selection logic
  const handleSelectRow = (idx) => {
    setSelected((sel) =>
      sel.includes(idx) ? sel.filter((i) => i !== idx) : [...sel, idx],
    );
  };
  const handleCheckAll = () => setSelected(registers.map((_, idx) => idx));
  const handleUncheckAll = () => setSelected([]);
  const handleInverse = () =>
    setSelected(
      registers
        .map((_, idx) => (selected.includes(idx) ? null : idx))
        .filter((i) => i !== null),
    );

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select trunks to delete");
      return;
    }
    if (!window.confirm(`Delete ${selected.length} SIP trunk(s)?`)) return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      for (const realIdx of selected) {
        const row = registers[realIdx];
        if (row?.id != null) await deleteGlobalSipSettings(row.id);
      }
      showMessage(
        "success",
        `${selected.length} trunk(s) deleted. SIP service will restart briefly.`,
      );
      setSelected([]);
      await fetchGlobalSipSettings();
    } catch (error) {
      showMessage("error", error?.message || "Delete failed");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (registers.length === 0) {
      showMessage("info", "No trunks to clear");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete ALL SIP trunks? This action cannot be undone.",
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const totalCount = registers.length;
      for (const row of registers) {
        if (row?.id != null) await deleteGlobalSipSettings(row.id);
      }
      setSelected([]);
      setPage(1);
      await fetchGlobalSipSettings();
      showMessage(
        "success",
        `All ${totalCount} trunk(s) deleted. SIP service will restart briefly.`,
      );
    } catch (error) {
      showMessage("error", error?.message || "Failed to clear all trunks");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  // Scroll handling functions
  const handleTableScroll = (e) =>
    setScrollState({
      left: e.target.scrollLeft,
      width: e.target.clientWidth,
      scrollWidth: e.target.scrollWidth,
    });
  const handleScrollbarDrag = (e) => {
    const track = e.target.parentNode;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft =
        (scrollState.scrollWidth - scrollState.width) * percent;
  };
  const handleArrowClick = (dir) => {
    if (tableScrollRef.current)
      tableScrollRef.current.scrollLeft += dir === "left" ? -100 : 100;
  };

  // Calculate scrollbar thumb dimensions
  const thumbWidth =
    scrollState.width && scrollState.scrollWidth
      ? Math.max(
          40,
          (scrollState.width / scrollState.scrollWidth) *
            (scrollState.width - 8),
        )
      : 40;
  const thumbLeft =
    scrollState.width &&
    scrollState.scrollWidth &&
    scrollState.scrollWidth > scrollState.width
      ? (scrollState.left / (scrollState.scrollWidth - scrollState.width)) *
        (scrollState.width - thumbWidth - 16)
      : 0;

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      {/* Message Display */}
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

      {/* Main Content */}
      <div className="w-full" style={{ maxWidth: "100%" }}>
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>PBX</span>
          <span>&gt;</span>
          <span>SIP</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            SIP Trunk
          </span>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
            boxShadow: C.cardShadow,
            marginBottom: 24,
            border: `1.5px solid ${C.cardBorder}`,
          }}
        >
          {/* Toolbar */}
          <div
            style={{
              minHeight: 44,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderBottom: `1px solid ${C.cardBorder}`,
              background: C.cardBg,
              borderTopLeftRadius: CARD_RADIUS,
              borderTopRightRadius: CARD_RADIUS,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Btn
                onClick={handleCheckAll}
                disabled={loading.delete}
                variant="outline"
                disableHover
                  style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                Check All
              </Btn>
              <Btn
                onClick={handleUncheckAll}
                disabled={loading.delete}
                variant="outline"
                disableHover
                  style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                Uncheck All
              </Btn>
              <Btn
                onClick={handleInverse}
                disabled={loading.delete}
                variant="outline"
                disableHover
                  style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}  
              >
                Inverse
              </Btn>
              <Btn
                onClick={handleDelete}
                disabled={loading.delete || selected.length === 0}
                variant="danger"
                disableHover
                  style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#fff" }} />
                )}
                 <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn onClick={handleClearAll} disabled={loading.delete} variant="cancel"
              >

                Clear All
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                variant="primary"
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table Container */}
          <div style={{ overflow: "hidden", width: "100%" }}>
            <div
              style={{
                overflowX: "auto",
                overflowY: "auto",
                flex: 1,
                width: "100%",
              }}
            >
              <div
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                className="scrollbar-hide"
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: 360,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
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
                        style={{ width: 40, padding: 0, borderLeft: "none" }}
                      >
                        <Checkbox
                          size="small"
                          checked={selected.length === pagedRegisters.length && pagedRegisters.length > 0}
                          indeterminate={selected.length > 0 && selected.length < pagedRegisters.length}
                          onChange={() => (selected.length === pagedRegisters.length ? handleUncheckAll() : handleCheckAll())}
                          sx={checkboxSx}
                        />
                      </TH>
                      {visibleTableFields.map((field) => (
                        <TH key={field.name}>{field.label}</TH>
                      ))}
                      <th
                        className="bg-white text-[#222] font-semibold text-[15px] border border-gray-300 text-center"
                        style={{
                          border: "1px solid #bbb",
                          padding: "6px 8px",
                          minHeight: 32,
                            whiteSpace: "nowrap",
                        }}
                      >
                        Modify
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.fetch ? (
                      <tr style={{ minHeight: 120 }}>
                        <td
                          colSpan={visibleFieldsCount + 2}
                          className="border border-gray-300 px-2 py-4 text-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <CircularProgress size={20} />
                            <span>Loading trunks...</span>
                          </div>
                        </td>
                      </tr>
                    ) : registers.length === 0 ? (
                      <tr style={{ minHeight: 120 }}>
                        <td
                          colSpan={visibleFieldsCount + 2}
                          className="border border-gray-300 px-2 py-1 text-center"
                        >
                          No data
                        </td>
                      </tr>
                    ) : (
                      pagedRegisters.map((reg, idx) => {
                        const realIdx = (page - 1) * itemsPerPage + idx;
                        const isSelected = selected.includes(realIdx);
                        const isLastRow = idx === pagedRegisters.length - 1;
                        const rowBg = isSelected
                          ? "#f0f9ff"
                          : idx % 2 === 1
                            ? "#f8fafc"
                            : "#ffffff";

                        return (
                          <tr
                            key={realIdx}
                            style={{
                              background: rowBg,
                              transition: "background 0.15s ease",
                              borderBottom: `1px solid ${C.cardBorder}`,
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = "#f1f5f9";
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = rowBg;
                            }}>
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                borderLeft: "none",
                                borderBottom: isLastRow ? "none" : `1px solid ${C.cardBorder}`,
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={selected.includes(realIdx)}
                                onChange={() => handleSelectRow(realIdx)}
                                disabled={loading.delete}
                              />
                            </td>
                            {visibleTableFields.map((field) => (
                              <td
                                key={field.name}
                                style={{
                                  ...tdStyle,
                                  background: rowBg,
                                  borderBottom: isLastRow ? "none" : `1px solid ${C.cardBorder}`,
                                }}
                              >
                                {field.name === "index"
                                  ? (page - 1) * itemsPerPage + idx + 1
                                  : renderCellValue(field, reg)}
                              </td>
                            ))}
                            <td
                              style={{
                                ...tdStyle,
                                background: rowBg,
                                borderRight: "none", // This is already part of tdStyle
                                borderBottom: isLastRow ? "none" : `1px solid ${C.cardBorder}`,
                              }}
                            >
                              <EditDocumentIcon
                                className={`cursor-pointer text-blue-600 mx-auto ${loading.delete ? "opacity-50" : ""}`}
                                onClick={() =>
                                  !loading.delete &&
                                  handleOpenModal(reg, realIdx)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Custom scrollbar row below the table */}
            {showCustomScrollbar && (
              <div
                style={{
                  width: "100%",
                  margin: "0 auto",
                  background: "#f4f6fa",
                  display: "flex",
                  alignItems: "center",
                  height: 24,
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                  border: "none",
                  borderTop: "none",
                  padding: "0 4px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    background: "#e3e7ef",
                    border: "1px solid #bbb",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: "#888",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => handleArrowClick("left")}
                >
                  &#9664;
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 12,
                    background: "#e3e7ef",
                    borderRadius: 8,
                    position: "relative",
                    margin: "0 4px",
                    overflow: "hidden",
                  }}
                  onClick={handleScrollbarDrag}
                >
                  <div
                    style={{
                      position: "absolute",
                      height: 12,
                      background: "#888",
                      borderRadius: 8,
                      cursor: "pointer",
                      top: 0,
                      width: thumbWidth,
                      left: thumbLeft,
                    }}
                    draggable
                    onDrag={handleScrollbarDrag}
                  />
                </div>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    background: "#e3e7ef",
                    border: "1px solid #bbb",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: "#888",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => handleArrowClick("right")}
                >
                  &#9654;
                </div>
              </div>
            )}
          </div>

          {/* Footer Pagination */}
          {!loading.fetch && registers.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#ffffff",
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedRegisters.length} records on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  variant="outline"
                >
                  First
                </Btn>
                <Btn
                  onClick={() => handlePageChange(page - 1)}
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
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next →
                </Btn>
                <Btn
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        PaperProps={{
          sx: {
            maxWidth: "95vw",
            mx: "auto",
            p: 0,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
        disableRestoreFocus
        disableEnforceFocus
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
          {editIndex !== null ? "Edit SIP Trunk" : "Add SIP Trunk"}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "20px 24px",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#f5f7fa",
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
                SIP Trunk Info
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 32px",
                }}
              >
                {SIP_TRUNK_FIELDS.map((field) => {
                  if (field.name === "index") return null;
                  if (field.name === "working_period_text") return null;
                  if (field.conditionalField) {
                    const { dependsOn, value } = field.conditionalField;
                    if (form[dependsOn] !== value) return null;
                  }
                  const selectOptions = field.name === "local_ip" ? localIpOptions : field.options || [];

                  return (
                    <FieldRow key={field.name} label={`${field.label}:`}>
                      {field.type === "select" ? (
                        <div className="w-full">
                          <FormControl fullWidth size="small" variant="outlined">
                            <MuiSelect
                              value={form[field.name] || ""}
                              onChange={(e) => handleChange(field.name, e.target.value)}
                              displayEmpty
                              sx={{ fontSize: 13, backgroundColor: "#fff" }}
                            >
                              {selectOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                          {validationErrors[field.name] && (
                            <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>
                          )}
                        </div>
                      ) : field.type === "checkbox" ? (
                        field.name === "allow_codecs" ? (
                          <FormGroup row sx={{ gap: 1 }}>
                            {TRUNK_CODEC_OPTIONS.map((codec) => (
                              <FormControlLabel
                                key={codec.value}
                                control={
                                  <Checkbox
                                    checked={isCodecSelected(codec.value)}
                                    onChange={(e) => handleCodecChange(codec.value, e.target.checked)}
                                    size="small"
                                    sx={checkboxSx}
                                  />
                                }
                                label={codec.label}
                                sx={{
                                  margin: 0,
                                  "& .MuiFormControlLabel-label": { fontSize: 13, fontWeight: 500, color: "#374151" },
                                }}
                              />
                            ))}
                          </FormGroup>
                        ) : field.name === "working_period" ? (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={form[field.name] || false}
                              onChange={(e) => {
                                handleChange(field.name, e.target.checked);
                                if (e.target.checked) handleChange("working_period_text", "24 Hour");
                                else handleChange("working_period_text", "");
                              }}
                              size="small"
                              sx={checkboxSx}
                            />
                            <TextField
                              type="text"
                              value={form["working_period_text"] || ""}
                                  onChange={(e) =>
                                handleChange("working_period_text", e.target.value)
                                  }
                                  size="small"
                              fullWidth
                              variant="outlined"
                              placeholder="24 Hour"
                              inputProps={{ style: { fontSize: 13, padding: "6px 8px", backgroundColor: "#fff" } }}
                              disabled={!form[field.name]}
                            />
                          </div>
                        ) : field.name === "sip_agent" ? (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={form[field.name] || false}
                              onChange={(e) => handleChange(field.name, e.target.checked)}
                              size="small"
                              sx={checkboxSx}
                            />
                            <span style={{ fontSize: 13, color: "#666" }}>Enable</span>
                          </div>
                        ) : (
                          <Checkbox
                            checked={form[field.name] || false}
                            onChange={(e) => handleChange(field.name, e.target.checked)}
                            size="small"
                            sx={checkboxSx}
                          />
                        )
                      ) : field.type === "password" ? (
                        <div className="w-full">
                          <TextField
                            type={showPassword ? "text" : "password"}
                            value={form[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            size="small"
                            fullWidth
                            variant="outlined"
                            error={!!validationErrors[field.name]}
                            placeholder="Enter password"
                            inputProps={{ style: { fontSize: 13, padding: "6px 8px", backgroundColor: "#fff" } }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={togglePasswordVisibility} edge="end" size="small">
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {validationErrors[field.name] && <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>}
                        </div>
                      ) : (
                        <div className="w-full">
                          <TextField
                            type="text"
                            value={form[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            size="small"
                            fullWidth
                            variant="outlined"
                            error={!!validationErrors[field.name]}
                            disabled={field.name === "index"}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            inputProps={{ style: { fontSize: 13, padding: "6px 8px", backgroundColor: "#fff" } }}
                          />
                          {validationErrors[field.name] && <div className="text-red-500 text-xs mt-1">{validationErrors[field.name]}</div>}
                        </div>
                      )}
                    </FieldRow>
                  );
                })}
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
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save && (
              <CircularProgress size={14} style={{ color: "#fff", marginRight: 8 }} />
            )}
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33 }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipTrunkPage;
