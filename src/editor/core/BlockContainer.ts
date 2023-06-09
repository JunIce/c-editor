import Editor from "../editor"
import { logs } from "../utils"
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
  DEFAULT_BLOCK_HEIGHT = 24

  constructor(parent: Editor) {
    super(parent)
    this.blocks = []
  }

  get createParagraphElement() {
    return createParagraph(this.editor)
  }

  get createLineElement() {
    return createLine(this.editor)
  }
  get createTextElement() {
    return createRenderText(this.editor)
  }

  addParagraph() {
    const { p } = this.editor.cursor.location
    const block = this.createParagraphElement()
    const currentBlock = this.currentBlock()
    const idx = currentBlock.getContentStrIndexByCursor(
      this.editor.cursor.location
    )
    block.content = currentBlock.content.slice(idx + 1)
    currentBlock.content = currentBlock.content.slice(0, idx + 1)

    this.blocks.splice(p + 1, 0, block)
    this.editor.render()
    this.editor.cursor.location.p += 1
    this.editor.cursor.location.i = -1
    this.editor.cursor.move()
  }

  push(data: string) {
    ;(data || "").split("\n").forEach((str) => {
      const paragraph = this.createParagraphElement(str)
      this.blocks.push(paragraph)
    })
  }

  deleteLast() {
    this.blocks.pop()
  }

  get renderBlocks(): ParagraphCtx[] {
    const ctxRenderWidth = this.config.width - 2 * this.config.paddingX
    let currentWidth = 0
    let currentHeight = 0

    for (let i = 0; i < this.blocks.length; i++) {
      const paragraph = this.blocks[i]

      const texts = paragraph.content

      if (texts.length === 0) {
        if (paragraph.height) currentHeight += this.DEFAULT_BLOCK_HEIGHT
        continue
      }
      paragraph.emptyLine()

      let maxHeight = 18
      let blockHeight = 0

      for (let j = 0; j < texts.length; j++) {
        const text = texts[j]

        const textWidth = text.width
        const textHeight = text.height

        if (currentWidth + textWidth > ctxRenderWidth) {
          currentWidth += textWidth
          blockHeight += maxHeight
          currentWidth = 0
        }
        // offset
        if (blockHeight === 0) {
          blockHeight = maxHeight
        }
        const element = this.createTextElement({
          node: text,
          value: text.char,
          width: textWidth,
          height: textHeight,
          x: Math.ceil(currentWidth),
          y: Math.ceil(currentHeight + blockHeight),
          metrics: text.metrics,
        })

        element.idx = j
        paragraph.renderChildren[j] = element
        currentWidth += textWidth
      }
      paragraph.height = blockHeight
      paragraph.metrics.y = blockHeight
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

  getBlockContentLength(pIndex: number, lineIndex: number) {
    return this.getBlockByIndex(pIndex).children[lineIndex].children.length
  }

  deleteBlock(index: number) {
    this.blocks.splice(index, 1)
  }

  computedPositionElementByXY(x: number, y: number) {
    const blocks = this.blocks
    let p = 0
    let idx = 0
    let preHeight = this.config.paddingY
    for (; p < blocks.length; p++) {
      idx = blocks[p].content.length - 1
      if (
        y < preHeight + blocks[p].height &&
        blocks[p].positionInParagraph({ x, y })
      ) {
        const paragraph = blocks[p]
        const position = paragraph.positionIn({ x, y })
        if (position !== undefined) {
          idx = position
        }
        break
      } else {
        preHeight += blocks[p].height
      }
    }

    if (p === blocks.length) {
      p -= 1
    }

    return {
      p,
      i: idx,
    }
  }
}
