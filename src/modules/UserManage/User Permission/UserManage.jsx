import React from "react";
import { Alert } from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  USER_MANAGE_ACCESS_TYPE_LABELS,
  USER_MANAGE_BUTTON_LABELS,
  USER_MANAGE_BUTTON_VARIANTS,
  USER_MANAGE_CARD_TITLES,
  USER_MANAGE_ICON_COLORS,
  USER_MANAGE_LABELS,
  USER_MANAGE_MESSAGES,
  USER_MANAGE_TABLE_HEADERS,
  USER_MANAGE_TOOLBAR_CANCEL_BUTTON_STYLE,
  USER_MANAGE_TOOLBAR_PRIMARY_BUTTON_STYLE,
} from "../../../constants/UserManageConstants";
import { C } from "../../../theme/pbxTokens";
import {
  Btn,
  ExtensionBreadcrumb as UserManageBreadcrumb,
  extensionPageWrapStyle as userManagePageWrapStyle,
  extensionPageInnerStyle as userManagePageInnerStyle,
  extensionFixedAlertSx as userManageFixedAlertSx,
  TH as UserManageTH,
} from "../../../components/common";
import {
  USER_MANAGE_BREADCRUMB,
} from "../../../constants/UserManageConstants";
import { useUserManagePage } from "./hooks/useUserManagePage";
import {
  UserManageEditForm,
  UserManagePermissionCard,
} from "./components/UserManageFormFields";
import {
  userManageBlueBarStyle,
  userManageTableContainerStyle,
  userManageTdStyle,
} from "./components/UserManageTableHelpers";
import {
  getUserSectionsLabel,
  getUserRolePermission,
  isSuperAdminUser,
} from "./utils/UserManageTransformers";

