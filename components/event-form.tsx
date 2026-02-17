"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions/events";
import {
  eventFormSchema,
  SPORT_TYPES,
  type EventFormValues,
  type Event,
} from "@/lib/types";
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
import { useState } from "react";

function toLocalDateTimeValue(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

interface EventFormProps {
  event?: Event;
  mode: "create" | "edit";
}

export function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event
      ? {
          name: event.name,
          sportType: event.sport_type as EventFormValues["sportType"],
          dateTime: toLocalDateTimeValue(event.date_time),
          description: event.description || "",
          venues: event.venues.map((v) => ({ name: v.name })),
        }
      : {
          name: "",
          sportType: undefined,
          dateTime: "",
          description: "",
          venues: [{ name: "" }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "venues",
  });

  async function onSubmit(values: EventFormValues) {
    setIsSubmitting(true);

    if (mode === "create") {
      const result = await createEvent(values);
      if (result.success) {
        toast.success("Event created");
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
    } else if (event) {
      const result = await updateEvent({ id: event.id, values });
      if (result.success) {
        toast.success("Event updated");
        router.push(`/events/${event.id}`);
      } else {
        toast.error(result.error);
      }
    }

    setIsSubmitting(false);
  }

  async function handleDelete() {
    if (!event) return;
    setIsDeleting(true);
    const result = await deleteEvent(event.id);
    if (result.success) {
      toast.success("Event deleted");
      router.push("/dashboard");
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event name</FormLabel>
              <FormControl>
                <Input placeholder="Enter event name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sportType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SPORT_TYPES.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateTime"
          render={({ field }) => {
            const dateValue = field.value
              ? parse(field.value, "yyyy-MM-dd'T'HH:mm", new Date())
              : undefined;
            const timeValue = field.value ? field.value.slice(11, 16) : "";

            function handleDateSelect(day: Date | undefined) {
              if (!day) return;
              const time = timeValue || "12:00";
              field.onChange(format(day, "yyyy-MM-dd") + "T" + time);
            }

            function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
              const time = e.target.value;
              if (dateValue && !isNaN(dateValue.getTime())) {
                field.onChange(format(dateValue, "yyyy-MM-dd") + "T" + time);
              } else {
                field.onChange(format(new Date(), "yyyy-MM-dd") + "T" + time);
              }
            }

            return (
              <FormItem>
                <FormLabel>Date and time</FormLabel>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateValue && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateValue && !isNaN(dateValue.getTime())
                            ? format(dateValue, "MMM d, yyyy")
                            : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          dateValue && !isNaN(dateValue.getTime())
                            ? dateValue
                            : undefined
                        }
                        onSelect={handleDateSelect}
                        defaultMonth={
                          dateValue && !isNaN(dateValue.getTime())
                            ? dateValue
                            : new Date()
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={timeValue}
                    onChange={handleTimeChange}
                    className="w-32 shrink-0"
                  />
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the event"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Venues</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => append({ name: "" })}
            >
              <Plus className="h-3 w-3" />
              Add venue
            </Button>
          </div>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`venues.${index}.name`}
              render={({ field: inputField }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder={`Venue ${index + 1}`}
                        {...inputField}
                      />
                    </FormControl>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create event"
                : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          {mode === "edit" && event && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="ml-auto"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete event"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete event</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{event.name}&quot;?
                    This action cannot be undone.
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
          )}
        </div>
      </form>
    </Form>
  );
}
