import fs from "fs";

function strip(file) {
  let s = fs.readFileSync(file, "utf8");
  s = s.replace(
    /\/\/[^\n]*Color palette[^\n]*\r?\nconst C = \{[\s\S]*?\n\};\r?\n+/,
    "",
  );
  s = s.replace(/\nconst C = \{[\s\S]*?\n\};\r?\n+/, "\n");
  s = s.replace(
    /\/\/[^\n]*Button Component[^\n]*\r?\nconst Btn = \([\s\S]*?\n\};\r?\n+/,
    "",
  );
  s = s.replace(/\nconst Btn = \([\s\S]*?\n\};\r?\n+/, "\n");
  s = s.replace(
    /C\.cardShadow/g,
    '"0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)"',
  );
  fs.writeFileSync(file, s);
  console.log(
    file,
    "Btn",
    /const Btn\s*=/.test(s),
    "C",
    /const C\s*=\s*\{/.test(s),
  );
}

strip(
  "src/modules/Maitenance/System Tools/components/UpgradeFormFields.jsx",
);
strip(
  "src/modules/Maitenance/System Tools/components/LicenceFormFields.jsx",
);
