export type AppRole = "super_admin" | "admin" | "pm" | "employee" | "client";
export type ProjectStage = "planning" | "design" | "development" | "testing" | "review" | "completed";
export type MilestoneStatus = "todo" | "in_progress" | "blocked" | "done";
export type FileCategory = "design" | "document" | "contract" | "source" | "invoice";
export type FeedbackCategory = "design" | "content" | "bug" | "scope";
export type Visibility = "public" | "private";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  company: string | null;
  title: string | null;
  locale: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  summary: string;
  client_id: string;
  pm_id: string;
  stage: ProjectStage;
  progress: number;
  visibility: Visibility;
  industry: string;
  budget: number;
  currency: string;
  start_date: string;
  deadline: string;
  tech: string[];
  cover: string;
  created_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  stage: ProjectStage;
  status: MilestoneStatus;
  assignee_id: string | null;
  due_date: string;
  order_index: number;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  category: FileCategory;
  size_kb: number;
  version: string;
  uploaded_by: string;
  created_at: string;
  storage_path: string;
}

export interface Feedback {
  id: string;
  project_id: string;
  author_id: string;
  category: FeedbackCategory;
  body: string;
  resolved: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

/** Minimal typed surface consumed by the Supabase clients. */
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      user_roles: { Row: UserRole; Insert: Partial<UserRole>; Update: Partial<UserRole> };
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> };
      project_milestones: { Row: ProjectMilestone; Insert: Partial<ProjectMilestone>; Update: Partial<ProjectMilestone> };
      project_files: { Row: ProjectFile; Insert: Partial<ProjectFile>; Update: Partial<ProjectFile> };
      feedback: { Row: Feedback; Insert: Partial<Feedback>; Update: Partial<Feedback> };
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
      project_stage: ProjectStage;
      milestone_status: MilestoneStatus;
    };
  };
}
