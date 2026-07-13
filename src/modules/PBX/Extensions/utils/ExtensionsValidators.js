// Field/form validators for the Extensions page (pure).
  const validateExtension = (v) =>
    !v || !v.trim() ? "Extension is required" : null;
  const validateContext = (v) =>
    !v || !v.trim() ? "Context is required" : null;
  const validateAllowCodecs = (v) =>
    !v || !v.trim() ? "Allow Codecs is required" : null;
  const validatePassword = (v) => {
    if (!v || !v.trim()) return "Password is required";
    if (v.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(v))
      return "Password must include at least one uppercase letter";
    if (!/[0-9]/.test(v)) return "Password must include at least one number";
    if (!/[^a-zA-Z0-9]/.test(v))
      return "Password must include at least one special character";
    return null;
  };

const validateForm = (form) => {
  const errors = {};
  const e = validateExtension(form.extension);
  if (e) errors.extension = e;
  const p = validatePassword(form.password);
  if (p) errors.password = p;
  const c = validateContext(form.context);
  if (c) errors.context = c;
  const a = validateAllowCodecs(form.allow_codecs);
  if (a) errors.allow_codecs = a;
  return errors;
};

export {
  validateExtension,
  validateContext,
  validateAllowCodecs,
  validatePassword,
  validateForm,
};
