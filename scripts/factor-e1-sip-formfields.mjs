#!/usr/bin/env node
/**
 * Extract SipSip + SipMedia FormFields from monoliths and write thin pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SIP = path.join(ROOT, "src/modules/E1-PRI/SIP");

function write(rel, content) {
  const full = path.join(SIP, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel, content.split("\n").length, "lines");
}

function readLines(file) {
  return fs
    .readFileSync(path.join(SIP, file), "utf8")
    .replace(/\r\n/g, "\n")
    .split("\n");
}

// ── SipSip FormFields: extract UI pieces from original ──
{
  const lines = readLines("SipSipPage.jsx");

  // Build FormFields by composing extracted pieces with chrome Btn
  // We take native field interaction, SipFieldRow, section heading, scrollbar, breadcrumb, shell
  // from original lines and adapt.

  const formFields = `import React from "react";
import { Checkbox, Tooltip, useMediaQuery } from "@mui/material";
import {
  SIP_SIP_FIELDS,
  SIP_SIP_NOTE,
  SIP_SIP_FIELD_TOOLTIPS,
  SIP_SIP_BREADCRUMB_ROOT,
  SIP_SIP_BREADCRUMB_SECTION,
  SIP_SIP_PAGE_TITLE,
  SIP_SIP_SECTION_NETWORK,
  SIP_SIP_SECTION_REGISTRATION,
  SIP_SIP_NOTE_LABEL,
  SIP_SIP_CHECKBOX_ENABLE,
  SIP_SIP_RADIO_YES,
  SIP_SIP_RADIO_NO,
  SIP_SIP_PLACEHOLDER_CALLED_PREFIX,
  SIP_SIP_LABEL_EXTERNAL_BOUND,
} from "../../../../constants/SipSipConstants";
import { Btn, OUTLINED_BORDER, OUTLINED_HOVER, OUTLINED_FOCUS, FOCUS_RING_SHADOW } from "../../e1PriChrome";
import {
  SIP_NETWORK_SECTION_FIELDS,
  SIP_REGISTRATION_SECTION_FIELDS,
  isSipSipFieldVisible,
} from "../utils/SipSipTransformers";
import {
  isValidSipSipCalledPrefixInput,
  isValidSipSipDigitInput,
} from "../utils/SipSipValidators";
import {
  C,
  CARD_RADIUS,
  FIELD_RADIUS,
  SIP_SIP_COMPACT_MQ,
  SIP_SIP_SCROLL_CLASS,
  SIP_SIP_SECTION_HEADING_LEFT,
  SIP_SIP_LABEL_COL_WIDTH,
  SIP_SIP_CONTROL_COL_WIDTH,
  SIP_SIP_FIELD_COL_GAP,
  SIP_SIP_LAPTOP_NARROW_MQ,
  sipFormTextStyle,
  advancedPageWrapStyle,
  advancedPageInnerStyle,
  valueColStyle,
  controlSlotStyle,
  checkboxSx,
  nativeRadioStyle,
  sipSipDashboardGridStyle,
  sipSipColumnStyle,
  sipSipDividerCellStyle,
  sipSipDividerLineStyle,
  dashboardFieldsStackStyle,
  formBodyStyle,
} from "./SipSipTableHelpers";

export { Btn as SipSipBtn };
export { SIP_SIP_COMPACT_MQ };

const SIP_SIP_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text
    .replace(/<br\\s*\\/?>/gi, "\\n")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  if (normalized.includes("\\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

export const SipFieldRow = ({
  label,
  tooltipKey,
  children,
  labelStyle = {},
  labelColWidth = SIP_SIP_LABEL_COL_WIDTH,
}) => {
  const tooltip = tooltipKey ? SIP_SIP_FIELD_TOOLTIPS[tooltipKey] || "" : "";
  const labelNode = (
    <label
      style={{
        ...sipFormTextStyle,
        fontWeight: 600,
        flex: "0 0 auto",
        width: "100%",
        maxWidth: "100%",
        paddingRight: 0,
        textAlign: "left",
        lineHeight: 1.4,
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        cursor: tooltip ? "help" : undefined,
        ...labelStyle,
      }}
    >
      {label}
    </label>
  );

  const labelWrapStyle = {
    flex: \`0 0 \${labelColWidth}px\`,
    width: labelColWidth,
    maxWidth: labelColWidth,
    minWidth: labelColWidth,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        minHeight: 36,
        gap: SIP_SIP_FIELD_COL_GAP,
      }}
    >
      <div style={labelWrapStyle}>
        {tooltip ? (
          <Tooltip
            title={formatFieldTooltipTitle(tooltip)}
            {...SIP_SIP_TOOLTIP_PROPS}
          >
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      {children}
    </div>
  );
};

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
  el.style.boxShadow =
    typeof FOCUS_RING_SHADOW === "function"
      ? FOCUS_RING_SHADOW()
      : FOCUS_RING_SHADOW;
};

export const nativeFieldInteraction = {
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

export const fieldInputStyle = {
  height: 32,
  width: SIP_SIP_CONTROL_COL_WIDTH,
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  maxWidth: SIP_SIP_CONTROL_COL_WIDTH,
  padding: "0 10px",
  fontSize: 13,
  border: \`1px solid \${OUTLINED_BORDER}\`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.labelText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const fieldSelectStyle = {
  width: SIP_SIP_CONTROL_COL_WIDTH,
  minWidth: SIP_SIP_CONTROL_COL_WIDTH,
  maxWidth: SIP_SIP_CONTROL_COL_WIDTH,
  minHeight: 32,
  height: 32,
  padding: "4px 28px 4px 10px",
  fontSize: 13,
  lineHeight: 1.35,
  border: \`1px solid \${OUTLINED_BORDER}\`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#fff",
  color: C.labelText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  appearance: "auto",
  cursor: "pointer",
};

export const SipSipSectionHeading = ({ title, isFirst = false }) => {
  const isLaptopNarrow = useMediaQuery(SIP_SIP_LAPTOP_NARROW_MQ);
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "20px 0 24px 0"
            : "12px 0 24px 0"
          : "28px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: \`1px solid \${C.divider}\` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: isLaptopNarrow ? 0 : SIP_SIP_SECTION_HEADING_LEFT,
          background: C.cardBg,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: C.sectionHeading,
        }}
      >
        {title}
      </span>
    </div>
  );
};

export const SipSipScrollbarStyles = () => (
  <style>{\`
    .\${SIP_SIP_SCROLL_CLASS} {
      scroll-behavior: smooth;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
    }
    .\${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      transition: width 0.2s ease, height 0.2s ease;
    }
    .\${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar:hover {
      width: 11px;
      height: 11px;
    }
    .\${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-corner {
      background: transparent;
    }
    .\${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-track {
      background: transparent;
    }
    .\${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-thumb {
      background-color: rgba(100, 116, 139, 0.45);
      border-radius: 6px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background-color 0.2s ease;
    }
    .\${SIP_SIP_SCROLL_CLASS}::-webkit-scrollbar-thumb:hover {
      background-color: rgba(71, 85, 105, 0.65);
    }
  \`}</style>
);

export const SipSipBreadcrumb = () => (
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
      flexShrink: 0,
      width: "100%",
    }}
  >
    <span>{SIP_SIP_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{SIP_SIP_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{SIP_SIP_PAGE_TITLE}</span>
  </div>
);

export const AdvancedPageShell = ({ children, isCompact }) => (
  <div
    className={SIP_SIP_SCROLL_CLASS}
    style={{
      ...advancedPageWrapStyle,
      ...(isCompact ? { padding: 8 } : {}),
    }}
    data-native-scroll
  >
    <div style={advancedPageInnerStyle}>{children}</div>
  </div>
);

export const renderSipSipFormField = ({
  field,
  form,
  isCompact,
  handleChange,
  handleCheckbox,
  isFieldVisible,
}) => {
  if (!isFieldVisible(field)) return null;

  const fieldLabel =
    field.key === "externalBound"
      ? SIP_SIP_LABEL_EXTERNAL_BOUND
      : field.label;

  const labelColWidth = isCompact ? 160 : SIP_SIP_LABEL_COL_WIDTH;

  return (
    <SipFieldRow
      key={field.key}
      label={fieldLabel}
      tooltipKey={field.key}
      labelColWidth={labelColWidth}
      labelStyle={
        field.key === "externalBound" ? { whiteSpace: "normal" } : {}
      }
    >
      <div style={valueColStyle}>
        <div style={controlSlotStyle}>
          {field.type === "text" && (
            <input
              type={field.key === "calledPrefix" ? "text" : "number"}
              value={form[field.key]}
              style={fieldInputStyle}
              {...nativeFieldInteraction}
              onChange={(e) => {
                const value = e.target.value;
                if (field.key === "calledPrefix") {
                  if (isValidSipSipCalledPrefixInput(value)) {
                    handleChange(field.key, value);
                  }
                } else if (isValidSipSipDigitInput(value)) {
                  handleChange(field.key, value);
                }
              }}
              placeholder={
                field.key === "calledPrefix"
                  ? SIP_SIP_PLACEHOLDER_CALLED_PREFIX
                  : ""
              }
            />
          )}

          {field.type === "select" && (
            <select
              value={form[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              style={fieldSelectStyle}
              {...nativeFieldInteraction}
            >
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {field.type === "checkbox" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 32,
                gap: 8,
                width: SIP_SIP_CONTROL_COL_WIDTH,
                justifyContent: "flex-start",
              }}
            >
              <Checkbox
                size="small"
                checked={!!form[field.key]}
                onChange={() => handleCheckbox(field.key)}
                sx={checkboxSx}
              />
              {field.key === "workingPeriod" ? (
                field.labelAfter && (
                  <span style={sipFormTextStyle}>{field.labelAfter}</span>
                )
              ) : (
                <>
                  <span style={sipFormTextStyle}>{SIP_SIP_CHECKBOX_ENABLE}</span>
                  {field.labelAfter && (
                    <span style={sipFormTextStyle}>{field.labelAfter}</span>
                  )}
                </>
              )}
            </div>
          )}

          {field.type === "radio" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 32,
                gap: 16,
                width: SIP_SIP_CONTROL_COL_WIDTH,
                justifyContent: "flex-start",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  ...sipFormTextStyle,
                }}
              >
                <input
                  type="radio"
                  name={field.key}
                  value="Yes"
                  checked={form[field.key] === "Yes"}
                  onChange={() => handleChange(field.key, "Yes")}
                  style={nativeRadioStyle}
                />
                {SIP_SIP_RADIO_YES}
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  ...sipFormTextStyle,
                }}
              >
                <input
                  type="radio"
                  name={field.key}
                  value="No"
                  checked={form[field.key] === "No"}
                  onChange={() => handleChange(field.key, "No")}
                  style={nativeRadioStyle}
                />
                {SIP_SIP_RADIO_NO}
              </label>
            </div>
          )}
        </div>
      </div>
    </SipFieldRow>
  );
};

export const SipSipFormBody = ({
  form,
  isCompact,
  handleChange,
  handleCheckbox,
  isFieldVisible,
}) => (
  <div style={formBodyStyle}>
    <div className="settings-dashboard-grid" style={sipSipDashboardGridStyle(isCompact)}>
      <div style={sipSipColumnStyle(isCompact)}>
        <SipSipSectionHeading title={SIP_SIP_SECTION_NETWORK} isFirst />
        <div style={dashboardFieldsStackStyle}>
          {SIP_NETWORK_SECTION_FIELDS.map((field) =>
            renderSipSipFormField({
              field,
              form,
              isCompact,
              handleChange,
              handleCheckbox,
              isFieldVisible,
            }),
          )}
        </div>
      </div>

      {!isCompact && (
        <div className="settings-dashboard-divider" style={sipSipDividerCellStyle} aria-hidden="true">
          <div style={sipSipDividerLineStyle} />
        </div>
      )}

      <div style={sipSipColumnStyle(isCompact)}>
        <SipSipSectionHeading title={SIP_SIP_SECTION_REGISTRATION} isFirst />
        <div style={dashboardFieldsStackStyle}>
          {SIP_REGISTRATION_SECTION_FIELDS.map((field) =>
            renderSipSipFormField({
              field,
              form,
              isCompact,
              handleChange,
              handleCheckbox,
              isFieldVisible,
            }),
          )}
        </div>

        {SIP_SIP_NOTE && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.strongText,
                marginBottom: 8,
              }}
            >
              {SIP_SIP_NOTE_LABEL}
            </div>
            <div style={{ width: "100%", boxSizing: "border-box" }}>
              <p
                style={{
                  margin: 0,
                  color: C.mutedText,
                  fontSize: 11,
                  lineHeight: 1.5,
                  whiteSpace: "normal",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  textAlign: "left",
                }}
              >
                {SIP_SIP_NOTE.replace(/^Note:\\s*/i, "")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// silence unused import warn for SIP_SIP_FIELDS when tree-shaken
