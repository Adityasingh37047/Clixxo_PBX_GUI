import {
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { ExtensionCodecDualList } from "../../../../components/common";
import { EXTENSION_CODEC_OPTIONS } from "../../../../constants/ExtensionsConstants";
import { FieldRow, ErrMsg } from "./formFields";
import { SectionCard, AllowCodecsSectionHeading } from "./formFields";
import {
  extensionModalTextFieldSx,
  extensionModalSelectSx,
} from "./formFields";

function BasicTab(props) {
  const {
    formMode, form, handleChange, validationErrors, editIndex, showPassword,
    setShowPassword, bulkForm, setBulkForm, isCompact,
    selectedCodecList, updateCodecList, getCodecLabel,
  } = props;
  return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 8,
                }}
              >
                <SectionCard title="General" isFirst>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    {formMode === "single" ? (
                      <FieldRow
                        label="Extension:"
                        tooltipKey="extension"
                        error={validationErrors.extension}
                      >
                        <TextField
                          type="text"
                          value={form.extension || ""}
                          onChange={(e) =>
                            handleChange("extension", e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors.extension}
                          placeholder="e.g. 1001"
                          disabled={editIndex !== null}
                          sx={extensionModalTextFieldSx}
                        />
                        {validationErrors.extension && (
                          <ErrMsg>{validationErrors.extension}</ErrMsg>
                        )}
                      </FieldRow>
                    ) : (
                      <>
                        <FieldRow label="Start Extension:">
                          <TextField
                            type="number"
                            value={bulkForm.startExtension}
                            onChange={(e) =>
                              setBulkForm((p) => ({
                                ...p,
                                startExtension: e.target.value,
                              }))
                            }
                            size="small"
                            fullWidth
                            variant="outlined"
                            sx={extensionModalTextFieldSx}
                          />
                        </FieldRow>
                        <FieldRow label="Create Number:">
                          <TextField
                            type="number"
                            value={bulkForm.createNumber}
                            onChange={(e) =>
                              setBulkForm((p) => ({
                                ...p,
                                createNumber: e.target.value,
                              }))
                            }
                            size="small"
                            fullWidth
                            variant="outlined"
                            sx={extensionModalTextFieldSx}
                          />
                        </FieldRow>
                        <FieldRow label="Reg Password:" tooltipKey="password">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            <FormControl size="small" fullWidth>
                              <MuiSelect
                                value={bulkForm.passwordMode}
                                onChange={(e) =>
                                  setBulkForm((p) => ({
                                    ...p,
                                    passwordMode: e.target.value,
                                  }))
                                }
                                sx={extensionModalSelectSx}
                              >
                                <MenuItem value="random">Random</MenuItem>
                                <MenuItem value="fixed">Fixed</MenuItem>
                                <MenuItem value="prefix">
                                  Prefix + Extension
                                </MenuItem>
                              </MuiSelect>
                            </FormControl>
                            {bulkForm.passwordMode === "fixed" && (
                              <TextField
                                type="text"
                                value={bulkForm.fixedPassword}
                                onChange={(e) =>
                                  setBulkForm((p) => ({
                                    ...p,
                                    fixedPassword: e.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="Fixed password"
                                sx={extensionModalTextFieldSx}
                              />
                            )}
                            {bulkForm.passwordMode === "prefix" && (
                              <TextField
                                type="text"
                                value={bulkForm.passwordPrefix}
                                onChange={(e) =>
                                  setBulkForm((p) => ({
                                    ...p,
                                    passwordPrefix: e.target.value,
                                  }))
                                }
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="e.g. pw_"
                                sx={extensionModalTextFieldSx}
                              />
                            )}
                          </div>
                        </FieldRow>
                      </>
                    )}

                    <FieldRow label="Context:" tooltipKey="context">
                      <FormControl
                        fullWidth
                        size="small"
                        error={!!validationErrors.context}
                      >
                        <MuiSelect
                          value={form.context || ""}
                          displayEmpty
                          onChange={(e) =>
                            handleChange("context", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                          <MenuItem value="" disabled>
                            <em>Select Context</em>
                          </MenuItem>
                          {Array.from(
                            { length: 10 },
                            (_, i) => `sip${i + 1}`,
                          ).map((ctx, i) => (
                            <MenuItem key={ctx} value={ctx}>
                              Sip {i + 1}
                            </MenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                      {validationErrors.context && (
                        <ErrMsg>{validationErrors.context}</ErrMsg>
                      )}
                    </FieldRow>

                    {formMode === "single" && (
                      <FieldRow label="Password:" tooltipKey="password">
                        <TextField
                          type={showPassword ? "text" : "password"}
                          value={form.password || ""}
                          onChange={(e) =>
                            handleChange("password", e.target.value)
                          }
                          size="small"
                          fullWidth
                          variant="outlined"
                          error={!!validationErrors.password}
                          placeholder="Enter password"
                          sx={extensionModalTextFieldSx}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                  size="small"
                                  sx={{ padding: "2px" }}
                                >
                                  {showPassword ? (
                                    <VisibilityOff fontSize="small" />
                                  ) : (
                                    <Visibility fontSize="small" />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {validationErrors.password && (
                          <ErrMsg>{validationErrors.password}</ErrMsg>
                        )}
                      </FieldRow>
                    )}

                    <FieldRow
                      label="Max Registrations:"
                      tooltipKey="max_registrations"
                    >
                      <TextField
                        type="number"
                        value={form.max_registrations || ""}
                        onChange={(e) =>
                          handleChange("max_registrations", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>

                    <FieldRow label="Transport:" tooltipKey="transport">
                      <FormControl fullWidth size="small">
                        <MuiSelect
                          value={form.transport || "udp"}
                          onChange={(e) =>
                            handleChange("transport", e.target.value)
                          }
                          sx={extensionModalSelectSx}
                        >
                  <MenuItem value="udp">udp</MenuItem>
                          <MenuItem value="tcp">tcp</MenuItem>
                          <MenuItem value="tls">tls</MenuItem>
                          <MenuItem value="ws">ws</MenuItem>
                          <MenuItem value="wss">wss</MenuItem>
                          <MenuItem value="udp-ipv6">udp-ipv6</MenuItem>
                          <MenuItem value="tcp-ipv6">tcp-ipv6</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </FieldRow>
                  </div>

                  <div style={{ width: "100%" }}>
                    <AllowCodecsSectionHeading
                      tooltipKey="allow_codecs"
                      required
                    />
                    <ExtensionCodecDualList
                      allOptions={EXTENSION_CODEC_OPTIONS}
                      selected={selectedCodecList}
                      onChange={updateCodecList}
                      getLabel={getCodecLabel}
                    />
                    {validationErrors.allow_codecs && (
                      <ErrMsg>{validationErrors.allow_codecs}</ErrMsg>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="User Info">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      ...(isCompact ? { gridTemplateColumns: "1fr" } : {}),
                      gap: "8px 32px",
                    }}
                  >
                    <FieldRow label="Name:" tooltipKey="name">
                      <TextField
                        type="text"
                        value={form.user_name || ""}
                        onChange={(e) =>
                          handleChange("user_name", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="User Password:" tooltipKey="user_password">
                      <TextField
                        type="password"
                        value={form.user_password || ""}
                        onChange={(e) =>
                          handleChange("user_password", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Email:" tooltipKey="email">
                      <TextField
                        type="email"
                        value={form.email || ""}
                        onChange={(e) => handleChange("email", e.target.value)}
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                    <FieldRow label="Mobile Number:" tooltipKey="mobile_number">
                      <TextField
                        type="text"
                        value={form.mobile_number || ""}
                        onChange={(e) =>
                          handleChange("mobile_number", e.target.value)
                        }
                        size="small"
                        fullWidth
                        variant="outlined"
                        placeholder="+91XXXXXXXXXX"
                        sx={extensionModalTextFieldSx}
                      />
                    </FieldRow>
                  </div>
                </SectionCard>
              </div>
  );
}

export default BasicTab;
