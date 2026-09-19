// API Client configured for CohortForge FastAPI backend (/api/v1)
// Automatically detects live backend and falls back to demo preview if offline

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export type AppDataSourceMode = 'demo_preview' | 'connected_api';

function extractErrorMessage(errData: any, status: number): string {
  const detail = errData?.error?.details?.[0]?.issue;
  const message = errData?.error?.message;
  if (message && detail && !message.includes(detail)) {
    return `${message} (${detail})`;
  }
  return message || detail || `HTTP Error: ${status}`;
}

class ApiClient {
  private baseUrl: string;
  private mode: AppDataSourceMode = 'demo_preview';
  private listeners: ((mode: AppDataSourceMode) => void)[] = [];
  private hasInitialized: boolean = false;

  constructor() {
    this.baseUrl = API_BASE_URL;
    const saved = sessionStorage.getItem('healthgrid_data_mode');
    if (saved === 'connected_api' || saved === 'demo_preview') {
      this.mode = saved;
    }
    this.checkHealthAndAutoConnect();
  }

  public async checkHealthAndAutoConnect(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          // If no explicit manual toggle was made, default to connected_api when backend is alive
          const saved = sessionStorage.getItem('healthgrid_data_mode');
          if (!saved || saved === 'connected_api') {
            this.setMode('connected_api');
          }
          this.hasInitialized = true;
          return true;
        }
      }
    } catch {
      // Offline fallback
    }
    this.hasInitialized = true;
    return false;
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

  public getArtifactUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // If path starts with /api/v1, use it directly or with baseUrl
    if (cleanPath.startsWith('/api/v1')) {
      return cleanPath;
    }
    return `${this.baseUrl}${cleanPath}`;
  }

  public async get<T>(endpoint: string): Promise<{ data: T; isLive: boolean }> {
    if (this.mode === 'connected_api') {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(extractErrorMessage(errData, res.status));
        }
        const data = await res.json();
        return { data, isLive: true };
      } catch (err) {
        console.warn(`[CohortForge API] GET ${endpoint} failed.`, err);
        throw err;
      }
    }
    throw new Error('DEMO_MODE_ACTIVE');
  }

  public async post<T, B = unknown>(endpoint: string, body?: B): Promise<{ data: T; isLive: boolean }> {
    if (this.mode === 'connected_api') {
      try {
        const options: RequestInit = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        };
        if (body !== undefined) {
          options.body = JSON.stringify(body);
        }
        const res = await fetch(`${this.baseUrl}${endpoint}`, options);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(extractErrorMessage(errData, res.status));
        }
        const data = await res.json();
        return { data, isLive: true };
      } catch (err) {
        console.warn(`[CohortForge API] POST ${endpoint} failed.`, err);
        throw err;
      }
    }
    throw new Error('DEMO_MODE_ACTIVE');
  }

  public async put<T, B = unknown>(endpoint: string, body: B): Promise<{ data: T; isLive: boolean }> {
    if (this.mode === 'connected_api') {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(extractErrorMessage(errData, res.status));
        }
        const data = await res.json();
        return { data, isLive: true };
      } catch (err) {
        console.warn(`[CohortForge API] PUT ${endpoint} failed.`, err);
        throw err;
      }
    }
    throw new Error('DEMO_MODE_ACTIVE');
  }

  public async postFormData<T>(endpoint: string, formData: FormData): Promise<{ data: T; isLive: boolean }> {
    if (this.mode === 'connected_api') {
      try {
        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(extractErrorMessage(errData, res.status));
        }
        const data = await res.json();
        return { data, isLive: true };
      } catch (err) {
        console.warn(`[CohortForge API] Form POST ${endpoint} failed.`, err);
        throw err;
      }
    }
    throw new Error('DEMO_MODE_ACTIVE');
  }
}

export const apiClient = new ApiClient();

