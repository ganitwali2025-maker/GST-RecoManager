import { uid } from '../utils/storage';
import { MONTHS } from '../utils/storage';

export function getSampleData(companyId, financialYear, month) {
  const suppliers = [
    {name:'Sundaram Steel Traders', gstin:'27AABCS1234F1Z1'},
    {name:'Vikram Packaging Co', gstin:'24AAACV5678K1Z9'},
    {name:'Om Sai Logistics', gstin:'29AAECO4321L1Z3'},
    {name:'Krishna Chemicals Ltd', gstin:'19AAFCK9988M1Z6'},
    {name:'Nova Electricals', gstin:'07AABCN3345P1Z8'},
  ];
  const govtSuppliers = [
    {name:'Municipal Corporation Dept', gstin:'27GOVTM1234F1Z1'},
    {name:'State Electricity Board', gstin:'23GOVTE5678K1Z2'},
  ];
  
  const mk = (i, over={}) => {
    const s = suppliers[i % suppliers.length];
    const taxable = 10000 + i*1370;
    const igst = i % 2 === 0 ? Math.round(taxable*0.18) : 0;
    const cgst = i % 2 !== 0 ? Math.round(taxable*0.09) : 0;
    const sgst = i % 2 !== 0 ? Math.round(taxable*0.09) : 0;
    return Object.assign({ id: uid(), companyId, fy: financialYear, month,
      invoiceNo: 'INV-'+(1000+i), invoiceDate: `05-${MONTHS.indexOf(month)+1<10?'0':''}${MONTHS.indexOf(month)+1}-2025`,
      gstin: s.gstin, supplierName: s.name, taxable, igst, cgst, sgst, cess: 0,
      supplierType: 'Regular', gstr1Filed: i % 4 === 0 ? 'No' : 'Yes',
    }, over);
  };

  const books = [];
  const g2b = [];
  for(let i=0;i<14;i++) books.push(mk(i));
  for(let i=0;i<14;i++){
    if(i===2){ continue; } // missing in 2B
    if(i===5){ const r = mk(i); r.taxable = r.taxable - 850; r.igst = Math.round(r.igst*0.9); g2b.push(r); continue; } // mismatch
    g2b.push(mk(i));
  }
  g2b.push(mk(20)); // missing in books
  g2b.push(mk(21));
  books.push(mk(8)); // duplicate in books (same key as i=8)

  const gv = govtSuppliers[0];
  g2b.push({ id: uid(), companyId, fy: financialYear, month, invoiceNo:'GOV-501', invoiceDate:`10-${MONTHS.indexOf(month)+1<10?'0':''}${MONTHS.indexOf(month)+1}-2025`,
    gstin: gv.gstin, supplierName: gv.name, taxable: 22000, igst: 3960, cgst:0, sgst:0, cess:0, supplierType:'Government', gstr1Filed:'Yes' });
  const prevMonthIdx = (MONTHS.indexOf(month)+11)%12;
  books.push({ id: uid(), companyId, fy: financialYear, month, invoiceNo:'OLD-77', invoiceDate:`18-${prevMonthIdx+1<10?'0':''}${prevMonthIdx+1}-2025`,
    gstin: suppliers[1].gstin, supplierName: suppliers[1].name, taxable: 9500, igst:0, cgst:855, sgst:855, cess:0, supplierType:'Regular' });

  const rcm = [
    { id: uid(), companyId, fy: financialYear, month, invoiceNo:'RCM-001', invoiceDate:`12-${MONTHS.indexOf(month)+1<10?'0':''}${MONTHS.indexOf(month)+1}-2025`,
      gstin:'URP0000000000000', supplierName:'Goods Transport Agency (Unregistered)', taxable:18000, igst:0, cgst:900, sgst:900, cess:0 },
    { id: uid(), companyId, fy: financialYear, month, invoiceNo:'RCM-002', invoiceDate:`22-${MONTHS.indexOf(month)+1<10?'0':''}${MONTHS.indexOf(month)+1}-2025`,
      gstin:'URP0000000000001', supplierName:'Legal Consultancy Services', taxable:12500, igst:2250, cgst:0, sgst:0, cess:0 },
  ];

  return { books, g2b, rcm };
}
