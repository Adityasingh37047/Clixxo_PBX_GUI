import React from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { TextField, IconButton } from "@mui/material";
import {
  SipRegisterFieldLabel,
  trunkAdaptRowGridColumns,
  trunkAdaptTextFieldSx,
  trunkAdaptRowActionBtnSx,
} from "./SipRegisterFormFields";

function SipRegisterAdaptTab({ adaptRows, setAdaptRows }) {
  return (
  <div className="p-3 sm:p-5">
    <div
      className="grid gap-2 items-center text-[12px] font-semibold border-b border-gray-200 pb-2 mb-3"
      style={{
        gridTemplateColumns: trunkAdaptRowGridColumns,
      }}
    >
      <SipRegisterFieldLabel tooltipKey="match_mode">
        Match Mode
      </SipRegisterFieldLabel>
      <SipRegisterFieldLabel tooltipKey="strip">
        Strip
      </SipRegisterFieldLabel>
      <SipRegisterFieldLabel tooltipKey="prepend">
        Prepend
      </SipRegisterFieldLabel>
      <IconButton
        size="small"
        onClick={() =>
          setAdaptRows((r) => [
            ...r,
            { matchMode: "", strip: "", prepend: "" },
          ])
        }
        sx={trunkAdaptRowActionBtnSx}
        aria-label="add adapt row"
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </div>
    <div className="space-y-2">
      {adaptRows.map((row, i) => (
        <div
          key={i}
          className="grid gap-2 items-center"
          style={{
            gridTemplateColumns: trunkAdaptRowGridColumns,
          }}
        >
          <TextField
            size="small"
            placeholder="Match"
            value={row.matchMode}
            onChange={(e) =>
              setAdaptRows((r) =>
                r.map((x, j) =>
                  j === i ? { ...x, matchMode: e.target.value } : x,
                ),
              )
            }
            sx={trunkAdaptTextFieldSx}
          />
          <TextField
            size="small"
            placeholder="Strip"
            value={row.strip}
            onChange={(e) =>
              setAdaptRows((r) =>
                r.map((x, j) =>
                  j === i ? { ...x, strip: e.target.value } : x,
                ),
              )
            }
            sx={trunkAdaptTextFieldSx}
          />
          <TextField
            size="small"
            placeholder="Prepend"
            value={row.prepend}
            onChange={(e) =>
              setAdaptRows((r) =>
                r.map((x, j) =>
                  j === i ? { ...x, prepend: e.target.value } : x,
                ),
              )
            }
            sx={trunkAdaptTextFieldSx}
          />
          {adaptRows.length > 1 ? (
            <IconButton
              size="small"
              onClick={() =>
                setAdaptRows((r) => r.filter((_, j) => j !== i))
              }
              sx={trunkAdaptRowActionBtnSx}
              aria-label="remove adapt row"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  </div>

  );
}

export default SipRegisterAdaptTab;
