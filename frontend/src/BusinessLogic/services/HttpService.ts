class HttpService {
  private static instance: HttpService
  private constructor() {}

  static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService()
    }
    return HttpService.instance
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    const token = localStorage.getItem('jwt_token')
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
    const data = await res.json() as any
    if (data?.token) localStorage.setItem('jwt_token', data.token)
    if (data?.accessToken) localStorage.setItem('jwt_token', data.accessToken)
    return data as T
  }

  async get<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
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
}

export const http = HttpService.getInstance()