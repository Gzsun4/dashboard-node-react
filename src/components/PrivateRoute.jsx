import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
    const { token, loading } = useAuth();

    if (loading) {
        return <div className="flex-center w-full h-full p-10"><div className="shimmer w-full max-w-md h-4 rounded"></div></div>;
    }

    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
