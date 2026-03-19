// API Client for Qwen3.5 Corralejo Backend
// Base URL configured via environment variable

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://corralejo-backend.onrender.com/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    this.client.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  private getAuthToken(): string | null {
    try { return localStorage.getItem('auth_token'); } catch { return null; }
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  // Dashboard
  getDashboard() { return this.get<DashboardData>('/dashboard'); }

  // Training Plan
  getTrainingPlan() { return this.get<TrainingPlan>('/training-plan'); }
  getCurrentWeek() { return this.get<TrainingWeek>('/training-plan/current'); }
  getWeek(weekId: string) { return this.get<TrainingWeek>(`/training-plan/week/${weekId}`); }
  completeSession(sessionId: string, completed: boolean) {
    return this.patch(`/training-plan/session/complete`, { sessionId, completed });
  }
  adaptPlan() { return this.post<AdaptationResult>('/training-plan/adapt'); }

  // Runs
  getRuns() { return this.get<Run[]>('/runs'); }
  getRun(runId: string) { return this.get<RunDetail>(`/runs/${runId}`); }
  createRun(runData: CreateRunData) { return this.post<Run>('/runs', runData); }

  // Analytics & VDOT
  getAnalytics() { return this.get<AnalyticsData>('/analytics'); }
  getVdotPaces() { return this.get<VdotPaces>('/vdot/paces'); }
  getInjuryRisk() { return this.get<InjuryRiskData>('/injury-risk'); }

  // AI Analysis
  analyzeRun(runId: string, runData: any) {
    return this.post<AIAnalysis>('/ai/analyze-run', { run_id: runId, ...runData });
  }

  // Profile
  getProfile() { return this.get<Profile>('/profile'); }
  updateProfile(profileData: Partial<Profile>) {
    return this.patch<Profile>('/profile', profileData);
  }

  // Strava
  getStravaAuthUrl() { return this.get<{ url: string }>('/strava/auth-url'); }
  syncStrava() { return this.post<SyncResult>('/strava/sync'); }

  // Seed (development)
  seedDatabase() { return this.post('/seed'); }
}

// Types
export interface Profile {
  id: string; name: string; age: number; weight: number;
  fc_max: number; km_max_settimanali: number;
  target_pace: string; target_time: string;
  infortunio: boolean; personal_bests: any[];
  strava_connected: boolean; vdot?: number;
}

export interface Session {
  id: string; day: string; type: string; title: string;
  description: string; target_distance?: number;
  target_pace?: string; target_duration?: number;
  completed: boolean; is_today: boolean; run_id?: string;
}

export interface TrainingWeek {
  id: string; week_number: number; phase: string;
  start_date: string; end_date: string; km_target: number;
  is_recovery: boolean; sessions: Session[]; completed: boolean;
}

export interface TrainingPlan {
  weeks: TrainingWeek[]; startDate: string; endDate: string;
  raceDate: string; phases: any[];
}

export interface Run {
  id: string; date: string; distance: number; duration: number;
  pace: string; avg_heart_rate?: number; max_heart_rate?: number;
  type: string; location?: string; notes?: string;
  source: 'manual' | 'strava'; strava_id?: string;
  planned_session_id?: string; verdict?: string;
}

export interface RunDetail extends Run { analysis?: AIAnalysis; }

export interface DashboardData {
  profile: Profile; currentWeek?: TrainingWeek;
  todaySession?: Session; recentRuns: Run[];
  weeklyProgress: { completed: number; total: number };
  countdown: { days: number; hours: number; minutes: number };
}

export interface VdotPaces {
  vdot: number; easy: string; marathon: string;
  threshold: string; interval: string; repetition: string;
}

export interface AnalyticsData {
  vo2max: { current: number; target: number; history: any[] };
  racePredictions: { [key: number]: { time: string; pace: string; confidence: number } };
  anaerobicThreshold: { current: string };
  bestEfforts: any[]; weeklyVolume: { easy: number; moderate: number; hard: number };
}

export interface InjuryRiskData {
  score: number; level: 'basso' | 'medio' | 'alto' | 'critico';
  factors: { weeklyLoad: number; wowChange: number; intensity: number; recoveryDays: number };
  recommendations: string[];
}

export interface AIAnalysis {
  sections: {
    intro: string; datiCorsa: string; classificazione: string;
    utilitaObiettivo: string; positivi: string[]; lacune: string[];
    realityCheck: string; consigliTecnici: string[]; voto: number;
  };
  model: 'gemini-1.5-flash' | 'algorithmic-fallback';
  timestamp: string;
}

export interface CreateRunData {
  date: string; distance: number; duration?: number; pace?: string;
  avgHeartRate?: number; maxHeartRate?: number; type: string;
  location?: string; notes?: string;
}

export interface AdaptationResult {
  adapted: boolean; changes: any[]; message: string;
}

export interface SyncResult {
  synced: number; newRuns: Run[]; adaptations: any[];
}

export const api = new ApiClient();
export default api;
