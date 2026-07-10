export const STORAGE_PAGE_BREADCRUMB_ROOT = "System";
export const STORAGE_PAGE_BREADCRUMB_SECTION = "System Settings";
export const STORAGE_PAGE_TITLE = "Storage";
export const STORAGE_CARD_TITLE = "Storage";

export const STORAGE_TAB_STATUS = "Status";
export const STORAGE_TAB_AUTO_CLEANUP = "Auto Cleanup";
export const STORAGE_TAB_BACKUPS = "Backups";
export const STORAGE_TAB_STATUS_ID = "status";
export const STORAGE_TAB_AUTO_CLEANUP_ID = "autoCleanup";
export const STORAGE_TAB_BACKUPS_ID = "backups";


export const STORAGE_TABS = [
  { id: STORAGE_TAB_STATUS_ID, label: STORAGE_TAB_STATUS },
  { id: STORAGE_TAB_AUTO_CLEANUP_ID, label: STORAGE_TAB_AUTO_CLEANUP },
  { id: STORAGE_TAB_BACKUPS_ID, label: STORAGE_TAB_BACKUPS },
  
];

export const STORAGE_SECTION_STATUS = "Storage Status";
export const STORAGE_SECTION_DEVICES = "Storage Devices";
export const STORAGE_SECTION_RECORD_BACKUP = "Record Backup";

export const STORAGE_STATUS_COL_COUNT = "Count";
export const STORAGE_STATUS_COL_SIZE = "Size";

export const STORAGE_TABLE_COL_STORAGE = "Storage";
export const STORAGE_TABLE_COL_TOTAL_CAPACITY = "Total Capacity";
export const STORAGE_TABLE_COL_USED_SPACE = "Used Space";
export const STORAGE_TABLE_COL_AVAILABLE_SPACE = "Available Space";
export const STORAGE_TABLE_COL_USAGE = "Usage";

export const STORAGE_DEVICE_LOCAL_DISK = "Local Disk";

export const STORAGE_BTN_SAVE = "Save";
export const STORAGE_BTN_REFRESH = "Refresh";
export const STORAGE_BTN_FTP_TEST = "FTP Test";

export const STORAGE_SECTION_HEADING_LEFT = -20;

export const STORAGE_AUTO_CLEANUP_SECTIONS = [
  {
    title: "CDR Auto Cleanup",
    fields: [
      {
        name: "maxCdr",
        label: "Max Number of CDR",
        tooltip:
          "Set the maximum number of CDR that should be retained. The default is '100000'. The oldest CDR will be deleted when the threshold is reached.",
        type: "text",
        max: 200000,
      },
      {
        name: "cdrPreservationDuration",
        label: "CDR Preservation Duration",
        tooltip: `Set the maximum numbers of days that CDr should be retained. The default is "0".`,
        type: "text",
        max:2000,
      },
      
    ],
  },
  {
    title: "VoiceMail and One Touch Recording Auto Cleanup",
    fields: [
      {
        name: "maxVoicemailFiles",
        label: "Max Number of Files",
        tooltip: `Set the maximum number of voice mail files that should be retained. The default is '300'. The oldest voice mail file will be deleted when the threshold is reached.`,
        type: "text",
       max: 10000,
      },
      {
        name: "voicemailPreservationDuration",
        label: "Preservation Duration",
        tooltip: `Set the maximum numbers of days that voice mail files should be retained. "0" for no limitation.`,
        type: "text",
        max: 2000,
      },
      
    ],
  },
  {
    title: "Recordings Auto Cleanup",
    fields: [
      {
        name: "maxDeviceUsage",
        label: "Max Usage of Device(%)",
        tooltip: `Set the maximum storage percentage the device is allowed to store. The default is "80" (30~90). The oldest recordings will be deleted when the threshold is reached.`,
        type: "text",
        min: 30,
max: 90,
      },
      {
        name: "recPreservationDuration",
        label: "Rec Preservation Duration",
        tooltip: `Set the maximum numbers of days that recordings should be retained. The default is "0".`,
        type: "text",
        max: 2000,
      },
    ],
  },
  {
    title: "Logs Auto Cleanup",
    fields: [
      {
        name: "maxLogSize",
        label: "Max Size of Total Logs",
        tooltip: `Limit the max size of each log. The default size is 50 MB, 0 for no limitation. The older logs will be deleted when the threshold is reached.`,
        type: "text",
        max: 1000,
      },
      {
        name: "logsPreservationDuration",
        label: "Logs Preservation Duration",
        tooltip: `Set the maximum numbers of days that logs should be retained. The default is "7". "0" for no limitation.`,
        type: "text",
        max: 1000,
      },
      {
        name: "maxLogs",
        label: "Max Number of Logs",
        tooltip: `The maximum number of log files saved per day. The default value is 3 and the minimum value is 1.`,
        type: "text",
        max: 1000,
      },
    ],
  },
];

export const STORAGE_BACKUP_FIELDS = [
  {
    name: "autoUploadFtp",
    label: "Auto Upload FTP",
    tooltip: `After configuring the FTP server, the recording file will be uploaded automatically. The default value is "No".`,
    type: "select",
    options: ["Yes", "No"],
    defaultValue: "Yes",
  },
  {
    name: "ftpAddress",
    label: "FTP Address",
    tooltip: `FTP server address, format is: (ftp://name:password@IP:port/) of (ftp://IP), if the port number is not filled int, it is the default port 21 and this value must be set, otherwise can not be save.`,
    type: "text",
    defaultValue: "192.168.0.57",
  },
  {
    name: "username",
    label: "Username",
    tooltip: `User name used on the FTP server.`,
    type: "text",
    defaultValue: "ftp-clixxo",
  },
  {
    name: "password",
    label: "Password",
    tooltip: `Password used on the FTP server.`,
    type: "password",
    defaultValue: "password",
  },
  {
    name: "uploadTime",
    label: "Upload Time",
    tooltip: `Real-time: upload at a fixed time point every day. If this value is enabled, you should set startup time. Uplaod the file at 00:00 by default.`,
    type: "radio",
    options: ["Real Time", "Timing"],
    defaultValue: "Real Time",
  },
  {
    name: "deleteSourceFile",
    label: "Delete Source File",
    tooltip: `After uploading, the original recording file will be deleted. The default value is "No".`,
    type: "select",
    options: ["Yes", "No"],
    defaultValue: "No",
  },
];

export const STORAGE_LABEL_START_TIME = "Start Time";
