import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  SIP_TRUNK_FIELDS,
  SIP_TRUNK_INITIAL_FORM,
  TRUNK_CODEC_OPTIONS,
} from "../constants/SipTrunkConstants";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  C,
  SystemSettingsBtn,
  SystemSettingsTH,
  systemSettingsTdStyle,
  systemSettingsCheckboxSx,
  systemSettingsSelectedBadgeStyle,
  systemSettingsPageWrapStyle,
  systemSettingsInnerStyle,
  systemSettingsCardStyle,
  systemSettingsToolbarStyle,
  systemSettingsPaginationStyle,
  systemSettingsPageBadgeStyle,
  SystemSettingsBreadcrumb,
  SYSTEM_SETTINGS_CARD_RADIUS,
} from "../sections/system/systemSettingsTableUi";
import {
  systemModalFieldInputStyle,
  systemModalSelectSx,
  inputInteraction,
} from "../sections/system/systemSharedUi";
import {
  listGlobalSipSettings,
  createGlobalSipSettings,
  updateGlobalSipSettings,
  deleteGlobalSipSettings,
  fetchSystemInfo,
} from "../api/apiService";

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

  const tableScrollRef = useRef(null);

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
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(registers.map((_, idx) => idx));
    } else {
      setSelected([]);
    }
  };

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

  const pagedStart = (page - 1) * itemsPerPage;

  return (
    <div style={systemSettingsPageWrapStyle}>
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

      <div style={systemSettingsInnerStyle}>
        <SystemSettingsBreadcrumb current="Global SIP" />

        <div style={systemSettingsCardStyle}>
          <div style={systemSettingsToolbarStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selected.length > 0 && (
                <span style={systemSettingsSelectedBadgeStyle}>
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
              <SystemSettingsBtn
                variant="cancel"
                onClick={handleDelete}
                disabled={selected.length === 0 || loading.delete}
                style={{ height: 30 }}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {loading.delete ? "Working..." : "Delete"}
              </SystemSettingsBtn>
              <SystemSettingsBtn
                variant="cancel"
                onClick={handleClearAll}
                disabled={registers.length === 0 || loading.delete}
                style={{ height: 30 }}
              >
                {loading.delete ? "Working..." : "Clear All"}
              </SystemSettingsBtn>
              <SystemSettingsBtn
                variant="primary"
                onClick={() => handleOpenModal()}
                disabled={loading.save}
                style={{ height: 30 }}
              >
                + Add New
              </SystemSettingsBtn>
            </div>
          </div>

          <div
            ref={tableScrollRef}
            className="overflow-x-auto w-full"
            style={
              loading.fetch || registers.length === 0
                ? {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 240,
                    padding: 24,
                    textAlign: "center",
                  }
                : {
                    overflowX: "auto",
                    overflowY: "auto",
                    width: "100%",
                  }
            }
          >
            {loading.fetch ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: C.labelText,
                  fontSize: 13,
                }}
              >
                <CircularProgress size={20} />
                <span>Loading Global SIP settings...</span>
              </div>
            ) : registers.length === 0 ? (
              <>
                <div
                  style={{
                    color: "#3E5475",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No Global SIP settings configured!
                </div>
                <SystemSettingsBtn
                  onClick={() => handleOpenModal()}
                  variant="cancel"
                  disabled={loading.save}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New
                </SystemSettingsBtn>
              </>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr>
                    <SystemSettingsTH
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
                        checked={
                          registers.length > 0 &&
                          selected.length === registers.length
                        }
                        indeterminate={
                          selected.length > 0 &&
                          selected.length < registers.length
                        }
                        onChange={handleSelectAll}
                        disabled={loading.delete}
                        sx={systemSettingsCheckboxSx}
                      />
                    </SystemSettingsTH>
                    {visibleTableFields.map((field) => (
                      <SystemSettingsTH
                        key={field.name}
                        style={{ position: "sticky", top: 0, zIndex: 10 }}
                      >
                        {field.label}
                      </SystemSettingsTH>
                    ))}
                    <SystemSettingsTH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      Modify
                    </SystemSettingsTH>
                  </tr>
                </thead>
                <tbody>
                  {pagedRegisters.map((reg, idx) => {
                    const realIdx = pagedStart + idx;
                    const isLastRow = idx === pagedRegisters.length - 1;
                    const isRowChecked = selected.includes(realIdx);
                    const rowBg = isRowChecked
                      ? "#f0f9ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};

                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...systemSettingsTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            width: 36,
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? {
                                  borderBottomLeftRadius:
                                    SYSTEM_SETTINGS_CARD_RADIUS,
                                }
                              : {}),
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isRowChecked}
                            onChange={() => handleSelectRow(realIdx)}
                            disabled={loading.delete}
                            sx={systemSettingsCheckboxSx}
                          />
                        </td>
                        {visibleTableFields.map((field) => (
                          <td
                            key={field.name}
                            style={{
                              ...systemSettingsTdStyle,
                              background: rowBg,
                              ...lastRowCellStyle,
                            }}
                          >
                            {field.name === "index"
                              ? pagedStart + idx + 1
                              : renderCellValue(field, reg)}
                          </td>
                        ))}
                        <td
                          style={{
                            ...systemSettingsTdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                            ...(isLastRow
                              ? {
                                  borderBottomRightRadius:
                                    SYSTEM_SETTINGS_CARD_RADIUS,
                                }
                              : {}),
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
                              onClick={() =>
                                !loading.delete &&
                                handleOpenModal(reg, realIdx)
                              }
                              style={{
                                cursor: loading.delete
                                  ? "not-allowed"
                                  : "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: loading.delete ? 0.5 : 0.7,
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

          {registers.length > 0 && (
            <div style={systemSettingsPaginationStyle}>
              <span style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.2 }}>
                Showing {registers.length} record
                {registers.length !== 1 ? "s" : ""}
              </span>
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <SystemSettingsBtn
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                  >
                    ← Prev
                  </SystemSettingsBtn>
                  <span style={systemSettingsPageBadgeStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <SystemSettingsBtn
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    variant="outline"
                  >
                    Next →
                  </SystemSettingsBtn>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 560,
            maxWidth: "95vw",
            mx: "auto",
            borderRadius: "8px",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            backgroundColor: "#ffffff",
            backgroundImage: "none",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "16px",
            color: "#ffffff",
            backgroundColor: "#1e2d42",
            borderBottom: `1px solid ${C.cardBorder}`,
            px: 3,
            py: 2,
            textAlign: "center",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            flexShrink: 0,
          }}
        >
          {editIndex !== null ? "Edit Global SIP" : "Add Global SIP"}
        </DialogTitle>
        <DialogContent
          sx={{
            p: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: 20,
              marginTop: 8,
            }}
          >
            {SIP_TRUNK_FIELDS.map((field) => {
              // id is auto-assigned by API; no need to expose it in the form
              if (field.name === "index") return null;
              // Skip rendering "Working Period Text" as a separate field - it's handled within "Working Period"
              if (field.name === "working_period_text") return null;

              // Handle conditional fields
              if (field.conditionalField) {
                const { dependsOn, value } = field.conditionalField;
                if (form[dependsOn] !== value) return null;
              }
              const selectOptions =
                field.name === "local_ip"
                  ? localIpOptions
                  : field.options || [];

              return (
                <div
                  key={field.name}
                  style={{
                    display: "flex",
                    alignItems:
                      field.type === "checkbox" && field.name === "allow_codecs"
                        ? "flex-start"
                        : "center",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.labelText,
                      width: 170,
                      flexShrink: 0,
                      textAlign: "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {field.label}:
                  </label>
                  <div
                    style={{
                      width: "min(100%, 320px)",
                      display: "flex",
                      flex: 1,
                    }}
                  >
                    {field.type === "select" ? (
                      <div className="w-full">
                        <MuiSelect
                          value={form[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          displayEmpty
                          fullWidth
                          sx={{
                            ...systemModalSelectSx,
                            borderRadius: "4px",
                            fontSize: 13,
                          }}
                        >
                          {selectOptions.map((option) => (
                            <MenuItem
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                              sx={{ fontSize: 13 }}
                            >
                              {option.label}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                        {validationErrors[field.name] && (
                          <div className="text-red-500 text-xs mt-1">
                            {validationErrors[field.name]}
                          </div>
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
                                  onChange={(e) =>
                                    handleCodecChange(
                                      codec.value,
                                      e.target.checked,
                                    )
                                  }
                                  size="small"
                                  sx={systemSettingsCheckboxSx}
                                />
                              }
                              label={codec.label}
                              sx={{
                                margin: 0,
                                "& .MuiFormControlLabel-label": {
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "#374151",
                                },
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
                              if (e.target.checked) {
                                handleChange("working_period_text", "24 Hour");
                              } else {
                                handleChange("working_period_text", "");
                              }
                            }}
                            size="small"
                            sx={systemSettingsCheckboxSx}
                          />
                          <input
                            type="text"
                            value={form.working_period_text || ""}
                            onChange={(e) =>
                              handleChange(
                                "working_period_text",
                                e.target.value,
                              )
                            }
                            placeholder="24 Hour"
                            disabled={!form[field.name]}
                            style={{
                              ...systemModalFieldInputStyle,
                              flex: 1,
                              opacity: form[field.name] ? 1 : 0.6,
                            }}
                            {...inputInteraction}
                          />
                        </div>
                      ) : field.name === "sip_agent" ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={form[field.name] || false}
                            onChange={(e) =>
                              handleChange(field.name, e.target.checked)
                            }
                            size="small"
                            sx={systemSettingsCheckboxSx}
                          />
                          <span style={{ fontSize: 13, color: C.labelText }}>
                            Enable
                          </span>
                        </div>
                      ) : (
                        <Checkbox
                          checked={form[field.name] || false}
                          onChange={(e) =>
                            handleChange(field.name, e.target.checked)
                          }
                          size="small"
                          sx={systemSettingsCheckboxSx}
                        />
                      )
                    ) : field.type === "password" ? (
                      <div className="w-full">
                        <TextField
                          type={showPassword ? "text" : "password"}
                          value={form[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors[field.name]}
                          placeholder="Enter password"
                          inputProps={{
                            style: {
                              ...systemModalFieldInputStyle,
                              padding: "0 8px",
                            },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": { height: 32 },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={togglePasswordVisibility}
                                  edge="end"
                                  size="small"
                                  sx={{ padding: "2px" }}
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
                        {validationErrors[field.name] && (
                          <div className="text-red-500 text-xs mt-1">
                            {validationErrors[field.name]}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full">
                        <input
                          type="text"
                          value={form[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          disabled={field.name === "index"}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          style={{
                            ...systemModalFieldInputStyle,
                            width: "100%",
                            borderColor: validationErrors[field.name]
                              ? "#dc2626"
                              : systemModalFieldInputStyle.border,
                          }}
                          {...inputInteraction}
                        />
                        {validationErrors[field.name] && (
                          <div className="text-red-500 text-xs mt-1">
                            {validationErrors[field.name]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
            py: "10px",
            px: "16px",
            borderTop: `1px solid ${C.cardBorder}`,
            backgroundColor: "#f8fafc",
            flexShrink: 0,
          }}
        >
          <SystemSettingsBtn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            {loading.save ? "Saving..." : "Save"}
          </SystemSettingsBtn>
          <SystemSettingsBtn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13 }}
          >
            Close
          </SystemSettingsBtn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipTrunkPage;
