import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { createConference, deleteConference, fetchExtensionGroups, getConference, listConferenceExtensions, listConferenceModeratorMembers, listConferences, listRingBackOptions, updateConference } from "../../../../api/apiService";
import { CONFERENCE_DEFAULT_MAX_MEMBERS } from "../../../../constants/ConferenceConstants";
import { buildConferencePayload, mapConferenceApiToRows, mapConferenceDetailToRow, mapConferenceExtensions, mapExtensionGroups, mapModeratorExtensions } from "../utils/ConferenceTransformers";
import { validateConferenceForm } from "../utils/ConferenceValidators";
import { getApiErrorMessage, cleanErrorText } from "../../../../utils/getApiErrorMessage";

const CONFERENCE_COMPACT_MQ = "(max-width: 768px)";

export function useConferencePage() {
  const isCompact = useMediaQuery(CONFERENCE_COMPACT_MQ);

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // 'basic' | 'advanced'
  const [loading, setLoading] = useState({
    save: false,
    delete: false,
    list: false,
    ext: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const hasInitialLoadRef = useRef(false);
  const modalScrollRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Search & Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Basic form state
  const [editId, setEditId] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [conferenceNumber, setConferenceNumber] = useState("");
  const [greeting, setGreeting] = useState("Default");
  const [announce, setAnnounce] = useState("No");
  const [record, setRecord] = useState("No");
  const [moderatorMembers, setModeratorMembers] = useState([]);
  const [enabled, setEnabled] = useState("Yes");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [pinEnabled, setPinEnabled] = useState("No");
  const [moderatorPassword, setModeratorPassword] = useState("");
  const [participantPassword, setParticipantPassword] = useState("");
  const [maxMembers, setMaxMembers] = useState(CONFERENCE_DEFAULT_MAX_MEMBERS);

  // Available extensions for moderator member
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [greetingOptions, setGreetingOptions] = useState([]);

  // Extension groups for quick-select
  const [extensionGroups, setExtensionGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  // Advanced settings
  const [waitForModerator, setWaitForModerator] = useState("Yes");
  const [sayYourName, setSayYourName] = useState("Yes");
  const [muteParticipant, setMuteParticipant] = useState("No");
  const [allowInvite, setAllowInvite] = useState("Yes");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Initial load
  const loadInitialData = async () => {
    setLoading((prev) => ({ ...prev, list: true }));
    try {
      const res = await listConferences();
      const raw = Array.isArray(res?.message)
        ? res.message
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setRows(mapConferenceApiToRows(raw));

      try {
        setLoading((prev) => ({ ...prev, ext: true }));
        const mmRes = await listConferenceModeratorMembers();
        const mmMessage = mmRes?.message || mmRes?.data || {};
        const extRaw = Array.isArray(mmMessage?.extensions)
          ? mmMessage.extensions
          : [];
        const groupsRaw = Array.isArray(mmMessage?.groups)
          ? mmMessage.groups
          : [];

        setAvailableExtensions(mapModeratorExtensions(extRaw));

        setExtensionGroups(mapExtensionGroups(groupsRaw, true));
      } catch {
        try {
          const extRes = await listConferenceExtensions();
          const extRaw = Array.isArray(extRes?.message)
            ? extRes.message
            : Array.isArray(extRes?.data)
              ? extRes.data
              : [];
          setAvailableExtensions(mapConferenceExtensions(extRaw));
        } catch {
          setAvailableExtensions([]);
        }

        try {
          const grpRes = await fetchExtensionGroups();
          const grpRaw = Array.isArray(grpRes?.message)
            ? grpRes.message
            : Array.isArray(grpRes?.data)
              ? grpRes.data
              : [];
          setExtensionGroups(mapExtensionGroups(grpRaw));
        } catch {
          setExtensionGroups([]);
        }
      } finally {
        setLoading((prev) => ({ ...prev, ext: false }));
      }

      try {
        const gRes = await listRingBackOptions();
        const customPrompts = Array.isArray(gRes?.message?.custom_prompts)
          ? gRes.message.custom_prompts.map((g) => String(g))
          : [];
        const uniqueCustomPrompts = Array.from(
          new Set(customPrompts.filter(Boolean)),
        );
        setGreetingOptions(["Default", ...uniqueCustomPrompts]);
      } catch {
        setGreetingOptions(["Default"]);
      }
    } catch (err) {
      showMessage("error", err?.message || "Failed to load conference data.");
    } finally {
      setLoading((prev) => ({ ...prev, list: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadInitialData();
    }
  }, []);

  useLayoutEffect(() => {
    if (!showModal || !modalScrollRef.current) return;
    modalScrollRef.current.scrollTop = 0;
  }, [showModal, activeTab]);

  // ── Search & Pagination Logic ──
  const filteredRows = searchQuery.trim()
    ? rows.filter((r) =>
        [r.roomName, r.conferenceNumber].some((v) =>
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

  // ── Checkbox Logic ──
  const pageIndices = pagedRows.map(
    (_, idx) => (page - 1) * itemsPerPage + idx,
  );
  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selected.includes(i));
  const somePageSelected =
    pageIndices.some((i) => selected.includes(i)) && !allPageSelected;

  const handleToggleRow = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleToggleAll = () => {
    if (!pageIndices.length) return;
    setSelected((prev) =>
      allPageSelected
        ? prev.filter((i) => !pageIndices.includes(i))
        : Array.from(new Set([...prev, ...pageIndices])),
    );
  };

  // ── Handlers ──
  const resetForm = () => {
    setEditId(null);
    setRoomName("");
    setConferenceNumber("");
    setGreeting("Default");
    setAnnounce("No");
    setRecord("No");
    setModeratorMembers([]);
    setEnabled("Yes");
    setScheduleStart("");
    setScheduleEnd("");
    setPinEnabled("No");
    setModeratorPassword("");
    setParticipantPassword("");
    setMaxMembers(CONFERENCE_DEFAULT_MAX_MEMBERS);
    setWaitForModerator("Yes");
    setSayYourName("Yes");
    setMuteParticipant("No");
    setAllowInvite("Yes");
    setSelectedGroupIds([]);
    setActiveTab("basic");
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = async (row) => {
    let source = row;
    try {
      if (row?.id != null) {
        const detailRes = await getConference(row.id);
        const detail = detailRes?.message || detailRes?.data || {};
        source = mapConferenceDetailToRow(row, detail);
      }
    } catch (err) {
      console.warn(
        "Failed to fetch conference detail for edit, using list row fallback:",
        err,
      );
    }

    setEditId(source.id);
    setRoomName(source.roomName || "");
    setConferenceNumber(source.conferenceNumber || "");
    setGreeting(source.greeting || "Default");
    setAnnounce(source.announce || "No");
    setRecord(source.record || "No");
    setModeratorMembers(
      Array.isArray(source.moderatorMembers) ? source.moderatorMembers : [],
    );
    setEnabled(source.enabled || "Yes");
    setScheduleStart(source.scheduleStart || "");
    setScheduleEnd(source.scheduleEnd || "");
    setPinEnabled(source.pinEnabled || "No");
    setModeratorPassword(source.moderatorPassword || "");
    setParticipantPassword(source.participantPassword || "");
    setMaxMembers(source.maxMembers || "20");
    setWaitForModerator(source.waitForModerator || "Yes");
    setSayYourName(source.sayYourName || "Yes");
    setMuteParticipant(source.muteParticipant || "No");
    setAllowInvite(source.allowInvite || "Yes");
    setActiveTab("basic");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (selected.length === 0) {
      showMessage("error", "Please select at least one row to delete.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete ${selected.length} records?`,
      )
    )
      return;

    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      const toDelete = filteredRows.filter((_, idx) => selected.includes(idx));
      for (const row of toDelete) {
        if (row.id != null) await deleteConference(row.id);
      }
      setSelected([]);
      await loadInitialData();
      showMessage("success", "Conference room(s) deleted successfully.");
    } catch (err) {
      showMessage(
        "error",
        err?.message || "Failed to delete conference room(s).",
      );
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleSave = async () => {
    const form = { roomName, conferenceNumber, greeting, announce, record, moderatorMembers, enabled, scheduleStart, scheduleEnd, pinEnabled, moderatorPassword, participantPassword, maxMembers, waitForModerator, sayYourName, muteParticipant, allowInvite };
    const error = validateConferenceForm(form);
    if (error) return showMessage("error", error);
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      const payloadForApi = buildConferencePayload(form);
      const res = editId != null
        ? await updateConference(editId, payloadForApi)
        : await createConference(payloadForApi);
      if (res?.response === false) {
        showMessage("error", cleanErrorText(res?.message, "Failed to save conference room."));
        return;
      }
      await loadInitialData();
      setShowModal(false);
      resetForm();
      showMessage("success", "Conference room saved successfully.");
    } catch (err) {
      showMessage("error", getApiErrorMessage(err, "Failed to save conference room."));
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const toggleModeratorMember = (ext) => {
    setModeratorMembers((prev) =>
      prev.includes(ext) ? prev.filter((v) => v !== ext) : [...prev, ext],
    );
  };

  const toggleExtensionGroup = (group) => {
    const groupId = String(group?.id ?? "");
    const groupValue = String(
      group?.value || (groupId ? `group:${groupId}` : ""),
    );
    if (!groupId || !groupValue) return;

    setModeratorMembers((prev) => {
      if (prev.includes(groupValue))
        return prev.filter((v) => v !== groupValue);
      return [...prev, groupValue];
    });
  };

  useEffect(() => {
    const mappedSelected = extensionGroups
      .filter((g) =>
        moderatorMembers.includes(String(g.value || `group:${g.id}`)),
      )
      .map((g) => String(g.id));
    setSelectedGroupIds(mappedSelected);
  }, [moderatorMembers, extensionGroups]);

  return {
    isCompact, rows, selected, showModal, activeTab, loading, message, isInitialLoad, page, searchQuery, searchFocused, editId, roomName, conferenceNumber, greeting, announce, record, moderatorMembers, enabled, scheduleStart, scheduleEnd, pinEnabled, moderatorPassword, participantPassword, maxMembers, availableExtensions, greetingOptions, extensionGroups, selectedGroupIds, waitForModerator, sayYourName, muteParticipant, allowInvite, modalScrollRef, itemsPerPage, filteredRows, totalPages, pagedRows, allPageSelected, somePageSelected,
    setSelected, setActiveTab, setMessage, setSearchQuery, setSearchFocused, setRoomName, setConferenceNumber, setGreeting, setAnnounce, setRecord, setModeratorMembers, setEnabled, setScheduleStart, setScheduleEnd, setPinEnabled, setModeratorPassword, setParticipantPassword, setMaxMembers, setWaitForModerator, setSayYourName, setMuteParticipant, setAllowInvite,
    handlePrev, handleNext, handleToggleRow, handleToggleAll, handleOpenAddModal, handleOpenEditModal, handleCloseModal, handleDelete, handleSave, toggleModeratorMember, toggleExtensionGroup,
  };
}
