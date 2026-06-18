import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import StudyCalendar from "../../components/student/StudyCalendar";

const StudyCalendarPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", startTime: "", endTime: "", type: "review" });
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSelectSession = (sessions) => {
    // Could show a day detail modal here
    console.log(sessions);
  };

  const createSession = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startTime || !form.endTime) {
      return toast.error("Please fill all required fields");
    }
    try {
      const token = await fetch("/api/auth/session").then((r) => r.json()).then((s) => s?.token);
      const { data } = await axios.post(`${backendUrl}/api/study-sessions`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success("Study session scheduled!");
        setShowModal(false);
        setForm({ title: "", description: "", startTime: "", endTime: "", type: "review" });
      }
    } catch (e) {
      toast.error("Failed to schedule session");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Plan and track your study sessions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Schedule Session
        </button>
      </div>

      <StudyCalendar onSelectSession={handleSelectSession} />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Schedule Study Session</h3>
            <form onSubmit={createSession} className="space-y-4">
              <input
                type="text"
                placeholder="Session title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none h-20"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start</label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="review">Review</option>
                  <option value="practice">Practice</option>
                  <option value="quiz">Quiz</option>
                  <option value="group_study">Group Study</option>
                  <option value="deep_work">Deep Work</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyCalendarPage;
