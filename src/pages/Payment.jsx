import React from 'react';
import EmptyState from '../components/EmptyState';
import { Banknote } from 'lucide-react';

export default function Payment() {
  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Payment Dashboard</h3>
            <div className="hint">Final Working ITC and Liability Calculation</div>
          </div>
        </div>
        <EmptyState 
          title="Payment calculations coming soon"
          sub="This dashboard will combine final ITC from reconciliation and total liability to compute the net tax payable in cash."
        />
      </div>
    </>
  );
}
