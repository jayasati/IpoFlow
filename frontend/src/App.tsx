import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { IpoDetailPage } from "./pages/Ipos/IpoDetailPage";
import { IposPage } from "./pages/Ipos/IposPage";
import { MemberDetailsPage } from "./pages/Members/MemberDetailsPage";
import { MembersPage } from "./pages/Members/MembersPage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/:id" element={<MemberDetailsPage />} />
        <Route path="/ipos" element={<IposPage />} />
        <Route path="/ipos/:id" element={<IpoDetailPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
