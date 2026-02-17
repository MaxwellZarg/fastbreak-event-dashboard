"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays, Plus, CalendarX, X } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { EventCalendarPopover } from "@/components/event-calendar";
import type { Event } from "@/lib/types";

interface EventsViewProps {
  events: Event[];
  hasFilters: boolean;
}

export function EventsView({ events, hasFilters }: EventsViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [open, setOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter((event) =>
      isSameDay(new Date(event.date_time), selectedDate)
    );
  }, [events, selectedDate]);

  function handleSelectDate(date: Date | null) {
    setSelectedDate(date);
    if (date) setOpen(false);
  }

  function clearDateFilter() {
    setSelectedDate(null);
  }

  const isEmpty = events.length === 0;
  const noResults = !isEmpty && filteredEvents.length === 0;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {filteredEvents.length} event{filteredEvents.length !== 1 && "s"}
          </p>
          {selectedDate && (
            <Badge
              variant="secondary"
              className="gap-1 pl-2 pr-1 text-xs font-medium cursor-pointer"
              onClick={clearDateFilter}
            >
              {format(selectedDate, "MMM d, yyyy")}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={selectedDate ? "default" : "outline"}
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Calendar
              </Button>
            </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <EventCalendarPopover
              events={events}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              currentMonth={calendarMonth}
              onMonthChange={setCalendarMonth}
            />
          </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={clearDateFilter}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <CalendarX className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            No events found
          </h3>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-4">
            {hasFilters
              ? "Try adjusting your search or filter"
              : "Create your first event to get started"}
          </p>
          {!hasFilters && (
            <Button asChild>
              <Link href="/events/new">
                <Plus className="h-4 w-4 mr-1.5" />
                Create event
              </Link>
            </Button>
          )}
        </div>
      ) : noResults ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <CalendarX className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <h3 className="text-sm font-medium text-muted-foreground">
            No events on {format(selectedDate!, "MMMM d, yyyy")}
          </h3>
          <Button
            variant="link"
            size="sm"
            className="mt-2 text-xs"
            onClick={clearDateFilter}
          >
            Clear date filter
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
