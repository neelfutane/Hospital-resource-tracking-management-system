const ApiResponse = require('../utils/apiResponse');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.unauthorized('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(ApiResponse.forbidden('Insufficient permissions'));
    }

    next();
  };
};

// Role-based permission checks
const permissions = {
  // Admin can do everything
  ADMIN: ['*'],
  
  // Doctor permissions
  DOCTOR: [
    'beds:read', 'beds:update',
    'rooms:read', 'rooms:update',
    'equipment:read', 'equipment:update',
    'alerts:read',
    'audit:read',
    'analytics:read'
  ],
  
  // Nurse permissions (limited to their department)
  NURSE: [
    'beds:read', 'beds:update',
    'rooms:read', 'rooms:update',
    'equipment:read', 'equipment:update',
    'alerts:read',
    'audit:read'
  ],
  
  // Viewer permissions (read-only)
  VIEWER: [
    'beds:read',
    'rooms:read',
    'equipment:read',
    'alerts:read',
    'audit:read',
    'analytics:read'
  ]
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.unauthorized('User not authenticated'));
    }

    const userPermissions = permissions[req.user.role] || [];
    
    if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
      return res.status(403).json(ApiResponse.forbidden('Insufficient permissions'));
    }

    // For nurses, check department access
    if (req.user.role === 'NURSE' && req.user.department) {
      // Nurses can only access resources in their department
      // This will be checked at the service level
    }

    next();
  };
};

module.exports = { authorize, checkPermission, permissions };
