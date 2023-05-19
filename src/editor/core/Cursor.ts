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

  constructor(options: Editor) {
    super(options)

    this.location = {
      x: 0,
      y: 0,
    }
  }

  focus() {
    if (!this.input) {
      const textarea: HTMLTextAreaElement = document.createElement("textarea")
      textarea.className = "mock-input"
      addEventListener(textarea, "keydown", (e) =>
        handleKeyboardEvent.call(null, e, this.editor)
      )
      addEventListener(textarea, "input", this._inputEvent.bind(this))
      this.container.appendChild(textarea)
      this.input = textarea
    }
    this.input.focus()
  }

  blur() {
    this.input && this.container.removeChild(this.input)
    this.input = null
  }

  _inputEvent(e: InputEvent) {
    const { data } = e
    const lastBlock = this.editor.blocksContainer.lastBlock
    data?.split("").forEach((char) => {
      const text = new Text(char, this.editor.ctx)
      lastBlock.push(text)
    })
    this.editor.events.emit(EventType.RENDER)
  }
}
