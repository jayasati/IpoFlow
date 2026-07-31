import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth } from "./features/auth/RequireAuth";
import { AnalysisPage } from "./pages/Analysis/AnalysisPage";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { IpoDetailPage } from "./pages/Ipos/IpoDetailPage";
import { IposPage } from "./pages/Ipos/IposPage";
import { LoginPage } from "./pages/Login/LoginPage";
import { MemberDetailsPage } from "./pages/Members/MemberDetailsPage";
import { MembersPage } from "./pages/Members/MembersPage";
import { MyAccountPage } from "./pages/MyAccount/MyAccountPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:id" element={<MemberDetailsPage />} />
          <Route path="/ipos" element={<IposPage />} />
          <Route path="/ipos/:id" element={<IpoDetailPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/my-account" element={<MyAccountPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
