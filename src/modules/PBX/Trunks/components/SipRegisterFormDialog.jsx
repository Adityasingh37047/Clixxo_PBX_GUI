import React from "react";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import {
  Btn,
  ExtensionModalTabs as SipRegisterModalTabs,
} from "../../../../components/common";
import {
  trunkModalPaperSx,
  trunkModalTitleStyle,
  trunkModalFormPanelStyle,
  sipRegisterModalDialogContentSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  trunkModalCancelBtnStyle,
  TRUNK_FIELD_LABEL_COLOR,
} from "./SipRegisterFormFields";
import SipRegisterBasicTab from "./SipRegisterBasicTab";
import SipRegisterCodecTab from "./SipRegisterCodecTab";
import SipRegisterAdvanceTab from "./SipRegisterAdvanceTab";
import SipRegisterDodTab from "./SipRegisterDodTab";
import SipRegisterAdaptTab from "./SipRegisterAdaptTab";

function SipRegisterFormDialog(props) {
  const {
    isCompact,
    showModal,
    loading,
    handleCloseModal,
    editIndex,
    modalTab,
    setModalTab,
    modalScrollRef,
    handleSave,
    form,
    validationErrors,
    handleChange,
    ethPortOptions,
    showPassword,
    togglePasswordVisibility,
    selectedCodecList,
    updateCodecList,
    getCodecLabel,
    dnisRows,
    setDnisRows,
    PREFERRED_ASSERTED_IDENTITY_OPTIONS,
    REMOTE_PARTY_ID_OPTIONS,
    CONTACT_MODE_OPTIONS,
    dodRows,
    setDodRows,
    dodSelected,
    setDodSelected,
    showDodAddModal,
    setShowDodAddModal,
    dodAddName,
    setDodAddName,
    dodAddNumber,
    setDodAddNumber,
    dodMemberExtensions,
    setDodMemberExtensions,
    dodAvailableExtensions,
    dodAvailableEmptyText,
    getDodExtLabel,
    handleOpenDodAddModal,
    handleConfirmDodAdd,
    resetDodAddForm,
    showMessage,
    adaptRows,
    setAdaptRows,
  } = props;

  return (
    <Dialog
  open={showModal}
  onClose={loading.save ? null : handleCloseModal}
  maxWidth={false}
  className="z-50"
  sx={{
    "& .MuiDialog-container": {
      alignItems: "flex-start",
      justifyContent: "center",
      pt: isCompact ? 2 : 8,
      px: isCompact ? 1 : 0,
    },
  }}
  PaperProps={{
    sx: {
      ...trunkModalPaperSx,
      ...(isCompact
        ? {
            width: "100%",
            maxWidth: "calc(100vw - 16px)",
            maxHeight: "calc(100vh - 16px)",
            my: 0,
          }
        : {}),
      borderRadius:
        editIndex == null ? "4px" : trunkModalPaperSx.borderRadius,
    },
  }}
  disableRestoreFocus
  disableEnforceFocus
>
  <DialogTitle
    style={{
      ...trunkModalTitleStyle,
      ...(editIndex == null
        ? { borderTopLeftRadius: 4, borderTopRightRadius: 4 }
        : null),
    }}
  >
    {editIndex !== null ? "Edit SIP Register" : "Add SIP Register"}
  </DialogTitle>

  <SipRegisterModalTabs
    value={modalTab}
    onChange={setModalTab}
    fullWidth={!isCompact}
    scrollable={!!isCompact}
    tabs={[
      { id: "basic", label: "BASIC" },
      { id: "codec", label: "CODEC" },
      { id: "advance", label: "ADVANCE" },
      { id: "dod", label: "DOD" },
      { id: "adapt", label: "ADAPT CALLER ID" },
    ]}
  />

  <DialogContent
    ref={modalScrollRef}
    className="app-main-scroll"
    style={{
      padding: isCompact ? "16px 12px" : "24px",
      backgroundColor: "#ffffff",
    }}
    sx={sipRegisterModalDialogContentSx}
  >
    <style>
      {`
  .sip-reg .MuiOutlinedInput-root,
  .sip-reg .MuiSelect-root,
  .sip-reg .MuiSelect-select,
  .sip-reg .MuiInputBase-root input {
    background: #ffffff !important;
  }

  .sip-reg .MuiOutlinedInput-root {
    transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
  }

  .sip-reg .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
    border-color: ${OUTLINED_BORDER} !important;
    border-width: 1px !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
  }

  .sip-reg .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: ${OUTLINED_HOVER} !important;
  }

  .sip-reg .MuiOutlinedInput-root.Mui-focused {
    box-shadow: ${FOCUS_RING_SHADOW} !important;
  }

  .sip-reg .MuiOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline {
    border-color: ${OUTLINED_FOCUS} !important;
    border-width: 1px !important;
  }

  .sip-reg .MuiOutlinedInput-input {
    font-size: 13px !important;
    padding: 8px 12px !important;
  }

  .sip-reg label,
  .sip-reg .MuiFormControlLabel-label,
  .sip-reg .MuiInputLabel-root {
    color: ${TRUNK_FIELD_LABEL_COLOR} !important;
  }

  .sip-reg label {
    text-align: left !important;
  }

  .sip-reg .MuiFormControlLabel-label,
  .sip-reg .MuiInputLabel-root {
    font-size: 13px !important;
    font-weight: 600 !important;
  }

  .sip-reg .MuiFormControlLabel-root {
    margin: 0 !important;
    margin-left: 0 !important;
    align-items: center !important;
  }

`}
    </style>

    <div className="sip-reg" style={trunkModalFormPanelStyle}>
      {modalTab === "basic" && (
        <SipRegisterBasicTab
          form={form}
          validationErrors={validationErrors}
          handleChange={handleChange}
          editIndex={editIndex}
          ethPortOptions={ethPortOptions}
          showPassword={showPassword}
          togglePasswordVisibility={togglePasswordVisibility}
        />
      )}
      {modalTab === "codec" && (
        <SipRegisterCodecTab
          selectedCodecList={selectedCodecList}
          updateCodecList={updateCodecList}
          getCodecLabel={getCodecLabel}
          validationErrors={validationErrors}
        />
      )}
      {modalTab === "advance" && (
        <SipRegisterAdvanceTab
          form={form}
          validationErrors={validationErrors}
          handleChange={handleChange}
          dnisRows={dnisRows}
          setDnisRows={setDnisRows}
          PREFERRED_ASSERTED_IDENTITY_OPTIONS={PREFERRED_ASSERTED_IDENTITY_OPTIONS}
          REMOTE_PARTY_ID_OPTIONS={REMOTE_PARTY_ID_OPTIONS}
          CONTACT_MODE_OPTIONS={CONTACT_MODE_OPTIONS}
        />
      )}
      {modalTab === "dod" && (
        <SipRegisterDodTab
          dodRows={dodRows}
          setDodRows={setDodRows}
          dodSelected={dodSelected}
          setDodSelected={setDodSelected}
          showDodAddModal={showDodAddModal}
          setShowDodAddModal={setShowDodAddModal}
          dodAddName={dodAddName}
          setDodAddName={setDodAddName}
          dodAddNumber={dodAddNumber}
          setDodAddNumber={setDodAddNumber}
          dodMemberExtensions={dodMemberExtensions}
          setDodMemberExtensions={setDodMemberExtensions}
          dodAvailableExtensions={dodAvailableExtensions}
          dodAvailableEmptyText={dodAvailableEmptyText}
          getDodExtLabel={getDodExtLabel}
          handleOpenDodAddModal={handleOpenDodAddModal}
          handleConfirmDodAdd={handleConfirmDodAdd}
          resetDodAddForm={resetDodAddForm}
          showMessage={showMessage}
        />
      )}
      {modalTab === "adapt" && (
        <SipRegisterAdaptTab adaptRows={adaptRows} setAdaptRows={setAdaptRows} />
      )}
    </div>
  </DialogContent>

  <DialogActions
    sx={{ p: 0, m: 0 }}
    style={{
      ...addNewModalFooterStyle,
      ...(editIndex == null
        ? { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }
        : null),
    }}
  >
    <Btn
      variant="primary"
      onClick={handleSave}
      disabled={loading.save}
      style={addNewModalFooterBtnStyle}
    >
      {loading.save ? (
        <>
          <CircularProgress size={14} color="inherit" />
          Saving...
        </>
      ) : (
        "Save"
      )}
    </Btn>
    <Btn
      variant="cancel"
      onClick={handleCloseModal}
      disabled={loading.save}
      style={trunkModalCancelBtnStyle}
    >
      Close
    </Btn>
  </DialogActions>
</Dialog>
  );
}

export default SipRegisterFormDialog;
