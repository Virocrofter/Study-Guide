import React from "react";
import { useNavigate } from "react-router-dom";

const StudyGroupCard = ({ group, onJoin, onLeave, isMember }) => {
  const navigate = useNavigate();
  const memberCount = group.members?.length || 0;
  const messageCount = group.messages?.length || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
            {group.name?.charAt(0)?.toUpperCase() || "G"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{group.name}</h3>
            <p className="text-xs text-gray-500">{group.isPublic ? "🌐 Public" : "🔒 Private"} Group</p>
          </div>
        </div>
        {group.courseId && (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600">Course Linked</span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description || "No description provided."}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {memberCount} members
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          {messageCount} messages
        </span>
      </div>

      <div className="flex gap-2">
        {isMember ? (
          <>
            <button
              onClick={() => navigate(`/dashboard/study-groups/${group._id}`)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Open Chat
            </button>
            <button
              onClick={() => onLeave(group._id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Leave
            </button>
          </>
        ) : (
          <button
            onClick={() => onJoin(group._id)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Join Group
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyGroupCard;