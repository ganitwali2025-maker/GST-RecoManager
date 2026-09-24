import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { ToastProvider } from './components/Toast';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import Liability from './pages/Liability';
import BooksPurchase from './pages/BooksPurchase';
import GSTR2B from './pages/GSTR2B';
import RcmData from './pages/RcmData';
import Reconciliation from './pages/Reconciliation';
import Reports from './pages/Reports';
import Import from './pages/Import';
import Company from './pages/Company';
import Settings from './pages/Settings';
import Payment from './pages/Payment';
import GenericTablePage from './pages/GenericTablePage';

import Introduction from './pages/auth/Introduction';
import SecureAccess from './pages/auth/SecureAccess';
import Login from './pages/auth/Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="auth-page"><div className="auth-title">Loading workspace...</div></div>;
  }
  
  if (!user) {
    return <Navigate to="/intro" replace />;
  }
  
  return children;
}

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div id="shell" className={sidebarOpen ? '' : 'sidebar-closed'}>
      <Sidebar />
      <div id="main-col">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main id="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/liability" element={<Liability />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/books" element={<BooksPurchase />} />
            <Route path="/old-itc" element={<GenericTablePage title="Old ITC" type="books" hint="Legacy ITC data" />} />
            <Route path="/itc-not-claimed" element={<GenericTablePage title="ITC Not Claimed" type="books" hint="Unclaimed ITC rows" />} />
            
            <Route path="/gstr2b" element={<GSTR2B />} />
            <Route path="/gstr2b-gov" element={<GenericTablePage title="2B GOV" type="g2b" hint="Government 2B data" />} />
            
            <Route path="/reconciliation" element={<Reconciliation />} />
            <Route path="/unmatch-gst" element={<GenericTablePage title="Unmatch GST" type="books" hint="Unmatched records" />} />
            
            <Route path="/rcmdata" element={<RcmData />} />
            <Route path="/books-itc" element={<GenericTablePage title="Books ITC" type="books" hint="ITC from books" />} />
            <Route path="/gstr1" element={<GenericTablePage title="GST R-1" type="books" hint="GSTR-1 data" />} />
            
            <Route path="/reports" element={<Reports />} />
            <Route path="/reco-report" element={<GenericTablePage title="Reconciliation Report" type="books" hint="Detailed reco report" />} />
            <Route path="/itc-report" element={<GenericTablePage title="ITC Report" type="books" hint="Comprehensive ITC report" />} />
            
            <Route path="/import" element={<Import />} />
            <Route path="/company" element={<Company />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/intro" element={<Introduction />} />
              <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
