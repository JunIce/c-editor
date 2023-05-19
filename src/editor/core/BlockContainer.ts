import Editor from "../editor"
import Base from "./Base"
import { BlockContext, createBlockContext } from "./Block"
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

  get renderBlocks(): RenderText[][] {
    const renderData: RenderText[][] = []

    const ctxRenderWidth = this.config.width - 2 * this.config.paddingX
    let currentWidth = 0
    let currentHeight = this.config.paddingY

    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]
      const texts = block.texts
      renderData[i] = []

      let line = 0
      let maxHeight = 0
      let blockHeight = 0
      for (let j = 0; j < texts.length; j++) {
        const text = texts[j]

        if (currentWidth + text.metrics.width < ctxRenderWidth) {
          const textHeight =
            text.metrics.fontBoundingBoxAscent +
            text.metrics.fontBoundingBoxDescent
          maxHeight = Math.max(maxHeight, textHeight)
          // offset
          if (blockHeight === 0) {
            blockHeight = maxHeight
          }

          renderData[i].push({
            blockIndex: i,
            textIndex: j,
            s: text.char,
            textHeight: textHeight,
            x: Math.ceil(this.config.paddingX + currentWidth),
            y: Math.ceil(currentHeight + blockHeight),
            metrics: text.metrics,
          })

          currentWidth += text.metrics.width
        } else {
          line++
          blockHeight += maxHeight
          maxHeight = 0
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
