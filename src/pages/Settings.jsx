import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';

export default function Settings() {
  const { settings, updateSettings, loadSample, clearAllData } = useAppContext();
  const { showToast } = useToast();

  const handleThemeChange = (theme) => {
    updateSettings({ theme });
  };

  const handleToleranceChange = (e) => {
    updateSettings({ tolerance: Number(e.target.value) });
    showToast('Tolerance updated');
  };

  const handleNormToggle = (e) => {
    updateSettings({ normalizeInvoice: e.target.checked });
    showToast('Setting updated');
  };

  const handleClear = () => {
    if (!window.confirm('This will erase all companies and data on this device. Continue?')) return;
    clearAllData();
    showToast('All data cleared');
  };

  return (
    <>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Appearance</h3>
        <div className="settings-row">
          <div>
            <div className="t1">Theme</div>
            <div className="t2">Choose how ReconIQ looks</div>
          </div>
          <div className="flex gap8">
            <button className={`chip ${settings.theme === 'dark' ? 'active' : ''}`} onClick={() => handleThemeChange('dark')}>Dark</button>
            <button className={`chip ${settings.theme === 'light' ? 'active' : ''}`} onClick={() => handleThemeChange('light')}>Light</button>
            <button className={`chip ${settings.theme === 'blue' ? 'active' : ''}`} onClick={() => handleThemeChange('blue')}>Tally Blue</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Matching rules</h3>
        <div className="settings-row">
          <div>
            <div className="t1">Rounding tolerance</div>
            <div className="t2">Differences within this amount still count as Matched</div>
          </div>
          <select className="ctrl" value={settings.tolerance} onChange={handleToleranceChange}>
            {[0, 1, 2, 5, 10].map(v => (
              <option key={v} value={v}>₹{v}</option>
            ))}
          </select>
        </div>
        <div className="settings-row">
          <div>
            <div className="t1">Normalize invoice numbers</div>
            <div className="t2">Ignore spaces, hyphens and case when matching invoice numbers</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={settings.normalizeInvoice} onChange={handleNormToggle} />
            <span className="slider-tog"></span>
          </label>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Data</h3>
        <div className="settings-row">
          <div>
            <div className="t1">Load sample data</div>
            <div className="t2">Populate the active company & period with demo invoices</div>
          </div>
          <button className="btn ghost" onClick={loadSample}>
            <Sparkles size={14} /> Load sample
          </button>
        </div>
        <div className="settings-row">
          <div>
            <div className="t1">Clear all data</div>
            <div className="t2">Removes every company, books row and GSTR-2B row on this device</div>
          </div>
          <button className="btn danger" onClick={handleClear}>
            <Trash2 size={14} /> Clear everything
          </button>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>About</h3>
        <p style={{ color: 'var(--muted)', fontSize: '12.5px' }}>
          ReconIQ matches your books purchase register against GSTR-2B by GSTIN and invoice number, then flags mismatches, missing invoices and duplicates so you can close ITC gaps before filing. All data stays in this browser — nothing is uploaded anywhere.
        </p>
      </div>
    </>
  );
}
