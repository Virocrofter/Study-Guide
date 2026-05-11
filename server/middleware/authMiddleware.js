// Auth.js cookie-session guards (replaces Clerk-based checks)

export const protectUser = async (req, res, next) => {
  try {
    const userId = req.auth?.().userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Session expired or invalid user" });
  }
};

export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth?.().userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    const role = res.locals.session?.user?.role;
    if (role !== "educator") {
      return res.status(403).json({ success: false, message: "Access Denied. Educator required." });
    }

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Session expired or invalid user" });
  }
};
