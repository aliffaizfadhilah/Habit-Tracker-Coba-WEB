import { http } from './HttpService'
import type { PostPayload } from '../builders/PostBuilder'

export interface PostUser {
  id:              number
  username:        string
  full_name:       string | null
  profile_picture: string | null
}

export interface Post {
  id:               number
  title:            string
  caption:          string | null
  image_url:        string
  habit_title:      string | null
  progress_percent: string | null
  likes_count:      number
  comments_count:   number
  liked_by_me:      boolean
  is_mine:          boolean
  is_private:       boolean
  frame_style:      'rect' | 'circle' | 'ring'
  created_at:       string
  user:             PostUser
}

export interface PostComment {
  id:         number
  content:    string
  created_at: string
  user:       PostUser
}

class PostService {
  private static instance: PostService
  private constructor() {}

  static getInstance(): PostService {
    if (!PostService.instance) PostService.instance = new PostService()
    return PostService.instance
  }

  async getById(id: number): Promise<Post | null> {
    const res = await http.get<{ success: boolean; data: Post }>(`/api/posts/${id}`)
    return res.success ? res.data : null
  }

  async getPosts(): Promise<Post[]> {
    const res = await http.get<{ success: boolean; data: Post[] }>('/api/posts')
    return res.success ? res.data : []
  }

  async getMyPosts(): Promise<Post[]> {
    const res = await http.get<{ success: boolean; data: Post[] }>('/api/posts?mine=1')
    return res.success ? res.data : []
  }

  async getPostsSince(sinceId: number): Promise<Post[]> {
    const res = await http.get<{ success: boolean; data: Post[] }>(`/api/posts?since=${sinceId}`)
    return res.success ? res.data : []
  }

  async createPost(payload: PostPayload): Promise<{ success: boolean; data?: Post; message?: string }> {
    const form = new FormData()
    form.append('title',   payload.title)
    form.append('caption', payload.caption)
    form.append('image',   payload.image, 'snapshot.png')
    if (payload.habitId        != null) form.append('habit_id',          String(payload.habitId))
    if (payload.habitTitle     != null) form.append('habit_title',        payload.habitTitle)
    if (payload.progressPercent != null) form.append('progress_percent', String(payload.progressPercent))
    form.append('is_private',   payload.isPrivate ? '1' : '0')
    form.append('frame_style',  payload.frameStyle)

    try {
      const res = await http.postMultipart<{ success: boolean; data?: Post; message?: string }>(
        '/api/posts', form
      )
      return res
    } catch {
      return { success: false, message: 'Gagal mengunggah postingan.' }
    }
  }

  async deletePost(id: number): Promise<{ success: boolean; message?: string }> {
    return http.delete<{ success: boolean; message?: string }>(`/api/posts/${id}`)
  }

  async toggleLike(id: number): Promise<{ success: boolean; liked: boolean; likes_count: number }> {
    return http.post<{ success: boolean; liked: boolean; likes_count: number }>(
      `/api/posts/${id}/like`, {}
    )
  }

  async getComments(postId: number): Promise<PostComment[]> {
    const res = await http.get<{ success: boolean; data: PostComment[] }>(
      `/api/posts/${postId}/comments`
    )
    return res.success ? res.data : []
  }

  async addComment(postId: number, content: string): Promise<{ success: boolean; data?: PostComment; message?: string }> {
    return http.post<{ success: boolean; data?: PostComment; message?: string }>(
      `/api/posts/${postId}/comments`, { content }
    )
  }

  async deleteComment(postId: number, commentId: number): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(`/api/posts/${postId}/comments/${commentId}`)
  }
}

export const postService = PostService.getInstance()
