// ─── HttpService — Singleton Pattern ──────────────────────────────────────────
// Satu instance HTTP client digunakan di seluruh aplikasi.
// Semua konfigurasi headers & credentials terpusat di sini.

class HttpService {
  private static instance: HttpService
  private baseHeaders: HeadersInit = { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  private constructor() {}

  static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService()
    }
    return HttpService.instance
  }

  private getHeaders(): HeadersInit {
    const headers = { ...this.baseHeaders } as any
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async post<T = unknown>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return res.json() as Promise<T>
  }

  async put<T = unknown>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return res.json() as Promise<T>
  }

  async delete<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    })
    return res.json() as Promise<T>
  }

  async get<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })
    return res.json() as Promise<T>
  }
}

export const http = HttpService.getInstance()