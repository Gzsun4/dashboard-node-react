import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Savings from './pages/Savings';
import Debts from './pages/Debts';
import Reminders from './pages/Reminders';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminUsers from './pages/AdminUsers';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { DebtProvider } from './context/DebtContext';
import InstallPrompt from './components/InstallPrompt';
import './App.css';
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const touchStart = React.useRef(null);
  const touchEnd = React.useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Swipe Left to Close
    if (isLeftSwipe && isSidebarOpen) {
      closeSidebar();
    }

    // Swipe Right to Open (restricted to left edge region for better UX)
    if (isRightSwipe && !isSidebarOpen && touchStart.current < 150) {
      setIsSidebarOpen(true);
    }
  };

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <CurrencyProvider>
            <DebtProvider>
              <InstallPrompt />
              <div
                className="app-container"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route element={<PrivateRoute />}>
                    <Route element={
                      <>
                        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
                        <main className="main-content">
                          <Outlet context={{ toggleSidebar }} />
                        </main>
                      </>
                    }>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/income" element={<Income />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/savings" element={<Savings />} />
                      <Route path="/debts" element={<Debts />} />
                      <Route path="/reminders" element={<Reminders />} />

                      <Route element={<AdminRoute />}>
                        <Route path="/admin/users" element={<AdminUsers />} />
                      </Route>
                    </Route>
                  </Route>
                </Routes>
              </div>
            </DebtProvider>
          </CurrencyProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
