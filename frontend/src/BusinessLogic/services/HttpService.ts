const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/otp-verify']

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
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    }
    const token = localStorage.getItem('jwt_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  private handleUnauthorized(): void {
    localStorage.removeItem('jwt_token')
    if (!PUBLIC_PATHS.includes(window.location.pathname)) {
      window.location.href = '/login'
    }
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) {
      this.handleUnauthorized()
      throw new Error('Unauthorized')
    }
    const data = await res.json() as any
    if (data?.token) localStorage.setItem('jwt_token', data.token)
    if (data?.accessToken) localStorage.setItem('jwt_token', data.accessToken)
    return data as T
  }

  async post<T = unknown>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return this.parseResponse<T>(res)
  }

  async get<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    })
    return this.parseResponse<T>(res)
  }

  async put<T = unknown>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return this.parseResponse<T>(res)
  }

  async patch<T = unknown>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return this.parseResponse<T>(res)
  }

  async delete<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    })
    return this.parseResponse<T>(res)
  }

  async postMultipart<T = unknown>(url: string, formData: FormData): Promise<T> {
    const token = localStorage.getItem('jwt_token')
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    })
    return this.parseResponse<T>(res)
  }
}

export const http = HttpService.getInstance()