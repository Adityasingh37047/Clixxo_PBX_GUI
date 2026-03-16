// ConfigFile Page Constants
export const CONFIG_FILE_TITLE = 'Config File';
export const CONFIG_FILE_OPTIONS = [
  { label: 'SMConfig.ini', value: 'SMConfig.ini' },
  { label: 'ShConfig.ini', value: 'ShConfig.ini' },
  { label: 'Ss7Server.ini', value: 'Ss7Server.ini' },
  { label: 'hosts', value: 'hosts' }
];
export const CONFIG_FILE_EDIT_BUTTON = 'Edit';
export const CONFIG_FILE_SAVE_BUTTON = 'Save';

export const CONFIG_FILE_CONTENT_SMCONFIG = `
[WATCHDOG]
EnableWatchdog=1
[Version]
GWSrvVer=1.0.1
KernelVer=Linux mpc8309som 2.6.34 #85 Thu Dec 6 10:12:49 CST 2012
WebVer=1.0.1
CpldV=45621.586
HwAddr1=00:04:9F:EF:03:02
HwAddr2=00:04:9F:EF:03:02
DefaultConfig=0
[WebCtrl]
LocalAddress=127.0.0.1
LocalPort=1001
[Monitor]
LocalAddress=127.0.0.1
LocalPort=1002
[AutoExec]
UpgradeExecPath=/usr/local/apache/htdocs/RecUpgrade
IniFilePath=/mnt/flash
[DigitsMapRulesInfo]
DigitsMapRulesNum=1
[NetConfig]
BondFlag=0
arpMode=1
IpAddr1=192.168.1.101
Subnet1=255.255.255.0
Gateway1=192.168.1.254
DNS1=0.0.0.0
CheckNet1=0
IpAddr2=192.168.1.101
Subnet2=255.255.255.0
Gateway2=192.168.0.54
DNS2=0.0.0.0
CheckNet2=0
NetMode=0
IpAddr1_v6=
Subnet1_v6=64
Gateway1_v6=
NetMode2=1
IpAddr2_v6=
Subnet2_v6=64
`;

export const CONFIG_FILE_CONTENT_SHCONFIG = `
[SystemConfig]
TotalPcmNum=1
ToneHighFilterPoint=4
ToneLowFilterPoint=10
EnableAMD=1
TotalBoards=2
MhoApplySysInt=0
WhoSupplySysClock=0
SysIntNo=3
ConfigPci=0
RecChClearRingDelayTime=0
DefaultEventOutput=1
FastPlayTime=1000
CloseCallerIDOnReceived=1
Check2ndToneOnAutoDial=0
OffLineSet=5
LineOncct=25
MultiCardMultiProcess=0
DtmfCallerIDInterTimeout=500
EventInterfaceType=1
PlayBufSize=32768
RecordBufSize=32768
TxDtmfBufSize=50
RxDtmfBufSize=200
TruncateTailOnRecordToFile=0
AutoClearCallerBufOnHangup=1
CalledToRxDtmfBuf=0
PrerecordMode=0
PrerecordInsertTime=500
EnablePulseKeyDetect=0
MaxWaitDialToneTime=3
MaxWaitAutoDialAnswerTime=25
DefaultTxFlashChars=
DefaultTxFlashTime=500
DefaultTxDelayTime=2000
MaxLocalFlashTime=700
VoiceFreq1PArra=1100,80,50,300,200
VoiceFreq2PArra=2100,80,50,300,200
NoiseFreqOnDetermineTime=96
MinimumVoiceDetermineEnergy=100000
WaitAfterDialTime=18000
`;

export const CONFIG_FILE_CONTENT_SS7SERVER = `
[Ss7SystemConfig]
UseSctp=1
OPC=1.2.3
ServerIP=127.0.0.1
Port=5150
AutoGetDPCOP=0
SpCodeLen=24
SendSNT=0
SubServiceId=0x8
SetClient=0
Ss7ClientInfo=
MaxSs7Client=1
IP[0]=127.0.0.1
[PCMLINKINFO]
MaxSs7PcmLink=1
Ss7PcmLink0=0
[Ss7PcmLinkInfo]
MaxSs7PcmInt=1
Ss7PcmLink[0]=IP[0],LocalPCM[0]
[LinkSetInfo]
MaxLinkSet=1
LinkSet[0]=Ss7PcmLink[0],1,2,3
[DPCInfo]
MaxDPC=1
DPC[0]=9.9.9,LinkSet[0]
[TURouter]
DPC[0].CIC_PCM[0]=IP[0],LocalPCM[0]
[Monitor]
ConfigAsGateway=0
RcvMsuListMaxItem=2000
TxMsuListMaxItem=2000
`;

export const CONFIG_FILE_CONTENT_HOSTS = `# Do not remove the following line, or various programs
# that require network functionality will fail.
127.0.0.1    localhost
`;

export const CONFIG_FILE_CONTENT_MAP = {
  'ShConfig.ini': CONFIG_FILE_CONTENT_SHCONFIG,
  'Ss7Server.ini': CONFIG_FILE_CONTENT_SS7SERVER,
  'SMConfig.ini': CONFIG_FILE_CONTENT_SMCONFIG,
  'hosts': CONFIG_FILE_CONTENT_HOSTS
};

