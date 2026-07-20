import React from "react";
import { Alert } from "@mui/material";
import {
  ExtensionBreadcrumb as ExtBreadcrumb,
  ExtensionTableListLoading as ExtTableListLoading,
  ExtensionTableListEmptyState as ExtTableListEmptyState,
  ExtensionPagination as ExtPagination,
  extensionPageWrapStyle as extPageWrapStyle,
  extensionPageInnerStyle as extPageInnerStyle,
  extensionCardStyle as extCardStyle,
  extensionFixedAlertSx as extFixedAlertSx,
} from "../../../components/common";
import { useExtensionsPage } from "./hooks/useExtensionsPage";
import ExtensionsToolbar from "./components/ExtensionsToolbar";
import ExtensionsTable from "./components/ExtensionsTable";
import ImportDialog from "./components/ImportDialog";
import ExtensionFormDialog from "./components/ExtensionFormDialog";

const ExtensionsPage = () => {
  const vm = useExtensionsPage();
  const {
    isCompact,
    message,
    setMessage,
    accounts,
    searchQuery,
    isInitialLoad,
    filteredAccounts,
    pagedAccounts,
    page,
    totalPages,
    setPage,
    handleOpenModal,
  } = vm;

  return (
    <div
      style={{
        ...extPageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
    >
      <div style={extPageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={extFixedAlertSx}
          >
            {message.text}
          </Alert>
        )}

        <ExtBreadcrumb section="Extensions" current="Extensions" />

        <div style={extCardStyle}>
          <ExtensionsToolbar {...vm} />

          {isInitialLoad ? (
            <ExtTableListLoading />
          ) : accounts.length === 0 && !searchQuery.trim() ? (
            <ExtTableListEmptyState
              message="No extensions found."
              onAddNew={() => handleOpenModal()}
            />
          ) : (
            <>
              <ExtensionsTable {...vm} />

              {filteredAccounts.length > 0 && (
                <ExtPagination
                  page={page}
                  totalPages={totalPages}
                  recordCount={pagedAccounts.length}
                  recordLabel="extension"
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </>
          )}
        </div>
      </div>

      <ImportDialog {...vm} />

      <ExtensionFormDialog {...vm} />
    </div>
  );
};

export default ExtensionsPage;
