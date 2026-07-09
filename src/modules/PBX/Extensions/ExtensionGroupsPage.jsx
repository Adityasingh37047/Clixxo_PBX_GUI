import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Checkbox,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
  fetchSipAccounts,
  fetchExtensionGroups,
  createExtensionGroup,
  updateExtensionGroup,
  deleteExtensionGroup,
} from "../../../api/apiService";
import { EXT_GROUP_FIELD_TOOLTIPS } from "../../../constants/ExtensionGroupConstants";
import {
  C,
  EXTENSION_COMPACT_MQ,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../theme/pbxTokens";
import {
  Btn,
  TH,
  ExtensionBreadcrumb as ExtGroupBreadcrumb,
  ExtensionTableListLoading as ExtGroupTableListLoading,
  ExtensionTableListEmptyState as ExtGroupTableListEmptyState,
  ExtensionPagination as ExtGroupPagination,
  extensionTableCheckboxSx as extGroupTableCheckboxSx,
  extensionPageWrapStyle as extGroupPageWrapStyle,
  extensionPageInnerStyle as extGroupPageInnerStyle,
  extensionCardStyle as extGroupCardStyle,
  extensionToolbarStyle as extGroupToolbarStyle,
  extensionSelectedBadgeStyle as extGroupSelectedBadgeStyle,
  extensionCancelBtnStyle as extGroupCancelBtnStyle,
  extensionPrimaryBtnStyle as extGroupPrimaryBtnStyle,
  ExtensionCodecDualList as ExtGroupCodecDualList,
  MessageBanner,
  ExtensionEditIcon,
  addNewModalFooterStyle,
  addNewModalFooterBtnStyle,
  extensionModalCancelBtnStyle as extGroupModalCancelBtnStyle,
  EXTENSION_MODAL_SECTION_BG,
  EXTENSION_MODAL_SECTION_HEADING_COLOR,
  getExtensionTdStyle as getExtGroupTdStyle,
  getExtensionRowBg as getExtGroupRowBg,
} from "../../../components/common";

const EXT_GROUP_COMPACT_MQ = EXTENSION_COMPACT_MQ;

// ── Page-specific: tooltip label bound to this page's constants ──
const EXT_GROUP_FIELD_TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 13,
        maxWidth: 500,
        padding: "12px 16px",
      },
    },
    arrow: {
      sx: { color: "#fff" },
    },
  },
};

const formatExtGroupTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const ExtGroupFieldLabel = ({ tooltipKey, children, style = {} }) => {
  const tooltip = EXT_GROUP_FIELD_TOOLTIPS[tooltipKey] || "";

  const label = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );

  if (!tooltip) return label;

  return (
    <Tooltip
      title={formatExtGroupTooltipTitle(tooltip)}
      {...EXT_GROUP_FIELD_TOOLTIP_PROPS}
    >
      {label}
    </Tooltip>
  );
};

