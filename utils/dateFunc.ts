export function todayDate() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("ru");

  return formattedDate;
}
