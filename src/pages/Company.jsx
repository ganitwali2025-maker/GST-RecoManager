import React, { useState } from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { uid } from '../utils/storage';
import { esc } from '../utils/format';

export default function Company() {
  const { companies, activeCompanyId, updateState, financialYear, month, FY_LIST, MONTHS } = useAppContext();
  const { showToast } = useToast();
  
  const [editingCompany, setEditingCompany] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', gstin: '' });

  const handleAdd = () => {
    setEditingCompany(null);
    setFormData({ name: '', gstin: '' });
    setShowForm(true);
  };

  const handleEdit = (c) => {
    setEditingCompany(c);
    setFormData({ name: c.name, gstin: c.gstin });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Remove this company? Its imported data will remain but be unreachable unless re-added with the same ID.')) return;
    const newCompanies = companies.filter(c => c.id !== id);
    let newActiveId = activeCompanyId;
    if (activeCompanyId === id) newActiveId = newCompanies[0]?.id || null;
    updateState({ companies: newCompanies, activeCompanyId: newActiveId });
  };

  const handleSave = () => {
    const name = formData.name.trim();
    const gstin = formData.gstin.trim().toUpperCase();
    
    if (!name || !gstin) {
      showToast('Company name and GSTIN are required');
      return;
    }
    
    if (editingCompany) {
      const newCompanies = companies.map(c => 
        c.id === editingCompany.id ? { ...c, name, gstin } : c
      );
      updateState({ companies: newCompanies });
    } else {
      const newCompany = { id: uid(), name, gstin };
      updateState({ 
        companies: [...companies, newCompany],
        activeCompanyId: newCompany.id
      });
    }
    
    setShowForm(false);
    showToast('Company saved');
  };

  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Companies</h3>
            <div className="hint">Switch the active entity from the top bar</div>
          </div>
          <button className="btn primary" onClick={handleAdd}>
            <Plus size={14} /> Add company
          </button>
        </div>
        <div className="company-list">
          {companies.map(c => (
            <div key={c.id} className={`company-item ${c.id === activeCompanyId ? 'active' : ''}`}>
              <div>
                <div className="nm">{esc(c.name)}</div>
                <div className="gst">{esc(c.gstin)}</div>
              </div>
              <div className="flex gap8">
                {c.id !== activeCompanyId ? (
                  <button className="btn ghost" onClick={() => updateState({ activeCompanyId: c.id })}>Set active</button>
                ) : (
                  <span className="badge green">Active</span>
                )}
                <button className="btn ghost" onClick={() => handleEdit(c)}><Settings size={14} /></button>
                {companies.length > 1 && (
                  <button className="btn danger" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Period</h3>
            <div className="hint">Financial year and month tag every imported row</div>
          </div>
        </div>
        <div className="form-row">
          <div>
            <label>Financial Year</label>
            <select 
              className="ctrl" 
              value={financialYear}
              onChange={(e) => updateState({ financialYear: e.target.value })}
            >
              {FY_LIST.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label>Month</label>
            <select 
              className="ctrl" 
              value={month}
              onChange={(e) => updateState({ month: e.target.value })}
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>{editingCompany ? 'Edit company' : 'Add company'}</h3>
          <div className="form-row">
            <div>
              <label className="field-req">Company Name</label>
              <input 
                className="ctrl" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="field-req">GSTIN</label>
              <input 
                className="ctrl" 
                maxLength="15" 
                placeholder="15-digit GSTIN"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap8">
            <button className="btn primary" onClick={handleSave}>Save</button>
            <button className="btn ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
