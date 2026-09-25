import React, { useState } from 'react';
import { Badge } from './Badge';
import { fmtNum, esc } from '../utils/format';
import { taxTotal, rowDataIssues } from '../utils/invoice';
import { Edit2, Trash2, X, ClipboardList, Save, FileText, Calendar, User, Building, IndianRupee, Percent, Check, Undo, Eye, BookOpen, Landmark, CalendarDays, IdCard, Calculator, Link } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const STATUS_META = {
  'Matched': { cls: 'green', dot: 'green' },
  'Amount Mismatch': { cls: 'yellow', dot: 'yellow' },
  'GST Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Date Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Taxable Value Mismatch': { cls: 'yellow', dot: 'yellow' },
  'IGST Mismatch': { cls: 'yellow', dot: 'yellow' },
  'CGST Mismatch': { cls: 'yellow', dot: 'yellow' },
  'SGST Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Cess Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Not in 2B': { cls: 'red', dot: 'red' },
  'Not in Books': { cls: 'blue', dot: 'blue' },
  'Duplicate Invoice': { cls: 'purple', dot: 'purple' },
  'Multiple Match / Possible Match': { cls: 'yellow', dot: 'yellow' },
};

const ResolveModal = ({ row, onResolve, onClose }) => {
  const [remark, setRemark] = useState('');
  const [action, setAction] = useState('Accept Match / Move to Final');

  const ACTIONS = [
    'Accept Match / Move to Final',
    'Mark as Mismatch',
    'Keep Pending',
    'Ignore / Duplicate',
  ];

  const handleSave = () => {
    onResolve(row.id, { action, remark });
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ background: 'var(--bg)', width: '400px', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Resolve Mismatch</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Resolution Action</label>
          <select className="ctrl" value={action} onChange={e => setAction(e.target.value)} style={{ width: '100%' }}>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Remark (Optional)</label>
          <input className="ctrl" style={{ width: '100%' }} value={remark} onChange={e => setRemark(e.target.value)} placeholder="e.g., Verified with supplier..." />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave}>Save Resolution</button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, isMismatch, isTotal, color }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: isTotal ? 'none' : '1px solid var(--border-soft)', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isTotal ? color : 'var(--muted)' }}>
        {Icon && <Icon size={16} color={isTotal ? color : 'var(--muted)'} />}
        <span style={{ fontSize: '13px', fontWeight: isTotal ? '600' : '400' }}>{label}</span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: isTotal ? '700' : '600', color: isMismatch ? 'var(--red)' : (isTotal ? color : 'var(--text)'), fontFamily: label === 'GSTIN' ? 'monospace' : 'inherit' }}>
        {value}
      </div>
    </div>
  );
};

const checkMismatch = (b, g) => {
  if (b === undefined || b === null || g === undefined || g === null) return false;
  if (typeof b === 'number' && typeof g === 'number') {
    return Math.abs(b - g) > 1;
  }
  return String(b).trim().toLowerCase() !== String(g).trim().toLowerCase();
};

