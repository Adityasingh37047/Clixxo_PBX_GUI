import React, { useState } from 'react';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import {
  PORT_GROUP_TOTAL_PORTS,
  PORT_GROUP_TABLE_COLUMNS,
  PORT_GROUP_INDEX_OPTIONS,
  PORT_GROUP_REGISTER_OPTIONS,
  PORT_GROUP_AUTHENTICATION_MODE_OPTIONS,
  PORT_GROUP_SELECT_MODE_OPTIONS,
  PORT_GROUP_MULTI_GROUP_OPTIONS,
  PORT_GROUP_PAGE_TITLE,
  PORT_GROUP_ADD_TITLE,
} from './constants/PortGroupPageConstants';

const blueBarStyle = {
  width: '100%',
  height: 32,
  background:
    'linear-gradient(to bottom, #b3e0ff 0%, #6ec1f7 50%, #3b8fd6 100%)',
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  marginBottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 16,
  color: '#000',
  justifyContent: 'center',
  boxShadow: '0 2px 8px 0 rgba(80,160,255,0.10)',
  position: 'relative',
};

const thStyle = {
  background: '#fff',
  color: '#222',
  fontWeight: 600,
  fontSize: 12,
  border: '1px solid #bbb',
  padding: '3px 4px',
  whiteSpace: 'nowrap',
  textAlign: 'center',
  height: '24px',
  lineHeight: '18px',
};

const tdStyle = {
  border: '1px solid #bbb',
  padding: '3px 4px',
  fontSize: 12,
  background: '#f8fafd',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  height: '24px',
  lineHeight: '18px',
};

const controlButtonStyle = {
  background:
    'linear-gradient(to bottom, #e3e7ef 0%, #bfc6d1 100%)',
  color: '#000',
  fontSize: 12,
  padding: '3px 10px',
  border: '1px solid #999',
  borderRadius: 3,
  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  fontWeight: 500,
  height: 24,
  marginRight: 4,
};

const blueActionButtonStyle = {
  background:
    'linear-gradient(to bottom, #3bb6f5 0%, #0e8fd6 100%)',
  color: '#fff',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 4,
  minWidth: 80,
  height: 32,
  padding: '4px 20px',
  boxShadow: '0 2px 4px #b3e0ff',
  border: '1px solid #0e8fd6',
  cursor: 'pointer',
};

const emptyButtonStyle = {
  ...blueActionButtonStyle,
  minWidth: 120,
};

const initialFormState = () => ({
  index: '1',
  description: 'default',
  registerPortGroup: '0',
  sipAccount: '',
  displayName: '',
  password: '',
  authUserName: '',
  registerSelectMode: '0',
  portSelectMode: '0',
  enumRule: '',
  ringExpire: '20',
  robKey: '',
  enablePortMultiGroup: '0',
  ports: Array.from({ length: PORT_GROUP_TOTAL_PORTS }, () => false),
});

const PortGroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(initialFormState());
  const [checkedRows, setCheckedRows] = useState({});

  const handleAddNewClick = () => {
    setForm(initialFormState());
    setShowAddForm(true);
  };

  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handlePortToggle = (idx) => {
    setForm(prev => ({
      ...prev,
      ports: prev.ports.map((v, i) =>
        i === idx ? !v : v,
      ),
    }));
  };

  const checkAnyPortSelected = () =>
    form.ports.some(Boolean);

  const handleCheckAllPorts = () => {
    setForm(prev => ({
      ...prev,
      ports: prev.ports.map(() => true),
    }));
  };

  const handleInversePorts = () => {
    setForm(prev => ({
      ...prev,
      ports: prev.ports.map(v => !v),
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();

    if (!form.description.trim()) {
      alert('Please enter a description!');
      return;
    }

    if (!checkAnyPortSelected()) {
      alert('Please choose a port!');
      return;
    }

    const selectedPorts = form.ports
      .map((v, i) => (v ? i + 1 : null))
      .filter(n => n !== null)
      .join(',');

    const newGroup = {
      id: Date.now(),
      index: form.index,
      description: form.description,
      sipAccount: form.registerPortGroup === '1' ? form.sipAccount : '---',
      displayName: form.registerPortGroup === '1' && form.displayName
        ? form.displayName
        : '---',
      ports: selectedPorts || '---',
      portSelectMode: PORT_GROUP_SELECT_MODE_OPTIONS.find(
        o => o.value === form.portSelectMode,
      )?.label || '',
      enumRule:
        form.portSelectMode === '5' ? (form.enumRule || '---') : '---',
      ringExpire:
        form.portSelectMode === '5' ? (form.ringExpire || '---') : '---',
      robKey:
        form.portSelectMode !== '4' &&
        form.portSelectMode !== '5' &&
        form.robKey
          ? form.robKey
          : '---',
    };

    setGroups(prev => [...prev, newGroup]);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
  };

  const handleResetForm = () => {
    setForm(initialFormState());
  };

  const handleRowCheck = (id) => {
    setCheckedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTableCheckAll = () => {
    const allChecked = groups.every(g => checkedRows[g.id]);
    if (allChecked) {
      setCheckedRows({});
    } else {
      const next = {};
      groups.forEach(g => {
        next[g.id] = true;
      });
      setCheckedRows(next);
    }
  };

  const handleTableUncheckAll = () => {
    setCheckedRows({});
  };

  const handleTableInverse = () => {
    const next = {};
    groups.forEach(g => {
      next[g.id] = !checkedRows[g.id];
    });
    setCheckedRows(next);
  };

  const handleDelete = () => {
    const anyChecked = groups.some(g => checkedRows[g.id]);
    if (!anyChecked) return;
    setGroups(prev => prev.filter(g => !checkedRows[g.id]));
    setCheckedRows({});
  };

  const handleClearAll = () => {
    setGroups([]);
    setCheckedRows({});
  };

  const renderEmptyState = () => (
    <div
      style={{
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        No available port group!
      </div>
      <button
        type="button"
        style={emptyButtonStyle}
        onClick={handleAddNewClick}
      >
        Add New
      </button>
    </div>
  );

  const renderTable = () => (
    <>
      <div style={blueBarStyle}>
        <span>{PORT_GROUP_PAGE_TITLE}</span>
      </div>
      <div className="w-full bg-white border-2 border-gray-400 border-t-0 rounded-b-lg" style={{ overflowX: 'auto', overflowY: 'visible' }}>
        <table
          className="w-full"
          style={{
            backgroundColor: '#f8fafd',
            tableLayout: 'auto',
            borderCollapse: 'collapse',
            width: '100%',
            minWidth: '900px',
          }}
        >
          <thead>
            <tr>
              {PORT_GROUP_TABLE_COLUMNS.map(col => (
                <th key={col.key} style={thStyle}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <tr key={group.id}>
                <td style={tdStyle}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onClick={() => {
                      // For now, just open add form with this index pre‑selected
                      setForm(prev => ({
                        ...initialFormState(),
                        index: group.index,
                      }));
                      setShowAddForm(true);
                    }}
                  >
                    <EditDocumentIcon
                      style={{ fontSize: 16, color: '#0e8fd6' }}
                    />
                  </button>
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={!!checkedRows[group.id]}
                    onChange={() => handleRowCheck(group.id)}
                  />
                </td>
                <td style={tdStyle}>{group.index}</td>
                <td style={tdStyle}>{group.description}</td>
                <td style={tdStyle}>{group.sipAccount}</td>
                <td style={tdStyle}>{group.displayName}</td>
                <td style={tdStyle}>{group.ports}</td>
                <td style={tdStyle}>{group.portSelectMode}</td>
                <td style={tdStyle}>{group.enumRule}</td>
                <td style={tdStyle}>{group.ringExpire}</td>
                <td style={tdStyle}>{group.robKey}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom controls (Check All / Add New etc) */}
      <div
        style={{
          marginTop: 8,
          padding: '6px 8px',
          background: '#e3e7ef',
          borderRadius: 8,
          border: '1px solid #ccc',
          borderTop: 'none',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
        }}
      >
        <button
          type="button"
          style={controlButtonStyle}
          onClick={handleTableCheckAll}
        >
          Check All
        </button>
        <button
          type="button"
          style={controlButtonStyle}
          onClick={handleTableUncheckAll}
        >
          Uncheck All
        </button>
        <button
          type="button"
          style={controlButtonStyle}
          onClick={handleTableInverse}
        >
          Inverse
        </button>
        <button
          type="button"
          style={controlButtonStyle}
          onClick={handleDelete}
        >
          Delete
        </button>
        <button
          type="button"
          style={controlButtonStyle}
          onClick={handleClearAll}
        >
          Clear All
        </button>
        <button
          type="button"
          style={controlButtonStyle}
          onClick={handleAddNewClick}
        >
          Add New
        </button>
        <span style={{ marginLeft: 16 }}>
          {groups.length} Item Total&nbsp;&nbsp; 20 Items/Page&nbsp;&nbsp;
          1/1&nbsp;&nbsp; First&nbsp;&nbsp; Previous&nbsp;&nbsp; Next&nbsp;&nbsp; Last&nbsp;&nbsp; Go to Page
          &nbsp;
          <select
            style={{
              fontSize: 12,
              padding: '1px 4px',
              borderRadius: 2,
              border: '1px solid #bbb',
              background: '#fff',
            }}
            value={1}
            readOnly
          >
            <option value={1}>1</option>
          </select>
          &nbsp;&nbsp;1 Pages Total
        </span>
      </div>
    </>
  );

  const renderAddForm = () => (
    <>
      <div
        style={{
          ...blueBarStyle,
          width: '62%',
          margin: '0 auto',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <span>{PORT_GROUP_ADD_TITLE}</span>
      </div>

      <div
        style={{
          width: '62%',
          margin: '0 auto',
          border: '1px solid #444444',
          borderTop: 'none',
          backgroundColor: '#dde0e4',
          paddingBottom: 8,
        }}
      >
        <form
          onSubmit={handleSave}
          style={{ width: '100%', paddingTop: 8 }}
        >
          <table
            width="100%"
            cellSpacing="0"
            cellPadding="0"
            style={{ tableLayout: 'fixed' }}
          >
            <tbody>
              {/* Spacer row */}
              <tr>
                <td width="5%">&nbsp;</td>
                <td width="35%">&nbsp;</td>
                <td width="60%">&nbsp;</td>
              </tr>

              {/* Index */}
              <tr>
                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                  Index
                </td>
                <td>
                  <select
                    value={form.index}
                    onChange={e =>
                      handleFormChange('index', e.target.value)
                    }
                    className="border border-gray-400 rounded-sm px-1 bg-white"
                    style={{ width: '76%', height: 24, fontSize: 12 }}
                  >
                    {PORT_GROUP_INDEX_OPTIONS.map(v => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              {/* Spacer */}
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>

              {/* Description */}
              <tr>
                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                  Description
                </td>
                <td>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e =>
                      handleFormChange('description', e.target.value)
                    }
                    className="border border-gray-400 rounded-sm px-1 bg-white"
                    style={{ width: '75%', height: 22, fontSize: 12 }}
                    maxLength={23}
                  />
                </td>
              </tr>

              {/* Spacer */}
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>

              {/* Register Port Group */}
              <tr>
                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                  Register Port Group
                </td>
                <td>
                  <select
                    value={form.registerPortGroup}
                    onChange={e =>
                      handleFormChange('registerPortGroup', e.target.value)
                    }
                    className="border border-gray-400 rounded-sm px-1 bg-white"
                    style={{ width: '76%', height: 24, fontSize: 12 }}
                  >
                    {PORT_GROUP_REGISTER_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              {/* Additional SIP fields (simplified visibility: show when registerPortGroup === '1') */}
              {form.registerPortGroup === '1' && (
                <>
                  {/* Spacer */}
                  <tr>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>

                  {/* SIP Account */}
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                      SIP Account
                    </td>
                    <td>
                      <input
                        type="text"
                        value={form.sipAccount}
                        onChange={e =>
                          handleFormChange('sipAccount', e.target.value)
                        }
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ width: '75%', height: 22, fontSize: 12 }}
                      />
                    </td>
                  </tr>

                  {/* Display Name */}
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                      Display Name
                    </td>
                    <td>
                      <input
                        type="text"
                        value={form.displayName}
                        onChange={e =>
                          handleFormChange('displayName', e.target.value)
                        }
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ width: '75%', height: 22, fontSize: 12 }}
                      />
                    </td>
                  </tr>

                  {/* Password */}
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                      Password
                    </td>
                    <td>
                      <input
                        type="password"
                        value={form.password}
                        onChange={e =>
                          handleFormChange('password', e.target.value)
                        }
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ width: '75%', height: 22, fontSize: 12 }}
                      />
                    </td>
                  </tr>
                </>
              )}

              {/* Spacer */}
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>

              {/* Authentication Mode */}
              <tr>
                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                  Authentication Mode
                </td>
                <td>
                  <select
                    value={form.registerSelectMode}
                    onChange={e =>
                      handleFormChange('registerSelectMode', e.target.value)
                    }
                    className="border border-gray-400 rounded-sm px-1 bg-white"
                    style={{ width: '76%', height: 24, fontSize: 12 }}
                  >
                    {PORT_GROUP_AUTHENTICATION_MODE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              {/* Port Select Mode */}
              <tr>
                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                  Port Select Mode
                </td>
                <td>
                  <select
                    value={form.portSelectMode}
                    onChange={e =>
                      handleFormChange('portSelectMode', e.target.value)
                    }
                    className="border border-gray-400 rounded-sm px-1 bg-white"
                    style={{ width: '76%', height: 24, fontSize: 12 }}
                  >
                    {PORT_GROUP_SELECT_MODE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              {/* Rule / Timeout / RobKey based on select mode (simplified) */}
              {form.portSelectMode === '5' && (
                <>
                  {/* Rule for Ringing by Turns */}
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                      Rule for Ringing by Turns
                    </td>
                    <td>
                      <input
                        type="text"
                        value={form.enumRule}
                        onChange={e =>
                          handleFormChange('enumRule', e.target.value)
                        }
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ width: '75%', height: 22, fontSize: 12 }}
                      />
                    </td>
                  </tr>

                  {/* Timeout for Ringing by Turns (s) */}
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                      Timeout for Ringing by Turns (s)
                    </td>
                    <td>
                      <input
                        type="text"
                        value={form.ringExpire}
                        onChange={e =>
                          handleFormChange('ringExpire', e.target.value)
                        }
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ width: '75%', height: 22, fontSize: 12 }}
                      />
                    </td>
                  </tr>
                </>
              )}

              {form.portSelectMode !== '4' &&
                form.portSelectMode !== '5' && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                      Preemptive Answer Keyboard Shortcut
                    </td>
                    <td>
                      <input
                        type="text"
                        value={form.robKey}
                        onChange={e =>
                          handleFormChange('robKey', e.target.value)
                        }
                        className="border border-gray-400 rounded-sm px-1 bg-white"
                        style={{ width: '75%', height: 22, fontSize: 12 }}
                      />
                    </td>
                  </tr>
                )}

              {/* Spacer */}
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>

              {/* Port Reused by Multiple Groups */}
              <tr>
                <td colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                  Port Reused by Multiple Groups
                </td>
                <td>
                  <select
                    value={form.enablePortMultiGroup}
                    onChange={e =>
                      handleFormChange('enablePortMultiGroup', e.target.value)
                    }
                    className="border border-gray-400 rounded-sm px-1 bg-white"
                    style={{ width: '76%', height: 24, fontSize: 12 }}
                  >
                    {PORT_GROUP_MULTI_GROUP_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              {/* Spacer */}
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>

              {/* Ports grid */}
              <tr>
                <td valign="top" colSpan={2} style={{ textAlign: 'left', paddingLeft: '5%' }}>
                  Port
                </td>
                <td>
                  <div style={{ marginBottom: 8 }}>
                    <button
                      type="button"
                      style={controlButtonStyle}
                      onClick={handleCheckAllPorts}
                    >
                      Check All
                    </button>
                    <button
                      type="button"
                      style={controlButtonStyle}
                      onClick={handleInversePorts}
                    >
                      Inverse
                    </button>
                  </div>
                  {/* Ports laid out in 4 equal columns inside 400px table (like HTML) */}
                  <table style={{ width: 400 }}>
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                    </colgroup>
                    <tbody>
                      {Array.from(
                        { length: PORT_GROUP_TOTAL_PORTS / 4 },
                        (_, rowIdx) => (
                          <tr key={rowIdx}>
                            {Array.from({ length: 4 }, (_, colIdx) => {
                              const idx = rowIdx * 4 + colIdx;
                              if (idx >= PORT_GROUP_TOTAL_PORTS) {
                                return <td key={colIdx} />;
                              }
                              return (
                                <td key={colIdx} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={form.ports[idx]}
                                      onChange={() => handlePortToggle(idx)}
                                      style={{ marginRight: 4 }}
                                    />
                                    {`Port ${idx + 1}(FXS)`}
                                  </label>
                                </td>
                              );
                            })}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>

      {/* Buttons under form, outside border */}
      <div
        style={{
          textAlign: 'center',
          padding: '12px 0 8px 0',
        }}
      >
        <button
          type="button"
          style={{ ...blueActionButtonStyle, marginRight: 40 }}
          onClick={handleSave}
        >
          Save
        </button>
        <button
          type="button"
          style={{ ...blueActionButtonStyle, marginRight: 40 }}
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </>
  );

  return (
    <div
      className="bg-gray-50 min-h-[calc(100vh-80px)] flex flex-col items-center box-border"
      style={{ backgroundColor: '#dde0e4', padding: '8px' }}
    >
      <div className="w-full max-w-full mx-auto">
        {!showAddForm && groups.length === 0 && renderEmptyState()}
        {!showAddForm && groups.length > 0 && renderTable()}
        {showAddForm && renderAddForm()}
      </div>
    </div>
  );
};

export default PortGroupPage;

