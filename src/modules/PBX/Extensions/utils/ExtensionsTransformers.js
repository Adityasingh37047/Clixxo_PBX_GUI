// Pure API<->UI mappers and call-forward mutex normalizer for the Extensions page.
const CF_OTHER_FORWARD_RULES = ["busy", "no_answer", "not_registered"];

const normalizeCallForwardMutex = (formState) => {
  if ((formState.cf_always_enabled || "disabled") !== "enabled") {
    return formState;
  }
  const next = { ...formState };
  CF_OTHER_FORWARD_RULES.forEach((rule) => {
    next[`cf_${rule}_enabled`] = "disabled";
  });
  return next;
};

  const transformApiToUi = (apiData) => {
    const isEnabled = (value) =>
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "yes" ||
      value === "on";
    const yesNoToToggle = (value) =>
      isEnabled(value) ? "enabled" : "disabled";
    const boolToYesNo = (value) => (isEnabled(value) ? "yes" : "no");
    const normalizeTC = (value) => {
      const n = String(value || "")
        .toLowerCase()
        .trim();
      if (n === "office") return "work_time";
      if (n === "non_office") return "holiday";
      if (["all", "work_time", "holiday", "custom"].includes(n)) return n;
      return "all";
    };

    return [...apiData]
      .sort(
        (a, b) => (parseInt(a.extension) || 0) - (parseInt(b.extension) || 0),
      )
      .map((item, index) => ({
        index: (index + 1).toString(),
        extension: item.extension,
        context: item.context,
        allow_codecs: item.allow_codecs || item.codecs || "",
        password: item.password,
        max_registrations: item.max_registrations ?? "",
        user_name: item.name || item.display_name || "",
        user_password: item.user_password || "",
        email: item.email || "",
        mobile_number: item.mobile_number || item.mobile || "",
        voicemail_enabled: boolToYesNo(item.voicemail_enabled),
        voicemail_password: item.voicemail_password || "",
        voicemail_file: (() => {
          const v = item.voicemail_file;
          if (
            v === "audio" ||
            v === "Audio File Attachment" ||
            v === "audio_file_attachment"
          )
            return "audio_file_attachment";
          if (v === "link" || v === "Download Link" || v === "download_link")
            return "download_link";
          return "audio_file_attachment";
        })(),
        voicemail_keep_local: boolToYesNo(item.voicemail_keep_local ?? true),
        voicemail_voice: item.voicemail_voice || "system_default",
        cf_always_enabled: yesNoToToggle(
          item.cf_always_enabled ?? item.call_forward_always_enabled,
        ),
        cf_always_number:
          item.cf_always_dest || item.call_forward_always_dest || "",
        cf_always_time: normalizeTC(
          item.cf_always_time_condition ||
            item.call_forward_always_time_condition,
        ),
        cf_busy_enabled: yesNoToToggle(
          item.cf_busy_enabled ?? item.call_forward_busy_enabled,
        ),
        cf_busy_number: item.cf_busy_dest || item.call_forward_busy_dest || "",
        cf_busy_time: normalizeTC(
          item.cf_busy_time_condition || item.call_forward_busy_time_condition,
        ),
        cf_no_answer_enabled: yesNoToToggle(
          item.cf_noanswer_enabled ?? item.call_forward_noanswer_enabled,
        ),
        cf_no_answer_number:
          item.cf_noanswer_dest || item.call_forward_noanswer_dest || "",
        cf_no_answer_time: normalizeTC(
          item.cf_noanswer_time_condition ||
            item.call_forward_noanswer_time_condition,
        ),
        cf_not_registered_enabled: yesNoToToggle(
          item.cf_unreg_enabled ?? item.call_forward_unreg_enabled,
        ),
        cf_not_registered_number:
          item.cf_unreg_dest || item.call_forward_unreg_dest || "",
        cf_not_registered_time: normalizeTC(
          item.cf_unreg_time_condition ||
            item.call_forward_unreg_time_condition,
        ),
        dnd_enabled: yesNoToToggle(item.dnd_enabled),
        dnd_time: normalizeTC(item.dnd_time_condition),
        dnd_dest: item.dnd_dest || "",
        dnd_special_numbers: (() => {
          const fromApi =
            (Array.isArray(item.dnd_special_numbers) &&
              item.dnd_special_numbers) ||
            (Array.isArray(item.dnd_special_number) &&
              item.dnd_special_number) ||
            (Array.isArray(item.dnd_allow_numbers) &&
              item.dnd_allow_numbers) ||
            [];
          if (fromApi.length) return fromApi;
          return item.dnd_dest ? [String(item.dnd_dest)] : [];
        })(),
        enable_mobility_extension: boolToYesNo(
          item.mobility_enabled ??
            item.enable_mobility_extension ??
            item.enable_mobility_ext,
        ),
        ring_simultaneously: boolToYesNo(
          item.mobility_ring_simultaneously ?? item.ring_simultaneously,
        ),
        mobility_prefix: item.mobility_prefix || item.prefix || "",
        mobility_timeout:
          Number(item.mobility_timeout ?? item.timeout ?? 30) || 30,
        secretary_service: yesNoToToggle(
          item.secretary_enabled ??
            item.secretary_service_enabled ??
            item.secretary_service,
        ),
        secretary_extension:
          item.secretary_extension ||
          item.secretary_number ||
          item.ss1 ||
          item.ss2 ||
          "",
        follow_me_enabled: yesNoToToggle(item.follow_me_enabled),
        follow_me_time: normalizeTC(item.follow_me_time_condition),
        follow_me_entries: item.follow_me_dest
          ? [
              {
                destinationType: String(item.follow_me_dest),
                timeout: 30,
                confirm: "unconfirm",
              },
            ]
          : [],
        follow_me_timeout_destination: item.follow_me_timeout_destination || "",
        from_domain: item.from_domain || item["Domain name"] || "",
        contact_user: item.contact_user || item["Contact User"] || "",
        outbound_proxy: item.outbound_proxy || item["Outbound Proxy"] || "",
        transport: item.transport || "udp",
        status: item.status || "",
        enable_srtp: boolToYesNo(item.adv_enable_srtp ?? item.enable_srtp),
        sip_bypass_media: (() => {
          const v = item.adv_bypass_media || item.sip_bypass_media || "proxy";
          return v === "bypass" ? "bypass_media" : "proxy_media";
        })(),
        call_timeout: Number(
          item.adv_call_timeout_sec ?? item.call_timeout ?? 30,
        ),
        max_call_duration: Number(
          item.adv_max_call_duration_sec ?? item.max_call_duration ?? 6000,
        ),
        outbound_restriction:
          (item.adv_outbound_restriction ?? item.outbound_restriction)
            ? "enable"
            : "disable",
        admin_call_permission: (() => {
          const v = String(item.adv_call_permission_admin || "international")
            .toLowerCase()
            .replace(/[\s-]/g, "_");
          if (v === "no_call" || v === "none" || v === "no") return "no_call";
          if (v === "internal" || v === "internal_call") return "internal_call";
          if (v === "local" || v === "local_call") return "local_call";
          if (
            v === "long_distance" ||
            v === "long_distance_call" ||
            v === "longdistance"
          )
            return "long_distance_call";
          return "international_call";
        })(),
        call_permission: (() => {
          const v = String(
            item.adv_call_permission_dynamic ||
              item.adv_call_permission ||
              item.call_permission ||
              "international",
          )
            .toLowerCase()
            .replace(/[\s-]/g, "_");
          if (v === "no_call" || v === "none" || v === "no") return "no_call";
          if (v === "internal" || v === "internal_call") return "internal_call";
          if (v === "local" || v === "local_call") return "local_call";
          if (
            v === "long_distance" ||
            v === "long_distance_call" ||
            v === "longdistance"
          )
            return "long_distance_call";
          return "international_call";
        })(),
        extension_trunk:
          (item.adv_extension_trunk ?? item.extension_trunk)
            ? "enable"
            : "disable",
        dynamic_lock_pin:
          Number(
            item.adv_dynamic_lock_pin ?? item.adv_dynamic_lock_mode ?? 0,
          ) === 1
            ? "user_password"
            : "default",
        diversion: boolToYesNo(
          item.adv_send_diversion ??
            item.send_diversion ??
            item.diversion ??
            true,
        ),
        call_prohibition:
          (item.adv_call_prohibition ?? item.call_prohibition)
            ? "enable"
            : "disable",

        rx_volume: Number(item.adv_rx_volume ?? item.rx_volume ?? 0),
        tx_volume: Number(item.adv_tx_volume ?? item.tx_volume ?? 0),
        monitor_allow: item.monitor_allow || "disable",
        monitor_allowed_extensions: Array.isArray(
          item.monitor_allowed_extensions,
        )
          ? item.monitor_allowed_extensions
          : [],
        monitor_mode: item.monitor_mode || "none",
      }));
  };

  const transformUiToApi = (uiData) => {
    const toggleToBool = (value) =>
      value === "enabled" || value === "yes" || value === true;
    const voicemailFileForApi =
      uiData.voicemail_file === "download_link" ? "link" : "audio";

    return {
      extension: uiData.extension,
      context: uiData.context,
      allow_codecs: uiData.allow_codecs,
      password: uiData.password,
      max_registrations: uiData.max_registrations
        ? Number(uiData.max_registrations)
        : undefined,
      name: uiData.user_name || uiData.name || "",
      display_name: uiData.user_name || uiData.name || "",
      user_password: uiData.user_password || "",
      email: uiData.email || "",
      mobile_number: uiData.mobile_number || "",
      mobile: uiData.mobile_number || "",
      voicemail_enabled: uiData.voicemail_enabled || "no",
      voicemail_password: uiData.voicemail_password || "",
      voicemail_file: voicemailFileForApi,
      voicemail_keep_local: uiData.voicemail_keep_local || "no",
      voicemail_voice: uiData.voicemail_voice || "system_default",
      cf_always_enabled: toggleToBool(uiData.cf_always_enabled),
      cf_always_dest: uiData.cf_always_number || "",
      cf_always_time_condition: uiData.cf_always_time || "all",
      cf_busy_enabled: toggleToBool(uiData.cf_busy_enabled),
      cf_busy_dest: uiData.cf_busy_number || "",
      cf_busy_time_condition: uiData.cf_busy_time || "all",
      cf_noanswer_enabled: toggleToBool(uiData.cf_no_answer_enabled),
      cf_noanswer_dest: uiData.cf_no_answer_number || "",
      cf_noanswer_time_condition: uiData.cf_no_answer_time || "all",
      cf_unreg_enabled: toggleToBool(uiData.cf_not_registered_enabled),
      cf_unreg_dest: uiData.cf_not_registered_number || "",
      cf_unreg_time_condition: uiData.cf_not_registered_time || "all",
      follow_me_enabled: toggleToBool(uiData.follow_me_enabled),
      follow_me_dest:
        (Array.isArray(uiData.follow_me_entries) &&
          uiData.follow_me_entries.find((e) => e?.destinationType)
            ?.destinationType) ||
        "",
      follow_me_destination:
        (Array.isArray(uiData.follow_me_entries) &&
          uiData.follow_me_entries.find((e) => e?.destinationType)
            ?.destinationType) ||
        "",
      follow_me_time_condition: uiData.follow_me_time || "all",
      dnd_enabled: toggleToBool(uiData.dnd_enabled),
      dnd_time_condition: uiData.dnd_time || "all",
      dnd_dest:
        uiData.dnd_dest ||
        (Array.isArray(uiData.dnd_special_numbers)
          ? uiData.dnd_special_numbers.find(Boolean)
          : "") ||
        "",
      dnd_special_numbers: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      dnd_special_number: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      dnd_allow_numbers: Array.isArray(uiData.dnd_special_numbers)
        ? uiData.dnd_special_numbers.filter(Boolean)
        : [],
      mobility_enabled: toggleToBool(uiData.enable_mobility_extension),
      enable_mobility_extension: uiData.enable_mobility_extension || "no",
      enable_mobility_ext: uiData.enable_mobility_extension || "no",
      mobility_ring_simultaneously: toggleToBool(uiData.ring_simultaneously),
      ring_simultaneously: uiData.ring_simultaneously || "no",
      mobility_prefix: uiData.mobility_prefix || "",
      mobility_timeout: Number(uiData.mobility_timeout || 30),
      monitor_allow: uiData.monitor_allow || "disable",
      monitor_allowed_extensions: Array.isArray(
        uiData.monitor_allowed_extensions,
      )
        ? uiData.monitor_allowed_extensions
        : [],
      monitor_mode: uiData.monitor_mode || "none",
      secretary_enabled: toggleToBool(uiData.secretary_service),
      secretary_service_enabled: toggleToBool(uiData.secretary_service),
      secretary_service: toggleToBool(uiData.secretary_service),
      secretary_extension: uiData.secretary_extension || "",
      secretary_number: uiData.secretary_extension || "",
      transport: uiData.transport || "udp",
      from_domain: uiData.from_domain,
      contact_user: uiData.contact_user,
      outbound_proxy: uiData.outbound_proxy,
      adv_enable_srtp: uiData.enable_srtp === "yes",
      adv_bypass_media:
        uiData.sip_bypass_media === "bypass_media" ? "bypass" : "proxy",
      adv_call_timeout_sec: Number(uiData.call_timeout ?? 30),
      adv_max_call_duration_sec: Number(uiData.max_call_duration ?? 6000),
      adv_outbound_restriction: uiData.outbound_restriction === "enable",
      adv_call_permission_admin: (() => {
        const v = uiData.admin_call_permission || "international_call";
        if (v === "no_call") return "no_call";
        if (v === "internal_call") return "internal";
        if (v === "local_call") return "local";
        if (v === "long_distance_call") return "long_distance";
        return "international";
      })(),
      adv_extension_trunk: uiData.extension_trunk === "enable",
      adv_dynamic_lock_mode:
        uiData.dynamic_lock_pin === "user_password" ? 1 : 0,
      adv_send_diversion: uiData.diversion === "yes",
      adv_call_prohibition: uiData.call_prohibition === "enable",
      adv_rx_volume: Number(uiData.rx_volume ?? 0),
      adv_tx_volume: Number(uiData.tx_volume ?? 0),
    };
  };

export {
  transformApiToUi,
  transformUiToApi,
  normalizeCallForwardMutex,
  CF_OTHER_FORWARD_RULES,
};