void SIP_SIP_FIELDS;
void isSipSipFieldVisible;
void CARD_RADIUS;
`;

  write("components/SipSipFormFields.jsx", formFields);

  write(
    "SipSipPage.jsx",
    `import React from "react";
import { Alert, CircularProgress, useMediaQuery } from "@mui/material";
import {
  SIP_SIP_CARD_TITLE,
  SIP_SIP_BTN_SAVE,
  SIP_SIP_BTN_SAVING,
  SIP_SIP_BTN_RESET,
  SIP_SIP_LOADING_TEXT,
  SIP_SIP_APPLYING_TEXT,
} from "../../../constants/SipSipConstants";
import { useSipSipPage } from "./hooks/useSipSipPage";
import {
  SipSipBtn as Btn,
  SipSipBreadcrumb,
  SipSipScrollbarStyles,
  AdvancedPageShell,
  SipSipFormBody,
  SIP_SIP_COMPACT_MQ,
} from "./components/SipSipFormFields";
import {
  C,
  CARD_RADIUS,
  SIP_SIP_SCROLL_CLASS,
  sipSipFixedAlertSx,
  advancedCardShellStyle,
  advancedTableContainerStyle,
  advancedFormInlineFooterStyle,
  advancedFormBtnStyle,
  sipHeaderStyle,
} from "./components/SipSipTableHelpers";

