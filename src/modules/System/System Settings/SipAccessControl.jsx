import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  useMediaQuery,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  SIP_ACCESS_CONTROL_COLUMNS,
  SIP_ACCESS_CONTROL_BTN_INVERSE,
  SIP_ACCESS_CONTROL_BTN_DELETE,
  SIP_ACCESS_CONTROL_BTN_CLEAR_ALL,
  SIP_ACCESS_CONTROL_BTN_ADD_NEW,
  SIP_ACCESS_CONTROL_BTN_SAVE,
  SIP_ACCESS_CONTROL_BTN_CLOSE,
  SIP_ACCESS_CONTROL_BTN_ADD_RULE,
  SIP_ACCESS_CONTROL_MODAL_ADD_TITLE,
  SIP_ACCESS_CONTROL_MODAL_EDIT_TITLE,
  SIP_ACCESS_CONTROL_EMPTY_MESSAGE,
  SIP_ACCESS_CONTROL_RECORD_LABEL,
  SIP_ACCESS_CONTROL_SELECTED_SUFFIX,
  SIP_ACCESS_CONTROL_PAGINATION_SHOWING,
  SIP_ACCESS_CONTROL_MODE_OPTIONS,
  SIP_ACCESS_CONTROL_ACTION_OPTIONS,
  SIP_ACCESS_CONTROL_IPV4_CATCHALL,
  SIP_ACCESS_CONTROL_IPV6_CATCHALL,
  SIP_ACCESS_CONTROL_RULE_ORDER_NOTE,
} from "../../../constants/SipAccessControlConstants";
import { C } from "../../../theme/pbxTokens";
import { Btn } from "../../../components/common";
import { useSipAccessControlPage } from "./hooks/useSipAccessControlPage";
import {
  analyzeAclRules,
  getSipAccessControlModeLabel,
  formatAclRuleSummary,
} from "./utils/SipAccessControlTransformers";
import { normalizeAction } from "./utils/SipAccessControlValidators";
import {
  TH,
  getSipAccessControlTdStyle,
  getSipAccessControlRowBg,
  sipAccessControlCheckboxSx,
} from "./components/SipAccessControlTableHelpers";
import {
  SIP_ACCESS_CONTROL_SCROLL_CLASS,
  SIP_ACCESS_CONTROL_COMPACT_MQ,
  SipAccessControlPageShell,
  SipAccessControlBreadcrumb,
  SipAccessControlTableEmptyState,
  SipAccessControlEditIcon,
  SipAccessControlFieldLabel,
  sipAccessControlTableContainerStyle,
  sipAccessControlToolbarStyle,
  sipAccessControlFixedAlertSx,
  sipAccessControlCancelBtnStyle,
  sipAccessControlPrimaryBtnStyle,
  sipAccessControlSelectedBadgeStyle,
  sipAccessControlPaginationStyle,
  sipAccessControlModalFooterStyle,
  addNewModalFooterBtnStyle,
  sipAccessControlModalCancelBtnStyle,
  systemModalFieldInputStyle,
  systemModalSelectSx,
  inputInteraction,
  sipAccessControlRuleListStyle,
  sipAccessControlRuleRowStyle,
  sipAccessControlRuleLockedRowStyle,
  sipAccessControlRuleIconBtnStyle,
  sipAccessControlModeToggleWrapStyle,
  sipAccessControlOrderNoteStyle,
  sipAccessControlModeBadgeStyle,
  sipAccessControlRuleChipStyle,
} from "./components/SipAccessControlFormFields";

