import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import BottomNavigation from './components/BottomNavigation';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Planning from './pages/Planning';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminUsers from './pages/AdminUsers';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { DebtProvider } from './context/DebtContext';
import { TransactionProvider } from './context/TransactionContext';
import InstallPrompt from './components/InstallPrompt';
import './App.css';

function App() {

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <CurrencyProvider>
            <TransactionProvider>
              <DebtProvider>
                <InstallPrompt />
                <div className="app-container">
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route element={<PrivateRoute />}>
                      {/* 
                           Layout Wrapper for Authenticated Routes 
                           Integrates BottomNavigation and Main Content Area
                       */}
                      <Route element={
                        <>
                          <main className="main-content pb-24">
                            {/* pb-24 adds padding bottom to prevent content being hidden behind bottom nav */}
                            <Outlet />
                          </main>
                          <BottomNavigation />
                        </>
                      }>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/activity" element={<Activity />} />
                        <Route path="/planning" element={<Planning />} />
                        <Route path="/settings" element={<Settings />} />

                        {/* Admin Route - Can be kept accessible seamlessly or moved to settings */}
                        <Route element={<AdminRoute />}>
                          <Route path="/admin/users" element={<AdminUsers />} />
                        </Route>
                      </Route>
                    </Route>
                  </Routes>
                </div>
              </DebtProvider>
            </TransactionProvider>
          </CurrencyProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
