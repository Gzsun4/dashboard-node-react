import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
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
  // 🔒 BLOQUEO GESTUAL (IOS/ANDROID) - "Nuclear Option"
  React.useEffect(() => {
    console.log("App Version: 1.2.0 - Budgets Included");
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);

      // Si el movimiento es estrictamente horizontal (más lateral que vertical)
      if (deltaX > deltaY && deltaX > 5) {
        if (e.cancelable) {
          e.preventDefault(); // Detiene el Swipe Back del navegador
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const touchStart = React.useRef(null);
  const touchEnd = React.useRef(null);
  const sidebarRef = React.useRef(null); // Ref for direct DOM manipulation

  const toggleSidebar = () => {
    // Blur any focused element (buttons, inputs) when sidebar opens
    // Multiple attempts to ensure blur happens
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }

    setIsSidebarOpen(prev => {
      const newState = !prev;
      // Delayed blur to ensure it happens after state update
      if (newState) {
        setTimeout(() => {
          if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
          }
        }, 10);
      }
      return newState;
    });
  };

  const closeSidebar = () => {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    setIsSidebarOpen(false);
  };

  // Thresholds
  const minSwipeDistance = 50;
  const sidebarWidth = 280;

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
    // Prepare for potential drag: disable transition
    if (sidebarRef.current) {
      sidebarRef.current.style.transition = 'none';
    }
  };

  const onTouchMove = (e) => {
    const currentX = e.targetTouches[0].clientX;
    touchEnd.current = currentX;

    if (!touchStart.current || !sidebarRef.current) return;
    const diff = currentX - touchStart.current;

    // Direct DOM manipulation for performance (no state updates here)
    if (!isSidebarOpen) {
      if (touchStart.current < 50 && diff > 0) {
        const newPos = Math.min(0, Math.max(-sidebarWidth, -sidebarWidth + diff));
        sidebarRef.current.style.transform = `translateX(${newPos}px)`;
      }
    } else {
      if (diff < 0) {
        const newPos = Math.min(0, Math.max(-sidebarWidth, diff));
        sidebarRef.current.style.transform = `translateX(${newPos}px)`;
      }
    }
  };

  const onTouchEnd = () => {
    // Reset transition to enable smooth snap
    if (sidebarRef.current) {
      sidebarRef.current.style.transform = ''; // Clear inline transform to let CSS class take over
      sidebarRef.current.style.transition = ''; // Restore CSS transition
    }

    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && isSidebarOpen) {
      closeSidebar();
    }
    if (isRightSwipe && !isSidebarOpen && touchStart.current < 50) {
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
                        <Sidebar ref={sidebarRef} isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
                        <main className="main-content">
                          <Outlet context={{ toggleSidebar }} />
                        </main>
                      </>
                    }>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/income" element={<Income />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/budgets" element={<Budgets />} />
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
