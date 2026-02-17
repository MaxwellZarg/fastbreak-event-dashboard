import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";

export async function getEvents(
  search?: string,
  sport?: string
): Promise<Event[]> {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*, venues(*)")
    .order("date_time", { ascending: true });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (sport) {
    query = query.eq("sport_type", sport);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as Event[];
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*, venues(*)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return data as Event;
}
