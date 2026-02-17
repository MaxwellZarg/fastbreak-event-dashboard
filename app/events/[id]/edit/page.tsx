import { notFound } from "next/navigation";
import { getEventById } from "@/lib/queries/events";
import { Navbar } from "@/components/navbar";
import { EventForm } from "@/components/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Edit event</h1>
          <p className="text-sm text-muted-foreground">
            Update event details
          </p>
        </div>
        <EventForm event={event} mode="edit" />
      </main>
    </div>
  );
}
