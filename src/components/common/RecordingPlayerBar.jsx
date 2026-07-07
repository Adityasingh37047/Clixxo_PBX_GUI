import { forwardRef } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { C } from "../../theme/pbxTokens";
import { Btn } from "./Button";

const RecordingPlayerBar = forwardRef(
  (
    {
      open = false,
      loading = false,
      label = "Recording",
      loadingLabel = "Loading…",
      src = "",
      onEnded,
      onClose,
      isCompact = false,
      accentColor = C.accent,
    },
    audioRef,
  ) => {
    if (!open) return null;

    return (
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 20,
          transform: "translateX(-50%)",
          zIndex: 1300,
          width: isCompact ? "calc(100vw - 24px)" : 560,
          maxWidth: "calc(100vw - 24px)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#ffffff",
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 12,
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.18)",
          padding: "10px 14px",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.labelText,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? loadingLabel : label}
        </span>
        {src ? (
          <audio
            ref={audioRef}
            src={src}
            controls
            autoPlay
            onEnded={onEnded}
            style={{ height: 36, flex: 1, minWidth: 0 }}
          />
        ) : (
          <div
            style={{ flex: 1, display: "flex", justifyContent: "center" }}
          >
            <CircularProgress size={20} sx={{ color: accentColor }} />
          </div>
        )}
        <Btn variant="cancel" onClick={onClose} style={{ height: 30 }}>
          Close
        </Btn>
      </div>
    );
  },
);

RecordingPlayerBar.displayName = "RecordingPlayerBar";

export { RecordingPlayerBar };
