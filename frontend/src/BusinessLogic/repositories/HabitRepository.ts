import { http } from '../services/HttpService'
import type { HabitGridItem, HabitFormData } from '../factories/HabitFormFactory'

class HabitRepository {
  private cache: HabitGridItem[] | null = null

  async getAll(): Promise<HabitGridItem[]> {
    if (this.cache !== null) return this.cache
    const res = await http.get<{ success: boolean; data: HabitGridItem[] }>('/api/habits')
    if (!res.success) throw new Error('Gagal memuat data habit.')
    this.cache = res.data
    return this.cache
  }

  async create(payload: object): Promise<{ success: boolean; message: string }> {
    const res = await http.post<{ success: boolean; message: string }>('/api/habits', payload)
    if (res.success) this.invalidate()
    return res
  }

  async update(id: number, payload: object): Promise<{ success: boolean; message: string }> {
    const res = await http.put<{ success: boolean; message: string }>(`/api/habits/${id}`, payload)
    if (res.success) this.invalidate()
    return res
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const res = await http.delete<{ success: boolean; message: string }>(`/api/habits/${id}`)
    if (res.success) this.invalidate()
    return res
  }

  invalidate(): void {
    this.cache = null
  }
}

export const habitRepository = new HabitRepository()
