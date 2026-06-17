import React, { useEffect, useRef, useState, useContext } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddCourses = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!image) return toast.error("Please select a course thumbnail");

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      };

      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      formData.append("thumbnailImage", image);

      const { data } = await axios.post(
        `${backendUrl}/api/educator/add-course`,
        formData,
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/educator/my-courses");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
    }
  }, []);

  const handleChapter = (action, chapterId) => {
    if (action === "add") {
      const title = prompt("Enter Chapter Name:");
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters[chapters.length - 1].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === "remove") {
      setChapters(chapters.filter((c) => c.chapterId !== chapterId));
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === "remove") {
      setChapters(
        chapters.map((c) => {
          if (c.chapterId === chapterId) {
            c.chapterContent.splice(lectureIndex, 1);
          }
          return c;
        })
      );
    }
  };

  const addLecture = () => {
    setChapters(
      chapters.map((c) => {
        if (c.chapterId === currentChapterId) {
          c.chapterContent.push({ ...lectureDetails, lectureId: uniqid() });
        }
        return c;
      })
    );
    setShowPopup(false);
    setLectureDetails({ lectureTitle: "", lectureDuration: "", lectureUrl: "", isPreviewFree: false });
  };

  return (
    <div className="h-full pb-20 space-y-8 ml-24 pt-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create New Course</h1>
        <p className="text-slate-500 mt-1">Build an engaging learning experience for your students.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Course Title</label>
          <input
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="e.g. Advanced JavaScript Masterclass"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <div ref={editorRef} className="bg-slate-50 rounded-xl border border-slate-200" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Price ($)</label>
            <input
              type="number"
              value={coursePrice}
              onChange={(e) => setCoursePrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Discount (%)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min={0}
              max={100}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Course Thumbnail</label>
          <div className="flex items-center gap-4">
            <label className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer">
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} hidden />
              <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm text-slate-500">{image ? image.name : "Click to upload image"}</p>
            </label>
            {image && (
              <img src={URL.createObjectURL(image)} alt="Preview" className="w-24 h-24 rounded-xl object-cover" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-slate-700">Chapters & Lectures</label>
            <button type="button" onClick={() => handleChapter("add")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Chapter
            </button>
          </div>

          <div className="space-y-3">
            {chapters.map((chapter, ci) => (
              <div key={chapter.chapterId} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-800">{ci + 1}. {chapter.chapterTitle}</h4>
                  <button type="button" onClick={() => handleChapter("remove", chapter.chapterId)} className="text-red-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {chapter.chapterContent.map((lecture, li) => (
                    <div key={li} className="flex items-center justify-between p-2 bg-white rounded-lg text-sm">
                      <span className="text-slate-700">{li + 1}. {lecture.lectureTitle} ({lecture.lectureDuration}m)</span>
                      <button type="button" onClick={() => handleLecture("remove", chapter.chapterId, li)} className="text-slate-400 hover:text-red-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleLecture("add", chapter.chapterId)} className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                    + Add Lecture
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg">
          Publish Course
        </button>
      </form>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Lecture</h3>
            <div className="space-y-3">
              <input
                placeholder="Lecture Title"
                value={lectureDetails.lectureTitle}
                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={lectureDetails.lectureDuration}
                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="YouTube Video URL"
                value={lectureDetails.lectureUrl}
                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                Free Preview
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addLecture} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Add</button>
              <button onClick={() => setShowPopup(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourses;