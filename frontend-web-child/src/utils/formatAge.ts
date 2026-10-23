export function formatAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months} bulan`;
  }

  if (months === 0) {
    return `${years} tahun`;
  }

  return `${years} tahun ${months} bulan`;
}