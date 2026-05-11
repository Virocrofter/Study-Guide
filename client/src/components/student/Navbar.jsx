import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../../assets/assets.js";
import { AppContext } from "../../context/AppContext.jsx";

const Navbar = () => {
  const { navigate, isEducator, backendUrl, session, signInWithGoogle, signOut } =
    useContext(AppContext);

  const location = useLocation();
  const isCourseListPage = location.pathname.includes("/course-list");

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? "bg-white" : "bg-cyan-100/70"}`}
    >
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer"
      />

      <div className="hidden md:flex items-center gap-5 text-gray-500">
        {session?.user ? (
          <div className="flex items-center gap-5">
            <button
              onClick={() => (isEducator ? navigate("/educator") : null)}
              className="cursor-pointer"
              title={
                isEducator
                  ? "Go to educator dashboard"
                  : "Role is controlled by your backend (Auth.js session user.role)"
              }
            >
              {isEducator ? "Educator Dashboard" : "Student"}
            </button>
            |{" "}
            <Link to="/my-enrollments" className="text-gray-600 hover:text-gray-900">
              My Enrollments
            </Link>
            <button
              onClick={signOut}
              className="bg-gray-900 text-white px-5 py-2 rounded-full"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
          >
            Sign in with Google
          </button>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        {session?.user ? (
          <button onClick={signOut} className="bg-gray-900 text-white px-4 py-2 rounded-full">
            Sign out
          </button>
        ) : (
          <button onClick={signInWithGoogle}>
            <img src={assets.user_icon} alt="" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;