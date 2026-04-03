import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/routeConstatns';
import { PORT_FXS_TOTAL_PORTS } from './constants/PortFxsPageConstants';
// import { fetchFxsPorts, updateFxsPort } from './controller';

const PortFxsModifyPage = ({ port: propPort, onSaved, onClose } = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPort = propPort || ((location.state && location.state.port) ? String(location.state.port) : '1');

  const [form, setForm] = useState({
    startingPort: initialPort,
    endingPort: initialPort,
    registerPort: 'No',
    startingSipAccount: '',
    startingDisplayName: '',
    startingAuthPassword: '',
    displayNamePreferred: false,
    autoDialNumber: '',
    waitTimeBeforeAutoDial: '0',
    inputGain: '0',
    outputGain: '0',
    echoCanceller: true,
    cid: true,
    callWaiting: false,
    dnd: false,
    callForward: false,
    forwardType: 'Unconditional',
    forwardNumber: '',
    advancedConfiguration: false,
    ringingParameter: '',
    feedVoltageParameter: '',
    impedanceParameter: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchFxsPorts();
        const list = res && res.data ? res.data : (res || []);
        const p = list.find(item => String(item.port_number ?? item.port ?? item.id) === String(initialPort));
        if (p && mounted) {
          setForm(prev => ({
            ...prev,
            startingPort: String(p.port_number ?? p.port ?? p.id),
            endingPort: String(p.port_number ?? p.port ?? p.id),
            registerPort: p.register_port ?? 'No',
            startingSipAccount: p.sip_account ?? '',
            startingDisplayName: p.starting_display_name ?? p.display_name ?? '',
            displayNamePreferred: !!p.display_name_preferred,
            autoDialNumber: p.auto_dial_number_value ?? '',
            waitTimeBeforeAutoDial: String(p.wait_time_before_auto_dial ?? 0),
            inputGain: String(p.input_gain ?? p.input_gain_db ?? 0),
            outputGain: String(p.output_gain ?? p.output_gain_db ?? 0),
            echoCanceller: !!p.echo_canceller,
            cid: !!p.cid_enable,
            callWaiting: !!p.call_waiting,
            dnd: !!p.dnd_do_not_disturb,
            callForward: !!p.call_forward,
            forwardType: p.forward_type ?? 'Unconditional',
            forwardNumber: p.forward_number ?? '',
            advancedConfiguration: !!p.advanced_configuration,
            ringingParameter: p.ringing_parameter ?? '',
            feedVoltageParameter: p.feed_voltage_parameter ?? '',
            impedanceParameter: p.impedance_parameter ?? '',
          }));
        }
      } catch (err) {
        console.warn('Failed to load port data for modify:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [initialPort]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const handleCheckbox = (key) => {
    setForm(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'dnd' && !prev.dnd) next.callForward = false;
      if (key === 'callForward' && !prev.callForward) next.dnd = false;
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        portNumber: Number(form.startingPort),
        type: 'FXS',
        registerPort: form.registerPort,
        sipAccount: form.startingSipAccount,
        displayName: form.startingDisplayName,
        password: form.startingAuthPassword,
        displayNamePreferred: !!form.displayNamePreferred,
        autoDialNumber: form.autoDialNumber,
        waitTimeBeforeAutoDial: Number(form.waitTimeBeforeAutoDial) || 0,
        inputGainDb: Number(form.inputGain) || 0,
        outputGainDb: Number(form.outputGain) || 0,
        echoCanceller: !!form.echoCanceller,
        cid: !!form.cid,
        callWaiting: !!form.callWaiting,
        dndDoNotDisturb: !!form.dnd,
        callForward: !!form.callForward,
        forwardType: form.forwardType,
        forwardNumber: form.forwardNumber,
      };

      const res = await updateFxsPort(payload);
      // notify parent to reload ports list so UI shows authoritative data
      if (typeof onSaved === 'function') await onSaved();
      alert(res?.message || 'Modify saved successfully!');
      if (typeof onClose === 'function') onClose();
      else navigate(ROUTE_PATHS.PORT_FXS);
    } catch (err) {
      console.error('Failed to update port:', err);
      alert(err?.message || 'Failed to update port');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // reset to last loaded values by re-running effect: simply reload port
    setForm(prev => ({ ...prev }));
  };

  const handleCancel = () => {
    if (typeof onClose === 'function') onClose();
    else navigate(ROUTE_PATHS.PORT_FXS);
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-128px)] py-1" style={{ backgroundColor: '#dde0e4' }}>
      <div className="flex justify-center" style={{ padding: '0 20px' }}>
        <div style={{ width: '62%', maxWidth: '1000px', minWidth: '700px' }}>
          <div className="w-full h-8 bg-linear-to-b from-[#b3e0ff] via-[#6ec1f7] to-[#3b8fd6] flex items-center justify-center font-semibold text-lg text-gray-700 shadow mb-0">
            <span>FXS-Modify</span>
          </div>

          <form id="PortAdd" onSubmit={handleSave}>
            <div className="bg-[#dde0e4] border-2 border-gray-400 border-t-0 shadow-sm py-2 text-xs">
              <div className="flex justify-center pl-4">
                <table width="100%" cellSpacing="0" cellPadding="0" className="context" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '3%' }} />
                    <col style={{ width: '37%' }} />
                    <col style={{ width: '50%' }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td style={{ height: '22px' }}>&nbsp;</td>
                      <td colSpan="2">Port</td>
                      <td>
                        <select
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="Port"
                          name="Port"
                          value={form.startingPort}
                          onChange={e => handleChange('startingPort', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        >
                          {Array.from({ length: PORT_FXS_TOTAL_PORTS }, (_, i) => <option key={i+1} value={String(i+1)}>{i+1}</option>)}
                        </select>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ height: '22px' }}>&nbsp;</td>
                      <td colSpan="2">Type</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="PortType"
                          name="PortType"
                          maxLength="19"
                          size="20"
                          value="FXS"
                          readOnly
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>

                    <tr>
                      <td style={{ height: '22px' }}>&nbsp;</td>
                      <td colSpan="2">Register Port</td>
                      <td>
                        <select
                          id="registerPort"
                          value={form.registerPort}
                          onChange={e => handleChange('registerPort', e.target.value)}
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ height: '22px' }}>&nbsp;</td>
                      <td colSpan="2">SIP Account</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="Account"
                          name="Account"
                          value={form.startingSipAccount}
                          onChange={e => handleChange('startingSipAccount', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td style={{ height: '22px' }}>&nbsp;</td>
                      <td colSpan="2">Display Name</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="DisplayName"
                          name="DisplayName"
                          value={form.startingDisplayName}
                          onChange={e => handleChange('startingDisplayName', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr id="idAuthPswd" style={{ display: form.registerPort === 'Yes' ? '' : 'none' }}>
                      <td style={{ height: '22px' }}>&nbsp;</td>
                      <td colSpan="2">Password</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="AuthPswd"
                          name="AuthPswd"
                          type="password"
                          value={form.startingAuthPassword}
                          onChange={e => handleChange('startingAuthPassword', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td style={{ height: '22px' }}>&nbsp;</td>
                      <td colSpan="2">Display Name preferred</td>
                      <td>
                        <input
                          id="DisplayNamePrior"
                          name="DisplayNamePrior"
                          type="checkbox"
                          checked={!!form.displayNamePreferred}
                          onChange={() => handleCheckbox('displayNamePreferred')}
                          style={{ marginRight: '4px' }}
                        /> Enable
                      </td>
                    </tr>

                    <tr id="idSpace"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan="2">Auto Dial Number</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="OffhookAutodial"
                          name="OffhookAutodial"
                          maxLength="20"
                          value={form.autoDialNumber}
                          onChange={e => handleChange('autoDialNumber', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>Wait Time before Auto Dial (s)</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="AutodialDelayTime"
                          name="AutodialDelayTime"
                          maxLength="2"
                          value={form.waitTimeBeforeAutoDial}
                          onChange={e => handleChange('waitTimeBeforeAutoDial', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan="2">Input Gain (dB)</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="RxGainDb"
                          name="RxGainDb"
                          maxLength="3"
                          value={form.inputGain}
                          onChange={e => handleChange('inputGain', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan="2">Output Gain (dB)</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="TxGainDb"
                          name="TxGainDb"
                          maxLength="3"
                          value={form.outputGain}
                          onChange={e => handleChange('outputGain', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan="2">Echo Canceller</td>
                      <td>
                        <input
                          id="EnableEchoCancellor"
                          name="EnableEchoCancellor"
                          type="checkbox"
                          checked={!!form.echoCanceller}
                          onChange={() => handleCheckbox('echoCanceller')}
                          style={{ marginRight: '4px' }}
                        />Enable
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan="2">CID</td>
                      <td>
                        <input
                          id="CallerIDEnable"
                          name="CallerIDEnable"
                          type="checkbox"
                          checked={!!form.cid}
                          onChange={() => handleCheckbox('cid')}
                          style={{ marginRight: '4px' }}
                        />Enable
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan="2">Call Waiting</td>
                      <td>
                        <input
                          id="CallWaitingEnable"
                          name="CallWaitingEnable"
                          type="checkbox"
                          checked={!!form.callWaiting}
                          onChange={() => handleCheckbox('callWaiting')}
                          style={{ marginRight: '4px' }}
                        />Enable
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan="2">DND (Do Not Disturb)</td>
                      <td>
                        <input
                          id="DNDEnable"
                          name="DNDEnable"
                          type="checkbox"
                          checked={!!form.dnd}
                          onChange={() => handleCheckbox('dnd')}
                          style={{ marginRight: '4px' }}
                          disabled={!!form.callForward}
                        />Enable
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan="2">Call Forward</td>
                      <td>
                        <input
                          id="Forwarding"
                          name="Forwarding"
                          type="checkbox"
                          checked={!!form.callForward}
                          onChange={() => handleCheckbox('callForward')}
                          style={{ marginRight: '4px' }}
                          disabled={!!form.dnd}
                        />Enable
                      </td>
                    </tr>

                    <tr id="idForwardingType" style={{ display: form.callForward ? '' : 'none' }}>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>Forward Type</td>
                      <td>
                        <select
                          id="ForwardingType"
                          value={form.forwardType}
                          onChange={e => handleChange('forwardType', e.target.value)}
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        >
                          <option value="Unconditional">Unconditional</option>
                          <option value="Busy">Busy</option>
                          <option value="No Reply">No Reply</option>
                        </select>
                      </td>
                    </tr>

                    <tr id="idForwardingNum" style={{ display: form.callForward ? '' : 'none' }}>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>Forward Number</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="ForwardingNum"
                          name="ForwardingNum"
                          maxLength="20"
                          value={form.forwardNumber}
                          onChange={e => handleChange('forwardNumber', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr id="idNoAnswerDelayTime" style={{ display: form.callForward && form.forwardType === 'No Reply' ? '' : 'none' }}>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>Time for No Reply Forward (s)</td>
                      <td>
                        <input
                          className="border border-gray-400 rounded-sm px-1 bg-white"
                          id="NoAnswerDelayTime"
                          name="NoAnswerDelayTime"
                          maxLength="2"
                          value={form.noAnswerDelayTime || '0'}
                          onChange={e => handleChange('noAnswerDelayTime', e.target.value)}
                          style={{ height: '22px', width: '200px', fontSize: '12px' }}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td>&nbsp;</td>
                      <td colSpan="2">Advanced Configuration</td>
                      <td><input id="Advanced" name="Advanced" type="checkbox" checked={!!form.advancedConfiguration} onChange={() => handleCheckbox('advancedConfiguration')} />Enable</td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center mt-4">
              <div className="text-gray-600 text-sm" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                Note: 'Auto Dial Number' goes into effect only if no dialing occurs during 'Wait Time before Auto Dial'.
              </div>
            </div>

            <div className="flex justify-center gap-6 py-6">
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '16px',
                  borderRadius: '6px',
                  minWidth: '100px',
                  height: '42px',
                  textTransform: 'none',
                  padding: '6px 24px',
                  boxShadow: '0 2px 8px #b3e0ff',
                  border: '1px solid #0e8fd6',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)'; }}
              >
                {saving ? 'Saving...' : 'Modify'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '16px',
                  borderRadius: '6px',
                  minWidth: '100px',
                  height: '42px',
                  textTransform: 'none',
                  padding: '6px 24px',
                  boxShadow: '0 2px 8px #b3e0ff',
                  border: '1px solid #0e8fd6',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)'; }}
              >
                Reset
              </button>

              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '16px',
                  borderRadius: '6px',
                  minWidth: '100px',
                  height: '42px',
                  textTransform: 'none',
                  padding: '6px 24px',
                  boxShadow: '0 2px 8px #b3e0ff',
                  border: '1px solid #0e8fd6',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.target.style.background = 'linear-gradient(to bottom, #0e8fd6 0%, #3bb6f5 100%)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)'; }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PortFxsModifyPage;


