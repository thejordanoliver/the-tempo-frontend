import type { AppNotification } from "types/notifications";

const base: AppNotification = {
  id: "preview-notification",
  recipientUserId: 0,
  actorUserId: null,
  type: "game_touchdown",
  entityType: "game",
  entityId: "preview-game",
  title: "Touchdown Florida!",
  body: "Florida takes the lead 21–17 with 4:32 remaining in the fourth quarter.",
  data: {
    sport: "football",
    league: "cfb",
    awayTeamId: "61",
    homeTeamId: "57",
  },
  createdAt: "2026-10-30T12:00:00.000Z",
  updatedAt: "2026-10-30T12:00:00.000Z",
  readAt: null,
  archivedAt: null,
};

export const DESIGN_PREVIEW_NOTIFICATIONS: {
  label: string;
  notification: AppNotification;
}[] = [
  { label: "Touchdown", notification: base },
  {
    label: "Final score",
    notification: {
      ...base,
      id: "preview-final",
      type: "game_final",
      title: "Final score",
      body: "Los Angeles wins 112–108 over Boston.",
      data: {
        sport: "basketball",
        league: "nba",
        awayTeamId: "2",
        homeTeamId: "13",
      },
    },
  },
  {
    label: "Message",
    notification: {
      ...base,
      id: "preview-message",
      type: "message",
      entityType: "conversation",
      actorUserId: 1,
      title: "Jordan Oliver",
      body: "Are you watching the game tonight? That last play was incredible!",
      data: {},
    },
  },
  {
    label: "Comment",
    notification: {
      ...base,
      id: "preview-comment",
      type: "post_comment",
      entityType: "post",
      actorUserId: 1,
      title: "Alex commented on your post",
      body: "What a finish! I thought we were headed to overtime. This team keeps finding ways to win when it matters most.",
      data: {},
    },
  },
  {
    label: "Badge",
    notification: {
      ...base,
      id: "preview-badge",
      type: "badge",
      entityType: "badge",
      title: "New badge unlocked",
      body: "You earned the Game Day Regular badge. Keep the streak going!",
      data: {},
    },
  },
];
