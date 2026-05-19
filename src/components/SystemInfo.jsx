import React, { useEffect, useState } from "react";
import { fetchSystemInfo, postLinuxCmd } from "../api/apiService";
import { Button, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  cardBg: '#ffffff',
  cardBorder: '#dde4ed',
  cardHeader: '#1e2d42',
  labelText: '#64748b',
  valueText: '#1e293b',
  mutedText: '#94a3b8',
  accent: '#29a8e0',
  successGreen: '#16a34a',
  warningAmber: '#d97706',
  pageBg: '#eef2f7',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const renderPktsValue = (val) => {
  const str = Array.isArray(val) ? val.join('  ') : String(val ?? '');
  const parts = str.split(/(\bErr:\s*\d+|\bDrop:\s*\d+)/g);
  return (
    <>
      {parts.map((part, i) => {
        const t = part.trim();
        if (/^Err:\s*0$/.test(t)) return <span key={i} style={{ color: C.successGreen, marginLeft: 2 }}>{part}</span>;
        if (/^Err:/.test(t))      return <span key={i} style={{ color: C.warningAmber, marginLeft: 2 }}>{part}</span>;
        if (/^Drop:\s*0$/.test(t)) return <span key={i} style={{ color: C.mutedText, marginLeft: 2 }}>{part}</span>;
        if (/^Drop:/.test(t))     return <span key={i} style={{ color: C.warningAmber, marginLeft: 2 }}>{part}</span>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

const renderCellValue = (key, val) => {
  if (val === null || val === undefined || val === '') return <span style={{ color: C.mutedText }}>—</span>;
  const lk = (key || '').toLowerCase();
  const isPkts = lk.includes('pkts') || lk.includes('packet');
  if (isPkts) return renderPktsValue(val);
  let str = Array.isArray(val) ? val.join(', ') : String(val);
  // For IP Address field, strip IPv6 addresses (entries containing ':')
  if (lk === 'ip address') {
    const parts = str.split(',').map(s => s.trim()).filter(s => !s.includes(':'));
    str = parts.length > 0 ? parts.join(', ') : str;
  }
  if ((lk.includes('dcms') || lk.includes('status')) && str) {
    const running = str.toLowerCase() === 'running';
    return (
      <span style={{ background: running ? '#dcfce7' : '#fee2e2', color: running ? C.successGreen : '#dc2626', padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
        {str}
      </span>
    );
  }
  return str;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const Card = ({ title, children, style }) => (
  <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 8, overflow: 'hidden', ...style }}>
    <div style={{ background: C.cardHeader, padding: '8px 14px', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
      {title}
    </div>
    {children}
  </div>
);

const InfoTableRow = ({ label, value, keyName, even }) => (
  <div style={{ display: 'flex', borderBottom: '0.5px solid #f1f5f9', padding: '5px 14px', minHeight: 28, alignItems: 'center', background: even ? '#f8fafc' : '#ffffff' }}>
    <span style={{ color: C.labelText, fontSize: 12, width: '42%', flexShrink: 0, fontWeight: 500 }}>{label}</span>
    <span style={{ color: C.valueText, fontSize: 12, flex: 1, fontWeight: 600 }}>{renderCellValue(keyName || label, value)}</span>
  </div>
);

const StatCard = ({ label, value, type, accentColor }) => {
  const accent = accentColor || C.accent;
  let content;
  if (type === 'status') {
    const running = String(value ?? '').toLowerCase() === 'running';
    content = value
      ? <div style={{ alignSelf: 'flex-start', display: 'inline-block' }}><span style={{ background: running ? '#dcfce7' : '#fee2e2', color: running ? C.successGreen : '#dc2626', padding: '3px 12px', borderRadius: 12, fontSize: 13, fontWeight: 700, display: 'inline-block' }}>{value}</span></div>
      : <span style={{ color: C.mutedText, fontSize: 18, fontWeight: 700 }}>—</span>;
  } else if (type === 'cpu') {
    const pct = parseFloat(value) || 0;
    content = <span style={{ fontSize: 20, fontWeight: 700, color: pct > 80 ? C.warningAmber : C.successGreen }}>{value || '0.00%'}</span>;
  } else {
    content = <span style={{ fontSize: 20, fontWeight: 700, color: C.valueText }}>{value || '0.00%'}</span>;
  }
  return (
    <div style={{ background: C.cardBg, border: '0.5px solid #dde6f0', borderLeft: `3px solid ${accent}`, borderRadius: 8, padding: '16px 18px', minHeight: 80, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.mutedText, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      {content}
    </div>
  );
};

const SystemInfo = () => {
  const [LAN_INTERFACES, setLAN_INTERFACES] = useState([]);
  const [SYSTEM_INFO, setSYSTEM_INFO] = useState([]);
  const [VERSION_INFO, setVERSION_INFO] = useState([]);
  const [error, setErros] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [licenseSerialNumber, setLicenseSerialNumber] = useState("");

  const setSystemInfo = async () => {
    try {
      setIsRefreshing(true);

      // Fetch system info and serial (via astlicense) in parallel
      const [systemData, versionInfoData, astLicData] =
        await Promise.allSettled([
          fetchSystemInfo(),
          postLinuxCmd({
            cmd: "cat /home/clixxo/server/config/web_version.json",
          }),
          postLinuxCmd({ cmd: "astlicense" }),
        ]);

      // Handle system info
      if (systemData.status === "fulfilled" && systemData.value.success) {
        const data = systemData.value;
        console.log(data);

        // Extract interfaces robustly from multiple possible response shapes
        const details = data.details || {};
        let rawInterfaces = [];

        if (Array.isArray(details.LAN_INTERFACES)) {
          rawInterfaces = details.LAN_INTERFACES;
        } else if (
          details.LAN_INTERFACES &&
          typeof details.LAN_INTERFACES === "object"
        ) {
          rawInterfaces = Object.entries(details.LAN_INTERFACES).map(
            ([name, data]) => ({ name, data }),
          );
        } else if (Array.isArray(details.interfaces)) {
          rawInterfaces = details.interfaces;
        } else if (
          details.network &&
          Array.isArray(details.network.interfaces)
        ) {
          rawInterfaces = details.network.interfaces;
        }

        // Filter out loopback and VPN virtual interfaces (tap*/tun*/vpn*) and normalize names
        const filteredInterfaces = (rawInterfaces || [])
          .filter((iface) => {
            const name = iface && iface.name ? String(iface.name) : "";
            const lower = name.toLowerCase();
            if (lower === "lo") return false;
            if (lower.startsWith("tap")) return false; // e.g., tap0
            if (lower.startsWith("tun")) return false; // e.g., tun0
            if (lower.includes("vpn")) return false; // e.g., openvpn
            return true;
          })
          .map((iface) => {
            if (iface.name === "eth0") {
              return { ...iface, name: "LAN 1" };
            } else if (iface.name === "eth1") {
              return { ...iface, name: "LAN 2" };
            }
            return iface;
          })
          // Ensure predictable ordering: LAN 1, LAN 2, then others
          .sort((a, b) => {
            const order = { "LAN 1": 1, "LAN 2": 2 };
            const aOrder = order[a.name] || 99;
            const bOrder = order[b.name] || 99;
            return aOrder - bOrder;
          });

        setLAN_INTERFACES(filteredInterfaces);
        setSYSTEM_INFO(data.details.SYSTEM_INFO);

        // Handle VERSION_INFO with serial number derived from astlicense
        let versionInfo = data.details.VERSION_INFO || [];

        const updateVersionEntry = (label, value) => {
          const displayValue = value && value !== "" ? value : "Unavailable";
          const idx = (versionInfo || []).findIndex(
            (item) => item.label === label,
          );
          if (idx >= 0) {
            versionInfo[idx] = { ...versionInfo[idx], value: displayValue };
          } else {
            versionInfo = [
              ...(versionInfo || []),
              { label, value: displayValue },
            ];
          }
        };

        let parsedSerial = "";
        if (
          versionInfoData.status === "fulfilled" &&
          versionInfoData.value?.response
        ) {
          try {
            const parsedJson = JSON.parse(
              versionInfoData.value.responseData || "{}",
            );
            if (parsedJson) {
              parsedSerial = parsedJson.serial_no || "";
              updateVersionEntry("WEB", parsedJson.web_version);
              updateVersionEntry("Service", parsedJson.service);
              updateVersionEntry("Uboot", parsedJson.uboot);
              updateVersionEntry("Kernel", parsedJson.kernel);
              updateVersionEntry("Firmware", parsedJson.firmware);
            }
          } catch (jsonError) {
            console.error("Failed to parse version info JSON:", jsonError);
          }
        }

        if (
          !parsedSerial &&
          astLicData.status === "fulfilled" &&
          astLicData.value?.response
        ) {
          const out = String(astLicData.value.responseData || "");
          const lines = out.split(/\r?\n/);
          const astLicLine =
            lines.find((l) => l.trim().toLowerCase().startsWith("astlic:")) ||
            "";
          if (astLicLine) {
            const afterColon = astLicLine.split(":").slice(1).join(":");
            const fields = afterColon.split(",").map((s) => s.trim());
            if (fields.length >= 2 && fields[1]) {
              parsedSerial = fields[1];
            }
          }
        }

        const finalSerial = parsedSerial || "Unavailable";
        setLicenseSerialNumber(
          finalSerial === "Unavailable" ? "" : finalSerial,
        );
        updateVersionEntry("Serial Number", finalSerial);

        setVERSION_INFO(versionInfo);
        setErros("");
      } else {
        setErros(
          systemData.status === "rejected"
            ? "Failed to load system information"
            : systemData.value?.error || "Unknown error",
        );
        setLAN_INTERFACES([]);
        setSYSTEM_INFO([]);
        setVERSION_INFO([]);
      }
    } catch (error) {
      // Handle different types of errors with user-friendly messages
      let errorMessage = "Failed to load system information. Please try again.";

      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        errorMessage =
          "Request timeout. Please check your connection and try again.";
      } else if (error.response?.status === 404) {
        errorMessage =
          "System information not found. Please contact administrator.";
      } else if (error.response?.status >= 500) {
        errorMessage =
          "Server error. Please try again later or contact support.";
      } else if (
        error.message?.includes("Network Error") ||
        error.message?.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network connection failed. Please check your internet connection.";
      } else if (error.message?.includes("timeout of 10000ms exceeded")) {
        errorMessage =
          "Request timeout. The server is taking too long to respond. Please try again.";
      }

      setErros(errorMessage);
      setLAN_INTERFACES([]);
      setSYSTEM_INFO([]);
      setVERSION_INFO([]);
      setLicenseSerialNumber("");
    } finally {
      setIsRefreshing(false);
    }
  };
  useEffect(() => {
    setSystemInfo();
    // setInterval(()=>{
    //   setSystemInfo();
    // },5000)
  }, []);
  // Extract top-level stats from SYSTEM_INFO
  const getMetric = (keywords) => {
    const item = (SYSTEM_INFO || []).find(i =>
      keywords.some(k => (i.label || '').toLowerCase().includes(k.toLowerCase()))
    );
    return item?.value ?? null;
  };

  const runtime    = getMetric(['runtime', 'uptime']);
  const cpuUsage   = getMetric(['cpu']);
  const dcmsStatus = getMetric(['dcms']);
  const packetLoss = getMetric(['packet loss', 'packet_loss', 'rx loss']);

  const refreshBtnSx = {
    background: '#ffffff',
    color: C.accent,
    fontWeight: 600,
    fontSize: 13,
    border: `1px solid ${C.accent}`,
    borderRadius: 24,
    textTransform: 'none',
    px: 3, py: 1,
    boxShadow: '0 1px 4px rgba(41,168,224,0.12)',
    '&:hover': { background: '#f0f7fd', borderColor: C.accent, color: C.accent },
  };

  return (
    <div style={{ backgroundColor: C.pageBg, minHeight: 'calc(100vh - 80px)', padding: '16px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>

        {error && (
          <div style={{ background: '#fef2f2', borderLeft: `3px solid #f87171`, color: '#b91c1c', padding: '8px 14px', borderRadius: 6, marginBottom: 14, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>
          Status &rsaquo; System Status &rsaquo; <span style={{ color: '#1e293b', fontWeight: 600 }}>System Info</span>
        </div>

        {/* Top stat cards — equal height, accent borders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14, alignItems: 'stretch' }}>
          <StatCard label="RUNTIME"         value={runtime}    type="default" accentColor={C.accent} />
          <StatCard label="CPU USAGE"        value={cpuUsage}   type="cpu"     accentColor={C.successGreen} />
          <StatCard label="DCMS STATUS"      value={dcmsStatus} type="status"  accentColor={C.successGreen} />
          <StatCard label="PACKET LOSS (RX)" value={packetLoss} type="default" accentColor="#94a3b8" />
        </div>

        {/* LAN cards — 2 columns, alternating rows */}
        {LAN_INTERFACES.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14, alignItems: 'stretch' }}>
            {LAN_INTERFACES.map((lan) => (
              <Card key={lan.name} title={lan.name} style={{ height: '100%' }}>
                {Object.entries(lan.data || {}).map(([key, val], idx) => (
                  <InfoTableRow key={key} label={key} value={val} keyName={key} even={idx % 2 === 1} />
                ))}
              </Card>
            ))}
          </div>
        )}

        {/* System Details + Version Info — stretch so both cards same height, filler fills white space */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16, alignItems: 'stretch' }}>
          <Card title="System Details" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {(SYSTEM_INFO || []).map((info, idx) => (
              <InfoTableRow key={idx} label={info.label} value={info.value} keyName={info.label} even={idx % 2 === 1} />
            ))}
            <div style={{ flex: 1, background: '#f8fafc', borderTop: '0.5px solid #f1f5f9', minHeight: 8 }} />
          </Card>
          <Card title="Version Info" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {(VERSION_INFO || []).map((v, idx) => (
              <InfoTableRow key={idx} label={v.label} value={v.value} keyName={v.label} even={idx % 2 === 1} />
            ))}
            <div style={{ flex: 1, background: '#f8fafc', borderTop: '0.5px solid #f1f5f9', minHeight: 8 }} />
          </Card>
        </div>

        {/* Refresh button — tight below cards, no floating space */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 16 }}>
          <Button
            variant="outlined"
            startIcon={isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={setSystemInfo}
            disabled={isRefreshing}
            sx={refreshBtnSx}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default SystemInfo;


