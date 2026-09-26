export function fmtINR(n){
  n = Number(n)||0;
  const neg = n < 0; n = Math.abs(n);
  let s = n.toFixed(0);
  let last3 = s.length > 3 ? s.slice(-3) : s;
  let rest = s.length > 3 ? s.slice(0, -3) : '';
  if(rest !== '') last3 = ',' + last3;
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (neg?'-':'') + '₹ ' + rest + last3;
}

export function fmtNum(n){ return Number(n||0).toLocaleString('en-IN'); }

export function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export function parseNum(v){ const n = parseFloat(String(v).replace(/,/g,'')); return isNaN(n) ? 0 : n; }
