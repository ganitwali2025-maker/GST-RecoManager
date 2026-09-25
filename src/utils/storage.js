const STORE_KEY = 'reconiq_v1';
export const FY_LIST = ['2023-24','2024-25','2025-26','2026-27'];
export const MONTHS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

export function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }

export function todayFY(){
  const d = new Date(); const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear()-1;
  return y + '-' + String((y+1)).slice(-2);
}

export function defaultState(){
  return {
    companies: [
      { id: 'c1', name: 'Aarav Textiles Pvt Ltd', gstin: '23AAACA1234F1Z5' },
      { id: 'c2', name: 'Meridian Auto Components', gstin: '27AAECM5678K1Z2' },
    ],
    activeCompanyId: 'c1',
    financialYear: todayFY(),
    month: MONTHS[new Date().getMonth() >= 3 ? new Date().getMonth()-3 : new Date().getMonth()+9],
    books: [],
    gstr2b: [],
    gstr2b_gov: [],
    rcm: [],
    resolutions: {},
    gstr1: [],
    settings: { tolerance: 1, normalizeInvoice: true, theme: 'light' },
    reconciliationFilter: 'all',
    reconView: 'match',
    outputGst: {},
  };
}

export function loadData(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const merged = Object.assign(defaultState(), parsed);
    merged.settings = Object.assign(defaultState().settings, parsed.settings || {});
    // map fy to financialYear to match new state
    if (parsed.fy && !parsed.financialYear) {
      merged.financialYear = parsed.fy;
    }
    return merged;
  }catch(e){ return defaultState(); }
}

export function saveData(state){
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }catch(e){}
}
