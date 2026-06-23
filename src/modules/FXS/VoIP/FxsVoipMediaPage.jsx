import React, { useMemo, useState } from "react";
import { Alert } from "@mui/material";
import { MEDIA_PARAMETERS_NOTE } from "../../../constants/MediaParametersConstants";

// ── Local page UI (inlined from fxsSharedUi) ──
const C = {
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
};

const FXS_VOIP_MEDIA_PAGE_WRAP =
  "bg-[var(--bg-main)] min-h-[calc(100vh-80px)] p-[16px] box-border flex flex-col items-center";
const FXS_VOIP_MEDIA_PAGE_INNER = "w-full max-w-[1000px] mx-auto";
const FXS_VOIP_MEDIA_TABLE_CONTAINER =
  "w-full max-w-full mx-auto overflow-hidden rounded-[10px] border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_4px_20px_rgba(15,23,42,0.06)]";
const FXS_VOIP_MEDIA_BLUE_BAR =
  "flex w-full min-h-[44px] flex-wrap items-center justify-start gap-[12px] rounded-t-[10px] border-b border-[var(--border-strong)] bg-[var(--bg-surface)] px-[14px] py-[7px] text-[13px] font-bold text-[var(--text-label)]";
const FXS_VOIP_MEDIA_FORM_FOOTER =
  "flex w-full flex-wrap items-center justify-center gap-[12px] border-t border-[var(--border-strong)] box-border px-[20px] py-[10px]";

const BTN_FORM_PRIMARY =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";

const BTN_FORM_CANCEL =
  "inline-flex items-center justify-center box-border m-0 min-w-[110px] h-[34px] gap-[6px] px-[28px] py-0 rounded-[10px] text-[13px] font-semibold leading-[34px] whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "formPrimary",
  type,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={variant === "formCancel" ? BTN_FORM_CANCEL : BTN_FORM_PRIMARY}
  >
    {children}
  </button>
);

const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const FOCUS_RING_SHADOW = (color) => `0 0 0 1px ${color}`;

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW(OUTLINED_FOCUS);
};

const FXS_VOIP_MEDIA_FIELD_INTERACTION = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

const getFxsVoipMediaFieldInteraction = (disabled) =>
  disabled ? {} : FXS_VOIP_MEDIA_FIELD_INTERACTION;

