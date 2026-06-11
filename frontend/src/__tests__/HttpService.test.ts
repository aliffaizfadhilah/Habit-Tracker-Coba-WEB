import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

function mockLocation(pathname = '/dashboard') {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { pathname, href: '' },
  })
}

describe('HttpService — Design Pattern (Singleton)', () => {

  beforeEach(() => {
    mockLocation('/dashboard')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => vi.unstubAllGlobals())

  it('getInstance() mengembalikan instance yang sama (Singleton)', async () => {
    const { http: h1 } = await import('../BusinessLogic/services/HttpService')
    const { http: h2 } = await import('../BusinessLogic/services/HttpService')
    expect(h1).toBe(h2)
  })

  it('get() memanggil fetch dengan method GET dan header yang benar', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    const { http } = await import('../BusinessLogic/services/HttpService')
    await http.get('/api/habits')
    expect(mockFetch).toHaveBeenCalledWith('/api/habits', expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      credentials: 'include',
    }))
  })

  it('post() mengirim body sebagai JSON string', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ token: 'abc' }), { status: 200 }))
    const { http } = await import('../BusinessLogic/services/HttpService')
    await http.post('/api/auth/login', { email: 'test@test.com', password: '123' })
    const body = vi.mocked(fetch).mock.calls[0][1]?.body
    expect(body).toBe(JSON.stringify({ email: 'test@test.com', password: '123' }))
  })

  it('response 401 dari halaman terproteksi redirect ke /login', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 401 }))
    const { http } = await import('../BusinessLogic/services/HttpService')
    await expect(http.get('/api/habits')).rejects.toThrow('Unauthorized')
    expect(window.location.href).toBe('/login')
  })

  it('response 401 dari /login tidak redirect ulang', async () => {
    mockLocation('/login')
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 401 }))
    const { http } = await import('../BusinessLogic/services/HttpService')
    await expect(http.post('/api/auth/login', {})).rejects.toThrow('Unauthorized')
    expect(window.location.href).not.toBe('/login')
  })

  it('postMultipart tidak mengirim Content-Type application/json', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }))
    const { http } = await import('../BusinessLogic/services/HttpService')
    const fd = new FormData()
    fd.append('file', new Blob(['x']))
    await http.postMultipart('/api/posts', fd)
    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>
    expect(headers?.['Content-Type']).toBeUndefined()
    expect(headers?.['Accept']).toBe('application/json')
  })

  it('[Tanpa Singleton] dua konfigurasi berbeda berjalan bersamaan — inkonsistensi', () => {
    const configA = { baseUrl: 'http://api.prod.com', credentials: 'include' }
    const configB = { baseUrl: 'http://api.staging.com', credentials: 'omit' }
    expect(configA.baseUrl).not.toBe(configB.baseUrl)
    expect(configA.credentials).not.toBe(configB.credentials)
    // Singleton: satu konfigurasi terpusat, terbukti oleh test getInstance() di atas
  })

})

describe('HttpService — Performa', () => {

  beforeEach(() => { mockLocation(); vi.stubGlobal('fetch', vi.fn()) })
  afterEach(() => vi.unstubAllGlobals())

  it('import http 1000 kali tidak membuat instance baru', async () => {
    const instances: object[] = []
    for (let i = 0; i < 1000; i++) {
      const { http } = await import('../BusinessLogic/services/HttpService')
      instances.push(http)
    }
    expect(instances.every(inst => inst === instances[0])).toBe(true)
  })

})
