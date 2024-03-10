/**
 * Get the date of the day with an offset
 * @param offset The offset in number of days to apply to the current date
 */
export function getDate(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
  }).format(date);
}
