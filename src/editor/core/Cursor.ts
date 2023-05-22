import Editor from "../editor"
import { addEventListener } from "../utils"
import Base from "./Base"
import { EventType } from "./EventManager"
import { handleKeyboardEvent } from "./KeyboardEvent"
import Text from "./Text"

export class Cursor extends Base {
  location: {
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

  setCursorPosition(x: number, y: number) {
    this.input!.style.top = y + "px"
    this.input!.style.left = x + "px"

    this.mockCursor!.style.top = y + "px"
    this.mockCursor!.style.left = x + "px"
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
    const lastBlock = this.editor.blocksContainer.lastBlock
    if (this.composing === false) {
      lastBlock.content += data
      this.editor.events.emit(EventType.RENDER)
    }
  }
}
