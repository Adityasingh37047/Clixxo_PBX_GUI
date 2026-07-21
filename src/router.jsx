// router.jsx
import Storage from "./modules/System/System Settings/Storage";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { ROUTE_PATHS } from "./constants/routeConstants";
import SystemInfo from "./modules/status/System Status/SystemInfo";
import PstnStatus from "./modules/status/System Status/PstnStatus";
import PcmInfo from "./modules/status/System Status/PcmInfo";
import CallCount from "./modules/CDR/CallCount";
import WarningInfo from "./modules/status/System Status/WarningInfo";
import PcmPage from "./modules/E1-PRI/PCM/PcmPage";
import IsdnPage from "./modules/ISDN/IsdnPage";
import FaxFaxPage from "./modules/Fax/FaxFaxPage";
import NumberFilterPage from "./modules/E1-PRI/Number Filter/NumberFilterPage";
import NumManipulatePage from "./modules/FXS/Num Manipulate/NumManipulatePage";
import VpnPage from "./modules/System/System Settings/VpnPage";
import DhcpPage from "./modules/System/System Settings/DhcpPage";
import SystemToolsPage from "./modules/Maitenance/SystemToolsPage";
import LoginPage from "./components/LoginPage";
import SipSipPage from "./modules/E1-PRI/SIP/SipSipPage";
import HaPage from "./modules/E1-PRI/SIP/HaPage";
import SipTrunkPage from "./modules/System/System Settings/SipTrunkPage";
import SipRegisterPage from "./modules/PBX/Trunks/SipRegisterPage";
import Extensions from "./modules/PBX/Extensions/Extensions";
import SipTrunkGroup from "./modules/E1-PRI/SIP/SipTrunkGroup";
import SipToSipAccountPage from "./modules/E1-PRI/SIP/SipToSipAccountPage";
import SipMediaPage from "./modules/E1-PRI/SIP/SipMediaPage";
import ExtensionGroupsPage from "./modules/PBX/Extensions/ExtensionGroupsPage";
import BlockedListPage from "./modules/PBX/CallFeatures/BlockedListPage";
import CallBackPage from "./modules/PBX/CallFeatures/CallBackPage";
import OriginateCallPage from "./modules/PBX/CallFeatures/OriginateCallPage";
import ActiveCallsPage from "./modules/status/PBX Status/ActiveCallsPage";
import CCRoutePage from "./modules/PBX/CallControl/CCRoutePage";
import InboundRoutesPage from "./modules/PBX/CallControl/InboundRoutesPage";
import IVRPage from "./modules/PBX/CallFeatures/IVRPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PcmStatusPage from "./modules/E1-PRI/PCM/PcmStatusPage";
import PcmSettingsPage from "./modules/E1-PRI/PCM/PcmSettingsPage";
import PcmPstnPage from "./modules/E1-PRI/PCM/PcmPstnPage";
import PcmCircuitMaintenancePage from "./modules/E1-PRI/PCM/PcmCircuitMaintenancePage";
import PcmPcmPage from "./modules/E1-PRI/PCM/PcmPcmPage";
import PcmTrunkPage from "./modules/E1-PRI/PCM/PcmTrunkPage";
import PcmTrunkGroupPage from "./modules/E1-PRI/PCM/PcmTrunkGroupPage";
import PcmNumReceivingRulePage from "./modules/E1-PRI/PCM/PcmNumReceivingRulePage";
import PcmReceptionTimeoutPage from "./modules/E1-PRI/PCM/PcmReceptionTimeoutPage";
import IsdnIsdnPage from "./modules/ISDN/IsdnIsdnPage";
import IsdnNumberParameterPage from "./modules/ISDN/IsdnNumberParameterPage";
import RouteRoutingParameterPage from "./modules/E1-PRI/Route/RouteRoutingParameterPage";
import RouteIpPstnPage from "./modules/E1-PRI/Route/RouteIpPstnPage";
import RouteIPToIPPage from "./modules/E1-PRI/Route/RouteIPToIPPage";
import RoutePstnToIPPage from "./modules/E1-PRI/Route/RoutePstnToIPpage";
import Whitelist from "./modules/E1-PRI/Number Filter/Whitelist";
import Blacklist from "./modules/E1-PRI/Number Filter/Blacklist";
import NumberPool from "./modules/E1-PRI/Number Filter/NumberPool";
import FilteringRule from "./modules/E1-PRI/Number Filter/FilteringRule";
import E1PriIPCallInCallerID from "./modules/E1-PRI/Num Manipulate/E1PriIPCallInCallerID";
import E1PriIPCallInCalleeID from "./modules/E1-PRI/Num Manipulate/E1PriIPCallInCalleeID";
import E1PriIPCallInOriCalleeID from "./modules/E1-PRI/Num Manipulate/E1PriIPCallInOriCalleeID";
import E1PriPSTNCallInCallerID from "./modules/E1-PRI/Num Manipulate/E1PriPSTNCallInCallerID";
import E1PriPSTNCallInCalleeID from "./modules/E1-PRI/Num Manipulate/E1PriPSTNCallInCalleeID";
import E1PriPSTNCallInOriCalleeID from "./modules/E1-PRI/Num Manipulate/E1PriPSTNCallInOriCalleeID";
import E1PriCallerIDPool from "./modules/E1-PRI/Num Manipulate/E1PriCallerIDPool";
import E1PriCallerIDReservePool from "./modules/E1-PRI/Num Manipulate/E1PriCallerIDReservePool";
import VpnServerSettings from "./modules/System/System Settings/VpnServerSettings";
import VpnAccount from "./modules/System/System Settings/VpnAccount";
import DhcpServerSettings from "./modules/System/System Settings/DhcpServerSettings";
import Network from "./modules/System/System Settings/Network";
import Authorization from "./modules/Maitenance/System Tools/Authorization";
import Management from "./modules/System/System Settings/Management";
import IPRoutingTable from "./modules/System/System Settings/IPRoutingTable";
import SipAccessControl from "./modules/System/System Settings/SipAccessControl";
import AccessControl from "./modules/System/System Settings/AccessControl";
import IDSSettings from "./modules/Maitenance/System Tools/IDSSettings";
import DDOSSettings from "./modules/Maitenance/System Tools/DDOSSettings";
import SystemToolsVPN from "./modules/System/System Settings/SystemToolsVPN";
import CertificateManage from "./modules/Maitenance/System Tools/CertificateManage";
import CentralizedManage from "./modules/System/System Settings/CentralizedManage";
import Radius from "./modules/Maitenance/System Tools/Radius";
import SIPAccountGenerator from "./modules/Maitenance/System Tools/SIPAccountGenerator";
import ConfigFile from "./modules/Maitenance/System Tools/ConfigFile";
import SignalingCapture from "./modules/Maitenance/System Tools/SignalingCapture";
import SignalingCallTest from "./modules/Maitenance/System Tools/SignalingCallTest";
import SignalingCallTrack from "./modules/Maitenance/System Tools/SignalingCallTrack";
import PINGTest from "./modules/System/System Settings/PINGTest";
import TRACERTTest from "./modules/System/System Settings/TRACERTTest";
import AsteriskCLI from "./modules/System/System Settings/AsteriskCLI";
import LinuxCLI from "./modules/System/System Settings/LinuxCLI";
import RoutingInterface from "./modules/System/System Settings/RoutingInterface";
import ModificationRecord from "./modules/Maitenance/System Tools/ModificationRecord";
import BackupUpload from "./modules/Maitenance/System Tools/BackupUpload";
import FactoryReset from "./modules/Maitenance/System Tools/FactoryReset";
import Upgrade from "./modules/Maitenance/System Tools/Upgrade";
import AccountManage from "./modules/UserManage/User Permission/AccountManage";
import ChangePassword from "./modules/UserManage/User Permission/ChangePassword";
import DeviceLock from "./modules/Maitenance/System Tools/DeviceLock";
import Restart from "./modules/Maitenance/System Tools/Restart";
import LicenceRouteGate from "./components/LicenceRouteGate";
import SystemToolsSqlUpload from "./modules/Maitenance/System Tools/SystemToolsSqlUpload";
import Hosts from "./modules/Maitenance/System Tools/Hosts";
import ConferencePage from "./modules/PBX/CallFeatures/ConferencePage";
import PickupGroup from "./modules/PBX/CallFeatures/PickupGroup";
import RingGroup from "./modules/PBX/CallFeatures/RingGroup";
import PrivateGroup from "./modules/PBX/CallFeatures/PrivateGroup";
import Paging from "./modules/PBX/CallFeatures/Paging";
import OutboundRoutesPage from "./modules/PBX/CallControl/OutboundRoutesPage";
import SpeedDialPage from "./modules/PBX/CallFeatures/SpeedDialPage";
import DisaPage from "./modules/PBX/CallFeatures/DisaPage";
import VoicePromptsPage from "./modules/PBX/VoicePrompts/VoicePromptsPage";
import PbxMonitor from "./modules/status/PBX Status/PbxMonitor";
import ViewVoicemailPage from "./modules/status/PBX Status/ViewVoicemailPage";

