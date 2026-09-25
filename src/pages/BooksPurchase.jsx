import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Trash2, FileText, FileDown, Layers, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { fmtINR, fmtNum } from '../utils/format';
import { taxTotal } from '../utils/invoice';
import { useToast } from '../components/Toast';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import { runReconciliation, reconSummary } from '../utils/reconciliation';

export default function BooksPurchase() {
  const navigate = useNavigate();
  const { currentBooks, currentGstr2b, fyGstr2b, activeCompany, month, financialYear, clearCurrentPeriod, settings, resolutions } = useAppContext();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('Books Reco with 2B');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const reconRows = runReconciliation(currentBooks, currentGstr2b, settings.tolerance, settings.normalizeInvoice, resolutions, fyGstr2b);
  const sum = reconSummary(reconRows);
  
  const statusMap = {};
  reconRows.forEach(r => {
    if (r.bRowId) {
      statusMap[r.bRowId] = r;
    }
  });

  const booksWithStatus = currentBooks.map(b => ({
    ...b,
    recoStatus: statusMap[b.id]?.status,
    reconData: statusMap[b.id]
  })).filter(b => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Other Mismatches') {
      return ['Date Mismatch', 'Taxable Value Mismatch', 'IGST Mismatch', 'CGST Mismatch', 'SGST Mismatch', 'Cess Mismatch', 'Multiple Match / Possible Match'].includes(b.recoStatus);
    }
    if (activeFilter === 'Pending Review') {
      return b.recoStatus && b.recoStatus !== 'Matched';
    }
    return b.recoStatus === activeFilter;
  });

  const handleClear = () => {
    if (!window.confirm('Remove all Books rows for this company & period?')) return;
    clearCurrentPeriod('books');
    showToast('Period data cleared');
  };

  const applySearch = (rows) => {
    if (!searchTerm || !searchTerm.trim()) return rows;
    const lower = searchTerm.trim().toLowerCase();
    return rows.filter(r => 
      (r.invoiceNo && String(r.invoiceNo).toLowerCase().includes(lower)) ||
      (r.gstin && String(r.gstin).toLowerCase().includes(lower)) ||
      (r.supplierName && String(r.supplierName).toLowerCase().includes(lower))
    );
  };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '16px' }}>
        <KpiCard small label="Books Invoices" val={fmtNum(currentBooks.length)} sub="Total imported" color="var(--blue)" onClick={() => setActiveFilter('All')} active={activeFilter === 'All'} />
        <KpiCard small label="2B Invoices" val={fmtNum(currentGstr2b.length)} sub="Total imported" color="var(--purple)" onClick={() => setActiveFilter('All')} />
        <KpiCard small label="Matched / Final" val={fmtNum(sum.counts['Matched'] || 0)} sub="Ready to file" color="var(--green)" onClick={() => setActiveFilter('Matched')} active={activeFilter === 'Matched'} />
        <KpiCard small label="Pending Review" val={fmtNum(reconRows.length - (sum.counts['Matched'] || 0))} sub="Mismatches to resolve" color="var(--yellow)" onClick={() => setActiveFilter('Pending Review')} active={activeFilter === 'Pending Review'} />
        <KpiCard small label="Not in 2B" val={fmtNum(sum.counts['Not in 2B'] || 0)} sub="Missing from portal" color="var(--red)" onClick={() => setActiveFilter('Not in 2B')} active={activeFilter === 'Not in 2B'} />
      </div>
      
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
        <KpiCard small label="Amount Mismatch" val={fmtNum(sum.counts['Amount Mismatch'] || 0)} sub="Differs by value" color="var(--yellow)" onClick={() => setActiveFilter('Amount Mismatch')} active={activeFilter === 'Amount Mismatch'} />
        <KpiCard small label="GST Mismatch" val={fmtNum(sum.counts['GST Mismatch'] || 0)} sub="Tax diff > tol" color="var(--yellow)" onClick={() => setActiveFilter('GST Mismatch')} active={activeFilter === 'GST Mismatch'} />
        <KpiCard small label="Not in Books" val={fmtNum(sum.counts['Not in Books'] || 0)} sub="Missing from books" color="var(--blue)" onClick={() => setActiveFilter('Not in Books')} active={activeFilter === 'Not in Books'} />
        <KpiCard small label="Duplicate" val={fmtNum(sum.counts['Duplicate Invoice'] || 0)} sub="Found multiples" color="var(--purple)" onClick={() => setActiveFilter('Duplicate Invoice')} active={activeFilter === 'Duplicate Invoice'} />
        <KpiCard small label="Other Mismatches" val={fmtNum((sum.counts['Date Mismatch']||0) + (sum.counts['Taxable Value Mismatch']||0) + (sum.counts['IGST Mismatch']||0) + (sum.counts['CGST Mismatch']||0) + (sum.counts['SGST Mismatch']||0) + (sum.counts['Cess Mismatch']||0) + (sum.counts['Multiple Match / Possible Match']||0))} sub="Tax/Date/Partial" color="var(--yellow)" onClick={() => setActiveFilter('Other Mismatches')} active={activeFilter === 'Other Mismatches'} />
      </div>

      <div className="panel">
        <div className="panel-head" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>{activeTab}</h3>
              <div className="hint">{activeCompany?.name || ''} · {month} FY{financialYear}</div>
            </div>
            <div className="flex gap8">
              <button className="btn ghost" onClick={() => navigate('/import?target=books')}>
                <Upload size={14} /> Import
              </button>
              {currentBooks.length > 0 && (
                <button className="btn danger" onClick={handleClear}>
                  <Trash2 size={14} /> Clear this period
                </button>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={`btn ${activeTab === 'Books Reco with 2B' ? 'primary' : 'ghost'}`} onClick={() => setActiveTab('Books Reco with 2B')}>
                <Layers size={16} style={{ marginRight: '6px' }} /> Books Reco with 2B
              </button>
              <button className={`btn ${activeTab === 'Books ITC' ? 'primary' : 'ghost'}`} onClick={() => setActiveTab('Books ITC')}>
                <FileText size={16} style={{ marginRight: '6px' }} /> Books ITC
              </button>
              <button className={`btn ${activeTab === 'Government 2B' ? 'primary' : 'ghost'}`} onClick={() => setActiveTab('Government 2B')}>
                <FileDown size={16} style={{ marginRight: '6px' }} /> Government 2B
              </button>
              <button className={`btn ${activeTab === '2B All Months' ? 'primary' : 'ghost'}`} onClick={() => setActiveTab('2B All Months')}>
                <Layers size={16} style={{ marginRight: '6px' }} /> 2B All Months
              </button>
            </div>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input 
                type="text" 
                placeholder="Search Invoice, GSTIN, or Supplier..." 
                className="ctrl" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{ width: '100%', paddingLeft: '34px', borderRadius: '20px' }}
              />
            </div>
          </div>
        </div>
        
        {activeTab === 'Books Reco with 2B' && <DataTable rows={applySearch(booksWithStatus)} isBooks={true} dataType="books" />}
        {activeTab === 'Books ITC' && <DataTable rows={applySearch(currentBooks)} isBooks={true} dataType="books" />}
        {activeTab === 'Government 2B' && <DataTable rows={applySearch(currentGstr2b)} isBooks={false} dataType="g2b" />}
        {activeTab === '2B All Months' && <DataTable rows={applySearch(fyGstr2b)} isBooks={false} dataType="g2b" />}
      </div>
    </>
  );
}
