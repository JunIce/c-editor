import Editor from "../editor"
import { calcuateNumber, computedTextMetries, logs } from "../utils"
import { PositionIdx } from "./Cursor"
import Text from "./Text"

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

export interface ParagraphCtx {
  type: "paragraph"
  editor: Editor
  content: Text[]
  height: number
  children: LineCtx[]
  renderChildren: any[]
  push: (line: LineCtx) => void
  delete: (from: number) => void
  deleteLine: (from: number) => void
  positionInParagraph: ({ x, y }: MouseXY) => boolean
  positionIn: ({ x, y }: MouseXY) => number | void
  metrics: {
    leftTop: number[]
    x: number
    y: number
  }
  getContentStrIndexByCursor: (cursor: Omit<PositionIdx, "p">) => number
  insertContent: (data: Text[] | string, index: number) => void
  _updateMetrics: () => void
  emptyLine: () => void
}

interface MouseXY {
  x: number
  y: number
}

interface PositionMetrics {
  leftTop: number[]
  rightTop: number[]
  leftBottom: number[]
  rightBottom: number[]
}

export interface LineCtx {
  type: "line"
  parent?: ParagraphCtx
  editor?: Editor
  children: RenderElement[]
  push: (text: RenderElement) => void
  positionIn: ({ x, y }: MouseXY) => void | number
  _updateMetrics: () => void
  metrics: PositionMetrics
}

export function createParagraph(editor: Editor) {
  return (content?: string) => {
    const paragraph: ParagraphCtx = {
      type: "paragraph",
      content: (content || "")
        .split("")
        .map((char) => new Text(char, editor.ctx)),
      height: 0,
      editor,
      children: [],
      renderChildren: [],
      metrics: {
        leftTop: [],
        x: 0,
        y: 0,
      },
      insertContent: (data: Text[] | string, index: number) => {
        if (typeof data === "string") {
          data = data.split("").map((char) => new Text(char, editor.ctx))
        }
        paragraph.content.splice(index, 0, ...data)
      },
      push: (line: LineCtx) => {
        line.parent = paragraph
        line.editor = paragraph.editor
        paragraph.children.push(line)
        paragraph._updateMetrics()
      },
      emptyLine: () => {
        paragraph.renderChildren.length = 0
      },
      deleteLine: (index: number) => {
        paragraph.children.splice(index, 1)
        paragraph._updateMetrics()
      },
      _updateMetrics: () => {
        const { width: renderWidth } = editor.renderSize
        const {
          metrics: { leftTop: firstLeftTop },
        } = paragraph.renderChildren[0]

        paragraph.metrics.leftTop = firstLeftTop
        paragraph.metrics.x = renderWidth
      },
      delete: (from: number) => {
        paragraph.content.splice(from, 1)
      },
      positionInParagraph: ({ x, y }: MouseXY) => {
        const first = paragraph.renderChildren[0]
        const { leftTop } = computedTextMetries(first)
        const renderWidth = editor.renderSize.width
        const renderHeight = paragraph.height

        return (
          x >= leftTop[0] &&
          x <= leftTop[0] + renderWidth &&
          y >= leftTop[1] &&
          y <= leftTop[1] + renderHeight
        )
      },
      positionIn: ({ x, y }: MouseXY) => {
        const texts = paragraph.renderChildren
        for (let i = 0; i < texts.length; i++) {
          const textIdx = texts[i].positionIn({ x, y })
          if (textIdx !== undefined) return textIdx === 1 ? i : i - 1
        }
        return texts.length - 1
      },
      getContentStrIndexByCursor: ({ i }) => {
        return i
      },
    }

    return paragraph
  }
}

export function createLine(editor: Editor) {
  return () => {
    const line: LineCtx = {
      type: "line",
      children: [],
      metrics: {
        leftTop: [],
        rightTop: [],
        leftBottom: [],
        rightBottom: [],
      },
      push: (text: RenderElement) => {
        line.children.push(text)
        line._updateMetrics()
      },
      _updateMetrics: () => {
        const first = line.children[0] as RenderElementText
        const last = line.children[
          line.children.length - 1
        ] as RenderElementText

        line.metrics.leftTop = [first.x, calcuateNumber(first.y - first.height)]
        line.metrics.rightTop = [
          last.x + last.width,
          calcuateNumber(last.y - last.height),
        ]
        line.metrics.leftBottom = [first.x, first.y]
        line.metrics.rightBottom = [last.x + last.width, last.y]

        if (line.parent) {
          line.parent._updateMetrics()
        }
      },
      positionIn: ({ x, y }: MouseXY) => {
        const { leftTop, rightBottom } = line.metrics

        if (
          x >= leftTop[0] &&
          x <= rightBottom[0] &&
          y >= leftTop[1] &&
          y <= rightBottom[1]
        ) {
          const texts = line.children as RenderElementText[]
          for (let i = 0; i < texts.length; i++) {
            const text = texts[i] as RenderElementText
            const { leftTop, rightBottom } = computedTextMetries(text)
            const { width } = text.metrics!
            const middleWidth = width / 2
            if (
              x >= leftTop[0] &&
              x <= rightBottom[0] &&
              y >= leftTop[1] &&
              y <= rightBottom[1]
            ) {
              // if click the middle before the text , the idx will be the sblings
              if (x < leftTop[0] + middleWidth) {
                return texts[i - 1].idx
              }
              return text.idx
            }
          }
        }
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
  idx?: number
  node: any
}

export const createRenderText = (editor: Editor) => {
  return ({
    value,
    metrics,
    width,
    height,
    x,
    y,
    node,
  }: any): RenderElementText => {
    const el = {
      type: "text",
      value: value,
      width,
      height,
      x,
      y,
      node,
      metrics,
      render: () => {
        const ctx = editor.ctx

        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = "#000"
        ctx.font = "16px 微软雅黑"
        ctx.textAlign = "left"
        // ctx.textBaseline = "ideographic"
        ctx.fillText(
          el.value,
          (el.x || 0) + editor.config.paddingX,
          (el.y || 0) + editor.config.paddingY
        )
        ctx.closePath()
        ctx.restore()
      },
      positionIn: ({ x, y }: MouseXY) => {
        const text = el
        const { leftTop, rightBottom } = computedTextMetries(text)
        const { width } = text.metrics!
        const middleWidth = width / 2
        if (
          x >= leftTop[0] &&
          x <= rightBottom[0] &&
          y >= leftTop[1] &&
          y <= rightBottom[1]
        ) {
          if (x < leftTop[0] + middleWidth) {
            return -1
          }
          return 1
        }
      },
    }

    return el
  }
}
