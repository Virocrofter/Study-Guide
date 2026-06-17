import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const EducatorMaterials = () => {
  const { backendUrl, isEducator } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    type: "file",
    url: "",
    fileName: "",
    duration: "",
    lectureId: "",
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

  const fetchLectures = async () => {
    if (!selectedCourse) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/educator/course-structure/${selectedCourse._id}`,
        { withCredentials: true },
      );
      if (data.success) {
        setLectures(data.lectures);
        // Default to first lecture
        if (data.lectures.length > 0 && !newMaterial.lectureId) {
          setNewMaterial((prev) => ({ ...prev, lectureId: data.lectures[0].lectureId }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaterials = async () => {
    if (!selectedCourse) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/educator/materials/${selectedCourse._id}`,
        { withCredentials: true },
      );
      if (data.success) setMaterials(data.materials);
    } catch (err) {
      console.error(err);
    }
  };

  const addMaterial = async () => {
    if (!newMaterial.lectureId) {
      return toast.error("Please select a lecture for this material");
    }
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/educator/materials/${selectedCourse._id}`,
        newMaterial,
        { withCredentials: true },
      );
      if (data.success) {
        toast.success("Material linked to lecture!");
        setMaterials([data.material, ...materials]);
        setShowAdd(false);
        setNewMaterial({ title: "", type: "file", url: "", fileName: "", duration: "", lectureId: lectures[0]?.lectureId || "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteMaterial = async (materialId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/educator/materials/${materialId}`,
        { withCredentials: true },
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
    if (selectedCourse) {
      fetchLectures();
      fetchMaterials();
    }
  }, [selectedCourse]);

  if (loading) return <div className="h-full flex items-center justify-center">Loading...</div>;

  const typeColors = {
    file: "bg-blue-100 text-blue-700",
    video: "bg-red-100 text-red-700",
    audio: "bg-green-100 text-green-700",
  };

  // Group materials by lecture for display
  const materialsByLecture = {};
  materials.forEach((m) => {
    if (!materialsByLecture[m.lectureId]) materialsByLecture[m.lectureId] = [];
    materialsByLecture[m.lectureId].push(m);
  });

  return (
    <div className="h-full pb-20 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Course Materials</h1>
          <p className="text-slate-500 mt-1">Link resources to specific lectures.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Material
        </button>
      </div>

      {/* Course Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Link Material to Lecture</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-600 mb-1 block">Target Lecture *</label>
              <select
                value={newMaterial.lectureId}
                onChange={(e) => setNewMaterial({ ...newMaterial, lectureId: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a lecture...</option>
                {lectures.map((lec) => (
                  <option key={lec.lectureId} value={lec.lectureId}>
                    {lec.fullLabel}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">Students will see this under the selected lecture.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Title</label>
              <input
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Lecture Slides"
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
              <label className="text-sm font-medium text-slate-600 mb-1 block">File Name</label>
              <input
                value={newMaterial.fileName}
                onChange={(e) => setNewMaterial({ ...newMaterial, fileName: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="slides.pdf"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Duration</label>
              <input
                value={newMaterial.duration}
                onChange={(e) => setNewMaterial({ ...newMaterial, duration: e.target.value })}
                className="w-full bg-slate-100 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="14:28"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addMaterial} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save & Link</button>
            <button onClick={() => setShowAdd(false)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300">Cancel</button>
          </div>
        </div>
      )}

      {/* Materials grouped by Lecture */}
      <div className="space-y-6">
        {lectures.map((lecture) => {
          const lecMaterials = materialsByLecture[lecture.lectureId] || [];
          if (lecMaterials.length === 0) return null;

          return (
            <div key={lecture.lectureId} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{lecture.chapterTitle}</p>
                <h4 className="font-bold text-slate-800">{lecture.lectureTitle}</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {lecMaterials.map((material) => (
                  <div key={material._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${typeColors[material.type]}`}>
                        {material.type.toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{material.title}</p>
                        <p className="text-xs text-slate-500">{material.fileName || material.duration || "Resource"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                      >
                        Open
                      </a>
                      <button
                        onClick={() => deleteMaterial(material._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Unlinked materials */}
        {materialsByLecture[""] && materialsByLecture[""].length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-100">
              <h4 className="font-bold text-amber-800">Unlinked Materials</h4>
              <p className="text-xs text-amber-600">Not assigned to any lecture</p>
            </div>
            <div className="divide-y divide-slate-100">
              {materialsByLecture[""].map((material) => (
                <div key={material._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${typeColors[material.type]}`}>
                      {material.type.toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{material.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={material.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200">Open</a>
                    <button onClick={() => deleteMaterial(material._id)} className="text-slate-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {materials.length === 0 && (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
          <p>No materials yet.</p>
          <p className="text-sm mt-1">Click "Add Material" to upload and link to a lecture.</p>
        </div>
      )}
    </div>
  );
};

export default EducatorMaterials;