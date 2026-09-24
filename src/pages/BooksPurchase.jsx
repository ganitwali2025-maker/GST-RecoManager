import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { fmtINR, fmtNum } from '../utils/format';
import { taxTotal } from '../utils/invoice';
import { useToast } from '../components/Toast';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';

export default function BooksPurchase() {
  const navigate = useNavigate();
  const { currentBooks, activeCompany, month, financialYear, clearCurrentPeriod } = useAppContext();
  const { showToast } = useToast();

  const totalTaxable = currentBooks.reduce((a, r) => a + Number(r.taxable || 0), 0);
  const totalIgst = currentBooks.reduce((a, r) => a + Number(r.igst || 0), 0);
  const totalCgst = currentBooks.reduce((a, r) => a + Number(r.cgst || 0), 0);
  const totalSgst = currentBooks.reduce((a, r) => a + Number(r.sgst || 0), 0);
  const totalGst = currentBooks.reduce((a, r) => a + taxTotal(r), 0);

  const handleClear = () => {
    if (!window.confirm('Remove all Books rows for this company & period?')) return;
    clearCurrentPeriod('books');
    showToast('Period data cleared');
  };

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
            <h3>Books purchase register</h3>
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
        <DataTable rows={currentBooks} isBooks={true} dataType="books" />
      </div>
    </>
  );
}
