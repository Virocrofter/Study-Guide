import React from "react";

const topThree = [
  { rank: 2, name: "Enola Holmes", school: "Westville Girl's High School", score: 950, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Enola" },
  { rank: 1, name: "Jame Bond", school: "Westville Boy's High School", score: 1724, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", crown: true },
  { rank: 3, name: "Vika Zide", school: "Glenwood High School", score: 730, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vika" },
];

const rest = [
  { rank: 4, name: "Daywane Johnson", school: "Kloof High School", score: 630 },
  { rank: 5, name: "Vincent Armstrong", school: "Kimberley Boys High", score: 500 },
  { rank: 6, name: "Sarah Chen", school: "Hilton College", score: 480 },
  { rank: 7, name: "Mike Ross", school: "Durban High School", score: 420 },
];

const rankBadge = (rank) => {
  if (rank === 1) return "bg-yellow-400 text-yellow-900";
  if (rank === 2) return "bg-slate-300 text-slate-800";
  if (rank === 3) return "bg-orange-300 text-orange-900";
  return "bg-[#c4a8d4] text-[#6b4c7a]";
};

const podiumOrder = [1, 0, 2]; // center, left, right

const HallOfFame = () => {
  const maxScore = Math.max(...topThree.map((t) => t.score));

  return (
    <div className="h-full pb-20 max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-6 h-6 text-[#6b4c7a]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h1 className="text-2xl font-bold text-[#6b4c7a]">LeaderBoard</h1>
      </div>
      <p className="text-sm text-slate-500 mb-8">Matrix Top 5</p>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-10">
        {podiumOrder.map((idx) => {
          const user = topThree[idx];
          const heightClass = idx === 1 ? "h-56" : idx === 0 ? "h-44" : "h-36";
          const bgClass = idx === 1 ? "bg-yellow-100 border-yellow-300" : idx === 0 ? "bg-slate-100 border-slate-300" : "bg-orange-100 border-orange-300";

          return (
            <div
              key={user.rank}
              className={`relative ${heightClass} w-36 rounded-2xl border-2 ${bgClass} flex flex-col items-center justify-end p-4 shadow-sm`}
            >
              {user.crown && (
                <div className="absolute -top-6 text-3xl">👑</div>
              )}
              <div className="absolute -top-3 w-7 h-7 rounded-full bg-white border-2 border-current flex items-center justify-center text-xs font-bold shadow-sm"
                style={{ borderColor: idx === 1 ? "#facc15" : idx === 0 ? "#94a3b8" : "#fdba74" }}
              >
                {user.rank}
              </div>
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-full bg-white border-2 border-white shadow mb-2"
              />
              <p className="text-xs font-bold text-slate-700 text-center leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 text-center mb-1">{user.school}</p>
              <p className={`text-lg font-black ${idx === 1 ? "text-yellow-700" : idx === 0 ? "text-slate-700" : "text-orange-700"}`}>
                {user.score.toLocaleString()} pts
              </p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">#</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Learner</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">School</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rest.map((user) => (
              <tr key={user.rank} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${rankBadge(user.rank)}`}>
                    {user.rank}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium text-slate-800">{user.name}</td>
                <td className="px-5 py-3 text-slate-500">{user.school}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-bold text-slate-700">{user.score}</span>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#c4a8d4] rounded-full"
                        style={{ width: `${(user.score / maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HallOfFame;