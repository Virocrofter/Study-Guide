import React, { useContext, useEffect } from "react";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
  const { user, logout, login, fetchSession } = useAuth();
  const { isEducator, setIsEducator, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const api = axios.create({ baseURL: backendUrl, withCredentials: true });

  // Keep UI state in sync with server truth (session.user.role)
  useEffect(() => {
    if (user?.role === "educator" && !isEducator) {
      setIsEducator(true);
    }
    if (user?.role && user.role !== "educator" && isEducator) {
      setIsEducator(false);
    }
  }, [user?.role]);

  const handleBecomeEducator = async () => {
    if (!user) {
      toast.info("Please login to become an educator");
      return login();
    }

    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }
      const { data } = await api.get("/api/educator/update-role");
      if (data.success) {
        setIsEducator(true);
        toast.success(data.message);
        // Refresh session so user.role becomes 'educator' immediately
        await fetchSession?.();
        navigate("/educator");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating role");
    }
  };

  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
      </Link>

      <div className="flex items-center gap-5 text-gray-500">
        <div className="hidden md:flex items-center gap-6">
          <Link to="/course-list" className="hover:text-gray-900">
            All Courses
          </Link>
          <Link to="/about" className="hover:text-gray-900">
            About Us
          </Link>
          <button onClick={handleBecomeEducator} className="hover:text-gray-900 cursor-pointer">
            {isEducator ? "Dashboard" : "Become Educator"}
          </button>
        </div>

        <div className="flex items-center gap-3 border-l pl-5">
          <p className="hidden sm:block text-sm">Hi! {user ? user.name.split(" ")[0] : "Developer"}</p>

          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user?.image || assets.profile_img}
                className="w-8 h-8 rounded-full border"
                alt="profile"
              />
              <button onClick={logout} className="text-xs bg-gray-100 px-2 py-1 rounded">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={login} className="text-sm px-3">
                Login
              </button>
              <button onClick={login} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;