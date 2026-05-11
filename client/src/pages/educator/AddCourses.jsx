import React, { useEffect, useRef, useState, useContext } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import { assets } from "../../assets/assets";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const AddCourses = () => {
  const { backendUrl } = useContext(AppContext);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);

  const [lectureDetails, setlectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      if (!image) {
        return toast.error("Please select a course thumbnail");
      }

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      };

      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      // MUST match server: upload.single("thumbnailImage")
      formData.append("thumbnailImage", image);

      const { data } = await axios.post(`${backendUrl}/api/educator/add-course`, formData, {
        withCredentials: true, // Auth.js cookie session
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message);
        setCourseTitle("");
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        if (quillRef.current) {
          quillRef.current.root.innerHTML = "";
        }
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
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === "remove") {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === "toggle") {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === "remove") {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = { ...lectureDetails, lectureId: uniqid() };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setlectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
    });
  };

  return (
    <div className="h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <form className="w-full max-w-3xl" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <p>Course Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            required
          />
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-5 mt-4">
          <div className="flex flex-col gap-1">
            <p>Course Price</p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type="number"
              placeholder="0"
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
              required
            />
          </div>

          <div className="flex flex-row items-center gap-3">
            <p>Course Thumbnail</p>
            <label htmlFor="thumbnailImage" className="flex items-center gap-3">
              <img src={assets.file_upload_icon} alt="" className="p-3 bg-blue-500 rounded cursor-pointer" />
              <input
                id="thumbnailImage"
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                accept="image/*"
                hidden
              />
              {image && <img className="max-h-10" src={URL.createObjectURL(image)} alt="" />}
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-3">
          <p>Discount %</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            type="number"
            placeholder="0"
            min={0}
            max={100}
            className="outline-none md:py-2.5 py-2 w-28 px-3 border border-gray-500"
            required
          />
        </div>

        <div className="mt-6">
          <p className="mb-2 font-semibold">Chapters & Lectures</p>
          {chapters.map((chapter, chapterIndex) => (
            <div key={chapter.chapterId} className="bg-white border rounded-lg mb-4">
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <div className="flex items-center" onClick={() => handleChapter("toggle", chapter.chapterId)}>
                  <img
                    src={assets.dropdown_icon}
                    width={14}
                    className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`}
                    alt=""
                  />
                  <span className="font-semibold cursor-pointer">
                    {chapterIndex + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{chapter.chapterContent.length} Lectures</span>
                  <img
                    onClick={() => handleChapter("remove", chapter.chapterId)}
                    src={assets.cross_icon}
                    className="cursor-pointer w-3"
                    alt="Remove Chapter"
                  />
                </div>
              </div>

              {!chapter.collapsed && (
                <div className="p-4">
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div
                      key={lectureIndex}
                      className="flex justify-between items-center mb-2 text-sm bg-gray-50 p-2 rounded"
                    >
                      <span>
                        {lectureIndex + 1}. {lecture.lectureTitle} - {lecture.lectureDuration} mins -{" "}
                        <a href={lecture.lectureUrl} target="_blank" className="text-blue-500">
                          Link
                        </a>{" "}
                        - {lecture.isPreviewFree ? "Free Prview" : "Paid"}
                      </span>
                      <img
                        onClick={() => handleLecture("remove", chapter.chapterId, lectureIndex)}
                        src={assets.cross_icon}
                        alt=""
                        className="cursor-pointer w-3"
                      />
                    </div>
                  ))}
                  <div
                    onClick={() => handleLecture("add", chapter.chapterId)}
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2 text-sm hover:bg-gray-200"
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}

          <div
            className="flex justify-center items-center mt-3 bg-blue-100 p-3 rounded-lg cursor-pointer hover:bg-blue-200 font-medium"
            onClick={() => handleChapter("add")}
          >
            + Add Chapter
          </div>
        </div>

        <button type="submit" className="bg-black text-white w-max py-2.5 px-12 rounded my-10 shadow-md">
          PUBLISH COURSE
        </button>
      </form>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white text-gray-700 p-6 rounded-lg relative w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Lecture</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Lecture Title</p>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded py-2 px-3 focus:ring-2 focus:ring-blue-400 outline-none"
                  value={lectureDetails.lectureTitle}
                  onChange={(e) => setlectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Duration (minutes)</p>
                <input
                  type="number"
                  className="mt-1 block w-full border rounded py-2 px-3 focus:ring-2 focus:ring-blue-400 outline-none"
                  value={lectureDetails.lectureDuration}
                  onChange={(e) => setlectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Video URL</p>
                <input
                  type="text"
                  className="mt-1 block w-full border rounded py-2 px-3 focus:ring-2 focus:ring-blue-400 outline-none"
                  value={lectureDetails.lectureUrl}
                  onChange={(e) => setlectureDetails({ ...lectureDetails, lectureUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Is Preview Free?</p>
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) => setlectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                />
              </div>
            </div>
            <button
              onClick={addLecture}
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6 transition-colors"
            >
              Add
            </button>
            <img
              onClick={() => setShowPopup(false)}
              src={assets.cross_icon}
              className="absolute top-4 right-4 w-4 cursor-pointer"
              alt="Close"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourses;