import fs from "fs";
import path from "path";

function writeHelpers(pageName, pfx) {
  const base = path.join("src", "modules", "Maitenance", "System Tools");
  const content = `import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as ${pfx}PageWrapStyle,
  extensionPageInnerStyle as ${pfx}PageInnerStyle,
  extensionCardStyle as ${pfx}CardStyle,
  extensionToolbarStyle as ${pfx}ToolbarStyle,
  extensionFixedAlertSx as ${pfx}FixedAlertSx,
  extensionCancelBtnStyle as ${pfx}CancelBtnStyle,
  extensionPrimaryBtnStyle as ${pfx}PrimaryBtnStyle,
  addNewModalFooterBtnStyle as ${pfx}FooterBtnStyle,
} from "../../../../components/common";

export {
  CARD_RADIUS,
  ${pfx}PageWrapStyle,
  ${pfx}PageInnerStyle,
  ${pfx}CardStyle,
  ${pfx}ToolbarStyle,
  ${pfx}FixedAlertSx,
  ${pfx}CancelBtnStyle,
  ${pfx}PrimaryBtnStyle,
  ${pfx}FooterBtnStyle,
};
`;
  fs.writeFileSync(
    path.join(base, "components", `${pageName}TableHelpers.js`),
    content,
  );
}

function writeUtils(pageName) {
  const base = path.join("src", "modules", "Maitenance", "System Tools");
  fs.mkdirSync(path.join(base, "utils"), { recursive: true });
  fs.mkdirSync(path.join(base, "hooks"), { recursive: true });
  fs.writeFileSync(
    path.join(base, "utils", `${pageName}Transformers.js`),
    `export function passthrough${pageName}(v) {\n  return v;\n}\n`,
  );
  fs.writeFileSync(
    path.join(base, "utils", `${pageName}Validators.js`),
    `export function ok${pageName}() {\n  return true;\n}\n`,
  );
}

function transform(pageName, pfx) {
  const base = path.join("src", "modules", "Maitenance", "System Tools");
  const formPath = path.join(base, "components", `${pageName}FormFields.jsx`);
  let src = fs.readFileSync(formPath, "utf8");

  src = src.replaceAll('from "../../../api/', 'from "../../../../api/');
  src = src.replaceAll("from '../../../api/", "from '../../../../api/");
  src = src.replaceAll(
    'from "../../../constants/',
    'from "../../../../constants/',
  );
  src = src.replaceAll(
    "from '../../../constants/",
    "from '../../../../constants/",
  );
  src = src.replaceAll(
    'from "../../../components/common',
    'from "../../../../components/common',
  );
  src = src.replaceAll(
    "from '../../../components/common",
    "from '../../../../components/common",
  );
  src = src.replaceAll('from "../../../theme/', 'from "../../../../theme/');

  src = src.replace(/\/\/[^\n]*Color palette[^\n]*\nconst C\s*=\s*\{[\s\S]*?\n\};\n+/m, "");
  src = src.replace(/const C\s*=\s*\{[\s\S]*?\n\};\n+/m, "");
  src = src.replace(
    /\/\/[^\n]*Local field UI[^\n]*\nconst OUTLINED_BORDER[\s\S]*?const FOCUS_RING_SHADOW[\s\S]*?;\s*\n+/m,
    "",
  );
  src = src.replace(
    /const OUTLINED_BORDER\s*=[\s\S]*?const FOCUS_RING_SHADOW[\s\S]*?;\s*\n+/m,
    "",
  );
  src = src.replace(
    /\/\/[^\n]*Button Component[\s\S]*?const Btn\s*=\s*\([\s\S]*?\n\};\n+/m,
    "",
  );
  src = src.replace(/const Btn\s*=\s*\([\s\S]*?\n\};\n+/m, "");

  src = src.replace(
    /import\s*\{\s*Btn\s*\}\s*from\s*["'][^"']*components\/common["'];?\s*\n/,
    "",
  );

  const inject = `import { C, OUTLINED_BORDER, OUTLINED_HOVER, OUTLINED_FOCUS, FOCUS_RING_SHADOW } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  ${pfx}PageWrapStyle,
  ${pfx}PageInnerStyle,
  ${pfx}CardStyle,
  ${pfx}ToolbarStyle,
  ${pfx}FixedAlertSx,
  ${pfx}FooterBtnStyle,
} from "./${pageName}TableHelpers";
`;

  src = inject + "\n" + src;

  src = src.replace(
    new RegExp(`const ${pageName}\\s*=\\s*\\(`),
    `export const ${pageName}MainView = (`,
  );
  src = src.replace(new RegExp(`export default ${pageName};?\\s*$`), "");

  if (pageName === "Upgrade") {
    src = src.replace(/\bUpgradePageWrapStyle\b/g, `${pfx}PageWrapStyle`);
    src = src.replace(/\bUpgradePageInnerStyle\b/g, `${pfx}PageInnerStyle`);
    src = src.replace(
      /const upgradePageWrapStyle\s*=\s*\{[\s\S]*?\};\n+/m,
      "",
    );
    src = src.replace(
      /const upgradePageInnerStyle\s*=\s*\{[\s\S]*?\};\n+/m,
      "",
    );
  }

  // C.cardShadow references — pbxTokens has no cardShadow
  src = src.replace(/C\.cardShadow/g, '"0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)"');

  fs.writeFileSync(formPath, src);

  fs.writeFileSync(
    path.join(base, "hooks", `use${pageName}Page.js`),
    `import { useRef } from "react";
/** Bridge hook until full state extraction: MainView currently owns page state. */
export function use${pageName}Page() {
  const ready = useRef(true);
  return { ready: ready.current };
}
`,
  );

  fs.writeFileSync(
    path.join(base, `${pageName}.jsx`),
    `import React from "react";
import { ${pageName}MainView } from "./components/${pageName}FormFields";
import { use${pageName}Page } from "./hooks/use${pageName}Page";

const ${pageName} = () => {
  const vm = use${pageName}Page();
  const { ready } = vm;
  if (!ready) return null;
  return <${pageName}MainView />;
};

export default ${pageName};
`,
  );

  console.log("OK", pageName, "form lines", src.split("\n").length);
}

writeHelpers("Upgrade", "upgrade");
writeHelpers("Licence", "licence");
writeUtils("Upgrade");
writeUtils("Licence");
transform("Upgrade", "upgrade");
transform("Licence", "licence");
