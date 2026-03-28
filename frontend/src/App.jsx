import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AddProduct from "./pages/AddProduct";
import ConfirmICP from "./pages/ConfirmICP";
import Dashboard from "./pages/Dashboard";
import CreateCampaign from "./pages/CreateCampaign";
import AgentFeed from "./pages/AgentFeed";
import LeadsPage from "./pages/LeadsPage";
import Inbox from "./pages/Inbox";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AddProduct />} />
        <Route path="/confirm-icp" element={<ConfirmICP />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campaigns/new" element={<CreateCampaign />} />
        <Route path="/campaigns/:campaignId/feed" element={<AgentFeed />} />
        <Route path="/campaigns/:campaignId/leads" element={<LeadsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
