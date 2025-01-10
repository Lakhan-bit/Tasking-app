const jwt = require('jsonwebtoken');

// Authenticate the user by verifying the JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Token from Authorization header
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user details to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

// Authorize based on roles
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access Denied. Insufficient permissions.' });
  }
  next();
};

module.exports = { authenticate, authorize };
