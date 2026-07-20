import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
  CircularProgress,
  Checkbox,
  InputAdornment,
  IconButton,
  FormControl,
  Select as MuiSelect,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  SIP_TO_SIP_ACCOUNT_FIELDS,
  SIP_TO_SIP_ACCOUNT_TABLE_COLUMNS,
  SIP_TO_SIP_ACCOUNT_FORM_LAYOUT,
  SIP_TO_SIP_ACCOUNT_BTN_INVERSE,
  SIP_TO_SIP_ACCOUNT_BTN_DELETE,
  SIP_TO_SIP_ACCOUNT_BTN_CLEAR_ALL,
  SIP_TO_SIP_ACCOUNT_BTN_ADD_NEW,
  SIP_TO_SIP_ACCOUNT_BTN_SAVE,
  SIP_TO_SIP_ACCOUNT_BTN_SAVING,
  SIP_TO_SIP_ACCOUNT_BTN_CLOSE,
  SIP_TO_SIP_ACCOUNT_MODAL_ADD_TITLE,
  SIP_TO_SIP_ACCOUNT_MODAL_EDIT_TITLE,
  SIP_TO_SIP_ACCOUNT_SECTION_GENERAL,
  SIP_TO_SIP_ACCOUNT_COL_MODIFY,
  SIP_TO_SIP_ACCOUNT_EMPTY_MESSAGE,
  SIP_TO_SIP_ACCOUNT_RECORD_LABEL,
  SIP_TO_SIP_ACCOUNT_SELECTED_SUFFIX,
  SIP_TO_SIP_ACCOUNT_EDIT_TITLE_ACCESS,
  SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_AVAILABLE,
  SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_SELECTED,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_PASSWORD,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTEXT,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_EXTENSION,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_DOMAIN,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT_USER,
  SIP_TO_SIP_ACCOUNT_PLACEHOLDER_OUTBOUND_PROXY,
  SIP_TO_SIP_ACCOUNT_CONTACT_PREFIX,
  SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_ROOT,
  SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_SECTION,
  SIP_TO_SIP_ACCOUNT_PAGE_TITLE,
} from "../../../constants/SipToSipAccountConstants";
import { useSipToSipAccountPage } from "./hooks/useSipToSipAccountPage";
import {
  Btn,
  TH,
  ExtensionBreadcrumb as SipToSipBreadcrumb,
  ExtensionPagination as SipToSipPagination,
  ExtensionTableListLoading as TableListLoading,
  ExtensionTableListEmptyState as TableListEmptyState,
  extensionPageWrapStyle as sipToSipPageWrapStyle,
  extensionPageInnerStyle as sipToSipInnerStyle,
  extensionFixedAlertSx as sipToSipFixedAlertSx,
  extensionCardStyle as sipToSipCardStyle,
  extensionToolbarStyle as sipToSipToolbarStyle,
  extensionSelectedBadgeStyle as sipToSipSelectedBadgeStyle,
  extensionCancelBtnStyle as sipToSipCancelBtnStyle,
  extensionPrimaryBtnStyle as sipToSipPrimaryBtnStyle,
  extensionTableCheckboxSx as sipToSipTableCheckboxSx,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  extensionModalCancelBtnStyle as sipToSipModalCancelBtnStyle,
} from "../../../components/common";
import { C } from "../../../theme/pbxTokens";
import {
  SipToSipModalSectionHeading,
  SipToSipAllowCodecsSectionHeading,
  SipToSipSectionCard,
  SipToSipErrMsg,
  SipToSipFieldRow,
  SipToSipCodecDualList,
  SIP_TO_SIP_ACCOUNT_COMPACT_MQ,
  sipToSipModalTextFieldSx,
  sipToSipModalSelectSx,
  sipToSipModalTitleStyle,
  sipToSipDialogPaperSx,
  sipToSipModalFormPanelStyle,
} from "./components/SipToSipAccountFormFields";
import {
  sipToSipTableStyle,
  sipToSipEditIconStyle,
  getSipToSipRowBg,
  getSipToSipTdStyle,
} from "./components/SipToSipAccountTableHelpers";

