import React, { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { fmtNum } from '../utils/format';
import { uid } from '../utils/storage';
import DataTable from '../components/DataTable';

const TARGET_FIELDS_BASE = [
  {key:'invoiceNo', label:'Invoice No.', req:true},
  {key:'invoiceDate', label:'Invoice Date', req:true},
  {key:'gstin', label:'Supplier GSTIN', req:true},
  {key:'supplierName', label:'Supplier Name', req:false},
  {key:'taxable', label:'Taxable Value', req:true},
  {key:'igst', label:'IGST', req:false},
  {key:'cgst', label:'CGST', req:false},
  {key:'sgst', label:'SGST', req:false},
  {key:'cess', label:'Cess', req:false},
];

const TARGET_FIELDS_G2B_EXTRA = [
  {key:'supplierType', label:'Supplier Type (Government/Regular)', req:false},
  {key:'gstr1Filed', label:'GSTR-1 Filed (Yes/No)', req:false},
];

const GUESS = {
  invoiceNo:['invoice no','invoice number','inv no','invno','invoice_no'],
  invoiceDate:['invoice date','date','inv date','invoice_date'],
  gstin:['gstin','supplier gstin','gst no','supplier gst'],
  supplierName:['supplier name','supplier','vendor','vendor name','party name','name'],
  taxable:['taxable value','taxable','taxable amt','taxable_value'],
  igst:['igst'], cgst:['cgst'], sgst:['sgst'], cess:['cess'],
  supplierType:['supplier type','type','category','govt','government'],
  gstr1Filed:['gstr-1 filed','gstr1 filed','filing status','filed'],
};

function parseNum(v){ const n = parseFloat(String(v).replace(/,/g,'')); return isNaN(n) ? 0 : n; }

export default function Import() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTarget = queryParams.get('target') || 'books';

  const { activeCompany, month, financialYear, activeCompanyId, updateState, loadSample, books, gstr2b, gstr2b_gov, rcm, gstr1 } = useAppContext();
  const { showToast } = useToast();

  const [target, setTarget] = useState(initialTarget);
  const [importState, setImportState] = useState({
    headers: [], rawRows: [], mapping: {}, replace: false
  });

  const getTargetFields = (kind) => (kind === 'gstr2b' || kind === 'gstr2b_gov') ? [...TARGET_FIELDS_BASE, ...TARGET_FIELDS_G2B_EXTRA] : TARGET_FIELDS_BASE;

  const autoGuessMapping = (headers, kind) => {
    const mapping = {};
    getTargetFields(kind).forEach(f => {
      const guesses = GUESS[f.key] || [];
      const found = headers.find(h => guesses.includes(String(h).trim().toLowerCase()));
      mapping[f.key] = found || '';
    });
    return mapping;
  };

  const handleFile = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (res) => {
          setImportState({
            headers: res.meta.fields || [],
            rawRows: res.data,
            mapping: autoGuessMapping(res.meta.fields || [], target),
            replace: false
          });
        },
        error: () => showToast('Could not read that CSV file.')
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
          const headers = json.length ? Object.keys(json[0]) : [];
          setImportState({
            headers,
            rawRows: json,
            mapping: autoGuessMapping(headers, target),
            replace: false
          });
        } catch (err) {
          showToast('Could not read that Excel file.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const mapRow = (row, mapping) => {
    const g = key => key ? row[key] : '';
    return {
      invoiceNo: g(mapping.invoiceNo), invoiceDate: g(mapping.invoiceDate), gstin: g(mapping.gstin), supplierName: g(mapping.supplierName),
      taxable: parseNum(g(mapping.taxable)), igst: parseNum(g(mapping.igst)), cgst: parseNum(g(mapping.cgst)), sgst: parseNum(g(mapping.sgst)), cess: parseNum(g(mapping.cess)),
      supplierType: mapping.supplierType ? g(mapping.supplierType) : '', gstr1Filed: mapping.gstr1Filed ? g(mapping.gstr1Filed) : '',
    };
  };

  const confirmImport = () => {
    const { rawRows, mapping, replace } = importState;
    const fields = getTargetFields(target);
    const required = fields.filter(f => f.req);
    const missing = required.filter(f => !mapping[f.key]);
    
    if (missing.length) {
      showToast('Please map: ' + missing.map(f => f.label).join(', '));
      return;
    }

    const newRows = rawRows.map(row => {
      const mapped = mapRow(row, mapping);
      return { id: uid(), companyId: activeCompanyId, fy: financialYear, month, ...mapped };
    }).filter(r => r.invoiceNo);

    const storeKey = target === 'books' ? 'books' : target === 'rcm' ? 'rcm' : target === 'gstr1' ? 'gstr1' : target === 'gstr2b_gov' ? 'gstr2b_gov' : 'gstr2b';
    let updatedData = [];
    
    if (replace) {
      let currentData = storeKey === 'books' ? books : storeKey === 'rcm' ? rcm : storeKey === 'gstr1' ? gstr1 : storeKey === 'gstr2b_gov' ? gstr2b_gov : gstr2b;
      updatedData = currentData.filter(r => !(r.companyId === activeCompanyId && r.fy === financialYear && r.month === month));
    } else {
      updatedData = storeKey === 'books' ? [...books] : storeKey === 'rcm' ? [...rcm] : storeKey === 'gstr1' ? [...gstr1] : storeKey === 'gstr2b_gov' ? [...gstr2b_gov] : [...gstr2b];
    }
    
    updatedData = [...updatedData, ...newRows];
    
    updateState({ [storeKey]: updatedData });
    setImportState({ headers: [], rawRows: [], mapping: {}, replace: false });
    
    const getKindLabel = (t) => {
      if (t === 'books') return 'Books ITC';
      if (t === 'gstr2b') return '2B All Months';
      if (t === 'gstr2b_gov') return '2B GOV';
      if (t === 'rcm') return 'RCM';
      if (t === 'gstr1') return 'GST R-1';
      return '';
    };
    
    const kindLabel = getKindLabel(target);
    showToast(`Imported ${newRows.length} rows into ${kindLabel}`);
    
    navigate(target === 'books' ? '/books' : target === 'rcm' ? '/rcmdata' : target === 'gstr1' ? '/gstr1' : target === 'gstr2b_gov' ? '/gstr2b-gov' : '/gstr2b');
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const renderMapping = () => {
    const { headers, rawRows, mapping, replace } = importState;
    const fields = getTargetFields(target);
    const getKindLabel = (t) => {
      if (t === 'books') return 'Books ITC';
      if (t === 'gstr2b') return '2B All Months Data';
      if (t === 'gstr2b_gov') return '2B GOV Data';
      if (t === 'rcm') return 'RCM Invoices';
      if (t === 'gstr1') return 'GST R-1 Data';
      return '';
    };
    const kindLabel = getKindLabel(target);
    
    const sample = rawRows.slice(0, 5).map(row => mapRow(row, mapping));

    return (
      <div id="mappingArea">
        <div className="section-title">Map columns — {kindLabel}</div>
        <div className="map-grid">
          {fields.map(f => (
            <div className="map-row" key={f.key}>
              <label className={f.req ? 'field-req' : ''}>{f.label}</label>
              <select 
                className="ctrl" 
                value={mapping[f.key] || ''}
                onChange={(e) => setImportState({ ...importState, mapping: { ...mapping, [f.key]: e.target.value } })}
              >
                <option value="">— not in file —</option>
                {headers.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        <div className="flex" style={{ alignItems: 'center', gap: '8px', margin: '12px 0' }}>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={replace} 
              onChange={(e) => setImportState({ ...importState, replace: e.target.checked })}
            />
            <span className="slider-tog"></span>
          </label>
          <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Replace existing {kindLabel} rows for this period before importing</span>
        </div>
        
        <div className="panel-head">
          <h3 style={{ fontSize: '13.5px' }}>Preview (first 5 rows)</h3>
          <div className="hint">{fmtNum(rawRows.length)} rows detected in file</div>
        </div>
        
        <div id="previewWrap">
          <DataTable rows={sample} isBooks={target !== 'gstr2b'} isRcm={target === 'rcm'} />
        </div>
        
        <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
          <button className="btn primary" onClick={confirmImport}>
            <Upload size={14} /> Import {fmtNum(rawRows.length)} rows
          </button>
          <button className="btn ghost" onClick={() => setImportState({ headers: [], rawRows: [], mapping: {}, replace: false })}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Import purchase data</h3>
          <div className="hint">Applies to {activeCompany?.name || 'the active company'} · {month} FY{financialYear}</div>
        </div>
      </div>
      
      <div className="tabs">
        <div className={`tab ${target === 'books' ? 'active' : ''}`} onClick={() => setTarget('books')}>Books ITC</div>
        <div className={`tab ${target === 'gstr2b' ? 'active' : ''}`} onClick={() => setTarget('gstr2b')}>2B All Months</div>
        <div className={`tab ${target === 'gstr2b_gov' ? 'active' : ''}`} onClick={() => setTarget('gstr2b_gov')}>2B GOV</div>
        <div className={`tab ${target === 'rcm' ? 'active' : ''}`} onClick={() => setTarget('rcm')}>RCM</div>
        <div className={`tab ${target === 'gstr1' ? 'active' : ''}`} onClick={() => setTarget('gstr1')}>GST R-1</div>
      </div>
      
      {!importState.headers.length && (
        <div className="import-grid">
          <label 
            className="dropzone" 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
          >
            <Upload size={26} style={{ color: 'var(--muted)', marginBottom: '10px' }} />
            <div className="t1">Drop a CSV or Excel file here</div>
            <div className="t2">or click to browse · .csv, .xlsx, .xls</div>
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              style={{ display: 'none' }} 
              onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
            />
          </label>
          <div className="panel" style={{ margin: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>What happens next</div>
            <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--muted)', fontSize: '12.5px', lineHeight: 1.9 }}>
              <li>We read the column headers from your file</li>
              <li>You match each column to the right field</li>
              <li>Preview the first rows before confirming</li>
              <li>Rows are tagged to {month} FY{financialYear} and imported</li>
            </ol>
            <div style={{ marginTop: '12px' }}>
              <button className="btn ghost" onClick={loadSample}>
                <Sparkles size={14} /> Or just load sample data
              </button>
            </div>
          </div>
        </div>
      )}
      
      {importState.headers.length > 0 && renderMapping()}
    </div>
  );
}
