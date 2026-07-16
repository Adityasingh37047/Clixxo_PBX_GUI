import React from "react";

import { Alert } from "@mui/material";

import { SIGNALING_CAPTURE_TOAST_DEFAULT } from "../../../constants/SignalingCaptureConstants";

import { useSignalingCapturePage } from "./hooks/useSignalingCapturePage";

import {

  SignalingCapturePageShell,

  SignalingCaptureBreadcrumb,

  SignalingCaptureDataSection,

  SignalingCaptureTsSection,

  SignalingCaptureE1Section,

  SignalingCaptureFooter,

  signalingCaptureFixedAlertSx,

  SIGNALING_CAPTURE_TS_RECORD_PREFIX,

  SIGNALING_CAPTURE_E1_RECORD_PREFIX,

} from "./components/SignalingCaptureFormFields";



const SignalingCapture = () => {

  const vm = useSignalingCapturePage();

  const {

    network,

    setNetwork,

    syslogEnabled,

    setSyslogEnabled,

    syslogDest,

    setSyslogDest,

    networkOptions,

    loading,

    isCapturing,

    isStopping,

    captureStatus,

    toast,

    setToast,

    slotRecording,

    slotStopping,

    ts1Pcm,

    setTs1Pcm,

    ts1Slot,

    setTs1Slot,

    ts2Pcm,

    setTs2Pcm,

    ts2Slot,

    setTs2Slot,

    e1aPcm,

    setE1aPcm,

    e1aSlot,

    setE1aSlot,

    e1bPcm,

    setE1bPcm,

    e1bSlot,

    setE1bSlot,

    dataCaptureLocked,

    anySlotRecording,

    handleStartCapture,

    handleStopCapture,

    handleCleanData,

    handleDownloadLog,

    startSlotRecording,

    stopSlotRecording,

  } = vm;



  return (

    <SignalingCapturePageShell>

      {toast.msg && (

        <Alert

          severity={toast.type}

          onClose={() => setToast(SIGNALING_CAPTURE_TOAST_DEFAULT)}

          sx={signalingCaptureFixedAlertSx}

        >

          {toast.msg}

        </Alert>

      )}



      <SignalingCaptureBreadcrumb />



      <SignalingCaptureDataSection

        network={network}

        networkOptions={networkOptions}

        loading={loading}

        syslogEnabled={syslogEnabled}

        syslogDest={syslogDest}

        dataCaptureLocked={dataCaptureLocked}

        anySlotRecording={anySlotRecording}

        isCapturing={isCapturing}

        isStopping={isStopping}

        captureStatus={captureStatus}

        onNetworkChange={setNetwork}

        onSyslogEnabledChange={setSyslogEnabled}

        onSyslogDestChange={setSyslogDest}

        onStartCapture={handleStartCapture}

        onStopCapture={handleStopCapture}

      />



      <SignalingCaptureTsSection

        rows={[

          {

            pcm: ts1Pcm,

            slot: ts1Slot,

            onPcmChange: setTs1Pcm,

            onSlotChange: setTs1Slot,

          },

          {

            pcm: ts2Pcm,

            slot: ts2Slot,

            onPcmChange: setTs2Pcm,

            onSlotChange: setTs2Slot,

          },

        ]}

        dataCaptureLocked={dataCaptureLocked}

        anySlotRecording={anySlotRecording}

        slotRecording={slotRecording.ts}

        slotStopping={slotStopping.ts}

        onStart={(i, pcm, slot) =>

          startSlotRecording("ts", i, pcm, slot, SIGNALING_CAPTURE_TS_RECORD_PREFIX)

        }

        onStop={(i) => stopSlotRecording("ts", i)}

      />



      <SignalingCaptureE1Section

        rows={[

          {

            pcm: e1aPcm,

            slot: e1aSlot,

            onPcmChange: setE1aPcm,

            onSlotChange: setE1aSlot,

          },

          {

            pcm: e1bPcm,

            slot: e1bSlot,

            onPcmChange: setE1bPcm,

            onSlotChange: setE1bSlot,

          },

        ]}

        dataCaptureLocked={dataCaptureLocked}

        anySlotRecording={anySlotRecording}

        slotRecording={slotRecording.e1}

        slotStopping={slotStopping.e1}

        onStart={(i, pcm, slot) =>

          startSlotRecording("e1", i, pcm, slot, SIGNALING_CAPTURE_E1_RECORD_PREFIX)

        }

        onStop={(i) => stopSlotRecording("e1", i)}

      />



      <SignalingCaptureFooter

        isStopping={isStopping}

        slotStopping={slotStopping}

        onCleanData={handleCleanData}

        onDownloadLog={handleDownloadLog}

      />

    </SignalingCapturePageShell>

  );

};



export default SignalingCapture;

