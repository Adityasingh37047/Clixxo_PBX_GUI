/** Builds callerid string for AMI: "Name" <number> or number only */
export function buildCallerId(name, number) {
  const n = (number || "").trim();
  const nm = (name || "").trim();
  if (nm && n) return `"${nm}" <${n}>`;
  if (n) return n;
  if (nm) return nm;
  return undefined;
}

export function buildOriginateCallPayload({
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
}) {
  const ext = extension.trim();
  const callerid = buildCallerId(callerIdName, callerIdNumber);
  const data = { extension: ext };
  if (callerid) data.callerid = callerid;

  if (mode === "simple") {
    if (useFixedApp) {
      data.application = "Wait";
      data.appData = appData.trim() || "30";
    } else {
      const app = application.trim();
      data.application = app;
      if (appData.trim()) data.appData = appData.trim();
    }
  } else {
    const ctx = context.trim();
    const ex = exten.trim();
    data.context = ctx;
    data.exten = ex;
    const pri = parseInt(priority, 10);
    data.priority = Number.isFinite(pri) && pri >= 0 ? pri : 1;
  }

  return data;
}
