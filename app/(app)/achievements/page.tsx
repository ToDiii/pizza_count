import { redirect } from "next/navigation";

// Abzeichen is now merged into the Rangliste page
export default function AchievementsPage() {
  redirect("/leaderboard");
}
