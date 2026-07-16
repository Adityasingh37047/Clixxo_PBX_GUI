import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import {
  SIP_REGISTER_INITIAL_FORM,
  SIP_REGISTER_CODEC_OPTIONS,
  SIP_REGISTER_ETH_PORT_OPTIONS,
} from "../../../../constants/SipRegisterConstants";
import {
  fetchSipAccounts,
  listSipTrunks,
  createSipTrunk,
  updateSipTrunk,
  deleteSipTrunk,
  fetchSystemInfo,
} from "../../../../api/apiService";
import { transformApiToUi, transformUiToApi } from "../utils/SipRegisterTransformers";
import {
  validateAllowCodecs,
  validateTrunkId,
  validateUsername,
  validatePassword,
  validateContext,
  validateExpireInSec,
  validateProvider,
  validateSipHeader,
  validateServerDomain,
  validateClientDomain,
  validateIdentityIp,
  validateForm,
} from "../utils/SipRegisterValidators";
import { parseCodecList } from "../components/SipRegisterFormFields";
import { SIP_REGISTER_ZOOM_TABLE_WIDTH } from "../components/SipRegisterTableHelpers";

const SIP_REGISTER_COMPACT_MQ = "(max-width: 768px)";

export function useSipRegisterPage() {
  // State
  const [trunks, setTrunks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(SIP_REGISTER_INITIAL_FORM);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    delete: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const modalScrollRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [modalTab, setModalTab] = useState("basic");
  const [dodRows, setDodRows] = useState([]);
  const [dodSelected, setDodSelected] = useState([]);
  const [adaptRows, setAdaptRows] = useState([
    { matchMode: "", strip: "", prepend: "" },
  ]);
  const [dnisRows, setDnisRows] = useState([{ dnisNumber: "", dnisName: "" }]);
  const [ethPortOptions, setEthPortOptions] = useState(
    SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({ value: v, label: v })),
  );
  const tableScrollRef = useRef(null);
  const [tableContainerWidth, setTableContainerWidth] = useState(0);
  const isCompact = useMediaQuery(SIP_REGISTER_COMPACT_MQ);
  const allowHorizontalScroll = false; // browser-zoom table mode removed
  const tableMinWidth = allowHorizontalScroll
    ? Math.max(
        SIP_REGISTER_ZOOM_TABLE_WIDTH,
        tableContainerWidth > 0
          ? tableContainerWidth + 120
          : SIP_REGISTER_ZOOM_TABLE_WIDTH,
      )
    : "100%";

  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = 0;
    }
  }, [allowHorizontalScroll, tableMinWidth]);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return undefined;

    const measureContainer = () => {
      setTableContainerWidth(el.clientWidth);
    };

    measureContainer();
    const ro = new ResizeObserver(measureContainer);
    ro.observe(el);
    window.addEventListener("resize", measureContainer);
    window.visualViewport?.addEventListener("resize", measureContainer);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureContainer);
      window.visualViewport?.removeEventListener("resize", measureContainer);
    };
  }, [trunks.length, allowHorizontalScroll]);

  const selectedCodecList = useMemo(
    () => parseCodecList(form.allow_codecs),
    [form.allow_codecs],
  );

  const getCodecLabel = (value) =>
    SIP_REGISTER_CODEC_OPTIONS.find((c) => c.value === value)?.label || value;

  const updateCodecList = (newList) => {
    const newCodecsString = newList.join(",");

    if (validationErrors.allow_codecs) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.allow_codecs;
        return newErrors;
      });
    }

    const codecError = validateAllowCodecs(newCodecsString);
    if (codecError) {
      setValidationErrors((prev) => ({ ...prev, allow_codecs: codecError }));
    }

    setForm((prev) => ({ ...prev, allow_codecs: newCodecsString }));
  };

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

  // DOD Add modal (DNIS-like extension dual-list)
  const [showDodAddModal, setShowDodAddModal] = useState(false);
  const [dodAddName, setDodAddName] = useState("");
  const [dodAddNumber, setDodAddNumber] = useState("");
  const [dodMemberExtensions, setDodMemberExtensions] = useState([]);
  const [dodAvailableExtensions, setDodAvailableExtensions] = useState([]);
  const dodHasLoadedExtensionsRef = useRef(false);

  const dodExtensionLabelMap = useMemo(() => {
    const map = new Map();
    dodAvailableExtensions.forEach((e) => map.set(e.value, e.label));
    return map;
  }, [dodAvailableExtensions]);

  const getDodExtLabel = (ext) => dodExtensionLabelMap.get(ext) || ext;

  const resetDodAddForm = () => {
    setDodAddName("");
    setDodAddNumber("");
    setDodMemberExtensions([]);
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
        .map((e) => {
          const ext = String(e.extension);
          const display = (e.display_name || e.name || "").trim();
          return {
            value: ext,
            label: display ? `${ext}-${display}` : ext,
          };
        })
        .sort((a, b) => {
          const an = parseInt(a.value, 10);
          const bn = parseInt(b.value, 10);
          if (!Number.isNaN(an) && !Number.isNaN(bn) && an !== bn)
            return an - bn;
          return a.label.localeCompare(b.label);
        });
      setDodAvailableExtensions(exts);
      dodHasLoadedExtensionsRef.current = true;
    } catch (e) {
      showMessage("error", e?.message || "Failed to load extensions");
      setDodAvailableExtensions([]);
      dodHasLoadedExtensionsRef.current = true;
    }
  };

  const handleOpenDodAddModal = async () => {
    resetDodAddForm();
    setShowDodAddModal(true);
    if (!dodHasLoadedExtensionsRef.current) await loadDodExtensions();
  };

  const handleConfirmDodAdd = () => {
    const name = dodAddName.trim();
    const number = dodAddNumber.trim();
    if (!name) return showMessage("error", "DOD Name is required");
    if (!number) return showMessage("error", "DOD Number is required");
    if (!dodMemberExtensions.length)
      return showMessage("error", "Please select at least one extension");

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

  // Pagination + Search
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const filteredRows = trunks;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const pagedRows = filteredRows.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );
  const dataEmpty = trunks.length === 0;

  // Load trunks on component mount
  useEffect(() => {
    // Prevent duplicate calls during React StrictMode or development double-rendering
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadTrunks();
    }
  }, []);

  useLayoutEffect(() => {
    if (!showModal || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTop = 0;
  }, [showModal, modalTab]);

  // Load ETH port dropdown options when SIP Register modal opens.
  // This keeps the menu consistent and shows VPN options only when VPN interfaces are detected.
  useEffect(() => {
    if (!showModal) return;

    const getIpFromInterfaceObject = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      if (Array.isArray(obj["IP Address"]) && obj["IP Address"][0])
        return obj["IP Address"][0];
      if (Array.isArray(obj["Ip Address"]) && obj["Ip Address"][0])
        return obj["Ip Address"][0];
      if (Array.isArray(obj["ip_address"]) && obj["ip_address"][0])
        return obj["ip_address"][0];
      if (typeof obj["IP Address"] === "string") return obj["IP Address"];
      if (typeof obj["Ip Address"] === "string") return obj["Ip Address"];
      if (typeof obj["ip_address"] === "string") return obj["ip_address"];
      return null;
    };

    const loadEthPortOptions = async () => {
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
            ) {
              vpnOpenVpnIp = vpnOpenVpnIp || ip;
            }
            if (name.includes("vpn_vpn") || name === "vpn_vpn") {
              vpnSoftEtherIp = vpnSoftEtherIp || ip;
            }
          }
        });

        // Fallback to direct network object access
        const network = sysInfo?.network || {};
        vpnOpenVpnIp =
          vpnOpenVpnIp ||
          getIpFromInterfaceObject(network?.tap0) ||
          getIpFromInterfaceObject(network?.tun0);
        vpnSoftEtherIp =
          vpnSoftEtherIp || getIpFromInterfaceObject(network?.vpn_vpn);

        const nextOptions = [
          { value: "ETH0", label: "ETH0" },
          { value: "ETH1", label: "ETH1" },
        ];

        if (vpnOpenVpnIp) {
          nextOptions.push({
            value: "OpenVPN",
            label: vpnOpenVpnIp ? `OpenVPN (${vpnOpenVpnIp})` : "OpenVPN",
          });
        }

        if (vpnSoftEtherIp) {
          nextOptions.push({
            value: vpnSoftEtherIp,
            label: `SoftEther VPN IP (${vpnSoftEtherIp})`,
          });
        }

        setEthPortOptions(nextOptions);

        const validValues = new Set(nextOptions.map((o) => o.value));
        setForm((prev) => {
          if (validValues.has(prev.ui_eth_port)) return prev;
          return {
            ...prev,
            ui_eth_port: nextOptions[0]?.value || prev.ui_eth_port,
          };
        });
      } catch {
        // If system info is not available, keep ETH0/ETH1 only.
        setEthPortOptions(
          SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({ value: v, label: v })),
        );
      }
    };

    loadEthPortOptions();
  }, [showModal]);

  // Message handling
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  // Load trunks from API
  const loadTrunks = async (isRefresh = false) => {
    // Prevent concurrent calls
    if (loading.fetch) {
      return;
    }

    setLoading((prev) => ({ ...prev, fetch: true }));
    try {
      console.log("Attempting to load SIP trunks...");
      const response = await listSipTrunks();
      console.log("SIP trunks response:", response);
      if (response.response && response.message) {
        const transformedTrunks = transformApiToUi(response.message);
        console.log("Transformed trunks:", transformedTrunks);
        setTrunks(transformedTrunks);
      } else {
        console.log("Invalid response format:", response);
        showMessage("error", "Failed to load SIP trunks");
      }
    } catch (error) {
      console.error("Error loading SIP trunks:", error);
      if (!isRefresh) {
        // Only show error on initial load, not on refresh after operations
        if (error.message === "Network Error") {
          showMessage("error", "Network error. Please check your connection.");
        } else if (error.response?.status === 500) {
          showMessage(
            "error",
            "Server error. The list endpoint may have issues.",
          );
        } else {
          showMessage("error", error.message || "Failed to load SIP trunks");
        }
      } else {
        // For refresh errors, just log them - don't disturb the user
        console.warn("Refresh failed, keeping existing data:", error.message);
      }
      // Only set empty array on initial load failure, not on refresh
      if (!isRefresh) {
        setTrunks([]);
      }
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
      setIsInitialLoad(false);
    }
  };
  // Modal logic
  const handleOpenModal = (row = null, idx = null) => {
    setModalTab("basic");
    setDodSelected([]);
    setAdaptRows([{ matchMode: "", strip: "", prepend: "" }]);
    setDnisRows([{ dnisNumber: "", dnisName: "" }]);
    setValidationErrors({});
    if (row && idx !== null) {
      const uiReg =
        row.ui_register ??
        (String(row.expire_in_sec ?? "") === "0" ? "No" : "Yes");
      setForm({
        ...SIP_REGISTER_INITIAL_FORM,
        ...row,
        ui_register: uiReg,
        ui_replace_cid:
          row.ui_replace_cid ??
          (Array.isArray(row.dnisRows) && row.dnisRows[0]?.replaceCid) ??
          "No",
        allow_codecs: row.allow_codecs || "ulaw,alaw",
      });
      setEditIndex(idx);
      setDodRows(Array.isArray(row.dodRows) ? row.dodRows : []);
      setAdaptRows(
        Array.isArray(row.adaptRows) && row.adaptRows.length
          ? row.adaptRows
          : [{ matchMode: "", strip: "", prepend: "" }],
      );
      setDnisRows(
        Array.isArray(row.dnisRows) && row.dnisRows.length
          ? row.dnisRows.map((r) => ({
              dnisNumber: r.dnisNumber ?? "",
              dnisName: r.dnisName ?? "",
            }))
          : [{ dnisNumber: "", dnisName: "" }],
      );
    } else {
      const nextIndex = trunks.length.toString();
      setForm({
        ...SIP_REGISTER_INITIAL_FORM,
        index: nextIndex,
      });
      setEditIndex(null);
      setDodRows([]);
    }
    setShowDodAddModal(false);
    resetDodAddForm();
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setModalTab("basic");
    setShowDodAddModal(false);
    resetDodAddForm();
    setDodRows([]);
    setDodSelected([]);
    setAdaptRows([{ matchMode: "", strip: "", prepend: "" }]);
    setDnisRows([{ dnisNumber: "", dnisName: "" }]);
    setShowPassword(false); // Reset password visibility when closing modal
    setValidationErrors({}); // Clear validation errors when closing modal
  };
  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "ui_register") {
        if (value === "Yes") {
          // Default expire when switching Register=Yes (matches screenshot)
          if (!next.expire_in_sec || String(next.expire_in_sec).trim() === "")
            next.expire_in_sec = "1800";
        } else {
          // When Register=No, expire is forced to 0 for save payload.
          next.expire_in_sec = "0";
        }
      }
      return next;
    });

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
      case "trunk_id":
        error = validateTrunkId(value);
        break;
      case "username":
        error = validateUsername(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "context":
        error = validateContext(value);
        break;
      case "allow_codecs":
        error = validateAllowCodecs(value);
        break;
      case "expire_in_sec":
        error = validateExpireInSec(value);
        break;
      case "provider":
        error = validateProvider(value);
        break;
      case "sip_header":
        error = validateSipHeader(value);
        break;
      case "server_domain":
        error = validateServerDomain(value);
        break;
      case "client_domain":
        error = validateClientDomain(value);
        break;
      case "identity_ip":
        error = validateIdentityIp(value);
        break;
      case "ui_reg_fail_retry":
        if (!value || String(value).trim() === "")
          error = "RegFail Retry is required";
        else if (!/^\d+$/.test(String(value).trim()))
          error = "RegFail Retry must be a number";
        break;
      case "ui_proxy_ip":
        if (form.ui_enable_proxy && (!value || String(value).trim() === ""))
          error = "Proxy IP is required";
        break;
      case "ui_match_username":
        if (value !== "Yes" && value !== "No")
          error = "Match Username must be Yes or No";
        break;
      case "ui_country":
        if (!value || String(value).trim() === "")
          error = "Country is required";
        break;
      default:
        break;
    }

    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const buildMergedFormForSave = () => ({
    ...form,
    context: form.context || "sip1",
    expire_in_sec:
      form.ui_register === "No" ? "0" : form.expire_in_sec || "3600",
  });

  const handleSave = async () => {
    const mergedForm = buildMergedFormForSave();
    const validationErrors = validateForm(mergedForm);

    if (Object.keys(validationErrors).length > 0) {
      const firstKey = Object.keys(validationErrors)[0];
      if (
        [
          "sip_header",
          "server_domain",
          "client_domain",
          "identity_ip",
          "Outbound Proxy",
        ].includes(firstKey)
      ) {
        setModalTab("advance");
      } else if (firstKey === "allow_codecs") {
        setModalTab("codec");
      } else {
        setModalTab("basic");
      }
      showMessage("error", validationErrors[firstKey]);
      return;
    }

    // Prevent duplicate registration: same Trunk ID (name) + Username
    // (case-insensitive, trimmed). Allow when editing the same row.
    if (mergedForm.ui_register === "Yes") {
      const norm = (v) =>
        String(v ?? "")
          .trim()
          .toLowerCase();
      const nextTrunkId = norm(mergedForm.trunk_id);
      const nextUsername = norm(mergedForm.username);
      const duplicateIndex = trunks.findIndex((t, idx) => {
        if (editIndex !== null && idx === editIndex) return false;
        return (
          norm(t?.trunk_id) === nextTrunkId &&
          norm(t?.username) === nextUsername
        );
      });

      if (nextTrunkId && nextUsername && duplicateIndex !== -1) {
        showMessage(
          "error",
          "Duplicate trunk not allowed: same Trunk ID and Username already exists.",
        );
        setModalTab("basic");
        return;
      }
    }

    setLoading((prev) => ({ ...prev, save: true }));
    const closeModalAfterSuccess = () => {
      setShowModal(false);
      setEditIndex(null);
      setModalTab("basic");
      setDodRows([]);
      setDodSelected([]);
      setAdaptRows([{ matchMode: "", strip: "", prepend: "" }]);
      setDnisRows([{ dnisNumber: "", dnisName: "" }]);
      setShowPassword(false);
      setValidationErrors({});
    };

    try {
      const apiData = transformUiToApi(mergedForm, dodRows, adaptRows);

      if (editIndex !== null) {
        console.log("Updating SIP trunk with data:", apiData);
        const response = await updateSipTrunk(apiData);
        console.log("Update response:", response);
        if (response.response) {
          showMessage(
            "success",
            response.message || "Trunk updated successfully",
          );
          setForm((prev) => ({ ...prev, ...mergedForm }));
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await loadTrunks(true);
          } catch (reloadError) {
            console.warn("Failed to reload trunks after update:", reloadError);
            setTrunks((prev) =>
              prev.map((trunk, idx) =>
                idx === editIndex
                  ? { ...trunk, ...mergedForm, registerStatus: "registered" }
                  : trunk,
              ),
            );
          }
          closeModalAfterSuccess();
        } else {
          showMessage("error", "Failed to update trunk");
        }
      } else {
        console.log("Creating SIP trunk with data:", apiData);
        const response = await createSipTrunk(apiData);
        console.log("Create response:", response);
        if (response.response) {
          showMessage(
            "success",
            response.message || "Trunk created successfully",
          );
          setForm((prev) => ({ ...prev, ...mergedForm }));
          try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await loadTrunks(true);
          } catch (reloadError) {
            console.warn(
              "Failed to reload trunks after creation:",
              reloadError,
            );
            setTrunks((prev) => {
              const newTrunk = {
                index: prev.length.toString(),
                trunk_id: mergedForm.trunk_id,
                username: mergedForm.username,
                context: mergedForm.context,
                allow_codecs: mergedForm.allow_codecs,
                expire_in_sec: mergedForm.expire_in_sec,
                provider: mergedForm.provider,
                sip_header: mergedForm.sip_header,
                registerStatus: "registered",
              };
              return [...prev, newTrunk];
            });
          }
          closeModalAfterSuccess();
        } else if (response.limit_exceeded) {
          showMessage(
            "error",
            `Maximum trunk limit (${response.limit}) reached. Please upgrade your license.`,
          );
        } else {
          showMessage("error", response.message || "Failed to create trunk");
        }
      }
    } catch (error) {
      console.error("Error saving SIP trunk:", error);
      if (error.message === "Network Error") {
        showMessage("error", "Network error. Please check your connection.");
      } else {
        showMessage("error", error.message || "Failed to save trunk");
      }
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };
  // Table selection logic (trunk_id based)
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
    if (selectedIds.length === 0) {
      showMessage("error", "Please select trunks to delete");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} trunk(s)?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const deletePromises = selectedIds.map(
        async (id) => await deleteSipTrunk(id),
      );
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showMessage("success", `${successCount} trunk(s) deleted successfully`);
        try {
          await loadTrunks(true);
        } catch {
          setTrunks((prev) =>
            prev.filter((t) => !selectedIds.includes(t.trunk_id)),
          );
        }
        setSelectedIds([]);
      }

      if (failCount > 0) {
        showMessage("error", `Failed to delete ${failCount} trunk(s)`);
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to delete trunks");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };
  const handleClearAll = async () => {
    if (trunks.length === 0) {
      showMessage("info", "No trunks to clear");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete ALL SIP trunks? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      console.log(
        "Clearing all trunks:",
        trunks.map((t) => t.trunk_id),
      );
      const deletePromises = trunks.map(async (trunk) => {
        console.log("Deleting trunk:", trunk.trunk_id);
        return await deleteSipTrunk(trunk.trunk_id);
      });

      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value.response,
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        showMessage(
          "success",
          `All ${successCount} trunk(s) deleted successfully`,
        );

        // Try to reload data, but don't fail if it doesn't work
        try {
          await loadTrunks(true); // Reload trunks to get fresh data
        } catch (reloadError) {
          console.warn(
            "Failed to reload after clear all, clearing local state:",
            reloadError,
          );
          // Clear all items from local state as fallback
          setTrunks([]);
        }
        setSelectedIds([]);
        setPage(1);
      }

      if (failCount > 0) {
        showMessage("error", `Failed to delete ${failCount} trunk(s)`);
      }
    } catch (error) {
      showMessage("error", error.message || "Failed to clear all trunks");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };
  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(totalPages, newPage)));
  };

  const dodAvailableEmptyText =
    dodAvailableExtensions.length === 0 && !dodHasLoadedExtensionsRef.current
      ? "Loading extensions..."
      : "No extensions";
  return {
    trunks, setTrunks,
    selectedIds, setSelectedIds,
    selected,
    showModal, setShowModal,
    form, setForm,
    editIndex, setEditIndex,
    loading, setLoading,
    isInitialLoad, setIsInitialLoad,
    message, setMessage,
    modalScrollRef,
    showPassword, setShowPassword,
    validationErrors, setValidationErrors,
    modalTab, setModalTab,
    dodRows, setDodRows,
    dodSelected, setDodSelected,
    adaptRows, setAdaptRows,
    dnisRows, setDnisRows,
    ethPortOptions, setEthPortOptions,
    tableScrollRef,
    tableContainerWidth, setTableContainerWidth,
    isCompact,
    allowHorizontalScroll,
    tableMinWidth,
    selectedCodecList,
    getCodecLabel,
    updateCodecList,
    PREFERRED_ASSERTED_IDENTITY_OPTIONS,
    REMOTE_PARTY_ID_OPTIONS,
    CONTACT_MODE_OPTIONS,
    showDodAddModal, setShowDodAddModal,
    dodAddName, setDodAddName,
    dodAddNumber, setDodAddNumber,
    dodMemberExtensions, setDodMemberExtensions,
    dodAvailableExtensions, setDodAvailableExtensions,
    dodHasLoadedExtensionsRef,
    dodExtensionLabelMap,
    getDodExtLabel,
    resetDodAddForm,
    loadDodExtensions,
    handleOpenDodAddModal,
    handleConfirmDodAdd,
    itemsPerPage,
    page, setPage,
    filteredRows,
    totalPages,
    pagedRows,
    dataEmpty,
    showMessage,
    loadTrunks,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    togglePasswordVisibility,
    buildMergedFormForSave,
    handleSave,
    allPageSelected,
    somePageSelected,
    handleToggleRow,
    handleToggleAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handlePageChange,
    dodAvailableEmptyText,
  };
}
