/**
 * Validate an iptables command string for Access Control.
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateAccessControlCommand(command) {
  const trimmedCmd = String(command || "").trim();

  if (!trimmedCmd) {
    return { valid: false, error: "Please enter a command" };
  }

  const iptablesPattern = /^(sudo\s+)?iptables\s+/i;
  if (!iptablesPattern.test(trimmedCmd)) {
    return {
      valid: false,
      error:
        'Invalid command. Command must start with "iptables" or "sudo iptables"',
    };
  }

  const parts = trimmedCmd.split(/\s+/);
  const iptablesIndex = parts.findIndex(
    (p) => p.toLowerCase() === "iptables",
  );

  if (iptablesIndex === -1) {
    return {
      valid: false,
      error: 'Invalid command format. Command must contain "iptables"',
    };
  }

  if (parts.length <= iptablesIndex + 1) {
    return {
      valid: false,
      error: 'Invalid command. Command must include options after "iptables"',
    };
  }

  const validOperations = [
    "-A",
    "-I",
    "-D",
    "-R",
    "-P",
    "-F",
    "-X",
    "-N",
    "-E",
    "-L",
    "-S",
    "-C",
    "-Z",
  ];
  const hasValidOperation = parts.some((part) =>
    validOperations.includes(part),
  );

  if (!hasValidOperation) {
    return {
      valid: false,
      error:
        "Invalid command. Command must include a valid iptables operation (e.g., -A, -I, -D, -P, etc.)",
    };
  }

  return { valid: true, error: null };
}
