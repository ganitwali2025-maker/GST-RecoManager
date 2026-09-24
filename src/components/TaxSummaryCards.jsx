import React from 'react';
import { FileText, FileDown, Link, Link2Off, ChevronRight, TrendingUp } from 'lucide-react';

const Column = ({ title, shortName, sub, icon: Icon, colorClass, labelBase, stats }) => {
  const rowLabel = shortName || title.split(' ')[0];
  return (
    <div className={`tax-col ${colorClass}`}>
      <div className="tc-top">
        <div className="tc-head">
          <div className="tc-icon"><Icon size={18} /></div>
          <div className="tc-title-area">
            <div className="tc-title">{title}</div>
            <div className="tc-sub">{sub}</div>
          </div>
          <div className="tc-chevron"><ChevronRight size={16} /></div>
        </div>
        <div className="tc-amount-box">
          <div className="tc-amt-lbl">Total {labelBase}</div>
          <div className="tc-amt-val">{stats.total}</div>
          <div className="tc-trend"><TrendingUp size={12} /> <span>{stats.trend || '5%'} vs last month</span></div>
        </div>
      </div>
      <div className="tc-bot">
        <div className="tc-bot-icon"><Icon size={16} /></div>
        <div className="tc-bot-content">
          <div className="tc-row">
            <div className="tc-row-lbl">IGST ({rowLabel})</div>
            <div className="tc-row-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {stats.igst} {stats.igst !== '0 ₹' && <TrendingUp size={14} style={{ color: 'var(--green)', opacity: 0.8 }} />}
            </div>
          </div>
          <div className="tc-divider"></div>
          <div className="tc-row">
            <div className="tc-row-lbl">CGST ({rowLabel})</div>
            <div className="tc-row-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {stats.cgst} {stats.cgst !== '0 ₹' && <TrendingUp size={14} style={{ color: 'var(--green)', opacity: 0.8 }} />}
            </div>
          </div>
          <div className="tc-divider"></div>
          <div className="tc-row">
            <div className="tc-row-lbl">SGST ({rowLabel})</div>
            <div className="tc-row-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {stats.sgst} {stats.sgst !== '0 ₹' && <TrendingUp size={14} style={{ color: 'var(--green)', opacity: 0.8 }} />}
            </div>
          </div>
          <div className="tc-divider"></div>
          <div className="tc-row">
            <div className="tc-row-lbl">CESS ({rowLabel})</div>
            <div className="tc-row-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {stats.cess} {stats.cess !== '0 ₹' && <TrendingUp size={14} style={{ color: 'var(--green)', opacity: 0.8 }} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TaxSummaryCards({ books, g2b, matched, unmatched }) {
  return (
    <div className="tax-summary-wrapper">
      <Column 
        title="Purchase Input GST - ITC" shortName="Book" sub="Create & manage GST entries" 
        icon={FileText} colorClass="tc-purple" labelBase="Booked GST" 
        stats={books} 
      />
      <Column 
        title="Government GSTR-2B ITC" shortName="2B" sub="GSTR-2B Data & Reconciliation" 
        icon={FileDown} colorClass="tc-orange" labelBase="2B Amount" 
        stats={g2b} 
      />
      <Column 
        title="Match GST" sub="Matched Records" 
        icon={Link} colorClass="tc-green" labelBase="Matched GST" 
        stats={matched} 
      />
      <Column 
        title="Unmatch GST" sub="Unmatched Records" 
        icon={Link2Off} colorClass="tc-red" labelBase="Unmatched GST" 
        stats={unmatched} 
      />
    </div>
  );
}
