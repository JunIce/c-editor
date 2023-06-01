import Editor from "../editor"
import { computedTextMetries } from "../utils"
import { PositionIdx } from "./Cursor"

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
  delete: (from?: number) => void
  deleteLine: (from: number) => void
  positionIn: ({ x, y }: MouseXY) => number[] | null
  lastCursorPosition: () => Omit<PositionIdx, "p">
  posMatrix: number[][]
  getContentStrIndexByCursor: (cursor: Omit<PositionIdx, "p">) => number
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
    posMatrix: [],
    push: (line: LineCtx) => {
      line.parent = paragraph
      line.editor = paragraph.editor
      paragraph.children.push(line)
    },
    deleteLine: (index: number) => {
      paragraph.children.splice(index, 1)
    },
    delete: (from?: number) => {
      if (from) {
        paragraph.content =
          paragraph.content.slice(0, from) + paragraph.content.slice(from + 1)
      } else {
        paragraph.content = paragraph.content.slice(0, -1)
      }
    },
    lastCursorPosition: () => {
      return {
        l: paragraph.children.length - 1,
        i:
          paragraph.children[paragraph.children.length - 1].children.length - 1,
      }
    },
    positionIn: ({ x, y }: MouseXY) => {
      const lines = paragraph.children

      let textIndex = -1
      let lineIdx = -1

      for (let i = 0; i < lines.length; i++) {
        const lineTextIndex = lines[i].positionIn({ x, y })
        if (lineTextIndex !== null) {
          lineIdx = i
          textIndex = lineTextIndex
          break
        }
      }

      if (lineIdx > -1) return [lineIdx, textIndex]
      return null
    },
    getContentStrIndexByCursor: ({ l, i }) => {
      const lines = paragraph.children
      let idx = i
      while (--l >= 0) {
        idx += lines[l].children.length
      }
      return idx
    },
  }

  return paragraph
}

export function createLine(editor: Editor) {
  return () => {
    const line: LineCtx = {
      type: "line",
      children: [],
      push: (text: RenderElement) => {
        line.children.push(text)
      },
      positionIn: ({ x, y }: MouseXY) => {
        const texts = line.children
        const offsetX = editor.config.paddingX
        const offsetY = editor.config.paddingY

        let idx: number | null = null

        for (let i = 0; i < texts.length; i++) {
          const text = texts[i] as RenderElementText
          const { leftTop, leftBottom, rightTop } = computedTextMetries(text)

          const { width } = text.metrics!
          const middleWidth = width / 2
          if (
            x - offsetX >= leftTop[0] &&
            x - offsetX <= rightTop[0] &&
            y - offsetY >= leftTop[1] &&
            y - offsetY <= leftBottom[1]
          ) {
            idx = i
            // if click the middle before the text , the idx will be the sblings
            if (x < leftTop[0] + middleWidth) {
              idx -= 1
            }

            break
          }
        }

        return idx
      },
    }

    return line
  }
}

export interface RenderElement {
  type: string
  render: (x?: number, y?: number) => void
}

export interface RenderElementText extends RenderElement {
  value: string
  metrics?: TextMetrics
  width: number
  height: number
  x: number
  y: number
}

export const createRenderText = (editor: Editor) => {
  return ({ value, metrics, width, height, x, y }: any) => {
    const el = {
      type: "text",
      value: value,
      width,
      height,
      x,
      y,
      metrics,
      render: (x?: number, y?: number) => {
        const ctx = editor.ctx

        ctx.save()
        ctx.fillStyle = "#000"
        ctx.font = "16px 微软雅黑"
        ctx.fillText(
          el.value,
          ((x ? x : el.x) || 0) + editor.config.paddingX,
          ((y ? y : el.y) || 0) + editor.config.paddingY
        )
        ctx.restore()
      },
    }

    return el
  }
}
