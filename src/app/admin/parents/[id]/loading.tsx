import { CardSkeleton, PageSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return <PageSkeleton><CardSkeleton lines={1} /><CardSkeleton /><CardSkeleton /></PageSkeleton>;
}
