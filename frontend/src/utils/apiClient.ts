import { AuthUser, HospitalIssue, InventoryItem, DailyIntelligenceReport, NaturalLanguageQueryResponse } from '../types/dashboard';

const API_BASE_URL = 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async fetch(endpoint: string, options: RequestInit = {}, retries = 3): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (e: any) {
      if (options.method && options.method !== 'GET') {
        // Simple offline queueing for POST/PATCH
        console.warn(`Network failure on ${options.method} ${endpoint}. Queueing request offline.`);
        this.saveOfflineRequest({ endpoint, options });
        return { status: 'queued', message: 'Saved offline. Will sync when network returns.' };
      }
      
      if (retries > 0) {
        console.warn(`Fetch failed (${endpoint}). Retrying in 1s... (${retries} left)`);
        await new Promise(res => setTimeout(res, 1000));
        return this.fetch(endpoint, options, retries - 1);
      }
      throw e;
    }
  }

  private saveOfflineRequest(req: any) {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    queue.push(req);
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
  }

  // Auth
  async login(payload: any): Promise<any> {
    const data = await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<AuthUser> {
    return this.fetch('/auth/me');
  }

  // Issues
  async getIssues(): Promise<HospitalIssue[]> {
    const data = await this.fetch('/issues');
    return data.issues || [];
  }

  async createIssue(payload: any): Promise<HospitalIssue> {
    return this.fetch('/issues', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resolveIssue(issueId: string): Promise<HospitalIssue> {
    return this.fetch(`/issues/${issueId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'resolved' }),
    });
  }

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    const data = await this.fetch('/inventory');
    return data.inventory || [];
  }

  // Reports
  async getDailyReport(): Promise<DailyIntelligenceReport> {
    return this.fetch('/reports/daily');
  }

  async queryNetworkState(query: string): Promise<NaturalLanguageQueryResponse> {
    return this.fetch('/reports/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }
}

export const api = new ApiClient();
