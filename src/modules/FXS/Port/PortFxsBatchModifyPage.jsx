import React from "react";
import { usePortFxsBatchModifyPage } from "./hooks/usePortFxsBatchModifyPage";
import {
  PortFxsBatchModifyFormBody,
  PortFxsBatchModifyStandaloneShell,
} from "./components/PortFxsBatchModifyFormFields";

const PortFxsBatchModifyPage = ({
  initialPorts: propInitialPorts,
  maxPorts,
  onClose,
  onSaved,
  inDialog = false,
  formId = "fxs-batch-modify-form",
} = {}) => {
  const vm = usePortFxsBatchModifyPage({
    initialPorts: propInitialPorts,
    maxPorts,
    onClose,
    onSaved,
    inDialog,
  });

  const {
    form,
    message,
    setMessage,
    portOptions,
    handleChange,
    handleCheckbox,
    shouldShowField,
    handleSave,
    handleCancel,
  } = vm;

  const formBody = (
    <PortFxsBatchModifyFormBody
      formId={formId}
      form={form}
      portOptions={portOptions}
      inDialog={inDialog}
      message={message}
      setMessage={setMessage}
      handleSave={handleSave}
      handleCancel={handleCancel}
      handleChange={handleChange}
      handleCheckbox={handleCheckbox}
      shouldShowField={shouldShowField}
    />
  );

  if (inDialog) return formBody;

  return (
    <PortFxsBatchModifyStandaloneShell>{formBody}</PortFxsBatchModifyStandaloneShell>
  );
};

export default PortFxsBatchModifyPage;
