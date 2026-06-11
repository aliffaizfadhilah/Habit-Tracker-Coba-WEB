import { describe, it, expect } from 'vitest'
import { PostBuilder } from '../BusinessLogic/builders/PostBuilder'

const fakeBlob = new Blob(['img'], { type: 'image/png' })

describe('PostBuilder — Design Pattern (Builder)', () => {

  it('build() berhasil dengan title dan image yang valid', () => {
    const payload = new PostBuilder()
      .withTitle('Streak 30 hari!')
      .withCaption('Konsisten setiap hari')
      .withImage(fakeBlob)
      .withHabit(1, 'Olahraga', 75)
      .withPrivacy(false)
      .withFrameStyle('rect')
      .build()
    expect(payload.title).toBe('Streak 30 hari!')
    expect(payload.caption).toBe('Konsisten setiap hari')
    expect(payload.image).toBe(fakeBlob)
    expect(payload.habitId).toBe(1)
    expect(payload.habitTitle).toBe('Olahraga')
    expect(payload.progressPercent).toBe(75)
    expect(payload.isPrivate).toBe(false)
    expect(payload.frameStyle).toBe('rect')
  })

  it('build() melempar error jika image tidak ada', () => {
    expect(() => new PostBuilder().withTitle('Test').build())
      .toThrow('Gambar snapshot wajib ada.')
  })

  it('build() melempar error jika title kosong/spasi', () => {
    expect(() => new PostBuilder().withImage(fakeBlob).withTitle('   ').build())
      .toThrow('Judul postingan wajib diisi.')
  })

  it('field habit bersifat opsional', () => {
    const payload = new PostBuilder().withTitle('Post tanpa habit').withImage(fakeBlob).build()
    expect(payload.habitId).toBeUndefined()
    expect(payload.habitTitle).toBeUndefined()
    expect(payload.progressPercent).toBeUndefined()
  })

  it('frameStyle default adalah rect', () => {
    const payload = new PostBuilder().withTitle('Test').withImage(fakeBlob).build()
    expect(payload.frameStyle).toBe('rect')
  })

  it('isPrivate default adalah false', () => {
    const payload = new PostBuilder().withTitle('Test').withImage(fakeBlob).build()
    expect(payload.isPrivate).toBe(false)
  })

  it('method chaining mengembalikan this', () => {
    const b = new PostBuilder()
    expect(b.withTitle('x')).toBe(b)
    expect(b.withImage(fakeBlob)).toBe(b)
    expect(b.withCaption('c')).toBe(b)
    expect(b.withPrivacy(true)).toBe(b)
    expect(b.withFrameStyle('circle')).toBe(b)
  })

  it('[Tanpa Builder] objek manual tidak punya validasi otomatis — image null lolos', () => {
    const manual = { title: 'Manual', image: null, isPrivate: false, frameStyle: 'rect' }
    expect(manual.image).toBeNull() // bug silent

    // Builder menangkap error ini
    expect(() => new PostBuilder().withTitle('Manual').build())
      .toThrow('Gambar snapshot wajib ada.')
  })

})

describe('PostBuilder — Performa', () => {

  it('membuat 1000 payload dalam waktu < 30ms', () => {
    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      new PostBuilder().withTitle(`Post ${i}`).withImage(fakeBlob).withHabit(i, `Habit ${i}`, i % 100).build()
    }
    expect(performance.now() - start).toBeLessThan(30)
  })

  it('dua instance PostBuilder independen', () => {
    const b1 = new PostBuilder().withTitle('A').withImage(fakeBlob)
    const b2 = new PostBuilder().withTitle('B').withImage(fakeBlob)
    expect(b1.build().title).toBe('A')
    expect(b2.build().title).toBe('B')
  })

})
