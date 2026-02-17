import { Suspense } from "react";
import Link from "next/link";
import { getEvents } from "@/lib/queries/events";
import { Navbar } from "@/components/navbar";
import { SearchFilter } from "@/components/search-filter";
import { EventsView } from "@/components/events-view";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function EventGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function EventsContent({
  search,
  sport,
}: {
  search?: string;
  sport?: string;
}) {
  const events = await getEvents(search, sport);

  return (
    <EventsView events={events} hasFilters={!!(search || sport)} />
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sport?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground">
              Manage your sports events
            </p>
          </div>
          <Button asChild>
            <Link href="/events/new">
              <Plus className="h-4 w-4 mr-1.5" />
              New event
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <Suspense>
            <SearchFilter />
          </Suspense>
        </div>

        <Suspense
          key={`${params.search}-${params.sport}`}
          fallback={<EventGridSkeleton />}
        >
          <EventsContent search={params.search} sport={params.sport} />
        </Suspense>
      </main>
    </div>
  );
}
