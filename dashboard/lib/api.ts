import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  description: string;
  overall_score: number;
  role_match_score: number;
  tech_stack_score: number;
  company_stage: string;
  tech_stack: string[];
  posted_date: string;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  resume_version: string;
  status: 'draft' | 'submitted' | 'interview' | 'rejected' | 'offer';
  submitted_at?: string;
  created_at: string;
}

export interface Stats {
  total_applications: number;
  submitted: number;
  interviews: number;
  offers: number;
  response_rate: number;
}

export const jobsApi = {
  getJobs: async (params?: {
    min_score?: number;
    company_stage?: string;
    remote_only?: boolean;
    limit?: number;
  }) => {
    const response = await api.get<Job[]>('/jobs', { params });
    return response.data;
  },

  getJob: async (id: string) => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  getTopMatches: async (limit: number = 10) => {
    const response = await api.get<Job[]>('/jobs/top-matches', {
      params: { limit },
    });
    return response.data;
  },
};

export const applicationsApi = {
  getApplications: async (params?: {
    status?: string;
    limit?: number;
  }) => {
    const response = await api.get<Application[]>('/applications', { params });
    return response.data;
  },

  createApplication: async (data: {
    job_id: string;
    cover_letter_tone?: string;
  }) => {
    const response = await api.post<Application>('/applications', data);
    return response.data;
  },

  submitApplication: async (id: string, dry_run: boolean = false) => {
    const response = await api.post(`/applications/${id}/submit`, { dry_run });
    return response.data;
  },
};

export const analyticsApi = {
  getStats: async () => {
    const response = await api.get<Stats>('/analytics/stats');
    return response.data;
  },

  getPipeline: async () => {
    const response = await api.get('/analytics/pipeline');
    return response.data;
  },
};
