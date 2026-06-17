import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const Navbar = () => {
  const { session, signOut } = useContext(AppContext);

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{session?.user?.name || "Educator"}</p>
          <p className="text-xs text-slate-500">{session?.user?.email || ""}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
          {(session?.user?.name || "E").charAt(0)}
        </div>
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Navbar;