import { API_BASE_URL } from '../config';
import type { 
  Enquiry, 
  FollowUp, 
  CreateEnquiryRequest, 
  UpdateEnquiryRequest, 
  CreateFollowUpRequest,
  ListEnquiriesResponse,
  SummaryResponse,
  CreateResponse 
} from './types';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If we can't parse the error response, use the status text
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please make sure the backend is running and accessible.');
      }
      throw error;
    }
  }

  async createEnquiry(data: CreateEnquiryRequest): Promise<CreateResponse> {
    return this.request<CreateResponse>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listEnquiries(params: {
    stage?: string;
    class?: string;
    q?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ListEnquiriesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    const endpoint = `/enquiries${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ListEnquiriesResponse>(endpoint);
  }

  async updateEnquiry(id: number, data: UpdateEnquiryRequest): Promise<Enquiry> {
    return this.request<Enquiry>(`/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createFollowUp(enquiryId: number, data: CreateFollowUpRequest): Promise<CreateResponse> {
    return this.request<CreateResponse>(`/enquiries/${enquiryId}/followups`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFollowUps(enquiryId: number): Promise<{ followups: FollowUp[] }> {
    return this.request<{ followups: FollowUp[] }>(`/enquiries/${enquiryId}/followups`);
  }

  async getSummary(classFilter?: string): Promise<SummaryResponse> {
    const params = classFilter ? `?class=${encodeURIComponent(classFilter)}` : '';
    return this.request<SummaryResponse>(`/reports/enquiries-summary${params}`);
  }
}

export const apiClient = new APIClient(API_BASE_URL);
