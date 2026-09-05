"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { projects as mockProjects } from "@/lib/mock-data";
import type { Project } from "@/lib/supabase/types";

/**
 * Loads projects from Supabase when credentials exist, otherwise serves the
 * bundled demo dataset so the preview always renders a complete experience.
 */
export function useProjects(): { data: Project[]; loading: boolean; source: "supabase" | "mock" } {
  const [data, setData] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const { data: rows, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (!error && rows && rows.length > 0) setData(rows as Project[]);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, source: isSupabaseConfigured ? "supabase" : "mock" };
}
