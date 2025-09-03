import { API_BASE_URL } from "../config";
import type {
  Enquiry,
  FollowUp,
  CreateEnquiryRequest,
  UpdateEnquiryRequest,
  CreateFollowUpRequest,
  ListEnquiriesResponse,
  SummaryResponse,
  CreateResponse,
} from "./types";

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        // Try to parse error message from JSON, otherwise fallback
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // If we can't parse the error response, use the status text
          }
        } else {
          // If response is not JSON, try to read as text (likely HTML error page)
          const errorText = await response.text();
          errorMessage += `\n${errorText}`;
        }
        throw new Error(errorMessage);
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        // If not JSON, throw error with raw text
        const text = await response.text();
        if (text.trim().startsWith("<!DOCTYPE html>")) {
          throw new Error(
            "Received an HTML response instead of JSON. This usually means the API endpoint is incorrect or the frontend is trying to talk to itself. Please check your API_BASE_URL and ensure it points to the backend server."
          );
        }
        throw new Error(`Unexpected response format: ${text}`);
      }
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Unable to connect to the server. Please make sure the backend is running and accessible."
        );
      }
      throw error;
    }
  }

  async createEnquiry(data: CreateEnquiryRequest): Promise<CreateResponse> {
    return this.request<CreateResponse>("/enquiries", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listEnquiries(
    params: {
      stage?: string;
      class?: string;
      q?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ListEnquiriesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/enquiries${queryString ? `?${queryString}` : ""}`;

    return this.request<ListEnquiriesResponse>(endpoint);
  }

  async updateEnquiry(
    id: number,
    data: UpdateEnquiryRequest
  ): Promise<Enquiry> {
    return this.request<Enquiry>(`/enquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async createFollowUp(
    enquiryId: number,
    data: CreateFollowUpRequest
  ): Promise<CreateResponse> {
    return this.request<CreateResponse>(`/enquiries/${enquiryId}/followups`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getFollowUps(enquiryId: number): Promise<{ followups: FollowUp[] }> {
    return this.request<{ followups: FollowUp[] }>(
      `/enquiries/${enquiryId}/followups`
    );
  }

  async getSummary(classFilter?: string): Promise<SummaryResponse> {
    const params = classFilter
      ? `?class=${encodeURIComponent(classFilter)}`
      : "";
    return this.request<SummaryResponse>(`/reports/enquiries-summary${params}`);
  }

  async deleteEnquiry(id: number): Promise<void> {
    await this.request<void>(`/enquiries/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new APIClient(API_BASE_URL);
