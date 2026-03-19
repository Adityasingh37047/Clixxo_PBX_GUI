import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
} from '@mui/material';
import {
  listConferences,
  createConference,
  updateConference,
  deleteConference,
  listConferenceExtensions,
  listConferenceGreetingOptions,
} from '../api/apiService';

const ENABLE_OPTIONS = ['Yes', 'No'];
const YES_NO_OPTIONS = ['Yes', 'No'];

const ConferencePage = () => {
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
          moderatorMembers: Array.isArray(item.moderators) ? item.moderators.map(String) : [],
        }));
        setRows(mapped);

        // Extensions for moderator list
        try {
          setLoading((prev) => ({ ...prev, ext: true }));
          const extRes = await listConferenceExtensions();
          const extRaw = Array.isArray(extRes?.message)
            ? extRes.message
            : Array.isArray(extRes?.data)
            ? extRes.data
            : [];
          const extList = extRaw
            .filter((e) => e && e.extension)
            .map((e) => ({
              value: String(e.extension),
              label: e.display_name || String(e.extension),
            }));
          setAvailableExtensions(extList);
        } catch (err) {
          console.error('Failed to load conference extensions:', err);
          setAvailableExtensions([]);
        } finally {
          setLoading((prev) => ({ ...prev, ext: false }));
        }

        // Greeting options
        try {
          const gRes = await listConferenceGreetingOptions();
          const gList = Array.isArray(gRes?.message) ? gRes.message : Array.isArray(gRes?.data) ? gRes.data : [];
          const norm = gList.map((g) => String(g));
          setGreetingOptions(norm.length ? norm : ['Default', 'blank', 'busy', 'welcome']);
        } catch (err) {
          console.error('Failed to load conference greeting options:', err);
          setGreetingOptions(['Default', 'blank', 'busy', 'welcome']);
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
    setActiveTab('basic');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (row) => {
    setEditId(row.id);
    setRoomName(row.roomName || '');
    setConferenceNumber(row.conferenceNumber || '');
    setGreeting(row.greeting || 'Default');
    setAnnounce(row.announce || 'No');
    setRecord(row.record || 'No');
    setModeratorMembers(Array.isArray(row.moderatorMembers) ? row.moderatorMembers : []);
    setEnabled(row.enabled || 'Yes');
    setScheduleStart(row.scheduleStart || '');
    setScheduleEnd(row.scheduleEnd || '');
    setPinEnabled(row.pinEnabled || 'No');
    setModeratorPassword(row.moderatorPassword || '');
    setParticipantPassword(row.participantPassword || '');
    setMaxMembers(row.maxMembers || '20');
    setWaitForModerator(row.waitForModerator || 'Yes');
    setSayYourName(row.sayYourName || 'Yes');
    setMuteParticipant(row.muteParticipant || 'No');
    setAllowInvite(row.allowInvite || 'Yes');
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
          moderatorMembers: Array.isArray(item.moderators) ? item.moderators.map(String) : [],
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
          moderatorMembers: Array.isArray(item.moderators) ? item.moderators.map(String) : [],
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
                        <button
                          type="button"
                          className="text-blue-600 text-xs underline"
                          onClick={() => handleOpenEditModal(row)}
                        >
                          Edit
                        </button>
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
          className="text-white text-center font-semibold p-2 text-base"
          style={{
            background: 'linear-gradient(to bottom, #4a5568 0%, #2d3748 50%, #1a202c 100%)',
            borderBottom: '1px solid #444444',
          }}
        >
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
                        <div className="flex-1">
                          <FormControl size="small" fullWidth>
                            <Select value={greeting} onChange={(e) => setGreeting(e.target.value)}>
                              {(greetingOptions.length ? greetingOptions : ['Default', 'blank', 'busy', 'welcome']).map(
                                (opt) => (
                                  <MenuItem key={opt} value={opt}>
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

                      <div className="flex flex-col gap-1" style={{ minHeight: 60 }}>
                        <label
                          className="text-[14px] text-gray-700 font-medium whitespace-nowrap text-left"
                          style={{ width: 150, marginRight: 8 }}
                        >
                          Moderator Member
                        </label>
                        <div className="flex-1 border border-gray-300 bg-white rounded px-2 py-1 text-[14px] overflow-y-auto max-h-32">
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

