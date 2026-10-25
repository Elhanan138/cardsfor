import { CardSkeleton, PageSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return <PageSkeleton><div className="skel title" /><CardSkeleton /><CardSkeleton /><CardSkeleton /></PageSkeleton>;
}
