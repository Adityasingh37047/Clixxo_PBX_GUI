import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Alert,
  useMediaQuery,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  fetchSipAccounts,
  fetchExtensionGroups,
  createExtensionGroup,
  updateExtensionGroup,
  deleteExtensionGroup,
} from "../../../api/apiService";

const PBX_COMPACT_MQ = "(max-width: 768px)";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  errorRed: "#dc2626",
};

const CARD_R = 10;

const BTN_BASE =
  "inline-flex items-center justify-center gap-[6px] h-[30px] px-[14px] py-[6px] rounded-[10px] text-[12px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border disabled:cursor-not-allowed disabled:opacity-60";
const BTN_OUTLINE = `${BTN_BASE} bg-white text-[#0f172a] border-[#9ca3af] hover:bg-[#e2e8f0]`;
const BTN_CANCEL = `${BTN_BASE} bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3]`;
const BTN_PRIMARY = `${BTN_BASE} text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)]`;
const BTN_DIALOG_PRIMARY =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border text-white border-[#5A6F8F] bg-[linear-gradient(to_bottom,#5A6F8F_0%,#3E5475_60%,#2C3E57_100%)] hover:bg-[linear-gradient(to_bottom,#3E5475_0%,#5A6F8F_100%)] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_DIALOG_CANCEL =
  "inline-flex items-center justify-center gap-[6px] min-w-[100px] h-[33px] px-[14px] py-[6px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-150 ease-in-out cursor-pointer border bg-[#cbd5e1] text-[#374151] border-[#cbd5e1] shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:bg-[#b6c2d3] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_EMPTY_ADD = `${BTN_CANCEL} px-[24px] py-[8px] text-[12px] rounded-[6px]`;

const btnVariantCls = {
  default: BTN_OUTLINE,
  primary: BTN_PRIMARY,
  accent: BTN_PRIMARY,
  cancel: BTN_CANCEL,
  outline: BTN_OUTLINE,
  danger: `${BTN_BASE} bg-[#dc2626] text-white border-[0.5px] border-[#dc2626] hover:bg-[#b91c1c]`,
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  className = "",
  title,
  type,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`${btnVariantCls[variant] || btnVariantCls.default} ${className}`.trim()}
  >
    {children}
  </button>
);

const TH = ({ children, style: extra }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "9px 14px",
      textAlign: "center",
      borderBottom: `1px solid ${C.cardBorder}`,
      borderRight: `1px solid ${C.cardBorder}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      ...extra,
    }}
  >
    {children}
  </th>
);

const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.cardBorder}`,
  borderRight: `1px solid ${C.cardBorder}`,
  whiteSpace: "nowrap",
  lineHeight: 1.2,
  boxSizing: "border-box",
};

const ExtensionTd = ({ children, isLast, style: extra }) => (
  <td style={{ ...tdStyle, ...(isLast ? { borderBottom: "none" } : {}), ...extra }}>
    {children}
  </td>
);

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const TH_STICKY = { position: "sticky", top: 0, zIndex: 10 };

const PBX_LIST_TRUNCATE_THRESHOLD = 10;
const PBX_LIST_DISPLAY_LIMIT = 6;

const formatPbxItemListDisplay = (
  items,
  {
    threshold = PBX_LIST_TRUNCATE_THRESHOLD,
    limit = PBX_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) return labels.join(separator);
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

const DIALOG_TITLE =
  "!m-0 !box-border !flex-[0_0_auto] bg-[#1e2d42] !text-[#ffffff] ![font-family:Roboto,Helvetica,Arial,sans-serif] ![font-size:16px] ![font-weight:600] ![line-height:1.6] ![letter-spacing:0.0075em] !text-center ![padding:16px_24px] ![border-top-left-radius:8px] ![border-top-right-radius:8px]";

const modalShellStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const modalFieldLabelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  marginBottom: 6,
};

const modalExtPanelStyle = {
  background: "#fff",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 6,
  overflow: "hidden",
};

const modalExtPanelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 12px",
  background: "#f8fafc",
  borderBottom: `1px solid ${C.cardBorder}`,
};

