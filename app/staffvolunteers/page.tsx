"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Menu, Plus, X, Eye, EyeOff, Edit2 } from "lucide-react";
import Sidebar from "../staff/sidebar";
import UserDropdown from "../components/UserDropdown";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  tier?: string;
}

export default function StaffVolunteersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "VOLUNTEER",
    tier: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users?role=VOLUNTEER");
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data);
      }
    } catch (err) {
      console.error("Error fetching volunteers:", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (volunteerId: string) => {
    setRevealedPasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(volunteerId)) {
        newSet.delete(volunteerId);
      } else {
        newSet.add(volunteerId);
      }
      return newSet;
    });
  };

  const filteredVolunteers = volunteers.filter((volunteer) =>
    volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "VOLUNTEER",
        }),
      });

      if (response.ok) {
        setSuccess("Volunteer added successfully!");
        setFormData({ name: "", email: "", password: "" });
        setShowAddModal(false);
        fetchVolunteers();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add volunteer");
      }
    } catch (err) {
      setError("Error adding volunteer");
      console.error(err);
    }
  };

  const openEditModal = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setEditFormData({
      name: volunteer.name,
      email: volunteer.email,
      password: volunteer.password || "",
      role: volunteer.role,
      tier: volunteer.tier || "",
    });
    setEditError("");
    setEditSuccess("");
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolunteer) return;

    setEditError("");
    setEditSuccess("");

    if (!editFormData.name || !editFormData.email) {
      setEditError("Name and email are required");
      return;
    }

    try {
      const response = await fetch(`/api/users/${editingVolunteer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setVolunteers(
          volunteers.map((vol) =>
            vol.id === editingVolunteer.id ? updatedUser : vol
          )
        );
        setEditSuccess("Volunteer updated successfully!");
        setTimeout(() => {
          setShowEditModal(false);
          setEditingVolunteer(null);
        }, 1500);
      } else {
        const data = await response.json();
        setEditError(data.error || "Failed to update volunteer");
      }
    } catch (err) {
      setEditError("Error updating volunteer");
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        categories={[]}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Volunteer Directory</h1>
            </div>
            <UserDropdown
              userName="Admin"
              userRole="ADMIN"
            />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Current Volunteers
                    </h2>
                    <p className="text-sm text-gray-500">
                      {loading ? "Loading..." : `${volunteers.length} volunteer(s) registered`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-semibold">Add Volunteer</span>
                </button>
              </div>

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 mb-4">
                <input
                  type="text"
                  placeholder="Search volunteers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div className="mt-6 overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading volunteers...</div>
                ) : volunteers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No volunteers yet. Add one to get started!</div>
                ) : filteredVolunteers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No volunteers found matching your search.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-400">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Password</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Tier</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVolunteers.map((volunteer) => (
                        <tr key={volunteer.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-3 font-semibold text-gray-900">
                            {volunteer.name}
                          </td>
                          <td className="py-3 text-gray-600">{volunteer.email}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-gray-600">
                                {revealedPasswords.has(volunteer.id)
                                  ? volunteer.password || "••••••••"
                                  : "••••••••"}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(volunteer.id)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title={
                                  revealedPasswords.has(volunteer.id)
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {revealedPasswords.has(volunteer.id) ? (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 text-gray-600">{volunteer.role}</td>
                          <td className="py-3">
                            <span className="text-gray-600 text-xs font-medium">
                              {volunteer.tier ? (
                                <span className="px-2 py-1 rounded-full bg-gray-100">
                                  {volunteer.tier}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </span>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => openEditModal(volunteer)}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Edit volunteer"
                            >
                              <Edit2 className="w-4 h-4 text-slate-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Add Volunteer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-950">Add New Volunteer</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVolunteer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-gray-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-gray-900"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-gray-900"
                  placeholder="Enter password"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Add Volunteer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Volunteer Modal */}
      {showEditModal && editingVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-950">Edit Volunteer</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {editSuccess}
              </div>
            )}

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-gray-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-gray-900"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-gray-900"
                  placeholder="Leave empty to keep current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Loyalty Tier
                </label>
                <select
                  value={editFormData.tier}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, tier: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-gray-900"
                >
                  <option value="">None</option>
                  <option value="BRONZE">Bronze</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
