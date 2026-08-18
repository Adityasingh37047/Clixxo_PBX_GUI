import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
  TextField,
} from "@mui/material";
import {
  IVR_CHECK_VOICEMAIL_OPTIONS,
  IVR_DIRECT_EXTENSION_OPTIONS,
  IVR_ENABLE_OPTIONS,
  IVR_FXO_FLASH_TRANSFER_OPTIONS,
  IVR_KEYS,
  IVR_MODAL_TABS,
  IVR_TITLE,
} from "../../../constants/IVRConstants";
import {
  Btn,
  TH,
  tdStyle,
  ExtensionBreadcrumb as IvrBreadcrumb,
  ExtensionTableListLoading as IvrTableListLoading,
  ExtensionTableListEmptyState as IvrTableListEmptyState,
  ExtensionPagination as IvrPagination,
  ExtensionModalTabs as IvrModalTabs,
  extensionTableCheckboxSx as ivrTableCheckboxSx,
  extensionFixedAlertSx as ivrFixedAlertSx,
  extensionPageWrapStyle as ivrPageWrapStyle,
  extensionPageInnerStyle as ivrPageInnerStyle,
  extensionCardStyle as ivrCardStyle,
  extensionToolbarStyle as ivrToolbarStyle,
  extensionSelectedBadgeStyle as ivrSelectedBadgeStyle,
  extensionCancelBtnStyle as ivrCancelBtnStyle,
  extensionPrimaryBtnStyle as ivrPrimaryBtnStyle,
  ExtensionCodecDualList as IvrCodecDualList,
} from "../../../components/common";
import { useIVRPage } from "./hooks/useIVRPage";
import {
  C,
  getIvrRowBg,
  ivrEditIconStyle,
  handleIvrEditIconHover,
} from "./IVRTableHelpers";
import {
  IvrFieldRow,
  addNewModalFooterBtnStyle,
  addNewModalFooterStyle,
  ivrModalCancelBtnStyle,
  ivrModalDialogContentSx,
  ivrModalFormStyle,
  ivrModalPaperSx,
  ivrModalSelectMenuProps,
  ivrModalSelectSx,
  ivrModalTextFieldFullSx,
  ivrModalTitleStyle,
} from "./IVRFormFields";
import { TEXT_TARGET_TYPES } from "./utils/IVRTransformers";

const KEYS = IVR_KEYS;

