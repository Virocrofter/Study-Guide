import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const EducatorMaterials = () => {
  const { backendUrl, isEducator } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    type: "file",
    url: "",
    fileName: "",
    duration: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        withCredentials: true,
      });
      if (data.success) {
        setCourses(data.courses);
        if (data.courses.length > 0) setSelectedCourse(data.courses[0]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    if (!selectedCourse) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/educator/materials/${selectedCourse._id}`,
        { withCredentials: true }
      );
      if (data.success) setMaterials(data.materials);
    } catch (err) {
      console.error(err);
    }
  };

  const addMaterial = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/educator/materials/${selectedCourse._id}`,
        newMaterial,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Material added!");
        setMaterials([data.material, ...materials]);
        setShowAdd(false);
        setNewMaterial({ title: "", type: "file", url: "", fileName: "", duration: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteMaterial = async (materialId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/materials/${materialId}`,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Deleted");
        setMaterials(materials.filter((m) => m._id !== materialId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (isEducator) fetchCourses();
  }, [isEducator]);

  useEffect(() => {
    fetchMaterials();
  }, [selectedCourse]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const typeColors = {
    file: "bg-blue-100 text-blue-700",
    video: "bg-red-100 text-red-700",
    audio: "bg-green-100 text-green-700",
  };

  return (
    <div className="h-screen flex flex-col md:p-8 p-4 pt-8 bg-slate-50 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Course Materials</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Material
        </button>
      </div>

      {/* Course Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {courses.map((course) => (
          <button
            key={course._id}
            onClick={() => setSelectedCourse(course)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCourse?._id === course._id
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {course.courseTitle}
          </button>
        ))}
      </div>

      {/* Add Material Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Add New Material</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Title</label>
              <input
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Lecture Notes PDF"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Type</label>
              <select
                value={newMaterial.type}
                onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="file">File (PDF, DOC, etc)</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600 mb-1 block">URL</label>
              <input
                value={newMaterial.url}
                onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">File Name (optional)</label>
              <input
                value={newMaterial.fileName}
                onChange={(e) => setNewMaterial({ ...newMaterial, fileName: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="notes.pdf"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Duration (optional)</label>
              <input
                value={newMaterial.duration}
                onChange={(e) => setNewMaterial({ ...newMaterial, duration: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="14:28"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addMaterial} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Save Material
            </button>
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Materials List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material) => (
          <div key={material._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[material.type]}`}>
                {material.type.toUpperCase()}
              </span>
              <button
                onClick={() => deleteMaterial(material._id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{material.title}</h4>
            <p className="text-xs text-slate-500 mb-3">{material.fileName || "No filename"}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {material.duration && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {material.duration}
                </span>
              )}
              <span>{new Date(material.createdAt).toLocaleDateString()}</span>
            </div>
            <a
              href={material.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block w-full text-center py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Open Material
            </a>
          </div>
        ))}
      </div>

      {materials.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p>No materials yet for this course.</p>
          <p className="text-sm mt-1">Click "Add Material" to upload files, videos, or audio.</p>
        </div>
      )}
    </div>
  );
};

export default EducatorMaterials;