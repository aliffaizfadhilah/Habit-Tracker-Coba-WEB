export interface PostPayload {
  title:           string
  caption:         string
  image:           Blob
  habitId?:        number
  habitTitle?:     string
  progressPercent?: number
}

export class PostBuilder {
  private title           = ''
  private caption         = ''
  private image:          Blob | null = null
  private habitId?:       number
  private habitTitle?:    string
  private progressPercent?: number

  withTitle(title: string): this {
    this.title = title
    return this
  }

  withCaption(caption: string): this {
    this.caption = caption
    return this
  }

  withImage(blob: Blob): this {
    this.image = blob
    return this
  }

  withHabit(id: number, title: string, progress: number): this {
    this.habitId         = id
    this.habitTitle      = title
    this.progressPercent = progress
    return this
  }

  build(): PostPayload {
    if (!this.image)        throw new Error('Gambar snapshot wajib ada.')
    if (!this.title.trim()) throw new Error('Judul postingan wajib diisi.')
    return {
      title:           this.title,
      caption:         this.caption,
      image:           this.image,
      habitId:         this.habitId,
      habitTitle:      this.habitTitle,
      progressPercent: this.progressPercent,
    }
  }
}
