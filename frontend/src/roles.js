const labels = {
  admin: 'Администратор',
  president: 'Президент AITUSA',
  secretary: 'Секретарь AITUSA',
  'vice-president': 'Вице-президент AITUSA',
  head: 'Глава комитета',
  member: 'Участник',
  trainee: 'Стажёр',
};

const COMMITTEE_ONLY = new Set(['member', 'trainee']);

export function roleNames(user) {
  const roles = user?.roles ?? [];
  const leadership = roles.filter((role) => !COMMITTEE_ONLY.has(role));
  const shown = leadership.length ? leadership : roles;
  return shown.map((role) => labels[role] ?? role).join(' · ') || 'Участник';
}
