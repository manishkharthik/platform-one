const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const json = (r) => r.json();

export const api = {
  // Documents / ICP extraction
  analyzeDocuments: (files, description) => {
    const fd = new FormData();
    if (files) files.forEach((f) => fd.append("files", f));
    if (description) fd.append("description", description);
    return fetch(`${BASE}/api/documents/analyze`, { method: "POST", body: fd }).then(json);
  },

  // Products
  createProduct: (data) =>
    fetch(`${BASE}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(json),
  getProduct: (id) => fetch(`${BASE}/api/products/${id}`).then(json),
  listProducts: () => fetch(`${BASE}/api/products`).then(json),

  // Campaigns
  createCampaign: (data) =>
    fetch(`${BASE}/api/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(json),
  listCampaigns: (productId) =>
    fetch(`${BASE}/api/campaigns${productId ? `?product_id=${productId}` : ""}`).then(json),
  getCampaign: (id) => fetch(`${BASE}/api/campaigns/${id}`).then(json),
  runCampaign: (id) =>
    fetch(`${BASE}/api/campaigns/${id}/run`, { method: "POST" }).then(json),
  generateEmail: (data) =>
    fetch(`${BASE}/api/campaigns/generate-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(json),
  chatWithLeads: (campaignId, message, tableState) =>
    fetch(`${BASE}/api/campaigns/${campaignId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, table_state: tableState }),
    }).then(json),
  exportCSV: (campaignId) => `${BASE}/api/campaigns/${campaignId}/export`,
  streamEvents: (campaignId) =>
    new EventSource(`${BASE}/api/campaigns/${campaignId}/stream`),

  // Leads
  getLeads: (campaignId) => fetch(`${BASE}/api/campaigns/${campaignId}/leads`).then(json),
  getLead: (id) => fetch(`${BASE}/api/leads/${id}`).then(json),
  updateStatus: (id, status) =>
    fetch(`${BASE}/api/leads/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(json),
  approveEmail: (leadId) =>
    fetch(`${BASE}/api/leads/${leadId}/approve`, { method: "POST" }).then(json),
  sendEmail: (leadId) =>
    fetch(`${BASE}/api/leads/${leadId}/send`, { method: "POST" }).then(json),
  simulateOpen: (leadId) =>
    fetch(`${BASE}/api/leads/${leadId}/simulate-open`, { method: "POST" }).then(json),
  simulateClick: (leadId) =>
    fetch(`${BASE}/api/leads/${leadId}/simulate-click`, { method: "POST" }).then(json),
  simulateReply: (leadId) =>
    fetch(`${BASE}/api/leads/${leadId}/simulate-reply`, { method: "POST" }).then(json),
  regenerateEmail: (id) =>
    fetch(`${BASE}/api/leads/${id}/regenerate`, { method: "POST" }).then(json),

  // Inbox
  getInbox: () => fetch(`${BASE}/api/inbox`).then(json),
};
