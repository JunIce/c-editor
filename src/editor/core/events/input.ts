import Editor from "../../editor"
import { insertStrFromIdx } from "../../utils"
import { EventType } from "../EventManager"

export const onInput = (editor: Editor) => (e: InputEvent) => {
  const { data } = e
  const blocks = editor.blocksContainer.blocks
  const paragraph = blocks[editor.cursor.location.p]
  let l = editor.cursor.location.l - 1
  let strIdx = editor.cursor.location.i + 1

  while (l >= 0) {
    strIdx += paragraph.children[l].children.length
    l--
  }

  if (editor.cursor.composing === false) {
    paragraph.insertContent(data || "", strIdx)
    if (
      strIdx <
      paragraph.children[editor.cursor.location.l].children.length - 1
    ) {
      editor.cursor.location.i += 1
    } else if (
      strIdx ==
      paragraph.children[editor.cursor.location.l].children.length - 1
    ) {
      editor.cursor.location.i = -1
      editor.cursor.location.l += 1
    }
    editor.events.emit(EventType.RENDER)
    editor.cursor.move()
  }
}
