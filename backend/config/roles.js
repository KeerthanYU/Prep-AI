// Centralized role -> permissions mapping used across the app

const ROLE_PERMISSIONS = {
  user: [
    'view_dashboard',
    'take_interview',
    'view_profile',
  ],
  admin: [
    'view_dashboard',
    'take_interview',
    'view_profile',
    'manage_users',
    'view_analytics',
    'delete_users',
  ],
};

function getPermissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

module.exports = {
  ROLE_PERMISSIONS,
  getPermissionsForRole,
};
