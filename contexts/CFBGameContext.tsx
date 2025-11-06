// context/CFBGameContext.tsx
import React, { createContext, useContext } from "react";

interface CFBGameContextProps {
  parsedGame: any;
  homeTeam: any;
  awayTeam: any;
  gameDateStr: string;
  score: { home: number; away: number };
  possessionTeamId?: string;
}

const CFBGameContext = createContext<CFBGameContextProps | undefined>(undefined);

export const CFBGameProvider = ({ children, value }: { children: React.ReactNode; value: CFBGameContextProps }) => (
  <CFBGameContext.Provider value={value}>{children}</CFBGameContext.Provider>
);

export const useCFBGame = () => {
  const context = useContext(CFBGameContext);
  if (!context) throw new Error("useCFBGame must be used within CFBGameProvider");
  return context;
};
