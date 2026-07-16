import { BadgeApiResponse } from "@/types/badges";

export const MOCK_BADGE_RESPONSE: BadgeApiResponse = {
  stats: {
    postsCreated: 63,
    likesReceived: 734,
    commentsReceived: 318,
    sharesReceived: 91,
  },
  earnedBadges: [
    {
      badgeId: "posting-first-take",
      earnedAt: "2026-05-01T15:30:00.000Z",
    },
    {
      badgeId: "posting-contributor",
      earnedAt: "2026-05-18T18:45:00.000Z",
    },
    {
      badgeId: "posting-columnist",
      earnedAt: "2026-06-26T11:15:00.000Z",
    },
    {
      badgeId: "likes-crowd-pleaser",
      earnedAt: "2026-05-03T19:30:00.000Z",
    },
    {
      badgeId: "likes-fan-favorite",
      earnedAt: "2026-05-24T21:10:00.000Z",
    },
    {
      badgeId: "likes-headliner",
      earnedAt: "2026-07-02T14:00:00.000Z",
    },
  ],
};