import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const StudyGuides = () => {
  const { backendUrl, userData, enrolledCourses } = useContext(AppContext);
  const [guides, setGuides] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [newGuide, setNewGuide] = useState({
    title: "",
    courseId: "",
    content: "",
    sections: [{ title: "", content: "" }],
    tags: "",
    isPublic: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchGuides = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/study-guides`, {
        withCredentials: true,
      });
      if (data.success) setGuides(data.guides);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createGuide = async () => {
    if (!newGuide.title.trim()) return toast.error("Enter a title");
    try {
      const payload = {
        ...newGuide,
        tags: newGuide.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sections: newGuide.sections.filter((s) => s.title.trim()),
      };
      const { data } = await axios.post(`${backendUrl}/api/user/study-guides`, payload, {
        withCredentials: true,
      });
      if (data.success) {
        setGuides([data.guide, ...guides]);
        setShowAdd(false);
        setNewGuide({ title: "", courseId: "", content: "", sections: [{ title: "", content: "" }], tags: "", isPublic: false });
        toast.success("Study guide created!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteGuide = async (id) => {
    if (!confirm("Delete this study guide?")) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/user/study-guides/${id}`, {
        withCredentials: true,
      });
      if (data.success) {
        setGuides(guides.filter((g) => g._id !== id));
        toast.success("Deleted");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (userData) fetchGuides();
  }, [userData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full pb-20 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Study Guides</h1>
          <p className="text-slate-500 mt-1">Create structured study documents with sections and notes.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Guide
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-slate-900">{guides.length}</p>
          <p className="text-sm text-slate-500">Guides Created</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-emerald-600">
            {guides.filter((g) => g.isPublic).length}
          </p>
          <p className="text-sm text-slate-500">Public Guides</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-blue-600">
            {guides.reduce((acc, g) => acc + (g.sections?.length || 0), 0)}
          </p>
          <p className="text-sm text-slate-500">Total Sections</p>
        </div>
      </div>

      {guides.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No study guides yet</h3>
          <p className="text-slate-400 mb-4">Create your first guide to organize your learning.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guides.map((guide) => (
            <div key={guide._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setShowDetail(guide)} className="text-slate-400 hover:text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  <button onClick={() => deleteGuide(guide._id)} className="text-slate-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{guide.title}</h4>
              <p className="text-sm text-slate-500 mb-2">{guide.sections?.length || 0} sections</p>
              {guide.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {guide.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{new Date(guide.createdAt).toLocaleDateString()}</span>
                {guide.isPublic && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Public</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4">New Study Guide</h3>
            <div className="space-y-3">
              <input
                placeholder="Guide Title"
                value={newGuide.title}
                onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={newGuide.courseId}
                onChange={(e) => setNewGuide({ ...newGuide, courseId: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Standalone (no course)</option>
                {enrolledCourses?.map((c) => (
                  <option key={c._id} value={c._id}>{c.courseTitle}</option>
                ))}
              </select>
              <textarea
                placeholder="Overview / Notes"
                value={newGuide.content}
                onChange={(e) => setNewGuide({ ...newGuide, content: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
              />
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Sections</p>
                {newGuide.sections.map((section, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-3 mb-2 space-y-2">
                    <input
                      placeholder={`Section ${idx + 1} title`}
                      value={section.title}
                      onChange={(e) => {
                        const secs = [...newGuide.sections];
                        secs[idx].title = e.target.value;
                        setNewGuide({ ...newGuide, sections: secs });
                      }}
                      className="w-full bg-white rounded-lg px-3 py-1.5 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <textarea
                      placeholder="Content"
                      value={section.content}
                      onChange={(e) => {
                        const secs = [...newGuide.sections];
                        secs[idx].content = e.target.value;
                        setNewGuide({ ...newGuide, sections: secs });
                      }}
                      className="w-full bg-white rounded-lg px-3 py-1.5 text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[60px]"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setNewGuide({ ...newGuide, sections: [...newGuide.sections, { title: "", content: "" }] })}
                  className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
                >
                  + Add Section
                </button>
              </div>
              <input
                placeholder="Tags (comma separated)"
                value={newGuide.tags}
                onChange={(e) => setNewGuide({ ...newGuide, tags: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={newGuide.isPublic}
                  onChange={(e) => setNewGuide({ ...newGuide, isPublic: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                Make public
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={createGuide} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">Create</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">{showDetail.title}</h3>
              <button onClick={() => setShowDetail(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {showDetail.content && <p className="text-sm text-slate-600 mb-4">{showDetail.content}</p>}
            <div className="space-y-4">
              {showDetail.sections?.map((section, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 mb-2">{section.title}</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGuides;