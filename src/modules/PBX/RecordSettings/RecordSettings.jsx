import React, { useState, useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { listIvrDestinations } from "../../../api/apiService";
const PBX_COMPACT_MQ = "(max-width: 768px)";

// ── Local page UI (aligned with FeatureCodePage / pbxSharedUi) ──
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  sectionBlue: "#1976d2",
};
const fieldInteraction = {
  onFocus: (e) => { e.target.style.borderColor = OUTLINED_FOCUS; e.target.style.boxShadow = `0 0 0 1px ${OUTLINED_FOCUS}`; },
  onBlur: (e) => { e.target.style.borderColor = OUTLINED_BORDER; e.target.style.boxShadow = "none"; },
  onMouseEnter: (e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "rgba(0,0,0,0.87)"; },
  onMouseLeave: (e) => { if (document.activeElement !== e.target) { e.target.style.borderColor = OUTLINED_BORDER; e.target.style.boxShadow = "none"; } },
};
const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </button>
  );
};

const sipPcmFormPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const sipPcmFormPageInnerStyle = {
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
};

const sipPcmFormCardStyle = {
  background: "#ffffff",
  borderRadius: 10,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmFormHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const sipPcmAuthFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  padding: "10px 20px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const sipPcmAuthFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const PbxBreadcrumb = ({ section, current }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";
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

const sipPcmAuthInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

const SIP_PCM_AUTH_FIELD_WIDTH = 260;
const SIP_PCM_FORM_FIELD_HEIGHT = 32;

const GRID_LABEL_STYLE = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  width: 320,
  marginRight: 10,
  lineHeight: 1.4,
  flexShrink: 0,
};

const GRID_INPUT_STYLE = {
  borderRadius: 4,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 12,
  width: SIP_PCM_AUTH_FIELD_WIDTH,
  maxWidth: SIP_PCM_AUTH_FIELD_WIDTH,
  backgroundColor: "#ffffff",
  outline: "none",
  color: "#3E5475",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
  height: SIP_PCM_FORM_FIELD_HEIGHT,
  minHeight: SIP_PCM_FORM_FIELD_HEIGHT,
  padding: "0 12px",
  lineHeight: `${SIP_PCM_FORM_FIELD_HEIGHT - 2}px`,
  textAlign: "left",
};

const pbxDualListLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#3E5475",
  textAlign: "center",
  marginBottom: 8,
};

const pbxDualListSelectStyle = {
  width: "100%",
  height: 160,
  border: `1px solid ${C.cardBorder}`,
  background: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  overflowY: "auto",
};

const pbxDualListBtnStyle = {
  height: 36,
  width: "100%",
  border: "1px solid #6b7280",
  backgroundColor: "#d9dde3",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "block",
  boxSizing: "border-box",
  textAlign: "center",
};

const PbxDualListBtn = ({ onClick, title, children, reorder = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    style={{
      ...pbxDualListBtnStyle,
      fontWeight: reorder ? 400 : 600,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#d9dde3";
    }}
  >
    {children}
  </button>
);

const PROMPT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "default", label: "Default" },
  { value: "blank", label: "Blank" },
  { value: "busy", label: "Busy" },
  { value: "thankyou", label: "Thankyou" },
  { value: "welcome", label: "WELCOME" },
];

const FORM_FIELDS = [
  {
    key: "internalPrompt",
    label: "Internal Call Being Recorded Prompt",
    tooltip: "The prompt that will be played to both the caller and the callee before the recording of internal calls. The default setting in None.",
    options: PROMPT_OPTIONS,
    defaultValue: "none",
  },
  {
    key: "outboundInboundPrompt",
    label: "Outbound/Inbound Calls Being Recorded Prompt",
    tooltip: "The prompt that will be played to both the caller and the callee before the recording of outbound or inbound calls. The default setting in None.",
    options: PROMPT_OPTIONS,
    defaultValue: "none",
  },
  {
    key: "recordStart",
    label: "Record Start",
    tooltip: `Set recordind time, recording time can be set after ringback of after answer, default is after answer.`,
    options: [
      { value: "after_media", label: "After Media" },
      { value: "after_answer", label: "After Answer" },
    ],
    defaultValue: "after_media",
  },
  {
    key: "recordMode",
    label: "Record Mode",
    tooltip: `Record mode, default is recording on one side: recording on one side: just one recording is profuced for a talk: recording on both side: two recording files are produced for a talk.`,
    options: [
      { value: "both", label: "Recording On both side" },
      { value: "one", label: "Recording On one side" },
    
    ],
    defaultValue: "both",
  },
  {
    key: "recordDirection",
    label: "Record Direction",
    tooltip: `The direction of recording,default is incoming and outgoing recording: outgoing and incoming wrote to a recording file, incoming: just incoming wrote to a recording file: outgoing: just outgoing wrote to a recording file.`,
    options: [
      {
        value: "both",
        label: "Incoming and Outgoing Recording",
      },
      { value: "incoming", label: "Incoming Recording" },
      { value: "outgoing", label: "Outgoing Recording" },
    ],
    defaultValue: "both",
  },
  {
    key: "recordSampleRate",
    label: "Record Sample Rate",
    tooltip: `The sample rate of the recording, default is 8000.`,
    options: [
      { value: "8000", label: "8000" },
      { value: "16000", label: "16000" },
    ],
    defaultValue: "8000",
  },
  {
    key: "recordingFileFormat",
    label: "Recording File Format",
    tooltip: `The format of the recording file, default is WAV.`,
    options: [
      { value: "wav", label: "WAV" },
     
      { value: "mp3", label: "MP3" },
    ],
    defaultValue: "wav",
  },

  {
    key: "recordpath",
    label: "Record Path",
    tooltip: "The path to the recording file, default is local.",
    type: "text",
    defaultValue: "",
  },
];

const MOCK_TRUNKS = [
  
];

const MOCK_EXTENSIONS = [

];

const MOCK_CONFERENCES = [];

const buildInitialForm = () => {
  const form = {};
  FORM_FIELDS.forEach((field) => {
    form[field.key] = field.defaultValue;
  });
  return form;
};