const MatchDetailsModal = ({ row, onClose }) => {
  const reconData = row.reconData;
  if (!reconData) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#f8fafc', width: '1200px', maxWidth: '95vw', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
        
        <div style={{ background: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#e8f7f0', color: 'var(--green)', padding: '10px', borderRadius: '50%' }}>
              <Link size={24} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: 'var(--text)' }}>Match Comparison: {reconData.invoiceNo || 'N/A'}</h2>
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Comparing Book Entry with Government 2B and All Months 2B</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={24} /></button>
        </div>
        
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px' }}>
            
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #a3e6cd', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: '#e8f7f0', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #a3e6cd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--green)' }}>
                  <div style={{ background: 'var(--green)', color: '#fff', padding: '8px', borderRadius: '50%' }}><BookOpen size={20} /></div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Books Entry</h3>
                </div>
                {reconData.bRowId && <Badge color="green" dot>Matched</Badge>}
              </div>
              {reconData.bRowId ? (
                <div>
                  <DetailRow icon={User} label="Supplier" value={reconData.supplierName || '—'} />
                  <DetailRow icon={IdCard} label="GSTIN" value={reconData.gstin || '—'} />
                  <DetailRow icon={Calendar} label="Date" value={reconData.invoiceDate || '—'} />
                  <DetailRow icon={IndianRupee} label="Taxable Value" value={fmtNum(reconData.booksTaxable)} />
                  <DetailRow icon={Percent} label="IGST" value={fmtNum(reconData.booksIgst)} />
                  <DetailRow icon={Percent} label="CGST" value={fmtNum(reconData.booksCgst)} />
                  <DetailRow icon={Percent} label="SGST" value={fmtNum(reconData.booksSgst)} />
                  <div style={{ background: '#f0f9f5' }}>
                    <DetailRow icon={Calculator} label="Total Tax" value={fmtNum(reconData.booksTax)} isTotal color="var(--green)" />
                  </div>
                </div>
              ) : <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Not found in Books</div>}
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #d8b4e2', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: '#f3e8f7', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #d8b4e2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--purple)' }}>
                  <div style={{ background: 'var(--purple)', color: '#fff', padding: '8px', borderRadius: '50%' }}><Landmark size={20} /></div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Govt 2B (Current Month)</h3>
                </div>
                {reconData.g2bId && <Badge color={reconData.status === 'Matched' ? 'green' : 'orange'} dot>{reconData.status === 'Matched' ? 'Matched' : 'Mismatch'}</Badge>}
              </div>
              {reconData.g2bId ? (
                <div>
                  <DetailRow icon={User} label="Supplier" value={reconData.supplierName || '—'} />
                  <DetailRow icon={IdCard} label="GSTIN" value={reconData.gstin || '—'} />
                  <DetailRow icon={Calendar} label="Date" value={reconData.invoiceDate || '—'} />
                  <DetailRow icon={IndianRupee} label="Taxable Value" value={fmtNum(reconData.g2bTaxable)} isMismatch={checkMismatch(reconData.booksTaxable, reconData.g2bTaxable)} />
                  <DetailRow icon={Percent} label="IGST" value={fmtNum(reconData.g2bIgst)} isMismatch={checkMismatch(reconData.booksIgst, reconData.g2bIgst)} />
                  <DetailRow icon={Percent} label="CGST" value={fmtNum(reconData.g2bCgst)} isMismatch={checkMismatch(reconData.booksCgst, reconData.g2bCgst)} />
                  <DetailRow icon={Percent} label="SGST" value={fmtNum(reconData.g2bSgst)} isMismatch={checkMismatch(reconData.booksSgst, reconData.g2bSgst)} />
                  <div style={{ background: '#f7f2f9' }}>
                    <DetailRow icon={Calculator} label="Total Tax" value={fmtNum(reconData.g2bTax)} isMismatch={checkMismatch(reconData.booksTax, reconData.g2bTax)} isTotal color="var(--purple)" />
                  </div>
                </div>
              ) : <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Not found in 2B Current Month</div>}
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #a3c2e6', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: '#e8f0f7', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #a3c2e6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--blue)' }}>
                  <div style={{ background: 'var(--blue)', color: '#fff', padding: '8px', borderRadius: '50%' }}><CalendarDays size={20} /></div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Govt 2B (All Months)</h3>
                </div>
                {reconData.g2bAllId && <Badge color="green" dot>Matched</Badge>}
              </div>
              {reconData.g2bAllId ? (
                <div>
                  <DetailRow icon={User} label="Supplier" value={reconData.g2bAllSupplierName || '—'} isMismatch={checkMismatch(reconData.supplierName, reconData.g2bAllSupplierName)} />
                  <DetailRow icon={IdCard} label="GSTIN" value={reconData.g2bAllGstin || '—'} isMismatch={checkMismatch(reconData.gstin, reconData.g2bAllGstin)} />
                  <DetailRow icon={Calendar} label="Date" value={reconData.g2bAllInvoiceDate || '—'} isMismatch={checkMismatch(reconData.invoiceDate, reconData.g2bAllInvoiceDate)} />
                  <DetailRow icon={IndianRupee} label="Taxable Value" value={fmtNum(reconData.g2bAllTaxable)} isMismatch={checkMismatch(reconData.booksTaxable, reconData.g2bAllTaxable)} />
                  <DetailRow icon={Percent} label="IGST" value={fmtNum(reconData.g2bAllIgst)} isMismatch={checkMismatch(reconData.booksIgst, reconData.g2bAllIgst)} />
                  <DetailRow icon={Percent} label="CGST" value={fmtNum(reconData.g2bAllCgst)} isMismatch={checkMismatch(reconData.booksCgst, reconData.g2bAllCgst)} />
                  <DetailRow icon={Percent} label="SGST" value={fmtNum(reconData.g2bAllSgst)} isMismatch={checkMismatch(reconData.booksSgst, reconData.g2bAllSgst)} />
                  <div style={{ background: '#f0f4f9' }}>
                    <DetailRow icon={Calculator} label="Total Tax" value={fmtNum(reconData.g2bAllTax)} isMismatch={checkMismatch(reconData.booksTax, reconData.g2bAllTax)} isTotal color="var(--blue)" />
                  </div>
                </div>
              ) : <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Not found in 2B All Months</div>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [resolveRow, setResolveRow] = useState(null);
  const [viewMatchRow, setViewMatchRow] = useState(null);
  const { updateRow, deleteRow, resolveMismatch, undoResolve, resolutions } = useAppContext();
  
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
            <th>Status</th>
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
          {rows.map((r, i) => {
            const meta = STATUS_META[r.recoStatus] || { cls: 'grey', dot: 'grey' };
            return (
            <tr key={r.id || i}>
              <td>{getPriorityBadge(r)}</td>
              <td>
                {r.recoStatus ? (
                  <Badge color={meta.cls} dot>
                    {r.recoStatus}
                  </Badge>
                ) : (
                  '—'
                )}
              </td>
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
                    {r.reconData && (r.reconData.bRowId || r.reconData.g2bId) && (
                      <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--purple)' }} onClick={() => setViewMatchRow(r)} title="View Match Details">
                        <Eye size={15} />
                      </button>
                    )}
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
            );
          })}
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

      {resolveRow && (
        <ResolveModal
          row={resolveRow}
          onClose={() => setResolveRow(null)}
          onResolve={(id, res) => {
            resolveMismatch(id, res);
            setResolveRow(null);
          }}
        />
      )}

      {viewMatchRow && (
        <MatchDetailsModal
          row={viewMatchRow}
          onClose={() => setViewMatchRow(null)}
        />
      )}
    </div>
  );
}
