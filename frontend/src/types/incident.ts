export interface IncidentResponse {
  id: number;
  sos_report_id?: number;
  title: string;
  description: string;
  disaster_type: "FLOOD" | "CYCLONE" | "EARTHQUAKE" | "FIRE" | "LANDSLIDE" | "OTHER";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  priority_score: number;
  status: "NEW" | "TRIAGED" | "UNDER_REVIEW" | "APPROVED" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  location_text?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  affected_count_estimate: number;
  needs_evacuation: boolean;
  needs_medical: boolean;
  needs_shelter: boolean;
  needs_food_water: boolean;
  is_spam?: boolean;
  needs_manual_review?: boolean;
  rejection_reason?: string;
  confidence_score?: number;
  nearest_hospital?: string;
  nearest_shelter?: string;
  nearest_rescue_team?: string;
  estimated_response_time?: string;
  suggested_action?: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
}

export interface AIRecommendationResponse {
  id: number;
  incident_id: number;
  recommendation_type: "TRIAGE" | "RESOURCE_ALLOCATION" | "DISPATCH_PLAN";
  recommendation_data: {
    resources: Array<{ type: string; quantity: number }>;
    severity: string;
    disaster_type: string;
    priority_score: number;
  };
  confidence_score: number;
  reasoning?: string;
  model_used?: string;
  is_active: boolean;
  created_at: string;
}

export interface TimelineEvent {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  actor_id?: number;
  actor_name: string;
  actor_role?: string;
  details?: Record<string, any>;
  timestamp: string;
}
