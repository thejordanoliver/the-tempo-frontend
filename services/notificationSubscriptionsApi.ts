import type {
  NotificationTeamSport,
  TeamNotificationSettings,
  TeamNotificationSubscription,
} from "@/types/notifications";
import { apiClient } from "@/utils/apiClient";

const subscriptionPath = (
  sport: NotificationTeamSport,
  league: string,
  teamId: string | number,
) =>
  `/api/notification-subscriptions/teams/${encodeURIComponent(sport)}/${encodeURIComponent(league)}/${encodeURIComponent(String(teamId))}`;

export async function getTeamNotificationSubscriptions() {
  const response = await apiClient.get<{
    subscriptions: TeamNotificationSubscription[];
  }>("/api/notification-subscriptions/teams");
  return response.data.subscriptions;
}

export async function saveTeamNotificationSubscription(
  sport: NotificationTeamSport,
  league: string,
  teamId: string | number,
  settings?: Partial<TeamNotificationSettings>,
) {
  const response = await apiClient.put<{
    subscription: TeamNotificationSubscription;
  }>(subscriptionPath(sport, league, teamId), settings ?? {});
  return response.data.subscription;
}

export async function deleteTeamNotificationSubscription(
  sport: NotificationTeamSport,
  league: string,
  teamId: string | number,
) {
  await apiClient.delete(subscriptionPath(sport, league, teamId));
}
