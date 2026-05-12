
class HttpService {
  private static instance: HttpService
  private baseHeaders: HeadersInit = { 'Content-Type': 'application/json' }

  private constructor() {}

  static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService()
    }
    return HttpService.instance
  }

  async post<T = unknown>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: this.baseHeaders,
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return res.json() as Promise<T>
  }

  async get<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'GET',
      headers: this.baseHeaders,
      credentials: 'include',
    })
    return res.json() as Promise<T>
  }
  async put<T = unknown>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.baseHeaders,
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return res.json() as Promise<T>
  }
  async delete<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.baseHeaders,
      credentials: 'include',
    })
    return res.json() as Promise<T>
  }
}

export const http = HttpService.getInstance()