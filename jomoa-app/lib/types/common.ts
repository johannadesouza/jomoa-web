/**
 * Common type definitions used across the app
 * Eliminates need for 'any' types
 */

// Exercise types
export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  equipment: string | null;
  is_global: boolean;
  created_by_profile_id: string | null;
  created_at: string;
}

// Client types
export interface Client {
  id: string;
  profile_id: string;
  primary_coach_id: string;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
  } | null;
}

// Group types
export interface ClientGroup {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  created_by_coach_id: string;
  created_at: string;
  member_count?: number;
}

// Program assignment types
export interface ProgramAssignment {
  id: string;
  client_id: string;
  program_id: string;
  start_date: string;
  is_active: boolean;
  created_at: string;
  client?: Client;
  program?: {
    id: string;
    name: string;
  };
}

export interface GroupProgramAssignment {
  id: string;
  group_id: string;
  program_id: string;
  start_date: string;
  is_active: boolean;
  created_at: string;
  group?: ClientGroup;
  program?: {
    id: string;
    name: string;
  };
}

// Check-in types
export interface CheckinTemplate {
  id: string;
  name: string;
  description: string | null;
  created_by_coach_id: string;
  created_at: string;
  questions?: CheckinQuestion[];
}

export interface CheckinQuestion {
  id?: string;
  template_id?: string;
  question_text: string;
  question_type: "text" | "number" | "scale" | "yes_no" | "multiple_choice";
  order_index: number;
  options?: string[];
  required: boolean;
}

export interface Checkin {
  id: string;
  template_id: string;
  client_id: string;
  sent_at: string;
  completed_at: string | null;
  status: "sent" | "completed";
  template?: CheckinTemplate;
  responses?: CheckinResponse[];
}

export interface CheckinResponse {
  id: string;
  checkin_id: string;
  question_id: string;
  response_text: string | null;
  response_number: number | null;
  created_at: string;
}

