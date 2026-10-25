import { CardSkeleton, PageSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <section className="ticket stack" aria-hidden="true"><div className="skel line" /><div className="skel big" /><div className="skel line" /></section>
      <CardSkeleton />
    </PageSkeleton>
  );
}
