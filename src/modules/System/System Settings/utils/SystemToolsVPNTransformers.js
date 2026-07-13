import { SYSTEM_TOOLS_VPN_INITIAL } from "../../../../constants/SystemToolsVPNConstants";

export const createSystemToolsVPNInitialForm = () => ({ ...SYSTEM_TOOLS_VPN_INITIAL });
export const buildSystemToolsVPNSoftEtherPayload = (form) => ({ ...form });
export const buildSystemToolsVPNSoftEtherProfile = (form, authMethod) => ({
  connectionName: form.connectionName, server: form.server, hub: form.hub, username: form.username,
  password: form.password, port: form.port, authMethod, clientIp: form.clientIp, netmask: form.netmask,
});
