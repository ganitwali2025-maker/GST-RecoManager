import React, { useState } from 'react';
import { Badge } from './Badge';
import { fmtNum, esc } from '../utils/format';
import { taxTotal, rowDataIssues } from '../utils/invoice';
import { Edit2, Trash2, X, ClipboardList, Save, FileText, Calendar, User, Building, IndianRupee, Percent } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AuditModal = ({ row, type, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState(row);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '500px', maxWidth: '95%', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        
        <div style={{ background: 'linear-gradient(to right, #e8f7f0, #f5fcf9)', padding: '16px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: '#0fa958', color: '#fff', padding: '10px', borderRadius: '12px' }}>
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#092d1c', fontSize: '20px', fontWeight: 700 }}>Audit Record</h3>
              <div style={{ color: '#537d67', fontSize: '13px', marginTop: '2px' }}>Enter the details of the invoice for audit tracking</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3d5c4b', padding: '4px' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f4a31', marginBottom: '6px', fontWeight: 700 }}>
              <FileText size={16} /> Invoice No
            </label>
            <input name="invoiceNo" value={formData.invoiceNo || ''} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #b6d8c4', color: '#2b4d3c', fontSize: '13px', background: '#fdfefa', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f4a31', marginBottom: '6px', fontWeight: 700 }}>
              <Calendar size={16} /> Date
            </label>
            <input name="invoiceDate" value={formData.invoiceDate || ''} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d5e5db', color: '#2b4d3c', fontSize: '13px', outline: 'none' }} />
          </div>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f4a31', marginBottom: '6px', fontWeight: 700 }}>
              <User size={16} /> GSTIN
            </label>
            <input name="gstin" value={formData.gstin || ''} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d5e5db', color: '#2b4d3c', fontSize: '13px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f4a31', marginBottom: '6px', fontWeight: 700 }}>
              <Building size={16} /> Supplier Name
            </label>
            <input name="supplierName" value={formData.supplierName || ''} onChange={handleChange} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d5e5db', color: '#2b4d3c', fontSize: '13px', outline: 'none' }} />
          </div>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f4a31', marginBottom: '6px', fontWeight: 700 }}>
              <IndianRupee size={16} /> Taxable Value
            </label>
            <input name="taxable" value={formData.taxable || ''} onChange={handleChange} type="number" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #b6d8c4', color: '#2b4d3c', fontSize: '13px', background: '#fdfefa', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f4a31', marginBottom: '6px', fontWeight: 700 }}>
              <Percent size={16} /> IGST
            </label>
            <input name="igst" value={formData.igst || ''} onChange={handleChange} type="number" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d5e5db', color: '#2b4d3c', fontSize: '13px', outline: 'none' }} />
          </div>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f4a31', marginBottom: '6px', fontWeight: 700 }}>
              <FileText size={16} /> CGST
            </label>
            <input name="cgst" value={formData.cgst || ''} onChange={handleChange} type="number" placeholder="Enter CGST amount" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d5e5db', color: '#2b4d3c', fontSize: '13px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0f4a31', marginBottom: '6px', fontWeight: 700 }}>
              <FileText size={16} /> SGST
            </label>
            <input name="sgst" value={formData.sgst || ''} onChange={handleChange} type="number" placeholder="Enter SGST amount" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d5e5db', color: '#2b4d3c', fontSize: '13px', outline: 'none' }} />
          </div>
        </div>
        
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f0f5f2' }}>
          <button onClick={onClose} style={{ background: '#f0f5f2', color: '#335c46', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <X size={16} /> Cancel
          </button>
          <button onClick={() => { onSave(type, row.id, formData); onClose(); }} style={{ background: '#0fa958', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DataTable({ rows, isBooks, isRcm, opts = {}, dataType }) {
  const [auditRow, setAuditRow] = useState(null);
  const { updateRow, deleteRow } = useAppContext();
  
  if (!rows || rows.length === 0) {
    return (
      <div className="table-wrap">
        <table>
          <tbody>
            <tr className="empty-row">
              <td>No rows found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const getPriorityBadge = (r) => {
    const issues = rowDataIssues(r);
    const attention = !!opts.forceAttention || issues.length > 0;
    const title = opts.forceAttention 
      ? (opts.attentionReason || 'Needs attention') 
      : (issues.join('; ') || 'Looks complete');
    
    return (
      <Badge color={attention ? 'orange' : 'green'} dot title={title}>
        {attention ? 'Review' : 'OK'}
      </Badge>
    );
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Invoice No.</th>
            <th>Date</th>
            <th>{isBooks ? 'Supplier' : 'Supplier'} GSTIN</th>
            <th>Supplier Name</th>
            <th className="num">Taxable</th>
            <th className="num">IGST</th>
            <th className="num">CGST</th>
            <th className="num">SGST</th>
            <th className="num">Cess</th>
            <th className="num">Total</th>
            {dataType && <th style={{ width: '60px', textAlign: 'center' }}>ACTION</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i}>
              <td>{getPriorityBadge(r)}</td>
              <td>{esc(r.invoiceNo)}</td>
              <td>{esc(r.invoiceDate)}</td>
              <td className="mono">{esc(r.gstin)}</td>
              <td>{esc(r.supplierName)}</td>
              <td className="num">{fmtNum(r.taxable)}</td>
              <td className="num">{fmtNum(r.igst)}</td>
              <td className="num">{fmtNum(r.cgst)}</td>
              <td className="num">{fmtNum(r.sgst)}</td>
              <td className="num">{fmtNum(r.cess)}</td>
              <td className="num">{fmtNum(Number(r.taxable || 0) + taxTotal(r))}</td>
              {dataType && (
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--blue)' }} onClick={() => setAuditRow(r)} title="Edit Row">
                      <Edit2 size={15} />
                    </button>
                    <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--red)' }} onClick={() => { if (window.confirm('Are you sure you want to delete this row?')) deleteRow(dataType, r.id); }} title="Delete Row">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {auditRow && dataType && (
        <AuditModal 
          row={auditRow} 
          type={dataType} 
          onClose={() => setAuditRow(null)} 
          onSave={updateRow} 
          onDelete={deleteRow} 
        />
      )}
    </div>
  );
}
