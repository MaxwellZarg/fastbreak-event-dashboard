"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createSafeAction } from "@/lib/safe-action";
import { eventFormSchema, type EventFormValues } from "@/lib/types";

export const createEvent = createSafeAction(
  async (input: EventFormValues) => {
    const parsed = eventFormSchema.parse(input);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        name: parsed.name,
        sport_type: parsed.sportType,
        date_time: new Date(parsed.dateTime).toISOString(),
        description: parsed.description || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (eventError) throw new Error(eventError.message);

    if (parsed.venues.length > 0) {
      const { error: venueError } = await supabase.from("venues").insert(
        parsed.venues.map((v) => ({
          event_id: event.id,
          name: v.name,
        }))
      );
      if (venueError) throw new Error(venueError.message);
    }

    revalidatePath("/dashboard");
    return event;
  }
);

export const updateEvent = createSafeAction(
  async (input: { id: string; values: EventFormValues }) => {
    const parsed = eventFormSchema.parse(input.values);
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data: event, error: eventError } = await supabase
      .from("events")
      .update({
        name: parsed.name,
        sport_type: parsed.sportType,
        date_time: new Date(parsed.dateTime).toISOString(),
        description: parsed.description || null,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (eventError) throw new Error(eventError.message);

    // Delete existing venues and re-insert
    const { error: deleteError } = await supabase
      .from("venues")
      .delete()
      .eq("event_id", input.id);

    if (deleteError) throw new Error(deleteError.message);

    if (parsed.venues.length > 0) {
      const { error: venueError } = await supabase.from("venues").insert(
        parsed.venues.map((v) => ({
          event_id: event.id,
          name: v.name,
        }))
      );
      if (venueError) throw new Error(venueError.message);
    }

    revalidatePath("/dashboard");
    revalidatePath(`/events/${input.id}`);
    return event;
  }
);

export const deleteEvent = createSafeAction(async (id: string) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  return { id };
});
