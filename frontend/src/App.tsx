import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminPage from "@/pages/AdminPage";
import { ROUTES } from "@/lib/constants";

export default function App() {
  return (
    <div className="min-h-screen bg-fortress-950">
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.auth} replace />} />
        <Route path={ROUTES.auth} element={<AuthPage />} />
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.admin} element={<AdminPage />} />
        <Route path="*" element={<Navigate to={ROUTES.auth} replace />} />
      </Routes>
    </div>
  );
}
