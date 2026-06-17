import React, { useState, useEffect } from "react";
import axios from "axios";
import LeaderboardTable from "../../components/student/LeaderboardTable";
import { GamificationProgress } from "../../components/student/GamificationBadge";
import { GamificationBadge } from "../../components/student/GamificationBadge";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("points"); // points | badges
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await fetch("/api/auth/session").then((r) => r.json()).then((s) => s?.token);
      const [lbRes, achRes] = await Promise.all([
        axios.get(`${backendUrl}/api/achievements/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/achievements`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (lbRes.data.success) setLeaderboard(lbRes.data.leaderboard);
      if (achRes.data.success) {
        setAchievements(achRes.data.achievements);
        setTotalPoints(achRes.data.totalPoints);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const userId = "current-user"; // Replace with actual auth

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leaderboard</h1>
        <p className="text-sm text-gray-500 mt-1">See how you rank against other students</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
            🏆
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">Your Progress</h2>
            <GamificationProgress totalPoints={totalPoints} nextMilestone={1000} />
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{totalPoints}</div>
            <div className="text-xs text-gray-500">total points</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {achievements.slice(0, 6).map((a) => (
            <GamificationBadge key={a._id} badge={a.badge} size="sm" />
          ))}
          {achievements.length > 6 && (
            <span className="text-xs text-gray-400 self-center">+{achievements.length - 6} more</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: "points", label: "By Points" },
          { key: "badges", label: "By Badges" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <LeaderboardTable
          data={leaderboard}
          currentUserId={userId}
          type={tab}
        />
      )}
    </div>
  );
};

export default Leaderboard;