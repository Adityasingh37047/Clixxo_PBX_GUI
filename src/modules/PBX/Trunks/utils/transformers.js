import { SIP_REGISTER_CODEC_OPTIONS } from "../../../../constants/SipRegisterConstants";

export const stripSipPrefix = (value) => {
  if (!value) return "";
  return value.replace(/^sip:/i, "");
};

export const SIP_PREFIX_FIELDS = [
  "provider",
  "sip_header",
  "Outbound Proxy",
  "server_domain",
  "client_domain",
];

export const transformApiToUi = (apiData) => {
  const toBool = (v) => {
    if (typeof v === "boolean") return v;
    const s = v == null ? "" : String(v).toLowerCase();
    return (
      s === "true" ||
      s === "yes" ||
      s === "1" ||
      s === "running" ||
      s === "connected"
    );
  };

  const toYesNo = (v) => (toBool(v) ? "Yes" : "No");
  const normalizeTransport = (v) => {
    const s = v == null ? "" : String(v).toLowerCase();
    if (s === "udp" || s === "tcp" || s === "tls") return s;
    return s || "udp";
  };
  const mapEthPort = (v) => {
    const s = v == null ? "" : String(v);
    if (s.toLowerCase() === "lan") return "ETH0";
    if (s.toLowerCase() === "wan") return "ETH1";
    return s;
  };

  const mapOutboundCallerIdSource = (v) => {
    const s = v == null ? "" : String(v);
    if (s === "register_name") return "Register Name";
    return "Transparent caller";
  };

  const mapRecording = (v) => {
    const s = v == null ? "" : String(v).toLowerCase();
    if (s === "yes" || s === "true") return "Yes";
    return "No";
  };

  const mapContactMode = (v) => {
    const s = v == null ? "" : String(v);
    if (s === "trunk_username" || s.toLowerCase() === "trunk user name")
      return "Trunk User Name";
    if (s === "extension_number" || s.toLowerCase() === "extension number")
      return "Extension Number";
    return "Trunk User Name";
  };

  const parseSelectedCodecs = (codecsObj) => {
    if (!codecsObj || typeof codecsObj !== "object") return "";
    const selected = Object.entries(codecsObj)
      .filter(([, enabled]) => !!enabled)
      .map(([codec]) => codec);
    return selected.join(",");
  };

  const deriveUiRegister = (registerVal, expireSecondsVal) => {
    const regBool = toBool(registerVal);
    if (regBool) return "Yes";

    const exp = expireSecondsVal == null ? "" : String(expireSecondsVal);
    return exp === "0" || exp === "" ? "No" : "Yes";
  };

  const items = Array.isArray(apiData) ? apiData : [];
  return items.map((item, index) => {
    const trunkId = item?.trunk_id ?? item?.trunkId ?? "";

    const codecsObj = item?.codecs || {};
    const allow_codecs = parseSelectedCodecs(codecsObj);

    const expireSeconds = item?.expire_seconds ?? item?.expire_in_sec ?? "";
    const ui_register = deriveUiRegister(item?.register, expireSeconds);
    const expire_in_sec =
      ui_register === "No" ? "0" : String(expireSeconds ?? "");

    const eth_port = mapEthPort(item?.eth_port ?? "");

    const ui_country = item?.country ?? "General";
    const ui_transport = normalizeTransport(item?.transport ?? "udp");
    const ui_enable_srtp = toBool(item?.enable_srtp);
    const ui_match_username = toYesNo(item?.match_username);
    const outboundProxyVal =
      item?.proxy_ip ??
      item?.advance?.proxy_ip ??
      item?.advance?.proxyIp ??
      item?.outbound_proxy ??
      item?.advance?.outbound_proxy ??
      "";

    const ui_enable_proxy =
      toBool(item?.enable_proxy ?? item?.advance?.enable_proxy) ||
      (outboundProxyVal != null &&
        String(outboundProxyVal).trim() !== "" &&
        String(outboundProxyVal).trim().toLowerCase() !== "none");

    const ui_outbound_cid_source = mapOutboundCallerIdSource(
      item?.outbound_callerid ?? "",
    );
    const ui_show_outbound_cid_name = toBool(item?.show_outbound_cid_name);

    const ui_record = mapRecording(item?.recording);
    const ui_enabled = toYesNo(item?.enabled);

    const advance = item?.advance || {};
    const ui_contact_mode = mapContactMode(advance?.contact);

    const ui_send_privacy_id =
      String(advance?.send_privacy_id ?? "").toLowerCase() === "yes"
        ? "Yes"
        : "No";
    const ui_enable_early_session =
      String(advance?.enable_early_session ?? "").toLowerCase() === "yes"
        ? "Yes"
        : "No";
    const ui_enable_early_media =
      String(advance?.enable_early_media ?? "").toLowerCase() === "yes"
        ? "Yes"
        : "No";

    const registerStatus =
      item?.registration_status ?? item?.register_status ?? "";

    const dodRows = Array.isArray(item?.dod)
      ? item.dod.map((d) => ({
          dodName: d?.dod_name ?? d?.dodName ?? "",
          dodNumber: d?.dod_number ?? d?.dodNumber ?? "",
          bindExtensions: Array.isArray(d?.extensions)
            ? d.extensions.map(String)
            : Array.isArray(d?.extension)
              ? d.extension.map(String)
              : [],
        }))
      : [];

    const adaptRows = Array.isArray(item?.adapt_callerid)
      ? item.adapt_callerid.map((a) => ({
          matchMode: a?.match_mode ?? a?.matchMode ?? "",
          strip: a?.strip ?? "",
          prepend: a?.prepend ?? "",
        }))
      : [{ matchMode: "", strip: "", prepend: "" }];

    return {
      index: (index + 1).toString(),
      trunk_id: trunkId,
      username: item?.username ?? "",
      context: item?.context ?? "",
      allow_codecs,
      expire_in_sec,
      provider: stripSipPrefix(item?.trunk_ip_domain ?? item?.provider ?? ""),
      password: item?.password ?? "",
      sip_header: stripSipPrefix(item?.sip_header ?? ""),
      "Domain name": item?.["Domain name"] ?? item?.from_domain ?? "",
      "Contact User": item?.["Contact User"] ?? item?.contact_user ?? "",
      "Outbound Proxy": stripSipPrefix(
        item?.["Outbound Proxy"] ?? item?.outbound_proxy ?? "",
      ),
      server_domain: stripSipPrefix(item?.server_domain ?? ""),
      client_domain: stripSipPrefix(item?.client_domain ?? ""),
      auth_username:
        item?.auth_username ?? item?.auth_user ?? item?.authUser ?? "",
      from_user: item?.from_user ?? "",
      identity_ip: item?.identity_ip ?? "",
      registerStatus: registerStatus || "",
      ui_country,
      ui_transport,
      ui_enable_srtp,
      ui_register,
      ui_reg_fail_retry: String(item?.reg_fail_retry ?? ""),
      ui_match_username,
      ui_enable_proxy,
      ui_proxy_ip: stripSipPrefix(outboundProxyVal),
      ui_outbound_cid_source,
      ui_show_outbound_cid_name,
      ui_outbound_cid_name: item?.outbound_cid_name ?? "",
      ui_outbound_cid_number: item?.outbound_cid_number ?? "",
      ui_record,
      ui_enabled,
      ui_eth_port: eth_port,
      ui_trunk_type: item?.trunk_type ?? "sip",
      ui_get_called_id_type: advance?.get_called_id_type ?? "",
      ui_options_interval: advance?.options_interval_s ?? "",
      ui_tx_volume: String(advance?.tx_volume ?? "0"),
      ui_rx_volume: String(advance?.rx_volume ?? "0"),
      ui_send_privacy_id,
      ui_sip_force_contact: advance?.sip_force_contact ?? "",
      ui_p_preferred_identity: advance?.p_preferred_identity ?? "None",
      ui_p_asserted_identity: advance?.p_asserted_identity ?? "None",
      ui_remote_party_id: advance?.remote_party_id ?? "None",
      ui_contact_mode,
      ui_limit_max_calls: String(advance?.limit_max_calls ?? "0"),
      ui_enable_early_session,
      ui_enable_early_media,
      ui_user_phone: toBool(advance?.user_phone),
      ui_call_timeout: String(advance?.call_timeout_s ?? "30"),
      ui_max_call_duration: String(advance?.max_call_duration_s ?? "6000"),
      ui_dnis: toBool(advance?.dnis),
      ui_dtmf_transmit: advance?.dtmf_transmit_mode ?? "RFC2833",
      dodRows,
      adaptRows,
    };
  });
};

