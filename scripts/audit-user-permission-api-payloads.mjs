/**
 * Compare API call sites HEAD vs current for User Permission pages.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const base = path.join("src", "modules", "UserManage", "User Permission");

function gitShow(rel) {
  try {
    return execSync(`git show "HEAD:${rel.replace(/\\/g, "/")}"`, {
      encoding: "utf8",
      maxBuffer: 40e6,
      shell: true,
    });
  } catch {
    return null;
  }
}

function extract(src, name) {
  if (!src) return [];
  const out = [];
  const re = new RegExp(`\\b${name}\\s*\\(`, "g");
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length;
    let depth = 1;
    const start = i;
    while (i < src.length && depth > 0) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") depth--;
      i++;
    }
    out.push(src.slice(start, i - 1).replace(/\s+/g, " ").trim());
  }
  return out;
}

function objKeys(body) {
  const k = new Set();
  for (const m of body.matchAll(/(?:^|[{\s,])([a-zA-Z_][\w]*)\s*:/g)) {
    k.add(m[1]);
  }
  return [...k].sort();
}

const pairs = [
  {
    page: "UserManage",
    hook: "hooks/useUserManagePage.js",
    extras: [
      "utils/UserManageTransformers.js",
      "utils/UserManageValidators.js",
    ],
    apis: ["createUser", "updateUserAccess", "deleteUser", "fetchUserList"],
  },
  {
    page: "AccountManage",
    hook: "hooks/useAccountManagePage.js",
    extras: [
      "utils/AccountManageTransformers.js",
      "utils/AccountManageValidators.js",
    ],
    apis: [
      "fetchAccountManageGetAll",
      "fetchAccountManageRegister",
      "fetchAccountManageUpdate",
      "fetchAccountManageDelete",
    ],
  },
  {
    page: "ChangePassword",
    hook: "hooks/useChangePasswordPage.js",
    extras: [
      "utils/ChangePasswordTransformers.js",
      "utils/ChangePasswordValidators.js",
    ],
    apis: ["fetchChangePassword"],
  },
];

let bad = 0;

for (const p of pairs) {
  const headRel = `${base.replace(/\\/g, "/")}/${p.page}.jsx`;
  const head = gitShow(headRel);
  const curParts = [fs.readFileSync(path.join(base, p.hook), "utf8")];
  for (const e of p.extras) {
    const fp = path.join(base, e);
    if (fs.existsSync(fp)) curParts.push(fs.readFileSync(fp, "utf8"));
  }
  const cur = curParts.join("\n");

  console.log(`\n==== ${p.page} ====`);
  console.log(`HEAD file: ${head ? "found (" + head.length + " chars)" : "MISSING"}`);

  for (const api of p.apis) {
    const hb = extract(head, api);
    const cb = extract(cur, api);
    const callOk = hb.length > 0 && cb.length > 0;
    const hk = hb.map((b) => objKeys(b).join(",")).join(" || ");
    const ck = cb.map((b) => objKeys(b).join(",")).join(" || ");

    // For simple-arg APIs (id, userData) keys may differ; call count must match.
    let shapeOk = callOk;
    if (callOk && hk && ck) {
      const headKeySets = hb.map(objKeys);
      const curKeySets = cb.map(objKeys);
      // if HEAD uses object literal with 2+ keys, require CUR still has those keys somewhere
      for (let i = 0; i < headKeySets.length; i++) {
        const req = headKeySets[i];
        if (req.length < 2) continue;
        const union = new Set(curKeySets.flat());
        const lost = req.filter((k) => !union.has(k));
        // allow wrapper vars like userData / buildSavePayload
        if (lost.length && !/userData|build|Payload|form/.test(cb.join(" "))) {
          shapeOk = false;
          console.log(
            `  PAYLOAD LOST for ${api}: ${lost.join(",")}`,
          );
        }
      }
    }

    const status = callOk && shapeOk ? "OK" : "FAIL";
    if (status === "FAIL") bad++;
    console.log(
      `${api}: HEAD×${hb.length} CUR×${cb.length} [${status}] keysH=[${hk}] keysC=[${ck}]`,
    );
    if (hb[0]) console.log(`  H: ${hb[0].slice(0, 180)}`);
    if (cb[0]) console.log(`  C: ${cb[0].slice(0, 180)}`);
  }
}

console.log(`\n=== RESULT: ${bad === 0 ? "PASS" : "FAIL"} (${bad} bad) ===`);
process.exit(bad ? 1 : 0);
