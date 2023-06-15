import BlockContainer from "./core/BlockContainer"
import { addEventListener, computedTextMetries, logs, randomColor } from "./utils"
import { EventManager, EventType, NativeEventType } from "./core/EventManager"
import { Cursor, PositionIdx } from "./core/Cursor"
import { LineCtx, ParagraphCtx, RenderElementText, createCanvasCtx } from "./core/CanvasCtx"
import { Selection } from "./core/Selection"
import { RangeCtx, createRangeCtx } from "./core/Range"
import { onMouseDown } from "./core/events/mousedown"

export interface ConfigProps {
  width: number
  height: number
  paddingX: number
  paddingY: number
}

export default class Editor {
  container: HTMLDivElement
  canvas: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  events: EventManager
  dpr: number
  cursor: Cursor
  selection: Selection

  config: ConfigProps = {
    width: 1000,
    height: 500,
    paddingX: 20,
    paddingY: 20,
  }

  blocksContainer: BlockContainer

  constructor(options: any) {
    this.container = document.querySelector(options.selector)
    this.dpr = window.devicePixelRatio
    this.blocksContainer = new BlockContainer(this)
    this.events = new EventManager(this)
    this.cursor = new Cursor(this)
    this.selection = new Selection(this)

    this.config.width = options.width || 1000
    this.config.height = options.height || 500
    this.canvas = createCanvasCtx({
      width: this.config.width,
      height: this.config.height,
      dpr: this.dpr,
    })

    this.container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext("2d")!
  }

  public get rangeCtx() {
    return createRangeCtx(this)
  }

  public get scrollTop(): number {
    return document.documentElement.scrollTop
  }

  public get scrollLeft(): number {
    return document.documentElement.scrollLeft
  }

  public get renderSize(): { width: number; height: number } {
    return {
      width: this.config.width - 2 * this.config.paddingX,
      height: this.config.height - 2 * this.config.paddingY,
    }
  }

  init() {
    // this.drawBorder()
    this._bindEvents()
  }

  _bindEvents() {
    this.events.on(EventType.RENDER, this.render.bind(this))
    this.events.on(EventType.TEXT_DELETE, this._deleteText.bind(this))
    this.events.on(
      EventType.INSERT_PARAGRAPH,
      this.blocksContainer.addParagraph.bind(this.blocksContainer)
    )
    this.events.on(
      EventType.DIRECTION_KEY,
      this.cursor.movePosition.bind(this.cursor)
    )

    addEventListener(
      this.canvas,
      NativeEventType.MOUSE_DOWN,
      onMouseDown(this),
      false
    )
    addEventListener(this.canvas, "mousemove", () => { }, false)
  }

  _deleteText() {
    const currentBlock = this.blocksContainer.currentBlock()
    console.log("", currentBlock)

    // cursor > 0
    if (this.cursor.location.i > 0) {
      let idx = this.cursor.location.i
      let l = this.cursor.location.l - 1
      while (l >= 0) {
        idx += currentBlock.children[l].children.length
        l--
      }
      currentBlock.delete(idx)
      this.cursor.location.i -= 1
      this.cursor.move()
    } else if (this.cursor.location.i == 0 && currentBlock.content.length > 0) {
      if (this.cursor.location.l > 0) {
        this.cursor.location.l -= 1
        this.cursor.location.i =
          currentBlock.children[this.cursor.location.l].children.length
        this.cursor.move()
        currentBlock.deleteLine(this.cursor.location.l + 1)
      }
      // not last paragraph
      else if (this.cursor.location.p > 0) {
        //merge to before
        const beforeBlock = this.blocksContainer.getBlockByIndex(
          this.cursor.location.p - 1
        )

        beforeBlock.content.splice(
          beforeBlock.content.length - 1,
          0,
          ...currentBlock.content
        )

        const lastCursor = beforeBlock.lastCursorPosition()
        this.blocksContainer.deleteBlock(this.cursor.location.p)

        this.cursor.location.p -= 1
        this.cursor.location.l = lastCursor.l
        this.cursor.location.i = lastCursor.i
        this.cursor.move()
      }
    }
    this.events.emit(EventType.RENDER)
  }

  drawBorder() {
    this.ctx.beginPath()
    this.ctx.strokeStyle = "#333"
    this.ctx.strokeRect(
      this.config.paddingX,
      this.config.paddingY,
      this.config.width - 2 * this.config.paddingX,
      this.config.height - 2 * this.config.paddingY
    )
  }

  _computedTargetCursorPosition(result: PositionIdx) {
    let { offsetTop, offsetLeft } = this.container

    let x = offsetLeft
    let y = offsetTop

    if (result.i >= 0) {
      const element = this.blocksContainer.blocks[result.p]?.children[result.l]
        ?.children[result.i] as RenderElementText

      if (element) {
        const { rightTop } = computedTextMetries(element)

        x += rightTop[0]
        y += rightTop[1]
      }
    } else {
      const first = this.blocksContainer.blocks[result.p]?.children[result.l]
        ?.children[0] as RenderElementText
      if (first) {
        const { leftTop } = computedTextMetries(first)

        x += leftTop[0]
        y += leftTop[1]
      }
    }

    return {
      x,
      y,
    }
  }

  render() {
    const ctx = this.ctx
    logs(1)
    ctx.clearRect(
      0,
      0,
      this.config.width,
      this.config.height
    )

    const data = this.blocksContainer.renderBlocks

    data.forEach((paragraphs, idx) => {
      paragraphs.children.forEach((line) =>
        line.children.forEach((el) => {
          el.render()
        })
      )
    })
  }

  testPoint(x: number, y: number) {
    const ctx = this.ctx
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, 1, 0, 2 * Math.PI)
    ctx.fillStyle = "green"
    ctx.fill()
    ctx.closePath()
  }

  drawDect({ metrics: { leftTop, y } }: ParagraphCtx, idx: number) {
    this.ctx.save()
    this.ctx.beginPath()

    this.ctx.strokeStyle = randomColor();
    this.ctx.strokeRect(leftTop[0] + this.config.paddingX, leftTop[1] + this.config.paddingY, this.renderSize.width, y)

    this.ctx.fillStyle = "red"
    this.ctx.font = "24px 微软雅黑"
    this.ctx.textBaseline = "top"
    this.ctx.fillText(idx + '', leftTop[0] + this.config.paddingX, leftTop[1] + this.config.paddingY)

    this.ctx.closePath()
    this.ctx.restore()
  }

  renderText(s: string) {
    this.blocksContainer.push(s)
    this.events.emit(EventType.RENDER)
    console.info(this.blocksContainer.blocks)
  }
}