const ExtGroupSectionHeading = ({
  tooltipKey,
  children,
  isFirst = false,
}) => {
  const isLaptopNarrow = useMediaQuery("(max-width: 1366px)");
  return (
    <div
      style={{
        margin: isFirst
          ? isLaptopNarrow
            ? "16px 0 24px 0"
            : "0 0 24px 0"
          : "16px 0 24px 0",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
      <span
        style={{
          position: "absolute",
          top: -10,
          left: isLaptopNarrow ? 0 : -6,
          background: EXTENSION_MODAL_SECTION_BG,
          paddingRight: 8,
          fontSize: 14,
          fontWeight: 600,
          color: EXTENSION_MODAL_SECTION_HEADING_COLOR,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <ExtGroupFieldLabel
          tooltipKey={tooltipKey}
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: EXTENSION_MODAL_SECTION_HEADING_COLOR,
          }}
        >
          {children}
        </ExtGroupFieldLabel>
      </span>
    </div>
  );
};

// ── Page-specific: extensions list truncation helper ──
const EXT_GROUP_LIST_TRUNCATE_THRESHOLD = 10;
const EXT_GROUP_LIST_DISPLAY_LIMIT = 6;

const formatExtGroupItemListDisplay = (
  items,
  {
    threshold = EXT_GROUP_LIST_TRUNCATE_THRESHOLD,
    limit = EXT_GROUP_LIST_DISPLAY_LIMIT,
    mapItem = (x) => String(x),
    separator = ", ",
    ellipsis = "....",
  } = {},
) => {
  if (!items?.length) return "";
  const labels = items.map(mapItem).filter((v) => v !== "" && v != null);
  if (!labels.length) return "";
  if (labels.length <= threshold) {
    return labels.join(separator);
  }
  return `${labels.slice(0, limit).join(separator)}${ellipsis}`;
};

// ── Page-specific: table + modal styles ──
const extGroupTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "auto",
};

const extGroupModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  textAlign: "center",
  padding: "16px 24px",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const extGroupModalFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const extGroupDialogPaperSx = {
  width: 720,
  maxWidth: "95vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: "8px",
  overflow: "hidden",
};

const extGroupExtensionsListStyle = {
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 6,
  overflow: "hidden",
};

const extGroupModalTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused": {
      boxShadow: FOCUS_RING_SHADOW,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: "1px",
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: "1px",
    },
  },
  "& .MuiOutlinedInput-input": {
    backgroundColor: "#fff",
    fontSize: 13,
    padding: "8px 12px",
  },
};

// ── Page-specific: smooth wheel scroll for the modal ──
const EXT_GROUP_MODAL_SCROLL_EASE = 0.1;
const EXT_GROUP_MODAL_SCROLL_DELTA_SCALE = 0.75;

const getExtGroupModalScrollParent = (el, root) => {
  let node = el;
  while (node && node !== root) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const canScrollY =
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight;
    if (canScrollY) return node;
    node = node.parentElement;
  }
  return root;
};

const attachExtGroupModalSmoothWheelScroll = (container) => {
  if (!container) return () => {};

  const state = new WeakMap();
  const activeRafs = new Set();

  const getState = (el) => {
    if (!state.has(el)) {
      state.set(el, {
        target: el.scrollTop,
        current: el.scrollTop,
        rafId: null,
      });
    }
    return state.get(el);
  };

  const clamp = (el, value) =>
    Math.max(0, Math.min(value, el.scrollHeight - el.clientHeight));

  const tick = (el) => {
    const s = getState(el);
    const diff = s.target - s.current;
    if (Math.abs(diff) < 0.5) {
      s.current = s.target;
      el.scrollTop = s.current;
      if (s.rafId != null) activeRafs.delete(s.rafId);
      s.rafId = null;
      return;
    }
    s.current += diff * EXT_GROUP_MODAL_SCROLL_EASE;
    el.scrollTop = s.current;
    const rafId = requestAnimationFrame(() => tick(el));
    if (s.rafId != null) activeRafs.delete(s.rafId);
    s.rafId = rafId;
    activeRafs.add(rafId);
  };

  const onWheel = (e) => {
    const scrollEl = getExtGroupModalScrollParent(e.target, container);
    const s = getState(scrollEl);

    e.preventDefault();
    s.target = clamp(
      scrollEl,
      s.target + e.deltaY * EXT_GROUP_MODAL_SCROLL_DELTA_SCALE,
    );
    if (!s.rafId) {
      s.current = scrollEl.scrollTop;
      const rafId = requestAnimationFrame(() => tick(scrollEl));
      s.rafId = rafId;
      activeRafs.add(rafId);
    }
  };

  container.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    container.removeEventListener("wheel", onWheel);
    activeRafs.forEach((rafId) => cancelAnimationFrame(rafId));
    activeRafs.clear();
  };
};

