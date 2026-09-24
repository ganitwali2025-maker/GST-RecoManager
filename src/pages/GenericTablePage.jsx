import React from 'react';
import { Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DataTable from '../components/DataTable';
import KpiCard from '../components/KpiCard';
import { fmtINR } from '../utils/format';
import { taxTotal } from '../utils/invoice';

export default function GenericTablePage({ title, hint, type = 'books' }) {
  const { activeCompany, month, financialYear, currentBooks, currentGstr2b } = useAppContext();
  
  let rows = [];
  if (type === 'books') rows = currentBooks;
  else if (type === 'g2b') rows = currentGstr2b;

  const totalTaxable = rows.reduce((a, r) => a + Number(r.taxable || 0), 0);
  const totalIgst = rows.reduce((a, r) => a + Number(r.igst || 0), 0);
  const totalCgst = rows.reduce((a, r) => a + Number(r.cgst || 0), 0);
  const totalSgst = rows.reduce((a, r) => a + Number(r.sgst || 0), 0);
  const totalGst = rows.reduce((a, r) => a + taxTotal(r), 0);

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
        <KpiCard small label="Total Taxable" val={fmtINR(totalTaxable)} sub="Sum for this period" color="var(--accent)" />
        <KpiCard small label="Total IGST" val={fmtINR(totalIgst)} sub="Integrated GST" color="var(--blue)" />
        <KpiCard small label="Total CGST" val={fmtINR(totalCgst)} sub="Central GST" color="var(--green)" />
        <KpiCard small label="Total SGST" val={fmtINR(totalSgst)} sub="State GST" color="var(--yellow)" />
        <KpiCard small label="Total GST" val={fmtINR(totalGst)} sub="All taxes combined" color="var(--purple)" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>{title}</h3>
            <div className="hint">{hint || `${activeCompany?.name || 'Company'} · ${month} FY${financialYear}`}</div>
          </div>
          <div className="flex gap8">
            <button className="btn ghost">
              <Upload size={14} /> Import Data
            </button>
          </div>
        </div>
        <DataTable rows={rows} isBooks={type === 'books'} />
      </div>
    </>
  );
}
