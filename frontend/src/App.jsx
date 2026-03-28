import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AddProduct from "./pages/AddProduct";
import ConfirmICP from "./pages/ConfirmICP";
import Dashboard from "./pages/Dashboard";
import CreateCampaign from "./pages/CreateCampaign";
import AgentFeed from "./pages/AgentFeed";
import LeadsPage from "./pages/LeadsPage";
import Inbox from "./pages/Inbox";
import ProductsPage from "./pages/ProductsPage";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<AddProduct />} />
        <Route path="/confirm-icp" element={<ConfirmICP />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campaigns/new" element={<CreateCampaign />} />
        <Route path="/campaigns/:campaignId/feed" element={<AgentFeed />} />
        <Route path="/campaigns/:campaignId/leads" element={<LeadsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