const sipPcmCardStyle = {
  background: "#ffffff",
  borderRadius: CARD_R,
  overflow: "hidden",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

const sipPcmToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.cardBorder}`,
  background: "#ffffff",
  flexWrap: "wrap",
  gap: 12,
  borderTopLeftRadius: CARD_R,
  borderTopRightRadius: CARD_R,
};

const sipPcmPaginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.cardBorder}`,
  borderBottomLeftRadius: CARD_R,
  borderBottomRightRadius: CARD_R,
  overflow: "hidden",
};

const sipPcmSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 12px",
  borderRadius: 999,
  border: `1px solid ${C.accent}`,
};

const sipPcmPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#e0f2fe",
  padding: "5px 14px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
};

const PbxBreadcrumb = ({ section, current }) => (
  <div className="flex items-center flex-wrap gap-[4px] text-[12px] leading-normal text-[#94a3b8] font-normal mb-4">
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span className="text-[#1e293b] font-semibold">{current}</span>
  </div>
);

const TableListLoading = () => (
  <div className="flex justify-center items-center p-12">
    <CircularProgress size={28} sx={{ color: C.accent }} />
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div className="flex flex-col items-center justify-center min-h-[240px] p-6 text-center">
    <div
      className={`text-[#3E5475] text-[13px] font-semibold${showButton && onAddNew ? " mb-4" : ""}`}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn variant="cancel" onClick={onAddNew} className={BTN_EMPTY_ADD}>
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);

const SipPcmPagination = ({
  page,
  totalPages,
  recordCount,
  onPageChange,
  recordLabel = "record",
}) => (
  <div style={sipPcmPaginationStyle}>
    <span className="text-[11px] text-[#94a3b8]">
      Showing {recordCount} {recordLabel}
      {recordCount !== 1 ? "s" : ""} on page {page}
    </span>
    <div className="flex gap-[8px] items-center">
      <Btn onClick={() => onPageChange(page - 1)} disabled={page <= 1} variant="outline">
        ← Prev
      </Btn>
      <span style={sipPcmPageBadgeStyle}>
        Page {page} of {totalPages}
      </span>
      <Btn
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        variant="outline"
      >
        Next →
      </Btn>
    </div>
  </div>
);

