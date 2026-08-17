export const CALL_QUEUE_INITIAL_FORM = {
  queue_name: '',
  queue_number: '',
  pin: 'yes',
  agent_password: '',
  ring_strategy: 'ring_all',
  timeout_action: '',
  timeout_action_dest: '',
  caller_id_prefix: '',
  overflow_action: '',
  overflow_action_dest: '',
  agents_initial_status: 'logged_in',
  agent_call_timeout: 15,
  agent_announcement: '',
  agent_retry_time: 30,
  wrap_up_time: 30,
  max_no_answer: 0,
  discard_abandoned_after: 0,
  max_wait_time: 0,
  max_queue_length: 20,
  alert_info: '',
  music_on_hold: 'default',
  max_wait_no_agent: 90,
  queue_busy_resume: 'enable',
  transfer_prompt: '',
  agent_busy_announce: '',
  answer_announce: '',
  join_when_no_agent: false,
  join_announce: 'default',
  join_announce_playtime: 0,
  answer_type: 'answer',
  no_agent_announce: '',
  announce_position: true,
  announce_hold_time: true,
  call_duration: 60,
  announce_frequency: 30,
  periodic_sound: 'default',
  periodic_frequency: 0,
  busy_callback: 'no',
  busy_callback_key: '2',
  busy_callback_announce: 'default',
  selected_agents: [],
};

export const RING_STRATEGY_OPTIONS = [
  { value: 'ring_all', label: 'Ring All' },
  { value: 'longest_idle', label: 'Longest Idle Agent' },
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'top_down', label: 'Top Down' },
  { value: 'least_talk_time', label: 'Agent With Least Talk Time' },
  { value: 'fewest_calls', label: 'Agent With Fewest Calls' },
  { value: 'random', label: 'Random' },
];

export const ACTION_OPTIONS = [
  { value: '', label: '' },
  { value: 'call_queue', label: 'Call Queue' },
  { value: 'callbacks', label: 'CallBacks' },
  { value: 'conference_rooms', label: 'Conference Rooms' },
  { value: 'disa', label: 'DISA' },
  { value: 'extensions', label: 'Extensions' },
  { value: 'faxtoemail', label: 'Fax to Mail' },
  { value: 'ivr_menus', label: 'IVR Menus' },
  { value: 'ring_groups', label: 'Ring Groups' },
  { value: 'voicemail', label: 'Voicemails' },
  { value: 'other', label: 'Other' },
];

export const ANNOUNCE_FREQ_OPTIONS = [0, 15, 20, 30, 45, 60, 90, 120, 150, 180, 240, 300];

export const CALL_QUEUE_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'queue_name', label: 'Queue Name' },
  { key: 'queue_number', label: 'Queue Number' },
  { key: 'ring_strategy', label: 'Ring Strategy' },
  { key: 'agents_count', label: 'Agents' },
  { key: 'modify', label: 'Modify' },
];

export const CALL_QUEUE_TITLE = 'Call Queue';

export const CALL_QUEUE_MODAL_TABS = [
  { id: 'basic', label: 'BASIC' },
  { id: 'caller', label: 'CALLER EXPERIENCE SETTINGS' },
];

/** Field tooltips for Call Queue */
export const CALL_QUEUE_FIELD_TOOLTIPS = {
  queue_name:
    'User-defined name of a call queue. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_ only. Maximum 32 characters.',

  agent_call_timeout:
    'The maximum time for each agent to ring. the default value is 15 seconds.',

  queue_number:
    "The number dialed to reach this call queue. Enter a number of 1 to 9 digits that is not already used by another extension or feature. It is null by default and must be filled in: otherwise the configuration will fail to be saved.",

  agent_announcement:
    'Announcement played to the Agent prior to bridging in the caller.',

  pin: 'Set whether a password is needed for entering this call queue. The default setting is No.',

  agent_retry_time:
    'Interval between calling the agent again after the failure of calling the agent. The default value is 30s.',

  agent_password:
    'Set the password for dynamic agents to enter this call queue. It is null by default and must be filled in: otherwise the configuration will fail to be saved.',

  wrap_up_time:
    'How many seconds after the completion of a call an Agent will have before the queue can ring them with a new call. The default value is 30s.',

  ring_strategy:
    'Selct the ring strategy for this queue. Ring all: All available agents ring. Longest idle agent(default): The agent keeping idle for the longest time rings first. Round Robin: All available agents ring randomly. Agent with least talk time: The agent whose total call time is shortest rings first. Agent with fewest calls: The agent with the fewest calls rings first. Agent with fewest calls: The agent with the fewest calls rings first. Agent with fewest calls: The agent with the fewest calls rings first. Top Down: The agents ring from top to down in the order already configured.',

  max_no_answer:
    'The allowed number of consecutive unanswered calls. 0 means no limit and the default value is 0.',

  timeout_action:
    'Select the action to perform when the timeout period is reached without any user input.',

  discard_abandoned_after: 'Set the discard abandoned after seconds.',

  caller_id_prefix:
    'Theprefix of a caller ID name sent when the queue allocates a call to the agent. By default it is null.',

  max_wait_time:
    'The maximum time for a caller to wait in the queue. 0 means no limit and the default value is 0.',

  overflow_action:
    'Transfer to the destination when the number of calling parties in the queue exceeds the upper limit.',

  max_queue_length:
    'The maximum number of calls that can be in the queue at the same time. The default value is 20.',

  agents_initial_status: 'Sets the initial status of the static agents.',

  alert_info: 'Set the content of the alert-info field. By default it is null.',

  music_on_hold:
    'Select the music on hold to play when the caller enters this queue. By default it is null.',

  join_when_no_agent:
    'If enabled, callers can join a queue that has no agents. By default it is unticked.',

  max_wait_no_agent:
    'The maximum time for a caller to wait in the queue when there are no agents available. The default value is 90s.',

  join_announce:
    'Select the announcement to play when a caller joins the queue. By default it is null.',

  queue_busy_resume:
    'Set whether to offer the caller to join the queue when the queue is busy. The default setting is Enable.',

  join_announce_playtime:
    'Set the playtime of the join announcement. The default value is 0.',

  transfer_prompt:
    'The caller waiting in the queue will hear a periodic announcement at configured intervals. When an agent answers the call, the transfer prompt tone will be played before connecting the caller. Leave this field empty (NULL) to use the system default behavior.',

  answer_type:
    'Select the type of answer for the caller. Answer: The caller will hear the answer tone when an agent answers the call. Progress: The caller will hear the progress tone when an agent answers the call.',

  agent_busy_announce:
    'Select the announcement to play when the agent is busy. By default it is null.',

  no_agent_announce:
    'Select the announcement to play when there are no agents available. By default it is null.',

  answer_announce:
    'Select the announcement to play when the agent answers the call. By default it is null.',

  announce_position:
    'Set whether to announce the position of the caller in the queue. By default it is unticked.',

  call_duration: 'Set the duration of the call. The default value is 60s.',

  announce_hold_time:
    'Set whether to announce the hold time of the caller. By default it is unticked.',

  announce_frequency_caller:
    'Set the frequency of the announcement. The default value is 30s.',

  periodic_sound:
    'Select the sound to play when the announcement is made. By default it is null.',

  announce_frequency_periodic:
    'Set the frequency of the announcement. The default value is 0.',

  busy_callback:
    'Set whether to enable the busy callback. The default setting is No.',

  busy_callback_announce:
    'Select the announcement to play when the agent is busy. By default it is null.',

  busy_callback_key:
    'Set the key to press to enable the busy callback. The default value is 8.',
};
