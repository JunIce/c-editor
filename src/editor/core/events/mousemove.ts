import Editor from "../../editor"
import { throttle } from "lodash-es"
import { EventType } from "../EventManager"
import { isRangeCollapsed } from "../../utils"

export const onMouseMove = (editor: Editor) => {
  return throttle((e: MouseEvent) => {
    const { clientX, clientY } = e
    let { offsetTop, offsetLeft } = editor.container
    const { paddingY, paddingX } = editor.config

    const scrollTop = editor.scrollTop
    const selection = editor.selection

    if (editor.isPointerDown) {
      const position = editor.blocksContainer.computedPositionElementByXY(
        clientX - offsetLeft - paddingX,
        clientY + scrollTop - offsetTop - paddingY
      )
      selection.endNode = position
      selection.collapsed = isRangeCollapsed(
        selection.startNode,
        selection.endNode
      )
      editor.events.emit(EventType.SELECTION_RANGE)
    }
  }, 100)
}
