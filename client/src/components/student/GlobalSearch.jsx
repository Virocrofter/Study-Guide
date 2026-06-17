import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim().length > 1) performSearch();
      else setResults([]);
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async () => {
    setLoading(true);
    try {
      const token = await fetch("/api/auth/session").then((r) => r.json()).then((s) => s?.token);
      const { data } = await axios.get(`${backendUrl}/api/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setResults(data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRoute = (type, id) => {
    const routes = {
      course: `/course/${id}`,
      flashcard: "/dashboard/flashcards",
      studyguide: "/dashboard/study-guides",
      material: "/dashboard/library",
      quiz: "/dashboard/practice-tests",
    };
    return routes[type] || "/";
  };

  const getIcon = (type) => {
    const icons = { course: "📚", flashcard: "🗂️", studyguide: "📖", material: "📎", quiz: "📝" };
    return icons[type] || "🔍";
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search courses, flashcards, guides..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {loading && (
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {results.map((r) => (
            <div
              key={r._id}
              onClick={() => { navigate(getRoute(r.entityType, r.entityId)); setOpen(false); setQuery(""); }}
              className="px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3"
            >
              <span className="text-lg">{getIcon(r.entityType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.description}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 capitalize">
                  {r.entityType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;