const RecordDualList = ({ available, selected, onChange, isCompact }) => {
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);

  const availableList = available.filter((item) => !selected.includes(item));

  const addSelected = () => {
    if (!availableSelected.length) return;
    onChange([
      ...selected,
      ...availableSelected.filter((item) => !selected.includes(item)),
    ]);
    setAvailableSelected([]);
  };

  const addAll = () => {
    onChange([
      ...selected,
      ...availableList.filter((item) => !selected.includes(item)),
    ]);
    setAvailableSelected([]);
  };

  const removeSelected = () => {
    if (!chosenSelected.length) return;
    onChange(selected.filter((item) => !chosenSelected.includes(item)));
    setChosenSelected([]);
  };

  const removeAll = () => {
    onChange([]);
    setChosenSelected([]);
  };

  const moveToBottom = () => {
    if (!chosenSelected.length) return;
    onChange([
      ...selected.filter((item) => !chosenSelected.includes(item)),
      ...selected.filter((item) => chosenSelected.includes(item)),
    ]);
  };

  const moveUp = () => {
    if (!chosenSelected.length) return;
    onChange(
      (() => {
        const arr = [...selected];
        for (let i = 1; i < arr.length; i++) {
          if (
            chosenSelected.includes(arr[i]) &&
            !chosenSelected.includes(arr[i - 1])
          ) {
            [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
          }
        }
        return arr;
      })(),
    );
  };

  const moveDown = () => {
    if (!chosenSelected.length) return;
    onChange(
      (() => {
        const arr = [...selected];
        for (let i = arr.length - 2; i >= 0; i--) {
          if (
            chosenSelected.includes(arr[i]) &&
            !chosenSelected.includes(arr[i + 1])
          ) {
            [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          }
        }
        return arr;
      })(),
    );
  };

  const moveToTop = () => {
    if (!chosenSelected.length) return;
    onChange([
      ...selected.filter((item) => chosenSelected.includes(item)),
      ...selected.filter((item) => !chosenSelected.includes(item)),
    ]);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isCompact
        ? "1fr"
        : "1fr 48px 1fr 48px",
        gap: 12,
      }}
    >
      <div>
        <div style={pbxDualListLabelStyle}>Available</div>
        <select
          multiple
          size={6}
          value={availableSelected}
          onChange={(e) =>
            setAvailableSelected(
              Array.from(e.target.selectedOptions, (o) => o.value),
            )
          }
          style={pbxDualListSelectStyle}
        >
         {availableList.map((item) => (
  <option
    key={item.value}
    value={item.value}
  >
    {item.label}
  </option>
))}
        </select>
      </div>

      {!isCompact && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            paddingTop: 28,
          }}
        >
          <PbxDualListBtn onClick={addSelected}>&gt;</PbxDualListBtn>
          <PbxDualListBtn onClick={addAll}>&gt;&gt;</PbxDualListBtn>
          <PbxDualListBtn onClick={removeSelected}>&lt;</PbxDualListBtn>
          <PbxDualListBtn onClick={removeAll}>&lt;&lt;</PbxDualListBtn>
        </div>
      )}

      <div>
        <div style={pbxDualListLabelStyle}>Selected</div>
        <select
          multiple
          size={6}
          value={chosenSelected}
          onChange={(e) =>
            setChosenSelected(
              Array.from(e.target.selectedOptions, (o) => o.value),
            )
          }
          style={pbxDualListSelectStyle}
        >
          {selected.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {!isCompact && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            paddingTop: 28,
          }}
        >
          <PbxDualListBtn reorder title="Move to bottom" onClick={moveToBottom}>
            vv
          </PbxDualListBtn>
          <PbxDualListBtn reorder title="Move up" onClick={moveUp}>
            ^
          </PbxDualListBtn>
          <PbxDualListBtn reorder title="Move down" onClick={moveDown}>
            v
          </PbxDualListBtn>
          <PbxDualListBtn reorder title="Move to top" onClick={moveToTop}>
            ^^
          </PbxDualListBtn>
        </div>
      )}
    </div>
  );
};

const PBX_MODAL_SECTION_HEADING_COLOR = "#30415A";

const PbxModalSectionHeading = ({ title, isFirst = false, onClick, expanded }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      margin: isFirst ? "0 0 24px 0" : "16px 0 24px 0",
      position: "relative",
      width: "100%",
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      fontFamily: "inherit",
      textAlign: "left",
    }}
  >
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -12,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 14,
        fontWeight: 600,
        color: PBX_MODAL_SECTION_HEADING_COLOR,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontSize: 10,
          color: C.sectionBlue,
          transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.15s ease",
        }}
      >
        ▶
      </span>
      {title}
    </span>
  </button>
);

const CollapsibleSection = ({
  title,
  expanded,
  onToggle,
  available,
  selected,
  onChange,
  isCompact,
  isFirst = false,
}) => (
  <div style={{ marginBottom: 8, padding: "0 16px" }}>
    <PbxModalSectionHeading
      title={title}
      isFirst={isFirst}
      onClick={onToggle}
      expanded={expanded}
    />
    {expanded && (
      <RecordDualList
        available={available}
        selected={selected}
        onChange={onChange}
        isCompact={isCompact}
      />
    )}
  </div>
);

