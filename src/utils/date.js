
export function formatDate(dateStr, language = 'en') {
  if (!dateStr) return '';

  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (err) {
    return dateStr;
  }
}