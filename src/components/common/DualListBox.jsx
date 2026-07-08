import { useRef, useMemo, useEffect, useState } from "react";
import { C } from "../../theme/pbxTokens";

// ── CODEC Priority style dual-list (matches FXS Media page) ──
const EXTENSION_CODEC_LIST_BOX_HEIGHT = 188;
const EXTENSION_CODEC_BTN_COL_WIDTH = 40;
const EXTENSION_CODEC_BTN_COL_HEIGHT = 170;
const EXTENSION_CODEC_BTN_GAP = 6;
const EXTENSION_CODEC_BTN_HEIGHT =
  (EXTENSION_CODEC_BTN_COL_HEIGHT - EXTENSION_CODEC_BTN_GAP * 3) / 4;
const EXTENSION_CODEC_LIST_LABEL_OFFSET = 28;

const extensionCodecColumnLabelRowStyle = {
  height: EXTENSION_CODEC_LIST_LABEL_OFFSET,
  marginBottom: 0,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  paddingBottom: 8,
  boxSizing: "border-box",
};

const extensionCodecColumnLabelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "center",
};

const extensionCodecBtnColListAlignStyle = {
  height: EXTENSION_CODEC_LIST_BOX_HEIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const getExtensionCodecListBoxStyle = (variant, isEmpty) => ({
  width: "100%",
  minHeight: EXTENSION_CODEC_LIST_BOX_HEIGHT,
  height: EXTENSION_CODEC_LIST_BOX_HEIGHT,
  border: `1px solid ${C.codecBoxBorder}`,
  background: C.codecBoxAvailableBg,
  borderRadius: 6,
  padding: isEmpty ? 0 : "8px 8px",
  boxSizing: "border-box",
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: isEmpty ? "center" : "stretch",
  justifyContent: isEmpty ? "center" : "flex-start",
  gap: 4,
});

const extensionCodecListEmptyStyle = {
  color: C.placeholderText,
  fontSize: 13,
  fontWeight: 400,
  textAlign: "center",
  userSelect: "none",
  padding: "0 16px",
};

const extensionCodecStripStyle = (isSelected) => ({
  display: "block",
  width: "100%",
  padding: "6px 8px",
  borderRadius: 5,
  fontSize: 13,
  fontWeight: 400,
  color: C.valueText,
  textAlign: "center",
  background: isSelected ? C.codecStripSelectedBg : C.codecStripBg,
  border: `1px solid ${isSelected ? C.codecStripSelectedBorder : C.codecStripBorder}`,
  cursor: "pointer",
  userSelect: "none",
  boxSizing: "border-box",
  lineHeight: 1.35,
  flexShrink: 0,
  transition: "background 0.12s ease, border-color 0.12s ease",
});

const extensionCodecDualListBtnStyle = {
  width: EXTENSION_CODEC_BTN_COL_WIDTH,
  height: EXTENSION_CODEC_BTN_HEIGHT,
  borderRadius: 6,
  border: `1px solid ${C.codecBtnBorder}`,
  background: C.codecBtnBg,
  color: "#111827",
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "inherit",
  lineHeight: 1,
  padding: 0,
  margin: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  flexShrink: 0,
  boxShadow: "none",
  transition: "background 0.12s ease, transform 0.1s ease, box-shadow 0.1s ease",
  userSelect: "none",
};

const extensionCodecDualListReorderBtnStyle = {
  ...extensionCodecDualListBtnStyle,
  fontSize: 11,
  fontWeight: 500,
};

const extensionCodecDualListReorderDownBtnStyle = {
  ...extensionCodecDualListReorderBtnStyle,
  fontWeight: 400,
};

const ExtensionCodecDualListBtn = ({ onClick, title, children, reorder, down }) => (
  <button
    type="button"
    data-codec-action-btn
    title={title}
    onClick={onClick}
    style={
      down
        ? extensionCodecDualListReorderDownBtnStyle
        : reorder
          ? extensionCodecDualListReorderBtnStyle
          : extensionCodecDualListBtnStyle
    }
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#c5cbd3";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = C.codecBtnBg;
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "none";
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.background = "#b3bac4";
      e.currentTarget.style.transform = "translateY(1px) scale(0.96)";
      e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(15, 23, 42, 0.18)";
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.background = "#c5cbd3";
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    {children}
  </button>
);

const extensionCodecBtnColumnStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: EXTENSION_CODEC_BTN_GAP,
  height: EXTENSION_CODEC_BTN_COL_HEIGHT,
  width: EXTENSION_CODEC_BTN_COL_WIDTH,
};