const FXS_VOIP_MEDIA_INPUT_STYLE = {
  height: 28,
  width: 200,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "var(--bg-surface)",
  color: "var(--text-primary)",
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const FXS_VOIP_MEDIA_SELECT_STYLE = {
  width: FXS_VOIP_MEDIA_INPUT_STYLE.width,
  minHeight: 32,
  padding: "6px 28px 6px 8px",
  fontSize: FXS_VOIP_MEDIA_INPUT_STYLE.fontSize,
  lineHeight: 1.35,
  border: FXS_VOIP_MEDIA_INPUT_STYLE.border,
  borderRadius: FXS_VOIP_MEDIA_INPUT_STYLE.borderRadius,
  outline: FXS_VOIP_MEDIA_INPUT_STYLE.outline,
  backgroundColor: FXS_VOIP_MEDIA_INPUT_STYLE.backgroundColor,
  color: FXS_VOIP_MEDIA_INPUT_STYLE.color,
  boxSizing: FXS_VOIP_MEDIA_INPUT_STYLE.boxSizing,
  transition: FXS_VOIP_MEDIA_INPUT_STYLE.transition,
  appearance: "auto",
};

const FxsVoipMediaBreadcrumb = ({ current }) => (
  <div className="mb-[16px] flex flex-wrap items-center gap-[4px] text-[12px] font-normal text-[#94a3b8]">
    <span>FXS</span>
    <span>&gt;</span>
    <span>VoIP</span>
    <span>&gt;</span>
    <span className="font-semibold text-[#1e293b]">{current}</span>
  </div>
);

const FxsVoipMediaPageShell = ({ children, fullWidth = false }) => (
  <div className={FXS_VOIP_MEDIA_PAGE_WRAP}>
    <div
      className={
        fullWidth ? "w-full max-w-full mx-auto" : FXS_VOIP_MEDIA_PAGE_INNER
      }
    >
      {children}
    </div>
  </div>
);

const CODEC_PRIORITY_HEADING_COLOR = "#30415A";

const CODEC_OPTIONS = [
  { id: "6", label: "G711A" },
  { id: "7", label: "G711U" },
  { id: "131", label: "G729" },
  { id: "98", label: "iLBC" },
  { id: "96", label: "AMR" },
  { id: "4", label: "G723" },
];

const DEFAULT_SELECTED_CODECS = ["6", "7", "131", "98", "96", "4"];

const fxsVoipMediaDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "var(--bg-main)",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const FXS_VOIP_MEDIA_DUAL_LIST_BTN =
  "block box-border h-[36px] w-full m-0 p-0 border border-[#6b7280] bg-[#d9dde3] text-[#111827] text-[14px] font-semibold font-inherit leading-none text-center cursor-pointer hover:bg-[#c5cbd3]";

const FXS_VOIP_MEDIA_DUAL_LIST_BTN_REORDER =
  "block box-border h-[36px] w-full m-0 p-0 border border-[#6b7280] bg-[#d9dde3] text-[#111827] text-[14px] font-normal font-inherit leading-none text-center cursor-pointer hover:bg-[#c5cbd3]";

const FxsVoipMediaDualListBtn = ({ onClick, title, children, reorder }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={
      reorder
        ? FXS_VOIP_MEDIA_DUAL_LIST_BTN_REORDER
        : FXS_VOIP_MEDIA_DUAL_LIST_BTN
    }
  >
    {children}
  </button>
);

const CodecPrioritySectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: CODEC_PRIORITY_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

const FxsVoipMediaPage = () => {
  // Media Parameters state
  const [formData, setFormData] = useState({
    dtmfTransmitMode: "0", // 0=RFC2833, 1=SIP INFO, 2=In-band
    rfc2833Payload: "101",
    rtpPortRange: "10000,20000",
    silenceSuppression: "0", // 0=Disable, 1=Enable
    jitterMode: "0", // 0=Static Mode, 1=Adaptive Mode
    jitterBuffer: "100",
    voiceGainOutput: "0",
  });

  const [selectedCodecs, setSelectedCodecs] = useState(DEFAULT_SELECTED_CODECS);
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const codecLabelMap = useMemo(() => {
    const map = new Map();
    CODEC_OPTIONS.forEach((c) => map.set(c.id, c.label));
    return map;
  }, []);

  const getCodecLabel = (id) => codecLabelMap.get(id) || id;

  const availableCodecList = useMemo(
    () => CODEC_OPTIONS.filter((c) => !selectedCodecs.includes(c.id)),
    [selectedCodecs],
  );

  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSelectedCodecs = () => {
    if (!availableSelected.length) return;
    setSelectedCodecs((prev) => [
      ...prev,
      ...availableSelected.filter((id) => !prev.includes(id)),
    ]);
    setAvailableSelected([]);
  };

  const addAllCodecs = () => {
    setSelectedCodecs(CODEC_OPTIONS.map((c) => c.id));
    setAvailableSelected([]);
  };

  const removeSelectedCodecs = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) =>
      prev.filter((id) => !chosenSelected.includes(id)),
    );
    setChosenSelected([]);
  };

  const removeAllCodecs = () => {
    setSelectedCodecs([]);
    setChosenSelected([]);
  };

  const moveCodecToBottom = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) => {
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      return [...rest, ...chosen];
    });
  };

  const moveCodecUp = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length; i++) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i - 1])
        ) {
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        }
      }
      return arr;
    });
  };

  const moveCodecDown = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 2; i >= 0; i--) {
        if (
          chosenSelected.includes(arr[i]) &&
          !chosenSelected.includes(arr[i + 1])
        ) {
          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        }
      }
      return arr;
    });
  };

  const moveCodecToTop = () => {
    if (!chosenSelected.length) return;
    setSelectedCodecs((prev) => {
      const chosen = prev.filter((id) => chosenSelected.includes(id));
      const rest = prev.filter((id) => !chosenSelected.includes(id));
      return [...chosen, ...rest];
    });
  };

  const validateForm = () => {
    // Validate RFC2833 Payload
    if (!formData.rfc2833Payload) {
      alert("Please enter a RFC2833 load!");
      return false;
    }
    const rfc2833 = parseInt(formData.rfc2833Payload);
    if (rfc2833 < 90 || rfc2833 >= 128) {
      alert("The value range of 'RFC2833 Load' is 90~127!");
      return false;
    }

    // Validate RTP Port Range
    if (!formData.rtpPortRange) {
      alert("Please enter a RTP port range!");
      return false;
    }
    const portParts = formData.rtpPortRange.split(",");
    if (portParts.length !== 2) {
      alert("Invalid RTP port range!");
      return false;
    }
    const startPort = parseInt(portParts[0]);
    const endPort = parseInt(portParts[1]);
    if (isNaN(startPort) || isNaN(endPort)) {
      alert("'RTP Port' must be numbers!");
      return false;
    }
    if (startPort < 2000 || endPort > 60000) {
      alert("The value range of 'RTP Port' is 2000~60000!");
      return false;
    }
    if (5060 >= startPort && 5060 <= endPort) {
      alert("The SIP port value 5060 cannot be within the port range!");
      return false;
    }
    if (startPort % 2 !== 0) {
      alert("The starting port number must be an even!");
      return false;
    }
    if (endPort - startPort < 480) {
      alert(
        "The difference between the latter 'RTP Port' and the former should be no less than 480!",
      );
      return false;
    }

    // Validate JitterBuffer
    if (formData.jitterMode === "0") {
      if (!formData.jitterBuffer) {
        alert("Please enter a JitterBuffer value!");
        return false;
      }
      const jitterBuffer = parseInt(formData.jitterBuffer);
      if (jitterBuffer < 20 || jitterBuffer > 200) {
        alert("The value range of 'JitterBuffer' is 20~200!");
        return false;
      }
    }

    // Validate Voice Gain Output
    const voiceGain = parseInt(formData.voiceGainOutput);
    if (isNaN(voiceGain) || voiceGain < -24 || voiceGain > 24) {
      alert("The value range of 'Voice Gain Output from IP' is -24~24!");
      return false;
    }
    if (voiceGain % 3 !== 0) {
      alert(
        "The value of 'Voice Gain Output from IP' must be a multiple of 3!",
      );
      return false;
    }

    if (selectedCodecs.length === 0) {
      alert("Please select a CODEC!");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      alert("Settings saved successfully!");
    }
  };

  const handleReset = () => {
    setFormData({
      dtmfTransmitMode: "0",
      rfc2833Payload: "101",
      rtpPortRange: "10000,20000",
      silenceSuppression: "0",
      jitterMode: "0",
      jitterBuffer: "100",
      voiceGainOutput: "0",
    });
    setSelectedCodecs([...DEFAULT_SELECTED_CODECS]);
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    // Allow digits (48-57), comma (44), minus (45), backspace (8)
    if (type === "number") {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-comma") {
      if (!((key > 47 && key < 58) || key === 44 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-minus") {
      if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
        e.preventDefault();
      }
    }
  };

  const fieldStyle = {
    ...FXS_VOIP_MEDIA_INPUT_STYLE,
    width: 220,
  };

  const fieldSelectStyle = {
    ...FXS_VOIP_MEDIA_SELECT_STYLE,
    width: 220,
  };

  const getFieldInteraction = (disabled = false) =>
    getFxsVoipMediaFieldInteraction(disabled);

  const labelColStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    flex: "0 0 48%",
    maxWidth: "48%",
    paddingRight: 24,
    textAlign: "left",
    lineHeight: 1.35,
  };

  const valueColStyle = {
    flex: "1 1 52%",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  const controlSlotStyle = {
    width: 220,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  const mediaParameterRows = [
    {
      label: "DTMF Transmit Mode",
      type: "select",
      name: "dtmfTransmitMode",
      options: [
        { value: "0", label: "RFC2833" },
        { value: "1", label: "SIP INFO" },
        { value: "2", label: "In-band" },
      ],
    },
    {
      label: "RFC2833 Payload",
      type: "text",
      name: "rfc2833Payload",
      keyPress: "number",
    },
    {
      label: "RTP Port Range",
      type: "text",
      name: "rtpPortRange",
      keyPress: "number-comma",
    },
    {
      label: "Silence Suppression",
      type: "select",
      name: "silenceSuppression",
      options: [
        { value: "0", label: "Disable" },
        { value: "1", label: "Enable" },
      ],
    },
    {
      label: "JitterMode",
      type: "select",
      name: "jitterMode",
      options: [{ value: "0", label: "Static Mode" }],
    },
    {
      label: "JitterBuffer(ms)",
      type: "text",
      name: "jitterBuffer",
      keyPress: "number",
    },
    {
      label: "Voice Gain Output from IP (dB)",
      type: "text",
      name: "voiceGainOutput",
      keyPress: "number-minus",
    },
  ];

  return (
    <FxsVoipMediaPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <FxsVoipMediaBreadcrumb current="Media Parameters" />
      <div
        className={FXS_VOIP_MEDIA_TABLE_CONTAINER}
        style={{ marginBottom: 0 }}
      >
        <div className={FXS_VOIP_MEDIA_BLUE_BAR}>
          <span>Media Parameters</span>
        </div>
        <div style={{ padding: "24px 32px 0" }}>
          <div style={{ marginBottom: 12 }}>
            <div
              className="flex flex-col gap-3"
              style={{
                width: "100%",
                maxWidth: 640,
                margin: "0 auto",
              }}
            >
              {mediaParameterRows.map((row) => (
                <div
                  key={row.name}
                  className="flex flex-row items-start w-full"
                >
                  <label style={labelColStyle}>{row.label}</label>
                  <div style={valueColStyle}>
                    <div style={controlSlotStyle}>
                      {row.type === "select" ? (
                        <select
                          name={row.name}
                          value={formData[row.name]}
                          onChange={handleInputChange}
                          style={fieldSelectStyle}
                          {...FXS_VOIP_MEDIA_FIELD_INTERACTION}
                        >
                          {row.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name={row.name}
                          value={formData[row.name]}
                          onChange={handleInputChange}
                          onKeyPress={(e) =>
                            handleKeyPress(e, row.keyPress || "number")
                          }
                          style={fieldStyle}
                          {...FXS_VOIP_MEDIA_FIELD_INTERACTION}
                          maxLength="31"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CODEC Priority — Available / Selected (Inbound Member Trunks style) */}
            <div style={{ width: "100%", marginTop: 16 }}>
              <CodecPrioritySectionHeading title="CODEC Priority" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 48px 1fr 48px",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    Available
                  </div>
                  <select
                    multiple
                    size={6}
                    value={availableSelected}
                    onChange={(e) =>
                      setAvailableSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={fxsVoipMediaDualListSelectStyle}
                  >
                    {availableCodecList.length === 0 ? (
                      <option disabled value="">
                        No codecs
                      </option>
                    ) : (
                      availableCodecList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <FxsVoipMediaDualListBtn onClick={addSelectedCodecs}>
                    &gt;
                  </FxsVoipMediaDualListBtn>
                  <FxsVoipMediaDualListBtn onClick={addAllCodecs}>
                    &gt;&gt;
                  </FxsVoipMediaDualListBtn>
                  <FxsVoipMediaDualListBtn onClick={removeSelectedCodecs}>
                    &lt;
                  </FxsVoipMediaDualListBtn>
                  <FxsVoipMediaDualListBtn onClick={removeAllCodecs}>
                    &lt;&lt;
                  </FxsVoipMediaDualListBtn>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    Selected
                  </div>
                  <select
                    multiple
                    size={6}
                    value={chosenSelected}
                    onChange={(e) =>
                      setChosenSelected(
                        Array.from(
                          e.target.selectedOptions,
                          (opt) => opt.value,
                        ),
                      )
                    }
                    style={fxsVoipMediaDualListSelectStyle}
                  >
                    {selectedCodecs.length === 0 ? (
                      <option disabled value="">
                        No selected codecs
                      </option>
                    ) : (
                      selectedCodecs.map((id) => (
                        <option key={id} value={id}>
                          {getCodecLabel(id)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingTop: 28,
                  }}
                >
                  <FxsVoipMediaDualListBtn
                    reorder
                    title="Move to bottom"
                    onClick={moveCodecToBottom}
                  >
                    vv
                  </FxsVoipMediaDualListBtn>
                  <FxsVoipMediaDualListBtn
                    reorder
                    title="Move up"
                    onClick={moveCodecUp}
                  >
                    ^
                  </FxsVoipMediaDualListBtn>
                  <FxsVoipMediaDualListBtn
                    reorder
                    title="Move down"
                    onClick={moveCodecDown}
                  >
                    v
                  </FxsVoipMediaDualListBtn>
                  <FxsVoipMediaDualListBtn
                    reorder
                    title="Move to top"
                    onClick={moveCodecToTop}
                  >
                    ^^
                  </FxsVoipMediaDualListBtn>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-0 w-full">
              <CodecPrioritySectionHeading title="Note:" />
              <div
                style={{
                  width: "100%",
                  maxWidth: 860,
                  margin: "0 auto",
                  padding: "0 8px",
                  boxSizing: "border-box",
                }}
              >
                {MEDIA_PARAMETERS_NOTE.split("\n")
                  .filter(Boolean)
                  .map((line, index) => (
                    <p
                      key={index}
                      style={{
                        margin: 0,
                        color: C.mutedText,
                        fontSize: 11,
                        lineHeight: 1.45,
                        whiteSpace: "normal",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        textAlign: "left",
                      }}
                    >
                      {line}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className={FXS_VOIP_MEDIA_FORM_FOOTER}>
          <Btn type="button" onClick={handleSave} variant="formPrimary">
            Save
          </Btn>
          <Btn type="button" onClick={handleReset} variant="formCancel">
            Reset
          </Btn>
        </div>
      </div>
    </FxsVoipMediaPageShell>
  );
};

export default FxsVoipMediaPage;
