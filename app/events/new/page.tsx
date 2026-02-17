import { Navbar } from "@/components/navbar";
import { EventForm } from "@/components/event-form";

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Create event</h1>
          <p className="text-sm text-muted-foreground">
            Add a new sports event
          </p>
        </div>
        <EventForm mode="create" />
      </main>
    </div>
  );
}