const ExtensionCodecListBox = ({
  items,
  selectedIds,
  onToggle,
  onDragSelect,
  onClearHighlight,
  emptyText,
  getLabel,
  variant = "available",
  containerRef,
}) => {
  const isEmpty = items.length === 0;
  const listRef = useRef(null);
  const isDragSelectingRef = useRef(false);
  const didDragRef = useRef(false);
  const dragAnchorIndexRef = useRef(null);
  const lastClickIndexRef = useRef(null);
  const storedPointerRef = useRef({ clientX: 0, clientY: 0 });
  const dragStartPointerRef = useRef({ clientX: 0, clientY: 0 });
  const dragRafRef = useRef(null);
  const itemIdsRef = useRef([]);
  const onDragSelectRef = useRef(onDragSelect);

  const getItemId = (item) => (typeof item === "string" ? item : item.value);
  const itemIds = useMemo(() => items.map(getItemId), [items]);
  itemIdsRef.current = itemIds;
  onDragSelectRef.current = onDragSelect;

  const applyRangeToIndex = (currIdx) => {
    if (currIdx < 0) return;
    if (dragAnchorIndexRef.current === null) {
      dragAnchorIndexRef.current = currIdx;
    }
    const anchor = dragAnchorIndexRef.current;
    const from = Math.min(anchor, currIdx);
    const to = Math.max(anchor, currIdx);
    onDragSelectRef.current?.(itemIdsRef.current.slice(from, to + 1));
  };

  const applyRangeBetween = (fromIdx, toIdx) => {
    if (fromIdx < 0 || toIdx < 0) return;
    const from = Math.min(fromIdx, toIdx);
    const to = Math.max(fromIdx, toIdx);
    onDragSelectRef.current?.(itemIdsRef.current.slice(from, to + 1));
  };

  const getIndexAtPointer = (clientX, clientY) => {
    const container = listRef.current;
    if (!container || !itemIdsRef.current.length) return -1;

    const rect = container.getBoundingClientRect();
    const contentY = container.scrollTop + (clientY - rect.top);

    const el = document.elementFromPoint(clientX, clientY);
    const strip = el?.closest?.("[data-codec-strip-id]");
    if (strip && container.contains(strip)) {
      const id = strip.getAttribute("data-codec-strip-id");
      const idx = itemIdsRef.current.indexOf(id);
      if (idx !== -1) return idx;
    }

    const strips = container.querySelectorAll("[data-codec-strip-id]");
    if (!strips.length) return -1;

    for (let i = 0; i < strips.length; i++) {
      const stripEl = strips[i];
      const top = stripEl.offsetTop;
      const bottom = top + stripEl.offsetHeight;
      if (contentY >= top && contentY < bottom) {
        return i;
      }
    }

    const firstTop = strips[0].offsetTop;
    const lastEl = strips[strips.length - 1];
    const lastBottom = lastEl.offsetTop + lastEl.offsetHeight;
    if (contentY < firstTop) return 0;
    if (contentY >= lastBottom) return strips.length - 1;

    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < strips.length; i++) {
      const stripEl = strips[i];
      const center = stripEl.offsetTop + stripEl.offsetHeight / 2;
      const dist = Math.abs(contentY - center);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    return nearestIdx;
  };

  const applyRangeAtPointer = (clientX, clientY) => {
    const idx = getIndexAtPointer(clientX, clientY);
    if (idx !== -1) applyRangeToIndex(idx);
  };

  const autoScrollList = (clientY) => {
    const container = listRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const edge = 28;
    const speed = 10;
    if (clientY < rect.top + edge) {
      container.scrollTop -= speed;
    } else if (clientY > rect.bottom - edge) {
      container.scrollTop += speed;
    }
  };

  const stopDragSelectionLoop = () => {
    if (dragRafRef.current != null) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
  };

  const processDragSelection = () => {
    if (!isDragSelectingRef.current) return;
    const { clientX, clientY } = storedPointerRef.current;
    const { clientX: startX, clientY: startY } = dragStartPointerRef.current;
    if (Math.abs(clientX - startX) > 2 || Math.abs(clientY - startY) > 2) {
      didDragRef.current = true;
      autoScrollList(clientY);
      applyRangeAtPointer(clientX, clientY);
    }
  };

  const tickDragSelection = () => {
    if (!isDragSelectingRef.current) {
      dragRafRef.current = null;
      return;
    }
    processDragSelection();
    dragRafRef.current = requestAnimationFrame(tickDragSelection);
  };

  const startDragSelectionLoop = () => {
    if (dragRafRef.current != null) return;
    dragRafRef.current = requestAnimationFrame(tickDragSelection);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragSelectingRef.current || !(e.buttons & 1)) return;
      storedPointerRef.current.clientX = e.clientX;
      storedPointerRef.current.clientY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragSelectingRef.current = false;
      dragAnchorIndexRef.current = null;
      stopDragSelectionLoop();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      stopDragSelectionLoop();
    };
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    isDragSelectingRef.current = true;
    didDragRef.current = false;
    dragAnchorIndexRef.current = null;
    storedPointerRef.current.clientX = e.clientX;
    storedPointerRef.current.clientY = e.clientY;
    dragStartPointerRef.current.clientX = e.clientX;
    dragStartPointerRef.current.clientY = e.clientY;

    const strip = e.target.closest?.("[data-codec-strip-id]");
    if (strip && listRef.current?.contains(strip)) {
      const id = strip.getAttribute("data-codec-strip-id");
      const idx = itemIds.indexOf(id);
      if (idx !== -1) {
        dragAnchorIndexRef.current = idx;
        lastClickIndexRef.current = idx;
      }
    } else if (listRef.current?.contains(e.target)) {
      applyRangeAtPointer(e.clientX, e.clientY);
      if (dragAnchorIndexRef.current !== null) {
        lastClickIndexRef.current = dragAnchorIndexRef.current;
      }
    }

    startDragSelectionLoop();
  };

  const handleClick = (id, e) => {
    if (didDragRef.current) {
      e.preventDefault();
      didDragRef.current = false;
      const idx = itemIds.indexOf(id);
      if (idx !== -1) lastClickIndexRef.current = idx;
      return;
    }

    const idx = itemIds.indexOf(id);
    if (idx === -1) return;

    if (e.shiftKey && lastClickIndexRef.current !== null) {
      applyRangeBetween(lastClickIndexRef.current, idx);
      return;
    }

    onToggle(id);
    lastClickIndexRef.current = idx;
  };

  const handleContainerClick = (e) => {
    if (didDragRef.current) return;
    if (e.target.closest?.("[data-codec-strip-id]")) return;
    onClearHighlight?.();
    lastClickIndexRef.current = null;
  };

  return (
    <div
      ref={(node) => {
        listRef.current = node;
        if (containerRef) containerRef.current = node;
      }}
      data-codec-list-box
      data-codec-list-variant={variant}
      style={getExtensionCodecListBoxStyle(variant, isEmpty)}
      onMouseDown={handleMouseDown}
      onClick={handleContainerClick}
    >
      {isEmpty ? (
        <div style={extensionCodecListEmptyStyle}>{emptyText}</div>
      ) : (
        items.map((item) => {
          const id = typeof item === "string" ? item : item.value;
          const label = getLabel ? getLabel(id) : item.label || id;
          const isSelected = selectedIds.includes(id);
          return (
            <div
              key={id}
              data-codec-strip-id={id}
              role="option"
              aria-selected={isSelected}
              onClick={(e) => handleClick(id, e)}
              style={extensionCodecStripStyle(isSelected)}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
};

const parseExtensionCodecList = (value) =>
  (value || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

const ExtensionCodecDualList = ({
  allOptions,
  selected,
  onChange,
  getLabel,
  emptyTextAvailable = "Available codecs",
  emptyTextSelected = "No selected codecs",
  hideReorder = false,
  isCompact = false,
  style,
}) => {
  const [availableSelected, setAvailableSelected] = useState([]);
  const [chosenSelected, setChosenSelected] = useState([]);
  const chosenListContainerRef = useRef(null);
  const pendingChosenScrollRef = useRef(null);
  const chosenSelectedRef = useRef(chosenSelected);
  chosenSelectedRef.current = chosenSelected;

  const scrollChosenSelectionIntoView = () => {
    const block = pendingChosenScrollRef.current;
    if (!block) return;
    pendingChosenScrollRef.current = null;

    const container = chosenListContainerRef.current;
    const highlighted = chosenSelectedRef.current;
    if (!container || !highlighted.length) return;

    const idsInListOrder = selected.filter((id) => highlighted.includes(id));
    if (!idsInListOrder.length) return;

    if (block === "start") {
      container.scrollTop = 0;
      return;
    }

    if (block === "end") {
      const maxScroll = Math.max(
        0,
        container.scrollHeight - container.clientHeight,
      );
      container.scrollTop = maxScroll;
      return;
    }

    const strips = idsInListOrder
      .map((id) =>
        container.querySelector(
          `[data-codec-strip-id="${CSS.escape(String(id))}"]`,
        ),
      )
      .filter(Boolean);
    if (!strips.length) return;

    const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;
    const containerRect = container.getBoundingClientRect();

    const getStripTop = (strip) =>
      strip.getBoundingClientRect().top - containerRect.top + container.scrollTop;
    const getStripBottom = (strip) =>
      strip.getBoundingClientRect().bottom - containerRect.top + container.scrollTop;

    if (block === "up") {
      const top = getStripTop(strips[0]);
      if (top < viewTop) {
        container.scrollTop = Math.max(0, Math.min(top, maxScroll));
      }
      return;
    }

    if (block === "down") {
      const bottom = getStripBottom(strips[strips.length - 1]);
      if (bottom > viewBottom) {
        container.scrollTop = Math.min(
          Math.max(0, bottom - container.clientHeight),
          maxScroll,
        );
      }
    }
  };

  useEffect(() => {
    if (!pendingChosenScrollRef.current) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollChosenSelectionIntoView);
      });
    });
  }, [selected]);

  const scheduleChosenScroll = (block) => {
    pendingChosenScrollRef.current = block;
  };

  const availableList = allOptions.filter(
    (opt) => !selected.includes(opt.value),
  );

  const toggleAvailableSelect = (id) => {
    setAvailableSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleChosenSelect = (id) => {
    setChosenSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAvailable = (ids) => setAvailableSelected(ids);
  const selectChosen = (ids) => setChosenSelected(ids);

  const clearHighlight = () => {
    setAvailableSelected([]);
    setChosenSelected([]);
  };

  useEffect(() => {
    const handleOutsideClear = (e) => {
      if (!availableSelected.length && !chosenSelected.length) return;
      if (e.target.closest("[data-codec-strip-id]")) return;
      if (e.target.closest("[data-codec-action-btn]")) return;
      if (e.target.closest("[data-codec-list-box]")) return;
      clearHighlight();
    };

    document.addEventListener("mousedown", handleOutsideClear);
    return () => document.removeEventListener("mousedown", handleOutsideClear);
  }, [availableSelected, chosenSelected]);

  const addSelected = () => {
    if (!availableSelected.length) return;
    onChange([
      ...selected,
      ...availableSelected.filter((id) => !selected.includes(id)),
    ]);
    setAvailableSelected([]);
  };

  const addAll = () => {
    onChange(allOptions.map((c) => c.value));
    setAvailableSelected([]);
  };

  const removeSelected = () => {
    if (!chosenSelected.length) return;
    onChange(selected.filter((id) => !chosenSelected.includes(id)));
    setChosenSelected([]);
  };

  const removeAll = () => {
    onChange([]);
    setChosenSelected([]);
  };

  const moveToBottom = () => {
    if (!chosenSelected.length) return;
    scheduleChosenScroll("end");
    onChange([
      ...selected.filter((id) => !chosenSelected.includes(id)),
      ...selected.filter((id) => chosenSelected.includes(id)),
    ]);
  };

  const moveUp = () => {
    if (!chosenSelected.length) return;
    scheduleChosenScroll("up");
    onChange(
      (() => {
        const arr = [...selected];
        for (let i = 1; i < arr.length; i++) {
          const currentId = arr[i];
          const prevId = arr[i - 1];
          if (
            chosenSelected.includes(currentId) &&
            !chosenSelected.includes(prevId)
          ) {
            [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
          }
        }
        return arr;
      })(),
    );
  };

  const moveDown = () => {
    if (!chosenSelected.length) return;
    scheduleChosenScroll("down");
    onChange(
      (() => {
        const arr = [...selected];
        for (let i = arr.length - 2; i >= 0; i--) {
          const currentId = arr[i];
          const nextId = arr[i + 1];
          if (
            chosenSelected.includes(currentId) &&
            !chosenSelected.includes(nextId)
          ) {
            [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
          }
        }
        return arr;
      })(),
    );
  };

  const moveToTop = () => {
    if (!chosenSelected.length) return;
    scheduleChosenScroll("start");
    onChange([
      ...selected.filter((id) => chosenSelected.includes(id)),
      ...selected.filter((id) => !chosenSelected.includes(id)),
    ]);
  };

  if (isCompact) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
          ...style,
        }}
      >
        <div>
          <div style={extensionCodecColumnLabelRowStyle}>
            <div style={extensionCodecColumnLabelStyle}>Available</div>
          </div>
          <ExtensionCodecListBox
            variant="available"
            items={availableList}
            selectedIds={availableSelected}
            onToggle={toggleAvailableSelect}
            onDragSelect={selectAvailable}
            onClearHighlight={clearHighlight}
            emptyText={emptyTextAvailable}
            getLabel={getLabel}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <ExtensionCodecDualListBtn onClick={addSelected} title="Move selected to Selected">
            &gt;
          </ExtensionCodecDualListBtn>
          <ExtensionCodecDualListBtn onClick={addAll} title="Move all to Selected">
            &gt;&gt;
          </ExtensionCodecDualListBtn>
          <ExtensionCodecDualListBtn
            onClick={removeSelected}
            title="Move selected to Available"
          >
            &lt;
          </ExtensionCodecDualListBtn>
          <ExtensionCodecDualListBtn onClick={removeAll} title="Move all to Available">
            &lt;&lt;
          </ExtensionCodecDualListBtn>
        </div>
        <div>
          <div style={extensionCodecColumnLabelRowStyle}>
            <div style={extensionCodecColumnLabelStyle}>Selected</div>
          </div>
          <ExtensionCodecListBox
            variant="selected"
            items={selected}
            selectedIds={chosenSelected}
            onToggle={toggleChosenSelect}
            onDragSelect={selectChosen}
            onClearHighlight={clearHighlight}
            emptyText={emptyTextSelected}
            getLabel={getLabel}
            containerRef={chosenListContainerRef}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: hideReorder
          ? `1fr ${EXTENSION_CODEC_BTN_COL_WIDTH}px 1fr`
          : `1fr ${EXTENSION_CODEC_BTN_COL_WIDTH}px 1fr ${EXTENSION_CODEC_BTN_COL_WIDTH}px`,
        gap: 10,
        width: "100%",
        alignItems: "start",
        ...style,
      }}
    >
      <div>
        <div style={extensionCodecColumnLabelRowStyle}>
          <div style={extensionCodecColumnLabelStyle}>Available</div>
        </div>
        <ExtensionCodecListBox
          variant="available"
          items={availableList}
          selectedIds={availableSelected}
          onToggle={toggleAvailableSelect}
          onDragSelect={selectAvailable}
          onClearHighlight={clearHighlight}
          emptyText={emptyTextAvailable}
          getLabel={getLabel}
        />
      </div>
      <div>
        <div
          style={{ height: EXTENSION_CODEC_LIST_LABEL_OFFSET }}
          aria-hidden="true"
        />
        <div style={extensionCodecBtnColListAlignStyle}>
          <div style={extensionCodecBtnColumnStyle}>
            <ExtensionCodecDualListBtn onClick={addSelected} title="Move selected to Selected">
              &gt;
            </ExtensionCodecDualListBtn>
            <ExtensionCodecDualListBtn onClick={addAll} title="Move all to Selected">
              &gt;&gt;
            </ExtensionCodecDualListBtn>
            <ExtensionCodecDualListBtn
              onClick={removeSelected}
              title="Move selected to Available"
            >
              &lt;
            </ExtensionCodecDualListBtn>
            <ExtensionCodecDualListBtn onClick={removeAll} title="Move all to Available">
              &lt;&lt;
            </ExtensionCodecDualListBtn>
          </div>
        </div>
      </div>
      <div>
        <div style={extensionCodecColumnLabelRowStyle}>
          <div style={extensionCodecColumnLabelStyle}>Selected</div>
        </div>
        <ExtensionCodecListBox
          variant="selected"
          items={selected}
          selectedIds={chosenSelected}
          onToggle={toggleChosenSelect}
          onDragSelect={selectChosen}
          onClearHighlight={clearHighlight}
          emptyText={emptyTextSelected}
          getLabel={getLabel}
          containerRef={chosenListContainerRef}
        />
      </div>
      {!hideReorder ? (
        <div>
          <div
            style={{ height: EXTENSION_CODEC_LIST_LABEL_OFFSET }}
            aria-hidden="true"
          />
          <div style={extensionCodecBtnColListAlignStyle}>
            <div style={extensionCodecBtnColumnStyle}>
              <ExtensionCodecDualListBtn
                reorder
                down
                title="Move to bottom"
                onClick={moveToBottom}
              >
                vv
              </ExtensionCodecDualListBtn>
              <ExtensionCodecDualListBtn reorder title="Move up" onClick={moveUp}>
                ^
              </ExtensionCodecDualListBtn>
              <ExtensionCodecDualListBtn reorder down title="Move down" onClick={moveDown}>
                v
              </ExtensionCodecDualListBtn>
              <ExtensionCodecDualListBtn reorder title="Move to top" onClick={moveToTop}>
                ^^
              </ExtensionCodecDualListBtn>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export {
  ExtensionCodecListBox,
  ExtensionCodecDualList,
  ExtensionCodecDualListBtn,
  parseExtensionCodecList,
  extensionCodecColumnLabelStyle,
  extensionCodecColumnLabelRowStyle,
  extensionCodecBtnColumnStyle,
  extensionCodecBtnColListAlignStyle,
  EXTENSION_CODEC_BTN_COL_WIDTH,
  EXTENSION_CODEC_LIST_LABEL_OFFSET,
};
