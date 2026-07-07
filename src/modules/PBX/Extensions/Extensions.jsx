import { CircularProgress } from "@mui/material";
import {
  MessageBanner,
  ExtensionBreadcrumb,
  ExtensionTableListLoading,
  ExtensionTableListEmptyState,
  ExtensionPagination,
  extensionPageWrapStyle,
  extensionPageInnerStyle,
  extensionCardStyle,
} from "../../../components/common";
import { getExtensionsDeleteLoadingText } from "../../../constants/ExtensionsConstants";
import { C } from "../../../theme/pbxTokens";
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
    loading,
    selected,
  } = vm;

  return (
    <div
      style={{ ...extensionPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}
    >
      {loading.delete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className="bg-white rounded-lg flex flex-col items-center gap-4 pointer-events-auto"
            style={{
              minWidth: 300,
              padding: "24px 32px",
              border: `1px solid ${C.cardBorder}`,
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.12)",
              borderRadius: 10,
            }}
          >
            <CircularProgress size={50} sx={{ color: C.accent }} />
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: C.strongText,
                textAlign: "center",
                whiteSpace: "pre-line",
              }}
            >
              {getExtensionsDeleteLoadingText(selected.length)}
            </div>
          </div>
        </div>
      )}

      <div style={extensionPageInnerStyle}>
        <MessageBanner
          message={message}
            onClose={() => setMessage({ type: "", text: "" })}
        />

        <ExtensionBreadcrumb section="Extensions" current="Extensions" />

        <div style={extensionCardStyle}>
          <ExtensionsToolbar {...vm} />

          {isInitialLoad ? (
            <ExtensionTableListLoading />
          ) : accounts.length === 0 && !searchQuery.trim() ? (
            <ExtensionTableListEmptyState
              message="No extensions found."
              onAddNew={() => handleOpenModal()}
            />
          ) : (
            <>
              <ExtensionsTable {...vm} />

              {filteredAccounts.length > 0 && (
                <ExtensionPagination
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
