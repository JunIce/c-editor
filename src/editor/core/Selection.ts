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

  getRange() {
    if (this.startNode && this.endNode) {
      if (
        this.startNode.p > this.endNode.p ||
        (this.startNode.p == this.endNode.p &&
          this.startNode.i > this.endNode.i)
      ) {
        return {
          startNode: this.endNode,
          endNode: this.startNode,
        }
      }
    }

    return {
      startNode: this.startNode,
      endNode: this.endNode,
    }
  }

  reset() {
    this.collapsed = true
    this.startNode = null
    this.endNode = null
  }
}
