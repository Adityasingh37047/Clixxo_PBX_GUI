export function validateOriginateCallForm({
  extension,
  mode,
  useFixedApp,
  application,
  context,
  exten,
}) {
  const ext = extension.trim();
  if (!ext) {
    return "Call / Dial this extension is required.";
  }

  if (mode === "simple") {
    if (!useFixedApp) {
      const app = application.trim();
      if (!app) {
        return "Application is required for Simple mode when not using fixed Wait.";
      }
    }
    return null;
  }

  const ctx = context.trim();
  const ex = exten.trim();
  if (!ctx || !ex) {
    return "Context and Extension/Exten are required for two-step mode.";
  }

  return null;
}