const UserManage = () => {
  const {
    canWrite,
    showReadOnlyToast,
    users,
    loadingList,
    listError,
    mode,
    editUser,
    username,
    setUsername,
    password,
    setPassword,
    accessType,
    setAccessType,
    rolePermission,
    setRolePermission,
    permissions,
    setPermissions,
    saving,
    formError,
    clearFormError,
    toast,
    clearToast,
    openAdd,
    openEdit,
    closeForm,
    handleSave,
    handleDelete,
  } = useUserManagePage();

  return (
    <div style={userManagePageWrapStyle} data-native-scroll>
      <div style={userManagePageInnerStyle}>
        {toast.msg && (
          <Alert severity={toast.type} onClose={clearToast} sx={userManageFixedAlertSx}>
            {toast.msg}
          </Alert>
        )}

        <UserManageBreadcrumb
          root={USER_MANAGE_BREADCRUMB[0]}
          section={USER_MANAGE_BREADCRUMB[1]}
          current={USER_MANAGE_BREADCRUMB[2]}
        />

        <div style={userManageTableContainerStyle}>
          <div style={userManageBlueBarStyle}>
            <span>{USER_MANAGE_CARD_TITLES.USER_LIST}</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {mode !== null && (
                <div style={{ display: "inline-grid" }}>
                  <Btn
                    variant={USER_MANAGE_BUTTON_VARIANTS.PRIMARY}
                    disabled
                    aria-hidden
                    tabIndex={-1}
                    style={{
                      ...USER_MANAGE_TOOLBAR_PRIMARY_BUTTON_STYLE,
                      gridArea: "1 / 1",
                      visibility: "hidden",
                      pointerEvents: "none",
                    }}
                  >
                    {USER_MANAGE_BUTTON_LABELS.ADD_USER}
                  </Btn>
                  <Btn
                    variant={USER_MANAGE_BUTTON_VARIANTS.CANCEL}
                    onClick={closeForm}
                    style={{
                      ...USER_MANAGE_TOOLBAR_CANCEL_BUTTON_STYLE,
                      gridArea: "1 / 1",
                      width: "100%",
                    }}
                  >
                    {USER_MANAGE_BUTTON_LABELS.CANCEL}
                  </Btn>
                </div>
              )}
              {mode === null && (
                <Btn
                  variant={USER_MANAGE_BUTTON_VARIANTS.PRIMARY}
                  onClick={() => {
                    if (!canWrite) {
                      showReadOnlyToast();
                      return;
                    }
                    openAdd();
                  }}
                  disabled={!canWrite}
                  style={USER_MANAGE_TOOLBAR_PRIMARY_BUTTON_STYLE}
                >
                  {USER_MANAGE_BUTTON_LABELS.ADD_USER}
                </Btn>
              )}
            </div>
          </div>

          {loadingList ? (
            <p
              style={{
                textAlign: "center",
                padding: "32px 20px",
                color: C.mutedText,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {USER_MANAGE_MESSAGES.loadingUsers}
            </p>
          ) : listError ? (
            <p
              style={{
                textAlign: "center",
                padding: "32px 20px",
                color: C.errorRed,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {listError}
            </p>
          ) : users.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: "32px 20px",
                color: C.mutedText,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {USER_MANAGE_MESSAGES.noUsers}
            </p>
          ) : (
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
                    <UserManageTH style={{ width: 50, position: "sticky", top: 0, zIndex: 10 }}>
                      {USER_MANAGE_TABLE_HEADERS.ID}
                    </UserManageTH>
                    <UserManageTH style={{ width: 180, position: "sticky", top: 0, zIndex: 10 }}>
                      {USER_MANAGE_TABLE_HEADERS.USERNAME}
                    </UserManageTH>
                    <UserManageTH style={{ width: 140, position: "sticky", top: 0, zIndex: 10 }}>
                      {USER_MANAGE_TABLE_HEADERS.ACCESS_TYPE}
                    </UserManageTH>
                    <UserManageTH style={{ width: 160, position: "sticky", top: 0, zIndex: 10 }}>
                      {USER_MANAGE_TABLE_HEADERS.ROLE_PERMISSION}
                    </UserManageTH>
                    <UserManageTH style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      {USER_MANAGE_TABLE_HEADERS.SECTIONS}
                    </UserManageTH>
                    <UserManageTH
                      style={{
                        width: 70,
                        borderRight: "none",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      {USER_MANAGE_TABLE_HEADERS.ACTIONS}
                    </UserManageTH>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const isSuperAdmin = isSuperAdminUser(user);
                    const isLastRow = i === users.length - 1;
                    const rowBg = i % 2 === 1 ? "#f8fafc" : C.cardBg;
                    const lastRowCellStyle = isLastRow ? { borderBottom: "none" } : {};
                    const hoverBg = "#f1f5f9";

                    return (
                      <tr
                        key={user.id}
                        style={{ background: rowBg, transition: "background 0.15s ease" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = hoverBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = rowBg;
                        }}
                      >
                        <td
                          style={{
                            ...userManageTdStyle,
                            background: rowBg,
                            color: C.mutedText,
                            fontWeight: 500,
                            ...lastRowCellStyle,
                          }}
                        >
                          {i + 1}
                        </td>
                        <td
                          style={{
                            ...userManageTdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            textAlign: "left",
                            ...lastRowCellStyle,
                          }}
                        >
                          {user.username}
                        </td>
                        <td
                          style={{
                            ...userManageTdStyle,
                            background: rowBg,
                            ...lastRowCellStyle,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: 6,
                              background: isSuperAdmin ? "#eff6ff" : "#f0fdf4",
                              border: `1px solid ${isSuperAdmin ? "#bfdbfe" : "#bbf7d0"}`,
                              color: isSuperAdmin ? "#1d4ed8" : "#15803d",
                            }}
                          >
                            {isSuperAdmin
                              ? USER_MANAGE_ACCESS_TYPE_LABELS.superadmin
                              : USER_MANAGE_ACCESS_TYPE_LABELS.custom}
                          </span>
                        </td>
                        <td
                          style={{
                            ...userManageTdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            ...lastRowCellStyle,
                          }}
                        >
                          {getUserRolePermission(user)}
                        </td>
                        <td
                          style={{
                            ...userManageTdStyle,
                            background: rowBg,
                            fontWeight: 500,
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "left",
                            ...lastRowCellStyle,
                          }}
                        >
                          {isSuperAdmin ? (
                            <span
                              style={{
                                color: C.mutedText,
                                fontStyle: "italic",
                                fontSize: 13,
                              }}
                            >
                              {USER_MANAGE_LABELS.ALL_SECTIONS}
                            </span>
                          ) : (
                            <span>{getUserSectionsLabel(user)}</span>
                          )}
                        </td>
                        <td
                          style={{
                            ...userManageTdStyle,
                            background: rowBg,
                            borderRight: "none",
                            ...lastRowCellStyle,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              justifyContent: "center",
                            }}
                          >
                            {!isSuperAdmin && (
                              <EditDocumentIcon
                                titleAccess="Edit"
                                style={{
                                  cursor: canWrite ? "pointer" : "not-allowed",
                                  color: USER_MANAGE_ICON_COLORS.EDIT,
                                  fontSize: 22,
                                  opacity: canWrite ? 0.7 : 0.3,
                                  transition: "opacity 0.15s ease",
                                }}
                                onClick={() => {
                                  if (!canWrite) {
                                    showReadOnlyToast();
                                    return;
                                  }
                                  openEdit(user);
                                }}
                                onMouseEnter={(e) => {
                                  if (canWrite) e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  if (canWrite) e.currentTarget.style.opacity = "0.7";
                                }}
                              />
                            )}
                            {!isSuperAdmin && (
                              <DeleteOutlineOutlinedIcon
                                titleAccess="Delete"
                                style={{
                                  cursor: canWrite ? "pointer" : "not-allowed",
                                  color: USER_MANAGE_ICON_COLORS.DELETE,
                                  fontSize: 22,
                                  opacity: canWrite ? 0.7 : 0.3,
                                  transition: "opacity 0.15s ease",
                                }}
                                onClick={() => {
                                  if (!canWrite) {
                                    showReadOnlyToast();
                                    return;
                                  }
                                  handleDelete(user);
                                }}
                                onMouseEnter={(e) => {
                                  if (canWrite) e.currentTarget.style.opacity = "1";
                                }}
                                onMouseLeave={(e) => {
                                  if (canWrite) e.currentTarget.style.opacity = "0.7";
                                }}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {mode && (
          <>
            <UserManageEditForm
              mode={mode}
              editUser={editUser}
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              accessType={accessType}
              setAccessType={setAccessType}
              rolePermission={rolePermission}
              setRolePermission={setRolePermission}
            />

            <UserManagePermissionCard
              permissions={permissions}
              setPermissions={setPermissions}
              saving={saving}
              canWrite={canWrite}
              onSave={handleSave}
              onCancel={closeForm}
              showReadOnlyToast={showReadOnlyToast}
            />

            {formError && (
              <Alert
                severity="error"
                onClose={clearFormError}
                sx={userManageFixedAlertSx}
              >
                {formError}
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManage;
