import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { runReconciliation, reconSummary } from '../utils/reconciliation';
import { fmtINR, fmtNum } from '../utils/format';
import { taxTotal } from '../utils/invoice';
import KpiCard from '../components/KpiCard';
import FindingCard from '../components/FindingCard';
import ReconTable from '../components/ReconTable';
import EmptyState from '../components/EmptyState';
import TaxSummaryCards from '../components/TaxSummaryCards';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentBooks, currentGstr2b, activeCompany, month, financialYear, settings } = useAppContext();

  const rows = runReconciliation(currentBooks, currentGstr2b, settings.tolerance, settings.normalizeInvoice);
  const sum = reconSummary(rows);

  const totalPurchase = currentBooks.reduce((a, r) => a + Number(r.taxable || 0), 0);
  const totalG2bTaxable = currentGstr2b.reduce((a, r) => a + Number(r.taxable || 0), 0);
  const itcBooks = currentBooks.reduce((a, r) => a + taxTotal(r), 0);
  const itcG2b = currentGstr2b.reduce((a, r) => a + taxTotal(r), 0);
  const mismatchITC = rows.filter(r => r.status === 'Amount Mismatch').reduce((a, r) => a + Math.abs(r.diffTax || 0), 0);

  const matchedRows = rows.filter(r => r.status === 'Matched');
  const matchedITC = matchedRows.reduce((a, r) => a + (r.booksTax || 0), 0);
  const matchedIgst = matchedRows.reduce((a, r) => a + (r.booksIgst || 0), 0);
  const matchedCgst = matchedRows.reduce((a, r) => a + (r.booksCgst || 0), 0);
  const matchedSgst = matchedRows.reduce((a, r) => a + (r.booksSgst || 0), 0);
  const matchedCess = matchedRows.reduce((a, r) => a + (r.booksCess || 0), 0);

  const unmatchedRows = rows.filter(r => r.status !== 'Matched');
  const unmatchedITC = unmatchedRows.reduce((a, r) => a + Math.abs(r.diffTax || 0), 0);
  const unmatchedIgst = unmatchedRows.reduce((a, r) => a + Math.abs(r.diffIgst || 0), 0);
  const unmatchedCgst = unmatchedRows.reduce((a, r) => a + Math.abs(r.diffCgst || 0), 0);
  const unmatchedSgst = unmatchedRows.reduce((a, r) => a + Math.abs(r.diffSgst || 0), 0);
  const unmatchedCess = unmatchedRows.reduce((a, r) => a + Math.abs(r.diffCess || 0), 0);

  const statsBooks = {
    total: fmtINR(currentBooks.reduce((a, r) => a + taxTotal(r), 0)),
    igst: fmtINR(currentBooks.reduce((a, r) => a + Number(r.igst || 0), 0)),
    cgst: fmtINR(currentBooks.reduce((a, r) => a + Number(r.cgst || 0), 0)),
    sgst: fmtINR(currentBooks.reduce((a, r) => a + Number(r.sgst || 0), 0)),
    cess: fmtINR(currentBooks.reduce((a, r) => a + Number(r.cess || 0), 0))
  };
  const statsG2b = {
    total: fmtINR(currentGstr2b.reduce((a, r) => a + taxTotal(r), 0)),
    igst: fmtINR(currentGstr2b.reduce((a, r) => a + Number(r.igst || 0), 0)),
    cgst: fmtINR(currentGstr2b.reduce((a, r) => a + Number(r.cgst || 0), 0)),
    sgst: fmtINR(currentGstr2b.reduce((a, r) => a + Number(r.sgst || 0), 0)),
    cess: fmtINR(currentGstr2b.reduce((a, r) => a + Number(r.cess || 0), 0))
  };
  const statsMatched = {
    total: fmtINR(matchedITC),
    igst: fmtINR(matchedIgst),
    cgst: fmtINR(matchedCgst),
    sgst: fmtINR(matchedSgst),
    cess: fmtINR(matchedCess)
  };
  const statsUnmatched = {
    total: fmtINR(unmatchedITC),
    igst: fmtINR(unmatchedIgst),
    cgst: fmtINR(unmatchedCgst),
    sgst: fmtINR(unmatchedSgst),
    cess: fmtINR(unmatchedCess)
  };

  if (currentBooks.length === 0 && currentGstr2b.length === 0) {
    return (
      <EmptyState 
        title="No data for this period yet" 
        sub={`No books or GSTR-2B data found for ${activeCompany?.name || 'this company'} · ${month} FY${financialYear}. Import data or load a sample to see the audit come alive.`} 
      />
    );
  }

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <KpiCard label="Total Books Taxable" val={fmtINR(totalPurchase)} sub={`${fmtNum(currentBooks.length)} books`} color="var(--accent)" />
        <KpiCard label="Total 2B Taxable" val={fmtINR(totalG2bTaxable)} sub={`${fmtNum(currentGstr2b.length)} 2B lines`} color="var(--accent)" />
        <KpiCard label="Matched Invoices" val={fmtNum(matchedRows.length)} sub="Reconciled" color="var(--green)" />
        <KpiCard label="Unmatched Invoices" val={fmtNum(unmatchedRows.length)} sub="Need review" color="var(--red)" />
        <KpiCard label="Matched ITC" val={fmtINR(matchedITC)} sub="Reconciled Total" color="var(--green)" />
      </div>

      <TaxSummaryCards 
        books={statsBooks}
        g2b={statsG2b}
        matched={statsMatched}
        unmatched={statsUnmatched}
      />


      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Recent exceptions</h3>
            <div className="hint">Non-matched lines needing review</div>
          </div>
        </div>
        <ReconTable rows={rows.filter(r => r.status !== 'Matched').slice(0, 8)} />
      </div>
    </>
  );
}
