import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";

const Navbar = () => {
  const { session, signOut } = useContext(AppContext);

  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3">
      <Link to="/">
        <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
      </Link>
      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! {session?.user?.name || session?.user?.email || "Developer"}</p>
        {session?.user ? (
          <button
            onClick={signOut}
            className="bg-gray-900 text-white px-4 py-2 rounded-full"
          >
            Sign out
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Navbar;

