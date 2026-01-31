/**
 * Format date from timestamp (seconds → readable date)
 */
export const getGameDate = (timestamp?: number | null) => {
  if (!timestamp)
    return { date: null, iso: "", formattedDate: "", formattedTime: "" };

  const date = new Date(timestamp * 1000);
  const iso = date.toISOString();

  return {
    date,
    iso,
    formattedDate: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    formattedTime: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
};