export const transformUiToApi = (uiData, dodRows, adaptRows) => {
  const toLowerYesNo = (v) => (v === "Yes" ? "yes" : "no");
  const toYesNoBool = (v) => v === "Yes";

  const selectedCodecsSet = new Set(
    (uiData.allow_codecs || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const codecs = {};
  SIP_REGISTER_CODEC_OPTIONS.forEach((c) => {
    codecs[c.value] = selectedCodecsSet.has(c.value);
  });

  const outboundCallerId =
    uiData.ui_outbound_cid_source === "Register Name"
      ? "register_name"
      : "transparent_caller";

  const contact =
    uiData.ui_contact_mode === "Trunk User Name"
      ? "trunk_username"
      : "extension_number";

  const advance = {
    get_called_id_type: uiData.ui_get_called_id_type ?? "",
    options_interval_s: uiData.ui_options_interval ?? "",
    tx_volume: uiData.ui_tx_volume ?? "0",
    rx_volume: uiData.ui_rx_volume ?? "0",
    send_privacy_id: toLowerYesNo(uiData.ui_send_privacy_id),
    sip_force_contact: uiData.ui_sip_force_contact ?? "",
    p_preferred_identity: uiData.ui_p_preferred_identity ?? "None",
    p_asserted_identity: uiData.ui_p_asserted_identity ?? "None",
    remote_party_id: uiData.ui_remote_party_id ?? "None",
    contact,
    limit_max_calls: uiData.ui_limit_max_calls ?? "0",
    enable_early_session: toLowerYesNo(uiData.ui_enable_early_session),
    enable_early_media: toLowerYesNo(uiData.ui_enable_early_media),
    user_phone: !!uiData.ui_user_phone,
    call_timeout_s: uiData.ui_call_timeout ?? "30",
    max_call_duration_s: uiData.ui_max_call_duration ?? "6000",
    dnis: !!uiData.ui_dnis,
    dtmf_transmit_mode: uiData.ui_dtmf_transmit ?? "RFC2833",
  };

  const dod = (dodRows || []).map((row) => ({
    dod_name: row.dodName ?? "",
    dod_number: row.dodNumber ?? "",
    extensions: Array.isArray(row.bindExtensions)
      ? row.bindExtensions.map(String)
      : [],
  }));

  const adapt_callerid = (adaptRows || []).map((row) => ({
    match_mode: row.matchMode ?? "",
    strip: row.strip ?? "",
    prepend: row.prepend ?? "",
  }));

  return {
    trunk_id: uiData.trunk_id,
    trunk_name: uiData.trunk_id,
    country: uiData.ui_country,
    transport: String(uiData.ui_transport || "udp").toUpperCase(),
    enable_srtp: !!uiData.ui_enable_srtp,
    register: uiData.ui_register === "Yes" ? "yes" : "no",
    username: uiData.username ?? "",
    auth_username: uiData.auth_username ?? "",
    password: uiData.password ?? "",
    reg_fail_retry: uiData.ui_reg_fail_retry ?? 30,
    expire_seconds:
      uiData.ui_register === "No" ? 0 : (uiData.expire_in_sec ?? 1800),
    match_username: toYesNoBool(uiData.ui_match_username),
    enable_proxy: !!uiData.ui_enable_proxy,
    proxy_ip: uiData.ui_proxy_ip ?? "",
    trunk_ip_domain: uiData.provider ?? "",
    outbound_callerid: outboundCallerId,
    show_outbound_cid_name: !!uiData.ui_show_outbound_cid_name,
    outbound_cid_name: uiData.ui_outbound_cid_name ?? "",
    outbound_cid_number: uiData.ui_outbound_cid_number ?? "",
    recording: toLowerYesNo(uiData.ui_record),
    enabled: uiData.ui_enabled === "Yes",
    eth_port: uiData.ui_eth_port ?? "ETH0",
    context: uiData.context ?? "",
    from_user: uiData.from_user ?? "",
    codecs,
    advance,
    dod,
    adapt_callerid,
  };
};
