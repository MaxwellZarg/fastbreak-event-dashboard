"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Event } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventCalendarPopoverProps {
  events: Event[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function EventCalendarPopover({
  events,
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
}: EventCalendarPopoverProps) {
  const eventsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of events) {
      const key = format(new Date(event.date_time), "yyyy-MM-dd");
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [events]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  return (
    <div className="w-[280px]">
      {/* Month nav */}
      <div className="flex items-center justify-between px-1 pb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = eventsByDate.get(key) || 0;
          const inMonth = isSameMonth(day, currentMonth);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);
          const hasEvents = count > 0 && inMonth;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (!inMonth) return;
                onSelectDate(selected ? null : day);
              }}
              className={cn(
                "relative flex h-9 w-full items-center justify-center rounded-md text-sm transition-colors",
                !inMonth && "text-muted-foreground/25 cursor-default",
                inMonth && !selected && "hover:bg-accent",
                selected && "bg-primary text-primary-foreground",
                today && !selected && "font-semibold text-primary"
              )}
            >
              {format(day, "d")}
              {hasEvents && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
              {hasEvents && selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
