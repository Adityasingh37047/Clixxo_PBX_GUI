import React from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../theme/pbxTokens";
import {
  SIP_REGISTER_COUNTRY_OPTIONS,
  SIP_REGISTER_TRANSPORT_OPTIONS,
  SIP_REGISTER_YES_NO,
  SIP_REGISTER_ETH_PORT_OPTIONS,
  SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS,
  SIP_REGISTER_CODEC_OPTIONS,
  SIP_REGISTER_DTMF_OPTIONS,
} from "../../../constants/SipRegisterConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as SipRegisterBreadcrumb,
  ExtensionPagination as SipRegisterPagination,
  ExtensionTableListLoading as SipRegisterTableListLoading,
  ExtensionTableListEmptyState as SipRegisterTableListEmptyState,
  ExtensionModalTabs as SipRegisterModalTabs,
  ExtensionCodecDualList as SipRegisterCodecDualList,
  extensionPageWrapStyle as sipRegisterPageWrapStyle,
  extensionPageInnerStyle as sipRegisterPageInnerStyle,
  extensionCardStyle as sipRegisterCardStyle,
  extensionFixedAlertSx as sipRegisterFixedAlertSx,
  extensionToolbarStyle as sipRegisterToolbarStyle,
  extensionSelectedBadgeStyle as sipRegisterSelectedBadgeStyle,
  extensionCancelBtnStyle as sipRegisterCancelBtnStyle,
  extensionPrimaryBtnStyle as sipRegisterPrimaryBtnStyle,
  extensionTableCheckboxSx as sipRegisterTableCheckboxSx,
} from "../../../components/common";
import { useSipRegisterPage } from "./hooks/useSipRegisterPage";
import { SIP_PREFIX_FIELDS } from "./utils/SipRegisterTransformers";
import {
  TRUNK_TABLE_SCROLL_CLASS,
  trunkTableScrollStyle,
  trunkTableInnerStyle,
  SIP_REGISTER_VISIBLE_TABLE_FIELDS,
  SIP_REGISTER_TABLE_HEADER_LABELS,
  sipRegisterCheckboxCellStyle,
  sipRegisterCheckboxWrapStyle,
  sipRegisterIdCellStyle,
  sipRegisterIdCenterWrapStyle,
  sipRegisterStatusCellStyle,
  sipRegisterModifyCellStyle,
  getSipRegisterDataCellStyle,
  getSipRegisterHeaderCellStyle,
  sipRegisterFieldColumnWidths,
  sipRegisterFieldColumnPercents,
  sipRegisterFixedCellStyle,
  formatSipRegisterStatusLabel,
  getSipRegisterStatusStyle,
} from "./SipRegisterTableHelpers";
import {
  Pill,
  TrunkFieldLabel,
  SipRegisterFieldLabel,
  TrunkModalSectionHeading,
  trunkFormCheckboxLabelSx,
  sipRegisterModalSelectSx,
  sipRegisterModalTextFieldSx,
  trunkAdaptTextFieldSx,
  trunkAdaptRowActionBtnSx,
  trunkDnisRowGridColumns,
  trunkAdaptRowGridColumns,
  trunkDodCompactInputStyle,
  trunkDodToolbarBtnStyle,
  nativeFieldInteraction,
  trunkModalPaperSx,
  trunkModalTitleStyle,
  trunkModalFormPanelStyle,
  sipRegisterModalDialogContentSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  trunkModalCancelBtnStyle,
  TRUNK_FIELD_LABEL_COLOR,
} from "./SipRegisterFormFields";

const SipRegisterToolbar = ({
  isCompact,
  selected,
  selectedIds,
  loading,
  trunks,
  handleInverse,
  handleClearAll,
  handleDelete,
  handleOpenModal,
}) => (
  <div
    style={{
      ...sipRegisterToolbarStyle,
      ...(isCompact
        ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
        : {}),
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {selected.length > 0 && (
        <span style={sipRegisterSelectedBadgeStyle}>
          {selected.length} selected
        </span>
      )}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <Btn
        variant="cancel"
        onClick={handleInverse}
        disabled={loading.delete || loading.fetch || trunks.length === 0}
        style={sipRegisterCancelBtnStyle}
      >
        Inverse
      </Btn>
      <Btn
        variant="cancel"
        onClick={handleClearAll}
        disabled={loading.delete || trunks.length === 0}
        style={sipRegisterCancelBtnStyle}
      >
        Clear All
      </Btn>
      <Btn
        variant="cancel"
        onClick={handleDelete}
        disabled={loading.delete || selectedIds.length === 0}
        style={sipRegisterCancelBtnStyle}
      >
        {loading.delete ? (
          <CircularProgress size={12} color="inherit" />
        ) : (
          <>
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            Delete
          </>
        )}
      </Btn>
      <Btn
        variant="primary"
        onClick={() => handleOpenModal()}
        disabled={loading.fetch}
        style={sipRegisterPrimaryBtnStyle}
      >
        + Add New
      </Btn>
    </div>
  </div>
);

const SipRegisterTable = ({
  isInitialLoad,
  dataEmpty,
  tableScrollRef,
  allowHorizontalScroll,
  tableMinWidth,
  allPageSelected,
  somePageSelected,
  handleToggleAll,
  pagedRows,
  page,
  itemsPerPage,
  selectedIds,
  handleToggleRow,
  loading,
  handleOpenModal,
}) => (
  <div style={{ position: "relative" }}>
    {isInitialLoad ? (
      <SipRegisterTableListLoading />
    ) : dataEmpty ? (
      <SipRegisterTableListEmptyState
        message="No SIP register trunks found."
        onAddNew={() => handleOpenModal()}
      />
    ) : (
      <>
        <div
          ref={tableScrollRef}
          className={TRUNK_TABLE_SCROLL_CLASS}
          style={{
            ...trunkTableScrollStyle,
            overflowX: allowHorizontalScroll ? "auto" : "hidden",
            borderBottom: "none",
          }}
        >
          <div
            style={{
              ...trunkTableInnerStyle,
              minWidth: allowHorizontalScroll ? tableMinWidth : "100%",
              width: allowHorizontalScroll ? tableMinWidth : "100%",
              borderBottom: "none",
            }}
          >
            <table
              style={{
                width: allowHorizontalScroll ? tableMinWidth : "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: allowHorizontalScroll ? "auto" : "fixed",
                minWidth: allowHorizontalScroll ? tableMinWidth : "100%",
              }}
            >
              <colgroup>
                <col
                  style={{
                    width: allowHorizontalScroll ? 40 : "3%",
                  }}
                />
                <col
                  style={{
                    width: allowHorizontalScroll ? 44 : "3%",
                  }}
                />
                {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map((field) => (
                  <col
                    key={field.name}
                    style={{
                      width: allowHorizontalScroll
                        ? sipRegisterFieldColumnWidths[field.name]
                        : sipRegisterFieldColumnPercents[field.name],
                    }}
                  />
                ))}
                <col
                  style={{
                    width: allowHorizontalScroll ? 118 : "10%",
                  }}
                />
                <col
                  style={{
                    width: allowHorizontalScroll ? 72 : "6%",
                  }}
                />
              </colgroup>
              <thead>
                <tr>
                  <TH
                    style={{
                      ...sipRegisterFixedCellStyle(
                        sipRegisterCheckboxCellStyle,
                        allowHorizontalScroll,
                      ),
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <div style={sipRegisterCheckboxWrapStyle}>
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={sipRegisterTableCheckboxSx}
                      />
                    </div>
                  </TH>
                  <TH
                    style={{
                      ...sipRegisterFixedCellStyle(
                        sipRegisterIdCellStyle,
                        allowHorizontalScroll,
                      ),
                      textAlign: "center",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <div style={sipRegisterIdCenterWrapStyle}>ID</div>
                  </TH>
                  {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map((field) => (
                    <TH
                      key={field.name}
                      title={field.label}
                      style={getSipRegisterHeaderCellStyle(
                        allowHorizontalScroll,
                      )}
                    >
                      {SIP_REGISTER_TABLE_HEADER_LABELS[field.name] ??
                        field.label}
                    </TH>
                  ))}
                  <TH
                    style={{
                      ...sipRegisterFixedCellStyle(
                        sipRegisterStatusCellStyle,
                        allowHorizontalScroll,
                      ),
                      ...getSipRegisterHeaderCellStyle(allowHorizontalScroll),
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <div style={sipRegisterIdCenterWrapStyle}>Status</div>
                  </TH>
                  <TH
                    style={{
                      ...sipRegisterFixedCellStyle(
                        sipRegisterModifyCellStyle,
                        allowHorizontalScroll,
                      ),
                      ...getSipRegisterHeaderCellStyle(allowHorizontalScroll),
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    Modify
                  </TH>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((trunk, idx) => {
                  const realIdx = (page - 1) * itemsPerPage + idx;
                  const isSelected =
                    trunk.trunk_id && selectedIds.includes(trunk.trunk_id);
                  const isLastRow = idx === pagedRows.length - 1;
                  const rowBg = isSelected
                    ? "#f0f9ff"
                    : idx % 2 === 1
                      ? "#f8fafc"
                      : "#ffffff";
                  const lastRowCellStyle = isLastRow
                    ? { borderBottom: "none" }
                    : {};
                  const { bg: statusBg, color: statusColor } =
                    getSipRegisterStatusStyle(trunk.registerStatus);
                  return (
                    <tr
                      key={trunk.trunk_id || idx}
                      style={{
                        background: rowBg,
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "#f1f5f9";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = rowBg;
                      }}
                    >
                      <td
                        style={{
                          ...tdStyle,
                          ...sipRegisterFixedCellStyle(
                            sipRegisterCheckboxCellStyle,
                            allowHorizontalScroll,
                          ),
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
                      >
                        <div style={sipRegisterCheckboxWrapStyle}>
                          <Checkbox
                            size="small"
                            disabled={!trunk.trunk_id}
                            checked={
                              !!trunk.trunk_id &&
                              selectedIds.includes(trunk.trunk_id)
                            }
                            onChange={() => handleToggleRow(trunk.trunk_id)}
                            sx={sipRegisterTableCheckboxSx}
                          />
                        </div>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          ...sipRegisterFixedCellStyle(
                            sipRegisterIdCellStyle,
                            allowHorizontalScroll,
                          ),
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
                      >
                        <div style={sipRegisterIdCenterWrapStyle}>
                          {(page - 1) * itemsPerPage + idx + 1}
                        </div>
                      </td>
                      {SIP_REGISTER_VISIBLE_TABLE_FIELDS.map((field) => {
                        const value = trunk[field.name];
                        const hasValue =
                          value !== undefined &&
                          value !== null &&
                          value !== "";
                        const displayValue =
                          hasValue && SIP_PREFIX_FIELDS.includes(field.name)
                            ? `sip:${value}`
                            : hasValue
                              ? value
                              : "—";
                        return (
                          <td
                            key={field.name}
                            title={String(displayValue)}
                            style={{
                              ...tdStyle,
                              background: rowBg,
                              fontWeight:
                                field.name === "trunk_id" ? 600 : 400,
                              ...getSipRegisterDataCellStyle(
                                allowHorizontalScroll,
                              ),
                              ...lastRowCellStyle,
                            }}
                          >
                            {displayValue}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          ...tdStyle,
                          ...sipRegisterFixedCellStyle(
                            sipRegisterStatusCellStyle,
                            allowHorizontalScroll,
                          ),
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
                      >
                        <div style={sipRegisterIdCenterWrapStyle}>
                          {trunk.registerStatus ? (
                            <Pill
                              text={formatSipRegisterStatusLabel(
                                trunk.registerStatus,
                              )}
                              bg={statusBg}
                              color={statusColor}
                            />
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          ...sipRegisterFixedCellStyle(
                            sipRegisterModifyCellStyle,
                            allowHorizontalScroll,
                          ),
                          background: rowBg,
                          ...lastRowCellStyle,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            style={{
                              cursor: loading.delete
                                ? "not-allowed"
                                : "pointer",
                              color: "#2563eb",
                              fontSize: 22,
                              opacity: loading.delete ? 0.4 : 0.7,
                              transition: "opacity 0.15s ease",
                            }}
                            onClick={() =>
                              !loading.delete &&
                              handleOpenModal(trunk, realIdx)
                            }
                            onMouseEnter={(e) => {
                              if (!loading.delete)
                                e.currentTarget.style.opacity = "1";
                            }}
                            onMouseLeave={(e) => {
                              if (!loading.delete)
                                e.currentTarget.style.opacity = "0.7";
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </div>
);

const SipRegisterBasicTab = ({
  form,
  validationErrors,
  handleChange,
  editIndex,
  ethPortOptions,
  showPassword,
  togglePasswordVisibility,
}) => (
  <div className="p-3 sm:p-5">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-10 gap-y-0">
      <div className="space-y-0.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel>Trunk Type</TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <RadioGroup
              row
              value={form.ui_trunk_type}
              onChange={(e) =>
                handleChange("ui_trunk_type", e.target.value)
              }
            >
              <FormControlLabel
                value="sip"
                control={<Radio size="small" />}
                label="SIP"
              />
            </RadioGroup>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="trunk_name" required>
            Trunk Name
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.trunk_id || ""}
              onChange={(e) =>
                handleChange("trunk_id", e.target.value)
              }
              error={!!validationErrors.trunk_id}
              placeholder="Trunk Name"
              disabled={editIndex !== null}
            />
            {validationErrors.trunk_id && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.trunk_id}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="select_country" required>
            Select Country
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl
              fullWidth
              size="small"
              error={!!validationErrors.ui_country}
            >
              <MuiSelect
                value={form.ui_country}
                onChange={(e) =>
                  handleChange("ui_country", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_COUNTRY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
            {validationErrors.ui_country && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.ui_country}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="transport">
            Transport
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_transport}
                onChange={(e) =>
                  handleChange("ui_transport", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_TRANSPORT_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="enable_srtp">
            Enable SRTP
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0 flex items-center justify-start">
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.ui_enable_srtp}
                  onChange={(e) =>
                    handleChange("ui_enable_srtp", e.target.checked)
                  }
                  size="small"
                  sx={sipRegisterTableCheckboxSx}
                />
              }
              label=""
              sx={trunkFormCheckboxLabelSx}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="register" required>
            Register
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_register}
                onChange={(e) =>
                  handleChange("ui_register", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        {form.ui_register === "Yes" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="username" required>
                Username
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.username || ""}
                  onChange={(e) =>
                    handleChange("username", e.target.value)
                  }
                  error={!!validationErrors.username}
                  placeholder="Username"
                />
                {validationErrors.username && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.username}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="auth_username">
                Auth Username
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.auth_username || ""}
                  onChange={(e) =>
                    handleChange("auth_username", e.target.value)
                  }
                  placeholder="Auth Username"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="reg_fail_retry" required>
                RegFail Retry
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.ui_reg_fail_retry || ""}
                  onChange={(e) =>
                    handleChange(
                      "ui_reg_fail_retry",
                      e.target.value,
                    )
                  }
                  error={!!validationErrors.ui_reg_fail_retry}
                  placeholder="30"
                />
                {validationErrors.ui_reg_fail_retry && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.ui_reg_fail_retry}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="outbound_cid_source">
            Outbound CallerId Source
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_outbound_cid_source}
                onChange={(e) =>
                  handleChange(
                    "ui_outbound_cid_source",
                    e.target.value,
                  )
                }
                displayEmpty
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_OUTBOUND_CID_SOURCE_OPTIONS.map(
                  (c) => (
                    <MenuItem key={c || "_empty"} value={c}>
                      {c || <em>—</em>}
                    </MenuItem>
                  ),
                )}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="record">
            Record
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_record}
                onChange={(e) =>
                  handleChange("ui_record", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="enabled" required>
            Enabled
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_enabled}
                onChange={(e) =>
                  handleChange("ui_enabled", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="eth_port" required>
            Eth Port
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_eth_port}
                onChange={(e) =>
                  handleChange("ui_eth_port", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {(ethPortOptions.length
                  ? ethPortOptions
                  : SIP_REGISTER_ETH_PORT_OPTIONS.map((v) => ({
                      value: v,
                      label: v,
                    }))
                ).map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="trunk_ip_domain" required>
            Trunk IP/Domain
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.provider || ""}
              onChange={(e) =>
                handleChange("provider", e.target.value)
              }
              error={!!validationErrors.provider}
              placeholder="host:port or domain"
            />
            {validationErrors.provider && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.provider}
              </div>
            )}
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
            <TrunkFieldLabel tooltipKey="show_outbound_cid_name">
              Show Outbound CallerID Name
            </TrunkFieldLabel>
            <div className="flex-1 min-w-0 flex items-center justify-start">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.ui_show_outbound_cid_name}
                    onChange={(e) =>
                      handleChange(
                        "ui_show_outbound_cid_name",
                        e.target.checked,
                      )
                    }
                    size="small"
                    sx={sipRegisterTableCheckboxSx}
                  />
                }
                label=""
                sx={trunkFormCheckboxLabelSx}
              />
            </div>
          </div>
          {form.ui_show_outbound_cid_name && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="outbound_cid_name">
                Outbound CallerId Name
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.ui_outbound_cid_name}
                  onChange={(e) =>
                    handleChange(
                      "ui_outbound_cid_name",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="outbound_cid_number">
            Outbound CallerId Number
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.ui_outbound_cid_number}
              onChange={(e) =>
                handleChange(
                  "ui_outbound_cid_number",
                  e.target.value,
                )
              }
            />
          </div>
        </div>

        {form.ui_register === "Yes" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="password" required>
                Password
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  type={showPassword ? "text" : "password"}
                  size="small"
                  fullWidth
                  value={form.password || ""}
                  onChange={(e) =>
                    handleChange("password", e.target.value)
                  }
                  error={!!validationErrors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {validationErrors.password && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.password}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="expire_in_sec" required>
                Expire Seconds
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <TextField
                  size="small"
                  fullWidth
                  value={form.expire_in_sec || ""}
                  onChange={(e) =>
                    handleChange("expire_in_sec", e.target.value)
                  }
                  error={!!validationErrors.expire_in_sec}
                />
                {validationErrors.expire_in_sec && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.expire_in_sec}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
              <TrunkFieldLabel tooltipKey="match_username" required>
                Match Username
              </TrunkFieldLabel>
              <div className="flex-1 min-w-0">
                <FormControl
                  fullWidth
                  size="small"
                  error={!!validationErrors.ui_match_username}
                >
                  <MuiSelect
                    value={form.ui_match_username || "Yes"}
                    onChange={(e) =>
                      handleChange(
                        "ui_match_username",
                        e.target.value,
                      )
                    }
                    sx={sipRegisterModalSelectSx}
                  >
                    {SIP_REGISTER_YES_NO.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
                {validationErrors.ui_match_username && (
                  <div className="text-red-500 text-xs mt-0.5">
                    {validationErrors.ui_match_username}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                <TrunkFieldLabel tooltipKey="enable_proxy">
                  Enable Proxy
                </TrunkFieldLabel>
                <div className="flex-1 min-w-0 flex items-center justify-start">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!form.ui_enable_proxy}
                        onChange={(e) =>
                          handleChange(
                            "ui_enable_proxy",
                            e.target.checked,
                          )
                        }
                        size="small"
                        sx={sipRegisterTableCheckboxSx}
                      />
                    }
                    label=""
                    sx={trunkFormCheckboxLabelSx}
                  />
                </div>
              </div>

              {form.ui_enable_proxy && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
                  <TrunkFieldLabel tooltipKey="proxy_ip" required>
                    Proxy IP
                  </TrunkFieldLabel>
                  <div className="flex-1 min-w-0">
                    <TextField
                      size="small"
                      fullWidth
                      value={form.ui_proxy_ip || ""}
                      onChange={(e) =>
                        handleChange("ui_proxy_ip", e.target.value)
                      }
                      error={!!validationErrors.ui_proxy_ip}
                    />
                    {validationErrors.ui_proxy_ip && (
                      <div className="text-red-500 text-xs mt-0.5">
                        {validationErrors.ui_proxy_ip}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);

const SipRegisterCodecTab = ({
  selectedCodecList,
  updateCodecList,
  getCodecLabel,
  validationErrors,
}) => (
  <div className="p-3 sm:p-5">
    <TrunkModalSectionHeading title="CODEC Priority" isFirst />
    <SipRegisterCodecDualList
      allOptions={SIP_REGISTER_CODEC_OPTIONS}
      selected={selectedCodecList}
      onChange={updateCodecList}
      getLabel={getCodecLabel}
      style={{ maxWidth: 720, margin: "0 auto" }}
    />
    {validationErrors.allow_codecs && (
      <div className="text-red-500 text-xs mt-3 text-center">
        {validationErrors.allow_codecs}
      </div>
    )}
  </div>
);

const SipRegisterAdvanceTab = ({
  form,
  validationErrors,
  handleChange,
  dnisRows,
  setDnisRows,
  PREFERRED_ASSERTED_IDENTITY_OPTIONS,
  REMOTE_PARTY_ID_OPTIONS,
  CONTACT_MODE_OPTIONS,
}) => (
  <div className="p-3 sm:p-5 space-y-6">
    <div className="hidden">
      <h3 className="text-base font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-1">
        SIP registration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            SIP Header
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.sip_header || ""}
              onChange={(e) =>
                handleChange("sip_header", e.target.value)
              }
              error={!!validationErrors.sip_header}
              placeholder="+91...@sip.domain"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="text-sm text-gray-600">
                      sip:
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            {validationErrors.sip_header && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.sip_header}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            Server Domain
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.server_domain || ""}
              onChange={(e) =>
                handleChange("server_domain", e.target.value)
              }
              error={!!validationErrors.server_domain}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="text-sm text-gray-600">
                      sip:
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            {validationErrors.server_domain && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.server_domain}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            Client Domain
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.client_domain || ""}
              onChange={(e) =>
                handleChange("client_domain", e.target.value)
              }
              error={!!validationErrors.client_domain}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="text-sm text-gray-600">
                      sip:
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            {validationErrors.client_domain && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.client_domain}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            Outbound Proxy
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form["Outbound Proxy"] || ""}
              onChange={(e) =>
                handleChange("Outbound Proxy", e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="text-sm text-gray-600">
                      sip:
                    </span>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1">
          <label className="text-[13px] font-semibold text-[#3E5475] sm:w-[11rem] sm:text-right shrink-0 pt-1.5">
            Identifier IP
          </label>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.identity_ip || ""}
              onChange={(e) =>
                handleChange("identity_ip", e.target.value)
              }
              error={!!validationErrors.identity_ip}
            />
            {validationErrors.identity_ip && (
              <div className="text-red-500 text-xs mt-0.5">
                {validationErrors.identity_ip}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <div>
      <TrunkModalSectionHeading title="VoIP Settings" isFirst />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        {[
          [
            "Get CalledID Type",
            "ui_get_called_id_type",
            "get_called_id_type",
          ],
          [
            "OPTIONS Interval (s)",
            "ui_options_interval",
            "options_interval",
          ],
          ["TX Volume", "ui_tx_volume", "tx_volume"],
          ["RX Volume", "ui_rx_volume", "rx_volume"],
          ["From User", "from_user", "from_user"],
          ["From Domain", "Domain name", "from_domain"],
        ].map(([lbl, key, tooltipKey]) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1"
          >
            <TrunkFieldLabel tooltipKey={tooltipKey}>
              {lbl}
            </TrunkFieldLabel>
            <div className="flex-1 min-w-0">
              <TextField
                size="small"
                fullWidth
                value={form[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          </div>
        ))}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="send_privacy_id">
            Send Privacy ID
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_send_privacy_id}
                onChange={(e) =>
                  handleChange("ui_send_privacy_id", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="sip_force_contact">
            Sip Force Contact
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_sip_force_contact || ""}
                displayEmpty
                onChange={(e) =>
                  handleChange(
                    "ui_sip_force_contact",
                    e.target.value,
                  )
                }
                sx={sipRegisterModalSelectSx}
              >
                <MenuItem value="">
                  <em>—</em>
                </MenuItem>
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
      </div>
    </div>

    <div>
      <TrunkModalSectionHeading title="Outbound parameters" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="p_preferred_identity">
            P-Preferred-Identity
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_p_preferred_identity || "None"}
                onChange={(e) =>
                  handleChange(
                    "ui_p_preferred_identity",
                    e.target.value,
                  )
                }
                sx={sipRegisterModalSelectSx}
              >
                {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="remote_party_id">
            Remote-Party-ID
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_remote_party_id || "None"}
                onChange={(e) =>
                  handleChange("ui_remote_party_id", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {REMOTE_PARTY_ID_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="p_asserted_identity">
            P-Asserted-Identity
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_p_asserted_identity || "None"}
                onChange={(e) =>
                  handleChange(
                    "ui_p_asserted_identity",
                    e.target.value,
                  )
                }
                sx={sipRegisterModalSelectSx}
              >
                {PREFERRED_ASSERTED_IDENTITY_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="contact">
            Contact
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_contact_mode || "Trunk User Name"}
                onChange={(e) =>
                  handleChange("ui_contact_mode", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {CONTACT_MODE_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
      </div>
    </div>

    <div>
      <TrunkModalSectionHeading title="Other Settings" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="limit_max_calls">
            Limit Max Calls
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.ui_limit_max_calls}
              onChange={(e) =>
                handleChange("ui_limit_max_calls", e.target.value)
              }
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="enable_early_session">
            Enable Early Session
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_enable_early_session}
                onChange={(e) =>
                  handleChange(
                    "ui_enable_early_session",
                    e.target.value,
                  )
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="enable_early_media">
            Enable Early Media
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_enable_early_media}
                onChange={(e) =>
                  handleChange(
                    "ui_enable_early_media",
                    e.target.value,
                  )
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_YES_NO.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="user_phone">
            User Phone
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0 flex items-center justify-start">
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.ui_user_phone}
                  onChange={(e) =>
                    handleChange("ui_user_phone", e.target.checked)
                  }
                  size="small"
                  sx={sipRegisterTableCheckboxSx}
                />
              }
              label=""
              sx={trunkFormCheckboxLabelSx}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="call_timeout">
            Call Timeout(s)
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.ui_call_timeout}
              onChange={(e) =>
                handleChange("ui_call_timeout", e.target.value)
              }
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="dtmf_transmit">
            DTMF Transmit Mode
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <FormControl fullWidth size="small">
              <MuiSelect
                value={form.ui_dtmf_transmit}
                onChange={(e) =>
                  handleChange("ui_dtmf_transmit", e.target.value)
                }
                sx={sipRegisterModalSelectSx}
              >
                {SIP_REGISTER_DTMF_OPTIONS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="max_call_duration">
            Max Call Duration (s)
          </TrunkFieldLabel>
          <div className="flex-1 min-w-0">
            <TextField
              size="small"
              fullWidth
              value={form.ui_max_call_duration}
              onChange={(e) =>
                handleChange("ui_max_call_duration", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-h-[40px] py-1">
          <TrunkFieldLabel tooltipKey="dnis">DNIS</TrunkFieldLabel>
          <div className="flex-1 min-w-0 flex items-center justify-start">
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.ui_dnis}
                  onChange={(e) =>
                    handleChange("ui_dnis", e.target.checked)
                  }
                  size="small"
                  sx={sipRegisterTableCheckboxSx}
                />
              }
              label=""
              sx={trunkFormCheckboxLabelSx}
            />
          </div>
        </div>
        {form.ui_dnis && (
          <div className="mt-2 rounded-md border border-gray-200 bg-white p-3 sm:p-5">
            <TrunkModalSectionHeading
              title="DNIS Settings"
              isFirst
              labelBackground="#ffffff"
              titleLeft={0}
            />

            <div
              className="grid gap-2 items-center border-b border-gray-200 pb-2 mb-3"
              style={{
                gridTemplateColumns: trunkDnisRowGridColumns,
              }}
            >
              <SipRegisterFieldLabel tooltipKey="dnis_number">
                DNIS Number
              </SipRegisterFieldLabel>
              <SipRegisterFieldLabel tooltipKey="dnis_name">
                DNIS Name
              </SipRegisterFieldLabel>
              <IconButton
                size="small"
                onClick={() =>
                  setDnisRows((r) => [
                    ...r,
                    { dnisNumber: "", dnisName: "" },
                  ])
                }
                sx={trunkAdaptRowActionBtnSx}
                aria-label="add dnis row"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </div>

            <div className="space-y-2">
              {dnisRows.map((row, i) => (
                <div
                  key={i}
                  className="grid gap-2 items-center"
                  style={{
                    gridTemplateColumns: trunkDnisRowGridColumns,
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="DNIS Number"
                    value={row.dnisNumber}
                    onChange={(e) =>
                      setDnisRows((prev) =>
                        prev.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                dnisNumber: e.target.value,
                              }
                            : x,
                        ),
                      )
                    }
                    sx={trunkAdaptTextFieldSx}
                  />
                  <div className="flex items-center gap-1 min-w-0">
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="DNIS Name"
                      value={row.dnisName}
                      onChange={(e) =>
                        setDnisRows((prev) =>
                          prev.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  dnisName: e.target.value,
                                }
                              : x,
                          ),
                        )
                      }
                      sx={trunkAdaptTextFieldSx}
                    />
                    {dnisRows.length > 1 ? (
                      <IconButton
                        size="small"
                        onClick={() =>
                          setDnisRows((r) =>
                            r.filter((_, j) => j !== i),
                          )
                        }
                        sx={trunkAdaptRowActionBtnSx}
                        aria-label="remove dnis row"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </div>
                  <span aria-hidden="true" />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <SipRegisterFieldLabel
                tooltipKey="replace_cid"
                style={{ minWidth: "6.5rem", flexShrink: 0 }}
              >
                Replace CID
              </SipRegisterFieldLabel>
              <FormControl size="small" sx={{ width: 160 }}>
                <MuiSelect
                  value={form.ui_replace_cid || "No"}
                  onChange={(e) =>
                    handleChange("ui_replace_cid", e.target.value)
                  }
                  sx={sipRegisterModalSelectSx}
                >
                  {SIP_REGISTER_YES_NO.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </MuiSelect>
              </FormControl>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const SipRegisterDodTab = ({
  dodRows,
  setDodRows,
  dodSelected,
  setDodSelected,
  showDodAddModal,
  setShowDodAddModal,
  dodAddName,
  setDodAddName,
  dodAddNumber,
  setDodAddNumber,
  dodMemberExtensions,
  setDodMemberExtensions,
  dodAvailableExtensions,
  dodAvailableEmptyText,
  getDodExtLabel,
  handleOpenDodAddModal,
  handleConfirmDodAdd,
  resetDodAddForm,
  showMessage,
}) => (
  <div className="p-3 sm:p-5">
    <div className="flex flex-wrap gap-2 mb-3">
      {["ADD", "DELETE", "IMPORT", "EXPORT"].map((lbl) => (
        <Btn
          key={lbl}
          type="button"
          variant="cancel"
          style={trunkDodToolbarBtnStyle}
          onClick={() => {
            if (lbl === "ADD") handleOpenDodAddModal();
            else if (lbl === "DELETE") {
              if (!dodSelected.length) {
                showMessage("error", "Select DOD rows to delete");
                return;
              }
              setDodRows((rows) =>
                rows.filter((_, i) => !dodSelected.includes(i)),
              );
              setDodSelected([]);
            } else
              showMessage(
                "info",
                `${lbl} is not connected to the API yet.`,
              );
          }}
        >
          {lbl}
        </Btn>
      ))}
    </div>

    {showDodAddModal ? (
      <div className="mt-2 bg-white border border-gray-200 rounded-md p-3 sm:p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-4 w-full">
          <div className="flex items-center gap-8 min-w-0">
            <TrunkFieldLabel
              tooltipKey="dod_name"
              required
              className="text-[13px] font-semibold text-[#3E5475] whitespace-nowrap shrink-0"
              style={{ width: 110 }}
            >
              DOD Name
            </TrunkFieldLabel>
            <input
              className="flex-1 min-w-0"
              style={trunkDodCompactInputStyle}
              value={dodAddName}
              onChange={(e) => setDodAddName(e.target.value)}
              {...nativeFieldInteraction}
            />
          </div>
          <div className="flex items-center gap-8 min-w-0">
            <TrunkFieldLabel
              tooltipKey="dod_number"
              required
              className="text-[13px] font-semibold text-[#3E5475] whitespace-nowrap shrink-0"
              style={{ width: 110 }}
            >
              DOD Number
            </TrunkFieldLabel>
            <input
              className="flex-1 min-w-0"
              style={trunkDodCompactInputStyle}
              value={dodAddNumber}
              onChange={(e) => setDodAddNumber(e.target.value)}
              {...nativeFieldInteraction}
            />
          </div>
        </div>

        <div style={{ marginTop: 4 }}>
          <SipRegisterCodecDualList
            hideReorder
            allOptions={dodAvailableExtensions}
            selected={dodMemberExtensions}
            onChange={setDodMemberExtensions}
            getLabel={getDodExtLabel}
            emptyTextAvailable={dodAvailableEmptyText}
            emptyTextSelected="No selected extensions"
          />
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <Btn
            type="button"
            variant="primary"
            onClick={handleConfirmDodAdd}
            style={trunkDodToolbarBtnStyle}
          >
            ENSURE
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={() => {
              setShowDodAddModal(false);
              resetDodAddForm();
            }}
            style={trunkDodToolbarBtnStyle}
          >
            CANCEL
          </Btn>
        </div>
      </div>
    ) : (
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="p-2 w-10 text-left">
                <input
                  type="checkbox"
                  aria-label="select all dod"
                  onChange={(e) =>
                    e.target.checked
                      ? setDodSelected(dodRows.map((_, i) => i))
                      : setDodSelected([])
                  }
                  checked={
                    dodRows.length > 0 &&
                    dodSelected.length === dodRows.length
                  }
                />
              </th>
              <th className="p-2 text-left font-medium">
                DOD Number
              </th>
              <th className="p-2 text-left font-medium">
                DOD Name
              </th>
              <th className="p-2 text-left font-medium">
                Bind Extension
              </th>
            </tr>
          </thead>
          <tbody>
            {dodRows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center text-gray-400"
                >
                  No DOD entries. Click ADD to add a row.
                </td>
              </tr>
            ) : (
              dodRows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={dodSelected.includes(i)}
                      onChange={() =>
                        setDodSelected((s) =>
                          s.includes(i)
                            ? s.filter((x) => x !== i)
                            : [...s, i],
                        )
                      }
                    />
                  </td>
                  <td className="p-1">
                    <TextField
                      size="small"
                      fullWidth
                      value={row.dodNumber}
                      onChange={(e) =>
                        setDodRows((rows) =>
                          rows.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  dodNumber: e.target.value,
                                }
                              : x,
                          ),
                        )
                      }
                      sx={sipRegisterModalTextFieldSx}
                    />
                  </td>
                  <td className="p-1">
                    <TextField
                      size="small"
                      fullWidth
                      value={row.dodName}
                      onChange={(e) =>
                        setDodRows((rows) =>
                          rows.map((x, j) =>
                            j === i
                              ? { ...x, dodName: e.target.value }
                              : x,
                          ),
                        )
                      }
                      sx={sipRegisterModalTextFieldSx}
                    />
                  </td>
                  <td className="p-1">
                    <TextField
                      size="small"
                      fullWidth
                      value={
                        Array.isArray(row.bindExtensions)
                          ? row.bindExtensions.join(", ")
                          : row.bindExtension || ""
                      }
                      onChange={(e) => {
                        const raw = e.target.value || "";
                        const list = raw
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setDodRows((rows) =>
                          rows.map((x, j) =>
                            j === i
                              ? {
                                  ...x,
                                  bindExtensions: list,
                                  bindExtension: raw,
                                }
                              : x,
                          ),
                        );
                      }}
                      sx={sipRegisterModalTextFieldSx}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const SipRegisterAdaptTab = ({ adaptRows, setAdaptRows }) => (
  <div className="p-3 sm:p-5">
    <div
      className="grid gap-2 items-center text-[12px] font-semibold border-b border-gray-200 pb-2 mb-3"
      style={{
        gridTemplateColumns: trunkAdaptRowGridColumns,
      }}
    >
      <SipRegisterFieldLabel tooltipKey="match_mode">
        Match Mode
      </SipRegisterFieldLabel>
      <SipRegisterFieldLabel tooltipKey="strip">
        Strip
      </SipRegisterFieldLabel>
      <SipRegisterFieldLabel tooltipKey="prepend">
        Prepend
      </SipRegisterFieldLabel>
      <IconButton
        size="small"
        onClick={() =>
          setAdaptRows((r) => [
            ...r,
            { matchMode: "", strip: "", prepend: "" },
          ])
        }
        sx={trunkAdaptRowActionBtnSx}
        aria-label="add adapt row"
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </div>
    <div className="space-y-2">
      {adaptRows.map((row, i) => (
        <div
          key={i}
          className="grid gap-2 items-center"
          style={{
            gridTemplateColumns: trunkAdaptRowGridColumns,
          }}
        >
          <TextField
            size="small"
            placeholder="Match"
            value={row.matchMode}
            onChange={(e) =>
              setAdaptRows((r) =>
                r.map((x, j) =>
                  j === i ? { ...x, matchMode: e.target.value } : x,
                ),
              )
            }
            sx={trunkAdaptTextFieldSx}
          />
          <TextField
            size="small"
            placeholder="Strip"
            value={row.strip}
            onChange={(e) =>
              setAdaptRows((r) =>
                r.map((x, j) =>
                  j === i ? { ...x, strip: e.target.value } : x,
                ),
              )
            }
            sx={trunkAdaptTextFieldSx}
          />
          <TextField
            size="small"
            placeholder="Prepend"
            value={row.prepend}
            onChange={(e) =>
              setAdaptRows((r) =>
                r.map((x, j) =>
                  j === i ? { ...x, prepend: e.target.value } : x,
                ),
              )
            }
            sx={trunkAdaptTextFieldSx}
          />
          {adaptRows.length > 1 ? (
            <IconButton
              size="small"
              onClick={() =>
                setAdaptRows((r) => r.filter((_, j) => j !== i))
              }
              sx={trunkAdaptRowActionBtnSx}
              aria-label="remove adapt row"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  </div>
);

const SipRegisterPage = () => {
  const vm = useSipRegisterPage();
  const {
    isCompact,
    message,
    setMessage,
    isInitialLoad,
    filteredRows,
    page,
    totalPages,
    pagedRows,
    handlePageChange,
    selected,
    selectedIds,
    loading,
    trunks,
    handleInverse,
    handleClearAll,
    handleDelete,
    handleOpenModal,
    dataEmpty,
    tableScrollRef,
    allowHorizontalScroll,
    tableMinWidth,
    allPageSelected,
    somePageSelected,
    handleToggleAll,
    itemsPerPage,
    handleToggleRow,
    showModal,
    handleCloseModal,
    editIndex,
    modalTab,
    setModalTab,
    modalScrollRef,
    handleSave,
    form,
    validationErrors,
    handleChange,
    ethPortOptions,
    showPassword,
    togglePasswordVisibility,
    selectedCodecList,
    updateCodecList,
    getCodecLabel,
    dnisRows,
    setDnisRows,
    PREFERRED_ASSERTED_IDENTITY_OPTIONS,
    REMOTE_PARTY_ID_OPTIONS,
    CONTACT_MODE_OPTIONS,
    dodRows,
    setDodRows,
    dodSelected,
    setDodSelected,
    showDodAddModal,
    setShowDodAddModal,
    dodAddName,
    setDodAddName,
    dodAddNumber,
    setDodAddNumber,
    dodMemberExtensions,
    setDodMemberExtensions,
    dodAvailableExtensions,
    dodAvailableEmptyText,
    getDodExtLabel,
    handleOpenDodAddModal,
    handleConfirmDodAdd,
    resetDodAddForm,
    showMessage,
    adaptRows,
    setAdaptRows,
  } = vm;

  return (
    <div
      style={{
        ...sipRegisterPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={sipRegisterPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={sipRegisterFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <SipRegisterBreadcrumb section="Trunks" current="SIP Register" />

        <div style={sipRegisterCardStyle}>
          <SipRegisterToolbar
            isCompact={isCompact}
            selected={selected}
            selectedIds={selectedIds}
            loading={loading}
            trunks={trunks}
            handleInverse={handleInverse}
            handleClearAll={handleClearAll}
            handleDelete={handleDelete}
            handleOpenModal={handleOpenModal}
          />

          <SipRegisterTable
            isInitialLoad={isInitialLoad}
            dataEmpty={dataEmpty}
            tableScrollRef={tableScrollRef}
            allowHorizontalScroll={allowHorizontalScroll}
            tableMinWidth={tableMinWidth}
            allPageSelected={allPageSelected}
            somePageSelected={somePageSelected}
            handleToggleAll={handleToggleAll}
            pagedRows={pagedRows}
            page={page}
            itemsPerPage={itemsPerPage}
            selectedIds={selectedIds}
            handleToggleRow={handleToggleRow}
            loading={loading}
            handleOpenModal={handleOpenModal}
          />

          {!isInitialLoad && filteredRows.length > 0 && (
            <SipRegisterPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        className="z-50"
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 8,
          },
        }}
        PaperProps={{ sx: trunkModalPaperSx }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={trunkModalTitleStyle}>
          {editIndex !== null ? "Edit SIP Register" : "Add SIP Register"}
        </DialogTitle>

        <SipRegisterModalTabs
          value={modalTab}
          onChange={setModalTab}
          tabs={[
            { id: "basic", label: "BASIC" },
            { id: "codec", label: "CODEC" },
            { id: "advance", label: "ADVANCE" },
            { id: "dod", label: "DOD" },
            { id: "adapt", label: "ADAPT CALLER ID" },
          ]}
        />

        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
          }}
          sx={sipRegisterModalDialogContentSx}
        >
          <style>
            {`
        .sip-reg .MuiOutlinedInput-root,
        .sip-reg .MuiSelect-root,
        .sip-reg .MuiSelect-select,
        .sip-reg .MuiInputBase-root input {
          background: #ffffff !important;
        }

        .sip-reg .MuiOutlinedInput-root {
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
        }

        .sip-reg .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
          border-color: ${OUTLINED_BORDER} !important;
          border-width: 1px !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
        }

        .sip-reg .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: ${OUTLINED_HOVER} !important;
        }

        .sip-reg .MuiOutlinedInput-root.Mui-focused {
          box-shadow: ${FOCUS_RING_SHADOW} !important;
        }

        .sip-reg .MuiOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline {
          border-color: ${OUTLINED_FOCUS} !important;
          border-width: 1px !important;
        }

        .sip-reg .MuiOutlinedInput-input {
          font-size: 13px !important;
          padding: 8px 12px !important;
        }

        .sip-reg label,
        .sip-reg .MuiFormControlLabel-label,
        .sip-reg .MuiInputLabel-root {
          color: ${TRUNK_FIELD_LABEL_COLOR} !important;
        }

        .sip-reg label {
          text-align: left !important;
        }

        .sip-reg .MuiFormControlLabel-label,
        .sip-reg .MuiInputLabel-root {
          font-size: 13px !important;
          font-weight: 600 !important;
        }

        .sip-reg .MuiFormControlLabel-root {
          margin: 0 !important;
          margin-left: 0 !important;
          align-items: center !important;
        }

      `}
          </style>

          <div className="sip-reg" style={trunkModalFormPanelStyle}>
            {modalTab === "basic" && (
              <SipRegisterBasicTab
                form={form}
                validationErrors={validationErrors}
                handleChange={handleChange}
                editIndex={editIndex}
                ethPortOptions={ethPortOptions}
                showPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
              />
            )}
            {modalTab === "codec" && (
              <SipRegisterCodecTab
                selectedCodecList={selectedCodecList}
                updateCodecList={updateCodecList}
                getCodecLabel={getCodecLabel}
                validationErrors={validationErrors}
              />
            )}
            {modalTab === "advance" && (
              <SipRegisterAdvanceTab
                form={form}
                validationErrors={validationErrors}
                handleChange={handleChange}
                dnisRows={dnisRows}
                setDnisRows={setDnisRows}
                PREFERRED_ASSERTED_IDENTITY_OPTIONS={PREFERRED_ASSERTED_IDENTITY_OPTIONS}
                REMOTE_PARTY_ID_OPTIONS={REMOTE_PARTY_ID_OPTIONS}
                CONTACT_MODE_OPTIONS={CONTACT_MODE_OPTIONS}
              />
            )}
            {modalTab === "dod" && (
              <SipRegisterDodTab
                dodRows={dodRows}
                setDodRows={setDodRows}
                dodSelected={dodSelected}
                setDodSelected={setDodSelected}
                showDodAddModal={showDodAddModal}
                setShowDodAddModal={setShowDodAddModal}
                dodAddName={dodAddName}
                setDodAddName={setDodAddName}
                dodAddNumber={dodAddNumber}
                setDodAddNumber={setDodAddNumber}
                dodMemberExtensions={dodMemberExtensions}
                setDodMemberExtensions={setDodMemberExtensions}
                dodAvailableExtensions={dodAvailableExtensions}
                dodAvailableEmptyText={dodAvailableEmptyText}
                getDodExtLabel={getDodExtLabel}
                handleOpenDodAddModal={handleOpenDodAddModal}
                handleConfirmDodAdd={handleConfirmDodAdd}
                resetDodAddForm={resetDodAddForm}
                showMessage={showMessage}
              />
            )}
            {modalTab === "adapt" && (
              <SipRegisterAdaptTab adaptRows={adaptRows} setAdaptRows={setAdaptRows} />
            )}
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} color="inherit" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Btn>
          <Btn
            variant="cancel"
            onClick={handleCloseModal}
            disabled={loading.save}
            style={trunkModalCancelBtnStyle}
          >
            Close
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SipRegisterPage;
