import React, { useState } from 'react';
import {
  SCT_TITLE,
  SCT_LABELS,
  SCT_TEST_TYPE_OPTIONS,
  SCT_TRUNK_GROUP_OPTIONS,
  SCT_BUTTONS,
  SCT_TRACE_LABEL,
} from '../constants/SignalingCallTestConstants';
import Button from '@mui/material/Button';

const blueBar = (title) => (
  <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#7ecbfa] to-[#3b8fd6] h-12 rounded-t-lg flex items-center justify-center text-[22px] font-semibold text-gray-800 shadow mb-0 border-b border-[#b3e0ff]">
    {title}
  </div>
);

const SignalingCallTest = () => {
  const [testType, setTestType] = useState(SCT_TEST_TYPE_OPTIONS[0].value);
  const [trunkGroup, setTrunkGroup] = useState(SCT_TRUNK_GROUP_OPTIONS[0].value);
  const [callerId, setCallerId] = useState('');
  const [calledId, setCalledId] = useState('');
  const [originalCallee, setOriginalCallee] = useState('');
  const [trace, setTrace] = useState('');

  const handleClear = () => {
    setCallerId('');
    setCalledId('');
    setOriginalCallee('');
    setTrace('');
  };

  const buttonSx = {
    background: 'linear-gradient(to bottom, #5dc6f8 0%, #299fd6 100%)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '16px',
    borderRadius: 0,
    minWidth: 90,
    px: 2,
    py: 0.5,
    boxShadow: '0 2px 8px #b3e0ff',
    textTransform: 'none',
    '&:hover': {
      background: 'linear-gradient(to bottom, #299fd6 0%, #5dc6f8 100%)',
    },
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col items-center py-6 px-2">
      <div className="w-full max-w-4xl">
        {blueBar(SCT_TITLE)}
        <div className="border border-gray-400 rounded-b-lg bg-white p-8 flex flex-col items-center">
          <form className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center mb-6">
            <label className="text-[17px] text-gray-700 text-left">{SCT_LABELS.testType}</label>
            <select
              className="border border-gray-400 rounded px-2 py-1 text-base text-gray-800 bg-white min-w-[220px]"
              value={testType}
              onChange={e => setTestType(e.target.value)}
            >
              {SCT_TEST_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <label className="text-[17px] text-gray-700 text-left">{SCT_LABELS.trunkGroup}</label>
            <select
              className="border border-gray-400 rounded px-2 py-1 text-base text-gray-800 bg-white min-w-[220px]"
              value={trunkGroup}
              onChange={e => setTrunkGroup(e.target.value)}
            >
              {SCT_TRUNK_GROUP_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <label className="text-[17px] text-gray-700 text-left">{SCT_LABELS.callerId}</label>
            <input
              type="text"
              className="border border-gray-400 rounded px-2 py-1 text-base text-gray-800 bg-white min-w-[220px]"
              value={callerId}
              onChange={e => setCallerId(e.target.value)}
            />

            <label className="text-[17px] text-gray-700 text-left">{SCT_LABELS.calledId}</label>
            <input
              type="text"
              className="border border-gray-400 rounded px-2 py-1 text-base text-gray-800 bg-white min-w-[220px]"
              value={calledId}
              onChange={e => setCalledId(e.target.value)}
            />

            <label className="text-[17px] text-gray-700 text-left">{SCT_LABELS.originalCallee}</label>
            <input
              type="text"
              className="border border-gray-400 rounded px-2 py-1 text-base text-gray-800 bg-white min-w-[220px]"
              value={originalCallee}
              onChange={e => setOriginalCallee(e.target.value)}
            />
          </form>
          <div className="w-full flex flex-row justify-center gap-12 mb-6">
            <Button type="button" variant="contained" sx={buttonSx}>{SCT_BUTTONS.start}</Button>
            <Button type="button" variant="contained" sx={buttonSx} onClick={handleClear}>{SCT_BUTTONS.clear}</Button>
          </div>
          <div className="w-full flex flex-col items-center">
            <span className="text-[20px] text-gray-600 mb-2">{SCT_TRACE_LABEL}</span>
            <textarea
              className="w-full min-h-[220px] max-h-[320px] border border-gray-400 rounded bg-white text-[16px] p-2 font-mono resize-y"
              value={trace}
              onChange={e => setTrace(e.target.value)}
              placeholder=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalingCallTest; 