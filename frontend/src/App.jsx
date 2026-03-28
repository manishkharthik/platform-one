import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ICPSetup from "./pages/ICPSetup";
import AgentFeed from "./pages/AgentFeed";
import LeadDashboard from "./pages/LeadDashboard";
import LeadDetail from "./pages/LeadDetail";
import Integrations from "./pages/Integrations";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ICPSetup />} />
        <Route path="/campaigns/:campaignId/feed" element={<AgentFeed />} />
        <Route path="/campaigns/:campaignId/leads" element={<LeadDashboard />} />
        <Route path="/leads/:leadId" element={<LeadDetail />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
