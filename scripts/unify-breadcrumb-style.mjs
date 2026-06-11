import fs from "fs";
import path from "path";

/** Exact System Info breadcrumb colors — do not use page C palette */
const BREADCRUMB_MUTED = "#94a3b8";
const BREADCRUMB_CURRENT = "#1e293b";

const ROOT = path.resolve("src/modules");
const TARGET_DIRS = [
  path.join(ROOT, "PBX"),
  path.join(ROOT, "FXS"),
  path.join(ROOT, "CDR"),
  path.join(ROOT, "status"),
];

const CONTAINER_PROPS = `      fontSize: 12,
      color: "${BREADCRUMB_MUTED}",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap"`;

const PBX_BREADCRUMB = `const PbxBreadcrumb = ({ section, current, style }) => (
  <div
    style={{
${CONTAINER_PROPS},
      ...style,
    }}
  >
    <span>PBX</span>
    <span>&gt;</span>
    <span>{section}</span>
    <span>&gt;</span>
    <span style={{ color: "${BREADCRUMB_CURRENT}", fontWeight: 600 }}>{current}</span>
  </div>
);`;

const PAGE_BREADCRUMB = `const PageBreadcrumb = ({ segments, style }) => (
  <div
    style={{
${CONTAINER_PROPS},
      ...style,
    }}
  >
    {segments.map((label, index) => (
      <React.Fragment key={\`\${label}-\${index}\`}>
        {index > 0 ? <span>&gt;</span> : null}
        <span
          style={
            index === segments.length - 1
              ? { color: "${BREADCRUMB_CURRENT}", fontWeight: 600 }
              : undefined
          }
        >
          {label}
        </span>
      </React.Fragment>
    ))}
  </div>
);`;

const PBX_BREADCRUMB_OLD =
  /const PbxBreadcrumb = \(\{ section, current, style \}\) => \([\s\S]*?\);\s*\n/;

const PAGE_BREADCRUMB_OLD =
  /const PageBreadcrumb = \(\{ segments, style \}\) => \([\s\S]*?\);\s*\n/;

const BREADCRUMB_COMPONENTS = [
  "AdvancedBreadcrumb",
  "VoipBreadcrumb",
  "PortBreadcrumb",
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".jsx")) files.push(full);
  }
  return files;
}

function patchNamedBreadcrumbs(content) {
  for (const name of BREADCRUMB_COMPONENTS) {
    const re = new RegExp(`const ${name} = \\([\\s\\S]*?\\n\\);`, "m");
    content = content.replace(re, (block) => {
      if (!block.includes("fontSize: 12")) return block;
      let next = block
        .replace(/color: C\.mutedText/g, `color: "${BREADCRUMB_MUTED}"`)
        .replace(
          /color: C\.valueText, fontWeight: 600/g,
          `color: "${BREADCRUMB_CURRENT}", fontWeight: 600`,
        );
      // Fix broken style={ without {{
      next = next.replace(
        /style=\{\s*\n(\s*fontSize: 12,)/,
        "style={{\n$1",
      );
      return next;
    });
  }
  return content;
}

function patchInlineBreadcrumbs(content) {
  // Fix broken inline style={ from previous run
  content = content.replace(
    /style=\{\s*\n(\s*fontSize: 12,)/g,
    "style={{\n$1",
  );

  content = content.replace(
    /fontSize: 12,\s*color: C\.mutedText,\s*marginBottom: 16,\s*fontWeight: 400,\s*display: "flex",\s*alignItems: "center",\s*gap: 4,\s*flexWrap: "wrap"/g,
    `fontSize: 12,\n            color: "${BREADCRUMB_MUTED}",\n            marginBottom: 16,\n            fontWeight: 400,\n            display: "flex",\n            alignItems: "center",\n            gap: 4,\n            flexWrap: "wrap"`,
  );

  content = content.replace(
    /fontSize: 12, color: "#94a3b8", marginBottom: 16, fontWeight: 400, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap"/g,
    `fontSize: 12,\n            color: "${BREADCRUMB_MUTED}",\n            marginBottom: 16,\n            fontWeight: 400,\n            display: "flex",\n            alignItems: "center",\n            gap: 4,\n            flexWrap: "wrap"`,
  );

  content = content.replace(
    /<span style=\{\{ color: C\.valueText, fontWeight: 600 \}\}>/g,
    `<span style={{ color: "${BREADCRUMB_CURRENT}", fontWeight: 600 }}>`,
  );

  return content;
}

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  if (PBX_BREADCRUMB_OLD.test(content)) {
    content = content.replace(PBX_BREADCRUMB_OLD, `${PBX_BREADCRUMB}\n`);
  }

  if (PAGE_BREADCRUMB_OLD.test(content)) {
    content = content.replace(PAGE_BREADCRUMB_OLD, `${PAGE_BREADCRUMB}\n`);
  }

  content = patchNamedBreadcrumbs(content);
  content = patchInlineBreadcrumbs(content);

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

const files = TARGET_DIRS.flatMap((dir) => walk(dir));
const updated = files.filter(patchFile);

console.log(`Updated ${updated.length} file(s):`);
for (const f of updated) console.log(`  ${path.relative(process.cwd(), f)}`);
