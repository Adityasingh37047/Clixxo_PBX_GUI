import axiosInstance from "./axiosInstance";
import axios from "axios";

// GROUP API Functions
export const listTrunkIds = async () => {
  try {
    const response = await axiosInstance.post("/group", {
      type: "list_trunk_id"
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching trunk IDs:", error.message);
    throw error;
  }
};

// Conference API
export const listConferences = async () => {
  try {
    const response = await axiosInstance.post('/conference', {
      type: 'list',
    });
    return response.data;
  } catch (error) {
    console.error('Error listing conferences:', error.message);
    throw error;
  }
};

export const getConference = async (id) => {
  try {
    const response = await axiosInstance.post('/conference', {
      type: 'get',
      id: Number(id),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conference:', error.message);
    throw error;
  }
};

export const createConference = async (data) => {
  try {
    const response = await axiosInstance.post('/conference', {
      type: 'create',
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating conference:', error.message);
    throw error;
  }
};

export const updateConference = async (id, data) => {
  try {
    const response = await axiosInstance.post('/conference', {
      type: 'update',
      id: Number(id),
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating conference:', error.message);
    throw error;
  }
};

export const deleteConference = async (id) => {
  try {
    const response = await axiosInstance.post('/conference', {
      type: 'delete',
      id: Number(id),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting conference:', error.message);
    throw error;
  }
};

export const listConferenceExtensions = async () => {
  try {
    const response = await axiosInstance.post('/conference', {
      type: 'list_extensions',
    });
    return response.data;
  } catch (error) {
    console.error('Error listing conference extensions:', error.message);
    throw error;
  }
};

export const listConferenceModeratorMembers = async () => {
  try {
    const response = await axiosInstance.post('/conference', {
      type: 'list_moderator_members',
    });
    return response.data;
  } catch (error) {
    console.error('Error listing conference moderator members:', error.message);
    throw error;
  }
};

export const listConferenceGreetingOptions = async () => {
  try {
    const response = await axiosInstance.post('/conference', {
      type: 'list_greeting_options',
    });
    return response.data;
  } catch (error) {
    console.error('Error listing conference greeting options:', error.message);
    throw error;
  }
};

// Pickup Group API
export const listPickupGroups = async () => {
  try {
    const response = await axiosInstance.post('/pickup-group', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing pickup groups:', error.message);
    throw error;
  }
};

export const listPickupGroupExtensions = async () => {
  try {
    const response = await axiosInstance.post('/pickup-group', { type: 'list_extensions' });
    return response.data;
  } catch (error) {
    console.error('Error listing pickup group extensions:', error.message);
    throw error;
  }
};

export const createPickupGroup = async (name, members) => {
  try {
    const response = await axiosInstance.post('/pickup-group', {
      type: 'create',
      name,
      members,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating pickup group:', error.message);
    throw error;
  }
};

export const updatePickupGroup = async (id, data) => {
  try {
    const response = await axiosInstance.post('/pickup-group', {
      type: 'update',
      id: Number(id),
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating pickup group:', error.message);
    throw error;
  }
};

export const deletePickupGroup = async (id) => {
  try {
    const response = await axiosInstance.post('/pickup-group', {
      type: 'delete',
      id: Number(id),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting pickup group:', error.message);
    throw error;
  }
};

// Ring Group API
export const listRingGroups = async () => {
  try {
    const response = await axiosInstance.post('/ring-group', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing ring groups:', error.message);
    throw error;
  }
};

export const createRingGroup = async (data) => {
  try {
    const response = await axiosInstance.post('/ring-group', {
      type: 'create',
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating ring group:', error.message);
    throw error;
  }
};

export const updateRingGroup = async (id, data) => {
  try {
    const response = await axiosInstance.post('/ring-group', {
      type: 'update',
      id: Number(id),
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating ring group:', error.message);
    throw error;
  }
};

export const deleteRingGroup = async (id) => {
  try {
    const response = await axiosInstance.post('/ring-group', {
      type: 'delete',
      id: Number(id),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting ring group:', error.message);
    throw error;
  }
};

/** Ring back dropdown: MOH categories, custom prompts, country tones (POST /api/ring-group). */
export const listRingBackOptions = async () => {
  try {
    const response = await axiosInstance.post('/ring-group', { type: 'list_ringback_options' });
    return response.data;
  } catch (error) {
    console.error('Error listing ring back options:', error.message);
    throw error;
  }
};

// Private Group API
export const listPrivateGroups = async () => {
  try {
    const response = await axiosInstance.post('/private-group', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing private groups:', error.message);
    throw error;
  }
};

export const createPrivateGroup = async (data) => {
  try {
    const response = await axiosInstance.post('/private-group', {
      type: 'create',
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating private group:', error.message);
    throw error;
  }
};

export const updatePrivateGroup = async (id, data) => {
  try {
    const response = await axiosInstance.post('/private-group', {
      type: 'update',
      id: Number(id),
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating private group:', error.message);
    throw error;
  }
};

export const deletePrivateGroup = async (id) => {
  try {
    const response = await axiosInstance.post('/private-group', {
      type: 'delete',
      id: Number(id),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting private group:', error.message);
    throw error;
  }
};

// Paging API
const isPagingTypeValidationError = (resOrErr) => {
  const message =
    resOrErr?.message ||
    resOrErr?.response?.data?.message ||
    resOrErr?.response?.message ||
    '';
  return /type must be one of:\s*one-way,\s*two-way/i.test(String(message));
};

export const listPagingGroups = async () => {
  try {
    const primary = await axiosInstance.post('/paging', { type: 'list' });
    if (primary?.data?.response === false && isPagingTypeValidationError(primary?.data)) {
      const fallback = await axiosInstance.post('/paging', {
        action: 'list',
        request_type: 'list',
      });
      return fallback.data;
    }
    return primary.data;
  } catch (error) {
    console.error('Error listing paging groups:', error.message);
    throw error;
  }
};

export const createPagingGroup = async (data) => {
  try {
    const primaryPayload = {
      type: 'create',
      ...data,
    };
    const primary = await axiosInstance.post('/paging', primaryPayload);
    if (primary?.data?.response === false && isPagingTypeValidationError(primary?.data)) {
      const fallbackPayload = {
        action: 'create',
        request_type: 'create',
        name: data?.name,
        page_number: data?.page_number,
        type: data?.pagingMode || data?.page_type || data?.paging_type || 'one-way',
        cid_name_prefix: data?.cid_name_prefix || '',
        members: Array.isArray(data?.members) ? data.members : [],
      };
      const fallback = await axiosInstance.post('/paging', fallbackPayload);
      return fallback.data;
    }
    return primary.data;
  } catch (error) {
    console.error('Error creating paging group:', error.message);
    throw error;
  }
};

export const updatePagingGroup = async (id, data) => {
  try {
    const primaryPayload = {
      type: 'update',
      id: Number(id),
      ...data,
    };
    const primary = await axiosInstance.post('/paging', primaryPayload);
    if (primary?.data?.response === false && isPagingTypeValidationError(primary?.data)) {
      const fallbackPayload = {
        action: 'update',
        request_type: 'update',
        id: Number(id),
        name: data?.name,
        page_number: data?.page_number,
        type: data?.pagingMode || data?.page_type || data?.paging_type || 'one-way',
        cid_name_prefix: data?.cid_name_prefix || '',
        members: Array.isArray(data?.members) ? data.members : [],
      };
      const fallback = await axiosInstance.post('/paging', fallbackPayload);
      return fallback.data;
    }
    return primary.data;
  } catch (error) {
    console.error('Error updating paging group:', error.message);
    throw error;
  }
};

export const deletePagingGroup = async (id) => {
  try {
    const primary = await axiosInstance.post('/paging', {
      type: 'delete',
      id: Number(id),
    });
    if (primary?.data?.response === false && isPagingTypeValidationError(primary?.data)) {
      const fallback = await axiosInstance.post('/paging', {
        action: 'delete',
        request_type: 'delete',
        id: Number(id),
      });
      return fallback.data;
    }
    return primary.data;
  } catch (error) {
    console.error('Error deleting paging group:', error.message);
    throw error;
  }
};

// IVR API Functions
export const listIvrs = async () => {
  try {
    const response = await axiosInstance.post('/ivr', {
      type: 'list',
      data: {},
    });
    return response.data;
  } catch (error) {
    console.error('Error listing IVRs:', error.message);
    throw error;
  }
};

export const getIvr = async (id) => {
  try {
    const response = await axiosInstance.post('/ivr', {
      type: 'get',
      data: { id: Number(id) },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching IVR:', error.message);
    throw error;
  }
};

export const createIvr = async (data) => {
  try {
    const response = await axiosInstance.post('/ivr', {
      type: 'create',
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating IVR:', error.message);
    throw error;
  }
};

export const updateIvr = async (id, data) => {
  try {
    const response = await axiosInstance.post('/ivr', {
      type: 'update',
      data: { id: Number(id), ...data },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating IVR:', error.message);
    throw error;
  }
};

export const deleteIvr = async (id) => {
  try {
    const response = await axiosInstance.post('/ivr', {
      type: 'delete',
      data: { id: Number(id) },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting IVR:', error.message);
    throw error;
  }
};

export const listIvrOptions = async () => {
  try {
    const response = await axiosInstance.post('/ivr', {
      type: 'list_ivr_options',
      data: {},
    });
    return response.data;
  } catch (error) {
    console.error('Error listing IVR options:', error.message);
    throw error;
  }
};

export const getIvrKeys = async (id) => {
  try {
    const response = await axiosInstance.post('/ivr', {
      type: 'get_keys',
      data: { id: Number(id) },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching IVR key actions:', error.message);
    throw error;
  }
};

export const setIvrKeys = async (id, keyActions) => {
  try {
    const response = await axiosInstance.post('/ivr', {
      type: 'set_keys',
      data: {
        id: Number(id),
        key_actions: keyActions,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving IVR key actions:', error.message);
    throw error;
  }
};

export const listIvrDestinations = async () => {
  try {
    // Preferred unified destinations endpoint
    const response = await axiosInstance.get('/destinations');
    return response.data;
  } catch (error) {
    // Backward-compatible fallback for older backends
    try {
      const fallback = await axiosInstance.post('/ivr', {
        type: 'list_destinations',
        data: {},
      });
      return fallback.data;
    } catch (fallbackError) {
      console.error('Error listing IVR destinations:', fallbackError.message);
      throw fallbackError;
    }
  }
};

export const listIvrDirectOutboundOptions = async () => {
  try {
    const response = await axiosInstance.post('/ivr', {
      type: 'list_direct_outbound_options',
      data: {},
    });
    return response.data;
  } catch (error) {
    console.error('Error listing IVR direct outbound options:', error.message);
    throw error;
  }
};

export const addGroup = async (data) => {
  try {
    const response = await axiosInstance.post("/group", {
      type: "add",
      data: data
    });
    return response.data;
  } catch (error) {
    console.error("Error adding group:", error.message);
    throw error;
  }
};

export const updateGroup = async (id, data) => {
  try {
    const response = await axiosInstance.post("/group", {
      type: "update",
      data: { id: String(id), ...data }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating group:", error.message);
    throw error;
  }
};

export const listGroups = async () => {
  try {
    const response = await axiosInstance.post("/group", {
      type: "list"
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error.message);
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    const response = await axiosInstance.post("/group", {
      type: "delete",
      data: { id: String(id) }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting group:", error.message);
    throw error;
  }
};
export const  fetchSystemInfo = async () => {
  try {
    const response = await axiosInstance.get("/system-info"); 
    return response.data;
  } catch (error) {
    console.error("Error fetching system info:", error.message);
    throw error;
  }
};



// export const  fetchPingtest = async () => {
//   try {
//     const response = await axiosInstance.get("/ping-test"); 
//     return response.data;
//   } catch (error) {
//     console.log("Error fetching ping test:", error.message);
//     throw error;
//   }
// };

export const postPingtest = async (data) => {
  try {
    const response = await axiosInstance.post("/ping-test", data);
    return response.data;
  } catch (error) {
    console.error("Error posting ping test:", error.message);
    throw error;
  }
};


// export const fetchTracerttest = async ()=>{
//   try{
//     const response = await axiosInstance.get("/tracert-test");
//     return response.data;
//   } catch (error){
//     console.error(" Error fatching tracert test:", error.message);
//     throw error;
//   }
// };

export const postTracerttest = async (data) => {
  try {
    const response = await axiosInstance.post("/tracert-test", data);
    return response.data;
  } catch (error) {
    console.error("Error posting tracert test:", error.message);
    throw error;
  }
};

export const postAsteriskCLI = async (data) => {
  try {
    const response = await axiosInstance.post("/asterisk", data);
    return response.data;
  } catch (error) {
    console.error("Error executing Asterisk CLI command:", error.message);
    throw error;
  }
};

// Linux CLI - run Linux shell commands on the device
export const postLinuxCmd = async (data) => {
  try {
    const response = await axiosInstance.post('/linuxcmd', data);
    return response.data;
  } catch (error) {
    console.error('Error executing Linux command:', error.message);
    throw error;
  }
};

/**
 * Resolves device serial the same way as System Info: web_version.json serial_no, then astlicense (astlic: line).
 * @returns {Promise<string>} Non-empty serial, or '' if unavailable.
 */
export const fetchSystemSerialNumber = async () => {
  const [versionInfoData, astLicData] = await Promise.allSettled([
    postLinuxCmd({ cmd: 'cat /home/clixxo/server/config/web_version.json' }),
    postLinuxCmd({ cmd: 'astlicense' }),
  ]);

  let parsedSerial = '';
  if (versionInfoData.status === 'fulfilled' && versionInfoData.value?.response) {
    try {
      const parsedJson = JSON.parse(versionInfoData.value.responseData || '{}');
      const sn = parsedJson?.serial_no;
      if (sn != null && String(sn).trim() !== '') {
        parsedSerial = String(sn).trim();
      }
    } catch (_) {
      /* ignore parse errors */
    }
  }

  if (!parsedSerial && astLicData.status === 'fulfilled' && astLicData.value?.response) {
    const out = String(astLicData.value.responseData || '');
    const lines = out.split(/\r?\n/);
    const astLicLine = lines.find((l) => l.trim().toLowerCase().startsWith('astlic:')) || '';
    if (astLicLine) {
      const afterColon = astLicLine.split(':').slice(1).join(':');
      const fields = afterColon.split(',').map((s) => s.trim());
      if (fields.length >= 2 && fields[1]) {
        parsedSerial = fields[1];
      }
    }
  }

  return parsedSerial || '';
};

// Software Update Upload
export const uploadSoftwareUpdate = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/update_upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading software update:', error.message);
    throw error.response?.data || error;
  }
};


export const fetchNetwork = async ()=>{
  try{
    const response = await axiosInstance.get("/get-network-settings");
    return response.data;
  }catch (error){
    console.log("Error fatching Network", error.message);
    throw error;
  }
};


export const resetNetworkSettings = async () => {
  try {
    const response = await axiosInstance.get("/reset-network-settings");
    return response.data;
  } catch (error) {
    console.log("Error resetting network settings", error.message);
    throw error;
  }
};


export const saveNetworkSettings = async (data)=>{
  try{
    const response = await axiosInstance.post("/save-network-settings", data, { timeout: 30000 });
    return response.data;
  }catch (error){
    console.log("Error saving network settings", error.message);
    throw error;
  }
};

  export const fetchLogin = async (data)=>{
  try{
    const response = await axiosInstance.post ("/login", data);
    return response.data;
  }catch (error){
    console.log("Login Failed.... Please check your username and password", error.message);
    throw error;
  }
};

export const fetchChangePassword = async (data) => {
  try {
    console.log('🔐 Changing password with data:', data);
    const response = await axiosInstance.post('/change-password', data);
    console.log('🔐 Change password response:', response.data);
    return response.data;
  } catch (error) {
    console.log('Error Changing Password', error.message);
    throw error;
  }
};

export const systemRestart = async ()=>{
  try{
    const response = await axiosInstance.get ("/system-restart");
    return response.data;
  }catch (error){
    console.log("Error restarting system", error.message);
    throw error;
  }
};


export const serviceRestart = async () => {
  try {
    const response = await axiosInstance.get("/service-restart");
    return response.data;
  } catch (error) {
    console.log("Error restarting service", error.message);
    throw error;
  }
};

export const servicePing = async ()=>{
  try{
  const response = await axiosInstance.get ("/service-ping");
    return response.data;
  }catch (error){
    console.log("Error pinging service", error.message);
    throw error;
  }
};

// Channel State (PSTN) - fetch DAHDI channel runtime states
export const listChannelState = async () => {
  try {
    // This endpoint returns the runtime state of each DAHDI channel
    const response = await axiosInstance.post('/channelstate', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error fetching channel state:', error.message);
    throw error;
  }
};

export const fetchManagementParameters = async () => {
  try {
    const response = await axiosInstance.get('/get-management-parameters');
    console.log('🔍 Fetch management parameters response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error fetching management parameters", error.message);
    throw error;
  } 
};

export const saveManagementParameters = async (data) => {
  try {
    console.log('💾 Saving management parameters:', data);
    const response = await axiosInstance.post('/save-management-parameters', data);
    console.log('💾 Save management parameters response:', response.data);
    return response.data;
  } catch (error) {
    console.log("Error saving management parameters", error.message);
    throw error;
  }
};

export const resetManagementParameters = async ()=>{
  try {
    const response = await axiosInstance.get('/reset-management-parameters')
    return response.data;
  } catch(error){
    console.log('Error resetting management parameters', error.message);
    throw error;
  }
};

export const fetchAccountManageRegister= async (data)=>{
  try{
    const response = await axiosInstance.post('/register-user', data);
    return response.data;
  }catch(error){
    console.log('Error registering user', error.message);
    throw error;
  }
};

export const fetchAccountManageDelete= async (data)=>{
  try{
    const response = await axiosInstance.post('/delete-user', data);
    return response.data;
  }catch(error){
    console.log('Error deleting user', error.message);
    throw error;
  }
};  

export const fetchAccountManageGetAll= async ()=>{
  try {
    const response = await axiosInstance.get('/get-all-user');
    return response.data;
  }catch(error){
    console.log('Error getting all user', error.message);
    throw error;
  }
};


export const fetchAccountManageUpdate= async (data)=>{
  try{
      const response = await axiosInstance.post('/delete-user', data);
    return response.data;
  }catch(error){          
    console.log('Error updating user', error.message);
    throw error;
  }
};


export const fetchDhcpSettings = async()=>{
  try{
    const response = await axiosInstance.get('/fetch-dhcp-settings');
    return response.data;

  }catch(error){
    console.log('Error fetching dhcp settings', error.message);
    throw error;
  }
};

// Dhcp Server Settings
export const fetchSaveDhcpSettings = async(data)=>{
  try{
    const response = await axiosInstance.post('/save-dhcp-settings', data);
    return response.data;
  }catch(error){
    console.log('Error saving dhcp settings', error.message);
    throw error;
  }
};


export const fetchResetDhcpSettings = async()=>{
  try{
    const response = await axiosInstance.get('/reset-dhcp-settings');
    return response.data;
  }catch(error){
    console.log('Error resetting dhcp settings', error.message);
    throw error;
  }
};




// apiService.js


export const getLicenseInfo = async () => {
  try {
    const { data } = await axiosInstance.post('/license', { type: 'info' });
    return data;
  } catch (error) {
    console.error('Error fetching license info:', error);
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const checkLicenseValidity = async () => {
  try {
    const { data } = await axiosInstance.post('/license', { type: 'check' }, {
      timeout: 20000 // 20 seconds timeout
    });
    return data;
  } catch (error) {
    console.error('Error checking license validity:', error);
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const getSystemFingerprint = async () => {
  try {
    const { data } = await axiosInstance.post('/license', { type: 'system' });
    return data;
  } catch (error) {
    console.error('Error fetching system fingerprint:', error);
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const uploadLicenseFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axiosInstance.post('/licenseupload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  } catch (error) {
    console.error('Error uploading license file:', error);
    throw error.response?.data || { message: 'Server unavailable' };
  }
};







// SIP Account API Services
export const fetchSipAccounts = async () => {
  try {
    const response = await axiosInstance.post('/pjsip', {
      type: 'list'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching SIP accounts:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// SIP To SIP Account (IP Trunk) API Services - uses 'contact'
export const fetchSipIpTrunkAccounts = async () => {
  try {
    const response = await axiosInstance.post('/pjsip_ip_trunk', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error fetching SIP IP Trunk accounts:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const createSipIpTrunkAccount = async (accountData) => {
  try {
    const response = await axiosInstance.post('/pjsip_ip_trunk', {
      type: 'create',
      data: {
        extension: accountData.extension,
        context: accountData.context,
        allow_codecs: accountData.allow_codecs,
        password: accountData.password,
        contact: accountData.contact,
        from_domain: accountData.from_domain,
        contact_user: accountData.contact_user,
        outbound_proxy: accountData.outbound_proxy,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating SIP IP Trunk account:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const updateSipIpTrunkAccount = async (accountData) => {
  try {
    const response = await axiosInstance.post('/pjsip_ip_trunk', {
      type: 'update',
      data: {
        extension: accountData.extension,
        context: accountData.context,
        allow_codecs: accountData.allow_codecs,
        password: accountData.password,
        contact: accountData.contact,
        from_domain: accountData.from_domain,
        contact_user: accountData.contact_user,
        outbound_proxy: accountData.outbound_proxy,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating SIP IP Trunk account:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const deleteSipIpTrunkAccount = async (extension) => {
  try {
    const response = await axiosInstance.post('/pjsip_ip_trunk', {
      type: 'delete',
      data: { extension },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting SIP IP Trunk account:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

const buildSipExtensionPayload = (accountData = {}) => ({
  extension: accountData.extension,
  context: accountData.context,
  allow_codecs: accountData.allow_codecs,
  password: accountData.password,
  max_registrations: accountData.max_registrations,
  name: accountData.name,
  display_name: accountData.display_name || accountData.name,
  user_password: accountData.user_password,
  email: accountData.email,
  mobile_number: accountData.mobile_number,
  mobile: accountData.mobile || accountData.mobile_number,
  voicemail_enabled: accountData.voicemail_enabled,
  voicemail_password: accountData.voicemail_password,
  vm_password: accountData.vm_password || accountData.voicemail_password,
  voicemail_email: accountData.voicemail_email,
  voicemail_file: accountData.voicemail_file,
  voicemail_keep_local: accountData.voicemail_keep_local,
  cf_always_enabled: accountData.cf_always_enabled,
  cf_always_dest: accountData.cf_always_dest,
  cf_always_time_condition: accountData.cf_always_time_condition,
  cf_always_custom_start: accountData.cf_always_custom_start,
  cf_always_custom_end: accountData.cf_always_custom_end,
  cf_busy_enabled: accountData.cf_busy_enabled,
  cf_busy_dest: accountData.cf_busy_dest,
  cf_busy_time_condition: accountData.cf_busy_time_condition,
  cf_busy_custom_start: accountData.cf_busy_custom_start,
  cf_busy_custom_end: accountData.cf_busy_custom_end,
  cf_noanswer_enabled: accountData.cf_noanswer_enabled,
  cf_noanswer_dest: accountData.cf_noanswer_dest,
  cf_noanswer_time_condition: accountData.cf_noanswer_time_condition,
  cf_noanswer_custom_start: accountData.cf_noanswer_custom_start,
  cf_noanswer_custom_end: accountData.cf_noanswer_custom_end,
  cf_unreg_enabled: accountData.cf_unreg_enabled,
  cf_unreg_dest: accountData.cf_unreg_dest,
  cf_unreg_time_condition: accountData.cf_unreg_time_condition,
  cf_unreg_custom_start: accountData.cf_unreg_custom_start,
  cf_unreg_custom_end: accountData.cf_unreg_custom_end,
  follow_me_enabled: accountData.follow_me_enabled,
  follow_me_dest: accountData.follow_me_dest,
  follow_me_destination: accountData.follow_me_destination || accountData.follow_me_dest,
  follow_me_time_condition: accountData.follow_me_time_condition,
  follow_me_custom_start: accountData.follow_me_custom_start,
  follow_me_custom_end: accountData.follow_me_custom_end,
  dnd_enabled: accountData.dnd_enabled,
  dnd_time_condition: accountData.dnd_time_condition,
  dnd_custom_start: accountData.dnd_custom_start,
  dnd_custom_end: accountData.dnd_custom_end,
  dnd_special_numbers: accountData.dnd_special_numbers,
  dnd_special_number: accountData.dnd_special_number || accountData.dnd_special_numbers,
  dnd_allow_numbers: accountData.dnd_allow_numbers || accountData.dnd_special_numbers,
  mobility_enabled: accountData.mobility_enabled,
  enable_mobility_extension: accountData.enable_mobility_extension,
  enable_mobility_ext: accountData.enable_mobility_ext || accountData.enable_mobility_extension,
  mobility_ring_simultaneously: accountData.mobility_ring_simultaneously,
  ring_simultaneously: accountData.ring_simultaneously,
  mobility_prefix: accountData.mobility_prefix,
  mobility_timeout: accountData.mobility_timeout,
  secretary_enabled: accountData.secretary_enabled,
  secretary_service_enabled: accountData.secretary_service_enabled,
  secretary_service: accountData.secretary_service,
  secretary_extension: accountData.secretary_extension,
  secretary_number: accountData.secretary_number || accountData.secretary_extension,
  from_domain: accountData.from_domain,
  contact_user: accountData.contact_user,
  outbound_proxy: accountData.outbound_proxy,

  // Advanced fields
  adv_enable_srtp: accountData.adv_enable_srtp,
  adv_bypass_media: accountData.adv_bypass_media,
  adv_call_timeout_sec: accountData.adv_call_timeout_sec,
  adv_max_call_duration_sec: accountData.adv_max_call_duration_sec,
  adv_outbound_restriction: accountData.adv_outbound_restriction,
  adv_call_permission: accountData.adv_call_permission,
  adv_extension_trunk: accountData.adv_extension_trunk,
  adv_dynamic_lock_mode: accountData.adv_dynamic_lock_mode,
  adv_send_diversion: accountData.adv_send_diversion,
  adv_call_prohibition: accountData.adv_call_prohibition,
  adv_rx_volume: accountData.adv_rx_volume,
  adv_tx_volume: accountData.adv_tx_volume,
});

export const createSipAccount = async (accountData) => {
  try {
    const response = await axiosInstance.post('/pjsip', {
      type: 'create',
      data: buildSipExtensionPayload(accountData),
    });
    return response.data;
  } catch (error) {
    console.error('Error creating SIP account:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const bulkCreateSipAccounts = async (bulkData) => {
  try {
    const response = await axiosInstance.post('/pjsip', {
      type: 'bulk_create',
      data: bulkData,
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk creating SIP accounts:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const updateSipAccount = async (accountData) => {
  try {
    const response = await axiosInstance.post('/pjsip', {
      type: 'update',
      data: buildSipExtensionPayload(accountData),
    });
    return response.data;
  } catch (error) {
    console.error('Error updating SIP account:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const deleteSipAccount = async (extension, context) => {
  try {
    const response = await axiosInstance.post('/pjsip', {
      type: 'delete',
      data: {
        extension,
        ...(context ? { context } : {}),
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting SIP account:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// Extension Groups API
export const fetchExtensionGroups = async () => {
  try {
    const response = await axiosInstance.post('/extension-groups', {
      type: 'list',
      data: {}
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching extension groups:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const createExtensionGroup = async (data) => {
  try {
    const response = await axiosInstance.post('/extension-groups', {
      type: 'create',
      data: {
        name: data.name,
        extensions: Array.isArray(data.extensions) ? data.extensions.map(String) : []
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating extension group:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const updateExtensionGroup = async (data) => {
  try {
    const response = await axiosInstance.post('/extension-groups', {
      type: 'update',
      data: {
        id: data.id,
        name: data.name,
        extensions: Array.isArray(data.extensions) ? data.extensions.map(String) : []
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating extension group:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const deleteExtensionGroup = async (id) => {
  try {
    const response = await axiosInstance.post('/extension-groups', {
      type: 'delete',
      data: { id: Number(id) }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting extension group:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// Blocked List API
export const fetchBlockedList = async () => {
  try {
    const response = await axiosInstance.post('/blocked-list', {
      type: 'list',
      data: {}
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blocked list:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const createBlockedEntry = async (data) => {
  try {
    const response = await axiosInstance.post('/blocked-list', {
      type: 'create',
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error creating blocked entry:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const updateBlockedEntry = async (data) => {
  try {
    const response = await axiosInstance.post('/blocked-list', {
      type: 'update',
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error updating blocked entry:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const deleteBlockedEntry = async (id) => {
  try {
    const response = await axiosInstance.post('/blocked-list', {
      type: 'delete',
      data: { id: Number(id) }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting blocked entry:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// AMI ARI channels — POST /api/ami body { type: "ari_channels" }
export const fetchAriChannels = async () => {
  try {
    const response = await axiosInstance.post('/ami', {
      type: 'ari_channels',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ARI channels:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// AMI ARI hangup — POST /api/ami body { type: "ari_hangup", data: { channelId } }
export const ariHangup = async (channelId) => {
  try {
    const response = await axiosInstance.post('/ami', {
      type: 'ari_hangup',
      data: { channelId: String(channelId) },
    });
    return response.data;
  } catch (error) {
    console.error('Error ARI hangup:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// AMI Originate — POST /api/ami (Bearer JWT added by axiosInstance)
export const amiOriginate = async (data) => {
  try {
    const response = await axiosInstance.post('/ami', {
      type: 'ami_originate',
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error AMI originate:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// Callback API
export const fetchCallbackRules = async () => {
  try {
    const response = await axiosInstance.post('/callback', {
      type: 'list',
      data: {}
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching callback rules:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const createCallbackRule = async (data) => {
  try {
    const response = await axiosInstance.post('/callback', {
      type: 'create',
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error creating callback rule:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const updateCallbackRule = async (data) => {
  try {
    const response = await axiosInstance.post('/callback', {
      type: 'update',
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error updating callback rule:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const deleteCallbackRule = async (id) => {
  try {
    const response = await axiosInstance.post('/callback', {
      type: 'delete',
      data: { id: Number(id) }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting callback rule:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// CC Route API
export const fetchCCRouteExtensions = async () => {
  try {
    const response = await axiosInstance.post('/cc-route', {
      type: 'list_extensions',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching CC route extensions:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const fetchCCRoutes = async () => {
  try {
    const response = await axiosInstance.post('/cc-route', {
      type: 'list',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching CC routes:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const createCCRoute = async (data) => {
  try {
    const response = await axiosInstance.post('/cc-route', {
      type: 'create',
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating CC route:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const updateCCRoute = async (data) => {
  try {
    const response = await axiosInstance.post('/cc-route', {
      type: 'update',
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating CC route:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const deleteCCRoute = async (id) => {
  try {
    const response = await axiosInstance.post('/cc-route', {
      type: 'delete',
      data: { id: Number(id) },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting CC route:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// OpenVPN API Services
export const uploadOpenVpnFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/openvpnupload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading OpenVPN file:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const startOpenVpn = async () => {
  try {
    const response = await axiosInstance.post('/openvpn_op', { type: 'start' });
    return response.data;
  } catch (error) {
    console.error('Error starting OpenVPN:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const stopOpenVpn = async () => {
  try {
    const response = await axiosInstance.post('/openvpn_op', { type: 'stop' });
    return response.data;
  } catch (error) {
    console.error('Error stopping OpenVPN:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const getOpenVpnStatus = async () => {
  try {
    const response = await axiosInstance.post('/openvpn_op', { type: 'status' });
    return response.data;
  } catch (error) {
    console.error('Error getting OpenVPN status:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const getOpenVpnLogs = async () => {
  try {
    const response = await axiosInstance.post('/openvpn_op', { type: 'log' });
    return response.data;
  } catch (error) {
    console.error('Error getting OpenVPN logs:', error);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// Warning Log API functions
export const getWarningLogs = async () => {
  try {
    // Return last 50 lines strictly from /var/log/syslog only
    const cmd = 'tail -n 50 /var/log/syslog 2>/dev/null || echo "No /var/log/syslog file found"';
    const response = await postLinuxCmd({ cmd });

    if (response && response.response && response.responseData) {
      return {
        response: true,
        data: response.responseData,
        message: 'Last 50 lines from warning log retrieved successfully'
      };
    }

    return {
      response: true,
      data: 'No logs returned from system.',
      message: 'No logs found'
    };
  } catch (error) {
    console.error('Error getting warning logs:', error);
    throw error.response?.data || { message: 'Failed to retrieve warning logs' };
  }
};

export const downloadWarningLogs = async () => {
  try {
    // Return last 50 lines strictly from /var/log/syslog for download
    const cmd = 'tail -n 50 /var/log/syslog 2>/dev/null || echo "No /var/log/syslog file found"';
    const response = await postLinuxCmd({ cmd });

    if (response && response.response && response.responseData) {
      return {
        response: true,
        data: response.responseData,
        message: 'Last 50 lines from warning log prepared for download'
      };
    }

    return {
      response: true,
      data: 'No logs returned for download.',
      message: 'No logs found for download'
    };
  } catch (error) {
    console.error('Error downloading warning logs:', error);
    throw error.response?.data || { message: 'Failed to download warning logs' };
  }
};

// SQL Upload (Database patch uploader)
export const uploadSqlPatch = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/sqlupload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading SQL patch:', error);
    throw error.response?.data || { success: false, message: error.message || 'Upload failed' };
  }
};



export const saveWhitelist = async (data) => {
  try {
    const response = await axiosInstance.post('/save-number-filter-settings', data);
    return response.data;
  } catch (error) {
    console.error('Error saving Whitelist', error.message);
    throw error;
  }
};

export const saveCallerWhitelist = async (data) => {
  try {
    const apiData = {
      type: "whitelist",
      group: String(data.groupNo),
      number: data.callerId,
      subtype: "callerid"
    };
    const response = await axiosInstance.post('/save-number-filter-settings', apiData);
    return response.data;
  } catch (error) {
    console.error('Error saving Caller Whitelist', error.message);
    throw error;
  }
};

export const saveCalleeWhitelist = async (data) => {
  try {
    const apiData = {
      type: "whitelist",
      group: String(data.groupNo),
      number: data.calleeId,
      subtype: "calleeid"
    };
    const response = await axiosInstance.post('/save-number-filter-settings', apiData);
    return response.data;
  } catch (error) {
    console.error('Error saving Callee Whitelist', error.message);
    throw error;
  }
};

export const fetchAllNumberFilters = async (type) => {
  try {
    // Try new endpoint first
    const response = await axiosInstance.post('/fetch-all-number-filters', {
      type: type
    });
    return response.data;
  } catch (error) {
    // Fallback to old endpoint if new one doesn't exist
    try {
      const response = await axiosInstance.get('/fetch-all-number-filters');
      if (response.data && response.data.success && response.data.data) {
        // Filter data based on type (whitelist/blacklist)
        const filteredData = response.data.data.filter(item => {
          if (type === 'whitelist') {
            return item.type === 'whitelist';
          } else if (type === 'blacklist') {
            return item.type === 'blacklist';
          }
          return true;
        });
        return {
          success: true,
          data: filteredData
        };
      }
      return response.data;
    } catch (fallbackError) {
      console.error('Error fetching number filters:', fallbackError.message);
      throw fallbackError;
    }
  }
};

export const fetchNumberFilters = async (type, number) => {
  try {
    const response = await axiosInstance.post('/fetch-number-filters', {
      type: type,
      number: number
    }, {
      timeout: 10000 // 10 second timeout
    });
    return response.data;
  } catch (error) {
    // Fallback to old search method if new endpoint doesn't exist
    try {
      const searchData = {
        caller_id: type === 'whitelist' || type === 'blacklist' ? number : "",
        callee_id: type === 'whitelist' || type === 'blacklist' ? "" : number
      };
      
      const response = await axiosInstance.post('/fetch-number-filters', searchData, {
        timeout: 10000
      });
      
      if (response.data && response.data.success && response.data.data) {
        // Filter data based on type
        const filteredData = response.data.data.filter(item => {
          if (type === 'whitelist') {
            return item.type === 'whitelist';
          } else if (type === 'blacklist') {
            return item.type === 'blacklist';
          }
          return true;
        });
        return {
          success: true,
          data: filteredData
        };
      }
      return response.data;
    } catch (fallbackError) {
      console.error('Error searching number filters:', fallbackError.message);
      throw fallbackError;
    }
  }
};

export const deleteNumberFilter = async (type, number, subtype, group) => {
  try {
    const response = await axiosInstance.post('/delete-number-filter-settings', {
      type: type,
      number: number,
      subtype: subtype,
      group: group
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting number filter:', error.message);
    throw error;
  }
};

export const deleteAllNumberFilters = async (type, subtype) => {
  try {
    const response = await axiosInstance.post('/delete-all-number-filters', { 
      type: type,
      subtype: subtype
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting all number filters:', error.message);
    throw error;
  }
};

// Blacklist API functions
export const saveCallerBlacklist = async (data) => {
  try {
    const apiData = {
      type: "blacklist",
      group: String(data.groupNo),
      number: data.callerId,
      subtype: "callerid"
    };
    const response = await axiosInstance.post('/save-number-filter-settings', apiData);
    return response.data;
  } catch (error) {
    console.error('Error saving Caller Blacklist', error.message);
    throw error;
  }
};

export const saveCalleeBlacklist = async (data) => {
  try {
    const apiData = {
      type: "blacklist",
      group: String(data.groupNo),
      number: data.calleeId,
      subtype: "calleeid"
    };
    const response = await axiosInstance.post('/save-number-filter-settings', apiData);
    return response.data;
  } catch (error) {
    console.error('Error saving Callee Blacklist', error.message);
    throw error;
  }
};

export const getAvailableTrunk = async () => {
  try {
    const response = await axiosInstance.get('/get-available-trunk');
    return response.data;
  } catch (error) {
    console.error('Error fetching available trunk data:', error.message);
    throw error;
  }
};

export const savePcmTrunkGroup = async (data) => {
  try {
    const apiData = {
      index: parseInt(data.index),
      description: data.description,
      trunkSelectMode: data.trunkSelectMode,
      backupTrunkGroup: data.backupTrunkGroup === 'None' ? 0 : parseInt(data.backupTrunkGroup),
      selectedTrunks: data.selectedTrunks.map(trunk => parseInt(trunk))
    };
    const response = await axiosInstance.post('/save-pcm-trunk-group', apiData);
    return response.data;
  } catch (error) {
    console.error('Error saving PCM trunk group:', error.message);
    throw error;
  }
};

export const getAllPcmTrunkGroup = async () => {
  try {
    const response = await axiosInstance.get('/get-all-pcm-trunk-group');
    return response.data;
  } catch (error) {
    console.error('Error fetching PCM trunk group data:', error.message);
    throw error;
  }
};

export const deletePcmTrunkGroup = async (index) => {
  try {
    const response = await axiosInstance.post('/delete-pcm-trunk-group', { index });
    return response.data;
  } catch (error) {
    console.error('Error deleting PCM trunk group:', error.message);
    throw error;
  }
};

export const deleteAllPcmTrunkGroups = async () => {
  try {
    const response = await axiosInstance.get('/delete-all-pcm-trunk-groups');
    return response.data;
  } catch (error) {
    console.error('Error deleting all PCM trunk groups:', error.message);
    throw error;
  }
};

// New PSTN GROUP APIs
export const listPstnGroups = async () => {
  try {
    const { data } = await axiosInstance.post('/pstngroups', { type: 'list' });
    return data;
  } catch (error) {
    console.error('Error listing PSTN groups:', error.message);
    throw error;
  }
};

export const savePstnGroup = async (groupId, pstnIds, description) => {
  try {
    const { data } = await axiosInstance.post('/pstngroups', {
      type: 'create',
      data: { group_id: String(groupId), pstn_ids: pstnIds, description },
    });
    return data;
  } catch (error) {
    console.error('Error saving PSTN group:', error.message);
    throw error;
  }
};

export const deletePstnGroup = async (groupId) => {
  try {
    const { data } = await axiosInstance.post('/pstngroups', {
      type: 'delete',
      data: { group_id: String(groupId) },
    });
    return data;
  } catch (error) {
    console.error('Error deleting PSTN group:', error.message);
    throw error;
  }
};

// SIP Registration API


export const createSipRegistration = async (data) => {
  try {
    const response = await axiosInstance.post("/trunk", {
      type: "create",
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating SIP registration:", error.message);
    throw error;
  }
};

export const listSipRegistrations = async () => {
  try {
    const response = await axiosInstance.post("/trunk", {
      type: "list",
    });
    return response.data;
  } catch (error) {
    console.error("Error listing SIP registrations:", error.message);
    throw error;
  }
};

export const updateSipRegistration = async (data) => {
  try {
    const response = await axiosInstance.post("/trunk", {
      type: "update",
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating SIP registration:", error.message);
    throw error;
  }
};

export const deleteSipRegistration = async (trunkId) => {
  try {
    const response = await axiosInstance.post("/trunk", {
      type: "delete",
      data: { trunk_id: trunkId }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting SIP registration:", error.message);
    throw error;
  }
};

// SIP Trunk API (same endpoints as SIP Registration)
export const listSipTrunks = async () => {
  try {
    const response = await axiosInstance.post("/trunk", {
      type: "list",
    });
    return response.data;
  } catch (error) {
    console.error("Error listing SIP trunks:", error.message);
    throw error;
  }
};

export const createSipTrunk = async (data) => {
  try {
    // Backend expects trunk fields at the root (not under `data`).
    // Example payload:
    // { type: "create", trunk_id: "...", ... }
    const response = await axiosInstance.post("/trunk", {
      type: "create",
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating SIP trunk:", error.message);
    throw error;
  }
};

export const updateSipTrunk = async (data) => {
  try {
    // { type: "update", trunk_id: "...", ... }
    const response = await axiosInstance.post("/trunk", {
      type: "update",
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating SIP trunk:", error.message);
    throw error;
  }
};

export const deleteSipTrunk = async (trunkId) => {
  try {
    const response = await axiosInstance.post("/trunk", {
      type: "delete",
      trunk_id: trunkId,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting SIP trunk:", error.message);
    throw error;
  }
};

// ------------------------------
// PBX Monitor API
// ------------------------------
export const monitorExtensions = async () => {
  try {
    const response = await axiosInstance.post('/monitor', { type: 'extensions' });
    return response.data;
  } catch (error) {
    console.error('Error monitoring extensions:', error.message);
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const monitorTrunks = async () => {
  try {
    const response = await axiosInstance.post('/monitor', { type: 'trunks' });
    return response.data;
  } catch (error) {
    console.error('Error monitoring trunks:', error.message);
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const monitorBoth = async () => {
  try {
    const response = await axiosInstance.post('/monitor', { type: 'both' });
    return response.data;
  } catch (error) {
    console.error('Error monitoring extensions+trunks:', error.message);
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// Global SIP settings (transport/SRTP/DTMF)
export const listGlobalSipSettings = async () => {
  try {
    const response = await axiosInstance.post('/global-sip', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error fetching global SIP settings:', error.message);
    throw error;
  }
};

export const updateGlobalSipSettings = async (settings) => {
  try {
    const response = await axiosInstance.post('/global-sip', {
      type: 'update',
      data: { settings },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating global SIP settings:', error.message);
    throw error;
  }
};

// Config File API Services
export const fetchHostsFile = async () => {
  try {
    const response = await axiosInstance.post("/etc", {
      type: "list"
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching hosts file:", error.message);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

export const updateHostsFile = async (contentData) => {
  try {
    const response = await axiosInstance.post("/etc", {
      type: "update",
      content_data: contentData
    });
    return response.data;
  } catch (error) {
    console.error("Error updating hosts file:", error.message);
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      throw new Error('Network Error');
    }
    throw error.response?.data || { message: 'Server unavailable' };
  }
};

// New PSTN API Services
export const listPstn = async () => {
  try {
    const response = await axiosInstance.post("/pstn", {
      action: "list"
    });
    return response.data;
  } catch (error) {
    console.error("Error listing PSTN settings:", error);
    throw error;
  }
};

export const createPstn = async (data) => {
  try {
    const response = await axiosInstance.post("/pstn", {
      action: "create",
      span_id: data.span_id,
      span: data.span,
      channels: data.channels
    });
    return response.data;
  } catch (error) {
    console.error("Error creating PSTN settings:", error);
    throw error;
  }
};

export const deletePstn = async (spanId) => {
  try {
    const response = await axiosInstance.post("/pstn", {
      action: "delete",
      span_id: spanId
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting PSTN settings:", error);
    throw error;
  }
};

// Number Receiving Rule API functions
export const listNumRecv = async () => {
  try {
    const response = await axiosInstance.post("/numrecv", { type: "list" });
    if (!response.data) {
      throw new Error('Empty response from server');
    }
    return response.data;
  } catch (error) {
    console.error('Error listing Number Receiving Rules:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else if (error.response?.status === 404) {
      throw new Error('Number Receiving Rule API endpoint not found.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      throw new Error('Network connection failed. Please check your connection.');
    }
    throw error;
  }
};

export const createNumRecv = async (data) => {
  try {
    if (!data || !data.number_data || !data.provider) {
      throw new Error('Invalid data provided for Number Receiving Rule creation');
    }
    const response = await axiosInstance.post("/numrecv", {
      type: "create",
      data: {
        number_data: data.number_data,
        provider: data.provider
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating Number Receiving Rule:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else if (error.response?.status === 404) {
      throw new Error('Number Receiving Rule API endpoint not found.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      throw new Error('Network connection failed. Please check your connection.');
    }
    throw error;
  }
};

export const deleteNumRecv = async (id) => {
  try {
    if (!id) {
      throw new Error('ID is required for deletion');
    }
    const response = await axiosInstance.post("/numrecv", {
      type: "delete",
      data: {
        id: String(id)
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting Number Receiving Rule:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else if (error.response?.status === 404) {
      throw new Error('Number Receiving Rule not found.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      throw new Error('Network connection failed. Please check your connection.');
    }
    throw error;
  }
};

// IP PSTN Route API Services
export const listIpPstnRoutes = async (routeType) => {
  try {
    const response = await axiosInstance.post('/ip_pstn_route', {
      type: 'list',
      data: routeType ? { route_type: routeType } : undefined
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching IP PSTN routes:', error.message);
    throw error;
  }
};

export const createIpPstnRoute = async (data, routeType) => {
  try {
    const response = await axiosInstance.post('/ip_pstn_route', {
      type: 'create',
      data: routeType ? { ...data, route_type: routeType } : data
    });
    return response.data;
  } catch (error) {
    console.error('Error creating IP PSTN route:', error.message);
    throw error;
  }
};

export const updateIpPstnRoute = async (id, data, routeType) => {
  try {
    const response = await axiosInstance.post('/ip_pstn_route', {
      type: 'update',
      data: {
        id: id,
        ...data,
        ...(routeType ? { route_type: routeType } : {})
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating IP PSTN route:', error.message);
    throw error;
  }
};

export const deleteIpPstnRoute = async (id, routeType) => {
  try {
    const response = await axiosInstance.post('/ip_pstn_route', {
      type: 'delete',
      data: {
        id: id,
        ...(routeType ? { route_type: routeType } : {})
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting IP PSTN route:', error.message);
    throw error;
  }
};

// Number Pool APIs
export const listNumberPool = async () => {
  try {
    const response = await axiosInstance.post('/numberpool', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing Number Pool:', error.message);
    throw error;
  }
};

export const createNumberPool = async (data) => {
  try {
    const response = await axiosInstance.post('/numberpool', { type: 'create', data });
    return response.data;
  } catch (error) {
    console.error('Error creating Number Pool entry:', error.message);
    throw error;
  }
};

export const updateNumberPool = async (id, data) => {
  try {
    const response = await axiosInstance.post('/numberpool', { type: 'update', data: { id, ...data } });
    return response.data;
  } catch (error) {
    console.error('Error updating Number Pool entry:', error.message);
    throw error;
  }
};

export const deleteNumberPool = async (id) => {
  try {
    const response = await axiosInstance.post('/numberpool', { type: 'delete', data: { id } });
    return response.data;
  } catch (error) {
    console.error('Error deleting Number Pool entry:', error.message);
    throw error;
  }
};

// Final Number Filter (Filtering Rule) APIs
export const listFinalNumberFilter = async () => {
  try {
    const response = await axiosInstance.post('/finalnumberfilter', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing final number filters:', error.message);
    throw error;
  }
};

export const createFinalNumberFilter = async (data) => {
  try {
    const response = await axiosInstance.post('/finalnumberfilter', {
      type: 'create',
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error creating final number filter:', error.message);
    throw error;
  }
};

export const deleteFinalNumberFilter = async (id) => {
  try {
    const response = await axiosInstance.post('/finalnumberfilter', {
      type: 'delete',
      data: { id }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting final number filter:', error.message);
    throw error;
  }
};

// Number Manipulation API Services
export const listNumberManipulations = async (manipulationType = 'ip_in_callerid') => {
  try {
    const response = await axiosInstance.post('/number_manipulation', {
      type: 'list',
      data: { manipulation_type: manipulationType }
    });
    return response.data;
  } catch (error) {
    console.error('Error listing number manipulations:', error.message);
    throw error;
  }
};

// Inbound Route API
export const listInboundRoutes = async () => {
  try {
    const response = await axiosInstance.post('/inbound-route', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing inbound routes:', error.message);
    throw error;
  }
};

export const getInboundRoute = async (id) => {
  try {
    const response = await axiosInstance.post('/inbound-route', {
      type: 'get',
      id: Number(id),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching inbound route:', error.message);
    throw error;
  }
};

export const createInboundRoute = async (data) => {
  try {
    const response = await axiosInstance.post('/inbound-route', {
      type: 'create',
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating inbound route:', error.message);
    throw error;
  }
};

export const updateInboundRoute = async (id, data) => {
  try {
    const response = await axiosInstance.post('/inbound-route', {
      type: 'update',
      id: Number(id),
      ...data,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating inbound route:', error.message);
    throw error;
  }
};

export const deleteInboundRoute = async (id) => {
  try {
    const response = await axiosInstance.post('/inbound-route', {
      type: 'delete',
      id: Number(id),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting inbound route:', error.message);
    throw error;
  }
};

// Outbound Route API
export const listOutboundRoutes = async () => {
  try {
    const response = await axiosInstance.post('/outbound-route', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing outbound routes:', error.message);
    throw error;
  }
};

export const getOutboundRoute = async (id) => {
  try {
    const response = await axiosInstance.post('/outbound-route', { type: 'get', id: Number(id) });
    return response.data;
  } catch (error) {
    console.error('Error fetching outbound route:', error.message);
    throw error;
  }
};

export const createOutboundRoute = async (data) => {
  try {
    const response = await axiosInstance.post('/outbound-route', { type: 'create', ...data });
    return response.data;
  } catch (error) {
    console.error('Error creating outbound route:', error.message);
    throw error;
  }
};

export const updateOutboundRoute = async (id, data) => {
  try {
    const response = await axiosInstance.post('/outbound-route', { type: 'update', id: Number(id), ...data });
    return response.data;
  } catch (error) {
    console.error('Error updating outbound route:', error.message);
    throw error;
  }
};

export const deleteOutboundRoute = async (id) => {
  try {
    const response = await axiosInstance.post('/outbound-route', { type: 'delete', id: Number(id) });
    return response.data;
  } catch (error) {
    console.error('Error deleting outbound route:', error.message);
    throw error;
  }
};

export const listOutboundRouteExtensions = async () => {
  try {
    const response = await axiosInstance.post('/outbound-route', { type: 'list_extensions' });
    return response.data;
  } catch (error) {
    console.error('Error listing outbound-route extensions:', error.message);
    throw error;
  }
};

export const listOutboundRouteTrunks = async () => {
  try {
    const response = await axiosInstance.post('/outbound-route', { type: 'list_trunks' });
    return response.data;
  } catch (error) {
    console.error('Error listing outbound-route trunks:', error.message);
    throw error;
  }
};

// Speed Dial API
export const listSpeedDials = async () => {
  try {
    const response = await axiosInstance.post('/speed-dial', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing speed dials:', error.message);
    throw error;
  }
};

export const getSpeedDial = async (id) => {
  try {
    const response = await axiosInstance.post('/speed-dial', { type: 'get', id: Number(id) });
    return response.data;
  } catch (error) {
    console.error('Error fetching speed dial:', error.message);
    throw error;
  }
};

export const createSpeedDial = async (data) => {
  try {
    const response = await axiosInstance.post('/speed-dial', { type: 'create', ...data });
    return response.data;
  } catch (error) {
    console.error('Error creating speed dial:', error.message);
    throw error;
  }
};

export const updateSpeedDial = async (id, data) => {
  try {
    const response = await axiosInstance.post('/speed-dial', { type: 'update', id: Number(id), ...data });
    return response.data;
  } catch (error) {
    console.error('Error updating speed dial:', error.message);
    throw error;
  }
};

export const deleteSpeedDial = async (id) => {
  try {
    const response = await axiosInstance.post('/speed-dial', { type: 'delete', id: Number(id) });
    return response.data;
  } catch (error) {
    console.error('Error deleting speed dial:', error.message);
    throw error;
  }
};

export const createNumberManipulation = async (manipulationData, manipulationType = 'ip_in_callerid') => {
  try {
    const response = await axiosInstance.post('/number_manipulation', {
      type: 'create',
      data: {
        ...manipulationData,
        manipulation_type: manipulationType
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating number manipulation:', error.message);
    throw error;
  }
};

export const updateNumberManipulation = async (manipulationData, manipulationType = 'ip_in_callerid') => {
  try {
    const response = await axiosInstance.post('/number_manipulation', {
      type: 'update',
      data: {
        ...manipulationData,
        manipulation_type: manipulationType
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating number manipulation:', error.message);
    throw error;
  }
};

export const deleteNumberManipulation = async (id) => {
  try {
    const response = await axiosInstance.post('/number_manipulation', {
      type: 'delete',
      data: { id }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting number manipulation:', error.message);
    throw error;
  }
};

// ------------------------------
// Master SIP Settings API
// ------------------------------
export const listSipSettings = async () => {
  try {
    const response = await axiosInstance.post('/sip_settings', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing SIP settings:', error.message);
    throw error;
  }
};

export const updateSipSettings = async (settings) => {
  try {
    const response = await axiosInstance.post('/sip_settings', {
      type: 'update',
      data: { settings }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating SIP settings:', error.message);
    throw error;
  }
};

// ------------------------------
// Media Settings API
// ------------------------------
export const listMediaSettings = async () => {
  try {
    const response = await axiosInstance.post('/media_settings', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing Media settings:', error.message);
    throw error;
  }
};

// ------------------------------
// SoftEther VPN API (proxied via backend base URL)
// ------------------------------
export const seCreateVpn = async (payload) => {
  try {
    const { data } = await axiosInstance.post('/createvpn', payload);
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seConnectVpn = async (connectionName) => {
  try {
    const { data } = await axiosInstance.post('/connectvpn', { connectionName });
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seDisconnectVpn = async (connectionName) => {
  try {
    const { data } = await axiosInstance.post('/disconnectvpn', { connectionName });
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seVpnEnable = async () => {
  try {
    const { data } = await axiosInstance.post('/vpnenable');
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seVpnDisable = async () => {
  try {
    const { data } = await axiosInstance.post('/vpndisable');
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seVpnSetCert = async (connectionName, certFile, keyFile) => {
  try {
    const formData = new FormData();
    formData.append('cert', certFile);
    formData.append('key', keyFile);
    formData.append('connectionName', connectionName);
    const { data } = await axiosInstance.post('/vpnsetcert', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seAutoStartEnable = async (connectionName) => {
  try {
    const { data } = await axiosInstance.post('/vpnautostart', { connectionName });
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seAutoStartDisable = async (connectionName) => {
  try {
    const { data } = await axiosInstance.post('/vpnautostart', { connectionName });
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seVpnList = async () => {
  try {
    const { data } = await axiosInstance.post('/vpnlist');
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seVpnDelete = async (connectionName) => {
  try {
    const { data } = await axiosInstance.post('/vpndelete', { connectionName });
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seVpnState = async () => {
  try {
    const { data } = await axiosInstance.post('/vpnstate');
    return data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const seVpnStatus = async (connectionName) => {
  try {
    const { data } = await axiosInstance.post('/vpnstatus', { connectionName });
    return data;
  } catch (error) {
    // For 500 errors, return the error data instead of throwing
    if (error.response && error.response.status === 500) {
      return error.response.data;
    }
    throw error.response?.data || { message: error.message };
  }
};


export const updateMediaSettings = async (settings) => {
  try {
    const response = await axiosInstance.post('/media_settings', {
      type: 'update',
      data: { settings },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating Media settings:', error.message);
    throw error;
  }
};

// ==============================
// Backup/Restore API
// ==============================
export const downloadBackup = async () => {
  try {
    // API is POST: always use POST to retrieve the backup tar as a blob
    const response = await axiosInstance.request({
      url: '/backup',
      method: 'post',
      responseType: 'blob',
      timeout: 60000,
    });

    // Try to infer filename from headers, fallback to backup.tar
    const contentDisposition = response.headers['content-disposition'] || '';
    const fileNameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition);
    const fileName = decodeURIComponent(fileNameMatch?.[1] || fileNameMatch?.[2] || 'backup.tar');

    return { blob: response.data, fileName };
  } catch (error) {
    console.error('Error downloading backup:', error);
    // Surface meaningful error
    const message = error.response?.data?.message || error.message || 'Backup download failed';
    throw new Error(message);
  }
};

export const restoreBackup = async (file) => {
  try {
    if (!file) throw new Error('Please select a .tar file to upload');
    if (!/\.tar$/i.test(file.name)) throw new Error('Only .tar files are supported');

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axiosInstance.post('/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });

    return data; // Expecting { response: true, message: '...' }
  } catch (error) {
    console.error('Error restoring backup:', error);
    const message = error.response?.data?.message || error.message || 'Restore failed';
    throw new Error(message);
  }
};

// ==============================
// CDR API
// ==============================
export const fetchCdr = async (page = 1, limit = 50) => {
  try {
    const response = await axiosInstance.post('/cdr', { page, limit });
    return response.data;
  } catch (error) {
    console.error('Error fetching CDR data:', error.message);
    throw error;
  }
};

export const deleteCdr = async (uniqueid) => {
  try {
    const response = await axiosInstance.post('/delete-cdr', { uniqueid });
    return response.data;
  } catch (error) {
    console.error('Error deleting CDR record:', error.message);
    throw error;
  }
};

export const downloadCdr = async () => {
  try {
    const response = await axiosInstance.get('/download-cdr', {
      responseType: 'blob',
      timeout: 60000,
    });
    return response;
  } catch (error) {
    console.error('Error downloading CDR:', error.message);
    throw error;
  }
};

// DISA API
export const listDisa = async () => {
  try {
    const response = await axiosInstance.post('/disa', { type: 'list' });
    return response.data;
  } catch (error) {
    console.error('Error listing DISA:', error.message);
    throw error;
  }
};

export const createDisa = async (data) => {
  try {
    const response = await axiosInstance.post('/disa', { type: 'create', ...data });
    return response.data;
  } catch (error) {
    console.error('Error creating DISA:', error.message);
    throw error;
  }
};

export const getDisa = async (id) => {
  try {
    const response = await axiosInstance.post('/disa', { type: 'get', id: Number(id) });
    return response.data;
  } catch (error) {
    console.error('Error fetching DISA:', error.message);
    throw error;
  }
};

export const updateDisa = async (id, data) => {
  try {
    const response = await axiosInstance.post('/disa', { type: 'update', id: Number(id), ...data });
    return response.data;
  } catch (error) {
    console.error('Error updating DISA:', error.message);
    throw error;
  }
};

export const deleteDisa = async (id) => {
  try {
    const response = await axiosInstance.post('/disa', { type: 'delete', id: Number(id) });
    return response.data;
  } catch (error) {
    console.error('Error deleting DISA:', error.message);
    throw error;
  }
};

// Voice Prompts API
export const getVoicePromptPreferences = async () => {
  try {
    const response = await axiosInstance.post('/voice-prompts', { type: 'get_preferences' });
    return response.data;
  } catch (error) {
    console.error('Error fetching voice prompt preferences:', error.message);
    throw error;
  }
};

export const updateVoicePromptPreferences = async ({ music_on_hold, play_call_forwarding_prompt }) => {
  try {
    const response = await axiosInstance.post('/voice-prompts', {
      type: 'update_preferences',
      music_on_hold,
      play_call_forwarding_prompt: !!play_call_forwarding_prompt,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating voice prompt preferences:', error.message);
    throw error;
  }
};

export const listMohClasses = async () => {
  try {
    // New backend returns categories via get_preferences.moh_categories
    const response = await axiosInstance.post('/voice-prompts', { type: 'get_preferences' });
    return response.data;
  } catch (error) {
    console.error('Error listing MOH classes:', error.message);
    throw error;
  }
};

export const createMohClass = async ({ category }) => {
  try {
    const response = await axiosInstance.post('/voice-prompts', {
      type: 'create_moh_class',
      category: String(category || '').trim(),
    });
    return response.data;
  } catch (error) {
    console.error('Error creating MOH class:', error.message);
    throw error;
  }
};

export const deleteMohClass = async ({ category }) => {
  try {
    const response = await axiosInstance.post('/voice-prompts', {
      type: 'delete_moh_class',
      category: String(category || '').trim(),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting MOH class:', error.message);
    throw error;
  }
};

export const listMohFiles = async (category) => {
  try {
    const response = await axiosInstance.post('/voice-prompts', { type: 'list_moh' });
    return response.data;
  } catch (error) {
    console.error('Error listing MOH files:', error.message);
    throw error;
  }
};

export const uploadMohFile = async ({ category, file }) => {
  try {
    const formData = new FormData();
    formData.append('category', String(category || 'default'));
    formData.append('file', file);
    const response = await axiosInstance.post('/voice-prompts/upload-moh', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading MOH file:', error.message);
    throw error;
  }
};

export const uploadCustomPrompt = async ({ file }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/voice-prompts/upload-custom', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading custom prompt:', error.message);
    throw error;
  }
};

export const playMohFile = async ({ category, filename }) => {
  try {
    if (!category && !filename) {
      throw new Error('Missing MOH file id');
    }
    const response = await axiosInstance.post(
      '/voice-prompts',
      { type: 'play_moh', id: Number(category || filename) },
      { responseType: 'blob', timeout: 60000 }
    );
    return response;
  } catch (error) {
    console.error('Error playing MOH file:', error.message);
    throw error;
  }
};

export const downloadMohFile = async ({ category, filename }) => {
  try {
    const response = await axiosInstance.post(
      '/voice-prompts',
      { type: 'download_moh_file', category: String(category || 'default'), filename: String(filename || '') },
      { responseType: 'blob', timeout: 60000 }
    );
    return response;
  } catch (error) {
    console.error('Error downloading MOH file:', error.message);
    throw error;
  }
};

export const deleteMohFile = async ({ category, filename }) => {
  try {
    const response = await axiosInstance.post('/voice-prompts', {
      type: 'delete_moh',
      id: Number(category || filename),
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting MOH file:', error.message);
    throw error;
  }
};

export const listVoicePromptExtensions = async () => {
  try {
    const response = await axiosInstance.post('/voice-prompts', { type: 'list_extensions' });
    return response.data;
  } catch (error) {
    console.error('Error listing voice prompt extensions:', error.message);
    throw error;
  }
};

export const recordNewCustomPrompt = async ({ file_name, extension }) => {
  try {
    const response = await axiosInstance.post('/voice-prompts', {
      type: 'record_new',
      file_name: String(file_name || ''),
      extension: String(extension || ''),
    });
    return response.data;
  } catch (error) {
    console.error('Error recording new custom prompt:', error.message);
    throw error;
  }
};

export const listCustomPrompts = async () => {
  try {
    const response = await axiosInstance.post('/voice-prompts', { type: 'list_custom' });
    return response.data;
  } catch (error) {
    console.error('Error listing custom prompts:', error.message);
    throw error;
  }
};

export const playCustomPrompt = async ({ filename }) => {
  try {
    const response = await axiosInstance.post('/voice-prompts', { type: 'play_custom', filename: String(filename || '') }, { responseType: 'blob', timeout: 60000 });
    return response;
  } catch (error) {
    console.error('Error playing custom prompt:', error.message);
    throw error;
  }
};

export const downloadCustomPrompt = async ({ filename }) => {
  try {
    const response = await axiosInstance.post('/voice-prompts', { type: 'download_custom_prompt', filename: String(filename || '') }, { responseType: 'blob', timeout: 60000 });
    return response;
  } catch (error) {
    console.error('Error downloading custom prompt:', error.message);
    throw error;
  }
};

export const deleteCustomPrompt = async ({ filename }) => {
  try {
    const response = await axiosInstance.post('/voice-prompts', { type: 'delete_custom', filename: String(filename || '') });
    return response.data;
  } catch (error) {
    console.error('Error deleting custom prompt:', error.message);
    throw error;
  }
};
