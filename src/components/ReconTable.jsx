import React from 'react';
import { Badge } from './Badge';
import { fmtNum, esc } from '../utils/format';

const STATUS_META = {
  'Matched': { cls: 'green', dot: 'green' },
  'Amount Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Missing in 2B': { cls: 'red', dot: 'red' },
  'Missing in Books': { cls: 'blue', dot: 'blue' },
  'Duplicate': { cls: 'purple', dot: 'purple' },
};

export default function ReconTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="table-wrap">
        <table>
          <tbody>
            <tr className="empty-row">
              <td>No lines in this view.</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const reconRowAttention = (r) => r.status !== 'Matched';

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Status</th>
            <th>Invoice No.</th>
            <th>Date</th>
            <th>GSTIN</th>
            <th>Supplier</th>
            <th className="num">Books Taxable</th>
            <th className="num">2B Taxable</th>
            <th className="num">Books Tax</th>
            <th className="num">2B Tax</th>
            <th className="num">Diff (Tax)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const meta = STATUS_META[r.status] || { cls: 'grey', dot: 'grey' };
            const attention = reconRowAttention(r);
            const title = attention ? `Needs review before filing: ${r.status}` : 'Matched — no action needed';

            return (
              <tr key={r.id || i}>
                <td>
                  <Badge color={attention ? 'orange' : 'green'} dot title={title}>
                    {attention ? 'Review' : 'OK'}
                  </Badge>
                </td>
                <td>
                  <Badge color={meta.cls} dot>
                    {r.status}
                  </Badge>
                </td>
                <td>{esc(r.invoiceNo)}</td>
                <td>{esc(r.invoiceDate)}</td>
                <td className="mono">{esc(r.gstin)}</td>
                <td>{esc(r.supplierName)}</td>
                <td className="num">{r.booksTaxable != null ? fmtNum(r.booksTaxable) : '—'}</td>
                <td className="num">{r.g2bTaxable != null ? fmtNum(r.g2bTaxable) : '—'}</td>
                <td className="num">{r.booksTax != null ? fmtNum(r.booksTax) : '—'}</td>
                <td className="num">{r.g2bTax != null ? fmtNum(r.g2bTax) : '—'}</td>
                <td className="num" style={{ color: Math.abs(r.diffTax || 0) > 0 ? 'var(--yellow)' : 'var(--muted)' }}>
                  {fmtNum(r.diffTax)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
