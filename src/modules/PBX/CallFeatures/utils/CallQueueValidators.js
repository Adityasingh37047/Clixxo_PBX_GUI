export const validateCallQueueForm = (form) => {
  if (!form.queue_name.trim()) return "Queue Name is required";
  const trimmedQueueNumber = String(form.queue_number).trim();
  if (!trimmedQueueNumber) return "Queue Number is required";
  if (!/^\d{1,9}$/.test(trimmedQueueNumber)) {
    return "Queue Number must be numeric, 1 to 9 digits";
  }
  if (form.pin === "yes" && form.agent_password.length < 2) return "Agent Password must be 2 to 4 digits";
  return null;
};
