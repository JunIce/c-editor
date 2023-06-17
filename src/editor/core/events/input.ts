import Editor from "../../editor"
import { EventType } from "../EventManager"

export const onInput = (editor: Editor) => (e: InputEvent) => {
  const { data } = e
  const blocks = editor.blocksContainer.blocks
  const paragraph = blocks[editor.cursor.location.p]
  let strIdx = editor.cursor.location.i + 1

  if (editor.cursor.composing === false) {
    paragraph.insertContent(data || "", strIdx)
    editor.cursor.location.i += 1

    editor.events.emit(EventType.RENDER)
    editor.cursor.move()
  }
}
