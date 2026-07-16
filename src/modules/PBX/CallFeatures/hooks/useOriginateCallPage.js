import { useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  ORIGINATE_CALL_DEFAULT_APP_DATA,
  ORIGINATE_CALL_DEFAULT_APPLICATION,
  ORIGINATE_CALL_DEFAULT_CONTEXT,
  ORIGINATE_CALL_DEFAULT_MODE,
  ORIGINATE_CALL_DEFAULT_PRIORITY,
} from "../../../../constants/OriginateCallConstants";
import { amiOriginate } from "../../../../api/apiService";
import { buildOriginateCallPayload } from "../utils/OriginateCallTransformers";
import { validateOriginateCallForm } from "../utils/OriginateCallValidators";

const ORIGINATE_CALL_COMPACT_MQ = "(max-width: 768px)";

export function useOriginateCallPage() {
  const isCompact = useMediaQuery(ORIGINATE_CALL_COMPACT_MQ);
  const [mode, setMode] = useState(ORIGINATE_CALL_DEFAULT_MODE);

  const [extension, setExtension] = useState("");
  const [name, setName] = useState("");
  const [callerIdName, setCallerIdName] = useState("");
  const [callerIdNumber, setCallerIdNumber] = useState("");

  const [useFixedApp, setUseFixedApp] = useState(true);
  const [application, setApplication] = useState(
    ORIGINATE_CALL_DEFAULT_APPLICATION,
  );
  const [appData, setAppData] = useState(ORIGINATE_CALL_DEFAULT_APP_DATA);

  const [context, setContext] = useState(ORIGINATE_CALL_DEFAULT_CONTEXT);
  const [exten, setExten] = useState("");
  const [priority, setPriority] = useState(ORIGINATE_CALL_DEFAULT_PRIORITY);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleOriginate = async () => {
    const validationError = validateOriginateCallForm({
      extension,
      mode,
      useFixedApp,
      application,
      context,
      exten,
    });
    if (validationError) {
      showMessage("error", validationError);
      return;
    }

    const data = buildOriginateCallPayload({
      mode,
      extension,
      callerIdName,
      callerIdNumber,
      useFixedApp,
      application,
      appData,
      context,
      exten,
      priority,
    });

    setLoading(true);
    try {
      const res = await amiOriginate(data);
      if (res?.response === false) {
        showMessage("error", res?.message || "Originate failed.");
      } else {
        showMessage("success", res?.message || "Originate sent successfully.");
      }
    } catch (err) {
      showMessage("error", err?.message || String(err) || "Originate failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    isCompact,
    mode,
    setMode,
    extension,
    setExtension,
    name,
    setName,
    callerIdName,
    setCallerIdName,
    callerIdNumber,
    setCallerIdNumber,
    useFixedApp,
    setUseFixedApp,
    application,
    setApplication,
    appData,
    setAppData,
    context,
    setContext,
    exten,
    setExten,
    priority,
    setPriority,
    loading,
    message,
    setMessage,
    handleOriginate,
  };
}
