import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import LeaderboardTable from "../../components/student/LeaderboardTable";

const Leaderboard = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await axios.get(
          `${backendUrl}/api/achievements/leaderboard`,
          { withCredentials: true }
        );
        if (res.success) setData(res.leaderboard);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full pb-20 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-slate-500 mt-1">Top learners by achievement points.</p>
      </div>
      <LeaderboardTable data={data} currentUserId={userData?._id} type="points" />
    </div>
  );
};

export default Leaderboard;