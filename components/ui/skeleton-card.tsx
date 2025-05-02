import { Card } from "@/components/ui/card";

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden shadow-md flex flex-col h-full rounded-xl">
      <div className="aspect-video w-full bg-muted/60 animate-pulse rounded-t-xl" />
      <div className="p-5 space-y-4">
        <div className="h-6 bg-muted/60 rounded-md w-3/4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-muted/60 rounded-md animate-pulse" />
          <div className="h-4 bg-muted/60 rounded-md w-5/6 animate-pulse" />
        </div>
        <div className="space-y-2 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-muted/60 animate-pulse" />
            <div className="h-3 bg-muted/60 rounded w-1/3 animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-muted/60 animate-pulse" />
            <div className="h-3 bg-muted/60 rounded w-1/2 animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-muted/60 animate-pulse" />
            <div className="h-3 bg-muted/60 rounded w-1/4 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="mt-auto p-5 border-t">
        <div className="h-9 bg-muted/60 rounded-full animate-pulse" />
      </div>
    </Card>
  );
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array(count)
        .fill(null)
        .map((_, index) => (
          <SkeletonCard key={index} />
 