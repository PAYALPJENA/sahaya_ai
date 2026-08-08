export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "COLLECTOR" | "RESPONDER";
  phone?: string;
  designation?: string;
  district?: string;
  is_active: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}
