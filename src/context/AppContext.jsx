import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadData, saveData, defaultState, FY_LIST, MONTHS, todayFY } from '../utils/storage';
import { getSampleData } from '../data/sampleData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, setState] = useState(loadData());

  useEffect(() => {
    saveData(state);
    const theme = state.settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
  }, [state]);

  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const updateSettings = (updates) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  };

  const currentBooks = state.books.filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month
  );

  const currentGstr2b = state.gstr2b.filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month
  );

  const currentRcm = state.rcm.filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month
  );

  const fyGstr2b = state.gstr2b.filter(
    (r) => r.companyId === state.activeCompanyId && r.fy === state.financialYear
  );

  const activeCompany = state.companies.find((c) => c.id === state.activeCompanyId) || state.companies[0];
  
  const outputGstKey = `${state.activeCompanyId}|${state.financialYear}|${state.month}`;
  const currentOutputGst = state.outputGst[outputGstKey] || { igst: 0, cgst: 0, sgst: 0, cess: 0 };

  const saveOutputGst = (vals) => {
    updateState({
      outputGst: {
        ...state.outputGst,
        [outputGstKey]: vals,
      }
    });
  };

  const clearCurrentPeriod = (type) => {
    updateState({
      [type]: state[type].filter(
        (r) => !(r.companyId === state.activeCompanyId && r.fy === state.financialYear && r.month === state.month)
      ),
    });
  };

  const loadSample = () => {
    const co = state.activeCompanyId;
    const fy = state.financialYear;
    const mo = state.month;
    
    let newBooks = state.books.filter(r => !(r.companyId===co && r.fy===fy && r.month===mo));
    let newGstr2b = state.gstr2b.filter(r => !(r.companyId===co && r.fy===fy && r.month===mo));
    let newRcm = state.rcm.filter(r => !(r.companyId===co && r.fy===fy && r.month===mo));

    const sample = getSampleData(co, fy, mo);
    
    updateState({
      books: [...newBooks, ...sample.books],
      gstr2b: [...newGstr2b, ...sample.g2b],
      rcm: [...newRcm, ...sample.rcm]
    });
  };

  const deleteRow = (type, rowId) => {
    updateState({
      [type]: state[type].filter(r => r.id !== rowId)
    });
  };

  const updateRow = (type, rowId, newData) => {
    updateState({
      [type]: state[type].map(r => r.id === rowId ? { ...r, ...newData } : r)
    });
  };

  const resolutions = state.resolutions || {};

  const resolveMismatch = (id, res) => {
    updateState({
      resolutions: {
        ...resolutions,
        [id]: { ...res, timestamp: Date.now() }
      }
    });
  };

  const undoResolve = (id) => {
    const copy = { ...resolutions };
    delete copy[id];
    updateState({ resolutions: copy });
  };

  const clearAllData = () => {
    setState(defaultState());
  };

  const toggleTheme = () => {
    const order = ['dark', 'light', 'blue'];
    const idx = order.indexOf(state.settings.theme);
    updateSettings({ theme: order[(idx + 1) % order.length] || 'light' });
  };

  const contextValue = {
    ...state,
    updateState,
    updateSettings,
    currentBooks,
    currentGstr2b,
    currentRcm,
    fyGstr2b,
    activeCompany,
    currentOutputGst,
    saveOutputGst,
    clearCurrentPeriod,
    deleteRow,
    updateRow,
    loadSample,
    clearAllData,
    toggleTheme,
    resolutions,
    resolveMismatch,
    undoResolve,
    FY_LIST,
    MONTHS
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
