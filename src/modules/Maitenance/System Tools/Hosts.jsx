import React from "react";

import { Alert } from "@mui/material";

import { HOSTS_MESSAGE_DEFAULT } from "../../../constants/HostsConstants";

import { useHostsPage } from "./hooks/useHostsPage";

import {

  HostsPageShell,

  HostsBreadcrumb,

  HostsCard,

  HostsModal,

  hostsFixedAlertSx,

} from "./components/HostsFormFields";



const Hosts = () => {

  const vm = useHostsPage();

  const {

    hosts,

    selected,

    loading,

    showModal,

    editIndex,

    message,

    setMessage,

    validationErrors,

    form,

    allSelected,

    someSelected,

    handleChange,

    handleOpenModal,

    handleCloseModal,

    handleSave,

    handleSelectRow,

    handleToggleAll,

    handleInverse,

    handleDelete,

    handleClearAll,

  } = vm;



  return (

    <HostsPageShell>

      <HostsBreadcrumb />



      {message.text && (

        <Alert

          severity={message.type}

          onClose={() => setMessage(HOSTS_MESSAGE_DEFAULT)}

          sx={hostsFixedAlertSx}

        >

          {message.text}

        </Alert>

      )}



      <HostsCard

        hosts={hosts}

        selected={selected}

        loading={loading}

        allSelected={allSelected}

        someSelected={someSelected}

        onInverse={handleInverse}

        onClearAll={handleClearAll}

        onDelete={handleDelete}

        onOpenModal={handleOpenModal}

        onToggleAll={handleToggleAll}

        onSelectRow={handleSelectRow}

      />



      <HostsModal

        show={showModal}

        editIndex={editIndex}

        form={form}

        loading={loading}

        validationErrors={validationErrors}

        onChange={handleChange}

        onSave={handleSave}

        onClose={handleCloseModal}

      />

    </HostsPageShell>

  );

};



export default Hosts;

