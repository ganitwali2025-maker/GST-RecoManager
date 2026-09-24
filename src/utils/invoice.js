export function normGSTIN(v){ return String(v||'').trim().toUpperCase().replace(/\s+/g,''); }

export function normInv(v, normalizeInvoiceSetting){
  let s = String(v||'').trim().toUpperCase();
  if(normalizeInvoiceSetting) s = s.replace(/[^A-Z0-9]/g,'');
  return s;
}

export function taxTotal(r){ return (Number(r.igst)||0) + (Number(r.cgst)||0) + (Number(r.sgst)||0) + (Number(r.cess)||0); }

export function rowKey(r, normalizeInvoiceSetting){ return normGSTIN(r.gstin) + '|' + normInv(r.invoiceNo, normalizeInvoiceSetting); }

export function isGovtGSTIN(gstin){
  return false;
}

export function parseInvoiceDate(s){
  if(!s) return null;
  const str = String(s).trim();
  let m = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
  if(m){ let [,d,mo,y] = m; if(y.length===2) y = '20'+y; return new Date(Number(y), Number(mo)-1, Number(d)); }
  const d2 = new Date(str);
  return isNaN(d2) ? null : d2;
}

export function rowDataIssues(r){
  const issues = [];
  if(!r.gstin || normGSTIN(r.gstin).length !== 15) issues.push('GSTIN looks incomplete');
  if(!Number(r.taxable)) issues.push('Taxable value is zero');
  if(!parseInvoiceDate(r.invoiceDate)) issues.push('Invoice date could not be read');
  return issues;
}
