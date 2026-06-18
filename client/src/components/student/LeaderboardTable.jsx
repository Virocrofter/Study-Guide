import React from "react";

const LeaderboardTable = ({ data, currentUserId, type = "points" }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No leaderboard data yet. Start studying to appear here!</div>;
  }

  const getRankStyle = (index) => {
    if (index === 0) return "bg-yellow-50 border-yellow-200";
    if (index === 1) return "bg-gray-50 border-gray-200";
    if (index === 2) return "bg-orange-50 border-orange-200";
    return "bg-white border-gray-100";
  };

  const getRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {type === "points" ? "Points" : "Badges"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((entry, index) => (
              <tr
                key={entry._id || index}
                className={`${getRankStyle(index)} ${entry._id === currentUserId ? "ring-2 ring-blue-200 ring-inset" : ""} transition-colors hover:bg-opacity-80`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-lg font-bold">{getRankIcon(index)}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                      {entry._id?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {entry._id === currentUserId ? "You" : `User ${entry._id?.slice(-6)}`}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {type === "points" ? entry.totalPoints : entry.badges}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;