import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";

export const extGroupTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "auto",
};

export const extGroupModalTitleStyle = {
  background: "#1e2d42",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 16,
  textAlign: "center",
  padding: "16px 24px",
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
};

export const extGroupModalFormStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  padding: 20,
};

export const extGroupDialogPaperSx = {
  width: 720,
  maxWidth: "95vw",
  margin: 24,
  maxHeight: "calc(100vh - 80px - 48px)",
  display: "flex",
  flexDirection: "column",
  p: 0,
  borderRadius: "4px",
  overflow: "hidden",
};

export const extGroupExtensionsListStyle = {
  background: "#f8fafc",
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 6,
  overflow: "hidden",
};

export const extGroupModalTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    "&:hover fieldset": { borderColor: OUTLINED_HOVER },
    "&.Mui-focused": { boxShadow: FOCUS_RING_SHADOW },
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

export const attachExtGroupModalSmoothWheelScroll = (container) => {
  if (!container) return () => {};

  const state = new WeakMap();
  const activeRafs = new Set();
  const getState = (el) => {
    if (!state.has(el)) {
      state.set(el, { target: el.scrollTop, current: el.scrollTop, rafId: null });
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
