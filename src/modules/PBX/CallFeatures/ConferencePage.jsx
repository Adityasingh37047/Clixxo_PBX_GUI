import React from "react";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select as MuiSelect,
  TextField,
} from "@mui/material";
import {
  CONFERENCE_ENABLE_OPTIONS,
  CONFERENCE_MODAL_TABS,
  CONFERENCE_MODERATOR_NOTE,
  CONFERENCE_YES_NO_OPTIONS,
} from "../../../constants/ConferenceConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as ConferenceBreadcrumb,
  ExtensionTableListLoading as ConferenceTableListLoading,
  ExtensionTableListEmptyState as ConferenceTableListEmptyState,
  ExtensionPagination as ConferencePagination,
  ExtensionModalTabs as ConferenceModalTabs,
  extensionTableCheckboxSx as conferenceTableCheckboxSx,
  extensionFixedAlertSx as conferenceFixedAlertSx,
  extensionPageWrapStyle as conferencePageWrapStyle,
  extensionPageInnerStyle as conferencePageInnerStyle,
  extensionCardStyle as conferenceCardStyle,
  extensionToolbarStyle as conferenceToolbarStyle,
  extensionSelectedBadgeStyle as conferenceSelectedBadgeStyle,
  extensionCancelBtnStyle as conferenceCancelBtnStyle,
  extensionPrimaryBtnStyle as conferencePrimaryBtnStyle,
} from "../../../components/common";
import { useConferencePage } from "./hooks/useConferencePage";
import {
  C,
  conferenceEditIconStyle,
  handleConferenceEditIconHover,
} from "./components/ConferenceTableHelpers";
import {
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  ConferenceFieldRow,
  ConferenceMemberListBox,
  ConferenceSectionHeading,
  conferenceMemberListSubHeadingStyle,
  conferenceModalCancelBtnStyle,
  conferenceModalDialogContentSx,
  conferenceModalPaperSx,
  conferenceModalSectionStyle,
  conferenceModalSelectSx,
  conferenceModalTextFieldFullSx,
  conferenceModalTitleStyle,
} from "./components/ConferenceFormFields";

