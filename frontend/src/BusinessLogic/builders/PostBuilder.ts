export type FrameStyle = 'rect' | 'circle' | 'ring'

export interface PostPayload {
  title:            string
  caption:          string
  image:            Blob
  habitId?:         number
  habitTitle?:      string
  progressPercent?: number
  isPrivate:        boolean
  frameStyle:       FrameStyle
}

export class PostBuilder {
  private title           = ''
  private caption         = ''
  private image:          Blob | null = null
  private habitId?:       number
  private habitTitle?:    string
  private progressPercent?: number
  private isPrivate       = false
  private frameStyle: FrameStyle = 'rect'

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

  withPrivacy(isPrivate: boolean): this {
    this.isPrivate = isPrivate
    return this
  }

  withFrameStyle(style: FrameStyle): this {
    this.frameStyle = style
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
      isPrivate:       this.isPrivate,
      frameStyle:      this.frameStyle,
    }
  }
}
