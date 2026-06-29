export const VOICE_PROMPTS_TITLE = 'Voice Prompts';

export const VOICE_PROMPTS_TABS = [
  { id: 'promptPreference', label: 'PROMPT PREFERENCE' },
  { id: 'musicOnHold', label: 'MUSIC ON HOLD' },
  { id: 'customPrompt', label: 'CUSTOM PROMPT' },
];

export const VOICE_PROMPTS_RECORD_MODAL_TITLE = 'Record New Prompt';

export const VOICE_PROMPTS_FIELD_TOOLTIPS = {
  music_on_hold:
    'The music catalog to play when a call is being held. The default setting is default catalog.',

  play_call_forwarding_prompt:
    'If enabled, the system will play a prompt before transferring a call. By default it is unticked.',

  moh_category:
    'Enter the name of the category for the music or audio that callers hear while they are placed on hold.',
};

export const VOICE_PROMPTS_SECTIONS = {
  general_preferences: 'General Preferences',
  upload_moh: 'Upload New MOH File',
  all_moh_files: 'All Uploaded MOH Files',
  upload_custom: 'Upload Custom Prompt',
  recordings: 'Recordings',
};

export const VOICE_PROMPTS_MOH_UPLOAD_NOTE =
  'Note: only supports uploading G711A, G711U, PCM16 encoding, 8000Hz sampling rate, mono wav, MP3 files.';

export const VOICE_PROMPTS_CUSTOM_UPLOAD_NOTE =
  'Note: supports uploading .wav, .mp3, .gsm files.';

export const VOICE_PROMPTS_FORWARDING_HINT =
  'If enabled, the system plays default forwarding prompt before transfer.';
