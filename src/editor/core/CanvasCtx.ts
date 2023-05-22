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
  content: string
  height: number
  children: LineCtx[]
  push: (line: LineCtx) => void
  delete: () => void
}

export interface LineCtx {
  type: "line"
  children: RenderText[]
  push: (text: RenderText) => void
}

export function createParagraph(content?: string) {
  const paragraph: ParagraphCtx = {
    type: "paragraph",
    content: content || "",
    height: 0,
    children: [],
    push: (line: LineCtx) => {
      paragraph.children.push(line)
    },
    delete: () => {
      paragraph.content = paragraph.content.slice(0, -1)
    },
  }

  return paragraph
}

export function createLine() {
  const line: LineCtx = {
    type: "line",
    children: [],
    push: (text: RenderText) => {
      line.children.push(text)
    },
  }

  return line
}
