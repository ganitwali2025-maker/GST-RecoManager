import { rowKey, taxTotal, parseInvoiceDate } from './invoice';
import { MONTHS } from './storage';

export function runReconciliation(books, g2b, tol, normalizeInvoiceSetting) {
  const bookKeyCount = {};
  books.forEach(r => { const k = rowKey(r, normalizeInvoiceSetting); bookKeyCount[k] = (bookKeyCount[k]||0)+1; });
  const g2bKeyCount = {};
  g2b.forEach(r => { const k = rowKey(r, normalizeInvoiceSetting); g2bKeyCount[k] = (g2bKeyCount[k]||0)+1; });

  const g2bByKey = {};
  g2b.forEach(r => { const k = rowKey(r, normalizeInvoiceSetting); (g2bByKey[k] = g2bByKey[k] || []).push(r); });

  const usedG2b = new Set();
  const results = [];

  books.forEach(bRow => {
    const k = rowKey(bRow, normalizeInvoiceSetting);
    const pool = g2bByKey[k] || [];
    const candidate = pool.find(m => !usedG2b.has(m.id));
    const isDup = bookKeyCount[k] > 1 || g2bKeyCount[k] > 1;

    if(candidate){
      usedG2b.add(candidate.id);
      const diffTaxable = Math.round((Number(bRow.taxable||0) - Number(candidate.taxable||0)) * 100) / 100;
      const diffTax = Math.round((taxTotal(bRow) - taxTotal(candidate)) * 100) / 100;
      let status = (Math.abs(diffTaxable) <= tol && Math.abs(diffTax) <= tol) ? 'Matched' : 'Amount Mismatch';
      if(isDup) status = 'Duplicate';
      results.push({
        id: 'r_'+bRow.id, status, gstin: bRow.gstin, supplierName: bRow.supplierName || candidate.supplierName,
        invoiceNo: bRow.invoiceNo, invoiceDate: bRow.invoiceDate,
        booksTaxable: bRow.taxable, booksTax: taxTotal(bRow),
        g2bTaxable: candidate.taxable, g2bTax: taxTotal(candidate),
        diffTaxable, diffTax, supplierType: candidate.supplierType || bRow.supplierType || '',
        gstr1Filed: candidate.gstr1Filed || '',
        booksIgst: Number(bRow.igst||0), booksCgst: Number(bRow.cgst||0), booksSgst: Number(bRow.sgst||0), booksCess: Number(bRow.cess||0),
        g2bIgst: Number(candidate.igst||0), g2bCgst: Number(candidate.cgst||0), g2bSgst: Number(candidate.sgst||0), g2bCess: Number(candidate.cess||0),
        diffIgst: Number(bRow.igst||0) - Number(candidate.igst||0),
        diffCgst: Number(bRow.cgst||0) - Number(candidate.cgst||0),
        diffSgst: Number(bRow.sgst||0) - Number(candidate.sgst||0),
        diffCess: Number(bRow.cess||0) - Number(candidate.cess||0)
      });
    } else {
      results.push({
        id: 'r_'+bRow.id, status: isDup ? 'Duplicate' : 'Missing in 2B', gstin: bRow.gstin, supplierName: bRow.supplierName,
        invoiceNo: bRow.invoiceNo, invoiceDate: bRow.invoiceDate,
        booksTaxable: bRow.taxable, booksTax: taxTotal(bRow),
        g2bTaxable: null, g2bTax: null, diffTaxable: bRow.taxable, diffTax: taxTotal(bRow),
        supplierType: bRow.supplierType || '', gstr1Filed: '',
        booksIgst: Number(bRow.igst||0), booksCgst: Number(bRow.cgst||0), booksSgst: Number(bRow.sgst||0), booksCess: Number(bRow.cess||0),
        g2bIgst: null, g2bCgst: null, g2bSgst: null, g2bCess: null,
        diffIgst: Number(bRow.igst||0), diffCgst: Number(bRow.cgst||0), diffSgst: Number(bRow.sgst||0), diffCess: Number(bRow.cess||0)
      });
    }
  });

  g2b.forEach(r => {
    if(!usedG2b.has(r.id)){
      results.push({
        id: 'r2_'+r.id, status: 'Missing in Books', gstin: r.gstin, supplierName: r.supplierName,
        invoiceNo: r.invoiceNo, invoiceDate: r.invoiceDate,
        booksTaxable: null, booksTax: null, g2bTaxable: r.taxable, g2bTax: taxTotal(r),
        diffTaxable: -(Number(r.taxable)||0), diffTax: -taxTotal(r),
        supplierType: r.supplierType || '', gstr1Filed: r.gstr1Filed || '',
        booksIgst: null, booksCgst: null, booksSgst: null, booksCess: null,
        g2bIgst: Number(r.igst||0), g2bCgst: Number(r.cgst||0), g2bSgst: Number(r.sgst||0), g2bCess: Number(r.cess||0),
        diffIgst: -(Number(r.igst)||0), diffCgst: -(Number(r.cgst)||0), diffSgst: -(Number(r.sgst)||0), diffCess: -(Number(r.cess)||0)
      });
    }
  });

  return results;
}

export function reconSummary(rows){
  const s = { Matched:0, 'Amount Mismatch':0, 'Missing in 2B':0, 'Missing in Books':0, Duplicate:0 };
  const val = { Matched:0, 'Amount Mismatch':0, 'Missing in 2B':0, 'Missing in Books':0, Duplicate:0 };
  rows.forEach(r => { s[r.status] = (s[r.status]||0)+1; val[r.status] = (val[r.status]||0) + Math.abs(r.booksTax ?? r.g2bTax ?? 0); });
  return { counts: s, values: val, total: rows.length };
}

export function computeOldITC(books, financialYear, month){
  const selMonthIdx = MONTHS.indexOf(month);
  return books.filter(r => {
    const d = parseInvoiceDate(r.invoiceDate);
    if(!d) return false;
    const invMonthIdx = d.getMonth() >= 3 ? d.getMonth()-3 : d.getMonth()+9;
    const invFY = (d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear()-1);
    const [fyStart] = financialYear.split('-').map(Number);
    if(invFY < fyStart) return true;
    if(invFY === fyStart && invMonthIdx < selMonthIdx) return true;
    return false;
  });
}
