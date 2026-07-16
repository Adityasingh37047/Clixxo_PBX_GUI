export const FILTERING_RULE_INITIAL_FORM = {
  id: 0,
  callerIdWhitelist: "none",
  calleeIdWhitelist: "none",
  callerIdBlacklist: "none",
  calleeIdBlacklist: "none",
  callerIdPoolWhitelist: "none",
  callerIdPoolBlacklist: "none",
  calleeIdPoolWhitelist: "none",
  calleeIdPoolBlacklist: "none",
  originalCallerIdPoolWhitelist: "none",
  originalCallerIdPoolBlacklist: "none",
};

export const mapFilteringRuleApiToRows = (message) =>
  message.map((item) => ({
    id: item.id,
    callerIdWhitelist: item.caller_id_white_list,
    calleeIdWhitelist: item.callee_id_white_list,
    callerIdBlacklist: item.caller_id_black_list,
    calleeIdBlacklist: item.callee_id_black_list,
    callerIdPoolWhitelist: item.caller_id_pool_in_white_list,
    callerIdPoolBlacklist: item.caller_id_pool_in_black_list,
    calleeIdPoolWhitelist: item.callee_id_pool_in_white_list,
    calleeIdPoolBlacklist: item.callee_id_pool_in_black_list,
    originalCallerIdPoolWhitelist:
      item.original_caller_id_pool_in_white_list,
    originalCallerIdPoolBlacklist:
      item.original_caller_id_pool_in_black_list,
  }));

export const buildFilteringRulePayload = (form) => ({
  caller_id_white_list: String(form.callerIdWhitelist),
  callee_id_white_list: String(form.calleeIdWhitelist),
  caller_id_black_list: String(form.callerIdBlacklist),
  callee_id_black_list: String(form.calleeIdBlacklist),
  caller_id_pool_in_white_list: String(form.callerIdPoolWhitelist),
  callee_id_pool_in_white_list: String(form.calleeIdPoolWhitelist),
  caller_id_pool_in_black_list: String(form.callerIdPoolBlacklist),
  callee_id_pool_in_black_list: String(form.calleeIdPoolBlacklist),
  original_caller_id_pool_in_white_list: String(
    form.originalCallerIdPoolWhitelist,
  ),
  original_caller_id_pool_in_black_list: String(
    form.originalCallerIdPoolBlacklist,
  ),
});

export const mapFilteringRuleGroupOptions = (filtersRes, poolRes) => {
  const unique = (arr) =>
    Array.from(new Set(arr)).sort((a, b) => Number(a) - Number(b));

  const data = filtersRes && filtersRes.data ? filtersRes.data : [];
  const wlCaller = unique(
    data
      .filter(
        (i) =>
          i.type === "whitelist" &&
          i.caller_id !== null &&
          i.group !== undefined,
      )
      .map((i) => String(i.group)),
  );
  const wlCallee = unique(
    data
      .filter(
        (i) =>
          i.type === "whitelist" &&
          i.callee_id !== null &&
          i.group !== undefined,
      )
      .map((i) => String(i.group)),
  );
  const blCaller = unique(
    data
      .filter(
        (i) =>
          i.type === "blacklist" &&
          i.caller_id !== null &&
          i.group !== undefined,
      )
      .map((i) => String(i.group)),
  );
  const blCallee = unique(
    data
      .filter(
        (i) =>
          i.type === "blacklist" &&
          i.callee_id !== null &&
          i.group !== undefined,
      )
      .map((i) => String(i.group)),
  );

  const poolArray = poolRes?.data || poolRes?.message || [];
  const poolGroups = unique(
    Array.isArray(poolArray)
      ? poolArray
          .map((e) => e?.group ?? e?.group_no ?? e?.groupNo)
          .filter((v) => v !== undefined)
          .map(String)
      : [],
  );

  return {
    wlCaller: wlCaller.length ? wlCaller : ["none"],
    wlCallee: wlCallee.length ? wlCallee : ["none"],
    blCaller: blCaller.length ? blCaller : ["none"],
    blCallee: blCallee.length ? blCallee : ["none"],
    poolGroups: poolGroups.length ? poolGroups : ["none"],
  };
};

export const FILTERING_RULE_EMPTY_GROUP_OPTIONS = {
  wlCaller: ["none"],
  wlCallee: ["none"],
  blCaller: ["none"],
  blCallee: ["none"],
  poolGroups: ["none"],
};

export const FILTERING_RULE_FORM_FIELDS = [
  {
    key: "callerIdWhitelist",
    label: "CallerID Whitelist:",
    optionsKey: "wlCaller",
  },
  {
    key: "calleeIdWhitelist",
    label: "CalleeID Whitelist:",
    optionsKey: "wlCallee",
  },
  {
    key: "callerIdBlacklist",
    label: "CallerID Blacklist:",
    optionsKey: "blCaller",
  },
  {
    key: "calleeIdBlacklist",
    label: "CalleeID Blacklist:",
    optionsKey: "blCallee",
  },
  {
    key: "callerIdPoolWhitelist",
    label: "CallerID Pool in Whitelist:",
    optionsKey: "poolGroups",
  },
  {
    key: "callerIdPoolBlacklist",
    label: "CallerID Pool in Blacklist:",
    optionsKey: "poolGroups",
  },
  {
    key: "calleeIdPoolWhitelist",
    label: "CalleeID Pool in Whitelist:",
    optionsKey: "poolGroups",
  },
  {
    key: "calleeIdPoolBlacklist",
    label: "CalleeID Pool in Blacklist:",
    optionsKey: "poolGroups",
  },
  {
    key: "originalCallerIdPoolWhitelist",
    label: "Original CallerID Pool in Whitelist:",
    optionsKey: "poolGroups",
  },
  {
    key: "originalCallerIdPoolBlacklist",
    label: "Original CallerID Pool in Blacklist:",
    optionsKey: "poolGroups",
  },
];
