import React, { useState, useEffect } from "react";
import axios from "axios";

const StudyCalendar = ({ onSelectSession }) => {
  const [sessions, setSessions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchSessions();
  }, [currentDate]);

  const fetchSessions = async () => {
    try {
      const token = await fetch("/api/auth/session").then((r) => r.json()).then((s) => s?.token);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1).toISOString();
      const end = new Date(year, month + 1, 0).toISOString();
      const { data } = await axios.get(`${backendUrl}/api/study-sessions?start=${start}&end=${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setSessions(data.sessions);
    } catch (e) {
      console.error(e);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getSessionsForDay = (day) => {
    const dateStr = new Date(year, month, day).toDateString();
    return sessions.filter((s) => new Date(s.startTime).toDateString() === dateStr);
  };

  const getTypeColor = (type) => {
    const colors = {
      review: "bg-blue-400", practice: "bg-green-400", quiz: "bg-purple-400",
      group_study: "bg-orange-400", deep_work: "bg-red-400",
    };
    return colors[type] || "bg-gray-400";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">{monthNames[month]} {year}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-24 rounded-lg" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, day) => {
          const dayNum = day + 1;
          const daySessions = getSessionsForDay(dayNum);
          const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();
          return (
            <div
              key={dayNum}
              onClick={() => daySessions.length && onSelectSession?.(daySessions)}
              className={`h-24 rounded-lg border border-gray-100 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${isToday ? "bg-blue-50 border-blue-200" : ""}`}
            >
              <div className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-700"}`}>{dayNum}</div>
              <div className="flex flex-col gap-0.5 mt-1">
                {daySessions.slice(0, 3).map((s, i) => (
                  <div key={i} className={`h-1.5 rounded-full ${getTypeColor(s.type)}`} title={s.title} />
                ))}
                {daySessions.length > 3 && (
                  <span className="text-xs text-gray-400">+{daySessions.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4 text-xs">
        {Object.entries({ review: "Review", practice: "Practice", quiz: "Quiz", group_study: "Group", deep_work: "Deep Work" }).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${getTypeColor(key)}`} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyCalendar;