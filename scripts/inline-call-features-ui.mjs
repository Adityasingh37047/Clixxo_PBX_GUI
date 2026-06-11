import fs from "fs";
import path from "path";

const ROOT = path.resolve("src/modules/PBX/CallFeatures");

const SHELL_UI = `
// ── Local page shell UI (pilot: inlined from pbxSharedUi) ──
const pbxPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  boxSizing: "border-box",
};

const pbxPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
};

const pbxBreadcrumbStyle = {
  fontSize: 12,
  color: C.mutedText,
  marginBottom: 16,
  fontWeight: 400,
  display: "flex",
  alignItems: "center",
  gap: 4,
  flexWrap: "wrap",
};

const PbxBreadcrumb = ({ section, current, style }) => (
  <div style={{ ...pbxBreadcrumbStyle, ...style }}>
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: C.strongText, fontWeight: 600 }}>{current}</span>
  </div>
);

const TableListLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 48,
    }}
  >
    <CircularProgress size={28} style={{ color: C.accent }} />
  </div>
);

const TableListEmptyState = ({
  message,
  onAddNew,
  buttonLabel = "+ Add New",
  showButton = true,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 240,
      padding: 24,
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#3E5475",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: showButton && onAddNew ? 16 : 0,
      }}
    >
      {message}
    </div>
    {showButton && onAddNew ? (
      <Btn
        variant="cancel"
        onClick={onAddNew}
        style={{ padding: "8px 24px", fontSize: 12, borderRadius: 6 }}
      >
        {buttonLabel}
      </Btn>
    ) : null}
  </div>
);
`;

const STANDARD_IMPORT =
  /import\s*\{\s*PbxBreadcrumb,\s*TableListLoading,\s*TableListEmptyState,\s*pbxPageWrapStyle,\s*pbxPageInnerStyle,\s*\}\s*from\s*["']\.\.\/\.\.\/\.\.\/shared\/pbxSharedUi["'];\s*\n/;

const INSERT_AFTER_CHECKBOX =
  /(const checkboxSx = \{[\s\S]*?\};\s*)/;

const STANDARD_FILES = [
  "PickupGroup.jsx",
  "RingGroup.jsx",
  "Paging.jsx",
  "ConferencePage.jsx",
  "BlockedListPage.jsx",
  "SpeedDialPage.jsx",
  "CallBackPage.jsx",
  "IVRPage.jsx",
  "PrivateGroup.jsx",
  "DisaPage.jsx",
];

for (const file of STANDARD_FILES) {
  const filePath = path.join(ROOT, file);
  let content = fs.readFileSync(filePath, "utf8");

  if (!STANDARD_IMPORT.test(content)) {
    console.log(`SKIP (no standard import): ${file}`);
    continue;
  }
  if (content.includes("Local page shell UI (pilot")) {
    console.log(`SKIP (already inlined): ${file}`);
    continue;
  }

  content = content.replace(STANDARD_IMPORT, "");
  if (!INSERT_AFTER_CHECKBOX.test(content)) {
    console.error(`FAIL (no checkboxSx anchor): ${file}`);
    process.exitCode = 1;
    continue;
  }
  content = content.replace(INSERT_AFTER_CHECKBOX, `$1${SHELL_UI}\n`);
  fs.writeFileSync(filePath, content);
  console.log(`OK: ${file}`);
}
