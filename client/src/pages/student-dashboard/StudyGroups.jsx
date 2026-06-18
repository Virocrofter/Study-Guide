import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import StudyGroupCard from "../../components/student/StudyGroupCard";

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", isPublic: false });
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchGroups();
  }, []);

  const getToken = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/session`, { withCredentials: true });
      return data?.user?.id || null;
    } catch {
      return null;
    }
  };

  const fetchGroups = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await axios.get(`${backendUrl}/api/study-groups`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (data.success) setGroups(data.groups);
    } catch (e) {
      console.error("Study groups error:", e);
      toast.error("Failed to load study groups");
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim()) return toast.error("Group name is required");
    try {
      const token = await getToken();
      if (!token) return toast.error("Please sign in");
      const { data } = await axios.post(`${backendUrl}/api/study-groups`, newGroup, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (data.success) {
        toast.success("Study group created!");
        setGroups((prev) => [data.group, ...prev]);
        setShowCreate(false);
        setNewGroup({ name: "", description: "", isPublic: false });
      }
    } catch (e) {
      toast.error("Failed to create group");
    }
  };

  const joinGroup = async (id) => {
    try {
      const token = await getToken();
      if (!token) return;
      await axios.post(`${backendUrl}/api/study-groups/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success("Joined group!");
      fetchGroups();
    } catch (e) {
      toast.error("Failed to join group");
    }
  };

  const leaveGroup = async (id) => {
    try {
      const token = await getToken();
      if (!token) return;
      await axios.post(`${backendUrl}/api/study-groups/${id}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success("Left group");
      fetchGroups();
    } catch (e) {
      toast.error("Failed to leave group");
    }
  };

  const getUserId = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/session`, { withCredentials: true });
      return data?.user?.id || null;
    } catch {
      return null;
    }
  };

  const [userId, setUserId] = useState(null);
  useEffect(() => {
    getUserId().then(setUserId);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Groups</h1>
          <p className="text-sm text-gray-500 mt-1">Collaborate with peers and share resources</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {showCreate ? "Cancel" : "+ Create Group"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={createGroup} className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Create New Study Group</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Group name"
              value={newGroup.name}
              onChange={(e) => setNewGroup((p) => ({ ...p, name: e.target.value }))}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={newGroup.isPublic}
                onChange={(e) => setNewGroup((p) => ({ ...p, isPublic: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">Public group</label>
            </div>
          </div>
          <textarea
            placeholder="Description (optional)"
            value={newGroup.description}
            onChange={(e) => setNewGroup((p) => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-4 resize-none h-20"
          />
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Create Group
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">👥</p>
          <h3 className="text-lg font-medium text-gray-800">No study groups yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create one to start collaborating with peers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <StudyGroupCard
              key={group._id}
              group={group}
              isMember={group.members?.some((m) => m.userId === userId) || group.creatorId === userId}
              onJoin={joinGroup}
              onLeave={leaveGroup}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyGroups;