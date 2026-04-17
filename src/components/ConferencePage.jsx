import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import {
  listConferences,
  getConference,
  createConference,
  updateConference,
  deleteConference,
  listConferenceExtensions,
  listConferenceModeratorMembers,
  listRingBackOptions,
  fetchExtensionGroups,
} from '../api/apiService';

const ENABLE_OPTIONS = ['Yes', 'No'];
const YES_NO_OPTIONS = ['Yes', 'No'];

const ConferencePage = () => {
  const normalizeModeratorValue = (value) => String(value ?? '').trim();
  const normalizeExtensionValue = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    return raw.replace(/^extension:/i, '').replace(/^ext:/i, '');
  };

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'advanced'
  const [loading, setLoading] = useState({ save: false, delete: false, list: false, ext: false });

  // Basic form state
  const [editId, setEditId] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [conferenceNumber, setConferenceNumber] = useState('');
  const [greeting, setGreeting] = useState('Default');
  const [announce, setAnnounce] = useState('No');
  const [record, setRecord] = useState('No');
  const [moderatorMembers, setModeratorMembers] = useState([]);
  const [enabled, setEnabled] = useState('Yes');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [pinEnabled, setPinEnabled] = useState('No');
  const [moderatorPassword, setModeratorPassword] = useState('');
  const [participantPassword, setParticipantPassword] = useState('');
  const [maxMembers, setMaxMembers] = useState('20');

  // Available extensions for moderator member
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [greetingOptions, setGreetingOptions] = useState([]);

  // Extension groups for quick-select
  const [extensionGroups, setExtensionGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const toDateTimeLocal = (value) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Advanced settings
  const [waitForModerator, setWaitForModerator] = useState('Yes');
  const [sayYourName, setSayYourName] = useState('Yes');
  const [muteParticipant, setMuteParticipant] = useState('No');
  const [allowInvite, setAllowInvite] = useState('Yes');

  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const pagedRows = rows.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const showAlert = (text) => window.alert(text);

  // Initial load: conferences, extension list, greeting options
  useEffect(() => {
    const loadInitial = async () => {
      setLoading((prev) => ({ ...prev, list: true }));
      try {
        // List conferences for table
        const res = await listConferences();
        const raw = Array.isArray(res?.message) ? res.message : Array.isArray(res?.data) ? res.data : [];
        const mapped = raw.map((item) => ({
          id: item.id,
          roomName: item.name,
          conferenceNumber: String(item.conf_number),
          greeting: item.greeting,
          announce: item.announce ? 'Yes' : 'No',
          record: item.record ? 'Yes' : 'No',
          enabled: item.enabled ? 'Yes' : 'No',
          scheduleStart: toDateTimeLocal(item.schedule_start),
          scheduleEnd: toDateTimeLocal(item.schedule_end),
          pinEnabled: item.pin_enabled ? 'Yes' : 'No',
          moderatorPassword: item.moderator_pin || '',
          participantPassword: item.participant_pin || '',
          maxMembers: String(item.max_members ?? ''),
          waitForModerator: item.wait_for_moderator ? 'Yes' : 'No',
          sayYourName: item.say_your_name ? 'Yes' : 'No',
          muteParticipant: item.mute_participant ? 'Yes' : 'No',
          allowInvite: item.allow_participant_invite ? 'Yes' : 'No',
          moderatorMembers: Array.isArray(item.moderators)
            ? item.moderators.map((m) => normalizeModeratorValue(m))
            : [],
        }));
        setRows(mapped);

        // Moderator member options: extensions + groups
        try {
          setLoading((prev) => ({ ...prev, ext: true }));
          const mmRes = await listConferenceModeratorMembers();
          const mmMessage = mmRes?.message || mmRes?.data || {};
          const extRaw = Array.isArray(mmMessage?.extensions) ? mmMessage.extensions : [];
          const groupsRaw = Array.isArray(mmMessage?.groups) ? mmMessage.groups : [];

          const extList = extRaw
            .map((e) => {
              if (!e) return null;
              if (typeof e === 'string' || typeof e === 'number') {
                return { value: String(e), label: String(e) };
              }
              const value = e.extension ?? e.value;
              if (value == null) return null;
              const normalizedExtension = normalizeExtensionValue(value);
              if (!normalizedExtension) return null;
              return {
                value: normalizedExtension,
                label: e.display_name || e.label || normalizedExtension,
              };
            })
            .filter(Boolean);
          setAvailableExtensions(extList);

          const groupList = groupsRaw
            .map((g) => {
              if (!g) return null;
              const id = g.id != null ? String(g.id) : '';
              const value = String(g.value || (id ? `group:${id}` : ''));
              if (!value) return null;
              return {
                id: id || value.replace(/^group:/, ''),
                name: g.name || g.label || value,
                label: g.label || g.name || value,
                value,
              };
            })
            .filter(Boolean);
          setExtensionGroups(groupList);
        } catch (err) {
          console.error('Failed to load conference moderator member options:', err);
          // Fallback for older backend APIs
          try {
            const extRes = await listConferenceExtensions();
            const extRaw = Array.isArray(extRes?.message)
              ? extRes.message
              : Array.isArray(extRes?.data)
              ? extRes.data
              : [];
            const extList = extRaw
              .filter((e) => e && e.extension)
              .map((e) => ({
                value: normalizeExtensionValue(e.extension),
                label: e.display_name || normalizeExtensionValue(e.extension),
              }));
            setAvailableExtensions(extList);
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
            const groupList = grpRaw
              .map((g) => {
                if (!g) return null;
                const id = g.id != null ? String(g.id) : '';
                const value = id ? `group:${id}` : '';
                if (!value) return null;
                return {
                  id,
                  name: g.name || value,
                  label: g.label || g.name || value,
                  value,
                };
              })
              .filter(Boolean);
            setExtensionGroups(groupList);
          } catch {
            setExtensionGroups([]);
          }
        } finally {
          setLoading((prev) => ({ ...prev, ext: false }));
        }

        // Greeting options: keep Default + custom prompts from ringback API
        try {
          const gRes = await listRingBackOptions();
          const customPrompts = Array.isArray(gRes?.message?.custom_prompts)
            ? gRes.message.custom_prompts.map((g) => String(g))
            : [];
          const uniqueCustomPrompts = Array.from(new Set(customPrompts.filter(Boolean)));
          setGreetingOptions(['Default', ...uniqueCustomPrompts]);
        } catch (err) {
          console.error('Failed to load conference greeting options:', err);
          setGreetingOptions(['Default']);
        }

      } catch (err) {
        showAlert(err?.message || 'Failed to load conference data.');
      } finally {
        setLoading((prev) => ({ ...prev, list: false }));
      }
    };
    loadInitial();
  }, []);

  const resetForm = () => {
    setEditId(null);
    setRoomName('');
    setConferenceNumber('');
    setGreeting('Default');
    setAnnounce('No');
    setRecord('No');
    setModeratorMembers([]);
    setEnabled('Yes');
    setScheduleStart('');
    setScheduleEnd('');
    setPinEnabled('No');
    setModeratorPassword('');
    setParticipantPassword('');
    setMaxMembers('20');
    setWaitForModerator('Yes');
    setSayYourName('Yes');
    setMuteParticipant('No');
    setAllowInvite('Yes');
    setSelectedGroupIds([]);
    setActiveTab('basic');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = async (row) => {
    let source = row;

    // Use detail API for edit. List API may flatten group moderators into extensions.
    try {
      if (row?.id != null) {
        const detailRes = await getConference(row.id);
        const detail = detailRes?.message || detailRes?.data || {};

        source = {
          ...row,
          roomName: detail?.name ?? row.roomName,
          conferenceNumber:
            detail?.conf_number != null ? String(detail.conf_number) : row.conferenceNumber,
          greeting: detail?.greeting ?? row.greeting,
          announce:
            typeof detail?.announce === 'boolean'
              ? detail.announce
                ? 'Yes'
                : 'No'
              : row.announce,
          record:
            typeof detail?.record === 'boolean' ? (detail.record ? 'Yes' : 'No') : row.record,
          moderatorMembers: Array.isArray(detail?.moderators)
            ? detail.moderators.map((m) => normalizeModeratorValue(m))
            : row.moderatorMembers,
          enabled:
            typeof detail?.enabled === 'boolean' ? (detail.enabled ? 'Yes' : 'No') : row.enabled,
          scheduleStart: toDateTimeLocal(detail?.schedule_start) || row.scheduleStart,
          scheduleEnd: toDateTimeLocal(detail?.schedule_end) || row.scheduleEnd,
          pinEnabled:
            typeof detail?.pin_enabled === 'boolean'
              ? detail.pin_enabled
                ? 'Yes'
                : 'No'
              : row.pinEnabled,
          moderatorPassword: detail?.moderator_pin ?? row.moderatorPassword,
          participantPassword: detail?.participant_pin ?? row.participantPassword,
          maxMembers:
            detail?.max_members != null ? String(detail.max_members) : String(row.maxMembers || ''),
          waitForModerator:
            typeof detail?.wait_for_moderator === 'boolean'
              ? detail.wait_for_moderator
                ? 'Yes'
                : 'No'
              : row.waitForModerator,
          sayYourName:
            typeof detail?.say_your_name === 'boolean'
              ? detail.say_your_name
                ? 'Yes'
                : 'No'
              : row.sayYourName,
          muteParticipant:
            typeof detail?.mute_participant === 'boolean'
              ? detail.mute_participant
                ? 'Yes'
                : 'No'
              : row.muteParticipant,
          allowInvite:
            typeof detail?.allow_participant_invite === 'boolean'
              ? detail.allow_participant_invite
                ? 'Yes'
                : 'No'
              : row.allowInvite,
        };
      }
    } catch (err) {
      console.warn('Failed to fetch conference detail for edit, using list row fallback:', err);
    }

    setEditId(source.id);
    setRoomName(source.roomName || '');
    setConferenceNumber(source.conferenceNumber || '');
    setGreeting(source.greeting || 'Default');
    setAnnounce(source.announce || 'No');
    setRecord(source.record || 'No');
    setModeratorMembers(Array.isArray(source.moderatorMembers) ? source.moderatorMembers : []);
    setEnabled(source.enabled || 'Yes');
    setScheduleStart(source.scheduleStart || '');
    setScheduleEnd(source.scheduleEnd || '');
    setPinEnabled(source.pinEnabled || 'No');
    setModeratorPassword(source.moderatorPassword || '');
    setParticipantPassword(source.participantPassword || '');
    setMaxMembers(source.maxMembers || '20');
    setWaitForModerator(source.waitForModerator || 'Yes');
    setSayYourName(source.sayYourName || 'Yes');
    setMuteParticipant(source.muteParticipant || 'No');
    setAllowInvite(source.allowInvite || 'Yes');
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (loading.save) return;
    setShowModal(false);
    resetForm();
  };

  const handleCheckAll = () => setSelected(rows.map((_, i) => i));
  const handleUncheckAll = () => setSelected([]);
  const handleSelectRow = (idx) => {
    setSelected((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  const handleDelete = () => {
    if (selected.length === 0) {
      showAlert('Please select at least one row to delete.');
      return;
    }
    setLoading((prev) => ({ ...prev, delete: true }));
    (async () => {
      try {
        const toDelete = rows.filter((_, idx) => selected.includes(idx));
        for (const row of toDelete) {
          if (row.id != null) {
            await deleteConference(row.id);
          }
        }
        const res = await listConferences();
        const raw = Array.isArray(res?.message) ? res.message : Array.isArray(res?.data) ? res.data : [];
        const mapped = raw.map((item) => ({
          id: item.id,
          roomName: item.name,
          conferenceNumber: String(item.conf_number),
          greeting: item.greeting,
          announce: item.announce ? 'Yes' : 'No',
          record: item.record ? 'Yes' : 'No',
          enabled: item.enabled ? 'Yes' : 'No',
          scheduleStart: toDateTimeLocal(item.schedule_start),
          scheduleEnd: toDateTimeLocal(item.schedule_end),
          pinEnabled: item.pin_enabled ? 'Yes' : 'No',
          moderatorPassword: item.moderator_pin || '',
          participantPassword: item.participant_pin || '',
          maxMembers: String(item.max_members ?? ''),
          waitForModerator: item.wait_for_moderator ? 'Yes' : 'No',
          sayYourName: item.say_your_name ? 'Yes' : 'No',
          muteParticipant: item.mute_participant ? 'Yes' : 'No',
          allowInvite: item.allow_participant_invite ? 'Yes' : 'No',
          moderatorMembers: Array.isArray(item.moderators)
            ? item.moderators.map((m) => normalizeModeratorValue(m))
            : [],
        }));
        setRows(mapped);
        setSelected([]);
      } catch (err) {
        showAlert(err?.message || 'Failed to delete conference room(s).');
      } finally {
        setLoading((prev) => ({ ...prev, delete: false }));
      }
    })();
  };

  const handleSave = () => {
    const trimmedRoomName = roomName.trim();
    if (!trimmedRoomName) {
      showAlert('Room Name is required.');
      return;
    }
    if (!conferenceNumber.trim()) {
      showAlert('Conference Center Number is required.');
      return;
    }

    const num = parseInt(conferenceNumber.trim(), 10);
    if (Number.isNaN(num) || num < 6400 || num > 6499) {
      showAlert('Conference Center Number must be between 6400 and 6499.');
      return;
    }

    if (!Array.isArray(moderatorMembers) || moderatorMembers.length === 0) {
      showAlert('Please select at least one Moderator Member.');
      return;
    }

    const selectedModeratorExtensions = moderatorMembers.filter(
      (member) => !String(member).startsWith('group:')
    );
    if (selectedModeratorExtensions.length === 0) {
      showAlert('Please select at least one Moderator Member extension. Group only selection is not allowed.');
      return;
    }

    const maxMembersInt = parseInt(maxMembers, 10);
    if (Number.isNaN(maxMembersInt) || maxMembersInt < 1 || maxMembersInt > 200) {
      showAlert('Max Members must be between 1 and 200.');
      return;
    }

    const payloadForApi = {
      name: trimmedRoomName,
      conf_number: num,
      greeting: (greeting || 'Default').toLowerCase(),
      announce: announce === 'Yes',
      record: record === 'Yes',
      enabled: enabled === 'Yes',
      schedule_start: scheduleStart || null,
      schedule_end: scheduleEnd || null,
      pin_enabled: pinEnabled === 'Yes',
      moderator_pin: pinEnabled === 'Yes' ? moderatorPassword || null : null,
      participant_pin: pinEnabled === 'Yes' ? participantPassword || null : null,
      max_members: maxMembersInt,
      wait_for_moderator: waitForModerator === 'Yes',
      say_your_name: sayYourName === 'Yes',
      mute_participant: muteParticipant === 'Yes',
      allow_participant_invite: allowInvite === 'Yes',
      moderators: moderatorMembers.map(String),
    };

    setLoading((prev) => ({ ...prev, save: true }));
    (async () => {
      try {
        if (editId != null) {
          // For now send full payload (backend accepts partial)
          await updateConference(editId, payloadForApi);
        } else {
          await createConference(payloadForApi);
        }

        const res = await listConferences();
        const raw = Array.isArray(res?.message) ? res.message : Array.isArray(res?.data) ? res.data : [];
        const mapped = raw.map((item) => ({
          id: item.id,
          roomName: item.name,
          conferenceNumber: String(item.conf_number),
          greeting: item.greeting,
          announce: item.announce ? 'Yes' : 'No',
          record: item.record ? 'Yes' : 'No',
          enabled: item.enabled ? 'Yes' : 'No',
          scheduleStart: item.schedule_start || '',
          scheduleEnd: item.schedule_end || '',
          pinEnabled: item.pin_enabled ? 'Yes' : 'No',
          moderatorPassword: item.moderator_pin || '',
          participantPassword: item.participant_pin || '',
          maxMembers: String(item.max_members ?? ''),
          waitForModerator: item.wait_for_moderator ? 'Yes' : 'No',
          sayYourName: item.say_your_name ? 'Yes' : 'No',
          muteParticipant: item.mute_participant ? 'Yes' : 'No',
          allowInvite: item.allow_participant_invite ? 'Yes' : 'No',
          moderatorMembers: Array.isArray(item.moderators)
            ? item.moderators.map((m) => normalizeModeratorValue(m))
            : [],
        }));
        setRows(mapped);
        setShowModal(false);
        resetForm();
      } catch (err) {
        showAlert(err?.message || 'Failed to save conference room.');
      } finally {
        setLoading((prev) => ({ ...prev, save: false }));
      }
    })();
  };

  const toggleModeratorMember = (ext) => {
    setModeratorMembers((prev) =>
      prev.includes(ext) ? prev.filter((v) => v !== ext) : [...prev, ext]
    );
  };

  const toggleExtensionGroup = (group) => {
    const groupId = String(group?.id ?? '');
    const groupValue = String(group?.value || (groupId ? `group:${groupId}` : ''));
    if (!groupId || !groupValue) return;

    setModeratorMembers((prev) => {
      if (prev.includes(groupValue)) {
        return prev.filter((v) => v !== groupValue);
      }
      return [...prev, groupValue];
    });
  };

  useEffect(() => {
    const mappedSelected = extensionGroups
      .filter((g) => moderatorMembers.includes(String(g.value || `group:${g.id}`)))
      .map((g) => String(g.id));
    setSelectedGroupIds(mappedSelected);
  }, [moderatorMembers, extensionGroups]);

  return (
    <div className="w-full max-w-full mx-auto p-2">
      <div className="w-full max-w-full mx-auto">
        <div
          className="rounded-t-lg h-8 flex items-center justify-center font-semibold text-[18px] text-[#444] shadow-sm mt-0"
          style={{
            background: 'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
            boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
          }}
        >
          Conference
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] bg-[#f8fafd] border-2 border-t-0 border-gray-400 rounded-b-lg shadow-sm">
            <thead>
              <tr>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center" />
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-10 text-center">
                  #
                </th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">
                  Room Name
                </th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">
                  Conference Number
                </th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">
                  Enabled
                </th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 text-center">
                  Max Members
                </th>
                <th className="bg-white text-gray-800 font-semibold text-sm border border-gray-300 px-3 py-2 w-16 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="border border-gray-300 px-2 py-4 text-center text-gray-500"
                  >
                    No conference rooms yet. Click &quot;Add New&quot; to create one.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  return (
                    <tr key={row.id}>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(realIdx)}
                          onChange={() => handleSelectRow(realIdx)}
                          disabled={loading.delete}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {realIdx + 1}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center font-medium">
                        {row.roomName}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.conferenceNumber}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.enabled}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {row.maxMembers}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            aria-label="Edit conference"
                            onClick={() => handleOpenEditModal(row)}
                            sx={{ color: '#1565c0', padding: '4px' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap justify-between items-center bg-[#e3e7ef] rounded-b-lg border border-t-0 border-gray-300 px-2 py-2 gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              className={`bg-gray-300 text-gray-700 cursor-pointer font-semibold text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                loading.delete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleCheckAll}
              disabled={loading.delete}
            >
              Check All
            </button>
            <button
              className={`bg-gray-300 text-gray-700 font-semibold cursor-pointer text-xs rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                loading.delete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleUncheckAll}
              disabled={loading.delete}
            >
              Uncheck All
            </button>
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 flex items-center gap-1 ${
                loading.delete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleDelete}
              disabled={loading.delete}
            >
              {loading.delete && <CircularProgress size={12} />}
              Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className={`bg-gray-300 text-gray-700 font-semibold text-xs cursor-pointer rounded px-3 py-1 min-w-[80px] shadow hover:bg-gray-400 ${
                loading.save ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleOpenAddModal}
              disabled={loading.save}
            >
              Add New
            </button>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center gap-2 w-full max-w-full mx-auto bg-gray-200 rounded-lg border border-gray-300 border-t-0 mt-1 p-1 text-xs text-gray-700">
            <span>{rows.length} items Total</span>
            <span>{itemsPerPage} Items/Page</span>
            <span>
              {page}/{totalPages}
            </span>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              First
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
            <button
              className="bg-gray-300 text-gray-700 font-semibold text-xs rounded px-2 py-0.5 min-w-[50px] shadow hover:bg-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              Last
            </button>
            <select
              className="text-xs rounded border border-gray-300 px-1 py-0.5 min-w-[40px]"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span>{totalPages} Pages Total</span>
          </div>
        )}
      </div>

      {/* Add / Edit Conference Modal */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        PaperProps={{
          sx: { width: 880, maxWidth: '96vw', mx: 'auto', p: 0 },
        }}
      >
        <DialogTitle
          className="text-white text-center font-semibold p-2 text-base flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444',
          }}
        >
          {editId != null && <EditIcon sx={{ fontSize: 22, opacity: 0.95 }} />}
          {editId != null ? 'Edit Conference' : 'Add Conference'}
        </DialogTitle>
        <DialogContent
          className="pt-0 pb-0 px-0"
          style={{
            backgroundColor: '#dde0e4',
            border: '1px solid #444444',
            borderTop: 'none',
          }}
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-300 bg-white px-4 pt-3">
            <button
              className={`px-4 pb-2 text-sm font-semibold border-b-2 ${
                activeTab === 'basic' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-600'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              BASIC
            </button>
            <button
              className={`px-4 pb-2 text-sm font-semibold border-b-2 ${
                activeTab === 'advanced' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-600'
              }`}
              onClick={() => setActiveTab('advanced')}
            >
              ADVANCED SETTINGS
            </button>
          </div>

          {activeTab === 'basic' ? (
            <div className="pt-3 pb-2 px-3">
              <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
                <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                  Basic
                </div>
                <div className="px-3 py-3 flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {/* Left column */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 180, marginRight: 8 }}
                        >
                          Room Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={roomName}
                          onChange={(e) => setRoomName(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 180, marginRight: 8 }}
                        >
                          Conference Center Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={conferenceNumber}
                          onChange={(e) => setConferenceNumber(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 180, marginRight: 8 }}
                        >
                          Greeting
                        </label>
                        <div className="flex-1 min-w-0">
                          <FormControl
                            size="small"
                            fullWidth
                            sx={{
                              minWidth: 0,
                              '& .MuiSelect-select': {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              },
                            }}
                          >
                            <Select value={greeting} onChange={(e) => setGreeting(e.target.value)} MenuProps={{ PaperProps: { sx: { maxHeight: 280 } } }}>
                              {(greetingOptions.length ? greetingOptions : ['Default']).map(
                                (opt) => (
                                  <MenuItem key={opt} value={opt} sx={{ maxWidth: 420 }}>
                                    {opt}
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 180, marginRight: 8 }}
                        >
                          Announce
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={announce} onChange={(e) => setAnnounce(e.target.value)}>
                              {YES_NO_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 180, marginRight: 8 }}
                        >
                          Record
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={record} onChange={(e) => setRecord(e.target.value)}>
                              {YES_NO_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 170, marginRight: 8 }}
                        >
                          Enabled <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={enabled} onChange={(e) => setEnabled(e.target.value)}>
                              {ENABLE_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 170, marginRight: 8 }}
                        >
                          Schedule Start
                        </label>
                        <input
                          type="datetime-local"
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={scheduleStart}
                          onChange={(e) => setScheduleStart(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 170, marginRight: 8 }}
                        >
                          Schedule End
                        </label>
                        <input
                          type="datetime-local"
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={scheduleEnd}
                          onChange={(e) => setScheduleEnd(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 170, marginRight: 8 }}
                        >
                          Pin
                        </label>
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select
                              value={pinEnabled}
                              onChange={(e) => {
                                setPinEnabled(e.target.value);
                                if (e.target.value === 'No') {
                                  setModeratorPassword('');
                                  setParticipantPassword('');
                                }
                              }}
                            >
                              {YES_NO_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      </div>

                      {pinEnabled === 'Yes' && (
                        <>
                          <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                            <label
                              className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                              style={{ width: 170, marginRight: 8 }}
                            >
                              Moderator Password
                            </label>
                            <input
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                              value={moderatorPassword}
                              onChange={(e) => setModeratorPassword(e.target.value)}
                            />
                          </div>

                          <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                            <label
                              className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                              style={{ width: 170, marginRight: 8 }}
                            >
                              Participant Password
                            </label>
                            <input
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                              value={participantPassword}
                              onChange={(e) => setParticipantPassword(e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 170, marginRight: 8 }}
                        >
                          Max Members
                        </label>
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-[14px] outline-none"
                          value={maxMembers}
                          onChange={(e) => setMaxMembers(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-1 pt-1">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left">
                          Moderator Member
                        </label>
                        <label className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left">
                          Extension Group
                        </label>
                      </div>
                      <div className="flex items-stretch justify-center gap-3">
                        <div className="flex-1 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] overflow-y-auto max-h-36 min-h-[140px]">
                          {availableExtensions.map((ext) => (
                            <label
                              key={ext.value}
                              className="flex items-center gap-2 text-[13px] text-gray-700 py-0.5"
                            >
                              <input
                                type="checkbox"
                                checked={moderatorMembers.includes(ext.value)}
                                onChange={() => toggleModeratorMember(ext.value)}
                              />
                              <span>{ext.label}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex-1 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] overflow-y-auto max-h-36 min-h-[140px]">
                          {extensionGroups.map((group) => (
                            <label
                              key={group.id}
                              className="flex items-center gap-2 text-[13px] text-gray-700 py-0.5"
                            >
                              <input
                                type="checkbox"
                                checked={selectedGroupIds.includes(String(group.id))}
                                onChange={() => toggleExtensionGroup(group)}
                              />
                              <span>{group.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="text-[12px] text-red-600 mt-1">
                        Note: Selecting an extension group will include all members in that group when a moderator dials this conference number.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-3 pb-4 px-4 bg-white">
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <div className="px-3 py-1.5 border-b border-gray-300 text-[13px] font-semibold text-gray-700 bg-[#f5f7fa]">
                  Participant Settings
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 8 }}
                      >
                        Wait for Moderator
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select
                            value={waitForModerator}
                            onChange={(e) => setWaitForModerator(e.target.value)}
                          >
                            {YES_NO_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 8 }}
                      >
                        Say Your Name
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select value={sayYourName} onChange={(e) => setSayYourName(e.target.value)}>
                            {YES_NO_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 8 }}
                      >
                        Mute Participant
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select
                            value={muteParticipant}
                            onChange={(e) => setMuteParticipant(e.target.value)}
                          >
                            {YES_NO_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" style={{ minHeight: 30 }}>
                      <label
                        className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                        style={{ width: 170, marginRight: 8 }}
                      >
                        Allow Participant to Invite
                      </label>
                      <div className="flex-1">
                        <FormControl size="small" fullWidth>
                          <Select value={allowInvite} onChange={(e) => setAllowInvite(e.target.value)}>
                            {YES_NO_OPTIONS.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="p-4 justify-center gap-6">
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: 2,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 8px #b3e0ff',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)',
                color: '#fff',
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666',
              },
            }}
            onClick={handleSave}
            disabled={loading.save}
            startIcon={loading.save && <CircularProgress size={20} color="inherit" />}
          >
            {loading.save ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(to bottom, #e5e7eb 0%, #d1d5db 100%)',
              color: '#374151',
              fontWeight: 600,
              fontSize: '16px',
              borderRadius: 2,
              minWidth: 120,
              minHeight: 40,
              px: 2,
              py: 0.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(to bottom, #d1d5db 0%, #e5e7eb 100%)',
                color: '#374151',
              },
              '&:disabled': {
                background: '#f3f4f6',
                color: '#9ca3af',
              },
            }}
            onClick={handleCloseModal}
            disabled={loading.save}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConferencePage;

