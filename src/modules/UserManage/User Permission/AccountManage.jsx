import React from "react";
import { Alert, Checkbox } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  ACCOUNT_MANAGE_BUTTON_LABELS,
  ACCOUNT_MANAGE_BUTTON_VARIANTS,
  ACCOUNT_MANAGE_CARD_TITLE,
  ACCOUNT_MANAGE_ICON_COLORS,
  ACCOUNT_MANAGE_MESSAGES,
  ACCOUNT_MANAGE_TABLE_COLUMNS,
  ACCOUNT_MANAGE_TOOLBAR_CANCEL_BUTTON_STYLE,
  ACCOUNT_MANAGE_TOOLBAR_PRIMARY_BUTTON_STYLE,
} from "../../../constants/AccountManageConstants";
import { C } from "../../../theme/pbxTokens";
import { Btn } from "../../../components/common";
import { useAccountManagePage } from "./hooks/useAccountManagePage";
import {
  AccountManageBreadcrumb,
  AccountManageLoadingBanner,
  AccountManageModal,
} from "./components/AccountManageFormFields";
import {
  accountManageBlueBarStyle,
  accountManageCheckboxSx,
  accountManageFixedAlertSx,
  accountManageFooterStyle,
  accountManagePageInnerStyle,
  accountManagePageWrapStyle,
  accountManageSelectedBadgeStyle,
  accountManageTableContainerStyle,
  accountManageTdStyle,
  AccountManageTH,
  CARD_RADIUS,
} from "./components/AccountManageTableHelpers";
import { getRowBackground } from "./utils/AccountManageTransformers";

