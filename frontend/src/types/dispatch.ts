export interface DispatchResponse {
  id: number;
  incident_id: number;
  approval_id: number;
  dispatch_type: "RESCUE" | "MEDICAL" | "RELIEF" | "EVACUATION";
  status: "CREATED" | "DISPATCHED" | "EN_ROUTE" | "ON_SITE" | "COMPLETED" | "CANCELLED";
  team_lead_id?: number;
  instructions?: string;
  eta_minutes?: number;
  dispatched_at?: string;
  completed_at?: string;
  created_at: string;
}
