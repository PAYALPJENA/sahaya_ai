export interface SOSCreateRequest {
  raw_content: string;
  reporter_name?: string;
  reporter_phone?: string;
  reporter_location_text?: string;
  latitude?: number;
  longitude?: number;
  media_url?: string;
  source_type: "WEB" | "PHONE" | "SMS" | "WHATSAPP";
}

export interface SOSCreateResponse {
  tracking_token: string;
  message: string;
}

export interface SOSStatusResponse {
  tracking_token: string;
  source_type: "WEB" | "PHONE" | "SMS" | "WHATSAPP";
  processed: boolean;
  submitted_at: string;
  incident_id?: number;
  incident_status?: "NEW" | "TRIAGED" | "UNDER_REVIEW" | "APPROVED" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  incident_severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  location_text?: string;
}
