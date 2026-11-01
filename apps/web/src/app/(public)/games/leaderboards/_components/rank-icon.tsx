import { Crown, Medal } from "lucide-react";

/** Crown for 1st, medals for 2nd/3rd, the number below that. */
export function RankIcon({ rank }: { rank: number }) {
  switch (rank) {
    case 1:
      return <Crown className="text-warning h-5 w-5" aria-label="Rank 1" />;
    case 2:
      return <Medal className="text-muted-foreground h-5 w-5" aria-label="Rank 2" />;
    case 3:
      return <Medal className="text-accent h-5 w-5" aria-label="Rank 3" />;
    default:
      return (
        <span className="text-muted-foreground flex h-5 w-5 items-center justify-center font-mono text-sm">
          {rank}
        </span>
      );
  }
}