const ConferencePage = () => {
  const vm = useConferencePage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    activeTab,
    loading,
    message,
    isInitialLoad,
    page,
    itemsPerPage,
    searchQuery,
    editId,
    roomName,
    conferenceNumber,
    greeting,
    announce,
    record,
    moderatorMembers,
    enabled,
    scheduleStart,
    scheduleEnd,
    pinEnabled,
    moderatorPassword,
    participantPassword,
    maxMembers,
    availableExtensions,
    greetingOptions,
    extensionGroups,
    selectedGroupIds,
    waitForModerator,
    sayYourName,
    muteParticipant,
    allowInvite,
    modalScrollRef,
    filteredRows,
    totalPages,
    pagedRows,
    allPageSelected,
    somePageSelected,
    setActiveTab,
    setMessage,
    setRoomName,
    setConferenceNumber,
    setGreeting,
    setAnnounce,
    setRecord,
    setModeratorMembers,
    setEnabled,
    setScheduleStart,
    setScheduleEnd,
    setPinEnabled,
    setModeratorPassword,
    setParticipantPassword,
    setMaxMembers,
    setWaitForModerator,
    setSayYourName,
    setMuteParticipant,
    setAllowInvite,
    handleToggleRow,
    handleToggleAll,
    setPage,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleDelete,
    handleSave,
    toggleModeratorMember,
    toggleExtensionGroup,
  } = vm;
  return (
    <div
      style={{
        ...conferencePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={conferencePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={conferenceFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <ConferenceBreadcrumb section="Call Features" current="Conference" />

        <div style={conferenceCardStyle}>
          <div
            style={{
              ...conferenceToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={conferenceSelectedBadgeStyle}>
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
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={conferenceCancelBtnStyle}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={conferencePrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "hidden", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <ConferenceTableListLoading />
            ) : rows.length === 0 ? (
              <ConferenceTableListEmptyState
                message="No conference rooms found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchQuery && filteredRows.length === 0 ? (
              <ConferenceTableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
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
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={conferenceTableCheckboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Room Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Conference Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Max Members
                    </TH>
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
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";

                    return (
                      <tr
                        key={row.id || realIdx}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={conferenceTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.roomName}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.conferenceNumber}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                              color:
                                row.enabled === "Yes" ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.maxMembers}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            borderRight: "none",
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={conferenceEditIconStyle}
                            onMouseEnter={(e) =>
                              handleConferenceEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleConferenceEditIconHover(e, false)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <ConferencePagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 8,
          },
        }}
        PaperProps={{ sx: { ...conferenceModalPaperSx, borderRadius: editId == null ? "4px" : conferenceModalPaperSx.borderRadius } }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={conferenceModalTitleStyle}>
          {editId != null ? "Edit Conference" : "Add Conference"}
        </DialogTitle>
        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          sx={{
            ...conferenceModalDialogContentSx,
            padding: "0 24px 20px",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              borderBottom: `1px solid ${C.divider}`,
              background: "#ffffff",
              marginLeft: -24,
              marginRight: -24,
            }}
          >
            <ConferenceModalTabs
              value={activeTab}
              onChange={setActiveTab}
              tabs={CONFERENCE_MODAL_TABS}
            />
          </div>
          <div style={{ background: "#ffffff" }}>
            <div
              style={{
                padding: 0,
              }}
            >
              {/* ── BASIC TAB ── */}
              {activeTab === "basic" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div style={conferenceModalSectionStyle}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                        gap: "16px 32px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <ConferenceFieldRow
                          label="Room Name"
                          tooltipKey="room_name"
                          required
                        >
                          <TextField
                            size="small"
                            fullWidth
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Conference Number"
                          tooltipKey="conference_number"
                          required
                        >
                          <TextField
                            size="small"
                            fullWidth
                            value={conferenceNumber}
                            onChange={(e) =>
                              setConferenceNumber(e.target.value)
                            }
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Greeting"
                          tooltipKey="greeting"
                          required
                        >
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={greeting}
                            onChange={(e) => setGreeting(e.target.value)}
                            MenuProps={{
                              PaperProps: { sx: { maxHeight: 280 } },
                            }}
                            sx={conferenceModalSelectSx}
                          >
                            {(greetingOptions.length
                              ? greetingOptions
                              : ["Default"]
                            ).map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Announce"
                          tooltipKey="announce"
                          required
                        >
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={announce}
                            onChange={(e) => setAnnounce(e.target.value)}
                            sx={conferenceModalSelectSx}
                          >
                            {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Record"
                          tooltipKey="record"
                          required
                        >
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={record}
                            onChange={(e) => setRecord(e.target.value)}
                            sx={conferenceModalSelectSx}
                          >
                            {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </ConferenceFieldRow>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <ConferenceFieldRow
                          label="Enabled"
                          tooltipKey="enabled"
                          required
                        >
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={enabled}
                            onChange={(e) => setEnabled(e.target.value)}
                            sx={conferenceModalSelectSx}
                          >
                            {CONFERENCE_ENABLE_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Schedule Start"
                          tooltipKey="schedule_start"
                          required
                        >
                          <TextField
                            size="small"
                            fullWidth
                            type="datetime-local"
                            value={scheduleStart}
                            onChange={(e) => setScheduleStart(e.target.value)}
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Schedule End"
                          tooltipKey="schedule_end"
                          required
                        >
                          <TextField
                            size="small"
                            fullWidth
                            type="datetime-local"
                            value={scheduleEnd}
                            onChange={(e) => setScheduleEnd(e.target.value)}
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                        <ConferenceFieldRow
                          label="Pin"
                          tooltipKey="pin"
                          required
                        >
                          <MuiSelect
                            size="small"
                            fullWidth
                            value={pinEnabled}
                            onChange={(e) => {
                              setPinEnabled(e.target.value);
                              if (e.target.value === "No") {
                                setModeratorPassword("");
                                setParticipantPassword("");
                              }
                            }}
                            sx={conferenceModalSelectSx}
                          >
                            {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {opt}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </ConferenceFieldRow>
                        {pinEnabled === "Yes" && (
                          <>
                            <ConferenceFieldRow label="Moderator Password">
                              <TextField
                                size="small"
                                fullWidth
                                value={moderatorPassword}
                                onChange={(e) =>
                                  setModeratorPassword(e.target.value)
                                }
                                sx={conferenceModalTextFieldFullSx}
                              />
                            </ConferenceFieldRow>
                            <ConferenceFieldRow label="Participant Password">
                              <TextField
                                size="small"
                                fullWidth
                                value={participantPassword}
                                onChange={(e) =>
                                  setParticipantPassword(e.target.value)
                                }
                                sx={conferenceModalTextFieldFullSx}
                              />
                            </ConferenceFieldRow>
                          </>
                        )}
                        <ConferenceFieldRow
                          label="Max Members"
                          tooltipKey="max_members"
                        >
                          <TextField
                            size="small"
                            fullWidth
                            value={maxMembers}
                            onChange={(e) => setMaxMembers(e.target.value)}
                            sx={conferenceModalTextFieldFullSx}
                          />
                        </ConferenceFieldRow>
                      </div>
                    </div>

                    <ConferenceSectionHeading title="Moderator Member" required />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                        gap: 24,
                      }}
                    >
                      <div>
                        <div style={conferenceMemberListSubHeadingStyle}>
                          Extensions
                        </div>
                        <ConferenceMemberListBox
                          items={availableExtensions}
                          emptyText="No extension"
                          renderItem={(ext) => (
                            <label
                              key={ext.value}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={moderatorMembers.includes(ext.value)}
                                onChange={() =>
                                  toggleModeratorMember(ext.value)
                                }
                                sx={conferenceTableCheckboxSx}
                              />
                              <span
                                style={{ fontSize: 13, color: C.labelText }}
                              >
                                {ext.label}
                              </span>
                            </label>
                          )}
                        />
                      </div>
                      <div>
                        <div style={conferenceMemberListSubHeadingStyle}>
                          Extension Group
                        </div>
                        <ConferenceMemberListBox
                          items={extensionGroups}
                          emptyText="No extension group"
                          renderItem={(group) => (
                            <label
                              key={group.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                              }}
                            >
                              <Checkbox
                                size="small"
                                checked={selectedGroupIds.includes(
                                  String(group.id),
                                )}
                                onChange={() => toggleExtensionGroup(group)}
                                sx={conferenceTableCheckboxSx}
                              />
                              <span
                                style={{ fontSize: 13, color: C.labelText }}
                              >
                                {group.name}
                              </span>
                            </label>
                          )}
                        />
                      </div>
                    </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.accent,
                          marginTop: 8,
                          fontWeight: 400,
                          textAlign: "center",
                        }}
                      >
                        {CONFERENCE_MODERATOR_NOTE}
                      </div>
                  </div>
                </div>
              )}

              {activeTab === "advanced" && (
                <div style={conferenceModalSectionStyle}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
                      gap: "16px 32px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <ConferenceFieldRow
                        label="Wait for Moderator"
                        tooltipKey="wait_for_moderator"
                      >
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={waitForModerator}
                          onChange={(e) => setWaitForModerator(e.target.value)}
                          sx={conferenceModalSelectSx}
                        >
                          {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </ConferenceFieldRow>
                      <ConferenceFieldRow
                        label="Say Your Name"
                        tooltipKey="say_your_name"
                      >
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={sayYourName}
                          onChange={(e) => setSayYourName(e.target.value)}
                          sx={conferenceModalSelectSx}
                        >
                          {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </ConferenceFieldRow>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <ConferenceFieldRow
                        label="Mute Participant"
                        tooltipKey="mute_participant"
                      >
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={muteParticipant}
                          onChange={(e) => setMuteParticipant(e.target.value)}
                          sx={conferenceModalSelectSx}
                        >
                          {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </ConferenceFieldRow>
                      <ConferenceFieldRow
                        label="Allow Participant to Invite"
                        tooltipKey="allow_participant_invite"
                      >
                        <MuiSelect
                          size="small"
                          fullWidth
                          value={allowInvite}
                          onChange={(e) => setAllowInvite(e.target.value)}
                          sx={conferenceModalSelectSx}
                        >
                          {CONFERENCE_YES_NO_OPTIONS.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </ConferenceFieldRow>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress
                size={13}
                style={{ color: "#fff", marginRight: 8 }}
              />
            ) : null}
            {loading.save
              ? "Saving..."
              : editId != null
                ? "Update Conference"
                : "Create Conference"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={conferenceModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConferencePage;
