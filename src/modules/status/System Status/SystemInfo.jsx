import React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, CircularProgress } from "@mui/material";
import { SYSTEM_INFO_CARD_TITLES } from "../../../constants/SystemInfoConstants";
import {
  Btn,
  extensionFixedAlertSx as systemInfoFixedAlertSx,
} from "../../../components/common";
import { useSystemInfoPage } from "./hooks/useSystemInfoPage";
import {
  Card,
  InfoCardBody,
  InfoTableRow,
  SystemInfoBreadcrumb,
} from "./components/SystemInfoFormFields";
import {
  HardDrivesCard,
  SystemResourcesCard,
} from "./components/SystemInfoResourceCards";
import {
  infoCardStretchStyle,
  systemInfoPageInnerStyle,
  systemInfoPageWrapStyle,
} from "./components/SystemInfoTableHelpers";

const twoColGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 20,
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
    systemResources,
    hardDrives,
  } = vm;

  const lanCount = LAN_INTERFACES.length;
  const oddLanCount = lanCount > 0 && lanCount % 2 === 1;
  const lastLanRow = lanCount === 0 ? 0 : Math.ceil(lanCount / 2);
  const systemDetailsRow = oddLanCount ? lastLanRow : lastLanRow + 1;
  const systemDetailsCol = oddLanCount ? 2 : 1;
  const versionRow = lastLanRow + 1;
  const versionCol = oddLanCount ? 1 : 2;

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

  return (
    <div style={systemInfoPageWrapStyle}>
      <div style={systemInfoPageInnerStyle}>
        {error && (
          <Alert severity="error" sx={systemInfoFixedAlertSx}>
            {error}
          </Alert>
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

        {/* Row 1: System Resources | Hard Drives */}
        <div style={{ ...twoColGridStyle, marginBottom: 20 }}>
          <SystemResourcesCard
            data={systemResources}
            onRefresh={() => loadSystemInfo(false)}
            refreshing={isRefreshing}
          />
          <HardDrivesCard
            data={hardDrives}
            onRefresh={() => loadSystemInfo(false)}
            refreshing={isRefreshing}
          />
        </div>

        {/* Row 2+: LAN interfaces, then System Details | Version Info */}
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
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
