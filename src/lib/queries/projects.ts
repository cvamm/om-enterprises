import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import type { Project } from "@/types";
import { SAMPLE_PROJECTS } from "@/data/seeds/projects.sample";

/**
 * Portfolio reads. Projects ship empty — the shop has not supplied real work
 * yet (ADR 0004, §12 Q9), so this returns an empty list rather than inventing
 * jobs. The portfolio page renders an invitation instead of fake projects.
 */

type ProjectRow = {
  id: string;
  customer_name: string | null;
  locality: string;
  project_type: string;
  install_date: string | null;
  before_photo_urls: string[];
  after_photo_urls: string[];
  testimonial_text: string | null;
  testimonial_name: string | null;
  google_review_url: string | null;
  area_sqft: number | string | null;
  featured: boolean;
  sort_rank: number | null;
  created_at: string;
};

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    customerName: row.customer_name,
    locality: row.locality,
    projectType: row.project_type,
    installDate: row.install_date,
    beforePhotoUrls: row.before_photo_urls ?? [],
    afterPhotoUrls: row.after_photo_urls ?? [],
    testimonialText: row.testimonial_text,
    testimonialName: row.testimonial_name,
    googleReviewUrl: row.google_review_url,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

const PROJECT_COLUMNS = `
  id, customer_name, locality, project_type, install_date,
  before_photo_urls, after_photo_urls, testimonial_text, testimonial_name,
  google_review_url, area_sqft, featured, sort_rank, created_at
`;

/** Featured projects, newest install first. */
export const getProjects = cache(async (limit?: number): Promise<Project[]> => {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return SAMPLE_PROJECTS.slice(0, limit ?? SAMPLE_PROJECTS.length);
  }

  let query = supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("featured", true)
    .order("sort_rank", { ascending: true, nullsFirst: false })
    .order("install_date", { ascending: false, nullsFirst: false });

  if (limit !== undefined) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("[queries/projects] getProjects failed:", error.message);
    return [];
  }
  return ((data ?? []) as ProjectRow[]).map(toProject);
});

/** Distinct localities and project types, for the portfolio filters. */
export type ProjectFacets = {
  localities: string[];
  projectTypes: string[];
};

export const getProjectFacets = cache(async (): Promise<ProjectFacets> => {
  const supabase = await getServerSupabase();
  if (!supabase) return { localities: [], projectTypes: [] };

  const { data, error } = await supabase
    .from("projects")
    .select("locality, project_type")
    .eq("featured", true);

  if (error) {
    console.error("[queries/projects] getProjectFacets failed:", error.message);
    return { localities: [], projectTypes: [] };
  }

  const rows = (data ?? []) as Array<{ locality: string; project_type: string }>;
  return {
    localities: [...new Set(rows.map((r) => r.locality))].sort(),
    projectTypes: [...new Set(rows.map((r) => r.project_type))].sort(),
  };
});

/** Testimonials for the home page carousel. Anonymous ones render as such. */
export const getTestimonials = cache(async (limit = 5) => {
  const supabase = await getServerSupabase();
  if (supabase === null) {
    return SAMPLE_PROJECTS.filter((p) => p.testimonialText !== null).slice(0, limit);
  }

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("featured", true)
    .not("testimonial_text", "is", null)
    .order("install_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("[queries/projects] getTestimonials failed:", error.message);
    return [];
  }
  return ((data ?? []) as ProjectRow[]).map(toProject);
});