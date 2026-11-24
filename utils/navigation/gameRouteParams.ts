export function getFirstParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseGameParam<Game>(
  value?: string | string[],
): Game | undefined {
  const rawValue = getFirstParam(value);

  if (!rawValue || rawValue === "undefined" || rawValue === "null") {
    return undefined;
  }

  const decodedValue = safeDecode(rawValue).trim();

  // A dynamic route parameter can also contain only the game ID.
  if (!decodedValue.startsWith("{")) {
    return undefined;
  }

  try {
    return JSON.parse(decodedValue) as Game;
  } catch {
    return undefined;
  }
}

export function getRouteGameId(value?: string | string[]) {
  const rawValue = getFirstParam(value);

  if (!rawValue || rawValue === "undefined" || rawValue === "null") {
    return null;
  }

  const decodedValue = safeDecode(rawValue).trim();
  return decodedValue && !decodedValue.startsWith("{") ? decodedValue : null;
}

export function getRouteLeague(value?: string | string[]) {
  const league = getFirstParam(value)?.trim().toLowerCase();
  return league && /^[a-z0-9][a-z0-9._-]*$/.test(league) ? league : null;
}
