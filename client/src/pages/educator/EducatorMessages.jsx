import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const EducatorMessages = () => {
  const { backendUrl, isEducator, userData } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
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

  const fetchMessages = async () => {
    if (!selectedCourse) return;
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/educator/messages/${selectedCourse._id}`,
        { withCredentials: true }
      );
      if (data.success) setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedCourse) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/educator/messages/${selectedCourse._id}`,
        {
          text: input,
          userName: userData?.name || "Educator",
          userImage: userData?.imageUrl || "",
        },
        { withCredentials: true }
      );
      if (data.success) {
        setMessages([...messages, data.data]);
        setInput("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    if (isEducator) fetchCourses();
  }, [isEducator]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedCourse]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="h-screen flex flex-col md:p-8 p-4 pt-8 bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Course Messages</h2>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Course Selector */}
        <div className="w-64 shrink-0 space-y-2">
          <p className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Select Course</p>
          {courses.map((course) => (
            <button
              key={course._id}
              onClick={() => setSelectedCourse(course)}
              className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-colors ${
                selectedCourse?._id === course._id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <p className="truncate">{course.courseTitle}</p>
              <p className="text-xs opacity-70 mt-1">{course.enrolledStudents?.length || 0} students</p>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">{selectedCourse?.courseTitle || "Select a course"}</h3>
              <p className="text-xs text-slate-500">{messages.length} messages</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.userId === userData?._id ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  msg.userId === userData?._id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {msg.userName?.charAt(0) || "?"}
                </div>
                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                  msg.userId === userData?._id
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-700 rounded-bl-none"
                }`}>
                  <p className="font-semibold text-xs mb-1 opacity-70">{msg.userName}</p>
                  <p>{msg.text}</p>
                  <p className="text-xs mt-1 opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducatorMessages;