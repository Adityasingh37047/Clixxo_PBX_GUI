import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { listIvrDestinations, listIvrs, listIvrOptions, listIvrDirectOutboundOptions, createIvr, updateIvr, deleteIvr, getIvr, setIvrKeys } from "../../../../api/apiService";
import { IVR_EMPTY_PROMPT_OPTIONS, IVR_EMPTY_RING_BACK_OPTIONS, IVR_KEYS } from "../../../../constants/IVRConstants";
import { buildIvrApiPayload, buildKeyActions, buildPromptOptions, mapIvrApiItemToFormState, mapIvrRowFallbackToFormState, normalizeArrayFromApi, normalizeDestinationOptions, normalizeOutboundRoutesList, transformIvrListItemToRow } from "../utils/IVRTransformers";
import { validateIvrForm } from "../utils/IVRValidators";
const IVR_COMPACT_MQ = "(max-width: 768px)"; const EMPTY_PROMPT_OPTIONS = IVR_EMPTY_PROMPT_OPTIONS; const EMPTY_RING_BACK_OPTIONS = IVR_EMPTY_RING_BACK_OPTIONS; const KEYS = IVR_KEYS;
export function useIVRPage() {
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
      const routes = normalizeOutboundRoutesList(list);
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
      setRows(ivrList.map(transformIvrListItemToRow));

      try {
        const obRes = await listIvrDirectOutboundOptions();
        const obList = normalizeArrayFromApi(obRes);
        const routes = normalizeOutboundRoutesList(obList);
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


  const applyFormState = (formState) => {
    setName(formState.name); setIvrNumber(formState.ivrNumber); setGreetLong(formState.greetLong); setGreetShort(formState.greetShort); setResponseTimeout(formState.responseTimeout); setPassword(formState.password); setCheckVoicemail(formState.checkVoicemail); setDirectOutbound(formState.directOutbound); setInterDigitTimeout(formState.interDigitTimeout); setMaxFailures(formState.maxFailures); setMaxTimeouts(formState.maxTimeouts); setDigitLength(formState.digitLength); setEnabled(formState.enabled); setDirectExtension(formState.directExtension); setFxoFlashTransfer(formState.fxoFlashTransfer); setInvalidSound(formState.invalidSound); setExitSound(formState.exitSound); setExitActionType(formState.exitActionType); setExitActionValue(formState.exitActionValue); setRingBack(formState.ringBack); setCallerIdNamePrefix(formState.callerIdNamePrefix); setSelectedOutboundRouteIds(formState.selectedOutboundRouteIds); setKeyDestinations(formState.keyDestinations); setKeyDestinationValues(formState.keyDestinationValues);
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

      applyFormState(mapIvrApiItemToFormState(item));
    } catch {
      applyFormState(mapIvrRowFallbackToFormState(row));
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
    const fields = { name, ivrNumber, greetLong, greetShort, responseTimeout, password, checkVoicemail, directOutbound, interDigitTimeout, maxFailures, maxTimeouts, digitLength, enabled, directExtension, fxoFlashTransfer, invalidSound, exitSound, ringBack, callerIdNamePrefix, exitActionType, exitActionValue, selectedOutboundRouteIds };
    const formError = validateIvrForm(fields);
    if (formError) return showMessage("error", formError);
    const { keyActions, error: keyActionError } = buildKeyActions(KEYS, keyDestinations, keyDestinationValues);
    if (keyActionError) return showMessage("error", keyActionError);
    const payloadForApi = buildIvrApiPayload(fields);
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      if (editId != null) { await updateIvr(editId, payloadForApi); await setIvrKeys(editId, keyActions); } else { await createIvr({ ...payloadForApi, key_actions: keyActions }); }
      await fetchInitialData(); handleCloseModal(); showMessage("success", "IVR saved successfully.");
    } catch (err) { showMessage("error", err?.message || "Failed to save IVR."); }
    finally { setLoading((prev) => ({ ...prev, save: false })); }
  };

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


  return { isCompact, rows, selected, showModal, activeTab, loading, message, isInitialLoad, modalScrollRef, itemsPerPage, page, setPage, searchQuery, setSearchQuery, searchFocused, setSearchFocused, editId, name, ivrNumber, greetLong, greetShort, responseTimeout, password, showPassword, checkVoicemail, directOutbound, interDigitTimeout, maxFailures, maxTimeouts, digitLength, enabled, directExtension, fxoFlashTransfer, invalidSound, exitSound, ringBack, callerIdNamePrefix, exitActionType, exitActionValue, selectedOutboundRouteIds, keyDestinations, keyDestinationValues, filteredRows, totalPages, pagedRows, allPageSelected, somePageSelected, getOutboundRouteLabel, allOutboundRouteOptions, actionTypeOptions, keyActionTypeOptions, formatActionLabel, getDestinationListForType, greetLongOptions, greetShortOptions, invalidSoundOptions, exitSoundOptions, ringBackOptions, ringBackAllValues, setMessage, setActiveTab, setName, setIvrNumber, setGreetLong, setGreetShort, setResponseTimeout, setPassword, setShowPassword, setCheckVoicemail, setDirectOutbound, setInterDigitTimeout, setMaxFailures, setMaxTimeouts, setDigitLength, setEnabled, setDirectExtension, setFxoFlashTransfer, setInvalidSound, setExitSound, setRingBack, setCallerIdNamePrefix, setExitActionType, setExitActionValue, setSelectedOutboundRouteIds, handleGoToVoicePrompts, handlePrev, handleNext, handleToggleRow, handleToggleAll, handleOpenAddModal, handleOpenEditModal, handleCloseModal, handleDelete, handleSave, handleKeyDestinationChange, handleKeyDestinationValueChange };
}
