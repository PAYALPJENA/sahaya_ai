export interface ResourceResponse {
  id: number;
  name: string;
  type: "RESCUE_TEAM" | "MEDICAL_TEAM" | "BOAT" | "VEHICLE" | "HELICOPTER" | "RELIEF_KIT" | "FOOD_SUPPLY" | "WATER_SUPPLY";
  status: "AVAILABLE" | "DEPLOYED" | "MAINTENANCE" | "UNAVAILABLE";
  current_location: string;
  district: string;
  capacity?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceAllocationResponse {
  id: number;
  incident_id: number;
  resource_id: number;
  approval_id: number;
  quantity: number;
  status: "ALLOCATED" | "EN_ROUTE" | "ON_SITE" | "RETURNED" | "CANCELLED";
  allocated_at: string;
  dispatched_at?: string;
  completed_at?: string;
}
