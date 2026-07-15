import { useState } from "react";
import { postLinuxCmd } from "../../../../api/apiService";
import {
  FACTORY_RESET_CONFIRM,
  FACTORY_RESET_MESSAGES,
  FACTORY_RESET_TOAST_DEFAULT,
  FACTORY_RESET_TOAST_DURATION_MS,
} from "../../../../constants/FactoryResetConstants";
import {
  getFactoryResetCommand,
  extractFactoryResetErrorOutput,
} from "../utils/FactoryResetTransformers";
import { shouldProceedFactoryReset } from "../utils/FactoryResetValidators";

export function useFactoryResetPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(FACTORY_RESET_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(FACTORY_RESET_TOAST_DEFAULT),
      FACTORY_RESET_TOAST_DURATION_MS,
    );
  };

  const performReset = async () => {
    setLoading(true);
    try {
      const cmd = getFactoryResetCommand();
      const apiResponse = await postLinuxCmd({ cmd });

      if (apiResponse?.response) {
        showToast(FACTORY_RESET_MESSAGES.SUCCESS, "success");
      } else {
        const output = extractFactoryResetErrorOutput(apiResponse);
        showToast(output || FACTORY_RESET_MESSAGES.COMMAND_FAILED, "error");
      }
    } catch (error) {
      console.error("Factory reset error:", error);
      showToast(error.message || FACTORY_RESET_MESSAGES.RESET_FAILED, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const first = window.confirm(FACTORY_RESET_CONFIRM.FIRST);
    if (!first) return;
    const second = window.confirm(FACTORY_RESET_CONFIRM.SECOND);
    if (!shouldProceedFactoryReset(first, second)) return;
    await performReset();
  };

  return {
    loading,
    toast,
    setToast,
    handleReset,
  };
}
