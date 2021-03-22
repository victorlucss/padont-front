export default function formatDate(isoDate) {
  const date = new Date(isoDate);

  const {
    day,
    month,
    year,
    hour,
    minutes
  } = {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    hour: date.getHours(),
    minutes: date.getMinutes()
  };

  return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day} ${hour}:${minutes}`
}