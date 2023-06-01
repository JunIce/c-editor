import Editor from "../editor"
import Base from "./Base"
import { Range } from "./Range"

export class Selection extends Base {
  startNode: Range | null
  endNode: Range | null

  constructor(editor: Editor) {
    super(editor)
    this.startNode = null
    this.endNode = null
  }

  getRangeAt() {}
}
