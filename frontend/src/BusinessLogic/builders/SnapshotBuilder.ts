export type DiagramType  = 'donut' | 'arc'
export type ElementId    = 'title' | 'diagram' | 'stats' | 'branding'

export interface SnapshotElement {
  id:       ElementId
  x:        number    // % 0–100 from left (element centered on this point)
  y:        number    // % 0–100 from top  (element centered on this point)
  fontSize: number    // px – also drives diagram size
}

export interface SnapshotConfig {
  backgroundImage: string | null
  diagramType:     DiagramType
  elements:        SnapshotElement[]
}

export class SnapshotBuilder {
  private backgroundImage: string | null = null
  private diagramType:     DiagramType   = 'donut'
  private elements: SnapshotElement[] = [
    { id: 'title',    x: 50, y: 16, fontSize: 24 },
    { id: 'diagram',  x: 50, y: 44, fontSize: 14 },
    { id: 'stats',    x: 50, y: 74, fontSize: 13 },
    { id: 'branding', x: 50, y: 90, fontSize: 11 },
  ]

  withBackground(image: string): this {
    this.backgroundImage = image
    return this
  }

  withDiagramType(type: DiagramType): this {
    this.diagramType = type
    return this
  }

  withElementPosition(id: ElementId, x: number, y: number): this {
    const el = this.elements.find(e => e.id === id)
    if (el) { el.x = x; el.y = y }
    return this
  }

  withElementFontSize(id: ElementId, size: number): this {
    const el = this.elements.find(e => e.id === id)
    if (el) el.fontSize = Math.max(8, Math.min(48, size))
    return this
  }

  build(): SnapshotConfig {
    return {
      backgroundImage: this.backgroundImage,
      diagramType:     this.diagramType,
      elements:        this.elements.map(e => ({ ...e })),
    }
  }
}
