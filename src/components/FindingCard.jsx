import React from 'react';
import { fmtNum } from '../utils/format';

export default function FindingCard({ label, count, value, color }) {
  return (
    <div className="finding-card">
      <div className="lbl">
        {label}
      </div>
      <div className="val">{fmtNum(count)}</div>
      <div className="sub">
        {value === 0 && <>&nbsp;</>}
        {value !== 0 && `₹ ${fmtNum(Math.round(value))} in tax value`}
      </div>
    </div>
  );
}
