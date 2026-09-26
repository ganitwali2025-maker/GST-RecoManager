import React, { useState } from 'react';
import { 
  Download, CreditCard, FileText, Banknote, Calculator, Wallet, CheckCircle,
  ShoppingCart, ShieldCheck, AlertTriangle, AlertCircle, FileWarning, ArrowRight
} from 'lucide-react';

export default function Payment() {
  const [period, setPeriod] = useState('September 2026');
  const fmt = (num) => '₹ ' + num.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

  return (
    <div>
      
      {/* 2. KPI ROW 1 - PAYMENT SUMMARY */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: '14px' }}>
        <div className="kpi">
          <div className="lbl">Total Sales (Taxable)</div>
          <div className="val">{fmt(12500000)}</div>
          <div className="delta" style={{color: 'var(--green)'}}>↑ 12% vs last month</div>
        </div>
        <div className="kpi">
          <div className="lbl">Total Output GST</div>
          <div className="val">{fmt(1800000)}</div>
          <div className="delta" style={{color: 'var(--green)'}}>↑ 14% vs last month</div>
        </div>
        <div className="kpi">
          <div className="lbl">Total RCM Liability</div>
          <div className="val">{fmt(131400)}</div>
          <div className="delta" style={{color: 'var(--green)'}}>↑ 5% vs last month</div>
        </div>
        <div className="kpi">
          <div className="lbl" style={{color: 'var(--green)'}}>Eligible ITC Available</div>
          <div className="val">{fmt(1850000)}</div>
          <div className="delta" style={{color: 'var(--orange)'}}>↓ 5% vs last month</div>
        </div>
        <div className="kpi">
          <div className="lbl" style={{color: 'var(--blue)'}}>Cash Ledger Bal.</div>
          <div className="val">{fmt(15000)}</div>
          <div className="delta">Pre-deposited</div>
        </div>
        <div className="kpi" style={{ background: '#fff7ed', borderColor: 'var(--red)' }}>
          <div className="lbl" style={{color: 'var(--red)'}}>Net Cash to Paid</div>
          <div className="val" style={{color: 'var(--red)'}}>{fmt(385000)}</div>
          <div className="delta" style={{color: 'var(--red)'}}>Challan Amount</div>
        </div>
      </div>

      {/* 3. KPI ROW 2 - TAX BREAKDOWN */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '14px' }}>
        <div className="kpi" style={{ padding: '12px 16px' }}>
          <div className="lbl">IGST Payable</div>
          <div className="val" style={{fontSize: '18px'}}>{fmt(95000)}</div>
        </div>
        <div className="kpi" style={{ padding: '12px 16px' }}>
          <div className="lbl">CGST Payable</div>
          <div className="val" style={{fontSize: '18px'}}>{fmt(145000)}</div>
        </div>
        <div className="kpi" style={{ padding: '12px 16px' }}>
          <div className="lbl">SGST Payable</div>
          <div className="val" style={{fontSize: '18px'}}>{fmt(145000)}</div>
        </div>
        <div className="kpi" style={{ padding: '12px 16px' }}>
          <div className="lbl">Late Fee & Int.</div>
          <div className="val" style={{fontSize: '18px'}}>{fmt(0)}</div>
        </div>
        <div className="kpi" style={{ padding: '12px 16px', background: '#f0fdf4', borderColor: 'var(--green)' }}>
          <div className="lbl" style={{color: 'var(--green)'}}>Total Challan Amount</div>
          <div className="val" style={{fontSize: '18px', color: 'var(--green)'}}>{fmt(385000)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        {/* 1. GSTR-1 LIABILITY */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-head">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={16} style={{color: 'var(--blue)'}}/> 1. GSTR-1 Liability (Output Sales)
            </h3>
            <div className="hint">Breakdown of Outward Supplies</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="num">Taxable Value</th>
                  <th className="num">IGST</th>
                  <th className="num">CGST</th>
                  <th className="num">SGST</th>
                  <th className="num">Total Tax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{fontWeight: 600}}>B2B Sales</td>
                  <td className="num">{fmt(8500000)}</td>
                  <td className="num">{fmt(100000)}</td>
                  <td className="num">{fmt(50000)}</td>
                  <td className="num">{fmt(50000)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(200000)}</td>
                </tr>
                <tr>
                  <td style={{fontWeight: 600}}>B2C Large</td>
                  <td className="num">{fmt(1500000)}</td>
                  <td className="num">{fmt(30000)}</td>
                  <td className="num">{fmt(0)}</td>
                  <td className="num">{fmt(0)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(30000)}</td>
                </tr>
                <tr>
                  <td style={{fontWeight: 600}}>B2C Others</td>
                  <td className="num">{fmt(2500000)}</td>
                  <td className="num">{fmt(10000)}</td>
                  <td className="num">{fmt(25000)}</td>
                  <td className="num">{fmt(25000)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(60000)}</td>
                </tr>
                <tr>
                  <td style={{fontWeight: 600}}>Export / Zero Rated</td>
                  <td className="num">{fmt(500000)}</td>
                  <td className="num">{fmt(10000)}</td>
                  <td className="num">{fmt(0)}</td>
                  <td className="num">{fmt(0)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(10000)}</td>
                </tr>
                <tr>
                  <td style={{fontWeight: 600}}>Credit / Debit Notes</td>
                  <td className="num">- {fmt(500000)}</td>
                  <td className="num">{fmt(0)}</td>
                  <td className="num">{fmt(0)}</td>
                  <td className="num">{fmt(0)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(0)}</td>
                </tr>
                <tr style={{background: 'var(--panel-2)'}}>
                  <td style={{fontWeight: 700}}>Total Liability</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(12500000)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(150000)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(75000)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(75000)}</td>
                  <td className="num" style={{fontWeight: 800, color: 'var(--blue)'}}>{fmt(300000)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. ITC AVAILABLE */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-head">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Banknote size={16} style={{color: 'var(--green)'}}/> 2. ITC Available (Credit Ledger)
            </h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="num">Opening Bal.</th>
                  <th className="num">ITC This Month</th>
                  <th className="num">Total ITC Available</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IGST</td>
                  <td className="num">{fmt(50000)}</td>
                  <td className="num">{fmt(1100000)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(1150000)}</td>
                </tr>
                <tr>
                  <td>CGST</td>
                  <td className="num">{fmt(100000)}</td>
                  <td className="num">{fmt(250000)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(350000)}</td>
                </tr>
                <tr>
                  <td>SGST</td>
                  <td className="num">{fmt(100000)}</td>
                  <td className="num">{fmt(240000)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(350000)}</td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr style={{background: '#f0fdf4'}}>
                  <td style={{fontWeight: 700}}>Total ITC</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(250000)}</td>
                  <td className="num" style={{fontWeight: 700}}>{fmt(1590000)}</td>
                  <td className="num" style={{fontWeight: 800, color: 'var(--green)'}}>{fmt(1850000)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. ITC SET OFF */}
      <div className="panel" style={{ marginBottom: '14px' }}>
        <div className="panel-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={16} style={{color: 'var(--purple)'}}/> 3. Set-off of Liability (ITC Utilization)
          </h3>
          <div className="hint">Automatically calculated as per GST Section 49(A) rules</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th className="num">Tax Liability</th>
                <th className="num" style={{color: 'var(--green)'}}>Paid Thru IGST ITC</th>
                <th className="num" style={{color: 'var(--green)'}}>Paid Thru CGST ITC</th>
                <th className="num" style={{color: 'var(--green)'}}>Paid Thru SGST ITC</th>
                <th className="num">Liability Remaining</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{fontWeight: 600}}>IGST</td>
                <td className="num">{fmt(1250000)}</td>
                <td className="num" style={{background: '#f0fdf4', color: 'var(--green)', fontWeight: 600}}>{fmt(1150000)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(100000)}</td>
              </tr>
              <tr>
                <td style={{fontWeight: 600}}>CGST</td>
                <td className="num">{fmt(500000)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num" style={{background: '#f0fdf4', color: 'var(--green)', fontWeight: 600}}>{fmt(350000)}</td>
                <td className="num" style={{background: 'var(--panel-2)', color: 'var(--muted)'}}>{fmt(0)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(150000)}</td>
              </tr>
              <tr>
                <td style={{fontWeight: 600}}>SGST</td>
                <td className="num">{fmt(500000)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num" style={{background: 'var(--panel-2)', color: 'var(--muted)'}}>{fmt(0)}</td>
                <td className="num" style={{background: '#f0fdf4', color: 'var(--green)', fontWeight: 600}}>{fmt(350000)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(150000)}</td>
              </tr>
              <tr style={{background: 'var(--panel-2)'}}>
                <td style={{fontWeight: 700}}>Total</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(2250000)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(1150000)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(350000)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(350000)}</td>
                <td className="num" style={{fontWeight: 800, color: 'var(--red)'}}>{fmt(400000)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. CASH LEDGER */}
      <div className="panel" style={{ marginBottom: '14px' }}>
        <div className="panel-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={16} style={{color: 'var(--blue)'}}/> 4. Cash Ledger & Final Challan Amount
          </h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TAX HEAD</th>
                <th className="num">TAX LIABILITY</th>
                <th className="num">PAID IN CASH</th>
                <th className="num">INTEREST / LATE FEE</th>
                <th className="num">TOTAL CASH REQUIRED</th>
                <th className="num">AVAILABLE CASH BAL</th>
                <th className="num" style={{color: 'var(--red)'}}>NET CASH TO PAID (CHALLAN)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{fontWeight: 600}}>IGST</td>
                <td className="num">{fmt(100000)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num">{fmt(100000)}</td>
                <td className="num">{fmt(5000)}</td>
                <td className="num" style={{color: 'var(--red)', fontWeight: 600}}>{fmt(95000)}</td>
              </tr>
              <tr>
                <td style={{fontWeight: 600}}>CGST</td>
                <td className="num">{fmt(150000)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num">{fmt(150000)}</td>
                <td className="num">{fmt(5000)}</td>
                <td className="num" style={{color: 'var(--red)', fontWeight: 600}}>{fmt(145000)}</td>
              </tr>
              <tr>
                <td style={{fontWeight: 600}}>SGST</td>
                <td className="num">{fmt(150000)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num">{fmt(150000)}</td>
                <td className="num">{fmt(5000)}</td>
                <td className="num" style={{color: 'var(--red)', fontWeight: 600}}>{fmt(145000)}</td>
              </tr>
              <tr style={{ background: '#fef2f2' }}>
                <td style={{fontWeight: 700, color: 'var(--red)'}}>TOTAL CHALLAN</td>
                <td className="num" style={{fontWeight: 700, color: 'var(--red)'}}>{fmt(400000)}</td>
                <td className="num" style={{fontWeight: 700, color: 'var(--red)'}}>{fmt(0)}</td>
                <td className="num" style={{fontWeight: 700, color: 'var(--red)'}}>{fmt(0)}</td>
                <td className="num" style={{fontWeight: 700, color: 'var(--red)'}}>{fmt(400000)}</td>
                <td className="num" style={{fontWeight: 700, color: 'var(--red)'}}>{fmt(15000)}</td>
                <td className="num" style={{fontWeight: 800, color: 'var(--red)', fontSize: '15px'}}>{fmt(385000)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. RCM */}
      <div className="panel" style={{ marginBottom: '60px' }}>
        <div className="panel-head">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} style={{color: 'var(--orange)'}}/> 5. RCM (Reverse Charge Mechanism)
            <span style={{background: 'var(--orange)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px'}}>NEW</span>
          </h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th className="num">Taxable Value</th>
                <th className="num">IGST</th>
                <th className="num">CGST</th>
                <th className="num">SGST</th>
                <th className="num">Total Tax</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{fontWeight: 600}}>RCM - Goods</td>
                <td className="num">{fmt(250000)}</td>
                <td className="num">{fmt(45000)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(45000)}</td>
                <td><span style={{background: '#ffedd5', color: '#ea580c', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 600}}>Pending</span></td>
              </tr>
              <tr>
                <td style={{fontWeight: 600}}>RCM - Services</td>
                <td className="num">{fmt(180000)}</td>
                <td className="num">{fmt(32400)}</td>
                <td className="num">{fmt(16200)}</td>
                <td className="num">{fmt(16200)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(64800)}</td>
                <td><span style={{background: '#dcfce7', color: '#166534', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 600}}>Paid</span></td>
              </tr>
              <tr>
                <td style={{fontWeight: 600}}>Import of Goods</td>
                <td className="num">{fmt(120000)}</td>
                <td className="num">{fmt(21600)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num">{fmt(0)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(21600)}</td>
                <td><span style={{background: '#ffedd5', color: '#ea580c', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 600}}>Pending</span></td>
              </tr>
              <tr style={{background: 'var(--panel-2)'}}>
                <td style={{fontWeight: 700}}>Total RCM</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(550000)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(99000)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(16200)}</td>
                <td className="num" style={{fontWeight: 700}}>{fmt(16200)}</td>
                <td className="num" style={{fontWeight: 800}}>{fmt(131400)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
