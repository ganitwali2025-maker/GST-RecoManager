import React from 'react';
import { 
  TrendingUp, IndianRupee, MapPin, Landmark, FileText, 
  Activity, AlertCircle, CheckCircle, Info, PieChart, ShieldCheck, ArrowRightLeft, ArrowUpRight, Coins, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { fmtINR, fmtNum } from '../utils/format';
import EmptyState from '../components/EmptyState';
import StockItemSales from '../components/StockItemSales';

export default function Liability() {
  const { currentGstr1, fyGstr1, activeCompany, month, financialYear } = useAppContext();

  if (!currentGstr1 || currentGstr1.length === 0) {
    return (
      <EmptyState 
        title="No liability data for this period" 
        sub={`No GSTR-1 Sales data found for ${activeCompany?.name || 'this company'} · ${month} FY${financialYear}. Import data to view sales liability analytics.`} 
      />
    );
  }

  // Basic Calculations for current month
  const mTotalTaxable = currentGstr1.reduce((a, r) => a + (Number(r.taxable) || 0), 0);
  const mTotalIgst = currentGstr1.reduce((a, r) => a + (Number(r.igst) || 0), 0);
  const mTotalCgst = currentGstr1.reduce((a, r) => a + (Number(r.cgst) || 0), 0);
  const mTotalSgst = currentGstr1.reduce((a, r) => a + (Number(r.sgst) || 0), 0);
  const mOutput = mTotalIgst + mTotalCgst + mTotalSgst;

  // Chart Data (Mock trend scaled to Current Month)
  const chartData = [
    { name: 'Nov 25', output: (mOutput || 4275680) * 0.82 },
    { name: 'Dec 25', output: (mOutput || 4275680) * 0.89 },
    { name: 'Jan 26', output: (mOutput || 4275680) * 0.94 },
    { name: 'Feb 26', output: (mOutput || 4275680) * 0.84 },
    { name: 'Mar 26', output: (mOutput || 4275680) * 0.91 },
    { name: 'Apr 26', output: mOutput || 4275680 },
  ];

  const gstCompData = [
    { name: 'CGST', value: mTotalCgst, color: 'var(--green)' },
    { name: 'SGST', value: mTotalSgst, color: 'var(--blue)' },
    { name: 'IGST', value: mTotalIgst, color: 'var(--purple)' },
  ];

  // Mock B2B vs B2C Split
  const b2bTotal = mTotalTaxable * 0.75;
  const b2cTotal = mTotalTaxable * 0.25;
  const salesSplitData = [
    { name: 'B2B Sales', value: b2bTotal, color: 'var(--blue)' },
    { name: 'B2C Sales', value: b2cTotal, color: 'var(--yellow)' },
  ];

  // Top 5 Inter-State (Liability Focus)
  const interStateSales = fyGstr1.filter(r => (Number(r.igst) || 0) > 0);
  const interGrouped = interStateSales.reduce((acc, r) => {
    const key = r.pos || 'Unknown';
    if (!acc[key]) acc[key] = { pos: key, taxable: 0, igst: 0, count: 0 };
    acc[key].taxable += (Number(r.taxable) || 0);
    acc[key].igst += (Number(r.igst) || 0);
    acc[key].count += 1;
    return acc;
  }, {});
  const top5Inter = Object.values(interGrouped).sort((a, b) => b.igst - a.igst).slice(0, 5);
  const maxInterIgst = top5Inter.length > 0 ? top5Inter[0].igst : 1;

  // Top 5 Intra-State (Party Name, Sale Amt, Invoice Count, Item Name)
  const intraStateSales = fyGstr1.filter(r => (Number(r.igst) || 0) === 0 && ((Number(r.cgst) || 0) > 0 || (Number(r.sgst) || 0) > 0));
  const intraGrouped = intraStateSales.reduce((acc, r) => {
    const key = r.customerName || 'Retail Customer';
    if (!acc[key]) acc[key] = { party: key, taxable: 0, count: 0, item: r.description || 'Assorted Goods' };
    acc[key].taxable += (Number(r.taxable) || 0);
    acc[key].count += 1;
    return acc;
  }, {});
  const top5Intra = Object.values(intraGrouped).sort((a, b) => b.taxable - a.taxable).slice(0, 5);

  // Recent Sales Invoices (Mock data using the real context if available, or just mock)
  const recentSales = currentGstr1.slice(0, 8).map(r => ({
    date: r.invoiceDate || '26 Apr 2026',
    invoice: r.invoiceNo || 'INV-001',
    party: r.customerName || 'Retail Customer',
    amt: Number(r.taxable) || 0,
    tax: (Number(r.igst)||0) + (Number(r.cgst)||0) + (Number(r.sgst)||0),
    status: r.customerName ? 'B2B' : 'B2C',
    sc: r.customerName ? 'blue' : 'yellow'
  }));

  const renderCustomDonut = (data, totalLabel, totalValue, totalSubLabel) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', padding: '10px 0' }}>
      <div className="od-donut-wrap" style={{ width: '140px', height: '140px', flex: 'none' }}>
        <RechartsPieChart width={140} height={140}>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={65}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            cx="50%"
            cy="50%"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </RechartsPieChart>
        <div className="od-donut-inner">
          <div className="od-donut-val">{totalValue}</div>
          <div className="od-donut-lbl">{totalLabel}</div>
        </div>
      </div>
      <div className="od-legend" style={{ marginLeft: 0, width: '100%', maxWidth: '220px' }}>
        {data.map((item, i) => {
          const total = data.reduce((a, b) => a + b.value, 0);
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div className="od-legend-item" key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="od-legend-dot" style={{ background: item.color }}></div>
                <span>{item.name}</span>
              </div>
              <div style={{ color: 'var(--muted)', width: '70px', textAlign: 'right' }}>{fmtINR(item.value)}</div>
              <div style={{ fontWeight: '600', width: '35px', textAlign: 'right' }}>{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="od-grid">
        <div className="tax-col tc-orange">
          <div className="tc-top" style={{ height: '100%' }}>
            <div className="tc-head">
              <div className="tc-icon"><FileText size={18} /></div>
              <div className="tc-title-area">
                <div className="tc-title">Total Taxable Value</div>
                <div className="tc-sub">Net Taxable Amount</div>
              </div>
              <div className="tc-chevron"><ChevronRight size={16} /></div>
            </div>
            <div className="tc-amount-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="tc-amt-lbl">Total Taxable</div>
              <div className="tc-amt-val">{fmtINR(mTotalTaxable)}</div>
              <div className="tc-trend"><TrendingUp size={12} /> <span>8.3% vs last month</span></div>
            </div>
          </div>
        </div>

        <div className="tax-col tc-purple">
          <div className="tc-top" style={{ height: '100%' }}>
            <div className="tc-head">
              <div className="tc-icon"><IndianRupee size={18} /></div>
              <div className="tc-title-area">
                <div className="tc-title">Total Output GST</div>
                <div className="tc-sub">Sales Records</div>
              </div>
              <div className="tc-chevron"><ChevronRight size={16} /></div>
            </div>
            <div className="tc-amount-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="tc-amt-lbl">Total Output</div>
              <div className="tc-amt-val">{fmtINR(mOutput)}</div>
              <div className="tc-trend"><TrendingUp size={12} /> <span>12.5% vs last month</span></div>
            </div>
          </div>
        </div>

        <div className="tax-col tc-green">
          <div className="tc-top" style={{ height: '100%' }}>
            <div className="tc-head">
              <div className="tc-icon"><MapPin size={18} /></div>
              <div className="tc-title-area">
                <div className="tc-title">Total IGST</div>
                <div className="tc-sub">Inter-State Sales</div>
              </div>
              <div className="tc-chevron"><ChevronRight size={16} /></div>
            </div>
            <div className="tc-amount-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="tc-amt-lbl">Total IGST</div>
              <div className="tc-amt-val">{fmtINR(mTotalIgst)}</div>
              <div className="tc-trend"><TrendingUp size={12} /> <span>6.2% vs last month</span></div>
            </div>
          </div>
        </div>

        <div className="tax-col tc-blue">
          <div className="tc-top" style={{ height: '100%' }}>
            <div className="tc-head">
              <div className="tc-icon"><Landmark size={18} /></div>
              <div className="tc-title-area">
                <div className="tc-title">Intra-State GST</div>
                <div className="tc-sub">Within State Sales</div>
              </div>
              <div className="tc-chevron"><ChevronRight size={16} /></div>
            </div>
            <div className="tc-amount-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="tc-amt-lbl">Total Intra-State</div>
              <div className="tc-amt-val" style={{ marginBottom: '4px' }}>{fmtINR(mTotalCgst + mTotalSgst)}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', marginBottom: '8px' }}>
                 <span style={{ color: 'var(--muted)' }}>CGST <strong style={{color: 'var(--fg)'}}>{fmtINR(mTotalCgst)}</strong></span>
                 <span style={{ color: 'var(--muted)' }}>SGST <strong style={{color: 'var(--fg)'}}>{fmtINR(mTotalSgst)}</strong></span>
              </div>
              <div className="tc-trend"><TrendingUp size={12} /> <span>15.7% vs last month</span></div>
            </div>
          </div>
        </div>

        {/* Row 2: Stock Item Sales (Full Width) */}
        <StockItemSales />

        {/* Row 3: Composition & Split */}
        <div className="od-panel" style={{ gridColumn: 'span 2' }}>
          <div className="od-panel-head">
            <div className="od-panel-title">GST Composition <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(This Month)</span></div>
          </div>
          <div className="od-panel-body" style={{ justifyContent: 'center' }}>
            {renderCustomDonut(gstCompData, "Total Output", fmtINR(mOutput))}
          </div>
        </div>

        <div className="od-panel" style={{ gridColumn: 'span 2' }}>
          <div className="od-panel-head">
            <div className="od-panel-title">Sales Split <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(This Month)</span></div>
          </div>
          <div className="od-panel-body" style={{ justifyContent: 'center' }}>
            {renderCustomDonut(salesSplitData, "Total Sales", fmtINR(mTotalTaxable))}
          </div>
        </div>

        {/* Row 3: Top 5 Highlights */}
        <div className="od-panel od-chart-span" style={{ gridColumn: 'span 2' }}>
          <div className="od-panel-head">
            <div className="od-panel-title">Top 5 Inter-State <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(Output GST)</span></div>
            <select className="ctrl" style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}>
              <option>FY {financialYear}</option>
            </select>
          </div>
          <div className="od-panel-body" style={{ padding: '16px' }}>
            {top5Inter.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {top5Inter.map((s, i) => {
                  const colors = ['var(--blue)', 'var(--purple)', 'var(--green)', 'var(--accent)', 'var(--yellow)'];
                  const c = colors[i % colors.length];
                  const pct = Math.min(100, (s.igst / maxInterIgst) * 100);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flex: 'none' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.pos}</span>
                          <span style={{ fontWeight: 700, fontFamily: 'inherit' }}>{fmtINR(s.igst)}</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--border-soft)', borderRadius: '2px', display: 'flex' }}>
                          <div style={{ width: `${pct}%`, background: c, borderRadius: '2px' }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13.5px' }}>
                No Inter-State Sales found.
              </div>
            )}
          </div>
        </div>

        <div className="od-panel" style={{ gridColumn: 'span 2' }}>
          <div className="od-panel-head">
            <div className="od-panel-title">Top 5 Intra-State <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(Sales)</span></div>
            <select className="ctrl" style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}>
              <option>FY {financialYear}</option>
            </select>
          </div>
          <div className="od-panel-body" style={{ padding: '16px' }}>
            {top5Intra.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {top5Intra.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--panel)', border: '1px solid var(--border-soft)', borderRadius: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--fg)' }}>{s.party}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: 'var(--blue-soft)', color: 'var(--blue)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{s.count} Inv</span>
                        &bull; {s.item}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flex: 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--fg)' }}>{fmtINR(s.taxable)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Sale Amt</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '13.5px' }}>
                No Intra-State Sales found.
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Full Width Table */}
        <div className="od-panel" style={{ gridColumn: 'span 4' }}>
          <div className="od-panel-head">
            <div className="od-panel-title">Recent Sales Invoices</div>
            <a href="#!" style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, textDecoration: 'none' }}>View All <span style={{ fontSize: '10px' }}>&gt;</span></a>
          </div>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0, flex: 1 }}>
            <table style={{ minWidth: '100%' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice No</th>
                  <th>Customer Name</th>
                  <th style={{ textAlign: 'right' }}>Taxable Amt</th>
                  <th style={{ textAlign: 'right' }}>GST Amt</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((t, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--muted)', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: 'var(--green-soft)', color: 'var(--green)', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={12} /></div>
                        {t.date}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.invoice}</td>
                    <td style={{ fontWeight: 500 }}>{t.party}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'inherit', fontWeight: 500 }}>{fmtINR(t.amt)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{fmtINR(t.tax)}</td>
                    <td>
                      <span className={`badge ${t.sc}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--panel)', borderRadius: '12px', border: '1px solid var(--border-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={16} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Last Updated</div>
            <div style={{ fontSize: '12.5px', fontWeight: '600' }}>26 Apr 2026, 04:32 PM</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--green)', fontWeight: '600', fontSize: '14px', fontStyle: 'italic' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LeafIcon />
          </div>
          Simplifying GST & TDS For a Stronger Tomorrow
        </div>
      </div>
    </>
  );
}

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
