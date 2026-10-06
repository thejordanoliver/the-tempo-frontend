export const LEAGUE_CAROUSEL_VISIBLE_SLOTS = 7;

export function wrapLeagueRotation(value: number, count: number) {
  "worklet";
  return ((value % count) + count) % count;
}

export function leagueDistanceFromFront(leagueIndex: number, rotation: number, count: number) {
  "worklet";
  return wrapLeagueRotation(leagueIndex - rotation + count / 2, count) - count / 2;
}

export function leagueOrbitPosition(leagueIndex: number, rotation: number, count: number, width: number) {
  "worklet";
  const distance = leagueDistanceFromFront(leagueIndex, rotation, count);
  const angle = distance * 2 * Math.PI / LEAGUE_CAROUSEL_VISIBLE_SLOTS;
  const depth = (Math.cos(angle) + 1) / 2;
  return {
    opacity: Math.max(0, Math.min(1, (LEAGUE_CAROUSEL_VISIBLE_SLOTS / 2 - Math.abs(distance)) * 4)),
    zIndex: Math.round(depth * 100) + 1,
    translateX: Math.sin(angle) * width * 0.32,
    translateY: -32 * (1 - depth),
    scale: 0.62 + depth * 0.38,
  };
}

// Pause and reduced motion control autoplay, while explicit navigation still runs.
export function leagueCarouselMotionAction({ focused, appActive, interacting, paused, reduceMotion, searching = false }: {
  focused: boolean;
  appActive: boolean;
  interacting: boolean;
  paused: boolean;
  reduceMotion: boolean;
  searching?: boolean;
}): "auto" | "manual" | "stop" {
  if (!focused || !appActive) return "stop";
  if (interacting) return "manual";
  return paused || reduceMotion || searching ? "stop" : "auto";
}
