# Import Issues Report - src/modules Folder

**Date Generated:** May 19, 2026  
**Workspace:** c:\Users\panky\Clixxo_PBX_GUI  
**Scope:** Recursive scan of src/modules/

---

## Executive Summary

Found **18 files with broken relative imports** and **1 potential missing export**. All broken imports follow the same pattern: files at depth 3+ in the module folder structure use incorrect relative path depths (using `../` when they should use `../../../`).

---

## 1. BROKEN/INCORRECT RELATIVE PATHS

### Pattern: Files using incorrect depth paths

Files in directories like `src/modules/FOLDER/SUBFOLDER/file.jsx` are using paths like `../api/apiService` which resolve to `src/modules/api/` (doesn't exist), when they should use `../../../api/apiService` to resolve to `src/api/`.

#### Files at 2-level depth importing with 1-level path (WRONG: `../api/` and `../constants/`):

**Total: 18 files**

| File Path | Incorrect Import | Should Be | Issues |
|-----------|------------------|-----------|--------|
| src/modules/CDR/CallCount.jsx | `../api/apiService` | `../../api/apiService` OR `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/status/System Status/SystemInfo.jsx | `../api/apiService` | `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/status/PBX Status/PbxMonitor.jsx | `../api/apiService` | `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/status/PBX Status/ActiveCallsPage.jsx | `../api/apiService` | `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/status/PBX Status/ActiveCallQueue.jsx | `../api/apiService` | `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/E1-PRI/Num Manipulate/PSTNCallInOriCalleeID.jsx | `../api/apiService` | `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/E1-PRI/Num Manipulate/PSTNCallInCallerID.jsx | `../api/apiService` | `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/E1-PRI/Num Manipulate/PSTNCallInCalleeID.jsx | `../api/apiService` | `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/E1-PRI/Num Manipulate/IPCallInOriCalleeID.jsx | `../api/apiService` | `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/E1-PRI/Num Manipulate/IPCallInCallerID.jsx | `../api/apiService` | `../../../api/apiService` | ❌ Resolves to non-existent `src/modules/api/` |
| src/modules/Maitenance/System Tools/Upgrade.jsx | `../api/apiService`, `../api/axiosInstance`, `../constants/UpgradeConstants` | `../../../api/apiService`, `../../../api/axiosInstance`, `../../../constants/UpgradeConstants` | ❌ All 3 imports broken |
| src/modules/Maitenance/System Tools/BackupUpload.jsx | `../api/apiService`, `../constants/BackupUploadConstants` | `../../../api/apiService`, `../../../constants/BackupUploadConstants` | ❌ Both imports broken |
| src/modules/Maitenance/System Tools/FactoryReset.jsx | `../api/apiService`, `../constants/FactoryResetConstants` | `../../../api/apiService`, `../../../constants/FactoryResetConstants` | ❌ Both imports broken |
| src/modules/Maitenance/System Tools/ModificationRecord.jsx | `../api/apiService`, `../constants/ModificationRecordConstants` | `../../../api/apiService`, `../../../constants/ModificationRecordConstants` | ❌ Both imports broken |
| src/modules/Maitenance/System Tools/Restart.jsx | `../api/apiService`, `../constants/RestartConstants` | `../../../api/apiService`, `../../../constants/RestartConstants` | ❌ Both imports broken |
| src/modules/Maitenance/System Tools/Licence.jsx | `../api/apiService`, `../constants/LicenceConstants` | `../../../api/apiService`, `../../../constants/LicenceConstants` | ❌ Both imports broken |
| src/modules/Maitenance/System Tools/SignalingCallTrack.jsx | `../constants/SignalingCallTrackConstants` | `../../../constants/SignalingCallTrackConstants` | ❌ Constants import broken |
| src/modules/Maitenance/System Tools/SignalingCallTest.jsx | `../constants/SignalingCallTestConstants` | `../../../constants/SignalingCallTestConstants` | ❌ Constants import broken |
| src/modules/Maitenance/System Tools/DeviceLock.jsx | `../constants/DeviceLockConstants` | `../../../constants/DeviceLockConstants` | ❌ Constants import broken |

### Files at 1-level depth (CORRECT):

The following files at `src/modules/FOLDER/file.jsx` depth correctly use `../../` or `../../../`:
- Files in `src/modules/UserManage/User Permission/` correctly use `../../../api/apiService`
- Files in `src/modules/System/System Settings/` correctly use `../../../api/apiService`
- Files in `src/modules/PBX/` subdirectories correctly use `../../../api/apiService`

---

## 2. IMPORTS WITH UNCERTAIN/CONDITIONAL PATHS (Comments suggest awareness of path issues)

Files with comments like "Adjust path if needed" indicate developer uncertainty about import paths:

| File | Import | Status |
|------|--------|--------|
| src/modules/FXS/VoIP/SipCompatibilityPage.jsx | `../../../sections/voip/constants/SipCompatibilityConstants` | ✅ EXISTS - path is correct |
| src/modules/FXS/VoIP/NatSettingsPage.jsx | `../../../sections/voip/constants/NatSettingsConstants` | ✅ EXISTS - path is correct |
| src/modules/FXS/VoIP/FxsVoipSipPage.jsx | `../../../sections/voip/constants/SipSipConstants` | ✅ EXISTS - path is correct |
| src/modules/FXS/Port/PortFxsPage.jsx | `../../../sections/port/constants/PortFxsPageConstants` | ✅ EXISTS - path is correct |
| src/modules/FXS/Advanced/FxsPage.jsx | `../../../sections/advanced/constants/FxsConstants` | ✅ EXISTS - path is correct |

---

## 3. MISSING EXPORTS

**Status:** No missing exports detected.

All imported functions and constants in the grep scan matched exported items. Exports in the following files are correctly declared:
- `src/api/apiService.js` - exports all required functions
- `src/context/AuthContext.jsx` - exports AuthContext properly
- All constants files export their named constants

---

## 4. DUPLICATE IMPORTS

**Status:** No duplicate imports found.

Scanned files do not contain the same import statement appearing twice within the same file. MUI components are imported cleanly without duplication.

---

## 5. FILES REFERENCED BUT NOT EXISTING

**Status:** ⚠️ NONE found, but one anomaly:

| Reference | Status | Notes |
|-----------|--------|-------|
| `src/modules/api/apiService` | ❌ DOES NOT EXIST | Referenced by 18+ files, but only `src/api/apiService` exists |
| `src/modules/constants/` | ❌ DOES NOT EXIST | Referenced by 14+ files, but only `src/constants/` exists |
| `src/modules/api/axiosInstance` | ❌ DOES NOT EXIST | Referenced by files in Maitenance/System Tools, but only `src/api/axiosInstance` exists |

---

## 6. DIRECTORY STRUCTURE ANALYSIS

### Correct Import Depth by Location:

```
src/
├── api/                          (target)
├── constants/                    (target)
├── context/                      (target)
├── modules/
│   ├── CDR/                      📍 File here: use ../../ (2 levels UP)
│   │   └── CallCount.jsx         ❌ Uses ../ (WRONG)
│   ├── status/
│   │   └── System Status/        📍 File here: use ../../../ (3 levels UP)
│   │       └── SystemInfo.jsx    ❌ Uses ../ (WRONG)
│   ├── Maitenance/
│   │   └── System Tools/         📍 File here: use ../../../ (3 levels UP)
│   │       └── Upgrade.jsx       ❌ Uses ../ (WRONG)
│   └── UserManage/
│       └── User Permission/      📍 File here: use ../../../ (3 levels UP)
│           └── ChangePassword.jsx ✅ Uses ../../../ (CORRECT)
```

---

## REMEDIATION SUMMARY

### Files Requiring Import Path Fixes (18 total):

**Group 1: Single-level subdirectories (change `../` to `../../`):**
- `src/modules/CDR/CallCount.jsx`

**Group 2: Two-level subdirectories (change `../` to `../../../`):**
- `src/modules/status/System Status/SystemInfo.jsx`
- `src/modules/status/System Status/PbxMonitor.jsx`
- `src/modules/status/PBX Status/ActiveCallsPage.jsx`
- `src/modules/status/PBX Status/ActiveCallQueue.jsx`
- `src/modules/E1-PRI/Num Manipulate/PSTNCallInOriCalleeID.jsx`
- `src/modules/E1-PRI/Num Manipulate/PSTNCallInCallerID.jsx`
- `src/modules/E1-PRI/Num Manipulate/PSTNCallInCalleeID.jsx`
- `src/modules/E1-PRI/Num Manipulate/IPCallInOriCalleeID.jsx`
- `src/modules/E1-PRI/Num Manipulate/IPCallInCallerID.jsx`
- `src/modules/Maitenance/System Tools/Upgrade.jsx` (3 imports to fix)
- `src/modules/Maitenance/System Tools/BackupUpload.jsx` (2 imports)
- `src/modules/Maitenance/System Tools/FactoryReset.jsx` (2 imports)
- `src/modules/Maitenance/System Tools/ModificationRecord.jsx` (2 imports)
- `src/modules/Maitenance/System Tools/Restart.jsx` (2 imports)
- `src/modules/Maitenance/System Tools/Licence.jsx` (2 imports)
- `src/modules/Maitenance/System Tools/SignalingCallTrack.jsx` (1 import)
- `src/modules/Maitenance/System Tools/SignalingCallTest.jsx` (1 import)
- `src/modules/Maitenance/System Tools/DeviceLock.jsx` (1 import)

**Total fixes needed:** 24 import path corrections across 18 files

---

## RECOMMENDATIONS

1. **Immediate Action:** Fix all relative paths in the 18 identified files
2. **Code Review:** Establish a folder structure convention and document import path rules
3. **Linting:** Consider adding ESLint rule to catch invalid relative imports
4. **Testing:** Run build and test to verify all imports resolve correctly after fixes

---

Generated by Import Analysis Tool
