export const PCM_MAINTENANCE_HEADERS = ['PCM No.', 'PCM Status', 'Check'];
export const PCM_LOOPBACK_HEADERS = ['PCM No.', 'PCM LoopBack Status', 'Check'];
export const PCM0_HEADERS = ['Channel No.', ...Array.from({length: 32}, (_, i) => i.toString())];
export const PCM0_STATUS_ROW = ['Status', ...Array.from({length: 32}, (_, i) => (i === 0 || i === 16) ? 'red' : 'gray')];
export const PCM0_CHECK_ROW = ['Check', ...Array.from({length: 32}, () => false)];

export const PCM_MAINTENANCE_BUTTONS = ['Check All', 'Uncheck All', 'Inverse', 'Block', 'Unblock', 'Physical Connect', 'Physical Disconnect'];
export const PCM_LOOPBACK_BUTTONS = ['Check All', 'Uncheck All', 'Inverse', 'Local LoopBack', 'Remote LoopBack', 'UnLoopBack'];
export const PCM0_BUTTONS = ['Check All', 'Uncheck All', 'Inverse', 'Block', 'Unblock'];
