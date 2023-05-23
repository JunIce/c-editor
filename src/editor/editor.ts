import BlockContainer from "./core/BlockContainer"
import { addEventListener, computedTextMetries } from "./utils"
import { EventManager, EventType } from "./core/EventManager"
import { Cursor, PositionIdx } from "./core/Cursor"
import { LineCtx, RenderElementText, createCanvasCtx } from "./core/CanvasCtx"

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

  public get scrollTop(): number {
    return document.documentElement.scrollTop
  }

  public get scrollLeft(): number {
    return document.documentElement.scrollLeft
  }

  init() {
    this.drawBorder()
    this._bindEvents()
  }

  _bindEvents() {
    this.events.on(EventType.RENDER, this.render.bind(this))
    this.events.on(EventType.TEXT_DELETE, this._deleteText.bind(this))
    this.events.on(
      EventType.INSERT_PARAGRAPH,
      this.blocksContainer.addParagraph.bind(this.blocksContainer)
    )
    addEventListener(this.canvas, "click", this._drawClick.bind(this), false)
  }

  _deleteText() {
    const lastBlock = this.blocksContainer.lastBlock
    if (lastBlock.content.length > 0) {
      lastBlock.delete()
    } else {
      this.blocksContainer.deleteLast()
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

  _drawClick(e: MouseEvent) {
    const { clientX, clientY } = e
    let { offsetTop, offsetLeft, clientWidth, clientHeight } = this.container
    const { paddingY, paddingX } = this.config

    const scrollTop = this.scrollTop
    // 判断是否是点击区域
    if (
      clientX >= offsetLeft + paddingX &&
      clientY + scrollTop >= offsetTop + paddingY &&
      clientX <= clientWidth + offsetLeft - paddingX &&
      clientY + scrollTop <= clientHeight + offsetTop - paddingY
    ) {
      const position = this._computedPositionElementByXY(
        clientX - offsetLeft,
        Math.ceil(clientY + scrollTop - offsetTop)
      )
      this.cursor.setPosition(position)

      const { x, y } = this._computedTargetCursorPosition(position)
      this.cursor.setPositionXY({ x, y })
      this.cursor.focus()
      this.cursor.setCursorPosition()
    } else {
      this.cursor.blur()
    }
  }

  _computedTargetCursorPosition(result: PositionIdx) {
    let { offsetTop, offsetLeft } = this.container

    let x = offsetLeft
    let y = offsetTop

    const element = this.blocksContainer.blocks[result.p]?.children[result.l]
      ?.children[result.i] as RenderElementText

    if (element) {
      const { rightTop } = computedTextMetries(element)

      x += rightTop[0]
      y += rightTop[1]
    }

    return {
      x,
      y,
    }
  }

  _computedPositionElementByXY(x: number, y: number) {
    const blocks = this.blocksContainer.blocks

    // position p
    let p = 0
    let l = -1
    let idx = -1
    let preHeight = this.config.paddingY
    for (; p < blocks.length; p++) {
      if (y < preHeight + blocks[p].height) {
        const position = blocks[p].positionIn({ x, y })
        if (position) {
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

  render() {
    const ctx = this.ctx
    this.ctx.clearRect(
      this.config.paddingX,
      this.config.paddingY,
      this.config.width - 2 * this.config.paddingX,
      this.config.height - 2 * this.config.paddingY
    )
    const data = this.blocksContainer.renderBlocks

    data.forEach((paragraphs) => {
      paragraphs.children.forEach((line) =>
        line.children.forEach((el) => el.render(ctx))
      )
    })
  }

  renderText(s: string) {
    this.blocksContainer.push(s)
    this.events.emit(EventType.RENDER)
    console.log(this.blocksContainer.blocks)
  }
}
