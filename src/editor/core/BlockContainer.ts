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
    this.blocks.push(createParagraph(this.editor))
  }

  push(data: string) {
    ;(data || "").split("\n").forEach((str) => {
      const paragraph = createParagraph(this.editor, str)
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

        const textWidth =
          text.metrics.actualBoundingBoxLeft +
          text.metrics.actualBoundingBoxRight

        if (currentWidth + textWidth < ctxRenderWidth) {
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

  currentBlock() {
    return this.blocks[this.editor.cursor.location.p]
  }

  getBlockByIndex(index: number) {
    return this.blocks[index]
  }

  deleteBlock(index: number) {
    this.blocks.splice(index, 1)
  }

  computedPositionElementByXY(x: number, y: number) {
    const blocks = this.blocks

    // position p
    let p = 0
    let l = 0
    let idx = 0
    let preHeight = this.config.paddingY
    for (; p < blocks.length; p++) {
      if (y < preHeight + blocks[p].height) {
        const position = blocks[p].positionIn({ x, y })
        if (position !== null) {
          let [line, textIndex] = position
          l = line
          idx = textIndex
          break
        } else {
          continue
        }
      } else {
        preHeight += blocks[p].height
      }
    }

    return {
      p,
      l,
      i: idx,
    }
  }
}
