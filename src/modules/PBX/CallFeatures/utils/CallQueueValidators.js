export const validateCallQueueForm = (form) => {
  if (!form.queue_name.trim()) return "Queue Name is required";
  if (!String(form.queue_number).trim()) return "Queue Number is required";
  if (form.pin === "yes" && form.agent_password.length < 2) return "Agent Password must be 2 to 4 digits";
  return null;
};
