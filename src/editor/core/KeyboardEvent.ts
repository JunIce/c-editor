import Editor from "../editor"
import { EventType } from "./EventManager"
import { KeyCode } from "./enums/keycode"

export const handleKeyboardEvent = (event: KeyboardEvent, editor: Editor) => {
  const keyCode = event.keyCode

  if (keyCode === KeyCode.BACKSPACE) {
    event.preventDefault()
    editor.events.emit(EventType.TEXT_DELETE)
  } else if (keyCode === KeyCode.ARROW_UP) {
  } else if (keyCode === KeyCode.ARROW_DOWN) {
  } else if (keyCode === KeyCode.ARROW_LEFT) {
  } else if (keyCode === KeyCode.ARROW_RIGHT) {
  }
  // console.log(event)
}