const SipSipPage = () => {
  const isCompact = useMediaQuery(SIP_SIP_COMPACT_MQ);
  const vm = useSipSipPage();
  const {
    form,
    loading,
    saving,
    message,
    setMessage,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
    isFieldVisible,
  } = vm;

  return (
    <>
      <SipSipScrollbarStyles />
      <AdvancedPageShell isCompact={isCompact}>
        {message.text && !saving && (
          <Alert
            severity={
              message.type === "error"
                ? "error"
                : message.type === "success"
                  ? "success"
                  : "info"
            }
            onClose={() => setMessage({ type: "", text: "" })}
            sx={sipSipFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        {saving && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-white rounded-lg flex flex-col items-center gap-4 pointer-events-auto"
              style={{
                minWidth: "300px",
                padding: "24px 32px",
                border: \`1px solid \${C.cardBorder}\`,
                boxShadow: C.cardShadow,
                borderRadius: CARD_RADIUS,
              }}
            >
              <CircularProgress size={50} sx={{ color: C.accent }} />
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.strongText,
                }}
              >
                {SIP_SIP_APPLYING_TEXT}
              </div>
            </div>
          </div>
        )}

        <SipSipBreadcrumb />

        <div style={advancedCardShellStyle}>
          <div style={advancedTableContainerStyle}>
            <div style={sipHeaderStyle}>
              <span>{SIP_SIP_CARD_TITLE}</span>
            </div>

            <div
              className={SIP_SIP_SCROLL_CLASS}
              style={{ boxSizing: "border-box" }}
            >
              {loading ? (
                <div
                  className="flex items-center justify-center w-full"
                  style={{ minHeight: 400, padding: "48px 32px" }}
                >
                  <div className="text-center">
                    <CircularProgress size={40} sx={{ color: C.accent }} />
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 13,
                        color: C.mutedText,
                        fontWeight: 500,
                      }}
                    >
                      {SIP_SIP_LOADING_TEXT}
                    </div>
                  </div>
                </div>
              ) : (
                <SipSipFormBody
                  form={form}
                  isCompact={isCompact}
                  handleChange={handleChange}
                  handleCheckbox={handleCheckbox}
                  isFieldVisible={isFieldVisible}
                />
              )}
            </div>

            {!loading && (
              <div style={advancedFormInlineFooterStyle}>
                <Btn
                  variant="primary"
                  onClick={handleSave}
                  disabled={loading || saving}
                  style={advancedFormBtnStyle}
                >
                  {saving ? (
                    <>
                      <CircularProgress size={14} color="inherit" />
                      {SIP_SIP_BTN_SAVING}
                    </>
                  ) : (
                    SIP_SIP_BTN_SAVE
                  )}
                </Btn>
                <Btn
                  variant="cancel"
                  onClick={handleReset}
                  style={advancedFormBtnStyle}
                >
                  {SIP_SIP_BTN_RESET}
                </Btn>
              </div>
            )}
          </div>
        </div>
      </AdvancedPageShell>
    </>
  );
};

export default SipSipPage;
`,
  );

  console.log("SipSipPage factored; source had", lines.length, "lines");
}
