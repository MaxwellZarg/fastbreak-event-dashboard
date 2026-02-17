"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import type { Event } from "@/lib/types";

interface EventCalendarPopoverProps {
  events: Event[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function EventCalendarPopover({
  events,
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
}: EventCalendarPopoverProps) {
  const eventDates = useMemo(() => {
    const dates: Date[] = [];
    const seen = new Set<string>();
    for (const event of events) {
      const key = format(new Date(event.date_time), "yyyy-MM-dd");
      if (!seen.has(key)) {
        seen.add(key);
        dates.push(new Date(event.date_time));
      }
    }
    return dates;
  }, [events]);

  return (
    <Calendar
      mode="single"
      selected={selectedDate ?? undefined}
      onSelect={(date) => {
        if (date && selectedDate && isSameDay(date, selectedDate)) {
          onSelectDate(null);
        } else {
          onSelectDate(date ?? null);
        }
      }}
      month={currentMonth}
      onMonthChange={onMonthChange}
      modifiers={{
        hasEvent: eventDates,
      }}
      modifiersClassNames={{
        hasEvent: "has-event",
      }}
      className="rounded-md border p-3"
    />
  );
}
