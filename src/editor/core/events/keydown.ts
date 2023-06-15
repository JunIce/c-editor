import Editor from "../../editor"
import { EventType } from "../EventManager"
import { KeyCode } from "../enums/keycode"

export const onKeydown = (editor: Editor) => (event: KeyboardEvent) => {
  const keyCode = event.keyCode
  if (editor.cursor.composing) return

  switch (keyCode) {
    case KeyCode.BACKSPACE:
      event.preventDefault()
      editor.events.emit(EventType.TEXT_DELETE)
      break

    case KeyCode.ENTER:
      event.preventDefault()
      editor.events.emit(EventType.INSERT_PARAGRAPH)
      break
    case KeyCode.DELETE:
      event.preventDefault()
      editor.events.emit(EventType.INSERT_PARAGRAPH)
      break

    case KeyCode.ARROW_DOWN:
    case KeyCode.ARROW_UP:
    case KeyCode.ARROW_LEFT:
    case KeyCode.ARROW_RIGHT:
      event.preventDefault()
      editor.events.emit(EventType.DIRECTION_KEY, keyCode)
      break
  }
}
