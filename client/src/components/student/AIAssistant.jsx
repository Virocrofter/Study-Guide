import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const AIAssistant = () => {
  const { backendUrl } = useContext(AppContext);
  const [text, setText] = useState("");
  const [mode, setMode] = useState("flashcards"); // flashcards | studyguide | practicetest
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!text.trim() || text.length < 50) {
      toast.error("Please enter at least 50 characters of study material.");
      return;
    }
    setLoading(true);
    try {
      const endpoints = {
        flashcards: "/api/ai/flashcards",
        studyguide: "/api/ai/study-guide",
        practicetest: "/api/ai/practice-test",
      };
      const { data } = await axios.post(
        `${backendUrl}${endpoints[mode]}`,
        { text },
        { withCredentials: true }
      );
      if (data.success) {
        setResult(data);
        toast.success(`Generated ${data.generated || "content"} successfully!`);
      }
    } catch (e) {
      toast.error("Generation failed. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl">
            🤖
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI Study Assistant</h2>
            <p className="text-sm text-gray-500">Paste your notes and let AI generate study materials</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { key: "flashcards", label: "Flashcards", icon: "🗂️" },
            { key: "studyguide", label: "Study Guide", icon: "📖" },
            { key: "practicetest", label: "Practice Test", icon: "📝" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your lecture notes, textbook chapter, or any study material here..."
          className="w-full h-48 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-400">{text.length} characters</span>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <span>✨</span> Generate {mode === "flashcards" ? "Flashcards" : mode === "studyguide" ? "Study Guide" : "Practice Test"}
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
              <span>✅</span> Successfully generated!
            </div>
            <p className="text-sm text-green-700">
              Your {mode} has been saved to your dashboard. Go check it out!
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setResult(null)}
                className="px-3 py-1.5 text-sm bg-white border border-green-300 rounded-lg text-green-700 hover:bg-green-50"
              >
                Generate More
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;