"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { deleteEvent } from "@/lib/actions/events";
import { toast } from "sonner";
import { useState } from "react";
import type { Event } from "@/lib/types";
import { sportColorMap } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const sportColor =
    sportColorMap[event.sport_type] || "bg-muted text-muted-foreground";
  const eventDate = new Date(event.date_time);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteEvent(event.id);
    if (result.success) {
      toast.success("Event deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  }

  const venueNames = event.venues.map((v) => v.name);
  const displayedVenues =
    venueNames.length > 3
      ? `${venueNames.slice(0, 3).join(", ")} and ${venueNames.length - 3} more`
      : venueNames.join(", ");

  return (
    <Card
      className="group relative cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <span className="flex-1 text-base font-semibold leading-tight group-hover:text-primary transition-colors">
            {event.name}
          </span>
          <Badge
            variant="outline"
            className={`shrink-0 text-[11px] font-medium ${sportColor}`}
          >
            {event.sport_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{format(eventDate, "MMM d, yyyy 'at' h:mm a")}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{displayedVenues}</span>
        </div>
        <div
          className="flex items-center gap-2 pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => router.push(`/events/${event.id}/edit`)}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete event</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{event.name}&quot;? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