const ExtensionGroupsPage = () => {
  const isCompact = useMediaQuery(EXT_GROUP_COMPACT_MQ);
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

  const hasInitialLoadRef = useRef(false);
  const modalScrollRef = useRef(null);

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

  useEffect(() => {
    if (!showModal) return undefined;

    let detach = () => {};
    const frame = requestAnimationFrame(() => {
      if (modalScrollRef.current) {
        detach = attachExtGroupModalSmoothWheelScroll(modalScrollRef.current);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      detach();
    };
  }, [showModal]);

  const totalPages = Math.max(1, Math.ceil(groups.length / limit));
  const pagedGroups = groups.slice((page - 1) * limit, page * limit);
  const dataEmpty = groups.length === 0;

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
    resetModalState();
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

  const resetModalState = () => {
    setEditGroupId(null);
    setGroupName("");
    setSelectedExtensions([]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetModalState();
  };

  const getExtensionLabel = (extension) => {
    const found = availableExtensions.find((e) => e.extension === extension);
    if (!found) return String(extension);
    return found.name ? `${found.extension} — ${found.name}` : found.extension;
  };

  const allExtensionOptions = useMemo(
    () =>
      availableExtensions.map(({ extension, name }) => ({
        value: extension,
        label: name ? `${extension} — ${name}` : extension,
      })),
    [availableExtensions],
  );

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
    <div style={{ ...extGroupPageWrapStyle, ...(isCompact ? { padding: 8 } : {}) }}>
      <div style={extGroupPageInnerStyle}>
        {/* Error Banner */}
        {/* ── Error / Success Floating Banner ── */}
        <MessageBanner
          message={message}
          onClose={() => setMessage({ type: "", text: "" })}
        />

        <ExtGroupBreadcrumb section="Extensions" current="Extension Group" />

        <div style={extGroupCardStyle}>
          <div
            style={{
              ...extGroupToolbarStyle,
              ...(isCompact
                ? { flexDirection: "column", alignItems: "stretch", gap: 10 }
                : {}),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selectedIds.length > 0 && (
                <span style={extGroupSelectedBadgeStyle}>
                  {selectedIds.length} selected
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
                onClick={handleDelete}
                disabled={
                  loading.delete || loading.fetch || selectedIds.length === 0
                }
                variant="cancel"
                style={extGroupCancelBtnStyle}
              >
                {loading.delete ? (
                  <CircularProgress size={11} style={{ color: "#374151" }} />
                ) : null}
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                Delete
              </Btn>
              <Btn
                onClick={handleOpenAddModal}
                disabled={loading.fetch}
                variant="primary"
                style={extGroupPrimaryBtnStyle}
              >
                + Add New
              </Btn>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              overflowX: "hidden",
              overflowY: "auto",
              flex: 1,
              ...(isCompact
                ? { overflowX: "auto", WebkitOverflowScrolling: "touch" }
                : {}),
            }}
          >
            {isInitialLoad ? (
              <ExtGroupTableListLoading />
            ) : dataEmpty ? (
              <ExtGroupTableListEmptyState
                message="No extension groups found."
                onAddNew={handleOpenAddModal}
              />
            ) : (
              <table style={extGroupTableStyle}>
                <thead>
                  <tr>
                    <TH
                      style={{
                        width: 40,
                        padding: 0,
                        borderLeft: "none",
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        onChange={handleToggleAll}
                        sx={extGroupTableCheckboxSx}
                      />
                    </TH>
                    <TH style={{ width: 36 }}>ID</TH>
                    <TH>Group Name</TH>
                    <TH>Extensions</TH>
                    <TH style={{ width: 70, borderRight: "none" }}>Modify</TH>
                  </tr>
                </thead>
                <tbody>
                  {pagedGroups.map((row, idx) => {
                    const isSelected = selectedIds.includes(row.id);
                    const isLastRow = idx === pagedGroups.length - 1;
                    const lastRowCellStyle = isLastRow
                      ? { borderBottom: "none" }
                      : {};
                    const rowBg = getExtGroupRowBg(isSelected, idx);
                    const realIndex = (page - 1) * limit + idx + 1;

                    return (
                      <tr
                        key={row.id}
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
                          style={getExtGroupTdStyle(rowBg, lastRowCellStyle, {
                            width: 36,
                            borderLeft: "none",
                          })}
                        >
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleToggleRow(row.id)}
                            disabled={loading.delete}
                            sx={extGroupTableCheckboxSx}
                          />
                        </td>
                        <td
                          style={getExtGroupTdStyle(rowBg, lastRowCellStyle, {
                            width: 36,
                          })}
                        >
                          {realIndex}
                        </td>
                        <td style={getExtGroupTdStyle(rowBg, lastRowCellStyle)}>
                          {row.name}
                        </td>
                        <td
                          style={getExtGroupTdStyle(rowBg, lastRowCellStyle, {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          })}
                        >
                          {row.extensions?.length > 0 ? (
                            <span
                              title={
                                row.extensions.length >
                                EXT_GROUP_LIST_TRUNCATE_THRESHOLD
                                  ? row.extensions.join(", ")
                                  : undefined
                              }
                            >
                              {formatExtGroupItemListDisplay(row.extensions)}
                            </span>
                          ) : (
                            <span style={{ color: C.mutedText }}></span>
                          )}
                        </td>
                        <td
                          style={getExtGroupTdStyle(rowBg, lastRowCellStyle, {
                            borderRight: "none",
                          })}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <ExtensionEditIcon
                              disabled={false}
                              onClick={() => handleOpenEditModal(row)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isInitialLoad && groups.length > 0 && (
            <ExtGroupPagination
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

      {/* ── Add/Edit Modal ── */}
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
        slotProps={{
          backdrop: { sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" } },
        }}
        PaperProps={{ sx: extGroupDialogPaperSx }}
      >
        <DialogTitle style={extGroupModalTitleStyle}>
          {editGroupId != null
            ? "Edit Extension Group"
            : "Add New Extension Group"}
        </DialogTitle>

        <DialogContent
          ref={modalScrollRef}
          className="app-main-scroll"
          style={{ padding: "24px", backgroundColor: "#ffffff" }}
          sx={{
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div style={extGroupModalFormStyle}>
            {/* Group Name Field */}
            <div>
              <ExtGroupSectionHeading tooltipKey="group_name" isFirst>
                Group Name
              </ExtGroupSectionHeading>
              <TextField
                fullWidth
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Sales, Support"
                size="small"
                variant="outlined"
                sx={extGroupModalTextFieldSx}
              />
            </div>

            {/* Extensions Selection */}
            <div>
              <ExtGroupSectionHeading tooltipKey="selected_extensions">
                Select Extensions
              </ExtGroupSectionHeading>
              {loading.extensions ? (
                <div
                  style={{
                    ...extGroupExtensionsListStyle,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 30,
                    minHeight: 188,
                  }}
                >
                  <CircularProgress size={20} />
                </div>
              ) : availableExtensions.length === 0 ? (
                <div
                  style={{
                    ...extGroupExtensionsListStyle,
                    padding: 20,
                    textAlign: "center",
                    fontSize: 12,
                    color: C.mutedText,
                    minHeight: 188,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  No extensions found. Create SIP accounts first.
                </div>
              ) : (
                <ExtGroupCodecDualList
                  allOptions={allExtensionOptions}
                  selected={selectedExtensions}
                  onChange={setSelectedExtensions}
                  getLabel={getExtensionLabel}
                  emptyTextAvailable="No available extensions"
                  emptyTextSelected="No selected extensions"
                />
              )}
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 0, m: 0 }} style={addNewModalFooterStyle}>
          <Btn
            onClick={handleSaveGroup}
            disabled={loading.save}
            variant="primary"
            style={addNewModalFooterBtnStyle}
          >
            {loading.save ? (
              <CircularProgress size={11} style={{ color: "#fff" }} />
            ) : null}
            {loading.save ? "Saving..." : "Save Group"}
          </Btn>
          <Btn
            onClick={handleCloseModal}
            disabled={loading.save}
            variant="cancel"
            style={extGroupModalCancelBtnStyle}
          >
            Cancel
          </Btn>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExtensionGroupsPage;