const SipToSipAccountPage = () => {
  const isCompact = useMediaQuery(SIP_TO_SIP_ACCOUNT_COMPACT_MQ);
  const vm = useSipToSipAccountPage();
  const {
    accounts,
    selected,
    setSelected,
    showModal,
    modalScrollRef,
    showPassword,
    message,
    setMessage,
    loading,
    form,
    editIndex,
    validationErrors,
    isInitialLoad,
    selectedCodecList,
    allCodecOptions,
    getCodecLabel,
    updateCodecList,
    togglePasswordVisibility,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
    handleDelete,
    handleClearAll,
    page,
    setPage,
    totalPages,
    pagedAccounts,
    itemsPerPage,
  } = vm;

  const formFieldLabel = (field) => `${field.label}:`;

  const renderAllowCodecsSection = () => (
    <div style={{ width: "100%" }}>
      <SipToSipAllowCodecsSectionHeading
        tooltipKey="allow_codecs"
        required
      />
      <SipToSipCodecDualList
        allOptions={allCodecOptions}
        selected={selectedCodecList}
        onChange={updateCodecList}
        getLabel={getCodecLabel}
        emptyTextAvailable={SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_AVAILABLE}
        emptyTextSelected={SIP_TO_SIP_ACCOUNT_CODEC_EMPTY_SELECTED}
      />
      {validationErrors.allow_codecs && (
        <SipToSipErrMsg>{validationErrors.allow_codecs}</SipToSipErrMsg>
      )}
    </div>
  );

  const renderFormFieldControl = (field) => {
    if (field.type === "password") {
      return (
        <>
          <TextField
            type={showPassword ? "text" : "password"}
            value={form[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            placeholder={SIP_TO_SIP_ACCOUNT_PLACEHOLDER_PASSWORD}
            error={!!validationErrors[field.name]}
            sx={sipToSipModalTextFieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    size="small"
                    sx={{ padding: "2px" }}
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
          {validationErrors[field.name] && (
            <SipToSipErrMsg>{validationErrors[field.name]}</SipToSipErrMsg>
          )}
        </>
      );
    }

    if (field.name === "context") {
      return (
        <>
          <FormControl
            fullWidth
            size="small"
            error={!!validationErrors.context}
          >
            <MuiSelect
              value={form.context || ""}
              displayEmpty
              onChange={(e) => handleChange("context", e.target.value)}
              sx={sipToSipModalSelectSx}
            >
              <MenuItem value="" disabled>
                <em>{SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTEXT}</em>
              </MenuItem>
              {Array.from({ length: 10 }, (_, i) => `sip${i + 1}`).map(
                (ctx) => (
                  <MenuItem key={ctx} value={ctx}>
                    {ctx}
                  </MenuItem>
                ),
              )}
            </MuiSelect>
          </FormControl>
          {validationErrors.context && (
            <SipToSipErrMsg>{validationErrors.context}</SipToSipErrMsg>
          )}
        </>
      );
    }

    if (field.name === "contact") {
      return (
        <>
          <TextField
            type="text"
            value={
              form.contact ? String(form.contact).replace(/^sip:/, "") : ""
            }
            onChange={(e) => handleChange("contact", e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            error={!!validationErrors.contact}
            placeholder={SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT}
            sx={sipToSipModalTextFieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {SIP_TO_SIP_ACCOUNT_CONTACT_PREFIX}
                </InputAdornment>
              ),
            }}
          />
          {validationErrors.contact && (
            <SipToSipErrMsg>{validationErrors.contact}</SipToSipErrMsg>
          )}
        </>
      );
    }

    return (
      <>
        <TextField
          type="text"
          value={form[field.name] || ""}
          onChange={(e) => handleChange(field.name, e.target.value)}
          size="small"
          fullWidth
          variant="outlined"
          error={!!validationErrors[field.name]}
          placeholder={
            field.name === "extension"
              ? SIP_TO_SIP_ACCOUNT_PLACEHOLDER_EXTENSION
              : field.name === "from_domain"
                ? SIP_TO_SIP_ACCOUNT_PLACEHOLDER_DOMAIN
                : field.name === "contact_user"
                  ? SIP_TO_SIP_ACCOUNT_PLACEHOLDER_CONTACT_USER
                  : field.name === "outbound_proxy"
                    ? SIP_TO_SIP_ACCOUNT_PLACEHOLDER_OUTBOUND_PROXY
                    : `Enter ${field.label.toLowerCase()}`
          }
          disabled={field.name === "extension" && editIndex !== null}
          sx={sipToSipModalTextFieldSx}
        />
        {validationErrors[field.name] && (
          <SipToSipErrMsg>{validationErrors[field.name]}</SipToSipErrMsg>
        )}
      </>
    );
  };

  const renderFormField = (field) => (
    <SipToSipFieldRow
      key={field.name}
      label={formFieldLabel(field)}
      tooltipKey={field.name}
    >
      {renderFormFieldControl(field)}
    </SipToSipFieldRow>
  );

  return (
    <>
      <div
        style={{
          ...sipToSipPageWrapStyle,
          ...(isCompact ? { padding: 8 } : {}),
        }}
      >
        <div style={sipToSipInnerStyle}>
          {message.text && (
            <Alert
              severity={message.type}
              onClose={() => setMessage({ type: "", text: "" })}
              sx={sipToSipFixedAlertSx}
            >
              {message.text}
            </Alert>
          )}

          <SipToSipBreadcrumb
            root={SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_ROOT}
            section={SIP_TO_SIP_ACCOUNT_PAGE_BREADCRUMB_SECTION}
            current={SIP_TO_SIP_ACCOUNT_PAGE_TITLE}
          />

          <div style={sipToSipCardStyle}>
            <div
              style={{
                ...sipToSipToolbarStyle,
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
              {selected.length > 0 && (
                <span style={sipToSipSelectedBadgeStyle}>
                  {selected.length} {SIP_TO_SIP_ACCOUNT_SELECTED_SUFFIX}
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
                onClick={() =>
                  setSelected((sel) =>
                    accounts
                      .map((_, i) => (sel.includes(i) ? null : i))
                      .filter((i) => i !== null),
                  )
                }
                disabled={loading.delete || accounts.length === 0}
                variant="cancel"
                style={sipToSipCancelBtnStyle}
              >
                {SIP_TO_SIP_ACCOUNT_BTN_INVERSE}
              </Btn>
              <Btn
                onClick={() => handleDelete(selected)}
                disabled={loading.delete || selected.length === 0}
                variant="cancel"
                style={sipToSipCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {SIP_TO_SIP_ACCOUNT_BTN_DELETE}
              </Btn>
              <Btn
                onClick={handleClearAll}
                disabled={loading.delete || accounts.length === 0}
                variant="cancel"
                style={sipToSipCancelBtnStyle}
              >
                {SIP_TO_SIP_ACCOUNT_BTN_CLEAR_ALL}
              </Btn>
              <Btn
                onClick={() => handleOpenModal()}
                disabled={loading.fetch || loading.save}
                variant="primary"
                style={sipToSipPrimaryBtnStyle}
              >
                {SIP_TO_SIP_ACCOUNT_BTN_ADD_NEW}
              </Btn>
            </div>
          </div>

          {isInitialLoad ? (
            <TableListLoading />
          ) : accounts.length === 0 ? (
            <TableListEmptyState
              message={SIP_TO_SIP_ACCOUNT_EMPTY_MESSAGE}
              onAddNew={() => handleOpenModal()}
              buttonLabel={SIP_TO_SIP_ACCOUNT_BTN_ADD_NEW}
            />
          ) : (
            <>
              <div
                style={{
                  overflowX: isCompact ? "auto" : "hidden",
                  overflowY: "auto",
                  flex: 1,
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <table style={sipToSipTableStyle}>
                  <thead>
                    <tr>
                      <TH
                        style={{
                          width: 40,
                          padding: 0,
                          borderLeft: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={
                            selected.length > 0 &&
                            selected.length === accounts.length
                          }
                          indeterminate={
                            selected.length > 0 &&
                            selected.length < accounts.length
                          }
                          onChange={
                            selected.length === accounts.length
                              ? () => setSelected([])
                              : () => setSelected(accounts.map((_, i) => i))
                          }
                          disabled={loading.delete}
                          sx={sipToSipTableCheckboxSx}
                        />
                      </TH>
                      {SIP_TO_SIP_ACCOUNT_TABLE_COLUMNS.map((col) => (
                        <TH key={col.key}>{col.label}</TH>
                      ))}
                      <TH
                        style={{
                          width: 70,
                          borderRight: "none",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        {SIP_TO_SIP_ACCOUNT_COL_MODIFY}
                      </TH>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAccounts.map((item, idx) => {
                      const realIdx = (page - 1) * itemsPerPage + idx;
                      const isSelected = selected.includes(realIdx);
                      const isLastRow = idx === pagedAccounts.length - 1;
                      const rowBg = getSipToSipRowBg(isSelected, idx);
                      const lastRowCellStyle = isLastRow
                        ? { borderBottom: "none" }
                        : {};
                      return (
                        <tr
                          key={realIdx}
                          style={{
                            background: rowBg,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.background = rowBg;
                          }}
                        >
                          <td
                            style={getSipToSipTdStyle(rowBg, lastRowCellStyle, {
                              borderLeft: "none",
                              width: 36,
                            })}
                          >
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() =>
                                setSelected((sel) =>
                                  sel.includes(realIdx)
                                    ? sel.filter((i) => i !== realIdx)
                                    : [...sel, realIdx],
                                )
                              }
                              disabled={loading.delete}
                              sx={sipToSipTableCheckboxSx}
                            />
                          </td>
                          {SIP_TO_SIP_ACCOUNT_TABLE_COLUMNS.map((col) => (
                            <td
                              key={col.key}
                              style={getSipToSipTdStyle(rowBg, lastRowCellStyle, {
                                fontWeight: 400,
                              })}
                            >
                              {col.key === "password"
                                ? "*".repeat(item.password?.length || 0)
                                : col.key === "index"
                                  ? realIdx + 1
                                  : item[col.key] || "--"}
                            </td>
                          ))}
                          <td
                            style={getSipToSipTdStyle(rowBg, lastRowCellStyle, {
                              borderRight: "none",
                            })}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <EditDocumentIcon
                                titleAccess={SIP_TO_SIP_ACCOUNT_EDIT_TITLE_ACCESS}
                                onClick={() => {
                                  if (!loading.delete)
                                    handleOpenModal(item, realIdx);
                                }}
                                style={{
                                  ...sipToSipEditIconStyle,
                                  cursor: loading.delete
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: loading.delete ? 0.4 : 0.7,
                                }}
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

              <SipToSipPagination
                page={page}
                totalPages={totalPages}
                recordCount={pagedAccounts.length}
                onPageChange={(nextPage) =>
                  setPage(Math.min(totalPages, Math.max(1, nextPage)))
                }
              />
            </>
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 8,
          },
        }}
        PaperProps={{ sx: sipToSipDialogPaperSx }}
      >
        <DialogTitle style={sipToSipModalTitleStyle}>
          {editIndex !== null
            ? SIP_TO_SIP_ACCOUNT_MODAL_EDIT_TITLE
            : SIP_TO_SIP_ACCOUNT_MODAL_ADD_TITLE}
        </DialogTitle>
        <DialogContent
          ref={modalScrollRef}
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            overflowY: "auto",
            flex: "1 1 auto",
          }}
          sx={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div style={sipToSipModalFormPanelStyle}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingBottom: 8,
              }}
            >
              <SipToSipSectionCard title={SIP_TO_SIP_ACCOUNT_SECTION_GENERAL} isFirst>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px 32px",
                  }}
                >
                  {SIP_TO_SIP_ACCOUNT_FORM_LAYOUT.flat()
                    .map((name) =>
                      SIP_TO_SIP_ACCOUNT_FIELDS.find((f) => f.name === name),
                    )
                    .filter(Boolean)
                    .map((field) => renderFormField(field))}
                </div>
                {renderAllowCodecsSection()}
              </SipToSipSectionCard>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            variant="primary"
            disabled={loading.save}
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? SIP_TO_SIP_ACCOUNT_BTN_SAVING : SIP_TO_SIP_ACCOUNT_BTN_SAVE}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            variant="cancel"
            disabled={loading.save}
            style={sipToSipModalCancelBtnStyle}
          >
            {SIP_TO_SIP_ACCOUNT_BTN_CLOSE}
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
    </>
  );
};

export default SipToSipAccountPage;
