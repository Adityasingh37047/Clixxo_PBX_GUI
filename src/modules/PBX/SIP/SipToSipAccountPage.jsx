import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  FormControl,
  Select as MuiSelect,
  MenuItem,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { CODEC_OPTIONS } from "../../../constants/SipAccountConstants";
import {
  SIP_TO_SIP_FIELDS,
  SIP_TO_SIP_TABLE_COLUMNS,
  SIP_TO_SIP_INITIAL_FORM,
} from "../../../constants/SipToSipAccountConstants";
import { fetchSipAccounts } from "../../../api/apiService";
import {
  fetchSipIpTrunkAccounts,
  createSipIpTrunkAccount,
  updateSipIpTrunkAccount,
  deleteSipIpTrunkAccount,
  listGroups,
} from "../../../api/apiService";

// ── Color Palette ─────────────────────────────────────────────────────────────
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

const Btn = ({ children, onClick, disabled, variant = "default", style: extraStyle, title }) => {
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
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
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
        padding: "6px 14px",
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
        if (!disabled) e.currentTarget.style.opacity = "0.85";
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

const SipToSipAccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [pjsipExtensions, setPjsipExtensions] = useState(new Set());
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [form, setForm] = useState(SIP_TO_SIP_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const hasInitialLoadRef = useRef(false);

  const showMessageFn = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadData();
    }
  }, []);

  const isCodecSelected = (codec) => {
    if (!form.allow_codecs) return false;
    return form.allow_codecs
      .split(",")
      .map((c) => c.trim())
      .includes(codec);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const transformList = (list) => {
    const sorted = [...list].sort(
      (a, b) => (parseInt(a.extension) || 0) - (parseInt(b.extension) || 0),
    );
    return sorted.map((it, i) => ({
      index: i.toString(),
      extension: it.extension,
      context: it.context,
      allow_codecs: it.codecs,
      password: it.password,
      contact: it.contact,
      from_domain: it.from_domain || it["Domain name"] || "",
      contact_user: it.contact_user || it["Contact User"] || "",
      outbound_proxy: it.outbound_proxy || it["Outbound Proxy"] || "",
      status: it.status || "",
    }));
  };

  const transformUiToApi = (uiData) => ({
    extension: uiData.extension,
    context: uiData.context,
    allow_codecs: uiData.allow_codecs,
    password: uiData.password,
    contact:
      uiData.contact && String(uiData.contact).trim().startsWith("sip:")
        ? uiData.contact
        : `sip:${String(uiData.contact || "").trim()}`,
    from_domain: uiData.from_domain,
    contact_user: uiData.contact_user,
    outbound_proxy: uiData.outbound_proxy,
  });

  const loadData = async () => {
    if (loading.fetch) return;
    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      const [resIpTrunk, resPjsip] = await Promise.allSettled([
        fetchSipIpTrunkAccounts(),
        fetchSipAccounts(),
      ]);
      if (
        resIpTrunk.status === "fulfilled" &&
        resIpTrunk.value?.response &&
        Array.isArray(resIpTrunk.value.message)
      ) {
        setAccounts(transformList(resIpTrunk.value.message));
      } else {
        setAccounts([]);
      }
      if (
        resPjsip.status === "fulfilled" &&
        resPjsip.value?.response &&
        Array.isArray(resPjsip.value.message)
      ) {
        const extSet = new Set(
          resPjsip.value.message.map((r) => String(r.extension)),
        );
        setPjsipExtensions(extSet);
      } else {
        setPjsipExtensions(new Set());
      }
    } catch (e) {
      showMessageFn("error", e.message || "Failed to load accounts");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  const handleOpenModal = (row = null, idx = null) => {
    if (row && idx !== null) {
      setForm({ ...SIP_TO_SIP_INITIAL_FORM, ...row });
      setEditIndex(idx);
    } else {
      setForm(SIP_TO_SIP_INITIAL_FORM);
      setEditIndex(null);
    }
    setValidationErrors({}); // Clear validation errors when opening modal
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowPassword(false); // Reset password visibility when closing modal
    setValidationErrors({}); // Clear validation errors when closing modal
  };

  // Validation functions
  const validateExtension = (extension) => {
    if (!extension || extension.trim() === "") {
      return "Extension is required";
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password || password.trim() === "") {
      return "Password is required";
    }
    return null;
  };

  const validateContext = (context) => {
    if (!context || context.trim() === "") {
      return "Context is required";
    }
    return null;
  };

  const validateAllowCodecs = (allowCodecs) => {
    if (!allowCodecs || allowCodecs.trim() === "") {
      return "Allow Codecs is required";
    }
    return null;
  };

  const validateContact = (contact) => {
    if (!contact || String(contact).trim() === "") {
      return "Contact is required";
    }
    // Allow user to type IP like 10.191.15.1 or full sip:10.191.15.1
    const contactRegex = /^(?:sip:)?(?:\d{1,3}\.){3}\d{1,3}$/;
    if (!contactRegex.test(String(contact).trim())) {
      return "Contact must be like '10.150.18.10' or 'sip:10.150.18.10'";
    }
    return null;
  };

  const validateDomainName = (domainName) => {
    if (!domainName || domainName.trim() === "") {
      return "Domain Name is required";
    }
    return null;
  };

  const validateContactUser = (contactUser) => {
    if (!contactUser || contactUser.trim() === "") {
      return "Contact User is required";
    }
    return null;
  };

  const validateOutboundProxy = (outboundProxy) => {
    if (!outboundProxy || outboundProxy.trim() === "") {
      return "Outbound Proxy is required";
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};

    const extensionError = validateExtension(form.extension);
    if (extensionError) errors.extension = extensionError;

    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;

    const contextError = validateContext(form.context);
    if (contextError) errors.context = contextError;

    const allowCodecsError = validateAllowCodecs(form.allow_codecs);
    if (allowCodecsError) errors.allow_codecs = allowCodecsError;

    const contactError = validateContact(form.contact);
    if (contactError) errors.contact = contactError;

    const domainNameError = validateDomainName(form.from_domain);
    if (domainNameError) errors.from_domain = domainNameError;

    const contactUserError = validateContactUser(form.contact_user);
    if (contactUserError) errors.contact_user = contactUserError;

    const outboundProxyError = validateOutboundProxy(form.outbound_proxy);
    if (outboundProxyError) errors.outbound_proxy = outboundProxyError;

    return errors;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    // Real-time validation for specific fields
    let error = null;
    switch (key) {
      case "extension":
        error = validateExtension(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "context":
        error = validateContext(value);
        break;
      case "contact":
        error = validateContact(value);
        break;
      default:
        break;
    }

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
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

      const newCodecsString = newCodecs.join(",");

      // Clear validation error for allow_codecs when user changes codecs
      if (validationErrors.allow_codecs) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.allow_codecs;
          return newErrors;
        });
      }

      // Real-time validation
      const codecError = validateAllowCodecs(newCodecsString);
      if (codecError) {
        setValidationErrors((prev) => ({ ...prev, allow_codecs: codecError }));
      }

      return { ...prev, allow_codecs: newCodecsString };
    });
  };

  const handleSave = async () => {
    // Comprehensive validation
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      // Show the first validation error
      const firstError = Object.values(validationErrors)[0];
      showMessageFn("error", firstError);
      setValidationErrors(validationErrors);
      return;
    }

    // Duplicate extension across classic PJSIP
    if (pjsipExtensions.has(String(form.extension))) {
      showMessageFn(
        "error",
        "This extension already exists in SIP Account. Choose a different extension.",
      );
      return;
    }
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const payload = transformUiToApi(form);
      const resp =
        editIndex !== null
          ? await updateSipIpTrunkAccount(payload)
          : await createSipIpTrunkAccount(payload);
      if (resp?.response) {
        showMessageFn("success", resp.message || "Saved");
        await new Promise((r) => setTimeout(r, 600));
        await loadData();
        setShowModal(false);
        setEditIndex(null);
      } else {
        showMessageFn("error", resp?.message || "Failed to save");
      }
    } catch (e) {
      showMessageFn("error", e.message || "Failed to save");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async (indices) => {
    if (!indices || indices.length === 0) return;
    if (
      !window.confirm(
        "Are you sure you want to delete the selected account(s)?",
      )
    ) {
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      // Fetch SIP trunk groups to block deletion when referenced as trunkId/extension
      let groupRefList = [];
      try {
        const grpRes = await listGroups();
        groupRefList = (grpRes && (grpRes.message || grpRes.data)) || [];
      } catch {}

      const referencedExtensions = new Set(
        groupRefList
          .map((g) => g?.sip_trunk_id)
          .filter(Boolean)
          .map((v) => String(v))
          .map((v) => (v.includes("/") ? v.split("/")[1] : null))
          .filter(Boolean),
      );

      const ops = indices.map((i) => {
        const ext = accounts[i].extension;
        if (referencedExtensions.has(String(ext))) {
          alert(
            `Cannot delete extension ${ext} because it is used in SIP Trunk Group (e.g., trunkId/${ext}). Delete or modify the SIP Trunk Group first.`,
          );
          return { skipped: true };
        }
        return deleteSipIpTrunkAccount(ext);
      });

      const results = await Promise.allSettled(ops);
      const success = results.filter(
        (r) => r.status === "fulfilled" && r.value?.response,
      ).length;
      if (success > 0)
        showMessageFn("success", `${success} account(s) deleted`);
      await loadData();
    } catch (e) {
      showMessageFn("error", e.message || "Delete failed");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleClearAll = async () => {
    if (accounts.length === 0) {
      showMessageFn("info", "No accounts to clear");
      return;
    }
    if (
      !window.confirm(
        "Are you sure you want to delete ALL SIP To SIP accounts? This action cannot be undone.",
      )
    ) {
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      // Block deletion for any extension referenced by SIP Trunk Group
      let groupRefList = [];
      try {
        const grpRes = await listGroups();
        groupRefList = (grpRes && (grpRes.message || grpRes.data)) || [];
      } catch {}
      const referencedExtensions = new Set(
        groupRefList
          .map((g) => g?.sip_trunk_id)
          .filter(Boolean)
          .map((v) => String(v))
          .map((v) => (v.includes("/") ? v.split("/")[1] : null))
          .filter(Boolean),
      );

      const deletables = accounts.filter(
        (acc) => !referencedExtensions.has(String(acc.extension)),
      );
      const blocked = accounts.length - deletables.length;
      if (blocked > 0) {
        alert(
          `${blocked} account(s) are referenced in SIP Trunk Group and were not deleted. Please remove references first.`,
        );
      }

      const results = await Promise.allSettled(
        deletables.map((acc) => deleteSipIpTrunkAccount(acc.extension)),
      );
      const success = results.filter(
        (r) => r.status === "fulfilled" && r.value?.response,
      ).length;
      if (success > 0)
        showMessageFn("success", `All ${success} account(s) deleted`);
      setSelected([]);
      await loadData();
    } catch (e) {
      showMessageFn("error", e.message || "Clear all failed");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(accounts.length / itemsPerPage));
  const pagedAccounts = accounts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
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

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
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
            PBX &rsaquo; SIP &rsaquo;{" "}
            <span style={{ color: "#1e293b", fontWeight: 600 }}>
              SIP To SIP Account
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
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
              borderBottom: `1px solid ${C.cardBorder}`,
              background: "#ffffff",
              flexWrap: "wrap",
              gap: 8,
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
                onClick={() => setSelected(accounts.map((_, i) => i))}
                disabled={loading.delete}
                variant="outline"
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
                onClick={() => setSelected([])}
                disabled={loading.delete}
                variant="outline"
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
                onClick={() => setSelected((sel) => accounts.map((_, i) => (sel.includes(i) ? null : i)).filter((i) => i !== null))}
                disabled={loading.delete}
                variant="outline"
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
                onClick={() => handleDelete(selected)}
                disabled={loading.delete || selected.length === 0}
                variant="danger"
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#dc2626" }} />
                )}
                🗑 Delete
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete}
                variant="outline"
                style={{
                  background: "#cbd5e1",
                  color: "#374151",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                }}
              >
                Clear All
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
              }}
            >
              <thead>
                <tr>
                  <TH style={{ width: 36 }}>
                    <Checkbox
                      size="small"
                      checked={selected.length > 0 && selected.length === accounts.length}
                      indeterminate={
                        selected.length > 0 && selected.length < accounts.length
                      }
                      onChange={
                        selected.length === accounts.length
                          ? () => setSelected([])
                          : () => setSelected(accounts.map((_, i) => i))
                      }
                      disabled={loading.delete}
                      sx={{
                        padding: "1px",
                        color: "#64748b",
                        "&.Mui-checked": { color: C.accent },
                      }}
                    />
                  </TH>
                  {SIP_TO_SIP_TABLE_COLUMNS.map((col) => (
                    <TH key={col.key}>{col.label}</TH>
                  ))}
                  <TH style={{ width: 70 }}>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {loading.fetch ? (
                  <tr>
                    <td
                      colSpan={SIP_TO_SIP_TABLE_COLUMNS.length + 2}
                      style={{ textAlign: "center", padding: "48px 0" }}
                    >
                      <CircularProgress size={28} style={{ color: C.accent }} />
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={SIP_TO_SIP_TABLE_COLUMNS.length + 2}
                      style={{
                        textAlign: "center",
                        padding: "36px 0",
                        color: C.mutedText,
                        fontSize: 13,
                      }}
                    >
                      No accounts found.
                    </td>
                  </tr>
                ) : (
                  pagedAccounts.map((item, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSel = selected.includes(realIdx);
                    const rowBg = isSel
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: rowBg,
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSel) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSel) e.currentTarget.style.background = rowBg;
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
                            checked={isSel}
                            onChange={() => setSelected((sel) => (sel.includes(realIdx) ? sel.filter((i) => i !== realIdx) : [...sel, realIdx]))}
                            disabled={loading.delete}
                            sx={{
                              padding: "1px",
                              color: "#64748b",
                              "&.Mui-checked": { color: C.accent },
                            }}
                          />
                        </td>
                        {SIP_TO_SIP_TABLE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              padding: "10px 14px",
                              textAlign: "center",
                              fontSize: 13,
                              color: C.valueText,
                              borderRight: "1px solid #f1f5f9",
                              fontWeight: col.key === "extension" ? 600 : 400,
                            }}
                          >
                            {col.key === "password"
                              ? "*".repeat(item.password?.length || 0)
                              : item[col.key] || "--"}
                          </td>
                        ))}
                        <td style={{ textAlign: "center", padding: "7px 8px" }}>
                          <EditDocumentIcon
                            className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                            titleAccess="Edit"
                            onClick={() => handleOpenModal(item, realIdx)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          {!loading.fetch && accounts.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderTop: `0.5px solid ${C.cardBorder}`,
                background: "#ffffff",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, color: C.mutedText }}>
                Showing {pagedAccounts.length} records on page {page}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
        className="z-50"
        PaperProps={{ sx: { width: 700, maxWidth: "95vw", mx: "auto", borderRadius: 2 } }}
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
          {editIndex !== null ? "Edit SIP To SIP Account" : "Add SIP To SIP Account"}
        </DialogTitle>
        <DialogContent
          style={{
            padding: "20px 24px",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                SIP Account Info
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 32px",
                }}
              >
            {SIP_TO_SIP_FIELDS.map((field) => (
              <div
                key={field.name}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.labelText,
                    width: 120,
                    flexShrink: 0,
                  }}
                >
                  {field.label} <span style={{ color: C.errorRed }}>*</span>
                </label>
                <div className="flex-1">
                  {field.type === "password" ? (
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
                        placeholder="Enter password"
                        error={!!validationErrors[field.name]}
                        inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
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
                  ) : field.type === "checkbox" ? (
                    <div className="w-full">
                      <FormGroup row sx={{ gap: 1 }}>
                        {CODEC_OPTIONS.map((codec) => (
                          <FormControlLabel
                            key={codec.value}
                            control={
                              <Checkbox
                                checked={isCodecSelected(codec.value)}
                                onChange={(e) => handleCodecChange(codec.value, e.target.checked)}
                                size="small"
                                sx={{ padding: "1px", "& .MuiSvgIcon-root": { fontSize: 16 } }}
                              />
                            }
                            label={codec.label}
                            sx={{
                              margin: 0,
                              "& .MuiFormControlLabel-label": { fontSize: 12, fontWeight: 500, color: "#374151" },
                            }}
                          />
                        ))}
                      </FormGroup>
                      {validationErrors.allow_codecs && (
                        <div className="text-red-500 text-xs mt-1">
                          {validationErrors.allow_codecs}
                        </div>
                      )}
                    </div>
                  ) : field.name === "context" ? (
                    <div className="w-full">
                      <FormControl fullWidth size="small" error={!!validationErrors.context}>
                        <MuiSelect
                          value={form.context || ""}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("context", e.target.value)
                          }
                          inputProps={{ "aria-label": "Select Context" }}
                          sx={{ fontSize: 13 }}
                        >
                          <MenuItem value="" disabled sx={{ fontSize: 13 }}><em>Select Context</em></MenuItem>
                          {Array.from({ length: 10 }, (_, i) => `sip${i + 1}`).map((ctx) => (
                            <MenuItem key={ctx} value={ctx}>
                              {ctx}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                      {validationErrors.context && (
                        <div className="text-red-500 text-xs mt-1">
                          {validationErrors.context}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full">
                      {field.name === "contact" ? (
                        <TextField
                          type="text"
                          value={form.contact ? String(form.contact).replace(/^sip:/, "") : ""}
                          onChange={(e) =>
                            handleChange("contact", e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors.contact}
                          placeholder="e.g., 15.158.34.15"
                          disabled={field.name === "extension" && editIndex !== null}
                          inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">sip:</InputAdornment>,
                          }}
                        />
                      ) : (
                        <TextField
                          type="text"
                          value={form[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors[field.name]}
                          placeholder={
                            field.name === "extension"
                              ? "e.g., 1001"
                              : field.name === "from_domain"
                                ? "e.g., sip.domain.in"
                                : field.name === "contact_user"
                                  ? "e.g., +91XXXXXXXXXX"
                                  : field.name === "outbound_proxy"
                                    ? "e.g., 15.158.34.15"
                                    : `Enter ${field.label.toLowerCase()}`
                          }
                          disabled={field.name === "extension" && editIndex !== null}
                          inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
                        />
                      )}
                      {validationErrors[field.name] && (
                        <div className="text-red-500 text-xs mt-1">
                          {validationErrors[field.name]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
            variant="contained"
            disabled={loading.save}
            style={{
              padding: "8px 28px",
              fontSize: 13,
              background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
              color: "#fff",
              border: "1px solid #5A6F8F",
              boxShadow: "0 2px 8px #3E5475",
            }}
          >
            {loading.save ? (
              <CircularProgress size={14} style={{ color: "#fff", marginRight: 8 }} />
            ) : null}
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="outlined"
            disabled={loading.save}
            style={{
              background: "#cbd5e1",
              color: "#374151",
              border: "1px solid #cbd5e1",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
              padding: "8px 28px",
              fontSize: 13,
            }}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipToSipAccountPage;
