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
  SIP_TO_SIP_FORM_LAYOUT,
} from "../../../constants/SipToSipAccountConstants";
import { fetchSipAccounts } from "../../../api/apiService";
import {
  fetchSipIpTrunkAccounts,
  createSipIpTrunkAccount,
  updateSipIpTrunkAccount,
  deleteSipIpTrunkAccount,
  listGroups,
} from "../../../api/apiService";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
// ── Local page UI (inlined from e1PriSharedUi)
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  errorRed: "#ef4444",
  amber: "#dc2626",
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DEFAULT = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#3E5475] border-[#9CA3AF] hover:bg-[#e2e8f0]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;

const btnVariantCls = {
  default: BTN_DEFAULT,
  primary: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#fef2f2] text-[#dc2626] border-[0.5px] border-[#fecaca] hover:bg-[#fca5a5]`,
};

const Btn = ({ children, onClick, disabled, variant = "default", className = "", style, type, title }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={style}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

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
      position: "sticky",
      top: 0,
      zIndex: 10,
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

const E1_PAGE = "bg-[#f8fafc] min-h-[calc(100vh-80px)] p-[16px]";
const E1_INNER = "w-full max-w-full mx-auto";
const E1_CARD =
  "overflow-hidden rounded-[10px] border-[1.5px] border-[#9CA3AF] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]";
const E1_TOOLBAR =
  "flex min-h-[44px] flex-wrap items-center justify-between gap-[12px] border-b border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-t-[20px]";
const E1_TOOLBAR_LEFT = "flex flex-wrap items-center gap-[8px]";
const E1_TOOLBAR_ACTIONS = "flex flex-wrap items-center gap-[8px]";
const E1_SELECTED_BADGE =
  "rounded-full border border-[#3E5475] bg-[#eff6ff] px-[12px] py-[5px] text-[11px] font-bold text-[#3E5475]";
const E1_PAGINATION =
  "flex items-center justify-between overflow-hidden border-t border-[#9CA3AF] bg-white px-[14px] py-[7px] rounded-b-[20px]";
const E1_PAGE_BADGE =
  "rounded-[6px] border border-[#9CA3AF] bg-[#e0f2fe] px-[14px] py-[5px] text-[11px] font-semibold text-[#3E5475]";
const E1_TOAST_SX = {
  position: "fixed",
  top: 20,
  right: 20,
  zIndex: 9999,
  minWidth: 300,
  boxShadow: 3,
};

const modalInputProps = {
  style: { fontSize: 13, height: 32, padding: "0 8px", boxSizing: "border-box" },
};

const e1DialogTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  padding: "16px 24px",
  textAlign: "center",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const e1DialogContentStyle = { padding: "24px", backgroundColor: "#ffffff" };

const e1DialogFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: "1px solid #9CA3AF",
  borderRadius: 8,
  padding: 20,
};

const e1DialogFieldRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
};

const e1DialogFieldLabelStyle = {
  fontSize: 13,
  color: "#3E5475",
  fontWeight: 600,
  whiteSpace: "nowrap",
  width: 170,
  lineHeight: 1.2,
  textAlign: "left",
};

const e1DialogFieldControlStyle = { width: "min(100%, 320px)" };

const e1DialogActionsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 16,
  padding: "16px 24px",
  background: "#f8fafc",
  borderTop: "1px solid #9CA3AF",
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

const e1DialogPaperSx = {
  width: 600,
  maxWidth: "95vw",
  mx: "auto",
  p: 0,
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const E1Breadcrumb = ({ section, current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": { borderColor: OUTLINED_BORDER, transition: "border-color 0.2s ease" },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
    "&.Mui-focused:hover fieldset": { borderColor: OUTLINED_FOCUS, borderWidth: 2 },
  },
};

const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const PbxBreadcrumb = ({ section, current, style }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
      ...style,
    }}
  >
    <span>E1-PRI</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);
const TableListLoading = () => (
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
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const SIP_PCM_TABLE_CARD_RADIUS = 10;

const sipPcmCardStyle = {
  background: "#ffffff",
  borderRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderTopRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
};

const sipPcmPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: SIP_PCM_TABLE_CARD_RADIUS,
  borderBottomRightRadius: SIP_PCM_TABLE_CARD_RADIUS,
  overflow: "hidden",
};

const sipPcmSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const sipPcmCancelBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

const sipPcmPrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

const sipPcmPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const SipPcmPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
  style,
}) => (
  <div style={{ ...sipPcmPaginationStyle, ...style }}>
    <span style={{ fontSize: 11, color: C.mutedText }}>
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        variant="outline"
      >
        ← Prev
      </Btn>
      <span style={sipPcmPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        Next →
      </Btn>
    </div>
  </div>
);

const sipPcmCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const sipPcmPageWrapStyle = pbxPageWrapStyle;
const sipPcmInnerStyle = pbxPageInnerStyle;

const SipPcmBreadcrumb = ({ current }) => (
  <PbxBreadcrumb section="SIP" current={current} />
);

const pbxModalCancelBtnStyle = {
  minWidth: 100,
  height: 33,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};


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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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
      setIsInitialLoad(false);
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

  const formFieldLabelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    width: 120,
    flexShrink: 0,
  };

  const renderFormFieldControl = (field) => {
    if (field.type === "password") {
      return (
        <div className="w-full">
          <TextField
            type={showPassword ? "text" : "password"}
            value={form[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            placeholder="Enter password"
            error={!!validationErrors[field.name]}
            inputProps={{
              style: {
                fontSize: 13,
                padding: "6px 8px",
                backgroundColor: "#fff",
              },
            }}
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
      );
    }

    if (field.type === "checkbox") {
      return (
        <div className="w-full">
          <FormGroup row sx={{ gap: 1, flexWrap: "wrap" }}>
            {CODEC_OPTIONS.map((codec) => (
              <FormControlLabel
                key={codec.value}
                control={
                  <Checkbox
                    checked={isCodecSelected(codec.value)}
                    onChange={(e) =>
                      handleCodecChange(codec.value, e.target.checked)
                    }
                    size="small"
                    sx={sipPcmCheckboxSx}
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
          {validationErrors.allow_codecs && (
            <div className="text-red-500 text-xs mt-1">
              {validationErrors.allow_codecs}
            </div>
          )}
        </div>
      );
    }

    if (field.name === "context") {
      return (
        <div className="w-full">
          <FormControl
            fullWidth
            size="small"
            error={!!validationErrors.context}
          >
            <MuiSelect
              value={form.context || ""}
              displayEmpty
              onChange={(e) => handleChange("context", e.target.value)}
              inputProps={{ "aria-label": "Select Context" }}
              variant="outlined"
              sx={{
                fontSize: 13,
                backgroundColor: "#fff",
                "& .MuiOutlinedInput-root": {
                  height: "auto",
                  minHeight: "unset",
                },
                "& .MuiSelect-select": {
                  padding: "6px 32px 6px 8px !important",
                  fontSize: 13,
                  lineHeight: 1.35,
                  minHeight: "unset !important",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              <MenuItem value="" disabled sx={{ fontSize: 13 }}>
                <em>Select Context</em>
              </MenuItem>
              {Array.from({ length: 10 }, (_, i) => `sip${i + 1}`).map(
                (ctx) => (
                  <MenuItem key={ctx} value={ctx}>
                    {ctx}
                  </MenuItem>
                ),
              )}
            </MuiSelect>
          </FormControl>
          {validationErrors.context && (
            <div className="text-red-500 text-xs mt-1">
              {validationErrors.context}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full">
        {field.name === "contact" ? (
          <TextField
            type="text"
            value={
              form.contact ? String(form.contact).replace(/^sip:/, "") : ""
            }
            onChange={(e) => handleChange("contact", e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            error={!!validationErrors.contact}
            placeholder="e.g., 15.158.34.15"
            inputProps={{
              style: {
                fontSize: 13,
                padding: "6px 8px",
                backgroundColor: "#fff",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">sip:</InputAdornment>
              ),
            }}
          />
        ) : (
          <TextField
            type="text"
            value={form[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
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
                    ? "+91XXXXXXXXXX"
                    : field.name === "outbound_proxy"
                      ? "e.g., 15.158.34.15"
                      : `Enter ${field.label.toLowerCase()}`
            }
            disabled={field.name === "extension" && editIndex !== null}
            inputProps={{
              style: {
                fontSize: 13,
                padding: "6px 8px",
                backgroundColor: "#fff",
              },
            }}
          />
        )}
        {validationErrors[field.name] && (
          <div className="text-red-500 text-xs mt-1">
            {validationErrors[field.name]}
          </div>
        )}
      </div>
    );
  };

  const renderFormField = (field) => (
    <div
      key={field.name}
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 12,
        alignItems: field.type === "checkbox" ? "flex-start" : "center",
      }}
    >
      <label style={formFieldLabelStyle}>
        {field.label} <span style={{ color: C.errorRed }}>*</span>
      </label>
      <div style={{ width: "100%", minWidth: 0 }}>
        {renderFormFieldControl(field)}
      </div>
    </div>
  );

  return (
    <div style={sipPcmPageWrapStyle}>
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: "", text: "" })}
          sx={E1_TOAST_SX}
        >
          {message.text}
        </Alert>
      )}

      <div style={sipPcmInnerStyle}>
        <SipPcmBreadcrumb current="SIP To SIP Account" />

        <div style={sipPcmCardStyle}>
          <div style={sipPcmToolbarStyle}>
            <div className={E1_TOOLBAR_LEFT}>
              {selected.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
                  {selected.length} selected
                </span>
              )}
            </div>
            <div className={E1_TOOLBAR_LEFT}>
              <Btn
                onClick={() =>
                  setSelected((sel) =>
                    accounts
                      .map((_, i) => (sel.includes(i) ? null : i))
                      .filter((i) => i !== null),
                  )
                }
                disabled={loading.delete}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                Inverse
              </Btn>
              <Btn
                onClick={() => handleDelete(selected)}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#dc2626" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete}
                variant="cancel"
                style={sipPcmCancelBtnStyle}
              >
                Clear All
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                variant="primary"
                style={sipPcmPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
            {isInitialLoad ? (
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
            ) : accounts.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 240,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#3E5475",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  No SIP To SIP accounts found.
                </div>
                <Btn
                  variant="cancel"
                  onClick={() => handleOpenModal()}
                  style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
                >
                  + Add New
                </Btn>
              </div>
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
                      checked={
                        selected.length > 0 &&
                        selected.length === accounts.length
                      }
                      indeterminate={
                        selected.length > 0 && selected.length < accounts.length
                      }
                      onChange={
                        selected.length === accounts.length
                          ? () => setSelected([])
                          : () => setSelected(accounts.map((_, i) => i))
                      }
                      disabled={loading.delete}
                      sx={sipPcmCheckboxSx}
                    />
                  </TH>
                  {SIP_TO_SIP_TABLE_COLUMNS.map((col) => (
                    <TH key={col.key}>{col.label}</TH>
                  ))}
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
                  {pagedAccounts.map((item, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSel = selected.includes(realIdx);
                    const isLastRow = idx === pagedAccounts.length - 1;
                    const rowBg = isSel
                      ? "#eff6ff"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    return (
                      <tr
                        key={realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSel)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSel) e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSel}
                            onChange={() =>
                              setSelected((sel) =>
                                sel.includes(realIdx)
                                  ? sel.filter((i) => i !== realIdx)
                                  : [...sel, realIdx],
                              )
                            }
                            disabled={loading.delete}
                            sx={sipPcmCheckboxSx}
                          />
                        </td>
                        {SIP_TO_SIP_TABLE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              borderBottom: isLastRow
                                ? "none"
                                : tdStyle.borderBottom,
                            }}
                          >
                            {col.key === "password"
                              ? "*".repeat(item.password?.length || 0)
                              : col.key === "index"
                                ? realIdx + 1
                                : item[col.key] || "--"}
                          </td>
                        ))}
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            textAlign: "center",
                            padding: "7px 8px",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <EditDocumentIcon
                            className="cursor-pointer text-blue-600 mx-auto opacity-70 hover:opacity-100 transition-opacity"
                            titleAccess="Edit"
                            onClick={() => handleOpenModal(item, realIdx)}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            )}
          </div>

          {!isInitialLoad && accounts.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedAccounts.length}
              onPageChange={(nextPage) =>
                setPage(Math.min(totalPages, Math.max(1, nextPage)))
              }
            />
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 700, maxWidth: "95vw", mx: "auto", borderRadius: 2 },
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
          {editIndex !== null
            ? "Edit SIP To SIP Account"
            : "Add SIP To SIP Account"}
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                {SIP_TO_SIP_FORM_LAYOUT.map((rowFields, rowIdx) => {
                  const fields = rowFields
                    .map((name) =>
                      SIP_TO_SIP_FIELDS.find((f) => f.name === name),
                    )
                    .filter(Boolean);

                  return (
                    <div key={rowIdx} style={{ width: "100%", minWidth: 0 }}>
                      {fields.map((field) => renderFormField(field))}
                    </div>
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
            onClick={handleSave}
            variant="primary"
            disabled={loading.save}
            style={{ minWidth: 100, height: 33, fontSize: 13, padding: "6px 28px", textTransform: "none" }}
          >
            {loading.save ? (
              <CircularProgress
                size={14}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save ? "Saving..." : "Save"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="cancel"
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

export default SipToSipAccountPage;
