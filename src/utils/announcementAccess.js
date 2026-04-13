export function getAnnouncementQueryForUser(user) {
  if (!user) {
    return { visibleToGuests: true };
  }

  if (user.role === 'admin') {
    return {};
  }

  return {
    $or: [
      { visibleToGuests: true },
      { targetRoles: user.role },
    ],
  };
}
