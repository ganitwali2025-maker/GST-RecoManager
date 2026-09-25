import { rowKey, taxTotal, parseInvoiceDate } from './invoice';
import { MONTHS } from './storage';

export function runReconciliation(books, g2b, allG2b, tol, normalizeInvoiceSetting, resolutions = {}) {
  const bookKeyCount = {};
  books.forEach(r => { const k = rowKey(r, normalizeInvoiceSetting); bookKeyCount[k] = (bookKeyCount[k]||0)+1; });
  const g2bKeyCount = {};
  g2b.forEach(r => { const k = rowKey(r, normalizeInvoiceSetting); g2bKeyCount[k] = (g2bKeyCount[k]||0)+1; });

  const g2bByKey = {};
  g2b.forEach(r => { const k = rowKey(r, normalizeInvoiceSetting); (g2bByKey[k] = g2bByKey[k] || []).push(r); });
  
  const allG2bByKey = {};
  if (allG2b) {
    allG2b.forEach(r => { const k = rowKey(r, normalizeInvoiceSetting); (allG2bByKey[k] = allG2bByKey[k] || []).push(r); });
  }

  const usedG2b = new Set();
  const results = [];

  books.forEach(bRow => {
    const k = rowKey(bRow, normalizeInvoiceSetting);
    
    // Find in current month
    const pool = g2bByKey[k] || [];
    const available = pool.filter(m => !usedG2b.has(m.id));
    
    // Find in all months
    const poolAll = allG2bByKey[k] || [];
    const candidateAll = poolAll.length > 0 ? poolAll[0] : null;
    
    let candidate = null;
    let matchType = null;
    
    if (available.length > 0) {
      const exact = available.find(m => {
        const bDate = parseInvoiceDate(bRow.invoiceDate)?.getTime() || 0;
        const mDate = parseInvoiceDate(m.invoiceDate)?.getTime() || 0;
        const diffTaxable = Math.abs((Number(bRow.taxable)||0) - (Number(m.taxable)||0));
        const diffTax = Math.abs(taxTotal(bRow) - taxTotal(m));
        return bDate === mDate && diffTaxable <= tol && diffTax <= tol;
      });
      if (exact) {
        candidate = exact;
        matchType = 'exact';
      } else if (available.length === 1) {
        candidate = available[0];
        matchType = 'partial';
      } else {
        candidate = available[0];
        matchType = 'multiple';
      }
    }

    const isDup = bookKeyCount[k] > 1 || g2bKeyCount[k] > 1;

    if(candidate){
      usedG2b.add(candidate.id);
      const diffTaxable = Math.round((Number(bRow.taxable||0) - Number(candidate.taxable||0)) * 100) / 100;
      const diffTax = Math.round((taxTotal(bRow) - taxTotal(candidate)) * 100) / 100;
      
      let status = 'Matched';
      if (matchType === 'multiple') {
        status = 'Multiple Match / Possible Match';
      } else {
        const bDate = parseInvoiceDate(bRow.invoiceDate)?.getTime() || 0;
        const cDate = parseInvoiceDate(candidate.invoiceDate)?.getTime() || 0;
        if (bDate !== cDate) {
          status = 'Date Mismatch';
        } else if (Math.abs(diffTaxable) > tol) {
          status = 'Taxable Value Mismatch';
        } else if (Math.abs((Number(bRow.igst)||0) - (Number(candidate.igst)||0)) > tol) {
          status = 'IGST Mismatch';
        } else if (Math.abs((Number(bRow.cgst)||0) - (Number(candidate.cgst)||0)) > tol) {
          status = 'CGST Mismatch';
        } else if (Math.abs((Number(bRow.sgst)||0) - (Number(candidate.sgst)||0)) > tol) {
          status = 'SGST Mismatch';
        } else if (Math.abs((Number(bRow.cess)||0) - (Number(candidate.cess)||0)) > tol) {
          status = 'Cess Mismatch';
        } else if (Math.abs(diffTax) > tol) {
          status = 'GST Mismatch';
        }
      }

      if(isDup) status = 'Duplicate Invoice';
      let remark = '';
      if (resolutions[bRow.id] || resolutions[candidate.id]) {
        const res = resolutions[bRow.id] || resolutions[candidate.id];
        if (res.action === 'Accept Match / Move to Final') {
          status = 'Matched';
        }
        remark = res.remark || '';
      }
      results.push({
        id: 'r_'+bRow.id, bRowId: bRow.id, g2bId: candidate.id, status, remark, gstin: bRow.gstin, supplierName: bRow.supplierName || candidate.supplierName,
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
        diffCess: Number(bRow.cess||0) - Number(candidate.cess||0),
        g2bAllId: candidateAll ? candidateAll.id : null,
        g2bAllSupplierName: candidateAll ? candidateAll.supplierName : null,
        g2bAllGstin: candidateAll ? candidateAll.gstin : null,
        g2bAllInvoiceDate: candidateAll ? candidateAll.invoiceDate : null,
        g2bAllTaxable: candidateAll ? candidateAll.taxable : null,
        g2bAllIgst: candidateAll ? candidateAll.igst : null,
        g2bAllCgst: candidateAll ? candidateAll.cgst : null,
        g2bAllSgst: candidateAll ? candidateAll.sgst : null,
        g2bAllTax: candidateAll ? taxTotal(candidateAll) : null
      });
    } else {
      let status = isDup ? 'Duplicate Invoice' : 'Not in 2B';
      let remark = '';
      if (resolutions[bRow.id]) {
        const res = resolutions[bRow.id];
        if (res.action === 'Accept Match / Move to Final') {
          status = 'Matched';
        }
        remark = res.remark || '';
      }
      results.push({
        id: 'r_'+bRow.id, bRowId: bRow.id, g2bId: null, status, remark, gstin: bRow.gstin, supplierName: bRow.supplierName,
        invoiceNo: bRow.invoiceNo, invoiceDate: bRow.invoiceDate,
        booksTaxable: bRow.taxable, booksTax: taxTotal(bRow),
        g2bTaxable: null, g2bTax: null, diffTaxable: bRow.taxable, diffTax: taxTotal(bRow),
        supplierType: bRow.supplierType || '', gstr1Filed: '',
        booksIgst: Number(bRow.igst||0), booksCgst: Number(bRow.cgst||0), booksSgst: Number(bRow.sgst||0), booksCess: Number(bRow.cess||0),
        g2bIgst: null, g2bCgst: null, g2bSgst: null, g2bCess: null,
        diffIgst: Number(bRow.igst||0), diffCgst: Number(bRow.cgst||0), diffSgst: Number(bRow.sgst||0), diffCess: Number(bRow.cess||0),
        g2bAllId: candidateAll ? candidateAll.id : null,
        g2bAllSupplierName: candidateAll ? candidateAll.supplierName : null,
        g2bAllGstin: candidateAll ? candidateAll.gstin : null,
        g2bAllInvoiceDate: candidateAll ? candidateAll.invoiceDate : null,
        g2bAllTaxable: candidateAll ? candidateAll.taxable : null,
        g2bAllIgst: candidateAll ? candidateAll.igst : null,
        g2bAllCgst: candidateAll ? candidateAll.cgst : null,
        g2bAllSgst: candidateAll ? candidateAll.sgst : null,
        g2bAllTax: candidateAll ? taxTotal(candidateAll) : null
      });
    }
  });

  g2b.forEach(r => {
    if(!usedG2b.has(r.id)){
      let status = 'Not in Books';
      let remark = '';
      if (resolutions[r.id]) {
        const res = resolutions[r.id];
        if (res.action === 'Accept Match / Move to Final') {
          status = 'Matched';
        }
        remark = res.remark || '';
      }
      results.push({
        id: 'r2_'+r.id, bRowId: null, g2bId: r.id, status, remark, gstin: r.gstin, supplierName: r.supplierName,
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
  const s = { Matched:0, 'Amount Mismatch':0, 'Not in 2B':0, 'Not in Books':0, 'Duplicate Invoice':0, 'Date Mismatch':0, 'Taxable Value Mismatch':0, 'IGST Mismatch':0, 'CGST Mismatch':0, 'SGST Mismatch':0, 'Cess Mismatch':0, 'GST Mismatch':0, 'Multiple Match / Possible Match':0 };
  const val = { Matched:0, 'Amount Mismatch':0, 'Not in 2B':0, 'Not in Books':0, 'Duplicate Invoice':0, 'Date Mismatch':0, 'Taxable Value Mismatch':0, 'IGST Mismatch':0, 'CGST Mismatch':0, 'SGST Mismatch':0, 'Cess Mismatch':0, 'GST Mismatch':0, 'Multiple Match / Possible Match':0 };
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
