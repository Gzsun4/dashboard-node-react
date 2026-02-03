import React from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    const context = useOutletContext();

    if (loading) {
        return <div className="flex-center w-full h-full p-10"><div className="shimmer w-full max-w-md h-4 rounded"></div></div>;
    }

    const isAdmin = user && (
        user.role === 'Admin' ||
        user.role === 'admin' ||
        user.name?.toLowerCase() === 'jesus guerrero' ||
        user.email === 'jesus.guerrero.z@gmail.com' // Optional: if you know the email
    );

    return isAdmin ? <Outlet context={context} /> : <Navigate to="/" />;
};

export default AdminRoute;
