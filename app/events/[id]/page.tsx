import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/queries/events";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Pencil, ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";
import { sportColorMap } from "@/lib/types";
import { DeleteEventButton } from "@/components/delete-event-button";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const sportColor =
    sportColorMap[event.sport_type] || "bg-muted text-muted-foreground";
  const eventDate = new Date(event.date_time);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 gap-1.5 text-muted-foreground"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <Badge
                variant="outline"
                className={`shrink-0 text-xs font-medium ${sportColor}`}
              >
                {event.sport_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </span>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                {event.venues.map((v) => (
                  <div key={v.id}>{v.name}</div>
                ))}
              </div>
            </div>

            {event.description && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t">
              <Button size="sm" className="gap-1.5" asChild>
                <Link href={`/events/${event.id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit event
                </Link>
              </Button>
              <DeleteEventButton eventId={event.id} eventName={event.name} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