const SipAccessControl = () => {
  const isCompact = useMediaQuery(SIP_ACCESS_CONTROL_COMPACT_MQ);
  const vm = useSipAccessControlPage();
  const {
    rows,
    checkedRows,
    modalOpen,
    editingId,
    form,
    toast,
    setToast,
    saving,
    isWhitelistMode,
    selectedCount,
    allChecked,
    openModal,
    closeModal,
    handleFormChange,
    handleModeChange,
    handleBlockIpv6Toggle,
    handleRuleChange,
    handleAddRule,
    handleRemoveRule,
    handleMoveRule,
    handleSave,
    handleRowCheck,
    handleTableCheckAll,
    handleTableUncheckAll,
    handleTableInverse,
    handleDelete,
    handleClearAll,
  } = vm;

  return (
    <SipAccessControlPageShell isCompact={isCompact}>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={sipAccessControlFixedAlertSx}
        >
          {toast.msg}
        </Alert>
      )}

      <SipAccessControlBreadcrumb />

      <div style={sipAccessControlTableContainerStyle}>
        <div
          style={{
            ...sipAccessControlToolbarStyle,
            ...(isCompact
              ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
              : {}),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            {selectedCount > 0 && (
              <span style={sipAccessControlSelectedBadgeStyle}>
                {selectedCount} {SIP_ACCESS_CONTROL_SELECTED_SUFFIX}
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
              onClick={handleTableInverse}
              disabled={rows.length === 0}
              style={sipAccessControlCancelBtnStyle}
            >
              {SIP_ACCESS_CONTROL_BTN_INVERSE}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleDelete}
              disabled={selectedCount === 0}
              style={sipAccessControlCancelBtnStyle}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              {SIP_ACCESS_CONTROL_BTN_DELETE}
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleClearAll}
              disabled={rows.length === 0}
              style={sipAccessControlCancelBtnStyle}
            >
              {SIP_ACCESS_CONTROL_BTN_CLEAR_ALL}
            </Btn>
            <Btn
              variant="primary"
              onClick={() => openModal(null)}
              style={sipAccessControlPrimaryBtnStyle}
            >
              {SIP_ACCESS_CONTROL_BTN_ADD_NEW}
            </Btn>
          </div>
        </div>

        {rows.length === 0 ? (
          <SipAccessControlTableEmptyState
            message={SIP_ACCESS_CONTROL_EMPTY_MESSAGE}
            onAddNew={() => openModal(null)}
          />
        ) : (
          <>
            <div
              className={SIP_ACCESS_CONTROL_SCROLL_CLASS}
              style={{
                overflowX: "auto",
                overflowY: "auto",
                flex: 1,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                  minWidth: 1100,
                }}
              >
                <thead>
                  <tr>
                    {SIP_ACCESS_CONTROL_COLUMNS.map((col) => {
                      if (col.key === "check") {
                        return (
                          <TH
                            key={col.key}
                            style={{
                              width: 40,
                              padding: 0,
                              borderLeft: "none",
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={allChecked}
                              indeterminate={selectedCount > 0 && !allChecked}
                              onChange={(e) => {
                                if (e.target.checked) handleTableCheckAll();
                                else handleTableUncheckAll();
                              }}
                              sx={sipAccessControlCheckboxSx}
                            />
                          </TH>
                        );
                      }
                      if (col.key === "modify") {
                        return (
                          <TH
                            key={col.key}
                            style={{ width: 70, borderRight: "none" }}
                          >
                            {col.label}
                          </TH>
                        );
                      }
                      return <TH key={col.key}>{col.label}</TH>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => {
                    const isLastRow = idx === rows.length - 1;
                    const isRowChecked = !!checkedRows[row.id];
                    const rowBg = getSipAccessControlRowBg(isRowChecked, idx);
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowMode = analyzeAclRules(row.rules).mode;
                    const modeLabel = getSipAccessControlModeLabel(rowMode);

                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: rowBg,
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isRowChecked)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              width: 36,
                              borderLeft: "none",
                            },
                          )}
                        >
                          <Checkbox
                            size="small"
                            checked={isRowChecked}
                            onChange={() => handleRowCheck(row.id)}
                            sx={sipAccessControlCheckboxSx}
                          />
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          {row.name}
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                          )}
                        >
                          <span style={sipAccessControlModeBadgeStyle(rowMode)}>
                            {modeLabel}
                          </span>
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              maxWidth: 420,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            },
                          )}
                        >
                          {(row.rules || []).length === 0 ? (
                            "—"
                          ) : (
                            <div
                              style={{ display: "flex", flexWrap: "wrap" }}
                            >
                              {row.rules.map((rule, ruleIdx) => (
                                <span
                                  key={ruleIdx}
                                  style={sipAccessControlRuleChipStyle(
                                    normalizeAction(rule.action),
                                  )}
                                >
                                  {formatAclRuleSummary(rule)}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td
                          style={getSipAccessControlTdStyle(
                            rowBg,
                            lastRowCellStyle,
                            {
                              borderRight: "none",
                            },
                          )}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <SipAccessControlEditIcon
                              onClick={() => openModal(row)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={sipAccessControlPaginationStyle}>
              <span
                style={{ fontSize: 11, color: C.mutedText, lineHeight: 1.2 }}
              >
                {SIP_ACCESS_CONTROL_PAGINATION_SHOWING(
                  rows.length,
                  SIP_ACCESS_CONTROL_RECORD_LABEL,
                )}
              </span>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={closeModal}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{
          sx: {
            width: 620,
            maxWidth: "96vw",
            mx: "auto",
            p: 0,
            borderRadius: "4px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          style={{
            background: "#1e2d42",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 16,
            padding: "16px 24px",
            textAlign: "center",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          {editingId !== null
            ? SIP_ACCESS_CONTROL_MODAL_EDIT_TITLE
            : SIP_ACCESS_CONTROL_MODAL_ADD_TITLE}
        </DialogTitle>
        <DialogContent style={{ padding: "24px", backgroundColor: "#ffffff" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              background: "#f8fafc",
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 4,
              padding: 20,
            }}
          >
            {/* Name */}
            <div style={sipAccessControlRuleRowStyle}>
              <SipAccessControlFieldLabel tooltipKey="name">
                Name:
              </SipAccessControlFieldLabel>
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                <input
                  name="name"
                  type="text"
                  value={form.name || ""}
                  onChange={handleFormChange}
                  disabled={editingId !== null}
                  placeholder="e.g., office_whitelist"
                  maxLength={64}
                  style={{
                    ...systemModalFieldInputStyle,
                    width: "100%",
                    ...(editingId !== null
                      ? { background: "#eef1f4", color: C.mutedText, cursor: "not-allowed" }
                      : {}),
                  }}
                  {...inputInteraction}
                />
              </div>
            </div>

            {/* Mode */}
            <div style={sipAccessControlRuleRowStyle}>
              <SipAccessControlFieldLabel tooltipKey="mode">
                Mode:
              </SipAccessControlFieldLabel>
              <div style={sipAccessControlModeToggleWrapStyle}>
                {SIP_ACCESS_CONTROL_MODE_OPTIONS.map((opt) => (
                  <Btn
                    key={opt.value}
                    variant={
                      form.mode === opt.value ? "tabActive" : "tabInactive"
                    }
                    onClick={() => handleModeChange(opt.value)}
                    style={{ flex: 1, borderRadius: 4 }}
                  >
                    {opt.label}
                  </Btn>
                ))}
              </div>
            </div>

            {/* Locked catch-all rule(s) for whitelist mode */}
            {isWhitelistMode && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div style={sipAccessControlRuleLockedRowStyle}>
                  <LockOutlinedIcon sx={{ fontSize: 15 }} />
                  <span>
                    <strong>deny</strong> {SIP_ACCESS_CONTROL_IPV4_CATCHALL} —
                    blocks all IPv4 by default (added automatically, always
                    first)
                  </span>
                </div>

                <div style={sipAccessControlRuleRowStyle}>
                  <SipAccessControlFieldLabel tooltipKey="blockIpv6">
                    Block IPv6:
                  </SipAccessControlFieldLabel>
                  <Checkbox
                    size="small"
                    checked={!!form.blockIpv6}
                    onChange={(e) => handleBlockIpv6Toggle(e.target.checked)}
                    sx={{ padding: 0 }}
                  />
                </div>

                {form.blockIpv6 && (
                  <div style={sipAccessControlRuleLockedRowStyle}>
                    <LockOutlinedIcon sx={{ fontSize: 15 }} />
                    <span>
                      <strong>deny</strong> {SIP_ACCESS_CONTROL_IPV6_CATCHALL}{" "}
                      — blocks all IPv6 by default
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Editable rules */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <SipAccessControlFieldLabel style={{ width: "auto" }}>
                  {isWhitelistMode ? "Permitted IPs:" : "Rules:"}
                </SipAccessControlFieldLabel>
                <Btn
                  variant="cancel"
                  onClick={handleAddRule}
                  style={{ padding: "4px 10px", fontSize: 11, height: 26 }}
                >
                  {SIP_ACCESS_CONTROL_BTN_ADD_RULE}
                </Btn>
              </div>

              <div style={sipAccessControlRuleListStyle}>
                {form.rules.map((rule, idx) => (
                  <div key={idx} style={sipAccessControlRuleRowStyle}>
                    <Select
                      value={rule.action}
                      onChange={(e) =>
                        handleRuleChange(idx, "action", e.target.value)
                      }
                      sx={{ ...systemModalSelectSx, width: 130, flex: "0 0 130px" }}
                      MenuProps={{
                        PaperProps: { style: { maxHeight: 200, overflow: "auto" } },
                      }}
                    >
                      {SIP_ACCESS_CONTROL_ACTION_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <input
                      type="text"
                      value={rule.ip}
                      onChange={(e) =>
                        handleRuleChange(idx, "ip", e.target.value)
                      }
                      placeholder="e.g., 192.168.1.0/24"
                      style={{ ...systemModalFieldInputStyle, flex: 1, minWidth: 0 }}
                      {...inputInteraction}
                    />
                    <button
                      type="button"
                      onClick={() => handleMoveRule(idx, -1)}
                      disabled={idx === 0}
                      style={sipAccessControlRuleIconBtnStyle(idx === 0)}
                      title="Move up"
                    >
                      <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveRule(idx, 1)}
                      disabled={idx === form.rules.length - 1}
                      style={sipAccessControlRuleIconBtnStyle(
                        idx === form.rules.length - 1,
                      )}
                      title="Move down"
                    >
                      <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      style={sipAccessControlRuleIconBtnStyle(false)}
                      title="Remove rule"
                    >
                      <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                ))}
              </div>

              <span style={sipAccessControlOrderNoteStyle}>
                {SIP_ACCESS_CONTROL_RULE_ORDER_NOTE}
              </span>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{ p: 0, m: 0 }}
          style={sipAccessControlModalFooterStyle}
        >
          <Btn
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            style={addNewModalFooterBtnStyle}
          >
            {SIP_ACCESS_CONTROL_BTN_SAVE}
          </Btn>
          <Btn
            variant="cancel"
            onClick={closeModal}
            style={sipAccessControlModalCancelBtnStyle}
          >
            {SIP_ACCESS_CONTROL_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
    </SipAccessControlPageShell>
  );
};

export default SipAccessControl;