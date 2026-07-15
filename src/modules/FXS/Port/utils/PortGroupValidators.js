export function validatePortGroupForm(form) {
  if (!form.description.trim()) {
    return { valid: false, message: "Please enter a description!" };
  }

  if (!form.ports.some(Boolean)) {
    return { valid: false, message: "Please choose a port!" };
  }

  return { valid: true };
}

export function isPortGroupErrorMessage(msg) {
  return (
    /error|failed|required|please|invalid|must|choose|select|no port groups/i.test(
      msg,
    ) && !/successfully/i.test(msg)
  );
}
