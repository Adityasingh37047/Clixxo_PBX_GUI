import React from "react";

import { Alert } from "@mui/material";

import { SIGNALING_CALL_TRACK_TOAST_DEFAULT } from "../../../constants/SignalingCallTrackConstants";

import { useSignalingCallTrackPage } from "./hooks/useSignalingCallTrackPage";

import {

  SignalingCallTrackPageShell,

  SignalingCallTrackBreadcrumb,

  SignalingCallTrackCard,

  signalingCallTrackFixedAlertSx,

} from "./components/SignalingCallTrackFormFields";



const SignalingCallTrack = () => {

  const vm = useSignalingCallTrackPage();

  const {

    outputRef,

    filterType,

    setFilterType,

    filterValue,

    setFilterValue,

    trackMessage,

    isTracking,

    busy,

    toast,

    setToast,

    handleStart,

    handleStop,

    handleFilter,

    handleClear,

    handleDownload,

    hasTrackData,

    canFilter,

  } = vm;



  return (

    <SignalingCallTrackPageShell>

      {toast.msg && (

        <Alert

          severity={toast.type}

          onClose={() => setToast(SIGNALING_CALL_TRACK_TOAST_DEFAULT)}

          sx={signalingCallTrackFixedAlertSx}

        >

          {toast.msg}

        </Alert>

      )}



      <SignalingCallTrackBreadcrumb />



      <SignalingCallTrackCard

        outputRef={outputRef}

        filterType={filterType}

        filterValue={filterValue}

        trackMessage={trackMessage}

        busy={busy}

        isTracking={isTracking}

        hasTrackData={hasTrackData}

        canFilter={canFilter}

        onFilterTypeChange={setFilterType}

        onFilterValueChange={setFilterValue}

        onStart={handleStart}

        onStop={handleStop}

        onFilter={handleFilter}

        onClear={handleClear}

        onDownload={handleDownload}

      />

    </SignalingCallTrackPageShell>

  );

};



export default SignalingCallTrack;

