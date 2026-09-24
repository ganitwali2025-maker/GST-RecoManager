import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { fmtINR, fmtNum } from '../utils/format';
import { taxTotal } from '../utils/invoice';
import { useToast } from '../components/Toast';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';

export default function RcmData() {
  const navigate = useNavigate();
  const { currentRcm, activeCompany, month, financialYear, clearCurrentPeriod } = useAppContext();
  const { showToast } = useToast();

  const total = currentRcm.reduce((a, r) => a + Number(r.taxable || 0), 0);
  const tax = currentRcm.reduce((a, r) => a + taxTotal(r), 0);

  const handleClear = () => {
    if (!window.confirm('Remove all RCM rows for this company & period?')) return;
    clearCurrentPeriod('rcm');
    showToast('Period data cleared');
  };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <KpiCard label="Invoices" val={fmtNum(currentRcm.length)} sub="Reverse charge invoices" color="var(--accent)" />
        <KpiCard label="Taxable Value" val={fmtINR(total)} sub="Sum for this period" color="var(--blue)" />
        <KpiCard label="Total Tax Payable/ITC" val={fmtINR(tax)} sub="IGST + CGST + SGST + Cess" color="var(--green)" />
      </div>
      
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>RCM invoice register</h3>
            <div className="hint">{activeCompany?.name || ''} · {month} FY{financialYear}</div>
          </div>
          <div className="flex gap8">
            <button className="btn ghost" onClick={() => navigate('/import?target=rcm')}>
              <Upload size={14} /> Import
            </button>
            {currentRcm.length > 0 && (
              <button className="btn danger" onClick={handleClear}>
                <Trash2 size={14} /> Clear this period
              </button>
            )}
          </div>
        </div>
        <DataTable rows={currentRcm} isBooks={false} isRcm={true} dataType="rcm" />
      </div>
    </>
  );
}
