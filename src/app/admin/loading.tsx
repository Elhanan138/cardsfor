import { PageSkeleton, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <div className="skel title" />
      <div className="skel line" />
      <section className="card list-card"><ListSkeleton rows={6} action /></section>
    </PageSkeleton>
  );
}
