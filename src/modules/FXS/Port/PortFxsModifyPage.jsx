import React, { forwardRef, useImperativeHandle } from "react";
import { usePortFxsModifyPage } from "./hooks/usePortFxsModifyPage";
import {
  PortFxsModifyFormBody,
  PortFxsModifyStandaloneShell,
} from "./components/PortFxsModifyFormFields";

const PortFxsModifyPage = forwardRef(
  (
    {
      port: propPort,
      initialPortData,
      onSaved,
      onClose,
      inDialog = false,
      formId = "fxs-modify-form",
      maxPorts: propMaxPorts,
      onSavingChange,
    },
    ref,
  ) => {
    const vm = usePortFxsModifyPage({
      port: propPort,
      initialPortData,
      onSaved,
      onClose,
      inDialog,
      maxPorts: propMaxPorts,
      onSavingChange,
    });

    const {
      form,
      loading,
      saving,
      message,
      setMessage,
      portOptions,
      loadPortData,
      handleChange,
      handleCheckbox,
      shouldShowField,
      handleSave,
      handleReset,
      handleCancel,
    } = vm;

    useImperativeHandle(ref, () => ({ reset: loadPortData }), [loadPortData]);

    if (loading && !inDialog) {
      return <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>;
    }

    const formBody = (
      <PortFxsModifyFormBody
        formId={formId}
        form={form}
        portOptions={portOptions}
        inDialog={inDialog}
        saving={saving}
        message={message}
        setMessage={setMessage}
        handleSave={handleSave}
        handleReset={handleReset}
        handleCancel={handleCancel}
        handleChange={handleChange}
        handleCheckbox={handleCheckbox}
        shouldShowField={shouldShowField}
      />
    );

    if (inDialog) return formBody;

    return (
      <PortFxsModifyStandaloneShell>{formBody}</PortFxsModifyStandaloneShell>
    );
  },
);

PortFxsModifyPage.displayName = "PortFxsModifyPage";

export default PortFxsModifyPage;
