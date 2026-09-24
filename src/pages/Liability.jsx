import React, { useState } from 'react';
import { FileText, ArrowRightLeft, Sparkles, Landmark } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { runReconciliation, reconSummary } from '../utils/reconciliation';
import { fmtINR, fmtNum, parseNum } from '../utils/format';
import { taxTotal } from '../utils/invoice';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

export default function Liability() {
  const { 
    currentBooks, currentGstr2b, activeCompany, month, financialYear, settings, 
    currentOutputGst, saveOutputGst 
  } = useAppContext();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [ogFormData, setOgFormData] = useState({
    igst: currentOutputGst.igst || 0,
    cgst: currentOutputGst.cgst || 0,
    sgst: currentOutputGst.sgst || 0,
    cess: currentOutputGst.cess || 0,
  });

  const outputTotal = (currentOutputGst.igst || 0) + (currentOutputGst.cgst || 0) + (currentOutputGst.sgst || 0) + (currentOutputGst.cess || 0);

  if (currentBooks.length === 0 && currentGstr2b.length === 0 && !outputTotal) {
    return (
      <EmptyState 
        title="No liability data for this period yet" 
        sub={`Import books / GSTR-2B data, or enter Output GST for ${activeCompany?.name || 'this company'} · ${month} FY${financialYear}, to see the liability picture.`} 
      />
    );
  }

  const rows = runReconciliation(currentBooks, currentGstr2b, settings.tolerance, settings.normalizeInvoice);
  const sum = reconSummary(rows);
  const itcBooks = currentBooks.reduce((a, r) => a + taxTotal(r), 0);
  const itcG2b = currentGstr2b.reduce((a, r) => a + taxTotal(r), 0);
  const matchedITC = rows.filter(r => r.status === 'Matched').reduce((a, r) => a + (r.booksTax || 0), 0);
  const netPayable = outputTotal - itcBooks;
  const matchPct = sum.total ? Math.round((sum.counts['Matched'] || 0) / sum.total * 100) : 0;

  const donutGradient = (parts, total) => {
    if (!total) return 'var(--border-soft)';
    let acc = 0; const segs = [];
    parts.forEach(([color, val]) => {
      const pct = val / total * 100;
      segs.push(`${color} ${acc}% ${acc + pct}%`);
      acc += pct;
    });
    return `conic-gradient(${segs.join(',')})`;
  };

  const inputDonut = donutGradient([
    ['var(--green)', sum.counts['Matched'] || 0],
    ['var(--yellow)', sum.counts['Amount Mismatch'] || 0],
    ['var(--red)', sum.counts['Missing in 2B'] || 0],
    ['var(--blue)', sum.counts['Missing in Books'] || 0],
  ], sum.total);

  const outputDonut = donutGradient([
    ['var(--blue)', currentOutputGst.igst || 0],
    ['var(--purple)', currentOutputGst.cgst || 0],
    ['var(--yellow)', currentOutputGst.sgst || 0],
    ['var(--red)', currentOutputGst.cess || 0]
  ], outputTotal);

  const handleSaveOutputGst = () => {
    saveOutputGst({
      igst: parseNum(ogFormData.igst),
      cgst: parseNum(ogFormData.cgst),
      sgst: parseNum(ogFormData.sgst),
      cess: parseNum(ogFormData.cess),
    });
    setEditing(false);
    showToast('Output GST updated');
  };

  return (
    <>
      <div className="gst-summary-grid">
        <div className="gst-card">
          <div className="gst-card-left">
            <div className="gst-title">Input GST (ITC)</div>
            <div className="gst-sub">{month} FY{financialYear}</div>
            
            <div className="gst-stat">
              <div className="lbl"><span>ITC as per Books</span><b>{fmtINR(itcBooks)}</b></div>
              <div className="bar-track"><span style={{ width: '100%', background: 'var(--green)' }}></span></div>
            </div>
            <div className="gst-stat">
              <div className="lbl"><span>ITC as per GSTR-2B</span><b>{fmtINR(itcG2b)}</b></div>
              <div className="bar-track"><span style={{ width: `${itcBooks ? Math.min(100, itcG2b / itcBooks * 100) : 0}%`, background: 'var(--blue)' }}></span></div>
            </div>
            <div className="gst-stat">
              <div className="lbl"><span>Net ITC Matched</span><b style={{ color: 'var(--green)' }}>{fmtINR(matchedITC)}</b></div>
            </div>
          </div>
          <div className="gst-donut" style={{ background: inputDonut }}>
            <div className="gst-donut-inner">{matchPct}%<br/>matched</div>
          </div>
        </div>

        <div className="gst-card">
          <div className="gst-card-left">
            <div className="gst-title">Output GST</div>
            <div className="gst-sub">
              {month} FY{financialYear}
              {!editing && ` · `}
              {!editing && <a href="#!" onClick={(e) => { e.preventDefault(); setEditing(true); setOgFormData({
                igst: currentOutputGst.igst || 0,
                cgst: currentOutputGst.cgst || 0,
                sgst: currentOutputGst.sgst || 0,
                cess: currentOutputGst.cess || 0,
              }); }}>Edit</a>}
            </div>
            
            {editing && (
              <>
                <div className="output-gst-form">
                  <div>
                    <label>IGST</label>
                    <input className="ctrl" type="number" value={ogFormData.igst} onChange={(e) => setOgFormData({...ogFormData, igst: e.target.value})} />
                  </div>
                  <div>
                    <label>CGST</label>
                    <input className="ctrl" type="number" value={ogFormData.cgst} onChange={(e) => setOgFormData({...ogFormData, cgst: e.target.value})} />
                  </div>
                  <div>
                    <label>SGST</label>
                    <input className="ctrl" type="number" value={ogFormData.sgst} onChange={(e) => setOgFormData({...ogFormData, sgst: e.target.value})} />
                  </div>
                  <div>
                    <label>Cess</label>
                    <input className="ctrl" type="number" value={ogFormData.cess} onChange={(e) => setOgFormData({...ogFormData, cess: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap8" style={{ marginBottom: '14px' }}>
                  <button className="btn primary" onClick={handleSaveOutputGst}>Save</button>
                  <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </>
            )}

            <div className="gst-stat">
              <div className="lbl"><span>Total Output Tax</span><b>{fmtINR(outputTotal)}</b></div>
              <div className="bar-track"><span style={{ width: '100%', background: 'var(--accent)' }}></span></div>
            </div>
            <div className="gst-stat">
              <div className="lbl"><span>Input GST (ITC) as per Books</span><b>{fmtINR(itcBooks)}</b></div>
              <div className="bar-track"><span style={{ width: `${outputTotal ? Math.min(100, itcBooks / outputTotal * 100) : 0}%`, background: 'var(--green)' }}></span></div>
            </div>
            <div className="gst-stat">
              <div className="lbl">
                <span>Net GST Payable</span>
                <b style={{ color: netPayable >= 0 ? 'var(--red)' : 'var(--green)' }}>
                  {fmtINR(Math.abs(netPayable))} {netPayable >= 0 ? 'payable' : 'carried fwd'}
                </b>
              </div>
            </div>
          </div>
          <div className="gst-donut" style={{ background: outputDonut }}>
            <div className="gst-donut-inner">{outputTotal ? fmtINR(outputTotal) : '—'}</div>
          </div>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-tile">
          <div className="icon-badge" style={{ background: 'var(--purple-soft)', color: 'var(--purple)' }}><FileText size={17} /></div>
          <div className="lbl">Total Invoices</div>
          <div className="val">{fmtNum(currentBooks.length + currentGstr2b.length)}</div>
        </div>
        <div className="overview-tile">
          <div className="icon-badge" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}><ArrowRightLeft size={17} /></div>
          <div className="lbl">Exceptions Found</div>
          <div className="val">{fmtNum(sum.total - (sum.counts['Matched'] || 0))}</div>
        </div>
        <div className="overview-tile">
          <div className="icon-badge" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}><Sparkles size={17} /></div>
          <div className="lbl">ITC Match Rate</div>
          <div className="val">{matchPct}%</div>
        </div>
        <div className="overview-tile">
          <div className="icon-badge" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}><Landmark size={17} /></div>
          <div className="lbl">{netPayable >= 0 ? 'Net Payable' : 'ITC Carried Fwd'}</div>
          <div className="val" style={{ color: netPayable >= 0 ? 'var(--red)' : 'var(--green)' }}>{fmtINR(Math.abs(netPayable))}</div>
        </div>
      </div>
    </>
  );
}
