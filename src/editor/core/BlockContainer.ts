import Editor from "../editor"
import Base from "./Base"
import { BlockContext, createBlockContext } from "./Block"
import { ParagraphCtx, createLine, createParagraph } from "./CanvasCtx"
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
  blocks: BlockContext[]

  constructor(parent: Editor) {
    super(parent)
    this.blocks = []
  }

  push(data: string) {
    let currentBlock = createBlockContext()
    this.blocks.push(currentBlock)
    ;(data || "").split("").forEach((char) => {
      if (/\n/.test(char)) {
        currentBlock = createBlockContext()
        this.blocks.push(currentBlock)
      } else {
        const text = new Text(char, this.ctx)
        currentBlock.push(text)
      }
    })
  }

  deleteLast() {
    this.blocks.pop()
  }

  get renderBlocks(): ParagraphCtx[] {
    const renderData: ParagraphCtx[] = []

    const ctxRenderWidth = this.config.width - 2 * this.config.paddingX
    let currentWidth = 0
    let currentHeight = this.config.paddingY

    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]
      const texts = block.texts
      const paragraph = createParagraph()
      renderData.push(paragraph)

      let line = 0
      const firstText = texts[0] || 26

      let maxHeight =
        firstText.metrics.fontBoundingBoxAscent +
        firstText.metrics.fontBoundingBoxDescent
      let blockHeight = 0

      let lineCtx = createLine()
      paragraph.push(lineCtx)

      for (let j = 0; j < texts.length; j++) {
        const text = texts[j]

        if (currentWidth + text.metrics.width < ctxRenderWidth) {
          // offset
          if (blockHeight === 0) {
            blockHeight = maxHeight
          }

          lineCtx.push({
            blockIndex: i,
            textIndex: j,
            s: text.char,
            textHeight: maxHeight,
            x: Math.ceil(this.config.paddingX + currentWidth),
            y: Math.ceil(currentHeight + blockHeight),
            metrics: text.metrics,
          })

          currentWidth += text.metrics.width
        } else {
          line++
          lineCtx = createLine()
          paragraph.push(lineCtx)
          blockHeight += maxHeight
          currentWidth = 0
        }
      }
      block.height = blockHeight
      currentHeight += block.height
      currentWidth = 0
    }

    return renderData
  }

  get lastBlock(): BlockContext {
    return this.blocks[this.blocks.length - 1]
  }
}
