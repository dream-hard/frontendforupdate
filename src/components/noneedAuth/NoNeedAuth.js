import { Navigate, useLocation, Outlet } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import { useEffect } from "react";

function NoNeedAuth() {
  const { auth, loading } = useAuth(); // 👈 get loading state
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // 👈 show spinner/skeleton instead of redirecting
  }

  return auth ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
}

export default NoNeedAuth;
