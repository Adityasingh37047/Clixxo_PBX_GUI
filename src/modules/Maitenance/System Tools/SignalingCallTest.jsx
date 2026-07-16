import React from "react";

import { Alert, useMediaQuery } from "@mui/material";

import { SIGNALING_CALL_TEST_DEFAULTS } from "../../../constants/SignalingCallTestConstants";

import { useSignalingCallTestPage } from "./hooks/useSignalingCallTestPage";

import {

  SIGNALING_CALL_TEST_COMPACT_MQ,

  SignalingCallTestPageShell,

  SignalingCallTestBreadcrumb,

  SignalingCallTestCard,

  signalingCallTestFixedAlertSx,

} from "./components/SignalingCallTestFormFields";



const SignalingCallTest = () => {

  const vm = useSignalingCallTestPage();

  const {

    outputRef,

    testType,

    setTestType,

    trunkGroup,

    setTrunkGroup,

    trunkGroupOptions,

    callerId,

    setCallerId,

    calledId,

    setCalledId,

    originalCallee,

    setOriginalCallee,

    trace,

    busy,

    isRunning,

    toast,

    setToast,

    handleStart,

    handleClear,

    canStart,

    hasClearableData,

  } = vm;

  const isCompact = useMediaQuery(SIGNALING_CALL_TEST_COMPACT_MQ);



  return (

    <SignalingCallTestPageShell>

      {toast.msg && (

        <Alert

          severity={toast.type}

          onClose={() => setToast(SIGNALING_CALL_TEST_DEFAULTS.toast)}

          sx={signalingCallTestFixedAlertSx}

        >

          {toast.msg}

        </Alert>

      )}



      <SignalingCallTestBreadcrumb />



      <SignalingCallTestCard

        isCompact={isCompact}

        outputRef={outputRef}

        testType={testType}

        trunkGroup={trunkGroup}

        trunkGroupOptions={trunkGroupOptions}

        callerId={callerId}

        calledId={calledId}

        originalCallee={originalCallee}

        trace={trace}

        busy={busy}

        isRunning={isRunning}

        canStart={canStart}

        hasClearableData={hasClearableData}

        onTestTypeChange={setTestType}

        onTrunkGroupChange={setTrunkGroup}

        onCallerIdChange={setCallerId}

        onCalledIdChange={setCalledId}

        onOriginalCalleeChange={setOriginalCallee}

        onStart={handleStart}

        onClear={handleClear}

      />

    </SignalingCallTestPageShell>

  );

};



export default SignalingCallTest;

