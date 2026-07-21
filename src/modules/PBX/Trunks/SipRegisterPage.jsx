import React from "react";
import {
  ExtensionBreadcrumb as SipRegisterBreadcrumb,
  ExtensionPagination as SipRegisterPagination,
  MessageBanner,
  extensionPageWrapStyle as sipRegisterPageWrapStyle,
  extensionPageInnerStyle as sipRegisterPageInnerStyle,
  extensionCardStyle as sipRegisterCardStyle,
} from "../../../components/common";
import { useSipRegisterPage } from "./hooks/useSipRegisterPage";
import SipRegisterToolbar from "./components/SipRegisterToolbar";
import SipRegisterTable from "./components/SipRegisterTable";
import SipRegisterFormDialog from "./components/SipRegisterFormDialog";

const SipRegisterPage = () => {
  const vm = useSipRegisterPage();
  const {
    isCompact,
    message,
    setMessage,
    isInitialLoad,
    filteredRows,
    page,
    totalPages,
    pagedRows,
    handlePageChange,
    selectedIds,
    loading,
    trunks,
    handleInverse,
    handleClearAll,
    handleDelete,
    handleOpenModal,
    dataEmpty,
    tableScrollRef,
    allowHorizontalScroll,
    tableMinWidth,
    allPageSelected,
    somePageSelected,
    handleToggleAll,
    itemsPerPage,
    handleToggleRow,
    showModal,
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
  } = vm;

  return (
    <div
      style={{
        ...sipRegisterPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={sipRegisterPageInnerStyle}>
        <MessageBanner
          message={message}
          onClose={() => setMessage({ type: "", text: "" })}
        />

        <SipRegisterBreadcrumb section="Trunks" current="SIP Register" />

        <div style={sipRegisterCardStyle}>
          <SipRegisterToolbar
            isCompact={isCompact}
            selectedIds={selectedIds}
            loading={loading}
            trunks={trunks}
            handleInverse={handleInverse}
            handleClearAll={handleClearAll}
            handleDelete={handleDelete}
            handleOpenModal={handleOpenModal}
          />

          <SipRegisterTable
            isInitialLoad={isInitialLoad}
            dataEmpty={dataEmpty}
            tableScrollRef={tableScrollRef}
            allowHorizontalScroll={allowHorizontalScroll}
            tableMinWidth={tableMinWidth}
            allPageSelected={allPageSelected}
            somePageSelected={somePageSelected}
            handleToggleAll={handleToggleAll}
            pagedRows={pagedRows}
            page={page}
            itemsPerPage={itemsPerPage}
            selectedIds={selectedIds}
            handleToggleRow={handleToggleRow}
            loading={loading}
            handleOpenModal={handleOpenModal}
          />

          {!isInitialLoad && filteredRows.length > 0 && (
            <SipRegisterPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      <SipRegisterFormDialog
        showModal={showModal}
        loading={loading}
        handleCloseModal={handleCloseModal}
        editIndex={editIndex}
        modalTab={modalTab}
        setModalTab={setModalTab}
        modalScrollRef={modalScrollRef}
        handleSave={handleSave}
        form={form}
        validationErrors={validationErrors}
        handleChange={handleChange}
        ethPortOptions={ethPortOptions}
        showPassword={showPassword}
        togglePasswordVisibility={togglePasswordVisibility}
        selectedCodecList={selectedCodecList}
        updateCodecList={updateCodecList}
        getCodecLabel={getCodecLabel}
        dnisRows={dnisRows}
        setDnisRows={setDnisRows}
        PREFERRED_ASSERTED_IDENTITY_OPTIONS={PREFERRED_ASSERTED_IDENTITY_OPTIONS}
        REMOTE_PARTY_ID_OPTIONS={REMOTE_PARTY_ID_OPTIONS}
        CONTACT_MODE_OPTIONS={CONTACT_MODE_OPTIONS}
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
        adaptRows={adaptRows}
        setAdaptRows={setAdaptRows}
      />
    </div>
  );
};

export default SipRegisterPage;