import PortFxsPage from "./modules/FXS/Port/PortFxsPage";
import PortFxsAdvancedPage from "./modules/FXS/Port/PortFxsAdvancedPage";
import PortGroupPage from "./modules/FXS/Port/PortGroupPage";
import FxsPage from "./modules/FXS/Advanced/FxsPage";
import SipCompatibilityPage from "./modules/FXS/VoIP/SipCompatibilityPage";
import NatSettingsPage from "./modules/FXS/VoIP/NatSettingsPage";
import FxsVoipSipPage from "./modules/FXS/VoIP/FxsVoipSipPage";
import FxsVoipMediaPage from "./modules/FXS/VoIP/FxsVoipMediaPage";
import FxsActionUrlPage from "./modules/FXS/Advanced/ActionUrlPage";
import FxsAreaSelectPage from "./modules/FXS/Advanced/AreaSelectPage";
import FxsCdrQueryPage from "./modules/FXS/Advanced/CdrQueryPage";
import FxsColorRingPage from "./modules/FXS/Advanced/ColorRingPage";
import FxsCueTonePage from "./modules/FXS/Advanced/CueTonePage";
import FxsDialingRulePage from "./modules/FXS/Advanced/DialingRulePage";
import FxsDialingTimeoutPage from "./modules/FXS/Advanced/DialingTimeoutPage";
import FxsDtmfPage from "./modules/FXS/Advanced/DtmfPage";
import FxsFunctionKeyPage from "./modules/FXS/Advanced/FunctionKeyPage";
import FxsQosPage from "./modules/FXS/Advanced/QosPage";
import FxsRingingSchemePage from "./modules/FXS/Advanced/RingingSchemePage";
import FxsToneDetecterPage from "./modules/FXS/Advanced/ToneDetecterPage";
import FxsToneGeneratorPage from "./modules/FXS/Advanced/ToneGeneratorPage";
import CallQueue from "./modules/PBX/CallFeatures/CallQueue";
import OutboundRestrictions from "./modules/PBX/CallControl/OutboundRestrictions";
import FeatureCodePage from "./modules/PBX/Features Codes/FeatureCodePage";
import VoicemailPage from "./modules/PBX/Voicemail/VoicemailPage";
import AutoProvision from "./modules/PBX/AutoProvision/AutoProvision";
import UserManage from "./modules/UserManage/User Permission/UserManage";
import OperationsLog from "./modules/Maitenance/System Tools/OperationsLog";
// FXS → modules/FXS/Route pages
import FxsRouteRoutingParameterPage from "./modules/FXS/Route/RouteRoutingParameterPage";
import FxsRouteIpToTelPage from "./modules/FXS/Route/RouteIpToTelPage";
import FxsRouteTelToIpPage from "./modules/FXS/Route/RouteTelToIPpage";
// FXS → modules/FXS/Num Manipulate pages
import FxsIPCallInCallerID from "./modules/FXS/Num Manipulate/FxsIPCallInCallerID";
import FxsIPCallInCalleeID from "./modules/FXS/Num Manipulate/FxsIPCallInCalleeID";
import FxsPSTNCallInCallerID from "./modules/FXS/Num Manipulate/FxsPSTNCallInCallerID";
import FxsPSTNCallInCalleeID from "./modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID";
import ActiveCallQueue from "./modules/status/PBX Status/ActiveCallQueue";
import TimeCondition from "./modules/PBX/CallControl/TimeCondition";
import RecordSettings from "./modules/PBX/RecordSettings/RecordSettings";
import LicenseLimits from "./modules/Maitenance/System Tools/LicenseLimits";
// Error Boundary Component
const ErrorBoundary = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong!
        </h1>
        <p className="text-gray-600 mb-4">
          {error?.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

// 404 Not Found Component
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-600 mb-4">Page not found</p>
        <a
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <SystemInfo />,
      },
      // Primary routes
      { path: ROUTE_PATHS.SYSTEM_INFO, element: <SystemInfo /> },
      { path: ROUTE_PATHS.PSTN_STATUS, element: <PstnStatus /> },
      { path: ROUTE_PATHS.PSM_INFO, element: <PcmInfo /> },
      { path: ROUTE_PATHS.CALL_COUNT, element: <CallCount /> },
      { path: ROUTE_PATHS.WARNING_INFO, element: <WarningInfo /> },
      { path: ROUTE_PATHS.PBX_MONITOR, element: <PbxMonitor /> },
      { path: ROUTE_PATHS.ACTIVE_CALLS, element: <ActiveCallsPage /> },
      { path: ROUTE_PATHS.ACTIVE_CALL_QUEUE, element: <ActiveCallQueue /> },
      { path: ROUTE_PATHS.VIEW_VOICEMAIL, element: <ViewVoicemailPage /> },

      { path: ROUTE_PATHS.PCM, element: <PcmPage /> },
      { path: ROUTE_PATHS.ISDN, element: <IsdnPage /> },
      { path: ROUTE_PATHS.FAX, element: <FaxFaxPage /> },
      { path: "/fax/fax", element: <FaxFaxPage /> },
      { path: ROUTE_PATHS.FEATURE_CODE, element: <FeatureCodePage /> },
      { path: ROUTE_PATHS.VOICEMAIL, element: <VoicemailPage /> },
      { path: ROUTE_PATHS.AUTO_PROVISION, element: <AutoProvision /> },

      { path: ROUTE_PATHS.ROUTE, element: <RouteRoutingParameterPage /> },
      { path: ROUTE_PATHS.E1_ROUTE_IP_TO_PSTN, element: <RouteIpPstnPage /> },
      { path: ROUTE_PATHS.E1_ROUTE_IP_TO_IP, element: <RouteIPToIPPage /> },
      { path: ROUTE_PATHS.E1_ROUTE_PSTN_TO_IP, element: <RoutePstnToIPPage /> },
      { path: ROUTE_PATHS.NUMBER_FILTER, element: <NumberFilterPage /> },
      { path: ROUTE_PATHS.NUM_MANIPULATE, element: <NumManipulatePage /> },
      { path: ROUTE_PATHS.VPN, element: <VpnPage /> },
      { path: "/vpn/server-settings", element: <VpnServerSettings /> },
      { path: "/vpn/account", element: <VpnAccount /> },
      { path: ROUTE_PATHS.DHCP, element: <DhcpPage /> },
      { path: ROUTE_PATHS.NETWORK_SETTINGS_DHCP, element: <DhcpServerSettings /> },
      { path: ROUTE_PATHS.SYSTEM_TOOLS, element: <SystemToolsPage /> },

      { path: ROUTE_PATHS.SIP, element: <SipSipPage /> },
      { path: ROUTE_PATHS.SIP_SIP, element: <SipSipPage /> },
      { path: "/sip/ha", element: <HaPage /> },
      { path: ROUTE_PATHS.GLOBAL_SIP, element: <SipTrunkPage /> },
      { path: ROUTE_PATHS.SIP_REGISTER, element: <SipRegisterPage /> },
      { path: ROUTE_PATHS.EXTENSIONS, element: <Extensions /> },
      { path: ROUTE_PATHS.SIP_TO_SIP_ACCOUNT, element: <SipToSipAccountPage /> },
      { path: ROUTE_PATHS.SIP_TRUNK_GROUP, element: <SipTrunkGroup /> },
      { path: ROUTE_PATHS.EXTENSION_GROUPS, element: <ExtensionGroupsPage /> },
      { path: ROUTE_PATHS.SIP_MEDIA, element: <SipMediaPage /> },
      { path: ROUTE_PATHS.SIP_COMPATIBILITY, element: <SipCompatibilityPage /> },
      { path: ROUTE_PATHS.SIP_NAT_SETTINGS, element: <NatSettingsPage /> },
      { path: ROUTE_PATHS.FXS_VOIP_SIP, element: <FxsVoipSipPage /> },
      { path: ROUTE_PATHS.FXS_VOIP_MEDIA, element: <FxsVoipMediaPage /> },

      { path: ROUTE_PATHS.BLOCKED_LIST, element: <BlockedListPage /> },
      { path: ROUTE_PATHS.CALLBACK, element: <CallBackPage /> },
      { path: ROUTE_PATHS.ORIGINATE_CALL, element: <OriginateCallPage /> },
      { path: ROUTE_PATHS.IVR, element: <IVRPage /> },
      { path: ROUTE_PATHS.CONFERENCE, element: <ConferencePage /> },
      { path: ROUTE_PATHS.CALL_QUEUE, element: <CallQueue /> },
      { path: ROUTE_PATHS.PICKUP_GROUP, element: <PickupGroup /> },
      { path: ROUTE_PATHS.PRIVATE_GROUP, element: <PrivateGroup /> },
      { path: ROUTE_PATHS.PAGING, element: <Paging /> },
      { path: ROUTE_PATHS.CC_ROUTE, element: <CCRoutePage /> },
      { path: ROUTE_PATHS.INBOUND_ROUTES, element: <InboundRoutesPage /> },
      { path: ROUTE_PATHS.OUTBOUND_ROUTES, element: <OutboundRoutesPage /> },
      { path: ROUTE_PATHS.OUTBOUND_RESTRICTIONS, element: <OutboundRestrictions /> },
      { path: ROUTE_PATHS.RING_GROUP, element: <RingGroup /> },
      { path: ROUTE_PATHS.SPEED_DIAL, element: <SpeedDialPage /> },
      { path: ROUTE_PATHS.DISA, element: <DisaPage /> },
      { path: ROUTE_PATHS.TIME_CONDITION, element: <TimeCondition /> },
      { path: ROUTE_PATHS.RECORD_SETTINGS, element: <RecordSettings /> },
      { path: ROUTE_PATHS.VOICE_PROMPTS, element: <VoicePromptsPage /> },

      { path: "/e1-pri/pcm/status", element: <PcmStatusPage /> },
      { path: "/e1-pri/pcm/settings", element: <PcmSettingsPage /> },
      { path: ROUTE_PATHS.PCM_PSTN, element: <PcmPstnPage /> },
      { path: ROUTE_PATHS.PCM_CIRCUIT_MAINTENANCE, element: <PcmCircuitMaintenancePage /> },
      { path: "/e1-pri/pcm/pcm", element: <PcmPcmPage /> },
      { path: "/e1-pri/pcm/trunk", element: <PcmTrunkPage /> },
      { path: ROUTE_PATHS.PCM_TRUNK_GROUP, element: <PcmTrunkGroupPage /> },
      { path: ROUTE_PATHS.PCM_NUM_RECEIVING_RULE, element: <PcmNumReceivingRulePage /> },
      { path: ROUTE_PATHS.PCM_RECEPTION_TIMEOUT, element: <PcmReceptionTimeoutPage /> },

      { path: "/isdn/isdn", element: <IsdnIsdnPage /> },
      { path: "/isdn/number-parameter", element: <IsdnNumberParameterPage /> },
      { path: ROUTE_PATHS.USER_PERMISSION_USERS_MANAGE, element: <UserManage /> },

      { path: ROUTE_PATHS.NUMBER_FILTER_WHITELIST, element: <Whitelist /> },
      { path: ROUTE_PATHS.NUMBER_FILTER_BLACKLIST, element: <Blacklist /> },
      { path: ROUTE_PATHS.NUMBER_FILTER_POOL, element: <NumberPool /> },
      { path: ROUTE_PATHS.NUMBER_FILTER_RULE, element: <FilteringRule /> },
      { path: ROUTE_PATHS.IP_CALL_IN_CALLERID, element: <E1PriIPCallInCallerID /> },
      { path: ROUTE_PATHS.IP_CALL_IN_CALLEEID, element: <E1PriIPCallInCalleeID /> },
      { path: ROUTE_PATHS.IP_CALL_IN_ORICALLEEID, element: <E1PriIPCallInOriCalleeID /> },
      { path: ROUTE_PATHS.PSTN_CALL_IN_CALLERID, element: <E1PriPSTNCallInCallerID /> },
      { path: ROUTE_PATHS.PSTN_CALL_IN_CALLEEID, element: <E1PriPSTNCallInCalleeID /> },
      { path: ROUTE_PATHS.PSTN_CALL_IN_ORICALLEEID, element: <E1PriPSTNCallInOriCalleeID /> },
      { path: ROUTE_PATHS.CALLERID_POOL, element: <E1PriCallerIDPool /> },
      { path: ROUTE_PATHS.CALLERID_RESERVE_POOL, element: <E1PriCallerIDReservePool /> },

      { path: ROUTE_PATHS.NETWORK_SETTINGS_NETWORK, element: <Network /> },
      { path: ROUTE_PATHS.SYSTEM_SETTINGS_STORAGE, element: <Storage /> },
      { path: ROUTE_PATHS.NETWORK_SETTINGS_ROUTING_INTERFACE, element: <RoutingInterface /> },
      { path: ROUTE_PATHS.SYSTEM_SETTINGS_MANAGEMENT, element: <Management /> },
      { path: ROUTE_PATHS.NETWORK_SETTINGS_IP_ROUTING_TABLE, element: <IPRoutingTable /> },
      { path: ROUTE_PATHS.SECURITY_RULES_SIP_ACCESS_CONTROL, element: <SipAccessControl /> },
      { path: ROUTE_PATHS.SECURITY_RULES_ACCESS_CONTROL, element: <AccessControl /> },
      { path: ROUTE_PATHS.NETWORK_SETTINGS_VPN, element: <SystemToolsVPN /> },
      { path: ROUTE_PATHS.SYSTEM_SETTINGS_CENTRALIZED_MANAGE, element: <CentralizedManage /> },
      { path: ROUTE_PATHS.NETWORK_SETTINGS_PING_TEST, element: <PINGTest /> },
      { path: ROUTE_PATHS.NETWORK_SETTINGS_TRACERT_TEST, element: <TRACERTTest /> },
      { path: ROUTE_PATHS.SYSTEM_SETTINGS_ASTERISK_CLI, element: <AsteriskCLI /> },
      { path: ROUTE_PATHS.SYSTEM_SETTINGS_LINUX_CLI, element: <LinuxCLI /> },
      { path: ROUTE_PATHS.USER_PERMISSION_ACCOUNT_MANAGE, element: <AccountManage /> },
      { path: ROUTE_PATHS.USER_PERMISSION_CHANGE_PASSWORD, element: <ChangePassword /> },

      { path: ROUTE_PATHS.AUTHORIZATION, element: <Authorization /> },
      { path: ROUTE_PATHS.IDS_SETTINGS, element: <IDSSettings /> },
      { path: ROUTE_PATHS.DDOS_SETTINGS, element: <DDOSSettings /> },
      { path: ROUTE_PATHS.CERTIFICATE_MANAGE, element: <CertificateManage /> },
      { path: ROUTE_PATHS.RADIUS, element: <Radius /> },
      { path: ROUTE_PATHS.SIP_ACCOUNT_GENERATOR, element: <SIPAccountGenerator /> },
      { path: ROUTE_PATHS.CONFIG_FILE, element: <ConfigFile /> },
      { path: ROUTE_PATHS.SIGNALING_CAPTURE, element: <SignalingCapture /> },
      { path: ROUTE_PATHS.SIGNALING_CALL_TEST, element: <SignalingCallTest /> },
      { path: ROUTE_PATHS.SIGNALING_CALL_TRACK, element: <SignalingCallTrack /> },
      { path: ROUTE_PATHS.MODIFICATION_RECORD, element: <ModificationRecord /> },
      { path: ROUTE_PATHS.OPERATIONS_LOG, element: <OperationsLog /> },
      { path: ROUTE_PATHS.BACKUP_UPLOAD, element: <BackupUpload /> },
      { path: ROUTE_PATHS.FACTORY_RESET, element: <FactoryReset /> },
      { path: ROUTE_PATHS.UPGRADE, element: <Upgrade /> },
      { path: ROUTE_PATHS.DEVICE_LOCK, element: <DeviceLock /> },
      { path: ROUTE_PATHS.RESTART, element: <Restart /> },
      { path: ROUTE_PATHS.LICENCE, element: <LicenceRouteGate /> },
      { path: ROUTE_PATHS.SQL_UPLOAD, element: <SystemToolsSqlUpload /> },
      { path: ROUTE_PATHS.HOSTS, element: <Hosts /> },
      { path: ROUTE_PATHS.LICENSE_LIMITS, element: <LicenseLimits /> },

      { path: ROUTE_PATHS.PORT_FXS, element: <PortFxsPage /> },
      { path: ROUTE_PATHS.PORT_FXS_ADVANCED, element: <PortFxsAdvancedPage /> },
      { path: ROUTE_PATHS.FXS_GENERAL, element: <FxsPage /> },
      { path: ROUTE_PATHS.FXS_ACTION_URL, element: <FxsActionUrlPage /> },
      { path: ROUTE_PATHS.FXS_AREA_SELECT, element: <FxsAreaSelectPage /> },
      { path: ROUTE_PATHS.FXS_CDR_QUERY, element: <FxsCdrQueryPage /> },
      { path: ROUTE_PATHS.FXS_COLOR_RING, element: <FxsColorRingPage /> },
      { path: ROUTE_PATHS.FXS_CUE_TONE, element: <FxsCueTonePage /> },
      { path: ROUTE_PATHS.FXS_DIALING_RULE, element: <FxsDialingRulePage /> },
      { path: ROUTE_PATHS.FXS_DIALING_TIMEOUT, element: <FxsDialingTimeoutPage /> },
      { path: ROUTE_PATHS.FXS_DTMF, element: <FxsDtmfPage /> },
      { path: ROUTE_PATHS.FXS_FUNCTION_KEY, element: <FxsFunctionKeyPage /> },
      { path: ROUTE_PATHS.FXS_QOS, element: <FxsQosPage /> },
      { path: ROUTE_PATHS.FXS_RINGING_SCHEME, element: <FxsRingingSchemePage /> },
      { path: ROUTE_PATHS.FXS_TONE_DETECTOR, element: <FxsToneDetecterPage /> },
      { path: ROUTE_PATHS.FXS_TONE_GENERATOR, element: <FxsToneGeneratorPage /> },
      { path: ROUTE_PATHS.PORT_GROUP, element: <PortGroupPage /> },
      { path: ROUTE_PATHS.FXS_ROUTE, element: <FxsRouteRoutingParameterPage /> },
      { path: ROUTE_PATHS.FXS_ROUTE_IP_TO_PSTN, element: <FxsRouteIpToTelPage /> },
      { path: ROUTE_PATHS.FXS_ROUTE_PSTN_TO_IP, element: <FxsRouteTelToIpPage /> },
      { path: ROUTE_PATHS.FXS_IP_CALL_IN_CALLERID, element: <FxsIPCallInCallerID /> },
      { path: ROUTE_PATHS.FXS_IP_CALL_IN_CALLEEID, element: <FxsIPCallInCalleeID /> },
      { path: ROUTE_PATHS.FXS_PSTN_CALL_IN_CALLERID, element: <FxsPSTNCallInCallerID /> },
      { path: ROUTE_PATHS.FXS_PSTN_CALL_IN_CALLEEID, element: <FxsPSTNCallInCalleeID /> },

      // Legacy redirects (old paths -> new hierarchy)
      { path: "/system-status/system-info", element: <Navigate to={ROUTE_PATHS.SYSTEM_INFO} replace /> },
      { path: "/pbx-status/pbx-monitor", element: <Navigate to={ROUTE_PATHS.PBX_MONITOR} replace /> },
      { path: "/pbx-status/active-calls", element: <Navigate to={ROUTE_PATHS.ACTIVE_CALLS} replace /> },
      { path: "/pbx-status/active-call-queue", element: <Navigate to={ROUTE_PATHS.ACTIVE_CALL_QUEUE} replace /> },
      { path: "/pbx-status/view-voicemail", element: <Navigate to={ROUTE_PATHS.VIEW_VOICEMAIL} replace /> },
      { path: "/call-detail-records/call-count", element: <Navigate to={ROUTE_PATHS.CALL_COUNT} replace /> },
      { path: "/extensions/extensions", element: <Navigate to={ROUTE_PATHS.EXTENSIONS} replace /> },
      { path: "/extensions/extension-groups", element: <Navigate to={ROUTE_PATHS.EXTENSION_GROUPS} replace /> },
      { path: "/trunks/sip-register", element: <Navigate to={ROUTE_PATHS.SIP_REGISTER} replace /> },
      { path: "/call-control/cc-route", element: <Navigate to={ROUTE_PATHS.CC_ROUTE} replace /> },
      { path: "/call-control/inbound-routes", element: <Navigate to={ROUTE_PATHS.INBOUND_ROUTES} replace /> },
      { path: "/call-control/outbound-routes", element: <Navigate to={ROUTE_PATHS.OUTBOUND_ROUTES} replace /> },
      { path: "/call-control/outbound-restrictions", element: <Navigate to={ROUTE_PATHS.OUTBOUND_RESTRICTIONS} replace /> },
      { path: "/call-control/time-condition", element: <Navigate to={ROUTE_PATHS.TIME_CONDITION} replace /> },
      { path: "/call-features/blocked-list", element: <Navigate to={ROUTE_PATHS.BLOCKED_LIST} replace /> },
      { path: "/call-features/callback", element: <Navigate to={ROUTE_PATHS.CALLBACK} replace /> },
      { path: "/call-features/originate-call", element: <Navigate to={ROUTE_PATHS.ORIGINATE_CALL} replace /> },
      { path: "/call-features/ivr", element: <Navigate to={ROUTE_PATHS.IVR} replace /> },
      { path: "/call-features/conference", element: <Navigate to={ROUTE_PATHS.CONFERENCE} replace /> },
      { path: "/call-features/call-queue", element: <Navigate to={ROUTE_PATHS.CALL_QUEUE} replace /> },
      { path: "/call-features/pickup-group", element: <Navigate to={ROUTE_PATHS.PICKUP_GROUP} replace /> },
      { path: "/call-features/ring-group", element: <Navigate to={ROUTE_PATHS.RING_GROUP} replace /> },
      { path: "/call-features/private-group", element: <Navigate to={ROUTE_PATHS.PRIVATE_GROUP} replace /> },
      { path: "/call-features/paging", element: <Navigate to={ROUTE_PATHS.PAGING} replace /> },
      { path: "/call-features/speed-dial", element: <Navigate to={ROUTE_PATHS.SPEED_DIAL} replace /> },
      { path: "/call-features/disa", element: <Navigate to={ROUTE_PATHS.DISA} replace /> },
      { path: "/record-settings/record-settings", element: <Navigate to={ROUTE_PATHS.RECORD_SETTINGS} replace /> },
      { path: "/voice-prompts/voice-prompts", element: <Navigate to={ROUTE_PATHS.VOICE_PROMPTS} replace /> },
      { path: "/feature-code/feature-code", element: <Navigate to={ROUTE_PATHS.FEATURE_CODE} replace /> },
      { path: "/voicemail/voicemail", element: <Navigate to={ROUTE_PATHS.VOICEMAIL} replace /> },
      { path: "/auto-provision/auto-provision", element: <Navigate to={ROUTE_PATHS.AUTO_PROVISION} replace /> },
      { path: "/voip/sip", element: <Navigate to={ROUTE_PATHS.FXS_VOIP_SIP} replace /> },
      { path: "/voip/media", element: <Navigate to={ROUTE_PATHS.FXS_VOIP_MEDIA} replace /> },
      { path: "/voip/sip-compatibility", element: <Navigate to={ROUTE_PATHS.SIP_COMPATIBILITY} replace /> },
      { path: "/voip/nat-settings", element: <Navigate to={ROUTE_PATHS.SIP_NAT_SETTINGS} replace /> },
      { path: "/port/port-group", element: <Navigate to={ROUTE_PATHS.PORT_GROUP} replace /> },
      { path: "/port/fxs-settings", element: <Navigate to={ROUTE_PATHS.PORT_FXS} replace /> },
      { path: "/port/fxs-advanced", element: <Navigate to={ROUTE_PATHS.PORT_FXS_ADVANCED} replace /> },
      { path: "/advanced/general", element: <Navigate to={ROUTE_PATHS.FXS_GENERAL} replace /> },
      { path: "/advanced/action-url", element: <Navigate to={ROUTE_PATHS.FXS_ACTION_URL} replace /> },
      { path: "/advanced/area-select", element: <Navigate to={ROUTE_PATHS.FXS_AREA_SELECT} replace /> },
      { path: "/advanced/cdr-query", element: <Navigate to={ROUTE_PATHS.FXS_CDR_QUERY} replace /> },
      { path: "/advanced/color-ring", element: <Navigate to={ROUTE_PATHS.FXS_COLOR_RING} replace /> },
      { path: "/advanced/cue-tone", element: <Navigate to={ROUTE_PATHS.FXS_CUE_TONE} replace /> },
      { path: "/advanced/dialing-rule", element: <Navigate to={ROUTE_PATHS.FXS_DIALING_RULE} replace /> },
      { path: "/advanced/dialing-timeout", element: <Navigate to={ROUTE_PATHS.FXS_DIALING_TIMEOUT} replace /> },
      { path: "/advanced/dtmf", element: <Navigate to={ROUTE_PATHS.FXS_DTMF} replace /> },
      { path: "/advanced/function-key", element: <Navigate to={ROUTE_PATHS.FXS_FUNCTION_KEY} replace /> },
      { path: "/advanced/qos", element: <Navigate to={ROUTE_PATHS.FXS_QOS} replace /> },
      { path: "/advanced/ringing-scheme", element: <Navigate to={ROUTE_PATHS.FXS_RINGING_SCHEME} replace /> },
      { path: "/advanced/tone-detector", element: <Navigate to={ROUTE_PATHS.FXS_TONE_DETECTOR} replace /> },
      { path: "/advanced/tone-generator", element: <Navigate to={ROUTE_PATHS.FXS_TONE_GENERATOR} replace /> },
      { path: "/route/routing-parameters", element: <Navigate to={ROUTE_PATHS.ROUTE} replace /> },
      { path: "/route/ip-to-pstn", element: <Navigate to={ROUTE_PATHS.E1_ROUTE_IP_TO_PSTN} replace /> },
      { path: "/route/ip-to-ip", element: <Navigate to={ROUTE_PATHS.E1_ROUTE_IP_TO_IP} replace /> },
      { path: "/route/pstn-to-ip", element: <Navigate to={ROUTE_PATHS.E1_ROUTE_PSTN_TO_IP} replace /> },
      { path: "/number-filter", element: <Navigate to={ROUTE_PATHS.NUMBER_FILTER} replace /> },
      { path: "/number-filter/whitelist", element: <Navigate to={ROUTE_PATHS.NUMBER_FILTER_WHITELIST} replace /> },
      { path: "/number-filter/blacklist", element: <Navigate to={ROUTE_PATHS.NUMBER_FILTER_BLACKLIST} replace /> },
      { path: "/number-filter/number-pool", element: <Navigate to={ROUTE_PATHS.NUMBER_FILTER_POOL} replace /> },
      { path: "/number-filter/filtering-rule", element: <Navigate to={ROUTE_PATHS.NUMBER_FILTER_RULE} replace /> },
      { path: "/num-manipulate", element: <Navigate to={ROUTE_PATHS.NUM_MANIPULATE} replace /> },
      { path: "/num-manipulate/ip-call-in-callerid", element: <Navigate to={ROUTE_PATHS.IP_CALL_IN_CALLERID} replace /> },
      { path: "/num-manipulate/ip-call-in-calleeid", element: <Navigate to={ROUTE_PATHS.IP_CALL_IN_CALLEEID} replace /> },
      { path: "/num-manipulate/ip-call-in-oricalleeid", element: <Navigate to={ROUTE_PATHS.IP_CALL_IN_ORICALLEEID} replace /> },
      { path: "/num-manipulate/pstn-call-in-callerid", element: <Navigate to={ROUTE_PATHS.PSTN_CALL_IN_CALLERID} replace /> },
      { path: "/num-manipulate/pstn-call-in-calleeid", element: <Navigate to={ROUTE_PATHS.PSTN_CALL_IN_CALLEEID} replace /> },
      { path: "/num-manipulate/pstn-call-in-oricalleeid", element: <Navigate to={ROUTE_PATHS.PSTN_CALL_IN_ORICALLEEID} replace /> },
      { path: "/num-manipulate/callerid-pool", element: <Navigate to={ROUTE_PATHS.CALLERID_POOL} replace /> },
      { path: "/num-manipulate/callerid-reserve-pool", element: <Navigate to={ROUTE_PATHS.CALLERID_RESERVE_POOL} replace /> },
      { path: "/pcm", element: <Navigate to={ROUTE_PATHS.PCM} replace /> },
      { path: "/pcm/pstn", element: <Navigate to={ROUTE_PATHS.PCM_PSTN} replace /> },
      { path: "/pcm/circuit-maintenance", element: <Navigate to={ROUTE_PATHS.PCM_CIRCUIT_MAINTENANCE} replace /> },
      { path: "/pcm/pcm-trunk-group", element: <Navigate to={ROUTE_PATHS.PCM_TRUNK_GROUP} replace /> },
      { path: "/pcm/num-receiving-rule", element: <Navigate to={ROUTE_PATHS.PCM_NUM_RECEIVING_RULE} replace /> },
      { path: "/pcm/reception-timeout", element: <Navigate to={ROUTE_PATHS.PCM_RECEPTION_TIMEOUT} replace /> },
      { path: "/pcm/status", element: <Navigate to="/e1-pri/pcm/status" replace /> },
      { path: "/pcm/settings", element: <Navigate to="/e1-pri/pcm/settings" replace /> },
      { path: "/pcm/pcm", element: <Navigate to="/e1-pri/pcm/pcm" replace /> },
      { path: "/pcm/trunk", element: <Navigate to="/e1-pri/pcm/trunk" replace /> },
      { path: "/sip", element: <Navigate to={ROUTE_PATHS.SIP} replace /> },
      { path: "/sip/sip", element: <Navigate to={ROUTE_PATHS.SIP_SIP} replace /> },
      { path: "/sip/sip-to-sip-account", element: <Navigate to={ROUTE_PATHS.SIP_TO_SIP_ACCOUNT} replace /> },
      { path: "/sip/sip-trunk-group", element: <Navigate to={ROUTE_PATHS.SIP_TRUNK_GROUP} replace /> },
      { path: "/sip/media", element: <Navigate to={ROUTE_PATHS.SIP_MEDIA} replace /> },
      { path: "/sip/sip-trunk", element: <Navigate to={ROUTE_PATHS.GLOBAL_SIP} replace /> },
      { path: "/system-settings/global-sip", element: <Navigate to={ROUTE_PATHS.GLOBAL_SIP} replace /> },
      { path: "/system-settings/storage", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_STORAGE} replace /> },
      { path: "/system-settings/management", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_MANAGEMENT} replace /> },
      { path: "/system-settings/centralized-manage", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_CENTRALIZED_MANAGE} replace /> },
      { path: "/system-settings/asterisk-cli", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_ASTERISK_CLI} replace /> },
      { path: "/system-settings/linux-cli", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_LINUX_CLI} replace /> },
      { path: "/network-settings/network", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_NETWORK} replace /> },
      { path: "/network-settings/routing-interface", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_ROUTING_INTERFACE} replace /> },
      { path: "/network-settings/ip-routing-table", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_IP_ROUTING_TABLE} replace /> },
      { path: "/network-settings/ping-test", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_PING_TEST} replace /> },
      { path: "/network-settings/tracert-test", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_TRACERT_TEST} replace /> },
      { path: "/network-settings/vpn", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_VPN} replace /> },
      { path: "/security-rules/access-control", element: <Navigate to={ROUTE_PATHS.SECURITY_RULES_ACCESS_CONTROL} replace /> },
      { path: "/security-rules/sip-access-control", element: <Navigate to={ROUTE_PATHS.SECURITY_RULES_SIP_ACCESS_CONTROL} replace /> },
      { path: "/dhcp/server-settings", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_DHCP} replace /> },
      { path: "/system-tools", element: <Navigate to={ROUTE_PATHS.SYSTEM_TOOLS} replace /> },
      { path: "/system-tools/authorization", element: <Navigate to={ROUTE_PATHS.AUTHORIZATION} replace /> },
      { path: "/system-tools/ids-settings", element: <Navigate to={ROUTE_PATHS.IDS_SETTINGS} replace /> },
      { path: "/system-tools/ddos-settings", element: <Navigate to={ROUTE_PATHS.DDOS_SETTINGS} replace /> },
      { path: "/system-tools/certificate-manage", element: <Navigate to={ROUTE_PATHS.CERTIFICATE_MANAGE} replace /> },
      { path: "/system-tools/radius", element: <Navigate to={ROUTE_PATHS.RADIUS} replace /> },
      { path: "/system-tools/sip-account-generator", element: <Navigate to={ROUTE_PATHS.SIP_ACCOUNT_GENERATOR} replace /> },
      { path: "/system-tools/config-file", element: <Navigate to={ROUTE_PATHS.CONFIG_FILE} replace /> },
      { path: "/system-tools/hosts", element: <Navigate to={ROUTE_PATHS.HOSTS} replace /> },
      { path: "/system-tools/signaling-capture", element: <Navigate to={ROUTE_PATHS.SIGNALING_CAPTURE} replace /> },
      { path: "/system-tools/signaling-call-test", element: <Navigate to={ROUTE_PATHS.SIGNALING_CALL_TEST} replace /> },
      { path: "/system-tools/signaling-call-track", element: <Navigate to={ROUTE_PATHS.SIGNALING_CALL_TRACK} replace /> },
      { path: "/system-tools/modification-record", element: <Navigate to={ROUTE_PATHS.MODIFICATION_RECORD} replace /> },
      { path: "/system-tools/operations-log", element: <Navigate to={ROUTE_PATHS.OPERATIONS_LOG} replace /> },
      { path: "/system-tools/backup-upload", element: <Navigate to={ROUTE_PATHS.BACKUP_UPLOAD} replace /> },
      { path: "/system-tools/factory-reset", element: <Navigate to={ROUTE_PATHS.FACTORY_RESET} replace /> },
      { path: "/system-tools/upgrade", element: <Navigate to={ROUTE_PATHS.UPGRADE} replace /> },
      { path: "/system-tools/device-lock", element: <Navigate to={ROUTE_PATHS.DEVICE_LOCK} replace /> },
      { path: "/system-tools/restart", element: <Navigate to={ROUTE_PATHS.RESTART} replace /> },
      { path: "/system-tools/licence", element: <Navigate to={ROUTE_PATHS.LICENCE} replace /> },
      { path: "/system-tools/sql-upload", element: <Navigate to={ROUTE_PATHS.SQL_UPLOAD} replace /> },
      { path: "/system-tools/license-limits", element: <Navigate to={ROUTE_PATHS.LICENSE_LIMITS} replace /> },
      { path: "/system-tools/network", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_NETWORK} replace /> },
      { path: "/system-tools/storage", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_STORAGE} replace /> },
      { path: "/system-tools/routing-interface", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_ROUTING_INTERFACE} replace /> },
      { path: "/system-tools/management", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_MANAGEMENT} replace /> },
      { path: "/system-tools/ip-routing-table", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_IP_ROUTING_TABLE} replace /> },
      { path: "/system-tools/sip-access-control", element: <Navigate to={ROUTE_PATHS.SECURITY_RULES_SIP_ACCESS_CONTROL} replace /> },
      { path: "/system-tools/access-control", element: <Navigate to={ROUTE_PATHS.SECURITY_RULES_ACCESS_CONTROL} replace /> },
      { path: "/system-tools/vpn", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_VPN} replace /> },
      { path: "/system-tools/centralized-manage", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_CENTRALIZED_MANAGE} replace /> },
      { path: "/system-tools/ping-test", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_PING_TEST} replace /> },
      { path: "/system-tools/tracert-test", element: <Navigate to={ROUTE_PATHS.NETWORK_SETTINGS_TRACERT_TEST} replace /> },
      { path: "/system-tools/asterisk-cli", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_ASTERISK_CLI} replace /> },
      { path: "/system-tools/linux-cli", element: <Navigate to={ROUTE_PATHS.SYSTEM_SETTINGS_LINUX_CLI} replace /> },
      { path: "/system-tools/global-sip", element: <Navigate to={ROUTE_PATHS.GLOBAL_SIP} replace /> },
      { path: "/system-tools/account-manage", element: <Navigate to={ROUTE_PATHS.USER_PERMISSION_ACCOUNT_MANAGE} replace /> },
      { path: "/system-tools/change-password", element: <Navigate to={ROUTE_PATHS.USER_PERMISSION_CHANGE_PASSWORD} replace /> },
      { path: "/user-manage/users", element: <Navigate to={ROUTE_PATHS.USER_PERMISSION_USERS_MANAGE} replace /> },
      { path: "/user-manage", element: <Navigate to={ROUTE_PATHS.USER_PERMISSION_USERS_MANAGE} replace /> },
      { path: "/user-permission/users-manage", element: <Navigate to={ROUTE_PATHS.USER_PERMISSION_USERS_MANAGE} replace /> },
      { path: "/user-permission/users", element: <Navigate to={ROUTE_PATHS.USER_PERMISSION_USERS_MANAGE} replace /> },
      { path: "/user-permission/account-manage", element: <Navigate to={ROUTE_PATHS.USER_PERMISSION_ACCOUNT_MANAGE} replace /> },
      { path: "/user-permission/change-password", element: <Navigate to={ROUTE_PATHS.USER_PERMISSION_CHANGE_PASSWORD} replace /> },
    ],
  },
  // 404 route - should be last
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
