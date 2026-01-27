import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminUsers from './pages/AdminUsers';
import AdminRoute from './components/AdminRoute';

// ... (inside the component)

<Route element={<PrivateRoute />}>
  <Route element={
    <>
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  }>
    <Route path="/" element={<Dashboard />} />
    <Route path="/income" element={<Income />} />
    <Route path="/expenses" element={<Expenses />} />
    <Route path="/savings" element={<Savings />} />

    <Route element={<AdminRoute />}>
      <Route path="/admin/users" element={<AdminUsers />} />
    </Route>
  </Route>
</Route>

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<PrivateRoute />}>
              <Route element={
                <>
                  <Sidebar />
                  <main className="main-content">
                    <Outlet />
                  </main>
                </>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/income" element={<Income />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/savings" element={<Savings />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
