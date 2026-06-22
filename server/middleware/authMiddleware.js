export const requireAuth = (req, res, next) => {
  if (!req.auth?.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  next();
};

export const requireEducator = (req, res, next) => {
  if (!req.auth?.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.auth.role !== 'educator') {
    return res.status(403).json({ 
      success: false, 
      message: 'Educator access required' 
    });
  }
  next();
};