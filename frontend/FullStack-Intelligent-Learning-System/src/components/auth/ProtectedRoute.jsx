import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
// ADD THE IMPORT BELOW (Double-check the path to your AuthContext)
import { useAuth } from "../../context/AuthContext";

let ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-2">
                    {/* A simple CSS spinner */}
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Verifying session...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? (
        <AppLayout>
            <Outlet />
        </AppLayout>
    ) : (
        <Navigate to="/login" replace />
    );
};

export default ProtectedRoute;