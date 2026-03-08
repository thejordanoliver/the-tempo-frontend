export default function getDecisionType(
  wonType: string | undefined,
  score: string[] | undefined,
  firstWinner: boolean,
  secondWinner: boolean,
) {
  if (wonType !== "Points" || !score?.length) return wonType;

  const judges = score[0].split("|");

  let firstWins = 0;
  let secondWins = 0;

  judges.forEach((card) => {
    const [a, b] = card.split("-").map(Number);

    if (a > b) firstWins++;
    if (b > a) secondWins++;
  });

  if (firstWins === judges.length || secondWins === judges.length) {
    return "U Dec";
  }

  if (firstWins === 2 && secondWins === 1) {
    return "S Dec";
  }

  if (firstWins === 1 && secondWins === 2) {
    return "S Dec";
  }

  return "M Dec";
}

  export const resultTypeMap: Record<string, string> = {
    Points: "Dec",
    "U Dec": "U Dec",
    "S Dec": "S Dec",
    "M Dec": "M Dec",
    KO: "KO",
    TKO: "TKO",
    Submission: "Submission",
    Sub: "Submission",
    DQ: "Disqualification",
    NC: "No Contest",
  };
  
