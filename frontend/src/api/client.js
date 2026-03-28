const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${BASE}/api/documents/upload`, {
      method: "POST",
      body: formData,
    }).then((r) => r.json());
  },


  createCampaign: (data) =>
    fetch(`${BASE}/api/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  runCampaign: (id) =>
    fetch(`${BASE}/api/campaigns/${id}/run`, { method: "POST" }).then((r) => r.json()),

  getCampaign: (id) => fetch(`${BASE}/api/campaigns/${id}`).then((r) => r.json()),

  getLeads: (campaignId) =>
    fetch(`${BASE}/api/campaigns/${campaignId}/leads`).then((r) => r.json()),

  getLead: (id) => fetch(`${BASE}/api/leads/${id}`).then((r) => r.json()),

  updateStatus: (id, status) =>
    fetch(`${BASE}/api/leads/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then((r) => r.json()),

  regenerateEmail: (id) =>
    fetch(`${BASE}/api/leads/${id}/regenerate`, { method: "POST" }).then((r) => r.json()),

  exportCSV: (campaignId) => `${BASE}/api/campaigns/${campaignId}/export`,

  streamEvents: (campaignId) =>
    new EventSource(`${BASE}/api/campaigns/${campaignId}/stream`),
};
