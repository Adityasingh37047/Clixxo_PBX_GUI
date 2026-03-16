import React, { useState, useEffect, useRef } from 'react';
import Tooltip from '@mui/material/Tooltip';
import CallEndIcon from '@mui/icons-material/CallEnd';
import RingVolumeIcon from '@mui/icons-material/RingVolume';
import SettingsPhoneIcon from '@mui/icons-material/SettingsPhone';
import PhoneForwardedIcon from '@mui/icons-material/PhoneForwarded';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PhonePausedIcon from '@mui/icons-material/PhonePaused';
import PermPhoneMsgIcon from '@mui/icons-material/PermPhoneMsg';
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled';
import SystemSecurityUpdateWarningIcon from '@mui/icons-material/SystemSecurityUpdateWarning';
import AppSettingsAltIcon from '@mui/icons-material/AppSettingsAlt';
import PhoneLockedIcon from '@mui/icons-material/PhoneLocked';
import {
  PSTN_SYNC_HEADERS,
  PSTN_SYNC_COLORS,
  PSTN_VOICE_PATH_HEADERS,
  PSTN_VOICE_PATH_STATS,
  PSTN_TIMESLOT_HEADERS,
  PSTN_TIMESLOT_DATA,
  PSTN_GATEWAY_LABEL,
  PSTN_GATEWAY_IP
} from '../constants/PstnConstants';
import { listPstn, listChannelState } from '../api/apiService';

// Material-UI icons for status
const ICONS = [
  <div className="w-6 h-6 bg-green-500 flex items-center justify-center cursor-pointer">
    <CallEndIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Idle (green phone)
  <div className="w-6 h-6 flex items-center justify-center cursor-pointer" style={{ backgroundColor: '#D4AF37' }}>
    <RingVolumeIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Ringing (golden-brown bell)
  <div className="w-6 h-6 bg-blue-500 flex items-center justify-center cursor-pointer">
    <SettingsPhoneIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Wait Answer (blue settings phone)
  <div className="w-6 h-6 bg-blue-500 flex items-center justify-center cursor-pointer">
    <PhoneForwardedIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Dialing (blue phone forwarded)
  <div className="w-6 h-6 flex items-center justify-center cursor-pointer" style={{ backgroundColor: '#20B2AA' }}>
    <PhoneInTalkIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Talking (teal phone in talk)
  <div className="w-6 h-6 bg-red-500 flex items-center justify-center cursor-pointer">
    <PhonePausedIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Pending (red phone paused)
  <div className="w-6 h-6 bg-blue-500 flex items-center justify-center cursor-pointer">
    <PermPhoneMsgIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Wait Message (blue phone message)
  <div className="w-6 h-6 flex items-center justify-center cursor-pointer" style={{ backgroundColor: '#8A2BE2' }}>
    <PhoneDisabledIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Local Block (purple phone disabled)
  <div className="w-6 h-6 flex items-center justify-center cursor-pointer" style={{ backgroundColor: '#FF8C00' }}>
    <PhoneDisabledIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Remote Block (orange phone disabled)
  <div className="w-6 h-6 flex items-center justify-center cursor-pointer" style={{ backgroundColor: '#808080' }}>
    <SystemSecurityUpdateWarningIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Both Block (darker gray warning icon)
  <div className="w-6 h-6 flex items-center justify-center cursor-pointer" style={{ backgroundColor: '#808080' }}>
      <AppSettingsAltIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Circuit Reset (darker gray settings icon)
  <div className="w-6 h-6 flex items-center justify-center cursor-pointer" style={{ backgroundColor: '#808080' }}>
    <PhoneLockedIcon style={{ color: 'white', fontSize: '15px' }} />
  </div>, // Unusable (darker gray phone locked)
];

const colorBlock = (color) => (
  <div className="w-6 h-6 mx-auto border border-gray-500" style={{ background: color, borderRadius: 0 }} />
);

const TOTAL_PAGES = 5;
const getStatisticsForPage = (page) => {
  return Array(12).fill(0).map((_, i) => (i + page) % 7 === 0 ? 30 : (page - 1) * 2 + i);
};

