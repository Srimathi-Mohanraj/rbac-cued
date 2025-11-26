const jwt = require('jsonwebtoken');
const User = require('../models/User');

const extractToken = (header) => {
  if (!header) return null;
  const parts = header.split(' ');
  if (parts.length === 1) return parts[0];
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
  return null;
};

const tryPopulateUser = async (userId) => {
  try {
    const schema = User.schema || {};
    const hasRoles = !!schema.path && !!schema.path('roles');
    const hasRole = !!schema.path && !!schema.path('role');

    if (hasRoles) {
      return await User.findById(userId).populate({
        path: 'roles',
        populate: { path: 'permissions' }
      });
    } else if (hasRole) {
      return await User.findById(userId).populate({
        path: 'role',
        populate: { path: 'permissions' }
      });
    } else {
      return await User.findById(userId);
    }
  } catch (err) {
    console.warn('populate attempt failed, falling back to findById:', err && err.message);
    return await User.findById(userId);
  }
};

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const token = extractToken(header);

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      console.warn('JWT decoded but missing id:', decoded);
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await tryPopulateUser(decoded.id);

    if (!user) {
      console.warn('JWT valid but user not found for id:', decoded.id);
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error('JWT verify error:', (err && err.name) || 'Error', (err && err.message) || err);
    if (err && err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const permit = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });

    const permissions = new Set();
    const rolesArray = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
    rolesArray.forEach((r) => {
      if (!r) return;
      const perms = r.permissions || [];
      perms.forEach((p) => {
        if (!p) return;
        if (typeof p === 'string') permissions.add(p);
        else if (typeof p === 'object') permissions.add(p.name || p.key || p.permission || '');
      });
    });

    if (permissions.has(requiredPermission)) return next();
    return res.status(403).json({ message: 'Forbidden — missing permission: ' + requiredPermission });
  };
};

module.exports = { authMiddleware, permit };
