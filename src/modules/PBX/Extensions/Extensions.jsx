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
      style={{ ...extensionPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}
    >
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