const PstnStatus = () => {    
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [spansData, setSpansData] = useState([]); // Array of configured spans
  const [spanStatuses, setSpanStatuses] = useState({}); // Status for each span
  const [channels, setChannels] = useState([]); // All channels from API
  const pollingRef = useRef(null);
  const aliveRef = useRef(true);

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1);
      setPageInput(String(page - 1));
    }
  };
  const handleNext = () => {
    if (page < TOTAL_PAGES) {
      setPage(page + 1);
      setPageInput(String(page + 1));
    }
  };
  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPageInput(val);
  };
  const handleInputBlur = () => {
    let num = parseInt(pageInput, 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > TOTAL_PAGES) num = TOTAL_PAGES;
    setPage(num);
    setPageInput(String(num));
  };
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const statistics = getStatisticsForPage(page);

  // Map API channel state -> icon index
  const stateToIconIndex = (state) => {
    const s = (state || '').toLowerCase();
    // Ringing states (incoming and outgoing)
    if (s === 'ringing' || s === 'ring' || s === 'alerting') return 1;
    // Wait Answer / Pre-answer states
    if (s === 'wait' || s === 'wait answer' || s === 'waiting') return 2;
    // Dialing states (outgoing calls)
    if (s === 'dialing' || s === 'dial' || s === 'calling' || s.includes('dial')) return 3;
    // Talking / Connected states
    if (s === 'talking' || s === 'up' || s === 'answered' || s === 'connected') return 4;
    // Pending / Progress states
    if (s === 'pending' || s === 'progress' || s === 'proceeding') return 5;
    // Wait Message
    if (s === 'wait message' || s.includes('message')) return 6;
    // Down/Busy states
    if (s === 'down' || s === 'busy') return 0;
    // Default to Idle for unknown states
    return 0;
  };

  // Compute PCM values for each span based on span status and channel states
  const getPcmValuesForSpan = React.useCallback((spanData) => {
    const isSpanUp = spanStatuses[spanData.spanId] === 'up';
    const spanChannels = channels.filter(c => {
      const channelId = Number(c.channelid);
      return spanData.channelRanges.includes(channelId);
    });

    // Create values array based on actual channel ranges
    const vals = spanData.channelRanges.map(channelId => {
      if (channelId === 0) return 'frame';       // Channel 0: Frame Sync (black)
      if (channelId === spanData.hdlcChannel) return 'signaling';  // HDLC channel (blue)
      if (!isSpanUp) return 'red';
      
      const ch = spanChannels.find(c => Number(c.channelid) === channelId) || null;
      const idx = stateToIconIndex(ch?.state);
      return idx; // 0..N icon index when span is up, default idle (0) if empty state
    });
    return { values: vals, channelRanges: spanData.channelRanges };
  }, [channels, spanStatuses]);

  // Get current IP from browser URL
  const getCurrentIP = () => {
    try {
      // Get IP from current browser URL
      const currentHost = window.location.hostname;
      return currentHost;
    } catch (error) {
      console.warn('Could not get IP from URL, using fallback:', error);
      return '192.168.0.153'; // Fallback IP
    }
  };

  // Get configured spans from PSTN data
  const fetchSpansData = async () => {
    try {
      const res = await listPstn();
      let raw = [];
      if (Array.isArray(res)) raw = res;
      else if (Array.isArray(res?.message)) raw = res.message;
      else if (Array.isArray(res?.data)) raw = res.data;
      else if (Array.isArray(res?.output)) raw = res.output;
      
      const currentIP = getCurrentIP();
      
      const spans = raw
        .map((it) => {
          const spanId = it?.span_id ?? it?.span?.id ?? it?.id;
          const status = it?.span_status || 'down';
          // Parse status to get the main status (Up/Down) ignoring "Active" part
          const mainStatus = status.toLowerCase().includes('up') ? 'up' : 'down';
          const bchan = it?.span?.bchan || it?.channels?.channel || '';
          const hardhdlc = it?.span?.hardhdlc || '';
          
          // Parse channel ranges from bchan (e.g., "32-46,48-62")
          let channelRanges = [];
          let hdlcChannel = null;
          
          // Always add channel 0 (frame sync) for each span
          channelRanges.push(0);
          
          if (bchan) {
            // Parse channel ranges like "32-46,48-62"
            const ranges = bchan.split(',');
            ranges.forEach(range => {
              if (range.includes('-')) {
                const [start, end] = range.split('-').map(n => parseInt(n.trim()));
                if (!isNaN(start) && !isNaN(end)) {
                  for (let i = start; i <= end; i++) {
                    channelRanges.push(i);
                  }
                }
              } else {
                const singleChannel = parseInt(range.trim());
                if (!isNaN(singleChannel)) {
                  channelRanges.push(singleChannel);
                }
              }
            });
          } else {
            // Default to standard 0-31 for span 1, 32-63 for span 2, etc.
            const startChannel = (parseInt(spanId) - 1) * 32;
            for (let i = startChannel; i < startChannel + 32; i++) {
              channelRanges.push(i);
            }
          }
          
          // Always add HDLC channel for each span
          if (hardhdlc) {
            const hdlcChannelNum = parseInt(hardhdlc);
            if (!channelRanges.includes(hdlcChannelNum)) {
              channelRanges.push(hdlcChannelNum);
            }
          } else {
            // Default HDLC channels: 16 for span 1, 47 for span 2, etc.
            const defaultHdlc = parseInt(spanId) === 1 ? 16 : 47;
            if (!channelRanges.includes(defaultHdlc)) {
              channelRanges.push(defaultHdlc);
            }
          }
          
          // Parse HDLC channel
          if (hardhdlc) {
            hdlcChannel = parseInt(hardhdlc);
          } else {
            // Default HDLC channels: 16 for span 1, 48 for span 2, etc.
            hdlcChannel = (parseInt(spanId) - 1) * 32 + 16;
          }
          
          return spanId != null ? { 
            spanId: parseInt(spanId), 
            status: mainStatus,
            name: `PCM${spanId - 1}`, // PCM0, PCM1, etc.
            ip: currentIP,
            channelRanges: channelRanges.sort((a, b) => a - b),
            hdlcChannel: hdlcChannel
          } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.spanId - b.spanId); // Sort by span ID
      
      setSpansData(spans);
      
      // Update span statuses
      const statusMap = {};
      spans.forEach(span => {
        statusMap[span.spanId] = span.status;
      });
      setSpanStatuses(statusMap);
      
      // Return the spans and statuses so they can be used immediately
      return { spans, statusMap };
      
    } catch (error) {
      console.error('Error fetching spans data:', error);
      return { spans: [], statusMap: {} };
    }
  };

  // Load span status and channel states with controlled sequencing
  useEffect(() => {
    let timeoutId = null;
    let abortController = null;
    aliveRef.current = true;

    const fetchStatusSequential = async () => {
      try {
        // 1) Fetch spans data first and get the returned data
        const { spans, statusMap } = await fetchSpansData();

        // 2) Check if any span is up using the freshly fetched data
        const hasActiveSpan = spans.some(span => statusMap[span.spanId] === 'up');
        
        if (hasActiveSpan) {
          // Only call channelstate API if at least one span is up
          try {
            // Add timeout to prevent hanging (reduced to 800ms for faster updates)
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('ChannelState API timeout')), 800)
            );
            
            const cs = await Promise.race([
              listChannelState(),
              timeoutPromise
            ]);
            
            const arr = Array.isArray(cs?.message) ? cs.message : [];
            const normalized = arr.map(item => {
              const channelState = String(item?.state || '');
              // Debug: Log non-idle states to console to see what Asterisk reports
              if (channelState && channelState.toLowerCase() !== 'idle' && channelState.toLowerCase() !== '') {
                console.log('Channel State:', item?.channelid, '=', channelState, 'App:', item?.application);
              }
              return {
                channelid: String(item?.channelid || ''),
                channel: String(item?.channel || ''),
                state: channelState,
                application: String(item?.application || ''),
                appdata: String(item?.appdata || ''),
                destination: String(item?.destination || ''),
                dahdi_status: item?.dahdi_status || {},
              };
            });
            setChannels(normalized);
          } catch (channelError) {
            console.warn('ChannelState API error or timeout:', channelError);
            setChannels([]); // Clear channels on error
          }
        } else {
          // If no spans are up, clear channels and skip channelstate API
          setChannels([]);
        }

        // 3) Schedule next run after 1s (1000ms) for faster state updates
        if (aliveRef.current) timeoutId = setTimeout(fetchStatusSequential, 1000);
      } catch (e) {
        console.warn('PSTN fetch error:', e);
        if (aliveRef.current) timeoutId = setTimeout(fetchStatusSequential, 1000);
      }
    };

    fetchStatusSequential();

    return () => {
      aliveRef.current = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (abortController) abortController.abort();
    };
  }, []);

  // Dynamic statistics based on computed PCM state
  // Calculate statistics across all spans
  const allPcmValues = React.useMemo(() => {
    return spansData.flatMap(span => getPcmValuesForSpan(span).values);
  }, [spansData, getPcmValuesForSpan]);

  const idleCount = React.useMemo(() => allPcmValues.filter(v => v === 0).length, [allPcmValues]);
  const ringingCount = React.useMemo(() => allPcmValues.filter(v => v === 1).length, [allPcmValues]);
  const waitAnswerCount = React.useMemo(() => allPcmValues.filter(v => v === 2).length, [allPcmValues]);
  const dialingCount = React.useMemo(() => allPcmValues.filter(v => v === 3).length, [allPcmValues]);
  const talkingCount = React.useMemo(() => allPcmValues.filter(v => v === 4).length, [allPcmValues]);
  const pendingCount = React.useMemo(() => allPcmValues.filter(v => v === 5).length, [allPcmValues]);
  const waitMsgCount = React.useMemo(() => allPcmValues.filter(v => v === 6).length, [allPcmValues]);
  const unusableCount = React.useMemo(() => allPcmValues.filter(v => v === 'unusable').length, [allPcmValues]);
  const statsValues = React.useMemo(() => [
    idleCount, // Idle
    ringingCount, // Ringing
    waitAnswerCount, // Wait Answer
    dialingCount, // Dialing
    talkingCount, // Talking
    pendingCount, // Pending
    waitMsgCount, // Wait Message
    0,         // Local Block
    0,         // Remote Block
    0,         // Both Block
    0,         // Circuit Reset
    unusableCount // Unusable
  ], [idleCount, ringingCount, waitAnswerCount, dialingCount, talkingCount, pendingCount, waitMsgCount, unusableCount]);

  // Use the actual browser host:port for gateway display, fallback to constant
  const browserHost = (typeof window !== 'undefined' && window.location && window.location.host)
    ? window.location.host
    : PSTN_GATEWAY_IP;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)] p-2 sm:p-4 md:p-0.5 flex flex-col items-center">
      <div className="w-full max-w-full">
        {/* Sync & Signaling Status Table */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center font-medium text-xs sm:text-sm md:text-base lg:text-lg shadow mb-0 pl-4" />
        <div className="overflow-x-auto w-full">
          <table className="w-full bg-white border-collapse mb-10 shadow-sm text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="border border-gray-400 bg-[#f8fafd] font-medium py-1 px-0.5">{PSTN_SYNC_HEADERS[0]}</th>
                {PSTN_SYNC_HEADERS.slice(1).map((h, i) => (
                  <th key={i} className="border border-gray-400 bg-[#f8fafd] text-gray-700 font-medium py-1 px-0.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 bg-[#f8fafd] font-medium py-1 px-0.5 text-center">Color</td>
                {PSTN_SYNC_COLORS.map((c, i) => (
                  <td key={i} className="border border-gray-400 text-center py-1 px-2">{colorBlock(c.color)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Voice Path Status Table */}
        <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center font-medium px-1 py-0.5 text-xs sm:text-sm md:text-base lg:text-lg shadow mb-0 pl-4" />
        <div className="overflow-x-auto w-full">
          <table className="w-full bg-white border-collapse shadow-sm text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="border border-gray-400 bg-[#f8fafd]  font-medium py-1 px-0.5">{PSTN_VOICE_PATH_HEADERS[0]}</th>
                {PSTN_VOICE_PATH_HEADERS.slice(1).map((h, i) => (
                    <th key={i} className="border border-gray-400 bg-[#f8fafd] text-gray-700 font-medium py-1 px-0.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 bg-[#f8fafd] font-medium py-1 px-0.5 text-center">Icon</td>
                {ICONS.map((icon, i) => (
                  <td key={i} className="border border-gray-400 py-1 px-0.5">
                    <div className="flex items-center justify-center w-full h-full">
                      {typeof icon === 'string' ? (
                        <span className="text-lg">{icon}</span>
                      ) : (
                        icon
                      )}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-400 bg-[#f8fafd] font-medium py-1 px-0.5 text-center">Statistics</td>
                {statsValues.map((v, i) => (
                  <td key={i} className="border border-gray-400 text-center py-1 px-0.5">{v}</td>
                ))}
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={ICONS.length + 1} style={{ padding: 0, border: 'none', background: '#dde0e4' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 14, color: '#444', padding: '2px 8px 2px 0', marginBottom: '15px' }}>
                    <span style={{ marginRight: 4 }}>1/1 Previous Next Go to Page</span>
                    <select style={{ fontSize: 13, padding: '1px 4px', borderRadius: 2, border: '1px solid #bbb', background: '#fff', marginRight: 4 }} value={1} readOnly>
                      <option value={1}>1</option>
                    </select>
                    <span>Page</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Dynamic Gateway Tables */}
        {spansData.length === 0 ? (
          <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center text-gray-700 font-medium text-xs sm:text-sm md:text-base lg:text-lg shadow mb-0">
            <span>No PSTN Spans Configured</span>
          </div>
        ) : (
          spansData.map((span, spanIndex) => {
            const pcmData = getPcmValuesForSpan(span);
            const pcmValues = pcmData.values;
            const channelRanges = pcmData.channelRanges;
            
            return (
              <div key={span.spanId} className={spanIndex > 0 ? "mt-8" : ""}>
                {/* Gateway Header */}
                <div className="w-full h-8 bg-gradient-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center text-gray-700 font-medium text-xs sm:text-sm md:text-base lg:text-lg shadow mb-0">
                  <span>
                    {span.name} &nbsp;·&nbsp; {span.ip}
                  </span>
                </div>
                
                {/* Time Slot Table */}
                <div className="overflow-x-auto w-full">
                  <table className="w-full bg-white border-collapse shadow-sm text-xs sm:text-sm md:text-base lg:text-lg">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 bg-white font-medium py-2 px-0.5 whitespace-nowrap text-xs w-24">Time Slot No.</th>
                        {channelRanges.map((channelId, i) => (
                          <th key={i} className="border border-gray-400 bg-white text-gray-700 font-medium py-1 px-0.5 whitespace-nowrap text-xs w-10">{channelId}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 bg-white font-medium py-1 px-0.5 whitespace-nowrap text-xs w-24 text-center align-middle">{span.name}</td>
                        {pcmValues.map((v, i) => {
                          const channelId = channelRanges[i];
                          const ch = channels.find(c => Number(c.channelid) === channelId) || {};
                          
                          // Extract caller from channel field (e.g., "DAHDI/i1/1202210116-1" -> "1202210116")
                          let caller = '';
                          if (ch.channel) {
                            const channelMatch = ch.channel.match(/DAHDI\/[^/]+\/(\d+)/);
                            if (channelMatch) {
                              caller = channelMatch[1];
                            }
                          }
                          
                          // Extract called from appdata field (e.g., "Dial(PJSIP/07309377930@..." -> "07309377930")
                          let called = '';
                          if (ch.appdata) {
                            const appdataMatch = ch.appdata.match(/Dial\([^/]+\/(\d+)@/);
                            if (appdataMatch) {
                              called = appdataMatch[1];
                            }
                          }
                          
                          const info = {
                            channel: ch.channel || `DAHDI/${channelId}`,
                            state: ch.state || (v === 'unusable' ? 'Unusable' : v === 'red' ? 'Reserved' : 'Idle'),
                            application: ch.application || '',
                            appdata: ch.appdata || '',
                            destination: ch.destination || '',
                            extension: ch.extension || '',
                            inService: ch?.dahdi_status?.in_service || (v === 'unusable' ? 'No' : 'Yes'),
                            caller: caller,
                            called: called
                          };
                          const tooltipContent = (
                            <div style={{ whiteSpace: 'pre-line' }}>
                              <div><strong>Channel:</strong> {info.channel}</div>
                              <div><strong>State:</strong> {info.state}</div>
                              <div><strong>In Service:</strong> {info.inService}</div>
                              {info.caller ? <div><strong>Caller:</strong> {info.caller}</div> : null}
                              {info.called ? <div><strong>Called:</strong> {info.called}</div> : null}
                            </div>
                          );
                  return (
                    <td key={i} className="border border-gray-400 text-center py-1 px-0.5 w-10 align-middle">
                      <Tooltip
                        title={tooltipContent}
                        arrow
                        placement="top"
                        enterDelay={0}
                        enterNextDelay={0}
                        leaveDelay={100}
                        componentsProps={{
                          tooltip: { sx: { bgcolor: '#fff', color: '#111', border: '1px solid #bbb', boxShadow: 2, fontSize: 12 } },
                          arrow: { sx: { color: '#fff' } }
                        }}
                      >
                        <div className="flex items-center justify-center w-full h-full" style={{ minHeight: 24 }}>
                          {v === 'frame'
                            ? colorBlock('#222')
                            : v === 'signaling'
                              ? colorBlock('#0070a8')
                              : v === 'red'
                                ? colorBlock('#e53935')
                                : v === 'unusable' ? ICONS[12] : ICONS[Number(v) || 0]}
                        </div>
                      </Tooltip>
                    </td>
                  );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
        
        <div className="text-red-600 text-center mt-35 text-sm">
          Note: If the icons display abnormally, please clear the cache and refresh this page.
        </div>
      </div>
    </div>
  );
};

export default PstnStatus;