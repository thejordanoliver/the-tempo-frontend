import type { ReactNode } from "react";
import type { Animated, ImageSourcePropType } from "react-native";

export type RacingLeague =
  | "f1"
  | "nascarpremier"
  | "nascarsecondary"
  | "nascartruck";

export type HomeHeaderTab = "scores" | "for you";
export type AuthHeaderTab = "sign in" | "sign up";
export type EditFavoritesHeaderTab = "teams" | "sports";

export type RacingLeagueDisplayConfig = {
  label: string;
  shortLabel: string;
  eventLabel: string;
  accentColor: string;
};

export type HeaderImageSource =
  | ImageSourcePropType
  | string
  | {
      uri?: string;
      href?: string;
      url?: string;
      src?: string;
    }
  | null
  | undefined;

export type HeaderTeamLike = {
  id?: string | number;
  code?: string;
  abbreviation?: string;
  shortDisplayName?: string;
  name?: string;
  color?: string | null;
  logo?: HeaderImageSource;
  logoLight?: HeaderImageSource;
};

export type CustomHeaderProps = {
  title?: string;
  playerName?: string;
  tabName?: string;
  rightAction?: ReactNode;

  onLogout?: () => void;
  onSettings?: () => void;
  onEdit?: () => void;
  onMessages?: () => void;
  onCreateMessage?: () => void;
  onBack?: () => void;
  onCalendarPress?: () => void;
  onOpenLeagueModal?: () => void;
  onHomeTabPress?: (tab: HomeHeaderTab) => void;
  onAuthTabPress?: (tab: AuthHeaderTab) => void;
  onEditTabPress?: (tab: EditFavoritesHeaderTab) => void;
  homeScrollProgress?: Animated.Value;
  authScrollProgress?: Animated.Value;

  modalVisible?: boolean;
  setModalVisible?: (value: boolean) => void;

  onToggleLayout?: () => void;
  isGrid?: boolean;

  logo?: HeaderImageSource;
  homeLogo?: HeaderImageSource;
  awayLogo?: HeaderImageSource;

  homeColor?: string | null;
  awayColor?: string | null;
  teamColor?: string;
  teamName?: string | null;

  isTeamScreen?: boolean;
  isPlayerScreen?: boolean;

  onSearchToggle?: () => void;
  onNotificationsCenter?: () => void;
  onMarkAllNotificationsRead?: () => void;
  onToggleNotificationEditing?: () => void;
  isNotificationEditing?: boolean;
  hasNotifications?: boolean;
  hasUnreadNotifications?: boolean;
  onOpenThemesSettings?: () => void;
  onAddWidget?: () => void;
  onToggleWidgetEditing?: () => void;
  isWidgetEditing?: boolean;

  unreadNotificationCount?: number;

  teamCode?: string;
  teamId?: number;

  homeTeamCode?: string;
  awayTeamCode?: string;

  homeTeamId?: string | number;
  awayTeamId?: string | number;

  teamCoach?: string;
  teamHistory?: string;

  selectedConferenceName?: string;

  homeSelectedTab?: HomeHeaderTab;
  authSelectedTab?: AuthHeaderTab;
  editFavoritesSelectedTab?: EditFavoritesHeaderTab;

  showBackButton?: boolean;

  league?: string | "Leagues";
  racingLeague?: RacingLeague;

  isEvent?: boolean;
  isNeutralSite?: boolean;

  isFavorite?: boolean;
  showFavoriteAction?: boolean;
  favoritePending?: boolean;
  notificationPending?: boolean;
  isNotified?: boolean;

  onOpenInfo?: () => void;
  onToggleFavorite?: () => void;
  onToggleNotifications?: () => void;

  messageAvatar?: string;
  messageUsername?: string;
  messageFullName?: string;
  messageIsOnline?: boolean;
  messageIsVerified?: boolean;
};