const RecordSettings = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [form, setForm] = useState(buildInitialForm);
  const [selectedTrunks, setSelectedTrunks] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [selectedConferences, setSelectedConferences] = useState([]);
  const [Destinations, setDestinations] = useState([]);

  const [expandedSections] = useState({
    trunks: true,
    extensions: true,
    conferences: true,
  });
  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [availableConferences, setAvailableConferences] = useState([]);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const data = await listIvrDestinations();
        setAvailableTrunks(data.message?.Trunks || []);
setAvailableExtensions(data.message?.Extensions || []);
setAvailableConferences(data.message?.Conferences || []);
console.log("Trunks:", availableTrunks);
console.log("Extensions:", availableExtensions);
console.log("Conferences:", availableConferences);

  
        console.log("Destinations:", data);
        console.log("Message:", data.message);
        console.log("Keys:", Object.keys(data.message || {}));
        setDestinations(data);
      } catch (error) {
        console.error("Failed to load destinations:", error);
      }
    };
  
    loadDestinations();
  }, []);
  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // const toggleSection = (key) =>
  //   setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      style={{
        ...sipPcmFormPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={sipPcmFormPageInnerStyle}>
        <PbxBreadcrumb section="Record Settings" current="Record Settings" />

        <div style={sipPcmFormCardStyle}>
          <div style={sipPcmFormHeaderStyle}>
            <span>Record Settings</span>
          </div>

          <div style={{ padding: "12px 20px 0", boxSizing: "border-box" }}>
            <div style={{ paddingBottom: 8 }}>
              {FORM_FIELDS.map((field) => (
                <div
                  key={field.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    gap: 12,
                    ...(isCompact
                      ? { flexDirection: "column", alignItems: "stretch" }
                      : {}),
                  }}
                >
<Tooltip
  title={field.tooltip || ""}
  arrow
  placement="top"
  slotProps={{
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: "13px",
        maxWidth: 500,
        p: 1.5,
      },
    },
    arrow: {
      sx: {
        color: "#fff",
        "&:before": {
          border: "1px solid #d1d5db",
        },
      },
    },
  }}
>
  <label style={GRID_LABEL_STYLE}>
    {field.label}
  </label>
</Tooltip>
                  <div
  style={{
    flex: isCompact ? undefined : 1,
    display: "flex",
    justifyContent: isCompact ? "stretch" : "flex-end",
    minWidth: 0,
  }}
>
{field.type === "text" ? (
  <input
    value={form[field.key]}
    onChange={(e) => handleChange(field.key, e.target.value)}
    style={GRID_INPUT_STYLE}
    {...fieldInteraction}
  />
) : (
  <select
    value={form[field.key]}
    onChange={(e) => handleChange(field.key, e.target.value)}
    style={GRID_INPUT_STYLE}
    {...fieldInteraction}
  >
    {field.options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
)}
                  </div>
                </div>
              ))}

              <CollapsibleSection
                title="Record Trunks"
                isFirst
                expanded={expandedSections.trunks}
                // onToggle={() => toggleSection("trunks")}
                available={availableTrunks}
                selected={selectedTrunks}
                onChange={setSelectedTrunks}
                isCompact={isCompact}
              />

              <CollapsibleSection
                title="Record Extensions"
                expanded={expandedSections.extensions}
                // onToggle={() => toggleSection("extensions")}
              available={availableExtensions}
                selected={selectedExtensions}
                onChange={setSelectedExtensions}
                isCompact={isCompact}
              />

              <CollapsibleSection
                title="Record Conferences"
                expanded={expandedSections.conferences}
                // onToggle={() => toggleSection("conferences")}
                available={availableConferences}
                selected={selectedConferences}
                onChange={setSelectedConferences}
                isCompact={isCompact}
              />
            </div>
          </div>

          <div style={sipPcmAuthFormFooterStyle}>
            <Btn variant="cancel" style={sipPcmAuthFormBtnStyle}>
              Set Storage
            </Btn>
            <Btn variant="primary" style={sipPcmAuthFormBtnStyle}>
              Save
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordSettings;
