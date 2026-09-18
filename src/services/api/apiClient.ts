// API Client configured for future Node.js / Express backend integration
// Provides clean fallback to development fixtures when no backend is detected

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export type AppDataSourceMode = 'demo_preview' | 'connected_api';

class ApiClient {
  private baseUrl: string;
  private mode: AppDataSourceMode = 'demo_preview';
  private listeners: ((mode: AppDataSourceMode) => void)[] = [];

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Check if user previously toggled mode in session
    const saved = sessionStorage.getItem('healthgrid_data_mode');
    if (saved === 'connected_api' || saved === 'demo_preview') {
      this.mode = saved;
    }
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getMode(): AppDataSourceMode {
    return this.mode;
  }

  public setMode(newMode: AppDataSourceMode) {
    this.mode = newMode;
    sessionStorage.setItem('healthgrid_data_mode', newMode);
    this.listeners.forEach((cb) => cb(newMode));
  }

  public onModeChange(cb: (mode: AppDataSourceMode) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public async get<T>(endpoint: string): Promise<{ data: T; isLive: boolean }> {
    if (this.mode === 'connected_api') {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        return { data, isLive: true };
      } catch (err) {
        console.warn(`[HealthGrid API] Endpoint ${endpoint} failed or unreachable.`, err);
        throw err;
      }
    }

    // In demo preview mode, caller should serve fixtures
    throw new Error('DEMO_MODE_ACTIVE');
  }

  public async post<T, B = unknown>(endpoint: string, body: B): Promise<{ data: T; isLive: boolean }> {
    if (this.mode === 'connected_api') {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        return { data, isLive: true };
      } catch (err) {
        console.warn(`[HealthGrid API] POST ${endpoint} failed.`, err);
        throw err;
      }
    }

    throw new Error('DEMO_MODE_ACTIVE');
  }
}

export const apiClient = new ApiClient();
