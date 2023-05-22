import Editor from "../editor"
import Base from "./Base"
import {
  ParagraphCtx,
  createLine,
  createParagraph,
  createRenderText,
} from "./CanvasCtx"
import Text from "./Text"

export interface RenderText {
  s: string
  x: number
  y: number
  metrics: TextMetrics
  textHeight?: number
  blockIndex: number
  textIndex: number
}

export default class BlockContainer extends Base {
  blocks: ParagraphCtx[]

  constructor(parent: Editor) {
    super(parent)
    this.blocks = []
  }

  addParagraph() {
    this.blocks.push(createParagraph())
  }

  push(data: string) {
    ;(data || "").split("\n").forEach((str) => {
      const paragraph = createParagraph(str)
      this.blocks.push(paragraph)
    })
  }

  deleteLast() {
    this.blocks.pop()
  }

  get renderBlocks(): ParagraphCtx[] {
    const ctxRenderWidth = this.config.width - 2 * this.config.paddingX
    let currentWidth = 0
    let currentHeight = this.config.paddingY

    for (let i = 0; i < this.blocks.length; i++) {
      const paragraph = this.blocks[i]

      const texts = paragraph.content
        .split("")
        .map((char) => new Text(char, this.ctx))

      if (texts.length === 0) continue
      let line = 0
      const firstText = texts[0] || 26

      let maxHeight =
        firstText.metrics.fontBoundingBoxAscent +
        firstText.metrics.fontBoundingBoxDescent
      let blockHeight = 0

      let lineCtx = createLine()
      paragraph.children[line] = lineCtx

      for (let j = 0; j < texts.length; j++) {
        const text = texts[j]

        if (currentWidth + text.metrics.width < ctxRenderWidth) {
          // offset
          if (blockHeight === 0) {
            blockHeight = maxHeight
          }

          lineCtx.push(
            createRenderText({
              value: text.char,
              x: Math.ceil(this.config.paddingX + currentWidth),
              y: Math.ceil(currentHeight + blockHeight),
              metrics: text.metrics,
            })
          )

          currentWidth += text.metrics.width
        } else {
          line++
          lineCtx = createLine()
          paragraph.children[line] = lineCtx
          blockHeight += maxHeight
          currentWidth = 0
        }
      }
      paragraph.height = blockHeight
      currentHeight += paragraph.height
      currentWidth = 0
    }

    return this.blocks
  }

  get lastBlock(): ParagraphCtx {
    return this.blocks[this.blocks.length - 1]
  }
}
