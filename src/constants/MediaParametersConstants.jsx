export const FXS_VOIP_MEDIA_BREADCRUMB_ROOT = "FXS";
export const FXS_VOIP_MEDIA_BREADCRUMB_SECTION = "VoIP";
export const FXS_VOIP_MEDIA_PAGE_TITLE = "Media Parameters";
export const FXS_VOIP_MEDIA_CARD_TITLE = "Media Parameters";

export const FXS_VOIP_MEDIA_LEFT_SECTION_TITLE = "System Settings";
export const FXS_VOIP_MEDIA_RIGHT_SECTION_TITLE = "CODEC Priority";

export const FXS_VOIP_MEDIA_SAVE_LABEL = "Save";
export const FXS_VOIP_MEDIA_RESET_LABEL = "Reset";

/** Matches PBX main-page section headings */
export const FXS_VOIP_MEDIA_SECTION_HEADING_LEFT = -20;
export const FXS_VOIP_MEDIA_SECTION_HEADING_COLOR = "#30415A";

export const FXS_VOIP_MEDIA_CODEC_AVAILABLE_LABEL = "Available";
export const FXS_VOIP_MEDIA_CODEC_SELECTED_LABEL = "Selected";
export const FXS_VOIP_MEDIA_NOTE_LABEL = "Note:";

export const MEDIA_PARAMETERS_NOTE = `At present, the maximum number of concurrent sessions supported by G723 encoding is 9. When the concurrent sessions are more than 9, the encoding of the next priority will be automatically used (it is recommended to configure G711A/U as the encoding of the next priority).

The maximum number of concurrent sessions supported by AMR/iLBC encoding is 15. When the concurrent sessions are more than 15, the encoding of the next priority will be automatically used (it is recommended to configure G711A/U as the encoding of the next priority).`;



/** FXS VoIP Media Parameters page */

export const FXS_MEDIA_FIELD_TOOLTIPS = {

  dtmfTransmitMode:

    "Select how DTMF (touch-tone) digits are sent during a VoIP call.\n" +

    "RFC2833: DTMF is sent as named RTP events (default).\n" +

    "SIP INFO: DTMF is carried in SIP INFO messages.\n" +

    "In-band: DTMF is sent as audio inside the RTP stream.",



  rfc2833Payload:

    "The RTP payload type number used for RFC2833 DTMF events.\n" +

    "Required when DTMF Transmit Mode is RFC2833.\n" +

    "Valid range: 90–127. Default: 101.",



  rtpPortRange:

    "UDP port range used for RTP media, entered as start,end (for example 10000,20000).\n" +

    "Both values must be numbers between 2000 and 60000.\n" +

    "The starting port must be even, the range must span at least 480 ports, and SIP port 5060 must not fall inside the range.",



  silenceSuppression:

    "Enable or disable silence suppression (voice activity detection) to reduce bandwidth during silent periods on VoIP calls.",



  jitterMode:

    "Jitter buffer operating mode for incoming RTP audio.\n" +

    "Static Mode uses a fixed buffer size set in JitterBuffer(ms).",



  jitterBuffer:

    "Jitter buffer size in milliseconds when Static Mode is selected.\n" +

    "Valid range: 20–200 ms. Default: 100.",



  voiceGainOutput:

    "Adjusts voice output gain from the IP side in dB.\n" +

    "Valid range: -24 to +24 in steps of 3. Default: 0.",



  codecPriority:
    "Set audio codec negotiation priority for VoIP calls.\n" +
    "Move codecs from Available to Selected using > or >>; remove with < or <<.\n" +
    "Order in Selected list is priority (top = highest). Use ^, v, ^^, vv to reorder.\n" +
    "At least one codec must remain in Selected before saving.",
};


