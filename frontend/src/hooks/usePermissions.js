import { useAuth } from './useAuth';

export function useHasPermission(permission) {
  const { userProfile } = useAuth();
  const permissions = userProfile?.permissions || [];
  return permissions.includes(permission);
}

export function useHasRole(role) {
  const { userProfile } = useAuth();
  return userProfile?.role === role;
}
