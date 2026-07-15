import { DDOS_INITIAL_FORM } from "../../../../constants/DDOSSettingsConstants";

export function createDdosInitialForm() {
  return { ...DDOS_INITIAL_FORM };
}

export function cloneDdosForm(form) {
  return { ...form };
}

export function formatDdosLogEntry(action, ip, port = null) {
  const timestamp = new Date()
    .toLocaleString()
    .replace(",", "")
    .replace(/\//g, "-");
  const portInfo = port ? `, PORT: ${port}` : "";
  return `${timestamp}    ${action} ==> IP: ${ip}${portInfo}\n`;
}

export function formatDdosCommandLogEntry(command, responseData) {
  const timestamp = new Date().toLocaleString();
  return `[${timestamp}] $ ${command}\n${responseData || ""}\n${"=".repeat(80)}\n`;
}

/** Parse `iptables -L INPUT` output into a DDOS form patch. */
export function parseIptablesRulesToForm(rules) {
  const currentForm = { ...DDOS_INITIAL_FORM };

  if (rules.includes("dpt:80") || rules.includes("dpt:443")) {
    currentForm.webPortAttack = true;
    const webLimitMatch = rules.match(/limit (\d+)\/minute/);
    if (webLimitMatch) {
      currentForm.webLimit = parseInt(webLimitMatch[1], 10);
    }
  }

  if (rules.includes("dpt:21")) {
    currentForm.ftpPortAttack = true;
    const ftpLimitMatch = rules.match(/limit (\d+)\/minute/);
    if (ftpLimitMatch) {
      currentForm.ftpLimit = parseInt(ftpLimitMatch[1], 10);
    }
  }

  if (rules.includes("dpt:22")) {
    currentForm.sshPortAttack = true;
    const sshLimitMatch = rules.match(/limit (\d+)\/minute/);
    if (sshLimitMatch) {
      currentForm.sshLimit = parseInt(sshLimitMatch[1], 10);
    }
  }

  if (rules.includes("dpt:23")) {
    currentForm.telnetPortAttack = true;
    const telnetLimitMatch = rules.match(/limit (\d+)\/minute/);
    if (telnetLimitMatch) {
      currentForm.telnetLimit = parseInt(telnetLimitMatch[1], 10);
    }
  }

  if (rules.includes("ddos_blacklist")) {
    if (rules.includes("seconds 999999999")) {
      currentForm.blacklistValidityType = "forever";
    } else {
      currentForm.blacklistValidityType = "inSetTime";
      const timeMatch = rules.match(/seconds (\d+)/);
      if (timeMatch) {
        currentForm.blacklistTime = parseInt(timeMatch[1], 10) / 60;
      }
    }
  }

  return currentForm;
}

export const DDOS_REMOVE_COMMANDS = [
  "iptables -F INPUT",
  "iptables -X ddos_blacklist",
];

/** Build iptables commands for the current form (does not execute). */
export function buildDdosIptablesCommands(form) {
  const commands = [];

  if (form.webPortAttack && form.webLimit) {
    commands.push(
      `iptables -A INPUT -p tcp --dport 80 -m limit --limit ${form.webLimit}/minute -j ACCEPT`,
    );
    commands.push(`iptables -A INPUT -p tcp --dport 80 -j DROP`);
    commands.push(
      `iptables -A INPUT -p tcp --dport 443 -m limit --limit ${form.webLimit}/minute -j ACCEPT`,
    );
    commands.push(`iptables -A INPUT -p tcp --dport 443 -j DROP`);
  }

  if (form.ftpPortAttack && form.ftpLimit) {
    commands.push(
      `iptables -A INPUT -p tcp --dport 21 -m limit --limit ${form.ftpLimit}/minute -j ACCEPT`,
    );
    commands.push(`iptables -A INPUT -p tcp --dport 21 -j DROP`);
  }

  if (form.sshPortAttack && form.sshLimit) {
    commands.push(
      `iptables -A INPUT -p tcp --dport 22 -m limit --limit ${form.sshLimit}/minute -j ACCEPT`,
    );
    commands.push(`iptables -A INPUT -p tcp --dport 22 -j DROP`);
  }

  if (form.telnetPortAttack && form.telnetLimit) {
    commands.push(
      `iptables -A INPUT -p tcp --dport 23 -m limit --limit ${form.telnetLimit}/minute -j ACCEPT`,
    );
    commands.push(`iptables -A INPUT -p tcp --dport 23 -j DROP`);
  }

  if (form.blacklistValidityType === "forever") {
    commands.push(`iptables -A INPUT -m recent --name ddos_blacklist --set`);
    commands.push(
      `iptables -A INPUT -m recent --name ddos_blacklist --rcheck --seconds 999999999 -j DROP`,
    );
  } else if (
    form.blacklistValidityType === "inSetTime" &&
    form.blacklistTime
  ) {
    commands.push(`iptables -A INPUT -m recent --name ddos_blacklist --set`);
    commands.push(
      `iptables -A INPUT -m recent --name ddos_blacklist --rcheck --seconds ${form.blacklistTime * 60} -j DROP`,
    );
  }

  return commands;
}

/** Log messages emitted while configuring (mirrors prior inline addLogEntry calls). */
export function getDdosConfigureLogActions(form) {
  const actions = [];

  if (form.webPortAttack && form.webLimit) {
    actions.push({
      action: "Configure",
      ip: "WEB Port Protection enabled",
      port: `Limit: ${form.webLimit}/min`,
    });
  } else {
    actions.push({ action: "Configure", ip: "WEB Port Protection disabled" });
  }

  if (form.ftpPortAttack && form.ftpLimit) {
    actions.push({
      action: "Configure",
      ip: "FTP Port Protection enabled",
      port: `Limit: ${form.ftpLimit}/min`,
    });
  } else {
    actions.push({ action: "Configure", ip: "FTP Port Protection disabled" });
  }

  if (form.sshPortAttack && form.sshLimit) {
    actions.push({
      action: "Configure",
      ip: "SSH Port Protection enabled",
      port: `Limit: ${form.sshLimit}/min`,
    });
  } else {
    actions.push({ action: "Configure", ip: "SSH Port Protection disabled" });
  }

  if (form.telnetPortAttack && form.telnetLimit) {
    actions.push({
      action: "Configure",
      ip: "TELNET Port Protection enabled",
      port: `Limit: ${form.telnetLimit}/min`,
    });
  } else {
    actions.push({ action: "Configure", ip: "TELNET Port Protection disabled" });
  }

  if (form.blacklistValidityType === "forever") {
    actions.push({
      action: "Configure",
      ip: "Blacklist validity set to Forever",
    });
  } else if (
    form.blacklistValidityType === "inSetTime" &&
    form.blacklistTime
  ) {
    actions.push({
      action: "Configure",
      ip: "Blacklist validity set to Time-based",
      port: `Duration: ${form.blacklistTime} min`,
    });
  }

  return actions;
}
