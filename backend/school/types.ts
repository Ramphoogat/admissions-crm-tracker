export interface Enquiry {
  id: number;
  student_name: string;
  class_applied: string;
  guardian_name: string;
  phone: string;
  source?: string;
  stage: 'new' | 'contacted' | 'scheduled' | 'admitted' | 'lost';
  notes?: string;
  created_at: Date;
}

export interface FollowUp {
  id: number;
  enquiry_id: number;
  due_on: Date;
  outcome?: string;
  note?: string;
  created_at: Date;
}

export interface CreateEnquiryRequest {
  student_name: string;
  class_applied: string;
  guardian_name: string;
  phone: string;
  source?: string;
  notes?: string;
}

export interface UpdateEnquiryRequest {
  stage?: 'new' | 'contacted' | 'scheduled' | 'admitted' | 'lost';
  notes?: string;
  class_applied?: string;
  source?: string;
}

export interface CreateFollowUpRequest {
  due_on: string;
  outcome?: string;
  note?: string;
}

export interface ListEnquiriesParams {
  stage?: string;
  class?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface ListEnquiriesResponse {
  items: Enquiry[];
  total: number;
}

export interface CreateResponse {
  id: number;
}

export interface SummaryParams {
  class?: string;
}

export interface SummaryResponse {
  byStage: Record<string, number>;
  total: number;
}
