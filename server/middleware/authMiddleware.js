// Auth.js cookie-session educator guard (replaces Clerk-based checks)
export const protectEducator = async (req, res, next) => {
  try {
    const role = res.locals.session?.user?.role;
    const userId = req.auth?.().userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    if (role !== "educator") {
      return res.status(403).json({ success: false, message: "Access Denied. Educator required." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Session expired or invalid user" });
  }
};