const AccountManage = () => {
  const {
    canWrite,
    showReadOnlyToast,
    accounts,
    combinedAccounts,
    selected,
    isModalOpen,
    formData,
    loading,
    error,
    setError,
    toast,
    clearToast,
    allPageSelected,
    somePageSelected,
    handleSelectRow,
    handleToggleAll,
    handleInverse,
    handleDelete,
    handleClearAll,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
    showToast,
  } = useAccountManagePage();

  return (
    <div style={accountManagePageWrapStyle} data-native-scroll>
      <div style={accountManagePageInnerStyle}>
        <AccountManageBreadcrumb />

        {toast.msg && (
          <Alert severity={toast.type} onClose={clearToast} sx={accountManageFixedAlertSx}>
            {toast.msg}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={accountManageFixedAlertSx}
          >
            {error}
          </Alert>
        )}

        {loading && (
          <AccountManageLoadingBanner message={ACCOUNT_MANAGE_MESSAGES.loading} />
        )}

        <div
          style={{
            ...accountManageTableContainerStyle,
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: CARD_RADIUS,
          }}
        >
          <div style={accountManageBlueBarStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>{ACCOUNT_MANAGE_CARD_TITLE}</span>
              {selected.length > 0 && (
                <span style={accountManageSelectedBadgeStyle}>
                  {ACCOUNT_MANAGE_MESSAGES.selectedCount(selected.length)}
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
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.CANCEL}
                onClick={handleInverse}
                disabled={loading}
                style={ACCOUNT_MANAGE_TOOLBAR_CANCEL_BUTTON_STYLE}
              >
                {ACCOUNT_MANAGE_BUTTON_LABELS.INVERSE}
              </Btn>
              <Btn
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.CANCEL}
                onClick={handleClearAll}
                disabled={loading || accounts.length === 0}
                style={ACCOUNT_MANAGE_TOOLBAR_CANCEL_BUTTON_STYLE}
              >
                {ACCOUNT_MANAGE_BUTTON_LABELS.CLEAR_ALL}
              </Btn>
              <Btn
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.CANCEL}
                onClick={() => {
                  if (!canWrite) {
                    showReadOnlyToast();
                    return;
                  }
                  handleDelete();
                }}
                disabled={loading || selected.length === 0}
                style={ACCOUNT_MANAGE_TOOLBAR_CANCEL_BUTTON_STYLE}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                {ACCOUNT_MANAGE_BUTTON_LABELS.DELETE}
              </Btn>
              <Btn
                variant={ACCOUNT_MANAGE_BUTTON_VARIANTS.PRIMARY}
                onClick={() => {
                  if (!canWrite) {
                    showReadOnlyToast();
                    return;
                  }
                  handleOpenModal();
                }}
                disabled={loading}
                style={ACCOUNT_MANAGE_TOOLBAR_PRIMARY_BUTTON_STYLE}
              >
                {ACCOUNT_MANAGE_BUTTON_LABELS.ADD_NEW}
              </Btn>
            </div>
          </div>

          <div style={{ overflowX: "auto", width: "100%" }}>
            <table
              style={{
                width: "100%",
                minWidth: 600,
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr>
                  {ACCOUNT_MANAGE_TABLE_COLUMNS.map((col, colIdx) => {
                    const isFirst = colIdx === 0;
                    const isLast =
                      colIdx === ACCOUNT_MANAGE_TABLE_COLUMNS.length - 1;
                    return (
                      <AccountManageTH
                        key={col.key}
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                          ...(isFirst
                            ? { width: 40, padding: 0, borderLeft: "none" }
                            : {}),
                          ...(isLast ? { width: 70, borderRight: "none" } : {}),
                        }}
                      >
                        {col.key === "choose" ? (
                          <Checkbox
                            size="small"
                            checked={allPageSelected}
                            indeterminate={somePageSelected}
                            onChange={handleToggleAll}
                            sx={accountManageCheckboxSx}
                          />
                        ) : (
                          col.label
                        )}
                      </AccountManageTH>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {combinedAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={ACCOUNT_MANAGE_TABLE_COLUMNS.length}
                      style={{
                        ...accountManageTdStyle,
                        padding: "32px 14px",
                        borderRight: "none",
                        borderLeft: "none",
                        borderBottom: "none",
                        color: C.labelText,
                        fontWeight: 600,
                      }}
                    >
                      {loading
                        ? ACCOUNT_MANAGE_MESSAGES.loadingTable
                        : ACCOUNT_MANAGE_MESSAGES.noData}
                    </td>
                  </tr>
                ) : (
                  combinedAccounts.map((item, idx) => {
                    const realIdx = idx;
                    const isSelected = selected.includes(realIdx);
                    const isLastRow = idx === combinedAccounts.length - 1;
                    const rowBg = getRowBackground(isSelected, idx);
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
                            e.currentTarget.style.background = "#f1f5f9";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...accountManageTdStyle,
                            background: rowBg,
                            borderLeft: "none",
                            width: 40,
                            ...lastRowCellStyle,
                          }}
                        >
                          {!item.isAdmin && (
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={() => handleSelectRow(realIdx)}
                              sx={accountManageCheckboxSx}
                            />
                          )}
                        </td>
                        <td
                          style={{
                            ...accountManageTdStyle,
                            background: rowBg,
                            color: C.mutedText,
                            fontWeight: 500,
                            ...lastRowCellStyle,
                          }}
                        >
                          {realIdx + 1}
                        </td>
                        <td
                          style={{
                            ...accountManageTdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            textAlign: "left",
                            ...lastRowCellStyle,
                          }}
                        >
                          {item.username}
                        </td>
                        <td
                          style={{
                            ...accountManageTdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            ...lastRowCellStyle,
                          }}
                        >
                          {item.authority ?? "-"}
                        </td>
                        <td
                          style={{
                            ...accountManageTdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <EditDocumentIcon
                              titleAccess="Edit"
                              style={{
                                cursor: canWrite ? "pointer" : "not-allowed",
                                color: ACCOUNT_MANAGE_ICON_COLORS.EDIT,
                                fontSize: 22,
                                opacity: canWrite ? 0.7 : 0.3,
                                transition: "opacity 0.15s ease",
                              }}
                              onClick={() => {
                                if (!canWrite) {
                                  showReadOnlyToast();
                                  return;
                                }
                                if (item.isAdmin) {
                                  showToast(
                                    ACCOUNT_MANAGE_MESSAGES.cannotModifyAdmin,
                                    "error",
                                  );
                                  return;
                                }
                                handleOpenModal(item, realIdx);
                              }}
                              onMouseEnter={(e) => {
                                if (canWrite) e.currentTarget.style.opacity = "1";
                              }}
                              onMouseLeave={(e) => {
                                if (canWrite) e.currentTarget.style.opacity = "0.7";
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {combinedAccounts.length > 0 && (
            <div style={accountManageFooterStyle}>
              <span style={{ fontSize: 11, color: C.mutedText }}>
                {ACCOUNT_MANAGE_MESSAGES.showingRecords(combinedAccounts.length)}
              </span>
            </div>
          )}
        </div>
      </div>

      <AccountManageModal
        open={isModalOpen}
        loading={loading}
        formData={formData}
        onInputChange={handleInputChange}
        onSave={handleSave}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AccountManage;
