import { auth } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Trophy, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ObjectId } from "mongodb";

export const metadata = {
  title: "Leaderboard — Simply Updify",
};

interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  domain: string;
  xp: number;
  isYou: boolean;
}

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const db = await getDb();

  // Aggregate total XP per intern
  const xpAggregation = await db.collection(COLLECTIONS.XP_TRANSACTIONS).aggregate([
    {
      $group: {
        _id: "$internId",
        totalXp: { $sum: "$amount" },
      }
    },
    {
      $sort: { totalXp: -1 }
    }
  ]).toArray();

  // Fetch intern user profiles & names
  const internIds = xpAggregation.map((item) => {
    try {
      return new ObjectId(item._id);
    } catch {
      return item._id;
    }
  });

  const users = await db.collection(COLLECTIONS.USERS).find({
    _id: { $in: internIds },
    role: "INTERN",
  }).toArray();

  const profiles = await db.collection(COLLECTIONS.PROFILES).find({
    userId: { $in: xpAggregation.map(item => item._id) }
  }).toArray();

  // Map and compile rankings
  const leaderboard: LeaderboardUser[] = xpAggregation
    .map((item, index) => {
      const user = users.find((u) => u._id.toString() === item._id);
      const profile = profiles.find((p) => p.userId === item._id);

      if (!user) return null;

      return {
        rank: index + 1,
        userId: item._id,
        name: user.name,
        domain: profile?.domain || "General",
        xp: item.totalXp,
        isYou: item._id === session.user.id,
      };
    })
    .filter((item): item is LeaderboardUser => item !== null);

  const topThree = leaderboard.slice(0, 3);
  const remainingList = leaderboard.slice(3);

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30">
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Cohort Leaderboard</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Real-time performance rankings based on sprint task completions and duty consistency.
        </p>
      </div>

      {/* ── Top 3 Podium ── */}
      {topThree.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3 items-end pt-4">
          
          {/* #2 Silver */}
          {topThree[1] && (
            <div className="fluent-card p-5 text-center space-y-3 sm:order-1 bg-[hsl(var(--card))]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">2nd Place</span>
              <Avatar className="h-12 w-12 mx-auto ring-2 ring-gray-300">
                <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-bold">
                  {getInitials(topThree[1].name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xs font-semibold">{topThree[1].name}</h4>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-0.5">{topThree[1].domain}</p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] px-2.5 py-1 rounded">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> {topThree[1].xp.toLocaleString()} XP
              </div>
            </div>
          )}

          {/* #1 Gold */}
          {topThree[0] && (
            <div className="fluent-card p-6 text-center space-y-3 sm:order-2 border-amber-300 dark:border-amber-700/50 bg-[hsl(var(--card))] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                Champion
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mt-2">1st Place</span>
              <Avatar className="h-16 w-16 mx-auto ring-2 ring-amber-400 ring-offset-2 ring-offset-[hsl(var(--card))]">
                <AvatarFallback className="bg-amber-100 text-amber-700 text-base font-bold">
                  {getInitials(topThree[0].name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-semibold">{topThree[0].name}</h4>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{topThree[0].domain}</p>
              </div>
              <div className="inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--foreground))] bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded">
                <Zap className="h-4 w-4 text-amber-500" /> {topThree[0].xp.toLocaleString()} XP
              </div>
            </div>
          )}

          {/* #3 Bronze */}
          {topThree[2] && (
            <div className="fluent-card p-5 text-center space-y-3 sm:order-3 bg-[hsl(var(--card))]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">3rd Place</span>
              <Avatar className="h-12 w-12 mx-auto ring-2 ring-orange-300">
                <AvatarFallback className="bg-orange-50 text-orange-700 text-sm font-bold">
                  {getInitials(topThree[2].name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xs font-semibold">{topThree[2].name}</h4>
                <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-0.5">{topThree[2].domain}</p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--foreground))] bg-[hsl(var(--muted))] px-2.5 py-1 rounded">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> {topThree[2].xp.toLocaleString()} XP
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── Remaining Standings ── */}
      {remainingList.length > 0 && (
        <div className="fluent-card p-4 space-y-1.5">
          {remainingList.map((user) => (
            <div
              key={user.userId}
              className={`flex items-center gap-3 rounded p-2.5 text-xs transition-colors ${
                user.isYou
                  ? "bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.2)]"
                  : "hover:bg-[hsl(var(--accent))/0.3]"
              }`}
            >
              <span className="font-semibold text-[hsl(var(--muted-foreground))] w-6 text-center">
                #{user.rank}
              </span>
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <span className="font-medium text-[hsl(var(--foreground))]">
                  {user.name}
                  {user.isYou && <span className="ml-2 text-[9px] text-[hsl(var(--primary))] font-semibold">(You)</span>}
                </span>
                <span className="text-[9px] text-[hsl(var(--muted-foreground))] block">{user.domain}</span>
              </div>
              <div className="font-semibold flex items-center gap-1 text-[11px]">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                {user.xp.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
