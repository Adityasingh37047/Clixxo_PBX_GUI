const fs = require("fs");
const p = "D:/Clixxo_PBX_GUI/src/modules/PBX/Extensions/Extensions.jsx";
let t = fs.readFileSync(p, "utf8");
t = t.replace(
  /from "\.\.\/\.\.\/\.\.\/constants\/SipAccountConstants";/,
  'from "../../../constants/ExtensionsConstants";'
);
if (!t.includes("EXTENSION_FIELD_TOOLTIPS")) {
  t = t.replace(
    /CODEC_OPTIONS,\n\}/,
    "CODEC_OPTIONS,\n  EXTENSION_FIELD_TOOLTIPS,\n}"
  );
}
// fix broken import block if duplicate react import
if ((t.match(/^import React/gms) || []).length > 1) {
  const developStart = t.indexOf('import React, {\n  useState,\n  useRef,\n  useEffect,\n  useLayoutEffect');
  if (developStart > 0) {
    const second = t.indexOf('import React, { useState, useRef, useEffect }');
    if (second > developStart) {
      t = t.slice(0, second) + t.slice(t.indexOf('import EditDocumentIcon', second));
    }
  }
}
fs.writeFileSync(p, t, "utf8");
console.log("fixed imports");
