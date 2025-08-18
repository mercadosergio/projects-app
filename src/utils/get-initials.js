export function getInitials(name) {
  const words = name.trim().split(' ');

  let initials = '';
  for (let i = 0; i < Math.min(2, words.length); i++) {
    initials += words[i][0].toUpperCase();
  }

  return initials;
}
