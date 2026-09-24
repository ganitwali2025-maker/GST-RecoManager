import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Scale, Book, FileText, Landmark,
  ArrowRightLeft, FileBarChart, Upload, Building2, Settings, Banknote,
  ChevronDown, ChevronRight
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', path: '/dashboard', label: 'ITC Dashboard', icon: LayoutDashboard },
  { id: 'liability', path: '/liability', label: 'Liability Dashboard', icon: Scale },
  { id: 'payment', path: '/payment', label: 'Payment Dashboard', icon: Banknote },
  { id: 'reports', path: '/reports', label: 'GST Summary', icon: FileBarChart },
  
  { isHeading: true, label: 'GST RECO STEP' },
  { id: 'reconciliation', path: '/reconciliation', label: 'Final Reconciliation Report', icon: ArrowRightLeft },
  { isHeading: true, label: 'BOOKS RECO' },
  { id: 'books', path: '/books', label: 'Books Reco with 2B', icon: Book },
  { id: 'old-itc', path: '/old-itc', label: 'Old ITC', icon: Book },
  { id: 'itc-not-claimed', path: '/itc-not-claimed', label: 'ITC Not Claimed', icon: Book },
  { isHeading: true, label: 'GSTR-2B' },
  { id: 'gstr2b', path: '/gstr2b', label: '2B All Months', icon: FileText },
  { id: 'gstr2b-gov', path: '/gstr2b-gov', label: '2B GOV', icon: FileText },
  { isHeading: true, label: 'GST & TAX' },
  { id: 'rcmdata', path: '/rcmdata', label: 'RCM', icon: Landmark },
  { id: 'books-itc', path: '/books-itc', label: 'Books ITC', icon: Landmark },
  { id: 'gstr1', path: '/gstr1', label: 'GST R-1', icon: Landmark },

  { isHeading: true, label: 'SETTINGS' },
  { id: 'import', path: '/import', label: 'Import', icon: Upload },
  { id: 'company', path: '/company', label: 'Company / GSTIN', icon: Building2 },
  { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [openGroups, setOpenGroups] = useState({ 
    'books-reco': true, 
    'gstr2b-group': true, 
    'reco-group': true, 
    'gst-tax': false, 
    'reports-group': false 
  });

  const toggleGroup = (id) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside id="sidebar">
      <div className="brand">
        <div>
          <div className="brand-name">GST RecoManager</div>
          <div className="brand-sub">Smart Reconciliation. Accurate ITC. Complete GST Control.</div>
        </div>
      </div>

      <nav className="navlist" id="navlist" style={{ overflowY: 'auto' }}>
        {NAV.map((n, i) => {
          if (n.isHeading) {
            return <div key={'head-'+i} className="nav-group-label">{n.label}</div>;
          }
          if (n.isGroup) {
            const isOpen = openGroups[n.id];
            return (
              <div key={n.id} className="nav-group">
                <div 
                  className="navlink group-toggle" 
                  onClick={() => toggleGroup(n.id)}
                >
                  <div className="navlink-inner">
                    <n.icon size={16} />
                    <span>{n.label}</span>
                  </div>
                  <div className="chevron">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </div>
                {isOpen && (
                  <div className="nav-group-children" style={{ marginLeft: '19px', paddingLeft: '11px', borderLeft: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px', marginBottom: '4px' }}>
                    {n.children.map(child => (
                      <NavLink 
                        key={child.id} 
                        to={child.path} 
                        className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
                        style={{ fontSize: '13px', padding: '7px 10px', height: '32px' }}
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink 
              key={n.id} 
              to={n.path} 
              className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
            >
              <n.icon size={16} />
              <span>{n.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div id="sidebar-foot" style={{ marginTop: 'auto', paddingTop: '12px' }}>
        <div className="foot-row">
          <span>Data stored</span>
          <span>on this device</span>
        </div>
      </div>
    </aside>
  );
}
