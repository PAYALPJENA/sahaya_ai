const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sahaya_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async get<T>(path: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error(await response.text() || "API GET Request Failed");
      }
      return response.json();
    } catch (error: any) {
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error("Command Center Offline. Please check your connection.");
      }
      throw error;
    }
  }

  async post<T>(path: string, body: any): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(await response.text() || "API POST Request Failed");
      }
      return response.json();
    } catch (error: any) {
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error("Command Center Offline. Please check your connection.");
      }
      throw error;
    }
  }

  async patch<T>(path: string, body: any): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(await response.text() || "API PATCH Request Failed");
      }
      return response.json();
    } catch (error: any) {
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error("Command Center Offline. Please check your connection.");
      }
      throw error;
    }
  }

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("sahaya_token", data.access_token);
      }
      return data;
    } catch (error: any) {
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        throw new Error("Command Center Offline. Please check your connection.");
      }
      throw error;
    }
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sahaya_token");
    }
  }
}

export const api = new ApiClient();
export default api;
