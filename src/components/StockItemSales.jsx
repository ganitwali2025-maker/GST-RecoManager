import React from 'react';
import { Package, Layers, Box, Hexagon, Grid, Calendar, Coins, TrendingUp, Percent, FileText, ArrowUp, ArrowDown } from 'lucide-react';

const stockItems = [
  { id: '01', name: 'TMT Bar', sub: '(MS / Fe 500D)', icon: Package, color: '#10b981', soft: '#ecfdf5', prev: '12,45,000', curr: '15,20,000', diff: '2,75,000', isUp: true, pct: '22.09%' },
  { id: '02', name: 'MS Billet', sub: '(Grade / 100x100)', icon: Layers, color: '#3b82f6', soft: '#eff6ff', prev: '8,75,000', curr: '9,80,000', diff: '1,05,000', isUp: true, pct: '12.00%' },
  { id: '03', name: 'Cement', sub: '(OPC / PPC)', icon: Box, color: '#8b5cf6', soft: '#f5f3ff', prev: '6,20,000', curr: '5,80,000', diff: '40,000', isUp: false, pct: '6.45%' },
  { id: '04', name: 'Steel Scrap', sub: '(HMS / Shredded)', icon: Hexagon, color: '#f59e0b', soft: '#fffbeb', prev: '3,90,000', curr: '4,75,000', diff: '85,000', isUp: true, pct: '21.79%' },
  { id: '05', name: 'Other Materials', sub: '(Consumables etc.)', icon: Grid, color: '#0ea5e9', soft: '#f0f9ff', prev: '2,15,000', curr: '2,60,000', diff: '46,000', isUp: true, pct: '20.93%' }
];

export default function StockItemSales() {
  return (
    <>
      <div className="od-panel" style={{ gridColumn: 'span 4', padding: '0', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>Stock Item Sales Value</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Previous Month vs Current Month</div>
            </div>
          </div>
          <div style={{ display: 'flex', background: '#f3f4f6', padding: '4px', borderRadius: '30px' }}>
            <div style={{ padding: '6px 16px', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: '600', borderRadius: '20px', cursor: 'pointer' }}>RAW GOODS</div>
            <div style={{ padding: '6px 16px', color: '#4b5563', fontSize: '12px', fontWeight: '500', borderRadius: '20px', cursor: 'pointer' }}>FG GOODS</div>
          </div>
        </div>

        {/* Table */}
        <div style={{ padding: '0 24px 24px 24px', flex: 1, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>#</th>
                <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Stock Item</th>
                <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'right' }}>Previous Month<br/>Sale Value</th>
                <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'right' }}>Current Month<br/>Sale Value</th>
                <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'right' }}>Difference</th>
                <th style={{ padding: '16px 8px', fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'right' }}>Change %</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <td style={{ padding: '16px 8px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{item.id}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: item.soft, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <item.icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.sub}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500', color: '#374151', textAlign: 'right', fontFamily: 'inherit' }}>₹ {item.prev}</td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '500', color: '#374151', textAlign: 'right', fontFamily: 'inherit' }}>₹ {item.curr}</td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '600', color: item.isUp ? '#10b981' : '#ef4444', textAlign: 'right', fontFamily: 'inherit' }}>
                    ₹ {item.diff}
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', 
                      background: item.isUp ? '#ecfdf5' : '#fef2f2', color: item.isUp ? '#10b981' : '#ef4444', 
                      borderRadius: '20px', fontSize: '12.5px', fontWeight: '700' 
                    }}>
                      {item.isUp ? <ArrowUp size={14} strokeWidth={3} /> : <ArrowDown size={14} strokeWidth={3} />}
                      {item.pct}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Total Row */}
          <div style={{ 
            display: 'flex', alignItems: 'center', background: '#ecfdf5', borderRadius: '12px', 
            padding: '16px 20px', marginTop: '20px', border: '1px solid #d1fae5' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{ color: '#10b981' }}><Coins size={22} /></div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#065f46' }}>Total Sales Value</div>
            </div>
            <div style={{ flex: 1, textAlign: 'right', fontSize: '15px', fontWeight: '700', color: '#065f46', fontFamily: 'inherit', paddingRight: '8px' }}>₹ 33,45,000</div>
            <div style={{ flex: 1, textAlign: 'right', fontSize: '15px', fontWeight: '700', color: '#065f46', fontFamily: 'inherit', paddingRight: '8px' }}>₹ 38,35,000</div>
            <div style={{ flex: 1, textAlign: 'right', fontSize: '15px', fontWeight: '700', color: '#10b981', fontFamily: 'inherit', paddingRight: '8px' }}>₹ 4,90,000</div>
            <div style={{ textAlign: 'right', paddingRight: '8px' }}>
              <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', 
                background: '#10b981', color: '#fff', borderRadius: '20px', fontSize: '12.5px', fontWeight: '700' 
              }}>
                <ArrowUp size={14} strokeWidth={3} />
                14.63%
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
