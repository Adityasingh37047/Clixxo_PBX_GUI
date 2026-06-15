import React from "react";
import { useMediaQuery } from "@mui/material";

const PBX_COMPACT_MQ = "(max-width: 768px)";

const SipPage = () => {
  const isCompact = useMediaQuery(PBX_COMPACT_MQ);
  return (
    <div
      style={{
        padding: isCompact ? 8 : 16,
        minHeight: "calc(100vh - 80px)",
      }}
    >
      SipPage
    </div>
  );
};

export default SipPage;