const ExtensionGroupsPage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    delete: false,
    save: false,
    extensions: false,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const hasInitialLoadRef = useRef(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);

  // ── Load Data ──
  const loadGroups = async () => {
    setLoading((p) => ({ ...p, fetch: true }));
    setMessage({ type: "", text: "" });
    try {
      const res = await fetchExtensionGroups();
      const raw = res?.message ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setGroups(
        list.map((g) => ({
          id: g.id,
          name: g.name || "",
          extensions: Array.isArray(g.extensions)
            ? g.extensions.map(String)
            : [],
        })),
      );
    } catch (err) {
      showMessage("error", err?.message || "Failed to load extension groups.");
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadGroups();
    }
  }, []);

  // ── Search & Pagination ──
  const filteredGroups = searchQuery.trim()
    ? groups.filter(
        (g) =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.extensions.some((ext) =>
            ext.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    : groups;

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / limit));
  const pagedGroups = filteredGroups.slice((page - 1) * limit, page * limit);
  const dataEmpty = groups.length === 0;
  const searchEmpty = !dataEmpty && filteredGroups.length === 0;

  // ── Checkbox Selection Logic ──
  const pageIds = pagedGroups.map((g) => g.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected =
    pagedGroups.some((g) => selectedIds.includes(g.id)) && !allPageSelected;

  const handleToggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (!pageIds.length) return;
    setSelectedIds((prev) =>
      allPageSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds])),
    );
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!selectedIds.length) {
      showMessage("error", "Please select at least one record to delete.");
      return;
    }
    const msg =
      selectedIds.length === 1
        ? "Are you sure you want to delete this group?"
        : `Are you sure you want to delete ${selectedIds.length} groups?`;

    if (!window.confirm(msg)) return;

    setLoading((p) => ({ ...p, delete: true }));
    setMessage({ type: "", text: "" });
    const deleteCount = selectedIds.length;
    try {
      await Promise.all(selectedIds.map((id) => deleteExtensionGroup(id)));
      setSelectedIds([]);
      await loadGroups();
      showMessage(
        "success",
        deleteCount === 1
          ? "Extension group deleted successfully."
          : `${deleteCount} extension groups deleted successfully.`,
      );
    } catch (err) {
      showMessage("error", err?.message || "Failed to delete some groups.");
    } finally {
      setLoading((p) => ({ ...p, delete: false }));
    }
  };

  // ── Modal Actions ──
  const openExtensionList = () => {
    setLoading((p) => ({ ...p, extensions: true }));
    fetchSipAccounts()
      .then((res) => {
        const list = res?.message ?? [];
        const exts = (Array.isArray(list) ? list : [])
          .map((item) => ({
            extension: String(item.extension ?? ""),
            name: item.name || item.display_name || item.extension || "",
          }))
          .filter((e) => e.extension);
        setAvailableExtensions(exts);
      })
      .catch(() => {
        setAvailableExtensions([]);
        showMessage(
          "error",
          "Failed to load available extensions for the modal.",
        );
      })
      .finally(() => setLoading((p) => ({ ...p, extensions: false })));
  };

  const handleOpenAddModal = () => {
    setEditGroupId(null);
    setGroupName("");
    setSelectedExtensions([]);
    setShowModal(true);
    openExtensionList();
  };

  const handleOpenEditModal = (group) => {
    setEditGroupId(group.id);
    setGroupName(group.name || "");
    setSelectedExtensions(
      Array.isArray(group.extensions) ? [...group.extensions] : [],
    );
    setShowModal(true);
    openExtensionList();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditGroupId(null);
    setGroupName("");
    setSelectedExtensions([]);
  };

  const toggleExtension = (ext) => {
    setSelectedExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext],
    );
  };

  const handleSaveGroup = async () => {
    const name = groupName?.trim();
    if (!name) return showMessage("error", "Please enter a group name.");
    if (selectedExtensions.length === 0)
      return showMessage("error", "Please select at least one extension.");

    const extensions = [...selectedExtensions].sort(
      (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0),
    );
    setLoading((p) => ({ ...p, save: true }));
    setMessage({ type: "", text: "" });

    try {
      const isUpdate = editGroupId != null;
      if (isUpdate) {
        await updateExtensionGroup({ id: editGroupId, name, extensions });
      } else {
        await createExtensionGroup({ name, extensions });
      }
      await loadGroups();
      handleCloseModal();
      showMessage(
        "success",
        isUpdate
          ? "Extension group updated successfully."
          : "Extension group created successfully.",
      );
    } catch (err) {
      showMessage("error", err?.message || "Failed to save group.");
    } finally {
      setLoading((p) => ({ ...p, save: false }));
    }
  };

  return (
    <div
      className={`bg-[#f8fafc] min-h-[calc(100vh-80px)] box-border ${isCompact ? "p-[8px]" : "p-[16px]"}`}
    >
      <div className="w-full max-w-full mx-auto">
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {message.text}
          </Alert>
        )}

        <PbxBreadcrumb section="Extensions" current="Extension Group" />

        <div style={sipPcmCardStyle}>
          <div
            style={{
              ...sipPcmToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div className="flex items-center gap-[8px]">
              {selectedIds.length > 0 && (
                <span style={sipPcmSelectedBadgeStyle}>
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-[8px] flex-wrap">
              <Btn
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selectedIds.length === 0
                }
                variant="cancel"
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.fetch}
                variant="primary"
              >
                + Add New
              </Btn>
            </div>
          </div>

          <div
            style={{
              overflowX: isCompact ? "auto" : "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact ? { WebkitOverflowScrolling: "touch" } : {}),
            }}
          >
            {isInitialLoad ? (
              <TableListLoading />
            ) : dataEmpty ? (
              <TableListEmptyState
                message="No extension groups found."
                onAddNew={handleOpenAddModal}
              />
            ) : searchEmpty ? (
              <TableListEmptyState
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
                        ...TH_STICKY,
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={checkboxSx}
                      />
                    </TH>
                    <TH style={{ width: 36, ...TH_STICKY }}>ID</TH>
                    <TH style={TH_STICKY}>Group Name</TH>
                    <TH style={TH_STICKY}>Extensions</TH>
                    <TH style={{ width: 70, borderRight: "none", ...TH_STICKY }}>
                      Modify
                    </TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedGroups.map((row, idx) => {
                    const isSelected = selectedIds.includes(row.id);
                    const isLastRow = idx === pagedGroups.length - 1;
                    const rowBg = isSelected
                      ? "#e0f2fe"
                      : idx % 2 === 1
                        ? "#f8fafc"
                        : "#ffffff";
                    const realIndex = (page - 1) * limit + idx + 1;

                    return (
                      <tr key={row.id} style={{ background: rowBg }}>
                        <ExtensionTd
                          isLast={isLastRow}
                          style={{ width: 36, borderLeft: "none" }}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(row.id)}
                            sx={checkboxSx}
                          />
                        </ExtensionTd>
                        <ExtensionTd isLast={isLastRow} style={{ width: 36 }}>
                          {realIndex}
                        </ExtensionTd>
                        <ExtensionTd isLast={isLastRow}>{row.name}</ExtensionTd>
                        <ExtensionTd
                          isLast={isLastRow}
                          style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {row.extensions?.length > 0 ? (
                            <span
                              title={
                                row.extensions.length >
                                PBX_LIST_TRUNCATE_THRESHOLD
                                  ? row.extensions.join(", ")
                                  : undefined
                              }
                            >
                              {formatPbxItemListDisplay(row.extensions)}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }} />
                          )}
                        </ExtensionTd>
                        <ExtensionTd
                          isLast={isLastRow}
                          style={{ borderRight: "none" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <EditDocumentIcon
                              titleAccess="Edit"
                              onClick={() => handleOpenEditModal(row)}
                              style={{
                                cursor: "pointer",
                                color: "#2563eb",
                                fontSize: 22,
                                opacity: 0.7,
                                transition: "opacity 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = "1";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = "0.7";
                              }}
                            />
                          </div>
                        </ExtensionTd>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && filteredGroups.length > 0 && (
            <SipPcmPagination
              page={page}
              totalPages={totalPages}
              recordCount={pagedGroups.length}
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
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "95vw",
            borderRadius: "8px",
            overflow: "hidden",
            p: 0,
          },
        }}
      >
        <DialogTitle className={DIALOG_TITLE}>
          {editGroupId != null
            ? "Edit Extension Group"
            : "Add New Extension Group"}
        </DialogTitle>

        <DialogContent className="!bg-white ![padding:24px]">
          <div style={modalShellStyle}>
            <div>
              <label style={modalFieldLabelStyle}>Group Name</label>
              <TextField
                fullWidth
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Sales, Support"
                size="small"
                variant="outlined"
                sx={{ background: "#fff" }}
                inputProps={{ style: { fontSize: 13, padding: "8px 12px" } }}
              />
            </div>

            <div style={modalExtPanelStyle}>
              <div style={modalExtPanelHeaderStyle}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.labelText }}>
                  Select Extensions
                </span>
              </div>

              <div style={{ maxHeight: 220, overflowY: "auto", padding: 12 }}>
                {loading.extensions ? (
                  <div className="flex justify-center items-center py-[30px]">
                    <CircularProgress size={20} />
                  </div>
                ) : availableExtensions.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: C.mutedText,
                      margin: "20px 0",
                    }}
                  >
                    No extensions found. Create SIP accounts first.
                  </p>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    {availableExtensions.map(({ extension, name }) => (
                      <FormControlLabel
                        key={extension}
                        control={
                          <Checkbox
                            checked={selectedExtensions.includes(extension)}
                            onChange={() => toggleExtension(extension)}
                            size="small"
                            sx={checkboxSx}
                          />
                        }
                        label={
                          <span style={{ fontSize: 13, color: C.valueText }}>
                            {extension} {name ? `— ${name}` : ""}
                          </span>
                        }
                        sx={{ margin: 0 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ fontSize: 11, color: C.mutedText, textAlign: "right" }}>
              {selectedExtensions.length} extension(s) selected
            </div>
          </div>
        </DialogContent>

        <DialogActions
          className="!flex !justify-center !gap-[16px] !bg-[#f8fafc] !border-t !border-[#9CA3AF] ![padding:16px_24px] ![border-bottom-left-radius:8px] ![border-bottom-right-radius:8px]"
        >
          <Btn
            onClick={handleSaveGroup}
            disabled={loading.save}
            variant="primary"
            className={BTN_DIALOG_PRIMARY}
          >
            {loading.save ? <CircularProgress size={11} sx={{ color: "#fff" }} /> : null}
            {loading.save ? "Saving..." : "Save Group"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            className={BTN_DIALOG_CANCEL}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExtensionGroupsPage;