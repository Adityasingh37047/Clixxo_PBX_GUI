import React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { CircularProgress } from "@mui/material";
import { C } from "../../../theme/pbxTokens";
import {
  SYSTEM_INFO_CARD_TITLES,
  SYSTEM_INFO_STAT_LABELS,
} from "../../../constants/SystemInfoConstants";
import { Btn } from "../../../components/common";
import { useSystemInfoPage } from "./hooks/useSystemInfoPage";
import {
  Card,
  InfoCardBody,
  InfoTableRow,
  StatCard,
  SystemInfoBreadcrumb,
} from "./components/SystemInfoFormFields";
import {
  infoCardStretchStyle,
  systemInfoPageInnerStyle,
  systemInfoPageWrapStyle,
} from "./components/SystemInfoTableHelpers";
import { resolveStorageDetailRows } from "./utils/SystemInfoTransformers";

const twoColGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 12,
  alignItems: "stretch",
};

const SystemInfo = () => {
  const vm = useSystemInfoPage();
  const {
    LAN_INTERFACES,
    SYSTEM_INFO,
    VERSION_INFO,
    error,
    isRefreshing,
    loadSystemInfo,
    runtime,
    cpuUsage,
    memoryUsage,
    packetLoss,
    storageDetails,
  } = vm;

  const storageDetailRows = resolveStorageDetailRows(storageDetails);
  const lanCount = LAN_INTERFACES.length;
  const oddLanCount = lanCount > 0 && lanCount % 2 === 1;
  const lastLanRow = lanCount === 0 ? 0 : Math.ceil(lanCount / 2);
  const systemDetailsRow = oddLanCount ? lastLanRow : lastLanRow + 1;
  const systemDetailsCol = oddLanCount ? 2 : 1;
  const versionRow = lastLanRow + 1;
  const versionCol = oddLanCount ? 1 : 2;
  const storageRow = oddLanCount ? lastLanRow + 1 : lastLanRow + 2;
  const storageCol = oddLanCount ? 2 : 1;


  const renderLanCard = (lan, gridPosition) => {
    const lanEntries = Object.entries(lan.data || {});
    return (
      <Card
        key={lan.name}
        title={lan.name}
        style={{
          ...infoCardStretchStyle,
          gridRow: gridPosition.row,
          gridColumn: gridPosition.col,
        }}
      >
        <InfoCardBody rowCount={lanEntries.length}>
          {lanEntries.map(([key, val], idx) => (
            <InfoTableRow
              key={key}
              label={key}
              value={val}
              keyName={key}
              even={idx % 2 === 1}
            />
          ))}
        </InfoCardBody>
      </Card>
    );
  };

  const storageDetailsCard = (
    <Card
      title={SYSTEM_INFO_CARD_TITLES.storageDetails}
      style={infoCardStretchStyle}
    >
      <InfoCardBody rowCount={storageDetailRows.length}>
        {storageDetailRows.map((row, idx) => (
          <InfoTableRow
            key={row.label}
            label={row.label}
            value={row.value}
            keyName={row.label}
            even={idx % 2 === 1}
            valueBadge={row.valueBadge}
          />
        ))}
      </InfoCardBody>
    </Card>
  );


  return (
    <div style={systemInfoPageWrapStyle}>
      <div style={systemInfoPageInnerStyle}>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              borderLeft: `3px solid ${C.errorRed}`,
              color: C.errorRed,
              padding: "10px 14px",
              borderRadius: 4,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <SystemInfoBreadcrumb style={{ marginBottom: 0 }} />
          <Btn
            onClick={() => loadSystemInfo(false)}
            disabled={isRefreshing}
            variant="cancel"
            style={{
              height: 30,
              padding: "6px 14px",
              fontSize: 12,
              flexShrink: 0,
              borderRadius: 4,
            }}
          >
            {isRefreshing ? (
              <CircularProgress size={11} style={{ color: "#374151" }} />
            ) : (
              <RefreshIcon sx={{ fontSize: 16 }} />
            )}
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Btn>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 14,
            alignItems: "stretch",
          }}
        >
          <StatCard
            label={SYSTEM_INFO_STAT_LABELS.runtime}
            value={runtime}
            type="default"
            accentColor={C.accent}
          />
          <StatCard
            label={SYSTEM_INFO_STAT_LABELS.cpuUsage}
            value={cpuUsage}
            type="cpu"
            accentColor={C.successGreen}
          />
          <StatCard
            label={SYSTEM_INFO_STAT_LABELS.memoryUsage}
            value={memoryUsage}
            type="cpu"
            accentColor={C.successGreen}
          />
          <StatCard
            label={SYSTEM_INFO_STAT_LABELS.packetLoss}
            value={packetLoss}
            type="default"
            accentColor={C.mutedText}
          />
        </div>

        <div style={{ ...twoColGridStyle, marginBottom: 16 }}>
          {LAN_INTERFACES.map((lan, idx) =>
            renderLanCard(lan, {
              row: Math.floor(idx / 2) + 1,
              col: (idx % 2) + 1,
            }),
          )}

          <Card
            title={SYSTEM_INFO_CARD_TITLES.systemDetails}
            style={{
              ...infoCardStretchStyle,
              gridRow: systemDetailsRow,
              gridColumn: systemDetailsCol,
            }}
          >
            <InfoCardBody rowCount={(SYSTEM_INFO || []).length}>
              {(SYSTEM_INFO || []).map((info, idx) => (
                <InfoTableRow
                  key={idx}
                  label={info.label}
                  value={info.value}
                  keyName={info.label}
                  even={idx % 2 === 1}
                />
              ))}
            </InfoCardBody>
          </Card>

          <Card
            title={SYSTEM_INFO_CARD_TITLES.versionInfo}
            style={{
              ...infoCardStretchStyle,
              gridRow: versionRow,
              gridColumn: versionCol,
            }}
          >
            <InfoCardBody rowCount={(VERSION_INFO || []).length}>
              {(VERSION_INFO || []).map((v, idx) => (
                <InfoTableRow
                  key={idx}
                  label={v.label}
                  value={v.value}
                  keyName={v.label}
                  even={idx % 2 === 1}
                />
              ))}
            </InfoCardBody>
          </Card>

          <Card
            title={SYSTEM_INFO_CARD_TITLES.storageDetails}
            style={{
              ...infoCardStretchStyle,
              gridRow: storageRow,
              gridColumn: storageCol,
            }}
          >
            <InfoCardBody rowCount={storageDetailRows.length}>
              {storageDetailRows.map((row, idx) => (
                <InfoTableRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  keyName={row.label}
                  even={idx % 2 === 1}
                />
              ))}
            </InfoCardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
