// router.jsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import { ROUTE_PATHS } from './constants/routeConstatns';
import SystemInfo from './modules/status/System Status/SystemInfo';
import PstnStatus from './components/PstnStatus';
import PcmInfo from './components/PcmInfo';
import CallCount from './modules/CDR/CallCount';
import WarningInfo from './components/WarningInfo';
import PcmPage from './components/PcmPage';
import IsdnPage from './components/IsdnPage';
import FaxFaxPage from './components/FaxFaxPage';
import NumberFilterPage from './components/NumberFilterPage';
import NumManipulatePage from './modules/FXS/Num Manipulate/NumManipulatePage';
import VpnPage from './modules/System/System Settings/VpnPage';
import DhcpPage from './modules/System/System Settings/DhcpPage';
import SystemToolsPage from './components/SystemToolsPage';
import LoginPage from './components/LoginPage';
import SipSipPage from './components/SipSipPage';
import HaPage from './components/HaPage';
import SipTrunkPage from './components/SipTrunkPage';
import SipRegisterPage from './modules/PBX/Trunks/SipRegisterPage';
import Extensions from './modules/PBX/Extensions/Extensions';
import SipTrunkGroup from './modules/PBX/SIP/SipTrunkGroup';
import SipToSipAccountPage from './modules/PBX/SIP/SipToSipAccountPage';
import SipMediaPage from './modules/PBX/SIP/SipMediaPage';
import ExtensionGroupsPage from './modules/PBX/Extensions/ExtensionGroupsPage';
import BlockedListPage from './modules/PBX/CallFeatures/BlockedListPage';
import CallBackPage from './modules/PBX/CallFeatures/CallBackPage';
import OriginateCallPage from './modules/PBX/CallFeatures/OriginateCallPage';
import ActiveCallsPage from './modules/status/PBX Status/ActiveCallsPage';
import CCRoutePage from './modules/PBX/CallControl/CCRoutePage';
import InboundRoutesPage from './modules/PBX/CallControl/InboundRoutesPage';
import IVRPage from './modules/PBX/CallFeatures/IVRPage';
import ProtectedRoute from './components/ProtectedRoute';
import PcmStatusPage from './components/PcmStatusPage';
import PcmSettingsPage from './components/PcmSettingsPage';
import PcmPstnPage from './modules/E1-PRI/PCM/PcmPstnPage';
import PcmCircuitMaintenancePage from './modules/E1-PRI/PCM/PcmCircuitMaintenancePage';
import PcmPcmPage from './components/PcmPcmPage';
import PcmTrunkPage from './modules/E1-PRI/PCM/PcmTrunkPage';
import PcmTrunkGroupPage from './components/PcmTrunkGroupPage';
import PcmNumReceivingRulePage from './modules/E1-PRI/PCM/PcmNumReceivingRulePage';
import PcmReceptionTimeoutPage from './modules/E1-PRI/PCM/PcmReceptionTimeoutPage';
import IsdnIsdnPage from './components/IsdnIsdnPage';
import IsdnNumberParameterPage from './components/IsdnNumberParameterPage';
import RouteRoutingParameterPage from './modules/E1-PRI/Route/RouteRoutingParameterPage';
import RouteIpPstnPage from './modules/E1-PRI/Route/RouteIpPstnPage';
import RouteIPToIPPage from './modules/E1-PRI/Route/RouteIPToIPPage';
import RoutePstnToIPPage from './modules/E1-PRI/Route/RoutePstnToIPpage';
import Whitelist from './modules/E1-PRI/Number Filter/Whitelist';
import Blacklist from './modules/E1-PRI/Number Filter/Blacklist';
import NumberPool from './modules/E1-PRI/Number Filter/NumberPool';
import FilteringRule from './modules/E1-PRI/Number Filter/FilteringRule';
import IPCallInCallerID from './modules/E1-PRI/Num Manipulate/IPCallInCallerID';
import IPCallInCalleeID from './modules/E1-PRI/Num Manipulate/IPCallInCalleeID';
import IPCallInOriCalleeID from './modules/E1-PRI/Num Manipulate/IPCallInOriCalleeID';
import PSTNCallInCallerID from './modules/E1-PRI/Num Manipulate/PSTNCallInCallerID';
import PSTNCallInCalleeID from './modules/E1-PRI/Num Manipulate/PSTNCallInCalleeID';
import PSTNCallInOriCalleeID from './modules/E1-PRI/Num Manipulate/PSTNCallInOriCalleeID';
import CallerIDPool from './components/CallerIDPool';
import CallerIDReservePool from './components/CallerIDReservePool';
import VpnServerSettings from './components/VpnServerSettings';
import VpnAccount from './components/VpnAccount';
import DhcpServerSettings from './components/DhcpServerSettings';
import Network from './modules/System/System Settings/Network';
import Authorization from './modules/Maitenance/System Tools/Authorization';
import Management from './modules/System/System Settings/Management';
import IPRoutingTable from './modules/System/System Settings/IPRoutingTable';
import AccessControl from './modules/System/System Settings/AccessControl';
import IDSSettings from './modules/Maitenance/System Tools/IDSSettings';
import DDOSSettings from './modules/Maitenance/System Tools/DDOSSettings';
import SystemToolsVPN from './components/SystemToolsVPN';
import CertificateManage from './modules/Maitenance/System Tools/CertificateManage';
import CentralizedManage from './modules/System/System Settings/CentralizedManage';
import Radius from './modules/Maitenance/System Tools/Radius';
import SIPAccountGenerator from './modules/Maitenance/System Tools/SIPAccountGenerator';
import ConfigFile from './modules/Maitenance/System Tools/ConfigFile';
import SignalingCapture from './modules/Maitenance/System Tools/SignalingCapture';
import SignalingCallTest from './modules/Maitenance/System Tools/SignalingCallTest';
import SignalingCallTrack from './modules/Maitenance/System Tools/SignalingCallTrack';
import PINGTest from './modules/System/System Settings/PINGTest';
import TRACERTTest from './modules/System/System Settings/TRACERTTest';
import AsteriskCLI from './modules/System/System Settings/AsteriskCLI';
import LinuxCLI from './modules/System/System Settings/LinuxCLI';
import ModificationRecord from './modules/Maitenance/System Tools/ModificationRecord';
import BackupUpload from './modules/Maitenance/System Tools/BackupUpload';
import FactoryReset from './modules/Maitenance/System Tools/FactoryReset';
import Upgrade from './modules/Maitenance/System Tools/Upgrade';
import AccountManage from './modules/UserManage/User Permission/AccountManage';
import ChangePassword from './modules/UserManage/User Permission/ChangePassword';
import DeviceLock from './modules/Maitenance/System Tools/DeviceLock';
import Restart from './modules/Maitenance/System Tools/Restart';
import LicenceRouteGate from './components/LicenceRouteGate';
import SystemToolsSqlUpload from './modules/Maitenance/System Tools/SystemToolsSqlUpload';
import Hosts from './modules/Maitenance/System Tools/Hosts';
import ConferencePage from './modules/PBX/CallFeatures/ConferencePage';
import PickupGroup from './modules/PBX/CallFeatures/PickupGroup';
import RingGroup from './modules/PBX/CallFeatures/RingGroup';
import PrivateGroup from './modules/PBX/CallFeatures/PrivateGroup';
import Paging from './modules/PBX/CallFeatures/Paging';
import OutboundRoutesPage from './modules/PBX/CallControl/OutboundRoutesPage';
import SpeedDialPage from './modules/PBX/CallFeatures/SpeedDialPage';
import DisaPage from './modules/PBX/CallFeatures/DisaPage';
import VoicePromptsPage from './modules/PBX/VoicePrompts/VoicePromptsPage';
import PbxMonitor from './modules/status/PBX Status/PbxMonitor';
import PortFxsPage from './modules/FXS/Port/PortFxsPage';
import PortFxsAdvancedPage from './modules/FXS/Port/PortFxsAdvancedPage';
import PortGroupPage from './modules/FXS/Port/PortGroupPage';
import FxsPage from './modules/FXS/Advanced/FxsPage';
import SipCompatibilityPage from './modules/FXS/VoIP/SipCompatibilityPage';
import NatSettingsPage from './modules/FXS/VoIP/NatSettingsPage';
import FxsVoipSipPage from './modules/FXS/VoIP/FxsVoipSipPage';
import FxsVoipMediaPage from './modules/FXS/VoIP/FxsVoipMediaPage';
import FxsActionUrlPage from './modules/FXS/Advanced/ActionUrlPage';
import FxsAreaSelectPage from './modules/FXS/Advanced/AreaSelectPage';
import FxsCdrQueryPage from './modules/FXS/Advanced/CdrQueryPage';
import FxsColorRingPage from './modules/FXS/Advanced/ColorRingPage';
import FxsCueTonePage from './modules/FXS/Advanced/CueTonePage';
import FxsDialingRulePage from './modules/FXS/Advanced/DialingRulePage';
import FxsDialingTimeoutPage from './modules/FXS/Advanced/DialingTimeoutPage';
import FxsDtmfPage from './modules/FXS/Advanced/DtmfPage';
import FxsFunctionKeyPage from './modules/FXS/Advanced/FunctionKeyPage';
import FxsQosPage from './modules/FXS/Advanced/QosPage';
import FxsRingingSchemePage from './modules/FXS/Advanced/RingingSchemePage';
import FxsToneDetecterPage from './modules/FXS/Advanced/ToneDetecterPage';
import FxsToneGeneratorPage from './modules/FXS/Advanced/ToneGeneratorPage';
import CallQueue from './modules/PBX/CallFeatures/CallQueue';
import OutboundRestrictions from './modules/PBX/CallControl/OutboundRestrictions';
import FeatureCodePage from './modules/PBX/Features Codes/FeatureCodePage';
import UserManage from './components/UserManage';
// FXS → modules/FXS/Route pages
import FxsRouteRoutingParameterPage from './modules/FXS/Route/RouteRoutingParameterPage';
import FxsRouteIpToTelPage from './modules/FXS/Route/RouteIpToTelPage';
import FxsRouteTelToIpPage from './modules/FXS/Route/RouteTelToIPpage';
// FXS → modules/FXS/Num Manipulate pages
import FxsIPCallInCallerID from './modules/FXS/Num Manipulate/FxsIPCallInCallerID';
import FxsIPCallInCalleeID from './modules/FXS/Num Manipulate/FxsIPCallInCalleeID';
import FxsPSTNCallInCallerID from './modules/FXS/Num Manipulate/FxsPSTNCallInCallerID';
import FxsPSTNCallInCalleeID from './modules/FXS/Num Manipulate/FxsPSTNCallInCalleeID';
import ActiveCallQueue from './modules/status/PBX Status/ActiveCallQueue';
import TimeCondition from './modules/PBX/CallControl/TimeCondition';
// Error Boundary Component
const ErrorBoundary = ({ error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-4">{error?.message || 'An unexpected error occurred'}</p>
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
      // Operation Info nested routes
      {
        path: ROUTE_PATHS.SYSTEM_INFO,
        element: <SystemInfo />,
      },
      {
        path: ROUTE_PATHS.PSTN_STATUS,
        element: <PstnStatus />,
      },
      {
        path: ROUTE_PATHS.PSM_INFO,
        element: <PcmInfo />,
      },
      {
        path: ROUTE_PATHS.CALL_COUNT,
        element: <CallCount />,
      },
      {
        path: ROUTE_PATHS.WARNING_INFO,
        element: <WarningInfo />,
      },
      // Main feature routes
      {
        path: ROUTE_PATHS.PCM,
        element: <PcmPage />,
      },
      {
        path: ROUTE_PATHS.ISDN,
        element: <IsdnPage />,
      },
      {
        path: ROUTE_PATHS.FAX,
        element: <FaxFaxPage />,
      },
      {
        path: '/fax/fax',
        element: <FaxFaxPage />,
      },
      {
        path: '/feature-code/feature-code',
        element: <FeatureCodePage />,
      },
      {
        path: '/route/routing-parameters',
        element: <RouteRoutingParameterPage />,
      },
      {
        path: '/route/ip-to-pstn',
        element: <RouteIpPstnPage />,
      },
      {
        path: '/route/ip-to-ip',
        element: <RouteIPToIPPage />,
      },
      {
        path: '/route/pstn-to-ip',
        element: <RoutePstnToIPPage />,
      },
      {
        path: ROUTE_PATHS.NUMBER_FILTER,
        element: <NumberFilterPage />,
      },
      {
        path: ROUTE_PATHS.NUM_MANIPULATE,
        element: <NumManipulatePage />,
      },
      {
        path: ROUTE_PATHS.VPN,
        element: <VpnPage />,
      },
      {
        path: '/vpn/server-settings',
        element: <VpnServerSettings />,
      },
      {
        path: '/vpn/account',
        element: <VpnAccount />,
      },
      {
        path: ROUTE_PATHS.DHCP,
        element: <DhcpPage />,
      },
      {
        path: '/dhcp/server-settings',
        element: <DhcpServerSettings />,
      },
      {
        path: ROUTE_PATHS.SYSTEM_TOOLS,
        element: <SystemToolsPage />,
      },
      // SIP submenu routes
      { path: '/sip/sip', element: <SipSipPage /> },
      { path: '/sip/ha', element: <HaPage /> },
      { path: '/sip/sip-trunk', element: <SipTrunkPage /> },
      { path: '/trunks/sip-register', element: <SipRegisterPage /> },
      { path: '/extensions/extensions', element: <Extensions /> },
      { path: '/sip/sip-to-sip-account', element: <SipToSipAccountPage /> },
      { path: '/sip/sip-trunk-group', element: <SipTrunkGroup /> },
      { path: '/extensions/extension-groups', element: <ExtensionGroupsPage /> },
      { path: '/sip/media', element: <SipMediaPage /> },
      { path: ROUTE_PATHS.SIP_COMPATIBILITY, element: <SipCompatibilityPage /> },
      { path: ROUTE_PATHS.SIP_NAT_SETTINGS, element: <NatSettingsPage /> },
      { path: ROUTE_PATHS.FXS_VOIP_SIP, element: <FxsVoipSipPage /> },
      { path: ROUTE_PATHS.FXS_VOIP_MEDIA, element: <FxsVoipMediaPage /> },
      { path: '/call-features/blocked-list', element: <BlockedListPage /> },
      { path: '/call-features/callback', element: <CallBackPage /> },
      { path: '/call-features/originate-call', element: <OriginateCallPage /> },
      { path: '/call-features/ivr', element: <IVRPage /> },
      { path: ROUTE_PATHS.CONFERENCE, element: <ConferencePage /> },
      { path: '/call-features/call-queue', element: <CallQueue/>},
      { path: '/call-features/pickup-group', element: <PickupGroup /> },
      { path: '/call-features/private-group', element: <PrivateGroup /> },
      { path: '/call-features/paging', element: <Paging /> },
      { path: '/call-control/cc-route', element: <CCRoutePage /> },
      { path: '/call-control/inbound-routes', element: <InboundRoutesPage /> },
      { path: '/call-control/outbound-routes', element: <OutboundRoutesPage /> },
      { path: '/pbx-status/active-calls', element: <ActiveCallsPage /> },
      { path: '/call-control/outbound-restrictions', element: <OutboundRestrictions/>},
      { path: '/call-features/ring-group', element: <RingGroup /> },
      { path: '/call-features/speed-dial', element: <SpeedDialPage /> },
      { path: '/call-features/disa', element: <DisaPage /> },
      { path: '/call-control/time-condition', element: <TimeCondition /> },
      {
        path: '/pcm/status',
        element: <PcmStatusPage />,
      },
      {
        path: '/pcm/settings',
        element: <PcmSettingsPage />,
      },
      {
        path: '/pcm/pstn',
        element: <PcmPstnPage />,
      },
      {
        path: '/pcm/circuit-maintenance',
        element: <PcmCircuitMaintenancePage />,
      },
      {
        path: '/pcm/pcm',
        element: <PcmPcmPage />,
      },
      {
        path: '/pcm/trunk',
        element: <PcmTrunkPage />,
      },
      {
        path: '/pcm/pcm-trunk-group',
        element: <PcmTrunkGroupPage />,
      },
      {
        path: '/pcm/num-receiving-rule',
        element: <PcmNumReceivingRulePage />,
      },
      {
        path: '/pcm/reception-timeout',
        element: <PcmReceptionTimeoutPage />,
      },
      {
        path: '/isdn/isdn',
        element: <IsdnIsdnPage />,
      },
      {
        path: '/user-manage/users',
        element: <UserManage/>,
      },
      {
        path: '/isdn/number-parameter',
        element: <IsdnNumberParameterPage />,
      },
      {
        path: '/number-filter/whitelist',
        element: <Whitelist />,
      },
      {
        path: '/number-filter/blacklist',
        element: <Blacklist />,
      },
      {
        path: '/number-filter/number-pool',
        element: <NumberPool />,
      },
      {
        path: '/number-filter/filtering-rule',
        element: <FilteringRule />,
      },
      {
        path: ROUTE_PATHS.IP_CALL_IN_CALLERID,
        element: <IPCallInCallerID />,
      },
      {
        path: ROUTE_PATHS.IP_CALL_IN_CALLEEID,
        element: <IPCallInCalleeID />,
      },
      {
        path: ROUTE_PATHS.IP_CALL_IN_ORICALLEEID,
        element: <IPCallInOriCalleeID />,
      },
      {
        path: ROUTE_PATHS.PSTN_CALL_IN_CALLERID,
        element: <PSTNCallInCallerID />,
      },
      {
        path: ROUTE_PATHS.PSTN_CALL_IN_CALLEEID,
        element: <PSTNCallInCalleeID />,
      },
      {
        path: ROUTE_PATHS.PSTN_CALL_IN_ORICALLEEID,
        element: <PSTNCallInOriCalleeID />,
      },
      {
        path: ROUTE_PATHS.CALLERID_POOL,
        element: <CallerIDPool />,
      },
      {
        path: ROUTE_PATHS.CALLERID_RESERVE_POOL,
        element: <CallerIDReservePool />,
      },
      {
        path: '/system-tools/network',
        element: <Network />,
      },
      {
        path: '/system-tools/authorization',
        element: <Authorization />,
      },
      {
        path: '/system-tools/management',
        element: <Management />,
      },
      {
        path: '/system-tools/ip-routing-table',
        element: <IPRoutingTable />,
      },
      {
        path: '/system-tools/access-control',
        element: <AccessControl />,
      },
      {
        path: '/system-tools/ids-settings',
        element: <IDSSettings />,
      },
      {
        path: '/system-tools/ddos-settings',
        element: <DDOSSettings />,
      },
      {
        path: '/system-tools/vpn',
        element: <SystemToolsVPN />,
      },
      {
        path: '/system-tools/certificate-manage',
        element: <CertificateManage />,
      },
      {
        path: '/system-tools/centralized-manage',
        element: <CentralizedManage />,
      },
      {
        path: '/system-tools/radius',
        element: <Radius />,
      },
      {
        path: '/system-tools/sip-account-generator',
        element: <SIPAccountGenerator />,
      },
      {
        path: '/system-tools/config-file',
        element: <ConfigFile />,
      },
      {
        path: '/system-tools/signaling-capture',
        element: <SignalingCapture />,
      },
      {
        path: '/system-tools/signaling-call-test',
        element: <SignalingCallTest />,
      },
      {
        path: '/system-tools/signaling-call-track',
        element: <SignalingCallTrack />,
      },
      {
        path: '/system-tools/ping-test',
        element: <PINGTest />,
      },
      {
        path: '/system-tools/tracert-test',
        element: <TRACERTTest />,
      },
      {
        path: '/system-tools/modification-record',
        element: <ModificationRecord />,
      },
      {
        path: '/system-tools/backup-upload',
        element: <BackupUpload />,
      },
      {
        path: '/system-tools/factory-reset',
        element: <FactoryReset />,
      },
      {
        path: '/system-tools/upgrade',
        element: <Upgrade />,
      },
      {
        path: '/system-tools/account-manage',
        element: <AccountManage />,
      },
      {
        path: '/system-tools/change-password',
        element: <ChangePassword />,
      },
      {
        path: '/system-tools/device-lock',
        element: <DeviceLock />,
      },
      {
        path: '/system-tools/restart',
        element: <Restart />,
      },
      {
        path: '/system-tools/licence',
        element: <LicenceRouteGate />,
      },
      {
        path: '/system-tools/asterisk-cli',
        element: <AsteriskCLI />,
      },
      {
        path: '/system-tools/linux-cli',
        element: <LinuxCLI />,
      },
      {
        path: '/system-tools/sql-upload',
        element: <SystemToolsSqlUpload />,
      },
      {
        path: '/system-tools/hosts',
        element: <Hosts />,
      },
      {
        path: '/voice-prompts/voice-prompts',
        element: <VoicePromptsPage />,
      },
      {
        path: '/pbx-status/pbx-monitor',
        element: <PbxMonitor />,
      },
      {
        path: '/pbx-status/active-call-queue',
        element: <ActiveCallQueue />,
      },

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

      // FXS → Route (sections/route pages — FXS-specific)
      { path: ROUTE_PATHS.FXS_ROUTE,            element: <FxsRouteRoutingParameterPage /> },
      { path: ROUTE_PATHS.FXS_ROUTE_IP_TO_PSTN, element: <FxsRouteIpToTelPage /> },
      { path: ROUTE_PATHS.FXS_ROUTE_PSTN_TO_IP, element: <FxsRouteTelToIpPage /> },

      // FXS → Num Manipulate (sections/numManipulate pages — FXS-specific)
      { path: ROUTE_PATHS.FXS_IP_CALL_IN_CALLERID,    element: <FxsIPCallInCallerID /> },
      { path: ROUTE_PATHS.FXS_IP_CALL_IN_CALLEEID,    element: <FxsIPCallInCalleeID /> },
      { path: ROUTE_PATHS.FXS_PSTN_CALL_IN_CALLERID,  element: <FxsPSTNCallInCallerID /> },
      { path: ROUTE_PATHS.FXS_PSTN_CALL_IN_CALLEEID,  element: <FxsPSTNCallInCalleeID /> },
    ],
  },
  // 404 route - should be last
  {
    path: "*",
    element: <NotFound />,
  },
]
);


export default router;