import Editor from "../editor"
import { computedTextMetries } from "../utils"

export function createCanvasCtx({
  width,
  height,
  dpr,
}: {
  width: number
  height: number
  dpr: number
}): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + "px"
  canvas.style.height = height + "px"
  ctx?.scale(dpr, dpr)
  canvas.style.border = "1px solid #ccc"
  return canvas
}

export interface RenderText {
  s: string
  x: number
  y: number
  metrics: TextMetrics
  textHeight?: number
  blockIndex: number
  textIndex: number
}

export interface ParagraphCtx {
  type: "paragraph"
  editor: Editor
  content: string
  height: number
  children: LineCtx[]
  push: (line: LineCtx) => void
  delete: () => void
  positionIn: ({ x, y }: MouseXY) => number[] | null
}

interface MouseXY {
  x: number
  y: number
}

export interface LineCtx {
  type: "line"
  parent?: ParagraphCtx
  editor?: Editor
  children: RenderElement[]
  push: (text: RenderElement) => void
  positionIn: ({ x, y }: MouseXY) => null | number
}

export function createParagraph(editor: Editor, content?: string) {
  const paragraph: ParagraphCtx = {
    type: "paragraph",
    content: content || "",
    height: 0,
    editor,
    children: [],
    push: (line: LineCtx) => {
      line.parent = paragraph
      line.editor = paragraph.editor
      paragraph.children.push(line)
    },
    delete: () => {
      paragraph.content = paragraph.content.slice(0, -1)
    },
    positionIn: ({ x, y }: MouseXY) => {
      const lines = paragraph.children

      let textIndex = -1
      let lineIdx = -1

      for (let i = 0; i < lines.length; i++) {
        const lineTextIndex = lines[i].positionIn({ x, y })
        if (lineTextIndex) {
          lineIdx = i
          textIndex = lineTextIndex
          break
        }
      }

      if (lineIdx > -1) return [lineIdx, textIndex]
      return null
    },
  }

  return paragraph
}

export function createLine() {
  const line: LineCtx = {
    type: "line",
    children: [],
    push: (text: RenderElement) => {
      line.children.push(text)
    },
    positionIn: ({ x, y }: MouseXY) => {
      const texts = line.children

      let idx = -1

      for (let i = 0; i < texts.length; i++) {
        const text = texts[i] as RenderElementText
        const { leftTop, leftBottom, rightTop } = computedTextMetries(text)

        if (
          x >= leftTop[0] &&
          x <= rightTop[0] &&
          y >= leftTop[1] &&
          y <= leftBottom[1]
        ) {
          idx = i
          break
        }
      }

      if (idx > -1) return idx
      return null
    },
  }

  return line
}

export interface RenderElement {
  type: string
  render: (ctx: CanvasRenderingContext2D) => void
}

export interface RenderElementText extends RenderElement {
  value: string
  metrics?: TextMetrics
  pos: {
    x: number
    y: number
  }
}

export function createRenderText({
  value,
  x,
  y,
  metrics,
}: {
  value: string
  x: number
  y: number
  metrics?: TextMetrics
}) {
  const el: RenderElementText = {
    type: "text",
    value: value,
    pos: {
      x,
      y,
    },
    metrics,
    render: (ctx: CanvasRenderingContext2D) => {
      ctx.save()
      ctx.fillStyle = "#000"
      ctx.font = "normal 16px Aria"
      ctx.fillText(el.value, el.pos.x, el.pos.y)
      ctx.restore()
    },
  }

  return el
}
