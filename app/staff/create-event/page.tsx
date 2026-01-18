"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Plus } from "lucide-react";

type Question = {
  id: string;
  text: string;
  type: "TEXT" | "SELECT" | "MULTISELECT";
  options: string[];
  targetRole: "PARTICIPANT" | "VOLUNTEER";
};

type EventFormData = {
  name: string;
  start: string;
  startTime: string;
  end: string;
  endTime: string;
  location: string;
  minTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  questions: Question[];
};

const INITIAL_FORM: EventFormData = {
  name: "",
  start: "",
  startTime: "09:00",
  end: "",
  endTime: "10:00",
  location: "",
  minTier: "BRONZE",
  questions: [],
};

export default function CreateEventPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState<EventFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Check authorization on mount
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "STAFF") {
      router.push("/");
      return;
    }
    setIsAuthorized(true);
    setIsCheckingAuth(false);
  }, [router]);

  const handleInputChange = (
    field: keyof Omit<EventFormData, "questions">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: "TEXT",
      options: [],
      targetRole: "PARTICIPANT",
    };
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    }));
  };

  const deleteQuestion = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const addOption = (questionId: string) => {
    updateQuestion(questionId, {
      options: [...(formData.questions.find((q) => q.id === questionId)?.options || []), ""],
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    updateQuestion(questionId, { options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Event name is required");
      return;
    }
    if (!formData.start) {
      setError("Start date is required");
      return;
    }
    if (!formData.end) {
      setError("End date is required");
      return;
    }
    if (!formData.location.trim()) {
      setError("Location is required");
      return;
    }

    try {
      setLoading(true);

      // Combine date and time into ISO strings
      const startDateTime = `${formData.start}T${formData.startTime}:00`;
      const endDateTime = `${formData.end}T${formData.endTime}:00`;

      const payload = {
        name: formData.name,
        start: new Date(startDateTime).toISOString(),
        end: new Date(endDateTime).toISOString(),
        location: formData.location,
        minTier: formData.minTier,
        questions: formData.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options.filter((o) => o.trim()),
          targetRole: q.targetRole,
        })),
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      // Success - redirect back to staff page
      router.push("/staff");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authorization
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authorized, this shouldn't render (redirected above)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Event Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Event Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Community Park Cleanup"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start}
                    onChange={(e) => handleInputChange("start", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end}
                    onChange={(e) => handleInputChange("end", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Main Hall, Zoom, Central Park"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Loyalty Tier
                </label>
                <select
                  value={formData.minTier}
                  onChange={(e) =>
                    handleInputChange(
                      "minTier",
                      e.target.value as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="BRONZE">Bronze (Everyone)</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Questions for Participants</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add questions that participants will answer when signing up
                </p>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {formData.questions.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No questions added yet. Click "Add Question" to get started.
              </p>
            ) : (
              <div className="space-y-6">
                {formData.questions.map((question) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                            Question Text
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., What is your dietary preference?"
                            value={question.text}
                            onChange={(e) =>
                              updateQuestion(question.id, { text: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                              Question Type
                            </label>
                            <select
                              value={question.type}
                              onChange={(e) =>
                                updateQuestion(question.id, {
                                  type: e.target.value as "TEXT" | "SELECT" | "MULTISELECT",
                                  options:
                                    e.target.value === "TEXT" ? [] : question.options,
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                              <option value="TEXT">Text Input</option>
                              <option value="SELECT">Single Select</option>
                              <option value="MULTISELECT">Multiple Select</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                              Target Role
                            </label>
                            <select
                              value={question.targetRole}
                              onChange={(e) =>
                                updateQuestion(question.id, {
                                  targetRole: e.target.value as "PARTICIPANT" | "VOLUNTEER",
                                })
                              }
                              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                              <option value="PARTICIPANT">Participants</option>
                              <option value="VOLUNTEER">Volunteers</option>
                            </select>
                          </div>
                        </div>

                        {question.type !== "TEXT" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-gray-500 uppercase">
                                Options
                              </label>
                              <button
                                type="button"
                                onClick={() => addOption(question.id)}
                                className="text-xs text-slate-900 hover:text-slate-700 font-semibold"
                              >
                                + Add Option
                              </button>
                            </div>
                            <div className="space-y-2">
                              {question.options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) =>
                                      updateOption(question.id, index, e.target.value)
                                    }
                                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeOption(question.id, index)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <X className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteQuestion(question.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-gray-50 pt-4 pb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
