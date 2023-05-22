import Editor from "../editor"
import { addEventListener, insertStrFromIdx } from "../utils"
import Base from "./Base"
import { EventType } from "./EventManager"
import { handleKeyboardEvent } from "./KeyboardEvent"

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

  input!: HTMLTextAreaElement | null
  composing: boolean
  mockCursor!: HTMLDivElement | null

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

    this.mockCursor = this._mockCursor()
  }

  _mockCursor(): HTMLDivElement {
    const cursorDom = document.createElement("div")
    cursorDom.id = "cursor"

    return cursorDom
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

  setCursorPosition() {
    this.input!.style.top = this.location.y + "px"
    this.input!.style.left = this.location.x + "px"

    this.mockCursor!.style.top = this.location.y + "px"
    this.mockCursor!.style.left = this.location.x + "px"
  }

  focus() {
    if (!this.input) {
      const textarea: HTMLTextAreaElement = document.createElement("textarea")
      textarea.className = "mock-input"
      addEventListener(textarea, "keydown", (e) =>
        handleKeyboardEvent.call(null, e, this.editor)
      )
      addEventListener(textarea, "input", this._inputEvent.bind(this))
      addEventListener(
        textarea,
        "compositionstart",
        this._compositionstart.bind(this)
      )
      addEventListener(
        textarea,
        "compositionend",
        this._compositionend.bind(this)
      )

      this.container.appendChild(textarea)
      this.input = textarea
    }
    this.container.appendChild(this.mockCursor!)
    this.input.focus()
  }

  blur() {
    this.input && this.container.removeChild(this.input)
    this.input = null
    this.mockCursor?.remove()
  }

  _compositionstart() {
    this.composing = true
  }

  _compositionend() {
    this.composing = false
  }

  _inputEvent(e: InputEvent) {
    const { data } = e
    const blocks = this.editor.blocksContainer.blocks
    const paragraph = blocks[this.location.p]
    let l = this.location.l - 1
    let strIdx = this.location.i + 1

    while (l >= 0) {
      strIdx += paragraph.children[l].children.length
      l--
    }

    if (this.composing === false) {
      paragraph.content = insertStrFromIdx(
        paragraph.content,
        strIdx,
        data || ""
      )
      this.editor.events.emit(EventType.RENDER)
    }
  }
}
