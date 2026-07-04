export function formatKabulTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    timeZone: "Asia/Kabul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}