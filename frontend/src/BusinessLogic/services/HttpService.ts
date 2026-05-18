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
    return {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    }
  }

  private handleUnauthorized(): void {
    if (!PUBLIC_PATHS.includes(window.location.pathname)) {
      window.location.href = '/login'
    }
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) {
      this.handleUnauthorized()
      throw new Error('Unauthorized')
    }
    return res.json() as Promise<T>
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
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
      body: formData,
    })
    return this.parseResponse<T>(res)
  }
}

export const http = HttpService.getInstance()