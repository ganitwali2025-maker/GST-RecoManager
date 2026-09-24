import React, { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppContext } from '../context/AppContext';
import { runReconciliation, reconSummary } from '../utils/reconciliation';
import { fmtNum } from '../utils/format';
import ReconTable from '../components/ReconTable';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

export default function Reconciliation() {
  const { currentBooks, currentGstr2b, activeCompany, month, financialYear, settings } = useAppContext();
  const { showToast } = useToast();
  
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const rows = useMemo(() => 
    runReconciliation(currentBooks, currentGstr2b, settings.tolerance, settings.normalizeInvoice),
    [currentBooks, currentGstr2b, settings]
  );
  
  const sum = useMemo(() => reconSummary(rows), [rows]);

  const filteredRows = useMemo(() => {
    let base = filter === 'all' ? rows : rows.filter(r => r.status === filter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter(r => 
        (r.invoiceNo || '').toLowerCase().includes(q) || 
        (r.gstin || '').toLowerCase().includes(q) || 
        (r.supplierName || '').toLowerCase().includes(q)
      );
    }
    return base;
  }, [rows, filter, searchQuery]);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const reconSheet = rows.map(r => ({
      Status: r.status, 'Invoice No': r.invoiceNo, Date: r.invoiceDate, GSTIN: r.gstin, Supplier: r.supplierName,
      'Books Taxable': r.booksTaxable, '2B Taxable': r.g2bTaxable, 'Books Tax': r.booksTax, '2B Tax': r.g2bTax, 'Diff (Tax)': r.diffTax,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reconSheet), 'Reconciliation');
    XLSX.writeFile(wb, `ReconIQ_${(activeCompany?.name || 'Company').replace(/\s+/g, '_')}_${month}_FY${financialYear}_Recon.xlsx`);
    showToast('Export saved');
  };

  if (currentBooks.length === 0 && currentGstr2b.length === 0) {
    return (
      <EmptyState 
        title="Nothing to reconcile yet" 
        sub="Import books or GSTR-2B data for this period, then come back here — matching runs automatically." 
      />
    );
  }

  const Chip = ({ val, label, count }) => (
    <button 
      className={`chip ${filter === val ? 'active' : ''}`} 
      onClick={() => setFilter(val)}
    >
      {label} · {fmtNum(count)}
    </button>
  );

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Match result</h3>
          <div className="hint">{activeCompany?.name || ''} · {month} FY{financialYear} · {fmtNum(rows.length)} total lines</div>
        </div>
        <div className="flex gap8">
          <div className="searchbox">
            <Search size={14} />
            <input 
              className="ctrl" 
              placeholder="Search invoice / GSTIN / supplier"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn ghost" onClick={handleExport}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>
      
      <div className="filter-row">
        <Chip val="all" label="All" count={sum.total} />
        <Chip val="Matched" label="Matched" count={sum.counts['Matched'] || 0} />
        <Chip val="Amount Mismatch" label="Mismatch" count={sum.counts['Amount Mismatch'] || 0} />
        <Chip val="Missing in 2B" label="Missing in 2B" count={sum.counts['Missing in 2B'] || 0} />
        <Chip val="Missing in Books" label="Missing in Books" count={sum.counts['Missing in Books'] || 0} />
        <Chip val="Duplicate" label="Duplicate" count={sum.counts['Duplicate'] || 0} />
      </div>
      
      <ReconTable rows={filteredRows} />
    </div>
  );
}
