import Editor from "../editor"
import Base from "./Base"

export class Selection extends Base {
  startNode: any
  endNode: any
  collapsed: boolean

  constructor(editor: Editor) {
    super(editor)
    this.startNode = null
    this.endNode = null
    this.collapsed = true
  }

  reset() {
    this.collapsed = true
    this.startNode = null
    this.endNode = null
  }
}
