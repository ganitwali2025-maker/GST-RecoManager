import React from 'react';
import { ShoppingCart, FileText, FileDown, CheckCircle, AlertCircle, FileX, FileMinus, Copy, Activity } from 'lucide-react';

export default function KpiCard({ label, val, sub, color, icon: CustomIcon, small }) {
  let Icon = CustomIcon;
  if (!Icon) {
    const l = (label || '').toLowerCase();
    if (l.includes('purchase')) Icon = ShoppingCart;
    else if (l.includes('matched')) Icon = CheckCircle;
    else if (l.includes('mismatch')) Icon = AlertCircle;
    else if (l.includes('missing in 2b')) Icon = FileMinus;
    else if (l.includes('missing in books')) Icon = FileX;
    else if (l.includes('duplicate')) Icon = Copy;
    else if (l.includes('gstr-2b')) Icon = FileDown;
    else if (l.includes('books')) Icon = FileText;
    else Icon = Activity;
  }

  const softColor = color ? color.replace(')', '-soft)') : 'var(--panel-2)';
  const iconColor = color || 'var(--muted)';
  const badgeSize = small ? '28px' : '40px';
  const iconSize = small ? 14 : 22;

  return (
    <div className={`kpi ${small ? 'small' : ''}`}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: badgeSize, height: badgeSize, borderRadius: small ? '7px' : '10px',
        backgroundColor: softColor,
        color: iconColor,
        marginBottom: small ? '8px' : '12px'
      }}>
        <Icon size={iconSize} />
      </div>
      <div className="lbl">{label}</div>
      <div className="val">{val}</div>
      <div className="delta" style={{ color: 'var(--muted)' }}>{sub}</div>
    </div>
  );
}