const IVRPage = () => {
  const vm = useIVRPage();
  const {
    isCompact,
    rows,
    selected,
    showModal,
    activeTab,
    loading,
    message,
    isInitialLoad,
    modalScrollRef,
    itemsPerPage,
    page,
    searchQuery,
    searchFocused,
    setSearchQuery,
    setSearchFocused,
    setPage,
    editId,
    name,
    ivrNumber,
    greetLong,
    greetShort,
    responseTimeout,
    password,
    showPassword,
    checkVoicemail,
    directOutbound,
    interDigitTimeout,
    maxFailures,
    maxTimeouts,
    digitLength,
    enabled,
    directExtension,
    fxoFlashTransfer,
    invalidSound,
    exitSound,
    ringBack,
    callerIdNamePrefix,
    exitActionType,
    exitActionValue,
    selectedOutboundRouteIds,
    keyDestinations,
    keyDestinationValues,
    filteredRows,
    totalPages,
    pagedRows,
    allPageSelected,
    somePageSelected,
    getOutboundRouteLabel,
    allOutboundRouteOptions,
    actionTypeOptions,
    keyActionTypeOptions,
    formatActionLabel,
    getDestinationListForType,
    greetLongOptions,
    greetShortOptions,
    invalidSoundOptions,
    exitSoundOptions,
    ringBackOptions,
    ringBackAllValues,
    setMessage,
    setActiveTab,
    setName,
    setIvrNumber,
    setGreetLong,
    setGreetShort,
    setResponseTimeout,
    setPassword,
    setShowPassword,
    setCheckVoicemail,
    setDirectOutbound,
    setInterDigitTimeout,
    setMaxFailures,
    setMaxTimeouts,
    setDigitLength,
    setEnabled,
    setDirectExtension,
    setFxoFlashTransfer,
    setInvalidSound,
    setExitSound,
    setRingBack,
    setCallerIdNamePrefix,
    setExitActionType,
    setExitActionValue,
    setSelectedOutboundRouteIds,
    handleGoToVoicePrompts,
    handleToggleRow,
    handleToggleAll,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleDelete,
    handleSave,
    handleKeyDestinationChange,
    handleKeyDestinationValueChange,
  } = vm;

  const renderDestinationSelect = (type, value, onChange) => {
    if (!type) {
      return (
        <TextField
          size="small"
          disabled
          fullWidth
          sx={{ background: "#f8fafc" }}
          inputProps={{ style: { fontSize: 13, padding: "6px 8px" } }}
        />
      );
    }
    if (TEXT_TARGET_TYPES.has(type)) {
      return (
        <TextField
          size="small"
          fullWidth
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          sx={ivrModalTextFieldFullSx}
        />
      );
    }
    const list = getDestinationListForType(type);
    return (
      <FormControl size="small" fullWidth>
        <MuiSelect
          value={value || ""}
          displayEmpty
          onChange={(e) => onChange(e.target.value)}
          renderValue={(v) => {
            if (!v) return "Select destination";
            // Show option label (name) after select — not only the raw value/number.
            const opt = list.find((i) => String(i.value) === String(v));
            return opt?.label || v;
          }}
          sx={{ fontSize: 13, background: "#fff" }}
        >
          <MenuItem value="">
            <em>Select destination</em>
          </MenuItem>
          {(!list || list.length === 0) && (
            <MenuItem value="" disabled>
              No options available
            </MenuItem>
          )}
          {value && !list.some((item) => item.value === value) && (
            <MenuItem value={value}>{value}</MenuItem>
          )}
          {list.map((item) => (
            <MenuItem key={item.value} value={item.value} sx={{ fontSize: 13 }}>
              {item.label || item.value}
            </MenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    );
  };

  return (
    <div
      style={{
        ...ivrPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={ivrPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={ivrFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <IvrBreadcrumb section="Call Features" current={IVR_TITLE} />

        <div style={ivrCardStyle}>
          <div
            style={{
              ...ivrToolbarStyle,
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
                flexWrap: "wrap",
              }}
            >
              {selected.length > 0 && (
                <span style={ivrSelectedBadgeStyle}>
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
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffff",
                  border: `0.5px solid ${searchFocused ? C.accent : C.cardBorder}`,
                  borderRadius: 6,
                  padding: "5px 10px",
                  transition: "border-color 0.15s ease",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: searchFocused ? C.accent : C.mutedText,
                  }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search IVRs..."
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 11,
                    color: C.valueText,
                    outline: "none",
                    width: 160,
                  }}
                />
                {searchQuery && (
                  <span
                    onClick={() => setSearchQuery("")}
                    style={{
                      fontSize: 11
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </span>
                )}
              </div> */}

              {/* <Btn
                onClick={handlePrev}
                disabled={loading.list || page <= 1}
                variant="outline"
              >
                ← Prev
              </Btn>
              <Btn
                onClick={handleNext}
                disabled={loading.list || page >= totalPages}
                variant="outline"
              >
                Next →
              </Btn> */}
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.list || selected.length === 0
                }
                variant="cancel"
                style={ivrCancelBtnStyle}
              >
                {loading.delete && (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                )}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>

              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.list}
                variant="primary"
                style={ivrPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "hidden", overflowY: "auto", flex: 1 , ...(isCompact ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : {}) }}>
            {isInitialLoad ? (
              <IvrTableListLoading />
            ) : rows.length === 0 ? (
              <IvrTableListEmptyState
                message="No IVRs found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchQuery && filteredRows.length === 0 ? (
              <IvrTableListEmptyState
                message={`No results for "${searchQuery}"`}
                showButton={false}
              />
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  tableLayout: "auto",
                }}
              >
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
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={ivrTableCheckboxSx}
                      />
                    </TH>
                    <TH
                      style={{
                        width: 36,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      ID
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Name
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      IVR Number
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Enabled
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Direct Outbound
                    </TH>
                    <TH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      Outbound Routes
                    </TH>
                    <TH
                      style={{
                        width: 70,
                        borderRight: "none",
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
                  {pagedRows.map((row, idx) => {
                    const realIdx = (page - 1) * itemsPerPage + idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === pagedRows.length - 1;
                    const rowBg = getIvrRowBg(isSelected, idx);

                    return (
                      <tr
                        key={row.id || realIdx}
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
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(realIdx)}
                            sx={ivrTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.name}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                              color: C.valueText,
                              padding: "4px 11px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {row.ivrNumber}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                              color:
                                row.enabled === "Yes" ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.enabled}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          <span
                            style={{
                              color: row.directOutbound ? "#16a34a" : "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: "0.01em",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.directOutbound ? "Yes" : "No"}
                          </span>
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                          }}
                        >
                          {row.memberOutboundIds?.length > 0 ? (
                            row.memberOutboundIds
                              .map(getOutboundRouteLabel)
                              .join(", ")
                          ) : (
                            <span style={{ color: C.mutedText }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            background: rowBg,
                            borderBottom: isLastRow
                              ? "none"
                              : tdStyle.borderBottom,
                            borderRight: "none",
                          }}
                        >
                          <EditDocumentIcon
                            titleAccess="Edit"
                            onClick={() => handleOpenEditModal(row)}
                            style={ivrEditIconStyle}
                            onMouseEnter={(e) =>
                              handleIvrEditIconHover(e, true)
                            }
                            onMouseLeave={(e) =>
                              handleIvrEditIconHover(e, false)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && rows.length > 0 && filteredRows.length > 0 && (
            <IvrPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedRows.length}
              onPageChange={(p) =>
                setPage(Math.min(totalPages, Math.max(1, p)))
              }
            />
          )}
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={loading.save ? null : handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: { ...ivrModalPaperSx, borderRadius: editId == null ? "4px" : ivrModalPaperSx.borderRadius } }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <DialogTitle style={ivrModalTitleStyle}>
          {editId != null ? "Edit IVR" : "Add IVR"}
        </DialogTitle>

        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          style={{
            padding: "0px 24px 20px",
            backgroundColor: "#ffffff",
          }}
          sx={ivrModalDialogContentSx}
        >
          <div
            style={{
              borderBottom: `1px solid ${C.divider}`,
              background: "#ffffff",
              marginLeft: "-24px",
              marginRight: "-24px",
            }}
          >
            <IvrModalTabs
              value={activeTab}
              onChange={setActiveTab}
              tabs={IVR_MODAL_TABS}
            />
          </div>
          <div style={ivrModalFormStyle}>
            <div style={{ padding: 0 }}>
              {/* ── BASIC TAB ── */}
              {activeTab === "basic" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div
  style={{
    padding: "0",
  }}
>
                    {/* ── Naya "Basic" Heading ── */}
                    
                    {/* 2-Column Grid for Basic fields */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr", ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                        gap: "16px 40px",
                      }}
                    >
                      {/* Left Column */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                  <IvrFieldRow label="Name" tooltipKey="name" required>
  <TextField
    size="small"
    fullWidth
    value={name}
    onChange={(e) => setName(e.target.value)}
    sx={ivrModalTextFieldFullSx}
  />
</IvrFieldRow>
                        <IvrFieldRow label="IVR Number" tooltipKey="ivr_number" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={ivrNumber}
                            onChange={(e) => setIvrNumber(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Greet Long" tooltipKey="greet_long" required>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              width: "100%",
                            }}
                          >
                            <FormControl size="small" fullWidth>
                              <MuiSelect
                                value={greetLong}
                                onChange={(e) => setGreetLong(e.target.value)}
                                sx={ivrModalSelectSx}
                              >
                                {greetLongOptions.map((opt) => (
                                  <MenuItem
                                    key={opt}
                                    value={opt}
                                    sx={{ fontSize: 13 }}
                                  >
                                    {opt}
                                  </MenuItem>
                                ))}
                              </MuiSelect>
                            </FormControl>
                            <span
                              onClick={handleGoToVoicePrompts}
                              style={{
                                fontSize: 11,
                                color: C.accent,
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              Prompt
                            </span>
                          </div>
                        </IvrFieldRow>

                        <IvrFieldRow label="Greet Short" tooltipKey="greet_short" required>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              width: "100%",
                            }}
                          >
                            <FormControl size="small" fullWidth>
                              <MuiSelect
                                value={greetShort}
                                onChange={(e) => setGreetShort(e.target.value)}
                                sx={ivrModalSelectSx}
                              >
                                {greetShortOptions.map((opt) => (
                                  <MenuItem
                                    key={opt}
                                    value={opt}
                                    sx={{ fontSize: 13 }}
                                  >
                                    {opt}
                                  </MenuItem>
                                ))}
                              </MuiSelect>
                            </FormControl>
                            <span
                              onClick={handleGoToVoicePrompts}
                              style={{
                                fontSize: 11,
                                color: C.accent,
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                            >
                              Prompt
                            </span>
                          </div>
                        </IvrFieldRow>

                        <IvrFieldRow label="Response Timeout(ms)" tooltipKey="response_timeout" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={responseTimeout}
                            onChange={(e) => setResponseTimeout(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Password" tooltipKey="password" required>
                          <TextField
                            size="small"
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <VisibilityOff sx={{ fontSize: 16 }} />
                                    ) : (
                                      <Visibility sx={{ fontSize: 16 }} />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Check Voicemail" tooltipKey="check_voicemail" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={checkVoicemail}
                              onChange={(e) =>
                                setCheckVoicemail(e.target.value)
                              }
                              sx={ivrModalSelectSx}
                            >
                              {IVR_CHECK_VOICEMAIL_OPTIONS.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={{ fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </IvrFieldRow>

                        <IvrFieldRow
                          label="Direct Outbound"
                          tooltipKey="direct_outbound"
                          labelWidth={170}
                        >
                          <Checkbox
                            checked={directOutbound}
                            onChange={(e) =>
                              setDirectOutbound(e.target.checked)
                            }
                            size="small"
                            sx={ivrTableCheckboxSx}
                          />
                        </IvrFieldRow>
                      </div>

                      {/* Right Column */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <IvrFieldRow label="Inter-Digit Timeout(ms)" tooltipKey="inter_digit_timeout" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={interDigitTimeout}
                            onChange={(e) =>
                              setInterDigitTimeout(e.target.value)
                            }
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Max Failures" tooltipKey="max_failures" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={maxFailures}
                            onChange={(e) => setMaxFailures(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Max Timeouts" tooltipKey="max_timeouts" required>
                          <TextField  
                            size="small"
                            fullWidth
                            type="number"
                            value={maxTimeouts}
                            onChange={(e) => setMaxTimeouts(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Digit Length" tooltipKey="digit_length" required>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            value={digitLength}
                            onChange={(e) => setDigitLength(e.target.value)}
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        <IvrFieldRow label="Enabled" tooltipKey="enabled" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={enabled}
                              onChange={(e) => setEnabled(e.target.value)}
                              sx={ivrModalSelectSx}
                            >
                              {IVR_ENABLE_OPTIONS.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={{ fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </IvrFieldRow>

                        <IvrFieldRow label="Direct Extension" tooltipKey="direct_extension" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={directExtension}
                              onChange={(e) =>
                                setDirectExtension(e.target.value)
                              }
                              sx={ivrModalSelectSx}
                            >
                              {IVR_DIRECT_EXTENSION_OPTIONS.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={{ fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </IvrFieldRow>

                        <IvrFieldRow label="FXO Flash Transfer" tooltipKey="fxo_flash_transfer" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={fxoFlashTransfer}
                              onChange={(e) =>
                                setFxoFlashTransfer(e.target.value)
                              }
                              sx={ivrModalSelectSx}
                            >
                              {IVR_FXO_FLASH_TRANSFER_OPTIONS.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={{ fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </IvrFieldRow>
                      </div>
                    </div>

                    {/* Outbound Routes Section (Conditionally Rendered before Advanced) */}
                    {directOutbound && (
                      <div
                        style={{
                          marginTop: 24,
                          paddingTop: 16,
                       
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 12,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: C.labelText,
                            }}
                          >
                            Outbound Routes{" "}
                            <span style={{ color: C.errorRed }}>*</span>
                          </span>
                        </div>

                        <IvrCodecDualList
                          style={{ marginTop: 16 }}
                          allOptions={
                            loading.outboundRoutes ? [] : allOutboundRouteOptions
                          }
                          selected={selectedOutboundRouteIds}
                          onChange={setSelectedOutboundRouteIds}
                          getLabel={getOutboundRouteLabel}
                          emptyTextAvailable={
                            loading.outboundRoutes
                              ? "Loading routes..."
                              : "No routes available"
                          }
                          emptyTextSelected="No selected routes"
                        />
                      </div>
                    )}

                    {/* Advanced Divider */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "32px 0 20px 0",
                      }}
                    >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.labelText,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Advanced
                        </span>

                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: C.cardBorder,
                          marginLeft: 12,
                        }}
                      />
                    </div>

                    {/* Advanced Section 2-Column Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr", ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                        gap: "16px 40px",
                      }}
                    >
                      {/* Advanced Left Column */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <IvrFieldRow label="Invalid Sound" tooltipKey="invalid_sound" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={invalidSound}
                              onChange={(e) => setInvalidSound(e.target.value)}
                              sx={ivrModalSelectSx}
                            >
                              {invalidSoundOptions.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={{ fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </IvrFieldRow>

                        <IvrFieldRow label="Exit Sound" tooltipKey="exit_sound" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={exitSound}
                              onChange={(e) => setExitSound(e.target.value)}
                              sx={ivrModalSelectSx}
                            >
                              {exitSoundOptions.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={{ fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </IvrFieldRow>

                        <IvrFieldRow label="Exit Action" tooltipKey="exit_action" required>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={exitActionType || ""}
                              displayEmpty
                              onChange={(e) => {
                                setExitActionType(e.target.value);
                                setExitActionValue("");
                              }}
                              renderValue={(value) =>
                                value
                                  ? formatActionLabel(value)
                                  : "Select action"
                              }
                              MenuProps={ivrModalSelectMenuProps}
                              sx={ivrModalSelectSx}
                            >
                              <MenuItem value="" sx={{ fontSize: 13 }}>
                                <em>Select action</em>
                              </MenuItem>
                              {actionTypeOptions.map((opt) => (
                                <MenuItem
                                  key={opt}
                                  value={opt}
                                  sx={{ fontSize: 13 }}
                                >
                                  {formatActionLabel(opt)}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </IvrFieldRow>
                      </div>

                      {/* Advanced Right Column */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <IvrFieldRow label="Ring Back" tooltipKey="ring_back" alignTop>
                          <FormControl size="small" fullWidth>
                            <MuiSelect
                              value={ringBack}
                              onChange={(e) => setRingBack(e.target.value)}
                              MenuProps={ivrModalSelectMenuProps}
                              sx={ivrModalSelectSx}
                            >
                              {ringBack &&
                                !ringBackAllValues.includes(ringBack) && (
                                  <MenuItem
                                    value={ringBack}
                                    sx={{ fontSize: 13 }}
                                  >
                                    {ringBack}
                                  </MenuItem>
                                )}
                              {ringBackOptions.moh_categories.length > 0 && (
                                <ListSubheader
                                  disableSticky
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: 12,
                                    lineHeight: "24px",
                                  }}
                                >
                                  Music on Hold
                                </ListSubheader>
                              )}
                              {ringBackOptions.moh_categories.map((opt) => (
                                <MenuItem
                                  key={`moh-${opt}`}
                                  value={opt}
                                  sx={{ pl: 3, fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                              {ringBackOptions.custom_prompts.length > 0 && (
                                <ListSubheader
                                  disableSticky
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: 12,
                                    lineHeight: "24px",
                                  }}
                                >
                                  Custom Prompt
                                </ListSubheader>
                              )}
                              {ringBackOptions.custom_prompts.map((opt) => (
                                <MenuItem
                                  key={`prompt-${opt}`}
                                  value={opt}
                                  sx={{ pl: 3, fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                              {ringBackOptions.country_tones.length > 0 && (
                                <ListSubheader
                                  disableSticky
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: 12,
                                    lineHeight: "24px",
                                  }}
                                >
                                  Ring Back
                                </ListSubheader>
                              )}
                              {ringBackOptions.country_tones.map((opt) => (
                                <MenuItem
                                  key={`tone-${opt}`}
                                  value={opt}
                                  sx={{ pl: 3, fontSize: 13 }}
                                >
                                  {opt}
                                </MenuItem>
                              ))}
                            </MuiSelect>
                          </FormControl>
                        </IvrFieldRow>

                        <IvrFieldRow label="Caller ID Name Prefix" tooltipKey="caller_id_name_prefix" required>
                          <TextField
                            size="small"
                            fullWidth
                            value={callerIdNamePrefix}
                            onChange={(e) =>
                              setCallerIdNamePrefix(e.target.value)
                            }
                            sx={ivrModalTextFieldFullSx}
                          />
                        </IvrFieldRow>

                        {exitActionType && (
                          <IvrFieldRow label="Destination" tooltipKey="exit_destination" required>
                            {renderDestinationSelect(
                              exitActionType,
                              exitActionValue,
                              setExitActionValue,
                            )}
                          </IvrFieldRow>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── KEY PRESS TAB ── */}
              {activeTab === "keypress" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div style={{ padding: 0 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr 1fr",
                      gap: 16,
                      marginBottom: 12,
                      borderBottom: `1px solid ${C.cardBorder}`,
                      paddingBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.labelText,
                      }}
                    >
                      Option
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.labelText,
                      }}
                    >
                      Destination
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.labelText,
                      }}
                    >
                      Target
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.labelText,
                    }}
                  >
                    {KEYS.map((key) => (
                      <div
                        key={key}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "100px 1fr 1fr",
                          gap: 16,
                          alignItems: "center",
                          borderBottom: `1px solid ${C.cardBorder}`,
                          paddingBottom: 12,
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.labelText,
                          }}
                        >
                          Digit{" "}
                          <span
                            style={{
                              color: C.accent,
                              padding: "2px 6px",
                              background: "#f1f5f9",
                              borderRadius: 4,
                              marginLeft: 4,
                            }}
                          >
                            {key}
                          </span>
                        </span>
                        <FormControl size="small" fullWidth>
                          <MuiSelect
                            value={keyDestinations[key] || ""}
                            displayEmpty
                            onChange={(e) => {
                              const val = e.target.value;
                              handleKeyDestinationChange(key, val);
                              handleKeyDestinationValueChange(key, "");
                            }}
                            renderValue={(value) =>
                              value
                                ? formatActionLabel(value)
                                : "Select destination"
                            }
                            sx={{ fontSize: 13, background: "#fff" }}
                          >
                            <MenuItem value="" sx={{ fontSize: 13 }}>
                              <em>Select destination</em>
                            </MenuItem>
                            {keyActionTypeOptions.map((opt) => (
                              <MenuItem
                                key={opt}
                                value={opt}
                                sx={{ fontSize: 13 }}
                              >
                                {formatActionLabel(opt)}
                              </MenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        <div>
                          {renderDestinationSelect(
                            keyDestinations[key],
                            keyDestinationValues[key],
                            (val) => handleKeyDestinationValueChange(key, val),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSave}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <>
                <CircularProgress size={14} style={{ color: "#fff" }} />
                Saving...
              </>
            ) : editId != null ? (
              "Update IVR"
            ) : (
              "Create IVR"
            )}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={ivrModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IVRPage;
