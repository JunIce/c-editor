import Editor from "../editor"
import { addEventListener } from "../utils"
import Base from "./Base"
import { onKeydown } from "./events/keydown"
import { KeyCode, KeyCodeEnum } from "./enums/keycode"
import { onInput } from "./events/input"
import { onCompositionEnd, onCompositionStart } from "./events/composition"

export interface PositionIdx {
  p: number
  l: number
  i: number
}

export class Cursor extends Base {
  location: {
    p: number // paragraph index
    l: number // line index
    i: number // index of text

    x: number
    y: number
  }

  _input!: HTMLTextAreaElement | null
  composing: boolean
  _mockCursor!: HTMLDivElement | null

  constructor(options: Editor) {
    super(options)
    this.composing = false
    this.location = {
      p: 0,
      l: 0,
      i: 0,

      x: 0,
      y: 0,
    }

    this._mockCursor = this._mockCursorInit()
    this.init()
  }

  _mockCursorInit(): HTMLDivElement {
    const cursorDom = document.createElement("div")
    cursorDom.id = "cursor"

    return cursorDom
  }

  init() {
    const textarea: HTMLTextAreaElement = document.createElement("textarea")
    textarea.className = "mock-input"

    addEventListener(
      textarea,
      "compositionstart",
      onCompositionStart(this.editor)
    )
    addEventListener(textarea, "compositionend", onCompositionEnd(this.editor))
    addEventListener(textarea, "keydown", onKeydown(this.editor))
    addEventListener(textarea, "input", onInput(this.editor))
    this.container.appendChild(textarea)
    this.container.appendChild(this._mockCursor!)
    this._input = textarea
  }

  setPosition(result: PositionIdx) {
    this.location.p = result.p
    this.location.l = result.l
    this.location.i = result.i
  }

  setPositionXY(result: { x: number; y: number }) {
    this.location.x = result.x
    this.location.y = result.y
  }

  movePosition(keyCode: KeyCodeEnum) {
    if (keyCode === KeyCode.ARROW_LEFT) {
      this.location.i -= 1
    } else if (keyCode === KeyCode.ARROW_RIGHT) {
      this.location.i += 1
    }

    this.move()
  }

  move() {
    const { x, y } = this.editor._computedTargetCursorPosition(this.location)
    this.setPositionXY({ x, y })
    this.setCursorPosition()
    this.focus()
  }

  setCursorPosition() {
    const offsetX = this.editor.config.paddingX
    const offsetY = this.editor.config.paddingY
    this._input!.style.top = this.location.y + offsetY + "px"
    this._input!.style.left = this.location.x + offsetX + "px"
    this._mockCursor!.style.top = this.location.y + offsetY + "px"
    this._mockCursor!.style.left = this.location.x + offsetX + "px"
  }

  focus() {
    this._input?.focus()
  }

  blur() {
    this._input?.blur()
    this._mockCursor!.remove()
  }
}
