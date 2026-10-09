// Recycle leagues on the hidden rear arc of a compact ring. Mount only the
// foreground and its buffer, rather than running a worklet for every league.
export const LEAGUE_CAROUSEL_WINDOW_SIZE = 7;
const RING_SLOTS = 9;

export function leagueCarouselWindow(index: number, count: number) {
  const size = Math.min(count, LEAGUE_CAROUSEL_WINDOW_SIZE);
  return Array.from({ length: size }, (_, offset) =>
    wrapLeagueRotation(index + offset - Math.floor(size / 2), count),
  );
}

export function leagueOrbitGeometry(width: number, cardWidth: number) {
  const pitch = -6 * Math.PI / 180;
  return {
    radius: (cardWidth + 16) / (2 * Math.tan(Math.PI / RING_SLOTS)),
    perspective: Math.max(800, width * 2.5),
    angleStep: 2 * Math.PI / RING_SLOTS,
    sinPitch: Math.sin(pitch),
    cosPitch: Math.cos(pitch),
  };
}

export type LeagueOrbitGeometry = ReturnType<typeof leagueOrbitGeometry>;

export function wrapLeagueRotation(value: number, count: number) {
  "worklet";
  return ((value % count) + count) % count;
}

export function leagueDistanceFromFront(leagueIndex: number, rotation: number, count: number) {
  "worklet";
  return wrapLeagueRotation(leagueIndex - rotation + count / 2, count) - count / 2;
}

export function leagueOrbitPosition(leagueIndex: number, rotation: number, count: number, geometry: LeagueOrbitGeometry) {
  "worklet";
  const distance = leagueDistanceFromFront(leagueIndex, rotation, count);
  const angle = distance * geometry.angleStep;
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const { radius, perspective, sinPitch, cosPitch } = geometry;
  const x = radius * sin;
  const depth = radius * (cos - 1);
  const y = -sinPitch * depth;
  const z = cosPitch * depth;
  // Test the outward normal against the camera, including perspective. This
  // hides backs before they could display reversed logos, and keeps recycling
  // on the rear of the ring invisible, even during a long search animation.
  const facing = ((perspective * cosPitch + radius) * cos - radius) / perspective;
  return {
    opacity: Math.abs(distance) > LEAGUE_CAROUSEL_WINDOW_SIZE / 2
      ? 0
      : Math.max(0, Math.min(1, facing * 8)),
    zIndex: Math.round((cos + 1) * 500) + 1,
    // Column-major perspective * rotation * translation. Native RN requires
    // `matrix` to be the only transform, so bake perspective into its last row.
    // The faces are tangent to the circle with their front normal facing out.
    matrix: [
      cos, sinPitch * sin, -cosPitch * sin, cosPitch * sin / perspective,
      0, cosPitch, sinPitch, -sinPitch / perspective,
      sin, -sinPitch * cos, cosPitch * cos, -cosPitch * cos / perspective,
      x, y, z, 1 - z / perspective,
    ],
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
