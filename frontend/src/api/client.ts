import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      if (!this.accessToken && !config.url?.includes('/auth/')) {
        await this.ensureAuth();
      }
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            if (this.refreshToken) {
              const res = await axios.post(`${API_BASE}/auth/refresh`, {
                refresh_token: this.refreshToken,
              });
              this.setTokens(res.data.access_token, res.data.refresh_token);
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.client(originalRequest);
            } else {
              await this.ensureAuth();
              if (this.accessToken) {
                originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
                return this.client(originalRequest);
              }
            }
          } catch {
            this.clearTokens();
          }
        }
        return Promise.reject(error);
      }
    );

    // Load tokens from localStorage on init
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async ensureAuth() {
    if (this.accessToken) return this.accessToken;
    try {
      const defaultWallet = "GDEMO7V3KXYZ2026TRADEMENTORSTELLARTESTNETKEY99999999999999";
      const res = await axios.post(`${API_BASE}/auth/login?wallet_address=${defaultWallet}`);
      if (res.data?.access_token) {
        this.setTokens(res.data.access_token, res.data.refresh_token);
        return res.data.access_token;
      }
    } catch {
      // Ignored
    }
    return null;
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken() {
    return this.accessToken;
  }

  // Auth
  async register(walletAddress: string, username: string, password: string) {
    const res = await this.client.post('/auth/register', { wallet_address: walletAddress, username, password });
    this.setTokens(res.data.access_token, res.data.refresh_token);
    return res.data;
  }

  async login(walletAddress: string, password: string) {
    const res = await this.client.post('/auth/login', null, {
      params: { wallet_address: walletAddress, password },
    });
    this.setTokens(res.data.access_token, res.data.refresh_token);
    return res.data;
  }

  async logout() {
    this.clearTokens();
  }

  // Strategies
  async getStrategies() {
    const res = await this.client.get('/strategies/');
    return res.data;
  }

  async createStrategy(data: {
    name: string;
    entry_rules: string[];
    exit_rules: string[];
    risk_percent: number;
    reward_ratio?: number;
    market?: string;
    timeframe?: string;
  }) {
    const res = await this.client.post('/strategies/', data);
    return res.data;
  }

  async getStrategy(id: string) {
    const res = await this.client.get(`/strategies/${id}`);
    return res.data;
  }

  async updateStrategy(id: string, data: Partial<{
    name: string;
    entry_rules: string[];
    exit_rules: string[];
    risk_percent: number;
    reward_ratio: number;
    market: string;
    timeframe: string;
    status: string;
  }>) {
    const res = await this.client.put(`/strategies/${id}`, data);
    return res.data;
  }

  async deleteStrategy(id: string) {
    const res = await this.client.delete(`/strategies/${id}`);
    return res.data;
  }

  // Trades
  async getTrades() {
    const res = await this.client.get('/trades/');
    return res.data;
  }

  async createTrade(data: {
    strategy_id: string;
    symbol: string;
    side: 'Long' | 'Short';
    entry: number;
    exit: number;
    stop_loss: number;
    take_profit: number;
    risk_percent: number;
    emotion?: string;
    notes?: string;
    chart_url?: string;
  }) {
    const res = await this.client.post('/trades/', data);
    return res.data;
  }

  async getTrade(id: string) {
    const res = await this.client.get(`/trades/${id}`);
    return res.data;
  }

  async reviewTrade(id: string, review: {
    score?: number;
    outcome_r?: number;
    summary?: string;
    followed?: string[];
    violated?: string[];
    risk_feedback?: string;
    psychology?: string;
    next_step?: string;
  }) {
    const res = await this.client.post(`/trades/${id}/review`, review);
    return res.data;
  }

  // AI
  async analyzeTrade(data: { notes: string; symbol: string; timeframe: string }) {
    const res = await this.client.post('/ai/analyze-trade', data);
    return res.data;
  }

  async explainChartImage(file: File, symbol: string, timeframe: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('symbol', symbol);
    formData.append('timeframe', timeframe);
    const res = await this.client.post('/ai/explain-chart-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async coachStrategy(data: { notes: string; symbol: string; timeframe: string }) {
    const res = await this.client.post('/ai/coach-strategy', data);
    return res.data;
  }

  async weeklyReport(data: { notes: string }) {
    const res = await this.client.post('/ai/weekly-report', data);
    return res.data;
  }

  // Challenges
  async getChallenges() {
    const res = await this.client.get('/challenges/');
    return res.data;
  }

  async getActiveChallenges() {
    const res = await this.client.get('/challenges/user/active');
    return res.data;
  }

  async getCompletedChallenges() {
    const res = await this.client.get('/challenges/user/completed');
    return res.data;
  }

  async getChallenge(id: string) {
    const res = await this.client.get(`/challenges/${id}`);
    return res.data;
  }

  async getChallengeProgress(id: string) {
    const res = await this.client.get(`/challenges/${id}/progress`);
    return res.data;
  }

  async joinChallenge(id: string) {
    const res = await this.client.post(`/challenges/${id}/join`);
    return res.data;
  }

  async evaluateChallenges() {
    const res = await this.client.post('/challenges/evaluate');
    return res.data;
  }

  // Reputation
  async getReputation() {
    const res = await this.client.get('/reputation/');
    return res.data;
  }

  async getReputationByUser(userId: string) {
    const res = await this.client.get(`/reputation/${userId}`);
    return res.data;
  }

  async getLeaderboard(limit = 10) {
    const res = await this.client.get('/reputation/leaderboard', { params: { limit } });
    return res.data;
  }

  async getReputationStats() {
    const res = await this.client.get('/reputation/stats');
    return res.data;
  }

  // Health
  async health() {
    const res = await this.client.get('/health/');
    return res.data;
  }

  async healthDb() {
    const res = await this.client.get('/health/db');
    return res.data;
  }
}

export const api = new ApiClient();
export default api;