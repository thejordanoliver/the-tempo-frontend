// utils/dateFormatter.ts
export function safeFormatDate(dateString?: string): string {
  if (!dateString) return "Unknown";
  try {
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
    }
    // Handle short strings like "10/16"
    const parts = dateString.split("/");
    if (parts.length === 2) {
      const [month, day] = parts;
      return `${month}/${day}`;
    }
  } catch (err) {
    console.warn("Invalid date:", dateString);
  }
  return "Unknown";
}
