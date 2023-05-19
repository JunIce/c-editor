import BlockContainer from "./core/BlockContainer"
import { addEventListener } from "./utils"
import Text from "./core/Text"
import { handleKeyboardEvent } from "./core/KeyboardEvent"
import { EventManager, EventType } from "./core/EventManager"
import { Cursor } from "./core/Cursor"
import { createCanvasCtx } from "./core/CanvasCtx"

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
    paddingX: 30,
    paddingY: 30,
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

  init() {
    this.drawBorder()
    this._bindEvents()
  }

  _bindEvents() {
    this.events.on(EventType.RENDER, this.render.bind(this))
    this.events.on(EventType.TEXT_DELETE, this._deleteText.bind(this))
    addEventListener(this.canvas, "click", this._drawClick.bind(this), false)
  }

  _deleteText() {
    const lastBlock = this.blocksContainer.lastBlock
    if (lastBlock.texts.length > 0) {
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
    offsetTop = offsetTop + document.documentElement.scrollTop
    console.log(clientX, offsetLeft + paddingX, clientY, paddingY + offsetTop)
    // 判断是否是点击区域
    if (
      clientX >= offsetLeft + paddingX &&
      clientY >= offsetTop + paddingY &&
      clientX <= clientWidth + offsetLeft - paddingX &&
      clientY <= clientHeight + offsetTop - paddingY
    ) {
      console.log(1111, clientX, clientY)
      this._computedPosition(
        clientX - offsetLeft - paddingX,
        clientY - offsetTop - paddingY
      )
      this.cursor.focus()
    } else {
      this.cursor.blur()
    }
  }

  _computedPosition(x: number, y: number) {
    const blocks = this.blocksContainer.renderBlocks

    parent: for (let i = 0; i < blocks.length; i++) {
      let texts = blocks[i]
      for (let j = 0; j < texts.length; j++) {
        if (texts[j].y > y && texts[j].x > x) {
          console.log(i, j, texts[j])
          break parent
        } else {
          continue
        }
      }
    }
  }

  render() {
    this.ctx.clearRect(
      this.config.paddingX,
      this.config.paddingY,
      this.config.width - 2 * this.config.paddingX,
      this.config.height - 2 * this.config.paddingY
    )
    const data = this.blocksContainer.renderBlocks

    data.forEach((texts) => {
      texts.forEach((text) => this.ctx.fillText(text.s, text.x, text.y))
    })
    console.log(data)
  }

  renderText(s: string) {
    this.blocksContainer.push(s)
    this.events.emit(EventType.RENDER)
  }
}
