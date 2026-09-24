import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function EmptyState({ icon, title, sub }) {
  const navigate = useNavigate();
  const { loadSample } = useAppContext();

  return (
    <div className="panel empty-state">
      {icon}
      <div className="t1">{title}</div>
      <div>{sub}</div>
      <div style={{ marginTop: '18px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={() => navigate('/import')}>
          <Upload size={14} /> Import data
        </button>
        <button className="btn ghost" onClick={loadSample}>
          <Sparkles size={14} /> Load sample data
        </button>
      </div>
    </div>
  );
}
