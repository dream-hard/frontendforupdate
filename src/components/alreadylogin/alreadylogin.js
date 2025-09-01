// src/components/PublicRoute.js
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
export default function Alreadylogin({ children }) {
  const { auth } = useAuth();
  if (auth) {
    return <Navigate to="/profile" replace />;
  }
  return <Outlet/>;
}
