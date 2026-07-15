import { HOSTS_FILE_HEADER } from "../../../../constants/HostsConstants";

export function parseHostsFile(content) {
  const lines = content.split("\n");
  const parsedHosts = [];
  let index = 1;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const parts = trimmedLine.split(/\s+/);
    if (parts.length >= 1 && parts[0]) {
      parsedHosts.push({
        index: index.toString(),
        proxyIp: parts[0],
        domain: parts.length >= 2 ? parts.slice(1).join(" ") : "",
      });
      index++;
    }
  });

  return parsedHosts;
}

export function generateHostsFileContent(hostsList) {
  let content = HOSTS_FILE_HEADER;

  hostsList.forEach((host) => {
    if (host.proxyIp) {
      const domainPart = host.domain ? `  ${host.domain}` : "";
      content += `${host.proxyIp}${domainPart}\n`;
    }
  });

  return content;
}

export function reindexHosts(hostsList) {
  return hostsList.map((host, i) => ({
    ...host,
    index: (i + 1).toString(),
  }));
}

export function createHostsEmptyForm(hostsLength) {
  return {
    index: (hostsLength + 1).toString(),
    proxyIp: "",
    domain: "",
  };
}

export function applyHostsFieldChange(form, key, value) {
  return { ...form, [key]: value };
}

export function toHostsRow(form, hostsLength, editIndex) {
  if (editIndex !== null) {
    return {
      index: form.index,
      proxyIp: form.proxyIp,
      domain: form.domain,
    };
  }
  return {
    index: (hostsLength + 1).toString(),
    proxyIp: form.proxyIp,
    domain: form.domain,
  };
}

export function updateHostsList(hosts, form, editIndex) {
  if (editIndex !== null) {
    const updatedHosts = [...hosts];
    updatedHosts[editIndex] = toHostsRow(form, hosts.length, editIndex);
    return updatedHosts;
  }
  return [...hosts, toHostsRow(form, hosts.length, null)];
}

export function filterHostsByIndices(hosts, selectedIndices) {
  return reindexHosts(
    hosts.filter((_, idx) => !selectedIndices.includes(idx)),
  );
}
