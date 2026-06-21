// Auth.js cookie-session guards for @auth/express
// Auth.js v5 populates req.auth (not res.locals.session)

export const protectUser = async (req, res, next) => {
  try {
    // @auth/express populates req.auth with { user: { id, email, name, image, role } }
    const userId = req.auth?.user?.id;
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
    // @auth/express populates req.auth with user info
    const userId = req.auth?.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }

    // Role is stored in req.auth.user.role (set by the session callback in auth config)
    const role = req.auth?.user?.role;
    if (role !== "educator") {
      return res.status(403).json({ success: false, message: "Access Denied. Educator required." });
    }

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Session expired or invalid user" });
  }
};