import type { RosterPlayer, RosterResponse } from "types/roster";

export function decodeRosterResponse(value: unknown): RosterResponse {
  const body =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const players = Array.isArray(body.players)
    ? (body.players as RosterPlayer[])
    : [];
  if (body.representation !== "indexed-v1")
    return {
      players,
      sections: Array.isArray(body.sections)
        ? (body.sections as RosterResponse["sections"])
        : [],
    };
  if (!Array.isArray(body.sections)) throw new Error("Invalid roster sections");
  return {
    players,
    sections: body.sections.map((value) => {
      const section = value as { title?: unknown; indices?: unknown };
      if (
        !section ||
        typeof section.title !== "string" ||
        !Array.isArray(section.indices) ||
        !section.indices.every(
          (index) =>
            Number.isSafeInteger(index) && index >= 0 && index < players.length,
        )
      )
        throw new Error("Invalid roster section indices");
      return {
        title: section.title,
        data: section.indices.map((index) => players[index]),
      };
    }),
  };
}
