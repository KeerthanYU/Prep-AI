const { getPermissionsForRole } = require('../config/roles');

function checkRole(requiredRoles = []) {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ error: 'Forbidden', message: 'Role not found' });
    }
    if (requiredRoles.length === 0 || requiredRoles.includes(req.userRole)) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden', message: 'Insufficient role' });
  };
}

function checkPermission(permission) {
  return (req, res, next) => {
    const permissions = req.userPermissions || (req.user && req.user.permissions) || [];
    // ensure permissions array
    if (!Array.isArray(permissions)) return res.status(403).json({ error: 'Forbidden', message: 'No permissions' });
    if (permissions.includes(permission)) return next();
    return res.status(403).json({ error: 'Forbidden', message: 'Missing permission' });
  };
}

module.exports = { checkRole, checkPermission };
