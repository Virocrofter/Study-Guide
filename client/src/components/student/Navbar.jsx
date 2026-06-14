import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../../assets/assets.js";
import { AppContext } from "../../context/AppContext.jsx";

const Navbar = () => {
  const {
    navigate,
    isEducator,
    session,
    signInWithGoogle,
    signOut,
    becomeEducator,
  } = useContext(AppContext);

  const location = useLocation();
  const isCourseListPage = location.pathname.includes("/course-list");

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCourseListPage ? "bg-white" : "bg-cyan-100/70"
      }`}
    >
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="w-28 lg:w-32 cursor-pointer"
      />

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <Link to="/about" className="text-gray-600 hover:text-gray-900">
          About us
        </Link>

        {session?.user ? (
          <div className="flex items-center gap-5">
            {isEducator ? (
              <button
                onClick={() => navigate("/educator")}
                className="cursor-pointer"
                title="Educator Dashboard"
              >
                Educator Dashboard
              </button>
            ) : (
              <button
                onClick={becomeEducator}
                className="cursor-pointer text-blue-700 font-medium"
                title="Upgrade your account to educator"
              >
                Become an educator
              </button>
            )}
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
          <div className="flex items-center gap-4">
            <button
              onClick={becomeEducator}
              className="text-blue-700 font-medium"
              title="Sign in, then upgrade to educator"
            >
              Become an educator
            </button>
            <button
              onClick={signInWithGoogle}
              className="bg-blue-600 text-white px-5 py-2 rounded-full"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {/* Mobile (kept simple) */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <Link to="/about" className="text-gray-600 hover:text-gray-900">
          About
        </Link>

        {session?.user ? (
          <button
            onClick={signOut}
            className="bg-gray-900 text-white px-4 py-2 rounded-full"
          >
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

