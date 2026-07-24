import { ProfileProgressCard } from "@/src/components/profile/ProfileProgressCard";
import type { ProfileProgressRow } from "@/src/components/profile/ProfileProgressCard";

type TeacherOverviewCardProps = {
  rows: ProfileProgressRow[];
};

export function TeacherOverviewCard({ rows }: TeacherOverviewCardProps) {
  return <ProfileProgressCard title="Vue d’ensemble" rows={rows} />;
}
