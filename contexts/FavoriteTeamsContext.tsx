import { useFavoriteTeams } from "hooks/UserHooks/useFavoriteTeams";
import { createContext, useContext, type ReactNode } from "react";

type FavoriteTeamsContextType = ReturnType<typeof useFavoriteTeams>;

const FavoriteTeamsContext = createContext<FavoriteTeamsContextType | null>(
  null,
);

export function FavoriteTeamsProvider({ children }: { children: ReactNode }) {
  const value = useFavoriteTeams();
  return (
    <FavoriteTeamsContext.Provider value={value}>
      {children}
    </FavoriteTeamsContext.Provider>
  );
}

export function useFavoriteTeamsContext() {
  const ctx = useContext(FavoriteTeamsContext);
  if (!ctx)
    throw new Error(
      "useFavoriteTeamsContext must be used within FavoriteTeamsProvider",
    );
  return ctx;
}
