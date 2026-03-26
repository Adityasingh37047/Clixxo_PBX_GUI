// router.jsx
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import { ROUTE_PATHS } from './constants/routeConstatns';
import SystemInfo from './components/SystemInfo';
import PstnStatus from './components/PstnStatus';
import PcmInfo from './components/PcmInfo';
import CallCount from './components/CallCount';
import WarningInfo from './components/WarningInfo';
import SipPage from './components/SipPage';
import PcmPage from './components/PcmPage';
import IsdnPage from './components/IsdnPage';
import FaxPage from './components/FaxPage';
import FaxFaxPage from './components/FaxFaxPage';
import RoutePage from './components/RoutePage';
import NumberFilterPage from './components/NumberFilterPage';
import NumManipulatePage from './components/NumManipulatePage';
import VpnPage from './components/VpnPage';
import DhcpPage from './components/DhcpPage';
import SystemToolsPage from './components/SystemToolsPage';
import LoginPage from './components/LoginPage';
import SipSipPage from './components/SipSipPage';
import HaPage from './components/HaPage';
import SipTrunkPage from './components/SipTrunkPage';
import SipRegisterPage from './components/SipRegisterPage';
import SipAccountPage from './components/SipAccountPage';
import SipTrunkGroup from './components/SipTrunkGroup';
import SipToSipAccountPage from './components/SipToSipAccountPage';
import SipMediaPage from './components/SipMediaPage';
import ExtensionGroupsPage from './components/ExtensionGroupsPage';
import BlockedListPage from './components/BlockedListPage';
import CallBackPage from './components/CallBackPage';
import OriginateCallPage from './components/OriginateCallPage';
import ActiveCallsPage from './components/ActiveCallsPage';
import CCRoutePage from './components/CCRoutePage';
import InboundRoutesPage from './components/InboundRoutesPage';
import IVRPage from './components/IVRPage';
import ProtectedRoute from './components/ProtectedRoute';
import PcmStatusPage from './components/PcmStatusPage';
import PcmSettingsPage from './components/PcmSettingsPage';
import PcmPstnPage from './components/PcmPstnPage';
import PcmCircuitMaintenancePage from './components/PcmCircuitMaintenancePage';
import PcmPcmPage from './components/PcmPcmPage';
import PcmTrunkPage from './components/PcmTrunkPage';
import PcmTrunkGroupPage from './components/PcmTrunkGroupPage';
import PcmNumReceivingRulePage from './components/PcmNumReceivingRulePage';
import PcmReceptionTimeoutPage from './components/PcmReceptionTimeoutPage';
import IsdnIsdnPage from './components/IsdnIsdnPage';
import IsdnNumberParameterPage from './components/IsdnNumberParameterPage';
import RouteRoutingParameterPage from './components/RouteRoutingParameterPage';
import RouteIpPstnPage from './components/RouteIpPstnPage';
import RouteIPToIPPage from './components/RouteIPToIPPage';
import RoutePstnToIPPage from './components/RoutePstnToIPpage';
import Whitelist from './components/Whitelist';
import Blacklist from './components/Blacklist';
import NumberPool from './components/NumberPool';
import FilteringRule from './components/FilteringRule';
import IPCallInCallerID from './components/IPCallInCallerID';
import IPCallInCalleeID from './components/IPCallInCalleeID';
import IPCallInOriCalleeID from './components/IPCallInOriCalleeID';
import PSTNCallInCallerID from './components/PSTNCallInCallerID';
import PSTNCallInCalleeID from './components/PSTNCallInCalleeID';
import PSTNCallInOriCalleeID from './components/PSTNCallInOriCalleeID';
import CallerIDPool from './components/CallerIDPool';
import CallerIDReservePool from './components/CallerIDReservePool';
import VpnServerSettings from './components/VpnServerSettings';
import VpnAccount from './components/VpnAccount';
import DhcpServerSettings from './components/DhcpServerSettings';
import Network from './components/Network';
import Authorization from './components/Authorization';
import Management from './components/Management';
import IPRoutingTable from './components/IPRoutingTable';
import AccessControl from './components/AccessControl';
import IDSSettings from './components/IDSSettings';
import DDOSSettings from './components/DDOSSettings';
import SystemToolsVPN from './components/SystemToolsVPN';
import CertificateManage from './components/CertificateManage';
import CentralizedManage from './components/CentralizedManage';
import Radius from './components/Radius';
import SIPAccountGenerator from './components/SIPAccountGenerator';
import ConfigFile from './components/ConfigFile';
import SignalingCapture from './components/SignalingCapture';
import SignalingCallTest from './components/SignalingCallTest';
import SignalingCallTrack from './components/SignalingCallTrack';
import PINGTest from './components/PINGTest';
import TRACERTTest from './components/TRACERTTest';
import AsteriskCLI from './components/AsteriskCLI';
import LinuxCLI from './components/LinuxCLI';
import ModificationRecord from './components/ModificationRecord';
import BackupUpload from './components/BackupUpload';
import FactoryReset from './components/FactoryReset';
import Upgrade from './components/Upgrade';
import AccountManage from './components/AccountManage';
import ChangePassword from './components/ChangePassword';
import DeviceLock from './components/DeviceLock';
import Restart from './components/Restart';
import Licence from './components/Licence';
import SystemToolsSqlUpload from './components/SystemToolsSqlUpload';
import Hosts from './components/Hosts';
import ConferencePage from './components/ConferencePage';
import PickupGroup from './components/PickupGroup';
import RingGroup from './components/RingGroup';
import PrivateGroup from './components/PrivateGroup';
import Paging from './components/Paging';
import OutboundRoutesPage from './components/OutboundRoutesPage';
import SpeedDialPage from './components/SpeedDialPage';
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
        path: '/route',
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
      { path: '/sip', element: <SipSipPage /> },
      { path: '/sip/ha', element: <HaPage /> },
      { path: '/sip/trunk', element: <SipTrunkPage /> },
      { path: '/sip/register', element: <SipRegisterPage /> },
      { path: '/sip/account', element: <SipAccountPage /> },
      { path: '/sip/sip-to-sip-account', element: <SipToSipAccountPage /> },
      { path: '/sip/trunk-group', element: <SipTrunkGroup /> },
      { path: '/sip/extension-groups', element: <ExtensionGroupsPage /> },
      { path: '/sip/media', element: <SipMediaPage /> },
      { path: '/call-features/blocked-list', element: <BlockedListPage /> },
      { path: '/call-features/callback', element: <CallBackPage /> },
      { path: '/call-features/originate-call', element: <OriginateCallPage /> },
      { path: '/call-features/ivr', element: <IVRPage /> },
      { path: ROUTE_PATHS.CONFERENCE, element: <ConferencePage /> },
      { path: '/call-features/pickup-group', element: <PickupGroup /> },
      { path: '/call-features/private-group', element: <PrivateGroup /> },
      { path: '/call-features/paging', element: <Paging /> },
      { path: '/call-control/cc-route', element: <CCRoutePage /> },
      { path: '/call-control/inbound-routes', element: <InboundRoutesPage /> },
      { path: '/call-control/outbound-routes', element: <OutboundRoutesPage /> },
      { path: '/pbx-status/active-calls', element: <ActiveCallsPage /> },
      { path: '/call-features/ring-group', element: <RingGroup /> },
      { path: '/call-features/speed-dial', element: <SpeedDialPage /> },
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
        path: '/pcm/trunk-group',
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
        element: <Licence />,
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