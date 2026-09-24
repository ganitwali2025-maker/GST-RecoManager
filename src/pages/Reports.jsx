import React, { useState } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppContext } from '../context/AppContext';
import { runReconciliation, reconSummary } from '../utils/reconciliation';
import { fmtINR, fmtNum } from '../utils/format';
import { taxTotal } from '../utils/invoice';
import EmptyState from '../components/EmptyState';
import ReconTable from '../components/ReconTable';
import FindingCard from '../components/FindingCard';
import { useToast } from '../components/Toast';

const REPORT_TABS = ['Match Summary', 'Supplier-wise', 'Month-wise', 'Mismatch Report', 'Missing Invoice Report', 'ITC Difference'];

const STATUS_META = {
  'Matched': { cls: 'green', dot: 'green' },
  'Amount Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Missing in 2B': { cls: 'red', dot: 'red' },
  'Missing in Books': { cls: 'blue', dot: 'blue' },
  'Duplicate': { cls: 'purple', dot: 'purple' },
};

export default function Reports() {
  const { currentBooks, currentGstr2b, currentRcm, activeCompany, month, financialYear, settings, books, gstr2b, FY_LIST, MONTHS } = useAppContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(REPORT_TABS[0]);

  const rows = runReconciliation(currentBooks, currentGstr2b, settings.tolerance, settings.normalizeInvoice);
  const sum = reconSummary(rows);

  const handleExportAll = () => {
    const wb = XLSX.utils.book_new();

    const reconSheet = rows.map(r => ({
      Status: r.status, 'Invoice No': r.invoiceNo, Date: r.invoiceDate, GSTIN: r.gstin, Supplier: r.supplierName,
      'Books Taxable': r.booksTaxable, '2B Taxable': r.g2bTaxable, 'Books Tax': r.booksTax, '2B Tax': r.g2bTax, 'Diff (Tax)': r.diffTax,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reconSheet), 'Reconciliation');

    const summarySheet = Object.keys(sum.counts).map(k => ({ Status: k, Invoices: sum.counts[k], 'Tax Value': sum.values[k] }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet), 'Match Summary');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(currentBooks.map(r => ({
      'Invoice No': r.invoiceNo, 'Invoice Date': r.invoiceDate, 'Supplier GSTIN': r.gstin, 'Supplier Name': r.supplierName,
      'Taxable Value': r.taxable, IGST: r.igst, CGST: r.cgst, SGST: r.sgst, Cess: r.cess,
    }))), 'Books');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(currentGstr2b.map(r => ({
      GSTIN: r.gstin, 'Supplier Name': r.supplierName, 'Invoice No': r.invoiceNo, 'Invoice Date': r.invoiceDate,
      'Taxable Value': r.taxable, IGST: r.igst, CGST: r.cgst, SGST: r.sgst, Cess: r.cess,
      'Supplier Type': r.supplierType || '', 'GSTR-1 Filed': r.gstr1Filed || '',
    }))), 'GSTR-2B');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(currentRcm.map(r => ({
      'Invoice No': r.invoiceNo, 'Invoice Date': r.invoiceDate, 'Supplier GSTIN': r.gstin, 'Supplier Name': r.supplierName,
      'Taxable Value': r.taxable, IGST: r.igst, CGST: r.cgst, SGST: r.sgst, Cess: r.cess,
    }))), 'RCM');

    XLSX.writeFile(wb, `ReconIQ_${(activeCompany?.name || 'Company').replace(/\s+/g, '_')}_${month}_FY${financialYear}_Reports.xlsx`);
    showToast('Export saved');
  };

  if (currentBooks.length === 0 && currentGstr2b.length === 0) {
    return (
      <EmptyState 
        title="No data to report on" 
        sub="Import or load sample data for this period to generate reports." 
      />
    );
  }

  const renderTabContent = () => {
    if (activeTab === 'Match Summary') {
      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Status</th><th className="num">Invoices</th><th className="num">Tax Value</th><th className="num">% of Total</th></tr>
            </thead>
            <tbody>
              {Object.keys(sum.counts).map(k => {
                const meta = STATUS_META[k];
                const pct = sum.total ? (sum.counts[k] / sum.total * 100).toFixed(1) : '0.0';
                return (
                  <tr key={k}>
                    <td>
                      <span className={`badge ${meta.cls}`}>
                        <span className={`dot ${meta.dot}`}></span>{k}
                      </span>
                    </td>
                    <td className="num">{fmtNum(sum.counts[k])}</td>
                    <td className="num">{fmtINR(sum.values[k])}</td>
                    <td className="num">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (activeTab === 'Supplier-wise') {
      const bySupplier = {};
      rows.forEach(r => {
        const key = r.gstin || 'Unknown';
        if (!bySupplier[key]) {
          bySupplier[key] = { name: r.supplierName, gstin: key, matched: 0, mismatch: 0, missing2b: 0, missingBooks: 0, dup: 0, taxDiff: 0 };
        }
        const b = bySupplier[key];
        if (r.status === 'Matched') b.matched++;
        if (r.status === 'Amount Mismatch') b.mismatch++;
        if (r.status === 'Missing in 2B') b.missing2b++;
        if (r.status === 'Missing in Books') b.missingBooks++;
        if (r.status === 'Duplicate') b.dup++;
        b.taxDiff += Math.abs(r.diffTax || 0);
      });
      const list = Object.values(bySupplier).sort((a, b) => b.taxDiff - a.taxDiff);
      
      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Supplier</th><th>GSTIN</th><th className="num">Matched</th><th className="num">Mismatch</th><th className="num">Missing 2B</th><th className="num">Missing Books</th><th className="num">Dup</th><th className="num">Tax Diff</th></tr>
            </thead>
            <tbody>
              {list.map((b, i) => (
                <tr key={i}>
                  <td>{b.name}</td>
                  <td className="mono">{b.gstin}</td>
                  <td className="num">{b.matched}</td>
                  <td className="num">{b.mismatch}</td>
                  <td className="num">{b.missing2b}</td>
                  <td className="num">{b.missingBooks}</td>
                  <td className="num">{b.dup}</td>
                  <td className="num">{fmtNum(b.taxDiff)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (activeTab === 'Month-wise') {
      const co = activeCompany?.id;
      const fy = financialYear;
      const byMonth = MONTHS.map(m => {
        const b = books.filter(r => r.companyId === co && r.fy === fy && r.month === m);
        const g = gstr2b.filter(r => r.companyId === co && r.fy === fy && r.month === m);
        return { 
          month: m, books: b.length, g2b: g.length, 
          itcBooks: b.reduce((a, r) => a + taxTotal(r), 0), 
          itc2b: g.reduce((a, r) => a + taxTotal(r), 0) 
        };
      });
      
      return (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Month</th><th className="num">Books Invoices</th><th className="num">2B Invoices</th><th className="num">ITC Books</th><th className="num">ITC 2B</th><th className="num">Gap</th></tr>
            </thead>
            <tbody>
              {byMonth.map(m => (
                <tr key={m.month} style={m.month === month ? { background: 'rgba(255,122,61,.06)' } : {}}>
                  <td>{m.month}</td>
                  <td className="num">{m.books}</td>
                  <td className="num">{m.g2b}</td>
                  <td className="num">{fmtNum(m.itcBooks)}</td>
                  <td className="num">{fmtNum(m.itc2b)}</td>
                  <td className="num">{fmtNum(m.itcBooks - m.itc2b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (activeTab === 'Mismatch Report') {
      const mism = rows.filter(r => r.status === 'Amount Mismatch');
      return <ReconTable rows={mism} />;
    }
    
    if (activeTab === 'Missing Invoice Report') {
      const missing = rows.filter(r => r.status === 'Missing in 2B' || r.status === 'Missing in Books');
      return <ReconTable rows={missing} />;
    }
    
    if (activeTab === 'ITC Difference') {
      const itcBooks = currentBooks.reduce((a, r) => a + taxTotal(r), 0);
      const itc2b = currentGstr2b.reduce((a, r) => a + taxTotal(r), 0);
      const diff = itcBooks - itc2b;
      
      return (
        <>
          <div className="findings-grid">
            <FindingCard label="ITC as per Books" count={0} value={itcBooks} color="blue" />
            <FindingCard label="ITC as per GSTR-2B" count={0} value={itc2b} color="purple" />
            <FindingCard label="Net Difference" count={0} value={diff} color={diff >= 0 ? 'yellow' : 'red'} />
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginTop: '14px' }}>
            A positive difference means your books claim more ITC than GSTR-2B supports — those invoices need supplier follow-up before filing. A negative difference means GSTR-2B has ITC not yet booked.
          </p>
        </>
      );
    }
    
    return null;
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Reports</h3>
          <div className="hint">{activeCompany?.name || ''} · {month} FY{financialYear}</div>
        </div>
        <button className="btn primary" onClick={handleExportAll}>
          <Download size={14} /> Export all to Excel
        </button>
      </div>
      <div className="tabs">
        {REPORT_TABS.map(t => (
          <div 
            key={t} 
            className={`tab ${activeTab === t ? 'active' : ''}`} 
            onClick={() => setActiveTab(t)}
          >
            {t}
          </div>
        ))}
      </div>
      <div id="reportBody">
        {renderTabContent()}
      </div>
    </div>
  );
}
