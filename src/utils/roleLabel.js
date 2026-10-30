/**
 * Friendly display labels for account roles.
 * The stored roles stay `superadmin` / `admin` / `reseller` (backend logic relies
 * on them), but the panel shows plain words: Owner / User / Reseller.
 */
const ROLE_LABELS = {
  superadmin: 'Owner',
  owner: 'Owner',
  admin: 'User',
  reseller: 'Reseller'
};

export function roleLabel(role) {
  const key = String(role || '').toLowerCase();
  return ROLE_LABELS[key] || (role ? String(role) : 'User');
}