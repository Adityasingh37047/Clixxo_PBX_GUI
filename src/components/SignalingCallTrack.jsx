import React, { useState } from 'react';
import {
  SCTRACK_TITLE,
  SCTRACK_RADIO_OPTIONS,
  SCTRACK_LABELS,
  SCTRACK_BUTTONS,
} from '../constants/SignalingCallTrackConstants';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const blueBar = (title) => (
  <div className="w-full bg-gradient-to-b from-[#b3e0ff] via-[#7ecbfa] to-[#3b8fd6] h-12 rounded-t-lg flex items-center justify-center text-[22px] font-semibold text-gray-800 shadow mb-0 border-b border-[#b3e0ff]">
    {title}
  </div>
);

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

const SignalingCallTrack = () => {
  const [filterType, setFilterType] = useState('caller');
  const [filterValue, setFilterValue] = useState('0');
  const [trackMessage, setTrackMessage] = useState('');

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 flex flex-col items-center py-6 px-2">
      <div className="w-full max-w-4xl">
        {blueBar(SCTRACK_TITLE)}
        <div className="border border-gray-400 rounded-b-lg bg-white p-8 flex flex-col items-center">
          {/* Filter Row */}
          <div className="w-full flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2 md:gap-4">
              <RadioGroup
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                name="filterType"
              >
                {SCTRACK_RADIO_OPTIONS.map(opt => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={<Radio size="small" sx={{ p: 0.5 }} />}
                    label={<span className="text-[16px] text-gray-700">{opt.label}</span>}
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </RadioGroup>
            </div>
            <div className="flex flex-row items-center gap-2 md:mt-2">
              <input
                type="text"
                value={filterValue}
                onChange={e => setFilterValue(e.target.value)}
                className="border border-gray-400 rounded px-2 py-1 text-base text-gray-800 bg-white min-w-[120px] max-w-[180px]"
              />
            </div>
          </div>
          {/* Buttons Row */}
          <div className="w-full flex flex-row flex-wrap justify-center gap-4 mb-8">
            <Button variant="contained" sx={buttonSx}>{SCTRACK_BUTTONS.start}</Button>
            <Button variant="contained" sx={buttonSx}>{SCTRACK_BUTTONS.stop}</Button>
            <Button variant="contained" sx={buttonSx}>{SCTRACK_BUTTONS.filter}</Button>
            <Button variant="contained" sx={buttonSx}>{SCTRACK_BUTTONS.clear}</Button>
            <Button variant="contained" sx={buttonSx}>{SCTRACK_BUTTONS.download}</Button>
          </div>
          {/* Track Message */}
          <div className="w-full flex flex-col md:flex-row md:items-start gap-4">
            <label className="text-[17px] text-gray-700 min-w-[140px] md:pt-2">{SCTRACK_LABELS.trackMessage}</label>
            <textarea
              className="w-full min-h-[220px] max-h-[320px] border border-gray-400 rounded bg-white text-[16px] p-2 font-mono resize-y"
              value={trackMessage}
              onChange={e => setTrackMessage(e.target.value)}
              placeholder=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalingCallTrack; 
